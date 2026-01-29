// ============================================
// Bot de Telegram para Mi-Finanzas
// Inicialización y registro de comandos
// ============================================

const TelegramBot = require('node-telegram-bot-api');

// Importar handlers de comandos
const { registerAuthCommands } = require('./commands/authCommands');
const { registerTransactionCommands } = require('./commands/transactionCommands');
const { registerQueryCommands } = require('./commands/queryCommands');
const { registerBudgetCommands } = require('./commands/budgetCommands');
const { registerUtilityCommands } = require('./commands/utilityCommands');

let bot = null;

// --- Inicializa el bot de Telegram ---
function initTelegramBot() {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
        console.log('⚠️  TELEGRAM_BOT_TOKEN no configurado. El bot de Telegram no se iniciará.');
        console.log('   Para habilitar el bot, agrega TELEGRAM_BOT_TOKEN a tu archivo .env');
        return null;
    }

    try {
        // Crear instancia del bot con polling (para desarrollo)
        bot = new TelegramBot(token, {
            polling: {
                interval: 300,        // Intervalo entre polls (ms)
                autoStart: true,      // Iniciar polling automáticamente
                params: {
                    timeout: 10         // Timeout para long polling
                }
            }
        });

        // Manejar errores de polling
        bot.on('polling_error', (error) => {
            console.error('❌ Error de polling en Telegram Bot:', error.message);
            // No terminar el proceso, solo loggear
        });

        // Manejar errores generales
        bot.on('error', (error) => {
            console.error('❌ Error en Telegram Bot:', error.message);
        });

        // Registrar todos los handlers de comandos
        registerAuthCommands(bot);
        registerTransactionCommands(bot);
        registerQueryCommands(bot);
        registerBudgetCommands(bot);
        registerUtilityCommands(bot);

        // Handler para comandos no reconocidos
        bot.on('message', (msg) => {
            // Solo responder si es un comando no manejado
            if (msg.text && msg.text.startsWith('/')) {
                const command = msg.text.split(' ')[0].split('@')[0]; // Extraer comando sin @botname
                const knownCommands = [
                    '/start', '/ingreso', '/income', '/gasto', '/expense',
                    '/balance', '/ultimos', '/recent', '/resumen', '/summary',
                    '/presupuestos', '/budgets', '/ayuda', '/help',
                    '/categorias', '/categories', '/desvincular', '/unlink'
                ];

                if (!knownCommands.includes(command)) {
                    bot.sendMessage(
                        msg.chat.id,
                        '❓ Comando no reconocido.\n\nUsa /ayuda para ver los comandos disponibles.',
                        { parse_mode: 'Markdown' }
                    );
                }
            }
        });

        console.log('✅ Bot de Telegram iniciado correctamente');
        console.log('   Comandos disponibles: /start, /ayuda, /ingreso, /gasto, /balance, /ultimos, /resumen, /presupuestos');

        return bot;

    } catch (error) {
        console.error('❌ Error al inicializar bot de Telegram:', error.message);
        return null;
    }
}

// --- Obtiene la instancia del bot ---
function getBot() {
    return bot;
}

// --- Detiene el bot ---
function stopBot() {
    if (bot) {
        bot.stopPolling();
        console.log('🛑 Bot de Telegram detenido');
        bot = null;
    }
}

// --- Envía un mensaje a un usuario específico (para notificaciones) ---
async function sendNotification(telegramId, message, options = {}) {
    if (!bot) {
        console.warn('Bot no inicializado, no se puede enviar notificación');
        return false;
    }

    try {
        await bot.sendMessage(telegramId, message, {
            parse_mode: 'Markdown',
            ...options
        });
        return true;
    } catch (error) {
        console.error(`Error al enviar notificación a ${telegramId}:`, error.message);
        return false;
    }
}

module.exports = {
    initTelegramBot,
    getBot,
    stopBot,
    sendNotification
};
