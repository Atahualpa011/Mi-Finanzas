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

module.exports = router; // Exporta el router para ser usado en server.js