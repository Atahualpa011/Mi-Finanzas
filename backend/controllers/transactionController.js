const transactionModel = require('../models/transactionModel');
const budgetModel = require('../models/budgetModel');
const gamificationModel = require('../models/gamificationModel');

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
    emotion, destination, source,
    currencyCode, currencySymbol
  } = req.body; // Datos enviados por el frontend
  const userId = req.user.userId; // ID del usuario autenticado

  try {
    // 1. Crea la transacción principal en la tabla 'transactions'
    const txId = await transactionModel.createTransaction({
      userId, type, amount, date, time, categoryId, description,
      currencyCode, currencySymbol
    });

    // 2. Si es gasto, guarda detalles en 'expenses' (emoción y destino)
    if (type === 'expense') {
      await transactionModel.addExpenseDetail(txId, emotion, destination);
    } else {
      // 3. Si es ingreso, guarda detalles en 'incomes' (fuente)
      await transactionModel.addIncomeDetail(txId, source);
    }

    // 4. Verificar presupuestos y crear alertas si es necesario
    if (type === 'expense') {
      await budgetModel.checkAndCreateAlerts(userId);
    }

    // 5. Gamificación: actualizar racha, verificar logros y agregar XP
    try {
      await gamificationModel.updateStreak(userId, date);
      await gamificationModel.checkTransactionAchievements(userId);
      await gamificationModel.checkSavingsAchievements(userId);
      
      // Verificar logros emocionales si la transacción tiene emoción asociada
      if (type === 'expense' && emotion) {
        await gamificationModel.checkEmotionalAchievements(userId);
      }
      
      await gamificationModel.addExperience(userId, 5); // 5 XP por registrar transacción
      
      // Actualizar desafío de registro diario/semanal
      await gamificationModel.updateChallengeProgress(userId, 'daily_register', 1);
      await gamificationModel.updateChallengeProgress(userId, 'weekly_5_transactions', 1);
    } catch (gamError) {
      // No bloquear la creación de transacción si falla la gamificación
      console.error('Error en gamificación (no crítico):', gamError);
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