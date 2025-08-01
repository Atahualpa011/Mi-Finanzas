const pool = require('../db'); // Importa la conexión a la base de datos

// --- Obtener lista de amigos confirmados de un usuario ---
async function getFriends(userId) {
  // Consulta SQL para traer amigos con datos de perfil y estado de la relación
  const [rows] = await pool.execute(
    `SELECT f.friend_id, ud.username, ud.full_name, ud.country, f.since, f.amount_exp, f.total_spent
     FROM friends f
     JOIN users_data ud ON ud.user_id = f.friend_id
     WHERE f.user_id = ?`,
    [userId]
  );
  return rows; // Devuelve la lista al controlador
}

// --- Agregar amigo (envía solicitud o crea relación si ya existe) ---
async function addFriend(userId, friendId) {
  // Inserta la relación si no existe (status por defecto: pendiente o aceptado según lógica del controlador)
  await pool.execute(
    `INSERT IGNORE INTO friends (user_id, friend_id, since, amount_exp, total_spent)
     VALUES (?, ?, NOW(), 0, 0)`,
    [userId, friendId]
  );
}

// --- Obtener solicitudes de amistad pendientes recibidas ---
async function getPendingRequests(userId) {
  // Consulta SQL para traer solicitudes pendientes recibidas por el usuario
  const [rows] = await pool.execute(
    `SELECT f.user_id, ud.username, ud.full_name, ud.country, f.since
     FROM friends f
     JOIN users_data ud ON ud.user_id = f.user_id
     WHERE f.friend_id = ? AND f.status = 'pending'`,
    [userId]
  );
  return rows; // Devuelve la lista al controlador
}

// --- Aceptar o rechazar una solicitud de amistad ---
async function updateRequest(userId, requesterId, status) {
  // Actualiza el estado de la solicitud (accepted/rejected)
  await pool.execute(
    `UPDATE friends SET status = ? WHERE user_id = ? AND friend_id = ?`,
    [status, requesterId, userId]
  );
  // Si se acepta, crea la relación inversa (ambos son amigos)
  if (status === 'accepted') {
    await pool.execute(
      `INSERT IGNORE INTO friends (user_id, friend_id, since, amount_exp, total_spent, status)
       VALUES (?, ?, NOW(), 0, 0, 'accepted')`,
      [userId, requesterId]
    );
  }
}

// --- Recalcula el saldo entre dos usuarios (deuda/lo que se deben) ---
async function reconcileFriendship(userId, friendId) {
  // Asegura que la relación existe en ambas direcciones y está aceptada
  await pool.execute(
    `INSERT IGNORE INTO friends (user_id, friend_id, since, amount_exp, total_spent, status)
     VALUES (?, ?, NOW(), 0, 0, 'accepted')`,
    [userId, friendId]
  );
  await pool.execute(
    `INSERT IGNORE INTO friends (user_id, friend_id, since, amount_exp, total_spent, status)
     VALUES (?, ?, NOW(), 0, 0, 'accepted')`,
    [friendId, userId]
  );

  // Calcula lo que friendId le debe a userId en gastos compartidos
  const [sharedRows] = await pool.execute(
    `SELECT
      SUM(CASE WHEN se.friend_id = ? THEN (t.amount * se.my_percent / 100) ELSE 0 END) as friend_owes,
      SUM(CASE WHEN se.friend_id = ? THEN (t.amount * se.my_percent / 100) ELSE 0 END) as user_owes
    FROM shared_expenses se
    JOIN transactions t ON t.id = se.expense_id
    WHERE se.friend_id IN (?, ?) AND t.user_id IN (?, ?)`,
    [friendId, userId, userId, friendId, userId, friendId]
  );
  const friendOwes = Number(sharedRows[0].friend_owes) || 0;
  const userOwes = Number(sharedRows[0].user_owes) || 0;

  // Suma transferencias entre ambos
  const [transferRows] = await pool.execute(
    `SELECT
      SUM(CASE WHEN from_user_id = ? AND to_user_id = ? THEN amount ELSE 0 END) as user_to_friend,
      SUM(CASE WHEN from_user_id = ? AND to_user_id = ? THEN amount ELSE 0 END) as friend_to_user
    FROM transfers
    WHERE (from_user_id = ? AND to_user_id = ?) OR (from_user_id = ? AND to_user_id = ?)`,
    [userId, friendId, friendId, userId, userId, friendId, friendId, userId]
  );
  const userToFriend = Number(transferRows[0].user_to_friend) || 0;
  const friendToUser = Number(transferRows[0].friend_to_user) || 0;

  // Saldo final: lo que el amigo te debe (positivo: te deben, negativo: debes)
  const saldo = friendOwes - userOwes - userToFriend + friendToUser;

  // Actualiza el saldo en ambas direcciones
  await pool.execute(
    `UPDATE friends SET amount_exp = ? WHERE user_id = ? AND friend_id = ?`,
    [saldo, userId, friendId]
  );
  await pool.execute(
    `UPDATE friends SET amount_exp = ? WHERE user_id = ? AND friend_id = ?`,
    [-saldo, friendId, userId]
  );
}

// --- Obtener la deuda actual entre dos usuarios ---
async function getFriendshipDebt(userId, friendId) {
  const [rows] = await pool.execute(
    `SELECT amount_exp FROM friends WHERE user_id = ? AND friend_id = ?`,
    [userId, friendId]
  );
  return rows.length ? Number(rows[0].amount_exp) : 0; // Devuelve el saldo actual
}

// --- Elimina la relación de amistad entre dos usuarios ---
async function deleteFriendship(userId, friendId) {
  // Borra la relación en ambas direcciones (por si existe en ambas)
  await pool.execute(
    'DELETE FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)',
    [userId, friendId, friendId, userId]
  );
}

module.exports = {
  getFriends,
  addFriend,
  getPendingRequests,
  updateRequest,
  reconcileFriendship,
  getFriendshipDebt,
  deleteFriendship, // <-- Agrega aquí
};