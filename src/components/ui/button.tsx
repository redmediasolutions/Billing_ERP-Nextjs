import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

type ButtonVariant = "default" | "outline" | "secondary" | "ghost" | "destructive" | "link"
type ButtonSize = "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot.Root : "button"

    return (
      <Comp
        ref={ref}
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={cn(
          "ui-button",
          `ui-button--${variant}`,
          `ui-button--${size}`,
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
