"use client";
import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/features/pos/lib/utils";
import "./input.css";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn("field", className)} {...props} />
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => <textarea ref={ref} className={cn("field", "field-textarea", className)} {...props} />
);
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn("field", "field-select", className)} {...props}>
      {children}
    </select>
  )
);
Select.displayName = "Select";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("field-label", className)} {...props} />;
}

export function FieldGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("field-group", className)} {...props} />;
}
