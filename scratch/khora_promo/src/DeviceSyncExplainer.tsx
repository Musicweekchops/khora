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
  darkSurface: "#161619",
  border: "#e5e5e5",
  darkBorder: "#242427",
  textPrimary: "#171717",
  textSecondary: "#737373",
  textTertiary: "#a3a3a3",
  whiteText: "#ffffff",
  whiteSecondary: "#a1a1aa",
  violet: "#7c3aed",
  indigo: "#4f46e5",
  blue: "#2563eb",
  emerald: "#10b981",
  emeraldLight: "#f0fdf4",
  emeraldBorder: "#bbf7d0",
  emeraldText: "#166534",
  amber: "#f59e0b",
  red: "#ef4444",
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
        width: 340, // Contenedor exterior ajustado
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
          width: 320, // 320px de ancho estricto para evitar sobreposición
          height: 670, // 670px de alto estricto
          backgroundColor: "#ffffff",
          borderRadius: 40,
          border: "10px solid #1f2937", // Bisel gris grafito
          position: "relative",
          transformStyle: "preserve-3d",
          animation: `floatPhone 4s ease-in-out infinite`,
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
        {/* Capa de brillo y reflejo sobre la pantalla */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 50%)",
            zIndex: 99,
            pointerEvents: "none",
          }}
        />

        {/* Cámara frontal (muesca genérica) */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            width: 80,
            height: 20,
            backgroundColor: "#000000",
            borderRadius: 99,
            zIndex: 100,
          }}
        />

        {/* Barra de estado genérica */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
            fontWeight: 700,
            color: "#a3a3a3",
            padding: "14px 20px 0 20px",
            zIndex: 90,
            backgroundColor: "#ffffff",
          }}
        >
          <span>9:41</span>
          <span>📶 🛜 🔋</span>
        </div>

        {/* Contenido principal de la pantalla */}
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#ffffff",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SUBCOMPONENTE: LAPTOP FRONT PLANAR (DE FRENTE Y SIN ROTAR)
// ============================================================================
interface Laptop3DProps {
  children: React.ReactNode;
  floatDelay?: string;
}

const Laptop3D: React.FC<Laptop3DProps> = ({ children, floatDelay = "0s" }) => {
  return (
    <div
      style={{
        width: 460, // Ancho exterior ajustado
        height: 340,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Pantalla (Plana y frontal, sin rotar en eje Y ni X) */}
      <div
        style={{
          width: 420, // 420px de ancho estricto para evitar sobreposición
          height: 270,
          backgroundColor: "#ffffff",
          borderRadius: "14px 14px 0 0",
          border: "10px solid #1c1c1e",
          position: "relative",
          animation: `floatLaptop 4s ease-in-out infinite`,
          animationDelay: floatDelay,
          boxShadow: "0 15px 30px rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
        }}
      >
        {children}
      </div>

      {/* Base */}
      <div
        style={{
          width: 460, // Ancho de la base
          height: 12,
          backgroundColor: "#d1d5db",
          borderRadius: "0 0 10px 10px",
          borderBottom: "3px solid #9ca3af",
          boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
          zIndex: 10,
          animation: `floatLaptop 4s ease-in-out infinite`,
          animationDelay: floatDelay,
        }}
      />
    </div>
  );
};

// ============================================================================
// SUBCOMPONENTE: SYNCDEVICES LAPTOP + PHONE OVERLAP
// ============================================================================
interface SyncDevices3DProps {
  laptopContent: React.ReactNode;
  phoneContent: React.ReactNode;
  slideProgress: number;
}

const SyncDevices3D: React.FC<SyncDevices3DProps> = ({
  laptopContent,
  phoneContent,
  slideProgress,
}) => {
  return (
    <div
      style={{
        position: "relative",
        width: 480, // Ancho estricto de 480px
        height: 520,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Laptop de fondo (Frontal plana, escala reducida) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 60,
          zIndex: 10,
          transform: "scale(0.75)",
        }}
      >
        <Laptop3D floatDelay="0.5s">{laptopContent}</Laptop3D>
      </div>

      {/* Indicador de sincronización */}
      <div
        style={{
          position: "absolute",
          left: "58%",
          top: "40%",
          transform: "translate(-50%, -50%)",
          zIndex: 15,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          opacity: interpolate(slideProgress, [15, 30], [0, 1], { extrapolateLeft: "clamp" }),
        }}
      >
        <span style={{ fontSize: 40, filter: "drop-shadow(0 0 10px #10b981)", animation: "bounce 1.5s infinite" }}>⚡</span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 900,
            color: COLORS.emerald,
            textTransform: "uppercase",
            letterSpacing: 1,
            backgroundColor: "rgba(16, 185, 129, 0.15)",
            padding: "4px 8px",
            borderRadius: 6,
            fontFamily: "Outfit, Inter, sans-serif",
          }}
        >
          En Línea
        </span>
      </div>

      {/* Celular al frente (Rotado 15° Y, escala reducida) */}
      <div
        style={{
          position: "absolute",
          right: -20,
          bottom: 30,
          zIndex: 20,
          transform: "scale(0.55)",
        }}
      >
        <Phone3D floatDelay="0s">{phoneContent}</Phone3D>
      </div>
    </div>
  );
};

