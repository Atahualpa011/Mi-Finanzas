const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate'); // Middleware para proteger la ruta (requiere JWT)
const analysisController = require('../controllers/analysisController'); // Controlador con la lógica de análisis

// --- Ruta para obtener el análisis emocional de los gastos del usuario ---
// GET /api/analysis/emotional
router.get('/emotional', authenticate, analysisController.emotionalAnalysis);
// - El frontend llama a este endpoint para obtener estadísticas de emociones asociadas a los gastos.
// - El middleware 'authenticate' verifica el token JWT antes de permitir el acceso.
// - El controlador 'emotionalAnalysis' procesa los datos y responde con el análisis en JSON.

// --- Ruta para obtener análisis correlacional de emociones ---
// GET /api/analysis/correlational
router.get('/correlational', authenticate, analysisController.correlationalAnalysis);
// - Devuelve análisis detallado: promedio por emoción, frecuencia, porcentajes, tendencias mensuales
// - Identifica emoción más cara, más frecuente, riesgo emocional

// --- Ruta para obtener recomendaciones basadas en patrones emocionales ---
// GET /api/analysis/emotional-recommendations
router.get('/emotional-recommendations', authenticate, analysisController.emotionalRecommendations);
// - Genera alertas personalizadas (incrementos en emociones negativas, patrones de días)
// - Proporciona recomendaciones concretas para mejorar salud financiera-emocional

// --- Ruta para obtener tendencias temporales de emociones ---
// GET /api/analysis/emotional-trends
router.get('/emotional-trends', authenticate, analysisController.emotionalTrends);
// - Devuelve datos procesados para gráfico de línea (evolución semanal de gastos por emoción)
// - Acepta parámetro ?weeks=N para configurar el rango temporal (default: 12)

module.exports = router; // Exporta el router para ser usado en server.js