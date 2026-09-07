interface Product {
  id: string
  title: string
  description: string | null
  price: number
  type: "COURSE" | "PLAN"
  duration_months: number
}

interface PricingSectionProps {
  products: Product[]
  slug: string
}

function formatCLP(amount: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount)
}

const PLAN_ICONS: Record<string, string> = {
  "0": "🎯",
  "1": "🏆",
  "2": "💎",
}
const PLAN_FEATURES_PLAN = [
  "Clases incluidas según tu plan",
  "Acceso a la app de Khora",
  "Confirmación por WhatsApp",
  "Reprogramación sin costo",
]
const PLAN_FEATURES_COURSE = [
  "Acceso completo a todas las lecciones",
  "Materiales descargables incluidos",
  "Acceso desde tu perfil de Khora",
  "Confirmación de compra por correo",
]

export default function PricingSection({ products, slug }: PricingSectionProps) {
  if (products.length === 0) return null

  // Ordenar: primero PLAN, luego COURSE; dentro de cada tipo por precio ascendente
  const sorted = [...products].sort((a, b) => {
    if (a.type !== b.type) return a.type === "PLAN" ? -1 : 1
    return a.price - b.price
  })

  const mostPopularIdx = sorted.findIndex((p) => p.type === "PLAN" && p.duration_months === 1) ?? 0

  return (
    <section
      id="precios"
      className="py-20 px-6"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 60%), #0a0a0c",
      }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p
            className="text-xs font-black uppercase tracking-widest mb-3"
            style={{ color: "#f97316" }}
          >
            Transparencia Total
          </p>
          <h2
            className="text-4xl font-black text-white"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Planes y Precios
          </h2>
          <p className="text-neutral-400 mt-3 font-medium">
            Sin letra chica. Elige el que mejor se adapta a ti.
          </p>
        </div>

        {/* Cards */}
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: `repeat(${Math.min(sorted.length, 3)}, 1fr)`,
          }}
        >
          {sorted.map((product, idx) => {
            const isPopular = idx === mostPopularIdx
            const isPlan = product.type === "PLAN"
            const durationLabel =
              product.duration_months === 1
                ? "/ mes"
                : product.duration_months === 3
                ? "/ trimestre"
                : product.duration_months === 12
                ? "/ año"
                : `/ ${product.duration_months} meses`

            return (
              <div
                key={product.id}
                className="relative rounded-3xl p-7 flex flex-col"
                style={{
                  background: isPopular
                    ? "linear-gradient(160deg, rgba(124,58,237,0.15), rgba(249,115,22,0.12))"
                    : "#141418",
                  border: isPopular
                    ? "1.5px solid rgba(249,115,22,0.5)"
                    : "1px solid rgba(255,255,255,0.07)",
                  boxShadow: isPopular
                    ? "0 24px 60px rgba(124,58,237,0.2), 0 4px 20px rgba(249,115,22,0.15)"
                    : "none",
                }}
              >
                {/* Popular badge */}
                {isPopular && (
                  <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white"
                    style={{
                      background: "linear-gradient(135deg, #7c3aed, #f97316)",
                      boxShadow: "0 4px 16px rgba(249,115,22,0.4)",
                    }}
                  >
                    ✦ Más Popular
                  </div>
                )}

                {/* Icon & title */}
                <div className="mb-6">
                  <span className="text-3xl block mb-3">
                    {PLAN_ICONS[String(idx)] ?? "🎵"}
                  </span>
                  <h3 className="text-lg font-black text-white">{product.title}</h3>
                  {product.description && (
                    <p className="text-neutral-400 text-sm mt-1 leading-relaxed">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className="mb-7">
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-4xl font-black"
                      style={{
                        background: isPopular
                          ? "linear-gradient(135deg, #a855f7, #f97316)"
                          : "none",
                        WebkitBackgroundClip: isPopular ? "text" : "unset",
                        WebkitTextFillColor: isPopular ? "transparent" : "white",
                        backgroundClip: isPopular ? "text" : "unset",
                        color: isPopular ? "transparent" : "white",
                      }}
                    >
                      {formatCLP(product.price)}
                    </span>
                    {isPlan && (
                      <span className="text-neutral-500 text-sm font-bold">
                        {durationLabel}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-8 flex-1">
                  {(isPlan ? PLAN_FEATURES_PLAN : PLAN_FEATURES_COURSE).map(
                    (feat, fi) => (
                      <li key={fi} className="flex items-start gap-2.5">
                        <span
                          className="text-xs mt-0.5 flex-shrink-0"
                          style={{ color: "#f97316" }}
                        >
                          ✓
                        </span>
                        <span className="text-neutral-300 text-sm font-medium">
                          {feat}
                        </span>
                      </li>
                    )
                  )}
                </ul>

                {/* CTA */}
                <a
                  href={
                    isPlan
                      ? `/agendar?teacher=${slug}`
                      : `/comprar?id=${product.id}`
                  }
                  className="w-full py-3.5 px-6 rounded-2xl text-sm font-black uppercase tracking-wider text-center transition-all hover:scale-[1.02] block"
                  style={
                    isPopular
                      ? {
                          background: "linear-gradient(135deg, #7c3aed, #f97316)",
                          color: "white",
                          boxShadow: "0 6px 24px rgba(124,58,237,0.4)",
                        }
                      : {
                          background: "rgba(255,255,255,0.06)",
                          color: "white",
                          border: "1px solid rgba(255,255,255,0.12)",
                        }
                  }
                >
                  {isPlan ? "Comenzar Ahora" : "Comprar Curso"}
                </a>
              </div>
            )
          })}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 mt-10">
          {[
            { icon: "🔒", text: "Pago 100% seguro" },
            { icon: "💳", text: "Mercado Pago" },
            { icon: "📱", text: "Confirmación por WhatsApp" },
          ].map(({ icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2 text-xs font-semibold"
              style={{ color: "#6b7280" }}
            >
              <span>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
