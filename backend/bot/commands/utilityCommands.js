// ============================================
// Comandos de utilidad
// /ayuda - Mostrar ayuda
// /categorias - Listar categorías
// /desvincular - Desvincular cuenta
// ============================================

const { requireLinkedUser, getLinkedUser } = require('../middleware/botAuth');
const telegramUserModel = require('../../models/telegramUserModel');
const categoryModel = require('../../models/categoryModel');
const {
    formatHelp,
    formatCategoryList,
    formatError,
    EMOJIS
} = require('../utils/messageFormatter');

// --- Comando /ayuda o /help ---
async function handleAyuda(bot, msg) {
    const chatId = msg.chat.id;

    try {
        await bot.sendMessage(
            chatId,
            formatHelp(),
            { parse_mode: 'Markdown' }
        );
    } catch (error) {
        console.error('Error en /ayuda:', error);
        await bot.sendMessage(
            chatId,
            formatError('No se pudo mostrar la ayuda.'),
            { parse_mode: 'Markdown' }
        );
    }
}

// --- Comando /categorias ---
async function handleCategorias(bot, msg) {
    const chatId = msg.chat.id;

    try {
        const categories = await categoryModel.getAll();

        await bot.sendMessage(
            chatId,
            formatCategoryList(categories),
            { parse_mode: 'Markdown' }
        );
    } catch (error) {
        console.error('Error en /categorias:', error);
        await bot.sendMessage(
            chatId,
            formatError('No se pudieron obtener las categorías.'),
            { parse_mode: 'Markdown' }
        );
    }
}

// --- Comando /desvincular ---
// Estado para confirmación de desvinculación
const pendingUnlinks = new Map();

async function handleDesvincular(bot, msg) {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
    const linkedUser = msg.linkedUser;

    try {
        // Verificar si ya hay una solicitud pendiente
        if (pendingUnlinks.has(telegramId)) {
            const pending = pendingUnlinks.get(telegramId);
            // Si pasaron más de 60 segundos, expiró
            if (Date.now() - pending.timestamp > 60000) {
                pendingUnlinks.delete(telegramId);
            } else {
                await bot.sendMessage(
                    chatId,
                    `${EMOJIS.warning} Ya tienes una solicitud de desvinculación pendiente.\n\n` +
                    `Envía *CONFIRMAR* para proceder o espera 60 segundos para cancelar.`,
                    { parse_mode: 'Markdown' }
                );
                return;
            }
        }

        // Guardar solicitud pendiente
        pendingUnlinks.set(telegramId, { timestamp: Date.now() });

        await bot.sendMessage(
            chatId,
            `${EMOJIS.warning} *¿Estás seguro de desvincular tu cuenta?*\n\n` +
            `Usuario: *${linkedUser.username}*\n` +
            `Email: ${linkedUser.email}\n\n` +
            `⚠️ Después de desvincular, no podrás usar los comandos del bot hasta volver a vincular tu cuenta.\n\n` +
            `*Envía CONFIRMAR para proceder.*\n` +
            `_La solicitud expira en 60 segundos._`,
            { parse_mode: 'Markdown' }
        );

    } catch (error) {
        console.error('Error en /desvincular:', error);
        await bot.sendMessage(
            chatId,
            formatError('No se pudo iniciar la desvinculación.'),
            { parse_mode: 'Markdown' }
        );
    }
}

// --- Handler para confirmar desvinculación ---
async function handleConfirmUnlink(bot, msg) {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
    const text = msg.text?.trim().toUpperCase();

    // Solo procesar si el texto es "CONFIRMAR" y hay solicitud pendiente
    if (text !== 'CONFIRMAR') {
        return false;
    }

    const pending = pendingUnlinks.get(telegramId);
    if (!pending) {
        return false;
    }

    // Verificar si expiró
    if (Date.now() - pending.timestamp > 60000) {
        pendingUnlinks.delete(telegramId);
        await bot.sendMessage(
            chatId,
            `${EMOJIS.info} La solicitud de desvinculación ha expirado.\n\nUsa /desvincular para iniciar de nuevo.`,
            { parse_mode: 'Markdown' }
        );
        return true;
    }

    try {
        // Proceder con la desvinculación
        const success = await telegramUserModel.unlinkUser(telegramId);
        pendingUnlinks.delete(telegramId);

        if (success) {
            await bot.sendMessage(
                chatId,
                `${EMOJIS.ok} *Cuenta desvinculada exitosamente*\n\n` +
                `Tu cuenta de Telegram ya no está vinculada a Mi-Finanzas.\n\n` +
                `Puedes volver a vincularla en cualquier momento usando /start`,
                { parse_mode: 'Markdown' }
            );
            console.log(`🔓 Cuenta desvinculada: Telegram ${telegramId}`);
        } else {
            await bot.sendMessage(
                chatId,
                formatError('No se pudo desvincular la cuenta. Intenta de nuevo.'),
                { parse_mode: 'Markdown' }
            );
        }

        return true;

    } catch (error) {
        console.error('Error al confirmar desvinculación:', error);
        pendingUnlinks.delete(telegramId);
        await bot.sendMessage(
            chatId,
            formatError('Ocurrió un error al desvincular. Intenta de nuevo.'),
            { parse_mode: 'Markdown' }
        );
        return true;
    }
}

// --- Registrar los handlers de utilidades ---
function registerUtilityCommands(bot) {
    // Comando /ayuda o /help
    bot.onText(/\/ayuda/, (msg) => handleAyuda(bot, msg));
    bot.onText(/\/help/, (msg) => handleAyuda(bot, msg));

    // Comando /categorias o /categories
    bot.onText(/\/categorias/, (msg) => handleCategorias(bot, msg));
    bot.onText(/\/categories/, (msg) => handleCategorias(bot, msg));

    // Comando /desvincular o /unlink (requiere vinculación)
    bot.onText(/\/desvincular/, requireLinkedUser(bot, (b, m, match) => handleDesvincular(b, m)));
    bot.onText(/\/unlink/, requireLinkedUser(bot, (b, m, match) => handleDesvincular(b, m)));

    // Listener para confirmar desvinculación
    bot.on('message', async (msg) => {
        if (msg.text && msg.text.trim().toUpperCase() === 'CONFIRMAR') {
            await handleConfirmUnlink(bot, msg);
        }
    });
}

module.exports = {
    handleAyuda,
    handleCategorias,
    handleDesvincular,
    registerUtilityCommands
};
