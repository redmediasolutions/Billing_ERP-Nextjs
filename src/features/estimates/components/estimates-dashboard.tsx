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
    <section className="estimates-dashboard">
      <div className="estimates-dashboard__header">
        <div>
          <p className="estimates-dashboard__eyebrow">
            Sales
          </p>
          <h1 className="estimates-dashboard__title">Estimates</h1>
          <p className="estimates-dashboard__intro">
            View and manage your recent quotes.
          </p>
        </div>

        <Button
          asChild
          className="estimates-dashboard__primary-action"
        >
          <Link href="/dashboard/estimates/new">
            <Plus size={16} />
            New Estimate
          </Link>
        </Button>
      </div>

      <div className="estimates-dashboard__kpis">
        <Kpi label="Total Estimates" value={estimates.length} />
        <Kpi label="Draft Estimates" value={drafts} />
        <Kpi label="Expiring Soon" value={expiringSoon} danger />
      </div>

      <Card className="estimates-dashboard__directory">
        <CardContent className="estimates-dashboard__directory-content">
          <div className="estimates-dashboard__directory-head">
            <h2 className="estimates-dashboard__directory-title">Estimate Directory</h2>
          </div>

          <div className="estimates-dashboard__table-scroll">
            <table className="estimates-dashboard__table">
              <thead>
                <tr>
                  <th>Estimate #</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="estimates-dashboard__state">
                      <Loader2 className="estimates-dashboard__spinner" />
                      Loading estimates...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="estimates-dashboard__state estimates-dashboard__state--error">
                      Unable to load estimates.
                    </td>
                  </tr>
                ) : estimates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="estimates-dashboard__state">
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
                      className="estimates-dashboard__row"
                    >
                      <td className="estimates-dashboard__number">
                        {estimate.estimate_number}
                      </td>

                      <td className="estimates-dashboard__customer">
                        {estimate.customer_name || "Unknown customer"}
                      </td>

                      <td className="estimates-dashboard__date">
                        {estimate.estimate_date
                          ? new Date(
                            estimate.estimate_date
                          ).toLocaleDateString("en-IN")
                          : "—"}
                      </td>

                      <td className="estimates-dashboard__amount">
                        {money.format(estimate.rounded_total)}
                      </td>

                      <td>
                        <Badge className="estimates-dashboard__badge">
                          {estimate.is_draft ? "Draft" : "Finalized"}
                        </Badge>
                      </td>

                      <td>
                        <div className="estimates-dashboard__actions">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleDelete(estimate.id);
                            }}
                            className="estimates-dashboard__delete"
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
    <Card className="estimates-kpi">
      <CardContent>
        <FileText className="estimates-kpi__icon" />
        <p className="estimates-kpi__label">
          {label}
        </p>
        <p className={`estimates-kpi__value${danger ? " estimates-kpi__value--danger" : ""}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}