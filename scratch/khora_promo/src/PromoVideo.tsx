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

  // Animación base para transiciones entre slides (cada 180 frames = 6 segundos)
  const slideIndex = Math.floor(frame / 180);
  const slideProgress = frame % 180;

  // Spring base para movimientos suaves
  const transitionSpring = spring({
    frame: slideProgress,
    fps,
    config: { damping: 12 },
  });

  // Estilos de fuentes premium
  const fontStyle = {
    fontFamily: "Outfit, Inter, system-ui, sans-serif",
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0d0d12",
        color: "#ffffff",
        overflow: "hidden",
        ...fontStyle,
      }}
    >
      {/* =======================================================================
          SLIDE 1: EL CAOS (Frames 0 - 180)
          ======================================================================= */}
      {frame < 180 && (
        <AbsoluteFill
          style={{
            background: "radial-gradient(circle, #2d1616 0%, #0d0d12 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 80,
          }}
        >
          {/* Animación del texto principal */}
          <h1
            style={{
              fontSize: 70,
              fontWeight: 900,
              textAlign: "center",
              lineHeight: 1.2,
              color: "#f87171",
              maxWidth: 900,
              transform: `scale(${interpolate(frame, [0, 20], [0.8, 1], {
                extrapolateRight: "clamp",
              })})`,
              opacity: interpolate(frame, [0, 20], [0, 1], {
                extrapolateRight: "clamp",
              }),
            }}
          >
            ¿Coordinando clases por WhatsApp y perdiendo partituras?
          </h1>

          <p
            style={{
              fontSize: 32,
              color: "#a1a1aa",
              fontWeight: 500,
              marginTop: 40,
              textAlign: "center",
              opacity: interpolate(frame, [30, 50], [0, 1], {
                extrapolateRight: "clamp",
              }),
            }}
          >
            El desorden de agenda frena el crecimiento de tu escuela.
          </p>

          {/* Elementos caóticos flotantes */}
          <div
            style={{
              position: "absolute",
              fontSize: 90,
              left: 150,
              top: 200,
              transform: `rotate(${-15 + frame * 0.1}deg) translateY(${Math.sin(frame * 0.05) * 20}px)`,
              opacity: 0.15,
            }}
          >
            💬
          </div>
          <div
            style={{
              position: "absolute",
              fontSize: 100,
              right: 200,
              bottom: 250,
              transform: `rotate(${20 - frame * 0.1}deg) translateY(${Math.cos(frame * 0.05) * 20}px)`,
              opacity: 0.15,
            }}
          >
            📅
          </div>
          <div
            style={{
              position: "absolute",
              fontSize: 80,
              left: 300,
              bottom: 150,
              transform: `rotate(${5 + frame * 0.08}deg) translateY(${Math.sin(frame * 0.04) * 15}px)`,
              opacity: 0.1,
            }}
          >
            🎵
          </div>
        </AbsoluteFill>
      )}

      {/* =======================================================================
          SLIDE 2: LA SOLUCIÓN - KHORA (Frames 180 - 360)
          ======================================================================= */}
      {frame >= 180 && frame < 360 && (
        <AbsoluteFill
          style={{
            background: "radial-gradient(circle, #2e1b4e 0%, #0d0d12 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Logo animado K */}
          <div
            style={{
              width: 140,
              height: 140,
              backgroundColor: "#ffffff",
              color: "#0d0d12",
              borderRadius: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 80,
              fontWeight: 950,
              boxShadow: "0 25px 50px -12px rgba(124, 58, 237, 0.4)",
              transform: `scale(${transitionSpring}) rotate(${interpolate(
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
              fontSize: 85,
              fontWeight: 950,
              marginTop: 50,
              background: "linear-gradient(to right, #a78bfa, #818cf8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.03em",
              opacity: interpolate(slideProgress, [20, 50], [0, 1]),
            }}
          >
            Te presentamos Khora
          </h2>

          <p
            style={{
              fontSize: 36,
              color: "#e4e4e7",
              fontWeight: 600,
              marginTop: 20,
              opacity: interpolate(slideProgress, [40, 70], [0, 1]),
            }}
          >
            Tu centro de control musical definitivo.
          </p>
        </AbsoluteFill>
      )}

      {/* =======================================================================
          SLIDE 3: AGENDA Y RESERVA (Frames 360 - 540)
          ======================================================================= */}
      {frame >= 360 && frame < 540 && (
        <AbsoluteFill
          style={{
            background: "radial-gradient(circle, #1e1e30 0%, #0d0d12 100%)",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 120px",
          }}
        >
          {/* Texto de la característica */}
          <div style={{ maxWidth: 600, zIndex: 10 }}>
            <span
              style={{
                backgroundColor: "rgba(139, 92, 246, 0.15)",
                color: "#c084fc",
                border: "1px solid rgba(139, 92, 246, 0.3)",
                fontSize: 16,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 2,
                padding: "8px 20px",
                borderRadius: 99,
              }}
            >
              Agendamiento
            </span>
            <h3
              style={{
                fontSize: 65,
                fontWeight: 900,
                marginTop: 30,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              Agenda pública con 1 Click
            </h3>
            <p style={{ fontSize: 24, color: "#9ca3af", marginTop: 25, lineHeight: 1.5 }}>
              Tus alumnos eligen sus días y horas disponibles directamente desde tu landing page fotorrealista.
            </p>
          </div>

          {/* Tarjeta de simulación de agenda */}
          <div
            style={{
              width: 500,
              backgroundColor: "#181825",
              borderRadius: 36,
              border: "1px solid #2d2d3d",
              padding: 40,
              boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
              transform: `translateX(${interpolate(
                slideProgress,
                [0, 40],
                [100, 0]
              )}px) rotate(2deg)`,
              opacity: interpolate(slideProgress, [0, 40], [0, 1]),
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 900, color: "#8b5cf6", letterSpacing: 1, textTransform: "uppercase" }}>
              Clase de Batería 60m
            </p>
            <h4 style={{ fontSize: 28, fontWeight: 800, color: "#ffffff", marginTop: 10 }}>Selecciona Horario</h4>
            
            {/* Slots simulados */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginTop: 30 }}>
              <div style={{ backgroundColor: "#1e1e2f", border: "1px solid #2d2d4d", padding: "15px 0", borderRadius: 16, textAlign: "center", fontSize: 16, fontWeight: 700, color: "#a1a1aa" }}>10:00 AM</div>
              <div style={{ backgroundColor: "#8b5cf6", border: "1px solid #8b5cf6", padding: "15px 0", borderRadius: 16, textAlign: "center", fontSize: 16, fontWeight: 700, color: "#ffffff", transform: "scale(1.05)", boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)" }}>11:30 AM ✓</div>
              <div style={{ backgroundColor: "#1e1e2f", border: "1px solid #2d2d4d", padding: "15px 0", borderRadius: 16, textAlign: "center", fontSize: 16, fontWeight: 700, color: "#a1a1aa" }}>02:00 PM</div>
              <div style={{ backgroundColor: "#1e1e2f", border: "1px solid #2d2d4d", padding: "15px 0", borderRadius: 16, textAlign: "center", fontSize: 16, fontWeight: 700, color: "#a1a1aa" }}>04:30 PM</div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* =======================================================================
          SLIDE 4: FICHA Y BIBLIOTECA (Frames 540 - 720)
          ======================================================================= */}
      {frame >= 540 && frame < 720 && (
        <AbsoluteFill
          style={{
            background: "radial-gradient(circle, #162421 0%, #0d0d12 100%)",
            display: "flex",
            flexDirection: "row-reverse",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 120px",
          }}
        >
          {/* Texto de la característica */}
          <div style={{ maxWidth: 600, zIndex: 10 }}>
            <span
              style={{
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                color: "#34d399",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                fontSize: 16,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 2,
                padding: "8px 20px",
                borderRadius: 99,
              }}
            >
              Fidelización
            </span>
            <h3
              style={{
                fontSize: 65,
                fontWeight: 900,
                marginTop: 30,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              Control de avance y material compartido
            </h3>
            <p style={{ fontSize: 24, color: "#9ca3af", marginTop: 25, lineHeight: 1.5 }}>
              Fichas clínicas de progreso, tareas semanales y biblioteca de partituras/videos 100% personalizada.
            </p>
          </div>

          {/* Tarjeta de simulación de progreso */}
          <div
            style={{
              width: 500,
              backgroundColor: "#111827",
              borderRadius: 36,
              border: "1px solid #1f2937",
              padding: 40,
              boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
              transform: `translateX(${interpolate(
                slideProgress,
                [0, 40],
                [-100, 0]
              )}px) rotate(-2deg)`,
              opacity: interpolate(slideProgress, [0, 40], [0, 1]),
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ fontSize: 20, fontWeight: 800, color: "#ffffff" }}>Progreso de Lucas</h4>
              <span style={{ fontSize: 13, color: "#34d399", fontWeight: 700 }}>Activo</span>
            </div>

            {/* Checklist de tareas */}
            <div style={{ marginTop: 30, spaceY: 15 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 15 }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: "#10b981", display: "flex", alignItems: "center", justifyCenter: "center", color: "#ffffff", fontSize: 14, fontWeight: 900 }}>✓</div>
                <p style={{ fontSize: 16, color: "#9ca3af", textDecoration: "line-through" }}>Estudiar compás 1 al 8</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 15 }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: "#10b981", display: "flex", alignItems: "center", justifyCenter: "center", color: "#ffffff", fontSize: 14, fontWeight: 900 }}>✓</div>
                <p style={{ fontSize: 16, color: "#9ca3af", textDecoration: "line-through" }}>Práctica con metrónomo 80bpm</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, border: "2px solid #4b5563" }} />
                <p style={{ fontSize: 16, color: "#e5e7eb", fontWeight: 700 }}>Grabar video de apoyo</p>
              </div>
            </div>

            {/* Biblioteca de Materiales */}
            <div style={{ marginTop: 35, borderTop: "1px solid #1f2937", paddingTop: 25 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1 }}>Material Adjunto</p>
              <div style={{ display: "flex", alignItems: "center", gap: 15, backgroundColor: "#1f2937", padding: 15, borderRadius: 16, marginTop: 15 }}>
                <span style={{ fontSize: 24 }}>📄</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#ffffff" }}>Paradiddles_Rutina.pdf</p>
                  <p style={{ fontSize: 11, color: "#9ca3af" }}>PDF · 1.2 MB</p>
                </div>
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* =======================================================================
          SLIDE 5: LLAMADO A LA ACCIÓN (Frames 720 - 900)
          ======================================================================= */}
      {frame >= 720 && (
        <AbsoluteFill
          style={{
            background: "radial-gradient(circle, #1e1b3a 0%, #0d0d12 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              backgroundColor: "#ffffff",
              color: "#0d0d12",
              borderRadius: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 60,
              fontWeight: 950,
              boxShadow: "0 20px 40px rgba(124, 58, 237, 0.3)",
              transform: `scale(${transitionSpring})`,
            }}
          >
            K
          </div>

          <h2
            style={{
              fontSize: 65,
              fontWeight: 950,
              marginTop: 40,
              textAlign: "center",
              color: "#ffffff",
              letterSpacing: "-0.02em",
              opacity: interpolate(slideProgress, [10, 40], [0, 1]),
            }}
          >
            Profesionaliza tu enseñanza musical hoy
          </h2>

          <p
            style={{
              fontSize: 28,
              color: "#a1a1aa",
              marginTop: 15,
              fontWeight: 500,
              opacity: interpolate(slideProgress, [30, 60], [0, 1]),
            }}
          >
            Prueba Khora completamente gratis
          </p>

          <div
            style={{
              marginTop: 50,
              backgroundColor: "#ffffff",
              color: "#0d0d12",
              fontSize: 32,
              fontWeight: 900,
              padding: "20px 50px",
              borderRadius: 24,
              boxShadow: "0 25px 50px -12px rgba(255, 255, 255, 0.15)",
              opacity: interpolate(slideProgress, [50, 80], [0, 1]),
            }}
          >
            khora.cl
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
