"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface ResizableSplitProps {
  left: ReactNode;
  right: ReactNode;
  defaultRightWidth?: number;
  minRightWidth?: number;
  maxRightWidth?: number;
  storageKey?: string;
}

export function ResizableSplit({
  left,
  right,
  defaultRightWidth = 440,
  minRightWidth = 320,
  maxRightWidth = 760,
  storageKey = "erp-preview-width",
}: ResizableSplitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const widthRef = useRef(defaultRightWidth);

  const [rightWidth, setRightWidth] = useState(defaultRightWidth);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = Number(saved);
        if (Number.isFinite(parsed)) {
          const next = Math.min(maxRightWidth, Math.max(minRightWidth, parsed));
          widthRef.current = next;
          setRightWidth(next);
        }
      }
    } catch {
      // ignore
    }
  }, [maxRightWidth, minRightWidth, storageKey]);

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      if (!dragging.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const next = Math.min(
        maxRightWidth,
        Math.max(minRightWidth, rect.right - event.clientX)
      );
      widthRef.current = next;
      setRightWidth(next);
    },
    [maxRightWidth, minRightWidth]
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

  return (
    <div
      ref={containerRef}
      className="flex w-full flex-col gap-4 lg:flex-row lg:items-start lg:gap-0"
    >
      <div className="min-w-0 flex-1">{left}</div>

      <div
        className="no-print relative z-10 hidden w-3 shrink-0 cursor-col-resize self-stretch lg:flex"
        onPointerDown={startDrag}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize preview panel"
        title="Drag to resize preview"
      >
        <div className="mx-auto h-full w-px bg-border transition-colors hover:bg-primary" />
        <div className="absolute left-1/2 top-1/2 flex h-12 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md border border-border bg-background shadow-sm">
          <div className="flex gap-0.5">
            <span className="h-4 w-0.5 rounded-full bg-muted-foreground/70" />
            <span className="h-4 w-0.5 rounded-full bg-muted-foreground/70" />
          </div>
        </div>
      </div>

      <div
        className="no-print sticky top-16 h-[calc(100vh-4rem)] min-h-[520px] w-full shrink-0 overflow-hidden rounded-xl border border-border bg-background lg:w-auto"
      >
        <div className="h-full w-full lg:hidden">{right}</div>
        <div className="hidden h-full lg:block" style={{ width: rightWidth }}>
          {right}
        </div>
      </div>
    </div>
  );
}
