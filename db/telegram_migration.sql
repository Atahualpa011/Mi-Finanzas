-- ============================================
-- MIGRACIÓN: Sistema de Chatbot Telegram
-- Fecha: 2026-01-28
-- Descripción: Tablas necesarias para vincular
-- cuentas de Telegram con usuarios de Mi-Finanzas
-- ============================================

-- Tabla para vincular usuarios con Telegram
-- Almacena la relación entre user_id (app) y telegram_id (Telegram)
CREATE TABLE IF NOT EXISTS telegram_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,                           -- ID del usuario en la app Mi-Finanzas
    telegram_id BIGINT UNIQUE NOT NULL,             -- ID único de Telegram del usuario
    telegram_username VARCHAR(100),                 -- Username de Telegram (puede cambiar)
    telegram_first_name VARCHAR(100),               -- Nombre en Telegram
    is_active BOOLEAN DEFAULT TRUE,                 -- Si la vinculación está activa
    notifications_enabled BOOLEAN DEFAULT TRUE,     -- Si quiere recibir notificaciones
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Fecha de vinculación
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para optimización de consultas frecuentes
CREATE INDEX idx_telegram_users_telegram_id ON telegram_users(telegram_id);
CREATE INDEX idx_telegram_users_user_id ON telegram_users(user_id);

-- Tabla para códigos de vinculación temporales
-- El usuario genera un código en la web y lo envía al bot
CREATE TABLE IF NOT EXISTS telegram_link_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,                           -- Usuario que generó el código
    code VARCHAR(6) NOT NULL,                       -- Código de 6 caracteres alfanumérico
    expires_at TIMESTAMP NOT NULL,                  -- Expira en 5 minutos
    used BOOLEAN DEFAULT FALSE,                     -- Si ya fue utilizado
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índice para buscar códigos rápidamente
CREATE INDEX idx_telegram_link_codes_code ON telegram_link_codes(code);
CREATE INDEX idx_telegram_link_codes_user_id ON telegram_link_codes(user_id);

-- ============================================
-- INSTRUCCIONES DE EJECUCIÓN:
-- 1. Conectar a MySQL: mysql -u root -p
-- 2. Usar la base de datos: USE appfinanzas;
-- 3. Ejecutar este script: SOURCE db/telegram_migration.sql;
-- ============================================
