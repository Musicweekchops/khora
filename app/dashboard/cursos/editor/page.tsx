"use client"

import React, { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/context/AuthContext"
import { useToast } from "@/components/ui/Toast"
import { ArrowLeft, Plus, Save, Trash2, GripVertical, Video, FileText, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"

interface Module {
  id: string
  product_id: string
  title: string
  description: string | null
  sort_order: number
  lessons?: Lesson[]
}

interface Lesson {
  id: string
  module_id: string
  title: string
  description: string | null
  video_url: string
  pdf_url: string | null
  xp_value: number
  sort_order: number
}

function CourseEditorInner() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const productId = searchParams.get("productId")
  const router = useRouter()

  const [productTitle, setProductTitle] = useState("")
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)

  // Module Form
  const [newModuleTitle, setNewModuleTitle] = useState("")
  const [newModuleDesc, setNewModuleDesc] = useState("")
  
  // Lesson Form (attached to a specific module)
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null)
  const [lessonTitle, setLessonTitle] = useState("")
  const [lessonVideo, setLessonVideo] = useState("")
  const [lessonPdf, setLessonPdf] = useState("")
  const [lessonXp, setLessonXp] = useState(50)

  useEffect(() => {
    if (productId && profile) {
      loadCourseData()
    }
  }, [productId, profile])

  async function loadCourseData() {
    try {
      // Fetch Product
      const { data: prodData, error: prodErr } = await supabase
        .from("Product")
        .select("title")
        .eq("id", productId)
        .single()
      
      if (prodErr) throw prodErr
      setProductTitle(prodData.title)

      // Fetch Modules
      const { data: modData, error: modErr } = await supabase
        .from("Module")
        .select("*")
        .eq("product_id", productId)
        .order("sort_order", { ascending: true })
      
      if (modErr) throw modErr

      // Fetch Lessons
      const { data: lessData, error: lessErr } = await supabase
        .from("Lesson")
        .select("*")
        // Note: For now we fetch all lessons and group them manually.
        // In a real app we might want to filter by product_id if lesson has it, 
        // or just fetch lessons whose module_id is in modData.
        
      if (lessErr) throw lessErr

      // Group
      const groupedModules = (modData || []).map(m => ({
        ...m,
        lessons: (lessData || []).filter(l => l.module_id === m.id).sort((a, b) => a.sort_order - b.sort_order)
      }))

      setModules(groupedModules)
    } catch (err: any) {
      toast(`Error al cargar datos: ${err.message}`, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newModuleTitle.trim()) return

    try {
      const { data, error } = await supabase
        .from("Module")
        .insert({
          product_id: productId,
          title: newModuleTitle,
          description: newModuleDesc || null,
          sort_order: modules.length + 1
        })
        .select()
        .single()

      if (error) throw error
      
      setModules([...modules, { ...data, lessons: [] }])
      setNewModuleTitle("")
      setNewModuleDesc("")
      toast("Módulo creado", "success")
    } catch (err: any) {
      toast(err.message, "error")
    }
  }

  const handleDeleteModule = async (id: string) => {
    if(!confirm("¿Eliminar este módulo y todas sus lecciones?")) return
    try {
      const { error } = await supabase.from("Module").delete().eq("id", id)
      if (error) throw error
      setModules(modules.filter(m => m.id !== id))
      toast("Módulo eliminado", "success")
    } catch (err: any) {
      toast(err.message, "error")
    }
  }

  const handleCreateLesson = async (e: React.FormEvent, moduleId: string) => {
    e.preventDefault()
    if (!lessonTitle.trim() || !lessonVideo.trim()) {
      toast("Título y Video son obligatorios", "error")
      return
    }

    const mod = modules.find(m => m.id === moduleId)
    const currentLessonsCount = mod?.lessons?.length || 0

    try {
      const { data, error } = await supabase
        .from("Lesson")
        .insert({
          module_id: moduleId,
          title: lessonTitle,
          video_url: lessonVideo,
          pdf_url: lessonPdf || null,
          xp_value: lessonXp,
          sort_order: currentLessonsCount + 1
        })
        .select()
        .single()

      if (error) throw error

      setModules(modules.map(m => {
        if (m.id === moduleId) {
          return { ...m, lessons: [...(m.lessons || []), data] }
        }
        return m
      }))

      // Reset
      setActiveModuleId(null)
      setLessonTitle("")
      setLessonVideo("")
      setLessonPdf("")
      setLessonXp(50)
      toast("Lección agregada", "success")
    } catch (err: any) {
      toast(err.message, "error")
    }
  }

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    if(!confirm("¿Eliminar lección?")) return
    try {
      const { error } = await supabase.from("Lesson").delete().eq("id", lessonId)
      if (error) throw error
      
      setModules(modules.map(m => {
        if (m.id === moduleId) {
          return { ...m, lessons: (m.lessons || []).filter(l => l.id !== lessonId) }
        }
        return m
      }))
      toast("Lección eliminada", "success")
    } catch (err: any) {
      toast(err.message, "error")
    }
  }

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-8 font-sans pb-20 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/dashboard/cursos")} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">{productTitle}</h1>
          <p className="text-sm text-neutral-500 font-medium">Constructor de Currículum</p>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-6">
        {modules.map((mod, index) => (
          <div key={mod.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
            {/* Module Header */}
            <div className="bg-neutral-50 p-4 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest">
                  Módulo {index + 1}: {mod.title}
                </h3>
                {mod.description && <p className="text-xs text-neutral-500 mt-1">{mod.description}</p>}
              </div>
              <button onClick={() => handleDeleteModule(mod.id)} className="text-neutral-400 hover:text-red-500 p-2">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Lessons */}
            <div className="p-4 space-y-3">
              {(mod.lessons || []).length === 0 ? (
                <p className="text-xs text-neutral-400 font-bold italic text-center py-4">No hay lecciones en este módulo.</p>
              ) : (
                (mod.lessons || []).map((lesson, lIndex) => (
                  <div key={lesson.id} className="flex items-center justify-between p-3 bg-white border border-neutral-100 rounded-xl hover:border-violet-200 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center text-[10px] font-bold">
                        {lIndex + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-neutral-800">{lesson.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-neutral-400 uppercase">
                            <Video className="w-3 h-3" /> Video
                          </span>
                          {lesson.pdf_url && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-neutral-400 uppercase">
                              <FileText className="w-3 h-3" /> PDF
                            </span>
                          )}
                          <span className="text-[10px] font-black text-violet-600 bg-violet-50 px-1.5 rounded uppercase">
                            +{lesson.xp_value} XP
                          </span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteLesson(mod.id, lesson.id)} className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 p-2 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}

              {/* Add Lesson Button / Form */}
              {activeModuleId === mod.id ? (
                <form onSubmit={(e) => handleCreateLesson(e, mod.id)} className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 mt-4 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-neutral-700">Nueva Lección</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      type="text" required placeholder="Título de la lección" 
                      value={lessonTitle} onChange={e => setLessonTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-semibold outline-none focus:border-violet-500"
                    />
                    <input 
                      type="number" required placeholder="XP (Ej: 50)" 
                      value={lessonXp} onChange={e => setLessonXp(parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-semibold outline-none focus:border-violet-500"
                    />
                    <input 
                      type="url" required placeholder="URL de Vimeo (https://vimeo.com/...)" 
                      value={lessonVideo} onChange={e => setLessonVideo(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-semibold outline-none focus:border-violet-500 md:col-span-2"
                    />
                    <input 
                      type="url" placeholder="URL del PDF (Opcional)" 
                      value={lessonPdf} onChange={e => setLessonPdf(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-semibold outline-none focus:border-violet-500 md:col-span-2"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setActiveModuleId(null)} className="px-4 py-2 text-xs font-bold text-neutral-500 hover:bg-neutral-200 rounded-lg">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold rounded-lg hover:bg-violet-600">Guardar Lección</button>
                  </div>
                </form>
              ) : (
                <button 
                  onClick={() => {
                    setActiveModuleId(mod.id)
                    setLessonTitle(""); setLessonVideo(""); setLessonPdf(""); setLessonXp(50);
                  }}
                  className="w-full py-3 mt-2 border-2 border-dashed border-neutral-200 rounded-xl text-xs font-bold text-neutral-500 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-3 h-3" /> Agregar Lección a este módulo
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Create Module Form */}
        <form onSubmit={handleCreateModule} className="bg-white p-6 rounded-2xl border-2 border-dashed border-neutral-200 space-y-4">
          <div>
            <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest flex items-center gap-2">
              <Plus className="w-4 h-4 text-violet-600" /> Nuevo Módulo
            </h3>
            <p className="text-xs text-neutral-500 font-medium mt-1">Un módulo es una agrupación lógica de lecciones (ej: "Conceptos Básicos").</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <input 
              type="text" required placeholder="Título del Módulo" 
              value={newModuleTitle} onChange={e => setNewModuleTitle(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-semibold outline-none focus:border-violet-500"
            />
            <input 
              type="text" placeholder="Descripción breve (Opcional)" 
              value={newModuleDesc} onChange={e => setNewModuleDesc(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-semibold outline-none focus:border-violet-500"
            />
          </div>
          <button type="submit" className="px-6 py-3 bg-neutral-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-violet-600 transition-colors">
            Crear Módulo
          </button>
        </form>

      </div>
    </div>
  )
}

export default function CourseEditorPage() {
  return (
    <Suspense fallback={<div className="p-8">Cargando editor...</div>}>
      <CourseEditorInner />
    </Suspense>
  )
}
