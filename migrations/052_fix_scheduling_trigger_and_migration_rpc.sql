-- Migration 052: Fix class scheduling double-booking trigger, enhance student migration RPC, and improve get_email_by_name resolution

-- 1. Actualizar check_class_scheduling_rules
-- Problema resuelto: El trigger bloqueaba actualizaciones legítimas (ej. migración de alumno, edición de notas, clases pasadas/COMPLETED)
-- debido a que comprobaba colisión de horarios sin verificar si el horario o profesor cambiaron, o si la clase está en estado completado/cancelado.
CREATE OR REPLACE FUNCTION public.check_class_scheduling_rules()
RETURNS TRIGGER AS $$
DECLARE
  v_user_role TEXT;
  v_student_profile_id UUID;
  v_student_email TEXT;
  v_preferred_day TEXT;
  v_preferred_day_num INTEGER;
  v_monthly_limit INTEGER := 4;
  v_weekly_class_count INTEGER;
  v_weekly_booking_count INTEGER;
  v_monthly_class_count INTEGER;
  v_monthly_booking_count INTEGER;
  v_is_student BOOLEAN := FALSE;
  v_is_late_cancel BOOLEAN := FALSE;
  v_should_check_overlap BOOLEAN := FALSE;
BEGIN
  -- 1. Double-booking check (overlap) for the teacher
  -- Solamente evaluar colisión de horarios si la clase misma está en estado activo/programado
  IF NEW.teacher_id IS NOT NULL AND NEW.date IS NOT NULL AND NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL 
     AND NEW.status IN ('SCHEDULED', 'CONFIRMED', 'PENDING_AUTHORIZATION') THEN

    -- En caso de UPDATE, solo verificar colisión si cambiaron campos relevantes de horario/fecha/profesor
    -- o si la clase pasó de un estado inactivo a activo.
    -- Si solo se está actualizando student_id, notas, título o conservando el mismo horario, no bloquear.
    IF TG_OP = 'INSERT' THEN
      v_should_check_overlap := TRUE;
    ELSIF TG_OP = 'UPDATE' THEN
      IF OLD.teacher_id IS DISTINCT FROM NEW.teacher_id
         OR OLD.date IS DISTINCT FROM NEW.date
         OR OLD.start_time IS DISTINCT FROM NEW.start_time
         OR OLD.end_time IS DISTINCT FROM NEW.end_time
         OR (OLD.status NOT IN ('SCHEDULED', 'CONFIRMED', 'PENDING_AUTHORIZATION')) THEN
        v_should_check_overlap := TRUE;
      END IF;
    END IF;

    IF v_should_check_overlap THEN
      IF EXISTS (
        SELECT 1 FROM public."Class"
        WHERE teacher_id = NEW.teacher_id
          AND date = NEW.date
          AND status IN ('SCHEDULED', 'CONFIRMED', 'PENDING_AUTHORIZATION')
          AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
          AND NEW.start_time < end_time
          AND start_time < NEW.end_time
      ) THEN
        RAISE EXCEPTION 'El profesor ya tiene una clase programada en ese horario.';
      END IF;

      IF EXISTS (
        SELECT 1 FROM public."Booking"
        WHERE teacher_id = NEW.teacher_id
          AND date = NEW.date
          AND status = 'PENDING'
          AND id <> COALESCE(NEW.booking_id, '00000000-0000-0000-0000-000000000000'::UUID)
          AND NEW.start_time < end_time
          AND start_time < NEW.end_time
      ) THEN
        RAISE EXCEPTION 'El profesor ya tiene una reserva pendiente en ese horario.';
      END IF;
    END IF;
  END IF;

  -- Obtener rol del usuario actual
  IF auth.uid() IS NOT NULL THEN
    SELECT role INTO v_user_role FROM public."User" WHERE id = auth.uid();
    IF v_user_role = 'STUDENT' THEN
      v_is_student := TRUE;
    END IF;
  END IF;

  -- Obtener detalles del perfil del alumno si student_id está establecido
  IF NEW.student_id IS NOT NULL THEN
    SELECT s.id, u.email, s.preferred_day
    INTO v_student_profile_id, v_student_email, v_preferred_day
    FROM public."StudentProfile" s
    JOIN public."User" u ON s.user_id = u.id
    WHERE s.id = NEW.student_id;
  ELSIF auth.uid() IS NOT NULL AND v_is_student THEN
    SELECT s.id, u.email, s.preferred_day
    INTO v_student_profile_id, v_student_email, v_preferred_day
    FROM public."StudentProfile" s
    JOIN public."User" u ON s.user_id = u.id
    WHERE u.id = auth.uid();
    
    -- Auto-asignar student_id en NEW si es null y el alumno está logueado
    IF NEW.student_id IS NULL AND v_student_profile_id IS NOT NULL THEN
      NEW.student_id := v_student_profile_id;
    END IF;
  END IF;

  -- 2. Reglas que aplican únicamente a alumnos
  IF v_is_student THEN
    -- Límite máximo de 2 horas (120 min)
    IF NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL THEN
      IF (NEW.end_time - NEW.start_time) > INTERVAL '2 hours' THEN
        RAISE EXCEPTION 'No puedes agendar una clase de más de 2 horas.';
      END IF;
    END IF;

    -- Verificar si es UPDATE (reprogramación o cancelación)
    IF (TG_OP = 'UPDATE') THEN
      -- Cancelación tardía (< 24h)
      IF OLD.date IS NOT NULL AND OLD.start_time IS NOT NULL THEN
        v_is_late_cancel := ((OLD.date + OLD.start_time) AT TIME ZONE 'America/Santiago' - now()) < INTERVAL '24 hours';
      END IF;

      -- Reprogramación: si es < 24h, bloquear
      IF v_is_late_cancel AND (OLD.date <> NEW.date OR OLD.start_time <> NEW.start_time OR OLD.end_time <> NEW.end_time) THEN
        RAISE EXCEPTION 'No puedes reprogramar una clase con menos de 24 horas de anticipación.';
      END IF;

      -- Cancelación: si cambia estado a CANCELLED y es < 24h, forzar PENDING_AUTHORIZATION
      IF v_is_late_cancel AND NEW.status IN ('CANCELLED', 'CANCELLED_BY_STUDENT') AND OLD.status NOT IN ('CANCELLED', 'CANCELLED_BY_STUDENT') THEN
        NEW.status := 'PENDING_AUTHORIZATION';
      END IF;
    END IF;

    -- Validaciones de límites semanal y mensual (solo para clases activas)
    IF NEW.status IN ('SCHEDULED', 'CONFIRMED', 'PENDING_AUTHORIZATION') AND NEW.date IS NOT NULL THEN
      -- A. Límite Semanal (máx 1 clase por semana)
      SELECT COUNT(*) INTO v_weekly_class_count
      FROM public."Class"
      WHERE student_id = v_student_profile_id
        AND date >= date_trunc('week', NEW.date)::DATE
        AND date <= (date_trunc('week', NEW.date) + INTERVAL '6 days')::DATE
        AND status IN ('SCHEDULED', 'CONFIRMED', 'PENDING_AUTHORIZATION')
        AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);

      SELECT COUNT(*) INTO v_weekly_booking_count
      FROM public."Booking"
      WHERE email = v_student_email
        AND date >= date_trunc('week', NEW.date)::DATE
        AND date <= (date_trunc('week', NEW.date) + INTERVAL '6 days')::DATE
        AND status = 'PENDING'
        AND id <> COALESCE(NEW.booking_id, '00000000-0000-0000-0000-000000000000'::UUID);

      IF (v_weekly_class_count + v_weekly_booking_count) >= 1 THEN
        RAISE EXCEPTION 'Límite semanal excedido (máximo 1 clase por semana).';
      END IF;

      -- B. Límite Mensual (dinámico según preferred_day)
      IF v_preferred_day IS NOT NULL THEN
        IF lower(public.unaccent(v_preferred_day)) IN ('domingo', 'sunday') THEN
          v_preferred_day_num := 0;
        ELSIF lower(public.unaccent(v_preferred_day)) IN ('lunes', 'monday') THEN
          v_preferred_day_num := 1;
        ELSIF lower(public.unaccent(v_preferred_day)) IN ('martes', 'tuesday') THEN
          v_preferred_day_num := 2;
        ELSIF lower(public.unaccent(v_preferred_day)) IN ('miercoles', 'miercoles', 'wednesday') THEN
          v_preferred_day_num := 3;
        ELSIF lower(public.unaccent(v_preferred_day)) IN ('jueves', 'thursday') THEN
          v_preferred_day_num := 4;
        ELSIF lower(public.unaccent(v_preferred_day)) IN ('viernes', 'friday') THEN
          v_preferred_day_num := 5;
        ELSIF lower(public.unaccent(v_preferred_day)) IN ('sabado', 'sabado', 'saturday') THEN
          v_preferred_day_num := 6;
        END IF;
      END IF;

      IF v_preferred_day_num IS NOT NULL THEN
        SELECT COUNT(*)::INTEGER INTO v_monthly_limit
        FROM generate_series(
          date_trunc('month', NEW.date),
          (date_trunc('month', NEW.date) + INTERVAL '1 month - 1 day')::DATE,
          '1 day'::interval
        ) AS days
        WHERE EXTRACT(DOW FROM days) = v_preferred_day_num;
      END IF;

      SELECT COUNT(*) INTO v_monthly_class_count
      FROM public."Class"
      WHERE student_id = v_student_profile_id
        AND date >= date_trunc('month', NEW.date)::DATE
        AND date <= (date_trunc('month', NEW.date) + INTERVAL '1 month - 1 day')::DATE
        AND status IN ('SCHEDULED', 'CONFIRMED', 'PENDING_AUTHORIZATION')
        AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);

      SELECT COUNT(*) INTO v_monthly_booking_count
      FROM public."Booking"
      WHERE email = v_student_email
        AND date >= date_trunc('month', NEW.date)::DATE
        AND date <= (date_trunc('month', NEW.date) + INTERVAL '1 month - 1 day')::DATE
        AND status = 'PENDING'
        AND id <> COALESCE(NEW.booking_id, '00000000-0000-0000-0000-000000000000'::UUID);

      IF (v_monthly_class_count + v_monthly_booking_count) >= v_monthly_limit THEN
        RAISE EXCEPTION 'Límite mensual de % clases excedido para este mes.', v_monthly_limit;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Actualizar migrate_and_delete_student
