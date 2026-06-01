"use client"

import React, { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/context/AuthContext"
import { useToast } from "@/components/ui/Toast"
import { PlayCircle, Settings, Plus, LayoutGrid } from "lucide-react"
import Link from "next/link"

interface Product {
  id: string
  title: string
  description: string | null
  is_active: boolean
  created_at: string
}

export default function MisCursosPage() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const [courses, setCourses] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.teacherProfileId) {
      loadCourses(profile.teacherProfileId)
    }
  }, [profile?.teacherProfileId])

  async function loadCourses(teacherId: string) {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("Product")
        .select("*")
        .eq("teacher_id", teacherId)
        .eq("type", "COURSE")
        .order("created_at", { ascending: false })

      if (error) throw error
      setCourses(data || [])
    } catch (err: any) {
      toast(`Error al cargar cursos: ${err.message}`, "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 font-sans pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <LayoutGrid className="w-8 h-8 text-violet-600" />
            Mis Cursos (Creator Studio)
          </h1>
          <p className="text-neutral-500 font-medium mt-1">
            Diseña el currículum, agrupa lecciones en módulos y define el XP de cada video para el Roadmap.
          </p>
        </div>
        <Link
          href="/dashboard/productos"
          className="px-5 py-3 bg-neutral-900 hover:bg-violet-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Nuevo Curso</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-full md:w-1/3 bg-white rounded-3xl border border-neutral-100 p-6 animate-pulse h-48" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-neutral-200">
          <PlayCircle className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-black text-neutral-900">No tienes cursos creados</h3>
          <p className="text-sm text-neutral-500 font-medium mt-2 max-w-sm mx-auto">
            Ve a la pestaña de "Productos" para crear un producto de tipo Curso, y luego vuelve aquí para estructurar sus módulos.
          </p>
          <Link href="/dashboard/productos" className="inline-block mt-6 px-6 py-3 bg-violet-50 text-violet-600 font-bold text-sm rounded-xl hover:bg-violet-100 transition-colors">
            Ir a Productos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="bg-white rounded-[32px] border border-neutral-100 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-violet-500" />
              
              <div className="flex items-start justify-between mb-4 mt-2">
                <div className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                  course.is_active ? "bg-emerald-50 text-emerald-600" : "bg-neutral-100 text-neutral-500"
                }`}>
                  {course.is_active ? "Activo" : "Inactivo"}
                </div>
              </div>
              
              <h3 className="text-xl font-black text-neutral-900 mb-2 truncate">{course.title}</h3>
              <p className="text-xs text-neutral-500 font-medium line-clamp-2 h-8 mb-6">
                {course.description || "Sin descripción"}
              </p>
              
              <Link 
                href={`/dashboard/cursos/editor?productId=${course.id}`}
                className="w-full py-3 bg-neutral-50 hover:bg-violet-50 text-neutral-700 hover:text-violet-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-transparent hover:border-violet-200"
              >
                <Settings className="w-4 h-4" />
                <span>Editar Currículum</span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
