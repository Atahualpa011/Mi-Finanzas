const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Controlador con la lógica de autenticación

// --- Ruta para registrar un nuevo usuario ---
// POST /api/register
router.post('/register', authController.register);
// - El frontend llama a este endpoint al enviar el formulario de registro.
// - El controlador valida los datos, crea el usuario y responde con éxito o error.

// --- Ruta para login de usuario ---
// POST /api/login
router.post('/login', authController.login);
// - El frontend llama a este endpoint al enviar el formulario de login.
// - El controlador valida las credenciales, genera un token JWT y lo devuelve al frontend.

module.exports = router; // Exporta el router para ser usado en server.js