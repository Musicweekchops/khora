import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
} from "remotion";
import React from "react";

const COLORS = {
  background: "#0a0a0c",
  surface: "#111115",
  border: "#222227",
  textPrimary: "#ffffff",
  textSecondary: "#a1a1aa",
  textTertiary: "#71717a",
  violet: "#7c3aed",
  indigo: "#4f46e5",
  emerald: "#10b981",
  emeraldLight: "rgba(16, 185, 129, 0.08)",
  emeraldBorder: "rgba(16, 185, 129, 0.25)",
  emeraldText: "#34d399",
  red: "#ef4444",
};

export const PromoVideo = () => {
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

  // Animaciones spring para entradas
  const entrySpring = spring({
    frame: slideProgress,
    fps,
    config: { damping: 15, stiffness: 95 },
  });

  const fontStyle = {
    fontFamily: "Inter, system-ui, sans-serif",
  };

  const titleFontStyle = {
    fontFamily: "Outfit, Inter, system-ui, sans-serif",
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        color: COLORS.textPrimary,
        overflow: "hidden",
        position: "relative",
        ...fontStyle,
      }}
    >
      {/* Cargar fuentes de Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@600;700;800;900;950&display=swap');
      `}</style>

      {/* Rejilla de Fondo (Social Media Grid Pattern) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
          opacity: 0.8,
        }}
      />

      {/* Glows Ambientales para llamar la atención en redes sociales */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 800,
          backgroundColor: slideIndex === 0 || slideIndex === 1 ? "rgba(239, 68, 68, 0.08)" : "rgba(124, 58, 237, 0.12)",
          borderRadius: "9999px",
          filter: "blur(130px)",
          pointerEvents: "none",
        }}
      />

      {/* =======================================================================
          SLIDE 1: EL DOLOR (0s - 4.3s / Frames 0 - 130)
          ======================================================================= */}
      {slideIndex === 0 && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 60px",
            textAlign: "center",
          }}
        >
          <span
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              color: "#fca5a5",
              border: `1.5px solid rgba(239, 68, 68, 0.3)`,
              fontSize: 28,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: 3,
              padding: "14px 36px",
              borderRadius: 99,
              opacity: interpolate(slideProgress, [0, 15], [0, 1]),
              transform: `translateY(${interpolate(slideProgress, [0, 15], [-30, 0], { extrapolateRight: "clamp" })}px)`,
              ...titleFontStyle,
            }}
          >
            ¿Haces clases particulares?
          </span>

          <h1
            style={{
              fontSize: 78,
              fontWeight: 950,
              lineHeight: 1.15,
              marginTop: 45,
              color: "#ffffff",
              letterSpacing: "-0.03em",
              transform: `scale(${interpolate(slideProgress, [10, 35], [0.88, 1], {
                extrapolateRight: "clamp",
              })})`,
              opacity: interpolate(slideProgress, [10, 35], [0, 1]),
              ...titleFontStyle,
            }}
          >
            ¿Sigues coordinando por chats y cuadernos?
          </h1>

          {/* Iconos de desorden flotando */}
          <div
            style={{
              display: "flex",
              gap: 40,
              marginTop: 70,
              fontSize: 110,
              opacity: interpolate(slideProgress, [30, 60], [0, 1]),
            }}
          >
            <span style={{ transform: `rotate(-15deg) translateY(${Math.sin(slideProgress * 0.08) * 12}px)` }}>📝</span>
            <span style={{ transform: `rotate(10deg) translateY(${Math.cos(slideProgress * 0.08) * 12}px)` }}>💬</span>
            <span style={{ transform: `rotate(-5deg) translateY(${Math.sin(slideProgress * 0.06) * 14}px)` }}>🤯</span>
            <span style={{ transform: `rotate(20deg) translateY(${Math.cos(slideProgress * 0.06) * 14}px)` }}>❌</span>
          </div>
        </AbsoluteFill>
      )}

      {/* =======================================================================
          SLIDE 2: EL PROBLEMA (4.3s - 8.6s / Frames 130 - 260)
          ======================================================================= */}
      {slideIndex === 1 && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 60px",
          }}
        >
          <h2
            style={{
              fontSize: 62,
              fontWeight: 950,
              color: COLORS.red,
              textAlign: "center",
              lineHeight: 1.2,
              marginBottom: 60,
              letterSpacing: "-0.02em",
              opacity: interpolate(slideProgress, [0, 20], [0, 1]),
              ...titleFontStyle,
            }}
          >
            El desorden te cuesta tiempo y dinero:
          </h2>

          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 28 }}>
            {/* Problema 1 */}
            <div
              style={{
                backgroundColor: COLORS.surface,
                border: `2px solid ${COLORS.border}`,
                borderRadius: 28,
                padding: "32px 40px",
                display: "flex",
                alignItems: "center",
                gap: 28,
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                transform: `translateX(${interpolate(slideProgress, [20, 40], [-100, 0], { extrapolateRight: "clamp" })}px)`,
                opacity: interpolate(slideProgress, [20, 40], [0, 1]),
              }}
            >
              <span style={{ fontSize: 55 }}>💸</span>
              <p style={{ fontSize: 30, fontWeight: 800, color: "#ffffff", margin: 0, lineHeight: 1.3 }}>
                Alumnos que olvidan pagar sus mensualidades.
              </p>
            </div>

            {/* Problema 2 */}
            <div
              style={{
                backgroundColor: COLORS.surface,
                border: `2px solid ${COLORS.border}`,
                borderRadius: 28,
                padding: "32px 40px",
                display: "flex",
                alignItems: "center",
                gap: 28,
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                transform: `translateX(${interpolate(slideProgress, [40, 60], [100, 0], { extrapolateRight: "clamp" })}px)`,
                opacity: interpolate(slideProgress, [40, 60], [0, 1]),
              }}
            >
              <span style={{ fontSize: 55 }}>📄</span>
              <p style={{ fontSize: 30, fontWeight: 800, color: "#ffffff", margin: 0, lineHeight: 1.3 }}>
                Partituras y videos perdidos en chats de WhatsApp.
              </p>
            </div>

            {/* Problema 3 */}
            <div
              style={{
                backgroundColor: COLORS.surface,
                border: `2px solid ${COLORS.border}`,
                borderRadius: 28,
                padding: "32px 40px",
                display: "flex",
                alignItems: "center",
                gap: 28,
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                transform: `translateX(${interpolate(slideProgress, [60, 80], [-100, 0], { extrapolateRight: "clamp" })}px)`,
                opacity: interpolate(slideProgress, [60, 80], [0, 1]),
              }}
            >
              <span style={{ fontSize: 55 }}>⏰</span>
              <p style={{ fontSize: 30, fontWeight: 800, color: "#ffffff", margin: 0, lineHeight: 1.3 }}>
                Horas perdidas coordinando reprogramaciones.
              </p>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* =======================================================================
          SLIDE 3: LA SOLUCIÓN - KHORA (8.6s - 13s / Frames 260 - 390)
          ======================================================================= */}
      {slideIndex === 2 && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 60px",
            textAlign: "center",
          }}
        >
          {/* Logo K de Khora Gigante */}
          <div
            style={{
              width: 200,
              height: 200,
              backgroundColor: COLORS.violet,
              color: "#ffffff",
              borderRadius: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 110,
              fontWeight: 950,
              boxShadow: "0 25px 50px rgba(124, 58, 237, 0.4)",
              transform: `scale(${entrySpring}) rotate(${interpolate(
                slideProgress,
                [0, 50],
                [-35, 0],
                { extrapolateRight: "clamp" }
              )}deg)`,
              ...titleFontStyle,
            }}
          >
            K
          </div>

          <h2
            style={{
              fontSize: 84,
              fontWeight: 950,
              marginTop: 50,
              lineHeight: 1.15,
              background: `linear-gradient(to right, ${COLORS.violet}, #a78bfa)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.03em",
              opacity: interpolate(slideProgress, [20, 50], [0, 1]),
              ...titleFontStyle,
            }}
          >
            Khora unifica tu gestión
          </h2>

          <p
            style={{
              fontSize: 36,
              color: COLORS.textSecondary,
              fontWeight: 600,
              marginTop: 24,
              lineHeight: 1.4,
              padding: "0 40px",
              opacity: interpolate(slideProgress, [45, 75], [0, 1]),
            }}
          >
            El panel definitivo para controlar tus clases, pagos y material de estudio.
          </p>

          {/* Quick Metrics Dashboard Preview */}
          <div
            style={{
              display: "flex",
              gap: 24,
              marginTop: 65,
              width: "100%",
              opacity: interpolate(slideProgress, [60, 90], [0, 1]),
              transform: `translateY(${interpolate(slideProgress, [60, 90], [30, 0], { extrapolateRight: "clamp" })}px)`,
            }}
          >
            <div style={{ flex: 1, backgroundColor: COLORS.surface, border: `2px solid ${COLORS.border}`, borderRadius: 24, padding: 28, boxShadow: "0 10px 20px rgba(0,0,0,0.3)", textAlign: "center" }}>
              <span style={{ fontSize: 45, display: "block" }}>📅</span>
              <p style={{ fontSize: 16, fontWeight: 800, color: COLORS.textSecondary, margin: "14px 0 4px 0", textTransform: "uppercase" }}>Agenda</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: COLORS.violet, margin: 0 }}>Clases al día</p>
            </div>
            <div style={{ flex: 1, backgroundColor: COLORS.surface, border: `2px solid ${COLORS.border}`, borderRadius: 24, padding: 28, boxShadow: "0 10px 20px rgba(0,0,0,0.3)", textAlign: "center" }}>
              <span style={{ fontSize: 45, display: "block" }}>💰</span>
              <p style={{ fontSize: 16, fontWeight: 800, color: COLORS.textSecondary, margin: "14px 0 4px 0", textTransform: "uppercase" }}>Finanzas</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: COLORS.emerald, margin: 0 }}>100% Cobrado</p>
            </div>
            <div style={{ flex: 1, backgroundColor: COLORS.surface, border: `2px solid ${COLORS.border}`, borderRadius: 24, padding: 28, boxShadow: "0 10px 20px rgba(0,0,0,0.3)", textAlign: "center" }}>
              <span style={{ fontSize: 45, display: "block" }}>📚</span>
              <p style={{ fontSize: 16, fontWeight: 800, color: COLORS.textSecondary, margin: "14px 0 4px 0", textTransform: "uppercase" }}>Materiales</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: "#818cf8", margin: 0 }}>Bitácora digital</p>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* =======================================================================
          SLIDE 4: HIGHLIGHT 1 - AGENDA PÚBLICA (13s - 17.3s / Frames 390 - 520)
          ======================================================================= */}
      {slideIndex === 3 && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 60px",
          }}
        >
          {/* Header de alto impacto para redes sociales */}
          <div style={{ textAlign: "center", marginBottom: 35 }}>
            <span
              style={{
                backgroundColor: "rgba(124, 58, 237, 0.15)",
                color: "#c084fc",
                border: `1.5px solid rgba(124, 58, 237, 0.3)`,
                fontSize: 22,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: 2,
                padding: "10px 26px",
                borderRadius: 99,
                ...titleFontStyle,
              }}
            >
              Agenda Inteligente
            </span>
            <h3 style={{ fontSize: 64, fontWeight: 950, marginTop: 22, letterSpacing: "-0.02em", color: "#ffffff", ...titleFontStyle }}>
              Tu Link de Reserva
            </h3>
            <p style={{ fontSize: 28, color: COLORS.textSecondary, marginTop: 14, lineHeight: 1.4, fontWeight: 600 }}>
              Tus alumnos agendan solos según tus horarios disponibles.
            </p>
          </div>

          {/* MOCKUP REAL DE AGENDA DE KHORA (ZOOM GIGANTE 900PX) */}
          <div
            style={{
              width: 900,
              backgroundColor: COLORS.surface,
              borderRadius: 36,
              border: `4px solid ${COLORS.violet}`,
              padding: "36px 40px",
              boxShadow: "0 30px 60px rgba(124, 58, 237, 0.35)",
              transform: `translateY(${interpolate(slideProgress, [0, 40], [150, 0], { extrapolateRight: "clamp" })}px)`,
              opacity: interpolate(slideProgress, [0, 40], [0, 1]),
            }}
          >
            {/* Status bar simulada */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, color: COLORS.textTertiary, marginBottom: 24 }}>
              <span>9:41</span>
              <span>📶 🛜 🔋</span>
            </div>

            {/* Header del profesor */}
            <div style={{ display: "flex", alignItems: "center", gap: 20, borderBottom: `2px solid ${COLORS.border}`, paddingBottom: 24 }}>
              <div style={{ width: 70, height: 70, borderRadius: 18, backgroundColor: COLORS.violet, color: "#ffffff", display: "flex", alignItems: "center", justifyCenter: "center", justifyContent: "center", fontSize: 28, fontWeight: 950, ...titleFontStyle }}>P</div>
              <div>
                <p style={{ fontSize: 24, fontWeight: 900, color: "#ffffff", margin: 0 }}>Pedro - Clases de Música</p>
                <p style={{ fontSize: 18, color: COLORS.textTertiary, fontWeight: 800, margin: "6px 0 0 0" }}>khora.cl/agendar/pedro</p>
              </div>
            </div>

            {/* Servicio y Fecha */}
            <div style={{ marginTop: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 850, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 10px 0" }}>Servicio</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: "#ffffff", margin: 0 }}>🎸 Clase de Guitarra Eléctrica (60 min)</p>
              
              <p style={{ fontSize: 13, fontWeight: 850, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, margin: "24px 0 10px 0" }}>Selecciona Fecha</p>
              <div style={{ backgroundColor: COLORS.background, border: `2px solid ${COLORS.border}`, borderRadius: 16, padding: "16px 20px", fontSize: 20, fontWeight: 800, color: "#ffffff" }}>
                📅 Lunes, 8 de Junio
              </div>
            </div>

            {/* Slots de Horario */}
            <p style={{ fontSize: 13, fontWeight: 850, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, margin: "24px 0 12px 0" }}>Horas Disponibles</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ backgroundColor: COLORS.background, border: `2px solid ${COLORS.border}`, padding: "18px 0", borderRadius: 16, textAlign: "center", fontSize: 18, fontWeight: 800, color: COLORS.textSecondary }}>10:00 AM</div>
              <div style={{ backgroundColor: COLORS.violet, border: `2px solid ${COLORS.violet}`, padding: "18px 0", borderRadius: 16, textAlign: "center", fontSize: 18, fontWeight: 900, color: "#ffffff", transform: "scale(1.02)", boxShadow: "0 6px 15px rgba(124, 58, 237, 0.3)" }}>11:30 AM ✓</div>
              <div style={{ backgroundColor: COLORS.background, border: `2px solid ${COLORS.border}`, padding: "18px 0", borderRadius: 16, textAlign: "center", fontSize: 18, fontWeight: 800, color: COLORS.textSecondary }}>03:00 PM</div>
              <div style={{ backgroundColor: COLORS.background, border: `2px solid ${COLORS.border}`, padding: "18px 0", borderRadius: 16, textAlign: "center", fontSize: 18, fontWeight: 800, color: COLORS.textSecondary }}>04:30 PM</div>
            </div>
            
            {/* Botón de reserva */}
            <div style={{ marginTop: 32, backgroundColor: "#ffffff", color: "#000000", padding: "22px 0", borderRadius: 18, textAlign: "center", fontSize: 20, fontWeight: 900 }}>
              🎵 Solicitar Reserva
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* =======================================================================
          SLIDE 5: HIGHLIGHT 2 - BIBLIOTECA (17.3s - 21.6s / Frames 520 - 650)
          ======================================================================= */}
      {slideIndex === 4 && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 60px",
          }}
        >
          {/* Header redes sociales */}
          <div style={{ textAlign: "center", marginBottom: 35 }}>
            <span
              style={{
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                color: "#34d399",
                border: `1.5px solid rgba(16, 185, 129, 0.3)`,
                fontSize: 22,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: 2,
                padding: "10px 26px",
                borderRadius: 99,
                ...titleFontStyle,
              }}
            >
              Biblioteca Digital
            </span>
            <h3 style={{ fontSize: 64, fontWeight: 950, marginTop: 22, letterSpacing: "-0.02em", color: "#ffffff", ...titleFontStyle }}>
              Materiales y Tareas
            </h3>
            <p style={{ fontSize: 28, color: COLORS.textSecondary, marginTop: 14, lineHeight: 1.4, fontWeight: 600 }}>
              Asigna partituras, PDFs y videos directo a sus perfiles de alumno.
            </p>
          </div>

          {/* MOCKUP REAL DE BIBLIOTECA DE KHORA (ZOOM GIGANTE 900PX) */}
          <div
            style={{
              width: 900,
              backgroundColor: COLORS.surface,
              borderRadius: 36,
              border: `4px solid ${COLORS.emerald}`,
              padding: "36px 40px",
              boxShadow: "0 30px 60px rgba(16, 185, 129, 0.25)",
              transform: `translateY(${interpolate(slideProgress, [0, 40], [150, 0], { extrapolateRight: "clamp" })}px)`,
              opacity: interpolate(slideProgress, [0, 40], [0, 1]),
            }}
          >
            {/* Status bar */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, color: COLORS.textTertiary, marginBottom: 24 }}>
              <span>9:41</span>
              <span>📶 🛜 🔋</span>
            </div>

            {/* Nombre del alumno */}
            <div style={{ borderBottom: `2px solid ${COLORS.border}`, paddingBottom: 20, marginBottom: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 850, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, margin: 0 }}>Portal del Alumno</p>
              <p style={{ fontSize: 26, fontWeight: 900, color: "#ffffff", margin: "6px 0 0 0" }}>Estudiante: Sofía Pérez</p>
            </div>

            {/* Checklist de tareas */}
            <p style={{ fontSize: 13, fontWeight: 850, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 16px 0" }}>Tareas de esta Clase</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, backgroundColor: COLORS.background, border: `2px solid ${COLORS.border}`, padding: "16px 22px", borderRadius: 16 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: COLORS.emerald, color: "#ffffff", display: "flex", alignItems: "center", justifyCenter: "center", justifyContent: "center", fontSize: 18, fontWeight: 900 }}>✓</div>
                <p style={{ fontSize: 18, color: COLORS.textTertiary, textDecoration: "line-through", fontWeight: 700, margin: 0 }}>Estudiar compás 1 al 8</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, backgroundColor: COLORS.surface, border: `2px solid ${COLORS.border}`, padding: "16px 22px", borderRadius: 16 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, border: `3px solid ${COLORS.violet}` }} />
                <p style={{ fontSize: 18, color: "#ffffff", fontWeight: 800, margin: 0 }}>Grabar video de práctica</p>
              </div>
            </div>

            {/* Lista de materiales */}
            <p style={{ fontSize: 13, fontWeight: 850, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, margin: "28px 0 16px 0" }}>Material de Descarga</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18, backgroundColor: COLORS.background, border: `2px solid ${COLORS.border}`, padding: 18, borderRadius: 20 }}>
                <span style={{ fontSize: 38 }}>📄</span>
                <div>
                  <p style={{ fontSize: 18, fontWeight: 850, color: "#ffffff", margin: 0 }}>Rutina_Independencia.pdf</p>
                  <p style={{ fontSize: 15, color: COLORS.textTertiary, fontWeight: 700, margin: "4px 0 0 0" }}>Partitura asignada por Pedro</p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 18, backgroundColor: COLORS.background, border: `2px solid ${COLORS.border}`, padding: 18, borderRadius: 20 }}>
                <span style={{ fontSize: 38 }}>📹</span>
                <div>
                  <p style={{ fontSize: 18, fontWeight: 850, color: "#ffffff", margin: 0 }}>HiHat_Funk_Beat.mp4</p>
                  <p style={{ fontSize: 15, color: COLORS.textTertiary, fontWeight: 700, margin: "4px 0 0 0" }}>Video guía complementario</p>
                </div>
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* =======================================================================
          SLIDE 6: HIGHLIGHT 3 - CONTROL DE PAGOS (21.6s - 26s / Frames 650 - 780)
          ======================================================================= */}
      {slideIndex === 5 && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 60px",
          }}
        >
          {/* Header redes sociales */}
          <div style={{ textAlign: "center", marginBottom: 35 }}>
            <span
              style={{
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                color: "#34d399",
                border: `1.5px solid rgba(16, 185, 129, 0.3)`,
                fontSize: 22,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: 2,
                padding: "10px 26px",
                borderRadius: 99,
                ...titleFontStyle,
              }}
            >
              Control de Ingresos
            </span>
            <h3 style={{ fontSize: 64, fontWeight: 950, marginTop: 22, letterSpacing: "-0.02em", color: "#ffffff", ...titleFontStyle }}>
              Control de Pagos
            </h3>
            <p style={{ fontSize: 28, color: COLORS.textSecondary, marginTop: 14, lineHeight: 1.4, fontWeight: 600 }}>
              Visualiza mensualidades cobradas y pendientes. Todo en orden.
            </p>
          </div>

          {/* MOCKUP REAL DE CONTROLES FINANCIEROS (ZOOM GIGANTE 900PX) */}
          <div
            style={{
              width: 900,
              backgroundColor: COLORS.surface,
              borderRadius: 36,
              border: `4px solid ${COLORS.emerald}`,
              padding: "36px 40px",
              boxShadow: "0 30px 60px rgba(16, 185, 129, 0.25)",
              transform: `translateY(${interpolate(slideProgress, [0, 40], [150, 0], { extrapolateRight: "clamp" })}px)`,
              opacity: interpolate(slideProgress, [0, 40], [0, 1]),
            }}
          >
            {/* Status bar */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, color: COLORS.textTertiary, marginBottom: 24 }}>
              <span>9:41</span>
              <span>📶 🛜 🔋</span>
            </div>

            {/* Cabecera financiera */}
            <div style={{ borderBottom: `2px solid ${COLORS.border}`, paddingBottom: 20, marginBottom: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 850, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, margin: 0 }}>Mis Clases Particulares</p>
              <p style={{ fontSize: 26, fontWeight: 900, color: "#ffffff", margin: "6px 0 0 0" }}>Finanzas de Junio</p>
            </div>

            {/* Tarjeta Ingresos */}
            <div style={{ backgroundColor: COLORS.emeraldLight, border: `2px solid ${COLORS.emeraldBorder}`, padding: 26, borderRadius: 20, marginBottom: 24 }}>
              <p style={{ fontSize: 14, fontWeight: 850, color: COLORS.emeraldText, letterSpacing: 0.5, textTransform: "uppercase", margin: 0 }}>Ingresos Recaudados</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 8 }}>
                <span style={{ fontSize: 48, fontWeight: 950, color: COLORS.emeraldText, ...titleFontStyle }}>$450.000</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: COLORS.emerald }}>100% Cobrado</span>
              </div>
            </div>

            {/* Listado de alumnos */}
            <p style={{ fontSize: 13, fontWeight: 850, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 16px 0" }}>Resumen de Alumnos</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: COLORS.background, border: `2px solid ${COLORS.border}`, padding: "16px 20px", borderRadius: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontSize: 28 }}>🟢</span>
                  <div>
                    <p style={{ fontSize: 18, fontWeight: 850, color: "#ffffff", margin: 0 }}>Sofía Pérez</p>
                    <p style={{ fontSize: 14, color: COLORS.textTertiary, fontWeight: 700, margin: "4px 0 0 0" }}>Mensualidad Junio · 💸 Transferencia</p>
                  </div>
                </div>
                <span style={{ fontSize: 18, fontWeight: 900, color: COLORS.emerald }}>$45.000</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: COLORS.background, border: `2px solid ${COLORS.border}`, padding: "16px 20px", borderRadius: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontSize: 28 }}>🟡</span>
                  <div>
                    <p style={{ fontSize: 18, fontWeight: 850, color: "#ffffff", margin: 0 }}>Lucas Gómez</p>
                    <p style={{ fontSize: 14, color: COLORS.textTertiary, fontWeight: 700, margin: "4px 0 0 0" }}>Pendiente de pago</p>
                  </div>
                </div>
                {/* Botón WhatsApp */}
                <div style={{ backgroundColor: "#25d366", color: "#ffffff", padding: "10px 18px", borderRadius: 12, fontSize: 14, fontWeight: 900, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>💬</span> Enviar Link
                </div>
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* =======================================================================
          SLIDE 7: CIERRE / CTA (26s - 30s / Frames 780 - 900)
          ======================================================================= */}
      {slideIndex === 6 && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 60px",
            textAlign: "center",
          }}
        >
          {/* Logo animado K Gigante */}
          <div
            style={{
              width: 200,
              height: 200,
              backgroundColor: COLORS.violet,
              color: "#ffffff",
              borderRadius: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 105,
              fontWeight: 950,
              boxShadow: "0 25px 50px rgba(124, 58, 237, 0.4)",
              transform: `scale(${entrySpring})`,
              ...titleFontStyle,
            }}
          >
            K
          </div>

          <h2
            style={{
              fontSize: 76,
              fontWeight: 950,
              marginTop: 50,
              lineHeight: 1.15,
              color: "#ffffff",
              letterSpacing: "-0.03em",
              opacity: interpolate(slideProgress, [15, 45], [0, 1]),
              ...titleFontStyle,
            }}
          >
            Profesionaliza tus clases particulares hoy
          </h2>

          <p
            style={{
              fontSize: 32,
              color: COLORS.textSecondary,
              marginTop: 24,
              fontWeight: 600,
              opacity: interpolate(slideProgress, [35, 65], [0, 1]),
            }}
          >
            Prueba Khora gratis
          </p>

          {/* Botón CTA gigante visible en el feed */}
          <div
            style={{
              marginTop: 65,
              backgroundColor: COLORS.violet,
              color: "#ffffff",
              fontSize: 52,
              fontWeight: 950,
              padding: "24px 65px",
              borderRadius: 24,
              boxShadow: "0 25px 45px rgba(124, 58, 237, 0.45)",
              transform: `scale(${interpolate(slideProgress, [55, 80], [0.85, 1], {
                extrapolateRight: "clamp",
              })})`,
              opacity: interpolate(slideProgress, [55, 80], [0, 1]),
              border: "3px solid #c084fc",
              ...titleFontStyle,
            }}
          >
            khora.cl
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
