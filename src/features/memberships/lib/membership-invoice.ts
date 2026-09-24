import { generateInvoiceNumber } from "@/features/pos/lib/invoices";
import { invoicesRepository } from "@/features/invoices/repository/invoices.repository";
import type { InvoiceInput, InvoiceLineItem } from "@/features/invoices/types";
import { itemsService } from "@/features/items/services/items.service";

import type { MembershipEnrollment, MembershipPlan } from "../types";

function lineFromPlan(
  plan: MembershipPlan,
  item: Awaited<ReturnType<typeof itemsService.list>>[number] | null
): InvoiceLineItem {
  const unitPrice = item
    ? Number(item.walk_in_price ?? item.item_cost ?? plan.price)
    : Number(plan.price);
  const taxRate = item ? Number(item.tax_rate || 0) : 0;
  const amountBeforeTax = unitPrice;
  const taxAmount = (amountBeforeTax * taxRate) / 100;

  return {
    id: "membership-line",
    item_id: plan.item_ref,
    batch_id: null,
    item_name: item?.item_name || plan.plan_name,
    hsn_code: item?.hsn_code || "",
    unit: item?.unit || "SERVICE",
    description: `Membership · ${plan.plan_name}`,
    quantity: 1,
    unit_price: unitPrice,
    amount_before_tax: amountBeforeTax,
    tax_rate: taxRate,
    tax_amount: taxAmount,
    line_discount: 0,
    line_total: amountBeforeTax + taxAmount,
  };
}

export async function createMembershipInvoice(
  enrollment: MembershipEnrollment,
  plan: MembershipPlan
) {
  if (!enrollment.customer_ref) {
    throw new Error("Link a customer before creating an invoice.");
  }

  let catalogItem = null;
  if (plan.item_ref) {
    const items = await itemsService.list();
    catalogItem = items.find((row) => row.id === plan.item_ref) || null;
  }

  const line = lineFromPlan(plan, catalogItem);
  const subtotal = line.amount_before_tax;
  const taxAmount = line.tax_amount;
  const grandTotal = line.line_total;
  const today = new Date().toISOString().slice(0, 10);
  const dueDate = enrollment.next_billing_at || enrollment.ends_at || today;

  const payload: InvoiceInput = {
    invoice_number: generateInvoiceNumber("MEM"),
    customer_id: enrollment.customer_ref,
    custom_billing_address: "",
    custom_delivery_address: "",
    invoice_date: today,
    due_date: dueDate,
    payment_terms: "",
    subtotal,
    discount_amount: 0,
    tax_amount: taxAmount,
    grand_total: grandTotal,
    rounded_total: Math.round(grandTotal),
    notes: `Membership ${enrollment.member_number} · ${plan.plan_name}`,
    order_type: "",
    table_name: "",
    is_draft: false,
    sales_channel: "walk_in",
    line_items: [line],
  };

  const invoice = await invoicesRepository.create(payload);

  return {
    invoice_id: invoice.id,
    invoice_number: invoice.invoice_number,
    enrollment_id: enrollment.id,
  };
}
