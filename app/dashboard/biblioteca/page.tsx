"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/context/AuthContext"
import { 
  Plus, 
  Search, 
  Link as LinkIcon, 
  FileText, 
  Video, 
  Music, 
  Trash2, 
  BookOpen, 
  Play, 
  X, 
  ChevronRight, 
  Sparkles, 
  Clock, 
  FolderPlus,
  Compass,
  ArrowLeft,
  Tv
} from "lucide-react"

// --- TYPES & INTERFACES ---
interface Playlist {
  id: string
  title: string
  description: string | null
  created_at: string
}

interface Content {
  id: string
  title: string
  description: string | null
  type: string
  url: string | null
  category: string
  playlist_id: string | null
  order_index: number
  created_at: string
}

interface Taxonomy {
  lastAssigned: string
  technical: string
  repertoire: string
  coordination: string
  general: string
}

// --- DYNAMIC TAXONOMY DEFINITION ---
function getInstrumentTaxonomy(instrument: string | null | undefined): Taxonomy {
  const norm = (instrument || "").toLowerCase();
  
  if (norm.includes("bater")) {
    return {
      lastAssigned: "Último Material Asignado",
      technical: "Técnica y Rudimentos",
      repertoire: "Canciones y Repertorio",
      coordination: "Coordinación y Ritmo",
      general: "Material de Estudio"
    };
  }
  
  if (norm.includes("guitar") || norm.includes("bajo")) {
    return {
      lastAssigned: "Último Material Asignado",
      technical: "Técnica, Escalas y Acordes",
      repertoire: "Canciones y Repertorio",
      coordination: "Rítmica y Solos",
      general: "Material de Estudio"
    };
  }
  
  if (norm.includes("piano") || norm.includes("teclado")) {
    return {
      lastAssigned: "Último Material Asignado",
      technical: "Técnica, Escalas y Arpegios",
      repertoire: "Obras y Repertorio",
      coordination: "Lectura e Independencia",
      general: "Material de Estudio"
    };
  }
  
  if (norm.includes("cant") || norm.includes("voz")) {
    return {
      lastAssigned: "Último Material Asignado",
      technical: "Vocalización y Técnica",
      repertoire: "Canciones y Repertorio",
      coordination: "Interpretación y Estilo",
      general: "Material de Estudio"
    };
  }

  if (norm.includes("produc")) {
    return {
      lastAssigned: "Último Material Asignado",
      technical: "Síntesis y Grabación",
      repertoire: "Proyectos y Mezcla",
      coordination: "Teoría y Edición",
      general: "Material de Estudio"
    };
  }

  return {
    lastAssigned: "Último Material Asignado",
    technical: "Técnica y Ejercicios",
    repertoire: "Repertorio y Piezas",
    coordination: "Lectura y Teoría",
    general: "Material de Estudio"
  };
}

// --- FUZZY MATCHING TO STANDARD SLOTS ---
function mapToStandardSlot(teacherInput: string | null): "technical" | "repertoire" | "coordination" | "general" {
  if (!teacherInput) return "general";
  
  const normalized = teacherInput.toLowerCase().trim();
  
  if (
    normalized.includes("rudiment") || 
    normalized.includes("tecnica") || 
    normalized.includes("técnica") || 
    normalized.includes("warm") || 
    normalized.includes("calentamiento") ||
    normalized.includes("ejercicio") ||
    normalized.includes("escala") ||
    normalized.includes("acorde") ||
    normalized.includes("arpegio") ||
    normalized.includes("vocaliz")
  ) {
    return "technical";
  }
  
  if (
    normalized.includes("cancion") || 
    normalized.includes("canción") || 
    normalized.includes("repertorio") || 
    normalized.includes("song") || 
    normalized.includes("tema") ||
    normalized.includes("obra") ||
    normalized.includes("pieza") ||
    normalized.includes("partitura")
  ) {
    return "repertoire";
  }
  
  if (
    normalized.includes("coordinac") || 
    normalized.includes("ritmo") || 
    normalized.includes("groove") || 
    normalized.includes("independencia") || 
    normalized.includes("beat") ||
    normalized.includes("solo") ||
    normalized.includes("lectura") ||
    normalized.includes("teoria") ||
    normalized.includes("teoría") ||
    normalized.includes("estilo")
  ) {
    return "coordination";
  }
  
  return "general";
}

// --- HELPER TO GET YOUTUBE ID ---
function getYouTubeId(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([^?&\s]+)/);
  return match ? match[1] : null;
}

