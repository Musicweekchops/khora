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
  surface: "#161619",
  border: "#242427",
  textPrimary: "#ffffff",
  textSecondary: "#a1a1aa",
  textTertiary: "#71717a",
  violet: "#7c3aed",
  indigo: "#4f46e5",
  blue: "#2563eb",
  emerald: "#10b981",
  amber: "#f59e0b",
  whatsappGreen: "#25d366",
};

export const UnirseExplainer = () => {
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

  // Animación de entrada general
  const entrySpring = spring({
    frame: slideProgress,
    fps,
    config: { damping: 15, stiffness: 90 },
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
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@600;700;800;900;950&display=swap');
      `}</style>

      {/* Rejilla de Fondo (Social Media Grid Pattern) */}
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

      {/* Glows Ambientales Animados (Simulando la landing de Khora) */}
      <div
        style={{
          position: "absolute",
          top: "-5%",
          right: "-5%",
          width: 700,
          height: 700,
          backgroundColor: "rgba(124, 58, 237, 0.15)",
          borderRadius: "9999px",
          filter: "blur(130px)",
          pointerEvents: "none",
          transform: `translateY(${Math.sin(frame * 0.03) * 30}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-5%",
          left: "-5%",
          width: 800,
          height: 800,
          backgroundColor: "rgba(37, 99, 235, 0.12)",
          borderRadius: "9999px",
          filter: "blur(140px)",
          pointerEvents: "none",
          transform: `translateX(${Math.cos(frame * 0.03) * 30}px)`,
        }}
      />

      {/* =======================================================================
          SLIDE 1: INTRODUCCIÓN LÚDICA (0s - 4.3s / Frames 0 - 130)
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
              backgroundColor: "rgba(124, 58, 237, 0.18)",
              color: "#c084fc",
              border: `1.5px solid rgba(124, 58, 237, 0.35)`,
              fontSize: 28,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: 2,
              padding: "12px 32px",
              borderRadius: 99,
              opacity: interpolate(slideProgress, [0, 15], [0, 1]),
              transform: `translateY(${interpolate(slideProgress, [0, 15], [-25, 0], { extrapolateRight: "clamp" })}px)`,
              ...titleFontStyle,
            }}
          >
            Clases Particulares de Música
          </span>

          <h1
            style={{
              fontSize: 78,
              fontWeight: 950,
              lineHeight: 1.15,
              marginTop: 45,
              color: "#ffffff",
              letterSpacing: "-0.03em",
              transform: `scale(${interpolate(slideProgress, [10, 35], [0.85, 1], {
                extrapolateRight: "clamp",
              })})`,
              opacity: interpolate(slideProgress, [10, 35], [0, 1]),
              ...titleFontStyle,
            }}
          >
            ¿Cómo agendar tu clase de prueba?
          </h1>

          <p
            style={{
              fontSize: 34,
              color: COLORS.textSecondary,
              fontWeight: 600,
              lineHeight: 1.4,
              marginTop: 28,
              padding: "0 60px",
              opacity: interpolate(slideProgress, [25, 50], [0, 1]),
            }}
          >
            Te explicamos paso a paso cómo registrarte e inscribirte de forma rápida.
          </p>

          {/* Emojis flotando */}
          <div
            style={{
              display: "flex",
              gap: 40,
              marginTop: 60,
              fontSize: 110,
              opacity: interpolate(slideProgress, [40, 70], [0, 1]),
            }}
          >
            <span style={{ transform: `rotate(-15deg) translateY(${Math.sin(slideProgress * 0.08) * 10}px)` }}>🎸</span>
            <span style={{ transform: `rotate(10deg) translateY(${Math.cos(slideProgress * 0.08) * 10}px)` }}>🥁</span>
            <span style={{ transform: `rotate(-5deg) translateY(${Math.sin(slideProgress * 0.06) * 12}px)` }}>🎹</span>
            <span style={{ transform: `rotate(20deg) translateY(${Math.cos(slideProgress * 0.06) * 12}px)` }}>✨</span>
          </div>
        </AbsoluteFill>
      )}

      {/* =======================================================================
          SLIDE 2: PASO 1 - WHATSAPP (4.3s - 8.6s / Frames 130 - 260)
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
          <div style={{ textAlign: "center", marginBottom: 35 }}>
            <span
              style={{
                backgroundColor: "rgba(37, 99, 235, 0.18)",
                color: "#60a5fa",
                border: `1.5px solid rgba(37, 99, 235, 0.35)`,
                fontSize: 22,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: 2,
                padding: "10px 24px",
                borderRadius: 99,
                ...titleFontStyle,
              }}
            >
              Paso 1
            </span>
            <h3 style={{ fontSize: 64, fontWeight: 950, marginTop: 22, color: "#ffffff", letterSpacing: "-0.02em", ...titleFontStyle }}>
              Ingresa tu WhatsApp
            </h3>
            <p style={{ fontSize: 28, color: COLORS.textSecondary, marginTop: 14, lineHeight: 1.4, fontWeight: 600 }}>
              Ingresa al link que te enviaron e inicia el agendamiento con tu número.
            </p>
          </div>

          {/* MOCKUP MOVIL GIGANTE 900PX: CAPTURA WHATSAPP */}
          <div
            style={{
              width: 900,
              backgroundColor: COLORS.surface,
              borderRadius: 36,
              border: `4px solid ${COLORS.blue}`,
              padding: "36px 40px",
              boxShadow: "0 30px 60px rgba(37, 99, 235, 0.3)",
              transform: `translateY(${interpolate(slideProgress, [0, 45], [180, 0], { extrapolateRight: "clamp" })}px)`,
              opacity: interpolate(slideProgress, [0, 45], [0, 1]),
            }}
          >
            {/* Status Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, color: COLORS.textTertiary, marginBottom: 24 }}>
              <span>9:41</span>
              <span>📶 🛜 🔋</span>
            </div>

            {/* Landing UI Title */}
            <div style={{ textAlign: "center", marginBottom: 30 }}>
              <p style={{ fontSize: 13, fontWeight: 850, color: COLORS.violet, letterSpacing: 1, textTransform: "uppercase", margin: 0 }}>Portal de Inscripción</p>
              <h4 style={{ fontSize: 26, fontWeight: 950, color: "#ffffff", margin: "6px 0 0 0", letterSpacing: "-0.015em", ...titleFontStyle }}>Aprende Música con Clases 1 a 1</h4>
            </div>

            {/* Input WhatsApp */}
            <div style={{ margin: "24px 0" }}>
              <label style={{ fontSize: 14, fontWeight: 850, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 12 }}>Número de WhatsApp</label>
              <div
                style={{
                  backgroundColor: COLORS.background,
                  border: `2px solid ${COLORS.border}`,
                  borderRadius: 18,
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <span style={{ fontSize: 24 }}>📞</span>
                <span style={{ fontSize: 22, color: "#ffffff", fontWeight: 800 }}>
                  {(() => {
                    if (slideProgress < 25) return "+56 ";
                    if (slideProgress < 30) return "+56 9";
                    if (slideProgress < 35) return "+56 9 4";
                    if (slideProgress < 40) return "+56 9 44";
                    if (slideProgress < 45) return "+56 9 442";
                    if (slideProgress < 50) return "+56 9 4429";
                    if (slideProgress < 55) return "+56 9 4429 1";
                    if (slideProgress < 60) return "+56 9 4429 15";
                    if (slideProgress < 65) return "+56 9 4429 153";
                    return "+56 9 4429 1538";
                  })()}
                </span>
                <span style={{ width: 3, height: 26, backgroundColor: COLORS.blue, display: slideProgress > 20 && slideProgress < 60 ? "inline-block" : "none" }} />
              </div>
            </div>

            {/* Botón */}
            <div style={{ marginTop: 32, backgroundColor: COLORS.blue, color: "#ffffff", padding: "22px 0", borderRadius: 18, textAlign: "center", fontSize: 20, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.5, boxShadow: "0 6px 15px rgba(37, 99, 235, 0.3)" }}>
              Empezar Ahora →
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* =======================================================================
          SLIDE 3: PASO 2 - CLASE DE PRUEBA (8.6s - 13s / Frames 260 - 390)
          ======================================================================= */}
      {slideIndex === 2 && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 60px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 35 }}>
            <span
              style={{
                backgroundColor: "rgba(37, 99, 235, 0.18)",
                color: "#60a5fa",
                border: `1.5px solid rgba(37, 99, 235, 0.35)`,
                fontSize: 22,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: 2,
                padding: "10px 24px",
                borderRadius: 99,
                ...titleFontStyle,
              }}
            >
              Paso 2
            </span>
            <h3 style={{ fontSize: 64, fontWeight: 950, marginTop: 22, color: "#ffffff", letterSpacing: "-0.02em", ...titleFontStyle }}>
              Elige tu Horario
            </h3>
            <p style={{ fontSize: 28, color: COLORS.textSecondary, marginTop: 14, lineHeight: 1.4, fontWeight: 600 }}>
              Selecciona el día y la hora que mejor te acomode para tu clase de prueba.
            </p>
          </div>

          {/* MOCKUP MOVIL GIGANTE 900PX: AGENDA/SLOTS */}
          <div
            style={{
              width: 900,
              backgroundColor: COLORS.surface,
              borderRadius: 36,
              border: `4px solid ${COLORS.blue}`,
              padding: "36px 40px",
              boxShadow: "0 30px 60px rgba(37, 99, 235, 0.3)",
              transform: `translateY(${interpolate(slideProgress, [0, 45], [180, 0], { extrapolateRight: "clamp" })}px)`,
              opacity: interpolate(slideProgress, [0, 45], [0, 1]),
            }}
          >
            {/* Status Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, color: COLORS.textTertiary, marginBottom: 24 }}>
              <span>9:41</span>
              <span>📶 🛜 🔋</span>
            </div>

            {/* Fecha */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 850, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 10px 0" }}>Elige la Fecha</p>
              <div style={{ backgroundColor: COLORS.background, border: `2px solid ${COLORS.border}`, borderRadius: 18, padding: "18px 22px", fontSize: 22, fontWeight: 800, color: "#ffffff" }}>
                📅 Lunes, 8 de Junio
              </div>
            </div>

            {/* Slots */}
            <p style={{ fontSize: 13, fontWeight: 850, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, margin: "24px 0 12px 0" }}>Horas Disponibles</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ backgroundColor: COLORS.background, border: `2px solid ${COLORS.border}`, padding: "18px 0", borderRadius: 16, textAlign: "center", fontSize: 18, fontWeight: 800, color: COLORS.textSecondary }}>10:00 AM</div>
              
              {/* Slot Seleccionado */}
              <div style={{ backgroundColor: COLORS.blue, border: `2px solid ${COLORS.blue}`, padding: "18px 0", borderRadius: 16, textAlign: "center", fontSize: 18, fontWeight: 900, color: "#ffffff", transform: "scale(1.02)", boxShadow: "0 6px 15px rgba(37, 99, 235, 0.25)" }}>11:30 AM ✓</div>
              
              <div style={{ backgroundColor: COLORS.background, border: `2px solid ${COLORS.border}`, padding: "18px 0", borderRadius: 16, textAlign: "center", fontSize: 18, fontWeight: 800, color: COLORS.textSecondary }}>03:00 PM</div>
              <div style={{ backgroundColor: COLORS.background, border: `2px solid ${COLORS.border}`, padding: "18px 0", borderRadius: 16, textAlign: "center", fontSize: 18, fontWeight: 800, color: COLORS.textSecondary }}>04:30 PM</div>
            </div>
            
            <div style={{ marginTop: 32, backgroundColor: COLORS.surface, border: `2px solid ${COLORS.border}`, padding: "18px 0", borderRadius: 16, textAlign: "center", fontSize: 18, fontWeight: 800, color: COLORS.textSecondary }}>
              Tienes un horario seleccionado
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* =======================================================================
          SLIDE 4: ALTERNATIVA - LISTA DE ESPERA (13s - 17.3s / Frames 390 - 520)
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
          <div style={{ textAlign: "center", marginBottom: 35 }}>
            <span
              style={{
                backgroundColor: "rgba(245, 158, 11, 0.18)",
                color: "#fbbf24",
                border: `1.5px solid rgba(245, 158, 11, 0.35)`,
                fontSize: 22,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: 2,
                padding: "10px 24px",
                borderRadius: 99,
                ...titleFontStyle,
              }}
            >
              Lista de Espera
            </span>
            <h3 style={{ fontSize: 64, fontWeight: 950, marginTop: 22, color: "#ffffff", letterSpacing: "-0.02em", ...titleFontStyle }}>
              ¿Sin Horas Libres?
            </h3>
            <p style={{ fontSize: 28, color: COLORS.textSecondary, marginTop: 14, lineHeight: 1.4, fontWeight: 600 }}>
              Si no encuentras horarios libres por alta demanda, únete a la lista de espera prioritaria.
            </p>
          </div>

          {/* MOCKUP MOVIL GIGANTE 900PX: LISTA DE ESPERA */}
          <div
            style={{
              width: 900,
              backgroundColor: COLORS.surface,
              borderRadius: 36,
              border: `4px solid ${COLORS.amber}`,
              padding: "36px 40px",
              boxShadow: "0 30px 60px rgba(245, 158, 11, 0.25)",
              transform: `translateY(${interpolate(slideProgress, [0, 45], [180, 0], { extrapolateRight: "clamp" })}px)`,
              opacity: interpolate(slideProgress, [0, 45], [0, 1]),
            }}
          >
            {/* Status Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, color: COLORS.textTertiary, marginBottom: 24 }}>
              <span>9:41</span>
              <span>📶 🛜 🔋</span>
            </div>

            {/* Aviso de escasez */}
            <div style={{ backgroundColor: "rgba(245, 158, 11, 0.08)", border: `2px solid rgba(245, 158, 11, 0.25)`, borderRadius: 18, padding: "26px 30px", textAlign: "center", marginBottom: 24 }}>
              <p style={{ fontSize: 20, fontStyle: "italic", fontWeight: 800, color: "#fcd34d", margin: 0, lineHeight: 1.45 }}>
                ⚠️ Vaya, parece que no hay bloques libres para esta fecha por alta demanda.
              </p>
            </div>

            {/* Botón Lista de Espera */}
            <div
              style={{
                backgroundColor: COLORS.amber,
                color: "#1e1b4b",
                padding: "22px 0",
                borderRadius: 18,
                textAlign: "center",
                fontSize: 20,
                fontWeight: 950,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                boxShadow: "0 10px 25px rgba(245, 158, 11, 0.35)",
                transform: `scale(${interpolate(slideProgress, [30, 50, 70], [1, 1.03, 1], { extrapolateRight: "clamp" })})`,
              }}
            >
              Unirse a Lista de Espera Prioritaria 🔥
            </div>

            <p style={{ fontSize: 16, color: COLORS.textTertiary, textAlign: "center", marginTop: 18, fontWeight: 700, margin: "18px 0 0 0" }}>
              Te avisaremos de inmediato si se libera un cupo.
            </p>
          </div>
        </AbsoluteFill>
      )}

      {/* =======================================================================
          SLIDE 5: CONFIRMACIÓN Y PAGO (17.3s - 21.6s / Frames 520 - 650)
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
          <div style={{ textAlign: "center", marginBottom: 35 }}>
            <span
              style={{
                backgroundColor: "rgba(16, 185, 129, 0.18)",
                color: "#34d399",
                border: `1.5px solid rgba(16, 185, 129, 0.35)`,
                fontSize: 22,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: 2,
                padding: "10px 24px",
                borderRadius: 99,
                ...titleFontStyle,
              }}
            >
              Pago Seguro
            </span>
            <h3 style={{ fontSize: 64, fontWeight: 950, marginTop: 22, color: "#ffffff", letterSpacing: "-0.02em", ...titleFontStyle }}>
              Paga y Confirma
            </h3>
            <p style={{ fontSize: 28, color: COLORS.textSecondary, marginTop: 14, lineHeight: 1.4, fontWeight: 600 }}>
              Si tu profesor tiene habilitada la pasarela, confirma tu clase pagando por Mercado Pago.
            </p>
          </div>

          {/* MOCKUP MOVIL GIGANTE 900PX: MERCADO PAGO */}
          <div
            style={{
              width: 900,
              backgroundColor: COLORS.surface,
              borderRadius: 36,
              border: `4px solid ${COLORS.emerald}`,
              padding: "36px 40px",
              boxShadow: "0 30px 60px rgba(16, 185, 129, 0.25)",
              transform: `translateY(${interpolate(slideProgress, [0, 45], [180, 0], { extrapolateRight: "clamp" })}px)`,
              opacity: interpolate(slideProgress, [0, 45], [0, 1]),
            }}
          >
            {/* Status Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, color: COLORS.textTertiary, marginBottom: 24 }}>
              <span>9:41</span>
              <span>📶 🛜 🔋</span>
            </div>

            {/* Resumen */}
            <div style={{ borderBottom: `2px solid ${COLORS.border}`, paddingBottom: 20, marginBottom: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 850, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, margin: 0 }}>Detalle de Reserva</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 900 }}>🎸 Clase de Prueba 1 a 1</span>
                <span style={{ fontSize: 24, fontWeight: 950, color: COLORS.emerald }}>$15.000</span>
              </div>
            </div>

            {/* Simulación Mercado Pago */}
            <div style={{ backgroundColor: "#00b1ea", color: "#ffffff", padding: "22px 0", borderRadius: 18, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, boxShadow: "0 6px 20px rgba(0, 177, 234, 0.25)" }}>
              <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: 0.5, textTransform: "uppercase" }}>Pagar con</span>
              <span style={{ fontSize: 32, fontWeight: 950, fontStyle: "italic", ...titleFontStyle }}>mercado pago</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginTop: 20 }}>
              <span style={{ fontSize: 20 }}>🛡️</span>
              <p style={{ fontSize: 14, color: COLORS.textTertiary, fontWeight: 700, margin: 0 }}>Transacción protegida y 100% encriptada</p>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* =======================================================================
          SLIDE 6: COORDINACIÓN WHATSAPP (21.6s - 26s / Frames 650 - 780)
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
          <div style={{ textAlign: "center", marginBottom: 35 }}>
            <span
              style={{
                backgroundColor: "rgba(37, 211, 102, 0.18)",
                color: "#4ade80",
                border: `1.5px solid rgba(37, 211, 102, 0.35)`,
                fontSize: 22,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: 2,
                padding: "10px 24px",
                borderRadius: 99,
                ...titleFontStyle,
              }}
            >
              Paso Final
            </span>
            <h3 style={{ fontSize: 64, fontWeight: 950, marginTop: 22, color: "#ffffff", letterSpacing: "-0.02em", ...titleFontStyle }}>
              Mensaje WhatsApp
            </h3>
            <p style={{ fontSize: 28, color: COLORS.textSecondary, marginTop: 14, lineHeight: 1.4, fontWeight: 600 }}>
              Al terminar, se abrirá un chat directo con tu profesor con un texto predefinido listo para enviar.
            </p>
          </div>

          {/* MOCKUP MOVIL GIGANTE 900PX: WHATSAPP CHAT */}
          <div
            style={{
              width: 900,
              backgroundColor: "#075e54", // Verde clásico Whatsapp Header
              borderRadius: 36,
              border: `4px solid ${COLORS.whatsappGreen}`,
              overflow: "hidden",
              boxShadow: "0 30px 60px rgba(37, 211, 102, 0.25)",
              transform: `translateY(${interpolate(slideProgress, [0, 45], [180, 0], { extrapolateRight: "clamp" })}px)`,
              opacity: interpolate(slideProgress, [0, 45], [0, 1]),
            }}
          >
            {/* Header del Chat */}
            <div style={{ padding: "24px 28px", display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid #128c7e" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", backgroundColor: COLORS.violet, color: "#ffffff", display: "flex", alignItems: "center", justifyCenter: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, ...titleFontStyle }}>P</div>
              <div>
                <p style={{ fontSize: 20, fontWeight: 900, color: "#ffffff", margin: 0 }}>Pedro (Profesor)</p>
                <p style={{ fontSize: 14, color: "#34d399", fontWeight: 800, margin: 0 }}>En línea</p>
              </div>
            </div>

            {/* Cuerpo del Chat (Whatsapp background) */}
            <div style={{ backgroundColor: "#ece5dd", padding: "30px 28px", display: "flex", flexDirection: "column", gap: 18, height: 260, justifyContent: "flex-end" }}>
              {/* Mensaje enviado */}
              <div
                style={{
                  alignSelf: "flex-end",
                  backgroundColor: "#d9fdd3",
                  color: "#1f2937",
                  padding: "16px 20px",
                  borderRadius: 16,
                  maxWidth: "85%",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                  transform: `scale(${interpolate(slideProgress, [30, 45], [0.85, 1], { extrapolateRight: "clamp" })})`,
                  opacity: interpolate(slideProgress, [30, 45], [0, 1]),
                }}
              >
                <p style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: 0, lineHeight: 1.4 }}>
                  ¡Hola Pedro! Acabo de registrarme para una clase de prueba de guitarra este lunes a las 11:30 hs. ¿Me confirmas? 🎸
                </p>
                <div style={{ textAlign: "right", fontSize: 11, color: "#6b7280", marginTop: 6 }}>
                  13:10 ✓✓
                </div>
              </div>
            </div>

            {/* Input bar */}
            <div style={{ backgroundColor: "#f0f0f0", padding: 18, display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ flex: 1, backgroundColor: "#ffffff", borderRadius: 24, height: 48 }} />
              <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: "#128c7e", display: "flex", alignItems: "center", justifyCenter: "center", justifyContent: "center", fontSize: 18, color: "#ffffff" }}>➡️</div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* =======================================================================
          SLIDE 7: CTA / CIERRE (26s - 30s / Frames 780 - 900)
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
          {/* Logo animado K */}
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
            Comienza tu viaje musical hoy
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
            Regístrate en el link enviado
          </p>

          {/* Botón CTA gigante con la URL del landing de Khora explícita y visible */}
          <div
            style={{
              marginTop: 65,
              backgroundColor: COLORS.blue,
              color: "#ffffff",
              fontSize: 48,
              fontWeight: 950,
              padding: "24px 60px",
              borderRadius: 24,
              boxShadow: "0 25px 45px rgba(37, 99, 235, 0.45)",
              transform: `scale(${interpolate(slideProgress, [55, 80], [0.85, 1], {
                extrapolateRight: "clamp",
              })})`,
              opacity: interpolate(slideProgress, [55, 80], [0, 1]),
              border: "3px solid #60a5fa",
              ...titleFontStyle,
            }}
          >
            khora.cl/unirse
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
