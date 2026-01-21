const budgetModel = require('../models/budgetModel');

// Obtener todos los presupuestos del usuario con progreso
async function getBudgets(req, res) {
  try {
    const userId = req.user.userId;
    const budgets = await budgetModel.getBudgetsWithProgress(userId);
    res.json(budgets);
  } catch (error) {
    console.error('Error al obtener presupuestos:', error);
    res.status(500).json({ error: 'Error al obtener presupuestos' });
  }
}

// Obtener un presupuesto específico
async function getBudget(req, res) {
  try {
    const userId = req.user.userId;
    const budgetId = req.params.id;
    
    const budget = await budgetModel.getBudgetById(budgetId, userId);
    if (!budget) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }
    
    // Obtener progreso del presupuesto
    const { totalSpent, transactionCount } = await budgetModel.getBudgetExpenses(
      userId,
      budget.category_id,
      budget.start_date,
      budget.end_date
    );
    
    const percentageUsed = budget.budget_amount > 0 
      ? ((totalSpent / budget.budget_amount) * 100).toFixed(2)
      : 0;
    
    res.json({
      ...budget,
      total_spent: parseFloat(totalSpent),
      remaining: parseFloat(budget.budget_amount - totalSpent),
      percentage_used: parseFloat(percentageUsed),
      transaction_count: transactionCount,
      status: percentageUsed >= 100 ? 'exceeded' : percentageUsed >= budget.alert_threshold ? 'warning' : 'ok'
    });
  } catch (error) {
    console.error('Error al obtener presupuesto:', error);
    res.status(500).json({ error: 'Error al obtener presupuesto' });
  }
}

// Crear presupuesto
async function createBudget(req, res) {
  try {
    const userId = req.user.userId;
    const { categoryId, amount, period, startDate, endDate, alertThreshold } = req.body;
    
    // Validaciones
    if (!categoryId || !amount || !period || !startDate) {
      return res.status(400).json({ error: 'Faltan campos requeridos: categoryId, amount, period, startDate' });
    }
    
    if (amount <= 0) {
      return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
    }
    
    if (!['monthly', 'weekly', 'yearly'].includes(period)) {
      return res.status(400).json({ error: 'Período inválido. Debe ser: monthly, weekly o yearly' });
    }
    
    if (alertThreshold && (alertThreshold < 1 || alertThreshold > 100)) {
      return res.status(400).json({ error: 'El umbral de alerta debe estar entre 1 y 100' });
    }
    
    const budgetId = await budgetModel.createBudget(
      userId,
      categoryId,
      amount,
      period,
      startDate,
      endDate || null,
      alertThreshold || 80
    );
    
    res.status(201).json({ 
      message: 'Presupuesto creado exitosamente',
      budgetId 
    });
  } catch (error) {
    console.error('Error al crear presupuesto:', error);
    res.status(500).json({ error: 'Error al crear presupuesto' });
  }
}

// Actualizar presupuesto
async function updateBudget(req, res) {
  try {
    const userId = req.user.userId;
    const budgetId = req.params.id;
    const updates = req.body;
    
    // Validar que el presupuesto existe y pertenece al usuario
    const budget = await budgetModel.getBudgetById(budgetId, userId);
    if (!budget) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }
    
    // Validaciones de campos
    if (updates.amount !== undefined && updates.amount <= 0) {
      return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
    }
    
    if (updates.period && !['monthly', 'weekly', 'yearly'].includes(updates.period)) {
      return res.status(400).json({ error: 'Período inválido' });
    }
    
    if (updates.alertThreshold && (updates.alertThreshold < 1 || updates.alertThreshold > 100)) {
      return res.status(400).json({ error: 'El umbral de alerta debe estar entre 1 y 100' });
    }
    
    const success = await budgetModel.updateBudget(budgetId, userId, updates);
    
    if (!success) {
      return res.status(400).json({ error: 'No se pudo actualizar el presupuesto' });
    }
    
    res.json({ message: 'Presupuesto actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar presupuesto:', error);
    res.status(500).json({ error: 'Error al actualizar presupuesto' });
  }
}

// Eliminar (desactivar) presupuesto
async function deleteBudget(req, res) {
  try {
    const userId = req.user.userId;
    const budgetId = req.params.id;
    
    const success = await budgetModel.deleteBudget(budgetId, userId);
    
    if (!success) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }
    
    res.json({ message: 'Presupuesto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar presupuesto:', error);
    res.status(500).json({ error: 'Error al eliminar presupuesto' });
  }
}

// --- PRESUPUESTOS GRUPALES ---

// Obtener presupuestos de un grupo
async function getGroupBudgets(req, res) {
  try {
    const groupId = req.params.groupId;
    const budgets = await budgetModel.getGroupBudgetsWithProgress(groupId);
    res.json(budgets);
  } catch (error) {
    console.error('Error al obtener presupuestos del grupo:', error);
    res.status(500).json({ error: 'Error al obtener presupuestos del grupo' });
  }
}

