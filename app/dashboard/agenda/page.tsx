"use client"
export default function AgendaPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Agenda</h1>
      <div className="bg-white rounded-3xl border border-neutral-100 p-12 text-center">
        <span className="text-5xl mb-4 block opacity-30">📅</span>
        <p className="text-neutral-900 font-bold text-lg">Vista de Calendario</p>
        <p className="text-neutral-500 text-sm mt-1">Tu calendario semanal se mostrará aquí una vez tengas clases programadas.</p>
      </div>
    </div>
  )
}
