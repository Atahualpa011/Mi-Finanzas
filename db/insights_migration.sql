-- =====================================================
-- MIGRACIÓN: Sistema de Insights y Recomendaciones IA
-- Fecha: Enero 2026
-- Descripción: Tablas para rate limiting y snapshots
-- =====================================================

USE appfinanzas;

-- Tabla para rate limiting de requests a la IA
CREATE TABLE IF NOT EXISTS insights_rate_limit (
  user_id INT PRIMARY KEY,
  last_request_at TIMESTAMP NULL DEFAULT NULL,
  requests_today INT DEFAULT 0,
  requests_this_month INT DEFAULT 0,
  last_reset_date DATE DEFAULT NULL COMMENT 'Última fecha de reset diario',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, last_request_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla para guardar snapshots de recomendaciones (trazabilidad)
CREATE TABLE IF NOT EXISTS insights_snapshots (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  metrics_json TEXT COMMENT 'Métricas calculadas (JSON)',
  findings_json TEXT COMMENT 'Hallazgos generados (JSON)',
  recommendations_json TEXT COMMENT 'Recomendaciones IA (JSON)',
  ai_model_used VARCHAR(50) COMMENT 'Modelo de IA usado (gpt-4o-mini, claude-3.5-sonnet, etc.)',
  generation_time_ms INT COMMENT 'Tiempo de respuesta de la IA en milisegundos',
  is_ai_generated BOOLEAN DEFAULT TRUE COMMENT 'TRUE si usó IA, FALSE si fue fallback',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_created (user_id, created_at DESC),
  INDEX idx_period (period_start, period_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Verificar creación
SHOW TABLES LIKE 'insights%';
DESCRIBE insights_rate_limit;
DESCRIBE insights_snapshots;
