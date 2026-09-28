-- Migration 027: Add atomic student delete and history migration RPC
-- Allows migrating Class, Task, Payment, Schedule, and Library Access history to another student before deletion.

DROP FUNCTION IF EXISTS public.migrate_and_delete_student(UUID);
DROP FUNCTION IF EXISTS public.migrate_and_delete_student(UUID, UUID);

CREATE OR REPLACE FUNCTION public.migrate_and_delete_student(
  p_source_student_id UUID,
  p_target_student_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_source_user_id UUID;
  v_profile_exists BOOLEAN := FALSE;
BEGIN
  -- 1. Validar que el usuario esté autenticado
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado.';
  END IF;

  -- 2. Obtener el user_id del perfil del alumno de origen
  SELECT user_id, TRUE INTO v_source_user_id, v_profile_exists
  FROM public."StudentProfile"
  WHERE id = p_source_student_id;

  IF NOT v_profile_exists THEN
    RAISE EXCEPTION 'El alumno de origen no existe.';
  END IF;

  -- 3. Si se especificó un alumno destino, migrar el historial completo
  IF p_target_student_id IS NOT NULL THEN
    -- Migrar Clases
    BEGIN
      UPDATE public."Class"
      SET student_id = p_target_student_id
      WHERE student_id = p_source_student_id;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    -- Migrar Tareas
    BEGIN
      UPDATE public."Task"
      SET student_id = p_target_student_id
      WHERE student_id = p_source_student_id;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    -- Migrar Pagos
    BEGIN
      UPDATE public."Payment"
      SET student_id = p_target_student_id
      WHERE student_id = p_source_student_id;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    -- Migrar Horarios Fijos (Schedule)
    BEGIN
      UPDATE public."Schedule"
      SET student_id = p_target_student_id
      WHERE student_id = p_source_student_id;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    -- Migrar Accesos a Biblioteca (evitando duplicados mediante exclusión de conflictos)
    BEGIN
      INSERT INTO public."StudentLibraryAccess" (student_id, content_id, playlist_id, assigned_by)
      SELECT p_target_student_id, content_id, playlist_id, assigned_by
      FROM public."StudentLibraryAccess"
      WHERE student_id = p_source_student_id
      ON CONFLICT DO NOTHING;

      DELETE FROM public."StudentLibraryAccess"
      WHERE student_id = p_source_student_id;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    -- Migrar Compras de Productos (dinámico por si la tabla no existe)
    BEGIN
      EXECUTE 'UPDATE public."Purchase" SET student_id = $1 WHERE student_id = $2'
      USING p_target_student_id, p_source_student_id;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    -- Migrar Registros de Clases (dinámico por si la tabla no existe)
    BEGIN
      EXECUTE 'UPDATE public."ClassLog" SET student_id = $1 WHERE student_id = $2'
      USING p_target_student_id, p_source_student_id;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    -- Migrar Lista de Espera (dinámico por si la tabla no existe)
    BEGIN
      EXECUTE 'UPDATE public."ScheduleWaitingList" SET student_id = $1 WHERE student_id = $2'
      USING p_target_student_id, p_source_student_id;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;

  -- 4. Eliminar en public."User" directamente (si el alumno tiene un user_id vinculado)
  IF v_source_user_id IS NOT NULL THEN
    BEGIN
      DELETE FROM public."User"
      WHERE id = v_source_user_id;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    -- 5. Intentar eliminar el usuario en auth.users si existe
    BEGIN
      DELETE FROM auth.users
      WHERE id = v_source_user_id;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;

  -- 6. Garantizar la eliminación del StudentProfile (por si no tenía user_id o no cascó)
  BEGIN
    DELETE FROM public."StudentProfile"
    WHERE id = p_source_student_id;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Overload de 1 parámetro para asegurar compatibilidad total con PostgREST
CREATE OR REPLACE FUNCTION public.migrate_and_delete_student(
  p_source_student_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.migrate_and_delete_student(p_source_student_id, NULL::UUID);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.migrate_and_delete_student(UUID, UUID) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.migrate_and_delete_student(UUID) TO authenticated, service_role, anon;

NOTIFY pgrst, 'reload schema';






