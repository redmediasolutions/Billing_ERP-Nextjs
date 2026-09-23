"use client";

import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dialog as SheetPrimitive } from "radix-ui";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
} from "@/components/ui/sheet";

type ResizableSheetContentProps = React.ComponentProps<
  typeof SheetPrimitive.Content
> & {
  side?: "top" | "right" | "bottom" | "left";
  showCloseButton?: boolean;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  storageKey?: string;
};

export function ResizableSheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  defaultWidth = 520,
  minWidth = 380,
  maxWidth = 920,
  storageKey = "erp-sheet-width",
  ...props
}: ResizableSheetContentProps) {
  const dragging = useRef(false);
  const widthRef = useRef(defaultWidth);
  const [width, setWidth] = useState(defaultWidth);

  useEffect(() => {
    if (side !== "right" && side !== "left") return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = Number(saved);
        if (Number.isFinite(parsed)) {
          const next = Math.min(maxWidth, Math.max(minWidth, parsed));
          widthRef.current = next;
          setWidth(next);
        }
      }
    } catch {
      // ignore
    }
  }, [maxWidth, minWidth, side, storageKey]);

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      if (!dragging.current) return;
      const next =
        side === "right"
          ? Math.min(maxWidth, Math.max(minWidth, window.innerWidth - event.clientX))
          : Math.min(maxWidth, Math.max(minWidth, event.clientX));
      widthRef.current = next;
      setWidth(next);
    },
    [maxWidth, minWidth, side]
  );

  const stopDrag = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    try {
      localStorage.setItem(storageKey, String(widthRef.current));
    } catch {
      // ignore
    }
  }, [storageKey]);

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stopDrag);
    window.addEventListener("pointercancel", stopDrag);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", stopDrag);
      window.removeEventListener("pointercancel", stopDrag);
    };
  }, [onPointerMove, stopDrag]);

  function startDrag(event: React.PointerEvent) {
    event.preventDefault();
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  const resizable = side === "right" || side === "left";

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        style={resizable ? { width, maxWidth: width } : undefined}
        className={cn(
          "fixed z-50 flex flex-col gap-0 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-xl transition duration-200 ease-in-out data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:border-l data-[side=left]:border-r data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-open:animate-in data-open:fade-in-0 data-[side=bottom]:data-open:slide-in-from-bottom-10 data-[side=left]:data-open:slide-in-from-left-10 data-[side=right]:data-open:slide-in-from-right-10 data-[side=top]:data-open:slide-in-from-top-10 data-closed:animate-out data-closed:fade-out-0 data-[side=bottom]:data-closed:slide-out-to-bottom-10 data-[side=left]:data-closed:slide-out-to-left-10 data-[side=right]:data-closed:slide-out-to-right-10 data-[side=top]:data-closed:slide-out-to-top-10",
          resizable && "!max-w-none sm:!max-w-none",
          className
        )}
        {...props}
      >
        {resizable && (
          <div
            className={cn(
              "absolute top-0 z-10 flex h-full w-3 cursor-col-resize items-center justify-center",
              side === "right" ? "left-0" : "right-0"
            )}
            onPointerDown={startDrag}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize panel"
            title="Drag to resize"
          >
            <div className="h-12 w-1 rounded-full bg-border transition-colors hover:bg-primary" />
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>

        {showCloseButton && (
          <SheetPrimitive.Close data-slot="sheet-close" asChild>
            <Button
              variant="ghost"
              className="absolute top-3 right-3 z-20"
              size="icon-sm"
            >
              <XIcon />
              <span className="sr-only">Close</span>
            </Button>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

export {
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
};
