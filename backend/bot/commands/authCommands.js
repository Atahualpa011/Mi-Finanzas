// ============================================
// Comandos de autenticación y vinculación
// /start - Bienvenida y vinculación de cuenta
// ============================================

const telegramUserModel = require('../../models/telegramUserModel');
const { getLinkedUser } = require('../middleware/botAuth');
const {
    formatWelcome,
    formatAlreadyLinked,
    formatLinkSuccess,
    formatError,
    EMOJIS
} = require('../utils/messageFormatter');
const { validateLinkCode } = require('../utils/validators');

// --- Comando /start ---
async function handleStart(bot, msg) {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
    const firstName = msg.from.first_name;

    try {
        // Verificar si ya tiene cuenta vinculada
        const linkedUser = await getLinkedUser(telegramId);

        if (linkedUser && linkedUser.is_active) {
            // Ya está vinculado
            await bot.sendMessage(
                chatId,
                formatAlreadyLinked(linkedUser.username, linkedUser.full_name),
                { parse_mode: 'Markdown' }
            );
        } else {
            // No está vinculado, mostrar mensaje de bienvenida
            await bot.sendMessage(
                chatId,
                formatWelcome(firstName),
                { parse_mode: 'Markdown' }
            );
        }
    } catch (error) {
        console.error('Error en /start:', error);
        await bot.sendMessage(
            chatId,
            formatError('Ocurrió un error. Por favor, intenta de nuevo más tarde.'),
            { parse_mode: 'Markdown' }
        );
    }
}

// --- Maneja mensajes de texto que podrían ser códigos de vinculación ---
async function handleLinkCode(bot, msg) {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
    const text = msg.text?.trim();

    // Ignorar mensajes vacíos o comandos
    if (!text || text.startsWith('/')) {
        return false;
    }

    // Verificar si ya está vinculado
    const linkedUser = await getLinkedUser(telegramId);
    if (linkedUser && linkedUser.is_active) {
        // Si ya está vinculado, no procesar como código
        return false;
    }

    // Verificar si parece un código (6 caracteres alfanuméricos)
    const validation = validateLinkCode(text);
    if (!validation.valid) {
        // No parece un código válido, ignorar silenciosamente
        // a menos que tenga 6 caracteres (en ese caso informar error)
        if (text.length === 6) {
            await bot.sendMessage(
                chatId,
                formatError(validation.error),
                { parse_mode: 'Markdown' }
            );
            return true;
        }
        return false;
    }

    try {
        // Intentar validar el código
        const codeData = await telegramUserModel.validateLinkCode(validation.code);

        if (!codeData) {
            await bot.sendMessage(
                chatId,
                `${EMOJIS.error} *Código inválido o expirado*\n\n` +
                'El código que ingresaste no es válido, ya fue usado, o ha expirado.\n\n' +
                'Genera un nuevo código desde la app web.',
                { parse_mode: 'Markdown' }
            );
            return true;
        }

        // Vincular la cuenta
        await telegramUserModel.linkUser(
            codeData.user_id,
            telegramId,
            msg.from.username,
            msg.from.first_name
        );

        // Enviar mensaje de éxito
        await bot.sendMessage(
            chatId,
            formatLinkSuccess(codeData.username),
            { parse_mode: 'Markdown' }
        );

        console.log(`✅ Cuenta vinculada: User ${codeData.user_id} -> Telegram ${telegramId}`);
        return true;

    } catch (error) {
        console.error('Error al vincular cuenta:', error);

        // Mensaje específico si ya está vinculado
        if (error.message.includes('ya está vinculada')) {
            await bot.sendMessage(
                chatId,
                `${EMOJIS.warning} ${error.message}`,
                { parse_mode: 'Markdown' }
            );
        } else {
            await bot.sendMessage(
                chatId,
                formatError('No se pudo vincular la cuenta. Intenta de nuevo.'),
                { parse_mode: 'Markdown' }
            );
        }
        return true;
    }
}

// --- Registrar los handlers de autenticación ---
function registerAuthCommands(bot) {
    // Comando /start
    bot.onText(/\/start/, (msg) => handleStart(bot, msg));

    // Listener para códigos de vinculación (mensajes de texto normales)
    bot.on('message', async (msg) => {
        // Solo procesar mensajes de texto que no sean comandos
        if (msg.text && !msg.text.startsWith('/')) {
            await handleLinkCode(bot, msg);
        }
    });
}

module.exports = {
    handleStart,
    handleLinkCode,
    registerAuthCommands
};