// ============================================================================
// CONTENEDOR COMÚN DE DISEÑO DE PÁGINA (COLUMNAS DEFINIDAS)
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
        padding: "0 50px", // Margen estricto exterior
        height: "100%",
        width: "100%",
      }}
    >
      {/* Columna Izquierda: Frases (Ancho estricto 500px) */}
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

      {/* Columna Derecha: Dispositivo (Ancho estricto 480px) */}
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
// PANTALLAS INTERNAS DE LOS DISPOSITIVOS
// ============================================================================

// Biblioteca Inicial del Celular
const PhoneLibraryView = () => {
  return (
    <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 15, flex: 1, backgroundColor: "#ffffff" }}>
      <div style={{ borderBottom: `2px solid ${COLORS.border}`, paddingBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 800, color: COLORS.textSecondary, textTransform: "uppercase", margin: 0 }}>BIBLIOTECA</p>
          <p style={{ fontSize: 18, fontWeight: 900, color: COLORS.textPrimary, margin: "4px 0 0 0", fontFamily: "Outfit, sans-serif" }}>Mis Clases</p>
        </div>
        <span style={{ fontSize: 24 }}>📚</span>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { title: "Piano - Nivel Inicial", files: 4, color: COLORS.violet },
          { title: "Guitarra - Acordes", files: 2, color: COLORS.blue },
          { title: "Teoría & Solfeo", files: 7, color: COLORS.emerald }
        ].map((item, idx) => (
          <div key={idx} style={{ border: `2px solid ${COLORS.border}`, borderRadius: 16, padding: 14, display: "flex", alignItems: "center", gap: 14, backgroundColor: "#fafafa" }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: item.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#ffffff" }}>
              📖
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 850, color: COLORS.textPrimary, margin: 0 }}>{item.title}</p>
              <p style={{ fontSize: 11, color: COLORS.textSecondary, fontWeight: 650, margin: "2px 0 0 0" }}>{item.files} archivos</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Portal del Alumno (Lista de Archivos)
const PhonePortalView = () => {
  return (
    <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 15, flex: 1, backgroundColor: "#ffffff" }}>
      <div style={{ borderBottom: `2px solid ${COLORS.border}`, paddingBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 800, color: COLORS.textSecondary, textTransform: "uppercase", margin: 0 }}>Portal Alumno</p>
          <p style={{ fontSize: 18, fontWeight: 900, color: COLORS.textPrimary, margin: "4px 0 0 0", fontFamily: "Outfit, sans-serif" }}>Clases de Piano · Sofía</p>
        </div>
        <span style={{ fontSize: 24 }}>🎹</span>
      </div>

      <p style={{ fontSize: 10, fontWeight: 850, color: COLORS.textSecondary, textTransform: "uppercase", margin: "0 0 4px 0" }}>Material de Estudio</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { icon: "📕", name: "Método_Piano_Vol_1.pdf", desc: "Manual de partituras", status: "Nuevo" },
          { icon: "📄", name: "Ejercicios_Escalas.pdf", desc: "Práctica de velocidad", status: "Leído" },
          { icon: "📹", name: "Posición_Manos.mp4", desc: "Video explicativo", status: "Leído" }
        ].map((file, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, backgroundColor: "#fafafa", border: `2px solid ${COLORS.border}`, padding: 12, borderRadius: 16 }}>
            <span style={{ fontSize: 22 }}>{file.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 850, color: COLORS.textPrimary, margin: 0 }}>{file.name}</p>
              <p style={{ fontSize: 10, color: COLORS.textSecondary, fontWeight: 650, margin: "2px 0 0 0" }}>{file.desc}</p>
            </div>
            {file.status === "Nuevo" ? (
              <span style={{ fontSize: 9, fontWeight: 900, color: COLORS.violet, backgroundColor: "rgba(124,58,237,0.1)", padding: "2px 6px", borderRadius: 6 }}>{file.status}</span>
            ) : (
              <span style={{ fontSize: 10 }}>👁️</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Portal del Alumno (Animación de Click en Archivo)
const PhoneClickView = ({ slideProgress }: { slideProgress: number }) => {
  return (
    <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 15, flex: 1, backgroundColor: "#ffffff" }}>
      <div style={{ borderBottom: `2px solid ${COLORS.border}`, paddingBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 800, color: COLORS.textSecondary, textTransform: "uppercase", margin: 0 }}>Portal Alumno</p>
          <p style={{ fontSize: 18, fontWeight: 900, color: COLORS.textPrimary, margin: "4px 0 0 0", fontFamily: "Outfit, sans-serif" }}>Clases de Piano · Sofía</p>
        </div>
        <span style={{ fontSize: 24 }}>🎹</span>
      </div>

      <p style={{ fontSize: 10, fontWeight: 850, color: COLORS.textSecondary, textTransform: "uppercase", margin: "0 0 4px 0" }}>Material de Estudio</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
        {/* Click en el Libro */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 12, 
          backgroundColor: "rgba(124, 58, 237, 0.05)", 
          border: `2px solid ${COLORS.violet}`, 
          padding: 12, 
          borderRadius: 16, 
          position: "relative", 
          transform: `scale(${interpolate(slideProgress, [30, 40, 50], [1, 0.95, 1], { extrapolateRight: "clamp" })})` 
        }}>
          <span style={{ fontSize: 22 }}>📕</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12, fontWeight: 850, color: COLORS.textPrimary, margin: 0 }}>Método_Piano_Vol_1.pdf</p>
            <p style={{ fontSize: 10, color: COLORS.violet, fontWeight: 700, margin: "2px 0 0 0" }}>Manual de partituras</p>
          </div>
          <span style={{ fontSize: 14, color: COLORS.violet }}>👁️</span>

          {/* Onda de click */}
          {slideProgress >= 35 && (
            <div
              style={{
                position: "absolute",
                right: 14,
                top: 14,
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: `3px solid ${COLORS.violet}`,
                transform: `scale(${interpolate(slideProgress - 35, [0, 20], [0.5, 1.8])})`,
                opacity: interpolate(slideProgress - 35, [0, 20], [0.8, 0]),
                pointerEvents: "none",
              }}
            />
          )}
        </div>

        {[
          { icon: "📄", name: "Ejercicios_Escalas.pdf", desc: "Práctica de velocidad" },
          { icon: "📹", name: "Posición_Manos.mp4", desc: "Video explicativo" }
        ].map((file, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, backgroundColor: "#fafafa", border: `2px solid ${COLORS.border}`, padding: 12, borderRadius: 16 }}>
            <span style={{ fontSize: 22 }}>{file.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 850, color: COLORS.textPrimary, margin: 0 }}>{file.name}</p>
              <p style={{ fontSize: 10, color: COLORS.textSecondary, fontWeight: 650, margin: "2px 0 0 0" }}>{file.desc}</p>
            </div>
            <span style={{ fontSize: 10 }}>👁️</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Visor PDF Integrado en App
