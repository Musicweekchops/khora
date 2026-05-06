-- Corrección de RLS para ClassNote: Permitir que los alumnos lean las notas de sus propias clases
-- Además, asegurar que los profesores puedan leer/escribir si la función is_teacher() falla por falta de metadata.

-- 1. Eliminar políticas antiguas si existen para recrearlas limpias
DROP POLICY IF EXISTS "cn_teacher_all" ON public."ClassNote";
DROP POLICY IF EXISTS "cn_teacher_manage" ON public."ClassNote";
DROP POLICY IF EXISTS "cn_student_read" ON public."ClassNote";

-- 2. Nueva política para Profesores (basada en propiedad de la clase, más robusta que is_teacher())
CREATE POLICY "cn_teacher_manage" ON public."ClassNote" 
FOR ALL 
USING (
  class_id IN (
    SELECT id FROM public."Class" 
    WHERE teacher_id IN (SELECT id FROM public."TeacherProfile" WHERE user_id = auth.uid())
  )
)
WITH CHECK (
  class_id IN (
    SELECT id FROM public."Class" 
    WHERE teacher_id IN (SELECT id FROM public."TeacherProfile" WHERE user_id = auth.uid())
  )
);

-- 3. Nueva política para Alumnos (solo lectura de sus propias clases)
CREATE POLICY "cn_student_read" ON public."ClassNote" 
FOR SELECT 
USING (
  class_id IN (
    SELECT id FROM public."Class" 
    WHERE student_id IN (SELECT id FROM public."StudentProfile" WHERE user_id = auth.uid())
  )
);

-- 4. Asegurar lo mismo para Tasks (Tareas)
DROP POLICY IF EXISTS "tk_teacher_all" ON public."Task";
DROP POLICY IF EXISTS "tk_teacher_manage" ON public."Task";
DROP POLICY IF EXISTS "tk_student_read" ON public."Task";
DROP POLICY IF EXISTS "tk_student_update" ON public."Task";

CREATE POLICY "tk_teacher_manage" ON public."Task"
FOR ALL
USING (
  teacher_id IN (SELECT id FROM public."TeacherProfile" WHERE user_id = auth.uid())
)
WITH CHECK (
  teacher_id IN (SELECT id FROM public."TeacherProfile" WHERE user_id = auth.uid())
);

CREATE POLICY "tk_student_read" ON public."Task"
FOR SELECT
USING (
  student_id IN (SELECT id FROM public."StudentProfile" WHERE user_id = auth.uid())
);

CREATE POLICY "tk_student_update" ON public."Task"
FOR UPDATE
USING (
  student_id IN (SELECT id FROM public."StudentProfile" WHERE user_id = auth.uid())
)
WITH CHECK (
  student_id IN (SELECT id FROM public."StudentProfile" WHERE user_id = auth.uid())
);
