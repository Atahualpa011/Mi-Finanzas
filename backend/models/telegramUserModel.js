const pool = require('../db'); // Conexión a la base de datos
const crypto = require('crypto'); // Para generar códigos aleatorios

// --- Busca usuario vinculado por su ID de Telegram ---
async function findByTelegramId(telegramId) {
    const [rows] = await pool.execute(
        `SELECT tu.*, u.email, ud.username, ud.full_name, ud.preferred_currency
     FROM telegram_users tu
     JOIN users u ON tu.user_id = u.id
     JOIN users_data ud ON tu.user_id = ud.user_id
     WHERE tu.telegram_id = ? AND tu.is_active = TRUE`,
        [telegramId]
    );
    return rows[0]; // Devuelve el usuario vinculado o undefined
}

// --- Busca usuario vinculado por su user_id de la app ---
async function findByUserId(userId) {
    const [rows] = await pool.execute(
        `SELECT * FROM telegram_users WHERE user_id = ? AND is_active = TRUE`,
        [userId]
    );
    return rows[0];
}

// --- Vincula una cuenta de Telegram con un usuario ---
async function linkUser(userId, telegramId, telegramUsername = null, telegramFirstName = null) {
    // Verificar si ya existe una vinculación activa para este telegram_id
    const existing = await findByTelegramId(telegramId);
    if (existing) {
        throw new Error('Esta cuenta de Telegram ya está vinculada a otro usuario');
    }

    // Verificar si el usuario ya tiene una cuenta de Telegram vinculada
    const existingUser = await findByUserId(userId);
    if (existingUser) {
        throw new Error('Tu cuenta ya tiene Telegram vinculado');
    }

    const [result] = await pool.execute(
        `INSERT INTO telegram_users (user_id, telegram_id, telegram_username, telegram_first_name)
     VALUES (?, ?, ?, ?)`,
        [userId, telegramId, telegramUsername, telegramFirstName]
    );
    return result.insertId;
}

// --- Desvincula una cuenta de Telegram ---
async function unlinkUser(telegramId) {
    const [result] = await pool.execute(
        `UPDATE telegram_users SET is_active = FALSE WHERE telegram_id = ?`,
        [telegramId]
    );
    return result.affectedRows > 0;
}

// --- Genera un código de vinculación temporal de 6 caracteres ---
async function createLinkCode(userId) {
    // Limpiar códigos anteriores no usados del mismo usuario
    await pool.execute(
        `DELETE FROM telegram_link_codes WHERE user_id = ? AND used = FALSE`,
        [userId]
    );

    // Generar código alfanumérico de 6 caracteres (mayúsculas y números)
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin O, 0, 1, I para evitar confusiones
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += characters.charAt(crypto.randomInt(0, characters.length));
    }

    // Expira en 5 minutos
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await pool.execute(
        `INSERT INTO telegram_link_codes (user_id, code, expires_at) VALUES (?, ?, ?)`,
        [userId, code, expiresAt]
    );

    return code;
}

// --- Valida y consume un código de vinculación ---
async function validateLinkCode(code) {
    const [rows] = await pool.execute(
        `SELECT tlc.*, u.email, ud.username
     FROM telegram_link_codes tlc
     JOIN users u ON tlc.user_id = u.id
     JOIN users_data ud ON tlc.user_id = ud.user_id
     WHERE tlc.code = ? AND tlc.used = FALSE AND tlc.expires_at > NOW()`,
        [code.toUpperCase()]
    );

    if (rows.length === 0) {
        return null; // Código inválido, expirado o ya usado
    }

    // Marcar como usado
    await pool.execute(
        `UPDATE telegram_link_codes SET used = TRUE WHERE id = ?`,
        [rows[0].id]
    );

    return rows[0]; // Devuelve info del usuario asociado al código
}

// --- Limpia códigos expirados (para mantenimiento) ---
async function cleanExpiredCodes() {
    const [result] = await pool.execute(
        `DELETE FROM telegram_link_codes WHERE expires_at < NOW() OR used = TRUE`
    );
    return result.affectedRows;
}

// --- Actualiza las notificaciones del usuario ---
async function updateNotifications(telegramId, enabled) {
    const [result] = await pool.execute(
        `UPDATE telegram_users SET notifications_enabled = ? WHERE telegram_id = ?`,
        [enabled, telegramId]
    );
    return result.affectedRows > 0;
}

// --- Obtiene usuarios con notificaciones habilitadas ---
async function getUsersWithNotifications() {
    const [rows] = await pool.execute(
        `SELECT tu.telegram_id, tu.user_id, ud.username
     FROM telegram_users tu
     JOIN users_data ud ON tu.user_id = ud.user_id
     WHERE tu.is_active = TRUE AND tu.notifications_enabled = TRUE`
    );
    return rows;
}

module.exports = {
    findByTelegramId,
    findByUserId,
    linkUser,
    unlinkUser,
    createLinkCode,
    validateLinkCode,
    cleanExpiredCodes,
    updateNotifications,
    getUsersWithNotifications
};
