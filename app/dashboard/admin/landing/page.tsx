"use client"

import { useState, useEffect, useRef } from "react"
import AdminShell from "@/components/admin/AdminShell"
import { supabase } from "@/lib/supabase"
import { 
  Save, Plus, Trash, Edit, Star, Upload, Image as ImageIcon, Eye,
  MessageSquare, FileText, Globe, ArrowRight, Check, X, Sparkles
} from "lucide-react"

// Types
interface Testimonial {
  id: string
  name: string
  role: string
  comment: string
  avatar_url: string | null
  rating: number
  order: number
}

interface HeroSettings {
  title: string
  subtitle: string
  cta_text: string
  cta_url: string
}

interface FeaturesSettings {
  title: string
  subtitle: string
}

interface FooterSettings {
  title: string
  subtitle: string
  button_text: string
}

export default function AdminLandingPage() {
  // Tabs: "texts" | "testimonials"
  const [activeTab, setActiveTab] = useState<"texts" | "testimonials">("texts")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Texts CMS state
  const [hero, setHero] = useState<HeroSettings>({
    title: "Lleva tus clases de música al siguiente nivel",
    subtitle: "Conecta con los mejores profesores, organiza tus horarios y accede a material exclusivo en tu biblioteca digital personalizada.",
    cta_text: "Comenzar Ahora",
    cta_url: "/register"
  })

  const [features, setFeatures] = useState<FeaturesSettings>({
    title: "Diseñado para músicos exigentes",
    subtitle: "Todo lo que necesitas en una sola plataforma integrada y fluida."
  })

  const [ctaFooter, setCtaFooter] = useState<FooterSettings>({
    title: "¿Listo para empezar a tocar?",
    subtitle: "Regístrate hoy y transforma tu método de aprendizaje.",
    button_text: "Registrarse Gratis"
  })

  // Testimonials state
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  
  // Testimonial Form Modal/Drawer State
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formName, setFormName] = useState("")
  const [formRole, setFormRole] = useState("")
  const [formComment, setFormComment] = useState("")
  const [formAvatarUrl, setFormAvatarUrl] = useState("")
  const [formRating, setFormRating] = useState(5)
  const [formOrder, setFormOrder] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load database settings & testimonials
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        // 1. Fetch Landing Settings
        const { data: settingsData, error: settingsError } = await supabase
          .from("LandingSetting")
          .select("*")
        
        if (settingsError) throw settingsError

        settingsData?.forEach((row: { key: string; value: any }) => {
          if (row.key === "hero") setHero(row.value)
          if (row.key === "features") setFeatures(row.value)
          if (row.key === "cta_footer") setCtaFooter(row.value)
        })

        // 2. Fetch Testimonials
        const { data: testData, error: testError } = await supabase
          .from("LandingTestimonial")
          .select("*")
          .order("order", { ascending: true })

        if (testError) throw testError
        if (testData) setTestimonials(testData)

      } catch (err: any) {
        console.error("Error al cargar datos del CMS de la Landing:", err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Save General Texts to database
  async function handleSaveTexts() {
    try {
      setSaving(true)
      
      const updates = [
        { key: "hero", value: hero },
        { key: "features", value: features },
        { key: "cta_footer", value: ctaFooter }
      ]

      for (const row of updates) {
        const { error } = await supabase
          .from("LandingSetting")
          .upsert(row, { onConflict: "key" })
        if (error) throw error
      }

      alert("¡Textos de la Landing actualizados exitosamente en producción!")
    } catch (err: any) {
      console.error("Error al guardar configuraciones:", err.message)
      alert(`Error al guardar: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Handle image upload to public 'landing' Supabase bucket
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random().toString(36).slice(2)}_${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("landing")
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Retrieve public URL
      const { data } = supabase.storage
        .from("landing")
        .getPublicUrl(filePath)

      setFormAvatarUrl(data.publicUrl)
      alert("¡Imagen cargada exitosamente!")
    } catch (err: any) {
      console.error("Error al subir imagen:", err.message)
      alert(`Error al subir imagen: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  // Open testimonial form for creating new
  function openAddModal() {
    setEditingId(null)
    setFormName("")
    setFormRole("")
    setFormComment("")
    setFormAvatarUrl("")
    setFormRating(5)
    setFormOrder(testimonials.length + 1)
    setShowFormModal(true)
  }

  // Open testimonial form for editing existing
  function openEditModal(item: Testimonial) {
    setEditingId(item.id)
    setFormName(item.name)
    setFormRole(item.role)
    setFormComment(item.comment)
    setFormAvatarUrl(item.avatar_url || "")
    setFormRating(item.rating)
    setFormOrder(item.order)
    setShowFormModal(true)
  }

  // Submit new/edited testimonial to DB
  async function handleSaveTestimonial(e: React.FormEvent) {
    e.preventDefault()
    if (!formName.trim() || !formRole.trim() || !formComment.trim()) {
      alert("Por favor completa los campos requeridos (Nombre, Especialidad y Comentarios).")
      return
    }

    try {
      setSaving(true)
      
      const rowData = {
        name: formName.trim(),
        role: formRole.trim(),
        comment: formComment.trim(),
        avatar_url: formAvatarUrl.trim() || null,
        rating: formRating,
        order: formOrder
      }

      if (editingId) {
        // Update
        const { error } = await supabase
          .from("LandingTestimonial")
          .update(rowData)
          .eq("id", editingId)

        if (error) throw error
        
        setTestimonials(prev => 
          prev.map(t => t.id === editingId ? { ...t, ...rowData } : t)
            .sort((a, b) => a.order - b.order)
        )
      } else {
        // Create new
        const { data, error } = await supabase
          .from("LandingTestimonial")
          .insert([rowData])
          .select()

        if (error) throw error
        if (data) {
          setTestimonials(prev => [...prev, data[0]].sort((a, b) => a.order - b.order))
        }
      }

      setShowFormModal(false)
      alert("¡Recomendación guardada con éxito!")
    } catch (err: any) {
      console.error("Error al guardar recomendación:", err.message)
      alert(`Error al guardar: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Delete testimonial from DB
  async function handleDeleteTestimonial(id: string, name: string) {
    if (!confirm(`¿Estás seguro de que deseas eliminar la recomendación de "${name}"?`)) return

    try {
      setSaving(true)
      const { error } = await supabase
        .from("LandingTestimonial")
        .delete()
        .eq("id", id)

      if (error) throw error
      setTestimonials(prev => prev.filter(t => t.id !== id))
      alert("¡Recomendación eliminada exitosamente!")
    } catch (err: any) {
      console.error("Error al eliminar recomendación:", err.message)
      alert(`Error al eliminar: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminShell>
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 pb-24 font-sans">
        
        {/* HEADER BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] font-black text-violet-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> CMS Publicitario
            </p>
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Editor de Landing Page</h1>
            <p className="text-sm text-neutral-500 font-semibold mt-1">
              Personaliza en tiempo real los textos, CTAs y recomendaciones visibles en khora.cl
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href="https://khora.cl" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-2xl bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:border-neutral-300 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
            >
              <Globe className="w-4 h-4 text-neutral-400" />
              Ver Sitio Público
            </a>
            {activeTab === "texts" && (
              <button
                onClick={handleSaveTexts}
                disabled={saving}
                className="px-6 py-3 rounded-2xl bg-neutral-900 hover:bg-violet-600 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md shadow-neutral-900/10 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Guardando..." : "Publicar Cambios"}
              </button>
            )}
          </div>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex border-b border-neutral-200 mb-8 gap-6">
          <button
            onClick={() => setActiveTab("texts")}
            className={`pb-4 text-sm font-black transition-all relative ${
              activeTab === "texts"
                ? "text-neutral-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-violet-500 after:rounded-full"
                : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Contenidos y Textos
            </span>
          </button>
          <button
            onClick={() => setActiveTab("testimonials")}
            className={`pb-4 text-sm font-black transition-all relative ${
              activeTab === "testimonials"
                ? "text-neutral-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-violet-500 after:rounded-full"
                : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            <span className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Recomendaciones de Profesores ({testimonials.length})
            </span>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-neutral-100 shadow-sm gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-neutral-200 border-t-violet-600 animate-spin" />
            <p className="text-xs text-neutral-400 font-bold tracking-wider uppercase">Cargando base de datos del sitio...</p>
          </div>
        ) : activeTab === "texts" ? (
          
          /* TEXTS CMS TAB */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Editor Forms */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* HERO SECTION FORM */}
              <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-black text-neutral-900 border-b border-neutral-50 pb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center text-xs">🚀</span>
                  Sección Principal (Hero)
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-1">Título de Impacto</label>
                    <input 
                      type="text"
                      value={hero.title}
                      onChange={e => setHero(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-violet-500 focus:outline-none transition-all"
                      placeholder="Ej: Aprende música a tu ritmo"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-1">Subtítulo Descriptivo</label>
                    <textarea 
                      rows={3}
                      value={hero.subtitle}
                      onChange={e => setHero(prev => ({ ...prev, subtitle: e.target.value }))}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-violet-500 focus:outline-none transition-all resize-none"
                      placeholder="Una explicación concisa de qué hace Khora..."
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-1">Texto del Botón CTA</label>
                      <input 
                        type="text"
                        value={hero.cta_text}
                        onChange={e => setHero(prev => ({ ...prev, cta_text: e.target.value }))}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-violet-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-1">Enlace del Botón</label>
                      <input 
                        type="text"
                        value={hero.cta_url}
                        onChange={e => setHero(prev => ({ ...prev, cta_url: e.target.value }))}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-violet-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* FEATURES SECTION FORM */}
              <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-black text-neutral-900 border-b border-neutral-50 pb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">✨</span>
                  Sección de Características (Features)
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-1">Título de Sección</label>
                    <input 
                      type="text"
                      value={features.title}
                      onChange={e => setFeatures(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-violet-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-1">Subtítulo Acompañante</label>
                    <input 
                      type="text"
                      value={features.subtitle}
                      onChange={e => setFeatures(prev => ({ ...prev, subtitle: e.target.value }))}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-violet-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* CALL TO ACTION SECTION FORM */}
              <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-black text-neutral-900 border-b border-neutral-50 pb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center text-xs">🔥</span>
                  Sección de Registro Inferior (CTA)
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-1">Título Llamativo</label>
                    <input 
                      type="text"
                      value={ctaFooter.title}
                      onChange={e => setCtaFooter(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-violet-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-1">Subtítulo o Promesa</label>
                    <input 
                      type="text"
                      value={ctaFooter.subtitle}
                      onChange={e => setCtaFooter(prev => ({ ...prev, subtitle: e.target.value }))}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-violet-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-1">Texto del Botón</label>
                    <input 
                      type="text"
                      value={ctaFooter.button_text}
                      onChange={e => setCtaFooter(prev => ({ ...prev, button_text: e.target.value }))}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-violet-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* LIVE PREVIEW CONTAINER */}
            <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-4">
              <div className="flex items-center gap-2 text-neutral-500 px-1 font-bold text-xs uppercase tracking-wider">
                <Eye className="w-4 h-4 text-violet-500" /> Vista Previa en Vivo
              </div>

              {/* LIVE SIMULATOR DEVICE */}
              <div className="bg-neutral-900 rounded-[36px] p-3 shadow-2xl border-4 border-neutral-800 relative overflow-hidden aspect-[9/16] max-w-sm mx-auto flex flex-col justify-between">
                
                {/* Simulator Notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-5 bg-neutral-800 rounded-full z-20 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-700/50" />
                </div>

                {/* Simulated Header Navigation */}
                <div className="flex items-center justify-between px-5 pt-8 pb-3 z-10 bg-neutral-950/80 backdrop-blur-sm border-b border-white/5">
                  <span className="text-white font-black text-sm tracking-tight flex items-center gap-1.5">
                    <span className="w-5 h-5 bg-violet-600 rounded-md text-[9px] flex items-center justify-center">K</span>
                    KHORA
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-neutral-400">Ingresar</span>
                    <span className="text-[9px] font-bold text-white bg-violet-600 px-2 py-0.5 rounded-md">Regístrate</span>
                  </div>
                </div>

                {/* Simulated Main Body (Scrollable Look-alike) */}
                <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8 bg-neutral-950 text-white scrollbar-none flex flex-col justify-center">
                  
                  {/* Hero Preview */}
                  <div className="text-center space-y-3 pt-4">
                    <span className="text-[9px] font-black text-violet-400 uppercase tracking-widest bg-violet-500/10 px-2 py-0.5 rounded-full">Portal Premium</span>
                    <h2 className="text-lg md:text-xl font-black leading-tight tracking-tight text-white line-clamp-4">
                      {hero.title || "Tu Título Aquí"}
                    </h2>
                    <p className="text-[10px] text-neutral-400 font-medium leading-relaxed px-2 line-clamp-3">
                      {hero.subtitle || "Escribe un subtítulo descriptivo para tus visitas."}
                    </p>
                    <div className="pt-2">
                      <span className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-black rounded-xl inline-flex items-center gap-1.5 shadow-md shadow-violet-600/20 cursor-pointer">
                        {hero.cta_text || "Comenzar"}
                        <ArrowRight className="w-3 h-3 stroke-[3]" />
                      </span>
                    </div>
                  </div>

                  {/* Feature Divider */}
                  <div className="border-t border-white/5 pt-6 text-center space-y-2">
                    <h3 className="text-xs font-black tracking-tight text-white">{features.title || "Características"}</h3>
                    <p className="text-[9px] text-neutral-500">{features.subtitle}</p>
                  </div>

                  {/* CTA Footer Preview */}
                  <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-4 text-center space-y-2">
                    <h4 className="text-xs font-black text-white">{ctaFooter.title}</h4>
                    <p className="text-[9px] text-neutral-400">{ctaFooter.subtitle}</p>
                    <span className="w-full py-1.5 bg-white text-neutral-900 text-[9px] font-black rounded-lg inline-block cursor-pointer">
                      {ctaFooter.button_text}
                    </span>
                  </div>

                </div>

                {/* Simulated Footer */}
                <div className="text-center py-3 bg-neutral-950 border-t border-white/5 z-10 text-[8px] text-neutral-600 font-medium">
                  © 2026 Khora.cl • Todos los derechos reservados.
                </div>

              </div>
            </div>

          </div>

        ) : (
          
          /* TESTIMONIALS TAB */
          <div className="space-y-6">
            
            {/* Action Bar */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-neutral-900">Recomendaciones del Carrusel</h3>
                <p className="text-xs text-neutral-500 font-medium mt-0.5">
                  Gestiona las opiniones de los profesores asociadas a tu landing page.
                </p>
              </div>
              <button
                onClick={openAddModal}
                className="px-5 py-3 rounded-2xl bg-neutral-900 hover:bg-violet-600 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                Agregar Recomendación
              </button>
            </div>

            {/* Testimonials List Grid */}
            {testimonials.length === 0 ? (
              <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-12 text-center">
                <p className="text-sm text-neutral-400 font-bold italic">No hay testimonios agregados.</p>
                <button onClick={openAddModal} className="mt-4 px-5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl transition-all">
                  Crear el primero
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map(item => (
                  <div 
                    key={item.id}
                    className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all relative group"
                  >
                    {/* Top block */}
                    <div className="space-y-4">
                      {/* Order Indicator Badge */}
                      <span className="absolute top-4 right-4 bg-neutral-100 text-neutral-600 font-bold text-[10px] px-2 py-0.5 rounded-full">
                        Orden #{item.order}
                      </span>

                      {/* Stars Rating */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${
                              i < item.rating ? "text-amber-400 fill-amber-400" : "text-neutral-200"
                            }`} 
                          />
                        ))}
                      </div>

                      {/* Comment Quote */}
                      <p className="text-sm font-semibold italic text-neutral-600 leading-relaxed line-clamp-4 pt-1">
                        "{item.comment}"
                      </p>
                    </div>

                    {/* Teacher profile line */}
                    <div className="flex items-center justify-between border-t border-neutral-50 pt-5 mt-5">
                      <div className="flex items-center gap-3">
                        {item.avatar_url ? (
                          <img 
                            src={item.avatar_url} 
                            alt={item.name}
                            className="w-10 h-10 rounded-full object-cover border border-neutral-200 shadow-sm flex-shrink-0"
                            onError={(e) => {
                              // If image fails, clear avatar source to display initial
                              (e.target as HTMLImageElement).src = ""
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 font-black flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-sm font-black text-neutral-900 truncate">{item.name}</h4>
                          <p className="text-[10px] font-bold text-neutral-400 truncate">{item.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(item)}
                          className="w-8 h-8 rounded-xl bg-neutral-50 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 flex items-center justify-center transition-all"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTestimonial(item.id, item.name)}
                          className="w-8 h-8 rounded-xl bg-red-50 text-red-600 hover:text-red-700 hover:bg-red-100 flex items-center justify-center transition-all"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>

      {/* ADD / EDIT TESTIMONIAL MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            onClick={e => e.stopPropagation()} 
            className="bg-white rounded-3xl border border-neutral-100 shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
          >
            {/* MODAL HEADER */}
            <div className="p-6 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-neutral-900">
                  {editingId ? "Editar Recomendación" : "Agregar Recomendación"}
                </h3>
                <p className="text-xs text-neutral-400 font-semibold mt-0.5">
                  Carga la información del profesor y su testimonio
                </p>
              </div>
              <button 
                onClick={() => setShowFormModal(false)}
                className="w-8 h-8 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* MODAL FORM BODY */}
            <form onSubmit={handleSaveTestimonial} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-1">Nombre Completo *</label>
                  <input 
                    type="text" 
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="Ej: Francisco Silva"
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-violet-500 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-1">Especialidad / Rol *</label>
                  <input 
                    type="text" 
                    required
                    value={formRole}
                    onChange={e => setFormRole(e.target.value)}
                    placeholder="Ej: Profesor de Batería"
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-violet-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-1">Comentario / Recomendación *</label>
                <textarea 
                  rows={4} 
                  required
                  value={formComment}
                  onChange={e => setFormComment(e.target.value)}
                  placeholder="Escribe la opinión o reseña que dirá este profesor..."
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-violet-500 focus:outline-none transition-all resize-none"
                />
              </div>

              {/* AVATAR UPLOAD SECTION */}
              <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 space-y-3">
                <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider">
                  Foto de Perfil del Profesor
                </label>
                <div className="flex items-center gap-4">
                  {formAvatarUrl ? (
                    <img 
                      src={formAvatarUrl} 
                      alt="Avatar" 
                      className="w-12 h-12 rounded-full object-cover border border-neutral-200 shadow-sm flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-violet-100 text-violet-600 font-black flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                      ?
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-4 py-2 bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {uploading ? "Subiendo..." : "Subir Foto"}
                      </button>
                      {formAvatarUrl && (
                        <button
                          type="button"
                          onClick={() => setFormAvatarUrl("")}
                          className="px-3 py-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden" 
                    />
                    <input 
                      type="text" 
                      value={formAvatarUrl}
                      onChange={e => setFormAvatarUrl(e.target.value)}
                      placeholder="Pegar enlace de imagen directamente (opcional)..."
                      className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-bold text-neutral-700 placeholder:text-neutral-400 focus:border-violet-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* STAR RATING */}
                <div>
                  <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-1">Calificación (Estrellas)</label>
                  <div className="flex items-center gap-1 h-10 px-2 bg-neutral-50 rounded-xl border border-neutral-200">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setFormRating(i + 1)}
                        className="p-1 text-neutral-400 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-5 h-5 ${i < formRating ? "text-amber-400 fill-amber-400" : "text-neutral-200"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* SORT ORDER */}
                <div>
                  <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-1">Orden de Visualización</label>
                  <input 
                    type="number" 
                    value={formOrder}
                    onChange={e => setFormOrder(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-800 focus:bg-white focus:border-violet-500 focus:outline-none transition-all h-10"
                  />
                </div>
              </div>

              {/* MODAL FOOTER BUTTONS */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-black text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-7 py-2.5 bg-neutral-900 hover:bg-violet-600 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-neutral-900/10 disabled:opacity-50"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  {saving ? "Guardando..." : "Confirmar"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </AdminShell>
  )
}
