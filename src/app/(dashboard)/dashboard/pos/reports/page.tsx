"use client";
import { useState } from "react";
import { Tabs } from "@/features/pos/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/features/pos/ui/card";
import { useReportSummary, useTimeseries } from "@/features/pos/reports/hooks/useReports";
import { ChannelBreakdownCard } from "@/features/pos/reports/components/ReportCards";
import { SalesChart } from "@/features/pos/reports/components/SalesChart";

export default function ReportsPage() {
  const { summary, loading, error } = useReportSummary();
  const [period, setPeriod] = useState<"week" | "month">("week");
  const { data: timeseries, loading: chartLoading } = useTimeseries(period);

  return (
    <div className="container-page">
      <div className="page-header">
        <div>
          <div className="eyebrow">Performance</div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Weekly &amp; monthly sales, split by channel — computed server-side for accuracy.</p>
        </div>
      </div>

      {error && <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>}

      {!loading && summary && (
        <div className="stat-grid" style={{ marginBottom: 20 }}>
          <ChannelBreakdownCard
            title="Today"
            subtitle="Since midnight"
            walkIn={summary.today.walk_in}
            cloudKitchen={summary.today.cloud_kitchen}
            combined={summary.today.combined}
          />
          <ChannelBreakdownCard
            title="This week"
            subtitle="Monday – today"
            walkIn={summary.week.walk_in}
            cloudKitchen={summary.week.cloud_kitchen}
            combined={summary.week.combined}
          />
          <ChannelBreakdownCard
            title="This month"
            subtitle="Month to date"
            walkIn={summary.month.walk_in}
            cloudKitchen={summary.month.cloud_kitchen}
            combined={summary.month.combined}
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sales by day</CardTitle>
              <CardDescription>Walk-in vs cloud kitchen, stacked by day</CardDescription>
            </div>
            <Tabs
              value={period}
              onChange={(v) => setPeriod(v as "week" | "month")}
              options={[
                { value: "week", label: "This week" },
                { value: "month", label: "This month" },
              ]}
            />
          </div>
        </CardHeader>
        <CardContent>
          <SalesChart series={timeseries?.series ?? []} loading={chartLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
