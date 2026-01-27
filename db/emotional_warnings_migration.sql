-- Migración: Agregar soporte para alertas emocionales en el sistema de sugerencias
-- Fecha: 2026-01-27
-- Descripción: Permite crear "sugerencias" tipo 'emotional_warning' para mostrar alertas
--              emocionales personalizadas en la página de movimientos

-- Modificar la tabla suggested_transactions para permitir NULL en campos que no aplican a alertas
ALTER TABLE suggested_transactions 
  MODIFY COLUMN group_id INT NULL,
  MODIFY COLUMN type VARCHAR(50) NULL,
  MODIFY COLUMN amount DECIMAL(10,2) NULL DEFAULT 0;

-- Nota: El campo 'type' ahora puede contener:
--   - 'expense' (gasto sugerido)
--   - 'income' (ingreso sugerido)
--   - 'emotional_warning' (alerta emocional)
--
-- Las alertas emocionales usan el campo 'description' con formato JSON:
-- {
--   "emotion": "Ansiedad/Estres",
--   "alertType": "high_spending_increase",
--   "message": "Tus gastos por ansiedad aumentaron 45% este mes",
--   "action": "Crear presupuesto emocional para controlar gastos impulsivos"
-- }
