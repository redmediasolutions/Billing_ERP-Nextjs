"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  DASHBOARD_MODULE_GROUPS,
  DASHBOARD_MODULE_OPTIONS,
  DEFAULT_DASHBOARD_MODULES,
} from "../lib/dashboard-modules";
import type { DashboardModuleId } from "../types";

export function DashboardCustomizeDialog({
  open,
  modules,
  onClose,
  onSave,
  onReset,
}: {
  open: boolean;
  modules: DashboardModuleId[];
  onClose: () => void;
  onSave: (modules: DashboardModuleId[]) => void;
  onReset: () => void;
}) {
  const [draft, setDraft] = useState<Set<DashboardModuleId>>(
    () => new Set(modules)
  );

  useEffect(() => {
    if (!open) return;
    setDraft(new Set(modules));
  }, [open, modules]);

  function toggle(id: DashboardModuleId) {
    setDraft((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        if (next.size <= 1) return current;
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selectAll() {
    setDraft(new Set(DEFAULT_DASHBOARD_MODULES));
  }

  function handleSave() {
    onSave([...draft]);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            Customize dashboard
          </DialogTitle>
          <DialogDescription>
            Choose which modules appear on your home dashboard. Your choices are
            saved for this account on this device.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {DASHBOARD_MODULE_GROUPS.map((group) => {
            const items = DASHBOARD_MODULE_OPTIONS.filter(
              (item) => item.group === group
            );
            if (!items.length) return null;

            return (
              <div key={group}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group}
                </p>
                <ul className="space-y-2">
                  {items.map((item) => {
                    const checked = draft.has(item.id);
                    return (
                      <li key={item.id}>
                        <label
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                            checked
                              ? "border-primary/40 bg-primary/5"
                              : "border-border hover:bg-muted/40"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggle(item.id)}
                            className="mt-1 h-4 w-4 accent-primary"
                          />
                          <span className="min-w-0">
                            <span className="block text-sm font-medium">
                              {item.label}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {item.description}
                            </span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="justify-start px-0 sm:px-3"
            onClick={() => {
              onReset();
              onClose();
            }}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to default
          </Button>
          <div className="flex w-full gap-2 sm:w-auto">
            <Button type="button" variant="outline" onClick={selectAll}>
              Select all
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave}>
              Save layout
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
