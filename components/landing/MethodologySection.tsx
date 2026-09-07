interface MethodologyItem {
  icon: string
  title: string
  description: string
}

interface MethodologySectionProps {
  title: string
  text: string
  items: MethodologyItem[]
}

const DEFAULT_ITEMS: MethodologyItem[] = [
  {
    icon: "🎯",
    title: "Método Progresivo",
    description:
      "Empezamos desde tu nivel actual y avanzamos a tu ritmo, con un plan de estudios personalizado.",
  },
  {
    icon: "🎵",
    title: "Repertorio Real",
    description:
      "Aprendemos con canciones que te gustan, no con ejercicios aburridos. La práctica tiene que motivar.",
  },
  {
    icon: "📱",
    title: "Seguimiento Digital",
    description:
      "Accede a grabaciones de tus clases, materiales y tu progreso desde la app de Khora.",
  },
]

export default function MethodologySection({
  title,
  text,
  items,
}: MethodologySectionProps) {
  const displayItems = items.length > 0 ? items : DEFAULT_ITEMS

  return (
    <section
      id="metodologia"
      className="py-20 px-6"
      style={{ background: "#0a0a0c" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div>
            <p
              className="text-xs font-black uppercase tracking-widest mb-4"
              style={{ color: "#f97316" }}
            >
              Cómo Trabajamos
            </p>
            <h2
              className="text-4xl font-black text-white leading-tight mb-6"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {title || "Nuestra Metodología"}
            </h2>
            <p className="text-neutral-300 leading-relaxed text-base mb-8">
              {text ||
                "Un enfoque práctico y progresivo que combina técnica sólida con música real. Cada clase está diseñada para que sientas avance desde el primer día."}
            </p>

            {/* Decoration line */}
            <div
              className="h-1 w-20 rounded-full"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #f97316)",
              }}
            />
          </div>

          {/* Right: Items */}
          <div className="space-y-5">
            {displayItems.map((item, i) => (
              <div
                key={i}
                className="flex gap-5 p-6 rounded-2xl transition-all hover:scale-[1.01]"
                style={{
                  background: "#141418",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(249,115,22,0.15))",
                    border: "1px solid rgba(124,58,237,0.25)",
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-white font-black text-base mb-1">
                    {item.title}
                  </h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
