-- Migration 023: Landing CMS
-- 1. Crear tabla para configuraciones generales de la Landing Page
CREATE TABLE IF NOT EXISTS public."LandingSetting" (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Crear tabla para las recomendaciones / testimonios de profesores
CREATE TABLE IF NOT EXISTS public."LandingTestimonial" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    comment TEXT NOT NULL,
    avatar_url TEXT,
    rating INTEGER DEFAULT 5,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Habilitar RLS en ambas tablas
ALTER TABLE public."LandingSetting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."LandingTestimonial" ENABLE ROW LEVEL SECURITY;

-- 4. Limpiar políticas existentes para evitar colisiones
DROP POLICY IF EXISTS "Anyone can view landing settings" ON public."LandingSetting";
DROP POLICY IF EXISTS "Admins can manage landing settings" ON public."LandingSetting";
DROP POLICY IF EXISTS "Anyone can view landing testimonials" ON public."LandingTestimonial";
DROP POLICY IF EXISTS "Admins can manage landing testimonials" ON public."LandingTestimonial";

-- 5. Crear políticas de lectura pública (para visitantes de la Landing Page)
CREATE POLICY "Anyone can view landing settings" ON public."LandingSetting"
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view landing testimonials" ON public."LandingTestimonial"
    FOR SELECT USING (true);

-- 6. Crear políticas de administración (solo usuarios con is_admin = true)
CREATE POLICY "Admins can manage landing settings" ON public."LandingSetting"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public."User"
            WHERE "User".id = auth.uid()
            AND "User".is_admin = true
        )
    );

CREATE POLICY "Admins can manage landing testimonials" ON public."LandingTestimonial"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public."User"
            WHERE "User".id = auth.uid()
            AND "User".is_admin = true
        )
    );

-- 7. Crear el bucket publico 'landing' para almacenar fotos de los profesores y testimonios
INSERT INTO storage.buckets (id, name, public)
VALUES ('landing', 'landing', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de Storage para el bucket 'landing'
DROP POLICY IF EXISTS "Public Read for landing assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage landing assets" ON storage.objects;

-- Cualquier persona puede ver/descargar los assets de la landing
CREATE POLICY "Public Read for landing assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'landing');

-- Solo administradores pueden subir/modificar/borrar assets de la landing
CREATE POLICY "Admins can manage landing assets"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'landing' AND
    EXISTS (
        SELECT 1 FROM public."User"
        WHERE "User".id = auth.uid()
        AND "User".is_admin = true
    )
);

-- 8. Seed inicial con textos por defecto para que la landing no inicie vacía
INSERT INTO public."LandingSetting" (key, value)
VALUES 
  ('hero', '{"title": "Lleva tus clases de música al siguiente nivel", "subtitle": "Conecta con los mejores profesores, organiza tus horarios y accede a material exclusivo en tu biblioteca digital personalizada.", "cta_text": "Comenzar Ahora", "cta_url": "/register"}'),
  ('features', '{"title": "Diseñado para músicos exigentes", "subtitle": "Todo lo que necesitas en una sola plataforma integrada y fluida."}'),
  ('cta_footer', '{"title": "¿Listo para empezar a tocar?", "subtitle": "Regístrate hoy y transforma tu método de aprendizaje.", "button_text": "Registrarse Gratis"}')
ON CONFLICT (key) DO NOTHING;

-- Seed inicial de testimonios
INSERT INTO public."LandingTestimonial" (name, role, comment, rating, "order")
VALUES 
  ('Francisco Silva', 'Profesor de Batería', 'Francisco es un baterista excepcional con más de 10 años de experiencia. Su metodología práctica y directa ha ayudado a decenas de alumnos a alcanzar su máximo potencial.', 5, 1),
  ('Camila Rojas', 'Profesora de Piano', 'Camila combina la técnica clásica con repertorios modernos de forma impecable. Sus clases son dinámicas, estructuradas y altamente motivadoras.', 5, 2)
ON CONFLICT (id) DO NOTHING;

-- Notificar a postgrest para recargar el esquema
NOTIFY pgrst, 'reload schema';
