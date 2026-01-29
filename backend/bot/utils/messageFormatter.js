// ============================================
// Utilidades para formatear mensajes de Telegram
// Emojis, tablas y respuestas amigables
// ============================================

// Emojis para tipos de transacción y estados
const EMOJIS = {
    income: '💰',
    expense: '💸',
    balance: '📊',
    budget: '📋',
    warning: '⚠️',
    exceeded: '🚫',
    ok: '✅',
    error: '❌',
    info: 'ℹ️',
    help: '❓',
    link: '🔗',
    unlink: '🔓',
    category: '📁',
    calendar: '📅',
    chart: '📈',
    fire: '🔥',
    star: '⭐'
};

// Emojis por categoría (mapeo aproximado)
const CATEGORY_EMOJIS = {
    'Vivienda': '🏠',
    'Servicios': '💡',
    'Alimentación': '🍽️',
    'Transporte': '🚗',
    'Salud': '🏥',
    'Entretenimiento': '🎮',
    'Educación': '📚',
    'Compras': '🛒',
    'Suscripciones': '📺',
    'Viajes': '✈️',
    'Seguros': '🛡️',
    'Impuestos y tasas': '📄',
    'Deudas y préstamos': '💳',
    'Regalos y donaciones': '🎁',
    'Misceláneos': '📦',
    'Sueldo': '💼',
    'Freelance': '💻',
    'Ventas': '🏷️',
    'Inversiones': '📈',
    'Reembolsos': '↩️',
    'Regalos': '🎀',
    'Otros ingresos': '💵',
    'Gasto compartido': '👥',
    'Transferencia recibida': '↔️'
};

