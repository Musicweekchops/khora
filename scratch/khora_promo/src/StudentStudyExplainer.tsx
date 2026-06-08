import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
} from "remotion";
import React from "react";

const COLORS = {
  background: "#0c0c0e",
  surface: "#ffffff",
  border: "#e5e5e5",
  textPrimary: "#171717",
  textSecondary: "#737373",
  violet: "#7c3aed",
  indigo: "#4f46e5",
  blue: "#2563eb",
  emerald: "#10b981",
  emeraldLight: "#f0fdf4",
  emeraldBorder: "#bbf7d0",
  emeraldText: "#166534",
};

// ============================================================================
// SUBCOMPONENTE: PHONE 3D RENDER (ROTADO 15° Y CON PERSPECTIVA)
// ============================================================================
interface Phone3DProps {
  children: React.ReactNode;
  floatDelay?: string;
}

const Phone3D: React.FC<Phone3DProps> = ({ children, floatDelay = "0s" }) => {
  return (
    <div
      style={{
        width: 340,
        height: 700,
        perspective: 1500,
        transformStyle: "preserve-3d",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 320,
          height: 670,
          backgroundColor: "#ffffff",
          borderRadius: 40,
          border: "10px solid #1f2937",
          position: "relative",
          transformStyle: "preserve-3d",
          transform: "rotateY(-15deg) rotateX(6deg) rotateZ(1deg)",
          animation: "floatPhone 4s ease-in-out infinite",
          animationDelay: floatDelay,
          boxShadow: `
            1px 1px 0px #374151,
            2px 2px 0px #374151,
            3px 3px 0px #1f2937,
            4px 4px 0px #1f2937,
            5px 5px 0px #111827,
            6px 6px 0px #111827,
            10px 10px 20px rgba(0, 0, 0, 0.4)
          `,
          overflow: "hidden",
          color: COLORS.textPrimary,
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 50%)", zIndex: 99, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", width: 80, height: 20, backgroundColor: "#000000", borderRadius: 99, zIndex: 100 }} />
        
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 700, color: "#a3a3a3", padding: "14px 20px 0 20px", zIndex: 90, backgroundColor: "#ffffff" }}>
          <span>9:41</span>
          <span>📶 🛜 🔋</span>
        </div>

        <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", flexDirection: "column", backgroundColor: "#ffffff" }}>
          {children}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// DISEÑO COMÚN DE SLIDE
// ============================================================================
interface SlideLayoutProps {
  label: string;
  title: string;
  desc: string;
  footnote?: string;
  slideProgress: number;
  device: React.ReactNode;
}

const SlideLayout: React.FC<SlideLayoutProps> = ({
  label,
  title,
  desc,
  footnote = "Servicio 100% gratis",
  slideProgress,
  device,
}) => {
  const textOpacity = interpolate(slideProgress, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const textTranslateX = interpolate(slideProgress, [0, 15], [-40, 0], { extrapolateRight: "clamp" });

  const deviceOpacity = interpolate(slideProgress, [5, 20], [0, 1], { extrapolateRight: "clamp" });
  const deviceTranslateX = interpolate(slideProgress, [5, 20], [40, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 50px",
        height: "100%",
        width: "100%",
      }}
    >
      <div
        style={{
          width: 500,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          opacity: textOpacity,
          transform: `translateX(${textTranslateX}px)`,
        }}
      >
        <span
          style={{
            backgroundColor: "rgba(124, 58, 237, 0.18)",
            color: "#c084fc",
            border: "1.5px solid rgba(124, 58, 237, 0.3)",
            fontSize: 22,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: 2,
            padding: "10px 24px",
            borderRadius: 99,
            marginBottom: 30,
            fontFamily: "Outfit, Inter, sans-serif",
          }}
        >
          {label}
        </span>

        <h1
          style={{
            fontSize: 54,
            fontWeight: 950,
            lineHeight: 1.15,
            color: "#ffffff",
            letterSpacing: "-0.03em",
            margin: "0 0 24px 0",
            fontFamily: "Outfit, Inter, sans-serif",
          }}
        >
          {title}
        </h1>

        <p
          style={{
            fontSize: 26,
            color: "#a1a1aa",
            fontWeight: 500,
            lineHeight: 1.5,
            margin: "0 0 40px 0",
          }}
        >
          {desc}
        </p>

        {footnote && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              backgroundColor: "rgba(16, 185, 129, 0.08)",
              border: "1.5px solid rgba(16, 185, 129, 0.3)",
              padding: "12px 24px",
              borderRadius: 16,
            }}
          >
            <span style={{ fontSize: 24, color: "#10b981" }}>✓</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#34d399", fontFamily: "Outfit, Inter, sans-serif" }}>
              {footnote}
            </span>
          </div>
        )}
      </div>

      <div
        style={{
          width: 480,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          opacity: deviceOpacity,
          transform: `translateX(${deviceTranslateX}px)`,
        }}
      >
        {device}
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// PANTALLAS INTERNAS DE DISPOSITIVO (CELULAR ALUMNO)
// ============================================================================

