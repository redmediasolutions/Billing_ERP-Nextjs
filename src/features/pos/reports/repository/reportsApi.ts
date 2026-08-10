import { apiRequest } from "@/lib/api";
import { ReportSummary, Timeseries } from "../types";

export const reportsApi = {
  summary: (): Promise<ReportSummary> => apiRequest("/reports/summary"),
  timeseries: (period: "week" | "month"): Promise<Timeseries> =>
    apiRequest(`/reports/timeseries?period=${period}`),
};
