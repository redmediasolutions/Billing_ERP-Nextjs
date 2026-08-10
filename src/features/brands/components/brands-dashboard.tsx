"use client";

import { useMemo, useState } from "react";
import {
  Edit3,
  Loader2,
  Plus,
  Search,
  Tag,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  useBrands,
  useDeleteBrand,
} from "../hooks/use-brands";
import type { Brand } from "../types/brand.types";
import { BrandForm } from "./brand-form";

export function BrandsDashboard() {
  const { data: brands = [], isLoading, error } = useBrands();
  const deleteBrand = useDeleteBrand();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  const filteredBrands = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return brands;

    return brands.filter((brand) => {
      return [
        brand.name,
        brand.description,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );
    });
  }, [brands, search]);

  function openCreate() {
    setSelectedBrand(null);
    setShowForm(true);
  }

  function openEdit(brand: Brand) {
    setSelectedBrand(brand);
    setShowForm(true);
  }

  async function removeBrand(brand: Brand) {
    const confirmed = window.confirm(
      `Archive "${brand.name}"? Products already linked to this brand will not be deleted.`
    );

    if (!confirmed) return;

    try {
      await deleteBrand.mutateAsync(brand.id);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to archive brand."
      );
    }
  }

  return (
    <section className="w-full space-y-6 text-left">
      {/* Header */}
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Product catalogue
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Brands
          </h1>
          <p className="text-sm text-muted-foreground">
            Create and manage the brands used by your product catalogue.
          </p>
        </div>

        <Button onClick={openCreate} className="gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          Add Brand
        </Button>
      </div>

      {/* KPI Card Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Total Brands
              </p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {brands.length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Tag className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search brands..."
            className="pl-9"
          />
        </div>

        <span className="text-xs font-medium text-muted-foreground">
          {filteredBrands.length} brand{filteredBrands.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Loading brands...</span>
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-start p-6 text-left text-sm font-medium text-destructive">
              Unable to load brands. Please refresh and try again.
            </div>
          ) : filteredBrands.length === 0 ? (
            <div className="flex flex-col items-start justify-center gap-3 py-16 text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Tag className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">
                  No brands found
                </h3>
                <p className="text-xs text-muted-foreground">
                  Create a brand before adding products to your catalogue.
                </p>
              </div>
              <Button onClick={openCreate} className="mt-2 gap-2" size="sm">
                <Plus className="h-4 w-4" />
                Add First Brand
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[280px]">Brand</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredBrands.map((brand) => (
                    <TableRow key={brand.id}>
                      {/* Brand Logo & Name */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {brand.brand_logo ? (
                            <img
                              src={brand.brand_logo}
                              alt={`${brand.name} logo`}
                              className="h-9 w-9 rounded-md object-cover border border-border"
                            />
                          ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                              {brand.name.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <span className="font-medium text-foreground">
                            {brand.name}
                          </span>
                        </div>
                      </TableCell>

                      {/* Description */}
                      <TableCell>
                        <p
                          className="max-w-[300px] truncate text-xs text-muted-foreground"
                          title={brand.description || undefined}
                        >
                          {brand.description || "No description"}
                        </p>
                      </TableCell>

                      {/* Created Date */}
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(brand.created_at).toLocaleDateString("en-IN")}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(brand)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Edit3 className="h-4 w-4" />
                            <span className="sr-only">Edit {brand.name}</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deleteBrand.isPending}
                            onClick={() => removeBrand(brand)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete {brand.name}</span>
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
        <BrandForm
          brand={selectedBrand}
          onClose={() => {
            setShowForm(false);
            setSelectedBrand(null);
          }}
        />
      )}
    </section>
  );
}
