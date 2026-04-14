-- Agregar campos para Plan Mensual dinámico

-- En tabla Booking
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "totalPrice" INTEGER;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "isMonthlyPlan" BOOLEAN DEFAULT false;

-- En tabla Class
ALTER TABLE "Class" ADD COLUMN IF NOT EXISTS "needsRenewalReminder" BOOLEAN DEFAULT false;
ALTER TABLE "Class" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);

-- Comentarios
COMMENT ON COLUMN "Booking"."totalPrice" IS 'Precio total calculado dinámicamente para Plan Mensual';
COMMENT ON COLUMN "Booking"."isMonthlyPlan" IS 'Indica si es un Plan Mensual (vs clase individual)';
COMMENT ON COLUMN "Class"."needsRenewalReminder" IS 'Marcar penúltima clase para enviar recordatorio de renovación';
COMMENT ON COLUMN "Class"."expiresAt" IS 'Fecha de expiración de la clase';
