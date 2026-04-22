"use client"

import React from "react"

interface VideoPlayerProps {
  url: string
  title?: string
}

export default function VideoPlayer({ url, title }: VideoPlayerProps) {
  // Helper to extract video ID and provider
  const getEmbedInfo = (url: string) => {
    if (!url) return null

    // YouTube
    const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/)
    if (ytMatch) {
      const id = ytMatch[1].split('&')[0]
      return { provider: 'youtube', id }
    }

    // Vimeo
    const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(.+)/)
    if (vimeoMatch) {
      const id = vimeoMatch[1].split('?')[0]
      return { provider: 'vimeo', id }
    }

    return null
  }

  const embedInfo = getEmbedInfo(url)

  if (!embedInfo) {
    return (
      <div className="bg-neutral-100 rounded-3xl p-8 text-center border-2 border-dashed border-neutral-200">
        <p className="text-neutral-500 font-medium">No se reconoce el formato de video para este enlace.</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-violet-600 font-bold hover:underline mt-2 inline-block">
          Abrir en otra pestaña
        </a>
      </div>
    )
  }

  if (embedInfo.provider === 'youtube') {
    return (
      <div className="relative w-full aspect-video rounded-[32px] overflow-hidden bg-black shadow-xl">
        <iframe
          src={`https://www.youtube.com/embed/${embedInfo.id}`}
          title={title || "YouTube video player"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    )
  }

  if (embedInfo.provider === 'vimeo') {
    return (
      <div className="relative w-full aspect-video rounded-[32px] overflow-hidden bg-black shadow-xl">
        <iframe
          src={`https://player.vimeo.com/video/${embedInfo.id}`}
          title={title || "Vimeo video player"}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    )
  }

  return null
}
