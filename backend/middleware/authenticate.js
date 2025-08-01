const jwt = require('jsonwebtoken');                  // Importa la librería para manejar JWT
const secret = process.env.JWT_SECRET;                // Obtiene la clave secreta del archivo .env

// Middleware para proteger rutas: verifica el token JWT enviado por el frontend
module.exports = (req, res, next) => {
  const auth = req.headers.authorization;             // Lee la cabecera Authorization del request
  if (!auth) return res.status(401).json({ error: 'No autenticado' }); // Si no hay token, rechaza

  const token = auth.split(' ')[1];                   // Extrae el token del formato "Bearer <token>"
  try {
    const payload = jwt.verify(token, secret);        // Verifica y decodifica el token
    req.user = {                                     // Agrega los datos del usuario al request
      userId: payload.id,                            // ID del usuario (para usar en controladores)
      username: payload.username || null,            // Nombre de usuario (opcional)
      email: payload.email || null                   // Email (opcional)
    };
    next();                                          // Llama al siguiente middleware/controlador
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });// Si falla la verificación, rechaza
  }
};