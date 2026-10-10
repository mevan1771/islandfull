import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // basic button variants without importing class-variance-authority for simplicity
    let variantStyles = ""
    switch(variant) {
      case "default":
        variantStyles = "bg-rose-500 text-white hover:bg-rose-600 shadow-sm"
        break
      case "destructive":
        variantStyles = "bg-red-500 text-slate-50 hover:bg-red-500/90"
        break
      case "outline":
        variantStyles = "border border-zinc-200 bg-transparent hover:bg-zinc-100 text-zinc-900"
        break
      case "secondary":
        variantStyles = "bg-rose-100 text-rose-900 hover:bg-rose-200"
        break
      case "ghost":
        variantStyles = "hover:bg-zinc-100 hover:text-zinc-900 text-zinc-600"
        break
      case "link":
        variantStyles = "text-rose-500 underline-offset-4 hover:underline"
        break
    }
    
    let sizeStyles = ""
    switch(size) {
      case "default":
        sizeStyles = "h-12 px-6 py-2" // Taller for mobile touch targets
        break
      case "sm":
        sizeStyles = "h-9 rounded-md px-3"
        break
      case "lg":
        sizeStyles = "h-14 rounded-xl px-8 text-lg"
        break
      case "icon":
        sizeStyles = "h-10 w-10"
        break
    }

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:pointer-events-none disabled:opacity-50",
          variantStyles,
          sizeStyles,
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
