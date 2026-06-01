"use client"

import React, { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/context/AuthContext"
import { useToast } from "@/components/ui/Toast"
import {
  ShoppingBag,
  PlusCircle,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle,
  ExternalLink,
  Award,
  Sparkles,
  Info,
  X,
  CreditCard,
  Video,
  FileText,
  ChevronDown,
  ChevronUp,
  Link2
} from "lucide-react"

interface Product {
  id: string
  teacher_id: string
  title: string
  description: string | null
  price: number
  content_url: string
  is_active: boolean
  type: "COURSE" | "PLAN"
  duration_months: number
  created_at: string
}

interface Lesson {
  id: string
  product_id: string
  title: string
  description: string | null
  video_url: string
  sort_order: number
  created_at: string
}

interface ProductResource {
  id: string
  product_id: string
  title: string
  download_url: string
  created_at: string
}

interface Purchase {
  id: string
  student_id: string
  product_id: string
  teacher_id: string
  amount_paid: number
  payment_method: "MERCADOPAGO" | "MANUAL_TRANSFER" | "MANUAL_CASH" | "OTHER"
  purchase_date: string
  mp_payment_id: string | null
  status: string
  created_at: string
  StudentProfile?: {
    User?: {
      name: string
      email: string
    } | null
  } | null
  Product?: {
    title: string
    type: string
  } | null
}

interface Student {
  id: string
  User?: {
    name: string
    email: string
  } | null
}

export default function ProductosPage() {
  const { profile } = useAuth()
  const { toast } = useToast()

  const [products, setProducts] = useState<Product[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [resources, setResources] = useState<ProductResource[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  // Track expanded product for Lesson/Resource management
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null)

  // Form States for creating a product
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newPrice, setNewPrice] = useState("")
  const [newContentUrl, setNewContentUrl] = useState("")
  const [newType, setNewType] = useState<"COURSE" | "PLAN">("COURSE")
  const [newDuration, setNewDuration] = useState<number>(1)
  const [submittingProduct, setSubmittingProduct] = useState(false)

  // Form States for creating a lesson
  const [lessonTitle, setLessonTitle] = useState("")
  const [lessonDescription, setLessonDescription] = useState("")
  const [lessonVideoUrl, setLessonVideoUrl] = useState("")
  const [lessonOrder, setLessonOrder] = useState("0")
  const [submittingLesson, setSubmittingLesson] = useState(false)

  // Form States for creating a resource
  const [resourceTitle, setResourceTitle] = useState("")
  const [resourceDownloadUrl, setResourceDownloadUrl] = useState("")
  const [submittingResource, setSubmittingResource] = useState(false)

  // Manual Sale Modal States
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState("")
  const [selectedProductId, setSelectedProductId] = useState("")
  const [manualAmount, setManualAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"MANUAL_TRANSFER" | "MANUAL_CASH" | "OTHER">("MANUAL_TRANSFER")
  const [submittingSale, setSubmittingSale] = useState(false)
  const [copiedProductId, setCopiedProductId] = useState<string | null>(null)

  const isArnaldo = profile?.email === "arnaldoallende@hotmail.com"

  function copyProductLink(productId: string) {
    const url = `${window.location.origin}/comprar?id=${productId}`
    navigator.clipboard.writeText(url).then(() => {
      setCopiedProductId(productId)
      toast("¡Link de pago copiado al portapapeles! Pégalo en WhatsApp o correo.", "success")
      setTimeout(() => setCopiedProductId(null), 3000)
    }).catch(() => {
      // Fallback
      const ta = document.createElement("textarea")
      ta.value = `${window.location.origin}/comprar?id=${productId}`
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
      toast("Link copiado.", "success")
      setCopiedProductId(productId)
      setTimeout(() => setCopiedProductId(null), 3000)
    })
  }

  useEffect(() => {
    if (profile?.teacherProfileId && isArnaldo) {
      loadData()
    }
  }, [profile?.teacherProfileId])

  async function loadData() {
    setLoading(true)
    try {
      // 1. Fetch Products
      const { data: prodData, error: prodErr } = await supabase
        .from("Product")
        .select("*")
        .eq("teacher_id", profile?.teacherProfileId)
        .order("created_at", { ascending: false })

      if (prodErr) throw prodErr
      setProducts(prodData || [])

      // 2. Fetch Lessons
      const { data: lessData, error: lessErr } = await supabase
        .from("Lesson")
        .select("*")
        .order("sort_order", { ascending: true })

      if (lessErr) throw lessErr
      setLessons(lessData || [])

      // 3. Fetch Resources
      const { data: rescData, error: rescErr } = await supabase
        .from("ProductResource")
        .select("*")
        .order("created_at", { ascending: false })

      if (rescErr) throw rescErr
      setResources(rescData || [])

      // 4. Fetch Purchases (Digital Sales)
      const { data: purcData, error: purcErr } = await supabase
        .from("Purchase")
        .select(`
          id,
          student_id,
          product_id,
          teacher_id,
          amount_paid,
          payment_method,
          purchase_date,
          mp_payment_id,
          status,
          created_at,
          StudentProfile (
            User (
              name,
              email
            )
          ),
          Product (
            title,
            type
          )
        `)
        .eq("teacher_id", profile?.teacherProfileId)
        .order("created_at", { ascending: false })

      if (purcErr) throw purcErr
      setPurchases(purcData as any[] || [])

      // 5. Fetch Students for manual registration dropdown
      const { data: studData, error: studErr } = await supabase
        .from("StudentProfile")
        .select(`
          id,
          User (
            name,
            email
          )
        `)
        .eq("teacher_id", profile?.teacherProfileId)

      if (studErr) throw studErr
      setStudents(studData as any[] || [])
    } catch (err: any) {
      console.error("Error loading products data:", err)
      toast("Error al cargar la información", "error")
    } finally {
      setLoading(false)
    }
  }

  // Pre-fill price when selecting a product in the manual modal
  useEffect(() => {
    if (selectedProductId) {
      const prod = products.find(p => p.id === selectedProductId)
      if (prod) {
        setManualAmount(prod.price.toString())
      }
    }
  }, [selectedProductId, products])

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newPrice.trim()) {
      toast("Por favor rellena los campos obligatorios.", "error")
      return
    }

    setSubmittingProduct(true)
    try {
      const { data, error } = await supabase
        .from("Product")
        .insert({
          teacher_id: profile?.teacherProfileId,
          title: newTitle.trim(),
          description: newDescription.trim() || null,
          price: parseInt(newPrice, 10),
          content_url: newContentUrl.trim() || "https://khora.cl",
          type: newType,
          duration_months: newType === "PLAN" ? newDuration : 1,
          is_active: true
        })
        .select()
        .single()

      if (error) throw error

      setProducts(prev => [data, ...prev])
      toast("¡Producto creado exitosamente!", "success")
      
      // Reset Form
      setNewTitle("")
      setNewDescription("")
      setNewPrice("")
      setNewContentUrl("")
      setNewType("COURSE")
      setNewDuration(1)
    } catch (err: any) {
      toast(`Error al crear producto: ${err.message}`, "error")
    } finally {
      setSubmittingProduct(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este producto? Esto podría afectar a los accesos históricos de alumnos si dependían de él.")) return

    try {
      const { error } = await supabase
        .from("Product")
        .delete()
        .eq("id", id)

      if (error) throw error

      setProducts(prev => prev.filter(p => p.id !== id))
      if (expandedProductId === id) setExpandedProductId(null)
      toast("Producto eliminado con éxito", "success")
    } catch (err: any) {
      toast(`Error al eliminar producto: ${err.message}`, "error")
    }
  }

  const handleToggleActive = async (product: Product) => {
    try {
      const { error } = await supabase
        .from("Product")
        .update({ is_active: !product.is_active })
        .eq("id", product.id)

      if (error) throw error

      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_active: !p.is_active } : p))
      toast(`Producto ${!product.is_active ? "activado" : "desactivado"} exitosamente`, "success")
    } catch (err: any) {
      toast(`Error al actualizar estado: ${err.message}`, "error")
    }
  }

  // --- LESSON CRUD FUNCTIONS ---
  const handleAddLesson = async (e: React.FormEvent, productId: string) => {
    e.preventDefault()
    if (!lessonTitle.trim() || !lessonVideoUrl.trim()) {
      toast("Por favor rellena el título y la URL del video de la clase.", "error")
      return
    }

    setSubmittingLesson(true)
    try {
      const { data, error } = await supabase
        .from("Lesson")
        .insert({
          product_id: productId,
          title: lessonTitle.trim(),
          description: lessonDescription.trim() || null,
          video_url: lessonVideoUrl.trim(),
          sort_order: parseInt(lessonOrder, 10) || 0
        })
        .select()
        .single()

      if (error) throw error

      setLessons(prev => [...prev, data].sort((a, b) => a.sort_order - b.sort_order))
      toast("¡Clase agregada al curso!", "success")
      
      // Reset Form
      setLessonTitle("")
      setLessonDescription("")
      setLessonVideoUrl("")
      setLessonOrder("0")
    } catch (err: any) {
      toast(`Error al agregar clase: ${err.message}`, "error")
    } finally {
      setSubmittingLesson(false)
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta clase del curso?")) return

    try {
      const { error } = await supabase
        .from("Lesson")
        .delete()
        .eq("id", lessonId)

      if (error) throw error

      setLessons(prev => prev.filter(l => l.id !== lessonId))
      toast("Clase eliminada del curso", "success")
    } catch (err: any) {
      toast(`Error al eliminar clase: ${err.message}`, "error")
    }
  }

  // --- RESOURCE CRUD FUNCTIONS ---
  const handleAddResource = async (e: React.FormEvent, productId: string) => {
    e.preventDefault()
    if (!resourceTitle.trim() || !resourceDownloadUrl.trim()) {
      toast("Por favor rellena el título y la URL del material.", "error")
      return
    }

    setSubmittingResource(true)
    try {
      const { data, error } = await supabase
        .from("ProductResource")
        .insert({
          product_id: productId,
          title: resourceTitle.trim(),
          download_url: resourceDownloadUrl.trim()
        })
        .select()
        .single()

      if (error) throw error

      setResources(prev => [data, ...prev])
      toast("¡Recurso descargable agregado!", "success")
      
      // Reset Form
      setResourceTitle("")
      setResourceDownloadUrl("")
    } catch (err: any) {
      toast(`Error al agregar recurso: ${err.message}`, "error")
    } finally {
      setSubmittingResource(false)
    }
  }

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm("¿Seguro que deseas eliminar este material de descarga?")) return

    try {
      const { error } = await supabase
        .from("ProductResource")
        .delete()
        .eq("id", resourceId)

      if (error) throw error

      setResources(prev => prev.filter(r => r.id !== resourceId))
      toast("Recurso eliminado", "success")
    } catch (err: any) {
      toast(`Error al eliminar recurso: ${err.message}`, "error")
    }
  }

  const handleRegisterManualSale = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudentId || !selectedProductId || !manualAmount.trim()) {
      toast("Por favor selecciona un alumno, un producto y el monto pagado.", "error")
      return
    }

    setSubmittingSale(true)
    try {
      const prod = products.find(p => p.id === selectedProductId)
      if (!prod) throw new Error("Producto no encontrado.")

      // Calculate expiration date for subscription plans
      let subscription_expires_at: string | null = null
      if (prod.type === "PLAN") {
        const months = Number(prod.duration_months || 1)
        const expDate = new Date()
        expDate.setMonth(expDate.getMonth() + months)
        subscription_expires_at = expDate.toISOString()
      }

      // 1. Insert Purchase
      const { data, error } = await supabase
        .from("Purchase")
        .insert({
          student_id: selectedStudentId,
          product_id: selectedProductId,
          teacher_id: profile?.teacherProfileId,
          amount_paid: parseInt(manualAmount, 10),
          payment_method: paymentMethod,
          status: "COMPLETED"
        })
        .select(`
          id,
          student_id,
          product_id,
          teacher_id,
          amount_paid,
          payment_method,
          purchase_date,
          mp_payment_id,
          status,
          created_at,
          StudentProfile (
            User (
              name,
              email
            )
          ),
          Product (
            title,
            type
          )
        `)
        .single()

      if (error) {
        if (error.code === "23505") {
          throw new Error("Este alumno ya tiene registrado un acceso o compra para este producto.")
        }
        throw error
      }

      // 2. Update Student Profile if it's a Subscription Plan
      if (prod.type === "PLAN") {
        await supabase
          .from("StudentProfile")
          .update({
            status: "ACTIVE",
            subscription_expires_at: subscription_expires_at
          })
          .eq("id", selectedStudentId)
      }

      setPurchases(prev => [data as any, ...prev])
      
      // Update student LTV
      const { data: allPayments } = await supabase
        .from("Payment")
        .select("amount")
        .eq("student_id", selectedStudentId)

      const { data: allPurchases } = await supabase
        .from("Purchase")
        .select("amount_paid")
        .eq("student_id", selectedStudentId)

      const totalLtv = 
        (allPayments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0) +
        (allPurchases || []).reduce((sum, p) => sum + Number(p.amount_paid || 0), 0)

      await supabase
        .from("StudentProfile")
        .update({ lifetime_value: totalLtv })
        .eq("id", selectedStudentId)

      toast("¡Venta manual registrada exitosamente! Suscripción y accesos activos al instante.", "success")
      
      // Reset Modal Form & Close
      setSelectedStudentId("")
      setSelectedProductId("")
      setManualAmount("")
      setPaymentMethod("MANUAL_TRANSFER")
      setIsManualModalOpen(false)
    } catch (err: any) {
      toast(`Error al registrar venta: ${err.message}`, "error")
    } finally {
      setSubmittingSale(false)
    }
  }

  // Calculate quick stats
  const totalRevenue = purchases.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0)
  const totalSalesCount = purchases.length
  const totalProductsCount = products.length

  if (!isArnaldo) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-8 bg-neutral-50">
        <div className="kh-card p-8 max-w-sm w-full text-center">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center text-xl mx-auto mb-5">🔒</div>
          <h2 className="kh-title text-lg mb-2">Acceso Privado</h2>
          <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
            Este módulo y su respectivo motor de productos digitales independientes están restringidos al profesor administrador principal.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 font-sans pb-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-indigo-600 animate-pulse" />
            Cursos & Membresías Khora
          </h1>
          <p className="text-neutral-500 font-medium mt-1">
            Crea Cursos Digitales estructurados con lecciones y material descargable, o Planes de Membresía (mensual, trimestral, anual). Todo cobrado de forma 100% segura por Mercado Pago.
          </p>
        </div>
        <button
          onClick={() => setIsManualModalOpen(true)}
          className="px-5 py-3 bg-neutral-900 hover:bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Venta Manual</span>
        </button>
      </div>

      {/* QUICK METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Ingresos Digitales Totales</p>
            <p className="text-2xl font-black text-neutral-900 mt-0.5">${totalRevenue.toLocaleString("es-CL")} CLP</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Ventas Totales</p>
            <p className="text-2xl font-black text-neutral-900 mt-0.5">{totalSalesCount} transacciones</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Productos Creados</p>
            <p className="text-2xl font-black text-neutral-900 mt-0.5">{totalProductsCount} items activos</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: CREATOR FORM */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-neutral-100 rounded-[32px] p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-neutral-900 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-600 rounded-full" />
              Crear Nuevo Producto
            </h2>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              {/* Product Type Selector */}
              <div>
                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-1.5 pl-1">Tipo de Producto *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType("COURSE")}
                    className={`py-3 rounded-2xl border text-[10px] font-black uppercase tracking-wider transition-all text-center flex flex-col items-center justify-center gap-1 ${
                      newType === "COURSE"
                        ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                        : "bg-neutral-50 border-neutral-100 text-neutral-500 hover:bg-neutral-100"
                    }`}
                  >
                    <span>🥁</span>
                    <span>Curso Digital</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType("PLAN")}
                    className={`py-3 rounded-2xl border text-[10px] font-black uppercase tracking-wider transition-all text-center flex flex-col items-center justify-center gap-1 ${
                      newType === "PLAN"
                        ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                        : "bg-neutral-50 border-neutral-100 text-neutral-500 hover:bg-neutral-100"
                    }`}
                  >
                    <span>🛡️</span>
                    <span>Plan Membresía</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-1.5 pl-1">Título del Producto *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder={newType === "COURSE" ? "Ej: Curso de Rítmica y Coordinación" : "Ej: Membresía Trimestral de Clases"}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:border-indigo-400 focus:bg-white text-xs font-semibold text-neutral-800 transition-all placeholder:font-medium"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-1.5 pl-1">Descripción corta</label>
                <textarea
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder={newType === "COURSE" ? "Ej: Desbloquea acceso a más de 15 lecciones en video..." : "Ej: Accede a clases fijas con todos los recursos incluidos."}
                  rows={3}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:border-indigo-400 focus:bg-white text-xs font-semibold text-neutral-800 transition-all placeholder:font-medium resize-none"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-1.5 pl-1">Precio en CLP (Ej: 20000) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-black">$</span>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={e => setNewPrice(e.target.value)}
                    placeholder="20000"
                    className="w-full pl-8 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:border-indigo-400 focus:bg-white text-xs font-black text-neutral-800 transition-all placeholder:font-bold"
                  />
                </div>
              </div>

              {/* Dynamic properties based on type */}
              {newType === "COURSE" ? (
                <div>
                  <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-1.5 pl-1">Enlace de Respaldo General (Opcional)</label>
                  <input
                    type="url"
                    value={newContentUrl}
                    onChange={e => setNewContentUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:border-indigo-400 focus:bg-white text-xs font-semibold text-neutral-800 transition-all placeholder:font-medium"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-1.5 pl-1">Duración de la Membresía *</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewDuration(1)}
                      className={`py-2 rounded-xl border text-[10px] font-bold transition-all text-center ${
                        newDuration === 1
                          ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                          : "bg-white border-neutral-100 text-neutral-500"
                      }`}
                    >
                      1 Mes
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewDuration(3)}
                      className={`py-2 rounded-xl border text-[10px] font-bold transition-all text-center ${
                        newDuration === 3
                          ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                          : "bg-white border-neutral-100 text-neutral-500"
                      }`}
                    >
                      3 Meses (Trimestral)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewDuration(12)}
                      className={`py-2 rounded-xl border text-[10px] font-bold transition-all text-center ${
                        newDuration === 12
                          ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                          : "bg-white border-neutral-100 text-neutral-500"
                      }`}
                    >
                      1 Año (Anual)
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submittingProduct}
                className="w-full py-4 bg-neutral-900 hover:bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
              >
                {submittingProduct ? "Creando..." : "Crear Producto"}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: LIST AND CURRICULUM EDITOR */}
        <div className="lg:col-span-2 space-y-8">
          {/* LIST OF PRODUCTS */}
          <div className="bg-white border border-neutral-100 rounded-[32px] p-6 md:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-neutral-900 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-600 rounded-full" />
              Listado de Productos ({products.length})
            </h2>

            {products.length === 0 ? (
              <div className="text-center py-16 bg-neutral-50/50 rounded-3xl border border-dashed border-neutral-200">
                <Info className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
                <p className="text-sm text-neutral-400 font-bold italic">No has creado ningún producto todavía</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
                {products.map(product => {
                  const isExpanded = expandedProductId === product.id
                  const productLessons = lessons.filter(l => l.product_id === product.id)
                  const productResources = resources.filter(r => r.product_id === product.id)

                  return (
                    <div key={product.id} className="bg-white border border-neutral-100 rounded-3xl p-5 hover:shadow-md transition-all flex flex-col gap-4 relative overflow-hidden group">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500" />
                      
                      {/* Product details */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-2 flex-1 min-w-0 pl-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-black text-sm text-neutral-900">{product.title}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                              product.type === "COURSE"
                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                : "bg-teal-50 text-teal-700 border border-teal-100"
                            }`}>
                              {product.type === "COURSE" ? "🥁 Curso Digital" : `🛡️ Plan Prepago (${product.duration_months} M)`}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                              product.is_active 
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-100" 
                                : "bg-neutral-100 text-neutral-500"
                            }`}>
                              {product.is_active ? "Activo" : "Inactivo"}
                            </span>
                          </div>
                          
                          <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">{product.description || "Sin descripción."}</p>
                          
                          <div className="flex items-center gap-3 text-[10px] text-neutral-500 font-semibold mt-1">
                            <span className="text-indigo-600 font-black">${product.price.toLocaleString("es-CL")} CLP</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-200" />
                            {product.type === "COURSE" ? (
                              <span className="text-neutral-400">{productLessons.length} Clases • {productResources.length} Descargas</span>
                            ) : (
                              <span className="text-neutral-400">{product.duration_months} meses de membresía activa</span>
                            )}
                          </div>
                        </div>

                        {/* Top action buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-100 justify-end flex-wrap">
                          {/* 🔗 Copy payment link */}
                          <button
                            onClick={() => copyProductLink(product.id)}
                            title={`Copiar link de pago: /comprar/${product.id}`}
                            className={`px-3 py-2 border rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                              copiedProductId === product.id
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-neutral-50 hover:bg-violet-50 text-neutral-600 hover:text-violet-700 border-neutral-200 hover:border-violet-200"
                            }`}
                          >
                            <Link2 className="w-3.5 h-3.5" />
                            <span>{copiedProductId === product.id ? "¡Copiado!" : "Copiar Link"}</span>
                          </button>

                          {/* 🔍 Open public page */}
                          <a
                            href={`/comprar?id=${product.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Ver página pública de compra"
                            className="p-2 text-neutral-400 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          {product.type === "COURSE" && (
                            <button
                              onClick={() => setExpandedProductId(isExpanded ? null : product.id)}
                              className="px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
                            >
                              <span>Contenido</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleActive(product)}
                            className={`px-3 py-2 border rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                              product.is_active
                                ? "bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border-neutral-200"
                                : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-100"
                            }`}
                          >
                            {product.is_active ? "Desactivar" : "Activar"}
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-neutral-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* EXPANDED SECTION: LESSONS & MATERIAL MANAGEMENT (Only for COURSE) */}
                      {isExpanded && product.type === "COURSE" && (
                        <div className="mt-3 pt-5 border-t border-neutral-100 space-y-6 animate-in slide-in-from-top duration-200">
                          {/* GRID DE ACCIONES INTERNAS */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* GESTIÓN DE CLASES (LESSONS) */}
                            <div className="space-y-4">
                              <h4 className="text-xs font-black text-neutral-900 flex items-center gap-1.5">
                                <Video className="w-4 h-4 text-violet-500" />
                                Estructura de Clases ({productLessons.length})
                              </h4>

                              {/* Form Clases */}
                              <form onSubmit={(e) => handleAddLesson(e, product.id)} className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 space-y-3">
                                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-wider">Añadir nueva clase</p>
                                
                                <div className="grid grid-cols-4 gap-2">
                                  <input
                                    type="text"
                                    required
                                    value={lessonTitle}
                                    onChange={e => setLessonTitle(e.target.value)}
                                    placeholder="Título clase"
                                    className="col-span-3 px-3 py-2 bg-white border border-neutral-100 rounded-xl outline-none text-xs font-semibold text-neutral-800"
                                  />
                                  <input
                                    type="number"
                                    required
                                    value={lessonOrder}
                                    onChange={e => setLessonOrder(e.target.value)}
                                    placeholder="Orden"
                                    className="col-span-1 px-3 py-2 bg-white border border-neutral-100 rounded-xl outline-none text-xs font-bold text-center text-neutral-800"
                                    title="Orden secuencial"
                                  />
                                </div>

                                <input
                                  type="url"
                                  required
                                  value={lessonVideoUrl}
                                  onChange={e => setLessonVideoUrl(e.target.value)}
                                  placeholder="URL Video (YouTube o Vimeo)"
                                  className="w-full px-3 py-2 bg-white border border-neutral-100 rounded-xl outline-none text-xs font-semibold text-neutral-800"
                                />

                                <input
                                  type="text"
                                  value={lessonDescription}
                                  onChange={e => setLessonDescription(e.target.value)}
                                  placeholder="Breve descripción de la lección (Opcional)"
                                  className="w-full px-3 py-2 bg-white border border-neutral-100 rounded-xl outline-none text-xs font-semibold text-neutral-800"
                                />

                                <button
                                  type="submit"
                                  disabled={submittingLesson}
                                  className="w-full py-2 bg-neutral-900 hover:bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                  {submittingLesson ? "Añadiendo..." : "Añadir Clase"}
                                </button>
                              </form>

                              {/* Lista Clases */}
                              {productLessons.length === 0 ? (
                                <p className="text-[10px] text-neutral-400 font-bold italic text-center py-4 bg-neutral-50 rounded-2xl">Este curso no tiene clases creadas todavía.</p>
                              ) : (
                                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin">
                                  {productLessons.map(lesson => (
                                    <div key={lesson.id} className="bg-neutral-50 border border-neutral-100 rounded-2xl p-3 flex justify-between items-center gap-3">
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-neutral-900 truncate">
                                          <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mr-1.5">Class {lesson.sort_order}:</span>
                                          {lesson.title}
                                        </p>
                                        <p className="text-[9px] text-neutral-400 truncate mt-0.5">{lesson.video_url}</p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteLesson(lesson.id)}
                                        className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all flex-shrink-0"
                                        title="Eliminar clase"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* GESTIÓN DE MATERIALES DESCARGABLES (RESOURCES) */}
                            <div className="space-y-4">
                              <h4 className="text-xs font-black text-neutral-900 flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-emerald-500" />
                                Zona de Descarga de Material ({productResources.length})
                              </h4>

                              {/* Form Descargas */}
                              <form onSubmit={(e) => handleAddResource(e, product.id)} className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 space-y-3">
                                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">Añadir recurso descargable (PDF, Beat, etc.)</p>
                                
                                <input
                                  type="text"
                                  required
                                  value={resourceTitle}
                                  onChange={e => setResourceTitle(e.target.value)}
                                  placeholder="Nombre del recurso (Ej: Guía de Rulos PDF)"
                                  className="w-full px-3 py-2 bg-white border border-neutral-100 rounded-xl outline-none text-xs font-semibold text-neutral-800"
                                />

                                <input
                                  type="url"
                                  required
                                  value={resourceDownloadUrl}
                                  onChange={e => setResourceDownloadUrl(e.target.value)}
                                  placeholder="Enlace de descarga (Drive, Dropbox)"
                                  className="w-full px-3 py-2 bg-white border border-neutral-100 rounded-xl outline-none text-xs font-semibold text-neutral-800"
                                />

                                <button
                                  type="submit"
                                  disabled={submittingResource}
                                  className="w-full py-2 bg-neutral-900 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                  {submittingResource ? "Añadiendo..." : "Añadir Material"}
                                </button>
                              </form>

                              {/* Lista Descargas */}
                              {productResources.length === 0 ? (
                                <p className="text-[10px] text-neutral-400 font-bold italic text-center py-4 bg-neutral-50 rounded-2xl">Este curso no tiene materiales de descarga.</p>
                              ) : (
                                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin">
                                  {productResources.map(resource => (
                                    <div key={resource.id} className="bg-neutral-50 border border-neutral-100 rounded-2xl p-3 flex justify-between items-center gap-3">
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-neutral-900 truncate">{resource.title}</p>
                                        <p className="text-[9px] text-neutral-400 truncate mt-0.5">{resource.download_url}</p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteResource(resource.id)}
                                        className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all flex-shrink-0"
                                        title="Eliminar recurso"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* HISTORICAL SALES */}
          <div className="bg-white border border-neutral-100 rounded-[32px] p-6 md:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-neutral-900 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
              Historial de Ventas ({purchases.length})
            </h2>

            {purchases.length === 0 ? (
              <div className="text-center py-16 bg-neutral-50/50 rounded-3xl border border-dashed border-neutral-200">
                <p className="text-sm text-neutral-400 font-bold italic">Aún no se han registrado compras o ventas</p>
                <p className="text-xs text-neutral-300 mt-1">Las ventas de Mercado Pago y asignaciones manuales aparecerán aquí.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-neutral-100">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-100 font-black text-neutral-400 uppercase tracking-widest">
                      <th className="p-4">Alumno</th>
                      <th className="p-4">Producto / Plan</th>
                      <th className="p-4">Fecha</th>
                      <th className="p-4 text-right">Monto</th>
                      <th className="p-4 text-center">Método</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700">
                    {purchases.map(purchase => {
                      const studentName = purchase.StudentProfile?.User?.name || "Alumno Desconocido"
                      const studentEmail = purchase.StudentProfile?.User?.email || "Sin email"
                      const productTitle = purchase.Product?.title || "Producto Eliminado"
                      const productTypeStr = purchase.Product?.type === "PLAN" ? "Plan" : "Curso"
                      return (
                        <tr key={purchase.id} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="p-4 min-w-[150px]">
                            <div className="font-bold text-neutral-900 truncate max-w-[160px]" title={studentName}>{studentName}</div>
                            <div className="text-[10px] text-neutral-400 truncate max-w-[160px]" title={studentEmail}>{studentEmail}</div>
                          </td>
                          <td className="p-4 min-w-[140px] max-w-[160px] truncate" title={productTitle}>
                            <span className="font-semibold text-neutral-900 block truncate">{productTitle}</span>
                            <span className="text-[8px] font-black uppercase text-neutral-400 block mt-0.5">{productTypeStr}</span>
                          </td>
                          <td className="p-4 text-neutral-500 whitespace-nowrap">{new Date(purchase.purchase_date).toLocaleDateString('es-CL')}</td>
                          <td className="p-4 text-right font-black text-neutral-900 whitespace-nowrap">${Number(purchase.amount_paid).toLocaleString("es-CL")}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap ${
                              purchase.payment_method === "MERCADOPAGO"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                            }`}>
                              {purchase.payment_method === "MERCADOPAGO" ? "Mercado Pago" : "Manual"}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* REGISTRAR VENTA MANUAL MODAL */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm transition-all duration-300 animate-in fade-in" 
            onClick={() => setIsManualModalOpen(false)}
          />
          
          <div className="bg-white w-full max-w-md rounded-[32px] border border-neutral-100 p-6 md:p-8 shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <button
              onClick={() => setIsManualModalOpen(false)}
              className="absolute right-6 top-6 p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-neutral-900 tracking-tight">Venta Manual / Membresía</h3>
                <p className="text-neutral-400 text-xs font-medium">Loguea un pago recibido por transferencia o efectivo.</p>
              </div>
            </div>

            <form onSubmit={handleRegisterManualSale} className="space-y-4 overflow-y-auto pr-1">
              <div>
                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-1.5 pl-1">Selecciona al Alumno *</label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={e => setSelectedStudentId(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:border-indigo-400 focus:bg-white text-xs font-semibold text-neutral-800 transition-all"
                >
                  <option value="">-- Elige un Alumno del CRM --</option>
                  {students.map(s => {
                    const name = s.User?.name || "Sin Nombre"
                    const email = s.User?.email || "Sin email"
                    return (
                      <option key={s.id} value={s.id}>
                        {name} ({email})
                      </option>
                    )
                  })}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-1.5 pl-1">Selecciona el Producto / Plan *</label>
                <select
                  required
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:border-indigo-400 focus:bg-white text-xs font-semibold text-neutral-800 transition-all"
                >
                  <option value="">-- Elige el Producto --</option>
                  {products.filter(p => p.is_active).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.type === "COURSE" ? "🥁" : "🛡️"} {p.title} (${p.price.toLocaleString("es-CL")} CLP)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-1.5 pl-1">Monto Pagado en CLP *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-black">$</span>
                  <input
                    type="number"
                    required
                    value={manualAmount}
                    onChange={e => setManualAmount(e.target.value)}
                    placeholder="Ej: 20000"
                    className="w-full pl-8 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:border-indigo-400 focus:bg-white text-xs font-black text-neutral-800 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-2 pl-1">Método de Venta Manual *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("MANUAL_TRANSFER")}
                    className={`py-3 rounded-2xl border text-[10px] font-black uppercase tracking-wider transition-all text-center flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === "MANUAL_TRANSFER"
                        ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                        : "bg-white border-neutral-100 text-neutral-500 hover:bg-neutral-50"
                    }`}
                  >
                    <span>🏦</span>
                    <span>Transferencia</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("MANUAL_CASH")}
                    className={`py-3 rounded-2xl border text-[10px] font-black uppercase tracking-wider transition-all text-center flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === "MANUAL_CASH"
                        ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                        : "bg-white border-neutral-100 text-neutral-500 hover:bg-neutral-50"
                    }`}
                  >
                    <span>💵</span>
                    <span>Efectivo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("OTHER")}
                    className={`py-3 rounded-2xl border text-[10px] font-black uppercase tracking-wider transition-all text-center flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === "OTHER"
                        ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                        : "bg-white border-neutral-100 text-neutral-500 hover:bg-neutral-50"
                    }`}
                  >
                    <span>🎯</span>
                    <span>Otro</span>
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submittingSale}
                  className="w-full py-4 bg-neutral-900 hover:bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submittingSale ? "Registrando..." : "Registrar Venta & Activar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
