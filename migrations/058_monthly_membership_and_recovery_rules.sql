-- =============================================================================
-- Migración 058: Mensualidad de mes calendario, reglas de recuperación y contacto de pago
-- =============================================================================

-- 1. Añadir billing_month a Payment para asociar explícitamente cada pago a un mes (AAAA-MM)
ALTER TABLE public."Payment"
  ADD COLUMN IF NOT EXISTS billing_month TEXT;

-- Rellenar billing_month en pagos existentes usando los primeros 7 caracteres de date (sin alterar datos históricos)
UPDATE public."Payment"
SET billing_month = substring(date::text from 1 for 7)
WHERE billing_month IS NULL AND date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payment_student_billing_month
  ON public."Payment"(student_id, billing_month);

-- 2. Añadir meses en pausa y contacto de pago (apoderado/familiar) en StudentProfile
ALTER TABLE public."StudentProfile"
  ADD COLUMN IF NOT EXISTS paused_months TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS billing_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS billing_contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS billing_contact_email TEXT;

-- 3. Añadir origen y fecha límite de recuperación en Class
ALTER TABLE public."Class"
  ADD COLUMN IF NOT EXISTS recovery_origin_type TEXT CHECK (recovery_origin_type IN ('TEACHER_OR_HOLIDAY', 'STUDENT_JUSTIFIED', 'NO_SHOW')),
  ADD COLUMN IF NOT EXISTS recovery_expires_at DATE;

-- 4. Añadir configuración de reglas de cobro y datos bancarios en TeacherBillingConfig
ALTER TABLE public."TeacherBillingConfig"
  ADD COLUMN IF NOT EXISTS bank_details TEXT,
  ADD COLUMN IF NOT EXISTS billing_day INTEGER DEFAULT 1 NOT NULL,
  ADD COLUMN IF NOT EXISTS grace_day INTEGER DEFAULT 5 NOT NULL;

-- 5. Actualizar check_class_scheduling_rules para soportar meses de 5 sesiones y excluir recuperaciones del tope
CREATE OR REPLACE FUNCTION public.check_class_scheduling_rules()
RETURNS TRIGGER AS $$
DECLARE
  v_user_role TEXT;
  v_student_profile_id UUID;
  v_student_email TEXT;
  v_preferred_day TEXT;
  v_preferred_day_num INTEGER;
  v_monthly_limit INTEGER := 5;
  v_weekly_class_count INTEGER;
  v_weekly_booking_count INTEGER;
  v_monthly_class_count INTEGER;
  v_monthly_booking_count INTEGER;
  v_is_student BOOLEAN := FALSE;
  v_is_late_cancel BOOLEAN := FALSE;
  v_should_check_overlap BOOLEAN := FALSE;
