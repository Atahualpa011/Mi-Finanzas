-- =====================================================
-- MIGRACIÓN: Agregar soporte de moneda por transacción
-- Fecha: Enero 2026
-- Descripción: 
--   1. Agrega campos currency_code y currency_symbol a la tabla transactions
--      para permitir que cada transacción guarde la moneda utilizada.
--   
--   2. Agrega campo preferred_currency a users_data para que cada usuario
--      pueda configurar su moneda favorita (por defecto 'ARS').
--   
--   Transacciones antiguas quedarán con NULL (mostrarán moneda preferida del usuario)
-- =====================================================

USE appfinanzas;

-- 1. Agregar columnas de moneda a transactions
ALTER TABLE transactions 
ADD COLUMN currency_code VARCHAR(3) DEFAULT NULL COMMENT 'Código ISO de moneda (ARS, USD, EUR, BRL)' AFTER amount,
ADD COLUMN currency_symbol VARCHAR(5) DEFAULT NULL COMMENT 'Símbolo de moneda ($, US$, €, R$)' AFTER currency_code;

-- 2. Agregar moneda preferida a users_data
ALTER TABLE users_data
ADD COLUMN preferred_currency VARCHAR(3) DEFAULT 'ARS' COMMENT 'Moneda favorita del usuario (ARS, USD, EUR, BRL)' AFTER country;

-- Verificar que las columnas se agregaron correctamente
DESCRIBE transactions;
DESCRIBE users_data;

-- Consultas de ejemplo
-- SELECT id, amount, currency_code, currency_symbol, date FROM transactions ORDER BY date DESC LIMIT 10;
-- SELECT user_id, username, country, preferred_currency FROM users_data;

-- NOTA: Las nuevas transacciones guardarán automáticamente la moneda seleccionada
-- Las transacciones antiguas (currency_code = NULL) mostrarán la moneda preferida del usuario
