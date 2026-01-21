-- ============================================================================
-- GAMIFICATION MIGRATION - FASE 5
-- Sistema de logros, rachas, desafíos y niveles
-- ============================================================================

-- Tabla de definición de logros (achievements)
-- Almacena todos los logros disponibles en el sistema
DROP TABLE IF EXISTS `achievements`;
CREATE TABLE `achievements` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `code` VARCHAR(50) UNIQUE NOT NULL COMMENT 'Identificador único del logro',
  `name` VARCHAR(100) NOT NULL COMMENT 'Nombre del logro',
  `description` TEXT COMMENT 'Descripción de cómo obtener el logro',
  `category` ENUM('savings', 'discipline', 'social', 'streaks', 'milestones') NOT NULL COMMENT 'Categoría del logro',
  `icon` VARCHAR(50) COMMENT 'Clase de ícono (ej: bi-trophy)',
  `points` INT DEFAULT 0 COMMENT 'Puntos de experiencia que otorga',
  `target_value` INT DEFAULT NULL COMMENT 'Valor objetivo para logros progresivos',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla de logros desbloqueados por usuarios
DROP TABLE IF EXISTS `user_achievements`;
CREATE TABLE `user_achievements` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `achievement_id` INT NOT NULL,
  `unlocked_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de desbloqueo',
  `progress` INT DEFAULT 100 COMMENT 'Progreso del logro (0-100)',
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`achievement_id`) REFERENCES `achievements`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_user_achievement` (`user_id`, `achievement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla de rachas (streaks)
-- Rastrea días consecutivos de registro de transacciones
DROP TABLE IF EXISTS `user_streaks`;
CREATE TABLE `user_streaks` (
  `user_id` INT PRIMARY KEY,
  `current_streak` INT DEFAULT 0 COMMENT 'Racha actual de días consecutivos',
  `longest_streak` INT DEFAULT 0 COMMENT 'Racha más larga alcanzada',
  `last_transaction_date` DATE COMMENT 'Última fecha de transacción registrada',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla de desafíos/misiones
-- Define los desafíos disponibles en el sistema
DROP TABLE IF EXISTS `challenges`;
CREATE TABLE `challenges` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `code` VARCHAR(50) UNIQUE NOT NULL COMMENT 'Identificador único del desafío',
  `name` VARCHAR(100) NOT NULL COMMENT 'Nombre del desafío',
  `description` TEXT COMMENT 'Descripción del desafío',
  `type` ENUM('daily', 'weekly', 'monthly', 'permanent') NOT NULL COMMENT 'Tipo de desafío',
  `target_value` INT NOT NULL COMMENT 'Valor objetivo a alcanzar',
  `reward_points` INT DEFAULT 0 COMMENT 'Puntos de recompensa al completar',
  `category_id` INT DEFAULT NULL COMMENT 'Categoría específica si aplica',
  `start_date` DATE COMMENT 'Fecha de inicio (para desafíos temporales)',
  `end_date` DATE COMMENT 'Fecha de fin (para desafíos temporales)',
  `is_active` BOOLEAN DEFAULT TRUE COMMENT 'Si el desafío está activo',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla de progreso de desafíos por usuario
DROP TABLE IF EXISTS `user_challenges`;
CREATE TABLE `user_challenges` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `challenge_id` INT NOT NULL,
  `current_progress` INT DEFAULT 0 COMMENT 'Progreso actual',
  `target_value` INT NOT NULL COMMENT 'Valor objetivo (copia del desafío)',
  `status` ENUM('active', 'completed', 'failed', 'expired') DEFAULT 'active' COMMENT 'Estado del desafío',
  `started_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de inicio',
  `completed_at` TIMESTAMP NULL COMMENT 'Fecha de finalización',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`challenge_id`) REFERENCES `challenges`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_user_challenge` (`user_id`, `challenge_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla de experiencia y niveles de usuario
