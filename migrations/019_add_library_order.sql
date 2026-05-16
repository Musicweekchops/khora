-- 019_add_library_order.sql

-- Agregar columna de orden a LibraryContent
ALTER TABLE public."LibraryContent"
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Notificar a postgrest para refrescar esquema
NOTIFY pgrst, 'reload schema';
