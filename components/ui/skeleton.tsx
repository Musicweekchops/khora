import { cn } from "@/lib/utils"

/**
 * Skeleton Component - Apple-Inspired Loading States
 * 
 * Features:
 * - Animación shimmer suave
 * - Múltiples variantes (text, circle, rectangle)
 * - Customizable
 * - Accesibilidad (aria-busy, aria-live)
 */

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Variante del skeleton */
  variant?: "text" | "circle" | "rectangle"
  /** Ancho personalizado */
  width?: string | number
  /** Alto personalizado */
  height?: string | number
}

function Skeleton({
  className,
  variant = "rectangle",
  width,
  height,
  ...props
}: SkeletonProps) {
  const variantStyles = {
    text: "h-4 w-full rounded",
    circle: "rounded-full",
    rectangle: "rounded-lg",
  }

  const style: React.CSSProperties = {
    ...(width && { width: typeof width === "number" ? `${width}px` : width }),
    ...(height && { height: typeof height === "number" ? `${height}px` : height }),
  }

  return (
    <div
      className={cn(
        "animate-shimmer bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%]",
        variantStyles[variant],
        className
      )}
      style={style}
      role="status"
      aria-busy="true"
      aria-live="polite"
      {...props}
    >
      <span className="sr-only">Cargando...</span>
    </div>
  )
}

/**
 * SkeletonCard - Skeleton pre-configurado para cards
 */
function SkeletonCard() {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="space-y-4">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="rectangle" height={120} />
        <div className="flex gap-2">
          <Skeleton variant="text" width={80} />
          <Skeleton variant="text" width={80} />
        </div>
      </div>
    </div>
  )
}

/**
 * SkeletonAvatar - Skeleton para avatares
 */
function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return <Skeleton variant="circle" width={size} height={size} />
}

/**
 * SkeletonText - Skeleton para texto con múltiples líneas
 */
function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? "70%" : "100%"}
        />
      ))}
    </div>
  )
}

export { Skeleton, SkeletonCard, SkeletonAvatar, SkeletonText }
