const pool = require('../db'); // Importa la conexión a la base de datos

// --- Endpoint principal: análisis emocional de gastos ---
exports.emotionalAnalysis = async (req, res) => {
  const userId = req.user.userId; // Obtiene el ID del usuario autenticado desde el token JWT

  // --- Consulta SQL: obtiene gastos con emociones asociadas ---
  const [rows] = await pool.execute(
    `SELECT t.id, t.amount, t.description, e.emotion
     FROM transactions t
     JOIN expenses e ON e.transaction_id = t.id
     WHERE t.user_id = ? AND t.type = 'expense' AND e.emotion IS NOT NULL AND e.emotion != ''`,
    [userId]
  );

  // --- Inicializa estructuras para agrupar y separar emociones ---
  const emotionStats = {}; // { emoción: { count, total } }
  const separated = { positive: [], negative: [], neutral: [], other: [] };

  // --- Define los tipos de emociones ---
  const EMOTION_TYPES = {
    positive: ['Felicidad', 'Alivio', 'Orgullo', 'Generosidad/Amor', 'Emocion/Entusiasmo'],
    negative: ['Culpa', 'Ansiedad/Estres', 'Arrepentimiento', 'Frustracion', 'Verguenza'],
    neutral: ['Indiferencia', 'Ambivalencia']
  };

  // --- Función auxiliar para clasificar emociones ---
  function getEmotionType(emotion) {
    if (EMOTION_TYPES.positive.includes(emotion)) return 'positive';
    if (EMOTION_TYPES.negative.includes(emotion)) return 'negative';
    if (EMOTION_TYPES.neutral.includes(emotion)) return 'neutral';
    return 'other';
  }

  // --- Procesa cada gasto y lo agrupa por emoción ---
  for (const tx of rows) {
    // Si emotion es array, recorre; si es string, lo convierte a array
    const emotions = Array.isArray(tx.emotion) ? tx.emotion : tx.emotion.split(',');
    for (const em of emotions) {
      const emotion = em.trim();
      if (!emotion) continue;
      // Inicializa el contador si es la primera vez que aparece la emoción
      if (!emotionStats[emotion]) emotionStats[emotion] = { count: 0, total: 0 };
      emotionStats[emotion].count += 1;
      emotionStats[emotion].total += Number(tx.amount);

      // Clasifica el gasto según el tipo de emoción
      const type = getEmotionType(emotion);
      separated[type].push({ ...tx, emotion });
    }
  }

  // --- Devuelve el resultado al frontend ---
  res.json({
    emotionStats, // { emoción: { count, total } }
    separated     // { positive: [...], negative: [...], neutral: [...], other: [...] }
  });
};