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
// SUBCOMPONENTE: LAPTOP FRONT PLANAR
// ============================================================================
interface LaptopProps {
  children: React.ReactNode;
}

const LaptopFront: React.FC<LaptopProps> = ({ children }) => {
  return (
    <div
      style={{
        width: 460,
        height: 340,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 420,
          height: 270,
          backgroundColor: "#ffffff",
          borderRadius: "14px 14px 0 0",
          border: "10px solid #1c1c1e",
          position: "relative",
          animation: "floatLaptop 4s ease-in-out infinite",
          boxShadow: "0 15px 30px rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
        }}
      >
        {children}
      </div>

      <div
        style={{
          width: 460,
          height: 12,
          backgroundColor: "#d1d5db",
          borderRadius: "0 0 10px 10px",
          borderBottom: "3px solid #9ca3af",
          boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
          zIndex: 10,
          animation: "floatLaptop 4s ease-in-out infinite",
        }}
      />
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
// VISTAS DE PANTALLA (INTERNAS)
// ============================================================================

// Vista 1: Laptop de Profesor - Copiar Link
const CopyLinkPanel = ({ slideProgress }: { slideProgress: number }) => {
  const isClicked = slideProgress >= 40 && slideProgress < 60;
  const isCopied = slideProgress >= 45;

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#ffffff", display: "flex", flexDirection: "column", color: COLORS.textPrimary }}>
      <div style={{ borderBottom: `2px solid #f3f4f6`, padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fafafa" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: COLORS.violet, color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900 }}>K</div>
          <span style={{ fontSize: 12, fontWeight: 900 }}>Khora Panel</span>
        </div>
      </div>
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 14, justifyContent: "center", flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 850, margin: 0, color: COLORS.textSecondary, textTransform: "uppercase" }}>Compartir Enlace</p>
        
        <div style={{ border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#fafafa" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>khora.cl/agendar?p=pedro-perez</span>
          
          <div
            style={{
              backgroundColor: isCopied ? COLORS.emerald : COLORS.violet,
              color: "#ffffff",
              fontSize: 10,
              fontWeight: 850,
              padding: "6px 12px",
              borderRadius: 8,
              transform: `scale(${isClicked ? 0.95 : 1})`,
              transition: "transform 0.1s ease",
              cursor: "pointer",
            }}
          >
            {isCopied ? "✓ Copiado" : "Copiar"}
          </div>
        </div>
        
        {isCopied && (
          <div style={{ fontSize: 10, color: COLORS.emeraldText, fontWeight: 800, textAlign: "center", animation: "bounce 1s infinite" }}>
            🎉 Enlace copiado al portapapeles
          </div>
        )}
      </div>
    </div>
  );
};

// Vista 2: Celular - Biografía de Instagram
const InstagramBioView = () => {
  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#ffffff", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* IG Header */}
      <div style={{ borderBottom: "1.5px solid #f3f4f6", paddingBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
        <span style={{ fontSize: 14, fontWeight: 900 }}>pedroperez_piano</span>
        <span style={{ fontSize: 14 }}>☰</span>
      </div>

      {/* IG Profile Details */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", backgroundColor: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
          🎹
        </div>
        <div style={{ display: "flex", gap: 14, flex: 1, justifyContent: "space-around" }}>
          <div><p style={{ fontSize: 12, fontWeight: 900, margin: 0 }}>418</p><p style={{ fontSize: 9, color: COLORS.textSecondary, margin: 0 }}>Seguidores</p></div>
          <div><p style={{ fontSize: 12, fontWeight: 900, margin: 0 }}>289</p><p style={{ fontSize: 9, color: COLORS.textSecondary, margin: 0 }}>Seguidos</p></div>
        </div>
      </div>

      {/* IG Bio */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 800, margin: 0 }}>Pedro Pérez · Profesor de Piano</p>
        <p style={{ fontSize: 10, color: COLORS.textSecondary, margin: "2px 0 0 0", lineHeight: 1.3 }}>
          Clases particulares de piano para todos los niveles 🎼.<br />
          Reserva tu clase de prueba aquí abajo 👇
        </p>
        
        {/* Link pegado en IG */}
        <p style={{ fontSize: 11, fontWeight: 900, color: COLORS.blue, margin: "6px 0 0 0", borderBottom: `1.5px solid ${COLORS.blue}`, display: "inline-block" }}>
          khora.cl/agendar?p=pedro-perez
        </p>
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
        <div style={{ flex: 1, backgroundColor: "#ef4444", color: "#ffffff", fontSize: 11, fontWeight: 800, padding: "8px 0", borderRadius: 8, textAlign: "center" }}>Editar Perfil</div>
        <div style={{ flex: 1, backgroundColor: "#f3f4f6", color: COLORS.textPrimary, fontSize: 11, fontWeight: 800, padding: "8px 0", borderRadius: 8, textAlign: "center" }}>Compartir</div>
      </div>
    </div>
  );
};

// Vista 3: WhatsApp Chat Automation
const WhatsAppChatView = ({ slideProgress }: { slideProgress: number }) => {
  const showReply = slideProgress >= 30;

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#efeae2", display: "flex", flexDirection: "column" }}>
      {/* WA Header */}
      <div style={{ backgroundColor: "#075e54", padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, color: "#ffffff", marginTop: 20 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
          👤
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 900, margin: 0 }}>Sofía (Alumno)</p>
          <p style={{ fontSize: 8, color: "rgba(255,255,255,0.7)", margin: 0 }}>En línea</p>
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Mensaje Alumno */}
        <div style={{ backgroundColor: "#ffffff", padding: "8px 12px", borderRadius: "0px 12px 12px 12px", maxWidth: "80%", alignSelf: "flex-start", boxShadow: "0 1px 2px rgba(0,0,0,0.15)" }}>
          <p style={{ fontSize: 11, color: COLORS.textPrimary, margin: 0 }}>Hola! ¿Tienes disponibilidad para una clase de prueba de piano?</p>
          <p style={{ fontSize: 7, color: COLORS.textSecondary, margin: "2px 0 0 0", textAlign: "right" }}>9:41 AM</p>
        </div>

        {/* Respuesta Automática Profesor */}
        {showReply && (
          <div style={{ 
            backgroundColor: "#d9fdd3", 
            padding: "10px 12px", 
            borderRadius: "12px 0px 12px 12px", 
            maxWidth: "85%", 
            alignSelf: "flex-end", 
            boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
            animation: "slideIn 0.3s ease-out" 
          }}>
            <p style={{ fontSize: 11, color: COLORS.textPrimary, margin: 0 }}>
              Hola Sofía! Sí, puedes ver mis horarios disponibles y agendar directamente aquí:
            </p>
            <p style={{ fontSize: 11, color: COLORS.blue, fontWeight: 800, margin: "4px 0 0 0" }}>
              khora.cl/agendar?p=pedro-perez
            </p>
            <p style={{ fontSize: 7, color: COLORS.textSecondary, margin: "2px 0 0 0", textAlign: "right" }}>9:42 AM</p>
          </div>
        )}
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
export const ShareLinkExplainer = () => {
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
        @keyframes floatLaptop {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
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
            label="Comparte tu Link"
            title="Copia tu enlace en un clic"
            desc="Tu dirección pública de Khora está lista para ser compartida en cualquier red social."
            footnote="Servicio 100% gratis"
            slideProgress={slideProgress}
            device={<LaptopFront><CopyLinkPanel slideProgress={slideProgress} /></LaptopFront>}
          />
        )}

        {slideIndex === 1 && (
          <SlideLayout
            label="Comparte tu Link"
            title="Agrégalo a tu perfil social"
            desc="Coloca tu link de Khora en tu biografía de Instagram o TikTok para captar alumnos interesados."
            footnote="Servicio 100% gratis"
            slideProgress={slideProgress}
            device={<Phone3D><InstagramBioView /></Phone3D>}
          />
        )}

        {slideIndex === 2 && (
          <SlideLayout
            label="Comparte tu Link"
            title="Responde en piloto automático"
            desc="Configura respuestas rápidas en tu WhatsApp para enviar tu agenda al instante cuando te consulten."
            footnote="Servicio 100% gratis"
            slideProgress={slideProgress}
            device={<Phone3D><WhatsAppChatView slideProgress={slideProgress} /></Phone3D>}
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
