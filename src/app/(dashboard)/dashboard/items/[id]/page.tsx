"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ItemDetailView } from "@/features/inventory/components/item-detail-view";
import { itemsService } from "@/features/items/services/items.service";
import type { Item } from "@/features/items/types";

export default function ItemDetailPage() {
  const params = useParams();
  const itemId = Number(params.id);

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!itemId || Number.isNaN(itemId)) {
      setError("Invalid item ID.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadItem() {
      try {
        setLoading(true);
        setError("");
        const result = await itemsService.getById(itemId);
        if (!cancelled) setItem(result);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load item."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadItem();

    return () => {
      cancelled = true;
    };
  }, [itemId]);

  async function refreshItem() {
    if (!itemId || Number.isNaN(itemId)) return;

    try {
      const result = await itemsService.getById(itemId);
      setItem(result);
    } catch {
      // Keep showing stale item data if refresh fails.
    }
  }

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading item...
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="space-y-4 text-left">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/items">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Items
          </Link>
        </Button>
        <p className="text-sm font-medium text-destructive">
          {error || "Item not found."}
        </p>
      </div>
    );
  }

  return <ItemDetailView item={item} onItemRefresh={() => void refreshItem()} />;
}
