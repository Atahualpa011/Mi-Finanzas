const insightsModel = require('../models/insightsModel');
const budgetModel = require('../models/budgetModel');
const emotionalAnalysisModel = require('../models/emotionalAnalysisModel');
const { getEmotionType, parseEmotions } = require('../utils/emotionUtils');

/**
 * Calcula el rango de fechas del período anterior (mismo número de días)
 * @param {string} startDate - Fecha inicio período actual
 * @param {string} endDate - Fecha fin período actual
 * @returns {object} - { startDate, endDate }
 */
function getPreviousPeriod(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  
  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - diffDays);
  
  return {
    startDate: prevStart.toISOString().split('T')[0],
    endDate: prevEnd.toISOString().split('T')[0]
  };
}

/**
 * Calcula todas las métricas para un usuario en un período
 * @param {number} userId - ID del usuario
 * @param {string} startDate - Fecha inicio (YYYY-MM-DD)
 * @param {string} endDate - Fecha fin (YYYY-MM-DD)
 * @returns {object} - Objeto completo con todas las métricas
 */
async function calculateMetrics(userId, startDate, endDate) {
  // Calcular período anterior
  const previousPeriod = getPreviousPeriod(startDate, endDate);
  
  // Ejecutar todas las queries en paralelo para optimizar rendimiento
  const [
    incomeTotal,
    incomeTotalPrevious,
    incomeTopCategories,
    expenseTotal,
    expenseTotalPrevious,
    expenseTopCategories,
    budgets,
    emotionalData,
    totalEmotionalExpenses,
    dayPattern,
    avgDaily,
    frequency,
    categoryDistribution
  ] = await Promise.all([
    // Ingresos período actual
    insightsModel.getTotalsByPeriod(userId, startDate, endDate, 'income'),
    // Ingresos período anterior
    insightsModel.getTotalsByPeriod(userId, previousPeriod.startDate, previousPeriod.endDate, 'income'),
    // Top categorías de ingreso
    insightsModel.getTopCategories(userId, startDate, endDate, 'income', 5),
    // Gastos período actual
    insightsModel.getTotalsByPeriod(userId, startDate, endDate, 'expense'),
    // Gastos período anterior
    insightsModel.getTotalsByPeriod(userId, previousPeriod.startDate, previousPeriod.endDate, 'expense'),
    // Top categorías de gasto
    insightsModel.getTopCategories(userId, startDate, endDate, 'expense', 5),
    // Presupuestos (reutilizamos modelo existente)
    budgetModel.getBudgetsWithProgress(userId),
    // Datos emocionales (reutilizamos modelo existente)
    emotionalAnalysisModel.getCorrelationalData(userId),
    // Total de gastos con emoción
    emotionalAnalysisModel.getTotalExpenses(userId),
    // Día con mayor gasto
    insightsModel.getDayWithMostExpenses(userId, startDate, endDate),
    // Promedio diario
    insightsModel.getAverageDailyExpenses(userId, startDate, endDate),
    // Frecuencia de transacciones
    insightsModel.getTransactionFrequency(userId, startDate, endDate),
    // Distribución por categoría
    insightsModel.getCategoryDistribution(userId, startDate, endDate)
  ]);
  
  // Calcular cambios en ingresos
  const incomeChange = incomeTotal - incomeTotalPrevious;
  const incomeChangePercentage = incomeTotalPrevious > 0 
    ? (incomeChange / incomeTotalPrevious) * 100 
    : (incomeTotal > 0 ? 100 : 0);
  
  // Calcular cambios en gastos
  const expenseChange = expenseTotal - expenseTotalPrevious;
  const expenseChangePercentage = expenseTotalPrevious > 0 
    ? (expenseChange / expenseTotalPrevious) * 100 
    : (expenseTotal > 0 ? 100 : 0);
  
  // Calcular balance
  const currentBalance = incomeTotal - expenseTotal;
  const previousBalance = incomeTotalPrevious - expenseTotalPrevious;
  const balanceChange = currentBalance - previousBalance;
  
  // Procesar datos emocionales
  const emotionalStats = processEmotionalData(emotionalData, totalEmotionalExpenses, expenseTotal);
  
  // Procesar presupuestos
  const budgetStats = processBudgets(budgets);
  
  // Formatear período
  const periodLabel = formatPeriodLabel(startDate, endDate);
  
  return {
    period: {
      start: startDate,
      end: endDate,
      label: periodLabel
    },
    income: {
      total: incomeTotal,
      totalPreviousPeriod: incomeTotalPrevious,
      change: incomeChange,
      changePercentage: parseFloat(incomeChangePercentage.toFixed(1)),
      topCategories: incomeTopCategories
    },
    expenses: {
      total: expenseTotal,
      totalPreviousPeriod: expenseTotalPrevious,
      change: expenseChange,
      changePercentage: parseFloat(expenseChangePercentage.toFixed(1)),
      topCategories: expenseTopCategories
    },
    balance: {
      current: currentBalance,
      previous: previousBalance,
      change: balanceChange
    },
    budgets: budgetStats,
    emotions: emotionalStats,
    patterns: {
      dayWithMostExpenses: dayPattern?.dayName || null,
      dayWithMostExpensesTotal: dayPattern?.total || 0,
      averageDailyExpenses: parseFloat(avgDaily.toFixed(2)),
      transactionFrequency: frequency
    },
    categoryDistribution
  };
}

