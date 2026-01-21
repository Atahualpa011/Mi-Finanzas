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

module.exports = {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget
};
