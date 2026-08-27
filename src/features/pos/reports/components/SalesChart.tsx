"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { money } from "@/features/pos/lib/money";
import { Skeleton } from "@/features/pos/ui/skeleton";
import { useMediaQuery } from "@/features/pos/lib/use-media-query";
import { TimeseriesPoint } from "../types";
import "./SalesChart.css";

export function SalesChart({ series, loading }: { series: TimeseriesPoint[]; loading: boolean }) {
  const isPhone = useMediaQuery("(max-width: 860px)");

  if (loading) return <Skeleton style={{ height: isPhone ? 220 : 260, borderRadius: 12 }} />;

  const data = series.map((s) => ({
    ...s,
    label: new Date(s.day).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    }),
  }));

  if (!data.length) {
    return (
      <div className="sales-chart sales-chart-empty">
        No sales in this period.
      </div>
    );
  }

  return (
    <div className="sales-chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          barGap={2}
          margin={{
            top: 8,
            right: 8,
            left: isPhone ? 0 : -12,
            bottom: isPhone ? 4 : 0,
          }}
        >
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: isPhone ? 10 : 11, fill: "var(--text-faint)" }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
            interval={isPhone ? "preserveStartEnd" : 0}
          />
          <YAxis
            hide={isPhone}
            tick={{ fontSize: 11, fill: "var(--text-faint)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₹${v}`}
          />
          <Tooltip
            formatter={(value, name) => [
              money(Number(value ?? 0)),
              name === "walk_in" ? "Walk-in" : "Cloud kitchen",
            ]}
            labelStyle={{ color: "var(--ink-0)", fontWeight: 600 }}
            contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12.5 }}
          />
          <Legend
            formatter={(v) => (v === "walk_in" ? "Walk-in" : "Cloud kitchen")}
            wrapperStyle={{ fontSize: isPhone ? 11 : 12 }}
          />
          <Bar dataKey="walk_in" stackId="a" fill="var(--ink-2)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="cloud_kitchen" stackId="a" fill="var(--ink-0)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
