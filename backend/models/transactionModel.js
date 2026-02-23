const pool = require('../db'); // Importa la conexión a la base de datos

// --- Trae todas las transacciones del usuario autenticado ---
async function getAllByUser(userId) {
  // Consulta SQL: obtiene todas las transacciones del usuario, con su categoría, moneda y emoción
  const [rows] = await pool.execute(
    `SELECT
       t.id,
       t.type,
       CONCAT(t.date, ' ', t.time) AS date,
       t.amount,
       t.currency_code,
       t.currency_symbol,
       c.name    AS category,
       t.description,
       e.emotion,
       e.destination,
       i.source
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     LEFT JOIN expenses e ON e.transaction_id = t.id AND t.type = 'expense'
     LEFT JOIN incomes i ON i.transaction_id = t.id AND t.type = 'income'
     WHERE t.user_id = ?
     ORDER BY t.date DESC, t.time DESC`,
    [userId]
  );
  return rows; // Devuelve el array de transacciones al controlador
}

// --- Crea una nueva transacción (gasto o ingreso) ---
async function createTransaction({ userId, type, amount, date, time, categoryId, description, currencyCode, currencySymbol }) {
  // Inserta la transacción principal en la tabla
  const [result] = await pool.execute(
    `INSERT INTO transactions
       (user_id, type, date, time, amount, currency_code, currency_symbol, category_id, description)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [
      userId,
      type,
      date,
      time,
      amount,
      currencyCode || null,
      currencySymbol || null,
      categoryId ? Number(categoryId) : null,
      description || null
    ]
  );
  return result.insertId; // Devuelve el id de la transacción creada
}

// --- Agrega detalles de gasto (emoción y motivo) ---
async function addExpenseDetail(transactionId, emotion, destination) {
  await pool.execute(
    'INSERT INTO expenses (transaction_id, emotion, destination) VALUES (?,?,?)',
    [transactionId, emotion || null, destination || null]
  );
}

// --- Agrega detalles de ingreso (fuente) ---
async function addIncomeDetail(transactionId, source) {
  await pool.execute(
    'INSERT INTO incomes (transaction_id, source) VALUES (?,?)',
    [transactionId, source || null]
  );
}

// --- Elimina una transacción si pertenece al usuario ---
async function deleteTransaction(userId, transactionId) {
  // Solo permite borrar si la transacción pertenece al usuario autenticado
  await pool.execute(
    'DELETE FROM transactions WHERE id = ? AND user_id = ?',
    [transactionId, userId]
  );
}

module.exports = {
  getAllByUser,
  createTransaction,
  addExpenseDetail,
  addIncomeDetail,
  deleteTransaction,
};
