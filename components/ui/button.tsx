import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'rose' | 'amber' | 'teal' | 'slate'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const variants = {
      primary: "bg-teal-600 text-white hover:bg-teal-700 shadow-teal-500/20",
      secondary: "bg-slate-900 text-white hover:bg-black shadow-slate-900/10",
      outline: "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50",
      ghost: "text-slate-600 hover:bg-slate-100",
      rose: "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-500/20",
      amber: "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20",
      teal: "bg-teal-600 text-white hover:bg-teal-700 shadow-teal-500/20",
      slate: "bg-slate-100 text-slate-600 hover:bg-slate-200",
    }

    const sizes = {
      sm: "h-9 px-4 rounded-xl text-xs font-bold",
      md: "h-11 px-6 rounded-2xl text-sm font-black",
      lg: "h-14 px-8 rounded-[2rem] text-sm font-black",
      icon: "h-10 w-10 rounded-xl flex items-center justify-center",
    }

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 active:scale-95 disabled:pointer-events-none disabled:opacity-50 shadow-sm",
          variants[variant],
          sizes[size],
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
