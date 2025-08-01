const bcrypt = require('bcrypt');                // Para hashear y comparar contraseñas
const jwt = require('jsonwebtoken');             // Para generar tokens JWT
const userModel = require('../models/userModel');// Acceso a funciones de usuario en la base de datos
const secret = process.env.JWT_SECRET;           // Clave secreta para firmar JWT

// --- Registro de usuario ---
exports.register = async (req, res) => {
  const { email, password, username, fullName, country } = req.body; // Datos enviados por el frontend
  try {
    const password_hash = await bcrypt.hash(password, 10);           // Hashea la contraseña
    const userId = await userModel.createUser(email, password_hash); // Crea usuario en la tabla principal
    await userModel.createUserData(userId, username, fullName, country); // Guarda datos adicionales en otra tabla
    return res.status(201).json({ message: 'Usuario y perfil registrados' }); // Responde al frontend
  } catch (err) {
    console.error('ERROR in register:', err);
    return res.status(500).json({ error: err.message });             // Devuelve error si algo falla
  }
};

// --- Login de usuario ---
exports.login = async (req, res) => {
  const { email, password } = req.body;                              // Datos enviados por el frontend
  try {
    const user = await userModel.findUserByEmail(email);             // Busca usuario por email
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' }); // Si no existe, error
    const match = await bcrypt.compare(password, user.password_hash);// Compara contraseña hasheada
    if (!match) return res.status(401).json({ error: 'Credenciales inválidas' }); // Si no coincide, error
    const token = jwt.sign(
      {
        id: user.id,                   // ID del usuario
        username: user.username,       // Nombre de usuario
        email: user.email              // Email
      },
      secret,                          // Clave secreta
      { expiresIn: '7d' }              // Expira en 7 días
    );
    return res.json({ token });        // Devuelve el token JWT al frontend
  } catch (err) {
    console.error('ERROR in login:', err);
    return res.status(500).json({ error: 'Error al iniciar sesión' }); // Error genérico
  }
};