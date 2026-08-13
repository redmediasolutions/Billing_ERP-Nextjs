"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";

export type CreatableOption = {
  value: string | number;
  label: string;
};

type CreatableSelectProps = {
  value: string | number | null;
  options: CreatableOption[];
  onChange: (value: string | number | null) => void;
  onCreate?: (label: string) => Promise<CreatableOption>;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  selectClassName?: string;
  inputClassName?: string;
  emptyLabel?: string;
};

export function CreatableSelect({
  value,
  options,
  onChange,
  onCreate,
  placeholder = "Select...",
  disabled = false,
  loading = false,
  selectClassName = "",
  inputClassName = "",
  emptyLabel = "No options yet",
}: CreatableSelectProps) {
  const [mode, setMode] = useState<"select" | "create">("select");
  const [newLabel, setNewLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    if (value !== null && value !== "") {
      setMode("select");
    }
  }, [value]);

  const selectValue = value === null || value === "" ? "" : String(value);

  async function handleCreate() {
    if (!onCreate) return;

    const label = newLabel.trim();
    if (!label) {
      setCreateError("Enter a name.");
      return;
    }

    const duplicate = options.some(
      (option) => option.label.toLowerCase() === label.toLowerCase()
    );
    if (duplicate) {
      const existing = options.find(
        (option) => option.label.toLowerCase() === label.toLowerCase()
      );
      if (existing) {
        onChange(existing.value);
        setMode("select");
        setNewLabel("");
        setCreateError("");
      }
      return;
    }

    try {
      setCreating(true);
      setCreateError("");
      const created = await onCreate(label);
      onChange(created.value);
      setMode("select");
      setNewLabel("");
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : "Unable to create."
      );
    } finally {
      setCreating(false);
    }
  }

  if (mode === "create" && onCreate) {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            className={inputClassName}
            value={newLabel}
            onChange={(event) => setNewLabel(event.target.value)}
            placeholder="Enter new name"
            autoFocus
            disabled={creating}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleCreate();
              }
            }}
          />
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50"
            onClick={() => void handleCreate()}
            disabled={creating}
          >
            {creating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            Add
          </button>
          <button
            type="button"
            className="rounded-md border border-border px-3 py-2 text-xs text-muted-foreground"
            onClick={() => {
              setMode("select");
              setNewLabel("");
              setCreateError("");
            }}
            disabled={creating}
          >
            Cancel
          </button>
        </div>
        {createError && (
          <p className="text-xs font-medium text-destructive">{createError}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <select
        className={selectClassName}
        value={selectValue}
        disabled={disabled || loading}
        onChange={(event) => {
          const next = event.target.value;
          if (next === "__create__") {
            setMode("create");
            return;
          }
          onChange(next ? next : null);
        }}
      >
        <option value="">
          {loading ? "Loading..." : placeholder}
        </option>

        {options.length === 0 && !loading ? (
          <option value="" disabled>
            {emptyLabel}
          </option>
        ) : null}

        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}

        {onCreate ? (
          <option value="__create__">+ Create new...</option>
        ) : null}
      </select>
    </div>
  );
}

const DEFAULT_PRODUCT_TYPES = [
  "Laptop",
  "Desktop",
  "All-in-One",
  "Monitor",
  "Printer",
  "Accessory",
  "Tablet",
  "Server",
  "Networking",
  "Other",
];

type CreatableComboboxProps = {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  disabled?: boolean;
  inputClassName?: string;
};

export function CreatableCombobox({
  value,
  onChange,
  suggestions,
  placeholder = "Type or select...",
  disabled = false,
  inputClassName = "",
}: CreatableComboboxProps) {
  const listId = useMemo(
    () => `creatable-${Math.random().toString(36).slice(2)}`,
    []
  );

  const mergedSuggestions = useMemo(() => {
    const set = new Set<string>([...DEFAULT_PRODUCT_TYPES, ...suggestions]);
    if (value.trim()) set.add(value.trim());
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [suggestions, value]);

  return (
    <>
      <input
        className={inputClassName}
        list={listId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
      <datalist id={listId}>
        {mergedSuggestions.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>
    </>
  );
}