BEGIN
  -- 1. Double-booking check (overlap) for the teacher
  IF NEW.teacher_id IS NOT NULL AND NEW.date IS NOT NULL AND NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL 
     AND NEW.status IN ('SCHEDULED', 'CONFIRMED', 'PENDING_AUTHORIZATION') THEN

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

  -- Obtener detalles del perfil del alumno
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
    
    IF NEW.student_id IS NULL AND v_student_profile_id IS NOT NULL THEN
      NEW.student_id := v_student_profile_id;
    END IF;
  END IF;

  -- 2. Reglas que aplican únicamente a alumnos autogestionando
  IF v_is_student THEN
    IF NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL THEN
      IF (NEW.end_time - NEW.start_time) > INTERVAL '2 hours' THEN
        RAISE EXCEPTION 'No puedes agendar una clase de más de 2 horas.';
      END IF;
    END IF;

    IF (TG_OP = 'UPDATE') THEN
      IF OLD.date IS NOT NULL AND OLD.start_time IS NOT NULL THEN
        v_is_late_cancel := ((OLD.date + OLD.start_time) AT TIME ZONE 'America/Santiago' - now()) < INTERVAL '24 hours';
      END IF;

      IF v_is_late_cancel AND (OLD.date <> NEW.date OR OLD.start_time <> NEW.start_time OR OLD.end_time <> NEW.end_time) THEN
        RAISE EXCEPTION 'No puedes reprogramar una clase con menos de 24 horas de anticipación.';
      END IF;

      IF v_is_late_cancel AND NEW.status IN ('CANCELLED', 'CANCELLED_BY_STUDENT') AND OLD.status NOT IN ('CANCELLED', 'CANCELLED_BY_STUDENT') THEN
        NEW.status := 'PENDING_AUTHORIZATION';
      END IF;
    END IF;

    -- Validaciones de límites semanal y mensual (excluyendo clases de recuperación)
    IF NEW.status IN ('SCHEDULED', 'CONFIRMED', 'PENDING_AUTHORIZATION')
       AND NEW.date IS NOT NULL
       AND COALESCE(NEW.is_recovery, FALSE) = FALSE THEN

      SELECT COUNT(*) INTO v_weekly_class_count
      FROM public."Class"
      WHERE student_id = v_student_profile_id
        AND date >= date_trunc('week', NEW.date)::DATE
        AND date <= (date_trunc('week', NEW.date) + INTERVAL '6 days')::DATE
        AND status IN ('SCHEDULED', 'CONFIRMED', 'PENDING_AUTHORIZATION')
        AND COALESCE(is_recovery, FALSE) = FALSE
        AND COALESCE(is_recovery_pending, FALSE) = FALSE
        AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);

      SELECT COUNT(*) INTO v_weekly_booking_count
      FROM public."Booking"
      WHERE email = v_student_email
        AND date >= date_trunc('week', NEW.date)::DATE
        AND date <= (date_trunc('week', NEW.date) + INTERVAL '6 days')::DATE
        AND status = 'PENDING'
        AND id <> COALESCE(NEW.booking_id, '00000000-0000-0000-0000-000000000000'::UUID);

      IF (v_weekly_class_count + v_weekly_booking_count) >= 1 THEN
        RAISE EXCEPTION 'Límite semanal alcanzado (1 sesión regular por semana).';
      END IF;

      -- Límite mensual dinámico (permite 5 sesiones en meses de 5 semanas)
      IF v_preferred_day IS NOT NULL THEN
        IF lower(public.unaccent(v_preferred_day)) IN ('domingo', 'sunday') THEN
          v_preferred_day_num := 0;
        ELSIF lower(public.unaccent(v_preferred_day)) IN ('lunes', 'monday') THEN
          v_preferred_day_num := 1;
        ELSIF lower(public.unaccent(v_preferred_day)) IN ('martes', 'tuesday') THEN
          v_preferred_day_num := 2;
        ELSIF lower(public.unaccent(v_preferred_day)) IN ('miercoles', 'wednesday') THEN
          v_preferred_day_num := 3;
        ELSIF lower(public.unaccent(v_preferred_day)) IN ('jueves', 'thursday') THEN
          v_preferred_day_num := 4;
        ELSIF lower(public.unaccent(v_preferred_day)) IN ('viernes', 'friday') THEN
          v_preferred_day_num := 5;
        ELSIF lower(public.unaccent(v_preferred_day)) IN ('sabado', 'saturday') THEN
          v_preferred_day_num := 6;
        END IF;
      END IF;

      IF v_preferred_day_num IS NOT NULL THEN
        SELECT GREATEST(COUNT(*)::INTEGER, 5) INTO v_monthly_limit
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
        AND COALESCE(is_recovery, FALSE) = FALSE
        AND COALESCE(is_recovery_pending, FALSE) = FALSE
        AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);

      SELECT COUNT(*) INTO v_monthly_booking_count
      FROM public."Booking"
      WHERE email = v_student_email
        AND date >= date_trunc('month', NEW.date)::DATE
        AND date <= (date_trunc('month', NEW.date) + INTERVAL '1 month - 1 day')::DATE
        AND status = 'PENDING'
        AND id <> COALESCE(NEW.booking_id, '00000000-0000-0000-0000-000000000000'::UUID);

      IF (v_monthly_class_count + v_monthly_booking_count) >= v_monthly_limit THEN
        RAISE EXCEPTION 'Ya tienes todas tus sesiones regulares de este mes agendadas.';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
