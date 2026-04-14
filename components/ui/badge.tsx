import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Badge Component - Apple-Inspired Status Indicators
 * 
 * Features:
 * - Múltiples variantes (default, primary, success, warning, destructive, outline)
 * - Tamaños (sm, md, lg)
 * - Iconos opcionales
 * - Dot indicator opcional
 */

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-neutral-100 text-neutral-800 hover:bg-neutral-200",
        primary: "bg-primary-50 text-primary-700 hover:bg-primary-100",
        success: "bg-success-50 text-success-700 hover:bg-success-100",
        warning: "bg-warning-50 text-warning-700 hover:bg-warning-100",
        destructive: "bg-destructive-50 text-destructive-700 hover:bg-destructive-100",
        outline: "border border-neutral-300 text-neutral-700 hover:bg-neutral-50",
        ghost: "text-neutral-600 hover:bg-neutral-100",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-sm",
        lg: "px-3 py-1.5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /** Mostrar dot indicator */
  dot?: boolean
  /** Icono al inicio */
  icon?: React.ReactNode
}

function Badge({ 
  className, 
  variant, 
  size,
  dot,
  icon,
  children,
  ...props 
}: BadgeProps) {
  return (
    <div 
      className={cn(badgeVariants({ variant, size }), className)} 
      {...props}
    >
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
