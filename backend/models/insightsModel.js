const pool = require('../db');

/**
 * Obtiene totales de transacciones por período y tipo
 * @param {number} userId - ID del usuario
 * @param {string} startDate - Fecha inicio (YYYY-MM-DD)
 * @param {string} endDate - Fecha fin (YYYY-MM-DD)
 * @param {string} type - 'income' o 'expense'
 * @returns {number} - Total del período
 */
async function getTotalsByPeriod(userId, startDate, endDate, type) {
  const [rows] = await pool.execute(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM transactions
     WHERE user_id = ? AND type = ?
       AND date >= ? AND date <= ?`,
    [userId, type, startDate, endDate]
  );
  return parseFloat(rows[0]?.total || 0);
}

/**
 * Obtiene top categorías por período y tipo
 * @param {number} userId - ID del usuario
 * @param {string} startDate - Fecha inicio
 * @param {string} endDate - Fecha fin
 * @param {string} type - 'income' o 'expense'
 * @param {number} limit - Número máximo de categorías
 * @returns {array} - Array de objetos { id, name, total, color }
 */
async function getTopCategories(userId, startDate, endDate, type, limit = 5) {
  // LIMIT no se puede parametrizar en MySQL, lo interpolamos directamente
  const [rows] = await pool.execute(
    `SELECT 
       c.id,
       c.name,
       c.color,
       SUM(t.amount) AS total
     FROM transactions t
     JOIN categories c ON t.category_id = c.id
     WHERE t.user_id = ? AND t.type = ?
       AND t.date >= ? AND t.date <= ?
     GROUP BY c.id, c.name, c.color
     ORDER BY total DESC
     LIMIT ${parseInt(limit)}`,
    [userId, type, startDate, endDate]
  );
  
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    color: row.color,
    total: parseFloat(row.total)
  }));
}

/**
 * Obtiene el día de la semana con mayor gasto
 * @param {number} userId - ID del usuario
 * @param {string} startDate - Fecha inicio
 * @param {string} endDate - Fecha fin
 * @returns {object|null} - { dayName, dayNum, total } o null
 */
async function getDayWithMostExpenses(userId, startDate, endDate) {
  const [rows] = await pool.execute(
    `SELECT 
       DAYNAME(date) AS day_name,
       DAYOFWEEK(date) AS day_num,
       SUM(amount) AS total
     FROM transactions
     WHERE user_id = ? AND type = 'expense'
       AND date >= ? AND date <= ?
     GROUP BY day_num, day_name
     ORDER BY total DESC
     LIMIT 1`,
    [userId, startDate, endDate]
  );
  
  if (rows.length === 0) return null;
  
  return {
    dayName: rows[0].day_name,
    dayNum: rows[0].day_num,
    total: parseFloat(rows[0].total)
  };
}

/**
 * Obtiene el promedio de gasto diario
 * @param {number} userId - ID del usuario
 * @param {string} startDate - Fecha inicio
 * @param {string} endDate - Fecha fin
 * @returns {number} - Promedio de gasto diario
 */
async function getAverageDailyExpenses(userId, startDate, endDate) {
  const [rows] = await pool.execute(
    `SELECT AVG(daily_total) AS avg_daily
     FROM (
       SELECT DATE(date) AS day, SUM(amount) AS daily_total
       FROM transactions
       WHERE user_id = ? AND type = 'expense'
         AND date >= ? AND date <= ?
       GROUP BY day
     ) AS daily_totals`,
    [userId, startDate, endDate]
  );
  
  return parseFloat(rows[0]?.avg_daily || 0);
}

/**
 * Obtiene frecuencia de transacciones por tipo
 * @param {number} userId - ID del usuario
 * @param {string} startDate - Fecha inicio
 * @param {string} endDate - Fecha fin
 * @returns {object} - { total, income, expense }
 */
async function getTransactionFrequency(userId, startDate, endDate) {
  const [rows] = await pool.execute(
    `SELECT type, COUNT(*) AS count
     FROM transactions
     WHERE user_id = ?
       AND date >= ? AND date <= ?
     GROUP BY type`,
    [userId, startDate, endDate]
  );
  
  const frequency = {
    total: 0,
    income: 0,
    expense: 0
  };
  
  rows.forEach(row => {
    frequency[row.type] = parseInt(row.count);
    frequency.total += parseInt(row.count);
  });
  
  return frequency;
}

/**
 * Obtiene distribución de gastos por categoría (para detectar picos)
 * @param {number} userId - ID del usuario
 * @param {string} startDate - Fecha inicio
 * @param {string} endDate - Fecha fin
 * @returns {array} - Array de { categoryId, categoryName, total, percentage }
 */
async function getCategoryDistribution(userId, startDate, endDate) {
  // Primero obtenemos el total de gastos
  const totalExpenses = await getTotalsByPeriod(userId, startDate, endDate, 'expense');
  
  if (totalExpenses === 0) return [];
  
  const [rows] = await pool.execute(
    `SELECT 
       c.id AS category_id,
       c.name AS category_name,
       SUM(t.amount) AS total
     FROM transactions t
     JOIN categories c ON t.category_id = c.id
     WHERE t.user_id = ? AND t.type = 'expense'
       AND t.date >= ? AND t.date <= ?
     GROUP BY c.id, c.name
     ORDER BY total DESC`,
    [userId, startDate, endDate]
  );
  
  return rows.map(row => ({
    categoryId: row.category_id,
    categoryName: row.category_name,
    total: parseFloat(row.total),
    percentage: (parseFloat(row.total) / totalExpenses) * 100
  }));
}

/**
 * Guarda un snapshot de recomendaciones
 * @param {object} data - Datos del snapshot
 * @returns {number} - ID del snapshot creado
 */
async function saveSnapshot(data) {
  const [result] = await pool.execute(
    `INSERT INTO insights_snapshots 
     (user_id, period_start, period_end, metrics_json, findings_json, 
      recommendations_json, ai_model_used, generation_time_ms, is_ai_generated)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.userId,
      data.periodStart,
      data.periodEnd,
      JSON.stringify(data.metrics),
      JSON.stringify(data.findings),
      JSON.stringify(data.recommendations),
      data.aiModel || null,
      data.generationTimeMs || 0,
      data.isAiGenerated ? 1 : 0
    ]
  );
  
  return result.insertId;
}

