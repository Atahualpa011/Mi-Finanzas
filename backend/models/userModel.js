const pool = require('../db'); // Importa la conexión a la base de datos

// --- Crea un usuario en la tabla principal (autenticación) ---
async function createUser(email, password_hash) {
  // Inserta el usuario con email y contraseña hasheada
  const [result] = await pool.execute(
    'INSERT INTO users (email, password_hash) VALUES (?, ?)',
    [email, password_hash]
  );
  return result.insertId; // Devuelve el ID del usuario creado
}

// --- Crea los datos de perfil del usuario en users_data ---
async function createUserData(userId, username, fullName, country) {
  // Inserta datos adicionales del usuario (perfil)
  await pool.execute(
    'INSERT INTO users_data (user_id, username, full_name, country) VALUES (?, ?, ?, ?)',
    [userId, username, fullName, country]
  );
}

// --- Busca usuario por email (para login o agregar amigo) ---
async function findUserByEmail(email) {
  // Trae datos de usuario y perfil por email
  const [rows] = await pool.execute(
    `SELECT u.id, u.email, u.password_hash, ud.username, ud.full_name, ud.country
     FROM users u
     JOIN users_data ud ON u.id = ud.user_id
     WHERE u.email = ?`,
    [email]
  );
  return rows[0]; // Devuelve el usuario encontrado o undefined
}

// --- Trae el perfil del usuario autenticado ---
async function getUserProfile(userId) {
  // Trae email y datos de perfil por ID
  const [rows] = await pool.execute(
    `SELECT u.email, ud.username, ud.full_name, ud.country, ud.preferred_currency
     FROM users u
     JOIN users_data ud ON u.id = ud.user_id
     WHERE u.id = ?`,
    [userId]
  );
  return rows[0]; // Devuelve el perfil o undefined
}

// --- Actualiza el perfil del usuario autenticado ---
async function updateUserProfile(userId, username, fullName, country, preferredCurrency) {
  // Actualiza los datos en users_data
  await pool.execute(
    `UPDATE users_data SET username = ?, full_name = ?, country = ?, preferred_currency = ? WHERE user_id = ?`,
    [username, fullName, country, preferredCurrency || 'ARS', userId]
  );
}

// --- Elimina el usuario (y cascada en users_data si FK ON DELETE CASCADE) ---
async function deleteUser(userId) {
  // Borra el usuario de la tabla principal
  await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
}

module.exports = {
  createUser,
  createUserData,
  findUserByEmail,
  getUserProfile,
  updateUserProfile,
  deleteUser,
};