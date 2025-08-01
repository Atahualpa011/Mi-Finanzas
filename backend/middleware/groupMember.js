const pool = require('../db'); // Importa la conexión a la base de datos

// Middleware para verificar si el usuario autenticado es miembro del grupo
module.exports = async function (req, res, next) {
  const groupId = req.params.groupId;      // Obtiene el ID del grupo de la URL
  const userId = req.user.userId;          // Obtiene el ID del usuario autenticado (del token)

  // Consulta la base de datos para ver si el usuario es miembro del grupo
  const [rows] = await pool.execute(
    `SELECT id FROM group_members WHERE group_id = ? AND user_id = ?`,
    [groupId, userId]
  );

  // Si no es miembro, responde con error 403 (prohibido)
  if (rows.length === 0) {
    return res.status(403).json({ error: 'Solo los miembros pueden acceder a este grupo.' });
  }

  // Si es miembro, permite continuar al siguiente middleware/controlador
  next();
};