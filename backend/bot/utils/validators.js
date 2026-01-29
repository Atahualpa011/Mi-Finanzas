// ============================================
// Validadores y parsers para comandos del bot
// ============================================

const categoryModel = require('../../models/categoryModel');

// Símbolos de moneda reconocidos
const CURRENCY_SYMBOLS = {
    '$': { code: 'ARS', symbol: '$' },
    'ARS': { code: 'ARS', symbol: '$' },
    'US$': { code: 'USD', symbol: 'US$' },
    'USD': { code: 'USD', symbol: 'US$' },
    '€': { code: 'EUR', symbol: '€' },
    'EUR': { code: 'EUR', symbol: '€' },
    'R$': { code: 'BRL', symbol: 'R$' },
    'BRL': { code: 'BRL', symbol: 'R$' }
};

// --- Parsea un monto con posible símbolo de moneda ---
// Ejemplo: "50000", "$50000", "US$100", "100.50", "1,500.00"
function parseAmount(text) {
    if (!text) return null;

    let currency = { code: 'ARS', symbol: '$' }; // Default
    let amountStr = text.trim();

    // Buscar símbolo de moneda al inicio
    for (const [symbol, curr] of Object.entries(CURRENCY_SYMBOLS)) {
        if (amountStr.toUpperCase().startsWith(symbol.toUpperCase())) {
            currency = curr;
            amountStr = amountStr.substring(symbol.length).trim();
            break;
        }
    }

    // Buscar símbolo de moneda al final (menos común, pero soportado)
    for (const [symbol, curr] of Object.entries(CURRENCY_SYMBOLS)) {
        if (amountStr.toUpperCase().endsWith(symbol.toUpperCase())) {
            currency = curr;
            amountStr = amountStr.substring(0, amountStr.length - symbol.length).trim();
            break;
        }
    }

    // Limpiar formato de número (quitar separadores de miles, normalizar decimales)
    // Soporta: 1,500.00 o 1.500,00 (formato español)
    amountStr = amountStr.replace(/\s/g, ''); // Quitar espacios

    // Detectar formato: si hay coma antes del punto, es formato español
    if (amountStr.includes(',') && amountStr.includes('.')) {
        if (amountStr.lastIndexOf(',') > amountStr.lastIndexOf('.')) {
            // Formato español: 1.500,00 -> 1500.00
            amountStr = amountStr.replace(/\./g, '').replace(',', '.');
        } else {
            // Formato inglés: 1,500.00 -> 1500.00
            amountStr = amountStr.replace(/,/g, '');
        }
    } else if (amountStr.includes(',')) {
        // Solo tiene coma: podría ser decimal español o separador de miles
        const parts = amountStr.split(',');
        if (parts.length === 2 && parts[1].length <= 2) {
            // Es un decimal español: 1500,50 -> 1500.50
            amountStr = amountStr.replace(',', '.');
        } else {
            // Es separador de miles: 1,500 -> 1500
            amountStr = amountStr.replace(/,/g, '');
        }
    }

    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) {
        return null;
    }

    return {
        amount: Math.round(amount * 100) / 100, // Redondear a 2 decimales
        currencyCode: currency.code,
        currencySymbol: currency.symbol
    };
}

// --- Busca una categoría por nombre (case insensitive, coincidencia parcial) ---
let categoriesCache = null;
let categoriesCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

async function findCategoryByName(name, type = null) {
    if (!name) return null;

    // Refrescar cache si es necesario
    if (!categoriesCache || Date.now() - categoriesCacheTime > CACHE_TTL) {
        categoriesCache = await categoryModel.getAll();
        categoriesCacheTime = Date.now();
    }

    const searchName = name.toLowerCase().trim();

    // Filtrar por tipo si se especifica
    let categories = categoriesCache;
    if (type) {
        categories = categories.filter(c => c.type === type);
    }

    // Buscar coincidencia exacta primero
    let match = categories.find(c => c.name.toLowerCase() === searchName);
    if (match) return match;

    // Buscar coincidencia parcial (comienza con)
    match = categories.find(c => c.name.toLowerCase().startsWith(searchName));
    if (match) return match;

    // Buscar coincidencia parcial (contiene)
    match = categories.find(c => c.name.toLowerCase().includes(searchName));
    if (match) return match;

    return null;
}

// --- Parsea un comando de transacción completo ---
// Formato: /ingreso 50000 Sueldo Descripción opcional
// Formato: /gasto $1500 Alimentación Pizza con amigos
function parseTransactionCommand(text, type) {
    if (!text || text.trim().length === 0) {
        return {
            success: false,
            error: 'Formato incorrecto. Usa:\n/ingreso <monto> <categoría> [descripción]'
        };
    }

    const parts = text.trim().split(/\s+/);

    if (parts.length < 2) {
        return {
            success: false,
            error: `Formato incorrecto.\n\nUso: /${type === 'income' ? 'ingreso' : 'gasto'} <monto> <categoría> [descripción]\n\nEjemplo: /${type === 'income' ? 'ingreso' : 'gasto'} 50000 ${type === 'income' ? 'Sueldo' : 'Alimentación'} ${type === 'income' ? 'Pago mensual' : 'Almuerzo'}`
        };
    }

    // Parsear monto (primera parte)
    const amountData = parseAmount(parts[0]);
    if (!amountData) {
        return {
            success: false,
            error: `Monto inválido: "${parts[0]}"\n\nDebe ser un número positivo.\nEjemplos válidos: 1500, $1500, US$100, 1500.50`
        };
    }

    // La segunda parte es la categoría
    const categoryName = parts[1];

    // El resto es la descripción (opcional)
    const description = parts.slice(2).join(' ') || null;

    return {
        success: true,
        amount: amountData.amount,
        currencyCode: amountData.currencyCode,
        currencySymbol: amountData.currencySymbol,
        categoryName: categoryName,
        description: description
    };
}

// --- Valida que un usuario tenga vinculación activa ---
function validateLinkedUser(telegramUser) {
    if (!telegramUser) {
        return {
            valid: false,
            error: '🔗 Tu cuenta de Telegram no está vinculada a Mi-Finanzas.\n\nUsa /start para vincular tu cuenta.'
        };
    }

    if (!telegramUser.is_active) {
        return {
            valid: false,
            error: '🔓 Tu vinculación fue desactivada.\n\nUsa /start para volver a vincular tu cuenta.'
        };
    }

    return { valid: true };
}

// --- Valida el código de vinculación (formato) ---
function validateLinkCode(code) {
    if (!code || typeof code !== 'string') {
        return { valid: false, error: 'Código inválido' };
    }

    const cleaned = code.trim().toUpperCase();

    if (cleaned.length !== 6) {
        return { valid: false, error: 'El código debe tener 6 caracteres' };
    }

    if (!/^[A-Z0-9]+$/.test(cleaned)) {
        return { valid: false, error: 'El código solo puede contener letras y números' };
    }

    return { valid: true, code: cleaned };
}

// Limpiar cache de categorías (para refrescar)
function clearCategoryCache() {
    categoriesCache = null;
    categoriesCacheTime = 0;
}

module.exports = {
    CURRENCY_SYMBOLS,
    parseAmount,
    findCategoryByName,
    parseTransactionCommand,
    validateLinkedUser,
    validateLinkCode,
    clearCategoryCache
};
