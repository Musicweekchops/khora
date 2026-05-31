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
  CreditCard
} from "lucide-react"

interface Product {
  id: string
  teacher_id: string
  title: string
  description: string | null
  price: number
  content_url: string
  is_active: boolean
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
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  // Form States for creating a product
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newPrice, setNewPrice] = useState("")
  const [newContentUrl, setNewContentUrl] = useState("")
  const [submittingProduct, setSubmittingProduct] = useState(false)

  // Manual Sale Modal States
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState("")
  const [selectedProductId, setSelectedProductId] = useState("")
  const [manualAmount, setManualAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"MANUAL_TRANSFER" | "MANUAL_CASH" | "OTHER">("MANUAL_TRANSFER")
  const [submittingSale, setSubmittingSale] = useState(false)

  const isArnaldo = profile?.email === "arnaldoallende@hotmail.com"

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

      // 2. Fetch Purchases (Digital Sales)
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
            title
          )
        `)
        .eq("teacher_id", profile?.teacherProfileId)
        .order("created_at", { ascending: false })

      if (purcErr) throw purcErr
      setPurchases(purcData as any[] || [])

      // 3. Fetch Students for manual registration dropdown
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
    if (!newTitle.trim() || !newPrice.trim() || !newContentUrl.trim()) {
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
          content_url: newContentUrl.trim(),
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

  const handleRegisterManualSale = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudentId || !selectedProductId || !manualAmount.trim()) {
      toast("Por favor selecciona un alumno, un producto y el monto pagado.", "error")
      return
    }

    setSubmittingSale(true)
    try {
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
            title
          )
        `)
        .single()

      if (error) {
        if (error.code === "23505") {
          throw new Error("Este alumno ya tiene registrado un acceso o compra para este producto digital.")
        }
        throw error
      }

      setPurchases(prev => [data as any, ...prev])
      
      // Update LTV dynamically for the student in StudentProfile
      const { data: allPayments } = await supabase
        .from("Payment")
        .select("amount")
        .eq("student_id", selectedStudentId)

      // Get all manual purchases amount to add to LTV as well
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

      toast("¡Venta manual registrada exitosamente! Material activo al instante.", "success")
      
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
            Cursos & Productos Digitales
          </h1>
          <p className="text-neutral-500 font-medium mt-1">
            Crea masterclasses, cursos en video y material digital. Gestiona compras de Mercado Pago o registra ventas manuales de inmediato.
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
            <p className="text-2xl font-black text-neutral-900 mt-0.5">{totalProductsCount} items digitales</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: CREATOR & PRODUCTS */}
        <div className="lg:col-span-1 space-y-6">
          {/* PRODUCT FORM */}
          <div className="bg-white border border-neutral-100 rounded-[32px] p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-neutral-900 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-600 rounded-full" />
              Crear Nuevo Producto
            </h2>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-1.5 pl-1">Título del Producto *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Ej: Curso de Rítmica y Coordinación"
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:border-indigo-400 focus:bg-white text-xs font-semibold text-neutral-800 transition-all placeholder:font-medium"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-1.5 pl-1">Descripción corta</label>
                <textarea
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Ej: Desbloquea acceso a más de 15 lecciones en video..."
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

              <div>
                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-1.5 pl-1">Enlace de Material (Drive / YouTube) *</label>
                <input
                  type="url"
                  required
                  value={newContentUrl}
                  onChange={e => setNewContentUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:border-indigo-400 focus:bg-white text-xs font-semibold text-neutral-800 transition-all placeholder:font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={submittingProduct}
                className="w-full py-4 bg-neutral-900 hover:bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-neutral-950/5"
              >
                {submittingProduct ? "Creando..." : "Crear Producto"}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE PRODUCTS LIST & HISTORICAL SALES */}
        <div className="lg:col-span-2 space-y-8">
          {/* PRODUCT LIST */}
          <div className="bg-white border border-neutral-100 rounded-[32px] p-6 md:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-neutral-900 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-600 rounded-full" />
              Listado de Productos ({products.length})
            </h2>

            {products.length === 0 ? (
              <div className="text-center py-16 bg-neutral-50/50 rounded-3xl border border-dashed border-neutral-200">
                <Info className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
                <p className="text-sm text-neutral-400 font-bold italic">No has creado ningún producto digital todavía</p>
                <p className="text-xs text-neutral-300 mt-1">Usa el formulario lateral para agregar tu primer curso premium.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
                {products.map(product => (
                  <div key={product.id} className="bg-white border border-neutral-100 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden group">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                    
                    <div className="space-y-2 flex-1 min-w-0 pl-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-sm text-neutral-900 truncate">{product.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          product.is_active 
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-100" 
                            : "bg-neutral-100 text-neutral-500"
                        }`}>
                          {product.is_active ? "Activo en Tienda" : "Inactivo"}
                        </span>
                      </div>
                      
                      <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">{product.description || "Sin descripción."}</p>
                      
                      <div className="flex items-center gap-3 text-[10px] text-neutral-500 font-semibold mt-1">
                        <span className="text-indigo-600 font-black">${product.price.toLocaleString("es-CL")} CLP</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-200" />
                        <a href={product.content_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-indigo-600">
                          Drive Material <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-100 justify-end">
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
                ))}
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
                      <th className="p-4">Producto</th>
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
                      return (
                        <tr key={purchase.id} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="p-4 min-w-[150px]">
                            <div className="font-bold text-neutral-900 truncate max-w-[160px]" title={studentName}>{studentName}</div>
                            <div className="text-[10px] text-neutral-400 truncate max-w-[160px]" title={studentEmail}>{studentEmail}</div>
                          </td>
                          <td className="p-4 font-semibold text-neutral-900 min-w-[140px] max-w-[160px] truncate" title={productTitle}>{productTitle}</td>
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
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm transition-all duration-300 animate-in fade-in" 
            onClick={() => setIsManualModalOpen(false)}
          />
          
          {/* Modal Container */}
          <div className="bg-white w-full max-w-md rounded-[32px] border border-neutral-100 p-6 md:p-8 shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Close Button */}
            <button
              onClick={() => setIsManualModalOpen(false)}
              className="absolute right-6 top-6 p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-neutral-900 tracking-tight">Venta Manual / Asignación</h3>
                <p className="text-neutral-400 text-xs font-medium">Loguea un pago recibido por transferencia o efectivo.</p>
              </div>
            </div>

            {/* Form */}
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
                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-1.5 pl-1">Selecciona el Producto Digital *</label>
                <select
                  required
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:border-indigo-400 focus:bg-white text-xs font-semibold text-neutral-800 transition-all"
                >
                  <option value="">-- Elige el Producto Digital --</option>
                  {products.filter(p => p.is_active).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} (${p.price.toLocaleString("es-CL")} CLP)
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
