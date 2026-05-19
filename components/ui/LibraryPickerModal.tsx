"use client"

import { useState, useMemo } from "react"
import { Search, X, Check, FileText, PlayCircle, BookOpen, ExternalLink, Link as LinkIcon } from "lucide-react"

interface LibraryItem {
  id: string
  title: string
  category: string
  type: string
  url?: string
}

interface Playlist {
  id: string
  title: string
  description?: string | null
}

interface SelectedItem {
  id: string
  title: string
  type: string
  isPlaylist: boolean
}

interface LibraryPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (selectedId: string, item: SelectedItem) => void
  library: LibraryItem[]
  playlists: Playlist[]
  currentSelectedId?: string
}

export default function LibraryPickerModal({
  isOpen,
  onClose,
  onSelect,
  library,
  playlists,
  currentSelectedId
}: LibraryPickerModalProps) {
  const [activeTab, setActiveTab] = useState<"playlists" | "items">("playlists")
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas")
  const [tempSelectedId, setTempSelectedId] = useState<string>(currentSelectedId || "")

  // Extract unique categories from library
  const categories = useMemo(() => {
    const cats = new Set<string>()
    library.forEach(item => {
      if (item.category) cats.add(item.category)
    })
    return ["Todas", ...Array.from(cats)]
  }, [library])

  // Filter playlists
  const filteredPlaylists = useMemo(() => {
    if (!search.trim()) return playlists
    const q = search.toLowerCase()
    return playlists.filter(p => 
      p.title.toLowerCase().includes(q) || 
      (p.description && p.description.toLowerCase().includes(q))
    )
  }, [playlists, search])

  // Filter library items
  const filteredLibrary = useMemo(() => {
    return library.filter(item => {
      const matchSearch = !search.trim() || item.title.toLowerCase().includes(search.toLowerCase())
      const matchCategory = selectedCategory === "Todas" || item.category === selectedCategory
      return matchSearch && matchCategory
    })
  }, [library, search, selectedCategory])

  if (!isOpen) return null

  function handleConfirm() {
    if (!tempSelectedId) return
    const isPlaylist = tempSelectedId.startsWith("playlist_")
    const rawId = isPlaylist ? tempSelectedId.replace("playlist_", "") : tempSelectedId.replace("item_", "")
    
    if (isPlaylist) {
      const pl = playlists.find(p => p.id === rawId)
      if (pl) {
        onSelect(tempSelectedId, { id: pl.id, title: pl.title, type: "playlist", isPlaylist: true })
      }
    } else {
      const it = library.find(i => i.id === rawId)
      if (it) {
        onSelect(tempSelectedId, { id: it.id, title: it.title, type: it.type, isPlaylist: false })
      }
    }
    onClose()
  }

  function handleClear() {
    onSelect("", { id: "", title: "", type: "", isPlaylist: false })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        onClick={e => e.stopPropagation()} 
        className="bg-white rounded-[32px] md:rounded-[40px] border border-neutral-100 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* HEADER */}
        <div className="p-6 md:p-8 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-neutral-900 flex items-center gap-3">
              <span className="w-10 h-10 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center text-lg">📚</span>
              Seleccionar Material
            </h2>
            <p className="text-xs md:text-sm text-neutral-500 font-medium mt-1">
              Explora y asigna material o series completas de tu biblioteca
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SEARCH & TABS */}
        <div className="p-6 md:px-8 border-b border-neutral-100 space-y-4 bg-white">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por título o palabras clave..."
              className="w-full pl-11 pr-10 py-3.5 bg-neutral-100/80 border border-neutral-200/60 rounded-2xl text-sm font-bold text-neutral-900 placeholder:text-neutral-400 outline-none focus:bg-white focus:border-violet-500 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex bg-neutral-100 p-1.5 rounded-2xl gap-1">
            <button
              onClick={() => setActiveTab("playlists")}
              className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === "playlists"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-500" />
              Series Completas ({playlists.length})
            </button>
            <button
              onClick={() => setActiveTab("items")}
              className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === "items"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <FileText className="w-4 h-4 text-violet-500" />
              Material Individual ({library.length})
            </button>
          </div>

          {activeTab === "items" && categories.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    selectedCategory === cat
                      ? "bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-600/20"
                      : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CONTENT LIST */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-3 bg-neutral-50/30 min-h-[250px]">
          {activeTab === "playlists" ? (
            filteredPlaylists.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-neutral-400 font-bold italic">No se encontraron series</p>
              </div>
            ) : (
              filteredPlaylists.map(pl => {
                const isSelected = tempSelectedId === `playlist_${pl.id}`
                return (
                  <div
                    key={pl.id}
                    onClick={() => setTempSelectedId(`playlist_${pl.id}`)}
                    className={`p-4 md:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected 
                        ? "bg-indigo-50/80 border-indigo-500 shadow-md shadow-indigo-500/10 ring-2 ring-indigo-500/20" 
                        : "bg-white border-neutral-100 hover:border-neutral-200 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl font-bold transition-colors ${
                        isSelected ? "bg-indigo-600 text-white shadow-sm" : "bg-indigo-50 text-indigo-600"
                      }`}>
                        📚
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-neutral-900 text-sm md:text-base truncate">{pl.title}</h4>
                        {pl.description && <p className="text-xs text-neutral-500 font-medium line-clamp-1 mt-0.5">{pl.description}</p>}
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-wider mt-1 inline-block">Serie Completa</span>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border transition-colors ${
                      isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-neutral-300 bg-white"
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                )
              })
            )
          ) : (
            filteredLibrary.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-neutral-400 font-bold italic">No se encontraron contenidos</p>
              </div>
            ) : (
              filteredLibrary.map(item => {
                const isSelected = tempSelectedId === `item_${item.id}`
                const isVideo = item.type === "video"
                return (
                  <div
                    key={item.id}
                    onClick={() => setTempSelectedId(`item_${item.id}`)}
                    className={`p-4 md:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected 
                        ? "bg-violet-50/80 border-violet-500 shadow-md shadow-violet-500/10 ring-2 ring-violet-500/20" 
                        : "bg-white border-neutral-100 hover:border-neutral-200 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected ? "bg-violet-600 text-white shadow-sm" : "bg-violet-50 text-violet-600"
                      }`}>
                        {isVideo ? <PlayCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-neutral-900 text-sm md:text-base truncate">{item.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">{item.category}</span>
                          <span className="text-[10px] font-bold text-violet-600 uppercase tracking-widest">{item.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border transition-colors ${
                      isSelected ? "bg-violet-600 border-violet-600 text-white" : "border-neutral-300 bg-white"
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                )
              })
            )
          )}
        </div>

        {/* FOOTER */}
        <div className="p-6 md:px-8 border-t border-neutral-100 bg-white flex items-center justify-between gap-4">
          {currentSelectedId ? (
            <button 
              onClick={handleClear}
              className="px-5 py-3 rounded-2xl text-xs font-black text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
            >
              Quitar Selección
            </button>
          ) : <div />}
          <div className="flex items-center gap-3 ml-auto">
            <button 
              onClick={onClose} 
              className="px-6 py-3 bg-neutral-100 text-neutral-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-neutral-200 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleConfirm}
              disabled={!tempSelectedId}
              className="px-8 py-3 bg-neutral-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-violet-600 disabled:opacity-30 shadow-lg shadow-neutral-900/10 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
