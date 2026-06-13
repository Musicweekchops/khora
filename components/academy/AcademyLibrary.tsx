"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase"

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
  created_at: string
}

interface Props {
  academyId: string
}

export default function AcademyLibrary({ academyId }: Props) {
  const [items, setItems] = useState<Content[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activePlaylist, setActivePlaylist] = useState<string | null>(null)

  // Creation forms states
  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState<"item" | "playlist">("item")
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
    if (academyId) {
      loadLibrary()
    }
  }, [academyId])

  async function loadLibrary() {
    setLoading(true)
    try {
      const [resItems, resPlaylists] = await Promise.all([
        supabase
          .from("LibraryContent")
          .select("*")
          .eq("academy_id", academyId)
          .order("created_at", { ascending: false }),
        supabase
          .from("LibraryPlaylist")
          .select("*")
          .eq("academy_id", academyId)
          .order("created_at", { ascending: false })
      ])

      if (resItems.data) setItems(resItems.data)
      if (resPlaylists.data) setPlaylists(resPlaylists.data)
    } catch (err) {
      console.error("Error loading academy library:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreatePlaylist(e: React.FormEvent) {
    e.preventDefault()
    if (!playlistForm.title.trim()) return
    setSaving(true)

    try {
      const { error } = await supabase.from("LibraryPlaylist").insert({
        academy_id: academyId,
        title: playlistForm.title.trim(),
        description: playlistForm.description.trim() || null
      })

      if (!error) {
        setPlaylistForm({ title: "", description: "" })
        setShowForm(false)
        loadLibrary()
      } else {
        alert("Error al crear la colección.")
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
        const path = `academy/${academyId}/${fileName}`

        const { error: uploadError } = await supabase.storage.from('materials').upload(path, file)
        if (uploadError) throw uploadError

        filePath = path
        const { data: { publicUrl } } = supabase.storage.from('materials').getPublicUrl(path)
        finalUrl = publicUrl
      }

      const { error } = await supabase.from("LibraryContent").insert({
        academy_id: academyId,
        title: form.title.trim(),
        description: form.description.trim() || null,
        type: form.type,
        url: finalUrl,
        file_path: filePath,
        category: form.category,
        playlist_id: form.playlist_id || null
      })

      if (!error) {
        setForm({ title: "", description: "", type: "link", url: "", category: "General", playlist_id: "" })
        setFile(null)
        setShowForm(false)
        loadLibrary()
      } else {
        alert("Error al guardar el recurso: " + error.message)
      }
    } catch (err) {
      console.error("Upload error:", err)
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
    if (!confirm("¿Seguro que quieres eliminar esta colección?")) return
    await supabase.from("LibraryPlaylist").delete().eq("id", id)
    setPlaylists(prev => prev.filter(i => i.id !== id))
    setActivePlaylist(null)
  }

  const filteredPlaylists = playlists.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
  
  let displayItems = items
  if (activePlaylist) {
    displayItems = displayItems.filter(i => i.playlist_id === activePlaylist)
  } else {
    displayItems = displayItems.filter(i => !i.playlist_id)
  }

  if (search) {
    displayItems = displayItems.filter(i =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      (i.description && i.description.toLowerCase().includes(search.toLowerCase()))
    )
  }

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {activePlaylist ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActivePlaylist(null)}
              className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-lg transition-colors"
            >
              ← Volver
            </button>
            <h2 className="text-lg font-bold text-neutral-900">
              {playlists.find(p => p.id === activePlaylist)?.title}
            </h2>
          </div>
        ) : (
          <div className="relative flex-1 max-w-sm">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar recursos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all bg-white"
            />
          </div>
        )}

        <button
          onClick={() => {
            setShowForm(!showForm)
            setFormMode("item")
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Añadir Recurso
        </button>
      </div>

      {/* Creation form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm space-y-4">
          <div className="flex border-b border-neutral-100 pb-2 gap-4">
            <button
              onClick={() => setFormMode("item")}
              className={`pb-2 text-xs font-bold transition-all relative ${formMode === "item" ? "text-neutral-900 border-b-2 border-emerald-600" : "text-neutral-400"}`}
            >
              Nuevo Material
            </button>
            <button
              onClick={() => setFormMode("playlist")}
              className={`pb-2 text-xs font-bold transition-all relative ${formMode === "playlist" ? "text-neutral-900 border-b-2 border-emerald-600" : "text-neutral-400"}`}
            >
              Nueva Colección
            </button>
          </div>

          {formMode === "playlist" ? (
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase mb-1">Nombre de la Colección</label>
                <input
                  required value={playlistForm.title} onChange={e => setPlaylistForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                  placeholder="Ej: Repertorio de Guitarra Avanzada"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase mb-1">Descripción</label>
                <input
                  value={playlistForm.description} onChange={e => setPlaylistForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                  placeholder="Ej: Material de estudio técnico y piezas avanzadas"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-neutral-100 text-neutral-600 text-xs font-bold rounded-lg hover:bg-neutral-200">Cancelar</button>
                <button type="submit" disabled={saving} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg">{saving ? "Guardando..." : "Crear Colección"}</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCreateItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 uppercase mb-1">Título</label>
                  <input
                    required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                    placeholder="Ej: Partitura de Let It Be"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 uppercase mb-1">Colección</label>
                  <select
                    value={form.playlist_id} onChange={e => setForm(p => ({ ...p, playlist_id: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                  >
                    <option value="">Ninguna (Material Suelto)</option>
                    {playlists.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 uppercase mb-1">Tipo de Material</label>
                  <select
                    value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                  >
                    <option value="link">🔗 Enlace Web / YouTube</option>
                    <option value="pdf">📄 Archivo PDF / Imagen</option>
                    <option value="audio">🎵 Archivo de Audio</option>
                    <option value="video">📹 Archivo de Video</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  {form.type === "link" ? (
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500 uppercase mb-1">Enlace / URL</label>
                      <input
                        required value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500 uppercase mb-1">Subir Archivo</label>
                      <input
                        type="file" 
                        ref={fileInputRef} 
                        required 
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
                        className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-neutral-50 file:text-neutral-700 hover:file:bg-neutral-100"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase mb-1">Categoría / Etiqueta</label>
                <input
                  value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                  placeholder="Ej: Tecnica, Cancion, Ejercicio"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-neutral-100 text-neutral-600 text-xs font-bold rounded-lg hover:bg-neutral-200">Cancelar</button>
                <button type="submit" disabled={saving} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg">{saving ? "Subiendo..." : "Guardar Recurso"}</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Playlists / Collections Row */}
      {!activePlaylist && filteredPlaylists.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Colecciones / Series</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredPlaylists.map(p => (
              <div
                key={p.id}
                className="bg-white border border-neutral-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                onClick={() => setActivePlaylist(p.id)}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-3">📚</div>
                  <h4 className="font-semibold text-neutral-900 text-sm truncate">{p.title}</h4>
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{p.description || "Sin descripción"}</p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-50">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase">Abrir colección →</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deletePlaylist(p.id) }}
                    className="p-1 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Library Resources Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
          {activePlaylist ? "Materiales en esta colección" : "Materiales Sueltos / Independientes"}
        </h3>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-neutral-100 rounded-2xl" />)}
          </div>
        ) : displayItems.length === 0 ? (
          <div className="bg-white border border-neutral-100 rounded-2xl p-16 text-center shadow-sm">
            <p className="text-sm font-medium text-neutral-500">No hay materiales cargados en esta sección.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {displayItems.map(item => (
              <div key={item.id} className="bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group">
                <div className="p-4 flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-bold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full uppercase truncate max-w-[120px]">
                      {item.category || "General"}
                    </span>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-1 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                  <h4 className="font-semibold text-neutral-900 text-sm line-clamp-2">{item.title}</h4>
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{item.description}</p>
                </div>

                <div className="px-4 py-3 bg-neutral-50/50 border-t border-neutral-50 flex items-center justify-between text-xs">
                  <span className="capitalize font-medium text-neutral-500 flex items-center gap-1">
                    {item.type === "link" ? "🔗 Enlace" : item.type === "pdf" ? "📄 PDF" : item.type === "audio" ? "🎵 Audio" : "📹 Video"}
                  </span>
                  {item.url && (
                    <a
                      href={item.url} target="_blank" rel="noopener noreferrer"
                      className="text-emerald-600 font-bold hover:underline"
                    >
                      Ver recurso →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
