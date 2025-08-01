const suggestedModel = require('../models/suggestedTransactionModel');
const transactionModel = require('../models/transactionModel'); 

// --- Devuelve sugerencias pendientes para el usuario ---
exports.listPending = async (req, res) => {
  const userId = req.user.userId;
  const suggestions = await suggestedModel.getPendingSuggestions(userId);
  res.json({ suggestions });
};

// --- Acepta una sugerencia y la convierte en movimiento personal ---
exports.accept = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  // Busca la sugerencia específica por id y usuario
  const [suggestion] = await suggestedModel.getPendingSuggestions(userId);
  if (!suggestion || suggestion.id != id) return res.status(404).json({ error: 'Sugerencia no encontrada' });

  // Crea el movimiento personal SOLO si el usuario acepta
  const now = new Date();
  const date = now.toISOString().slice(0, 10); // yyyy-mm-dd
  const time = now.toTimeString().slice(0, 8); // HH:MM:SS

  await transactionModel.createTransaction({
    userId,
    type: suggestion.type,
    amount: suggestion.amount,
    date,
    time,
    categoryId: 23, 
    description: suggestion.description
  });

  // Marca la sugerencia como aceptada
  await suggestedModel.updateSuggestionStatus(id, 'accepted');
  res.json({ ok: true });
};

// --- Rechaza una sugerencia ---
exports.reject = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  await suggestedModel.updateSuggestionStatus(id, 'rejected');
  res.json({ ok: true });
};