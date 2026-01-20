const pool = require('../db'); // Importa la conexión a la base de datos

// --- Obtener lista de amigos confirmados de un usuario ---
async function getFriends(userId) {
  // Consulta SQL para traer amigos con datos de perfil y estado de la relación
  const [rows] = await pool.execute(
    `SELECT f.friend_id, ud.username, ud.full_name, ud.country, f.since, f.amount_exp, f.total_spent, f.blocked
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

// --- Bloquear a un amigo ---
async function blockFriend(userId, friendId) {
  const [result] = await pool.execute(
    `UPDATE friends 
     SET blocked = 1 
     WHERE (user_id = ? AND friend_id = ?) 
        OR (user_id = ? AND friend_id = ?)`,
    [userId, friendId, friendId, userId]
  );
  return result.affectedRows > 0;
}

// --- Desbloquear a un amigo ---
async function unblockFriend(userId, friendId) {
  const [result] = await pool.execute(
    `UPDATE friends 
     SET blocked = 0 
     WHERE (user_id = ? AND friend_id = ?) 
        OR (user_id = ? AND friend_id = ?)`,
    [userId, friendId, friendId, userId]
  );
  return result.affectedRows > 0;
}

// --- Obtener estadísticas de amistad (gastos compartidos y transferencias) ---
async function getFriendStats(userId, friendId) {
  try {
    // Obtener el username del amigo
    const [friendData] = await pool.execute(
      `SELECT username FROM users_data WHERE user_id = ?`,
      [friendId]
    );
    const friendUsername = friendData[0]?.username || '';
    
    console.log('Buscando estadísticas para:', {
      userId,
      friendId,
      friendUsername
    });

    // 1. GASTOS COMPARTIDOS - Buscar en múltiples fuentes
    
    // 1a. Transacciones de categoría "Gasto compartido" (23) que mencionen al amigo
    const [directShared] = await pool.execute(
      `SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total
       FROM transactions
       WHERE user_id = ? 
         AND category_id = 23
         AND (description LIKE ? OR description LIKE ?)`,
      [userId, `%${friendUsername}%`, `%${friendId}%`]
    );
    
    // 1b. Gastos de grupos donde ambos son miembros y uno de ellos pagó
    const [groupShared] = await pool.execute(
      `SELECT COUNT(DISTINCT ge.id) as count, COALESCE(SUM(ge.amount), 0) as total
       FROM group_expenses ge
       JOIN group_members gm_payer ON gm_payer.id = ge.paid_by_member_id
       JOIN group_members gm1 ON gm1.group_id = ge.group_id AND gm1.user_id = ?
       JOIN group_members gm2 ON gm2.group_id = ge.group_id AND gm2.user_id = ?
       WHERE gm_payer.user_id IN (?, ?)`,
      [userId, friendId, userId, friendId]
    );
    
    // Sumar todos los gastos compartidos
    const totalSharedCount = 
      parseInt(directShared[0].count) + 
      parseInt(groupShared[0].count);
    
    const totalSharedAmount = 
      parseFloat(directShared[0].total) + 
      parseFloat(groupShared[0].total);
    
    console.log('Gastos compartidos:', {
      directos: directShared[0],
      grupos: groupShared[0],
      total: { count: totalSharedCount, amount: totalSharedAmount }
    });

    // 2. TRANSFERENCIAS ENVIADAS
    const [transfersSent] = await pool.execute(
      `SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total
       FROM transfers
       WHERE from_user_id = ? AND to_user_id = ?`,
      [userId, friendId]
    );
    
    console.log('Transferencias enviadas:', transfersSent[0]);

    // 3. TRANSFERENCIAS RECIBIDAS
    const [transfersReceived] = await pool.execute(
      `SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total
       FROM transfers
       WHERE from_user_id = ? AND to_user_id = ?`,
      [friendId, userId]
    );
    
    console.log('Transferencias recibidas:', transfersReceived[0]);

    return {
      shared_expenses_count: totalSharedCount || 0,
      shared_expenses_total: totalSharedAmount || 0,
      transfers_sent_count: parseInt(transfersSent[0].count) || 0,
      transfers_sent_total: parseFloat(transfersSent[0].total) || 0,
      transfers_received_count: parseInt(transfersReceived[0].count) || 0,
      transfers_received_total: parseFloat(transfersReceived[0].total) || 0
    };
  } catch (error) {
    console.error('Error en getFriendStats:', error);
    throw error;
  }
}

module.exports = {
  getFriends,
  addFriend,
  getPendingRequests,
  updateRequest,
  reconcileFriendship,
  getFriendshipDebt,
  deleteFriendship,
  blockFriend,
  unblockFriend,
  getFriendStats
};