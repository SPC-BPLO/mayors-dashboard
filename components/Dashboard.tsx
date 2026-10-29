"use client";

import { useEffect, useMemo, useState } from "react";
import type { DepartmentDashboard, DepartmentId, MayorDashboardResponse } from "@/lib/dashboard-types";

const monthLabels = ["—", "—", "—", "—", "—", "—"];
const emptyDepartments: DepartmentDashboard[] = [
  { id: "bplo", short: "BPLO", name: "Franchise", reportTitle: "Franchise records", metrics: ["Active franchises", "Expiring in 30 days", "MTOPs due for revocation", "MTOP slots available"].map((label) => ({ label, value: "—" })), trend: { title: "Active franchise trend", labels: monthLabels, values: [0, 0, 0, 0, 0, 0] }, distribution: { title: "Franchise status", centerValue: "—", centerLabel: "records", items: [] }, ranking: { title: "Key franchise records", items: [] } },
  { id: "ctmo", short: "CTMO", name: "Traffic Violations", reportTitle: "Traffic violation records", metrics: ["Violations recorded", "Tickets settled", "Repeat offenders"].map((label) => ({ label, value: "—" })), trend: { title: "Monthly violation trend", labels: monthLabels, values: [0, 0, 0, 0, 0, 0] }, distribution: { title: "Ticket resolution", centerValue: "—", centerLabel: "tickets", items: [] }, ranking: { title: "Most recorded violations", items: [] } },
  { id: "cto", short: "CTO", name: "Finance–Cashier", reportTitle: "Daily violation-fee activity", metrics: ["Average daily collection", "Average daily settled tickets", "Average daily unsettled tickets", "Daily collection"].map((label) => ({ label, value: "—" })), trend: { title: "Daily collections — last 7 days", labels: monthLabels, values: [0, 0, 0, 0, 0, 0], valueSuffix: "K" }, distribution: { title: "Average daily ticket activity", centerValue: "—", centerLabel: "tickets/day", items: [] }, ranking: { title: "Average daily collections by category", items: [] } },
];

const chartColors = ["#147d64", "#ef6b3a", "#f2a7b8", "#9dcfb9", "#dfe9e3"];

function MetricValue({ value }: { value: string }) {
  const match = value.match(/^(.*?)([BM])$/);
  if (!match) return value;

  return <>{match[1]}<span>{match[2]}</span></>;
}

function formatTrendValue(value: number, suffix?: string) {
  if (suffix === "K") return `₱${value.toLocaleString("en-PH", { maximumFractionDigits: 1 })}K`;
  return `${value.toLocaleString()}${suffix ?? ""}`;
}

function TrendChart({ trend }: { trend: DepartmentDashboard["trend"] }) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const width = 640;
  const height = 230;
  const left = 28;
  const right = 18;
  const top = 22;
  const bottom = 42;
  const minimum = Math.min(...trend.values);
  const maximum = Math.max(...trend.values);
  const range = Math.max(maximum - minimum, 1);
  const points = trend.values.map((value, index) => {
    const x = left + (index * (width - left - right)) / Math.max(trend.values.length - 1, 1);
    const y = top + ((maximum - value) / range) * (height - top - bottom);
    return { x, y, value };
  });
  const polyline = points.map(({ x, y }) => `${x},${y}`).join(" ");
  const area = `${left},${height - bottom} ${polyline} ${width - right},${height - bottom}`;

  return (
    <div className="trendChart" role="img" aria-label={`${trend.title}: ${trend.values.join(", ")}`}>
      <svg viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        {[0, 1, 2, 3].map((line) => {
          const y = top + (line * (height - top - bottom)) / 3;
          return <line key={line} x1={left} x2={width - right} y1={y} y2={y} className="chartGridline" />;
        })}
        <polygon points={area} className="chartArea" />
        <polyline points={polyline} className="chartLine" />
        {points.map(({ x, y, value }, index) => {
          const showAxisLabel = trend.labels.length <= 7 || index === trend.labels.length - 1 || index % Math.ceil(trend.labels.length / 6) === 0;
          const tooltipX = Math.min(Math.max(x, 74), width - 74);
          const tooltipY = Math.max(y - 56, 4);
          return (
          <g
            key={`${trend.labels[index]}-${value}`}
            onBlur={() => setHoveredPoint(null)}
            onFocus={() => setHoveredPoint(index)}
            onMouseEnter={() => setHoveredPoint(index)}
            onMouseLeave={() => setHoveredPoint(null)}
            tabIndex={trend.periodTotals ? 0 : undefined}
          >
            <title>{trend.labels[index]}: {formatTrendValue(value, trend.valueSuffix)}</title>
            <circle cx={x} cy={y} r="5" className="chartPoint" />
            <circle cx={x} cy={y} r="14" className="chartHitArea" />
            {!trend.periodTotals && (
              <text x={x} y={Math.max(y - 12, 13)} textAnchor="middle" className="chartValue">
                {formatTrendValue(value, trend.valueSuffix)}
              </text>
            )}
            {showAxisLabel && <text x={x} y={height - 14} textAnchor="middle" className="chartLabel">{trend.labels[index]}</text>}
            {hoveredPoint === index && (
              <g className="chartTooltip" pointerEvents="none">
                <rect x={tooltipX - 65} y={tooltipY} width="130" height="42" rx="9" />
                <text x={tooltipX} y={tooltipY + 15} textAnchor="middle" className="chartTooltipDate">{trend.labels[index]}</text>
                <text x={tooltipX} y={tooltipY + 32} textAnchor="middle" className="chartTooltipValue">{formatTrendValue(value, trend.valueSuffix)}</text>
              </g>
            )}
          </g>
        )})}
      </svg>
    </div>
  );
}

