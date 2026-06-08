import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
} from "remotion";
import React from "react";

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
    config: { damping: 15, stiffness: 90 },
  });

  const fontStyle = {
    fontFamily: "Outfit, Inter, system-ui, sans-serif",
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#f9fafb", // Fondo neutral claro real de Khora
        color: "#111827",
        overflow: "hidden",
        ...fontStyle,
      }}
    >
      {/* =======================================================================
          SLIDE 1: EL DOLOR (0s - 4.3s / Frames 0 - 130)
          ======================================================================= */}
      {slideIndex === 0 && (
        <AbsoluteFill
          style={{
            background: "radial-gradient(circle at center, #fef2f2 0%, #f9fafb 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 80px",
            textAlign: "center",
          }}
        >
          <span
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              color: "#ef4444",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              fontSize: 22,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 3,
              padding: "10px 24px",
              borderRadius: 99,
              opacity: interpolate(slideProgress, [0, 15], [0, 1]),
              transform: `translateY(${interpolate(slideProgress, [0, 15], [-20, 0], { extrapolateRight: "clamp" })}px)`,
            }}
          >
            ¿Haces clases particulares?
          </span>

          <h1
            style={{
              fontSize: 68,
              fontWeight: 950,
              lineHeight: 1.15,
              marginTop: 40,
              color: "#111827",
              letterSpacing: "-0.03em",
              transform: `scale(${interpolate(slideProgress, [10, 35], [0.85, 1], {
                extrapolateRight: "clamp",
              })})`,
              opacity: interpolate(slideProgress, [10, 35], [0, 1]),
            }}
          >
            ¿Sigues coordinando por chats y cuadernos?
          </h1>

          {/* Iconos de desorden */}
          <div
            style={{
              display: "flex",
              gap: 30,
              marginTop: 60,
              fontSize: 90,
              opacity: interpolate(slideProgress, [30, 60], [0, 1]),
            }}
          >
            <span style={{ transform: `rotate(-15deg) translateY(${Math.sin(slideProgress * 0.08) * 10}px)` }}>📝</span>
            <span style={{ transform: `rotate(10deg) translateY(${Math.cos(slideProgress * 0.08) * 10}px)` }}>💬</span>
            <span style={{ transform: `rotate(-5deg) translateY(${Math.sin(slideProgress * 0.06) * 12}px)` }}>🤯</span>
            <span style={{ transform: `rotate(20deg) translateY(${Math.cos(slideProgress * 0.06) * 12}px)` }}>❌</span>
          </div>
        </AbsoluteFill>
      )}

      {/* =======================================================================
          SLIDE 2: EL PROBLEMA (4.3s - 8.6s / Frames 130 - 260)
          ======================================================================= */}
      {slideIndex === 1 && (
        <AbsoluteFill
          style={{
            background: "radial-gradient(circle at center, #fff5f5 0%, #f9fafb 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 80px",
          }}
        >
          <h2
            style={{
              fontSize: 52,
              fontWeight: 900,
              color: "#dc2626",
              textAlign: "center",
              lineHeight: 1.25,
              marginBottom: 60,
              letterSpacing: "-0.02em",
              opacity: interpolate(slideProgress, [0, 20], [0, 1]),
            }}
          >
            El desorden te cuesta tiempo y dinero:
          </h2>

          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 30 }}>
            {/* Problema 1 */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #fee2e2",
                borderRadius: 24,
                padding: 30,
                display: "flex",
                alignItems: "center",
                gap: 25,
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
                transform: `translateX(${interpolate(slideProgress, [20, 40], [-80, 0], { extrapolateRight: "clamp" })}px)`,
                opacity: interpolate(slideProgress, [20, 40], [0, 1]),
              }}
            >
              <span style={{ fontSize: 45 }}>💸</span>
              <p style={{ fontSize: 26, fontWeight: 700, color: "#991b1b" }}>
                Alumnos que olvidan pagar sus mensualidades.
              </p>
            </div>

            {/* Problema 2 */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #fee2e2",
                borderRadius: 24,
                padding: 30,
                display: "flex",
                alignItems: "center",
                gap: 25,
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
                transform: `translateX(${interpolate(slideProgress, [40, 60], [80, 0], { extrapolateRight: "clamp" })}px)`,
                opacity: interpolate(slideProgress, [40, 60], [0, 1]),
              }}
            >
              <span style={{ fontSize: 45 }}>📄</span>
              <p style={{ fontSize: 26, fontWeight: 700, color: "#991b1b" }}>
                Partituras y videos perdidos en WhatsApp.
              </p>
            </div>

            {/* Problema 3 */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #fee2e2",
                borderRadius: 24,
                padding: 30,
                display: "flex",
                alignItems: "center",
                gap: 25,
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
                transform: `translateX(${interpolate(slideProgress, [60, 80], [-80, 0], { extrapolateRight: "clamp" })}px)`,
                opacity: interpolate(slideProgress, [60, 80], [0, 1]),
              }}
            >
              <span style={{ fontSize: 45 }}>⏰</span>
              <p style={{ fontSize: 26, fontWeight: 700, color: "#991b1b" }}>
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
            background: "radial-gradient(circle at center, #f5f3ff 0%, #f9fafb 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 80px",
            textAlign: "center",
          }}
        >
          {/* Logo animado K */}
          <div
            style={{
              width: 170,
              height: 170,
              backgroundColor: "#7c3aed",
              color: "#ffffff",
              borderRadius: 45,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 95,
              fontWeight: 950,
              boxShadow: "0 25px 50px -12px rgba(124, 58, 237, 0.3)",
              transform: `scale(${entrySpring}) rotate(${interpolate(
                slideProgress,
                [0, 50],
                [-45, 0]
              )}deg)`,
            }}
          >
            K
          </div>

          <h2
            style={{
              fontSize: 75,
              fontWeight: 950,
              marginTop: 50,
              lineHeight: 1.15,
              background: "linear-gradient(to right, #7c3aed, #4f46e5)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.03em",
              opacity: interpolate(slideProgress, [20, 50], [0, 1]),
            }}
          >
            Khora unifica tu gestión
          </h2>

          <p
            style={{
              fontSize: 34,
              color: "#4b5563",
              fontWeight: 600,
              marginTop: 25,
              lineHeight: 1.35,
              opacity: interpolate(slideProgress, [45, 75], [0, 1]),
            }}
          >
            El panel definitivo para controlar tus clases, pagos y material de estudio.
          </p>
        </AbsoluteFill>
      )}

      {/* =======================================================================
          SLIDE 4: HIGHLIGHT 1 - AGENDA PÚBLICA (13s - 17.3s / Frames 390 - 520)
          ======================================================================= */}
      {slideIndex === 3 && (
        <AbsoluteFill
          style={{
            background: "radial-gradient(circle at center, #fafafa 0%, #f9fafb 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 80px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <span
              style={{
                backgroundColor: "rgba(124, 58, 237, 0.08)",
                color: "#7c3aed",
                border: "1px solid rgba(124, 58, 237, 0.2)",
                fontSize: 18,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 2,
                padding: "8px 20px",
                borderRadius: 99,
              }}
            >
              Agenda Inteligente
            </span>
            <h3 style={{ fontSize: 62, fontWeight: 950, marginTop: 25, letterSpacing: "-0.02em" }}>
              Tu Link de Reserva
            </h3>
            <p style={{ fontSize: 26, color: "#4b5563", marginTop: 15, lineHeight: 1.4 }}>
              Tus alumnos agendan solos según tus horarios disponibles.
            </p>
          </div>

          {/* MOCKUP REAL DE AGENDA DE KHORA */}
          <div
            style={{
              width: "100%",
              backgroundColor: "#ffffff",
              borderRadius: 36,
              border: "1px solid #e5e7eb",
              padding: 35,
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.01)",
              transform: `translateY(${interpolate(slideProgress, [0, 40], [150, 0], { extrapolateRight: "clamp" })}px)`,
              opacity: interpolate(slideProgress, [0, 40], [0, 1]),
            }}
          >
            {/* Header del profesor */}
            <div style={{ display: "flex", alignItems: "center", gap: 15, borderBottom: "1px solid #f3f4f6", paddingBottom: 20 }}>
              <div style={{ width: 45, height: 45, borderRadius: 14, backgroundColor: "#7c3aed", color: "#ffffff", display: "flex", alignItems: "center", justifyCenter: "center", fontSize: 20, fontWeight: 900 }}>P</div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 900, color: "#111827" }}>Agenda con Pedro</p>
                <p style={{ fontSize: 11, color: "#6b7280", fontWeight: 700 }}>Clase de Batería 60m</p>
              </div>
            </div>

            {/* Slots de Horario */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
              <div style={{ backgroundColor: "#f3f4f6", padding: "14px 0", borderRadius: 14, textAlign: "center", fontSize: 14, fontWeight: 700, color: "#4b5563" }}>10:00 AM</div>
              <div style={{ backgroundColor: "#7c3aed", padding: "14px 0", borderRadius: 14, textAlign: "center", fontSize: 14, fontWeight: 800, color: "#ffffff", transform: "scale(1.03)", boxShadow: "0 4px 12px rgba(124, 58, 237, 0.25)" }}>11:30 AM ✓</div>
              <div style={{ backgroundColor: "#f3f4f6", padding: "14px 0", borderRadius: 14, textAlign: "center", fontSize: 14, fontWeight: 700, color: "#4b5563" }}>03:00 PM</div>
              <div style={{ backgroundColor: "#f3f4f6", padding: "14px 0", borderRadius: 14, textAlign: "center", fontSize: 14, fontWeight: 700, color: "#4b5563" }}>04:30 PM</div>
            </div>
            
            {/* Botón de envío */}
            <div style={{ marginTop: 25, backgroundColor: "#111827", color: "#ffffff", padding: "14px 0", borderRadius: 14, textAlign: "center", fontSize: 14, fontWeight: 900 }}>
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
            background: "radial-gradient(circle at center, #fafafa 0%, #f9fafb 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 80px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <span
              style={{
                backgroundColor: "rgba(16, 185, 129, 0.08)",
                color: "#10b981",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                fontSize: 18,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 2,
                padding: "8px 20px",
                borderRadius: 99,
              }}
            >
              Biblioteca Digital
            </span>
            <h3 style={{ fontSize: 62, fontWeight: 950, marginTop: 25, letterSpacing: "-0.02em" }}>
              Materiales y Tareas
            </h3>
            <p style={{ fontSize: 26, color: "#4b5563", marginTop: 15, lineHeight: 1.4 }}>
              Asigna partituras, PDFs y videos directo a sus perfiles de alumno.
            </p>
          </div>

          {/* MOCKUP REAL DE BIBLIOTECA DE KHORA */}
          <div
            style={{
              width: "100%",
              backgroundColor: "#ffffff",
              borderRadius: 36,
              border: "1px solid #e5e7eb",
              padding: 35,
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05)",
              transform: `translateY(${interpolate(slideProgress, [0, 40], [150, 0], { extrapolateRight: "clamp" })}px)`,
              opacity: interpolate(slideProgress, [0, 40], [0, 1]),
            }}
          >
            {/* Lista de materiales */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 15, backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", padding: 15, borderRadius: 16 }}>
                <span style={{ fontSize: 28 }}>📄</span>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 900, color: "#111827" }}>Rutina_Independencia.pdf</p>
                  <p style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>PDF asignado hoy</p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 15, backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", padding: 15, borderRadius: 16 }}>
                <span style={{ fontSize: 28 }}>📹</span>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 900, color: "#111827" }}>HiHat_Funk_Beat.mp4</p>
                  <p style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>Video de apoyo</p>
                </div>
              </div>
            </div>

            {/* Lista de tareas */}
            <div style={{ marginTop: 25, borderTop: "1px solid #f3f4f6", paddingTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: "#10b981", color: "#ffffff", display: "flex", alignItems: "center", justifyCenter: "center", fontSize: 11, fontWeight: 900 }}>✓</div>
                <p style={{ fontSize: 14, color: "#6b7280", textDecoration: "line-through", fontWeight: 600 }}>Estudiar compás 1 al 8</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, border: "2px solid #d1d5db" }} />
                <p style={{ fontSize: 14, color: "#111827", fontWeight: 700 }}>Grabar video de práctica</p>
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
            background: "radial-gradient(circle at center, #fafafa 0%, #f9fafb 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 80px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <span
              style={{
                backgroundColor: "rgba(16, 185, 129, 0.08)",
                color: "#10b981",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                fontSize: 18,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 2,
                padding: "8px 20px",
                borderRadius: 99,
              }}
            >
              Control de Ingresos
            </span>
            <h3 style={{ fontSize: 62, fontWeight: 950, marginTop: 25, letterSpacing: "-0.02em" }}>
              Control de Pagos
            </h3>
            <p style={{ fontSize: 26, color: "#4b5563", marginTop: 15, lineHeight: 1.4 }}>
              Visualiza deudas, registra pagos manuales y de Mercado Pago.
            </p>
          </div>

          {/* MOCKUP REAL DE CONTROLES FINANCIEROS DE KHORA */}
          <div
            style={{
              width: "100%",
              backgroundColor: "#ffffff",
              borderRadius: 36,
              border: "1px solid #e5e7eb",
              padding: 35,
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05)",
              transform: `translateY(${interpolate(slideProgress, [0, 40], [150, 0], { extrapolateRight: "clamp" })}px)`,
              opacity: interpolate(slideProgress, [0, 40], [0, 1]),
            }}
          >
            {/* Tarjeta Ingresos */}
            <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", padding: 25, borderRadius: 24 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: "#166534", letterSpacing: 1, textTransform: "uppercase" }}>Ingresos del Mes</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 10 }}>
                <span style={{ fontSize: 38, fontWeight: 950, color: "#166534" }}>$450.000</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#16a34a" }}>100% cobrado</span>
              </div>
            </div>

            {/* Listado de alumnos */}
            <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
              <div style={{ flex: 1, backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", padding: 15, borderRadius: 16, textAlign: "center" }}>
                <p style={{ fontSize: 10, color: "#6b7280", fontWeight: 800 }}>PAGADOS</p>
                <p style={{ fontSize: 20, fontWeight: 900, color: "#16a34a", marginTop: 5 }}>12 alumnos</p>
              </div>
              <div style={{ flex: 1, backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", padding: 15, borderRadius: 16, textAlign: "center" }}>
                <p style={{ fontSize: 10, color: "#6b7280", fontWeight: 800 }}>PENDIENTES</p>
                <p style={{ fontSize: 20, fontWeight: 900, color: "#dc2626", marginTop: 5 }}>0 deudas</p>
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
            background: "radial-gradient(circle at center, #f5f3ff 0%, #f9fafb 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 80px",
            textAlign: "center",
          }}
        >
          {/* Logo animado K */}
          <div
            style={{
              width: 140,
              height: 140,
              backgroundColor: "#7c3aed",
              color: "#ffffff",
              borderRadius: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 80,
              fontWeight: 950,
              boxShadow: "0 20px 40px rgba(124, 58, 237, 0.25)",
              transform: `scale(${entrySpring})`,
            }}
          >
            K
          </div>

          <h2
            style={{
              fontSize: 66,
              fontWeight: 950,
              marginTop: 50,
              lineHeight: 1.15,
              color: "#111827",
              letterSpacing: "-0.03em",
              opacity: interpolate(slideProgress, [15, 45], [0, 1]),
            }}
          >
            Profesionaliza tus clases particulares hoy
          </h2>

          <p
            style={{
              fontSize: 32,
              color: "#4b5563",
              marginTop: 20,
              fontWeight: 600,
              opacity: interpolate(slideProgress, [35, 65], [0, 1]),
            }}
          >
            Prueba Khora gratis
          </p>

          <div
            style={{
              marginTop: 60,
              backgroundColor: "#111827",
              color: "#ffffff",
              fontSize: 36,
              fontWeight: 950,
              padding: "22px 60px",
              borderRadius: 24,
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
              transform: `scale(${interpolate(slideProgress, [55, 80], [0.85, 1], {
                extrapolateRight: "clamp",
              })})`,
              opacity: interpolate(slideProgress, [55, 80], [0, 1]),
            }}
          >
            khora.cl
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
