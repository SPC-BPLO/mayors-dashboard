"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import type { DepartmentDashboard, DepartmentId, MayorDashboardResponse } from "@/lib/dashboard-types";

const monthLabels = ["—", "—", "—", "—", "—", "—"];
const fullMonthNames: Record<string, string> = {
  jan: "January",
  feb: "February",
  mar: "March",
  apr: "April",
  may: "May",
  jun: "June",
  jul: "July",
  aug: "August",
  sep: "September",
  oct: "October",
  nov: "November",
  dec: "December",
};
const emptyDepartments: DepartmentDashboard[] = [
  { id: "bplo", short: "BPLO", name: "Franchise", reportTitle: "Franchise records", metrics: ["Active franchises", "Expiring in 30 days", "MTOPs due for revocation", "MTOP slots available"].map((label) => ({ label, value: "—" })), trend: { title: "Active franchise trend", labels: monthLabels, values: [0, 0, 0, 0, 0, 0] }, distribution: { title: "Franchise status", centerValue: "—", centerLabel: "records", items: [] }, ranking: { title: "Key franchise records", items: [] } },
  { id: "ctmo", short: "CTMO", name: "Traffic Violations", reportTitle: "Traffic violation records", metrics: ["Violations recorded", "Tickets settled", "Repeat offenders"].map((label) => ({ label, value: "—" })), trend: { title: "Monthly violation trend", labels: monthLabels, values: [0, 0, 0, 0, 0, 0] }, distribution: { title: "Ticket resolution", centerValue: "—", centerLabel: "tickets", items: [] }, ranking: { title: "Most recorded violations", items: [] } },
  { id: "cto", short: "CTO", name: "Finance–Cashier", reportTitle: "Finance and collections", metrics: ["Violation collection today", "Tickets settled today", "Franchise collections", "Franchise transactions"].map((label) => ({ label, value: "—" })), trend: { title: "Violation-fee collections", labels: monthLabels, values: [0, 0, 0, 0, 0, 0], valueSuffix: "K" }, distribution: { title: "Average daily ticket activity", centerValue: "—", centerLabel: "tickets/day", items: [] }, ranking: { title: "Average daily collections by category", items: [] } },
];

const maintenanceResumeAt = new Date("2026-11-16T17:00:00+08:00");

// Flip to true once we're confident service will be back by then.
// While false, the notice says "Service may resume on"; when true, "Service resumes by".
const maintenanceResumeConfirmed = false;

function formatMaintenanceResumeAt(date: Date) {
  const dateText = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
  const timeText = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
  return `${dateText} · ${timeText} PHT`;
}

function MetricValue({ value }: { value: string }) {
  const match = value.match(/^(.*?)([BM])$/);
  if (!match) return value;

  return <>{match[1]}<span>{match[2]}</span></>;
}

function formatTrendValue(value: number, suffix?: string) {
  if (suffix === "K") return `₱${value.toLocaleString("en-PH", { maximumFractionDigits: 1 })}K`;
  return `${value.toLocaleString()}${suffix ?? ""}`;
}

function formatFullMonthName(label: string) {
  return fullMonthNames[label.trim().toLowerCase().replace(".", "")] ?? label;
}

