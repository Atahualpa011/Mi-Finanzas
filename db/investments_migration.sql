-- =====================================================
-- MIGRACIÓN: Sistema de Inversiones
-- Fecha: Enero 2026
-- Descripción: 
--   1. Crea tabla 'investments' para registrar inversiones del usuario
--      (plazo fijo, acciones, cripto, fondos, bonos, inmuebles, etc.)
--   
--   2. Crea tabla 'investment_valuations' para el historial de 
--      actualizaciones de valor de cada inversión
--   
--   Características:
--   - Soporte multi-moneda (reutiliza sistema existente)
--   - Cálculo automático de ganancia/pérdida
--   - Estados: activa, cerrada
--   - Historial completo de valuaciones
-- =====================================================

USE appfinanzas;

-- 1. Tabla principal de inversiones
CREATE TABLE IF NOT EXISTS investments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM('plazo_fijo', 'acciones', 'cripto', 'fondos', 'bonos', 'inmuebles', 'otros') NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  initial_amount DECIMAL(15,2) NOT NULL,
  currency_code VARCHAR(3) DEFAULT 'ARS' COMMENT 'Código ISO de moneda (ARS, USD, EUR, BRL)',
  currency_symbol VARCHAR(5) DEFAULT '$' COMMENT 'Símbolo de moneda ($, US$, €, R$)',
  platform VARCHAR(100) COMMENT 'Plataforma o entidad donde se invierte',
  investment_date DATE NOT NULL,
  status ENUM('active', 'closed') DEFAULT 'active',
  close_date DATE,
  final_amount DECIMAL(15,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_status (user_id, status),
  INDEX idx_investment_date (investment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Inversiones registradas por usuarios';

-- 2. Tabla de historial de valuaciones
CREATE TABLE IF NOT EXISTS investment_valuations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  investment_id INT NOT NULL,
  valuation_date DATE NOT NULL,
  current_value DECIMAL(15,2) NOT NULL,
  notes TEXT COMMENT 'Notas opcionales (ej: dividendos, splits)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE,
  INDEX idx_investment_date (investment_id, valuation_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Historial de valuaciones de inversiones';

-- Verificar que las tablas se crearon correctamente
DESCRIBE investments;
DESCRIBE investment_valuations;

-- Consultas de ejemplo
-- SELECT * FROM investments WHERE user_id = 1 ORDER BY investment_date DESC;
-- SELECT * FROM investment_valuations WHERE investment_id = 1 ORDER BY valuation_date DESC;

-- NOTA: 
-- La ganancia/pérdida se calculará en el backend para mayor flexibilidad
-- Al crear una inversión, automáticamente se crea la primera valuación con el monto inicial
