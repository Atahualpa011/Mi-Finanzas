const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const authenticate = require('../middleware/authenticate');

// Aplicar autenticación a todas las rutas
router.use(authenticate);

// --- Rutas de presupuestos personales ---
router.get('/', budgetController.getBudgets);              // Listar presupuestos con progreso
router.post('/', budgetController.createBudget);           // Crear presupuesto
router.get('/:id', budgetController.getBudget);            // Obtener presupuesto específico
router.put('/:id', budgetController.updateBudget);         // Actualizar presupuesto
router.delete('/:id', budgetController.deleteBudget);      // Eliminar presupuesto

module.exports = router;
