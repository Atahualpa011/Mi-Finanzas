-- Modificar category_id para permitir NULL en presupuestos emocionales
-- Este campo será NULL cuando is_emotional = TRUE

ALTER TABLE budgets 
MODIFY COLUMN category_id INT NULL;
