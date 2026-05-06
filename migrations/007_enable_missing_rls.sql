-- Habilitar RLS para tablas reportadas por el linter de Supabase
-- Estas tablas parecen ser parte de sistemas de automatización, CRM o suscripción.

-- 1. Lead
ALTER TABLE IF EXISTS public."Lead" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lead_teacher_all" ON public."Lead";
DROP POLICY IF EXISTS "lead_anon_insert" ON public."Lead";

CREATE POLICY "lead_teacher_all" ON public."Lead" FOR ALL USING (public.is_teacher());
CREATE POLICY "lead_anon_insert" ON public."Lead" FOR INSERT WITH CHECK (true); -- Permitir captura desde formularios externos

-- 2. AutomationLog
ALTER TABLE IF EXISTS public."AutomationLog" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "automation_log_teacher_all" ON public."AutomationLog";
CREATE POLICY "automation_log_teacher_all" ON public."AutomationLog" FOR ALL USING (public.is_teacher());

-- 3. MonthlyLimits
ALTER TABLE IF EXISTS public."MonthlyLimits" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "monthly_limits_teacher_read" ON public."MonthlyLimits";
CREATE POLICY "monthly_limits_teacher_read" ON public."MonthlyLimits" FOR SELECT USING (public.is_teacher());

-- 4. PricingPlan
ALTER TABLE IF EXISTS public."PricingPlan" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pricing_plan_anon_read" ON public."PricingPlan";
CREATE POLICY "pricing_plan_anon_read" ON public."PricingPlan" FOR SELECT USING (true); -- Público para landing pages

-- 5. Subscription
ALTER TABLE IF EXISTS public."Subscription" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "subscription_teacher_read" ON public."Subscription";
CREATE POLICY "subscription_teacher_read" ON public."Subscription" FOR SELECT USING (public.is_teacher());

-- 6. ClassTypeRestriction
ALTER TABLE IF EXISTS public."ClassTypeRestriction" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ct_restriction_teacher_all" ON public."ClassTypeRestriction";
CREATE POLICY "ct_restriction_teacher_all" ON public."ClassTypeRestriction" FOR ALL USING (public.is_teacher());
