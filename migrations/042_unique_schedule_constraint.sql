-- Migration 042: Add unique constraint on Schedule to prevent duplicates
--
-- Problema: Era posible crear dos Schedule idénticos para el mismo alumno
-- con el mismo horario (mismo día + hora de inicio), generando clases duplicadas.
-- Esto ocurría por doble-click o re-renders en el frontend.
--
-- Solución: Unique constraint a nivel de base de datos como última línea de defensa.

ALTER TABLE public."Schedule"
ADD CONSTRAINT unique_student_teacher_schedule
UNIQUE (student_id, teacher_id, day_of_week, start_time);
