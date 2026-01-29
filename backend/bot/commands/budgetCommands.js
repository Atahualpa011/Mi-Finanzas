// ============================================
// Comandos de presupuestos
// /presupuestos - Ver estado de presupuestos
// ============================================

const { requireLinkedUser } = require('../middleware/botAuth');
const budgetModel = require('../../models/budgetModel');
const {
    formatBudgetList,
    formatError,
    EMOJIS
} = require('../utils/messageFormatter');

// --- Comando /presupuestos ---
async function handlePresupuestos(bot, msg) {
    const chatId = msg.chat.id;
    const linkedUser = msg.linkedUser;

    try {
        // Obtener presupuestos con progreso usando el modelo existente
        const budgets = await budgetModel.getBudgetsWithProgress(linkedUser.user_id);

        const currencySymbol = linkedUser.preferred_currency === 'USD' ? 'US$' :
            linkedUser.preferred_currency === 'EUR' ? '€' : '$';

        await bot.sendMessage(
            chatId,
            formatBudgetList(budgets, currencySymbol),
            { parse_mode: 'Markdown' }
        );

    } catch (error) {
        console.error('Error en /presupuestos:', error);
        await bot.sendMessage(
            chatId,
            formatError('No se pudieron obtener los presupuestos. Intenta de nuevo.'),
            { parse_mode: 'Markdown' }
        );
    }
}

// --- Registrar los handlers de presupuestos ---
function registerBudgetCommands(bot) {
    // Comando /presupuestos o /budgets
    bot.onText(/\/presupuestos/, requireLinkedUser(bot, (b, m, match) => handlePresupuestos(b, m)));
    bot.onText(/\/budgets/, requireLinkedUser(bot, (b, m, match) => handlePresupuestos(b, m)));
}

module.exports = {
    handlePresupuestos,
    registerBudgetCommands
};
