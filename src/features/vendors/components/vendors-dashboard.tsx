"use client";

import { useMemo, useState } from "react";
import {
  Edit3,
  Loader2,
  MapPin,
  Plus,
  Search,
  Trash2,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  useDeleteVendor,
  useVendors,
} from "../hooks/use-vendors";
import type { Vendor } from "../types/vendor.types";
import { VendorForm } from "./vendor-form";

export function VendorsDashboard() {
  const { data: vendors = [], isLoading, error } = useVendors();
  const deleteVendor = useDeleteVendor();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const filteredVendors = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return vendors;

    return vendors.filter((vendor) =>
      [
        vendor.vendor_name,
        vendor.vendor_phone,
        vendor.vendor_email,
        vendor.vendor_address,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      )
    );
  }, [search, vendors]);

  function openCreate() {
    setSelectedVendor(null);
    setShowForm(true);
  }

  function openEdit(vendor: Vendor) {
    setSelectedVendor(vendor);
    setShowForm(true);
  }

  async function removeVendor(vendor: Vendor) {
    const confirmed = window.confirm(
      `Archive "${vendor.vendor_name}"? Existing stock and purchase records will remain available.`
    );

    if (!confirmed) return;

    try {
      await deleteVendor.mutateAsync(vendor.id);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to archive vendor."
      );
    }
  }

  return (
    <section className="w-full space-y-6 text-left">
      {/* Page Header */}
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Purchase management
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Vendors
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your suppliers and local purchase vendors.
          </p>
        </div>

        <Button onClick={openCreate} className="gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Total Vendors
              </p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {vendors.length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Truck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Local Vendors
              </p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {vendors.filter((vendor) => Boolean(vendor.is_local_vendor)).length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <MapPin className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar & Search */}
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search vendors, phone, or email..."
            className="pl-9"
          />
        </div>

        <span className="text-xs font-medium text-muted-foreground">
          {filteredVendors.length} vendor
          {filteredVendors.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Loading vendors...</span>
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-start p-6 text-left text-sm font-medium text-destructive">
              Unable to load vendors. Please refresh and try again.
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="flex flex-col items-start justify-center gap-3 py-16 text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Truck className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">
                  No vendors found
                </h3>
                <p className="text-xs text-muted-foreground">
                  Add vendors before creating purchase and stock records.
                </p>
              </div>
              <Button onClick={openCreate} className="mt-2 gap-2" size="sm">
                <Plus className="h-4 w-4" />
                Add First Vendor
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[280px]">Vendor</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredVendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      {/* Vendor Logo & Name */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {vendor.vendor_logo ? (
                            <img
                              src={vendor.vendor_logo}
                              alt={`${vendor.vendor_name} logo`}
                              className="h-9 w-9 rounded-md object-cover border border-border"
                            />
                          ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                              {vendor.vendor_name.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <span className="font-medium text-foreground">
                            {vendor.vendor_name}
                          </span>
                        </div>
                      </TableCell>

                      {/* Contact Info */}
                      <TableCell>
                        <div className="space-y-0.5 text-xs">
                          <p className="font-medium text-foreground">
                            {vendor.vendor_phone || "—"}
                          </p>
                          <p className="text-muted-foreground">
                            {vendor.vendor_email || "—"}
                          </p>
                        </div>
                      </TableCell>

                      {/* Address */}
                      <TableCell>
                        <p
                          className="max-w-[280px] truncate text-xs text-muted-foreground"
                          title={vendor.vendor_address || undefined}
                        >
                          {vendor.vendor_address || "—"}
                        </p>
                      </TableCell>

                      {/* Vendor Type Badge */}
                      <TableCell>
                        <Badge
                          variant={vendor.is_local_vendor ? "outline" : "secondary"}
                          className={
                            vendor.is_local_vendor
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
                              : ""
                          }
                        >
                          {vendor.is_local_vendor ? "Local" : "External"}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(vendor)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Edit3 className="h-4 w-4" />
                            <span className="sr-only">
                              Edit {vendor.vendor_name}
                            </span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deleteVendor.isPending}
                            onClick={() => removeVendor(vendor)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">
                              Delete {vendor.vendor_name}
                            </span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <VendorForm
          vendor={selectedVendor}
          onClose={() => {
            setShowForm(false);
            setSelectedVendor(null);
          }}
        />
      )}
    </section>
  );
}
