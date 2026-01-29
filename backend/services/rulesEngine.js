/**
 * Motor de reglas para generar hallazgos determinísticos
 * No utiliza IA, solo lógica condicional basada en métricas
 */

/**
 * Genera hallazgos basados en las métricas calculadas
 * @param {object} metrics - Objeto de métricas calculadas
 * @returns {object} - { findings, summary }
 */
function generateFindings(metrics) {
  const findings = [];
  let findingId = 1;

  // REGLA 1: Aumento significativo en gastos (>30%)
  if (metrics.expenses.changePercentage > 30) {
    findings.push({
      id: `expense_increase_high`,
      category: 'spending_trends',
      severity: 'warning',
      title: 'Aumento significativo en gastos',
      observation: `Tus gastos totales aumentaron $${formatNumber(metrics.expenses.change)} (+${metrics.expenses.changePercentage}%) respecto al período anterior.`,
      data: {
        current: metrics.expenses.total,
        previous: metrics.expenses.totalPreviousPeriod,
        change: metrics.expenses.change,
        changePercentage: metrics.expenses.changePercentage
      }
    });
  } else if (metrics.expenses.changePercentage > 15) {
    // REGLA 1b: Aumento moderado en gastos (15-30%)
    findings.push({
      id: `expense_increase_moderate`,
      category: 'spending_trends',
      severity: 'info',
      title: 'Aumento moderado en gastos',
      observation: `Tus gastos aumentaron $${formatNumber(metrics.expenses.change)} (+${metrics.expenses.changePercentage}%) respecto al período anterior.`,
      data: {
        current: metrics.expenses.total,
        previous: metrics.expenses.totalPreviousPeriod,
        change: metrics.expenses.change,
        changePercentage: metrics.expenses.changePercentage
      }
    });
  } else if (metrics.expenses.changePercentage < -15) {
    // REGLA 1c: Reducción en gastos (buena noticia)
    findings.push({
      id: `expense_decrease`,
      category: 'spending_trends',
      severity: 'success',
      title: 'Reducción en gastos',
      observation: `¡Excelente! Redujiste tus gastos en $${formatNumber(Math.abs(metrics.expenses.change))} (${Math.abs(metrics.expenses.changePercentage)}%) respecto al período anterior.`,
      data: {
        current: metrics.expenses.total,
        previous: metrics.expenses.totalPreviousPeriod,
        change: metrics.expenses.change,
        changePercentage: metrics.expenses.changePercentage
      }
    });
  }

  // REGLA 2: Presupuestos excedidos
  if (metrics.budgets.exceeded > 0) {
    const exceededBudgets = metrics.budgets.items.filter(b => b.status === 'exceeded');
    exceededBudgets.forEach(budget => {
      findings.push({
        id: `budget_exceeded_${budget.id}`,
        category: 'budgets',
        severity: 'alert',
        title: `Presupuesto excedido: ${budget.categoryName}`,
        observation: `Has excedido el presupuesto de "${budget.categoryName}". Gastaste $${formatNumber(budget.totalSpent)} de $${formatNumber(budget.budgetAmount)} (${budget.percentageUsed}%).`,
        data: {
          budgetId: budget.id,
          categoryName: budget.categoryName,
          budgetAmount: budget.budgetAmount,
          totalSpent: budget.totalSpent,
          percentageUsed: budget.percentageUsed,
          exceeded: budget.totalSpent - budget.budgetAmount
        }
      });
    });
  }

  // REGLA 3: Presupuestos en alerta (warning)
  if (metrics.budgets.warning > 0) {
    const warningBudgets = metrics.budgets.items.filter(b => b.status === 'warning');
    warningBudgets.forEach(budget => {
      findings.push({
        id: `budget_warning_${budget.id}`,
        category: 'budgets',
        severity: 'info',
        title: `Presupuesto ${budget.categoryName} cerca del límite`,
        observation: `Has consumido el ${budget.percentageUsed}% del presupuesto de ${budget.categoryName} ($${formatNumber(budget.totalSpent)} de $${formatNumber(budget.budgetAmount)}).`,
        data: {
          budgetId: budget.id,
          categoryName: budget.categoryName,
          percentageUsed: budget.percentageUsed,
          remaining: budget.remaining
        }
      });
    });
  }

  // REGLA 4: Emociones negativas predominantes (>60%)
  if (metrics.emotions.totalWithEmotion > 0) {
    const totalEmotional = metrics.emotions.positiveVsNegative.positive +
      metrics.emotions.positiveVsNegative.negative +
      metrics.emotions.positiveVsNegative.neutral;

    const negativePercentage = totalEmotional > 0
      ? (metrics.emotions.positiveVsNegative.negative / totalEmotional) * 100
      : 0;

    if (negativePercentage > 60) {
      findings.push({
        id: `negative_emotions_high`,
        category: 'emotional',
        severity: 'warning',
        title: 'Predominio de emociones negativas',
        observation: `El ${negativePercentage.toFixed(1)}% de tus gastos emocionales están asociados a emociones negativas ($${formatNumber(metrics.emotions.positiveVsNegative.negative)} de $${formatNumber(totalEmotional)}).`,
        data: {
          negative: metrics.emotions.positiveVsNegative.negative,
          positive: metrics.emotions.positiveVsNegative.positive,
          neutral: metrics.emotions.positiveVsNegative.neutral,
          negativePercentage: parseFloat(negativePercentage.toFixed(1))
        }
      });
    } else if (metrics.emotions.positiveVsNegative.positive > metrics.emotions.positiveVsNegative.negative) {
      // Emociones positivas predominan (buena noticia)
      findings.push({
        id: `positive_emotions_high`,
        category: 'emotional',
        severity: 'success',
        title: 'Emociones positivas predominan',
        observation: `¡Buen trabajo! Tus gastos están más asociados a emociones positivas ($${formatNumber(metrics.emotions.positiveVsNegative.positive)}) que negativas ($${formatNumber(metrics.emotions.positiveVsNegative.negative)}).`,
        data: {
          positive: metrics.emotions.positiveVsNegative.positive,
          negative: metrics.emotions.positiveVsNegative.negative,
          neutral: metrics.emotions.positiveVsNegative.neutral
        }
      });
    }
  }

  // REGLA 5: Categoría representa >40% del gasto total (pico sospechoso)
  if (metrics.categoryDistribution && metrics.categoryDistribution.length > 0) {
    const topCategory = metrics.categoryDistribution[0];
    if (topCategory.percentage > 40) {
      findings.push({
        id: `category_spike_${topCategory.categoryId}`,
        category: 'category_analysis',
        severity: 'alert',
        title: `Pico en categoría ${topCategory.categoryName}`,
        observation: `La categoría '${topCategory.categoryName}' representa el ${topCategory.percentage.toFixed(1)}% de tus gastos este período ($${formatNumber(topCategory.total)}).`,
        data: {
          categoryId: topCategory.categoryId,
          categoryName: topCategory.categoryName,
          total: topCategory.total,
          percentage: parseFloat(topCategory.percentage.toFixed(1))
        }
      });
    }
  }

  // REGLA 6: Balance positivo (ingresos > gastos)
  if (metrics.balance.current > 0) {
    findings.push({
      id: `positive_balance`,
      category: 'balance',
      severity: 'success',
      title: 'Balance positivo',
      observation: `Tus ingresos superaron tus gastos este período en $${formatNumber(metrics.balance.current)}.`,
      data: {
        balance: metrics.balance.current,
        income: metrics.income.total,
        expenses: metrics.expenses.total
      }
    });
  } else if (metrics.balance.current < 0) {
    // REGLA 6b: Balance negativo (gastos > ingresos)
    findings.push({
      id: `negative_balance`,
      category: 'balance',
      severity: 'alert',
      title: 'Balance negativo',
      observation: `Tus gastos superaron tus ingresos este período en $${formatNumber(Math.abs(metrics.balance.current))}.`,
      data: {
        balance: metrics.balance.current,
        income: metrics.income.total,
        expenses: metrics.expenses.total
      }
    });
  }

  // REGLA 7: Incremento significativo en ingresos (>20%)
  if (metrics.income.changePercentage > 20) {
    findings.push({
      id: `income_increase`,
      category: 'income_trends',
      severity: 'success',
      title: 'Incremento en ingresos',
      observation: `¡Excelente! Tus ingresos aumentaron $${formatNumber(metrics.income.change)} (+${metrics.income.changePercentage}%) respecto al período anterior.`,
      data: {
        current: metrics.income.total,
        previous: metrics.income.totalPreviousPeriod,
        change: metrics.income.change,
        changePercentage: metrics.income.changePercentage
      }
    });
  }

  // REGLA 8: Día con mayor gasto identificado
  if (metrics.patterns.dayWithMostExpenses) {
    findings.push({
      id: `day_pattern`,
      category: 'patterns',
      severity: 'info',
      title: `Día con mayor gasto: ${metrics.patterns.dayWithMostExpenses}`,
      observation: `Los ${metrics.patterns.dayWithMostExpenses}s son tu día de mayor gasto en este período ($${formatNumber(metrics.patterns.dayWithMostExpensesTotal)}).`,
      data: {
        dayName: metrics.patterns.dayWithMostExpenses,
        total: metrics.patterns.dayWithMostExpensesTotal
      }
    });
  }

  // Generar resumen
  const summary = {
    totalFindings: findings.length,
    bySeverity: {
      success: findings.filter(f => f.severity === 'success').length,
      info: findings.filter(f => f.severity === 'info').length,
      warning: findings.filter(f => f.severity === 'warning').length,
      alert: findings.filter(f => f.severity === 'alert').length
    },
    byCategory: {}
  };

  findings.forEach(f => {
    if (!summary.byCategory[f.category]) {
      summary.byCategory[f.category] = 0;
    }
    summary.byCategory[f.category]++;
  });

  return {
    findings,
    summary
  };
}

/**
 * Formatea un número como moneda (sin símbolo)
 */
function formatNumber(num) {
  return num.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

module.exports = {
  generateFindings
};
