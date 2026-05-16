-- 018_create_library_playlists.sql

-- 1. Crear tabla para las listas de reproducción (Series)
CREATE TABLE IF NOT EXISTS public."LibraryPlaylist" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar RLS
ALTER TABLE public."LibraryPlaylist" ENABLE ROW LEVEL SECURITY;

-- 3. Políticas para LibraryPlaylist
-- Los profesores pueden gestionar sus propias listas
CREATE POLICY "Teachers can manage their own playlists" ON public."LibraryPlaylist"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public."TeacherProfile"
            WHERE "TeacherProfile".id = "LibraryPlaylist".teacher_id
            AND "TeacherProfile".user_id = auth.uid()
        )
    );

-- Los estudiantes pueden ver las listas de su profesor asignado
CREATE POLICY "Students can view assigned teacher playlists" ON public."LibraryPlaylist"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public."StudentProfile"
            WHERE "StudentProfile".teacher_id = "LibraryPlaylist".teacher_id
            AND "StudentProfile".user_id = auth.uid()
        )
    );

-- 4. Agregar la relación a LibraryContent
ALTER TABLE public."LibraryContent"
ADD COLUMN IF NOT EXISTS playlist_id UUID REFERENCES public."LibraryPlaylist"(id) ON DELETE CASCADE;

-- Notificar a postgrest para refrescar esquema
NOTIFY pgrst, 'reload schema';
