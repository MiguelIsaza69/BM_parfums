-- Agregar límite de usos y fecha de expiración a la tabla de cupones
ALTER TABLE coupons ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE NULL;
ALTER TABLE coupons ADD COLUMN max_uses INTEGER NULL;
ALTER TABLE coupons ADD COLUMN current_uses INTEGER DEFAULT 0;

-- Nuevo: Columna para marcar el cupón dinámico de bienvenida
ALTER TABLE coupons ADD COLUMN is_welcome BOOLEAN DEFAULT FALSE;
