const telegramUserModel = require('../models/telegramUserModel');
const authenticate = require('../middleware/authenticate');

// --- Generar código de vinculación de Telegram ---
// El usuario autenticado genera un código para vincular su Telegram
async function generateLinkCode(req, res) {
    try {
        const userId = req.user.userId;

        // Verificar si ya tiene Telegram vinculado
        const existing = await telegramUserModel.findByUserId(userId);
        if (existing) {
            return res.status(400).json({
                error: 'Ya tienes una cuenta de Telegram vinculada',
                telegramUsername: existing.telegram_username
            });
        }

        // Generar código de vinculación
        const code = await telegramUserModel.createLinkCode(userId);

        return res.json({
            code: code,
            expiresIn: '5 minutos',
            instructions: 'Envía este código al bot de Telegram @TuBotFinanzas para vincular tu cuenta'
        });

    } catch (error) {
        console.error('Error al generar código de vinculación:', error);
        return res.status(500).json({ error: 'No se pudo generar el código' });
    }
}

// --- Obtener estado de vinculación de Telegram ---
async function getTelegramStatus(req, res) {
    try {
        const userId = req.user.userId;

        const linkedAccount = await telegramUserModel.findByUserId(userId);

        if (linkedAccount) {
            return res.json({
                linked: true,
                telegramUsername: linkedAccount.telegram_username,
                telegramFirstName: linkedAccount.telegram_first_name,
                linkedAt: linkedAccount.created_at,
                notificationsEnabled: linkedAccount.notifications_enabled
            });
        } else {
            return res.json({
                linked: false
            });
        }

    } catch (error) {
        console.error('Error al obtener estado de Telegram:', error);
        return res.status(500).json({ error: 'No se pudo obtener el estado' });
    }
}

// --- Desvincular cuenta de Telegram desde la web ---
async function unlinkTelegram(req, res) {
    try {
        const userId = req.user.userId;

        const linkedAccount = await telegramUserModel.findByUserId(userId);

        if (!linkedAccount) {
            return res.status(400).json({ error: 'No tienes una cuenta de Telegram vinculada' });
        }

        await telegramUserModel.unlinkUser(linkedAccount.telegram_id);

        return res.json({ message: 'Cuenta de Telegram desvinculada exitosamente' });

    } catch (error) {
        console.error('Error al desvincular Telegram:', error);
        return res.status(500).json({ error: 'No se pudo desvincular la cuenta' });
    }
}

// --- Actualizar preferencias de notificaciones ---
async function updateNotifications(req, res) {
    try {
        const userId = req.user.userId;
        const { enabled } = req.body;

        if (typeof enabled !== 'boolean') {
            return res.status(400).json({ error: 'El campo "enabled" es requerido y debe ser booleano' });
        }

        const linkedAccount = await telegramUserModel.findByUserId(userId);

        if (!linkedAccount) {
            return res.status(400).json({ error: 'No tienes una cuenta de Telegram vinculada' });
        }

        await telegramUserModel.updateNotifications(linkedAccount.telegram_id, enabled);

        return res.json({
            message: `Notificaciones ${enabled ? 'habilitadas' : 'deshabilitadas'}`,
            notificationsEnabled: enabled
        });

    } catch (error) {
        console.error('Error al actualizar notificaciones:', error);
        return res.status(500).json({ error: 'No se pudieron actualizar las notificaciones' });
    }
}

module.exports = {
    generateLinkCode,
    getTelegramStatus,
    unlinkTelegram,
    updateNotifications
};
