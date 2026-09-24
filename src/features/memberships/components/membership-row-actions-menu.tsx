"use client";

import Link from "next/link";
import {
  BellRing,
  Edit3,
  FileText,
  LogIn,
  MoreHorizontal,
  Pause,
  Play,
  ReceiptText,
  Trash2,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import type { MembershipEnrollment } from "../types";

const iconClass = "size-4 shrink-0 text-muted-foreground";

type MembershipRowActionsMenuProps = {
  row: MembershipEnrollment;
  onEdit: () => void;
  onCheckIn: () => void;
  onCreateInvoice: () => void;
  onScheduleRenewal: () => void;
  onPause: () => void;
  onResume: () => void;
  onArchive: () => void;
};

export function MembershipRowActionsMenu({
  row,
  onEdit,
  onCheckIn,
  onCreateInvoice,
  onScheduleRenewal,
  onPause,
  onResume,
  onArchive,
}: MembershipRowActionsMenuProps) {
  const customerLabel = row.display_customer_name || row.customer_name;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 text-muted-foreground shadow-none"
          title="Member actions"
        >
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Member actions</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 min-w-56 p-1.5">
        <DropdownMenuLabel className="truncate px-2 py-1.5 text-xs font-normal text-muted-foreground">
          {row.member_number}
          {customerLabel ? (
            <span className="block truncate font-medium text-foreground">
              {customerLabel}
            </span>
          ) : null}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onEdit}>
            <Edit3 className={iconClass} />
            Edit membership
          </DropdownMenuItem>

          {row.customer_ref ? (
            <DropdownMenuItem asChild>
              <Link
                href={`/dashboard/customers?search=${encodeURIComponent(customerLabel || "")}`}
                className="flex items-center gap-2"
              >
                <UserRound className={iconClass} />
                View customer
              </Link>
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Visit & billing
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem
            disabled={!row.can_check_in}
            onClick={onCheckIn}
          >
            <LogIn className={iconClass} />
            Check in
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onCreateInvoice}>
            <ReceiptText className={iconClass} />
            Create invoice
          </DropdownMenuItem>

          {row.last_invoice_ref ? (
            <DropdownMenuItem asChild>
              <Link
                href={`/dashboard/invoices/${row.last_invoice_ref}`}
                className="flex items-center gap-2"
              >
                <FileText className={iconClass} />
                Open last invoice
              </Link>
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Renewal
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onScheduleRenewal}>
            <BellRing className={iconClass} />
            Schedule renewal
          </DropdownMenuItem>

          {row.status === "active" ? (
            <DropdownMenuItem onClick={onPause}>
              <Pause className={iconClass} />
              Pause membership
            </DropdownMenuItem>
          ) : null}

          {row.status === "paused" ? (
            <DropdownMenuItem onClick={onResume}>
              <Play className={iconClass} />
              Resume membership
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onClick={onArchive}
          className={cn("mt-0.5")}
        >
          <Trash2 className="size-4 shrink-0" />
          Archive member
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
