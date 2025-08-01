const pool = require('../db'); // Importa la conexión a la base de datos

// --- Obtiene todas las categorías de la base de datos ---
async function getAll() {
  // Ejecuta una consulta SQL para traer todas las categorías ordenadas por nombre
  const [rows] = await pool.execute(
    `SELECT id, name, type, color
     FROM categories
     ORDER BY name`
  );
  return rows; // Devuelve el array de categorías al controlador
}

module.exports = { getAll }; // Exporta la función para usarla en el controlador