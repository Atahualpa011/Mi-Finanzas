const pool = require('../db'); // Importa la conexión a la base de datos
const emotionalAnalysisModel = require('../models/emotionalAnalysisModel');
const gamificationModel = require('../models/gamificationModel');

// --- Define los tipos de emociones (compartido entre funciones) ---
const EMOTION_TYPES = {
  positive: ['Felicidad', 'Alivio', 'Orgullo', 'Generosidad/Amor', 'Emocion/Entusiasmo'],
  negative: ['Culpa', 'Ansiedad/Estres', 'Arrepentimiento', 'Frustracion', 'Verguenza'],
  neutral: ['Indiferencia', 'Ambivalencia']
};

// --- Función auxiliar para clasificar emociones ---
function getEmotionType(emotion) {
  if (EMOTION_TYPES.positive.includes(emotion)) return 'positive';
  if (EMOTION_TYPES.negative.includes(emotion)) return 'negative';
  if (EMOTION_TYPES.neutral.includes(emotion)) return 'neutral';
  return 'other';
}

// --- Endpoint principal: análisis emocional de gastos ---
exports.emotionalAnalysis = async (req, res) => {
  const userId = req.user.userId; // Obtiene el ID del usuario autenticado desde el token JWT

  // --- Consulta SQL: obtiene gastos con emociones asociadas ---
  const [rows] = await pool.execute(
    `SELECT t.id, t.amount, t.description, e.emotion
     FROM transactions t
     JOIN expenses e ON e.transaction_id = t.id
     WHERE t.user_id = ? AND t.type = 'expense' AND e.emotion IS NOT NULL AND e.emotion != ''`,
    [userId]
  );

  // --- Inicializa estructuras para agrupar y separar emociones ---
  const emotionStats = {}; // { emoción: { count, total } }
  const separated = { positive: [], negative: [], neutral: [], other: [] };

  // --- Procesa cada gasto y lo agrupa por emoción ---
  for (const tx of rows) {
    // Si emotion es array, recorre; si es string, lo convierte a array
    const emotions = Array.isArray(tx.emotion) ? tx.emotion : tx.emotion.split(',');
    for (const em of emotions) {
      const emotion = em.trim();
      if (!emotion) continue;
      // Inicializa el contador si es la primera vez que aparece la emoción
      if (!emotionStats[emotion]) emotionStats[emotion] = { count: 0, total: 0 };
      emotionStats[emotion].count += 1;
      emotionStats[emotion].total += Number(tx.amount);

      // Clasifica el gasto según el tipo de emoción
      const type = getEmotionType(emotion);
      separated[type].push({ ...tx, emotion });
    }
  }

  // --- Devuelve el resultado al frontend ---
  res.json({
    emotionStats, // { emoción: { count, total } }
    separated     // { positive: [...], negative: [...], neutral: [...], other: [...] }
  });
};

