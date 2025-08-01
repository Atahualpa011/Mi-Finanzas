const transactionModel = require('../models/transactionModel');

// --- Obtener todas las transacciones del usuario autenticado ---
exports.getAll = async (req, res) => {
  try {
    const userId = req.user.userId; // ID del usuario autenticado (del token)
    const rows = await transactionModel.getAllByUser(userId); // Trae todas las transacciones del usuario
    return res.json(rows); // Devuelve el array de transacciones al frontend
  } catch (err) {
    console.error('ERROR in GET /api/transactions:', err);
    return res.status(500).json({ error: 'Error al cargar transacciones' }); // Error de servidor
  }
};

// --- Crear una nueva transacción (gasto o ingreso) ---
exports.create = async (req, res) => {
  const {
    type, amount, date, time, categoryId, description,
    emotion, destination, source
  } = req.body; // Datos enviados por el frontend
  const userId = req.user.userId; // ID del usuario autenticado

  try {
    // 1. Crea la transacción principal en la tabla 'transactions'
    const txId = await transactionModel.createTransaction({
      userId, type, amount, date, time, categoryId, description
    });

    // 2. Si es gasto, guarda detalles en 'expenses' (emoción y destino)
    if (type === 'expense') {
      await transactionModel.addExpenseDetail(txId, emotion, destination);
    } else {
      // 3. Si es ingreso, guarda detalles en 'incomes' (fuente)
      await transactionModel.addIncomeDetail(txId, source);
    }

    return res.status(201).json({ message: 'Transacción creada', id: txId }); // Responde al frontend
  } catch (err) {
    console.error('ERROR in POST /api/transactions:', err);
    return res.status(500).json({ error: 'No se pudo crear la transacción' }); // Error de servidor
  }
};

// --- Eliminar una transacción del usuario autenticado ---
exports.delete = async (req, res) => {
  const userId = req.user.userId; // ID del usuario autenticado
  const { id } = req.params;      // ID de la transacción a eliminar
  try {
    await transactionModel.deleteTransaction(userId, id); // Borra solo si pertenece al usuario
    return res.json({ message: 'Transacción eliminada' }); // Responde al frontend
  } catch (err) {
    console.error('ERROR in DELETE /api/transactions/:id:', err);
    return res.status(500).json({ error: 'No se pudo eliminar la transacción' }); // Error de servidor
  }
};