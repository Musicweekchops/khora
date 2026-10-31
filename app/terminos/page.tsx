import Link from "next/link"
import { ArrowLeft, Shield, FileText } from "lucide-react"

export const metadata = {
  title: "Términos del Servicio — Khora",
  description: "Términos y condiciones de uso de la plataforma Khora",
}

export default function TerminosPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-bold tracking-wide uppercase mb-3">
            <FileText className="w-3.5 h-3.5" /> Términos del Servicio
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-950 sm:text-4xl">
            Términos y Condiciones de Uso
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Última actualización: 31 de octubre de 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-neutral max-w-none text-sm leading-relaxed space-y-6 text-neutral-700">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900">1. Aceptación de los Términos</h2>
            <p>
              Al acceder, registrarse o utilizar la plataforma Khora (en adelante, la &quot;Plataforma&quot;), tanto en calidad de profesor, academia, alumno o postulante a clases de prueba, usted acepta regirse por los presentes Términos y Condiciones y por nuestra Política de Privacidad.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900">2. Descripción del Servicio</h2>
            <p>
              Khora es una plataforma tecnológica de gestión integral diseñada para profesores, academias y estudiantes de música y disciplinas afines. Facilita la programación de horarios, reserva de clases regulares y de prueba, gestión de contenidos de aprendizaje, seguimiento de progreso y registro de pagos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900">3. Reservas, Clases de Prueba y Reagendamientos</h2>
            <p>
              Las reservas de sesiones regulares y de prueba están sujetas a la disponibilidad en tiempo real del profesor. Al solicitar una reserva, el alumno se compromete a asistir en el horario seleccionado o a notificar su reagendamiento o cancelación dentro de los plazos establecidos por su profesor o academia.
            </p>
            <p>
              La plataforma implementa algoritmos de optimización de horarios para prevenir la fragmentación injustificada de la agenda del docente y asegurar un servicio equitativo para todos los estudiantes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900">4. Pagos y Pasarelas de Terceros</h2>
            <p>
              Las transacciones y pagos electrónicos se procesan de manera segura a través de pasarelas de pago certificadas (como Mercado Pago). Khora no almacena números de tarjeta de crédito, cuentas bancarias ni claves de seguridad. Cualquier cobro o reembolso se regirá por las políticas acordadas entre el alumno y su profesor o academia respectiva.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900">5. Comunicaciones y Notificaciones</h2>
            <p>
              Al registrarse o agendar una clase, el usuario autoriza expresamente a Khora a enviar comunicaciones transaccionales indispensables para la prestación del servicio (confirmaciones de reserva, enlaces de acceso virtual, recordatorios de clase y comprobantes de pago) vía correo electrónico y/o WhatsApp.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-neutral-900">6. Contacto</h2>
            <p>
              Para cualquier consulta sobre estos términos, puede contactarse con nosotros en <a href="mailto:hola@khora.cl" className="text-violet-600 font-semibold underline">hola@khora.cl</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

