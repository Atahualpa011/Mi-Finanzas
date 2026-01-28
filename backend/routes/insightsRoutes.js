const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const rateLimitMiddleware = require('../middleware/rateLimit');
const insightsController = require('../controllers/insightsController');

// --- Ruta para obtener métricas agregadas (sin IA) ---
// GET /api/insights/metrics?period=current
router.get('/metrics', authenticate, insightsController.getMetrics);

// --- Ruta para obtener hallazgos basados en reglas (sin IA) ---
// GET /api/insights/findings?period=current
router.get('/findings', authenticate, insightsController.getFindings);

// --- Ruta para obtener recomendaciones con IA (protegida con rate limiting) ---
// GET /api/insights/recommendations?period=current&model=gpt-4o-mini
router.get('/recommendations', authenticate, rateLimitMiddleware, insightsController.getRecommendations);

// --- Ruta para obtener historial de snapshots ---
// GET /api/insights/snapshots?limit=10
router.get('/snapshots', authenticate, insightsController.getSnapshots);

// --- Ruta para obtener un snapshot específico ---
// GET /api/insights/snapshots/:id
router.get('/snapshots/:id', authenticate, insightsController.getSnapshotById);

module.exports = router;