function DistributionChart({ distribution }: { distribution: DepartmentDashboard["distribution"] }) {
  const total = distribution.items.reduce((sum, item) => sum + item.value, 0);
  let cursor = 0;
  const stops = distribution.items.map((item, index) => {
    const start = cursor;
    cursor += total > 0 ? (item.value / total) * 100 : 0;
    return `${chartColors[index]} ${start}% ${cursor}%`;
  });

  return (
    <div className="distributionLayout">
      <div className="donutChart">
        <span
          aria-hidden="true"
          className="donutChartRing"
          style={{ background: stops.length && total > 0 ? `conic-gradient(${stops.join(", ")})` : "rgba(20,125,100,.12)" }}
        />
        <div>
          <strong>{distribution.centerValue}</strong>
          <span>{distribution.centerLabel}</span>
        </div>
      </div>
      <div className="distributionLegend">
        {distribution.items.map((item, index) => (
          <div key={item.label}>
            <i style={{ background: chartColors[index] }} />
            <span>{item.label}</span>
            <strong>{item.display}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function RankingBars({ ranking }: { ranking: DepartmentDashboard["ranking"] }) {
  const maximum = Math.max(...ranking.items.map((item) => item.value), 1);

  return (
    <div className="rankingBars">
      {ranking.items.map((item) => (
        <div className="rankingRow" key={item.label}>
          <div>
            <span>{item.label}</span>
            <strong>{item.display}</strong>
          </div>
          <div className="rankingTrack"><i style={{ width: `${Math.max((item.value / maximum) * 100, 4)}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

export function Dashboard({ initialData }: { initialData?: MayorDashboardResponse }) {
  const [departments, setDepartments] = useState<DepartmentDashboard[]>(initialData?.departments ?? emptyDepartments);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentId>("bplo");
  const [selectedMetric, setSelectedMetric] = useState<DepartmentDashboard["metrics"][number] | null>(null);
  const [collectionPeriod, setCollectionPeriod] = useState<"3m" | "6m" | "1y" | "lifetime">("3m");
  const [dataState, setDataState] = useState<"loading" | "ready" | "error">(initialData ? "ready" : "loading");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch("/api/dashboard", { cache: "no-store" });
        if (!response.ok) throw new Error("Live data request failed");
        const result = (await response.json()) as MayorDashboardResponse;
        if (active) {
          setDepartments(result.departments);
          setDataState("ready");
        }
      } catch {
        if (active) setDataState("error");
      }
    };
    if (!initialData) load();
    const refresh = window.setInterval(load, 60_000);
    return () => {
      active = false;
      window.clearInterval(refresh);
    };
  }, [initialData]);

  const department = useMemo(
    () => departments.find((item) => item.id === selectedDepartment) ?? departments[0],
    [departments, selectedDepartment],
  );
  const displayedTrend = useMemo(() => {
    if (!department.trend.periodTotals) return department.trend;
    const selectedPeriod = department.trend.periodTotals.find((item) => item.period === collectionPeriod)
      ?? department.trend.periodTotals[0];
    return {
      ...department.trend,
      title: selectedPeriod.period === "lifetime"
        ? "Monthly collections — lifetime"
        : `Monthly collections — last ${selectedPeriod.label}`,
      labels: selectedPeriod.labels,
      values: selectedPeriod.values,
    };
  }, [collectionPeriod, department.trend]);

  return (
    <div className="reportDashboard">
      <header className="reportTopbar">
        <div className="reportBrand">
          <span>San Pablo City</span>
          <strong>Mayor&apos;s Dashboard</strong>
        </div>
        <div className="mayorGreeting" aria-label="Mabuhay Mayora">
          <span>Mabuhay</span>
          <strong>Mayora</strong>
        </div>
      </header>

      <nav className="departmentSwitcher" aria-label="Department reports" role="tablist">
        {departments.map((item) => (
          <button
            aria-controls="department-report"
            aria-selected={selectedDepartment === item.id}
            className={selectedDepartment === item.id ? "active" : ""}
            key={item.id}
            onClick={() => {
              setSelectedMetric(null);
              setSelectedDepartment(item.id);
            }}
            role="tab"
            type="button"
          >
            <span>{item.short}</span>
            <strong>{item.name}</strong>
          </button>
        ))}
      </nav>

      <main className="departmentReport" id="department-report" key={department.id} role="tabpanel">
        <div className="reportHeading">
          <div>
            <span>{department.short}</span>
            <h1>{department.reportTitle}</h1>
          </div>
        </div>

        {dataState !== "ready" && (
          <div className={`liveDataNotice ${dataState}`} role="status">
            {dataState === "loading" ? "Loading live departmental data…" : "Live data unavailable. No demonstration values are being shown."}
          </div>
        )}

        <section className={`reportMetrics metrics-${department.metrics.length}${department.id === "cto" ? " compactMetrics" : ""}`} aria-label={`${department.short} summary statistics`}>
          {department.metrics.map((metric) => (
            <article
              className={metric.details ? "interactiveMetric" : undefined}
              key={metric.label}
              onClick={() => metric.details && setSelectedMetric(metric)}
              onKeyDown={(event) => {
                if (metric.details && (event.key === "Enter" || event.key === " ")) {
                  event.preventDefault();
                  setSelectedMetric(metric);
                }
              }}
              role={metric.details ? "button" : undefined}
              tabIndex={metric.details ? 0 : undefined}
            >
              <strong><MetricValue value={metric.value} /></strong>
              <span>{metric.label}</span>
            </article>
          ))}
        </section>

        <section className="analyticsGrid" aria-label={`${department.short} analytics`}>
          <article className="analyticsPanel trendPanel">
            <div className={`panelHeading${department.trend.periodTotals ? " collectionHeading" : ""}`}>
              <h2>{displayedTrend.title}</h2>
              {department.trend.periodTotals ? (
                <>
                  <div className="collectionPeriods" aria-label="Collection totals by period">
                    {department.trend.periodTotals.map((period) => (
                      <button
                        aria-pressed={collectionPeriod === period.period}
                        className={collectionPeriod === period.period ? "active" : ""}
                        key={period.period}
                        onClick={() => setCollectionPeriod(period.period)}
                        type="button"
                      >
                        <span>{period.label}</span>
                        <strong>{period.display}</strong>
                      </button>
                    ))}
                  </div>
                </>
              ) : <span>6 months</span>}
            </div>
            <TrendChart trend={displayedTrend} />
          </article>

          <article className="analyticsPanel distributionPanel">
            <div className="panelHeading"><h2>{department.distribution.title}</h2></div>
            <DistributionChart distribution={department.distribution} />
          </article>

          <article className="analyticsPanel rankingPanel">
            <div className="panelHeading"><h2>{department.ranking.title}</h2></div>
            <RankingBars ranking={department.ranking} />
          </article>
        </section>
      </main>

      {selectedMetric?.details && (
        <div className="metricOverlay" onMouseDown={(event) => event.target === event.currentTarget && setSelectedMetric(null)}>
          <section aria-labelledby="metric-dialog-title" aria-modal="true" className="metricDialog" role="dialog">
            <button aria-label="Close details" className="metricDialogClose" onClick={() => setSelectedMetric(null)} type="button">×</button>
            <span>CTO Finance–Cashier</span>
            <h2 id="metric-dialog-title">{selectedMetric.label}</h2>
            <strong><MetricValue value={selectedMetric.value} /></strong>
            <div className="metricDetailGrid">
              {selectedMetric.details.map((detail) => (
                <div key={detail.label}>
                  <span>{detail.label}</span>
                  <strong><MetricValue value={detail.value} /></strong>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
