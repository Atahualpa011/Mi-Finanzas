const express = require('express');
const router = express.Router();
const controller = require('../controllers/suggestedTransactionController');
const authenticate = require('../middleware/authenticate'); // Middleware para proteger las rutas (requiere JWT)

// --- Listar sugerencias de movimientos personales pendientes ---
// GET /api/suggested-transactions
router.get('/', authenticate, controller.listPending);
// - El frontend llama a este endpoint para mostrar las sugerencias de movimientos (gastos/ingresos) provenientes de grupos.
// - El middleware 'authenticate' verifica el token JWT antes de permitir el acceso.
// - El controlador 'listPending' consulta la base de datos y responde con el array de sugerencias pendientes en JSON.

// --- Aceptar una sugerencia de movimiento ---
// POST /api/suggested-transactions/:id/accept
router.post('/:id/accept', authenticate, controller.accept);
// - El frontend llama a este endpoint cuando el usuario acepta una sugerencia desde el modal.
// - El controlador 'accept' crea el movimiento personal y marca la sugerencia como aceptada.

// --- Rechazar una sugerencia de movimiento ---
// POST /api/suggested-transactions/:id/reject
router.post('/:id/reject', authenticate, controller.reject);
// - El frontend llama a este endpoint cuando el usuario rechaza una sugerencia desde el modal.
// - El controlador 'reject' marca la sugerencia como rechazada (no se crea el movimiento personal).

module.exports = router; // Exporta el router para ser usado en otros módulos