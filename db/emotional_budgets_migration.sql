-- Migración: Sistema de Presupuestos Emocionales
-- Fecha: 2026-01-27
-- Descripción: Permite crear presupuestos filtrados por emoción específica para controlar
--              gastos impulsivos asociados a ciertas emociones (ansiedad, estrés, etc.)

-- Agregar campo emotion_filter a la tabla budgets (presupuestos personales)
ALTER TABLE budgets 
  ADD COLUMN emotion_filter VARCHAR(50) NULL AFTER category_id,
  ADD COLUMN is_emotional BOOLEAN DEFAULT FALSE AFTER emotion_filter;

-- Agregar campo emotion_filter a la tabla group_budgets (presupuestos grupales)
-- NOTA: group_budgets NO tiene category_id, así que agregamos después de group_id
ALTER TABLE group_budgets
  ADD COLUMN emotion_filter VARCHAR(50) NULL AFTER group_id,
  ADD COLUMN is_emotional BOOLEAN DEFAULT FALSE AFTER emotion_filter;

-- Índices para mejorar el rendimiento de consultas por emoción
CREATE INDEX idx_budgets_emotion ON budgets(emotion_filter);
CREATE INDEX idx_group_budgets_emotion ON group_budgets(emotion_filter);

-- COMENTARIOS SOBRE USO:
-- 
-- emotion_filter: Almacena la emoción específica a la que aplica el presupuesto
--                 Valores posibles: 'Felicidad', 'Alivio', 'Culpa', 'Ansiedad/Estres',
--                 'Arrepentimiento', 'Frustracion', 'Verguenza', 'Indiferencia',
--                 'Ambivalencia', 'Orgullo', 'Generosidad/Amor', 'Emocion/Entusiasmo'
--                 NULL = presupuesto normal (sin filtro emocional)
--
-- is_emotional: Flag booleano para identificar rápidamente presupuestos emocionales
--               TRUE = es un presupuesto emocional (tiene emotion_filter)
--               FALSE = es un presupuesto normal
--
-- EJEMPLO DE USO:
-- INSERT INTO budgets (user_id, name, amount, period, threshold, category_id, emotion_filter, is_emotional)
-- VALUES (7, 'Control de Ansiedad', 50000, 'monthly', 80, NULL, 'Ansiedad/Estres', TRUE);
--
-- Este presupuesto solo contaría gastos que:
-- 1. Pertenezcan al usuario 7
-- 2. Tengan la emoción 'Ansiedad/Estres' asociada
-- 3. Estén en el período mensual actual
-- 
-- Permitiría al usuario controlar gastos impulsivos por ansiedad con un límite de $50,000/mes
