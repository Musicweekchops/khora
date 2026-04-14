# 🥁 Drum School Management - Setup Local

Sistema de gestión para clases de batería desarrollado con Next.js 14, TypeScript, Prisma y SQLite.

## 📋 Requisitos Previos

- Node.js 18+ instalado
- npm o yarn
- Editor de código (VSCode recomendado)

## 🚀 Instalación y Setup

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

El archivo `.env` ya está incluido con configuración local:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-key-super-segura-cambiala-en-produccion"
```

### 3. Generar Prisma Client

```bash
npm run prisma:generate
```

### 4. Crear la base de datos

```bash
npm run prisma:migrate
```

Cuando te pregunte por un nombre de migración, escribe: `init`

### 5. Poblar la base de datos con datos de prueba

```bash
npm run db:seed
```

Esto creará:
- ✅ Un profesor: `arnaldo@drumschool.com` / `password123`
- ✅ Un alumno: `juan@example.com` / `password123`
- ✅ Planes de precio (Clase de prueba $25k, Mensualidad $80k)
- ✅ Disponibilidad horaria (Lunes-Viernes 9am-6pm)
- ✅ Una clase de ejemplo
- ✅ Leads de ejemplo

### 6. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🎯 Credenciales de Prueba

### Profesor
- **Email:** `arnaldo@drumschool.com`
- **Password:** `password123`
- **Acceso:** Dashboard completo de gestión

### Alumno
- **Email:** `juan@example.com`
- **Password:** `password123`
- **Acceso:** Portal de alumno

## 📂 Estructura del Proyecto

```
drum-school-management/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── auth/            # NextAuth endpoints
│   │   └── register/        # Registro de usuarios
│   ├── dashboard/           # Dashboard (protegido)
│   ├── login/               # Página de login
│   ├── register/            # Página de registro
│   ├── layout.tsx           # Layout principal
│   ├── page.tsx             # Home (redirecciona)
│   └── globals.css          # Estilos globales
├── components/              # Componentes React
│   └── dashboard/           # Componentes del dashboard
├── lib/                     # Utilidades
│   ├── auth.ts             # Configuración NextAuth
│   └── db.ts               # Cliente Prisma
├── prisma/                  # Prisma ORM
│   ├── schema.prisma       # Schema de BD
│   └── seed.ts             # Script de seed
├── types/                   # Type definitions
└── public/                  # Archivos estáticos
```

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev                  # Iniciar servidor local
npm run build               # Build para producción
npm run start               # Iniciar servidor producción

# Base de Datos
npm run prisma:generate     # Generar Prisma Client
npm run prisma:migrate      # Crear/aplicar migraciones
npm run prisma:studio       # Abrir Prisma Studio (GUI)
npm run db:seed             # Poblar BD con datos

# Prisma Studio
npm run prisma:studio       # Ver y editar datos en GUI
```

## 🗄️ Base de Datos

### Ver datos en GUI (Prisma Studio)

```bash
npm run prisma:studio
```

Abre automáticamente en [http://localhost:5555](http://localhost:5555)

### Resetear base de datos

Si quieres empezar de cero:

```bash
rm prisma/dev.db           # Eliminar BD actual
npm run prisma:migrate     # Crear nueva BD
npm run db:seed            # Poblar con datos
```

## 📊 Estado Actual - FASE 1 Completada

### ✅ Implementado

- [x] Setup inicial del proyecto
- [x] Autenticación con NextAuth (email/password)
- [x] Base de datos SQLite con Prisma
- [x] Schema completo de BD (15 modelos)
- [x] Registro de usuarios
- [x] Login/Logout
- [x] Dashboard del profesor (estructura base)
- [x] Dashboard del alumno (estructura base)
- [x] Seed de datos de prueba

### 🚧 Próximos Pasos (FASE 2)

- [ ] CRUD completo de alumnos
- [ ] Gestión de clases (crear, editar, cancelar)
- [ ] Sistema de calendario
- [ ] Gestión de pagos
- [ ] CRM básico
- [ ] Dashboard financiero

## 🐛 Troubleshooting

### Error: "Cannot find module @prisma/client"
```bash
npm run prisma:generate
```

### Error: "Database doesn't exist"
```bash
npm run prisma:migrate
```

### Puerto 3000 ocupado
```bash
# Cambiar puerto
PORT=3001 npm run dev
```

## 📝 Notas de Desarrollo

- La BD es un archivo SQLite (`prisma/dev.db`)
- Todo es local, no requiere servicios externos
- Los cambios en el schema requieren nueva migración
- NextAuth usa JWT para sesiones (sin BD de sesiones)

## 🔐 Seguridad

## ☁️ Despliegue en Producción (Render + Supabase)

### 1. Base de Datos (Supabase)
1. Crea un proyecto en [Supabase](https://supabase.com).
2. Ve a **Project Settings > Database** y obtén las Connection Strings.
3. Copia la URL de modo **Transaction** (puerto 6543) para `DATABASE_URL`.
4. Copia la URL de modo **Session** (puerto 5432) para `DIRECT_URL`.

### 2. Despliegue (Render)
1. Crea un **New Blueprint Instance** en Render.
2. Vincula este repositorio.
3. Render detectará el archivo `render.yaml` y configurará todo automáticamente.
4. Asegúrate de configurar `DATABASE_URL` y `DIRECT_URL` en el dashboard de Render si no los pusiste en el blueprint.

---

**⚠️ IMPORTANTE:** Este es un setup de producción.

## 📚 Stack Tecnológico

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** SQLite (local) → PostgreSQL (producción)
- **ORM:** Prisma
- **Auth:** NextAuth.js
- **Styling:** Tailwind CSS
- **Deployment:** Render (futuro)

## 🎯 Roadmap

1. ✅ **FASE 1:** Setup y autenticación (COMPLETADA)
2. 🚧 **FASE 2:** CRUD de alumnos y clases (PRÓXIMA)
3. ⏳ **FASE 3:** Portal del alumno completo
4. ⏳ **FASE 4:** Automatizaciones y emails
5. ⏳ **FASE 5:** IA Agent con Claude
6. ⏳ **FASE 6:** WhatsApp Business API

---

**¿Necesitas ayuda?** Consulta el blueprint completo o pregunta lo que necesites.

🥁 ¡Empecemos a desarrollar!
