"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/context/AuthContext"
import { 
  Plus, 
  Search, 
  Link as LinkIcon, 
  FileText, 
  Video, 
  Music, 
  MoreVertical, 
  Trash2, 
  ExternalLink,
  BookOpen,
  Upload,
  CloudUpload
} from "lucide-react"

interface Content {
  id: string
  title: string
  description: string | null
  type: string
  url: string | null
  category: string
  created_at: string
}

export default function BibliotecaPage() {
  const { profile } = useAuth()
  const [items, setItems] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "link",
    url: "",
    category: "General"
  })

  useEffect(() => {
    if (profile?.role === "TEACHER" && profile.teacherProfileId) {
      loadLibraryTeacher(profile.teacherProfileId)
    } else if (profile?.role === "STUDENT" && profile.studentProfileId) {
      loadLibraryStudent(profile.studentProfileId)
    }
  }, [profile])

  async function loadLibraryTeacher(teacherId: string) {
    setLoading(true)
    const { data, error } = await supabase
      .from("LibraryContent")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false })
    
    if (data) setItems(data)
    setLoading(false)
  }

  async function loadLibraryStudent(studentId: string) {
    setLoading(true)
    
    // 1. Get the student's assigned teacher
    const { data: student } = await supabase
      .from("StudentProfile")
      .select("teacher_id")
      .eq("id", studentId)
      .single()

    // 2. Fetch public content for that teacher
    if (student?.teacher_id) {
      const { data, error } = await supabase
        .from("LibraryContent")
        .select("*")
        .eq("teacher_id", student.teacher_id)
        .eq("is_public", true)
        .order("created_at", { ascending: false })

      if (!error && data) setItems(data)
    }
    
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)

    let finalUrl = form.url.trim() || null
    let filePath = null

    try {
      // Handle File Upload if selected
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const path = `${profile!.teacherProfileId}/${fileName}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('materials')
          .upload(path, file)

        if (uploadError) {
          console.error("Upload error:", uploadError)
          alert("Error al subir el archivo")
          return
        }

        filePath = path
        // Get public URL for display
        const { data: { publicUrl } } = supabase.storage
          .from('materials')
          .getPublicUrl(path)
        finalUrl = publicUrl
      }

      const { error } = await supabase.from("LibraryContent").insert({
        teacher_id: profile!.teacherProfileId!,
        title: form.title.trim(),
        description: form.description.trim() || null,
        type: form.type,
        url: finalUrl,
        file_path: filePath,
        category: form.category
      })

      if (!error) {
        setForm({ title: "", description: "", type: "link", url: "", category: "General" })
        setFile(null)
        setShowForm(false)
        loadLibraryTeacher(profile!.teacherProfileId!)
      } else {
        console.error("Insert error:", error)
        alert("Error al guardar en la base de datos")
      }
    } catch (err) {
      console.error("Unexpected error:", err)
      alert("Ocurrió un error inesperado")
    } finally {
      setSaving(false)
    }
  }

  async function deleteItem(id: string) {
    if (!confirm("¿Segur@ que quieres eliminar este recurso?")) return
    await supabase.from("LibraryContent").delete().eq("id", id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const filteredItems = items.filter(i => 
    i.title.toLowerCase().includes(search.toLowerCase()) || 
    i.category.toLowerCase().includes(search.toLowerCase())
  )

  const typeIcons: Record<string, any> = {
    link: <LinkIcon className="w-4 h-4" />,
    video: <Video className="w-4 h-4" />,
    pdf: <FileText className="w-4 h-4" />,
    image: <BookOpen className="w-4 h-4" />,
    audio: <Music className="w-4 h-4" />
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight">Mi Biblioteca</h1>
          <p className="text-neutral-500 text-sm font-medium mt-1">Materiales y recursos asignados a tus clases.</p>
        </div>
        {profile?.role === "TEACHER" && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="kh-btn-primary flex items-center justify-center gap-2 px-6 py-3 w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Recurso</span>
          </button>
        )}
      </div>

      {/* FORM (Solo para Profesores) */}
      {showForm && profile?.role === "TEACHER" && (
        <form onSubmit={handleSubmit} className="kh-card p-5 md:p-8 bg-white border-neutral-200 animate-in fade-in slide-in-from-top-4 duration-300 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="kh-label pl-1 mb-1.5 block">Título del Recurso *</label>
                <input required value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} className="kh-input" placeholder="Ej: Ejercicios de Independencia" />
              </div>
              <div>
                <label className="kh-label pl-1 mb-1.5 block">Categoría</label>
                <input value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className="kh-input" placeholder="Ej: Técnica, Lectura, Repertorio" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="kh-label pl-1 mb-1.5 block">Tipo</label>
                  <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))} className="kh-input">
                    <option value="link">Enlace / Web</option>
                    <option value="video">Video (YouTube/Vimeo)</option>
                    <option value="pdf">Documento PDF</option>
                    <option value="audio">Audio / MP3</option>
                  </select>
                </div>
                <div>
                  <label className="kh-label pl-1 mb-1.5 block">
                    {['pdf', 'image', 'audio'].includes(form.type) ? "Seleccionar Archivo" : "URL / Link"}
                  </label>
                  {['pdf', 'image', 'audio'].includes(form.type) ? (
                    <div className="relative group">
                      <input 
                        type="file" 
                        onChange={e => setFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        accept={form.type === 'pdf' ? '.pdf' : form.type === 'image' ? 'image/*' : 'audio/*'}
                      />
                      <div className={`kh-input flex items-center justify-between group-hover:border-violet-400 transition-colors ${file ? 'border-emerald-200 bg-emerald-50/30' : ''}`}>
                        <span className="text-[10px] font-medium truncate max-w-[120px]">
                          {file ? file.name : "Subir archivo..."}
                        </span>
                        <CloudUpload className={`w-4 h-4 ${file ? 'text-emerald-500' : 'text-neutral-400'}`} />
                      </div>
                    </div>
                  ) : (
                    <input value={form.url} onChange={e => setForm(p => ({...p, url: e.target.value}))} className="kh-input" placeholder="https://..." />
                  )}
                </div>
              </div>
              <div>
                <label className="kh-label pl-1 mb-1.5 block">Descripción (opcional)</label>
                <input value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} className="kh-input" placeholder="Notas sobre este material..." />
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-neutral-100">
            <button type="button" onClick={() => setShowForm(false)} className="kh-btn-secondary px-6 py-2.5 w-full sm:w-auto">Cancelar</button>
            <button type="submit" disabled={saving} className="kh-btn-primary px-10 py-2.5 w-full sm:w-auto">
              {saving ? "Guardando..." : "✓ Crear Recurso"}
            </button>
          </div>
        </form>
      )}

      {/* SEARCH & FILTERS */}
      <div className="flex items-center gap-4 bg-neutral-100/50 p-2 rounded-2xl border border-neutral-200">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por título o categoría..."
            className="w-full bg-transparent border-0 outline-none pl-11 py-2 text-sm font-medium"
          />
        </div>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="kh-skeleton h-48 rounded-[32px]" />)}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-neutral-200">
          <BookOpen className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
          <p className="text-neutral-400 font-bold italic">No hay recursos que coincidan con la búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="kh-card group p-6 bg-white hover:border-violet-300 transition-all flex flex-col justify-between h-full">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${
                    item.type === 'video' ? 'bg-red-50 text-red-600' :
                    item.type === 'pdf' ? 'bg-amber-50 text-amber-600' :
                    item.type === 'audio' ? 'bg-sky-50 text-sky-600' :
                    'bg-violet-50 text-violet-600'
                  }`}>
                    {typeIcons[item.type] || <LinkIcon className="w-5 h-5" />}
                  </div>
                  <button onClick={() => deleteItem(item.id)} className="text-neutral-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-lg font-black text-neutral-900 leading-tight mb-2">{item.title}</h3>
                <p className="text-sm text-neutral-500 font-medium mb-4 line-clamp-2">{item.description || "Sin descripción."}</p>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-neutral-50">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 bg-neutral-100 px-3 py-1 rounded-full">
                  {item.category}
                </span>
                {item.url && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:underline">
                    Ver recurso <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
