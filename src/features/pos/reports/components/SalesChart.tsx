"use client";

import { useEffect, useRef, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { money } from "@/features/pos/lib/money";
import { Skeleton } from "@/features/pos/ui/skeleton";
import { TimeseriesPoint } from "../types";
import "./SalesChart.css";

export function SalesChart({ series, loading }: { series: TimeseriesPoint[]; loading: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const update = () => {
      const next = Math.floor(node.getBoundingClientRect().width);
      setWidth((current) => (current === next ? current : next));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (loading) return <Skeleton style={{ height: 260, borderRadius: 12 }} />;

  const data = series.map((s) => ({
    ...s,
    label: new Date(s.day).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
  }));

  return (
    <div ref={containerRef} className="sales-chart">
      {width > 0 && (
        <BarChart width={width} height={260} data={data} barGap={2} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--text-faint)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "var(--text-faint)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
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
            wrapperStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="walk_in" stackId="a" fill="var(--ink-2)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="cloud_kitchen" stackId="a" fill="var(--ink-0)" radius={[3, 3, 0, 0]} />
        </BarChart>
      )}
    </div>
  );
}
