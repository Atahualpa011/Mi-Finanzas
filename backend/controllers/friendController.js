const friendModel = require('../models/friendModel'); // Importa el modelo de amigos
const gamificationModel = require('../models/gamificationModel');

// --- Listar amigos confirmados ---
exports.list = async (req, res) => {
  try {
    // Llama al modelo para obtener la lista de amigos del usuario autenticado
    const friends = await friendModel.getFriends(req.user.userId);
    res.json(friends); // Devuelve la lista al frontend
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener amigos' }); // Error de servidor
  }
};

// --- Agregar amigo (enviar solicitud o aceptar si ya existe) ---
exports.add = async (req, res) => {
  const { friendId } = req.body; // ID del amigo a agregar (enviado por el frontend)
  try {
    // Llama al modelo para agregar la relación de amistad
    await friendModel.addFriend(req.user.userId, friendId);
    res.json({ message: 'Amigo agregado' }); // Responde al frontend
  } catch (err) {
    res.status(400).json({ error: err.message }); // Error de validación o lógica
  }
};

// --- Listar solicitudes de amistad pendientes recibidas ---
exports.pending = async (req, res) => {
  try {
    // Llama al modelo para obtener solicitudes pendientes para el usuario autenticado
    const requests = await friendModel.getPendingRequests(req.user.userId);
    res.json(requests); // Devuelve la lista al frontend
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener solicitudes' }); // Error de servidor
  }
};

// --- Responder a una solicitud de amistad (aceptar o rechazar) ---
exports.respond = async (req, res) => {
  const { requesterId, status } = req.body; // status: 'accepted' o 'rejected'
  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Estado inválido' }); // Valida el estado recibido
  }
  try {
    // Llama al modelo para actualizar el estado de la solicitud
    await friendModel.updateRequest(req.user.userId, requesterId, status);
    
    // Gamificación: si aceptó la solicitud, verificar logros y dar XP
    if (status === 'accepted') {
      try {
        await gamificationModel.checkSocialAchievements(req.user.userId);
        await gamificationModel.addExperience(req.user.userId, 10);
      } catch (gamError) {
        console.error('Error en gamificación (no crítico):', gamError);
      }
    }
    
    res.json({ message: `Solicitud ${status === 'accepted' ? 'aceptada' : 'rechazada'}` }); // Responde al frontend
  } catch (err) {
    res.status(500).json({ error: 'Error al responder solicitud' }); // Error de servidor
  }
};

// --- Elimina un amigo de la lista ---
exports.delete = async (req, res) => {
  const userId = req.user.userId;
  const friendId = req.params.friendId;
  try {
    await friendModel.deleteFriendship(userId, friendId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'No se pudo eliminar el amigo.' });
  }
};

// --- Bloquear a un amigo ---
exports.blockFriend = async (req, res) => {
  try {
    const userId = req.user.userId;
    const friendId = parseInt(req.params.id);
    
    await friendModel.blockFriend(userId, friendId);
    res.json({ message: 'Amigo bloqueado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al bloquear amigo' });
  }
};

// --- Desbloquear a un amigo ---
exports.unblockFriend = async (req, res) => {
  try {
    const userId = req.user.userId;
    const friendId = parseInt(req.params.id);
    
    await friendModel.unblockFriend(userId, friendId);
    res.json({ message: 'Amigo desbloqueado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al desbloquear amigo' });
  }
};

// --- Obtener estadísticas de un amigo ---
exports.getFriendStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const friendId = parseInt(req.params.id);
    
    const stats = await friendModel.getFriendStats(userId, friendId);
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};