const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController'); // Controlador con la lógica de categorías
const authenticate = require('../middleware/authenticate');             // Middleware para proteger la ruta (requiere JWT)

// --- Ruta para obtener todas las categorías ---
// GET /api/categories
router.get('/', authenticate, categoryController.getAll);
// - El frontend llama a este endpoint para obtener la lista de categorías (por ejemplo, al crear o editar una transacción).
// - El middleware 'authenticate' verifica el token JWT antes de permitir el acceso.
// - El controlador 'getAll' consulta la base de datos y responde con el array de categorías en JSON.

module.exports = router; // Exporta el router para ser usado en server.js