function TrendChart({ trend }: { trend: DepartmentDashboard["trend"] }) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [selectedPoint, setSelectedPoint] = useState(Math.max(trend.values.length - 1, 0));
  const width = 640;
  const height = 230;
  const left = 66;
  const right = 18;
  const top = 28;
  const bottom = 50;
  const minimum = 0;
  const maximum = Math.max(...trend.values);
  const range = Math.max(maximum - minimum, 1);
  const isCurrency = trend.valueSuffix === "K";
  const yAxisTitle = isCurrency
    ? "Amount (₱K)"
    : trend.title.toLowerCase().includes("franchise")
      ? "Franchises"
      : "Records";
  const xAxisTitle = isCurrency ? "Collection period" : "Month";
  const yAxisTitleY = top + (height - top - bottom) / 2;
  const points = trend.values.map((value, index) => {
    const x = left + (index * (width - left - right)) / Math.max(trend.values.length - 1, 1);
    const y = top + ((maximum - value) / range) * (height - top - bottom);
    return { x, y, value };
  });
  const polyline = points.map(({ x, y }) => `${x},${y}`).join(" ");
  const area = `${left},${height - bottom} ${polyline} ${width - right},${height - bottom}`;
  const activePoint = points[selectedPoint] ?? points[points.length - 1];

  useEffect(() => {
    setSelectedPoint(Math.max(trend.values.length - 1, 0));
  }, [trend.labels, trend.values.length]);

  return (
    <div className="trendChart" aria-label={`${trend.title}: ${trend.values.join(", ")}`}>
      {trend.labels.length <= 8 && activePoint && (
        <div className="selectedMonthStat" aria-live="polite">
          <span>Selected month</span>
          <strong>{formatFullMonthName(trend.labels[selectedPoint])}</strong>
          <b>{formatTrendValue(activePoint.value, trend.valueSuffix)}</b>
        </div>
      )}
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${trend.title} chart`}>
        {[0, 1, 2, 3].map((line) => {
          const y = top + (line * (height - top - bottom)) / 3;
          const value = maximum - (line * range) / 3;
          const label = isCurrency
            ? `₱${value.toLocaleString("en-PH", { maximumFractionDigits: 1 })}K`
            : Math.round(value).toLocaleString("en-PH");
          return (
            <g key={line}>
              <line x1={left} x2={width - right} y1={y} y2={y} className="chartGridline" />
              <text x={left - 10} y={y + 4} textAnchor="end" className="chartAxisValue">{label}</text>
            </g>
          );
        })}
        <line x1={left} x2={left} y1={top} y2={height - bottom} className="chartAxisLine" />
        <line x1={left} x2={width - right} y1={height - bottom} y2={height - bottom} className="chartAxisLine" />
        <text
          x={14}
          y={yAxisTitleY}
          textAnchor="middle"
          transform={`rotate(-90 14 ${yAxisTitleY})`}
          className="chartAxisTitle"
        >
          {yAxisTitle}
        </text>
        <text x={(left + width - right) / 2} y={height - 2} textAnchor="middle" className="chartAxisTitle">{xAxisTitle}</text>
        <polygon points={area} className="chartArea" />
        <polyline points={polyline} className="chartLine" />
        {points.map(({ x, y, value }, index) => {
          const showAxisLabel = trend.labels.length <= 7 || index === trend.labels.length - 1 || index % Math.ceil(trend.labels.length / 6) === 0;
          const tooltipX = Math.min(Math.max(x, 74), width - 74);
          const tooltipY = Math.max(y - 56, 4);
          return (
          <g
            key={`${trend.labels[index]}-${value}-${index}`}
            onBlur={() => setHoveredPoint(null)}
            onFocus={() => setHoveredPoint(index)}
            onClick={() => setSelectedPoint(index)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSelectedPoint(index);
              }
            }}
            onMouseEnter={() => setHoveredPoint(index)}
            onMouseLeave={() => setHoveredPoint(null)}
            role="button"
            tabIndex={0}
          >
            <title>{`${trend.labels[index]}: ${formatTrendValue(value, trend.valueSuffix)}`}</title>
            {selectedPoint === index && <circle cx={x} cy={y} r="15" className="chartPointHalo" />}
            <circle cx={x} cy={y} r="5" className={`chartPoint${selectedPoint === index ? " selected" : ""}`} />
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
      {trend.labels.length <= 8 && (
        <div className="monthStatPicker" aria-label="Choose a month">
          {trend.labels.map((label, index) => (
            <button
              aria-pressed={selectedPoint === index}
              className={selectedPoint === index ? "active" : ""}
              key={`${label}-${index}`}
              onClick={() => setSelectedPoint(index)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <main className="dashboardSkeleton" aria-busy="true" aria-label="Loading dashboard">
      <div className="skeletonLine skeletonEyebrow" />
      <div className="skeletonLine skeletonTitle" />
      <div className="skeletonMetrics">
        {[0, 1, 2, 3].map((item) => <div className="skeletonCard" key={item} />)}
      </div>
      <div className="skeletonOverview">
        <div className="skeletonLine skeletonPanelTitle" />
        <div className="skeletonChart" />
      </div>
      <span className="srOnly">Loading city service information…</span>
    </main>
  );
}

export function Dashboard({ initialData, forceMaintenance = false }: { initialData?: MayorDashboardResponse; forceMaintenance?: boolean }) {
  const [departments, setDepartments] = useState<DepartmentDashboard[]>(initialData?.departments ?? emptyDepartments);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentId>("bplo");
  const [selectedMetric, setSelectedMetric] = useState<DepartmentDashboard["metrics"][number] | null>(null);
  const [departmentNavOpen, setDepartmentNavOpen] = useState(false);
  const [collectionPeriod, setCollectionPeriod] = useState<"3m" | "6m" | "1y" | "lifetime">("3m");
  const [refreshRequest, setRefreshRequest] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataState, setDataState] = useState<"loading" | "ready" | "delayed" | "error">(
    forceMaintenance ? "error" : initialData ? "ready" : "loading",
  );
  const metricDialogOpen = Boolean(selectedMetric?.details);

  useEffect(() => {
    if (!departmentNavOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDepartmentNavOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [departmentNavOpen]);

  useEffect(() => {
    if (forceMaintenance) {
      setDataState("error");
      setIsRefreshing(false);
      return;
    }

    let active = true;
    let requestInFlight = false;
    const load = async () => {
      if (requestInFlight) return;
      requestInFlight = true;
      setIsRefreshing(true);
      const controller = new AbortController();
      let timeout = 0;
      try {
        const result = await Promise.race([
          fetch("/api/dashboard", { cache: "no-store", signal: controller.signal }).then(async (response) => {
            if (!response.ok) throw new Error("Live data request failed");
            return response.json() as Promise<MayorDashboardResponse>;
          }),
          new Promise<never>((_, reject) => {
            timeout = window.setTimeout(() => {
              controller.abort();
              reject(new Error("Live data request timed out"));
            }, 8_000);
          }),
        ]);
        if (result.source !== "live" || !Array.isArray(result.departments)) {
          throw new Error("Invalid live dashboard response");
        }
        if (active) {
          setDepartments(result.departments);
          const snapshotAge = Date.now() - Date.parse(result.updatedAt);
          setDataState(Number.isFinite(snapshotAge) && snapshotAge > 60_000 ? "delayed" : "ready");
        }
      } catch {
        // Keep the dashboard available when live data is temporarily unavailable.
        // Maintenance mode is controlled explicitly by forceMaintenance only.
        if (active) setDataState("delayed");
      } finally {
        window.clearTimeout(timeout);
        requestInFlight = false;
        if (active) setIsRefreshing(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [forceMaintenance, initialData, refreshRequest]);

  useEffect(() => {
    if (!forceMaintenance) return;

    const scrollPosition = window.scrollY;
    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousRootOverscroll = root.style.overscrollBehavior;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyLeft = body.style.left;
    const previousBodyWidth = body.style.width;
    const previousBodyOverscroll = body.style.overscrollBehavior;
    const previousBodyTouchAction = body.style.touchAction;
    const dashboard = document.querySelector<HTMLElement>(".reportDashboard");
    const blockedSections = Array.from(dashboard?.children ?? []).filter(
      (element): element is HTMLElement => element instanceof HTMLElement && !element.classList.contains("maintenanceOverlay"),
    );

    root.style.overflow = "hidden";
    root.style.overscrollBehavior = "none";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollPosition}px`;
    body.style.left = "0";
    body.style.width = "100%";
    body.style.overscrollBehavior = "none";
    body.style.touchAction = "none";
    blockedSections.forEach((section) => {
      section.inert = true;
    });

    const stopScrolling = (event: Event) => event.preventDefault();
    const stopScrollKeys = (event: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "End", "Home", "PageDown", "PageUp", " "].includes(event.key)) {
        event.preventDefault();
      }
    };
    window.addEventListener("wheel", stopScrolling, { passive: false });
    window.addEventListener("touchmove", stopScrolling, { passive: false });
    window.addEventListener("keydown", stopScrollKeys);

    return () => {
      window.removeEventListener("wheel", stopScrolling);
      window.removeEventListener("touchmove", stopScrolling);
      window.removeEventListener("keydown", stopScrollKeys);
      root.style.overflow = previousRootOverflow;
      root.style.overscrollBehavior = previousRootOverscroll;
      body.style.overflow = previousBodyOverflow;
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.left = previousBodyLeft;
      body.style.width = previousBodyWidth;
      body.style.overscrollBehavior = previousBodyOverscroll;
      body.style.touchAction = previousBodyTouchAction;
      blockedSections.forEach((section) => {
        section.inert = false;
      });
      window.scrollTo(0, scrollPosition);
    };
  }, [forceMaintenance]);

  useEffect(() => {
    if (!metricDialogOpen) return;

    const scrollPosition = window.scrollY;
    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousRootOverscroll = root.style.overscrollBehavior;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyWidth = body.style.width;
    const previousBodyOverscroll = body.style.overscrollBehavior;

    root.style.overflow = "hidden";
    root.style.overscrollBehavior = "none";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollPosition}px`;
    body.style.width = "100%";
    body.style.overscrollBehavior = "none";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedMetric(null);
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      root.style.overflow = previousRootOverflow;
      root.style.overscrollBehavior = previousRootOverscroll;
      body.style.overflow = previousBodyOverflow;
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.width = previousBodyWidth;
      body.style.overscrollBehavior = previousBodyOverscroll;
      window.scrollTo(0, scrollPosition);
    };
  }, [metricDialogOpen]);

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
        ? "Violation-fee collections — lifetime"
        : `Violation-fee collections — last ${selectedPeriod.label}`,
      labels: selectedPeriod.labels,
      values: selectedPeriod.values,
    };
  }, [collectionPeriod, department.trend]);

  return (
    <div className={`reportDashboard${forceMaintenance ? " maintenanceMode" : ""}`}>
      <header className="reportTopbar">
        <div className="reportBrand">
          <img src="/san-pablo-city-seal.png" alt="" />
          <div>
            <span>City Government of San Pablo</span>
            <strong>Mabuhay, Carmela!</strong>
            <small>Mayor&apos;s Dashboard</small>
          </div>
        </div>
        <div className="reportHeaderActions">
          {dataState === "loading" && (
            <div className="liveDataNotice loading" role="status">Loading live departmental data…</div>
          )}
          <button
            aria-label={isRefreshing ? "Refreshing dashboard data" : "Refresh dashboard data"}
            className={`dashboardRefreshButton${isRefreshing ? " refreshing" : ""}`}
            disabled={isRefreshing}
            onClick={() => setRefreshRequest((request) => request + 1)}
            type="button"
          >
            <Icon name="refresh" size={17} />
            <span>{isRefreshing ? "Refreshing" : "Refresh"}</span>
          </button>
        </div>
      </header>

      {forceMaintenance && (
        <div className="maintenanceOverlay" role="alertdialog" aria-live="assertive" aria-modal="true" aria-labelledby="maintenance-title">
          <section className="maintenanceNotice">
            <header className="maintenanceHeader">
              <span className="maintenanceStatus"><i /> Maintenance in progress</span>
            </header>
            <div className="maintenanceCopy">
              <h1 id="maintenance-title">System maintenance</h1>
              <p>The Mayor&apos;s Dashboard is undergoing scheduled maintenance.</p>
            </div>
            <div className="maintenanceIllustration" aria-hidden="true">
              <svg className="maintenanceWarningIcon" viewBox="0 0 24 24" fill="none">
                <path d="M10.3 2.9 1.8 17.1A2 2 0 0 0 3.5 20h17a2 2 0 0 0 1.7-2.9L13.7 2.9a2 2 0 0 0-3.4 0Z" />
                <path d="M12 8v5" />
                <path d="M12 16.8h.01" />
              </svg>
            </div>
            <div className="maintenanceUpdate">
              <span>{maintenanceResumeConfirmed ? "Service resumes by" : "Service may resume on"}</span>
              <strong>
                <time dateTime={maintenanceResumeAt.toISOString()}>
                  {formatMaintenanceResumeAt(maintenanceResumeAt)}
                </time>
              </strong>
              <p>Thank you for your patience.</p>
            </div>
            <footer className="maintenanceFooter">
              <span>For support please contact</span>
              <strong>MTOP Administrator</strong>
            </footer>
          </section>
        </div>
      )}

      <button
        aria-controls="department-navigation"
        aria-expanded={departmentNavOpen}
        aria-label={departmentNavOpen ? "Close department navigation" : "Open department navigation"}
        className={`departmentNavToggle${departmentNavOpen ? " open" : ""}`}
        onClick={() => setDepartmentNavOpen((open) => !open)}
        type="button"
      >
        <Icon name="arrow" size={18} />
      </button>

      {departmentNavOpen && (
        <button
          aria-label="Close department navigation"
          className="departmentNavBackdrop"
          onClick={() => setDepartmentNavOpen(false)}
          type="button"
        />
      )}

      <nav
        className={`departmentSwitcher${departmentNavOpen ? " open" : ""}`}
        id="department-navigation"
        aria-label="City services"
        role="tablist"
      >
        <div className="departmentNavHeading">
          <strong>City services</strong>
        </div>
        {departments.map((item) => (
          <button
            aria-controls="department-report"
            aria-selected={selectedDepartment === item.id}
            className={selectedDepartment === item.id ? "active" : ""}
            key={item.id}
            onClick={() => {
              setSelectedMetric(null);
              setSelectedDepartment(item.id);
              setDepartmentNavOpen(false);
            }}
            role="tab"
            type="button"
          >
            <span className="departmentNavIcon">
              <img
                alt=""
                src={item.id === "bplo" ? "/bplo_seal.png" : item.id === "ctmo" ? "/ctmo_seal.png" : "/cto_seal.png"}
              />
            </span>
            <span className="departmentNavLabel">
              <span>{item.short}</span>
              <strong>{item.name}</strong>
            </span>
          </button>
        ))}
      </nav>

      {dataState === "loading" ? <DashboardSkeleton /> : <main className="departmentReport" id="department-report" key={department.id} role="tabpanel">
        <div className="reportHeading">
          <div>
            <span>{department.short}</span>
            <h1>{department.reportTitle}</h1>
            <p>Essential information for today&apos;s executive review.</p>
          </div>
        </div>

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

        <section className="mayorOverviewGrid" aria-label={`${department.short} overview`}>
          <article className={`overviewChartCard${department.trend.periodTotals ? " trendPanelWithPeriods" : ""}`}>
            <div className={`panelHeading${department.trend.periodTotals ? " collectionHeading" : ""}`}>
              <div>
                <span>Overview</span>
                <h2>{displayedTrend.title}</h2>
              </div>
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
              ) : <strong>6 months</strong>}
            </div>
            <TrendChart trend={displayedTrend} />
          </article>

          <aside className="decisionSummaryCard" aria-label="Executive summary">
            <div className="decisionSummaryHeading">
              <span>At a glance</span>
              <strong>{department.distribution.centerValue}</strong>
              <small>{department.distribution.centerLabel}</small>
            </div>
            <div className="snapshotList">
              {department.distribution.items.map((item, index) => (
                <div key={item.label}>
                  <i style={{ background: ["#17856a", "#ef6b3a", "#f2a7b8", "#9dcfb9"][index] ?? "#9dcfb9" }} />
                  <span>{item.label}</span>
                  <strong>{item.display}</strong>
                </div>
              ))}
            </div>
            {department.ranking.items.length > 0 && (
              <div className="prioritySummary">
                <span>{department.ranking.title}</span>
                {department.ranking.items.slice(0, 3).map((item) => (
                  <div key={item.label}>
                    <p>{item.label}</p>
                    <strong>{item.display}</strong>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </section>
      </main>}

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