const PhonePdfView = () => {
  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#ffffff", display: "flex", flexDirection: "column" }}>
      {/* Header del Visor */}
      <div style={{ backgroundColor: "#f9fafb", padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `2px solid ${COLORS.border}`, marginTop: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>📕</span>
          <span style={{ fontSize: 11, fontWeight: 900, color: COLORS.textPrimary }}>Método_Piano_Vol_1.pdf</span>
        </div>
        <span style={{ fontSize: 9, fontWeight: 800, color: COLORS.textSecondary, backgroundColor: "#e5e7eb", padding: "4px 8px", borderRadius: 8 }}>
          Pág 1/48
        </span>
      </div>

      {/* Contenido del PDF */}
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
          {/* Línea divisoria */}
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

// Panel del Profesor (Laptop)
const LaptopDashboardView = () => {
  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#ffffff", color: COLORS.textPrimary, display: "flex", flexDirection: "column" }}>
      {/* App Navbar */}
      <div style={{ borderBottom: `2px solid #f3f4f6`, padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fafafa" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: COLORS.violet, color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, fontFamily: "Outfit, sans-serif" }}>K</div>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 900, margin: 0 }}>Khora</h4>
            <p style={{ fontSize: 9, color: COLORS.textSecondary, fontWeight: 700, margin: 0 }}>Panel Profesor</p>
          </div>
        </div>
        <div style={{ backgroundColor: "#ffffff", border: `2px solid ${COLORS.border}`, borderRadius: 8, padding: "4px 10px", fontSize: 10, color: COLORS.textTertiary, width: 130 }}>
          🔍 Buscar...
        </div>
      </div>

      {/* Contenido Dashboard */}
      <div style={{ padding: "14px 18px", display: "flex", gap: 14, flex: 1 }}>
        {/* Sidebar */}
        <div style={{ width: 95, borderRight: `2px solid #f3f4f6`, display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "Inicio", active: true },
            { label: "Alumnos" },
            { label: "Biblioteca" },
            { label: "Ajustes" }
          ].map(tab => (
            <div key={tab.label} style={{ padding: "6px 8px", borderRadius: 8, fontSize: 10, fontWeight: 800, color: tab.active ? COLORS.violet : COLORS.textSecondary, backgroundColor: tab.active ? "rgba(124, 58, 237, 0.08)" : "transparent" }}>
              {tab.label}
            </div>
          ))}
        </div>

        {/* Dashboard Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          <h4 style={{ fontSize: 14, fontWeight: 900, margin: 0, fontFamily: "Outfit, sans-serif" }}>Bitácora Digital</h4>

          {/* Tarjeta de Historial */}
          <div style={{ backgroundColor: "#fafafa", border: `1.5px solid ${COLORS.border}`, borderRadius: 8, padding: 8 }}>
            <p style={{ fontSize: 8, fontWeight: 850, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, margin: 0 }}>Historial de Lectura</p>
            
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, backgroundColor: "#ffffff", border: `1.5px solid ${COLORS.border}`, padding: 6, borderRadius: 6 }}>
              <span style={{ fontSize: 14 }}>📖</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 9, fontWeight: 800, margin: 0 }}>
                  Sofía Pérez abrió <span style={{ color: COLORS.violet, fontWeight: 900 }}>Método_Piano_Vol_1.pdf</span>
                </p>
                <p style={{ fontSize: 7, color: COLORS.textSecondary, fontWeight: 700, margin: "1px 0 0 0" }}>Hace 1 min · En línea</p>
              </div>
            </div>
          </div>

          <div style={{ border: `2px dashed ${COLORS.border}`, borderRadius: 8, padding: "6px", textAlign: "center" }}>
            <span style={{ fontSize: 14, display: "block" }}>📄</span>
            <span style={{ fontSize: 8, fontWeight: 800, color: COLORS.textSecondary, textTransform: "uppercase", display: "block", marginTop: 2 }}>Subir partitura</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Laptop mini (para sincronización)
const LaptopSyncView = () => {
  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#ffffff", color: COLORS.textPrimary, display: "flex", flexDirection: "column" }}>
      <div style={{ borderBottom: "1px solid #f3f4f6", padding: "6px 12px", display: "flex", alignItems: "center", gap: 6, backgroundColor: "#fafafa" }}>
        <div style={{ width: 18, height: 18, borderRadius: 4, backgroundColor: COLORS.violet, color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900 }}>K</div>
        <span style={{ fontSize: 9, fontWeight: 800 }}>Khora Panel</span>
      </div>
      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
        <p style={{ fontSize: 9, fontWeight: 800, color: COLORS.textSecondary, textTransform: "uppercase", margin: 0 }}>Material Compartido</p>
        <div style={{ display: "flex", alignItems: "center", gap: 6, border: `1.5px solid ${COLORS.border}`, borderRadius: 8, padding: 6 }}>
          <span style={{ fontSize: 14 }}>📕</span>
          <span style={{ fontSize: 9, fontWeight: 800 }}>Método_Piano_Vol_1.pdf</span>
          <span style={{ fontSize: 8, fontWeight: 900, color: COLORS.emeraldText, backgroundColor: COLORS.emeraldLight, padding: "1px 4px", borderRadius: 6, marginLeft: "auto" }}>Sincronizado</span>
        </div>
      </div>
    </div>
  );
};

