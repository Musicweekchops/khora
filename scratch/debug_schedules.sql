-- Paso 1: Ver cuáles son los schedules fantasmas (0 clases) para confirmar
SELECT s.id, s.student_id, s.teacher_id, s.day_of_week, s.start_time, s.end_time, s.start_date
FROM public."Schedule" s
LEFT JOIN public."Class" c ON c.schedule_id = s.id
GROUP BY s.id
HAVING COUNT(c.id) = 0;

-- Paso 2: Borrar los schedules fantasmas (sin clases)
-- ⚠️ REVISAR el Paso 1 antes de ejecutar esto
DELETE FROM public."Schedule"
WHERE id IN (
  SELECT s.id
  FROM public."Schedule" s
  LEFT JOIN public."Class" c ON c.schedule_id = s.id
  GROUP BY s.id
  HAVING COUNT(c.id) = 0
);
