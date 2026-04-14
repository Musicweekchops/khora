import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Card Component - Apple-Inspired Design
 * 
 * Sistema de Cards compuesto por:
 * - Card: Contenedor principal
 * - CardHeader: Header con título y descripción
 * - CardTitle: Título del card
 * - CardDescription: Descripción/subtítulo
 * - CardContent: Contenido principal
 * - CardFooter: Footer con acciones
 * 
 * Features:
 * - Sombras suaves
 * - Bordes sutiles
 * - Padding consistente
 * - Hover effect opcional
 */

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /** Aplicar efecto hover */
    hoverable?: boolean
  }
>(({ className, hoverable, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border border-neutral-200 bg-white shadow-sm transition-all duration-200",
      hoverable && "hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight text-neutral-900",
      className
    )}
    {...props}
  >
    {children}
  </h3>
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-neutral-500", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
