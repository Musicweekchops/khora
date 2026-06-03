"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { UserProfile } from "@/lib/context/AuthContext"
import { 
  Calendar, 
  Clock, 
  ClipboardList, 
  Video, 
  ChevronRight,
  BookOpen,
  CreditCard,
  Sparkles,
  Award,
  ShieldCheck,
  ExternalLink,
  ShoppingBag,
  X,
  FileText,
  ChevronUp,
  ChevronDown
} from "lucide-react"
import Link from "next/link"
import VideoPlayer from "@/components/ui/VideoPlayer"

interface StudentStats {
  upcomingClasses: number
  pendingTasks: number
  totalMaterials: number
}

export default function StudentDashboard({ profile }: { profile: UserProfile }) {
  const [stats, setStats] = useState<StudentStats>({ upcomingClasses: 0, pendingTasks: 0, totalMaterials: 0 })
  const [nextClass, setNextClass] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // MERCADO PAGO STATE HOOKS
  const [gatewayEnabled, setGatewayEnabled] = useState(false)
  const [monthlyFee, setMonthlyFee] = useState(0)
  const [studentStatus, setStudentStatus] = useState("PROSPECT")
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<string | null>(null)
  const [availableCourses, setAvailableCourses] = useState<any[]>([])
  const [purchases, setPurchases] = useState<any[]>([])
  const [lessons, setLessons] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'store' | 'purchases'>('purchases')
  const [paying, setPaying] = useState<string | null>(null)

  // Classroom Active states
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null)
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)

  useEffect(() => {
    if (profile?.studentProfileId) loadData()
  }, [profile?.studentProfileId])

  const handlePayMonthly = async () => {
    setPaying("monthly")
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      const res = await fetch(`${supabaseUrl}/functions/v1/mercadopago-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": anonKey || "",
          "Authorization": `Bearer ${anonKey}`
        },
        body: JSON.stringify({
          teacher_id: profile.teacherProfileId,
          student_id: profile.studentProfileId,
          item_type: "MONTHLY"
        })
      })

      const data = await res.json()
      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        alert(data.error || "No se pudo generar el cobro mensual.")
      }
    } catch (err) {
      alert("Error al conectar con la pasarela de pagos.")
    } finally {
      setPaying(null)
    }
  }

  const handleBuyCourse = async (courseId: string) => {
    setPaying(courseId)
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      const res = await fetch(`${supabaseUrl}/functions/v1/mercadopago-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": anonKey || "",
          "Authorization": `Bearer ${anonKey}`
        },
        body: JSON.stringify({
          teacher_id: profile.teacherProfileId,
          student_id: profile.studentProfileId,
          item_type: "COURSE",
          item_id: courseId
        })
      })

      const data = await res.json()
      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        alert(data.error || "No se pudo procesar la compra del curso.")
      }
    } catch (err) {
      alert("Error al conectar con la pasarela de pagos.")
    } finally {
      setPaying(null)
    }
  }

  async function loadData() {
    setLoading(true)
    const now = new Date().toISOString()
    
    // 1. Next Class
    const { data: nc } = await supabase
      .from("Class")
      .select("*, TeacherProfile(User(name))")
      .eq("student_id", profile.studentProfileId!)
      .gte("date", now.split('T')[0])
      .order("date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(1)
      .maybeSingle()
    
    if (nc) setNextClass(nc)

    // 2. Stats
    const { count: upcoming } = await supabase
      .from("Class")
      .select("*", { count: 'exact', head: true })
      .eq("student_id", profile.studentProfileId!)
      .gte("date", now.split('T')[0])

    const { count: tasks } = await supabase
      .from("Task")
      .select("*", { count: 'exact', head: true })
      .eq("student_id", profile.studentProfileId!)
      .eq("completed", false)

    // 3. Materials count (explicitly allowed via SLA, Task, or Note)
    const [slaRes, taskRes, noteRes] = await Promise.all([
      supabase.from("StudentLibraryAccess").select("content_id, playlist_id").eq("student_id", profile.studentProfileId!),
      supabase.from("Task").select("content_id, playlist_id").eq("student_id", profile.studentProfileId!),
      supabase.from("ClassNote").select("content_id, playlist_id, Class!inner(student_id)").eq("Class.student_id", profile.studentProfileId!)
    ])

    const allowedItems = new Set<string>()
    const collectSet = (items: any[]) => {
      items.forEach(item => {
        if (item.playlist_id) allowedItems.add(`pl_${item.playlist_id}`)
        if (item.content_id) allowedItems.add(`co_${item.content_id}`)
      })
    }
    if (slaRes.data) collectSet(slaRes.data)
    if (taskRes.data) collectSet(taskRes.data)
    if (noteRes.data) collectSet(noteRes.data)

    setStats({
      upcomingClasses: upcoming || 0,
      pendingTasks: tasks || 0,
      totalMaterials: allowedItems.size
    })

    // 4. Mercado Pago Paid Student Experience (Any Teacher)
    try {
      // Cargar Billing Config
      const { data: config } = await supabase
        .from("TeacherBillingConfig")
        .select("gateway_enabled")
        .eq("teacher_id", profile.teacherProfileId!)
        .maybeSingle()

      const isEnabled = config?.gateway_enabled || false
      setGatewayEnabled(isEnabled)

      if (isEnabled) {
        // Cargar detalles de mensualidad y membresía
        const { data: student } = await supabase
          .from("StudentProfile")
          .select("monthly_fee, status, subscription_expires_at")
          .eq("id", profile.studentProfileId!)
          .maybeSingle()

        if (student) {
          setMonthlyFee(Number(student.monthly_fee) || 90000)
          setStudentStatus(student.status || "PROSPECT")
          setSubscriptionExpiresAt(student.subscription_expires_at || null)
        }

        // Cargar compras realizadas
        const { data: purchasesData } = await supabase
          .from("Purchase")
          .select("id, product_id, amount_paid, payment_method, purchase_date, Product(*)")
          .eq("student_id", profile.studentProfileId!)

        const loadedPurchases = purchasesData || []
        setPurchases(loadedPurchases)

        // Cargar clases y descargas de los productos comprados
        const purchasedIds = loadedPurchases.map(p => p.product_id)
        if (purchasedIds.length > 0) {
          // Lecciones
          const { data: lessData } = await supabase
            .from("Lesson")
            .select("*")
            .in("product_id", purchasedIds)
            .order("sort_order", { ascending: true })
          setLessons(lessData || [])

          // Recursos
          const { data: rescData } = await supabase
            .from("ProductResource")
            .select("*")
            .in("product_id", purchasedIds)
          setResources(rescData || [])
        }

        // Cargar todos los productos del profesor
        const { data: products } = await supabase
          .from("Product")
          .select("*")
          .eq("teacher_id", profile.teacherProfileId!)
          .eq("is_active", true)

        const purchasedIdsSet = new Set(purchasedIds)

        // Filtrar productos no comprados aún para la Tienda
        const filteredProducts = (products || []).filter(p => !purchasedIdsSet.has(p.id))
        setAvailableCourses(filteredProducts)

        // Determinar pestaña activa por defecto
        if (loadedPurchases.length > 0) {
          setActiveTab('purchases')
        } else {
          setActiveTab('store')
        }
      }
    } catch (err) {
      console.error("Error loading student billing panel:", err)
    }

    setLoading(false)
  }

  if (loading) return (
    <div className="animate-pulse space-y-8">
      <div className="h-48 bg-neutral-100 rounded-[40px]" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1,2,3].map(i => <div key={i} className="h-32 bg-neutral-100 rounded-3xl" />)}
      </div>
    </div>
  )

  return (
    <div className="space-y-6 md:space-y-8">
      {/* WELCOME */}
      <div className="bg-neutral-900 rounded-3xl md:rounded-[40px] p-6 md:p-10 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-2">¡Hola, {profile.name}! 👋</h1>
          <p className="text-neutral-400 md:text-neutral-500 text-sm md:text-base font-medium max-w-md">Bienvenido a tu panel de estudio. Aquí tienes un resumen de tu progreso.</p>
          
          <div className="mt-6 md:mt-10 flex flex-wrap gap-4">
            <Link href="/dashboard/clases" className="px-5 py-2.5 md:px-6 md:py-3 bg-white text-neutral-900 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black hover:bg-neutral-100 transition-all flex items-center gap-2">
              Explorar mis clases <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        
        {/* Subtler shapes */}
        <div className="absolute top-[-40%] right-[-10%] w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[5%] w-64 h-64 bg-teal-500/5 blur-[100px] rounded-full" />
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <StatCard 
          label="Clases Pendientes" 
          value={stats.upcomingClasses} 
          icon={<Calendar className="w-5 h-5 md:w-6 md:h-6" />} 
          color="bg-slate-50 text-slate-600"
          href="/dashboard/clases"
        />
        <StatCard 
          label="Tareas por Hacer" 
          value={stats.pendingTasks} 
          icon={<ClipboardList className="w-5 h-5 md:w-6 md:h-6" />} 
          color="bg-neutral-50 text-neutral-600"
          href="/dashboard/tareas"
        />
        <StatCard 
          label="Material Asignado" 
          value={stats.totalMaterials} 
          icon={<BookOpen className="w-5 h-5 md:w-6 md:h-6" />} 
          color="bg-indigo-50 text-indigo-600"
          href="/dashboard/biblioteca"
        />
      </div>

      {/* NEXT CLASS FOCUS */}
      {nextClass && (
        <div className="bg-white rounded-3xl md:rounded-[40px] border border-neutral-100 p-6 md:p-8 shadow-sm">
          <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-4 md:mb-6">Próxima Clase</h3>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-neutral-50 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center border border-neutral-100">
                <span className="text-[9px] font-black text-neutral-400 uppercase">{new Date(nextClass.date).toLocaleDateString('es-CL', { month: 'short' })}</span>
                <span className="text-lg md:text-xl font-black text-neutral-900 leading-none">{new Date(nextClass.date).getDate() + 1}</span>
              </div>
              <div>
                <h4 className="text-lg md:text-xl font-black text-neutral-900 tracking-tight">Próxima Clase</h4>
                <div className="flex items-center gap-3 mt-1 text-xs md:text-sm text-neutral-500 font-medium">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 opacity-40" /> {nextClass.start_time.slice(0,5)}</span>
                  <span className="w-1 h-1 rounded-full bg-neutral-200" />
                  <span className="flex items-center gap-1.5"><Video className="w-4 h-4 opacity-40" /> {nextClass.modalidad === "online" ? "Virtual" : "Presencial"}</span>
                </div>
              </div>
            </div>
            <Link 
              href={`/dashboard/clases/detalles?id=${nextClass.id}`}
              className="px-6 py-3.5 md:px-8 md:py-4 bg-neutral-100 text-neutral-900 rounded-2xl md:rounded-3xl text-xs md:text-sm font-black hover:bg-neutral-900 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              Ver Detalles
            </Link>
          </div>
        </div>
      )}

      {/* SECCIÓN DE PAGOS & CURSOS DE MERCADO PAGO (Pasarela Activa) */}
      {gatewayEnabled && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Tarjeta de Cobro Mensual o Membresía Activa */}
          {(() => {
            const isSubscriptionActive = subscriptionExpiresAt && new Date(subscriptionExpiresAt) > new Date()
            
            return (
              <div className="bg-white rounded-3xl md:rounded-[40px] border border-neutral-100 p-6 md:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-36 h-36 bg-violet-500/5 blur-[50px] rounded-full pointer-events-none" />
                
                <div className="space-y-4 relative z-10">
                  <span className="bg-violet-50 text-violet-700 border border-violet-100 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit">
                    <CreditCard className="w-3.5 h-3.5" />
                    {isSubscriptionActive ? "Membresía Khora Activa" : "Control de Mensualidad"}
                  </span>
                  
                  {isSubscriptionActive ? (
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-neutral-900 tracking-tight">Tu Plan de Clases</h3>
                      <p className="text-neutral-500 text-xs font-semibold leading-relaxed">
                        Cuentas con una membresía prepaga activa en Khora. Tus clases fijas, bloques asignados y material de estudio están completamente vigentes.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-neutral-900 tracking-tight">Tu Mensualidad de Clases</h3>
                      <p className="text-neutral-500 text-xs font-semibold leading-relaxed">
                        Realiza el pago seguro de tu mensualidad fija para mantener activo tu horario y bloque de clases.
                      </p>
                    </div>
                  )}

                  {isSubscriptionActive ? (
                    <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Válida hasta el</p>
                        <p className="text-sm font-black text-neutral-900 mt-1">
                          {new Date(subscriptionExpiresAt!).toLocaleDateString("es-CL", { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <span className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100">
                        ✓ Activo
                      </span>
                    </div>
                  ) : (
                    <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Monto a pagar</p>
                        <p className="text-2xl font-black text-neutral-900 mt-0.5">
                          ${monthlyFee.toLocaleString("es-CL")} <span className="text-xs font-bold text-neutral-400">CLP</span>
                        </p>
                      </div>
                      <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                        studentStatus === "ACTIVE" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                          : "bg-amber-50 text-amber-700 border border-amber-100 animate-pulse"
                      }`}>
                        {studentStatus === "ACTIVE" ? "✓ Al Día" : "⚠️ Pendiente"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-6 relative z-10">
                  {isSubscriptionActive ? (
                    <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold">
                      <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span>¡Tu membresía está al día! Acceso total garantizado.</span>
                    </div>
                  ) : studentStatus === "ACTIVE" ? (
                    <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold">
                      <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span>Tu cuenta de clases se encuentra al día. ¡Gracias por tu puntualidad!</span>
                    </div>
                  ) : (
                    <button
                      onClick={handlePayMonthly}
                      disabled={paying !== null}
                      className="w-full py-4 bg-neutral-900 hover:bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {paying === "monthly" ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <CreditCard className="w-4 h-4" />
                      )}
                      <span>Pagar Mensualidad Seguro</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })()}
 
          {/* Catálogo de Cursos & Mis Compras (Split Decoupled Panel) */}
          <div className="bg-white rounded-3xl md:rounded-[40px] border border-neutral-100 p-6 md:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute bottom-[-15%] left-[5%] w-36 h-36 bg-indigo-500/5 blur-[50px] rounded-full pointer-events-none" />
            
            <div className="space-y-4 relative z-10 w-full flex-1 flex flex-col">
              {/* Tab Selector */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('purchases')}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                      activeTab === 'purchases'
                        ? 'bg-neutral-900 text-white shadow-sm'
                        : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Mis Compras ({purchases.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('store')}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                      activeTab === 'store'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Tienda ({availableCourses.length})</span>
                  </button>
                </div>
              </div>

              {/* Tab: Mis Compras */}
              {activeTab === 'purchases' && (
                <div className="flex-1 flex flex-col justify-between pt-2">
                  <div className="space-y-1 mb-4">
                    <h3 className="text-lg font-black text-neutral-900 tracking-tight">Tu Material Adquirido</h3>
                    <p className="text-neutral-500 text-[11px] font-semibold leading-relaxed">
                      Accede de forma directa a tus masterclasses, cursos en video y material digital exclusivo en cualquier momento.
                    </p>
                  </div>

                  {purchases.length === 0 ? (
                    <div className="py-8 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-200 flex-1 flex flex-col items-center justify-center">
                      <BookOpen className="w-8 h-8 text-neutral-300 mb-2" />
                      <p className="text-xs text-neutral-400 font-bold max-w-[240px] leading-relaxed">Aún no has adquirido cursos premium o material digital.</p>
                      <p className="text-[10px] text-neutral-400 mt-1 font-semibold">¡Revisa la pestaña "Tienda" para ver opciones!</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin flex-1">
                      {purchases.map(purchase => {
                        const product = purchase.Product
                        if (!product) return null
                        
                        return (
                          <div key={purchase.id} className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 flex justify-between items-center gap-4 group hover:border-neutral-200 transition-all">
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-black text-neutral-900 truncate flex items-center gap-1.5">
                                {product.type === "COURSE" ? (
                                  <Award className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
                                ) : (
                                  <ShieldCheck className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                                )}
                                {product.title}
                              </h4>
                              <p className="text-[10px] text-neutral-400 truncate mt-0.5">{product.description || "Adquirido exitosamente."}</p>
                              <div className="flex items-center gap-2 mt-1.5 text-[9px] font-bold text-neutral-400 uppercase">
                                <span>{purchase.payment_method === 'MERCADOPAGO' ? 'Mercado Pago' : 'Manual'}</span>
                                <span>•</span>
                                <span>{new Date(purchase.purchase_date).toLocaleDateString('es-CL')}</span>
                              </div>
                            </div>

                            {product.type === "COURSE" ? (
                              <button
                                onClick={() => {
                                  const courseLessons = lessons.filter(l => l.product_id === product.id)
                                  setActiveCourseId(product.id)
                                  if (courseLessons.length > 0) {
                                    setActiveLessonId(courseLessons[0].id)
                                  } else {
                                    setActiveLessonId(null)
                                  }
                                }}
                                className="px-4 py-2.5 bg-neutral-900 hover:bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 flex-shrink-0 shadow-sm"
                              >
                                <span>Ver Curso</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1 flex-shrink-0">
                                Plan Activo
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Tienda */}
              {activeTab === 'store' && (
                <div className="flex-1 flex flex-col justify-between pt-2">
                  <div className="space-y-1 mb-4">
                    <h3 className="text-lg font-black text-neutral-900 tracking-tight">Catálogo Disponible</h3>
                    <p className="text-neutral-500 text-[11px] font-semibold leading-relaxed">
                      Adquiere cursos estructurados o únete a nuestros planes trimestrales/anuales con descuento exclusivo.
                    </p>
                  </div>

                  {availableCourses.length === 0 ? (
                    <div className="py-8 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-200 flex-1 flex flex-col items-center justify-center">
                      <Sparkles className="w-8 h-8 text-emerald-400 mb-2 animate-bounce" />
                      <p className="text-xs text-neutral-400 font-bold max-w-[240px] leading-relaxed">¡Tienes acceso a todo nuestro catálogo! 🎉</p>
                      <p className="text-[10px] text-neutral-400 mt-1 font-semibold">Muchas gracias por confiar en nosotros.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin flex-1">
                      {availableCourses.map(course => (
                        <div key={course.id} className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 flex justify-between items-center gap-4 group hover:border-neutral-200 transition-all">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-black text-neutral-900 truncate">{course.title}</h4>
                              <span className={`px-1.5 py-0.2 rounded text-[7px] font-black uppercase tracking-widest ${
                                course.type === "COURSE" 
                                  ? "bg-amber-50 text-amber-600 border border-amber-100" 
                                  : "bg-teal-50 text-teal-600 border border-teal-100"
                              }`}>
                                {course.type === "COURSE" ? "Curso" : "Plan"}
                              </span>
                            </div>
                            <p className="text-[10px] text-neutral-400 truncate mt-0.5">{course.description || "Material premium Khora."}</p>
                            <p className="text-xs font-black text-emerald-600 mt-1">
                              ${Number(course.price).toLocaleString("es-CL")} <span className="text-[9px] font-bold text-neutral-400 uppercase">CLP</span>
                            </p>
                          </div>

                          <button
                            onClick={() => handleBuyCourse(course.id)}
                            disabled={paying !== null}
                            className="px-4 py-2.5 bg-neutral-900 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
                          >
                            {paying === course.id ? (
                              <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                              <CreditCard className="w-3.5 h-3.5" />
                            )}
                            <span>Adquirir</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ON-PAGE COURSE CLASSROOM MODAL */}
      {activeCourseId && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 md:p-6 animate-in fade-in duration-200">
          {/* Backdrop with strong blur */}
          <div 
            className="absolute inset-0 bg-neutral-950/85 backdrop-blur-md"
            onClick={() => {
              setActiveCourseId(null)
              setActiveLessonId(null)
            }}
          />

          {/* Modal Container */}
          <div className="bg-neutral-900 text-white w-full h-full md:max-w-6xl md:h-[85vh] md:rounded-[40px] border border-neutral-800 shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="h-16 border-b border-neutral-800 flex items-center justify-between px-6 bg-neutral-950/40 relative z-20 flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-sm font-black text-white">🥁</span>
                <div>
                  <h3 className="text-sm font-black tracking-tight truncate max-w-[280px] sm:max-w-[400px]">
                    {purchases.find((pur: any) => pur.Product?.id === activeCourseId)?.Product?.title || "Curso Digital"}
                  </h3>
                  <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">Aula Virtual Khora</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveCourseId(null)
                  setActiveLessonId(null)
                }}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Split Layout */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              
              {/* Left Column: Player & Lesson Info (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin">
                {activeLessonId ? (
                  (() => {
                    const activeLesson = lessons.find(l => l.id === activeLessonId)
                    const courseResources = resources.filter(r => r.product_id === activeCourseId)
                    if (!activeLesson) return null

                    return (
                      <div className="space-y-6">
                        {/* Video Player */}
                        <div className="w-full">
                          <VideoPlayer url={activeLesson.video_url} title={activeLesson.title} />
                        </div>

                        {/* Title & Desc */}
                        <div className="space-y-2">
                          <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit block">
                            Clase en Reproducción
                          </span>
                          <h4 className="text-lg font-black tracking-tight">{activeLesson.title}</h4>
                          <p className="text-xs text-neutral-400 leading-relaxed font-semibold">
                            {activeLesson.description || "Esta lección no tiene una descripción adicional."}
                          </p>
                        </div>

                        {/* Resources zone */}
                        <div className="bg-neutral-950/30 border border-neutral-800 rounded-[32px] p-5 md:p-6 space-y-4">
                          <h5 className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5 text-emerald-400">
                            <FileText className="w-4 h-4" />
                            Material de Descarga Complementario
                          </h5>

                          {courseResources.length === 0 ? (
                            <p className="text-[10px] text-neutral-500 font-bold italic">No hay archivos descargables específicos cargados para este curso.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {courseResources.map(res => (
                                <a
                                  key={res.id}
                                  href={res.download_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-emerald-500/30 transition-all hover:bg-neutral-900/60"
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold truncate text-white">{res.title}</p>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-neutral-500 mt-0.5">Archivo Descargable</p>
                                  </div>
                                  <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-xl text-[10px] flex-shrink-0 font-black uppercase tracking-widest">
                                    Descargar
                                  </span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })()
                ) : (
                  <div className="h-full flex flex-col items-center justify-center py-16 text-center text-neutral-500">
                    <Video className="w-12 h-12 mb-3 text-neutral-600 animate-pulse" />
                    <p className="text-xs font-bold uppercase tracking-wider">Cargando clase...</p>
                  </div>
                )}
              </div>

              {/* Right Column: Playlist */}
              <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-neutral-800 bg-neutral-950/20 flex flex-col flex-shrink-0 overflow-hidden h-72 lg:h-auto">
                <div className="p-4 border-b border-neutral-800 flex-shrink-0 bg-neutral-950/40">
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Clases del Curso</p>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
                  {(() => {
                    const courseLessons = lessons.filter(l => l.product_id === activeCourseId)
                    if (courseLessons.length === 0) {
                      return (
                        <p className="text-[10px] text-neutral-500 font-bold italic text-center py-8">No hay clases registradas en este curso.</p>
                      )
                    }

                    return courseLessons.map(lesson => {
                      const isActive = activeLessonId === lesson.id
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setActiveLessonId(lesson.id)}
                          className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 group ${
                            isActive
                              ? "bg-indigo-600 border-indigo-500 text-white shadow-lg"
                              : "bg-neutral-900 border-neutral-800/60 text-neutral-300 hover:bg-neutral-850 hover:border-neutral-700"
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black uppercase flex-shrink-0 ${
                            isActive ? "bg-white text-indigo-600" : "bg-neutral-850 text-neutral-400 group-hover:bg-neutral-800"
                          }`}>
                            {lesson.sort_order}
                          </span>
                          
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold leading-snug line-clamp-2">{lesson.title}</p>
                            <p className={`text-[9px] mt-1 font-semibold truncate ${isActive ? "text-indigo-200" : "text-neutral-500"}`}>
                              {lesson.description || "Video clase."}
                            </p>
                          </div>
                        </button>
                      )
                    })
                  })()}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, color, href }: any) {
  const content = (
    <>
      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl md:text-3xl font-black text-neutral-900">{value}</p>
      </div>
      {href && <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-neutral-300 group-hover:text-neutral-600 transition-colors" />}
    </>
  )

  const className = "bg-white rounded-2xl md:rounded-[32px] p-5 md:p-6 border border-neutral-100 shadow-sm flex items-center gap-4 md:gap-5 hover:shadow-md hover:border-neutral-200 transition-all group cursor-pointer"

  if (href) {
    return <Link href={href} className={className}>{content}</Link>
  }
  return <div className={className}>{content}</div>
}