-- Migra todas las tablas existentes asociadas a un alumno y elimina limpiamente el registro.
DROP FUNCTION IF EXISTS public.migrate_and_delete_student(UUID);
DROP FUNCTION IF EXISTS public.migrate_and_delete_student(UUID, UUID);

CREATE OR REPLACE FUNCTION public.migrate_and_delete_student(
  p_source_student_id UUID,
  p_target_student_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_source_user_id UUID;
  v_source_lifetime_value NUMERIC;
  v_source_collection_active BOOLEAN;
  v_profile_exists BOOLEAN := FALSE;
BEGIN
  -- 1. Obtener datos del perfil del alumno de origen
  SELECT user_id, COALESCE(lifetime_value, 0), collection_active, TRUE 
  INTO v_source_user_id, v_source_lifetime_value, v_source_collection_active, v_profile_exists
  FROM public."StudentProfile"
  WHERE id = p_source_student_id;

  IF NOT v_profile_exists THEN
    RAISE EXCEPTION 'El alumno de origen no existe.';
  END IF;

  -- 2. Si se especificó un alumno destino, migrar el historial completo
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

    DELETE FROM public."StudentLibraryAccess"
    WHERE student_id = p_source_student_id;

    -- Migrar Compras de Productos
    BEGIN
      UPDATE public."Purchase"
      SET student_id = p_target_student_id
      WHERE student_id = p_source_student_id;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    -- Migrar Registros de Clases (ClassLog)
    BEGIN
      UPDATE public."ClassLog"
      SET student_id = p_target_student_id
      WHERE student_id = p_source_student_id;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    -- Migrar Lista de Espera
    BEGIN
      UPDATE public."ScheduleWaitingList"
      SET student_id = p_target_student_id
      WHERE student_id = p_source_student_id;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    -- Migrar Submisiones de Ejercicios en Video
    BEGIN
      UPDATE public."ExerciseSubmission"
      SET student_id = p_target_student_id
      WHERE student_id = p_source_student_id;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    -- Migrar Progreso de Alumno
    BEGIN
      INSERT INTO public."StudentProgress" (student_id, lesson_id, status, completed_at, created_at, updated_at)
      SELECT p_target_student_id, lesson_id, status, completed_at, created_at, updated_at
      FROM public."StudentProgress"
      WHERE student_id = p_source_student_id
      ON CONFLICT (student_id, lesson_id) DO NOTHING;

      DELETE FROM public."StudentProgress"
      WHERE student_id = p_source_student_id;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    -- Migrar Stats (eliminar del origen para no bloquear eliminación)
    BEGIN
      DELETE FROM public."StudentStats"
      WHERE student_id = p_source_student_id;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    -- Acumular lifetime_value y transferir collection_active al destino si aplica
    UPDATE public."StudentProfile"
    SET 
      lifetime_value = COALESCE(lifetime_value, 0) + v_source_lifetime_value,
      collection_active = COALESCE(v_source_collection_active, collection_active)
    WHERE id = p_target_student_id;
  END IF;

  -- 3. Eliminar en public."User" directamente (si el alumno tiene un user_id vinculado)
  IF v_source_user_id IS NOT NULL THEN
    BEGIN
      DELETE FROM public."PushSubscription" WHERE user_id = v_source_user_id;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    DELETE FROM public."User"
    WHERE id = v_source_user_id;

    -- 4. Intentar eliminar el usuario en auth.users si existe
    BEGIN
      DELETE FROM auth.users
      WHERE id = v_source_user_id;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;

  -- 5. Garantizar la eliminación del StudentProfile (por si no tenía user_id o no cascó)
  DELETE FROM public."StudentProfile"
  WHERE id = p_source_student_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Overload de 1 parámetro para asegurar compatibilidad total con PostgREST
CREATE OR REPLACE FUNCTION public.migrate_and_delete_student(
  p_source_student_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.migrate_and_delete_student(p_source_student_id, NULL::UUID);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION public.migrate_and_delete_student(UUID, UUID) TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.migrate_and_delete_student(UUID) TO authenticated, service_role, anon;


-- 3. Mejorar get_email_by_name para priorizar alumnos activos y la cuenta más reciente
CREATE OR REPLACE FUNCTION public.get_email_by_name(p_name TEXT)
RETURNS TEXT AS $$
DECLARE
  v_email TEXT;
BEGIN
  SELECT u.email INTO v_email
  FROM public."User" u
  LEFT JOIN public."StudentProfile" sp ON sp.user_id = u.id
  WHERE lower(public.unaccent(u.name)) = lower(public.unaccent(p_name))
  ORDER BY 
    CASE WHEN sp.status = 'ACTIVE' THEN 1 ELSE 2 END,
    u.created_at DESC
  LIMIT 1;
  
  RETURN v_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_email_by_name(TEXT) TO authenticated, service_role, anon;

NOTIFY pgrst, 'reload schema';