export default function BibliotecaPage() {
  const { profile } = useAuth()
  const [items, setItems] = useState<Content[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [instrumento, setInstrumento] = useState<string | null>(null)
  
  // UI & Details states
  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState<"item" | "playlist">("item")
  const [activePlaylist, setActivePlaylist] = useState<string | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<Content | null>(null)
  
  // Form submission states
  const [saving, setSaving] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "link",
    url: "",
    category: "General",
    playlist_id: ""
  })

  const [playlistForm, setPlaylistForm] = useState({
    title: "",
    description: ""
  })

  useEffect(() => {
    if (profile?.role === "TEACHER" && profile.teacherProfileId) {
      setInstrumento(profile.instrumento ?? null)
      loadLibraryTeacher(profile.teacherProfileId)
    } else if (profile?.role === "STUDENT" && profile.studentProfileId) {
      loadLibraryStudent(profile.studentProfileId)
    }
  }, [profile])

  async function loadLibraryTeacher(teacherId: string) {
    setLoading(true)
    const [resItems, resPlaylists] = await Promise.all([
      supabase.from("LibraryContent").select("*").eq("teacher_id", teacherId).order("order_index", { ascending: true }).order("created_at", { ascending: false }),
      supabase.from("LibraryPlaylist").select("*").eq("teacher_id", teacherId).order("created_at", { ascending: false })
    ])
    
    if (resItems.data) setItems(resItems.data)
    if (resPlaylists.data) setPlaylists(resPlaylists.data)
    setLoading(false)
  }

  async function loadLibraryStudent(studentId: string) {
    setLoading(true)
    const { data: student } = await supabase
      .from("StudentProfile")
      .select("teacher_id, TeacherProfile ( instrumento )")
      .eq("id", studentId)
      .maybeSingle()

    if (student?.teacher_id) {
      const tProfile = Array.isArray(student.TeacherProfile) 
        ? student.TeacherProfile[0] 
        : student.TeacherProfile;
        
      setInstrumento(tProfile?.instrumento ?? null)

      // Get accesses via SLA, Tasks, Notes
      const [slaRes, taskRes, noteRes] = await Promise.all([
        supabase.from("StudentLibraryAccess").select("content_id, playlist_id").eq("student_id", studentId),
        supabase.from("Task").select("content_id, playlist_id").eq("student_id", studentId),
        supabase.from("ClassNote").select("content_id, playlist_id, Class!inner(student_id)").eq("Class.student_id", studentId)
      ])

      const allowedPlaylistIds = new Set<string>()
      const allowedContentIds = new Set<string>()

      const collectIds = (items: any[]) => {
        items.forEach(item => {
          if (item.playlist_id) allowedPlaylistIds.add(item.playlist_id)
          if (item.content_id) allowedContentIds.add(item.content_id)
        })
      }

      if (slaRes.data) collectIds(slaRes.data)
      if (taskRes.data) collectIds(taskRes.data)
      if (noteRes.data) collectIds(noteRes.data)

      const playlistIdsArr = Array.from(allowedPlaylistIds)
      const contentIdsArr = Array.from(allowedContentIds)

      // Load allowed playlists
      if (playlistIdsArr.length > 0) {
        const { data: pl } = await supabase.from("LibraryPlaylist").select("*").eq("teacher_id", student.teacher_id).in("id", playlistIdsArr).order("created_at", { ascending: false })
        if (pl) setPlaylists(pl)
      } else {
        setPlaylists([])
      }

      // Load allowed content
      const filterConditions = []
      if (contentIdsArr.length > 0) filterConditions.push(`id.in.(${contentIdsArr.join(',')})`)
      if (playlistIdsArr.length > 0) filterConditions.push(`playlist_id.in.(${playlistIdsArr.join(',')})`)

      if (filterConditions.length > 0) {
        const { data: it } = await supabase
          .from("LibraryContent")
          .select("*")
          .eq("teacher_id", student.teacher_id)
          .or(filterConditions.join(','))
          .order("order_index", { ascending: true })
          .order("created_at", { ascending: false })
        if (it) setItems(it)
      } else {
        setItems([])
      }
    }
    
    setLoading(false)
  }

  async function handleCreatePlaylist(e: React.FormEvent) {
    e.preventDefault()
    if (!playlistForm.title.trim()) return
    setSaving(true)

    try {
      const { error } = await supabase.from("LibraryPlaylist").insert({
        teacher_id: profile!.teacherProfileId!,
        title: playlistForm.title.trim(),
        description: playlistForm.description.trim() || null
      })

      if (!error) {
        setPlaylistForm({ title: "", description: "" })
        setShowForm(false)
        loadLibraryTeacher(profile!.teacherProfileId!)
      } else {
        alert("Error al crear la serie.")
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleCreateItem(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)

    let finalUrl = form.url.trim() || null
    let filePath = null

    try {
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const path = `${profile!.teacherProfileId}/${fileName}`

        const { error: uploadError } = await supabase.storage.from('materials').upload(path, file)
        if (uploadError) throw uploadError

        filePath = path
        const { data: { publicUrl } } = supabase.storage.from('materials').getPublicUrl(path)
        finalUrl = publicUrl
      }

      const { error } = await supabase.from("LibraryContent").insert({
        teacher_id: profile!.teacherProfileId!,
        title: form.title.trim(),
        description: form.description.trim() || null,
        type: form.type,
        url: finalUrl,
        file_path: filePath,
        category: form.category,
        playlist_id: form.playlist_id || null,
        order_index: items.length
      })

      if (!error) {
        setForm({ title: "", description: "", type: "link", url: "", category: "General", playlist_id: "" })
        setFile(null)
        setShowForm(false)
        loadLibraryTeacher(profile!.teacherProfileId!)
      } else {
        alert("Error al guardar el recurso.")
      }
    } catch (err) {
      alert("Error al subir el archivo o recurso.")
    } finally {
      setSaving(false)
    }
  }

  async function deleteItem(id: string) {
    if (!confirm("¿Seguro que quieres eliminar este recurso?")) return
    await supabase.from("LibraryContent").delete().eq("id", id)
    setItems(prev => prev.filter(i => i.id !== id))
    if (selectedMaterial?.id === id) setSelectedMaterial(null)
  }

  async function deletePlaylist(id: string) {
    if (!confirm("¿Seguro que quieres eliminar esta Serie?")) return
    await supabase.from("LibraryPlaylist").delete().eq("id", id)
    setPlaylists(prev => prev.filter(i => i.id !== id))
    setActivePlaylist(null)
  }

  // --- RENDER CARD COVER fallback/image ---
  function renderCardCover(item: Content) {
    const ytId = getYouTubeId(item.url)
    if (ytId) {
      return (
        <img 
          src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} 
          alt={item.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      )
    }

    if (item.type === "image" && item.url) {
      return (
        <img 
          src={item.url} 
          alt={item.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      )
    }

    // Modern styled CSS gradients fallbacks
    const instNorm = (instrumento || "").toLowerCase()
    let gradient = "from-neutral-800 to-[#121217]"
    let symbol = "📄"

    if (instNorm.includes("bater")) {
      gradient = "from-[#4f46e5]/40 to-[#0e0e12]"
      symbol = item.type === "audio" ? "🎵" : item.type === "pdf" ? "📄" : "🥁"
    } else if (instNorm.includes("guitar") || instNorm.includes("bajo")) {
      gradient = "from-[#ef4444]/30 to-[#0e0e12]"
      symbol = item.type === "audio" ? "🎵" : item.type === "pdf" ? "📄" : "🎸"
    } else if (instNorm.includes("piano") || instNorm.includes("teclado")) {
      gradient = "from-[#0d9488]/30 to-[#0e0e12]"
      symbol = item.type === "audio" ? "🎵" : item.type === "pdf" ? "📄" : "🎹"
    } else if (instNorm.includes("cant") || instNorm.includes("voz")) {
      gradient = "from-[#ec4899]/30 to-[#0e0e12]"
      symbol = item.type === "audio" ? "🎵" : item.type === "pdf" ? "📄" : "🎤"
    } else if (instNorm.includes("produc")) {
      gradient = "from-[#6366f1]/30 to-[#0e0e12]"
      symbol = item.type === "audio" ? "🎵" : item.type === "pdf" ? "📄" : "🎚️"
    }

    return (
      <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center p-3 text-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500`}>
        <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.15)] mb-1">{symbol}</span>
        <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 max-w-full px-2 truncate">
          {item.type === "link" ? "ENLACE WEB" : item.type}
        </span>
      </div>
    )
  }

  // --- SUB COMPONENT: VIDEO IFRAME EMBED ---
  function VideoEmbed({ url, title }: { url: string, title: string }) {
    const getInfo = (url: string | null) => {
      if (!url) return null
      let m = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([^?&\s]+)/)
      if (m) return { provider: "youtube", id: m[1] }
      m = url.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/)
      if (m) return { provider: "vimeo", id: m[1] }
      return null
    }

    const info = getInfo(url)
    if (!info) {
      return (
        <div className="bg-[#181824] rounded-2xl p-6 text-center border border-[#2d2d3d] space-y-3">
          <p className="text-neutral-400 text-xs font-semibold">Este enlace no permite reproducción directa.</p>
          <a href={url} target="_blank" rel="noopener noreferrer" className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-lg transition-all">
            <span>Abrir en Nueva Pestaña</span>
            <ExternalLinkIcon className="w-3.5 h-3.5" />
          </a>
        </div>
      )
    }

    const src = info.provider === "youtube"
      ? `https://www.youtube.com/embed/${info.id}?autoplay=1`
      : `https://player.vimeo.com/video/${info.id}?autoplay=1`

    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-[#2d2d3d]/50 shadow-2xl">
        <iframe 
          src={src} 
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    )
  }

  function ExternalLinkIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      </svg>
    )
  }

  // --- FILTERING & TAXONOMY COMPILATION ---
  const taxonomy = getInstrumentTaxonomy(instrumento)
  
  // Filtrar playlists por búsqueda
  const filteredPlaylists = playlists.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
  
  // Obtener items válidos
  let displayItems = [...items].sort((a, b) => a.order_index - b.order_index)

  if (activePlaylist) {
    displayItems = displayItems.filter(i => i.playlist_id === activePlaylist)
  } else {
    // En la raíz de Netflix-style, mostramos los sueltos o agrupados en sus carruseles correspondientes
    displayItems = items.filter(i => !i.playlist_id)
  }

  if (search) {
    displayItems = displayItems.filter(i => 
      i.title.toLowerCase().includes(search.toLowerCase()) || 
      (i.description && i.description.toLowerCase().includes(search.toLowerCase())) ||
      i.category.toLowerCase().includes(search.toLowerCase())
    )
  }

  // Agrupamiento dinámico basado en Taxonomía
  const slotItems = {
    technical: [] as Content[],
    repertoire: [] as Content[],
    coordination: [] as Content[],
    general: [] as Content[]
  }

  displayItems.forEach(item => {
    const slot = mapToStandardSlot(item.category)
    slotItems[slot].push(item)
  })

  // Hero Featured Content: First video or resource in the list (or general)
  const featuredItem = displayItems.find(i => i.type === "video") || displayItems[0]

  // Último Material Asignado (Últimos 5 materiales creados)
  const latestAssignedItems = [...items]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-8 md:space-y-10 pb-28 text-white min-h-screen bg-[#0f0f13]">
      
      {/* HEADER GLASSMORPHIC */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#14141a]/60 backdrop-blur-xl border border-[#2d2d3d]/50 p-6 rounded-3xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 blur-[50px] rounded-full" />
        <div className="relative z-10">
          {activePlaylist ? (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActivePlaylist(null)} 
                className="w-10 h-10 bg-[#1e1e2c] hover:bg-[#27273a] text-neutral-300 rounded-full flex items-center justify-center transition-all border border-[#2d2d3d]"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight">
                  {playlists.find(p => p.id === activePlaylist)?.title}
                </h1>
                <p className="text-xs text-neutral-400 font-medium">
                  {playlists.find(p => p.id === activePlaylist)?.description || "Colección de recursos."}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent tracking-tight flex items-center gap-2">
                <Tv className="w-6 h-6 text-violet-400" />
                <span>Mi Biblioteca</span>
              </h1>
              <p className="text-neutral-400 text-xs font-semibold mt-1">
                Material de estudio instrument-sensitive en esquema visual Premium.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto relative z-10">
          {/* SEARCH COMPONENT */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input 
              type="text" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar título..."
              className="w-full bg-[#181824] border border-[#2d2d3d] rounded-2xl outline-none pl-11 pr-4 py-2.5 text-xs font-bold placeholder:text-neutral-500 focus:border-violet-500 focus:ring-4 focus:ring-violet-950/20 transition-all text-white"
            />
          </div>

          {profile?.role === "TEACHER" && (
            <button 
              onClick={() => { setShowForm(!showForm); setFormMode("item") }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-violet-950/20 transition-all shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Agregar</span>
            </button>
          )}
        </div>
      </div>

      {/* CREATION FORM FOR TEACHERS */}
      {showForm && profile?.role === "TEACHER" && (
        <div className="bg-[#14141a] rounded-[32px] border border-[#2d2d3d]/80 p-6 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 blur-[80px] rounded-full" />
          
          <div className="flex gap-3 mb-6 border-b border-[#2d2d3d]/50 pb-4 overflow-x-auto relative z-10">
            <button 
              onClick={() => setFormMode("item")}
              className={`font-black text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition-all whitespace-nowrap ${formMode === "item" ? "bg-violet-600/20 text-violet-400 border border-violet-500/30" : "text-neutral-400 hover:bg-[#1a1a24] hover:text-white"}`}
            >
              Nuevo Recurso
            </button>
            <button 
              onClick={() => setFormMode("playlist")}
              className={`font-black text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition-all whitespace-nowrap ${formMode === "playlist" ? "bg-violet-600/20 text-violet-400 border border-violet-500/30" : "text-neutral-400 hover:bg-[#1a1a24] hover:text-white"}`}
            >
              Crear Serie / Colección
            </button>
          </div>

          {formMode === "playlist" ? (
            <form onSubmit={handleCreatePlaylist} className="space-y-4 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 px-1">Nombre de la Serie *</label>
                  <input required value={playlistForm.title} onChange={e => setPlaylistForm(p => ({...p, title: e.target.value}))} className="w-full px-4 py-3 bg-[#181824] border border-[#2d2d3d] rounded-xl text-xs font-semibold text-white placeholder:text-neutral-500 focus:border-violet-500 focus:outline-none transition-all" placeholder="Ej: Los 40 Rudimentos del Tambor" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 px-1">Descripción corta</label>
                  <input value={playlistForm.description} onChange={e => setPlaylistForm(p => ({...p, description: e.target.value}))} className="w-full px-4 py-3 bg-[#181824] border border-[#2d2d3d] rounded-xl text-xs font-semibold text-white placeholder:text-neutral-500 focus:border-violet-500 focus:outline-none transition-all" placeholder="¿De qué trata esta serie de ejercicios?" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#2d2d3d]/50">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 bg-[#1a1a24] text-neutral-400 hover:text-white rounded-xl text-xs font-bold transition-all">Cancelar</button>
                <button type="submit" disabled={saving} className="px-7 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition-all">{saving ? "Creando..." : "Crear Serie"}</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCreateItem} className="space-y-4 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 px-1">Título del Recurso *</label>
                    <input required value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} className="w-full px-4 py-3 bg-[#181824] border border-[#2d2d3d] rounded-xl text-xs font-semibold text-white focus:border-violet-500 focus:outline-none transition-all" placeholder="Ej: Ejercicio 1: Paradiddles" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 px-1">Pertenecer a una Serie</label>
                      <select value={form.playlist_id} onChange={e => setForm(p => ({...p, playlist_id: e.target.value}))} className="w-full px-4 py-3 bg-[#181824] border border-[#2d2d3d] rounded-xl text-xs font-semibold text-white focus:border-violet-500 focus:outline-none transition-all cursor-pointer">
                        <option value="">-- Ninguna (Material Suelto) --</option>
                        {playlists.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 px-1">Categoría / Etiqueta libre</label>
                      <input value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className="w-full px-4 py-3 bg-[#181824] border border-[#2d2d3d] rounded-xl text-xs font-semibold text-white focus:border-violet-500 focus:outline-none transition-all" placeholder="Ej: Rudimento, Cancion, Tecnica..." />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 px-1">Tipo de Recurso</label>
                      <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))} className="w-full px-4 py-3 bg-[#181824] border border-[#2d2d3d] rounded-xl text-xs font-semibold text-white focus:border-violet-500 focus:outline-none transition-all cursor-pointer">
                        <option value="link">Enlace / Web</option>
                        <option value="video">Video (YouTube/Vimeo)</option>
                        <option value="pdf">Documento PDF</option>
                        <option value="audio">Audio / MP3</option>
                        <option value="image">Imagen / Partitura Corta</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 px-1">{['pdf', 'image', 'audio'].includes(form.type) ? "Archivo Local" : "Dirección URL (Link)"}</label>
                      {['pdf', 'image', 'audio'].includes(form.type) ? (
                        <div className="relative w-full h-11 bg-[#181824] border border-[#2d2d3d] rounded-xl flex items-center px-4 hover:border-violet-500 transition-all cursor-pointer">
                          <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={e => {
                              const f = e.target.files?.[0]
                              if (f && f.size > 50 * 1024 * 1024) {
                                alert("El archivo es demasiado grande. El límite máximo es de 50 MB.")
                                e.target.value = ""
                                setFile(null)
                              } else {
                                setFile(f || null)
                              }
                            }} 
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <span className="text-xs text-neutral-400 truncate">{file ? file.name : "Seleccionar Archivo (Máx 50MB)..."}</span>
                        </div>
                      ) : (
                        <input value={form.url} onChange={e => setForm(p => ({...p, url: e.target.value}))} className="w-full px-4 py-3 bg-[#181824] border border-[#2d2d3d] rounded-xl text-xs font-semibold text-white focus:border-violet-500 focus:outline-none transition-all" placeholder="https://youtube.com/watch?..." />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 px-1">Breve Descripción</label>
                    <input value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} className="w-full px-4 py-3 bg-[#181824] border border-[#2d2d3d] rounded-xl text-xs font-semibold text-white focus:border-violet-500 focus:outline-none transition-all" placeholder="Detalla qué debe repasar el alumno en este ejercicio..." />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#2d2d3d]/50">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 bg-[#1a1a24] text-neutral-400 hover:text-white rounded-xl text-xs font-bold transition-all">Cancelar</button>
                <button type="submit" disabled={saving} className="px-7 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition-all">{saving ? "Guardando..." : "Subir Recurso"}</button>
              </div>
            </form>
          )}
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="h-64 bg-[#14141a] rounded-[36px] animate-pulse border border-[#2d2d3d]/40" />
          <div className="space-y-3">
             <div className="h-6 w-48 bg-[#14141a] rounded-lg animate-pulse" />
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-32 bg-[#14141a] rounded-3xl animate-pulse" />)}
             </div>
          </div>
        </div>
      ) : (
        <div className="space-y-12">

          {/* 1. CINEMATIC HERO BANNER (Top featured content) */}
          {!activePlaylist && featuredItem && (
            <div className="relative w-full rounded-[40px] overflow-hidden border border-[#2d2d3d]/60 bg-gradient-to-r from-black to-neutral-900 group min-h-[300px] md:min-h-[380px] flex items-end shadow-2xl">
              
              {/* Blur Backdrops */}
              <div className="absolute inset-0 bg-[#0f0f13]/10 z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f13] via-[#0f0f13]/40 to-transparent z-10" />
              <div className="absolute top-0 right-0 w-[45%] h-full opacity-65 z-0 hidden md:block">
                {renderCardCover(featuredItem)}
              </div>
              <div className="absolute inset-0 md:hidden z-0">
                {renderCardCover(featuredItem)}
              </div>

              {/* Dynamic instrument glow */}
              <div className="absolute -top-[30%] -left-[10%] w-[350px] h-[350px] bg-violet-600/10 blur-[130px] rounded-full" />

              {/* Hero content details */}
              <div className="relative z-20 p-6 md:p-12 max-w-lg space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-violet-400 bg-violet-600/15 border border-violet-500/25 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3 h-3 text-violet-400" />
                    <span>Recomendado</span>
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-300 bg-neutral-800 px-3 py-1 rounded-full">
                    {featuredItem.category || featuredItem.type}
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl md:text-4xl font-black tracking-tight leading-tight drop-shadow-md">
                    {featuredItem.title}
                  </h2>
                  {featuredItem.description && (
                    <p className="text-neutral-400 text-xs md:text-sm font-semibold leading-relaxed line-clamp-3">
                      {featuredItem.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedMaterial(featuredItem)}
                    className="px-6 py-3 bg-white hover:bg-neutral-100 text-[#0f0f13] font-black text-xs uppercase tracking-widest rounded-2xl flex items-center gap-2 shadow-lg shadow-white/5 transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Ver Ahora</span>
                  </button>

                  {profile?.role === "TEACHER" && (
                    <button 
                      onClick={() => deleteItem(featuredItem.id)}
                      className="p-3 bg-[#181824]/80 hover:bg-red-950/20 hover:text-red-400 hover:border-red-500/30 text-neutral-400 rounded-2xl border border-[#2d2d3d] transition-all"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. ROW 1: ÚLTIMO MATERIAL ASIGNADO (IF EXISTS AND ROOT VIEW) */}
          {!activePlaylist && latestAssignedItems.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest px-1 flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-violet-400 animate-pulse" />
                <span>{taxonomy.lastAssigned}</span>
              </h3>
              
              {/* HORIZONTAL CAROUSEL SWIPEABLE */}
              <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none scroll-smooth">
                {latestAssignedItems.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => setSelectedMaterial(item)}
                    className="flex-shrink-0 w-[180px] sm:w-[220px] aspect-[16/10] bg-[#14141a] rounded-[24px] border border-[#2d2d3d]/50 overflow-hidden relative group cursor-pointer snap-start shadow-md hover:border-violet-500/60 hover:shadow-violet-600/5 transition-all duration-300"
                  >
                    {renderCardCover(item)}
                    
                    {/* Shadow overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 flex flex-col justify-end p-3.5 z-10" />

                    {/* Meta info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3.5 z-20 space-y-1">
                      <p className="text-white font-black text-xs truncate drop-shadow-md group-hover:text-violet-300 transition-colors">
                        {item.title}
                      </p>
                      <span className="text-[8px] font-black uppercase tracking-widest text-violet-400 bg-violet-600/15 border border-violet-500/20 px-2 py-0.5 rounded-md inline-block">
                        {item.category || item.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. ROW 2: SERIES Y COLECCIONES (PLAYLISTS) */}
          {!activePlaylist && filteredPlaylists.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest px-1 flex items-center gap-2">
                <FolderPlus className="w-4.5 h-4.5 text-violet-400" />
                <span>Series y Colecciones</span>
              </h3>
              
              {/* PLAYLIST CAROUSEL */}
              <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none scroll-smooth">
                {filteredPlaylists.map(playlist => (
                  <div 
                    key={playlist.id}
                    onClick={() => setActivePlaylist(playlist.id)}
                    className="flex-shrink-0 w-[160px] sm:w-[200px] aspect-[10/12] bg-gradient-to-br from-[#1a1a24] to-[#121217] rounded-[28px] border border-[#2d2d3d]/50 p-5 relative overflow-hidden group cursor-pointer snap-start hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-950/10 transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Glowing background circle */}
                    <div className="absolute -top-[20%] -right-[20%] w-24 h-24 bg-violet-500/5 group-hover:bg-violet-500/10 blur-xl rounded-full transition-all" />

                    <div>
                      <div className="w-10 h-10 bg-violet-600/10 text-violet-400 rounded-xl flex items-center justify-center mb-5 border border-violet-500/20 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <h4 className="font-black text-white text-sm line-clamp-2 leading-tight">
                        {playlist.title}
                      </h4>
                      <p className="text-[10px] text-neutral-500 font-semibold line-clamp-3 mt-1.5 leading-relaxed">
                        {playlist.description || "Colección de lecciones."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#2d2d3d]/40 pt-3 mt-4">
                      <span className="text-[9px] font-black uppercase text-violet-400 tracking-wider flex items-center gap-1">
                        <span>Entrar</span>
                        <ChevronRight className="w-3.5 h-3.5 stroke-[3] group-hover:translate-x-0.5 transition-transform" />
                      </span>

                      {profile?.role === "TEACHER" && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); deletePlaylist(playlist.id) }} 
                          className="text-neutral-500 hover:text-red-400 p-1 rounded-lg hover:bg-neutral-800/30 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. SUBSEQUENT SLOTS: DYNAMIC TAXONOMY CAROUSELS */}
          {Object.entries(slotItems).map(([slotKey, contents]) => {
            if (contents.length === 0) return null

            // Dynamic labeling based on Taxonomy
            let rowLabel = taxonomy.general
            if (slotKey === "technical") rowLabel = taxonomy.technical
            else if (slotKey === "repertoire") rowLabel = taxonomy.repertoire
            else if (slotKey === "coordination") rowLabel = taxonomy.coordination

            const colorKey = slotKey === "technical" ? "text-violet-400" : slotKey === "repertoire" ? "text-rose-400" : "text-amber-400"

            return (
              <div key={slotKey} className="space-y-4">
                <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest px-1 flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${slotKey === 'technical' ? 'bg-violet-500' : slotKey === 'repertoire' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                  <span>{rowLabel}</span>
                </h3>

                {/* SLOTS CAROUSEL */}
                <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none scroll-smooth">
                  {contents.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => setSelectedMaterial(item)}
                      className="flex-shrink-0 w-[180px] sm:w-[220px] aspect-[16/10] bg-[#14141a] rounded-[24px] border border-[#2d2d3d]/50 overflow-hidden relative group cursor-pointer snap-start shadow-md hover:border-violet-500/60 hover:shadow-violet-600/5 transition-all duration-300"
                    >
                      {renderCardCover(item)}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent flex flex-col justify-end p-3.5 z-10" />

                      <div className="absolute bottom-0 left-0 right-0 p-3.5 z-20 space-y-1">
                        <p className="text-white font-black text-xs truncate drop-shadow-md group-hover:text-violet-300 transition-colors">
                          {item.title}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-black uppercase tracking-widest text-violet-400 bg-violet-600/15 border border-violet-500/20 px-2 py-0.5 rounded-md inline-block">
                            {item.category || item.type}
                          </span>
                          {profile?.role === "TEACHER" && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteItem(item.id) }} 
                              className="text-neutral-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-neutral-800/50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {/* EMPTY STATE */}
          {!activePlaylist && filteredPlaylists.length === 0 && displayItems.length === 0 && (
            <div className="text-center py-24 bg-[#14141a] rounded-[40px] border border-dashed border-[#2d2d3d]/70 max-w-xl mx-auto shadow-2xl p-6 relative overflow-hidden">
              <div className="absolute -top-[30%] left-[30%] w-64 h-64 bg-violet-600/5 blur-[90px] rounded-full" />
              <span className="text-5xl opacity-40 mb-4 block">📚</span>
              <h4 className="text-white font-black text-lg">Biblioteca de Estudio Vacía</h4>
              <p className="text-neutral-400 text-xs font-semibold mt-1 px-4 leading-relaxed max-w-sm mx-auto">
                No hay recursos en la raíz. {profile?.role === 'TEACHER' ? 'Comienza agregando lecciones de técnica o rudimentos para tus estudiantes.' : 'Tu profesor aún no ha cargado material aquí.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 5. PREMIUM GLASSMORMHIC DETAILS MODAL / DRAWER (SLIDE UP ON MOBILE) */}
      {selectedMaterial && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-[#14141a] border border-[#2d2d3d] rounded-[36px] shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 relative"
          >
            {/* Dynamic blurred backdrop background */}
            <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-violet-600/10 to-transparent blur-2xl z-0" />

            {/* Modal header details */}
            <div className="p-6 border-b border-[#2d2d3d]/60 bg-[#161622]/40 backdrop-blur-md flex items-start justify-between relative z-10 shrink-0">
              <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-violet-400 bg-violet-600/15 border border-violet-500/25 px-2.5 py-1 rounded-md inline-block">
                  {selectedMaterial.category || selectedMaterial.type}
                </span>
                <h3 className="text-lg md:text-xl font-black text-white leading-tight truncate">
                  {selectedMaterial.title}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedMaterial(null)}
                className="w-9 h-9 rounded-xl bg-[#1d1d2b] border border-[#2d2d3d] flex items-center justify-center text-neutral-400 hover:text-white transition-all shrink-0 hover:scale-105"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Modal main content view */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10">
              
              {/* Media viewer widget */}
              {selectedMaterial.type === "video" && selectedMaterial.url && (
                <VideoEmbed url={selectedMaterial.url} title={selectedMaterial.title} />
              )}

              {selectedMaterial.type === "audio" && selectedMaterial.url && (
                <div className="bg-[#181824] rounded-2xl p-6 border border-[#2d2d3d]/50 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-600/10 text-sky-400 rounded-xl flex items-center justify-center border border-sky-500/25 animate-pulse">
                      <Music className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Audio / Archivo de Repaso</p>
                      <p className="text-[10px] text-neutral-400 font-semibold mt-0.5">Escucha e internaliza el tempo</p>
                    </div>
                  </div>
                  <audio 
                    src={selectedMaterial.url} 
                    controls 
                    className="w-full rounded-xl outline-none"
                  />
                </div>
              )}

              {selectedMaterial.type === "pdf" && selectedMaterial.url && (
                <div className="bg-[#181824] rounded-2xl p-6 border border-[#2d2d3d]/50 text-center space-y-4">
                  <div className="w-12 h-12 bg-amber-600/10 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-500/25 mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">Método / Partitura Oficial (PDF)</p>
                    <p className="text-[10px] text-neutral-400 font-semibold max-w-xs mx-auto">
                      Para resguardar tus datos móviles, abre el visor de partituras a continuación.
                    </p>
                  </div>
                  <div className="pt-2">
                    <a 
                      href={selectedMaterial.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 shadow-lg shadow-amber-950/20 transition-all hover:scale-[1.02]"
                    >
                      <span>Abrir Partitura</span>
                      <ExternalLinkIcon className="w-3.5 h-3.5 stroke-[3]" />
                    </a>
                  </div>
                </div>
              )}

              {selectedMaterial.type === "image" && selectedMaterial.url && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Visualización de Partitura / Imagen</p>
                  <div className="relative rounded-2xl overflow-hidden border border-[#2d2d3d] bg-black/40">
                    <img 
                      src={selectedMaterial.url} 
                      alt={selectedMaterial.title}
                      className="w-full h-auto object-contain max-h-[300px] mx-auto"
                    />
                  </div>
                </div>
              )}

              {/* Description & metadata details */}
              <div className="space-y-3 bg-[#181824]/40 border border-[#2d2d3d]/40 rounded-2xl p-5">
                <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                  Instrucciones del Profesor
                </h4>
                <p className="text-neutral-300 text-xs md:text-sm font-semibold leading-relaxed">
                  {selectedMaterial.description || "Sin anotaciones adicionales. ¡A practicar!"}
                </p>
              </div>

              {/* Extra direct actions (link fallback) */}
              {selectedMaterial.type === "link" && selectedMaterial.url && (
                <div className="bg-[#181824] rounded-2xl p-6 text-center border border-[#2d2d3d]/50 space-y-4">
                  <div className="w-12 h-12 bg-violet-600/10 text-violet-400 rounded-2xl flex items-center justify-center border border-violet-500/25 mx-auto">
                    <LinkIcon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">Enlace / Recurso Musical Externo</p>
                    <p className="text-[10px] text-neutral-400 font-semibold max-w-xs mx-auto">
                      Este material apunta a una página de apoyo o metrónomo interactivo.
                    </p>
                  </div>
                  <div className="pt-2">
                    <a 
                      href={selectedMaterial.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 shadow-lg shadow-violet-950/20 transition-all hover:scale-[1.02]"
                    >
                      <span>Visitar Enlace</span>
                      <ExternalLinkIcon className="w-3.5 h-3.5 stroke-[3]" />
                    </a>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  )
}
