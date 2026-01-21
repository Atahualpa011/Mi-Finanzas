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

// --- Rutas de alertas ---
router.get('/alerts/all', budgetController.getUserAlerts); // Obtener alertas del usuario
router.post('/alerts/read-all', budgetController.markAllAlertsAsRead); // Marcar todas como leídas
router.post('/alerts/:id/read', budgetController.markAlertAsRead); // Marcar alerta como leída

module.exports = router;