// Celular mini (para sincronización)
const PhoneSyncView = () => {
  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#ffffff", color: COLORS.textPrimary, display: "flex", flexDirection: "column", padding: 12 }}>
      <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: 4, display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
        <span style={{ fontSize: 9, fontWeight: 800 }}>Lector Khora</span>
        <span style={{ fontSize: 8, backgroundColor: "#e5e7eb", padding: "1px 4px", borderRadius: 4 }}>1/48</span>
      </div>
      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ width: "100%", height: 1, backgroundColor: "#1f2937" }} />
        ))}
        <span style={{ fontSize: 14, marginTop: -9 }}>𝄞 ♩ ♩</span>
      </div>
    </div>
  );
};

// Logo Animado Frontal Plano
const Logo3D = () => {
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
          boxShadow: `
            0 15px 30px rgba(124, 58, 237, 0.35)
          `,
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
export const DeviceSyncExplainer = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dividimos 900 frames en 7 slides (130 frames para los primeros 6 slides, 120 para el final)
  const getSlideIndex = (f: number) => {
    if (f < 130) return 0;
    if (f < 260) return 1;
    if (f < 390) return 2;
    if (f < 520) return 3;
    if (f < 650) return 4;
    if (f < 780) return 5;
    return 6;
  };

  const slideIndex = getSlideIndex(frame);
  const slideStarts = [0, 130, 260, 390, 520, 650, 780];
  const slideProgress = frame - slideStarts[slideIndex];

  const fontStyle = {
    fontFamily: "Inter, system-ui, sans-serif",
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        color: COLORS.whiteText,
        overflow: "hidden",
        position: "relative",
        ...fontStyle,
      }}
    >
      {/* Hojas de estilos y animaciones keyframe */}
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

      {/* Cuadrícula de fondo */}
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

      {/* Luces de fondo (glows) */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 800,
          backgroundColor: slideIndex === 4 || slideIndex === 5 ? "rgba(37, 99, 235, 0.12)" : "rgba(124, 58, 237, 0.12)",
          borderRadius: "9999px",
          filter: "blur(130px)",
          pointerEvents: "none",
        }}
      />

      {/* Contenido animado del slide actual */}
      <div style={{ width: "100%", height: "100%" }}>
        {slideIndex === 0 && (
          <SlideLayout
            label="Biblioteca Digital"
            title="Tus partituras y guías, siempre listas"
            desc="Sube tu material de estudio y compártelo al instante. Sin descargas ni desorden."
            footnote="Servicio 100% gratis"
            slideProgress={slideProgress}
            device={<Phone3D><PhoneLibraryView /></Phone3D>}
          />
        )}

        {slideIndex === 1 && (
          <SlideLayout
            label="Portal del Alumno"
            title="Todo su material organizado"
            desc="Tus alumnos acceden a sus tareas, guías y videos en un solo lugar y desde su celular."
            footnote="Servicio 100% gratis"
            slideProgress={slideProgress}
            device={<Phone3D><PhonePortalView /></Phone3D>}
          />
        )}

        {slideIndex === 2 && (
          <SlideLayout
            label="Acceso Instantáneo"
            title="Un solo click para abrir"
            desc="Olvídate de buscar archivos perdidos en chats de WhatsApp. Todo está ordenado por clase."
            footnote="Servicio 100% gratis"
            slideProgress={slideProgress}
            device={<Phone3D><PhoneClickView slideProgress={slideProgress} /></Phone3D>}
          />
        )}

        {slideIndex === 3 && (
          <SlideLayout
            label="PDF Disponible"
            title="Acceso a todo el material"
            desc="Las partituras y libros se abren en khora. Más cómodo para ellos y seguro para tu material."
            footnote="Servicio 100% gratis."
            slideProgress={slideProgress}
            device={<Phone3D><PhonePdfView /></Phone3D>}
          />
        )}

        {slideIndex === 4 && (
          <SlideLayout
            label="Panel del Profesor"
            title="Sube material y monitorea"
            desc="Sube archivos desde tu computadora y mira en tiempo real si tus alumnos ya leyeron su tarea."
            footnote="Servicio 100% gratis"
            slideProgress={slideProgress}
            device={<Laptop3D><LaptopDashboardView /></Laptop3D>}
          />
        )}

        {slideIndex === 5 && (
          <SlideLayout
            label="Sincronización"
            title="Todo en tiempo real"
            desc="Lo que subes en tu laptop se refleja de inmediato en el celular de tu alumno. Sin configuraciones extras."
            footnote="Servicio 100% gratis"
            slideProgress={slideProgress}
            device={
              <SyncDevices3D
                laptopContent={<LaptopSyncView />}
                phoneContent={<PhoneSyncView />}
                slideProgress={slideProgress}
              />
            }
          />
        )}

        {slideIndex === 6 && (
          <SlideLayout
            label="Comienza hoy"
            title="Lleva tus clases al siguiente nivel"
            desc="Moderniza tu enseñanza con una experiencia premium. Crea tu cuenta en segundos y úsalo gratis."
            footnote="Servicio 100% gratis para profesores"
            slideProgress={slideProgress}
            device={<Logo3D />}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};
