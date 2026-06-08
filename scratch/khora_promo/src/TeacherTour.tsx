import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
} from "remotion";
import React from "react";

const COLORS = {
  background: "#fafafa",
  surface: "#ffffff",
  border: "#e5e5e5",
  textPrimary: "#171717",
  textSecondary: "#737373",
  textTertiary: "#a3a3a3",
  violet: "#7c3aed",
  indigo: "#4f46e5",
  blue: "#2563eb",
  emerald: "#10b981",
  emeraldLight: "#f0fdf4",
  emeraldBorder: "#bbf7d0",
  emeraldText: "#166534",
  red: "#ef4444",
  amber: "#f59e0b",
  amberLight: "#fef3c7",
  amberText: "#92400e",
  sky: "#0ea5e9",
  skyLight: "#f0f9ff",
  skyText: "#0369a1",
  violetLight: "#f5f3ff",
  violetText: "#6d28d9",
};

export const TeacherTour = () => {
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

  // Animación del popover (Onboarding Bubble) que aparece un poco después de la página
  const popoverSpring = spring({
    frame: Math.max(0, slideProgress - 15),
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const fontStyle = {
    fontFamily: "Inter, system-ui, sans-serif",
  };

  const titleFontStyle = {
    fontFamily: "Outfit, Inter, system-ui, sans-serif",
  };

  // Determinar qué pestaña de navegación está activa en el mockup del celular
  const getActiveTab = (idx: number) => {
    if (idx === 0) return "home";
    if (idx === 1) return "alumnos";
    if (idx === 2) return "agenda";
    if (idx === 3) return "biblioteca";
    if (idx === 4) return "home"; // Financiero redirige a estadísticas de home/pagos
    if (idx === 5) return "ajustes";
    return "home";
  };

  const activeTab = getActiveTab(slideIndex);

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

      {/* Rejilla de fondo para redes sociales */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
          opacity: 0.8,
        }}
      />

      {/* Esfera de fondo suave para darle profundidad */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 800,
          backgroundColor: "rgba(124, 58, 237, 0.06)",
          borderRadius: "9999px",
          filter: "blur(120px)",
          pointerEvents: "none",
        }}
      />

      {/* Contenedor central (Mockups y Popover de guía) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          height: "100%",
          paddingTop: 180, // Aumentado para balancear la eliminación de los títulos superiores
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* =======================================================================
            MOCKUP DEL CELULAR GIGANTE (900PX) (CON NAVEGACIÓN Y PÁGINAS BLANCAS)
            ======================================================================= */}
        {slideIndex < 6 && (
          <div
            style={{
              width: 900,
              height: 820,
              backgroundColor: COLORS.surface,
              borderRadius: 36,
              border: `4px solid ${COLORS.violet}`,
              boxShadow: "0 30px 60px rgba(124, 58, 237, 0.15)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflow: "hidden",
              position: "relative",
              transform: `scale(${entrySpring})`,
            }}
          >
            {/* Barra de estado móvil superior */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, color: COLORS.textTertiary, padding: "20px 32px 0 32px" }}>
              <span>9:41</span>
              <span>📶 🛜 🔋</span>
            </div>

            {/* Cabecera de la Aplicación */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 32px", borderBottom: `2px solid #f3f4f6` }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.violet, color: "#ffffff", display: "flex", alignItems: "center", justifyCenter: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, ...titleFontStyle }}>K</div>
              <div>
                <h4 style={{ fontSize: 20, fontWeight: 900, color: COLORS.textPrimary, margin: 0 }}>Khora</h4>
                <p style={{ fontSize: 13, color: COLORS.textSecondary, fontWeight: 700, margin: 0 }}>Panel del Profesor</p>
              </div>
            </div>

            {/* AREA DE CONTENIDO DE LA PÁGINA */}
            <div style={{ flex: 1, padding: "28px 32px", overflow: "hidden", position: "relative" }}>
              
              {/* PÁGINA 1: DASHBOARD GENERAL (Slide 0) */}
              {slideIndex === 0 && (
                <div>
                  <h3 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 20px 0", letterSpacing: "-0.015em", ...titleFontStyle }}>Panel de Control</h3>
                  
                  {/* Tarjetas de estadísticas */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 24 }}>
                    <div style={{ backgroundColor: COLORS.violetLight, border: `2px solid rgba(124, 58, 237, 0.1)`, borderRadius: 18, padding: 18 }}>
                      <span style={{ fontSize: 28 }}>👥</span>
                      <p style={{ fontSize: 13, fontWeight: 800, color: COLORS.textSecondary, textTransform: "uppercase", margin: "10px 0 2px 0" }}>Alumnos</p>
                      <p style={{ fontSize: 24, fontWeight: 900, color: COLORS.textPrimary, margin: 0 }}>12 Activos</p>
                    </div>
                    <div style={{ backgroundColor: COLORS.skyLight, border: `2px solid rgba(14, 165, 233, 0.1)`, borderRadius: 18, padding: 18 }}>
                      <span style={{ fontSize: 28 }}>📅</span>
                      <p style={{ fontSize: 13, fontWeight: 800, color: COLORS.textSecondary, textTransform: "uppercase", margin: "10px 0 2px 0" }}>Clases Hoy</p>
                      <p style={{ fontSize: 24, fontWeight: 900, color: COLORS.textPrimary, margin: 0 }}>3 Clases</p>
                    </div>
                  </div>

                  {/* Tarjeta de ingresos del mes */}
                  <div style={{ backgroundColor: COLORS.emeraldLight, border: `2px solid ${COLORS.emeraldBorder}`, borderRadius: 18, padding: 22, marginBottom: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 800, color: COLORS.emeraldText, textTransform: "uppercase", margin: 0 }}>Ingresos del Mes</p>
                        <p style={{ fontSize: 34, fontWeight: 950, color: COLORS.emeraldText, margin: "6px 0 0 0", ...titleFontStyle }}>$450.000</p>
                      </div>
                      <span style={{ fontSize: 15, fontWeight: 850, color: COLORS.emeraldText, backgroundColor: "#ffffff", border: `1.5px solid ${COLORS.emeraldBorder}`, padding: "6px 12px", borderRadius: 20 }}>100% cobrado</span>
                    </div>
                  </div>

                  {/* Sección clases de hoy */}
                  <p style={{ fontSize: 13, fontWeight: 850, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 12px 0" }}>Próxima Clase</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 18, padding: 18, border: `2px solid ${COLORS.border}`, borderRadius: 20 }}>
                    <div style={{ width: 50, height: 50, borderRadius: 12, backgroundColor: COLORS.skyLight, color: COLORS.skyText, display: "flex", alignItems: "center", justifyCenter: "center", justifyContent: "center", fontSize: 16, fontWeight: 900 }}>11:30</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 18, fontWeight: 850, color: COLORS.textPrimary, margin: 0 }}>Sofía Pérez</p>
                      <p style={{ fontSize: 14, color: COLORS.textSecondary, fontWeight: 700, margin: "4px 0 0 0" }}>🎸 Guitarra · 📹 Virtual</p>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 900, color: COLORS.violetText, backgroundColor: COLORS.violetLight, padding: "6px 12px", borderRadius: 20 }}>Confirmada</span>
                  </div>
                </div>
              )}

              {/* PÁGINA 2: DIRECTORIO DE ALUMNOS (Slide 1) */}
              {slideIndex === 1 && (
                <div>
                  <h3 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 20px 0", letterSpacing: "-0.015em", ...titleFontStyle }}>Mis Alumnos</h3>
                  
                  {/* Buscador ficticio */}
                  <div style={{ backgroundColor: "#f5f5f5", border: `2px solid ${COLORS.border}`, borderRadius: 16, padding: "14px 18px", fontSize: 16, color: COLORS.textTertiary, fontWeight: 700, display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <span>🔍</span> Buscar alumno...
                  </div>

                  {/* Listado de alumnos */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {[
                      { name: "Sofía Pérez", inst: "🎸 Guitarra", tag: "Mensual", bg: COLORS.emeraldLight, text: COLORS.emeraldText },
                      { name: "Lucas Gómez", inst: "🥁 Batería", tag: "Clase Prueba", bg: COLORS.amberLight, text: COLORS.amberText },
                      { name: "Daniel Ortega", inst: "🎹 Piano", tag: "Mensual", bg: COLORS.emeraldLight, text: COLORS.emeraldText }
                    ].map((st) => (
                      <div key={st.name} style={{ display: "flex", alignItems: "center", padding: 16, border: `2px solid #f3f4f6`, borderRadius: 18, backgroundColor: COLORS.surface }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
                          <div style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: "#fafafa", border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyCenter: "center", justifyContent: "center", fontSize: 18, fontWeight: 900 }}>{st.name.charAt(0)}</div>
                          <div>
                            <p style={{ fontSize: 18, fontWeight: 850, color: COLORS.textPrimary, margin: 0 }}>{st.name}</p>
                            <p style={{ fontSize: 14, color: COLORS.textSecondary, fontWeight: 700, margin: "4px 0 0 0" }}>{st.inst}</p>
                          </div>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 900, color: st.text, backgroundColor: st.bg, padding: "6px 12px", borderRadius: 20 }}>{st.tag}</span>
                      </div>
                    ))}
                  </div>

                  {/* Botón agregar alumno */}
                  <div style={{ marginTop: 24, backgroundColor: COLORS.textPrimary, color: "#ffffff", padding: "18px 0", borderRadius: 16, textAlign: "center", fontSize: 18, fontWeight: 900 }}>
                    + Registrar Nuevo Alumno
                  </div>
                </div>
              )}

              {/* PÁGINA 3: AGENDA / HORARIOS (Slide 2) */}
              {slideIndex === 2 && (
                <div>
                  <h3 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 20px 0", letterSpacing: "-0.015em", ...titleFontStyle }}>Mi Agenda</h3>

                  {/* Selector de días */}
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 20 }}>
                    {[
                      { d: "L", n: 8, active: true },
                      { d: "M", n: 9 },
                      { d: "M", n: 10 },
                      { d: "J", n: 11 },
                      { d: "V", n: 12 }
                    ].map(day => (
                      <div key={day.n} style={{ flex: 1, backgroundColor: day.active ? COLORS.violet : "transparent", color: day.active ? "#ffffff" : COLORS.textPrimary, border: day.active ? `2px solid ${COLORS.violet}` : `2px solid ${COLORS.border}`, borderRadius: 16, padding: "10px 0", textAlign: "center", display: "flex", flexDirection: "column", gap: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, opacity: day.active ? 0.9 : 0.6 }}>{day.d}</span>
                        <span style={{ fontSize: 20, fontWeight: 950 }}>{day.n}</span>
                      </div>
                    ))}
                  </div>

                  {/* Bloques de agenda */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {[
                      { time: "09:30 hs", student: "Sofía Pérez", type: "Clase Regular", badgeBg: COLORS.violetLight, badgeText: COLORS.violetText },
                      { time: "11:30 hs", student: "Lucas Gómez", type: "Clase Prueba", badgeBg: COLORS.amberLight, badgeText: COLORS.amberText },
                      { time: "15:00 hs", student: "Daniel Ortega", type: "Clase Regular", badgeBg: COLORS.violetLight, badgeText: COLORS.violetText }
                    ].map(block => (
                      <div key={block.time} style={{ display: "flex", alignItems: "center", padding: 16, border: `2px solid #f3f4f6`, borderRadius: 18, backgroundColor: COLORS.surface }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
                          <span style={{ fontSize: 16, fontWeight: 900, color: COLORS.textSecondary }}>{block.time}</span>
                          <div>
                            <p style={{ fontSize: 18, fontWeight: 850, color: COLORS.textPrimary, margin: 0 }}>{block.student}</p>
                          </div>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 900, color: block.badgeText, backgroundColor: block.badgeBg, padding: "6px 12px", borderRadius: 20, textTransform: "uppercase" }}>{block.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PÁGINA 4: BIBLIOTECA (Slide 3) */}
              {slideIndex === 3 && (
                <div>
                  <h3 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 20px 0", letterSpacing: "-0.015em", ...titleFontStyle }}>Biblioteca</h3>

                  {/* Listado de archivos cargados */}
                  <p style={{ fontSize: 13, fontWeight: 850, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 12px 0" }}>Materiales Asignables</p>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {[
                      { icon: "📄", name: "Rutina_Independencia.pdf", label: "Guitarra", count: "Asignado a 4 alumnos" },
                      { icon: "📹", name: "HiHat_Funk_Beat.mp4", label: "Batería", count: "Asignado a 2 alumnos" },
                      { icon: "📄", name: "Ejercicios_Lectura.pdf", label: "Teclado", count: "Asignado a 5 alumnos" }
                    ].map(file => (
                      <div key={file.name} style={{ display: "flex", alignItems: "center", gap: 16, padding: 16, border: `2px solid #f3f4f6`, borderRadius: 18, backgroundColor: COLORS.surface }}>
                        <span style={{ fontSize: 34 }}>{file.icon}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 17, fontWeight: 850, color: COLORS.textPrimary, margin: 0 }}>{file.name}</p>
                          <p style={{ fontSize: 14, color: COLORS.textSecondary, fontWeight: 700, margin: "4px 0 0 0" }}>{file.count} · <span style={{ color: COLORS.violetText }}>{file.label}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Botón de subida rápida */}
                  <div style={{ marginTop: 20, border: "3px dashed #d1d5db", borderRadius: 18, padding: "20px 0", textAlign: "center" }}>
                    <span style={{ fontSize: 22, display: "block" }}>📤</span>
                    <span style={{ fontSize: 13, fontWeight: 850, color: COLORS.textSecondary, textTransform: "uppercase", display: "block", marginTop: 6 }}>Subir material de estudio</span>
                  </div>
                </div>
              )}

              {/* PÁGINA 5: FINANCIERO (Slide 4) */}
              {slideIndex === 4 && (
                <div>
                  <h3 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 20px 0", letterSpacing: "-0.015em", ...titleFontStyle }}>Finanzas</h3>

                  {/* Resumen mensual */}
                  <div style={{ backgroundColor: COLORS.emeraldLight, border: `2px solid ${COLORS.emeraldBorder}`, borderRadius: 18, padding: 18, marginBottom: 20 }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: COLORS.emeraldText, textTransform: "uppercase", margin: 0 }}>Ingresos Recaudados</p>
                    <p style={{ fontSize: 36, fontWeight: 950, color: COLORS.emeraldText, margin: "6px 0 0 0", ...titleFontStyle }}>$450.000</p>
                    <div style={{ width: "100%", height: 10, backgroundColor: "rgba(16, 185, 129, 0.15)", borderRadius: 10, marginTop: 12, overflow: "hidden" }}>
                      <div style={{ width: "100%", height: "100%", backgroundColor: COLORS.emerald }} />
                    </div>
                    <p style={{ fontSize: 13, color: COLORS.emeraldText, fontWeight: 800, textAlign: "right", margin: "8px 0 0 0" }}>100% al día</p>
                  </div>

                  {/* Últimos cobros */}
                  <p style={{ fontSize: 13, fontWeight: 850, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 12px 0" }}>Últimos Pagos Registrados</p>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {[
                      { name: "Sofía Pérez", date: "Hoy, 10:30 AM", amount: "$45.000", method: "Transferencia 💸" },
                      { name: "Daniel Ortega", date: "Ayer, 18:22 PM", amount: "$45.000", method: "Mercado Pago 💳" }
                    ].map(pay => (
                      <div key={pay.name} style={{ display: "flex", alignItems: "center", padding: 16, border: `2px solid #f3f4f6`, borderRadius: 18, backgroundColor: COLORS.surface }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 17, fontWeight: 850, color: COLORS.textPrimary, margin: 0 }}>{pay.name}</p>
                          <p style={{ fontSize: 14, color: COLORS.textSecondary, fontWeight: 700, margin: "4px 0 0 0" }}>{pay.date} · {pay.method}</p>
                        </div>
                        <span style={{ fontSize: 18, fontWeight: 950, color: COLORS.emerald }}>+{pay.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PÁGINA 6: CONFIGURACIÓN / LINK PÚBLICO (Slide 5) */}
              {slideIndex === 5 && (
                <div>
                  <h3 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 20px 0", letterSpacing: "-0.015em", ...titleFontStyle }}>Configuración</h3>

                  {/* Link público */}
                  <div style={{ backgroundColor: "#fafafa", border: `2px solid ${COLORS.border}`, borderRadius: 20, padding: 22, marginBottom: 20 }}>
                    <p style={{ fontSize: 13, fontWeight: 850, color: COLORS.textSecondary, textTransform: "uppercase", margin: 0 }}>Tu Dirección de Agendamiento</p>
                    <p style={{ fontSize: 20, fontWeight: 900, color: COLORS.violetText, margin: "8px 0 0 0" }}>khora.cl/agendar/pedro</p>
                    
                    <div style={{ display: "flex", gap: 14, marginTop: 18 }}>
                      <div style={{ flex: 1, backgroundColor: COLORS.surface, border: `2px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 0", textAlign: "center", fontSize: 13, fontWeight: 900, color: COLORS.textPrimary }}>🔗 Copiar Link</div>
                      <div style={{ flex: 1, backgroundColor: COLORS.surface, border: `2px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 0", textAlign: "center", fontSize: 13, fontWeight: 900, color: COLORS.textPrimary }}>👁️ Ver Landing</div>
                    </div>
                  </div>

                  {/* Otras opciones */}
                  <p style={{ fontSize: 13, fontWeight: 850, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 12px 0" }}>Preferencias</p>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", border: `2px solid #f3f4f6`, borderRadius: 14 }}>
                      <span style={{ fontSize: 16, fontWeight: 700 }}>Especialidades: Guitarra, Piano</span>
                      <span style={{ fontSize: 14, color: COLORS.textTertiary }}>✏️</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", border: `2px solid #f3f4f6`, borderRadius: 14 }}>
                      <span style={{ fontSize: 16, fontWeight: 700 }}>Pasarela Mercado Pago: Activada</span>
                      <span style={{ fontSize: 14, color: COLORS.emerald }}>🟢</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Barra de navegación inferior móvil (Escalada) */}
            <div style={{ borderTop: `2px solid #f3f4f6`, padding: "18px 24px", display: "flex", justifyContent: "space-around", backgroundColor: COLORS.surface }}>
              {[
                { key: "home", label: "Inicio", icon: "🏠" },
                { key: "alumnos", label: "Alumnos", icon: "👥" },
                { key: "agenda", label: "Agenda", icon: "📅" },
                { key: "biblioteca", label: "Biblioteca", icon: "📚" },
                { key: "ajustes", label: "Ajustes", icon: "⚙️" }
              ].map(tab => {
                const isActive = activeTab === tab.key;
                return (
                  <div key={tab.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 28, color: isActive ? COLORS.violet : COLORS.textTertiary }}>{tab.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 850, textTransform: "uppercase", color: isActive ? COLORS.violet : COLORS.textTertiary }}>{tab.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =======================================================================
            ONBOARDING TOUR POPOVER CARD GIGANTE (900PX) (Simulando Driver.js en Blanco con descripciones)
            ======================================================================= */}
        {slideIndex < 6 && (
          <div
            style={{
              width: 900,
              backgroundColor: "rgba(255, 255, 255, 0.96)",
              backdropFilter: "blur(12px)",
              border: `2.5px solid ${COLORS.border}`,
              borderRadius: 24,
              padding: "24px 28px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.08)",
              marginTop: 24,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transform: `scale(${popoverSpring})`,
              opacity: interpolate(slideProgress, [15, 30], [0, 1], { extrapolateLeft: "clamp" }),
            }}
          >
            {/* Popover Title & Close */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h4 style={{ fontSize: 26, fontWeight: 950, color: COLORS.textPrimary, margin: 0, letterSpacing: "-0.015em", ...titleFontStyle }}>
                {slideIndex === 0 && "🥁 ¡Te damos la bienvenida!"}
                {slideIndex === 1 && "👥 Directorio de Alumnos"}
                {slideIndex === 2 && "📅 Tu Agenda Semanal"}
                {slideIndex === 3 && "📚 Biblioteca Digital"}
                {slideIndex === 4 && "💰 Módulo Financiero"}
                {slideIndex === 5 && "⚙️ Ajustes y Link de Reserva"}
              </h4>
              <span style={{ fontSize: 14, color: COLORS.violetText, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.5, backgroundColor: COLORS.violetLight, padding: "6px 12px", borderRadius: 8 }}>
                Paso {slideIndex + 1} de 6
              </span>
            </div>

            {/* Popover Description */}
            <p style={{ fontSize: 18, color: COLORS.textSecondary, fontWeight: 600, lineHeight: 1.6, margin: "0 0 20px 0" }}>
              {slideIndex === 0 && "Tu centro de control definitivo. Te guiaremos por las herramientas clave para gestionar tus clases particulares y tus alumnos."}
              {slideIndex === 1 && "El corazón de tu gestión. Registra nuevos estudiantes, revisa sus fichas de avance, agenda mensualidades y mantén contacto directo."}
              {slideIndex === 2 && "Organiza tus horarios de clase semanales, define tus bloques no laborables y visualiza las reservas de tus alumnos al instante."}
              {slideIndex === 3 && "Sube partituras, tablaturas, ejercicios de práctica y PDFs para compartirlos directamente con el perfil de cada alumno."}
              {slideIndex === 4 && "Lera tus cuentas de forma transparente. Registra pagos manuales, cobros de Mercado Pago y visualiza el balance del mes."}
              {slideIndex === 5 && "Define tus especialidades musicales y copia tu link público. Tus alumnos podrán agendar clases de prueba al instante."}
            </p>

            {/* Popover Footer Buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: COLORS.textTertiary }}>
                Khora Guía Rápida
              </span>
              <div style={{ backgroundColor: COLORS.violet, color: "#ffffff", padding: "10px 20px", borderRadius: 12, fontSize: 16, fontWeight: 800 }}>
                Siguiente →
              </div>
            </div>
          </div>
        )}

        {/* =======================================================================
            SLIDE 7: CTA FINAL (26s - 30s / Frames 780 - 900)
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
            {/* Logo K de Khora */}
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
                boxShadow: "0 25px 50px rgba(124, 58, 237, 0.2)",
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
                color: COLORS.textPrimary,
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
              Crea tu cuenta de profesor gratis
            </p>

            <div
              style={{
                marginTop: 65,
                backgroundColor: COLORS.violet,
                color: "#ffffff",
                fontSize: 52,
                fontWeight: 950,
                padding: "24px 65px",
                borderRadius: 24,
                boxShadow: "0 25px 45px rgba(124, 58, 237, 0.3)",
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
      </div>
    </AbsoluteFill>
  );
};
