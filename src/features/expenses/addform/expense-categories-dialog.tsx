"use client";

import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import {
  useCreateExpenseCategory,
  useExpenseCategories,
  useUpdateExpenseCategory,
} from "../hooks/use-expenses";

export function ExpenseCategoriesDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data: categories = [], isLoading } = useExpenseCategories();
  const createCategory = useCreateExpenseCategory();
  const updateCategory = useUpdateExpenseCategory();

  const [name, setName] = useState("");
  const [error, setError] = useState("");

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    const category_name = name.trim();
    if (!category_name) {
      setError("Enter a category name.");
      return;
    }

    try {
      setError("");
      await createCategory.mutateAsync({ category_name });
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add category.");
    }
  }

  async function toggleActive(id: number, isActive: boolean, categoryName: string) {
    try {
      setError("");
      await updateCategory.mutateAsync({
        id,
        input: { category_name: categoryName, is_active: !isActive },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update category.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Expense categories</DialogTitle>
          <DialogDescription>
            Defaults are created automatically. Add your own without leaving
            the expenses screen.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreate} className="flex gap-2">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="New category name"
          />
          <Button type="submit" disabled={createCategory.isPending}>
            {createCategory.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Add
          </Button>
        </form>

        {error ? (
          <p className="text-sm font-medium text-destructive">{error}</p>
        ) : null}

        {isLoading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading categories...
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{category.category_name}</p>
                  {category.description ? (
                    <p className="text-xs text-muted-foreground">
                      {category.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={category.is_active ? "secondary" : "outline"}>
                    {category.is_active ? "Active" : "Hidden"}
                  </Badge>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      toggleActive(
                        category.id,
                        category.is_active,
                        category.category_name
                      )
                    }
                  >
                    {category.is_active ? "Hide" : "Show"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
