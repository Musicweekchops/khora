import React from "react"
import { Lock, ShieldCheck } from "lucide-react"

interface BrowserFrameProps {
  children: React.ReactNode
  url?: string
}

export const BrowserFrame: React.FC<BrowserFrameProps> = ({
  children,
  url = "khora.cl/dashboard/videos",
}) => {
  return (
    <div className="w-full max-w-6xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans select-none">
      {/* macOS Titlebar */}
      <div className="h-10 bg-neutral-900 border-b border-neutral-800/80 px-4 flex items-center justify-between">
        {/* Traffic Light Buttons */}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
        </div>

        {/* Address Bar */}
        <div className="flex items-center gap-1.5 px-4 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-300 w-80 justify-center shadow-inner">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span className="text-neutral-400">https://</span>
          <span className="text-white font-semibold">{url}</span>
        </div>

        <div className="w-12" />
      </div>

      {/* Viewport Content */}
      <div className="flex-1 bg-neutral-950 overflow-hidden relative">
        {children}
      </div>
    </div>
  )
}
