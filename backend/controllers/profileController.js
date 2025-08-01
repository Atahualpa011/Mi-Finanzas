const userModel = require('../models/userModel'); // Importa el modelo de usuario para acceder a la BD

// --- Obtener perfil del usuario autenticado ---
exports.getProfile = async (req, res) => {
  try {
    // Busca los datos del usuario usando el ID extraído del token JWT
    const user = await userModel.getUserProfile(req.user.userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    // Desestructura y adapta los campos para el frontend
    const { email, username, full_name: fullName, country } = user;
    return res.json({ email, username, fullName, country }); // Responde al frontend con los datos
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al obtener perfil' }); // Error de servidor
  }
};

// --- Actualizar perfil del usuario autenticado ---
exports.updateProfile = async (req, res) => {
  const { username, fullName, country } = req.body; // Datos enviados por el frontend
  try {
    // Actualiza los datos en la BD usando el modelo
    await userModel.updateUserProfile(req.user.userId, username, fullName, country);
    return res.json({ message: 'Perfil actualizado' }); // Responde al frontend
  } catch (err) {
    console.error('ERROR in updateProfile:', err);
    return res.status(500).json({ error: 'No se pudo actualizar el perfil' }); // Error de servidor
  }
};

// --- Eliminar cuenta del usuario autenticado ---
exports.deleteUser = async (req, res) => {
  try {
    // Elimina el usuario de la BD usando el modelo
    await userModel.deleteUser(req.user.userId);
    return res.status(200).json({ message: 'Cuenta eliminada' }); // Responde al frontend
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al eliminar la cuenta' }); // Error de servidor
  }
};

// --- Obtener userId por email (para agregar amigos, etc.) ---
exports.getUserIdByEmail = async (req, res) => {
  const { email } = req.body; // Email enviado por el frontend
  if (!email) return res.status(400).json({ error: 'Email requerido' }); // Valida que haya email
  try {
    // Busca el usuario por email en la BD
    const user = await userModel.findUserByEmail(email);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' }); // Si no existe, error
    return res.json({ userId: user.id }); // Devuelve el userId al frontend
  } catch (err) {
    return res.status(500).json({ error: 'Error al buscar usuario' }); // Error de servidor
  }
};