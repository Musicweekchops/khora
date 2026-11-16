import React from "react"
import { spring, useCurrentFrame, useVideoConfig } from "remotion"

interface CursorProps {
  x: number
  y: number
  clickFrame?: number
}

export const Cursor: React.FC<CursorProps> = ({ x, y, clickFrame }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const isClicking = clickFrame !== undefined && frame >= clickFrame && frame <= clickFrame + 10

  const clickScale = clickFrame !== undefined
    ? spring({
        frame: frame - clickFrame,
        fps,
        config: { damping: 10, stiffness: 200 },
        from: 1,
        to: isClicking ? 0.8 : 1,
      })
    : 1

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `scale(${clickScale})`,
        zIndex: 100,
        pointerEvents: "none",
        transition: "transform 0.1s ease-out",
      }}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.5))" }}
      >
        <path
          d="M3 3L10.5 21L13.5 13.5L21 10.5L3 3Z"
          fill="#8b5cf6"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      {isClicking && (
        <div
          style={{
            position: "absolute",
            top: -4,
            left: -4,
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "2px solid #8b5cf6",
            animation: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
          }}
        />
      )}
    </div>
  )
}
