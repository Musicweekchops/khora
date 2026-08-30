const fs = require('fs');
const file = '/Users/arnaldoallende/Documents/GitHub/khora/app/agendar/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Change initial flowType to "nuevo"
content = content.replace(
  'const [flowType, setFlowType] = useState<"regular" | "nuevo" | null>(null)',
  'const [flowType, setFlowType] = useState<"regular" | "nuevo" | "login" | null>("nuevo")'
);

// 2. Add Login button to Header Block
content = content.replace(
  '{/* Stepper Progress Indicator */}',
  `{/* Login button for regular students */}
        {!profile && flowType === "nuevo" && (
          <div className="absolute top-4 right-4 z-50">
            <button 
              onClick={() => setFlowType("login")}
              className="text-[10px] font-black text-neutral-400 hover:text-violet-600 uppercase tracking-widest bg-white border border-neutral-200 px-3 py-1.5 rounded-full shadow-sm transition-all flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" /> Acceso Alumnos
            </button>
          </div>
        )}

        {/* Stepper Progress Indicator */}`
);

// 3. Re-route flowType === "login" to the inline login form
content = content.replace(
  '{/* FLOW: ALUMNO REGULAR */}',
  `{/* FLOW: LOGIN / ALUMNO REGULAR */}
            {flowType === "login" && !profile && (
              <div className="space-y-6">
                <button
                  onClick={() => setFlowType("nuevo")}
                  className="inline-flex items-center gap-2 text-xs font-black text-neutral-400 hover:text-violet-600 uppercase tracking-wider transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Volver al Agendamiento
                </button>
                <div className="max-w-md mx-auto bg-white border border-neutral-200 rounded-3xl p-8 shadow-md">
                  <div className="text-center">
                    <LogIn className="w-10 h-10 text-violet-400 mx-auto mb-3" />
                    <h2 className="text-lg font-black text-neutral-900 uppercase tracking-wider">Acceso Alumnos</h2>
                    <p className="text-xs text-neutral-500 mt-1">Gestiona, re-agenda o cancela tus reservas</p>
                  </div>
                  <form onSubmit={handleInlineLogin} className="space-y-4 mt-6">
                    <div>
                      <label className="kh-label block text-[10px] text-neutral-400">Nombre</label>
                      <input type="text" required value={loginEmailOrName} onChange={e => setLoginEmailOrName(e.target.value)} className="kh-input bg-white border-neutral-200 text-neutral-900" placeholder="Tu nombre" />
                    </div>
                    <div>
                      <label className="kh-label block text-[10px] text-neutral-400">Contraseña</label>
                      <input type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="kh-input bg-white border-neutral-200 text-neutral-900" placeholder="••••••••" />
                    </div>
                    <button type="submit" disabled={loggingIn} className="w-full py-3.5 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-black uppercase tracking-wider border border-violet-500 flex items-center justify-center gap-2">
                      {loggingIn ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Ingresar"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* FLOW: ALUMNO REGULAR */}`
);

// 4. Clean up old inline login form from "regular" block
content = content.replace(
  /{!profile \? \([\s\S]*?\) : \(\s*\/\/ Logged-in regular student view/,
  `{!profile ? null : (
                  // Logged-in regular student view`
);

// 5. Remove "Volver al inicio" button from nuevo flow that sets flowType to null
content = content.replace(
  'setFlowType(null);',
  '/* removed setFlowType(null) to keep user in nuevo */'
);
content = content.replace(
  '<ArrowLeft className="w-4 h-4" /> Volver al inicio',
  '<ArrowLeft className="w-4 h-4" /> Empezar de nuevo'
);

// 6. Remove Password input from Guest Input Data
content = content.replace(
  /<div>\s*<label className="kh-label block text-\[10px\] text-neutral-400">Crea tu contraseña[\s\S]*?<\/div>/,
  ''
);

// 7. Remove create-student logic from handleSubmit
const createStudentLogic = `if (!formData.name || !formData.email || !formData.phone || !loginPassword) {
          throw new Error("Por favor completa todos tus datos de contacto y crea una contraseña.")
        }
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        const cleanEmail = formData.email.trim().toLowerCase()
        const cleanPhone = formData.phone.trim()

        const createRes = await fetch(\`\${supabaseUrl}/functions/v1/create-student\`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": anonKey || "",
            "Authorization": \`Bearer \${anonKey}\`
          },
          body: JSON.stringify({
            email: cleanEmail,
            password: loginPassword.trim(),
            name: formData.name.trim(),
            phone: cleanPhone,
            teacher_id: selectedTeacher.id
          })
        })

        const edgeData = await createRes.json()
        if (!createRes.ok || edgeData?.error) {
          throw new Error(edgeData?.error || "Error al crear la cuenta. Intenta con otro correo.")
        }

        studentUserId = edgeData.userId

        // Log in to gain credentials
        const loginRes = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: loginPassword.trim()
        })

        if (loginRes.error) throw loginRes.error

        // Update StudentProfile preferred settings
        const dayNames = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]
        const dayOfWeekNum = new Date(formData.date + "T12:00").getDay()
        const prefDayStr = dayNames[dayOfWeekNum]

        await supabase
          .from("StudentProfile")
          .update({
            modalidad: formData.message || "online",
            preferred_day: prefDayStr,
            preferred_time: selectedSlot,
            status: "TRIAL",
            lead_source: "WEBSITE"
          })
          .eq("user_id", studentUserId)`;

const newValidationLogic = `if (!formData.name || !formData.email || !formData.phone) {
          throw new Error("Por favor completa todos tus datos de contacto.")
        }`;

content = content.replace(createStudentLogic, newValidationLogic);

fs.writeFileSync(file, content);
console.log("Patched page.tsx successfully!");