// --- Nuevo endpoint: análisis correlacional de emociones ---
exports.correlationalAnalysis = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Desbloquear logro de autoconocimiento al visitar análisis emocional
    try {
      await gamificationModel.unlockAchievement(userId, 'self_awareness');
    } catch (gamError) {
      console.error('Error desbloqueando logro (no crítico):', gamError);
    }

    // Obtener datos de análisis correlacional
    const correlationalData = await emotionalAnalysisModel.getCorrelationalData(userId);
    const totalExpenses = await emotionalAnalysisModel.getTotalExpenses(userId);
    const monthlyComparison = await emotionalAnalysisModel.getMonthlyComparison(userId);

    // Procesar emociones múltiples (separar por comas)
    const processedData = {};
    
    for (const row of correlationalData) {
      const emotions = row.emotion.split(',').map(e => e.trim());
      
      for (const emotion of emotions) {
        if (!emotion) continue;
        
        if (!processedData[emotion]) {
          processedData[emotion] = {
            frequency: 0,
            totalSpent: 0,
            avgSpent: 0,
            percentage: 0,
            type: getEmotionType(emotion),
            firstOccurrence: row.first_occurrence,
            lastOccurrence: row.last_occurrence
          };
        }
        
        processedData[emotion].frequency += parseInt(row.frequency);
        processedData[emotion].totalSpent += parseFloat(row.total_spent);
      }
    }

    // Calcular promedios y porcentajes
    for (const emotion in processedData) {
      const data = processedData[emotion];
      data.avgSpent = data.totalSpent / data.frequency;
      data.percentage = totalExpenses > 0 ? (data.totalSpent / totalExpenses) * 100 : 0;
    }

    // Calcular comparación mensual procesada
    const monthlyComparisonProcessed = {};
    for (const row of monthlyComparison) {
      const emotions = row.emotion.split(',').map(e => e.trim());
      
      for (const emotion of emotions) {
        if (!emotion) continue;
        
        if (!monthlyComparisonProcessed[emotion]) {
          monthlyComparisonProcessed[emotion] = {
            currentMonth: 0,
            previousMonth: 0,
            change: 0,
            changePercentage: 0,
            trend: 'stable'
          };
        }
        
        monthlyComparisonProcessed[emotion].currentMonth += parseFloat(row.current_month || 0);
        monthlyComparisonProcessed[emotion].previousMonth += parseFloat(row.previous_month || 0);
      }
    }

    // Calcular cambio y tendencia
    for (const emotion in monthlyComparisonProcessed) {
      const data = monthlyComparisonProcessed[emotion];
      data.change = data.currentMonth - data.previousMonth;
      
      if (data.previousMonth > 0) {
        data.changePercentage = (data.change / data.previousMonth) * 100;
      } else if (data.currentMonth > 0) {
        data.changePercentage = 100;
      }
      
      if (data.changePercentage > 10) {
        data.trend = 'increasing';
      } else if (data.changePercentage < -10) {
        data.trend = 'decreasing';
      } else {
        data.trend = 'stable';
      }
    }

    // Identificar emoción más cara y más frecuente
    let mostExpensiveEmotion = null;
    let mostFrequentEmotion = null;
    let maxSpent = 0;
    let maxFrequency = 0;

    for (const emotion in processedData) {
      if (processedData[emotion].totalSpent > maxSpent) {
        maxSpent = processedData[emotion].totalSpent;
        mostExpensiveEmotion = emotion;
      }
      if (processedData[emotion].frequency > maxFrequency) {
        maxFrequency = processedData[emotion].frequency;
        mostFrequentEmotion = emotion;
      }
    }

    // Calcular totales por tipo de emoción
    const totals = { positive: 0, negative: 0, neutral: 0 };
    for (const emotion in processedData) {
      const type = processedData[emotion].type;
      if (type === 'positive' || type === 'negative' || type === 'neutral') {
        totals[type] += processedData[emotion].totalSpent;
      }
    }

    // Calcular riesgo emocional
    const totalEmotional = totals.positive + totals.negative + totals.neutral;
    const negativePercentage = totalEmotional > 0 ? (totals.negative / totalEmotional) * 100 : 0;
    
    let emotionalRisk = 'low';
    if (negativePercentage > 60) {
      emotionalRisk = 'high';
    } else if (negativePercentage > 40) {
      emotionalRisk = 'medium';
    }

    // Construir respuesta
    const response = {
      byEmotion: processedData,
      monthlyComparison: monthlyComparisonProcessed,
      summary: {
        mostExpensiveEmotion,
        mostFrequentEmotion,
        positiveVsNegative: {
          positive: totals.positive,
          negative: totals.negative,
          neutral: totals.neutral
        },
        emotionalRisk,
        totalEmotionalExpenses: totalExpenses,
        negativePercentage: negativePercentage.toFixed(1)
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error en análisis correlacional:', error);
    res.status(500).json({ error: 'Error al procesar el análisis correlacional' });
  }
};

