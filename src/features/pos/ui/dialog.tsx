"use client";
import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/features/pos/lib/utils";
import "./dialog.css";

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  width = 520,
  mobileSheet = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  width?: number;
  mobileSheet?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={cn("dialog-overlay", mobileSheet && "dialog-overlay-sheet")} onMouseDown={onClose}>
      <div
        className={cn("dialog-panel", mobileSheet && "dialog-panel-sheet")}
        style={{ maxWidth: width }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="dialog-header">
          <div>
            <h3 className="dialog-title">{title}</h3>
            {description && <p className="dialog-desc">{description}</p>}
          </div>
          <button className="dialog-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="dialog-body">{children}</div>
      </div>
    </div>
  );
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("dialog-footer", className)} {...props} />;
}
