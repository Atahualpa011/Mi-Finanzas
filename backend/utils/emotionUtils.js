// --- Utilidades compartidas para manejo de emociones ---

// Define los tipos de emociones (compartido entre análisis emocional e insights)
const EMOTION_TYPES = {
  positive: ['Felicidad', 'Alivio', 'Orgullo', 'Generosidad/Amor', 'Emocion/Entusiasmo'],
  negative: ['Culpa', 'Ansiedad/Estres', 'Arrepentimiento', 'Frustracion', 'Verguenza'],
  neutral: ['Indiferencia', 'Ambivalencia']
};

/**
 * Clasifica una emoción en su tipo correspondiente
 * @param {string} emotion - Nombre de la emoción
 * @returns {string} - 'positive', 'negative', 'neutral' o 'other'
 */
function getEmotionType(emotion) {
  if (EMOTION_TYPES.positive.includes(emotion)) return 'positive';
  if (EMOTION_TYPES.negative.includes(emotion)) return 'negative';
  if (EMOTION_TYPES.neutral.includes(emotion)) return 'neutral';
  return 'other';
}

/**
 * Obtiene todas las emociones disponibles
 * @returns {object} - Objeto con arrays de emociones por tipo
 */
function getAllEmotions() {
  return EMOTION_TYPES;
}

/**
 * Normaliza una emoción (trim y capitalización)
 * @param {string} emotion - Emoción raw
 * @returns {string} - Emoción normalizada
 */
function normalizeEmotion(emotion) {
  if (!emotion) return '';
  return emotion.trim();
}

/**
 * Separa emociones múltiples (formato: "Felicidad,Alivio")
 * @param {string} emotionString - String con emociones separadas por comas
 * @returns {array} - Array de emociones normalizadas
 */
function parseEmotions(emotionString) {
  if (!emotionString) return [];
  return emotionString.split(',').map(e => normalizeEmotion(e)).filter(e => e);
}

module.exports = {
  EMOTION_TYPES,
  getEmotionType,
  getAllEmotions,
  normalizeEmotion,
  parseEmotions
};
