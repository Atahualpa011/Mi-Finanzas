-- Migration: Crear tabla de presupuestos
-- Fecha: Enero 2026
-- Descripción: Sistema de presupuestos personales y grupales

-- Tabla de presupuestos personales
CREATE TABLE IF NOT EXISTS budgets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  period ENUM('monthly', 'weekly', 'yearly') DEFAULT 'monthly',
  start_date DATE NOT NULL,
  end_date DATE,
  alert_threshold INT DEFAULT 80 COMMENT 'Porcentaje para alertas (80% = aviso al llegar al 80%)',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  INDEX idx_user_active (user_id, is_active),
  INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla de presupuestos grupales
CREATE TABLE IF NOT EXISTS group_budgets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  group_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  period ENUM('monthly', 'weekly', 'yearly') DEFAULT 'monthly',
  start_date DATE NOT NULL,
  end_date DATE,
  alert_threshold INT DEFAULT 80 COMMENT 'Porcentaje para alertas',
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT NOT NULL COMMENT 'user_id del creador',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES groups_(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_group_active (group_id, is_active),
  INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla de alertas de presupuesto
CREATE TABLE IF NOT EXISTS budget_alerts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  budget_id INT,
  group_budget_id INT,
  user_id INT NOT NULL COMMENT 'Usuario que recibe la alerta',
  alert_type ENUM('threshold', 'exceeded', 'approaching') NOT NULL,
  percentage_used DECIMAL(5,2) NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
  FOREIGN KEY (group_budget_id) REFERENCES group_budgets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_unread (user_id, is_read),
  CHECK ((budget_id IS NOT NULL AND group_budget_id IS NULL) OR (budget_id IS NULL AND group_budget_id IS NOT NULL))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
