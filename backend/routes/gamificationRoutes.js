const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');
const authenticate = require('../middleware/authenticate');

// Aplicar autenticación a todas las rutas
router.use(authenticate);

// --- Dashboard de gamificación ---
router.get('/dashboard', gamificationController.getDashboard);

// --- Rutas de logros ---
router.get('/achievements', gamificationController.getAchievements);      // Listar todos los logros
router.get('/achievements/:code', gamificationController.getAchievement); // Obtener logro específico

// --- Rutas de desafíos ---
router.get('/challenges', gamificationController.getChallenges);          // Listar desafíos disponibles
router.get('/challenges/user', gamificationController.getUserChallengesEndpoint); // Desafíos del usuario
router.post('/challenges/:id/accept', gamificationController.acceptChallenge); // Aceptar desafío

// --- Rutas de leaderboard (ranking) ---
router.get('/leaderboard', gamificationController.getLeaderboard);        // Top usuarios
router.get('/rank', gamificationController.getUserRank);                  // Posición del usuario

module.exports = router;
