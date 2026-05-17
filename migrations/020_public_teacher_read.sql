-- Permitir que usuarios anónimos lean información de los profesores
-- Esto es necesario para que el enlace de invitación (khora.com/unirse?teacherId=...) 
-- pueda resolver el nombre del profesor antes de que el alumno se registre.

CREATE POLICY "tp_anon_read" ON public."TeacherProfile" FOR SELECT USING (true);
CREATE POLICY "user_anon_read" ON public."User" FOR SELECT USING (role = 'TEACHER');

NOTIFY pgrst, 'reload schema';
