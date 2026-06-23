-- Migration 041: Fix booking confirmation triggers
-- 
-- Problema: Al confirmar una reserva (UPDATE Booking PENDING→CONFIRMED),
-- el trigger check_booking_scheduling_rules bloqueaba la operación porque:
-- 1. Encontraba una Class huérfana (de un intento previo) en ese horario
-- 2. El doble-booking check corría incluso en UPDATEs de status
--
-- Solución: 
-- A) Limpiar Classes huérfanas que no tienen Booking CONFIRMED asociado
-- B) Los checks de double-booking del Booking solo aplican en INSERT
--    o cuando el UPDATE cambia fecha/hora (no cuando solo cambia el status).

-- =====================================================
-- PASO A: Limpiar Classes huérfanas de intentos fallidos
-- (Classes con booking_id que apunta a un Booking en PENDING)
-- =====================================================
DELETE FROM public."Class"
WHERE booking_id IS NOT NULL
  AND booking_id IN (
    SELECT id FROM public."Booking" WHERE status = 'PENDING'
  );

-- =====================================================
-- PASO B: Re-crear el trigger con la lógica corregida
-- =====================================================

CREATE OR REPLACE FUNCTION public.check_booking_scheduling_rules()
RETURNS TRIGGER AS $$
DECLARE
  v_user_role TEXT;
  v_student_profile_id UUID;
  v_preferred_day TEXT;
  v_preferred_day_num INTEGER;
  v_monthly_limit INTEGER := 4;
  v_weekly_class_count INTEGER;
  v_weekly_booking_count INTEGER;
  v_monthly_class_count INTEGER;
  v_monthly_booking_count INTEGER;
  v_is_student BOOLEAN := FALSE;
BEGIN
  -- 1. Double-booking check para el profesor
  --    Solo aplica en INSERT, o en UPDATE cuando cambia la fecha/hora
  --    NO aplica cuando solo cambia el status (ej. PENDING→CONFIRMED por el profesor)
  IF NEW.teacher_id IS NOT NULL AND NEW.date IS NOT NULL AND NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL THEN
    IF (TG_OP = 'INSERT') OR
       (TG_OP = 'UPDATE' AND (OLD.date <> NEW.date OR OLD.start_time <> NEW.start_time OR OLD.end_time <> NEW.end_time)) THEN

      -- Check contra Classes existentes (excluye la Class que ya corresponde a este booking)
      IF EXISTS (
        SELECT 1 FROM public."Class"
        WHERE teacher_id = NEW.teacher_id
          AND date = NEW.date
          AND status IN ('SCHEDULED', 'CONFIRMED', 'PENDING_AUTHORIZATION')
          AND booking_id IS DISTINCT FROM NEW.id
          AND NEW.start_time < end_time
          AND start_time < NEW.end_time
      ) THEN
        RAISE EXCEPTION 'El profesor ya tiene una clase programada en ese horario.';
      END IF;

      -- Check contra otros Bookings PENDING
      IF EXISTS (
        SELECT 1 FROM public."Booking"
        WHERE teacher_id = NEW.teacher_id
          AND date = NEW.date
          AND status = 'PENDING'
          AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
          AND NEW.start_time < end_time
          AND start_time < NEW.end_time
      ) THEN
        RAISE EXCEPTION 'El profesor ya tiene una reserva pendiente en ese horario.';
      END IF;

    END IF;
  END IF;

  -- 2. Get student profile details if email is associated with a student
  IF NEW.email IS NOT NULL THEN
    SELECT s.id, s.preferred_day
    INTO v_student_profile_id, v_preferred_day
    FROM public."StudentProfile" s
    JOIN public."User" u ON s.user_id = u.id
    WHERE u.email = NEW.email;
  END IF;

  -- Determine if we should enforce student rules.
  IF auth.uid() IS NOT NULL THEN
    SELECT role INTO v_user_role FROM public."User" WHERE id = auth.uid();
    IF v_user_role = 'STUDENT' THEN
      v_is_student := TRUE;
    END IF;
  ELSE
    -- If auth.uid() is null (guest booking request from the public landing page),
    -- and the email corresponds to a registered student, we enforce student limits.
    IF v_student_profile_id IS NOT NULL THEN
      v_is_student := TRUE;
    END IF;
  END IF;

  IF v_is_student THEN
    -- Check Max 2 Hours limit (120 minutes) - solo en INSERT o cambio de horario
    IF NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL THEN
      IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND OLD.start_time <> NEW.start_time) THEN
        IF (NEW.end_time - NEW.start_time) > INTERVAL '2 hours' THEN
          RAISE EXCEPTION 'No puedes agendar una clase de más de 2 horas.';
        END IF;
      END IF;
    END IF;

    -- Weekly & Monthly limit validations (only for pending bookings on INSERT)
    IF NEW.status = 'PENDING' AND TG_OP = 'INSERT' AND NEW.date IS NOT NULL THEN
      -- A. Weekly Limit (max 1 class/week)
      SELECT COUNT(*) INTO v_weekly_class_count
      FROM public."Class"
      WHERE student_id = v_student_profile_id
        AND date >= date_trunc('week', NEW.date)::DATE
        AND date <= (date_trunc('week', NEW.date) + INTERVAL '6 days')::DATE
        AND status IN ('SCHEDULED', 'CONFIRMED', 'PENDING_AUTHORIZATION');

      SELECT COUNT(*) INTO v_weekly_booking_count
      FROM public."Booking"
      WHERE email = NEW.email
        AND date >= date_trunc('week', NEW.date)::DATE
        AND date <= (date_trunc('week', NEW.date) + INTERVAL '6 days')::DATE
        AND status = 'PENDING'
        AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);

      IF (v_weekly_class_count + v_weekly_booking_count) >= 1 THEN
        RAISE EXCEPTION 'Límite semanal excedido (máximo 1 clase por semana).';
      END IF;

      -- B. Monthly Limit (dynamic based on preferred_day)
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
        AND status IN ('SCHEDULED', 'CONFIRMED', 'PENDING_AUTHORIZATION');

      SELECT COUNT(*) INTO v_monthly_booking_count
      FROM public."Booking"
      WHERE email = NEW.email
        AND date >= date_trunc('month', NEW.date)::DATE
        AND date <= (date_trunc('month', NEW.date) + INTERVAL '1 month - 1 day')::DATE
        AND status = 'PENDING'
        AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);

      IF (v_monthly_class_count + v_monthly_booking_count) >= v_monthly_limit THEN
        RAISE EXCEPTION 'Límite mensual de % clases excedido para este mes.', v_monthly_limit;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
