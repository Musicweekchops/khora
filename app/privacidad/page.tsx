import Link from "next/link"
import { ArrowLeft, ShieldCheck, Lock } from "lucide-react"

export const metadata = {
  title: "Política de Privacidad y Cookies — Khora",
  description: "Tratamiento de datos personales, cookies y seguridad en Khora",
}

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 font-sans antialiased py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Navigation */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        {/* Header */}
        <div className="border-b border-neutral-200 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold tracking-wide uppercase mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> Privacidad y Seguridad
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-950 sm:text-4xl">
            Política de Privacidad y Cookies
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Última actualización: 31 de octubre de 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-neutral max-w-none text-sm leading-relaxed space-y-6 text-neutral-700">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900">1. Compromiso de Privacidad</h2>
            <p>
              En Khora nos comprometemos a proteger la privacidad y seguridad de los datos personales de nuestros usuarios (profesores, alumnos, apoderados y postulantes a clases). Tratamos su información conforme a la legislación vigente sobre protección de la vida privada (Ley N° 19.628 de Chile y estándares internacionales afines).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900">2. Datos que Recopilamos</h2>
            <p>
              Recopilamos únicamente los datos necesarios para la adecuada coordinación pedagógica y operativa de las clases:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Datos de Identificación y Contacto:</strong> Nombre completo, correo electrónico, número de teléfono / WhatsApp.</li>
              <li><strong>Información de Clases y Agenda:</strong> Fechas, horarios, modalidad (online o presencial), instrumento o especialidad, notas pedagógicas y estado de asistencia.</li>
              <li><strong>Historial de Pagos y Facturación:</strong> Montos, fechas y comprobantes emitidos (sin almacenar datos de tarjetas bancarias).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900">3. Finalidad del Tratamiento</h2>
            <p>
              Sus datos personales son utilizados exclusivamente para:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Coordinar, agendar y confirmar clases entre alumno y profesor.</li>
              <li>Enviar recordatorios automáticos de clase, avisos de reagendamiento y comprobantes por correo electrónico y WhatsApp.</li>
              <li>Proporcionar acceso al portal del alumno para consultar tareas, videos de práctica y material de estudio.</li>
              <li>Garantizar la seguridad, autenticación y prevención de fraudes en la plataforma.</li>
            </ul>
            <p className="font-semibold text-neutral-900">
              Khora no vende, no arrienda ni cede datos personales a terceros con fines publicitarios o comerciales ajenos a la actividad de las clases.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900">4. Uso de Cookies y Almacenamiento Local</h2>
            <p>
              Khora utiliza cookies técnicas y almacenamiento local (<code className="text-xs bg-neutral-100 p-1 rounded">localStorage</code>) esenciales para el funcionamiento seguro de la aplicación:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Cookies y Tokens de Sesión:</strong> Permiten mantener la sesión abierta del usuario de forma segura y cifrada.</li>
              <li><strong>Cookies de Pasarela de Pagos (Mercado Pago):</strong> Utilizadas para la validación antifraude durante las transacciones seguras.</li>
              <li><strong>Preferencias del Usuario:</strong> Almacenan de manera local la aceptación del banner de cookies y el estado de la reserva.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900">5. Derechos del Usuario (Acceso, Rectificación y Cancelación)</h2>
            <p>
              El usuario puede ejercer en cualquier momento sus derechos de acceso, rectificación o eliminación de sus datos personales enviando una solicitud a <a href="mailto:hola@khora.cl" className="text-violet-600 font-semibold underline">hola@khora.cl</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

