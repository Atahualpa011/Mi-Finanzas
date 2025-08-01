const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authenticate = require('../middleware/authenticate'); // Middleware para proteger las rutas (requiere JWT)

// --- Listar todas las transacciones del usuario autenticado ---
// GET /api/transactions
router.get('/', authenticate, transactionController.getAll);
// - El frontend llama a este endpoint para mostrar la lista de movimientos (gastos e ingresos) del usuario.
// - El middleware 'authenticate' verifica el token JWT antes de permitir el acceso.
// - El controlador 'getAll' consulta la base de datos y responde con el array de transacciones en JSON.

// --- Crear una nueva transacción (gasto o ingreso) ---
// POST /api/transactions
router.post('/', authenticate, transactionController.create);
// - El frontend llama a este endpoint al guardar el formulario de nueva transacción.
// - El controlador 'create' valida y guarda la transacción (y sus detalles) en la base de datos.

// --- Eliminar una transacción del usuario autenticado ---
// DELETE /api/transactions/:id
router.delete('/:id', authenticate, transactionController.delete);
// - El frontend llama a este endpoint para eliminar una transacción específica.
// - El controlador 'delete' elimina la transacción solo si pertenece al usuario autenticado.

module.exports = router; // Exporta el router para ser usado en server.js