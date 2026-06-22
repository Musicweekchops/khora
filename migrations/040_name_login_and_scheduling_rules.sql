-- Migration 040: Add get_email_by_name RPC for student login, enable unaccent, and enforce scheduling rules
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION public.get_email_by_name(p_name TEXT)
RETURNS TEXT AS $$
DECLARE
  v_email TEXT;
BEGIN
  -- Busca un usuario cuyo nombre coincida de forma insensible a mayúsculas, minúsculas y acentos
  SELECT email INTO v_email
  FROM public."User"
  WHERE lower(public.unaccent(name)) = lower(public.unaccent(p_name))
  LIMIT 1;
  
  RETURN v_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate Class table rules
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
BEGIN
  -- 1. Double-booking check (overlap) for the teacher
  IF NEW.teacher_id IS NOT NULL AND NEW.date IS NOT NULL AND NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL THEN
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

  -- Get current user role
  IF auth.uid() IS NOT NULL THEN
    SELECT role INTO v_user_role FROM public."User" WHERE id = auth.uid();
    IF v_user_role = 'STUDENT' THEN
      v_is_student := TRUE;
    END IF;
  END IF;

  -- Get student profile details if student_id is set
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
    
    -- Auto-assign student_id on NEW if it's null and they are logged in
    IF NEW.student_id IS NULL AND v_student_profile_id IS NOT NULL THEN
      NEW.student_id := v_student_profile_id;
    END IF;
  END IF;

  -- 2. Rules that apply only to students
  IF v_is_student THEN
    -- Check Max 2 Hours limit (120 minutes)
    IF NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL THEN
      IF (NEW.end_time - NEW.start_time) > INTERVAL '2 hours' THEN
        RAISE EXCEPTION 'No puedes agendar una clase de más de 2 horas.';
      END IF;
    END IF;

    -- Check if it is an UPDATE (rescheduling or cancelling)
    IF (TG_OP = 'UPDATE') THEN
      -- Late cancellation rule check
      IF OLD.date IS NOT NULL AND OLD.start_time IS NOT NULL THEN
        v_is_late_cancel := ((OLD.date + OLD.start_time) AT TIME ZONE 'America/Santiago' - now()) < INTERVAL '24 hours';
      END IF;

      -- Rescheduling check: if rescheduling when < 24h, block it.
      IF v_is_late_cancel AND (OLD.date <> NEW.date OR OLD.start_time <> NEW.start_time OR OLD.end_time <> NEW.end_time) THEN
        RAISE EXCEPTION 'No puedes reprogramar una clase con menos de 24 horas de anticipación.';
      END IF;

      -- Cancellation check: if changing status to CANCELLED and it's less than 24 hours, force PENDING_AUTHORIZATION
      IF v_is_late_cancel AND NEW.status IN ('CANCELLED', 'CANCELLED_BY_STUDENT') AND OLD.status NOT IN ('CANCELLED', 'CANCELLED_BY_STUDENT') THEN
        NEW.status := 'PENDING_AUTHORIZATION';
      END IF;
    END IF;

    -- Weekly & Monthly limit validations (only for scheduled/confirmed/pending classes)
    IF NEW.status IN ('SCHEDULED', 'CONFIRMED', 'PENDING_AUTHORIZATION') AND NEW.date IS NOT NULL THEN
      -- A. Weekly Limit (max 1 class/week)
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

-- Function to validate Booking table rules
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
  -- 1. Double-booking check (overlap) for the teacher
  IF NEW.teacher_id IS NOT NULL AND NEW.date IS NOT NULL AND NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public."Class"
      WHERE teacher_id = NEW.teacher_id
        AND date = NEW.date
        AND status IN ('SCHEDULED', 'CONFIRMED', 'PENDING_AUTHORIZATION')
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
        AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
        AND NEW.start_time < end_time
        AND start_time < NEW.end_time
    ) THEN
      RAISE EXCEPTION 'El profesor ya tiene una reserva pendiente en ese horario.';
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
    -- Check Max 2 Hours limit (120 minutes)
    IF NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL THEN
      IF (NEW.end_time - NEW.start_time) > INTERVAL '2 hours' THEN
        RAISE EXCEPTION 'No puedes agendar una clase de más de 2 horas.';
      END IF;
    END IF;

    -- Weekly & Monthly limit validations (only for pending bookings)
    IF NEW.status = 'PENDING' AND NEW.date IS NOT NULL THEN
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

-- Triggers registration
DROP TRIGGER IF EXISTS trg_check_class_scheduling_rules ON public."Class";
CREATE TRIGGER trg_check_class_scheduling_rules
  BEFORE INSERT OR UPDATE ON public."Class"
  FOR EACH ROW
  EXECUTE FUNCTION public.check_class_scheduling_rules();

DROP TRIGGER IF EXISTS trg_check_booking_scheduling_rules ON public."Booking";
CREATE TRIGGER trg_check_booking_scheduling_rules
  BEFORE INSERT OR UPDATE ON public."Booking"
  FOR EACH ROW
  EXECUTE FUNCTION public.check_booking_scheduling_rules();