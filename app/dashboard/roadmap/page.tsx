"use client"

import React, { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/context/AuthContext"
import { Flame, Trophy, Lock, PlayCircle, CheckCircle2 } from "lucide-react"

// Types based on the 033 Migration
interface Module {
  id: string
  title: string
  description: string
  sort_order: number
  lessons: Lesson[]
}

interface Lesson {
  id: string
  module_id: string
  title: string
  video_url: string
  pdf_url: string | null
  xp_value: number
  sort_order: number
  is_completed: boolean
}

interface StudentStats {
  total_xp: number
  current_streak: number
  tier: "S" | "A" | "B" | "C" | "D" | "UNRANKED"
}

const TIER_COLORS = {
  S: "from-yellow-400 to-amber-600 shadow-yellow-500/50",
  A: "from-red-400 to-red-600 shadow-red-500/50",
  B: "from-purple-400 to-purple-600 shadow-purple-500/50",
  C: "from-blue-400 to-blue-600 shadow-blue-500/50",
  D: "from-neutral-400 to-neutral-600 shadow-neutral-500/50",
  UNRANKED: "from-neutral-700 to-neutral-900",
}

export default function RoadmapPage() {
  const { profile } = useAuth()
  const [modules, setModules] = useState<Module[]>([])
  const [stats, setStats] = useState<StudentStats>({
    total_xp: 0,
    current_streak: 0,
    tier: "UNRANKED",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) {
      // Temporary mock data until DB is fully seeded
      setStats({
        total_xp: 1250,
        current_streak: 3,
        tier: "B",
      })

      setModules([
        {
          id: "m1",
          title: "Módulo 1: Grip & Strokes Fundamentales",
          description: "Domina el agarre y los golpes básicos para construir una técnica sólida.",
          sort_order: 1,
          lessons: [
            { id: "l1", module_id: "m1", title: "El Agarre Alemán", video_url: "", pdf_url: null, xp_value: 50, sort_order: 1, is_completed: true },
            { id: "l2", module_id: "m1", title: "Full Stroke vs Down Stroke", video_url: "", pdf_url: null, xp_value: 50, sort_order: 2, is_completed: true },
            { id: "l3", module_id: "m1", title: "Up Stroke y Tap", video_url: "", pdf_url: null, xp_value: 50, sort_order: 3, is_completed: false },
          ]
        },
        {
          id: "m2",
          title: "Módulo 2: Independencia de 4 Vías",
          description: "Desarrolla coordinación entre manos y pies con patrones lineales.",
          sort_order: 2,
          lessons: [
            { id: "l4", module_id: "m2", title: "Patrones Lineales Básicos", video_url: "", pdf_url: null, xp_value: 100, sort_order: 1, is_completed: false },
            { id: "l5", module_id: "m2", title: "Coordinación Cruzada", video_url: "", pdf_url: null, xp_value: 100, sort_order: 2, is_completed: false },
          ]
        }
      ])
      setLoading(false)
    }
  }, [profile])

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent text-neutral-800 p-6 sm:p-10 font-sans selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* GAMIFICATION HEADER */}
        <div className="flex flex-col sm:flex-row gap-6 items-center justify-between bg-white p-6 sm:p-8 rounded-[32px] border border-neutral-200/80 shadow-sm">
          <div className="flex items-center gap-6">
            {/* TIER BADGE */}
            <div className={`relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${TIER_COLORS[stats.tier]}`}>
              <div className="absolute inset-0 bg-black/20 rounded-2xl" />
              <span className={`relative z-10 text-4xl font-black drop-shadow-md ${stats.tier === 'S' ? 'text-amber-950' : 'text-white'}`}>{stats.tier}</span>
              <div className="absolute -bottom-2.5 bg-neutral-100 border border-neutral-200 px-3 py-1 rounded-full text-neutral-600 text-[10px] font-black uppercase tracking-wider">
                Tier
              </div>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Tu Progreso</h1>
              <p className="text-neutral-500 text-sm font-medium mt-1">Siguiente Tier: A (a los 2000 XP)</p>
            </div>
          </div>

          <div className="flex gap-4 w-full sm:w-auto">
            <div className="flex-1 sm:flex-none bg-neutral-50 border border-neutral-200 p-4 rounded-2xl flex flex-col items-center justify-center gap-1">
              <Trophy className="w-5 h-5 text-indigo-400" />
              <span className="text-xl font-black">{stats.total_xp}</span>
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">XP Total</span>
            </div>
            <div className="flex-1 sm:flex-none bg-neutral-50 border border-neutral-200 p-4 rounded-2xl flex flex-col items-center justify-center gap-1">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-xl font-black">{stats.current_streak}</span>
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Racha Semanal</span>
            </div>
          </div>
        </div>

        {/* ROADMAP / SKILL TREE */}
        <div className="space-y-12 relative">
          {/* Vertical connecting line */}
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-neutral-200 hidden sm:block" />

          {modules.map((module, mIdx) => (
            <div key={module.id} className="relative z-10">
              <div className="flex flex-col sm:flex-row gap-6">
                
                {/* Module Number Indicator */}
                <div className="hidden sm:flex flex-shrink-0 w-12 h-12 bg-white border-2 border-neutral-200 rounded-full items-center justify-center text-neutral-500 font-black text-lg">
                  {mIdx + 1}
                </div>

                <div className="flex-1 space-y-6">
                  {/* Module Header */}
                  <div>
                    <h2 className="text-xl font-black text-neutral-900">{module.title}</h2>
                    <p className="text-sm text-neutral-500 mt-1">{module.description}</p>
                  </div>

                  {/* Lessons Grid */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {module.lessons.map((lesson) => (
                      <a
                        key={lesson.id}
                        href={`/dashboard/leccion?moduleId=${module.id}&lessonId=${lesson.id}`}
                        className={`group relative overflow-hidden flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                          lesson.is_completed 
                            ? "bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20" 
                            : "bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/55 shadow-sm"
                        }`}
                      >
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        
                        <div className="flex items-center gap-4 relative z-10">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                            lesson.is_completed ? "bg-indigo-500 text-neutral-900" : "bg-neutral-100 text-neutral-400"
                          }`}>
                            {lesson.is_completed ? <CheckCircle2 className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                          </div>
                          <div>
                            <h3 className={`text-sm font-bold ${lesson.is_completed ? "text-indigo-900" : "text-neutral-700"}`}>
                              {lesson.title}
                            </h3>
                            <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500 mt-0.5">
                              +{lesson.xp_value} XP
                            </p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
