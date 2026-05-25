-- Migration 027: Add atomic student delete and history migration RPC
-- Allows migrating Class, Task, Payment, Schedule, and Library Access history to another student before deletion.

CREATE OR REPLACE FUNCTION public.migrate_and_delete_student(
  p_source_student_id UUID,
  p_target_student_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_source_user_id UUID;
BEGIN
  -- 1. Validar que el usuario que ejecuta sea un profesor (verificando JWT y tabla public.User como fallback)
  IF NOT (
    public.is_teacher() OR 
    EXISTS (
      SELECT 1 FROM public."User" 
      WHERE id = auth.uid() AND role = 'TEACHER'
    )
  ) THEN
    RAISE EXCEPTION 'Solo los profesores pueden realizar esta acción.';
  END IF;

  -- 2. Obtener el user_id de la tabla de perfiles del alumno de origen
  SELECT user_id INTO v_source_user_id
  FROM public."StudentProfile"
  WHERE id = p_source_student_id;

  IF v_source_user_id IS NULL THEN
    RAISE EXCEPTION 'El alumno de origen no existe.';
  END IF;

  -- 3. Si se especificó un alumno destino, migrar el historial
  IF p_target_student_id IS NOT NULL THEN
    -- Migrar Clases
    UPDATE public."Class"
    SET student_id = p_target_student_id
    WHERE student_id = p_source_student_id;

    -- Migrar Tareas
    UPDATE public."Task"
    SET student_id = p_target_student_id
    WHERE student_id = p_source_student_id;

    -- Migrar Pagos
    UPDATE public."Payment"
    SET student_id = p_target_student_id
    WHERE student_id = p_source_student_id;

    -- Migrar Horarios Fijos (Schedule)
    UPDATE public."Schedule"
    SET student_id = p_target_student_id
    WHERE student_id = p_source_student_id;

    -- Migrar Accesos a Biblioteca (evitando duplicados mediante exclusión de conflictos)
    INSERT INTO public."StudentLibraryAccess" (student_id, content_id, playlist_id, assigned_by)
    SELECT p_target_student_id, content_id, playlist_id, assigned_by
    FROM public."StudentLibraryAccess"
    WHERE student_id = p_source_student_id
    ON CONFLICT DO NOTHING;

    -- Limpiar accesos viejos ya migrados/excluidos
    DELETE FROM public."StudentLibraryAccess"
    WHERE student_id = p_source_student_id;
  END IF;

  -- 4. Eliminar el usuario en auth.users si existe (esto borra en cascada si tenía cuenta de login)
  DELETE FROM auth.users
  WHERE id = v_source_user_id;

  -- 5. Eliminar en public."User" directamente (garantiza el borrado y cascada del StudentProfile en todos los casos, tenga o no cuenta auth)
  DELETE FROM public."User"
  WHERE id = v_source_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

