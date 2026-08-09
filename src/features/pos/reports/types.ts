export interface ChannelTotal {
  invoice_count: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  grand_total: number;
}

export interface PeriodTotals {
  range: { from: string; to: string };
  walk_in: ChannelTotal;
  cloud_kitchen: ChannelTotal;
  combined: ChannelTotal;
}

export interface ReportSummary {
  generated_at: string;
  today: PeriodTotals;
  week: PeriodTotals;
  month: PeriodTotals;
}

export interface TimeseriesPoint {
  day: string;
  walk_in: number;
  cloud_kitchen: number;
  walk_in_count: number;
  cloud_kitchen_count: number;
}

export interface Timeseries {
  period: "week" | "month";
  range: { from: string; to: string };
  series: TimeseriesPoint[];
}