/**
 * Obtiene snapshots del usuario
 * @param {number} userId - ID del usuario
 * @param {number} limit - Número máximo de snapshots
 * @returns {array} - Array de snapshots (sin el JSON completo)
 */
async function getSnapshots(userId, limit = 10) {
  const [rows] = await pool.execute(
    `SELECT 
       id,
       period_start,
       period_end,
       ai_model_used,
       generation_time_ms,
       is_ai_generated,
       created_at,
       JSON_LENGTH(recommendations_json) AS recommendations_count
     FROM insights_snapshots
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT ${parseInt(limit)}`,
    [userId]
  );
  
  return rows.map(row => ({
    id: row.id,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    recommendationsCount: row.recommendations_count || 0,
    isAiGenerated: row.is_ai_generated === 1,
    aiModel: row.ai_model_used,
    generationTimeMs: row.generation_time_ms,
    createdAt: row.created_at
  }));
}

/**
 * Obtiene un snapshot específico con todos sus datos
 * @param {number} snapshotId - ID del snapshot
 * @param {number} userId - ID del usuario (para verificar pertenencia)
 * @returns {object|null} - Snapshot completo o null
 */
async function getSnapshotById(snapshotId, userId) {
  const [rows] = await pool.execute(
    `SELECT * FROM insights_snapshots
     WHERE id = ? AND user_id = ?`,
    [snapshotId, userId]
  );
  
  if (rows.length === 0) return null;
  
  const row = rows[0];
  
  return {
    id: row.id,
    userId: row.user_id,
    period: {
      start: row.period_start,
      end: row.period_end
    },
    metrics: JSON.parse(row.metrics_json || '{}'),
    findings: JSON.parse(row.findings_json || '[]'),
    recommendations: JSON.parse(row.recommendations_json || '[]'),
    meta: {
      aiModel: row.ai_model_used,
      generationTimeMs: row.generation_time_ms,
      isAiGenerated: row.is_ai_generated === 1,
      createdAt: row.created_at
    }
  };
}

module.exports = {
  getTotalsByPeriod,
  getTopCategories,
  getDayWithMostExpenses,
  getAverageDailyExpenses,
  getTransactionFrequency,
  getCategoryDistribution,
  saveSnapshot,
  getSnapshots,
  getSnapshotById
};