// --- Formatea un monto con símbolo de moneda ---
function formatMoney(amount, currencySymbol = '$') {
    const num = parseFloat(amount);
    return `${currencySymbol}${num.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// --- Formatea una fecha para mostrar ---
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// --- Formatea una transacción para mostrar en Telegram ---
function formatTransaction(tx) {
    const emoji = tx.type === 'income' ? EMOJIS.income : EMOJIS.expense;
    const catEmoji = CATEGORY_EMOJIS[tx.category] || EMOJIS.category;
    const sign = tx.type === 'income' ? '+' : '-';
    const currencySymbol = tx.currency_symbol || '$';

    let text = `${emoji} ${formatDate(tx.date)}\n`;
    text += `${catEmoji} ${tx.category || 'Sin categoría'}\n`;
    text += `${sign}${formatMoney(tx.amount, currencySymbol)}`;

    if (tx.description) {
        text += `\n📝 ${tx.description}`;
    }

    return text;
}

// --- Formatea lista de transacciones ---
function formatTransactionList(transactions, title = '📋 Últimas transacciones') {
    if (!transactions || transactions.length === 0) {
        return `${EMOJIS.info} No hay transacciones registradas.`;
    }

    let text = `${title}\n${'─'.repeat(25)}\n\n`;

    transactions.forEach((tx, index) => {
        text += formatTransaction(tx);
        if (index < transactions.length - 1) {
            text += '\n\n' + '─'.repeat(20) + '\n\n';
        }
    });

    return text;
}

// --- Formatea el balance del usuario ---
function formatBalance(totalIncome, totalExpense, currencySymbol = '$') {
    const balance = totalIncome - totalExpense;
    const balanceEmoji = balance >= 0 ? EMOJIS.chart : EMOJIS.warning;

    let text = `${EMOJIS.balance} *Tu Balance Actual*\n${'─'.repeat(25)}\n\n`;
    text += `${EMOJIS.income} Ingresos: ${formatMoney(totalIncome, currencySymbol)}\n`;
    text += `${EMOJIS.expense} Gastos: ${formatMoney(totalExpense, currencySymbol)}\n`;
    text += `${'─'.repeat(20)}\n`;
    text += `${balanceEmoji} *Balance: ${formatMoney(balance, currencySymbol)}*`;

    return text;
}

// --- Formatea el resumen mensual ---
function formatMonthlySummary(data, month, year, currencySymbol = '$') {
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    let text = `${EMOJIS.calendar} *Resumen de ${monthNames[month - 1]} ${year}*\n${'─'.repeat(25)}\n\n`;

    text += `${EMOJIS.income} Total Ingresos: ${formatMoney(data.totalIncome, currencySymbol)}\n`;
    text += `${EMOJIS.expense} Total Gastos: ${formatMoney(data.totalExpense, currencySymbol)}\n`;
    text += `${EMOJIS.balance} Balance: ${formatMoney(data.totalIncome - data.totalExpense, currencySymbol)}\n\n`;

    if (data.topCategories && data.topCategories.length > 0) {
        text += `${EMOJIS.fire} *Top categorías de gasto:*\n`;
        data.topCategories.forEach((cat, i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
            const catEmoji = CATEGORY_EMOJIS[cat.category] || '';
            text += `${medal} ${catEmoji} ${cat.category}: ${formatMoney(cat.total, currencySymbol)}\n`;
        });
    }

    return text;
}

// --- Formatea un presupuesto con su progreso ---
function formatBudget(budget, currencySymbol = '$') {
    const percentage = budget.percentage_used || 0;
    let statusEmoji;
    let statusText;

    if (percentage >= 100) {
        statusEmoji = EMOJIS.exceeded;
        statusText = 'EXCEDIDO';
    } else if (percentage >= budget.alert_threshold) {
        statusEmoji = EMOJIS.warning;
        statusText = 'Cerca del límite';
    } else {
        statusEmoji = EMOJIS.ok;
        statusText = 'OK';
    }

    // Barra de progreso visual
    const progressBarLength = 10;
    const filledLength = Math.min(Math.round((percentage / 100) * progressBarLength), progressBarLength);
    const progressBar = '█'.repeat(filledLength) + '░'.repeat(progressBarLength - filledLength);

    const catEmoji = CATEGORY_EMOJIS[budget.category_name] || EMOJIS.category;

    let text = `${catEmoji} *${budget.category_name || 'Sin categoría'}*\n`;
    text += `[${progressBar}] ${percentage.toFixed(0)}%\n`;
    text += `${formatMoney(budget.total_spent, currencySymbol)} / ${formatMoney(budget.budget_amount, currencySymbol)}\n`;
    text += `${statusEmoji} ${statusText}`;

    return text;
}

// --- Formatea lista de presupuestos ---
function formatBudgetList(budgets, currencySymbol = '$') {
    if (!budgets || budgets.length === 0) {
        return `${EMOJIS.info} No tienes presupuestos configurados.\n\nCrea uno desde la app web en la sección *Presupuestos*.`;
    }

    let text = `${EMOJIS.budget} *Tus Presupuestos*\n${'─'.repeat(25)}\n\n`;

    budgets.forEach((budget, index) => {
        text += formatBudget(budget, currencySymbol);
        if (index < budgets.length - 1) {
            text += '\n\n' + '─'.repeat(20) + '\n\n';
        }
    });

    return text;
}

// --- Formatea lista de categorías ---
function formatCategoryList(categories) {
    let text = `${EMOJIS.category} *Categorías Disponibles*\n${'─'.repeat(25)}\n\n`;

    const expenses = categories.filter(c => c.type === 'expense');
    const incomes = categories.filter(c => c.type === 'income');

    text += `${EMOJIS.expense} *Gastos:*\n`;
    expenses.forEach(cat => {
        const emoji = CATEGORY_EMOJIS[cat.name] || '';
        text += `  ${emoji} ${cat.name}\n`;
    });

    text += `\n${EMOJIS.income} *Ingresos:*\n`;
    incomes.forEach(cat => {
        const emoji = CATEGORY_EMOJIS[cat.name] || '';
        text += `  ${emoji} ${cat.name}\n`;
    });

    return text;
}

// --- Mensaje de bienvenida ---
function formatWelcome(username) {
    return `${EMOJIS.star} ¡Hola${username ? ' ' + username : ''}! Bienvenido a *Mi-Finanzas Bot*

${EMOJIS.link} Este bot te permite gestionar tus finanzas personales directamente desde Telegram.

Para comenzar, necesitas vincular tu cuenta de Mi-Finanzas.

*¿Cómo vincular tu cuenta?*
1. Ingresa a la app web de Mi-Finanzas
2. Ve a tu Perfil → Telegram
3. Genera un código de vinculación
4. Envíame el código aquí

O simplemente envíame el código de 6 caracteres que obtuviste.

${EMOJIS.help} Usa /ayuda para ver todos los comandos disponibles.`;
}

// --- Mensaje de cuenta ya vinculada ---
function formatAlreadyLinked(username, fullName) {
    return `${EMOJIS.ok} ¡Hola ${fullName || username}!

Tu cuenta ya está vinculada a Mi-Finanzas.

${EMOJIS.help} Usa /ayuda para ver los comandos disponibles.`;
}

// --- Mensaje de vinculación exitosa ---
function formatLinkSuccess(username) {
    return `${EMOJIS.ok} *¡Cuenta vinculada exitosamente!*

${EMOJIS.star} Bienvenido, *${username}*

Ahora puedes usar todos los comandos del bot:
• /ingreso - Registrar un ingreso
• /gasto - Registrar un gasto
• /balance - Ver tu balance
• /ultimos - Ver últimas transacciones
• /ayuda - Ver todos los comandos

${EMOJIS.fire} ¡Empieza a gestionar tus finanzas!`;
}

// --- Mensaje de ayuda ---
function formatHelp() {
    return `${EMOJIS.help} *Comandos Disponibles*
${'─'.repeat(25)}

${EMOJIS.income} *Registrar transacciones:*
/ingreso <monto> <categoría> [descripción]
  _Ejemplo: /ingreso 50000 Sueldo Pago enero_

/gasto <monto> <categoría> [descripción]
  _Ejemplo: /gasto 1500 Alimentación Pizza_

${EMOJIS.balance} *Consultas:*
/balance - Ver balance actual
/ultimos [n] - Ver últimas n transacciones
/resumen - Resumen del mes actual
/presupuestos - Ver estado de presupuestos

${EMOJIS.category} *Utilidades:*
/categorias - Ver categorías disponibles
/ayuda - Mostrar esta ayuda
/desvincular - Desvincular cuenta

${EMOJIS.info} *Tips:*
• Puedes usar decimales: /gasto 1500.50 Comida
• Deteccción de moneda: US$100 o €50
• La descripción es opcional`;
}

// --- Mensaje de error genérico ---
function formatError(message) {
    return `${EMOJIS.error} *Error*\n\n${message}`;
}

// --- Mensaje de éxito de transacción ---
function formatTransactionSuccess(type, amount, category, currencySymbol = '$') {
    const emoji = type === 'income' ? EMOJIS.income : EMOJIS.expense;
    const typeText = type === 'income' ? 'Ingreso' : 'Gasto';
    const catEmoji = CATEGORY_EMOJIS[category] || '';

    return `${emoji} *${typeText} registrado*

${catEmoji} Categoría: ${category}
💵 Monto: ${formatMoney(amount, currencySymbol)}

${EMOJIS.ok} Transacción guardada exitosamente.`;
}

module.exports = {
    EMOJIS,
    CATEGORY_EMOJIS,
    formatMoney,
    formatDate,
    formatTransaction,
    formatTransactionList,
    formatBalance,
    formatMonthlySummary,
    formatBudget,
    formatBudgetList,
    formatCategoryList,
    formatWelcome,
    formatAlreadyLinked,
    formatLinkSuccess,
    formatHelp,
    formatError,
    formatTransactionSuccess
};
