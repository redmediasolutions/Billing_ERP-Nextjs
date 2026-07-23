import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  { variant?: BadgeVariant; asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn("ui-badge", `ui-badge--${variant}`, className)}
      {...props}
    />
  )
}

export { Badge }
