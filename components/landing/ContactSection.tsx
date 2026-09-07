interface ContactSectionProps {
  whatsapp: string
  email: string
  teacherName: string
  slug: string
}

export default function ContactSection({
  whatsapp,
  email,
  teacherName,
  slug,
}: ContactSectionProps) {
  const waNumber = whatsapp.replace(/\D/g, "")
  const waMessage = encodeURIComponent(
    `Hola ${teacherName}! Vi tu perfil en Khora y me gustaría saber más sobre las clases.`
  )

  return (
    <section
      id="contacto"
      className="py-20 px-6"
      style={{
        background:
          "radial-gradient(ellipse at 50% 100%, rgba(249,115,22,0.08) 0%, transparent 60%), #0c0c10",
      }}
    >
      <div className="max-w-3xl mx-auto text-center">
        {/* Eyebrow */}
        <p
          className="text-xs font-black uppercase tracking-widest mb-4"
          style={{ color: "#f97316" }}
        >
          ¿Listo para Empezar?
        </p>

        {/* Heading */}
        <h2
          className="text-4xl lg:text-5xl font-black text-white leading-tight mb-5"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Tu primera clase te está{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #a855f7, #f97316)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            esperando
          </span>
        </h2>

        <p className="text-neutral-400 text-lg mb-10 leading-relaxed">
          Reserva tu clase de prueba ahora mismo o escríbenos si tienes alguna pregunta.
          Respondemos en minutos.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <a
            href={`/agendar?teacher=${slug}`}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl text-sm font-black uppercase tracking-wider text-white transition-all hover:scale-105 hover:shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #f97316)",
              boxShadow: "0 8px 32px rgba(124,58,237,0.4)",
            }}
          >
            🎯 Reservar Clase de Prueba
          </a>
          <a
            href={`https://wa.me/${waNumber}?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-10 py-4 rounded-2xl text-sm font-black uppercase tracking-wider text-white transition-all hover:scale-105"
            style={{
              background: "#22c55e",
              boxShadow: "0 8px 32px rgba(34,197,94,0.3)",
            }}
          >
            💬 Escribir por WhatsApp
          </a>
        </div>

        {/* Divider */}
        <div
          className="h-px w-48 mx-auto mb-8"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)",
          }}
        />

        {/* Contact info */}
        <div className="flex flex-wrap justify-center gap-6">
          {email && (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-80"
              style={{ color: "#9ca3af" }}
            >
              <span>✉️</span>
              <span>{email}</span>
            </a>
          )}
          <a
            href={`https://wa.me/${waNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ color: "#9ca3af" }}
          >
            <span>📱</span>
            <span>{whatsapp}</span>
          </a>
        </div>
      </div>
    </section>
  )
}
