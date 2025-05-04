"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className={cn("h-full w-full", "retro-scrollbar")}> {/* Removed rounded-[inherit], added retro-scrollbar */}
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
       "data-[orientation=vertical]:w-4 data-[orientation=horizontal]:h-4", // Explicit size for retro look
      // The actual retro styling is handled by ::-webkit-scrollbar pseudo-elements in globals.css
      // We remove default shadcn/ui styles for the thumb/track here
      // orientation === "vertical" &&
      //   "h-full w-2.5 border-l border-l-transparent p-[1px]",
      // orientation === "horizontal" &&
      //   "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
     {/* Thumb styling is now primarily via CSS */}
    <ScrollAreaPrimitive.ScrollAreaThumb className={cn(
        "relative flex-1",
        // "rounded-full bg-border" // Removed default shadcn/ui thumb style
        )} />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
