// ============================================
// Comandos de transacciones
// /ingreso - Registrar un ingreso
// /gasto - Registrar un gasto
// ============================================

const { requireLinkedUser } = require('../middleware/botAuth');
const transactionModel = require('../../models/transactionModel');
const budgetModel = require('../../models/budgetModel');
const gamificationModel = require('../../models/gamificationModel');
const {
    formatTransactionSuccess,
    formatError,
    formatCategoryList,
    EMOJIS
} = require('../utils/messageFormatter');
const { parseTransactionCommand, findCategoryByName } = require('../utils/validators');
const categoryModel = require('../../models/categoryModel');

// --- Comando /ingreso ---
async function handleIngreso(bot, msg, match) {
    const chatId = msg.chat.id;
    const linkedUser = msg.linkedUser;
    const args = match[1]?.trim(); // Texto después del comando

    try {
        // Parsear el comando
        const parsed = parseTransactionCommand(args, 'income');

        if (!parsed.success) {
            await bot.sendMessage(chatId, formatError(parsed.error), { parse_mode: 'Markdown' });
            return;
        }

        // Buscar la categoría
        const category = await findCategoryByName(parsed.categoryName, 'income');

        if (!category) {
            // Listar categorías disponibles
            const allCategories = await categoryModel.getAll();
            const incomeCategories = allCategories.filter(c => c.type === 'income');

            let errorMsg = `${EMOJIS.error} *Categoría no encontrada:* "${parsed.categoryName}"\n\n`;
            errorMsg += `${EMOJIS.income} *Categorías de ingreso disponibles:*\n`;
            incomeCategories.forEach(c => {
                errorMsg += `• ${c.name}\n`;
            });
            errorMsg += `\n_Ejemplo: /ingreso ${parsed.amount} ${incomeCategories[0]?.name || 'Sueldo'} Mi descripción_`;

            await bot.sendMessage(chatId, errorMsg, { parse_mode: 'Markdown' });
            return;
        }

        // Obtener fecha y hora actual
        const now = new Date();
        const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const time = now.toTimeString().split(' ')[0]; // HH:MM:SS

        // Crear la transacción usando el modelo existente
        const txId = await transactionModel.createTransaction({
            userId: linkedUser.user_id,
            type: 'income',
            amount: parsed.amount,
            date: date,
            time: time,
            categoryId: category.id,
            description: parsed.description,
            currencyCode: parsed.currencyCode,
            currencySymbol: parsed.currencySymbol
        });

        // Agregar detalles de ingreso
        await transactionModel.addIncomeDetail(txId, null);

        // Gamificación: actualizar racha y verificar logros
        try {
            await gamificationModel.updateStreak(linkedUser.user_id, date);
            await gamificationModel.checkTransactionAchievements(linkedUser.user_id);
            await gamificationModel.checkSavingsAchievements(linkedUser.user_id);
            await gamificationModel.addExperience(linkedUser.user_id, 5);
            await gamificationModel.updateChallengeProgress(linkedUser.user_id, 'daily_register', 1);
            await gamificationModel.updateChallengeProgress(linkedUser.user_id, 'weekly_5_transactions', 1);
        } catch (gamError) {
            console.error('Error en gamificación (no crítico):', gamError);
        }

        // Responder con éxito
        await bot.sendMessage(
            chatId,
            formatTransactionSuccess('income', parsed.amount, category.name, parsed.currencySymbol),
            { parse_mode: 'Markdown' }
        );

        console.log(`💰 Ingreso registrado desde Telegram: User ${linkedUser.user_id}, $${parsed.amount}`);

    } catch (error) {
        console.error('Error en /ingreso:', error);
        await bot.sendMessage(
            chatId,
            formatError('No se pudo registrar el ingreso. Intenta de nuevo.'),
            { parse_mode: 'Markdown' }
        );
    }
}