// Vista 1: Login de Alumno
const StudentWelcomeView = ({ slideProgress }: { slideProgress: number }) => {
  const isEntering = slideProgress >= 40;

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#ffffff", padding: "30px 24px", display: "flex", flexDirection: "column", gap: 20, justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: COLORS.violet, color: "#ffffff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 900, fontFamily: "Outfit, sans-serif", marginBottom: 12 }}>K</div>
        <h4 style={{ fontSize: 20, fontWeight: 950, margin: 0, fontFamily: "Outfit, sans-serif" }}>Bienvenido a Khora</h4>
        <p style={{ fontSize: 11, color: COLORS.textSecondary, margin: "4px 0 0 0" }}>Tu portal de estudios musicales</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <label style={{ fontSize: 9, fontWeight: 800, color: COLORS.textSecondary, display: "block", marginBottom: 4 }}>CORREO ELECTRÓNICO</label>
          <div style={{ border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: 10, fontSize: 11, fontWeight: 600 }}>sofia@gmail.com</div>
        </div>
        <div>
          <label style={{ fontSize: 9, fontWeight: 800, color: COLORS.textSecondary, display: "block", marginBottom: 4 }}>CONTRASEÑA</label>
          <div style={{ border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: 10, fontSize: 11, color: COLORS.textTertiary }}>••••••••••••</div>
        </div>
      </div>

      <div
        style={{
          backgroundColor: isEntering ? COLORS.emerald : COLORS.violet,
          color: "#ffffff",
          fontSize: 12,
          fontWeight: 900,
          padding: "12px 0",
          borderRadius: 12,
          textAlign: "center",
          boxShadow: "0 10px 20px rgba(124, 58, 237, 0.15)",
          transform: `scale(${isEntering ? 0.95 : 1})`,
          transition: "background-color 0.2s, transform 0.1s",
        }}
      >
        {isEntering ? "Ingresando..." : "Iniciar Sesión"}
      </div>
    </div>
  );
};

