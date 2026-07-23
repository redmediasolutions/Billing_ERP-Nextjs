"use client";

import Link from "next/link";
import {
    FileText,
    Loader2,
    Plus,
    Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    useDeleteInvoice,
    useInvoices,
} from "../hooks/use-invoices";

import { useRouter } from "next/navigation";

const money = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
});

export function InvoicesDashboard() {
    const { data: invoices = [], isLoading, error } =
        useInvoices();

    const router = useRouter();
    const deleteInvoice = useDeleteInvoice();

    const draftCount = invoices.filter(
        (invoice) => invoice.is_draft
    ).length;

    const totalValue = invoices.reduce(
        (sum, invoice) => sum + invoice.rounded_total,
        0
    );

    async function removeInvoice(id: number) {
        if (
            !window.confirm(
                "Archive this invoice? Stock will be automatically restored."
            )
        ) {
            return;
        }

        await deleteInvoice.mutateAsync(id);
    }

    return (
        <section className="invoices-dashboard">
            <div className="invoices-dashboard__header">
                <div>
                    <p className="invoices-dashboard__eyebrow">
                        Sales
                    </p>

                    <h1 className="invoices-dashboard__title">Invoices</h1>

                    <p className="invoices-dashboard__intro">
                        Create invoices and manage billing records.
                    </p>
                </div>

                <Button
                    asChild
                    className="invoices-dashboard__primary-action"
                >
                    <Link href="/dashboard/invoices/new">
                        <Plus size={16} />
                        New Invoice
                    </Link>
                </Button>
            </div>

            <div className="invoices-dashboard__kpis">
                <Kpi label="Total Invoices" value={invoices.length} />

                <Kpi label="Draft Invoices" value={draftCount} />

                <Kpi
                    label="Invoice Value"
                    value={money.format(totalValue)}
                />
            </div>

            <Card className="invoices-dashboard__directory"><CardContent className="invoices-dashboard__directory-content">
                    <div className="invoices-dashboard__directory-head"><h2 className="invoices-dashboard__directory-title">Invoice Directory</h2>
                    </div>

                    <div className="invoices-dashboard__table-scroll"><table className="invoices-dashboard__table"><thead>
                                <tr>
                                    <th>Invoice #</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th><th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="invoices-dashboard__state"
                                        >
                                            <Loader2 className="invoices-dashboard__spinner" />
                                            Loading invoices...
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="invoices-dashboard__state invoices-dashboard__state--error"
                                        >
                                            Unable to load invoices.
                                        </td>
                                    </tr>
                                ) : invoices.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="invoices-dashboard__state"
                                        >
                                            No invoices created yet.
                                        </td>
                                    </tr>
                                ) : (
                                    invoices.map((invoice) => (
                                        <tr
                                            key={invoice.id}
                                            onClick={() =>
                                                router.push(`/dashboard/invoices/${invoice.id}`)
                                            }
                                            className="invoices-dashboard__row"
                                        >
                                            <td className="invoices-dashboard__number">
                                                {invoice.invoice_number}
                                            </td>

                                            {/* ADDED text-white HERE */}
                                            <td className="invoices-dashboard__customer">
                                                {invoice.customer_name || "Unknown customer"}
                                            </td>

                                            {/* CHANGED to text-zinc-300 for better visibility */}
                                            <td className="invoices-dashboard__date">
                                                {invoice.invoice_date
                                                    ? new Date(
                                                        invoice.invoice_date
                                                    ).toLocaleDateString("en-IN")
                                                    : "—"}
                                            </td>

                                            {/* ADDED text-white HERE */}
                                            <td className="invoices-dashboard__amount">
                                                {money.format(invoice.rounded_total)}
                                            </td>

                                            <td>
                                                <Badge
                                                    className={
                                                        invoice.is_draft
                                                            ? "invoices-dashboard__status"
                                                            : "invoices-dashboard__status"
                                                    }
                                                >
                                                    {invoice.is_draft
                                                        ? "Draft"
                                                        : "Finalized"}
                                                </Badge>
                                            </td>

                                            <td><div className="invoices-dashboard__actions">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        disabled={deleteInvoice.isPending}
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            void removeInvoice(invoice.id);
                                                        }}
                                                        className="invoices-dashboard__delete"
                                                    >
                                                        <Trash2 size={16} />
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
}: {
    label: string;
    value: string | number;
}) {
    return (
        <Card className="invoices-kpi"><CardContent className="invoices-kpi__content"><FileText size={20} className="invoices-kpi__icon" />

                <p className="invoices-kpi__label">
                    {label}
                </p>

                <p className="invoices-kpi__value">{value}</p>
            </CardContent>
        </Card>
    );
}
