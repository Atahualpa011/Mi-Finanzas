const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transferController');
const authenticate = require('../middleware/authenticate'); // Middleware para proteger las rutas (requiere JWT)

// --- Crear una transferencia para saldar deuda con un amigo ---
// POST /api/transfers
router.post('/', authenticate, transferController.create);
// - El frontend llama a este endpoint para saldar una deuda con un amigo.
// - El middleware 'authenticate' verifica el token JWT antes de permitir el acceso.
// - El controlador 'create' valida la deuda, registra la transferencia y actualiza los saldos.

// --- Listar transferencias realizadas o recibidas por el usuario ---
// GET /api/transfers
router.get('/', authenticate, transferController.list);
// - El frontend llama a este endpoint para mostrar el historial de transferencias del usuario.
// - El controlador 'list' consulta la base de datos y responde con el array de transferencias en JSON.

module.exports = router; // Exporta el router para ser usado en server.js