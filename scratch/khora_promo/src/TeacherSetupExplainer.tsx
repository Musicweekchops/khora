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
// VISTAS DE PANTALLA (LAPTOP INTERNO)
// ============================================================================

// Header común de Khora Admin
const LaptopHeader = () => {
  return (
    <div style={{ borderBottom: `2px solid #f3f4f6`, padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fafafa" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: COLORS.violet, color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, fontFamily: "Outfit, sans-serif" }}>K</div>
        <span style={{ fontSize: 12, fontWeight: 900, color: COLORS.textPrimary }}>Panel de Configuración</span>
      </div>
      <span style={{ fontSize: 10, color: COLORS.textSecondary, fontWeight: 700 }}>Activo</span>
    </div>
  );
};

// Vista 1: Ajuste de Slug
const SlugConfigView = ({ slideProgress }: { slideProgress: number }) => {
  // Simulación de escritura del slug
  const textToWrite = "pedro-perez";
  const charCount = Math.floor(interpolate(slideProgress, [20, 90], [0, textToWrite.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const currentSlug = textToWrite.slice(0, charCount);

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#ffffff", display: "flex", flexDirection: "column", color: COLORS.textPrimary }}>
      <LaptopHeader />
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        <h5 style={{ fontSize: 13, fontWeight: 850, margin: 0, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 }}>URL de Reserva Pública</h5>
        
        <div style={{ border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: "12px 14px", backgroundColor: "#fafafa" }}>
          <span style={{ fontSize: 11, color: COLORS.textSecondary, fontWeight: 600 }}>khora.cl/agendar?p=</span>
          <span style={{ fontSize: 12, fontWeight: 900, color: COLORS.violet, borderRight: "2px solid #7c3aed", paddingRight: 2 }}>
            {currentSlug}
          </span>
        </div>
        <p style={{ fontSize: 10, color: COLORS.textSecondary, margin: 0, lineHeight: 1.4 }}>
          Tus alumnos usarán esta dirección única para ver tus servicios y agendar clases particulares.
        </p>

        <div style={{ alignSelf: "flex-end", backgroundColor: COLORS.violet, color: "#ffffff", fontSize: 10, fontWeight: 800, padding: "8px 16px", borderRadius: 8, marginTop: 8 }}>
          Guardar Cambios
        </div>
      </div>
    </div>
  );
};

// Vista 2: Disponibilidad Semanal
const AvailabilityConfigView = () => {
  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#ffffff", display: "flex", flexDirection: "column", color: COLORS.textPrimary }}>
      <LaptopHeader />
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        <h5 style={{ fontSize: 12, fontWeight: 850, margin: 0, color: COLORS.textSecondary, textTransform: "uppercase" }}>Disponibilidad Horaria</h5>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            { day: "Lunes", time: "09:00 - 18:00", checked: true },
            { day: "Martes", time: "09:00 - 18:00", checked: true },
            { day: "Miércoles", time: "09:00 - 18:00", checked: true },
            { day: "Jueves", time: "09:00 - 18:00", checked: true },
            { day: "Viernes", time: "09:00 - 18:00", checked: true },
          ].map((item, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#fafafa", padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${COLORS.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: COLORS.emerald }}>✓</span>
                <span style={{ fontSize: 11, fontWeight: 800 }}>{item.day}</span>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.textSecondary }}>{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Vista 3: Creación de Servicio
const ServiceConfigView = () => {
  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#ffffff", display: "flex", flexDirection: "column", color: COLORS.textPrimary }}>
      <LaptopHeader />
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        <h5 style={{ fontSize: 12, fontWeight: 850, margin: 0, color: COLORS.textSecondary, textTransform: "uppercase" }}>Nuevo Servicio</h5>
        
        <div style={{ border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", gap: 8, backgroundColor: "#fafafa" }}>
          <div>
            <p style={{ fontSize: 9, fontWeight: 800, color: COLORS.textSecondary, margin: 0 }}>NOMBRE DE LA CLASE</p>
            <p style={{ fontSize: 12, fontWeight: 900, color: COLORS.textPrimary, margin: "2px 0 0 0" }}>Clase de Piano Individual</p>
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            <div>
              <p style={{ fontSize: 9, fontWeight: 800, color: COLORS.textSecondary, margin: 0 }}>DURACIÓN</p>
              <p style={{ fontSize: 11, fontWeight: 850, color: COLORS.textPrimary, margin: "2px 0 0 0" }}>60 minutos</p>
            </div>
            <div>
              <p style={{ fontSize: 9, fontWeight: 800, color: COLORS.textSecondary, margin: 0 }}>TARIFA / PRECIO</p>
              <p style={{ fontSize: 11, fontWeight: 850, color: COLORS.textPrimary, margin: "2px 0 0 0" }}>$25.000 CLP</p>
            </div>
          </div>
        </div>
        
        <div style={{ alignSelf: "flex-end", backgroundColor: COLORS.emerald, color: "#ffffff", fontSize: 10, fontWeight: 800, padding: "8px 16px", borderRadius: 8 }}>
          Activar Servicio
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
export const TeacherSetupExplainer = () => {
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
            label="Primeros Pasos"
            title="1. Crea tu enlace único"
            desc="Configura tu slug personalizado para tener tu dirección de agendamiento lista."
            footnote="Servicio 100% gratis"
            slideProgress={slideProgress}
            device={<LaptopFront><SlugConfigView slideProgress={slideProgress} /></LaptopFront>}
          />
        )}

        {slideIndex === 1 && (
          <SlideLayout
            label="Primeros Pasos"
            title="2. Define tu disponibilidad"
            desc="Elige qué días y horas de la semana estás disponible para recibir reservas."
            footnote="Servicio 100% gratis"
            slideProgress={slideProgress}
            device={<LaptopFront><AvailabilityConfigView /></LaptopFront>}
          />
        )}

        {slideIndex === 2 && (
          <SlideLayout
            label="Primeros Pasos"
            title="3. Configura tus servicios"
            desc="Agrega tus clases particulares con su tarifa y duración. ¡Listo para recibir alumnos!"
            footnote="Servicio 100% gratis"
            slideProgress={slideProgress}
            device={<LaptopFront><ServiceConfigView /></LaptopFront>}
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
