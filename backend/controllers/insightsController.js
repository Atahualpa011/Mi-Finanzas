const metricsService = require('../services/metricsService');
const rulesEngine = require('../services/rulesEngine');
const aiService = require('../services/aiService');
const insightsModel = require('../models/insightsModel');

/**
 * Determina el rango de fechas según el parámetro period
 * @param {string} period - 'current', 'last_month', 'last_3_months', 'custom'
 * @param {string} customStart - Fecha custom inicio (opcional)
 * @param {string} customEnd - Fecha custom fin (opcional)
 * @returns {object} - { startDate, endDate }
 */
function determinePeriod(period, customStart, customEnd) {
  const today = new Date();
  let startDate, endDate;
  
  switch (period) {
    case 'last_month':
      // Mes anterior completo
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 0);
      break;
      
    case 'last_3_months':
      // Últimos 3 meses
      startDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
      endDate = today;
      break;
      
    case 'custom':
      // Fechas personalizadas
      if (!customStart || !customEnd) {
        throw new Error('Fechas personalizadas requeridas para period=custom');
      }
      startDate = new Date(customStart);
      endDate = new Date(customEnd);
      break;
      
    case 'current':
    default:
      // Mes actual (desde el día 1 hasta hoy)
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = today;
      break;
  }
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
}

/**
 * GET /api/insights/metrics
 * Obtiene métricas agregadas sin IA
 */
async function getMetrics(req, res) {
  try {
    const userId = req.user.userId;
    const { period = 'current', start_date, end_date } = req.query;
    
    // Determinar rango de fechas
    const { startDate, endDate } = determinePeriod(period, start_date, end_date);
    
    // Calcular métricas
    const metrics = await metricsService.calculateMetrics(userId, startDate, endDate);
    
    res.json(metrics);
  } catch (error) {
    console.error('Error en GET /api/insights/metrics:', error);
    res.status(500).json({ 
      error: 'Error al calcular métricas',
      message: error.message 
    });
  }
}

/**
 * GET /api/insights/findings
 * Obtiene hallazgos basados en reglas determinísticas (sin IA)
 */
async function getFindings(req, res) {
  try {
    const userId = req.user.userId;
    const { period = 'current', start_date, end_date } = req.query;
    
    // Determinar rango de fechas
    const { startDate, endDate } = determinePeriod(period, start_date, end_date);
    
    // Calcular métricas
    const metrics = await metricsService.calculateMetrics(userId, startDate, endDate);
    
    // Generar hallazgos basados en reglas
    const { findings, summary } = rulesEngine.generateFindings(metrics);
    
    res.json({
      period: metrics.period,
      findings,
      summary
    });
  } catch (error) {
    console.error('Error en GET /api/insights/findings:', error);
    res.status(500).json({ 
      error: 'Error al generar hallazgos',
      message: error.message 
    });
  }
}
/**
 * GET /api/insights/recommendations
 * Obtiene recomendaciones generadas por IA (con fallback si falla)
 */
async function getRecommendations(req, res) {
  try {
    const userId = req.user.userId;
    const { period = 'current', start_date, end_date, model } = req.query;
    
    // Determinar rango de fechas
    const { startDate, endDate } = determinePeriod(period, start_date, end_date);
    
    // 1. Calcular métricas
    const metrics = await metricsService.calculateMetrics(userId, startDate, endDate);
    
    // 2. Generar hallazgos
    const findingsResult = rulesEngine.generateFindings(metrics);
    
    let recommendations, aiModel, generationTimeMs, isAiFallback, fallbackReason;
    
    // 3. Intentar generar recomendaciones con IA
    try {
      const aiResult = await aiService.generateRecommendations(metrics, findingsResult, model);
      recommendations = aiResult.recommendations;
      aiModel = aiResult.model;
      generationTimeMs = aiResult.generationTimeMs;
      isAiFallback = false;
      fallbackReason = null;
    } catch (aiError) {
      // Fallback: convertir hallazgos en recomendaciones sin IA
      console.warn('⚠️ AI service failed, using fallback:', aiError.message);
      
      recommendations = generateFallbackRecommendations(findingsResult.findings);
      aiModel = null;
      generationTimeMs = 0;
      isAiFallback = true;
      fallbackReason = aiError.reason || aiError.message;
    }
    
    // 4. Guardar snapshot
    let snapshotId = null;
    try {
      snapshotId = await insightsModel.saveSnapshot({
        userId,
        periodStart: startDate,
        periodEnd: endDate,
        metrics,
        findings: findingsResult.findings,
        recommendations,
        aiModel,
        generationTimeMs,
        isAiGenerated: !isAiFallback
      });
    } catch (snapshotError) {
      console.error('Error guardando snapshot (no crítico):', snapshotError);
    }
    
    // 5. Responder
    res.json({
      period: metrics.period,
      recommendations,
      disclaimer: aiService.AIServiceError 
        ? 'Estas recomendaciones son generadas automáticamente con base en tus datos financieros y no constituyen asesoramiento financiero profesional. Para decisiones importantes, consulta con un experto.'
        : 'Estas recomendaciones son generadas automáticamente con base en tus datos financieros y no constituyen asesoramiento financiero profesional. Para decisiones importantes, consulta con un experto.',
      meta: {
        generatedAt: new Date().toISOString(),
        model: aiModel,
        generationTimeMs,
        isAiFallback,
        fallbackReason,
        snapshotId,
        rateLimit: req.rateLimit // Info del middleware
      }
    });
  } catch (error) {
    console.error('Error en GET /api/insights/recommendations:', error);
    res.status(500).json({ 
      error: 'Error al generar recomendaciones',
      message: error.message 
    });
  }
}

