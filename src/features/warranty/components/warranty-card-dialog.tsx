"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  coverageLabel,
  formatShortDate,
  remainingCopy,
  statusLabel,
} from "../lib/warranty-utils";
import type { WarrantyRegistration } from "../types";

export function WarrantyCardDialog({
  warranty,
  open,
  onClose,
  onClaim,
}: {
  warranty: WarrantyRegistration | null;
  open: boolean;
  onClose: () => void;
  onClaim?: () => void;
}) {
  if (!warranty) return null;

  const remaining = remainingCopy(warranty.days_remaining);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Digital warranty card</DialogTitle>
          <DialogDescription>
            Same record the claim desk uses — serial, owner, invoice, and
            remaining coverage.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {coverageLabel(warranty.coverage_type)}
              </p>
              <h3 className="mt-1 text-xl font-semibold">
                {warranty.product_name || "Registered product"}
              </h3>
              <p className="font-mono text-sm text-muted-foreground">
                {warranty.serial_number}
              </p>
            </div>
            <Badge>{statusLabel(warranty.status)}</Badge>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatShortDate(warranty.starts_at)}</span>
              <span>{remaining}</span>
              <span>{formatShortDate(warranty.ends_at)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{
                  width: `${Math.max(4, Math.min(100, warranty.coverage_percent))}%`,
                }}
              />
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Owner</dt>
              <dd className="font-medium">
                {warranty.display_customer_name ||
                  warranty.customer_name ||
                  "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Warranty no.</dt>
              <dd className="font-medium">{warranty.warranty_number}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Invoice</dt>
              <dd>
                {warranty.invoice_ref ? (
                  <Link
                    href={`/dashboard/invoices/${warranty.invoice_ref}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {warranty.invoice_number || `#${warranty.invoice_ref}`}
                  </Link>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Claims</dt>
              <dd className="font-medium">
                {warranty.claims_count} logged
                {warranty.open_claims
                  ? ` · ${warranty.open_claims} open`
                  : ""}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onClaim ? (
            <Button onClick={onClaim}>File a claim</Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
