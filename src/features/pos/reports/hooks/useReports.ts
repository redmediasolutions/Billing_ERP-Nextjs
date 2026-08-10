"use client";
import { useEffect, useState } from "react";
import { reportsApi } from "../repository/reportsApi";
import { ReportSummary, Timeseries } from "../types";

export function useReportSummary() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    reportsApi
      .summary()
      .then(setSummary)
      .catch((e) => setError(e?.message ?? "Failed to load reports"))
      .finally(() => setLoading(false));
  }, []);

  return { summary, loading, error };
}

export function useTimeseries(period: "week" | "month") {
  const [data, setData] = useState<Timeseries | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    reportsApi
      .timeseries(period)
      .then(setData)
      .finally(() => setLoading(false));
  }, [period]);

  return { data, loading };
}
