export type DepartmentId = "bplo" | "ctmo" | "cto";

export type DepartmentDashboard = {
  id: DepartmentId;
  short: string;
  name: string;
  reportTitle: string;
  metrics: Array<{
    label: string;
    value: string;
    details?: Array<{ label: string; value: string }>;
  }>;
  trend: {
    title: string;
    labels: string[];
    values: number[];
    valueSuffix?: string;
    overallTotal?: {
      value: number;
      display: string;
    };
    periodTotals?: Array<{
      period: "3m" | "6m" | "1y" | "lifetime";
      label: string;
      value: number;
      display: string;
      labels: string[];
      values: number[];
    }>;
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

export type MayorDashboardResponse = {
  departments: DepartmentDashboard[];
  updatedAt: string;
  source: "live";
};
