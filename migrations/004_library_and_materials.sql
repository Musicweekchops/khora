-- 1. Tabla de Biblioteca de Contenidos
CREATE TABLE IF NOT EXISTS public."LibraryContent" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'link', -- 'link', 'video', 'pdf', 'image'
  url TEXT, -- Para enlaces externos (Drive, YouTube, etc.)
  file_path TEXT, -- Para archivos subidos a Supabase Storage
  category TEXT DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public."LibraryContent" ENABLE ROW LEVEL SECURITY;

-- Políticas: el profesor maneja su propia biblioteca
CREATE POLICY "lc_teacher_all" ON public."LibraryContent" FOR ALL USING (
  teacher_id IN (SELECT id FROM public."TeacherProfile" WHERE user_id = auth.uid())
);
CREATE POLICY "lc_anon_read" ON public."LibraryContent" FOR SELECT USING (true); -- Permitir lectura si es necesario para alumnos

-- 2. Modificar ClassNote para soportar adjuntos de la biblioteca
ALTER TABLE public."ClassNote" 
ADD COLUMN IF NOT EXISTS content_id UUID REFERENCES public."LibraryContent"(id) ON DELETE SET NULL;

-- 3. Modificar Task para soportar adjuntos de la biblioteca
ALTER TABLE public."Task" 
ADD COLUMN IF NOT EXISTS content_id UUID REFERENCES public."LibraryContent"(id) ON DELETE SET NULL;

-- 4. Nueva columna para "Asignaciones" que pueden tener fecha de vencimiento o similar si se requiere a futuro
-- Por ahora basta con content_id en Task.
