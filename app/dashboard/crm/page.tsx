"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/context/AuthContext"
import { formatCurrency } from "@/lib/utils"

interface Lead {
  id: string; status: string; name: string; email: string; phone: string
  lead_source: string; lifetime_value: number; created_at: string; modalidad: string
}

const COLUMNS = [
  { key: "PROSPECT", label: "Prospectos", color: "border-amber-400", bg: "bg-amber-50", icon: "🎯" },
  { key: "TRIAL", label: "Clase Prueba", color: "border-sky-400", bg: "bg-sky-50", icon: "🧪" },
  { key: "ACTIVE", label: "Activos", color: "border-emerald-400", bg: "bg-emerald-50", icon: "✅" },
  { key: "PAUSED", label: "Pausados", color: "border-neutral-400", bg: "bg-neutral-50", icon: "⏸️" },
  { key: "INACTIVE", label: "Inactivos", color: "border-red-400", bg: "bg-red-50", icon: "❌" },
]

export default function CRMPage() {
  const { profile } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [dragging, setDragging] = useState<string | null>(null)

  useEffect(() => {
    if (profile?.teacherProfileId) loadLeads(profile.teacherProfileId)
  }, [profile?.teacherProfileId])

  async function loadLeads(teacherId: string) {
    const { data } = await supabase
      .from("StudentProfile")
      .select("id, status, lead_source, lifetime_value, created_at, modalidad, User ( name, email, phone )")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false })

    if (data) {
      setLeads(data.map((s: any) => ({
        id: s.id, status: s.status ?? "PROSPECT",
        name: s.User?.name ?? "—", email: s.User?.email ?? "—", phone: s.User?.phone ?? "",
        lead_source: s.lead_source ?? "", lifetime_value: s.lifetime_value ?? 0,
        created_at: s.created_at, modalidad: s.modalidad ?? "online",
      })))
    }
    setLoading(false)
  }

  async function moveCard(leadId: string, newStatus: string) {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l))
    await supabase.from("StudentProfile").update({ status: newStatus }).eq("id", leadId)
  }

  function handleDragStart(e: React.DragEvent, leadId: string) {
    e.dataTransfer.setData("text/plain", leadId)
    setDragging(leadId)
  }

  function handleDragOver(e: React.DragEvent) { e.preventDefault() }

  function handleDrop(e: React.DragEvent, targetStatus: string) {
    e.preventDefault()
    const leadId = e.dataTransfer.getData("text/plain")
    if (leadId) moveCard(leadId, targetStatus)
    setDragging(null)
  }

  const getLeadsForColumn = (status: string) => leads.filter(l => l.status === status)
  const totalLeads = leads.length
  const conversionRate = totalLeads > 0 ? Math.round((getLeadsForColumn("ACTIVE").length / totalLeads) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight">CRM Pipeline</h1>
          <p className="text-neutral-500 font-medium mt-1">{totalLeads} contactos · {conversionRate}% conversión</p>
        </div>
        <Link href="/dashboard/alumnos/nuevo" className="px-6 py-3 bg-neutral-900 text-white rounded-2xl text-sm font-bold hover:bg-violet-600 transition-colors shadow-lg">
          + Nuevo Lead
        </Link>
      </div>

      {/* Funnel summary */}
      <div className="flex gap-2">
        {COLUMNS.map(col => {
          const count = getLeadsForColumn(col.key).length
          return (
            <div key={col.key} className={`flex-1 ${col.bg} rounded-xl p-3 border-t-4 ${col.color}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{col.label}</span>
                <span className="text-lg font-black text-neutral-900">{count}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="grid grid-cols-5 gap-4">{[1,2,3,4,5].map(i => <div key={i} className="bg-white rounded-2xl border p-6 animate-pulse h-64" />)}</div>
      ) : (
        <div className="grid grid-cols-5 gap-4 min-h-[500px]">
          {COLUMNS.map(col => (
            <div
              key={col.key}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, col.key)}
              className="bg-neutral-50/50 rounded-2xl p-3 space-y-3"
            >
              {/* Column Header */}
              <div className={`flex items-center gap-2 p-3 rounded-xl border-l-4 ${col.color} bg-white`}>
                <span>{col.icon}</span>
                <span className="text-sm font-black text-neutral-900">{col.label}</span>
                <span className="ml-auto bg-neutral-100 text-neutral-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {getLeadsForColumn(col.key).length}
                </span>
              </div>

              {/* Cards */}
              {getLeadsForColumn(col.key).map(lead => (
                <Link key={lead.id} href={`/dashboard/alumnos/detalles?id=${lead.id}`}>
                  <div
                    draggable
                    onDragStart={e => handleDragStart(e, lead.id)}
                    className={`bg-white rounded-xl p-4 border border-neutral-100 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group ${
                      dragging === lead.id ? "opacity-50 scale-95" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-xs font-bold text-violet-600">
                        {lead.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-neutral-900 text-sm truncate group-hover:text-violet-600 transition-colors">{lead.name}</p>
                        <p className="text-[11px] text-neutral-400 truncate">{lead.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {lead.lead_source && (
                        <span className="bg-neutral-100 text-neutral-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{lead.lead_source}</span>
                      )}
                      <span className="bg-neutral-100 text-neutral-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {lead.modalidad === "online" ? "📹" : "🏠"}
                      </span>
                      {lead.lifetime_value > 0 && (
                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto">
                          {formatCurrency(lead.lifetime_value)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}

              {getLeadsForColumn(col.key).length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-xs text-neutral-300 font-bold">Arrastra aquí</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
