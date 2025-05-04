import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "retro-button", // Apply retro style by default
        destructive:
          "retro-button bg-destructive text-destructive-foreground hover:bg-destructive/90", // Keep destructive colors but use retro base
        outline:
          "retro-button border border-input bg-background hover:bg-accent hover:text-accent-foreground", // Retro base with override
        secondary:
          "retro-button bg-secondary text-secondary-foreground hover:bg-secondary/80", // Retro base with override
        ghost: "hover:bg-accent hover:text-accent-foreground", // Ghost might not need full retro treatment
        link: "text-primary underline-offset-4 hover:underline", // Link doesn't need retro treatment
      },
      size: {
        default: "h-auto px-4 py-1", // Adjust default size for retro button style
        sm: "h-auto px-3 py-0.5", // Adjust small size
        lg: "h-auto px-8 py-1.5", // Adjust large size
        icon: "h-7 w-7 retro-button p-0", // Adjust icon size for retro button
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
