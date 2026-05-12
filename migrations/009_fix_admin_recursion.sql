-- 1. Crear función SECURITY DEFINER para chequear si es admin saltando las reglas RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  SELECT is_admin INTO v_is_admin FROM public."User" WHERE id = auth.uid();
  RETURN COALESCE(v_is_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Eliminar las políticas recursivas problemáticas del archivo anterior
DROP POLICY IF EXISTS "admin_all_users" ON public."User";
DROP POLICY IF EXISTS "admin_all_teachers" ON public."TeacherProfile";
DROP POLICY IF EXISTS "admin_all_students" ON public."StudentProfile";
DROP POLICY IF EXISTS "admin_all_payments" ON public."Payment";
DROP POLICY IF EXISTS "admin_all_classes" ON public."Class";
DROP POLICY IF EXISTS "admin_all_logs" ON public."AutomationLog";

-- 3. Recrear las políticas usando la función segura
CREATE POLICY "admin_all_users" ON public."User" FOR ALL USING ( public.is_admin() );
CREATE POLICY "admin_all_teachers" ON public."TeacherProfile" FOR ALL USING ( public.is_admin() );
CREATE POLICY "admin_all_students" ON public."StudentProfile" FOR ALL USING ( public.is_admin() );
CREATE POLICY "admin_all_payments" ON public."Payment" FOR ALL USING ( public.is_admin() );
CREATE POLICY "admin_all_classes" ON public."Class" FOR ALL USING ( public.is_admin() );
CREATE POLICY "admin_all_logs" ON public."AutomationLog" FOR ALL USING ( public.is_admin() );

-- 4. Opcional pero recomendado: Política de Admin para ClassNote y Task
DROP POLICY IF EXISTS "admin_all_notes" ON public."ClassNote";
CREATE POLICY "admin_all_notes" ON public."ClassNote" FOR ALL USING ( public.is_admin() );

DROP POLICY IF EXISTS "admin_all_tasks" ON public."Task";
CREATE POLICY "admin_all_tasks" ON public."Task" FOR ALL USING ( public.is_admin() );
