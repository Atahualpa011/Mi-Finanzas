const pool = require('../db'); // Importa la conexión a la base de datos
const { reconcileFriendship } = require('./friendModel'); // Función para recalcular saldo entre amigos

// --- Crear una transferencia y actualizar saldo ---
async function createTransfer(fromUserId, toUserId, amount, description) {
  console.log('Registrando transferencia:', { fromUserId, toUserId, amount, description });

  // Verifica si ya existe una transferencia igual pendiente (evita duplicados)
  const [existing] = await pool.execute(
    `SELECT id FROM transfers WHERE from_user_id = ? AND to_user_id = ? AND amount = ? AND description = ?`,
    [fromUserId, toUserId, amount, description]
  );
  if (existing.length > 0) {
    throw new Error('Ya existe una transferencia pendiente por este monto y concepto.');
  }

  // 1. Registrar la transferencia en la tabla 'transfers'
  await pool.execute(
    `INSERT INTO transfers (from_user_id, to_user_id, amount, description)
     VALUES (?, ?, ?, ?)`,
    [fromUserId, toUserId, amount, description]
  );

  // 2. Buscar o crear la categoría "Transferencia recibida" para ingresos
  let [catRows] = await pool.execute(
    `SELECT id FROM categories WHERE name = 'Transferencia recibida' AND type = 'income' LIMIT 1`
  );
  let categoryId;
  if (catRows.length > 0) {
    categoryId = catRows[0].id;
  } else {
    // Si no existe, la crea
    const [catResult] = await pool.execute(
      `INSERT INTO categories (name, type, color) VALUES ('Transferencia recibida', 'income', '#198754')`
    );
    categoryId = catResult.insertId;
  }

  // 3. Crear ingreso SOLO para el receptor (toUserId) en la tabla 'transactions'
  await pool.execute(
    `INSERT INTO transactions (user_id, type, date, time, amount, category_id, description)
     VALUES (?, 'income', CURDATE(), CURTIME(), ?, ?, ?)`,
    [toUserId, amount, categoryId, description || 'Transferencia recibida']
  );

  // 4. Recalcular saldo entre ambos amigos (actualiza amount_exp en friends)
  await reconcileFriendship(fromUserId, toUserId);
}

module.exports = { createTransfer };