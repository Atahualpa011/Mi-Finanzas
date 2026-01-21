const db = require('../db');

// --- PRESUPUESTOS PERSONALES ---

// Obtener presupuestos activos del usuario
async function getUserBudgets(userId) {
  const [rows] = await db.query(`
    SELECT 
      b.id,
      b.category_id,
      c.name AS category_name,
      c.type AS category_type,
      c.color AS category_color,
      b.amount AS budget_amount,
      b.period,
      b.start_date,
      b.end_date,
      b.alert_threshold,
      b.is_active,
      b.created_at,
      b.updated_at
    FROM budgets b
    INNER JOIN categories c ON b.category_id = c.id
    WHERE b.user_id = ? AND b.is_active = TRUE
    ORDER BY b.created_at DESC
  `, [userId]);
  return rows;
}

// Obtener presupuesto por ID
async function getBudgetById(budgetId, userId) {
  const [rows] = await db.query(`
    SELECT 
      b.id,
      b.user_id,
      b.category_id,
      c.name AS category_name,
      c.type AS category_type,
      b.amount AS budget_amount,
      b.period,
      b.start_date,
      b.end_date,
      b.alert_threshold,
      b.is_active
    FROM budgets b
    INNER JOIN categories c ON b.category_id = c.id
    WHERE b.id = ? AND b.user_id = ?
  `, [budgetId, userId]);
  return rows[0];
}

// Crear presupuesto
async function createBudget(userId, categoryId, amount, period, startDate, endDate, alertThreshold = 80) {
  const [result] = await db.query(`
    INSERT INTO budgets (user_id, category_id, amount, period, start_date, end_date, alert_threshold)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [userId, categoryId, amount, period, startDate, endDate, alertThreshold]);
  return result.insertId;
}

// Actualizar presupuesto
async function updateBudget(budgetId, userId, { categoryId, amount, period, startDate, endDate, alertThreshold, isActive }) {
  const updates = [];
  const values = [];
  
  if (categoryId !== undefined) { updates.push('category_id = ?'); values.push(categoryId); }
  if (amount !== undefined) { updates.push('amount = ?'); values.push(amount); }
  if (period !== undefined) { updates.push('period = ?'); values.push(period); }
  if (startDate !== undefined) { updates.push('start_date = ?'); values.push(startDate); }
  if (endDate !== undefined) { updates.push('end_date = ?'); values.push(endDate); }
  if (alertThreshold !== undefined) { updates.push('alert_threshold = ?'); values.push(alertThreshold); }
  if (isActive !== undefined) { updates.push('is_active = ?'); values.push(isActive); }
  
  if (updates.length === 0) return false;
  
  values.push(budgetId, userId);
  const [result] = await db.query(`
    UPDATE budgets SET ${updates.join(', ')} WHERE id = ? AND user_id = ?
  `, values);
  
  return result.affectedRows > 0;
}

// Eliminar (desactivar) presupuesto
async function deleteBudget(budgetId, userId) {
  const [result] = await db.query(`
    UPDATE budgets SET is_active = FALSE WHERE id = ? AND user_id = ?
  `, [budgetId, userId]);
  return result.affectedRows > 0;
}

// Obtener gastos del presupuesto en el período actual
async function getBudgetExpenses(userId, categoryId, startDate, endDate) {
  const [rows] = await db.query(`
    SELECT 
      SUM(amount) AS total_spent,
      COUNT(*) AS transaction_count
    FROM transactions
    WHERE user_id = ? 
      AND category_id = ? 
      AND type = 'expense'
      AND date >= ? 
      AND (? IS NULL OR date <= ?)
  `, [userId, categoryId, startDate, endDate, endDate]);
  return {
    totalSpent: rows[0]?.total_spent || 0,
    transactionCount: rows[0]?.transaction_count || 0
  };
}

// Calcular progreso de todos los presupuestos activos
async function getBudgetsWithProgress(userId) {
  const budgets = await getUserBudgets(userId);
  
  const budgetsWithProgress = await Promise.all(budgets.map(async (budget) => {
    const { totalSpent, transactionCount } = await getBudgetExpenses(
      userId,
      budget.category_id,
      budget.start_date,
      budget.end_date
    );
    
    const percentageUsed = budget.budget_amount > 0 
      ? ((totalSpent / budget.budget_amount) * 100).toFixed(2)
      : 0;
    
    const remaining = budget.budget_amount - totalSpent;
    
    return {
      ...budget,
      total_spent: parseFloat(totalSpent),
      remaining: parseFloat(remaining),
      percentage_used: parseFloat(percentageUsed),
      transaction_count: transactionCount,
      status: percentageUsed >= 100 ? 'exceeded' : percentageUsed >= budget.alert_threshold ? 'warning' : 'ok'
    };
  }));
  
  return budgetsWithProgress;
}

// --- PRESUPUESTOS GRUPALES ---

// Obtener presupuestos activos de un grupo
async function getGroupBudgets(groupId) {
  const [rows] = await db.query(`
    SELECT 
      gb.id,
      gb.group_id,
      gb.amount AS budget_amount,
      gb.period,
      gb.start_date,
      gb.end_date,
      gb.alert_threshold,
      gb.is_active,
      gb.created_by,
      gb.created_at,
      u.email AS created_by_email,
      ud.username AS created_by_username
    FROM group_budgets gb
    LEFT JOIN users u ON gb.created_by = u.id
    LEFT JOIN users_data ud ON gb.created_by = ud.user_id
    WHERE gb.group_id = ? AND gb.is_active = TRUE
    ORDER BY gb.created_at DESC
  `, [groupId]);
  return rows;
}

// Obtener presupuesto grupal por ID
async function getGroupBudgetById(budgetId, groupId) {
  const [rows] = await db.query(`
    SELECT 
      gb.id,
      gb.group_id,
      gb.amount AS budget_amount,
      gb.period,
      gb.start_date,
      gb.end_date,
      gb.alert_threshold,
      gb.is_active,
      gb.created_by
    FROM group_budgets gb
    WHERE gb.id = ? AND gb.group_id = ?
  `, [budgetId, groupId]);
  return rows[0];
}

// Crear presupuesto grupal
async function createGroupBudget(groupId, createdBy, amount, period, startDate, endDate, alertThreshold = 80) {
  const [result] = await db.query(`
    INSERT INTO group_budgets (group_id, created_by, amount, period, start_date, end_date, alert_threshold)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [groupId, createdBy, amount, period, startDate, endDate, alertThreshold]);
  return result.insertId;
}

