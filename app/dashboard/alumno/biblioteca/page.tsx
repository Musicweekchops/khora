"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/context/AuthContext"
import { BookOpen, Video, FileText, Dumbbell, ExternalLink } from "lucide-react"

interface Content {
  id: string
  title: string
  description: string
  type: "VIDEO" | "PDF" | "EXERCISE"
  url: string
  category: string
  created_at: string
}

export default function BibliotecaPage() {
  const { profile } = useAuth()
  const [contents, setContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.studentProfileId) {
      loadContents()
    }
  }, [profile?.studentProfileId])

  async function loadContents() {
    setLoading(true)
    
    // First get the student's teacher
    const { data: student } = await supabase
      .from("StudentProfile")
      .select("teacher_id")
      .eq("id", profile!.studentProfileId!)
      .single()

    if (student?.teacher_id) {
      const { data, error } = await supabase
        .from("LibraryContent")
        .select("*")
        .eq("teacher_id", student.teacher_id)
        .eq("is_public", true)
        .order("created_at", { ascending: false })

      if (!error && data) setContents(data as Content[])
    }
    
    setLoading(false)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "VIDEO": return <Video className="w-6 h-6 text-rose-500" />
      case "PDF": return <FileText className="w-6 h-6 text-sky-500" />
      case "EXERCISE": return <Dumbbell className="w-6 h-6 text-amber-500" />
      default: return <BookOpen className="w-6 h-6 text-violet-500" />
    }
  }

  const getBg = (type: string) => {
    switch (type) {
      case "VIDEO": return "bg-rose-100"
      case "PDF": return "bg-sky-100"
      case "EXERCISE": return "bg-amber-100"
      default: return "bg-violet-100"
    }
  }

  const categories = Array.from(new Set(contents.map(c => c.category).filter(Boolean)))

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          Mi Biblioteca
        </h1>
        <p className="text-neutral-500 font-medium mt-2">Material de estudio compartido por tu profesor</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white rounded-3xl animate-pulse" />)}
        </div>
      ) : contents.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[40px] border border-neutral-100 shadow-sm">
          <span className="text-5xl mb-4 block opacity-30">📚</span>
          <p className="text-neutral-900 font-bold text-lg">Tu biblioteca está vacía</p>
          <p className="text-neutral-400 text-sm mt-1">Pronto tu profesor compartirá material contigo.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {categories.length > 0 ? (
            categories.map(cat => (
              <div key={cat} className="space-y-4">
                <h2 className="text-xl font-black text-neutral-800 flex items-center gap-2">
                  <span className="w-2 h-6 bg-violet-500 rounded-full" />
                  {cat}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contents.filter(c => c.category === cat).map(content => (
                    <ContentCard key={content.id} content={content} icon={getIcon(content.type)} bg={getBg(content.type)} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contents.map(content => (
                <ContentCard key={content.id} content={content} icon={getIcon(content.type)} bg={getBg(content.type)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ContentCard({ content, icon, bg }: { content: Content, icon: React.ReactNode, bg: string }) {
  return (
    <a 
      href={content.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="bg-white rounded-3xl p-5 border border-neutral-100 shadow-sm hover:shadow-md hover:border-violet-200 transition-all group flex items-start gap-4"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${bg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-lg text-neutral-900 group-hover:text-violet-600 transition-colors truncate">
          {content.title}
        </h3>
        {content.description && (
          <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
            {content.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 bg-neutral-100 px-2 py-1 rounded-md">
            {content.type}
          </span>
        </div>
      </div>
      <ExternalLink className="w-5 h-5 text-neutral-300 group-hover:text-violet-500 shrink-0 transition-colors" />
    </a>
  )
}