// --- Comando /gasto ---
async function handleGasto(bot, msg, match) {
    const chatId = msg.chat.id;
    const linkedUser = msg.linkedUser;
    const args = match[1]?.trim();

    try {
        // Parsear el comando
        const parsed = parseTransactionCommand(args, 'expense');

        if (!parsed.success) {
            await bot.sendMessage(chatId, formatError(parsed.error), { parse_mode: 'Markdown' });
            return;
        }

        // Buscar la categoría
        const category = await findCategoryByName(parsed.categoryName, 'expense');

        if (!category) {
            // Listar categorías disponibles
            const allCategories = await categoryModel.getAll();
            const expenseCategories = allCategories.filter(c => c.type === 'expense');

            let errorMsg = `${EMOJIS.error} *Categoría no encontrada:* "${parsed.categoryName}"\n\n`;
            errorMsg += `${EMOJIS.expense} *Categorías de gasto disponibles:*\n`;
            expenseCategories.slice(0, 10).forEach(c => {
                errorMsg += `• ${c.name}\n`;
            });
            if (expenseCategories.length > 10) {
                errorMsg += `_... y ${expenseCategories.length - 10} más_\n`;
            }
            errorMsg += `\n_Usa /categorias para ver la lista completa_`;

            await bot.sendMessage(chatId, errorMsg, { parse_mode: 'Markdown' });
            return;
        }

        // Obtener fecha y hora actual
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toTimeString().split(' ')[0];

        // Crear la transacción usando el modelo existente
        const txId = await transactionModel.createTransaction({
            userId: linkedUser.user_id,
            type: 'expense',
            amount: parsed.amount,
            date: date,
            time: time,
            categoryId: category.id,
            description: parsed.description,
            currencyCode: parsed.currencyCode,
            currencySymbol: parsed.currencySymbol
        });

        // Agregar detalles de gasto (sin emoción desde el bot por simplicidad)
        await transactionModel.addExpenseDetail(txId, null, null);

        // Verificar presupuestos y crear alertas si es necesario
        try {
            await budgetModel.checkAndCreateAlerts(linkedUser.user_id);
        } catch (budgetError) {
            console.error('Error al verificar presupuestos (no crítico):', budgetError);
        }

        // Gamificación
        try {
            await gamificationModel.updateStreak(linkedUser.user_id, date);
            await gamificationModel.checkTransactionAchievements(linkedUser.user_id);
            await gamificationModel.checkSavingsAchievements(linkedUser.user_id);
            await gamificationModel.addExperience(linkedUser.user_id, 5);
            await gamificationModel.updateChallengeProgress(linkedUser.user_id, 'daily_register', 1);
            await gamificationModel.updateChallengeProgress(linkedUser.user_id, 'weekly_5_transactions', 1);
        } catch (gamError) {
            console.error('Error en gamificación (no crítico):', gamError);
        }

        // Responder con éxito
        await bot.sendMessage(
            chatId,
            formatTransactionSuccess('expense', parsed.amount, category.name, parsed.currencySymbol),
            { parse_mode: 'Markdown' }
        );

        console.log(`💸 Gasto registrado desde Telegram: User ${linkedUser.user_id}, $${parsed.amount}`);

    } catch (error) {
        console.error('Error en /gasto:', error);
        await bot.sendMessage(
            chatId,
            formatError('No se pudo registrar el gasto. Intenta de nuevo.'),
            { parse_mode: 'Markdown' }
        );
    }
}

// --- Registrar los handlers de transacciones ---
function registerTransactionCommands(bot) {
    // Comando /ingreso o /income
    bot.onText(/\/ingreso(.*)/, requireLinkedUser(bot, (b, m, match) => handleIngreso(b, m, match)));
    bot.onText(/\/income(.*)/, requireLinkedUser(bot, (b, m, match) => handleIngreso(b, m, match)));

    // Comando /gasto o /expense
    bot.onText(/\/gasto(.*)/, requireLinkedUser(bot, (b, m, match) => handleGasto(b, m, match)));
    bot.onText(/\/expense(.*)/, requireLinkedUser(bot, (b, m, match) => handleGasto(b, m, match)));
}

module.exports = {
    handleIngreso,
    handleGasto,
    registerTransactionCommands
};
