"use client"

import { formatLastSeen } from "@/lib/utils"

interface LastSeenBadgeProps {
  lastSeenAt: string | null | undefined
  /** "sm" = solo el punto, "md" = punto + texto (default), "lg" = con ícono */
  size?: "sm" | "md" | "lg"
}

export default function LastSeenBadge({ lastSeenAt, size = "md" }: LastSeenBadgeProps) {
  const { label, isOnline } = formatLastSeen(lastSeenAt)

  if (size === "sm") {
    return (
      <span
        title={label}
        className={`inline-block w-2.5 h-2.5 rounded-full border-2 border-white ${
          isOnline ? "bg-emerald-400 animate-pulse" : "bg-neutral-300"
        }`}
      />
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`w-2 h-2 rounded-full flex-shrink-0 ${
          isOnline ? "bg-emerald-400 animate-pulse" : "bg-neutral-300"
        }`}
      />
      <span
        className={`text-[11px] font-semibold ${
          isOnline ? "text-emerald-600" : "text-neutral-400"
        }`}
      >
        {label}
      </span>
    </span>
  )
}