/**
 * Procesa datos emocionales para el resumen de métricas
 */
function processEmotionalData(emotionalData, totalEmotionalExpenses, totalExpenses) {
  if (!emotionalData || emotionalData.length === 0) {
    return {
      totalWithEmotion: 0,
      percentageOfExpenses: 0,
      topEmotions: [],
      positiveVsNegative: {
        positive: 0,
        negative: 0,
        neutral: 0
      }
    };
  }
  
  const processedEmotions = {};
  const totals = { positive: 0, negative: 0, neutral: 0 };
  
  // Procesar cada fila (puede contener múltiples emociones separadas por comas)
  for (const row of emotionalData) {
    const emotions = parseEmotions(row.emotion);
    
    for (const emotion of emotions) {
      if (!processedEmotions[emotion]) {
        processedEmotions[emotion] = {
          total: 0,
          frequency: 0,
          type: getEmotionType(emotion)
        };
      }
      
      processedEmotions[emotion].frequency += parseInt(row.frequency);
      processedEmotions[emotion].total += parseFloat(row.total_spent);
      
      // Acumular en totales por tipo
      const type = processedEmotions[emotion].type;
      if (type === 'positive' || type === 'negative' || type === 'neutral') {
        totals[type] += parseFloat(row.total_spent);
      }
    }
  }
  
  // Convertir a array y ordenar por total
  const topEmotions = Object.keys(processedEmotions)
    .map(emotion => ({
      emotion,
      total: processedEmotions[emotion].total,
      frequency: processedEmotions[emotion].frequency,
      type: processedEmotions[emotion].type
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  
  const percentageOfExpenses = totalExpenses > 0 
    ? (totalEmotionalExpenses / totalExpenses) * 100 
    : 0;
  
  return {
    totalWithEmotion: totalEmotionalExpenses,
    percentageOfExpenses: parseFloat(percentageOfExpenses.toFixed(1)),
    topEmotions,
    positiveVsNegative: {
      positive: totals.positive,
      negative: totals.negative,
      neutral: totals.neutral
    }
  };
}

/**
 * Procesa datos de presupuestos
 */
function processBudgets(budgets) {
  const stats = {
    total: budgets.length,
    exceeded: 0,
    warning: 0,
    ok: 0,
    items: []
  };
  
  for (const budget of budgets) {
    if (budget.status === 'exceeded') stats.exceeded++;
    else if (budget.status === 'warning') stats.warning++;
    else if (budget.status === 'ok') stats.ok++;
    
    stats.items.push({
      id: budget.id,
      categoryName: budget.category_name || `Presupuesto emocional: ${budget.emotion_filter}`,
      budgetAmount: parseFloat(budget.budget_amount),
      totalSpent: parseFloat(budget.total_spent),
      percentageUsed: parseFloat(budget.percentage_used),
      status: budget.status,
      remaining: parseFloat(budget.remaining)
    });
  }
  
  return stats;
}

/**
 * Formatea el label del período
 */
function formatPeriodLabel(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  // Si es el mismo mes
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${months[start.getMonth()]} ${start.getFullYear()}`;
  }
  
  // Si es rango de fechas
  return `${start.getDate()} ${months[start.getMonth()]} - ${end.getDate()} ${months[end.getMonth()]} ${end.getFullYear()}`;
}

module.exports = {
  calculateMetrics,
  getPreviousPeriod
};
