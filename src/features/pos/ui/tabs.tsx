"use client";
import { cn } from "@/features/pos/lib/utils";
import "./tabs.css";

export function Tabs({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; icon?: React.ReactNode }[];
  className?: string;
}) {
  return (
    <div className={cn("tabs", className)} role="tablist">
      {options.map((opt) => (
        <button
          key={opt.value}
          role="tab"
          aria-selected={opt.value === value}
          className={cn("tab-btn", opt.value === value && "tab-btn-active")}
          onClick={() => onChange(opt.value)}
          type="button"
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
