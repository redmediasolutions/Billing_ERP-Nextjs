"use client";

import { useState } from "react";
import {
  Edit3,
  Loader2,
  PackagePlus,
  Plus,
  Search,
  Trash2,
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

import { useDebouncedUrlSearchParam } from "@/lib/use-url-search";
import {
  useDeleteProduct,
  useProducts,
} from "../hooks/use-products";
import type { Product } from "../types/product.types";
import { ProductForm } from "./product-form";

export function ProductsDashboard() {
  const { value: search, setValue: setSearch, query } =
    useDebouncedUrlSearchParam();
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const { data: products = [], isLoading, error } = useProducts(query);
  const deleteProduct = useDeleteProduct();

  function openCreate() {
    setSelectedProduct(null);
    setShowForm(true);
  }

  function openEdit(product: Product) {
    setSelectedProduct(product);
    setShowForm(true);
  }

  async function removeProduct(product: Product) {
    const confirmed = window.confirm(
      `Archive "${product.product_name}"? This cannot be done while available stock exists.`
    );

    if (!confirmed) return;

    try {
      await deleteProduct.mutateAsync(product.id);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to archive product."
      );
    }
  }

  return (
    <section className="w-full space-y-6 text-left">
      {/* Page Header */}
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Product catalogue
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            All Products
          </h1>
          <p className="text-sm text-muted-foreground">
            Create master products before adding individual serialised stock.
          </p>
        </div>

        <Button onClick={openCreate} className="gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          Add Master Product
        </Button>
      </div>

      {/* Toolbar & Search */}
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search product, brand, type, or code..."
            className="pl-9"
          />
        </div>

        <span className="text-xs font-medium text-muted-foreground">
          {products.length} product{products.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Loading products...</span>
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-start p-6 text-left text-sm font-medium text-destructive">
              Unable to load products. Please refresh and try again.
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-start justify-center gap-3 py-16 text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <PackagePlus className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">
                  No products found
                </h3>
                <p className="text-xs text-muted-foreground">
                  Add your first master product before entering serialised stock.
                </p>
              </div>
              <Button onClick={openCreate} className="mt-2 gap-2" size="sm">
                <Plus className="h-4 w-4" />
                Add First Product
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Product</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Available Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      {/* Product Name & Config */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.image ? (
                            <img
                              className="h-10 w-10 rounded-md object-cover border border-border"
                              src={product.image}
                              alt={product.product_name}
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-sm font-bold text-primary">
                              {product.product_name.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                              {product.product_name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {product.product_config || "No configuration"}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-foreground">
                        {product.brand_name || "—"}
                      </TableCell>

                      <TableCell className="text-foreground">
                        {product.product_type || "—"}
                      </TableCell>

                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {product.product_code}
                      </TableCell>

                      <TableCell>
                        <Badge variant="secondary" className="font-medium">
                          {Number(product.available_stock || 0)}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(product)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Edit3 className="h-4 w-4" />
                            <span className="sr-only">
                              Edit {product.product_name}
                            </span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deleteProduct.isPending}
                            onClick={() => removeProduct(product)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">
                              Archive {product.product_name}
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

      {showForm ? (
        <ProductForm
          product={selectedProduct}
          onClose={() => {
            setShowForm(false);
            setSelectedProduct(null);
          }}
        />
      ) : null}
    </section>
  );
}
