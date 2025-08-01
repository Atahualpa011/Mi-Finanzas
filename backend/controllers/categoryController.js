const categoryModel = require('../models/categoryModel'); // Importa el modelo de categorías

// --- Endpoint para obtener todas las categorías ---
exports.getAll = async (req, res) => {
  try {
    // Llama al modelo para traer todas las categorías desde la base de datos
    const rows = await categoryModel.getAll();
    // Devuelve el array de categorías al frontend en formato JSON
    return res.json(rows);
  } catch (err) {
    // Si ocurre un error, lo muestra en consola y responde con error 500
    console.error('ERROR in GET /api/categories:', err);
    return res.status(500).json({ error: 'Error al cargar categorías' });
  }
};