// --- Nuevo endpoint: recomendaciones emocionales ---
exports.emotionalRecommendations = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Obtener datos necesarios
    const correlationalData = await emotionalAnalysisModel.getCorrelationalData(userId);
    const monthlyComparison = await emotionalAnalysisModel.getMonthlyComparison(userId);
    const dayPatterns = await emotionalAnalysisModel.getDayOfWeekPatterns(userId);
    const totalExpenses = await emotionalAnalysisModel.getTotalExpenses(userId);

    const alerts = [];
    const recommendations = [];

    // Procesar datos correlacionales
    const processedData = {};
    for (const row of correlationalData) {
      const emotions = row.emotion.split(',').map(e => e.trim());
      for (const emotion of emotions) {
        if (!emotion) continue;
        if (!processedData[emotion]) {
          processedData[emotion] = {
            frequency: 0,
            totalSpent: 0,
            type: getEmotionType(emotion)
          };
        }
        processedData[emotion].frequency += parseInt(row.frequency);
        processedData[emotion].totalSpent += parseFloat(row.total_spent);
      }
    }

    // Calcular porcentajes
    for (const emotion in processedData) {
      processedData[emotion].percentage = totalExpenses > 0 
        ? (processedData[emotion].totalSpent / totalExpenses) * 100 
        : 0;
    }

    // Procesar comparación mensual
    const monthlyData = {};
    for (const row of monthlyComparison) {
      const emotions = row.emotion.split(',').map(e => e.trim());
      for (const emotion of emotions) {
        if (!emotion) continue;
        if (!monthlyData[emotion]) {
          monthlyData[emotion] = { current: 0, previous: 0 };
        }
        monthlyData[emotion].current += parseFloat(row.current_month || 0);
        monthlyData[emotion].previous += parseFloat(row.previous_month || 0);
      }
    }

    // ALERTA 1: Detectar incremento en emociones negativas
    for (const emotion in monthlyData) {
      const type = getEmotionType(emotion);
      if (type === 'negative') {
        const change = monthlyData[emotion].current - monthlyData[emotion].previous;
        const changePercentage = monthlyData[emotion].previous > 0 
          ? (change / monthlyData[emotion].previous) * 100 
          : (monthlyData[emotion].current > 0 ? 100 : 0);

        if (changePercentage > 30) {
          alerts.push({
            type: 'emotional_increase',
            severity: 'warning',
            emotion,
            message: `Tus gastos asociados a "${emotion}" aumentaron ${changePercentage.toFixed(0)}% este mes`,
            suggestion: `Considera pausar compras cuando te sientas ${emotion.toLowerCase()}. Intenta identificar el motivo del aumento.`,
            data: {
              currentMonth: monthlyData[emotion].current,
              previousMonth: monthlyData[emotion].previous,
              change: change,
              changePercentage: changePercentage.toFixed(1)
            }
          });
        }
      }
    }

    // ALERTA 2: Emoción representa más del 40% del gasto total
    for (const emotion in processedData) {
      const type = processedData[emotion].type;
      const percentage = processedData[emotion].percentage;
      
      if (type === 'negative' && percentage > 40) {
        alerts.push({
          type: 'high_emotional_spending',
          severity: 'danger',
          emotion,
          message: `"${emotion}" representa el ${percentage.toFixed(0)}% de tus gastos emocionales`,
          suggestion: 'Este patrón puede indicar compras impulsivas o de compensación. Considera técnicas de control como la regla de las 24 horas antes de comprar.',
          data: {
            percentage: percentage.toFixed(1),
            totalSpent: processedData[emotion].totalSpent,
            frequency: processedData[emotion].frequency
          }
        });
      }
    }

    // ALERTA 3: Patrones de día de la semana
    if (dayPatterns.length > 0) {
      const topPattern = dayPatterns[0];
      const emotion = topPattern.emotion;
      const type = getEmotionType(emotion);
      
      if (type === 'negative' && topPattern.occurrence_count >= 3) {
        alerts.push({
          type: 'day_pattern',
          severity: 'info',
          emotion,
          message: `Detectamos que gastas más por "${emotion}" los ${topPattern.day_name}`,
          suggestion: `Planifica actividades alternativas para los ${topPattern.day_name} que no involucren gastos.`,
          data: {
            dayName: topPattern.day_name,
            occurrenceCount: topPattern.occurrence_count,
            avgAmount: parseFloat(topPattern.avg_amount)
          }
        });
      }
    }

    // RECOMENDACIÓN 1: Más gastos negativos que positivos
    const totals = { positive: 0, negative: 0, neutral: 0 };
    for (const emotion in processedData) {
      const type = processedData[emotion].type;
      if (type === 'positive' || type === 'negative' || type === 'neutral') {
        totals[type] += processedData[emotion].totalSpent;
      }
    }

    if (totals.negative > totals.positive * 1.5) {
      recommendations.push({
        category: 'emotional_balance',
        priority: 'high',
        title: 'Desequilibrio emocional en gastos',
        description: 'Tus gastos asociados a emociones negativas superan significativamente a los positivos',
        action: 'Intenta identificar qué emociones desencadenan tus compras. Registra tus emociones antes de gastar para tomar conciencia.',
        benefit: 'Reducir gastos impulsivos puede mejorar tu salud financiera y emocional'
      });
    }

    // RECOMENDACIÓN 2: Poca conciencia emocional
    const emotionsUsedCount = Object.keys(processedData).length;
    if (emotionsUsedCount <= 2) {
      recommendations.push({
        category: 'emotional_awareness',
        priority: 'medium',
        title: 'Mejora tu registro emocional',
        description: `Solo registraste ${emotionsUsedCount} tipo(s) de emoción. Ser más específico te ayudará a identificar patrones`,
        action: 'Intenta ser más preciso al registrar tus emociones asociadas a cada gasto',
        benefit: 'Mayor autoconocimiento conduce a mejores decisiones financieras'
      });
    }

    // RECOMENDACIÓN 3: Gastos positivos bajos
    if (totals.positive > 0 && totals.positive < totals.negative * 0.3) {
      const positivePercentage = ((totals.positive / (totals.positive + totals.negative + totals.neutral)) * 100).toFixed(0);
      recommendations.push({
        category: 'positive_spending',
        priority: 'medium',
        title: 'Enfócate en experiencias positivas',
        description: `Solo el ${positivePercentage}% de tus gastos están asociados a emociones positivas`,
        action: 'Invierte más en experiencias que te generen felicidad y satisfacción genuina',
        benefit: 'Los gastos conscientes en experiencias positivas generan mayor bienestar a largo plazo'
      });
    }

    // RECOMENDACIÓN 4: No hay datos suficientes
    if (totalExpenses === 0) {
      recommendations.push({
        category: 'start_tracking',
        priority: 'high',
        title: 'Comienza a registrar tus emociones',
        description: 'Aún no tienes gastos con emociones asociadas',
        action: 'Al registrar cada gasto, selecciona la emoción que sentiste en ese momento',
        benefit: 'El análisis emocional te ayudará a identificar patrones y tomar mejores decisiones'
      });
    }

    res.json({
      alerts,
      recommendations,
      summary: {
        totalAlerts: alerts.length,
        totalRecommendations: recommendations.length,
        emotionalHealth: alerts.length === 0 ? 'excellent' : alerts.length <= 2 ? 'good' : 'needs_attention'
      }
    });
  } catch (error) {
    console.error('Error en recomendaciones emocionales:', error);
    res.status(500).json({ error: 'Error al generar recomendaciones emocionales' });
  }
};

