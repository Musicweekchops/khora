import React from "react"
import { Composition } from "remotion"
import { KhoraPromo } from "./KhoraPromo"
import "../app/globals.css"

export const RemotionRoot: React.FC = () => {
  const TOTAL_FRAMES = 645 // 21.5 segundos a 30 fps

  return (
    <>
      {/* Formato Horizontal 16:9 (YouTube, Sitio Web, Computador) */}
      <Composition
        id="KhoraPromoLandscape"
        component={KhoraPromo}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Formato Vertical 9:16 (Instagram Reels, TikTok, YouTube Shorts) */}
      <Composition
        id="KhoraPromoVertical"
        component={KhoraPromo}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  )
}
