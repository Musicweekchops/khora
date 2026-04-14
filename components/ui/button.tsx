import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Button Component - Apple-Inspired Design
 * 
 * Features:
 * - Múltiples variantes (default, primary, destructive, outline, ghost)
 * - Tamaños (sm, md, lg)
 * - Estados de loading
 * - Iconos start/end
 * - Accesibilidad completa
 * - Animaciones suaves
 */

const buttonVariants = cva(
  // Base styles (común para todas las variantes)
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        // Primary (Blue - Acción principal)
        default: "bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500 shadow-sm",
        
        // Primary con más énfasis
        primary: "bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500 shadow-md hover:shadow-lg",
        
        // Destructive (Red - Acciones peligrosas)
        destructive: "bg-destructive-500 text-white hover:bg-destructive-600 focus-visible:ring-destructive-500 shadow-sm",
        
        // Outline (Borde, sin relleno)
        outline: "border-2 border-neutral-300 bg-transparent hover:bg-neutral-50 text-neutral-900 focus-visible:ring-neutral-500",
        
        // Secondary (Gris claro)
        secondary: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus-visible:ring-neutral-500",
        
        // Ghost (Transparente, solo hover)
        ghost: "hover:bg-neutral-100 text-neutral-900 focus-visible:ring-neutral-500",
        
        // Link (Como texto, sin fondo)
        link: "text-primary-500 underline-offset-4 hover:underline focus-visible:ring-primary-500",
        
        // Success (Verde)
        success: "bg-success-500 text-white hover:bg-success-600 focus-visible:ring-success-500 shadow-sm",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Estado de loading (muestra spinner) */
  isLoading?: boolean
  /** Icono al inicio */
  startIcon?: React.ReactNode
  /** Icono al final */
  endIcon?: React.ReactNode
  /** Ancho completo */
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading,
      startIcon,
      endIcon,
      fullWidth,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(
          buttonVariants({ variant, size, className }),
          fullWidth && "w-full",
          isLoading && "relative text-transparent hover:text-transparent"
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="animate-spin h-5 w-5 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
        
        {/* Start Icon */}
        {!isLoading && startIcon && (
          <span className="flex-shrink-0">{startIcon}</span>
        )}
        
        {/* Children */}
        {children}
        
        {/* End Icon */}
        {!isLoading && endIcon && (
          <span className="flex-shrink-0">{endIcon}</span>
        )}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
