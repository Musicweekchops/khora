interface TeacherBioProps {
  name: string
  headline: string
  bioText: string
  photoUrl: string | null
  tags: string[]
  instrumento: string | null
}

export default function TeacherBioSection({
  name,
  headline,
  bioText,
  photoUrl,
  tags,
  instrumento,
}: TeacherBioProps) {
  return (
    <section
      id="profesor"
      className="py-20 px-6"
      style={{ background: "#0c0c10" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Photo */}
          <div className="relative">
            <div
              className="absolute inset-0 rounded-3xl blur-3xl opacity-30"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #f97316)",
                transform: "scale(0.95) translateY(8px)",
              }}
            />
            <div
              className="relative rounded-3xl overflow-hidden aspect-[4/5]"
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={name}
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                  width={500}
                  height={625}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-8xl font-black text-white"
                  style={{
                    background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(249,115,22,0.2))",
                  }}
                >
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
              {/* Bottom overlay with gradient */}
              <div
                className="absolute bottom-0 left-0 right-0 h-32"
                style={{
                  background: "linear-gradient(to top, rgba(12,12,16,0.8), transparent)",
                }}
              />
              {/* Instrument tag on photo */}
              {instrumento && (
                <div
                  className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full text-xs font-black text-white"
                  style={{
                    background: "linear-gradient(135deg, rgba(124,58,237,0.9), rgba(249,115,22,0.9))",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  🥁 {instrumento}
                </div>
              )}
            </div>
          </div>

          {/* Text */}
          <div>
            <p
              className="text-xs font-black uppercase tracking-widest mb-4"
              style={{ color: "#f97316" }}
            >
              Tu Profesor
            </p>
            <h2
              className="text-4xl lg:text-5xl font-black text-white leading-tight mb-3"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {name}
            </h2>
            <p
              className="text-lg mb-6 font-medium"
              style={{ color: "#a855f7" }}
            >
              {headline}
            </p>
            <p className="text-neutral-300 leading-relaxed mb-8 text-base">
              {bioText}
            </p>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-1.5 rounded-full text-xs font-black text-white uppercase tracking-wider"
                    style={{
                      background: "rgba(124,58,237,0.15)",
                      border: "1px solid rgba(124,58,237,0.35)",
                      color: "#c4b5fd",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
