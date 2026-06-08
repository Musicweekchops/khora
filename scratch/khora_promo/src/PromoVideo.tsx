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

  // Animación base para transiciones entre slides (cada 150 frames = 5 segundos)
  const slideIndex = Math.floor(frame / 150);
  const slideProgress = frame % 150;

  // Spring base para movimientos suaves
  const transitionSpring = spring({
    frame: slideProgress,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const fontStyle = {
    fontFamily: "Outfit, Inter, system-ui, sans-serif",
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#08070b",
        color: "#ffffff",
        overflow: "hidden",
        ...fontStyle,
      }}
    >
      {/* =======================================================================
          SLIDE 1: EL DOLOR (0s - 5s / Frames 0 - 150)
          ======================================================================= */}
      {frame < 150 && (
        <AbsoluteFill
          style={{
            background: "radial-gradient(circle at center, #3c1515 0%, #08070b 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 80px",
            textAlign: "center",
          }}
        >
          {/* Alerta inicial */}
          <span
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              color: "#f87171",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              fontSize: 22,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 3,
              padding: "10px 24px",
              borderRadius: 99,
              opacity: interpolate(frame, [0, 15], [0, 1]),
              transform: `translateY(${interpolate(frame, [0, 15], [-20, 0], { extrapolateRight: "clamp" })}px)`,
            }}
          >
            ¿Haces clases de música?
          </span>

          <h1
            style={{
              fontSize: 70,
              fontWeight: 950,
              lineHeight: 1.1,
              marginTop: 40,
              letterSpacing: "-0.03em",
              color: "#ffffff",
              transform: `scale(${interpolate(frame, [10, 30], [0.85, 1], {
                extrapolateRight: "clamp",
              })})`,
              opacity: interpolate(frame, [10, 30], [0, 1]),
            }}
          >
            ¿Sigues coordinando por chats y cuadernos?
          </h1>

          {/* Elementos caóticos flotantes */}
          <div
            style={{
              display: "flex",
              gap: 30,
              marginTop: 60,
              fontSize: 90,
              opacity: interpolate(frame, [30, 60], [0, 1]),
            }}
          >
            <span style={{ transform: `rotate(-15deg) translateY(${Math.sin(frame * 0.08) * 10}px)` }}>📝</span>
            <span style={{ transform: `rotate(10deg) translateY(${Math.cos(frame * 0.08) * 10}px)` }}>💬</span>
            <span style={{ transform: `rotate(-5deg) translateY(${Math.sin(frame * 0.06) * 12}px)` }}>🤯</span>
            <span style={{ transform: `rotate(20deg) translateY(${Math.cos(frame * 0.06) * 12}px)` }}>❌</span>
          </div>
        </AbsoluteFill>
      )}

      {/* =======================================================================
          SLIDE 2: EL PROBLEMA (5s - 10s / Frames 150 - 300)
          ======================================================================= */}
      {frame >= 150 && frame < 300 && (
        <AbsoluteFill
          style={{
            background: "radial-gradient(circle at center, #2e1010 0%, #08070b 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 80px",
          }}
        >
          <h2
            style={{
              fontSize: 55,
              fontWeight: 900,
              color: "#fca5a5",
              textAlign: "center",
              lineHeight: 1.2,
              marginBottom: 60,
              opacity: interpolate(slideProgress, [0, 20], [0, 1]),
            }}
          >
            El desorden te cuesta tiempo y dinero:
          </h2>

          {/* Lista de dolores que aparecen secuencialmente */}
          <div style={{ width: "100%", spaceY: 30, display: "flex", flexDirection: "column", gap: 30 }}>
            {/* Dolor 1 */}
            <div
              style={{
                backgroundColor: "#181313",
                border: "1px solid #3c1a1a",
                borderRadius: 24,
                padding: 30,
                display: "flex",
                alignItems: "center",
                gap: 25,
                transform: `translateX(${interpolate(slideProgress, [20, 40], [-100, 0], { extrapolateRight: "clamp" })}px)`,
                opacity: interpolate(slideProgress, [20, 40], [0, 1]),
              }}
            >
              <span style={{ fontSize: 45 }}>💸</span>
              <p style={{ fontSize: 28, fontWeight: 700, color: "#fca5a5" }}>
                Alumnos que olvidan pagar a fin de mes.
              </p>
            </div>

            {/* Dolor 2 */}
            <div
              style={{
                backgroundColor: "#181313",
                border: "1px solid #3c1a1a",
                borderRadius: 24,
                padding: 30,
                display: "flex",
                alignItems: "center",
                gap: 25,
                transform: `translateX(${interpolate(slideProgress, [40, 60], [100, 0], { extrapolateRight: "clamp" })}px)`,
                opacity: interpolate(slideProgress, [40, 60], [0, 1]),
              }}
            >
              <span style={{ fontSize: 45 }}>📄</span>
              <p style={{ fontSize: 28, fontWeight: 700, color: "#fca5a5" }}>
                Partituras y videos perdidos en el chat.
              </p>
            </div>

            {/* Dolor 3 */}
            <div
              style={{
                backgroundColor: "#181313",
                border: "1px solid #3c1a1a",
                borderRadius: 24,
                padding: 30,
                display: "flex",
                alignItems: "center",
                gap: 25,
                transform: `translateX(${interpolate(slideProgress, [60, 80], [-100, 0], { extrapolateRight: "clamp" })}px)`,
                opacity: interpolate(slideProgress, [60, 80], [0, 1]),
              }}
            >
              <span style={{ fontSize: 45 }}>📅</span>
              <p style={{ fontSize: 28, fontWeight: 700, color: "#fca5a5" }}>
                Coordinación caótica de reprogramaciones.
              </p>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* =======================================================================
          SLIDE 3: LA SOLUCIÓN - KHORA (10s - 15s / Frames 300 - 450)
          ======================================================================= */}
      {frame >= 300 && frame < 450 && (
        <AbsoluteFill
          style={{
            background: "radial-gradient(circle at center, #2e1c4e 0%, #08070b 100%)",
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
              width: 160,
              height: 160,
              backgroundColor: "#ffffff",
              color: "#08070b",
              borderRadius: 45,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 90,
              fontWeight: 950,
              boxShadow: "0 25px 50px rgba(139, 92, 246, 0.4)",
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
              fontSize: 75,
              fontWeight: 950,
              marginTop: 60,
              lineHeight: 1.1,
              background: "linear-gradient(to right, #c084fc, #818cf8)",
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
              color: "#e4e4e7",
              fontWeight: 600,
              marginTop: 25,
              lineHeight: 1.3,
              opacity: interpolate(slideProgress, [40, 70], [0, 1]),
            }}
          >
            Todo tu control de clases, pagos y biblioteca en un solo lugar.
          </p>
        </AbsoluteFill>
      )}

      {/* =======================================================================
          SLIDE 4: HIGHLIGHT 1 - BIBLIOTECA (15s - 20s / Frames 450 - 600)
          ======================================================================= */}
      {frame >= 450 && frame < 600 && (
        <AbsoluteFill
          style={{
            background: "radial-gradient(circle at center, #182236 0%, #08070b 100%)",
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
                backgroundColor: "rgba(129, 140, 248, 0.15)",
                color: "#93c5fd",
                border: "1px solid rgba(129, 140, 248, 0.3)",
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
              Materiales Compartidos
            </h3>
            <p style={{ fontSize: 26, color: "#9ca3af", marginTop: 15, lineHeight: 1.4 }}>
              Asigna partituras, audios y videos directamente al perfil de cada alumno.
            </p>
          </div>

          {/* Tarjeta de simulación de biblioteca */}
          <div
            style={{
              width: "100%",
              backgroundColor: "#111827",
              borderRadius: 32,
              border: "1px solid #1f2937",
              padding: 35,
              boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
              transform: `translateY(${interpolate(slideProgress, [0, 40], [150, 0], { extrapolateRight: "clamp" })}px)`,
              opacity: interpolate(slideProgress, [0, 40], [0, 1]),
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              {/* Item 1 */}
              <div style={{ display: "flex", alignItems: "center", gap: 20, backgroundColor: "#1f2937", padding: 18, borderRadius: 16 }}>
                <span style={{ fontSize: 35 }}>📄</span>
                <div>
                  <p style={{ fontSize: 18, fontWeight: 800, color: "#ffffff" }}>Rutina_Semicorcheas.pdf</p>
                  <p style={{ fontSize: 13, color: "#9ca3af" }}>PDF · 1.5 MB</p>
                </div>
              </div>
              {/* Item 2 */}
              <div style={{ display: "flex", alignItems: "center", gap: 20, backgroundColor: "#1f2937", padding: 18, borderRadius: 16 }}>
                <span style={{ fontSize: 35 }}>📹</span>
                <div>
                  <p style={{ fontSize: 18, fontWeight: 800, color: "#ffffff" }}>Video_AcentoHiHat.mp4</p>
                  <p style={{ fontSize: 13, color: "#9ca3af" }}>Video · 12.4 MB</p>
                </div>
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* =======================================================================
          SLIDE 5: HIGHLIGHT 2 - PAGOS (20s - 25s / Frames 600 - 750)
          ======================================================================= */}
      {frame >= 600 && frame < 750 && (
        <AbsoluteFill
          style={{
            background: "radial-gradient(circle at center, #102a22 0%, #08070b 100%)",
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
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                color: "#34d399",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                fontSize: 18,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 2,
                padding: "8px 20px",
                borderRadius: 99,
              }}
            >
              Finanzas Claras
            </span>
            <h3 style={{ fontSize: 62, fontWeight: 950, marginTop: 25, letterSpacing: "-0.02em" }}>
              Control de Pagos
            </h3>
            <p style={{ fontSize: 26, color: "#9ca3af", marginTop: 15, lineHeight: 1.4 }}>
              Ingresos mensuales, deudas y cobros automáticos en un vistazo.
            </p>
          </div>

          {/* Tarjeta de simulación de pagos */}
          <div
            style={{
              width: "100%",
              backgroundColor: "#060f0e",
              borderRadius: 32,
              border: "1px solid #112c24",
              padding: 35,
              boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
              transform: `translateY(${interpolate(slideProgress, [0, 40], [150, 0], { extrapolateRight: "clamp" })}px)`,
              opacity: interpolate(slideProgress, [0, 40], [0, 1]),
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 900, color: "#10b981", letterSpacing: 1, textTransform: "uppercase" }}>
              Resumen Financiero
            </p>
            <p style={{ fontSize: 45, fontWeight: 950, color: "#ffffff", marginTop: 15 }}>
              $450.000 <span style={{ fontSize: 20, fontWeight: 500, color: "#10b981" }}>+12%</span>
            </p>
            <p style={{ fontSize: 14, color: "#9ca3af", marginTop: 5 }}>Recaudado este mes</p>
            
            <div style={{ display: "flex", gap: 15, marginTop: 30 }}>
              <div style={{ flex: 1, backgroundColor: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: 15, borderRadius: 16 }}>
                <p style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700 }}>PAGADOS</p>
                <p style={{ fontSize: 22, fontWeight: 900, color: "#34d399", marginTop: 5 }}>12 alumnos</p>
              </div>
              <div style={{ flex: 1, backgroundColor: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", padding: 15, borderRadius: 16 }}>
                <p style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700 }}>PENDIENTES</p>
                <p style={{ fontSize: 22, fontWeight: 900, color: "#f87171", marginTop: 5 }}>1 por pagar</p>
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* =======================================================================
          SLIDE 6: CIERRE / CTA (25s - 30s / Frames 750 - 900)
          ======================================================================= */}
      {frame >= 750 && (
        <AbsoluteFill
          style={{
            background: "radial-gradient(circle at center, #231b40 0%, #08070b 100%)",
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
              width: 130,
              height: 130,
              backgroundColor: "#ffffff",
              color: "#08070b",
              borderRadius: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 75,
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
              marginTop: 50,
              lineHeight: 1.1,
              color: "#ffffff",
              letterSpacing: "-0.03em",
              opacity: interpolate(slideProgress, [15, 45], [0, 1]),
            }}
          >
            Profesionaliza tu escuela hoy
          </h2>

          <p
            style={{
              fontSize: 32,
              color: "#a1a1aa",
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
              backgroundColor: "#ffffff",
              color: "#08070b",
              fontSize: 36,
              fontWeight: 950,
              padding: "22px 60px",
              borderRadius: 24,
              boxShadow: "0 30px 60px rgba(255, 255, 255, 0.15)",
              transform: `scale(${interpolate(slideProgress, [55, 80], [0.8, 1], {
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