// Obtener un presupuesto grupal específico
async function getGroupBudget(req, res) {
  try {
    const groupId = req.params.groupId;
    const budgetId = req.params.id;
    
    const budget = await budgetModel.getGroupBudgetById(budgetId, groupId);
    if (!budget) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }
    
    // Obtener progreso del presupuesto
    const { totalSpent, expenseCount } = await budgetModel.getGroupBudgetExpenses(
      groupId,
      budget.start_date,
      budget.end_date
    );
    
    const percentageUsed = budget.budget_amount > 0 
      ? ((totalSpent / budget.budget_amount) * 100).toFixed(2)
      : 0;
    
    res.json({
      ...budget,
      total_spent: parseFloat(totalSpent),
      remaining: parseFloat(budget.budget_amount - totalSpent),
      percentage_used: parseFloat(percentageUsed),
      expense_count: expenseCount,
      status: percentageUsed >= 100 ? 'exceeded' : percentageUsed >= budget.alert_threshold ? 'warning' : 'ok'
    });
  } catch (error) {
    console.error('Error al obtener presupuesto grupal:', error);
    res.status(500).json({ error: 'Error al obtener presupuesto grupal' });
  }
}

// Crear presupuesto grupal
async function createGroupBudget(req, res) {
  try {
    const userId = req.user.userId;
    const groupId = req.params.groupId;
    const { amount, period, startDate, endDate, alertThreshold } = req.body;
    
    // Validaciones
    if (!amount || !period || !startDate) {
      return res.status(400).json({ error: 'Faltan campos requeridos: amount, period, startDate' });
    }
    
    if (amount <= 0) {
      return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
    }
    
    if (!['monthly', 'weekly', 'yearly'].includes(period)) {
      return res.status(400).json({ error: 'Período inválido. Debe ser: monthly, weekly o yearly' });
    }
    
    if (alertThreshold && (alertThreshold < 1 || alertThreshold > 100)) {
      return res.status(400).json({ error: 'El umbral de alerta debe estar entre 1 y 100' });
    }
    
    const budgetId = await budgetModel.createGroupBudget(
      groupId,
      userId,
      amount,
      period,
      startDate,
      endDate || null,
      alertThreshold || 80
    );
    
    res.status(201).json({ 
      message: 'Presupuesto grupal creado exitosamente',
      budgetId 
    });
  } catch (error) {
    console.error('Error al crear presupuesto grupal:', error);
    res.status(500).json({ error: 'Error al crear presupuesto grupal' });
  }
}

// Actualizar presupuesto grupal
async function updateGroupBudget(req, res) {
  try {
    const groupId = req.params.groupId;
    const budgetId = req.params.id;
    const updates = req.body;
    
    // Validar que el presupuesto existe
    const budget = await budgetModel.getGroupBudgetById(budgetId, groupId);
    if (!budget) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }
    
    // Validaciones de campos
    if (updates.amount !== undefined && updates.amount <= 0) {
      return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
    }
    
    if (updates.period && !['monthly', 'weekly', 'yearly'].includes(updates.period)) {
      return res.status(400).json({ error: 'Período inválido' });
    }
    
    if (updates.alertThreshold && (updates.alertThreshold < 1 || updates.alertThreshold > 100)) {
      return res.status(400).json({ error: 'El umbral de alerta debe estar entre 1 y 100' });
    }
    
    const success = await budgetModel.updateGroupBudget(budgetId, groupId, updates);
    
    if (!success) {
      return res.status(400).json({ error: 'No se pudo actualizar el presupuesto' });
    }
    
    res.json({ message: 'Presupuesto grupal actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar presupuesto grupal:', error);
    res.status(500).json({ error: 'Error al actualizar presupuesto grupal' });
  }
}

// Eliminar presupuesto grupal
async function deleteGroupBudget(req, res) {
  try {
    const groupId = req.params.groupId;
    const budgetId = req.params.id;
    
    const success = await budgetModel.deleteGroupBudget(budgetId, groupId);
    
    if (!success) {
      return res.status(404).json({ error: 'Presupuesto no encontrado' });
    }
    
    res.json({ message: 'Presupuesto grupal eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar presupuesto grupal:', error);
    res.status(500).json({ error: 'Error al eliminar presupuesto grupal' });
  }
}

// --- ALERTAS DE PRESUPUESTOS ---

// Obtener alertas del usuario
async function getUserAlerts(req, res) {
  try {
    const userId = req.user.userId;
    const onlyUnread = req.query.unread === 'true';
    
    const alerts = await budgetModel.getUserAlerts(userId, onlyUnread);
    res.json(alerts);
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    res.status(500).json({ error: 'Error al obtener alertas' });
  }
}

// Marcar alerta como leída
async function markAlertAsRead(req, res) {
  try {
    const userId = req.user.userId;
    const alertId = req.params.id;
    
    const success = await budgetModel.markAlertAsRead(alertId, userId);
    
    if (!success) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }
    
    res.json({ message: 'Alerta marcada como leída' });
  } catch (error) {
    console.error('Error al marcar alerta como leída:', error);
    res.status(500).json({ error: 'Error al marcar alerta como leída' });
  }
}

// Marcar todas las alertas como leídas
async function markAllAlertsAsRead(req, res) {
  try {
    const userId = req.user.userId;
    const count = await budgetModel.markAllAlertsAsRead(userId);
    
    res.json({ message: `${count} alertas marcadas como leídas` });
  } catch (error) {
    console.error('Error al marcar alertas como leídas:', error);
    res.status(500).json({ error: 'Error al marcar alertas como leídas' });
  }
}

module.exports = {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  // Presupuestos grupales
  getGroupBudgets,
  getGroupBudget,
  createGroupBudget,
  updateGroupBudget,
  deleteGroupBudget,
  // Alertas
  getUserAlerts,
  markAlertAsRead,
  markAllAlertsAsRead
};
