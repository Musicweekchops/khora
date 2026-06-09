"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface AcademyProfile {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  region: string | null
  plan: string
  is_active: boolean
}

interface Props {
  academyId: string
}

export default function AcademySettings({ academyId }: Props) {
  const [profile, setProfile] = useState<AcademyProfile | null>(null)
  const [form, setForm] = useState({ name: "", slug: "", description: "", region: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (academyId) {
      loadProfile()
    }
  }, [academyId])

  async function loadProfile() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("AcademyProfile")
        .select("*")
        .eq("id", academyId)
        .single()

      if (error) throw error

      if (data) {
        setProfile(data)
        setForm({
          name: data.name ?? "",
          slug: data.slug ?? "",
          description: data.description ?? "",
          region: data.region ?? "",
        })
      }
    } catch (err) {
      console.error("Error loading academy profile:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.slug.trim()) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from("AcademyProfile")
        .update({
          name: form.name.trim(),
          slug: form.slug.trim().toLowerCase(),
          description: form.description.trim() || null,
          region: form.region.trim() || null,
        })
        .eq("id", academyId)

      if (error) throw error

      toast.success("Ajustes actualizados correctamente")
      loadProfile()
    } catch (err: any) {
      console.error("Error updating academy profile:", err)
      toast.error(err.message ?? "Error al actualizar ajustes")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-neutral-100 rounded-2xl p-8 space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-neutral-100 rounded" />
        <div className="h-10 w-full bg-neutral-100 rounded-xl" />
        <div className="h-10 w-full bg-neutral-100 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-50">
        <h2 className="text-sm font-semibold text-neutral-900 font-sans">Ajustes de la Academia</h2>
        <p className="text-xs text-neutral-400 mt-0.5 font-sans">Configura los detalles de tu perfil público y de reservas</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1.5 font-sans">Nombre de la Academia</label>
            <input
              type="text" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full text-sm px-3 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all font-sans"
              placeholder="Mi Academia"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1.5 font-sans">Slug / URL Amigable</label>
            <div className="flex rounded-xl border border-neutral-200 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-400 transition-all">
              <span className="bg-neutral-50 px-3 py-2.5 text-xs text-neutral-400 border-r border-neutral-200 flex items-center font-sans">/agendar?a=</span>
              <input
                type="text" required value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                className="w-full text-sm px-3 py-2.5 outline-none font-sans"
                placeholder="mi-academia"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1.5 font-sans">Descripción / Presentación</label>
          <textarea
            value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            className="w-full text-sm px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all font-sans resize-none"
            rows={3}
            placeholder="Describe tu academia, historia, metodologías..."
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1.5 font-sans">Comuna / Región</label>
          <input
            type="text" value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value }))}
            className="w-full text-sm px-3 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all font-sans"
            placeholder="Santiago, Chile"
          />
        </div>

        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 flex items-center justify-between text-xs">
          <div>
            <p className="font-semibold text-neutral-700 font-sans">Plan actual: <span className="capitalize text-emerald-600 font-bold">{profile?.plan ?? "manual"}</span></p>
            <p className="text-neutral-400 mt-0.5 font-sans">Estado de suscripción: {profile?.is_active ? "Activo" : "Inactivo"}</p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit" disabled={saving}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60 flex items-center gap-2 shadow-sm font-sans"
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  )
}