// --- Nuevo endpoint: tendencias temporales para gráfico de línea ---
exports.emotionalTrends = async (req, res) => {
  try {
    const userId = req.user.userId;
    const weeksBack = parseInt(req.query.weeks) || 12;

    // Obtener tendencias temporales
    const trendsData = await emotionalAnalysisModel.getEmotionalTrends(userId, weeksBack);

    // Procesar datos para formato Chart.js
    const emotionsByWeek = {};
    const allEmotions = new Set();
    const weekLabels = new Set();

    // Primera pasada: identificar todas las emociones y semanas
    for (const row of trendsData) {
      const emotions = row.emotion.split(',').map(e => e.trim());
      
      for (const emotion of emotions) {
        if (!emotion) continue;
        allEmotions.add(emotion);
        weekLabels.add(row.year_week);
        
        const weekKey = row.year_week;
        if (!emotionsByWeek[weekKey]) {
          emotionsByWeek[weekKey] = {
            weekStart: row.week_start,
            yearWeek: row.year_week,
            emotions: {}
          };
        }
        
        if (!emotionsByWeek[weekKey].emotions[emotion]) {
          emotionsByWeek[weekKey].emotions[emotion] = {
            total: 0,
            count: 0
          };
        }
        
        emotionsByWeek[weekKey].emotions[emotion].total += parseFloat(row.total_amount);
        emotionsByWeek[weekKey].emotions[emotion].count += parseInt(row.transaction_count);
      }
    }

    // Convertir a array ordenado
    const sortedWeeks = Array.from(weekLabels).sort();
    const emotionsArray = Array.from(allEmotions);

    // Construir datasets para Chart.js
    const datasets = emotionsArray.map(emotion => {
      const data = sortedWeeks.map(week => {
        return emotionsByWeek[week]?.emotions[emotion]?.total || 0;
      });

      return {
        label: emotion,
        data: data,
        emotion: emotion,
        type: getEmotionType(emotion)
      };
    });

    // Generar etiquetas legibles para las semanas
    const labels = sortedWeeks.map(week => {
      const year = Math.floor(week / 100);
      const weekNum = week % 100;
      return `Sem ${weekNum}/${year}`;
    });

    res.json({
      labels,
      datasets,
      metadata: {
        totalWeeks: sortedWeeks.length,
        totalEmotions: emotionsArray.length,
        dateRange: {
          from: trendsData.length > 0 ? trendsData[trendsData.length - 1].week_start : null,
          to: trendsData.length > 0 ? trendsData[0].week_start : null
        }
      }
    });
  } catch (error) {
    console.error('Error en tendencias emocionales:', error);
    res.status(500).json({ error: 'Error al obtener tendencias emocionales' });
  }
};