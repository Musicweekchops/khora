# 🚀 INICIO RÁPIDO - 5 Minutos

## Paso a Paso (Copia y pega cada comando)

### 1️⃣ Crear carpeta del proyecto
```bash
mkdir drum-school-management
cd drum-school-management
```

### 2️⃣ Inicializar proyecto Next.js
```bash
npx create-next-app@14.2.20 . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

**Responde:**
- Ok to proceed? → **Y**
- Would you like to use ESLint? → **Yes**

### 3️⃣ Instalar dependencias adicionales
```bash
npm install @prisma/client@5.21.1 next-auth@4.24.10 bcryptjs@2.4.3 zod@3.24.1
npm install -D prisma@5.21.1 @types/bcryptjs@2.4.6 tsx@4.19.2
```

### 4️⃣ Inicializar Prisma con SQLite
```bash
npx prisma init --datasource-provider sqlite
```

## 📁 Ahora copia los archivos que te compartí:

Reemplaza estos archivos con los que descargaste:

1. **prisma/schema.prisma** - Schema de la base de datos
2. **prisma/seed.ts** - Script de seed
3. **.env** - Variables de entorno
4. **package.json** - Dependencias (MERGE con el existente)

Crea estos archivos NUEVOS (no existen aún):

```
lib/
  ├── auth.ts
  ├── db.ts
  └── ...

app/
  ├── api/
  │   ├── auth/[...nextauth]/route.ts
  │   └── register/route.ts
  ├── login/page.tsx
  ├── register/page.tsx
  ├── dashboard/page.tsx
  ├── layout.tsx
  ├── page.tsx
  ├── providers.tsx
  └── globals.css

components/
  └── dashboard/
      ├── TeacherDashboard.tsx
      └── StudentDashboard.tsx

types/
  └── next-auth.d.ts
```

## ⚙️ Configurar Base de Datos

### 5️⃣ Generar Prisma Client
```bash
npm run prisma:generate
```

### 6️⃣ Crear base de datos
```bash
npm run prisma:migrate
```

Cuando pregunte nombre: escribe `init` y presiona Enter

### 7️⃣ Llenar con datos de prueba
```bash
npm run db:seed
```

## 🎉 Lanzar la aplicación

```bash
npm run dev
```

Abre: **http://localhost:3000**

## 🔐 Inicia sesión con:

**Profesor:**
- Email: `arnaldo@drumschool.com`
- Password: `password123`

**Alumno:**
- Email: `juan@example.com`
- Password: `password123`

---

## ❓ Si algo falla:

### "Cannot find module @prisma/client"
```bash
npm run prisma:generate
```

### "Database doesn't exist"  
```bash
npm run prisma:migrate
```

### Ver datos en la BD (GUI)
```bash
npm run prisma:studio
```

---

**¡Listo!** Ya tienes FASE 1 funcionando 🥁

Siguiente paso: Desarrollar CRUD de alumnos (FASE 2)
