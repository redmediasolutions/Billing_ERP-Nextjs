"use client";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/features/pos/lib/utils";
import "./button.css";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn("btn", `btn-${variant}`, `btn-${size}`, loading && "btn-loading", className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <span className="btn-spinner" aria-hidden />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