/**
 * Genera recomendaciones fallback (sin IA) a partir de hallazgos
 */
function generateFallbackRecommendations(findings) {
  return findings.map((finding, index) => ({
    id: index + 1,
    priority: finding.severity === 'alert' ? 'high' : finding.severity === 'warning' ? 'medium' : 'low',
    category: finding.category,
    title: finding.title,
    observation: finding.observation,
    suggestion: generateSuggestionFromFinding(finding),
    actionable: true,
    relatedMetrics: finding.data
  }));
}

/**
 * Genera sugerencia genérica basada en el tipo de hallazgo
 */
function generateSuggestionFromFinding(finding) {
  switch (finding.category) {
    case 'spending_trends':
      if (finding.id.includes('increase')) {
        return 'Revisa tus gastos del período e identifica categorías donde puedas reducir. Prioriza gastos esenciales sobre opcionales.';
      } else {
        return 'Continúa con este buen hábito y considera ahorrar la diferencia.';
      }
    
    case 'budgets':
      if (finding.severity === 'alert') {
        return 'Evita nuevos gastos en esta categoría hasta el próximo período. Considera ajustar el presupuesto si es sistemáticamente insuficiente.';
      } else {
        return 'Revisa los próximos gastos planificados en esta categoría para no exceder el límite.';
      }
    
    case 'emotional':
      if (finding.id.includes('negative')) {
        return 'Identifica qué situaciones desencadenan estos gastos. Implementa la "regla de las 24 horas": espera un día antes de realizar compras no planificadas cuando te sientas emocionalmente alterado.';
      } else {
        return 'Sigue priorizando gastos que generen bienestar genuino en lugar de gratificación instantánea.';
      }
    
    case 'category_analysis':
      return 'Analiza si esta concentración de gastos es temporal o recurrente. Si es recurrente, considera estrategias para reducir costos en esta área.';
    
    case 'balance':
      if (finding.id === 'negative_balance') {
        return 'Busca formas de aumentar ingresos o reducir gastos fijos. Prioriza eliminar gastos superfluos.';
      } else {
        return 'Considera destinar este excedente a ahorros, inversiones o pago adelantado de deudas.';
      }
    
    case 'income_trends':
      return 'Aprovecha este incremento para aumentar tu ahorro o inversión, en lugar de incrementar gastos proporcionalmente.';
    
    case 'patterns':
      return 'Planifica actividades alternativas para ese día que no involucren gastos, o establece un presupuesto específico para controlar el gasto.';
    
    default:
      return 'Revisa tus hábitos financieros y considera ajustes para mejorar tu salud financiera.';
  }
}

/**
 * GET /api/insights/snapshots
 * Obtiene historial de snapshots de recomendaciones
 */
async function getSnapshots(req, res) {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 10;
    
    const snapshots = await insightsModel.getSnapshots(userId, limit);
    
    res.json({ snapshots });
  } catch (error) {
    console.error('Error en GET /api/insights/snapshots:', error);
    res.status(500).json({ 
      error: 'Error al obtener snapshots',
      message: error.message 
    });
  }
}

/**
 * GET /api/insights/snapshots/:id
 * Obtiene un snapshot específico
 */
async function getSnapshotById(req, res) {
  try {
    const userId = req.user.userId;
    const snapshotId = parseInt(req.params.id);
    
    const snapshot = await insightsModel.getSnapshotById(snapshotId, userId);
    
    if (!snapshot) {
      return res.status(404).json({ error: 'Snapshot no encontrado' });
    }
    
    res.json(snapshot);
  } catch (error) {
    console.error('Error en GET /api/insights/snapshots/:id:', error);
    res.status(500).json({ 
      error: 'Error al obtener snapshot',
      message: error.message 
    });
  }
}

module.exports = {
  getMetrics,
  getFindings,
  getRecommendations,
  getSnapshots,
  getSnapshotById
};