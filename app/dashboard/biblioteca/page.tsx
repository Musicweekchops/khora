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

// --- HELPER TO DETECT FILE EXTENSIONS ---
function getFileExtension(url: string | null): string {
  if (!url) return ""
  const cleanUrl = url.split(/[?#]/)[0]
  return cleanUrl.substring(cleanUrl.lastIndexOf(".") + 1).toLowerCase()
}

// --- HELPER TO GET YOUTUBE ID ---
function getYouTubeId(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([^?&\s]+)/);
  return match ? match[1] : null;
}

// --- AUTOMATIC CLIENT-SIDE PDF FIRST-PAGE RENDERER ---
// --- ROBUST IMAGE COMPONENT WITH FALLBACK ---
function ImageWithFallback({ 
  src, 
  alt, 
  className, 
  fallback, 
  ...props 
}: { 
  src: string
  alt: string
  className?: string
  fallback: React.ReactNode
  [key: string]: any 
}) {
  const [error, setError] = useState(false)

  if (error) {
    return <>{fallback}</>
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      onError={() => setError(true)} 
      {...props} 
    />
  )
}

// --- AUTOMATIC CLIENT-SIDE PDF FIRST-PAGE RENDERER ---
function PdfThumbnail({ url, fallback }: { url: string; fallback: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    if (!url) return

    async function loadPdf() {
      try {
        // Load PDF.js dynamically from CDN if not present in window
        if (!(window as any)['pdfjs-dist/build/pdf']) {
          const script = document.createElement('script')
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
          script.async = true
          document.head.appendChild(script)
          await new Promise((resolve) => {
            script.onload = resolve
          })
        }

        const pdfjs = (window as any)['pdfjs-dist/build/pdf']
        pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

        const pdf = await pdfjs.getDocument(url).promise
        if (!active) return

        const page = await pdf.getPage(1)
        if (!active) return

        const canvas = canvasRef.current
        if (!canvas) return

        const context = canvas.getContext('2d')
        if (!context) return

        // Scale to a lightweight preview resolution
        const viewport = page.getViewport({ scale: 0.6 })
        canvas.height = viewport.height
        canvas.width = viewport.width

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise

        if (active) setLoaded(true)
      } catch (e) {
        console.error("Error rendering PDF thumbnail:", e)
        if (active) setError(true)
      }
    }

    loadPdf()
    return () => {
      active = false
    }
  }, [url])

  if (error) return <>{fallback}</>

  return (
    <div className="w-full h-full relative overflow-hidden bg-neutral-50 flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full object-cover" style={{ display: loaded ? 'block' : 'none' }} />
      {!loaded && (
        <div className="w-full h-full flex items-center justify-center bg-neutral-50 animate-pulse">
          <FileText className="w-6 h-6 text-neutral-400" />
        </div>
      )}
    </div>
  )
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
    const ext = getFileExtension(item.url)
    const itemType = (item.type || "").toLowerCase()
    const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) || itemType === "image"
    const isPdf = ext === "pdf" || itemType === "pdf"

    // Modern Apple-Music inspired soft pastel gradients fallbacks
    const instNorm = (instrumento || "").toLowerCase()
    let gradient = "from-[#f4f4f5] to-[#e4e4e7]"
    let symbol = "📄"
    let colorClass = "text-neutral-500"

    if (instNorm.includes("bater")) {
      gradient = "from-violet-500/10 to-violet-500/5 border border-violet-100"
      symbol = itemType === "audio" ? "🎵" : itemType === "pdf" ? "📄" : "🥁"
      colorClass = "text-violet-600"
    } else if (instNorm.includes("guitar") || instNorm.includes("bajo")) {
      gradient = "from-red-500/10 to-red-500/5 border border-red-100"
      symbol = itemType === "audio" ? "🎵" : itemType === "pdf" ? "📄" : "🎸"
      colorClass = "text-red-600"
    } else if (instNorm.includes("piano") || instNorm.includes("teclado")) {
      gradient = "from-teal-500/10 to-teal-500/5 border border-teal-100"
      symbol = itemType === "audio" ? "🎵" : itemType === "pdf" ? "📄" : "🎹"
      colorClass = "text-teal-600"
    } else if (instNorm.includes("cant") || instNorm.includes("voz")) {
      gradient = "from-pink-500/10 to-pink-500/5 border border-pink-100"
      symbol = itemType === "audio" ? "🎵" : itemType === "pdf" ? "📄" : "🎤"
      colorClass = "text-pink-600"
    } else if (instNorm.includes("produc")) {
      gradient = "from-indigo-500/10 to-indigo-500/5 border border-indigo-100"
      symbol = itemType === "audio" ? "🎵" : itemType === "pdf" ? "📄" : "🎚️"
      colorClass = "text-indigo-600"
    }

    const fallbackElement = (
      <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center p-3 text-center relative overflow-hidden group-hover:scale-102 transition-transform duration-500`}>
        <span className={`text-2xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.05)] mb-1 ${colorClass}`}>{symbol}</span>
        <span className="text-[9px] font-black uppercase tracking-wider text-neutral-400 max-w-full px-2 truncate">
          {itemType === "link" ? "ENLACE WEB" : itemType}
        </span>
      </div>
    )

    if (ytId) {
      return (
        <ImageWithFallback 
          src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`} 
          alt={item.title} 
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
          loading="lazy"
          fallback={
            <ImageWithFallback
              src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
              loading="lazy"
              fallback={
                <ImageWithFallback
                  src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  loading="lazy"
                  fallback={fallbackElement}
                />
              }
            />
          }
        />
      )
    }

    if (isImage && item.url) {
      return (
        <ImageWithFallback 
          src={item.url} 
          alt={item.title} 
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
          loading="lazy"
          fallback={fallbackElement}
        />
      )
    }

    if (isPdf && item.url) {
      return <PdfThumbnail url={item.url} fallback={fallbackElement} />
    }

    return fallbackElement
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
        <div className="bg-neutral-50 rounded-2xl p-6 text-center border border-neutral-200/80 space-y-3">
          <p className="text-neutral-500 text-xs font-semibold">Este enlace no permite reproducción directa.</p>
          <a href={url} target="_blank" rel="noopener noreferrer" className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all">
            <span>Abrir en Nueva Pestaña</span>
            <ExternalLinkIcon className="w-3.5 h-3.5 text-white" />
          </a>
        </div>
      )
    }

    const src = info.provider === "youtube"
      ? `https://www.youtube.com/embed/${info.id}?autoplay=1`
      : `https://player.vimeo.com/video/${info.id}?autoplay=1`

    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-neutral-200/50 shadow-lg">
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
    <div className="space-y-6 md:space-y-8 pb-24 text-neutral-900 min-h-screen bg-transparent w-full max-w-full overflow-x-hidden px-1">
      
      {/* HEADER PREMIUM WHITE (Apple Music style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-neutral-200/60 p-6 rounded-3xl relative overflow-hidden shadow-sm">
        <div className="relative z-10">
          {activePlaylist ? (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActivePlaylist(null)} 
                className="w-10 h-10 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 rounded-full flex items-center justify-center transition-all border border-neutral-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-neutral-950">
                  {playlists.find(p => p.id === activePlaylist)?.title}
                </h1>
                <p className="text-xs text-neutral-500 font-bold">
                  {playlists.find(p => p.id === activePlaylist)?.description || "Colección de recursos."}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-neutral-950 tracking-tight flex items-center gap-2">
                <Tv className="w-6 h-6 text-neutral-800" />
                <span>Mi Biblioteca</span>
              </h1>
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
              className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl outline-none pl-11 pr-4 py-2.5 text-xs font-bold placeholder:text-neutral-400 focus:bg-white focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100 transition-all text-neutral-800"
            />
          </div>

          {profile?.role === "TEACHER" && (
            <button 
              onClick={() => { setShowForm(!showForm); setFormMode("item") }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-sm transition-all shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Agregar</span>
            </button>
          )}
        </div>
      </div>

      {/* CREATION FORM FOR TEACHERS */}
      {showForm && profile?.role === "TEACHER" && (
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex gap-2 mb-6 border-b border-neutral-100 pb-4 overflow-x-auto relative z-10">
            <button 
              onClick={() => setFormMode("item")}
              className={`font-black text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl transition-all whitespace-nowrap border ${formMode === "item" ? "bg-neutral-900 text-white border-neutral-900" : "text-neutral-500 border-transparent hover:bg-neutral-50"}`}
            >
              Nuevo Recurso
            </button>
            <button 
              onClick={() => setFormMode("playlist")}
              className={`font-black text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl transition-all whitespace-nowrap border ${formMode === "playlist" ? "bg-neutral-900 text-white border-neutral-900" : "text-neutral-500 border-transparent hover:bg-neutral-50"}`}
            >
              Crear Serie / Colección
            </button>
          </div>

          {formMode === "playlist" ? (
            <form onSubmit={handleCreatePlaylist} className="space-y-4 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 px-1">Nombre de la Serie *</label>
                  <input required value={playlistForm.title} onChange={e => setPlaylistForm(p => ({...p, title: e.target.value}))} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-300 focus:outline-none transition-all" placeholder="Ej: Los 40 Rudimentos del Tambor" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 px-1">Descripción corta</label>
                  <input value={playlistForm.description} onChange={e => setPlaylistForm(p => ({...p, description: e.target.value}))} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-300 focus:outline-none transition-all" placeholder="¿De qué trata esta serie de ejercicios?" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded-xl text-xs font-bold transition-all">Cancelar</button>
                <button type="submit" disabled={saving} className="px-7 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all">{saving ? "Creando..." : "Crear Serie"}</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCreateItem} className="space-y-4 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 px-1">Título del Recurso *</label>
                    <input required value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 focus:border-neutral-300 focus:outline-none transition-all" placeholder="Ej: Ejercicio 1: Paradiddles" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 px-1">Pertenecer a una Serie</label>
                      <select value={form.playlist_id} onChange={e => setForm(p => ({...p, playlist_id: e.target.value}))} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 focus:border-neutral-300 focus:outline-none transition-all cursor-pointer">
                        <option value="">-- Ninguna (Material Suelto) --</option>
                        {playlists.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 px-1">Categoría / Etiqueta libre</label>
                      <input value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 focus:border-neutral-300 focus:outline-none transition-all" placeholder="Ej: Rudimento, Cancion, Tecnica..." />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 px-1">Tipo de Recurso</label>
                      <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 focus:border-neutral-300 focus:outline-none transition-all cursor-pointer">
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
                        <div className="relative w-full h-11 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center px-4 hover:border-neutral-300 transition-all cursor-pointer">
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
                          <span className="text-xs text-neutral-500 truncate">{file ? file.name : "Seleccionar Archivo (Máx 50MB)..."}</span>
                        </div>
                      ) : (
                        <input value={form.url} onChange={e => setForm(p => ({...p, url: e.target.value}))} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 focus:border-neutral-300 focus:outline-none transition-all" placeholder="https://youtube.com/watch?..." />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 px-1">Breve Descripción</label>
                    <input value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 focus:border-neutral-300 focus:outline-none transition-all" placeholder="Detalla qué debe repasar el alumno en este ejercicio..." />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded-xl text-xs font-bold transition-all">Cancelar</button>
                <button type="submit" disabled={saving} className="px-7 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all">{saving ? "Guardando..." : "Subir Recurso"}</button>
              </div>
            </form>
          )}
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="h-64 bg-white rounded-[36px] animate-pulse border border-neutral-200/60" />
          <div className="space-y-3">
             <div className="h-6 w-48 bg-white rounded-lg animate-pulse" />
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white rounded-3xl animate-pulse" />)}
             </div>
          </div>
        </div>
      ) : (
        <div className="space-y-10">

          {/* 1. CINEMATIC HERO BANNER (Apple Music + Netflix Fusion - Fully Responsive & Crisp) */}
          {!activePlaylist && featuredItem && (
            <div className="relative w-full rounded-[36px] overflow-hidden border border-neutral-200/80 bg-[#f9f9fb] group flex flex-col md:flex-row md:items-stretch min-h-[340px] shadow-sm">
              
              {/* Cover Image Container (Relative on mobile, absolute on desktop to prevent any right-column blank gaps) */}
              <div className="w-full md:w-[50%] lg:w-[45%] h-52 sm:h-64 md:h-auto md:absolute md:right-0 md:top-0 md:bottom-0 overflow-hidden shrink-0 z-0 relative">
                {renderCardCover(featuredItem)}
                
                {/* Horizontal white fade overlay for desktop (crisp color blending into white page) */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#f9f9fb] via-[#f9f9fb]/40 to-transparent z-10 hidden md:block" />
                
                {/* Vertical white fade overlay for mobile transition */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#f9f9fb] via-[#f9f9fb]/20 to-transparent md:hidden z-10" />
              </div>

              {/* Dynamic subtle instrument background glow */}
              <div className="absolute -top-[30%] -left-[10%] w-[320px] h-[320px] bg-violet-500/5 blur-[120px] rounded-full hidden md:block" />

              {/* Hero content details (Perfect margins and widths to prevent squishing text) */}
              <div className="relative z-20 p-6 sm:p-8 md:p-10 w-full md:w-[55%] lg:w-[58%] flex flex-col justify-center space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] font-black uppercase tracking-wider text-violet-600 bg-violet-50 border border-violet-100 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3 h-3 text-violet-500" />
                    <span>Recomendado</span>
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
                    {featuredItem.category || featuredItem.type}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight text-neutral-950">
                    {featuredItem.title}
                  </h2>
                  {featuredItem.description && (
                    <p className="text-neutral-500 text-xs md:text-sm font-semibold leading-relaxed line-clamp-3 md:line-clamp-4">
                      {featuredItem.description}
                    </p>
                  )}
                </div>

                <div className="pt-1.5 flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedMaterial(featuredItem)}
                    className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02]"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Ver Ahora</span>
                  </button>

                  {profile?.role === "TEACHER" && (
                    <button 
                      onClick={() => deleteItem(featuredItem.id)}
                      className="p-2.5 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-neutral-400 rounded-2xl border border-neutral-200 transition-all shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. ROW 1: ÚLTIMO MATERIAL ASIGNADO */}
          {!activePlaylist && latestAssignedItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-neutral-800 uppercase tracking-widest px-1 flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-500 animate-pulse" />
                <span>{taxonomy.lastAssigned}</span>
              </h3>
              
              {/* HORIZONTAL CAROUSEL */}
              <div className="flex gap-4 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scrollbar-none scroll-smooth">
                {latestAssignedItems.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => setSelectedMaterial(item)}
                    className="flex-shrink-0 w-[170px] sm:w-[210px] aspect-[16/10] bg-white rounded-[20px] border border-neutral-200/80 overflow-hidden relative group cursor-pointer snap-start shadow-sm hover:border-neutral-400 transition-all duration-300"
                  >
                    {renderCardCover(item)}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent flex flex-col justify-end p-3 z-10" />

                    <div className="absolute bottom-0 left-0 right-0 p-3 z-20 space-y-0.5">
                      <p className="text-white font-black text-xs truncate drop-shadow-sm group-hover:text-white transition-colors">
                        {item.title}
                      </p>
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/95 opacity-90">
                        {item.category || item.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. ROW 2: SERIES Y COLECCIONES */}
          {!activePlaylist && filteredPlaylists.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-neutral-800 uppercase tracking-widest px-1 flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-violet-500" />
                <span>Series y Colecciones</span>
              </h3>
              
              {/* PLAYLIST CAROUSEL */}
              <div className="flex gap-4 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scrollbar-none scroll-smooth">
                {filteredPlaylists.map(playlist => (
                  <div 
                    key={playlist.id}
                    onClick={() => setActivePlaylist(playlist.id)}
                    className="flex-shrink-0 w-[150px] sm:w-[190px] aspect-[10/12] bg-white rounded-[24px] border border-neutral-200/70 p-5 relative overflow-hidden group cursor-pointer snap-start hover:border-neutral-400 hover:shadow-sm transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="absolute -top-[20%] -right-[20%] w-24 h-24 bg-neutral-50 rounded-full z-0" />

                    <div className="relative z-10">
                      <div className="w-9 h-9 bg-neutral-50 text-neutral-800 rounded-xl flex items-center justify-center mb-4 border border-neutral-200 group-hover:scale-105 transition-transform">
                        <BookOpen className="w-4.5 h-4.5" />
                      </div>
                      <h4 className="font-black text-neutral-900 text-sm line-clamp-2 leading-tight">
                        {playlist.title}
                      </h4>
                      <p className="text-[10px] text-neutral-400 font-semibold line-clamp-3 mt-1 leading-relaxed">
                        {playlist.description || "Colección de lecciones."}
                      </p>
                    </div>

                    <div className="relative z-10 flex items-center justify-between border-t border-neutral-100 pt-3 mt-3">
                      <span className="text-[8px] font-black uppercase text-neutral-700 tracking-wider flex items-center gap-1">
                        <span>Entrar</span>
                        <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                      </span>

                      {profile?.role === "TEACHER" && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); deletePlaylist(playlist.id) }} 
                          className="text-neutral-300 hover:text-red-500 p-1 rounded-lg transition-all"
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

            return (
              <div key={slotKey} className="space-y-3">
                <h3 className="text-xs font-black text-neutral-800 uppercase tracking-widest px-1 flex items-center gap-2">
                  <span className={`w-2 h-4 rounded-full ${slotKey === 'technical' ? 'bg-violet-500' : slotKey === 'repertoire' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                  <span>{rowLabel}</span>
                </h3>

                {/* SLOTS CAROUSEL */}
                <div className="flex gap-4 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scrollbar-none scroll-smooth">
                  {contents.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => setSelectedMaterial(item)}
                      className="flex-shrink-0 w-[170px] sm:w-[210px] aspect-[16/10] bg-white rounded-[20px] border border-neutral-200/80 overflow-hidden relative group cursor-pointer snap-start shadow-sm hover:border-neutral-400 transition-all duration-300"
                    >
                      {renderCardCover(item)}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent flex flex-col justify-end p-3 z-10" />

                      <div className="absolute bottom-0 left-0 right-0 p-3 z-20 space-y-0.5">
                        <p className="text-white font-black text-xs truncate drop-shadow-sm group-hover:text-white transition-colors">
                          {item.title}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-black uppercase tracking-widest text-white/95 opacity-90">
                            {item.category || item.type}
                          </span>
                          {profile?.role === "TEACHER" && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteItem(item.id) }} 
                              className="text-white/40 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
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
            <div className="text-center py-20 bg-white rounded-[32px] border border-neutral-200 shadow-sm max-w-xl mx-auto p-6 relative overflow-hidden">
              <span className="text-4xl opacity-50 mb-3 block">📚</span>
              <h4 className="text-neutral-900 font-black text-base">Biblioteca de Estudio Vacía</h4>
              <p className="text-neutral-400 text-xs font-semibold mt-1 px-4 leading-relaxed max-w-sm mx-auto">
                No hay recursos en la raíz. {profile?.role === 'TEACHER' ? 'Comienza agregando lecciones de técnica o partituras para tus estudiantes.' : 'Tu profesor aún no ha cargado material aquí.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 5. PREMIUM DETAILS MODAL / DRAWER (WHITE MODE) */}
      {selectedMaterial && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-white border border-neutral-200 rounded-[32px] shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 relative"
          >
            {/* Modal header details */}
            <div className="p-6 border-b border-neutral-100 bg-neutral-50/50 flex items-start justify-between relative z-10 shrink-0">
              <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                <span className="text-[8px] font-black uppercase tracking-widest text-violet-600 bg-violet-50 border border-violet-100 px-2.5 py-1 rounded-md inline-block">
                  {selectedMaterial.category || selectedMaterial.type}
                </span>
                <h3 className="text-base md:text-lg font-black text-neutral-950 leading-tight truncate">
                  {selectedMaterial.title}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedMaterial(null)}
                className="w-9 h-9 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-all shrink-0 hover:scale-102"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Modal main content view */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 text-neutral-800">
              
              {/* Media viewer widget */}
              {selectedMaterial.type === "video" && selectedMaterial.url && (
                <VideoEmbed url={selectedMaterial.url} title={selectedMaterial.title} />
              )}

              {selectedMaterial.type === "audio" && selectedMaterial.url && (
                <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200/80 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-100 text-neutral-800 rounded-xl flex items-center justify-center border border-neutral-200">
                      <Music className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-900">Audio / Archivo de Repaso</p>
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
                <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200/80 text-center space-y-4">
                  <div className="w-11 h-11 bg-neutral-100 text-neutral-800 rounded-2xl flex items-center justify-center border border-neutral-200 mx-auto">
                    <FileText className="w-5.5 h-5.5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-neutral-900">Método / Partitura Oficial (PDF)</p>
                    <p className="text-[10px] text-neutral-400 font-semibold max-w-xs mx-auto">
                      Para resguardar tus datos móviles, abre el visor de partituras a continuación.
                    </p>
                  </div>
                  <div className="pt-1.5">
                    <a 
                      href={selectedMaterial.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02]"
                    >
                      <span>Abrir Partitura</span>
                      <ExternalLinkIcon className="w-3.5 h-3.5 stroke-[3] text-white" />
                    </a>
                  </div>
                </div>
              )}

              {selectedMaterial.type === "image" && selectedMaterial.url && (
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest px-1">Visualización de Partitura / Imagen</p>
                  <div className="relative rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-50">
                    <img 
                      src={selectedMaterial.url} 
                      alt={selectedMaterial.title}
                      className="w-full h-auto object-contain max-h-[280px] mx-auto"
                    />
                  </div>
                </div>
              )}

              {/* Description & metadata details */}
              <div className="space-y-3 bg-neutral-50/60 border border-neutral-200/60 rounded-2xl p-5">
                <h4 className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">
                  Instrucciones del Profesor
                </h4>
                <p className="text-neutral-600 text-xs md:text-sm font-semibold leading-relaxed">
                  {selectedMaterial.description || "Sin anotaciones adicionales. ¡A practicar!"}
                </p>
              </div>

              {/* Extra direct actions (link fallback) */}
              {selectedMaterial.type === "link" && selectedMaterial.url && (
                <div className="bg-neutral-50 rounded-2xl p-6 text-center border border-neutral-200/80 space-y-4">
                  <div className="w-11 h-11 bg-neutral-100 text-neutral-800 rounded-2xl flex items-center justify-center border border-neutral-200 mx-auto">
                    <LinkIcon className="w-5.5 h-5.5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-neutral-900">Enlace / Recurso Musical Externo</p>
                    <p className="text-[10px] text-neutral-400 font-semibold max-w-xs mx-auto">
                      Este material apunta a una página de apoyo o metrónomo interactivo.
                    </p>
                  </div>
                  <div className="pt-1.5">
                    <a 
                      href={selectedMaterial.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02]"
                    >
                      <span>Visitar Enlace</span>
                      <ExternalLinkIcon className="w-3.5 h-3.5 stroke-[3] text-white" />
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
