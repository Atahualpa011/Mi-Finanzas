const pool = require('../db');
const groupModel = require('../models/groupModel');
const suggestedModel = require('../models/suggestedTransactionModel');
const budgetModel = require('../models/budgetModel');

// --- Crear grupo ---
exports.createGroup = async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user?.userId || null;
  const username = req.user?.username || null;
  const email = req.user?.email || null;

  // Valida datos obligatorios
  if (!name || !userId || !username) {
    return res.status(400).json({ error: 'Faltan datos obligatorios para crear el grupo.' });
  }

  try {
    // Crea el grupo y agrega al creador como miembro
    const groupId = await groupModel.createGroup(name, description, userId);
    await groupModel.addMember(groupId, userId, username, email, userId);
    res.json({ groupId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo crear el grupo' });
  }
};

// --- Agregar miembro (real o representativo) ---
exports.addMember = async (req, res) => {
  const { userId, name, email } = req.body;
  const groupId = req.params.groupId;
  const addedBy = req.user.userId;

  // Valida que no exista ya ese usuario o nombre en el grupo
  const exists = await groupModel.memberExists(groupId, userId, name);
  if (exists) {
    return res.status(400).json({ error: 'El miembro ya está en el grupo.' });
  }

  // Agrega el miembro y lo retorna
  const memberId = await groupModel.addMember(groupId, userId, name, email, addedBy);
  const member = await groupModel.getMemberById(memberId);
  res.json({ member });
};

// --- Quitar miembro ---
exports.removeMember = async (req, res) => {
  const { groupId, memberId } = req.params;
  try {
    const ok = await groupModel.removeMember(groupId, memberId);
    res.json({ ok });
  } catch (err) {
    res.status(500).json({ error: 'No se pudo quitar el miembro.' });
  }
};

// --- Agregar gasto y repartir shares ---
exports.addExpense = async (req, res) => {
  const { paid_by_member_id, amount, description, date, time, shares } = req.body;
  const groupId = req.params.groupId;
  try {
    const expenseId = await groupModel.addExpense(
      groupId, paid_by_member_id, amount, description, date, time, shares
    );
    // Busca el miembro que pagó para obtener el user_id real
    const [memberRows] = await pool.execute(
      'SELECT user_id FROM group_members WHERE id = ?',
      [paid_by_member_id]
    );
    const payerUserId = memberRows.length ? memberRows[0].user_id : null;
    if (payerUserId) {
      await suggestedModel.createSuggestion({
        userId: payerUserId,
        groupId,
        type: 'expense',
        amount,
        description: description || `Gasto en grupo`,
        relatedUserId: null,
        groupExpenseId: expenseId
      });
    }
    
    // Verificar presupuestos grupales y crear alertas
    const [members] = await pool.execute(
      'SELECT user_id FROM group_members WHERE group_id = ? AND user_id IS NOT NULL',
      [groupId]
    );
    const memberUserIds = members.map(m => m.user_id);
    if (memberUserIds.length > 0) {
      await budgetModel.checkAndCreateGroupAlerts(groupId, memberUserIds);
    }
    
    res.json({ expenseId });
  } catch (err) {
    if (err.message.includes('shares')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'No se pudo agregar el gasto.' });
  }
};

// --- Listar gastos de un grupo ---
exports.listExpenses = async (req, res) => {
  const groupId = req.params.groupId;
  try {
    const expenses = await groupModel.listExpenses(groupId);
    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron obtener los gastos.' });
  }
};

// --- Listar miembros de un grupo ---
exports.listMembers = async (req, res) => {
  const groupId = req.params.groupId;
  const myUserId = req.user.userId;
  try {
    const result = await groupModel.listMembers(groupId, myUserId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron obtener los miembros.' });
  }
};

// --- Resumen de deudas por grupo ---
exports.groupSummary = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const summary = await groupModel.groupSummary(groupId);
    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo calcular el resumen.' });
  }
};

// --- Editar gasto ---
exports.editExpense = async (req, res) => {
  const { expenseId } = req.params;
  const { amount, description, date, time, shares } = req.body;
  try {
    await groupModel.editExpense(expenseId, amount, description, date, time, shares);
    res.json({ ok: true });
  } catch (err) {
    if (err.message.includes('shares')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'No se pudo editar el gasto.' });
  }
};

