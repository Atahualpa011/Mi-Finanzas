const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const botController = require('../controllers/botController');

// Todas las rutas requieren autenticación
router.use(authenticate);

// POST /api/telegram/generate-link-code - Generar código de vinculación
router.post('/generate-link-code', botController.generateLinkCode);

// GET /api/telegram/status - Obtener estado de vinculación
router.get('/status', botController.getTelegramStatus);

// DELETE /api/telegram/unlink - Desvincular cuenta de Telegram
router.delete('/unlink', botController.unlinkTelegram);

// PUT /api/telegram/notifications - Actualizar preferencias de notificaciones
router.put('/notifications', botController.updateNotifications);

module.exports = router;
