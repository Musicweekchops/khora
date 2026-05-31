-- Migration 031: Create Product and Purchase tables for decoupled digital sales
-- Enables structured digital product management and omnichannel sales tracking.

-- 1. Create Product Table
CREATE TABLE IF NOT EXISTS public."Product" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- Price in CLP
  content_url TEXT NOT NULL, -- Delivery link (Drive, YouTube, course link)
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Purchase Table
CREATE TABLE IF NOT EXISTS public."Purchase" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public."StudentProfile"(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public."Product"(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
  amount_paid NUMERIC NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('MERCADOPAGO', 'MANUAL_TRANSFER', 'MANUAL_CASH', 'OTHER')),
  purchase_date DATE DEFAULT CURRENT_DATE NOT NULL,
  mp_payment_id TEXT UNIQUE, -- Mercado Pago payment reference ID to prevent duplicates
  status TEXT DEFAULT 'COMPLETED' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_student_product UNIQUE (student_id, product_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public."Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Purchase" ENABLE ROW LEVEL SECURITY;

-- 3. Security Policies for Product
-- Anyone can view products (to display them in the shop catalog)
DROP POLICY IF EXISTS "Anyone can view active products" ON public."Product";
CREATE POLICY "Anyone can view active products"
ON public."Product"
FOR SELECT
USING (is_active = true);

-- Teachers can manage their own products
DROP POLICY IF EXISTS "Teachers can manage their own products" ON public."Product";
CREATE POLICY "Teachers can manage their own products"
ON public."Product"
FOR ALL
USING (
  auth.uid() IN (
    SELECT user_id FROM public."TeacherProfile" WHERE id = teacher_id
  )
);

-- 4. Security Policies for Purchase
-- Students and Teachers can read/manage purchases
DROP POLICY IF EXISTS "Users can view their own purchases" ON public."Purchase";
CREATE POLICY "Users can view their own purchases"
ON public."Purchase"
FOR ALL
USING (
  auth.uid() IN (
    SELECT user_id FROM public."TeacherProfile" WHERE id = teacher_id
    UNION
    SELECT user_id FROM public."StudentProfile" WHERE id = student_id
  )
);
