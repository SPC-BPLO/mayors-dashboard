"use client";

import { useMemo, useState } from "react";

type DepartmentId = "bplo" | "ctmo" | "cto";

type DepartmentDashboard = {
  id: DepartmentId;
  short: string;
  name: string;
  reportTitle: string;
  metrics: Array<{ label: string; value: string }>;
  trend: {
    title: string;
    labels: string[];
    values: number[];
    valueSuffix?: string;
  };
  distribution: {
    title: string;
    centerValue: string;
    centerLabel: string;
    items: Array<{ label: string; value: number; display: string }>;
  };
  ranking: {
    title: string;
    items: Array<{ label: string; value: number; display: string }>;
  };
};

const departments: DepartmentDashboard[] = [
  {
    id: "bplo",
    short: "BPLO",
    name: "Franchise",
    reportTitle: "Franchise records",
    metrics: [
      { label: "Active franchises", value: "6,214" },
      { label: "Expiring in 30 days", value: "112" },
      { label: "MTOPs due for revocation", value: "34" },
      { label: "MTAP slots available", value: "27" },
    ],
    trend: {
      title: "Active franchise trend",
      labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
      values: [5780, 5856, 5942, 6028, 6110, 6214],
    },
    distribution: {
      title: "Franchise status",
      centerValue: "6,544",
      centerLabel: "records",
      items: [
        { label: "Active", value: 6214, display: "6,214" },
        { label: "Expiring soon", value: 112, display: "112" },
        { label: "Inactive", value: 218, display: "218" },
      ],
    },
    ranking: {
      title: "Key franchise records",
      items: [
        { label: "Renewals completed", value: 1248, display: "1,248" },
        { label: "New applications", value: 384, display: "384" },
        { label: "Inactive records", value: 218, display: "218" },
        { label: "MTOPs already revoked", value: 12, display: "12" },
      ],
    },
  },
  {
    id: "ctmo",
    short: "CTMO",
    name: "Traffic Violations",
    reportTitle: "Traffic violation records",
    metrics: [
      { label: "Violations recorded", value: "3,482" },
      { label: "Tickets settled", value: "2,914" },
      { label: "Repeat offenders", value: "147" },
    ],
    trend: {
      title: "Monthly violation trend",
      labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
      values: [2740, 2915, 3078, 3240, 3368, 3482],
    },
    distribution: {
      title: "Ticket resolution",
      centerValue: "3,482",
      centerLabel: "tickets",
      items: [
        { label: "Settled", value: 2914, display: "2,914" },
        { label: "Unresolved", value: 568, display: "568" },
      ],
    },
    ranking: {
      title: "Leading violation locations",
      items: [
        { label: "Public Market district", value: 486, display: "486" },
        { label: "Maharlika Highway", value: 392, display: "392" },
        { label: "City proper", value: 318, display: "318" },
        { label: "All remaining city locations", value: 2286, display: "2,286" },
      ],
    },
  },
  {
    id: "cto",
    short: "CTO",
    name: "Finance–Cashier",
    reportTitle: "Income and collections",
    metrics: [
      { label: "Collected this year", value: "₱1.48B" },
      { label: "Still needed", value: "₱121.6M" },
      { label: "Collected in October", value: "₱154M" },
      { label: "Collected today", value: "₱4.8M" },
    ],
    trend: {
      title: "Monthly collection trend",
      labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
      values: [112, 126, 137, 143, 149, 154],
      valueSuffix: "M",
    },
    distribution: {
      title: "Collection sources",
      centerValue: "₱1.48B",
      centerLabel: "collected",
      items: [
        { label: "Business taxes", value: 38, display: "₱562.4M" },
        { label: "Real property tax", value: 27, display: "₱399.6M" },
        { label: "Fees and charges", value: 18, display: "₱266.4M" },
        { label: "Traffic and franchise", value: 11, display: "₱162.8M" },
        { label: "Other income", value: 6, display: "₱88.8M" },
      ],
    },
    ranking: {
      title: "Largest collection sources",
      items: [
        { label: "Business taxes", value: 562.4, display: "₱562.4M" },
        { label: "Real property tax", value: 399.6, display: "₱399.6M" },
        { label: "Fees and charges", value: 266.4, display: "₱266.4M" },
        { label: "Traffic and franchise", value: 162.8, display: "₱162.8M" },
      ],
    },
  },
];

const chartColors = ["#147d64", "#ef6b3a", "#f2a7b8", "#9dcfb9", "#dfe9e3"];

function MetricValue({ value }: { value: string }) {
  const match = value.match(/^(.*?)([BM])$/);
  if (!match) return value;

  return <>{match[1]}<span>{match[2]}</span></>;
}

function TrendChart({ trend }: { trend: DepartmentDashboard["trend"] }) {
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
        {points.map(({ x, y, value }, index) => (
          <g key={`${trend.labels[index]}-${value}`}>
            <circle cx={x} cy={y} r="5" className="chartPoint" />
            <text x={x} y={Math.max(y - 12, 13)} textAnchor="middle" className="chartValue">
              {value.toLocaleString()}{trend.valueSuffix ?? ""}
            </text>
            <text x={x} y={height - 14} textAnchor="middle" className="chartLabel">{trend.labels[index]}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function DistributionChart({ distribution }: { distribution: DepartmentDashboard["distribution"] }) {
  const total = distribution.items.reduce((sum, item) => sum + item.value, 0);
  let cursor = 0;
  const stops = distribution.items.map((item, index) => {
    const start = cursor;
    cursor += (item.value / total) * 100;
    return `${chartColors[index]} ${start}% ${cursor}%`;
  });

  return (
    <div className="distributionLayout">
      <div className="donutChart">
        <span
          aria-hidden="true"
          className="donutChartRing"
          style={{ background: `conic-gradient(${stops.join(", ")})` }}
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
  const maximum = Math.max(...ranking.items.map((item) => item.value));

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

export function Dashboard() {
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentId>("bplo");
  const department = useMemo(
    () => departments.find((item) => item.id === selectedDepartment) ?? departments[0],
    [selectedDepartment],
  );

  return (
    <div className="reportDashboard">
      <header className="reportTopbar">
        <div className="reportBrand">
          <span>San Pablo City</span>
          <strong>Mayor&apos;s Dashboard</strong>
        </div>
      </header>

      <nav className="departmentSwitcher" aria-label="Department reports" role="tablist">
        {departments.map((item) => (
          <button
            aria-controls="department-report"
            aria-selected={selectedDepartment === item.id}
            className={selectedDepartment === item.id ? "active" : ""}
            key={item.id}
            onClick={() => setSelectedDepartment(item.id)}
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

        <section className={`reportMetrics metrics-${department.metrics.length}`} aria-label={`${department.short} summary statistics`}>
          {department.metrics.map((metric) => (
            <article key={metric.label}>
              <strong><MetricValue value={metric.value} /></strong>
              <span>{metric.label}</span>
            </article>
          ))}
        </section>

        <section className="analyticsGrid" aria-label={`${department.short} analytics`}>
          <article className="analyticsPanel trendPanel">
            <div className="panelHeading">
              <h2>{department.trend.title}</h2>
              <span>6 months</span>
            </div>
            <TrendChart trend={department.trend} />
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
    </div>
  );
}
