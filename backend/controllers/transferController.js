const { getFriendshipDebt } = require('../models/friendModel'); // Función para obtener la deuda entre dos usuarios
const transferModel = require('../models/transferModel');       // Modelo para operaciones de transferencias
const gamificationModel = require('../models/gamificationModel');

// --- Crear una transferencia para saldar deuda con un amigo ---
exports.create = async (req, res) => {
  const fromUserId = req.user.userId;      // Usuario autenticado (quien paga)
  const toUserId = req.body.toUserId;      // Usuario destino (a quien se le paga)
  const debt = await getFriendshipDebt(fromUserId, toUserId); // Calcula la deuda actual

  // Solo permite transferir si realmente hay deuda pendiente
  if (debt >= 0) {
    return res.status(400).json({ error: 'No tienes deuda con este usuario.' });
  }

  const amount = Math.abs(debt); // Solo permite saldar exactamente lo que se debe

  try {
    // Registra la transferencia y actualiza saldos
    await transferModel.createTransfer(fromUserId, toUserId, amount, req.body.description || 'Saldar deuda');
    
    // Gamificación: verificar logros de transferencias
    try {
      await gamificationModel.checkSocialAchievements(fromUserId);
      await gamificationModel.addExperience(fromUserId, 5);
    } catch (gamError) {
      console.error('Error en gamificación (no crítico):', gamError);
    }
    
    res.json({ message: 'Deuda saldada' }); // Responde al frontend
  } catch (err) {
    res.status(500).json({ error: err.message }); // Error de servidor
  }
};

// --- Listar transferencias realizadas o recibidas por el usuario ---
exports.list = async (req, res) => {
  try {
    const transfers = await transferModel.getTransfers(req.user.userId); // Trae transferencias del usuario
    res.json(transfers); // Devuelve el array al frontend
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener transferencias' }); // Error de servidor
  }
};