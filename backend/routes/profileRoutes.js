const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authenticate = require('../middleware/authenticate'); // Middleware para proteger las rutas (requiere JWT)

// --- Obtener perfil del usuario autenticado ---
// GET /api/profile
router.get('/', authenticate, profileController.getProfile);
// - El frontend llama a este endpoint para mostrar los datos del perfil del usuario.
// - El middleware 'authenticate' verifica el token JWT antes de permitir el acceso.
// - El controlador 'getProfile' consulta la base de datos y responde con los datos del usuario.

// --- Actualizar perfil del usuario autenticado ---
// PUT /api/profile
router.put('/', authenticate, profileController.updateProfile);
// - El frontend llama a este endpoint para guardar cambios en el perfil.
// - El controlador 'updateProfile' actualiza los datos en la base de datos.

// --- Eliminar cuenta del usuario autenticado ---
// DELETE /api/profile/me
router.delete('/me', authenticate, profileController.deleteUser);
// - El frontend llama a este endpoint para eliminar la cuenta del usuario.
// - El controlador 'deleteUser' elimina el usuario y sus datos asociados.

// --- Buscar userId por email (para agregar amigos, etc.) ---
// POST /api/profile/by-email
router.post('/by-email', authenticate, profileController.getUserIdByEmail);
// - El frontend llama a este endpoint para buscar el userId de un usuario por su email (por ejemplo, al agregar amigos).
// - El controlador 'getUserIdByEmail' busca el usuario y responde con su ID.

module.exports = router; // Exporta el router para ser usado en server.js