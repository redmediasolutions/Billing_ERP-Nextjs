"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  Pill,
  Plus,
  ReceiptText,
  Stethoscope,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useClinicServices } from "@/features/clinic-services/hooks/use-clinic-services";
import { useAvailableBatches, useMedicines } from "@/features/medicines/hooks/use-medicines";
import { PatientPickerField } from "@/features/patients/components/patient-picker-field";
import { usePatient } from "@/features/patients/hooks/use-patients";
import type { Patient } from "@/features/patients/types";

import { useCreateClinicBill, useNextClinicBillNumber } from "../hooks/use-clinic";
import { errorMessage, formatExpiry, money, todayInput } from "../lib/clinic-format";
import type { ClinicBillLine, ClinicPaymentInput, ClinicPaymentMethod } from "../types";

const METHODS: Array<{ value: ClinicPaymentMethod; label: string }> = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card (+2%)" },
  { value: "bank", label: "Bank transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "other", label: "Other" },
];

const r2 = (v: number) => Math.round(v * 100) / 100;

export function ClinicBillForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillId = Number(searchParams.get("patient")) || null;
  const { data: prefill } = usePatient(prefillId);

  const { data: services = [] } = useClinicServices();
  const { data: medicines = [] } = useMedicines();
  const { data: nextNumber } = useNextClinicBillNumber();
  const createBill = useCreateClinicBill();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [billDate, setBillDate] = useState(todayInput());
  const [lines, setLines] = useState<ClinicBillLine[]>([]);
  const [discount, setDiscount] = useState("0");
  const [payments, setPayments] = useState<ClinicPaymentInput[]>([]);
  const [error, setError] = useState("");

  // line builder
  const [kind, setKind] = useState<"service" | "medicine">("service");
  const [serviceId, setServiceId] = useState("");
  const [medicineId, setMedicineId] = useState("");
  const [batchId, setBatchId] = useState("auto");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");
  const { data: batches = [] } = useAvailableBatches(medicineId ? Number(medicineId) : undefined);

  useEffect(() => {
    if (prefill && !patient) setPatient(prefill);
  }, [prefill]); // eslint-disable-line react-hooks/exhaustive-deps

  const inStock = useMemo(() => medicines.filter((m) => m.total_stock > 0), [medicines]);
  const selectedMedicine = medicines.find((m) => String(m.id) === medicineId) || null;
  const selectedBatch = batches.find((b) => String(b.id) === batchId) || null;

  // stock already on this bill, so the same medicine can't be over-sold
  function usedQty(itemId: number, batch: number | null) {
    return lines
      .filter((l) => l.type === "medicine" && l.item_id === itemId && (batch === null || l.batch_id === batch))
      .reduce((s, l) => s + l.qty, 0);
  }

  function addLine() {
    setError("");
    const q = Number(qty);
    if (!q || q <= 0) {
      setError("Enter a quantity.");
      return;
    }
    if (kind === "service") {
      const s = services.find((x) => String(x.id) === serviceId);
      if (!s) return;
      setLines((prev) => [
        ...prev,
        {
          key: crypto.randomUUID(),
          type: "service",
          item_id: s.id,
          name: s.name,
          batch_id: null,
          batch_label: null,
          qty: q,
          price: price === "" ? s.cost : Number(price),
          available: null,
        },
      ]);
      setServiceId("");
    } else {
      const m = selectedMedicine;
      if (!m) return;
      const available = selectedBatch
        ? selectedBatch.quantity - usedQty(m.id, selectedBatch.id)
        : m.total_stock - usedQty(m.id, null);
      if (q > available) {
        setError(`Only ${available} of ${m.name} left${selectedBatch ? ` in batch ${selectedBatch.batch_no}` : ""}.`);
        return;
      }
      setLines((prev) => [
        ...prev,
        {
          key: crypto.randomUUID(),
          type: "medicine",
          item_id: m.id,
          name: m.name,
          batch_id: selectedBatch ? selectedBatch.id : null,
          batch_label: selectedBatch ? `Batch ${selectedBatch.batch_no}` : "Earliest expiry first",
          qty: q,
          price:
            price === ""
              ? selectedBatch && selectedBatch.selling_price > 0
                ? selectedBatch.selling_price
                : m.selling_price
              : Number(price),
          available,
        },
      ]);
      setMedicineId("");
      setBatchId("auto");
    }
    setQty("1");
    setPrice("");
  }

  const subtotal = r2(lines.reduce((s, l) => s + l.qty * l.price, 0));
  const disc = Math.min(Math.max(Number(discount) || 0, 0), subtotal);
  const total = r2(subtotal - disc);
  const paid = r2(payments.reduce((s, p) => s + (Number(p.amount) || 0), 0));
  const cardCharge = r2(
    payments.filter((p) => p.method === "card").reduce((s, p) => s + (Number(p.amount) || 0) * 0.02, 0)
  );
  const balance = r2(total - paid);

  async function save() {
    setError("");
    if (!patient) {
      setError("Choose the patient.");
      return;
    }
    if (!lines.length) {
      setError("Add at least one service or medicine.");
      return;
    }
    if (paid - total > 0.009) {
      setError("Payments are more than the bill total.");
      return;
    }
    try {
      const result = await createBill.mutateAsync({
        patient_id: patient.id,
        bill_date: billDate,
        discount: disc,
        items: lines.map((l) =>
          l.type === "service"
            ? { type: "service", service_id: l.item_id, qty: l.qty, price: l.price }
            : { type: "medicine", medicine_id: l.item_id, medicine_batch_id: l.batch_id, qty: l.qty, price: l.price }
        ),
        payments: payments
          .filter((p) => Number(p.amount) > 0)
          .map((p) => ({ ...p, amount: Number(p.amount) })),
        total,
        allow_no_payment: true,
      });
      router.push(`/dashboard/invoices/${result.invoice_id}`);
    } catch (err) {
      setError(errorMessage(err, "Unable to create bill."));
    }
  }

  return (
    <section className="w-full space-y-6 text-left">
      <div className="space-y-2">
        <Button variant="ghost" size="sm" className="-ml-2" asChild>
          <Link href="/dashboard/clinic">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Clinic
          </Link>
        </Button>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New clinic bill</h1>
            <p className="text-sm text-muted-foreground">
              Services and medicines from batches. Saved as a normal invoice
              {nextNumber ? ` (${nextNumber})` : ""} — print and collect balance from Invoices.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardContent className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-[1fr_180px]">
              <div className="space-y-1.5">
                <Label>Patient *</Label>
                <PatientPickerField value={patient} onChange={setPatient} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bill_date">Bill date</Label>
                <Input id="bill_date" type="date" value={billDate} onChange={(e) => setBillDate(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1 sm:w-80">
                <button
                  type="button"
                  onClick={() => setKind("service")}
                  className={`flex items-center justify-center gap-2 rounded-md py-1.5 text-sm font-medium ${kind === "service" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                >
                  <Stethoscope className="h-4 w-4" /> Service
                </button>
                <button
                  type="button"
                  onClick={() => setKind("medicine")}
                  className={`flex items-center justify-center gap-2 rounded-md py-1.5 text-sm font-medium ${kind === "medicine" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                >
                  <Pill className="h-4 w-4" /> Medicine
                </button>
              </div>

              <div className="grid grid-cols-2 items-end gap-2 sm:grid-cols-[1.6fr_1.2fr_80px_100px_auto]">
                {kind === "service" ? (
                  <div className="col-span-2 space-y-1 sm:col-span-2">
                    <Label className="text-xs">Service</Label>
                    <Select
                      value={serviceId}
                      onValueChange={(v) => {
                        setServiceId(v);
                        setPrice("");
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={services.length ? "Choose service" : "No services yet"} />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.name} · {money.format(s.cost)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <>
                    <div className="col-span-2 space-y-1 sm:col-span-1">
                      <Label className="text-xs">Medicine</Label>
                      <Select
                        value={medicineId}
                        onValueChange={(v) => {
                          setMedicineId(v);
                          setBatchId("auto");
                          setPrice("");
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={inStock.length ? "Choose medicine" : "Nothing in stock"} />
                        </SelectTrigger>
                        <SelectContent>
                          {inStock.map((m) => (
                            <SelectItem key={m.id} value={String(m.id)}>
                              {m.name} ({m.total_stock})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-1 sm:col-span-1">
                      <Label className="text-xs">Batch</Label>
                      <Select value={batchId} onValueChange={(v) => { setBatchId(v); setPrice(""); }} disabled={!medicineId}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Earliest expiry first</SelectItem>
                          {batches.map((b) => (
                            <SelectItem key={b.id} value={String(b.id)}>
                              {b.batch_no} · {formatExpiry(b.expiry_date)} · {b.quantity}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                <div className="space-y-1">
                  <Label className="text-xs">Qty</Label>
                  <Input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Price</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder={
                      kind === "service"
                        ? String(services.find((s) => String(s.id) === serviceId)?.cost ?? "")
                        : String(selectedBatch?.selling_price || selectedMedicine?.selling_price || "")
                    }
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-1"
                  onClick={addLine}
                  disabled={kind === "service" ? !serviceId : !medicineId}
                >
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>

              {lines.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="w-20 text-right">Qty</TableHead>
                      <TableHead className="w-28 text-right">Price</TableHead>
                      <TableHead className="w-28 text-right">Amount</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((l) => (
                      <TableRow key={l.key}>
                        <TableCell>
                          <p className="font-medium">{l.name}</p>
                          {l.batch_label ? <p className="text-xs text-muted-foreground">{l.batch_label}</p> : null}
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min={1}
                            className="h-8 text-right"
                            value={l.qty}
                            onChange={(e) =>
                              setLines((prev) =>
                                prev.map((x) => (x.key === l.key ? { ...x, qty: Number(e.target.value) || 0 } : x))
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            className="h-8 text-right"
                            value={l.price}
                            onChange={(e) =>
                              setLines((prev) =>
                                prev.map((x) => (x.key === l.key ? { ...x, price: Number(e.target.value) || 0 } : x))
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">{money.format(l.qty * l.price)}</TableCell>
                        <TableCell>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => setLines((prev) => prev.filter((x) => x.key !== l.key))}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground border-border">
                  Add services and medicines to this bill.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-3 p-5 text-sm">
              <Row label="Subtotal" value={money.format(subtotal)} />
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Discount (₹)</span>
                <Input
                  type="number"
                  min={0}
                  className="h-8 w-28 text-right"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between border-t pt-3 border-border">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold">{money.format(total)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-5 text-sm">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-semibold">
                  <CreditCard className="h-4 w-4 text-muted-foreground" /> Payment now
                </h2>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={total <= 0}
                    onClick={() => setPayments([{ method: "cash", amount: total }])}
                  >
                    Paid in full
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    title="Split payment"
                    onClick={() => setPayments((prev) => [...prev, { method: "upi", amount: Math.max(balance, 0) }])}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {payments.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Leave empty to save unpaid and collect later from the invoice.
                </p>
              ) : (
                payments.map((p, i) => (
                  <div key={i} className="grid grid-cols-[1fr_100px_auto] items-center gap-2">
                    <Select
                      value={p.method}
                      onValueChange={(v) =>
                        setPayments((prev) => prev.map((x, j) => (j === i ? { ...x, method: v as ClinicPaymentMethod } : x)))
                      }
                    >
                      <SelectTrigger className="h-8 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {METHODS.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      className="h-8 text-right"
                      value={p.amount}
                      onChange={(e) =>
                        setPayments((prev) => prev.map((x, j) => (j === i ? { ...x, amount: Number(e.target.value) } : x)))
                      }
                    />
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => setPayments((prev) => prev.filter((_, j) => j !== i))}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))
              )}
              {payments.length ? (
                <div className="space-y-1 border-t pt-3 border-border">
                  <Row label="Paid" value={money.format(paid)} />
                  {cardCharge > 0 ? (
                    <Row label="Card charge (collected extra)" value={money.format(cardCharge)} />
                  ) : null}
                  <Row label="Balance" value={money.format(Math.max(balance, 0))} strong />
                </div>
              ) : null}
            </CardContent>
          </Card>

          {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

          <Button className="w-full gap-2" size="lg" onClick={() => void save()} disabled={createBill.isPending}>
            {createBill.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ReceiptText className="h-4 w-4" />}
            Save bill
          </Button>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "font-semibold" : ""}>{value}</span>
    </div>
  );
}
