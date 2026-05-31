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
  ShoppingBag
} from "lucide-react"
import Link from "next/link"

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
  const [isArnaldosStudent, setIsArnaldosStudent] = useState(false)
  const [gatewayEnabled, setGatewayEnabled] = useState(false)
  const [monthlyFee, setMonthlyFee] = useState(0)
  const [studentStatus, setStudentStatus] = useState("PROSPECT")
  const [availableCourses, setAvailableCourses] = useState<any[]>([])
  const [purchases, setPurchases] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'store' | 'purchases'>('purchases')
  const [paying, setPaying] = useState<string | null>(null)

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

    // 4. Mercado Pago Paid Student Experience (Arnaldo)
    try {
      const { data: teacherProfile } = await supabase
        .from("TeacherProfile")
        .select("id, User ( email )")
        .eq("id", profile.teacherProfileId!)
        .maybeSingle()

      const arnaldoCheck = (teacherProfile?.User as any)?.email === "arnaldoallende@hotmail.com"
      setIsArnaldosStudent(arnaldoCheck)

      if (arnaldoCheck) {
        // Cargar Billing Config
        const { data: config } = await supabase
          .from("TeacherBillingConfig")
          .select("gateway_enabled")
          .eq("teacher_id", profile.teacherProfileId!)
          .maybeSingle()

        setGatewayEnabled(config?.gateway_enabled || false)

        // Cargar detalles de mensualidad
        const { data: student } = await supabase
          .from("StudentProfile")
          .select("monthly_fee, status")
          .eq("id", profile.studentProfileId!)
          .maybeSingle()

        if (student) {
          setMonthlyFee(Number(student.monthly_fee) || 90000)
          setStudentStatus(student.status || "PROSPECT")
        }

        // Cargar compras realizadas
        const { data: purchasesData } = await supabase
          .from("Purchase")
          .select("id, product_id, amount_paid, payment_method, purchase_date, Product(*)")
          .eq("student_id", profile.studentProfileId!)

        const loadedPurchases = purchasesData || []
        setPurchases(loadedPurchases)

        // Cargar todos los productos del profesor
        const { data: products } = await supabase
          .from("Product")
          .select("*")
          .eq("teacher_id", profile.teacherProfileId!)
          .eq("is_active", true)

        const purchasedIds = new Set(loadedPurchases.map(p => p.product_id))

        // Filtrar productos no comprados aún para la Tienda
        const filteredProducts = (products || []).filter(p => !purchasedIds.has(p.id))
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

      {/* SECCIÓN DE PAGOS & CURSOS DE MERCADO PAGO (Exclusivo Alumnos de Arnaldo) */}
      {isArnaldosStudent && gatewayEnabled && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Tarjeta de Cobro Mensual */}
          <div className="bg-white rounded-3xl md:rounded-[40px] border border-neutral-100 p-6 md:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-36 h-36 bg-violet-500/5 blur-[50px] rounded-full pointer-events-none" />
            
            <div className="space-y-4 relative z-10">
              <span className="bg-violet-50 text-violet-700 border border-violet-100 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit">
                <CreditCard className="w-3.5 h-3.5" />
                Control de Mensualidad
              </span>
              
              <div className="space-y-1">
                <h3 className="text-xl font-black text-neutral-900 tracking-tight">Tu Mensualidad de Clases</h3>
                <p className="text-neutral-500 text-xs font-semibold leading-relaxed">
                  Realiza el pago seguro de tu mensualidad fija para mantener activo tu horario y bloque de clases.
                </p>
              </div>

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
            </div>

            <div className="pt-6 relative z-10">
              {studentStatus === "ACTIVE" ? (
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
                                <Award className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
                                {product.title}
                              </h4>
                              <p className="text-[10px] text-neutral-400 truncate mt-0.5">{product.description || "Curso premium completo."}</p>
                              <div className="flex items-center gap-2 mt-1.5 text-[9px] font-bold text-neutral-400 uppercase">
                                <span>{purchase.payment_method === 'MERCADOPAGO' ? 'Mercado Pago' : 'Manual'}</span>
                                <span>•</span>
                                <span>{new Date(purchase.purchase_date).toLocaleDateString('es-CL')}</span>
                              </div>
                            </div>

                            <a
                              href={product.content_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2.5 bg-neutral-900 hover:bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 flex-shrink-0 shadow-sm"
                            >
                              <span>Acceder</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
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
                    <h3 className="text-lg font-black text-neutral-900 tracking-tight">Cursos Disponibles</h3>
                    <p className="text-neutral-500 text-[11px] font-semibold leading-relaxed">
                      Adquiere cursos premium y desbloquea material exclusivo de batería de forma instantánea.
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
                            <h4 className="text-xs font-black text-neutral-900 truncate">{course.title}</h4>
                            <p className="text-[10px] text-neutral-400 truncate mt-0.5">{course.description || "Curso premium completo."}</p>
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
                            <span>Comprar</span>
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