// Actualizar presupuesto grupal
async function updateGroupBudget(budgetId, groupId, { amount, period, startDate, endDate, alertThreshold, isActive }) {
  const updates = [];
  const values = [];
  
  if (amount !== undefined) { updates.push('amount = ?'); values.push(amount); }
  if (period !== undefined) { updates.push('period = ?'); values.push(period); }
  if (startDate !== undefined) { updates.push('start_date = ?'); values.push(startDate); }
  if (endDate !== undefined) { updates.push('end_date = ?'); values.push(endDate); }
  if (alertThreshold !== undefined) { updates.push('alert_threshold = ?'); values.push(alertThreshold); }
  if (isActive !== undefined) { updates.push('is_active = ?'); values.push(isActive); }
  
  if (updates.length === 0) return false;
  
  values.push(budgetId, groupId);
  const [result] = await db.query(`
    UPDATE group_budgets SET ${updates.join(', ')} WHERE id = ? AND group_id = ?
  `, values);
  
  return result.affectedRows > 0;
}

// Eliminar (desactivar) presupuesto grupal
async function deleteGroupBudget(budgetId, groupId) {
  const [result] = await db.query(`
    UPDATE group_budgets SET is_active = FALSE WHERE id = ? AND group_id = ?
  `, [budgetId, groupId]);
  return result.affectedRows > 0;
}

// Obtener gastos del grupo en el período del presupuesto
async function getGroupBudgetExpenses(groupId, startDate, endDate) {
  const [rows] = await db.query(`
    SELECT 
      SUM(amount) AS total_spent,
      COUNT(*) AS expense_count
    FROM group_expenses
    WHERE group_id = ? 
      AND date >= ? 
      AND (? IS NULL OR date <= ?)
  `, [groupId, startDate, endDate, endDate]);
  return {
    totalSpent: rows[0]?.total_spent || 0,
    expenseCount: rows[0]?.expense_count || 0
  };
}

// Calcular progreso de presupuestos grupales
async function getGroupBudgetsWithProgress(groupId) {
  const budgets = await getGroupBudgets(groupId);
  
  const budgetsWithProgress = await Promise.all(budgets.map(async (budget) => {
    const { totalSpent, expenseCount } = await getGroupBudgetExpenses(
      groupId,
      budget.start_date,
      budget.end_date
    );
    
    const percentageUsed = budget.budget_amount > 0 
      ? ((totalSpent / budget.budget_amount) * 100).toFixed(2)
      : 0;
    
    const remaining = budget.budget_amount - totalSpent;
    
    return {
      ...budget,
      total_spent: parseFloat(totalSpent),
      remaining: parseFloat(remaining),
      percentage_used: parseFloat(percentageUsed),
      expense_count: expenseCount,
      status: percentageUsed >= 100 ? 'exceeded' : percentageUsed >= budget.alert_threshold ? 'warning' : 'ok'
    };
  }));
  
  return budgetsWithProgress;
}

module.exports = {
  getUserBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetExpenses,
  getBudgetsWithProgress,
  // Presupuestos grupales
  getGroupBudgets,
  getGroupBudgetById,
  createGroupBudget,
  updateGroupBudget,
  deleteGroupBudget,
  getGroupBudgetExpenses,
  getGroupBudgetsWithProgress
};
