export const mayorInsights = [
  {
    officeShort: "BPLO",
    label: "Franchise compliance",
    value: "6,214",
    comparison: "96.6% of franchises are valid",
    trend: "+384 active franchises this year",
    trendTone: "positive",
    status: "On track",
    statusTone: "good",
    icon: "store",
    tone: "permitTone",
    office: "BPLO",
    topStats: [
      { label: "Active", value: "6,214" },
      { label: "Expiring soon", value: "112" },
      { label: "Inactive", value: "218" },
    ],
    facts: ["34 MTOPs due for revocation", "27 MTAP slots shown as available", "12 MTOPs already revoked"],
    action: "Ask BPLO to notify the 112 operators nearing expiration and prioritize renewals before they lapse.",
  },
  {
    officeShort: "CTMO",
    label: "Traffic violations",
    value: "3,482",
    comparison: "Recorded during the current month",
    trend: "+6.2% vs last month",
    trendTone: "attention",
    status: "Needs attention",
    statusTone: "attention",
    icon: "car",
    tone: "trafficTone",
    office: "CTMO",
    topStats: [
      { label: "Violations", value: "3,482" },
      { label: "Top hotspot", value: "486" },
      { label: "Repeat offenders", value: "147" },
    ],
    facts: ["Public Market district: 486 violations", "Maharlika Highway: 392 violations", "147 repeat offenders recorded"],
    action: "Deploy focused enforcement at the two leading locations and review repeat offenders for appropriate follow-up.",
  },
  {
    officeShort: "CTO",
    label: "Income and collections",
    value: "₱1.48B",
    comparison: "92.4% of the yearly goal",
    trend: "+6.4% vs last month",
    trendTone: "positive",
    status: "On track",
    statusTone: "good",
    icon: "bank",
    tone: "revenueTone",
    office: "City Treasurer's Office",
    topStats: [
      { label: "Collected", value: "₱1.48B" },
      { label: "Target reached", value: "92.4%" },
      { label: "Still needed", value: "₱121.6M" },
    ],
    facts: ["₱154M collected in October", "₱4.8M collected today", "₱121.6M is still needed for the yearly goal"],
    action: "Maintain the current collection pace and prioritize the ₱6.2M in payments that are still waiting for confirmation.",
  },
];

export const headlineStats = [
  { label: "Tickets issued", value: "3,482", change: "+6.2% vs Sep", icon: "car", tone: "blue", section: "traffic", details: ["146 tickets issued today", "568 are still unresolved", "84 active enforcement officers"] },
  { label: "Tickets resolved", value: "2,914", change: "83.7% resolved", icon: "check", tone: "green", section: "traffic", details: ["122 tickets resolved today", "2,706 licenses returned", "₱9.76M in ticket payments"] },
  { label: "Active permits", value: "6,214", change: "+384 this year", icon: "store", tone: "violet", section: "franchise", details: ["1,248 renewals finished", "112 expire within 30 days", "76 applications waiting for review"] },
  { label: "Collected this year", value: "₱1.48B", change: "92.4% of goal", icon: "bank", tone: "gold", section: "finance", details: ["₱154M collected in October", "₱4.8M collected today", "₱121.6M still needed for the yearly goal"] },
  { label: "Payments waiting", value: "184", change: "12.6% fewer", icon: "file", tone: "amber", section: "finance", details: ["₱6.2M still to be collected", "3,106 payments confirmed", "94.1% of payments confirmed"] },
  { label: "Systems up to date", value: "98.6%", change: "4 systems connected", icon: "shield", tone: "teal", section: "systems", details: ["52,840 records tracked", "146 staff members have access", "18,392 system activities recorded"] },
];

export const trafficSummary = [
  { label: "Issued this month", value: "3,482", note: "146 today" },
  { label: "Resolved", value: "2,914", note: "83.7% of all tickets" },
  { label: "Still unresolved", value: "568", note: "16.3% still open" },
  { label: "Ticket payments", value: "₱9.76M", note: "₱3,350 average payment" },
  { label: "Licenses returned", value: "2,706", note: "92.9% of resolved tickets" },
  { label: "Active officers", value: "84", note: "17 field teams" },
];

export const ticketTrend = [
  { month: "May", issued: 274, settled: 221 },
  { month: "Jun", issued: 301, settled: 246 },
  { month: "Jul", issued: 329, settled: 270 },
  { month: "Aug", issued: 354, settled: 291 },
  { month: "Sep", issued: 379, settled: 319 },
  { month: "Oct", issued: 412, settled: 347 },
];

export const violationBreakdown = [
  { label: "No helmet / protective gear", count: 1024, share: 29.4 },
  { label: "Illegal parking", count: 786, share: 22.6 },
  { label: "No or expired license", count: 612, share: 17.6 },
  { label: "Road obstruction", count: 468, share: 13.4 },
  { label: "Colorum / out of line", count: 338, share: 9.7 },
  { label: "Other violations", count: 254, share: 7.3 },
];

export const franchiseSummary = [
  { label: "Active permits", value: "6,214", note: "96.6% complete and valid" },
  { label: "New permits", value: "384", note: "Added this year" },
  { label: "Renewals finished", value: "1,248", note: "91.3% finished on time" },
  { label: "Expire in 30 days", value: "112", note: "Need early reminders" },
  { label: "Waiting for review", value: "76", note: "22 need documents" },
  { label: "Inactive records", value: "218", note: "34 are suspended" },
];

export const franchisePipeline = [
  { label: "Application received", count: 1460, rate: 100 },
  { label: "Documents complete", count: 1378, rate: 94.4 },
  { label: "Assessment approved", count: 1316, rate: 90.1 },
  { label: "Payment confirmed", count: 1276, rate: 87.4 },
  { label: "Permit released", count: 1248, rate: 85.5 },
];

export const financeSummary = [
  { label: "Collected this year", value: "₱1.48B", note: "92.4% of the yearly goal" },
  { label: "Collected in October", value: "₱154M", note: "96.3% of the monthly goal" },
  { label: "Collected today", value: "₱4.8M", note: "Across 312 transactions" },
  { label: "Payments confirmed", value: "3,106", note: "94.1% of payments" },
  { label: "Payments waiting", value: "184", note: "₱6.2M still to collect" },
  { label: "Still needed this year", value: "₱121.6M", note: "To reach the ₱1.60B goal" },
];

export const revenueSources = [
  { label: "Business taxes", value: "₱562.4M", share: 38 },
  { label: "Real property tax", value: "₱399.6M", share: 27 },
  { label: "Fees and charges", value: "₱266.4M", share: 18 },
  { label: "Traffic and franchise", value: "₱162.8M", share: 11 },
  { label: "Other local income", value: "₱88.8M", share: 6 },
];

export const systemSummary = [
  { label: "Records tracked", value: "52,840", note: "Across four systems" },
  { label: "Records updated", value: "98.6%", note: "In the last 24 hours" },
  { label: "Staff with access", value: "146", note: "From 12 offices" },
  { label: "Activities recorded", value: "18,392", note: "All activity is recorded" },
];

export const departmentScorecard = [
  { office: "CTMO Traffic", metric: "Tickets resolved", today: "122", month: "2,914", rate: 83.7, status: "On track" },
  { office: "BPLO Franchise", metric: "Renewal permits released", today: "58", month: "1,248", rate: 91.3, status: "On track" },
  { office: "CTMO Finance", metric: "Money collected", today: "₱4.8M", month: "₱86.4M", rate: 94.1, status: "On track" },
  { office: "System Administration", metric: "Records updated", today: "99.1%", month: "98.6%", rate: 98.6, status: "Healthy" },
];