// Vista 2: Materiales Organizacion
const StudentFolderView = () => {
  return (
    <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 15, flex: 1, backgroundColor: "#ffffff" }}>
      <div style={{ borderBottom: `2px solid ${COLORS.border}`, paddingBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 800, color: COLORS.textSecondary, textTransform: "uppercase", margin: 0 }}>PORTAL ALUMNO</p>
          <p style={{ fontSize: 18, fontWeight: 900, color: COLORS.textPrimary, margin: "4px 0 0 0", fontFamily: "Outfit, sans-serif" }}>Clase de Piano</p>
        </div>
        <span style={{ fontSize: 24 }}>🎹</span>
      </div>

      <p style={{ fontSize: 10, fontWeight: 850, color: COLORS.textSecondary, textTransform: "uppercase", margin: "0 0 4px 0" }}>Mis Tareas y Libros</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { icon: "📕", name: "Método_Piano_Vol_1.pdf", desc: "Clase 1 · Partituras básicas" },
          { icon: "📄", name: "Ejercicios_Escalas.pdf", desc: "Clase 2 · Práctica diaria" },
          { icon: "📹", name: "Posición_Manos.mp4", desc: "Clase 3 · Guía en video" }
        ].map((file, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, backgroundColor: "#fafafa", border: `2px solid ${COLORS.border}`, padding: 12, borderRadius: 16 }}>
            <span style={{ fontSize: 22 }}>{file.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 850, color: COLORS.textPrimary, margin: 0 }}>{file.name}</p>
              <p style={{ fontSize: 10, color: COLORS.textSecondary, fontWeight: 650, margin: "2px 0 0 0" }}>{file.desc}</p>
            </div>
            <span style={{ fontSize: 12, color: COLORS.textTertiary }}>👁️</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Vista 3: Lector PDF y Pentagrama
const StudentPdfView = () => {
  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#ffffff", display: "flex", flexDirection: "column" }}>
      <div style={{ backgroundColor: "#f9fafb", padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `2px solid ${COLORS.border}`, marginTop: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>📕</span>
          <span style={{ fontSize: 11, fontWeight: 900, color: COLORS.textPrimary }}>Método_Piano_Vol_1.pdf</span>
        </div>
        <span style={{ fontSize: 9, fontWeight: 800, color: COLORS.textSecondary, backgroundColor: "#e5e7eb", padding: "4px 8px", borderRadius: 8 }}>
          Pág 1/48
        </span>
      </div>

      <div style={{ flex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14, backgroundColor: "#fdfdfd" }}>
        <h5 style={{ fontSize: 14, fontWeight: 900, textAlign: "center", color: COLORS.textPrimary, margin: 0, textTransform: "uppercase", letterSpacing: 0.5, fontFamily: "Outfit, sans-serif" }}>Capítulo 1: Teoría Musical</h5>
        
        <div style={{ fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.4, textAlign: "left", margin: "4px 0" }}>
          Para dominar la independencia de manos en el teclado, es fundamental estudiar la métrica de forma lenta. Mantén la muñeca relajada y la posición curva de los dedos sobre las teclas:
        </div>

        {/* Pentagrama mini */}
        <div style={{ position: "relative", width: "100%", height: 50, display: "flex", flexDirection: "column", justifyContent: "space-between", marginTop: 10 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ width: "100%", height: 1.5, backgroundColor: "#1f2937" }} />
          ))}
          <span style={{ position: "absolute", left: 6, top: -11, fontSize: 32 }}>𝄞</span>
          <span style={{ position: "absolute", left: 90, top: 12, fontSize: 24 }}>♩</span>
          <span style={{ position: "absolute", left: 170, top: 2, fontSize: 24 }}>♩</span>
          <span style={{ position: "absolute", left: 250, top: 12, fontSize: 24 }}>♪</span>
          <span style={{ position: "absolute", left: 290, top: 4, fontSize: 24 }}>♪</span>
          <div style={{ position: "absolute", left: 150, top: 0, width: 1.5, height: "100%", backgroundColor: "#1f2937" }} />
        </div>

        <div style={{ backgroundColor: "rgba(16, 185, 129, 0.06)", border: `1.5px solid ${COLORS.emeraldBorder}`, padding: "10px 14px", borderRadius: 10, display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginTop: 15 }}>
          <span style={{ fontSize: 16 }}>🛡️</span>
          <span style={{ fontSize: 11, color: COLORS.emeraldText, fontWeight: 800 }}>Lector integrado · Sin descargas</span>
        </div>
      </div>
    </div>
  );
};

