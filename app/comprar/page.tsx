"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"

interface Product {
  id: string
  teacher_id: string
  title: string
  description: string | null
  price: number
  type: "COURSE" | "PLAN"
  duration_months: number
  is_active: boolean
}

interface TeacherInfo {
  name: string
}

type CheckoutStep = "info" | "processing" | "error"

function ComprarInner() {
  const searchParams = useSearchParams()
  const productId = searchParams.get("id")

  const [product, setProduct] = useState<Product | null>(null)
  const [teacher, setTeacher] = useState<TeacherInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [step, setStep] = useState<CheckoutStep>("info")
  const [errorMsg, setErrorMsg] = useState("")

  const [form, setForm] = useState({ name: "", email: "", phone: "" })

  useEffect(() => {
    if (productId) {
      loadProduct(productId)
    } else {
      setNotFound(true)
      setLoading(false)
    }
  }, [productId])

  async function loadProduct(id: string) {
    setLoading(true)
    try {
      const { data: prod, error } = await supabase
        .from("Product")
        .select("id, teacher_id, title, description, price, type, duration_months, is_active")
        .eq("id", id)
        .eq("is_active", true)
        .maybeSingle()

      if (error || !prod) {
        setNotFound(true)
        return
      }

      setProduct(prod)

      const { data: teacherProfile } = await supabase
        .from("TeacherProfile")
        .select("User ( name )")
        .eq("id", prod.teacher_id)
        .maybeSingle()

      if (teacherProfile?.User) {
        setTeacher({ name: (teacherProfile.User as any).name })
      }
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) return
    if (!product) return

    setStep("processing")
    setErrorMsg("")

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      const res = await fetch(`${supabaseUrl}/functions/v1/mercadopago-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": anonKey || "",
          "Authorization": `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          teacher_id: product.teacher_id,
          student_id: null,
          item_type: "COURSE",
          item_id: product.id,
          prospect_name: form.name.trim(),
          prospect_email: form.email.trim().toLowerCase(),
          prospect_phone: form.phone.trim(),
        }),
      })

      const data = await res.json()

      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        throw new Error(data.error || "No se pudo generar el link de pago.")
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Ocurrió un error al conectar con la pasarela de pago.")
      setStep("error")
    }
  }

  // ─── LOADING ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-indigo-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    )
  }

  // ─── NOT FOUND ────────────────────────────────────────────────────────────
  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-xl font-black text-white mb-2">Producto no encontrado</h1>
          <p className="text-neutral-400 text-sm">
            Este enlace no es válido o el producto ya no está disponible.
          </p>
          <a
            href="/"
            className="mt-6 inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-bold transition-all"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    )
  }

  const isPlan = product.type === "PLAN"
  const durationLabel =
    product.duration_months === 1 ? "1 Mes"
    : product.duration_months === 3 ? "3 Meses (Trimestral)"
    : product.duration_months === 12 ? "1 Año (Anual)"
    : `${product.duration_months} Meses`

  // ─── MAIN PAGE ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-indigo-950 flex flex-col items-center justify-center p-4 py-12" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* Ambient glows */}
      <div style={{ position: "fixed", top: "-20%", right: "-10%", width: 600, height: 600, background: "radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-20%", left: "-10%", width: 400, height: 400, background: "radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 480, position: "relative", zIndex: 10 }}>
        {/* Logo header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{
            width: 52, height: 52, background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 900, fontSize: 22, margin: "0 auto 12px",
            boxShadow: "0 8px 32px rgba(99,102,241,0.4)"
          }}>K</div>
          <p style={{ color: "#6b7280", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            {teacher?.name ?? "Musicweekchops"}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 28,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
        }}>
          {/* Product header */}
          <div style={{
            padding: "28px 28px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            background: isPlan
              ? "linear-gradient(135deg, rgba(20,184,166,0.25), rgba(16,185,129,0.15))"
              : "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))",
            position: "relative", overflow: "hidden"
          }}>
            <div style={{
              position: "absolute", top: -60, right: -60, width: 180, height: 180,
              background: "rgba(255,255,255,0.04)", borderRadius: "50%"
            }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <span style={{
                display: "inline-block",
                padding: "4px 12px", borderRadius: 100,
                fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em",
                marginBottom: 12,
                color: isPlan ? "#5eead4" : "#a5b4fc",
                background: isPlan ? "rgba(20,184,166,0.15)" : "rgba(99,102,241,0.15)",
                border: `1px solid ${isPlan ? "rgba(20,184,166,0.3)" : "rgba(99,102,241,0.3)"}`
              }}>
                {isPlan ? "🛡️ Plan de Membresía" : "🥁 Curso Digital"}
              </span>
              <h1 style={{ color: "white", fontSize: 24, fontWeight: 900, margin: "0 0 8px", lineHeight: 1.25 }}>
                {product.title}
              </h1>
              {product.description && (
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, margin: "0 0 16px", lineHeight: 1.6 }}>
                  {product.description}
                </p>
              )}
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ color: "white", fontSize: 32, fontWeight: 900 }}>
                  {formatCurrency(product.price)}
                </span>
                {isPlan && (
                  <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 700 }}>
                    / {durationLabel}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Form area */}
          <div style={{ padding: "28px" }}>
            {step === "error" && (
              <div style={{
                marginBottom: 20, background: "rgba(127,29,29,0.3)", border: "1px solid rgba(239,68,68,0.3)",
                color: "#fca5a5", padding: "14px 16px", borderRadius: 16, fontSize: 13, fontWeight: 600,
                display: "flex", gap: 10, alignItems: "flex-start"
              }}>
                <span>⚠️</span><span>{errorMsg}</span>
              </div>
            )}

            {step === "processing" ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{
                  width: 48, height: 48, border: "4px solid rgba(99,102,241,0.2)", borderTopColor: "#818cf8",
                  borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 20px"
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <p style={{ color: "white", fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Conectando con Mercado Pago...</p>
                <p style={{ color: "#9ca3af", fontSize: 12 }}>Serás redireccionado en un momento.</p>
              </div>
            ) : (
              <form onSubmit={handleCheckout}>
                {/* Name */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 900, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, paddingLeft: 4 }}>
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Ej: Juan Pérez"
                    style={{
                      width: "100%", padding: "13px 16px", boxSizing: "border-box",
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 16, outline: "none", fontSize: 14, fontWeight: 600,
                      color: "white", fontFamily: "inherit"
                    }}
                    onFocus={e => { e.target.style.borderColor = "#818cf8" }}
                    onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)" }}
                  />
                </div>

                {/* Email */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 900, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, paddingLeft: 4 }}>
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="juan@correo.com"
                    style={{
                      width: "100%", padding: "13px 16px", boxSizing: "border-box",
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 16, outline: "none", fontSize: 14, fontWeight: 600,
                      color: "white", fontFamily: "inherit"
                    }}
                    onFocus={e => { e.target.style.borderColor = "#818cf8" }}
                    onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)" }}
                  />
                </div>

                {/* Phone */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 900, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, paddingLeft: 4 }}>
                    WhatsApp / Teléfono *
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+56 9 1234 5678"
                    style={{
                      width: "100%", padding: "13px 16px", boxSizing: "border-box",
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 16, outline: "none", fontSize: 14, fontWeight: 600,
                      color: "white", fontFamily: "inherit"
                    }}
                    onFocus={e => { e.target.style.borderColor = "#818cf8" }}
                    onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)" }}
                  />
                </div>

                {/* Benefits */}
                <div style={{
                  padding: 16, borderRadius: 16, marginBottom: 20,
                  background: isPlan ? "rgba(20,184,166,0.06)" : "rgba(99,102,241,0.06)",
                  border: `1px solid ${isPlan ? "rgba(20,184,166,0.2)" : "rgba(99,102,241,0.2)"}`
                }}>
                  <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, color: isPlan ? "#2dd4bf" : "#a5b4fc" }}>
                    ✅ Al pagar obtendrás:
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {isPlan ? (
                      <>
                        <div style={{ display: "flex", gap: 8, fontSize: 12, color: "#d1d5db", fontWeight: 500 }}><span>🎯</span><span>Membresía activa por {durationLabel}</span></div>
                        <div style={{ display: "flex", gap: 8, fontSize: 12, color: "#d1d5db", fontWeight: 500 }}><span>📅</span><span>Clases incluidas según tu plan</span></div>
                        <div style={{ display: "flex", gap: 8, fontSize: 12, color: "#d1d5db", fontWeight: 500 }}><span>📱</span><span>Acceso a la app de Khora</span></div>
                        <div style={{ display: "flex", gap: 8, fontSize: 12, color: "#d1d5db", fontWeight: 500 }}><span>📩</span><span>Confirmación por correo y WhatsApp</span></div>
                      </>
                    ) : (
                      <>
                        <div style={{ display: "flex", gap: 8, fontSize: 12, color: "#d1d5db", fontWeight: 500 }}><span>🎬</span><span>Acceso completo a todas las lecciones en video</span></div>
                        <div style={{ display: "flex", gap: 8, fontSize: 12, color: "#d1d5db", fontWeight: 500 }}><span>📥</span><span>Materiales descargables incluidos</span></div>
                        <div style={{ display: "flex", gap: 8, fontSize: 12, color: "#d1d5db", fontWeight: 500 }}><span>📱</span><span>Acceso desde tu perfil de Khora</span></div>
                        <div style={{ display: "flex", gap: 8, fontSize: 12, color: "#d1d5db", fontWeight: 500 }}><span>📩</span><span>Confirmación de compra por correo</span></div>
                      </>
                    )}
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  type="submit"
                  style={{
                    width: "100%", padding: "15px 20px",
                    background: isPlan
                      ? "linear-gradient(135deg, #14b8a6, #10b981)"
                      : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    border: "none", borderRadius: 18, color: "white",
                    fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: isPlan ? "0 4px 20px rgba(20,184,166,0.3)" : "0 4px 20px rgba(99,102,241,0.4)",
                    fontFamily: "inherit"
                  }}
                >
                  <span>💳</span>
                  <span>Pagar con Mercado Pago</span>
                </button>

                <p style={{ textAlign: "center", fontSize: 10, color: "#4b5563", marginTop: 12, fontWeight: 500 }}>
                  🔒 Pago 100% seguro · Powered by Mercado Pago
                </p>
              </form>
            )}
          </div>
        </div>

        <p style={{ textAlign: "center", color: "#374151", fontSize: 10, marginTop: 20, fontWeight: 500 }}>
          © 2026 Musicweekchops · Todos los derechos reservados
        </p>
      </div>
    </div>
  )
}

export default function ComprarPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "4px solid rgba(99,102,241,0.2)", borderTopColor: "#818cf8", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    }>
      <ComprarInner />
    </Suspense>
  )
}