// --- Eliminar gasto ---
exports.deleteExpense = async (req, res) => {
  const { expenseId } = req.params;
  try {
    await groupModel.deleteExpense(expenseId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'No se pudo eliminar el gasto.' });
  }
};

// --- Agregar pago/liquidación entre miembros ---
exports.addSettlement = async (req, res) => {
  try {
    const { from_member_id, to_member_id, amount, date, time } = req.body;
    const groupId = req.params.groupId;
    if (!from_member_id || !to_member_id || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Datos de pago inválidos.' });
    }
    // Busca user_id de ambos miembros
    const [fromRows] = await pool.execute(
      'SELECT user_id FROM group_members WHERE id = ?',
      [from_member_id]
    );
    const [toRows] = await pool.execute(
      'SELECT user_id FROM group_members WHERE id = ?',
      [to_member_id]
    );
    const payerUserId = fromRows.length ? fromRows[0].user_id : null;
    const receiverUserId = toRows.length ? toRows[0].user_id : null;
    await groupModel.addSettlement(groupId, from_member_id, to_member_id, amount, date, time);
    if (receiverUserId && payerUserId) {
      // Sugerencia de ingreso para el que recibe el dinero
      await suggestedModel.createSuggestion({
        userId: receiverUserId,
        groupId,
        type: 'income',
        amount,
        description: `Recibiste $${amount} de un miembro del grupo`,
        relatedUserId: payerUserId,
        groupExpenseId: null
      });
      // Sugerencia de gasto para el que da el dinero
      await suggestedModel.createSuggestion({
        userId: payerUserId,
        groupId,
        type: 'expense',
        amount,
        description: `Pagaste $${amount} a un miembro del grupo`,
        relatedUserId: receiverUserId,
        groupExpenseId: null
      });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo registrar el pago.' });
  }
};

// Endpoint para sugerencias de pagos
exports.simplifyGroupDebts = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const settlementsWithNames = await groupModel.simplifyGroupDebts(groupId);
    res.json(settlementsWithNames);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo calcular las sugerencias de pago.' });
  }
};

// --- Obtener detalles de un grupo específico ---
exports.getGroupDetails = async (req, res) => {
  const { groupId } = req.params;
  try {
    const group = await groupModel.getGroupById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }
    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo obtener el grupo' });
  }
};

// --- Listar grupos donde el usuario es miembro ---
exports.listGroups = async (req, res) => {
  try {
    const userId = req.user.userId;
    const rows = await groupModel.listGroups(userId);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'No se pudieron obtener los grupos' });
  }
};

// --- Eliminar grupo ---
exports.deleteGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    await groupModel.deleteGroup(groupId);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo eliminar el grupo.' });
  }
};

// --- Listar pagos/liquidaciones de un grupo ---
exports.listSettlements = async (req, res) => {
  const groupId = req.params.groupId;
  try {
    const rows = await groupModel.listSettlements(groupId);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'No se pudieron obtener los pagos.' });
  }
};

// --- Invitar amigo a miembro representativo ---
exports.inviteFriendToMember = async (req, res) => {
  const { groupId, memberId } = req.params;
  const { friendUserId } = req.body;
  const invitedBy = req.user.userId;
  try {
    await groupModel.inviteFriendToMember(groupId, memberId, friendUserId, invitedBy);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// --- Aceptar invitación de grupo ---
exports.acceptGroupInvitation = async (req, res) => {
  const { invitationId } = req.params;
  const userId = req.user.userId;
  try {
    await groupModel.acceptGroupInvitation(invitationId, userId);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// --- Listar invitaciones de grupo pendientes ---
exports.listGroupInvitations = async (req, res) => {
  const userId = req.user.userId;
  try {
    const rows = await groupModel.listGroupInvitations(userId);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'No se pudieron obtener las invitaciones.' });
  }
};

// --- Dejar grupo (convertirse en miembro representativo) ---
exports.leaveGroup = async (req, res) => {
  const { groupId, memberId } = req.params;
  const userId = req.user.userId;
  try {
    await groupModel.leaveGroup(groupId, memberId, userId);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};