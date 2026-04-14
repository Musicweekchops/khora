import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Progress Component - Apple-Inspired Progress Bars
 * 
 * Features:
 * - Animación suave
 * - Múltiples variantes de color
 * - Tamaños configurables
 * - Indicador de porcentaje opcional
 */

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Valor del progreso (0-100) */
  value?: number
  /** Variante de color */
  variant?: "default" | "primary" | "success" | "warning" | "destructive"
  /** Tamaño de la barra */
  size?: "sm" | "md" | "lg"
  /** Mostrar porcentaje */
  showPercentage?: boolean
  /** Label descriptivo */
  label?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    value = 0, 
    variant = "primary",
    size = "md",
    showPercentage = false,
    label,
    ...props 
  }, ref) => {
    const clampedValue = Math.min(100, Math.max(0, value))
    
    const sizeStyles = {
      sm: "h-1.5",
      md: "h-2",
      lg: "h-3",
    }
    
    const variantStyles = {
      default: "bg-neutral-500",
      primary: "bg-primary-500",
      success: "bg-success-500",
      warning: "bg-warning-500",
      destructive: "bg-destructive-500",
    }

    return (
      <div className="w-full">
        {(label || showPercentage) && (
          <div className="flex items-center justify-between mb-2">
            {label && (
              <span className="text-sm font-medium text-neutral-700">
                {label}
              </span>
            )}
            {showPercentage && (
              <span className="text-sm font-medium text-neutral-600">
                {clampedValue}%
              </span>
            )}
          </div>
        )}
        <div
          ref={ref}
          className={cn(
            "relative w-full overflow-hidden rounded-full bg-neutral-200",
            sizeStyles[size],
            className
          )}
          {...props}
        >
          <div
            className={cn(
              "h-full w-full flex-1 transition-all duration-500 ease-out",
              variantStyles[variant]
            )}
            style={{ transform: `translateX(-${100 - clampedValue}%)` }}
          />
        </div>
      </div>
    )
  }
)

Progress.displayName = "Progress"

export { Progress }
