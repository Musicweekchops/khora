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
  CloudUpload,
  GripVertical
} from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

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

export default function BibliotecaPage() {
  const { profile } = useAuth()
  const [items, setItems] = useState<Content[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  
  // UI State
  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState<"item" | "playlist">("item")
  const [activePlaylist, setActivePlaylist] = useState<string | null>(null) // null = showing all, id = showing specific playlist
  
  // Item Form
  const [saving, setSaving] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "link",
    url: "",
    category: "General",
    playlist_id: ""
  })

  // Playlist Form
  const [playlistForm, setPlaylistForm] = useState({
    title: "",
    description: ""
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
    const { data: student } = await supabase.from("StudentProfile").select("teacher_id").eq("id", studentId).maybeSingle()

    if (student?.teacher_id) {
      // 1. Recopilar accesos explícitos (SLA, Tareas, Notas)
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

      // 2. Cargar únicamente las series permitidas
      if (playlistIdsArr.length > 0) {
        const { data: pl } = await supabase.from("LibraryPlaylist").select("*").eq("teacher_id", student.teacher_id).in("id", playlistIdsArr).order("created_at", { ascending: false })
        if (pl) setPlaylists(pl)
      } else {
        setPlaylists([])
      }

      // 3. Cargar contenidos permitidos o pertenecientes a series permitidas
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

  async function handleDragEnd(result: any) {
    if (!result.destination) return
    if (profile?.role !== "TEACHER") return

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index
    
    if (sourceIndex === destinationIndex) return

    // Solo reordenamos dentro del contexto actual (displayItems)
    const activeItemsList = Array.from(displayItems)
    const [reorderedItem] = activeItemsList.splice(sourceIndex, 1)
    activeItemsList.splice(destinationIndex, 0, reorderedItem)

    // Actualizamos los order_index
    const updatedItems = activeItemsList.map((item, index) => ({
      ...item,
      order_index: index
    }))

    // Actualizamos UI optimísticamente
    // Tenemos que mezclar displayItems actualizados con el resto de los items (los de otras playlists)
    setItems(prevItems => {
      const newItems = [...prevItems]
      updatedItems.forEach(updatedItem => {
        const i = newItems.findIndex(it => it.id === updatedItem.id)
        if (i !== -1) newItems[i] = updatedItem
      })
      return newItems.sort((a, b) => a.order_index - b.order_index)
    })

    // Guardar en Supabase en background
    const updates = updatedItems.map(item => ({
      id: item.id,
      order_index: item.order_index
    }))
    
    for (const update of updates) {
      await supabase.from("LibraryContent").update({ order_index: update.order_index }).eq("id", update.id)
    }
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
        order_index: items.length // Lo ponemos al final
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
  }

  async function deletePlaylist(id: string) {
    if (!confirm("¿Seguro que quieres eliminar esta Serie? (Los videos dentro también podrían eliminarse)")) return
    await supabase.from("LibraryPlaylist").delete().eq("id", id)
    setPlaylists(prev => prev.filter(i => i.id !== id))
    setActivePlaylist(null)
  }

  // Filtering Logic
  const filteredPlaylists = playlists.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
  
  // Si estamos dentro de una playlist, solo mostramos sus items
  let displayItems = items.sort((a, b) => a.order_index - b.order_index)
  
  if (activePlaylist) {
    displayItems = displayItems.filter(i => i.playlist_id === activePlaylist)
  } else {
    // Si NO estamos en una playlist, podemos decidir si mostrar TODO o solo los "sueltos"
    // Para simplificar, mostraremos solo los sueltos (sin playlist) en la raíz
    displayItems = items.filter(i => !i.playlist_id)
  }

  // Búsqueda aplica a items
  if (search) {
    displayItems = displayItems.filter(i => 
      i.title.toLowerCase().includes(search.toLowerCase()) || 
      i.category.toLowerCase().includes(search.toLowerCase())
    )
  }

  const typeIcons: Record<string, any> = {
    link: <LinkIcon className="w-4 h-4" />,
    video: <Video className="w-4 h-4" />,
    pdf: <FileText className="w-4 h-4" />,
    image: <BookOpen className="w-4 h-4" />,
    audio: <Music className="w-4 h-4" />
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {activePlaylist ? (
            <div className="flex items-center gap-3">
              <button onClick={() => setActivePlaylist(null)} className="p-2 bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors">
                <span className="text-xl">←</span>
              </button>
              <h1 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight">
                {playlists.find(p => p.id === activePlaylist)?.title}
              </h1>
            </div>
          ) : (
            <>
              <h1 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight">Mi Biblioteca</h1>
              <p className="text-neutral-500 text-sm font-medium mt-1">Series y recursos para tus alumnos.</p>
            </>
          )}
        </div>

        {profile?.role === "TEACHER" && (
          <button 
            onClick={() => { setShowForm(!showForm); setFormMode("item") }}
            className="kh-btn-primary flex items-center justify-center gap-2 px-6 py-3 w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Agregar</span>
          </button>
        )}
      </div>

      {/* CREATION FORM (Solo Profesores) */}
      {showForm && profile?.role === "TEACHER" && (
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex gap-4 mb-6 border-b border-neutral-100 pb-4">
            <button 
              onClick={() => setFormMode("item")}
              className={`font-bold px-4 py-2 rounded-xl transition-all ${formMode === "item" ? "bg-violet-100 text-violet-700" : "text-neutral-500 hover:bg-neutral-50"}`}
            >
              Nuevo Recurso
            </button>
            <button 
              onClick={() => setFormMode("playlist")}
              className={`font-bold px-4 py-2 rounded-xl transition-all ${formMode === "playlist" ? "bg-violet-100 text-violet-700" : "text-neutral-500 hover:bg-neutral-50"}`}
            >
              Crear Serie / Lista
            </button>
          </div>

          {formMode === "playlist" ? (
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="kh-label block mb-1">Nombre de la Serie *</label>
                <input required value={playlistForm.title} onChange={e => setPlaylistForm(p => ({...p, title: e.target.value}))} className="kh-input" placeholder="Ej: Los 40 Rudimentos" />
              </div>
              <div>
                <label className="kh-label block mb-1">Descripción corta</label>
                <input value={playlistForm.description} onChange={e => setPlaylistForm(p => ({...p, description: e.target.value}))} className="kh-input" placeholder="¿De qué trata esta serie?" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="kh-btn-secondary px-6 py-2">Cancelar</button>
                <button type="submit" disabled={saving} className="kh-btn-primary px-8 py-2">{saving ? "Guardando..." : "Crear Serie"}</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCreateItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="kh-label block mb-1">Título del Recurso *</label>
                    <input required value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} className="kh-input" placeholder="Ej: Ejercicio #1" />
                  </div>
                  <div>
                    <label className="kh-label block mb-1">Pertenecer a una Serie (Opcional)</label>
                    <select value={form.playlist_id} onChange={e => setForm(p => ({...p, playlist_id: e.target.value}))} className="kh-input">
                      <option value="">-- Ninguna (Material Suelto) --</option>
                      {playlists.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="kh-label block mb-1">Categoría / Etiqueta</label>
                    <input value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className="kh-input" placeholder="Ej: Warm Up, Técnica, Coordinación..." />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="kh-label block mb-1">Tipo</label>
                      <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))} className="kh-input">
                        <option value="link">Enlace / Web</option>
                        <option value="video">Video (YouTube/Vimeo)</option>
                        <option value="pdf">Documento PDF</option>
                        <option value="audio">Audio / MP3</option>
                      </select>
                    </div>
                    <div>
                      <label className="kh-label block mb-1">{['pdf', 'image', 'audio'].includes(form.type) ? "Archivo" : "URL"}</label>
                      {['pdf', 'image', 'audio'].includes(form.type) ? (
                       <div className="relative overflow-hidden kh-input flex items-center bg-neutral-50 text-xs">
                           <input type="file" onChange={e => {
                             const f = e.target.files?.[0]
                             if (f && f.size > 50 * 1024 * 1024) {
                               alert("El archivo es demasiado grande. El límite máximo es de 50 MB.")
                               e.target.value = ""
                               setFile(null)
                             } else {
                               setFile(f || null)
                             }
                           }} className="absolute inset-0 opacity-0 cursor-pointer" />
                           <span className="truncate">{file ? file.name : "Subir (Máx 50MB)..."}</span>
                        </div>
                      ) : (
                        <input value={form.url} onChange={e => setForm(p => ({...p, url: e.target.value}))} className="kh-input" placeholder="https://..." />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="kh-label block mb-1">Descripción</label>
                    <input value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} className="kh-input" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
                <button type="button" onClick={() => setShowForm(false)} className="kh-btn-secondary px-6 py-2">Cancelar</button>
                <button type="submit" disabled={saving} className="kh-btn-primary px-8 py-2">{saving ? "Guardando..." : "Subir Recurso"}</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* BÚSQUEDA */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <input 
          type="text" 
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por título..."
          className="w-full bg-white border border-neutral-200 rounded-2xl outline-none pl-11 py-3 text-sm font-medium focus:border-violet-400 focus:ring-4 focus:ring-violet-50 transition-all"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
           {[1,2,3].map(i => <div key={i} className="kh-skeleton h-16 rounded-2xl" />)}
        </div>
      ) : (
        <div className="space-y-10">
          
          {/* SECCIÓN DE SERIES (Solo visible si no estamos DENTRO de una serie y hay resultados) */}
          {!activePlaylist && filteredPlaylists.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-neutral-800 flex items-center gap-2">
                <span className="w-2 h-5 bg-violet-500 rounded-full" /> Series y Colecciones
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredPlaylists.map(playlist => (
                  <div 
                    key={playlist.id} 
                    onClick={() => setActivePlaylist(playlist.id)}
                    className="group bg-white rounded-3xl p-5 border border-neutral-200 hover:border-violet-400 hover:shadow-lg cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <h3 className="font-black text-neutral-900 text-lg mb-1">{playlist.title}</h3>
                      <p className="text-sm text-neutral-500 line-clamp-2">{playlist.description || "Colección de recursos"}</p>
                    </div>
                    {profile?.role === "TEACHER" && (
                      <div className="mt-4 flex justify-end">
                        <button onClick={(e) => { e.stopPropagation(); deletePlaylist(playlist.id); }} className="text-neutral-300 hover:text-red-500 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECCIÓN DE RECURSOS (Filas horizontales) */}
          {(displayItems.length > 0 || activePlaylist) && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-neutral-800 flex items-center gap-2">
                <span className={`w-2 h-5 rounded-full ${activePlaylist ? 'bg-amber-500' : 'bg-emerald-500'}`} /> 
                {activePlaylist ? "Contenido de la Serie" : "Material Suelto"}
              </h2>
              
              {displayItems.length === 0 ? (
                <div className="bg-white border border-dashed border-neutral-200 rounded-3xl p-10 text-center">
                  <p className="text-neutral-500 font-medium">No hay recursos en esta lista.</p>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="library-list">
                    {(provided) => (
                      <div 
                        className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm"
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        <div className="divide-y divide-neutral-100">
                          {displayItems.map((item, index) => (
                            <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={profile?.role !== "TEACHER" || search !== ""}>
                              {(provided, snapshot) => (
                                <div 
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`p-4 sm:p-5 flex items-center gap-4 group transition-colors ${snapshot.isDragging ? 'bg-violet-50/80 shadow-lg scale-[1.01] z-50 rounded-2xl border border-violet-100' : 'hover:bg-neutral-50/50'}`}
                                >
                                  {/* Drag Handle */}
                                  {profile?.role === "TEACHER" && !search && (
                                    <div {...provided.dragHandleProps} className="text-neutral-300 hover:text-neutral-500 cursor-grab active:cursor-grabbing p-1 shrink-0">
                                      <GripVertical className="w-5 h-5" />
                                    </div>
                                  )}

                                  {/* Ícono de Tipo */}
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                    item.type === 'video' ? 'bg-red-50 text-red-600' :
                                    item.type === 'pdf' ? 'bg-amber-50 text-amber-600' :
                                    item.type === 'audio' ? 'bg-sky-50 text-sky-600' :
                                    'bg-violet-50 text-violet-600'
                                  }`}>
                                    {typeIcons[item.type] || <LinkIcon className="w-4 h-4" />}
                                  </div>

                                  {/* Info Principal */}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-neutral-900 truncate">{item.title}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-md">
                                        {item.category || item.type}
                                      </span>
                                      {item.description && <span className="text-xs text-neutral-500 truncate hidden sm:inline">{item.description}</span>}
                                    </div>
                                  </div>

                                  {/* Acciones */}
                                  <div className="flex items-center gap-3 shrink-0 pl-2">
                                    {item.url && (
                                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold rounded-xl hover:bg-violet-600 transition-colors">
                                        Ver
                                      </a>
                                    )}
                                    {profile?.role === "TEACHER" && (
                                      <button onClick={() => deleteItem(item.id)} className="p-2 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>
          )}

          {/* Estado Vacío General */}
          {!activePlaylist && filteredPlaylists.length === 0 && displayItems.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-neutral-200">
              <span className="text-5xl opacity-30 mb-4 block">📚</span>
              <p className="text-neutral-900 font-bold text-lg">Biblioteca vacía</p>
              <p className="text-neutral-500 text-sm mt-1">Sube recursos o crea series para organizar el material de tus alumnos.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
