// ============================================
// Middleware de autenticación para el bot
// Verifica que el usuario esté vinculado antes de ejecutar comandos
// ============================================

const telegramUserModel = require('../../models/telegramUserModel');
const { formatError } = require('../utils/messageFormatter');

// --- Middleware que requiere usuario vinculado ---
// Recibe bot y handler, devuelve función compatible con onText(regex, callback)
// onText pasa (msg, match) al callback
function requireLinkedUser(bot, handler) {
    return async (msg, match) => {
        // Verificar que el mensaje tiene información del usuario
        if (!msg || !msg.from || !msg.from.id) {
            console.warn('Mensaje recibido sin información de usuario');
            return;
        }

        const telegramId = msg.from.id;

        try {
            // Buscar si el usuario tiene cuenta vinculada
            const linkedUser = await telegramUserModel.findByTelegramId(telegramId);

            if (!linkedUser) {
                await bot.sendMessage(
                    msg.chat.id,
                    '🔗 *Tu cuenta de Telegram no está vinculada a Mi-Finanzas.*\n\n' +
                    'Para usar este comando, primero debes vincular tu cuenta.\n\n' +
                    'Usa /start para comenzar el proceso de vinculación.',
                    { parse_mode: 'Markdown' }
                );
                return;
            }

            if (!linkedUser.is_active) {
                await bot.sendMessage(
                    msg.chat.id,
                    '🔓 Tu vinculación fue desactivada.\n\nUsa /start para volver a vincular tu cuenta.',
                    { parse_mode: 'Markdown' }
                );
                return;
            }

            // Agregar información del usuario al mensaje para que el handler pueda usarla
            msg.linkedUser = linkedUser;

            // Ejecutar el handler original con (bot, msg, match)
            await handler(bot, msg, match);

        } catch (error) {
            console.error('Error en middleware de autenticación del bot:', error);
            await bot.sendMessage(
                msg.chat.id,
                formatError('Ocurrió un error al verificar tu cuenta. Intenta nuevamente.'),
                { parse_mode: 'Markdown' }
            );
        }
    };
}

// --- Obtiene el usuario vinculado sin requerir vinculación ---
// Útil para comandos como /start que funcionan sin vinculación
async function getLinkedUser(telegramId) {
    if (!telegramId) return null;
    try {
        return await telegramUserModel.findByTelegramId(telegramId);
    } catch (error) {
        console.error('Error al obtener usuario vinculado:', error);
        return null;
    }
}

module.exports = {
    requireLinkedUser,
    getLinkedUser
};

