"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import ReactPlayer from "react-player"
import confetti from "canvas-confetti"
import { ArrowLeft, CheckCircle2, Download, FileText } from "lucide-react"

// Mock data (replace with Supabase fetch later)
const MOCK_LESSON = {
  id: "l1",
  title: "El Agarre Alemán",
  description: "En esta lección aprenderemos el punto de fulcro exacto para maximizar el rebote sin perder control.",
  video_url: "https://vimeo.com/76979871", // Example public vimeo video
  pdf_url: "/partituras/agarre_aleman.pdf",
  xp_value: 50,
  is_completed: false
}

function LessonPlayerInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // const lessonId = searchParams.get("lessonId")
  // const moduleId = searchParams.get("moduleId")
  
  const [lesson, setLesson] = useState(MOCK_LESSON)
  const [isCompleted, setIsCompleted] = useState(lesson.is_completed)
  const [showCompletionUI, setShowCompletionUI] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  // This would sync to Supabase in a real implementation
  const handleMarkAsCompleted = () => {
    setIsCompleted(true)
    setShowCompletionUI(true)
    
    // Gamification fireworks
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#8b5cf6', '#14b8a6', '#ffffff']
    })

    // Auto-redirect after celebration
    setTimeout(() => {
      router.push("/dashboard/roadmap")
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col relative overflow-hidden">
      
      {/* Top Navigation Bar - Minimalist */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <button 
          onClick={() => router.push("/dashboard/roadmap")}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Roadmap</span>
        </button>
        
        {/* PDF Download Button */}
        {lesson.pdf_url && (
          <a 
            href={lesson.pdf_url}
            download
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full transition-all text-sm font-bold text-white"
          >
            <FileText className="w-4 h-4" />
            <span>Descargar Partitura</span>
            <Download className="w-3 h-3 ml-1 opacity-50" />
          </a>
        )}
      </div>

      {/* Immersive Video Player Container */}
      <div className="flex-1 w-full flex items-center justify-center relative z-10 pt-20 pb-24">
        <div className="w-full max-w-6xl aspect-video bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-900/20 border border-white/5 relative">
          <ReactPlayer 
            url={lesson.video_url}
            width="100%"
            height="100%"
            controls={true}
            playing={isPlaying}
            onEnded={() => setShowCompletionUI(true)}
            config={{
              vimeo: {
                playerOptions: {
                  title: 0,
                  byline: 0,
                  portrait: 0,
                  color: '6366f1' // Indigo accent color
                }
              }
            }}
          />
        </div>
      </div>

      {/* Bottom Action Bar (Gamification Trigger) */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20 flex items-center justify-center bg-gradient-to-t from-black via-black/80 to-transparent">
        <div className="max-w-2xl w-full flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-black">{lesson.title}</h1>
            <p className="text-sm text-neutral-400 mt-1">{lesson.description}</p>
          </div>
          
          <button
            onClick={handleMarkAsCompleted}
            disabled={isCompleted}
            className={`flex-shrink-0 flex items-center gap-2 px-6 py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${
              isCompleted 
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/50 hover:-translate-y-1"
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Completado (+{lesson.xp_value} XP)</span>
              </>
            ) : (
              <>
                <span>Marcar como Completado</span>
                <span className="bg-black/20 px-2 py-1 rounded text-xs ml-2">+{lesson.xp_value} XP</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Celebration Overlay */}
      {showCompletionUI && isCompleted && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-black/60 backdrop-blur-sm inset-0 absolute" />
          <div className="relative z-10 bg-neutral-900 border border-white/10 p-8 rounded-3xl text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black mb-2">¡Nivel Completado!</h2>
            <p className="text-neutral-400 font-medium">Has ganado <span className="text-indigo-400 font-black">{lesson.xp_value} XP</span></p>
            <p className="text-xs text-neutral-600 mt-6 uppercase tracking-widest font-black">Redirigiendo al Roadmap...</p>
          </div>
        </div>
      )}

    </div>
  )
}

export default function LessonPlayerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    }>
      <LessonPlayerInner />
    </Suspense>
  )
}
