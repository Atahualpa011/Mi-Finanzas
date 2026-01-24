const pool = require('../db');

// --- Obtener todas las inversiones de un usuario ---
async function getAllByUser(userId) {
  const [investments] = await pool.execute(
    `SELECT i.*,
            (SELECT current_value FROM investment_valuations 
             WHERE investment_id = i.id 
             ORDER BY valuation_date DESC, id DESC 
             LIMIT 1) as current_value,
            (SELECT valuation_date FROM investment_valuations 
             WHERE investment_id = i.id 
             ORDER BY valuation_date DESC, id DESC 
             LIMIT 1) as last_valuation_date
     FROM investments i
     WHERE i.user_id = ?
     ORDER BY i.investment_date DESC`,
    [userId]
  );
  return investments;
}

// --- Obtener inversión por ID ---
async function getById(investmentId, userId) {
  const [rows] = await pool.execute(
    `SELECT * FROM investments WHERE id = ? AND user_id = ?`,
    [investmentId, userId]
  );
  return rows[0];
}

// --- Crear nueva inversión ---
async function createInvestment(userId, type, name, description, initialAmount, currencyCode, currencySymbol, platform, investmentDate) {
  const [result] = await pool.execute(
    `INSERT INTO investments (user_id, type, name, description, initial_amount, currency_code, currency_symbol, platform, investment_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, type, name, description || null, initialAmount, currencyCode || 'ARS', currencySymbol || '$', platform || null, investmentDate]
  );
  
  const investmentId = result.insertId;
  
  // Crear la primera valuación con el monto inicial
  await pool.execute(
    `INSERT INTO investment_valuations (investment_id, valuation_date, current_value, notes)
     VALUES (?, ?, ?, ?)`,
    [investmentId, investmentDate, initialAmount, 'Valuación inicial']
  );
  
  return investmentId;
}

// --- Actualizar inversión ---
async function updateInvestment(investmentId, userId, name, description, platform) {
  const [result] = await pool.execute(
    `UPDATE investments 
     SET name = ?, description = ?, platform = ?
     WHERE id = ? AND user_id = ?`,
    [name, description || null, platform || null, investmentId, userId]
  );
  return result.affectedRows > 0;
}

// --- Cerrar inversión ---
async function closeInvestment(investmentId, userId, closeDate, finalAmount) {
  const [result] = await pool.execute(
    `UPDATE investments 
     SET status = 'closed', close_date = ?, final_amount = ?
     WHERE id = ? AND user_id = ? AND status = 'active'`,
    [closeDate, finalAmount, investmentId, userId]
  );
  
  if (result.affectedRows > 0) {
    // Crear valuación final
    await pool.execute(
      `INSERT INTO investment_valuations (investment_id, valuation_date, current_value, notes)
       VALUES (?, ?, ?, ?)`,
      [investmentId, closeDate, finalAmount, 'Inversión cerrada']
    );
  }
  
  return result.affectedRows > 0;
}

// --- Eliminar inversión ---
async function deleteInvestment(investmentId, userId) {
  const [result] = await pool.execute(
    `DELETE FROM investments WHERE id = ? AND user_id = ?`,
    [investmentId, userId]
  );
  return result.affectedRows > 0;
}

// --- Obtener valuaciones de una inversión ---
async function getValuations(investmentId, userId) {
  // Primero verificar que la inversión pertenece al usuario
  const investment = await getById(investmentId, userId);
  if (!investment) return null;
  
  const [valuations] = await pool.execute(
    `SELECT * FROM investment_valuations 
     WHERE investment_id = ?
     ORDER BY valuation_date DESC, id DESC`,
    [investmentId]
  );
  return valuations;
}

// --- Crear nueva valuación ---
async function createValuation(investmentId, userId, valuationDate, currentValue, notes) {
  // Verificar que la inversión pertenece al usuario y está activa
  const investment = await getById(investmentId, userId);
  if (!investment || investment.status !== 'active') {
    throw new Error('Inversión no encontrada o cerrada');
  }
  
  const [result] = await pool.execute(
    `INSERT INTO investment_valuations (investment_id, valuation_date, current_value, notes)
     VALUES (?, ?, ?, ?)`,
    [investmentId, valuationDate, currentValue, notes || null]
  );
  return result.insertId;
}

// --- Obtener resumen de inversiones del usuario ---
async function getSummary(userId) {
  const [summary] = await pool.execute(
    `SELECT 
       COUNT(*) as total_investments,
       COUNT(CASE WHEN status = 'active' THEN 1 END) as active_investments,
       COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_investments,
       SUM(initial_amount) as total_invested,
       SUM(CASE WHEN status = 'closed' THEN final_amount ELSE 0 END) as total_closed_value
     FROM investments
     WHERE user_id = ?`,
    [userId]
  );
  return summary[0];
}

module.exports = {
  getAllByUser,
  getById,
  createInvestment,
  updateInvestment,
  closeInvestment,
  deleteInvestment,
  getValuations,
  createValuation,
  getSummary
};
