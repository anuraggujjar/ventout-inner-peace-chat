
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transform active:scale-95 hover:shadow-lg hover:-translate-y-0.5 active:shadow-inner active:translate-y-0 hover:shadow-2xl active:shadow-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/25 shadow-[0_8px_16px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.2)] active:shadow-[inset_0_4px_8px_rgba(0,0,0,0.3)]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-destructive/25 shadow-[0_8px_16px_rgba(220,38,38,0.15)] hover:shadow-[0_12px_24px_rgba(220,38,38,0.2)] active:shadow-[inset_0_4px_8px_rgba(220,38,38,0.3)]",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary/50 shadow-[0_4px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.15)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-secondary/25 shadow-[0_6px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_20px_rgba(0,0,0,0.15)] active:shadow-[inset_0_3px_6px_rgba(0,0,0,0.2)]",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:shadow-md shadow-[0_2px_4px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_12px_rgba(0,0,0,0.1)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        topic: "bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 text-foreground hover:from-primary/20 hover:to-primary/10 hover:border-primary/40 shadow-[0_6px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-1 active:translate-y-0",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        topic: "h-16 px-6 py-4 text-base",
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
