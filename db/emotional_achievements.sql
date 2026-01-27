-- ============================================================================
-- EMOTIONAL ACHIEVEMENTS - Sistema de Logros Emocionales
-- Migración para agregar logros relacionados con control emocional
-- ============================================================================

-- Categoría: EMOTIONAL (Nueva categoría para logros emocionales)
-- NOTA: Primero hay que modificar el ENUM de la tabla achievements

-- Paso 1: Modificar el ENUM para agregar la categoría 'emotional'
ALTER TABLE `achievements` 
MODIFY COLUMN `category` ENUM('savings', 'discipline', 'social', 'streaks', 'milestones', 'emotional', 'investments') NOT NULL 
COMMENT 'Categoría del logro';

-- Paso 2: Insertar los 8 logros emocionales

INSERT INTO `achievements` (`code`, `name`, `description`, `category`, `icon`, `points`, `target_value`) VALUES

-- Logro 1: Primera emoción registrada
('emotional_awareness_1', 'Conciencia Emocional', 'Registra tu primera transacción con emoción asociada', 'emotional', 'bi-emoji-smile', 15, 1),

-- Logro 2: 10 transacciones con emoción
('emotional_tracker_10', 'Rastreador Emocional', 'Registra 10 transacciones con emociones asociadas', 'emotional', 'bi-heart-pulse', 25, 10),

-- Logro 3: 50 transacciones con emoción
('emotional_master_50', 'Maestro Emocional', 'Registra 50 transacciones con emociones asociadas', 'emotional', 'bi-journal-check', 50, 50),

-- Logro 4: Reducir gastos negativos 20% vs mes anterior
('emotional_control_1', 'Control Emocional', 'Reduce tus gastos por emociones negativas en 20% respecto al mes anterior', 'emotional', 'bi-shield-check', 100, 20),

-- Logro 5: 80% de gastos con emociones positivas
('positive_investor', 'Inversor Positivo', 'Logra que el 80% de tus gastos sean con emociones positivas', 'emotional', 'bi-emoji-laughing', 75, 80),

-- Logro 6: Mantener menos de 30% gastos negativos por 3 meses
('emotional_balance_3m', 'Equilibrio Emocional', 'Mantén menos del 30% de gastos negativos durante 3 meses consecutivos', 'emotional', 'bi-yin-yang', 150, 3),

-- Logro 7: Identificar emoción más cara (analizar correlaciones)
('self_awareness', 'Autoconocimiento', 'Visita la página de análisis emocional y revisa tus patrones', 'emotional', 'bi-lightbulb', 30, 1),

-- Logro 8: 5 días seguidos sin gastos por ansiedad/estrés
('mindful_spender', 'Gasto Consciente', 'Pasa 5 días consecutivos sin gastos asociados a ansiedad o estrés', 'emotional', 'bi-peace', 80, 5);

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
-- Para verificar que se insertaron correctamente:
-- SELECT * FROM achievements WHERE category = 'emotional';
