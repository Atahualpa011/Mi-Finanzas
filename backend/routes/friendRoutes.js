const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const authenticate = require('../middleware/authenticate'); // Middleware para proteger las rutas (requiere JWT)

// --- Listar amigos confirmados ---
// GET /api/friends
router.get('/', authenticate, friendController.list);
// - El frontend llama a este endpoint para mostrar la lista de amigos confirmados del usuario.
// - El middleware 'authenticate' verifica el token JWT antes de permitir el acceso.
// - El controlador 'list' consulta el modelo y responde con la lista de amigos en JSON.

// --- Agregar amigo (enviar solicitud o aceptar si ya existe) ---
// POST /api/friends
router.post('/', authenticate, friendController.add);
// - El frontend llama a este endpoint al enviar el formulario para agregar un amigo por email.
// - El controlador 'add' agrega la relación en la base de datos y responde con éxito o error.

// --- Listar solicitudes de amistad pendientes recibidas ---
// GET /api/friends/pending
router.get('/pending', authenticate, friendController.pending);
// - El frontend llama a este endpoint para mostrar las solicitudes de amistad pendientes.
// - El controlador 'pending' responde con la lista de solicitudes recibidas.

// --- Responder a una solicitud de amistad (aceptar o rechazar) ---
// POST /api/friends/respond
router.post('/respond', authenticate, friendController.respond);
// - El frontend llama a este endpoint para aceptar o rechazar una solicitud de amistad.
// - El controlador 'respond' actualiza el estado de la solicitud en la base de datos.

// --- Elimina un amigo ---
// DELETE /api/friends/:friendId
router.delete('/:friendId', authenticate, friendController.delete);
// - El frontend llama a este endpoint para eliminar un amigo de la lista.
// - El controlador 'delete' elimina la relación de amistad en la base de datos.

// --- Bloquear a un amigo ---
// POST /api/friends/:id/block
router.post('/:id/block', authenticate, friendController.blockFriend);
// - El frontend llama a este endpoint para bloquear a un amigo.
// - El controlador 'blockFriend' actualiza el estado de la relación en la base de datos.

// --- Desbloquear a un amigo ---
// POST /api/friends/:id/unblock
router.post('/:id/unblock', authenticate, friendController.unblockFriend);
// - El frontend llama a este endpoint para desbloquear a un amigo.
// - El controlador 'unblockFriend' actualiza el estado de la relación en la base de datos.

// --- Obtener estadísticas de un amigo ---
// GET /api/friends/:id/stats
router.get('/:id/stats', authenticate, friendController.getFriendStats);
// - El frontend llama a este endpoint para obtener estadísticas de un amigo.
// - El controlador 'getFriendStats' responde con los datos estadísticos del amigo.

module.exports = router; // Exporta el router para ser usado en server.js