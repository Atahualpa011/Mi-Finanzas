const pool = require('../db');

// --- Crea una sugerencia de movimiento personal ---
async function createSuggestion({ userId, groupId, type, amount, description, relatedUserId, groupExpenseId }) {
  await pool.execute(
    `INSERT INTO suggested_transactions
      (user_id, group_id, type, amount, description, related_user_id, group_expense_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, groupId, type, amount, description, relatedUserId, groupExpenseId]
  );
}

// --- Obtiene sugerencias pendientes para un usuario ---
async function getPendingSuggestions(userId) {
  const [rows] = await pool.execute(
    `SELECT * FROM suggested_transactions WHERE user_id = ? AND status = 'pending' ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}

// --- Marca una sugerencia como aceptada o rechazada ---
async function updateSuggestionStatus(id, status) {
  await pool.execute(
    `UPDATE suggested_transactions SET status = ? WHERE id = ?`,
    [status, id]
  );
}

module.exports = {
  createSuggestion,
  getPendingSuggestions,
  updateSuggestionStatus,
};