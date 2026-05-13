"use client"

import AdminShell from "@/components/admin/AdminShell"
import { useState } from "react"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-50">
        <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  )
}

function Row({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-neutral-800">{label}</p>
        {sub && <p className="text-[11px] text-neutral-400 mt-0.5">{sub}</p>}
      </div>
      <div className="flex-shrink-0 ml-4">{children}</div>
    </div>
  )
}

export default function AdminSistemaPage() {
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <AdminShell>
      <div className="max-w-2xl mx-auto px-8 py-10 space-y-6 pb-16">

        <div>
          <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-widest mb-1">Administración</p>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Configuración del sistema</h1>
        </div>

        {/* Plataforma */}
        <Section title="Plataforma">
          <Row label="Nombre del servicio" sub="Visible en la interfaz pública">
            <input
              defaultValue="Khora"
              className="w-40 px-3 py-1.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 text-right"
            />
          </Row>
          <Row label="Correo de soporte" sub="Para notificaciones del sistema">
            <input
              defaultValue="admin@khora.com"
              className="w-52 px-3 py-1.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 text-right"
            />
          </Row>
          <Row label="Versión de la plataforma" sub="Actual">
            <span className="text-sm font-medium text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-xl">1.0.0</span>
          </Row>
        </Section>

        {/* Automatizaciones */}
        <Section title="Automatizaciones">
          <Row label="Recordatorios de pago" sub="Correos automáticos de cobranza (Cron Job)">
            <div className="flex items-center gap-2 text-[12px] text-neutral-500 bg-neutral-50 border border-neutral-100 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
              Activo — diario 10:00
            </div>
          </Row>
          <Row label="Envío de correos" sub="Proveedor: Resend API">
            <span className="text-[12px] text-neutral-500 bg-neutral-50 border border-neutral-100 px-3 py-1.5 rounded-xl font-medium">Resend</span>
          </Row>
        </Section>

        {/* Datos */}
        <Section title="Datos y exportación">
          <Row label="Exportar profesores" sub="Lista completa con métricas en CSV">
            <button className="px-4 py-1.5 text-sm font-medium bg-neutral-900 text-white rounded-xl hover:bg-neutral-700 transition-colors">
              Exportar CSV
            </button>
          </Row>
          <Row label="Exportar pagos" sub="Historial completo de transacciones">
            <button className="px-4 py-1.5 text-sm font-medium bg-neutral-900 text-white rounded-xl hover:bg-neutral-700 transition-colors">
              Exportar CSV
            </button>
          </Row>
        </Section>

        {/* Acceso */}
        <Section title="Acceso y seguridad">
          <Row label="Registro abierto" sub="Permite a nuevos profesores registrarse">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-10 h-6 bg-neutral-200 peer-checked:bg-neutral-900 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
            </label>
          </Row>
          <Row label="Autenticación de dos factores" sub="Para cuentas de administrador">
            <span className="text-[12px] text-neutral-400 italic">Próximamente</span>
          </Row>
        </Section>

        {/* Zona peligrosa */}
        <Section title="Zona de riesgo">
          <Row label="Eliminar cuentas inactivas" sub="Profesores sin actividad en más de 6 meses">
            <button className="px-4 py-1.5 text-sm font-medium bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors">
              Ejecutar limpieza
            </button>
          </Row>
        </Section>

        {/* Save */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-all ${
              saved ? "bg-emerald-500 text-white" : "bg-neutral-900 text-white hover:bg-neutral-700"
            }`}
          >
            {saved ? "✓ Guardado" : "Guardar cambios"}
          </button>
        </div>

      </div>
    </AdminShell>
  )
}
