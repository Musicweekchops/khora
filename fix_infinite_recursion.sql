-- =========================================================================================
-- REPARACIÓN DE ERROR 500 : INFINITE RECURSION (42P17)
-- =========================================================================================

-- El error de recursión infinita ocurre porque la Política RLS de la tabla "User"
-- hace un SELECT a la misma tabla "User" para verificar si eres TEACHER.
-- Al tratar de verificar si eres TEACHER, vuelve a leer la política, creando un ciclo infinito.

-- Solución: Creamos una función "SECURITY DEFINER" (modo super-administrador) 
-- que lee la tabla sin activar las políticas RLS y rompe el ciclo instantáneamente.

-- 1. CREAR FUNCIÓN SEGURA
CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public."User" 
    WHERE id::text = auth.uid()::text AND role = 'TEACHER'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. REPARAR LA POLÍTICA DE "User" QUE CAUSA EL CICLO INFINITO
DROP POLICY IF EXISTS "Teachers can view all profiles" ON public."User";
CREATE POLICY "Teachers can view all profiles" ON public."User"
  FOR SELECT USING ( public.is_teacher() );

-- 3. (OPCIONAL PERO RECOMENDADO) APLICAR LA FUNCIÓN AL RESTO DE TABLAS PARA MÁXIMA VELOCIDAD
DROP POLICY IF EXISTS "Teachers full access to students" ON public."StudentProfile";
CREATE POLICY "Teachers full access to students" ON public."StudentProfile"
  FOR ALL USING ( public.is_teacher() );

DROP POLICY IF EXISTS "Teachers full access to classes" ON public."Class";
CREATE POLICY "Teachers full access to classes" ON public."Class"
  FOR ALL USING ( public.is_teacher() );

DROP POLICY IF EXISTS "Teachers full access to payments" ON public."Payment";
CREATE POLICY "Teachers full access to payments" ON public."Payment"
  FOR ALL USING ( public.is_teacher() );

DROP POLICY IF EXISTS "Teachers full access to bookings" ON public."Booking";
CREATE POLICY "Teachers full access to bookings" ON public."Booking"
  FOR ALL USING ( public.is_teacher() );

DROP POLICY IF EXISTS "Teachers full access to ClassType" ON public."ClassType";
CREATE POLICY "Teachers full access to ClassType" ON public."ClassType"
  FOR ALL USING ( public.is_teacher() );

DROP POLICY IF EXISTS "Teachers full access to Availability" ON public."Availability";
CREATE POLICY "Teachers full access to Availability" ON public."Availability"
  FOR ALL USING ( public.is_teacher() );

DROP POLICY IF EXISTS "Teachers full access to Tasks" ON public."Task";
CREATE POLICY "Teachers full access to Tasks" ON public."Task"
  FOR ALL USING ( public.is_teacher() );
