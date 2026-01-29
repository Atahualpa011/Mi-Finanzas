// ============================================
// Comandos de consulta
// /balance - Ver balance actual
// /ultimos - Ver últimas transacciones
// /resumen - Resumen del mes actual
// ============================================

const { requireLinkedUser } = require('../middleware/botAuth');
const pool = require('../../db');
const {
    formatBalance,
    formatTransactionList,
    formatMonthlySummary,
    formatError,
    EMOJIS
} = require('../utils/messageFormatter');

// --- Comando /balance ---
async function handleBalance(bot, msg) {
    const chatId = msg.chat.id;
    const linkedUser = msg.linkedUser;

    try {
        // Calcular totales de ingresos y gastos del usuario
        const [rows] = await pool.execute(
            `SELECT 
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
       FROM transactions 
       WHERE user_id = ?`,
            [linkedUser.user_id]
        );

        const totalIncome = parseFloat(rows[0].total_income) || 0;
        const totalExpense = parseFloat(rows[0].total_expense) || 0;
        const currencySymbol = linkedUser.preferred_currency === 'USD' ? 'US$' :
            linkedUser.preferred_currency === 'EUR' ? '€' : '$';

        await bot.sendMessage(
            chatId,
            formatBalance(totalIncome, totalExpense, currencySymbol),
            { parse_mode: 'Markdown' }
        );

    } catch (error) {
        console.error('Error en /balance:', error);
        await bot.sendMessage(
            chatId,
            formatError('No se pudo obtener el balance. Intenta de nuevo.'),
            { parse_mode: 'Markdown' }
        );
    }
}

// --- Comando /ultimos ---
async function handleUltimos(bot, msg, match) {
    const chatId = msg.chat.id;
    const linkedUser = msg.linkedUser;

    // Obtener cantidad de transacciones a mostrar (default 5, max 10)
    let limit = parseInt(match[1]?.trim()) || 5;
    limit = Math.min(Math.max(limit, 1), 10); // Entre 1 y 10

    try {
        // Obtener últimas transacciones
        // Nota: LIMIT no funciona bien con execute() y parámetros, usamos interpolación segura
        const safeLimit = Number(limit);
        const [transactions] = await pool.execute(
            `SELECT 
         t.id,
         t.type,
         t.date,
         t.time,
         t.amount,
         t.currency_code,
         t.currency_symbol,
         c.name as category,
         t.description,
         e.emotion
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       LEFT JOIN expenses e ON e.transaction_id = t.id AND t.type = 'expense'
       WHERE t.user_id = ?
       ORDER BY t.date DESC, t.time DESC
       LIMIT ${safeLimit}`,
            [linkedUser.user_id]
        );

        await bot.sendMessage(
            chatId,
            formatTransactionList(transactions, `${EMOJIS.calendar} *Últimas ${limit} transacciones*`),
            { parse_mode: 'Markdown' }
        );

    } catch (error) {
        console.error('Error en /ultimos:', error);
        await bot.sendMessage(
            chatId,
            formatError('No se pudieron obtener las transacciones. Intenta de nuevo.'),
            { parse_mode: 'Markdown' }
        );
    }
}

// --- Comando /resumen ---
async function handleResumen(bot, msg) {
    const chatId = msg.chat.id;
    const linkedUser = msg.linkedUser;

    try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        // Obtener totales del mes actual
        const [totals] = await pool.execute(
            `SELECT 
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
       FROM transactions 
       WHERE user_id = ? 
         AND YEAR(date) = ? 
         AND MONTH(date) = ?`,
            [linkedUser.user_id, year, month]
        );

        // Obtener top 3 categorías de gasto
        const [topCategories] = await pool.execute(
            `SELECT 
         c.name as category,
         SUM(t.amount) as total
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = ? 
         AND t.type = 'expense'
         AND YEAR(t.date) = ? 
         AND MONTH(t.date) = ?
       GROUP BY c.id, c.name
       ORDER BY total DESC
       LIMIT 3`,
            [linkedUser.user_id, year, month]
        );

        const currencySymbol = linkedUser.preferred_currency === 'USD' ? 'US$' :
            linkedUser.preferred_currency === 'EUR' ? '€' : '$';

        const data = {
            totalIncome: parseFloat(totals[0].total_income) || 0,
            totalExpense: parseFloat(totals[0].total_expense) || 0,
            topCategories: topCategories.map(tc => ({
                category: tc.category,
                total: parseFloat(tc.total)
            }))
        };

        await bot.sendMessage(
            chatId,
            formatMonthlySummary(data, month, year, currencySymbol),
            { parse_mode: 'Markdown' }
        );

    } catch (error) {
        console.error('Error en /resumen:', error);
        await bot.sendMessage(
            chatId,
            formatError('No se pudo obtener el resumen. Intenta de nuevo.'),
            { parse_mode: 'Markdown' }
        );
    }
}

// --- Registrar los handlers de consultas ---
function registerQueryCommands(bot) {
    // Comando /balance
    bot.onText(/\/balance/, requireLinkedUser(bot, (b, m, match) => handleBalance(b, m)));

    // Comando /ultimos con parámetro opcional
    bot.onText(/\/ultimos\s*(\d*)/, requireLinkedUser(bot, (b, m, match) => handleUltimos(b, m, match)));
    bot.onText(/\/recent\s*(\d*)/, requireLinkedUser(bot, (b, m, match) => handleUltimos(b, m, match)));

    // Comando /resumen
    bot.onText(/\/resumen/, requireLinkedUser(bot, (b, m, match) => handleResumen(b, m)));
    bot.onText(/\/summary/, requireLinkedUser(bot, (b, m, match) => handleResumen(b, m)));
}

module.exports = {
    handleBalance,
    handleUltimos,
    handleResumen,
    registerQueryCommands
};