DROP TABLE IF EXISTS `user_levels`;
CREATE TABLE `user_levels` (
  `user_id` INT PRIMARY KEY,
  `level` INT DEFAULT 1 COMMENT 'Nivel actual del usuario',
  `experience_points` INT DEFAULT 0 COMMENT 'Puntos de experiencia acumulados',
  `total_achievements` INT DEFAULT 0 COMMENT 'Total de logros desbloqueados',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- INSERCIÓN DE LOGROS PREDEFINIDOS
-- ============================================================================

-- Categoría: MILESTONES (Hitos importantes)
INSERT INTO `achievements` (`code`, `name`, `description`, `category`, `icon`, `points`, `target_value`) VALUES
('first_transaction', 'Primera Transacción', 'Registra tu primera transacción en la app', 'milestones', 'bi-star-fill', 10, 1),
('transactions_10', 'Novato Financiero', 'Registra 10 transacciones', 'milestones', 'bi-graph-up', 20, 10),
('transactions_50', 'Registrador Activo', 'Registra 50 transacciones', 'milestones', 'bi-clipboard-check', 50, 50),
('transactions_100', 'Experto en Finanzas', 'Registra 100 transacciones', 'milestones', 'bi-trophy', 100, 100),
('transactions_500', 'Maestro Financiero', 'Registra 500 transacciones', 'milestones', 'bi-award', 250, 500),
('transactions_1000', 'Leyenda Financiera', 'Registra 1000 transacciones', 'milestones', 'bi-gem', 500, 1000);

-- Categoría: STREAKS (Rachas)
INSERT INTO `achievements` (`code`, `name`, `description`, `category`, `icon`, `points`, `target_value`) VALUES
('streak_3', 'Constancia Inicial', 'Registra transacciones 3 días seguidos', 'streaks', 'bi-fire', 15, 3),
('streak_7', 'Semana Perfecta', 'Registra transacciones 7 días seguidos', 'streaks', 'bi-calendar-week', 30, 7),
('streak_14', 'Dos Semanas de Oro', 'Registra transacciones 14 días seguidos', 'streaks', 'bi-calendar2-week', 60, 14),
('streak_30', 'Mes Imparable', 'Registra transacciones 30 días seguidos', 'streaks', 'bi-calendar-month', 120, 30),
('streak_60', 'Racha Épica', 'Registra transacciones 60 días seguidos', 'streaks', 'bi-lightning', 250, 60),
('streak_100', 'Dedicación Absoluta', 'Registra transacciones 100 días seguidos', 'streaks', 'bi-lightning-fill', 500, 100);

-- Categoría: DISCIPLINE (Disciplina presupuestaria)
INSERT INTO `achievements` (`code`, `name`, `description`, `category`, `icon`, `points`, `target_value`) VALUES
('first_budget', 'Primer Presupuesto', 'Crea tu primer presupuesto', 'discipline', 'bi-piggy-bank', 15, 1),
('budget_met_weekly', 'Disciplina Semanal', 'Cumple un presupuesto semanal sin excederlo', 'discipline', 'bi-check-circle', 25, 1),
('budget_met_monthly', 'Disciplina Mensual', 'Cumple un presupuesto mensual sin excederlo', 'discipline', 'bi-check-circle-fill', 50, 1),
('budget_met_3months', 'Guardián del Presupuesto', 'Cumple presupuestos durante 3 meses consecutivos', 'discipline', 'bi-shield-check', 150, 3),
('budgets_5', 'Planificador Avanzado', 'Gestiona 5 presupuestos simultáneamente', 'discipline', 'bi-bar-chart-steps', 75, 5),
('zero_alerts', 'Presupuesto Perfecto', 'Pasa un mes sin alertas de presupuesto', 'discipline', 'bi-emoji-smile', 100, 1);

-- Categoría: SOCIAL (Interacción social)
INSERT INTO `achievements` (`code`, `name`, `description`, `category`, `icon`, `points`, `target_value`) VALUES
('first_friend', 'Primera Amistad', 'Agrega tu primer amigo', 'social', 'bi-person-plus', 10, 1),
('friends_5', 'Círculo Social', 'Agrega 5 amigos', 'social', 'bi-people', 30, 5),
('friends_10', 'Red de Contactos', 'Agrega 10 amigos', 'social', 'bi-person-lines-fill', 75, 10),
('first_group', 'Creador de Grupo', 'Crea tu primer grupo', 'social', 'bi-diagram-3', 15, 1),
('groups_3', 'Organizador Social', 'Crea 3 grupos diferentes', 'social', 'bi-collection', 50, 3),
('first_transfer', 'Primera Transferencia', 'Realiza tu primera transferencia a un amigo', 'social', 'bi-arrow-left-right', 10, 1),
('transfers_10', 'Generoso', 'Realiza 10 transferencias', 'social', 'bi-cash-coin', 50, 10),
('group_expense_10', 'Gasto Compartido', 'Registra 10 gastos grupales', 'social', 'bi-receipt', 40, 10);

-- Categoría: SAVINGS (Ahorro)
INSERT INTO `achievements` (`code`, `name`, `description`, `category`, `icon`, `points`, `target_value`) VALUES
('first_income', 'Primer Ingreso', 'Registra tu primer ingreso', 'savings', 'bi-wallet2', 10, 1),
('positive_balance', 'Balance Positivo', 'Alcanza un balance positivo', 'savings', 'bi-graph-up-arrow', 20, 1),
('save_10k', 'Ahorrador Novato', 'Acumula un balance de $10,000', 'savings', 'bi-piggy-bank', 50, 10000),
('save_50k', 'Ahorrador Intermedio', 'Acumula un balance de $50,000', 'savings', 'bi-piggy-bank-fill', 100, 50000),
('save_100k', 'Ahorrador Experto', 'Acumula un balance de $100,000', 'savings', 'bi-safe', 200, 100000),
('save_500k', 'Maestro del Ahorro', 'Acumula un balance de $500,000', 'savings', 'bi-safe-fill', 500, 500000);

-- ============================================================================
-- INSERCIÓN DE DESAFÍOS PERMANENTES
-- ============================================================================

INSERT INTO `challenges` (`code`, `name`, `description`, `type`, `target_value`, `reward_points`, `is_active`) VALUES
('daily_register', 'Registro Diario', 'Registra al menos 1 transacción hoy', 'daily', 1, 5, TRUE),
('weekly_5_transactions', 'Semana Activa', 'Registra 5 transacciones esta semana', 'weekly', 5, 20, TRUE),
('monthly_budget_discipline', 'Disciplina Mensual', 'No excedas ningún presupuesto este mes', 'monthly', 1, 50, TRUE),
('monthly_savings', 'Ahorro Mensual', 'Ahorra al menos $10,000 este mes', 'monthly', 10000, 75, TRUE);

-- ============================================================================
-- ÍNDICES PARA OPTIMIZAR CONSULTAS
-- ============================================================================

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);
CREATE INDEX idx_user_challenges_user ON user_challenges(user_id);
CREATE INDEX idx_user_challenges_status ON user_challenges(status);
CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_challenges_active ON challenges(is_active);

-- ============================================================================
-- FIN DE MIGRATION
-- ============================================================================
