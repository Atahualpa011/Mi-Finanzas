const pool = require('../db');

// --- Obtiene estadísticas correlacionales de emociones ---
async function getCorrelationalData(userId) {
  // Consulta compleja: calcula count, total, promedio y porcentaje por emoción
  const [rows] = await pool.execute(
    `SELECT 
       e.emotion,
       COUNT(*) as frequency,
       SUM(t.amount) as total_spent,
       AVG(t.amount) as avg_spent,
       MIN(t.date) as first_occurrence,
       MAX(t.date) as last_occurrence
     FROM transactions t
     JOIN expenses e ON e.transaction_id = t.id
     WHERE t.user_id = ? 
       AND t.type = 'expense' 
       AND e.emotion IS NOT NULL 
       AND e.emotion != ''
     GROUP BY e.emotion
     ORDER BY total_spent DESC`,
    [userId]
  );

  return rows;
}

// --- Obtiene el total gastado para calcular porcentajes ---
async function getTotalExpenses(userId) {
  const [rows] = await pool.execute(
    `SELECT SUM(t.amount) as total
     FROM transactions t
     JOIN expenses e ON e.transaction_id = t.id
     WHERE t.user_id = ? 
       AND t.type = 'expense' 
       AND e.emotion IS NOT NULL 
       AND e.emotion != ''`,
    [userId]
  );

  return rows[0]?.total || 0;
}

// --- Obtiene gastos emocionales agrupados por semana ---
async function getWeeklyTrends(userId, weeksBack = 12) {
  const [rows] = await pool.execute(
    `SELECT 
       YEARWEEK(t.date, 1) as year_week,
       e.emotion,
       SUM(t.amount) as weekly_total,
       COUNT(*) as weekly_count
     FROM transactions t
     JOIN expenses e ON e.transaction_id = t.id
     WHERE t.user_id = ? 
       AND t.type = 'expense' 
       AND e.emotion IS NOT NULL 
       AND e.emotion != ''
       AND t.date >= DATE_SUB(CURDATE(), INTERVAL ? WEEK)
     GROUP BY year_week, e.emotion
     ORDER BY year_week DESC, weekly_total DESC`,
    [userId, weeksBack]
  );

  return rows;
}

// --- Detecta patrones por día de la semana ---
async function getDayOfWeekPatterns(userId) {
  const [rows] = await pool.execute(
    `SELECT 
       DAYNAME(t.date) as day_name,
       DAYOFWEEK(t.date) as day_num,
       e.emotion,
       COUNT(*) as occurrence_count,
       AVG(t.amount) as avg_amount
     FROM transactions t
     JOIN expenses e ON e.transaction_id = t.id
     WHERE t.user_id = ? 
       AND t.type = 'expense' 
       AND e.emotion IS NOT NULL 
       AND e.emotion != ''
     GROUP BY day_num, day_name, e.emotion
     HAVING occurrence_count >= 2
     ORDER BY occurrence_count DESC, avg_amount DESC
     LIMIT 10`,
    [userId]
  );

  return rows;
}

// --- Compara gastos del mes actual vs mes anterior por emoción ---
async function getMonthlyComparison(userId) {
  const [rows] = await pool.execute(
    `SELECT 
       e.emotion,
       SUM(CASE WHEN MONTH(t.date) = MONTH(CURDATE()) AND YEAR(t.date) = YEAR(CURDATE()) 
           THEN t.amount ELSE 0 END) as current_month,
       SUM(CASE WHEN MONTH(t.date) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) 
           AND YEAR(t.date) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
           THEN t.amount ELSE 0 END) as previous_month
     FROM transactions t
     JOIN expenses e ON e.transaction_id = t.id
     WHERE t.user_id = ? 
       AND t.type = 'expense' 
       AND e.emotion IS NOT NULL 
       AND e.emotion != ''
       AND t.date >= DATE_SUB(CURDATE(), INTERVAL 2 MONTH)
     GROUP BY e.emotion`,
    [userId]
  );

  return rows;
}

// --- Obtiene gastos recientes con emoción (últimos 30 días) ---
async function getRecentEmotionalExpenses(userId, daysBack = 30) {
  const [rows] = await pool.execute(
    `SELECT 
       t.id,
       t.amount,
       t.description,
       t.date,
       e.emotion,
       e.destination
     FROM transactions t
     JOIN expenses e ON e.transaction_id = t.id
     WHERE t.user_id = ? 
       AND t.type = 'expense' 
       AND e.emotion IS NOT NULL 
       AND e.emotion != ''
       AND t.date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
     ORDER BY t.date DESC, t.time DESC`,
    [userId, daysBack]
  );

  return rows;
}

module.exports = {
  getCorrelationalData,
  getTotalExpenses,
  getWeeklyTrends,
  getDayOfWeekPatterns,
  getMonthlyComparison,
  getRecentEmotionalExpenses,
};