// Cierre/CTA
const CTAView = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
      }}
    >
      <div
        style={{
          width: 240,
          height: 240,
          backgroundColor: COLORS.violet,
          color: "#ffffff",
          borderRadius: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 120,
          fontWeight: 950,
          boxShadow: "0 15px 30px rgba(124, 58, 237, 0.35)",
          animation: "floatLogo 4s ease-in-out infinite",
          fontFamily: "Outfit, sans-serif",
        }}
      >
        K
      </div>

      <div
        style={{
          backgroundColor: COLORS.violet,
          color: "#ffffff",
          fontSize: 40,
          fontWeight: 950,
          padding: "16px 50px",
          borderRadius: 20,
          boxShadow: "0 15px 30px rgba(124, 58, 237, 0.3)",
          border: "2px solid #c084fc",
          fontFamily: "Outfit, Inter, sans-serif",
          marginTop: 20,
        }}
      >
        khora.cl
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export const StudentStudyExplainer = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dividimos 600 frames en 4 slides (150 frames cada uno)
  const getSlideIndex = (f: number) => {
    if (f < 150) return 0;
    if (f < 300) return 1;
    if (f < 450) return 2;
    return 3;
  };

  const slideIndex = getSlideIndex(frame);
  const slideStarts = [0, 150, 300, 450];
  const slideProgress = frame - slideStarts[slideIndex];

  const fontStyle = {
    fontFamily: "Inter, system-ui, sans-serif",
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0c0c0e",
        color: COLORS.whiteText,
        overflow: "hidden",
        position: "relative",
        ...fontStyle,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@600;700;800;900;950&display=swap');
        
        @keyframes floatPhone {
          0%, 100% { transform: rotateY(-15deg) rotateX(6deg) rotateZ(1deg) translateY(0px); }
          50% { transform: rotateY(-15deg) rotateX(6deg) rotateZ(1deg) translateY(-16px); }
        }
        @keyframes floatLogo {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
      `}</style>

      {/* Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
          opacity: 0.6,
        }}
      />

      {/* Glows */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 800,
          backgroundColor: slideIndex === 2 ? "rgba(16, 185, 129, 0.1)" : "rgba(124, 58, 237, 0.1)",
          borderRadius: "9999px",
          filter: "blur(130px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ width: "100%", height: "100%" }}>
        {slideIndex === 0 && (
          <SlideLayout
            label="Portal de Estudios"
            title="Tu espacio de aprendizaje"
            desc="Accede a tu cuenta desde tu celular para ver todo el material que te asignó tu profesor."
            footnote="Servicio 100% gratis"
            slideProgress={slideProgress}
            device={<Phone3D><StudentWelcomeView slideProgress={slideProgress} /></Phone3D>}
          />
        )}

        {slideIndex === 1 && (
          <SlideLayout
            label="Portal de Estudios"
            title="Todo tu material en orden"
            desc="Visualiza tus partituras, tareas, audios y videos organizados clase a clase, sin descargas."
            footnote="Servicio 100% gratis"
            slideProgress={slideProgress}
            device={<Phone3D><StudentFolderView /></Phone3D>}
          />
        )}

        {slideIndex === 2 && (
          <SlideLayout
            label="Portal de Estudios"
            title="Estudia directo en la app"
            desc="Abre tus partituras y guías en el lector integrado. Práctico, rápido y sin llenar tu memoria."
            footnote="Servicio 100% gratis"
            slideProgress={slideProgress}
            device={<Phone3D><StudentPdfView /></Phone3D>}
          />
        )}

        {slideIndex === 3 && (
          <SlideLayout
            label="Comienza Hoy"
            title="Lleva tus clases al siguiente nivel"
            desc="Moderniza tu enseñanza con una experiencia premium. Crea tu cuenta en segundos y úsalo gratis."
            footnote="Servicio 100% gratis para profesores"
            slideProgress={slideProgress}
            device={<CTAView />}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};
