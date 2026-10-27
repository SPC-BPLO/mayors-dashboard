import "server-only";

import { Pool, type QueryResultRow } from "pg";
import type { DepartmentDashboard, MayorDashboardResponse } from "./dashboard-types";

declare global {
  // eslint-disable-next-line no-var
  var mayorDashboardPool: Pool | undefined;
}

function databaseUrl() {
  return process.env.MAYOR_DATABASE_URL || process.env.USER_DATABASE_URL;
}

function pool() {
  const connectionString = databaseUrl();
  if (!connectionString) {
    throw new Error("MAYOR_DATABASE_URL is not configured");
  }

  if (!globalThis.mayorDashboardPool) {
    globalThis.mayorDashboardPool = new Pool({
      connectionString,
      max: 1,
      idleTimeoutMillis: 5_000,
      connectionTimeoutMillis: 20_000,
      allowExitOnIdle: true,
      ssl: process.env.MAYOR_DATABASE_SSL === "false" ? undefined : { rejectUnauthorized: false },
    });
  }
  return globalThis.mayorDashboardPool;
}

async function query<T extends QueryResultRow>(text: string) {
  return (await pool().query<T>(text)).rows;
}

function number(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function count(value: unknown) {
  return Math.round(number(value));
}

function formatCount(value: unknown) {
  return count(value).toLocaleString("en-PH");
}

function formatMoney(value: unknown) {
  const amount = number(value);
  const absolute = Math.abs(amount);
  if (absolute >= 1_000_000_000) return `₱${(amount / 1_000_000_000).toFixed(2).replace(/\.00$/, "")}B`;
  if (absolute >= 1_000_000) return `₱${(amount / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (absolute >= 1_000) return `₱${(amount / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return `₱${amount.toLocaleString("en-PH", { maximumFractionDigits: 0 })}`;
}

const mtopNumber = (field: string) =>
  `CASE WHEN BTRIM(${field}) ~ '^[0-9]+$' THEN CASE WHEN BTRIM(${field})::numeric BETWEEN 1 AND 100000 THEN BTRIM(${field})::integer END END`;

const revocationSql = `WITH paid AS (
  SELECT ${mtopNumber("mtop")} AS number,
    MAX(CASE WHEN data->>'renewalDate' ~ '^\\d{4}-\\d{2}-\\d{2}$' THEN (data->>'renewalDate')::date END) AS renewed
  FROM finance_clients
  WHERE payment_status='Paid'
    AND lower(COALESCE(data->>'transactionType','')) IN ('franchise renewal','renewal','new franchise','new')
  GROUP BY 1
), clients AS (
  SELECT r.record_id,r.mtop,${mtopNumber("r.mtop")} AS number,
    COALESCE(GREATEST(p.renewed,
      CASE WHEN i.reference_no IS NOT NULL THEN NULLIF(i.before_registry->>'date_renewal','')::date ELSE r.date_renewal END),
      r.release_date,r.renewal_due-interval '1 year')::date AS last_renewal
  FROM franchise_registry r
  LEFT JOIN paid p ON p.number=${mtopNumber("r.mtop")}
  LEFT JOIN LATERAL (
    SELECT reference_no,before_registry
    FROM bplo_finance_issues bi
    JOIN finance_clients f ON f.record_id=bi.finance_record_id
    WHERE bi.record_id=r.record_id AND bi.cancelled_at IS NULL AND f.payment_status='Pending'
    ORDER BY bi.created_at DESC LIMIT 1
  ) i ON true
  WHERE NOT r.is_archived AND ${mtopNumber("r.mtop")} IS NOT NULL
), ranked AS (
  SELECT *,row_number() OVER(PARTITION BY number ORDER BY last_renewal DESC NULLS LAST,record_id) AS position
  FROM clients
)
SELECT COUNT(*)::int AS total
FROM ranked
WHERE position=1 AND last_renewal+interval '3 years' <= (now() AT TIME ZONE 'Asia/Manila')::date`;

async function bploDashboard(): Promise<DepartmentDashboard> {
  const [summaryRows, revocationRows, trendRows, renewalRows] = await Promise.all([
    query<{
      active: number;
      expiring: number;
      used_mtops: number;
      revoked: number;
      new_applications: number;
    }>(`SELECT
      COUNT(*) FILTER (WHERE NOT is_archived)::int AS active,
      COUNT(*) FILTER (WHERE NOT is_archived AND renewal_due >= CURRENT_DATE AND renewal_due < CURRENT_DATE + INTERVAL '31 days')::int AS expiring,
      COUNT(DISTINCT ${mtopNumber("mtop")}) FILTER (WHERE NOT is_archived)::int AS used_mtops,
      (SELECT COUNT(*)::int FROM franchise_archive WHERE kind='revoked') AS revoked,
      COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days')::int AS new_applications
    FROM franchise_registry`),
    query<{ total: number }>(revocationSql),
    query<{ label: string; value: number }>(`SELECT TO_CHAR(month,'Mon') AS label,
      COUNT(r.record_id)::int AS value
    FROM generate_series(
      date_trunc('month', CURRENT_DATE) - INTERVAL '5 months',
      date_trunc('month', CURRENT_DATE), INTERVAL '1 month'
    ) month
    LEFT JOIN franchise_registry r ON NOT r.is_archived AND r.created_at < month + INTERVAL '1 month'
    GROUP BY month ORDER BY month`),
    query<{ completed: number; pending: number }>(`SELECT
      COUNT(*) FILTER (WHERE lower(status)='renewed')::int AS completed,
      COUNT(*) FILTER (WHERE lower(status)<>'renewed')::int AS pending
    FROM franchise_renewals`),
  ]);

  const summary = summaryRows[0] ?? { active: 0, expiring: 0, used_mtops: 0, revoked: 0, new_applications: 0 };
  const renewals = renewalRows[0] ?? { completed: 0, pending: 0 };
  const due = count(revocationRows[0]?.total);
  const active = count(summary.active);
  const expiring = count(summary.expiring);
  const revoked = count(summary.revoked);
  const available = Math.max(8_500 - count(summary.used_mtops), 0);

  return {
    id: "bplo",
    short: "BPLO",
    name: "Franchise",
    reportTitle: "Franchise records",
    metrics: [
      { label: "Active franchises", value: formatCount(active) },
      { label: "Expiring in 30 days", value: formatCount(expiring) },
      { label: "MTOPs due for revocation", value: formatCount(due) },
      { label: "MTOP slots available", value: formatCount(available) },
    ],
    trend: {
      title: "Active franchise trend",
      labels: trendRows.map((row) => row.label),
      values: trendRows.map((row) => count(row.value)),
    },
    distribution: {
      title: "Franchise status",
      centerValue: formatCount(active + revoked),
      centerLabel: "records",
      items: [
        { label: "Active", value: Math.max(active - expiring, 0), display: formatCount(Math.max(active - expiring, 0)) },
        { label: "Expiring soon", value: expiring, display: formatCount(expiring) },
        { label: "Revoked", value: revoked, display: formatCount(revoked) },
      ],
    },
    ranking: {
      title: "Key franchise records",
      items: [
        { label: "Renewals completed", value: count(renewals.completed), display: formatCount(renewals.completed) },
        { label: "New applications (30 days)", value: count(summary.new_applications), display: formatCount(summary.new_applications) },
        { label: "Pending renewals", value: count(renewals.pending), display: formatCount(renewals.pending) },
        { label: "MTOPs already revoked", value: revoked, display: formatCount(revoked) },
      ],
    },
  };
}

async function ctmoDashboard(): Promise<DepartmentDashboard> {
  const [summaryRows, repeatRows, trendRows, violationRows] = await Promise.all([
    query<{ total: number; settled: number; unresolved: number }>(`SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status='Settled')::int AS settled,
      COUNT(*) FILTER (WHERE status<>'Settled')::int AS unresolved
    FROM violations`),
    query<{ total: number }>(`SELECT COUNT(*)::int AS total FROM (
      SELECT COALESCE(NULLIF(BTRIM(franchise_no),''),NULLIF(BTRIM(plate_no),''),LOWER(NULLIF(BTRIM(violator_name),''))) AS offender
      FROM violations
      GROUP BY 1 HAVING COUNT(*) > 1
    ) repeat_offenders WHERE offender IS NOT NULL`),
    query<{ label: string; value: number }>(`SELECT TO_CHAR(month,'Mon') AS label,COUNT(v.record_id)::int AS value
    FROM generate_series(
      date_trunc('month', CURRENT_DATE) - INTERVAL '5 months',
      date_trunc('month', CURRENT_DATE), INTERVAL '1 month'
    ) month
    LEFT JOIN violations v ON v.created_at >= month AND v.created_at < month + INTERVAL '1 month'
    GROUP BY month ORDER BY month`),
    query<{ label: string; value: number }>(`SELECT COALESCE(NULLIF(BTRIM(violations_committed),''),'Unspecified') AS label,COUNT(*)::int AS value
    FROM violations GROUP BY 1 ORDER BY value DESC,label LIMIT 4`),
  ]);

  const summary = summaryRows[0] ?? { total: 0, settled: 0, unresolved: 0 };
  const total = count(summary.total);
  const settled = count(summary.settled);
  const unresolved = count(summary.unresolved);
  const repeat = count(repeatRows[0]?.total);

  return {
    id: "ctmo",
    short: "CTMO",
    name: "Traffic Violations",
    reportTitle: "Traffic violation records",
    metrics: [
      { label: "Violations recorded", value: formatCount(total) },
      { label: "Tickets settled", value: formatCount(settled) },
      { label: "Repeat offenders", value: formatCount(repeat) },
    ],
    trend: {
      title: "Monthly violation trend",
      labels: trendRows.map((row) => row.label),
      values: trendRows.map((row) => count(row.value)),
    },
    distribution: {
      title: "Ticket resolution",
      centerValue: formatCount(total),
      centerLabel: "tickets",
      items: [
        { label: "Settled", value: settled, display: formatCount(settled) },
        { label: "Unresolved", value: unresolved, display: formatCount(unresolved) },
      ],
    },
    ranking: {
      title: "Most recorded violations",
      items: violationRows.map((row) => ({ label: row.label, value: count(row.value), display: formatCount(row.value) })),
    },
  };
}

async function financeDashboard(): Promise<DepartmentDashboard> {
  const [summaryRows, trendRows, sourceRows] = await Promise.all([
    query<{
      collected_month: number;
      collected_previous_month: number;
      settled_month: number;
      receipts_month: number;
      highest_daily_collection: number;
      highest_daily_transactions: number;
      active_collection_days: number;
      elapsed_days: number;
      cohort_settled: number;
      cohort_unsettled: number;
    }>(`WITH bounds AS (
      SELECT date_trunc('month', NOW() AT TIME ZONE 'Asia/Manila')::date AS month_start
    ), normalized AS (
      SELECT amount,status,or_number,
        CASE WHEN payment_date ~ '^\\d{4}-\\d{2}-\\d{2}$' THEN payment_date::date END AS paid_on,
        CASE WHEN apprehension_date ~ '^\\d{4}-\\d{2}-\\d{2}$' THEN apprehension_date::date END AS apprehended_on
      FROM violations
    ), daily AS (
      SELECT paid_on,
        COALESCE(SUM(amount) FILTER (WHERE status='Settled'),0)::float AS collected,
        COUNT(*) FILTER (WHERE status='Settled')::int AS transactions
      FROM normalized,bounds
      WHERE paid_on >= month_start AND paid_on < month_start + INTERVAL '1 month'
      GROUP BY paid_on
    )
    SELECT
      COALESCE(SUM(amount) FILTER (WHERE status='Settled' AND paid_on >= month_start AND paid_on < month_start + INTERVAL '1 month'),0)::float AS collected_month,
      COALESCE(SUM(amount) FILTER (WHERE status='Settled' AND paid_on >= month_start - INTERVAL '1 month' AND paid_on < month_start),0)::float AS collected_previous_month,
      COUNT(*) FILTER (WHERE status='Settled' AND paid_on >= month_start AND paid_on < month_start + INTERVAL '1 month')::int AS settled_month,
      COUNT(*) FILTER (WHERE status='Settled' AND paid_on >= month_start AND paid_on < month_start + INTERVAL '1 month' AND NULLIF(BTRIM(or_number),'') IS NOT NULL)::int AS receipts_month,
      COALESCE((SELECT MAX(collected) FROM daily),0)::float AS highest_daily_collection,
      COALESCE((SELECT MAX(transactions) FROM daily),0)::int AS highest_daily_transactions,
      COALESCE((SELECT COUNT(*) FROM daily WHERE transactions > 0),0)::int AS active_collection_days,
      EXTRACT(DAY FROM NOW() AT TIME ZONE 'Asia/Manila')::int AS elapsed_days,
      COUNT(*) FILTER (WHERE status='Settled' AND apprehended_on >= month_start AND apprehended_on < month_start + INTERVAL '1 month')::int AS cohort_settled,
      COUNT(*) FILTER (WHERE status<>'Settled' AND apprehended_on >= month_start AND apprehended_on < month_start + INTERVAL '1 month')::int AS cohort_unsettled
    FROM normalized,bounds`),
    query<{ label: string; value: number }>(`WITH bounds AS (
      SELECT (NOW() AT TIME ZONE 'Asia/Manila')::date AS today
    ), days AS (
      SELECT generate_series(today - INTERVAL '29 days',today,INTERVAL '1 day')::date AS collection_day
      FROM bounds
    ), payments AS (
      SELECT amount,status,CASE WHEN payment_date ~ '^\\d{4}-\\d{2}-\\d{2}$' THEN payment_date::date END AS paid_on
      FROM violations
    )
    SELECT TO_CHAR(collection_day,'Mon FMDD') AS label,
      COALESCE(SUM(p.amount) FILTER (WHERE p.status='Settled'),0)::float AS value
    FROM days
    LEFT JOIN payments p ON p.paid_on = collection_day
    GROUP BY collection_day ORDER BY collection_day`),
    query<{ label: string; value: number }>(`SELECT COALESCE(NULLIF(BTRIM(violations_committed),''),'Unspecified') AS label,
      COALESCE(SUM(amount),0)::float AS value
    FROM violations
    WHERE status='Settled'
      AND CASE WHEN payment_date ~ '^\\d{4}-\\d{2}-\\d{2}$' THEN payment_date::date END >= date_trunc('month', NOW() AT TIME ZONE 'Asia/Manila')::date
      AND CASE WHEN payment_date ~ '^\\d{4}-\\d{2}-\\d{2}$' THEN payment_date::date END < date_trunc('month', NOW() AT TIME ZONE 'Asia/Manila')::date + INTERVAL '1 month'
    GROUP BY 1 ORDER BY value DESC,label LIMIT 4`),
  ]);

  const summary = summaryRows[0] ?? { collected_month: 0, collected_previous_month: 0, settled_month: 0, receipts_month: 0, highest_daily_collection: 0, highest_daily_transactions: 0, active_collection_days: 0, elapsed_days: 1, cohort_settled: 0, cohort_unsettled: 0 };
  const collected = number(summary.collected_month);
  const settled = count(summary.cohort_settled);
  const unsettled = count(summary.cohort_unsettled);
  const issued = settled + unsettled;
  const elapsedDays = Math.max(count(summary.elapsed_days), 1);
  const averageDailyCollection = collected / elapsedDays;
  const averageDailyTransactions = count(summary.settled_month) / elapsedDays;
  const averageDailySettled = settled / elapsedDays;
  const averageDailyUnsettled = unsettled / elapsedDays;
  const averageDailyIssued = issued / elapsedDays;
  const averagePayment = count(summary.settled_month) > 0 ? collected / count(summary.settled_month) : 0;
  const averageDailyReceipts = count(summary.receipts_month) / elapsedDays;
  const dailyCollection = number(trendRows[trendRows.length - 1]?.value);
  const collectionPeriods = ([7, 14, 21, 30] as const).map((days) => {
    const value = trendRows.slice(-days).reduce((total, row) => total + number(row.value), 0);
    return { days, value, display: formatMoney(value) };
  });

  return {
    id: "cto",
    short: "CTO",
    name: "Finance–Cashier",
    reportTitle: "Daily violation-fee activity",
    metrics: [
      { label: "Average daily collection", value: formatMoney(averageDailyCollection), details: [
        { label: "Daily collection", value: formatMoney(dailyCollection) },
        { label: "Average payment", value: formatMoney(averagePayment) },
        { label: "Active collection days", value: formatCount(summary.active_collection_days) },
      ] },
      { label: "Average daily settled tickets", value: formatCount(averageDailySettled), details: [
        { label: "Average daily receipts", value: formatCount(averageDailyReceipts) },
        { label: "Average payment", value: formatMoney(averagePayment) },
        { label: "Active collection days", value: formatCount(summary.active_collection_days) },
      ] },
      { label: "Average daily unsettled tickets", value: formatCount(averageDailyUnsettled), details: [
        { label: "Average tickets issued daily", value: formatCount(averageDailyIssued) },
        { label: "Average settled daily", value: formatCount(averageDailySettled) },
        { label: "Average unsettled daily", value: formatCount(averageDailyUnsettled) },
      ] },
      { label: "Daily collection", value: formatMoney(dailyCollection), details: [
        { label: "Average daily collection", value: formatMoney(averageDailyCollection) },
        { label: "Average daily transactions", value: formatCount(averageDailyTransactions) },
        { label: "Active collection days", value: formatCount(summary.active_collection_days) },
      ] },
    ],
    trend: {
      title: "Daily collections",
      labels: trendRows.map((row) => row.label),
      values: trendRows.map((row) => Number((number(row.value) / 1_000).toFixed(1))),
      valueSuffix: "K",
      periodTotals: collectionPeriods,
    },
    distribution: {
      title: "Average daily ticket activity",
      centerValue: formatCount(averageDailyIssued),
      centerLabel: "tickets/day",
      items: [
        { label: "Settled", value: averageDailySettled, display: `${formatCount(averageDailySettled)}/day` },
        { label: "Unsettled", value: averageDailyUnsettled, display: `${formatCount(averageDailyUnsettled)}/day` },
      ],
    },
    ranking: {
      title: "Average daily collections by category",
      items: sourceRows.map((row) => {
        const dailyValue = number(row.value) / elapsedDays;
        return { label: row.label, value: dailyValue, display: `${formatMoney(dailyValue)}/day` };
      }),
    },
  };
}

export async function loadMayorDashboard(): Promise<MayorDashboardResponse> {
  const departments = await Promise.all([bploDashboard(), ctmoDashboard(), financeDashboard()]);
  return { departments, updatedAt: new Date().toISOString(), source: "live" };
}

export async function closeMayorDashboardConnection() {
  const activePool = globalThis.mayorDashboardPool;
  globalThis.mayorDashboardPool = undefined;
  if (activePool) await activePool.end();
}
