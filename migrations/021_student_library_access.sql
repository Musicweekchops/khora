-- 021_student_library_access.sql

-- 1. Crear tabla para gestionar el acceso explícito de estudiantes a series y materiales
CREATE TABLE IF NOT EXISTS public."StudentLibraryAccess" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public."StudentProfile"(id) ON DELETE CASCADE,
    content_id UUID REFERENCES public."LibraryContent"(id) ON DELETE CASCADE,
    playlist_id UUID REFERENCES public."LibraryPlaylist"(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    CHECK (
        (content_id IS NOT NULL AND playlist_id IS NULL) OR 
        (playlist_id IS NOT NULL AND content_id IS NULL)
    ),
    UNIQUE (student_id, content_id),
    UNIQUE (student_id, playlist_id)
);

-- Habilitar RLS
ALTER TABLE public."StudentLibraryAccess" ENABLE ROW LEVEL SECURITY;

-- Políticas para StudentLibraryAccess
CREATE POLICY "sla_teacher_manage" ON public."StudentLibraryAccess"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public."TeacherProfile"
            WHERE "TeacherProfile".id = "StudentLibraryAccess".assigned_by
            AND "TeacherProfile".user_id = auth.uid()
        )
    );

CREATE POLICY "sla_student_read" ON public."StudentLibraryAccess"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public."StudentProfile"
            WHERE "StudentProfile".id = "StudentLibraryAccess".student_id
            AND "StudentProfile".user_id = auth.uid()
        )
    );

-- 2. Modificar ClassNote para soportar series (playlists)
ALTER TABLE public."ClassNote"
ADD COLUMN IF NOT EXISTS playlist_id UUID REFERENCES public."LibraryPlaylist"(id) ON DELETE SET NULL;

-- 3. Modificar Task para soportar series (playlists)
ALTER TABLE public."Task"
ADD COLUMN IF NOT EXISTS playlist_id UUID REFERENCES public."LibraryPlaylist"(id) ON DELETE SET NULL;

-- Notificar a PostgREST para refrescar la caché del esquema
NOTIFY pgrst, 'reload schema';
