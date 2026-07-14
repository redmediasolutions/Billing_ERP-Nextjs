"use client";

import Link from "next/link";
import {
  FileText,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  useDeleteEstimate,
  useEstimates,
} from "../hooks/use-estimates";

import { useRouter } from "next/navigation";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export function EstimatesDashboard() {
  const { data: estimates = [], isLoading, error } =
    useEstimates();

  const router = useRouter();
  const deleteEstimate = useDeleteEstimate();

  const drafts = estimates.filter(
    (estimate) => estimate.is_draft
  ).length;

  const expiringSoon = estimates.filter((estimate) => {
    if (!estimate.valid_until) return false;

    const expiry = new Date(estimate.valid_until);
    const today = new Date();
    const inSevenDays = new Date();

    inSevenDays.setDate(today.getDate() + 7);

    return expiry >= today && expiry <= inSevenDays;
  }).length;

  async function handleDelete(id: number) {
    if (!window.confirm("Archive this estimate?")) return;

    await deleteEstimate.mutateAsync(id);
  }

  return (
    <section className="min-h-screen bg-[#111113] p-5 pt-20 text-white lg:p-8 lg:pt-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#FFCC00]">
            Sales
          </p>
          <h1 className="mt-1 text-3xl font-bold">Estimates</h1>
          <p className="mt-2 text-sm text-zinc-400">
            View and manage your recent quotes.
          </p>
        </div>

        <Button
          asChild
          className="bg-[#FFCC00] font-bold text-black hover:bg-yellow-400"
        >
          <Link href="/dashboard/estimates/new">
            <Plus className="mr-2 h-4 w-4" />
            New Estimate
          </Link>
        </Button>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-3">
        <Kpi label="Total Estimates" value={estimates.length} />
        <Kpi label="Draft Estimates" value={drafts} />
        <Kpi label="Expiring Soon" value={expiringSoon} danger />
      </div>

      <Card className="mt-7 border-zinc-800 bg-[#1e1e24] text-white">
        <CardContent className="p-0">
          <div className="border-b border-zinc-800 p-5">
            <h2 className="text-xl font-bold">Estimate Directory</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="border-b border-zinc-800 text-xs uppercase text-zinc-400">
                <tr>
                  <th className="px-6 py-4">Estimate #</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-14 text-center text-zinc-400"
                    >
                      <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin" />
                      Loading estimates...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-14 text-center text-red-300"
                    >
                      Unable to load estimates.
                    </td>
                  </tr>
                ) : estimates.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-14 text-center text-zinc-500"
                    >
                      No estimates created yet.
                    </td>
                  </tr>
                ) : (
                  estimates.map((estimate) => (
                    <tr
                      key={estimate.id}
                      onClick={() =>
                        router.push(`/dashboard/estimates/${estimate.id}`)
                      }
                      className="cursor-pointer border-b border-zinc-800/70 transition hover:bg-zinc-800/30"
                    >
                      <td className="px-6 py-5 font-bold text-[#FFCC00]">
                        {estimate.estimate_number}
                      </td>

                      {/* ADDED text-white HERE */}
                      <td className="px-6 py-5 font-semibold text-white">
                        {estimate.customer_name || "Unknown customer"}
                      </td>

                      {/* CHANGED to text-zinc-300 for better visibility */}
                      <td className="px-6 py-5 text-zinc-300">
                        {estimate.estimate_date
                          ? new Date(
                            estimate.estimate_date
                          ).toLocaleDateString("en-IN")
                          : "—"}
                      </td>
                      
                      {/* ADDED text-white HERE */}
                      <td className="px-6 py-5 font-bold text-white">
                        {money.format(estimate.rounded_total)}
                      </td>

                      <td className="px-6 py-5">
                        <Badge
                          className={
                            estimate.is_draft
                              ? "bg-zinc-700 text-zinc-200 hover:bg-zinc-700"
                              : "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15"
                          }
                        >
                          {estimate.is_draft ? "Draft" : "Finalized"}
                        </Badge>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(event) => {
                                event.stopPropagation();
                                void handleDelete(estimate.id);
                            }}
                            className="text-zinc-500 hover:bg-red-950/40 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function Kpi({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <Card className="border-zinc-800 bg-[#1e1e24] text-white">
      <CardContent className="p-5">
        <FileText className="mb-4 h-5 w-5 text-[#FFCC00]" />
        <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
          {label}
        </p>
        <p
          className={`mt-2 text-3xl font-bold ${danger ? "text-red-300" : "text-white"
            }`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}