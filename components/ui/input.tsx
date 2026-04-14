import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Input Component - Apple-Inspired Design
 * 
 * Features:
 * - Variantes (default, error, success)
 * - Tamaños (sm, md, lg)
 * - Iconos start/end
 * - Label y error message integrados
 * - Estados focus mejorados
 * - Accesibilidad completa
 */

const inputVariants = cva(
  // Base styles
  "flex w-full rounded-lg border bg-white px-4 py-2 text-base transition-all duration-200 placeholder:text-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
        error: "border-destructive-500 focus:border-destructive-500 focus:ring-2 focus:ring-destructive-500/20",
        success: "border-success-500 focus:border-success-500 focus:ring-2 focus:ring-success-500/20",
      },
      inputSize: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-5 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "md",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /** Label del input */
  label?: string
  /** Mensaje de error */
  error?: string
  /** Mensaje de ayuda */
  helperText?: string
  /** Icono al inicio */
  startIcon?: React.ReactNode
  /** Icono al final */
  endIcon?: React.ReactNode
  /** Si el campo es requerido */
  required?: boolean
  /** Ancho completo */
  fullWidth?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      inputSize,
      label,
      error,
      helperText,
      startIcon,
      endIcon,
      required,
      fullWidth = true,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${React.useId()}`
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`
    
    // Si hay error, usar variante error
    const finalVariant = error ? "error" : variant

    return (
      <div className={cn("space-y-2", fullWidth && "w-full")}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-900"
          >
            {label}
            {required && <span className="text-destructive-500 ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Start Icon */}
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {startIcon}
            </div>
          )}

          {/* Input */}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              inputVariants({ variant: finalVariant, inputSize }),
              startIcon && "pl-10",
              endIcon && "pr-10",
              className
            )}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            {...props}
          />

          {/* End Icon */}
          {endIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {endIcon}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p id={errorId} className="text-sm text-destructive-500 flex items-center gap-1">
            <svg
              className="h-4 w-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {/* Helper Text */}
        {!error && helperText && (
          <p id={helperId} className="text-sm text-neutral-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input, inputVariants }
