const pool = require('../db'); // Conexión a la base de datos

// --- Crea un grupo y devuelve el id insertado ---
async function createGroup(name, description, createdBy) {
  // Inserta el grupo en la tabla y retorna el id generado
  const [result] = await pool.execute(
    'INSERT INTO groups_ (name, description, created_by) VALUES (?, ?, ?)',
    [name, description || null, createdBy]
  );
  return result.insertId;
}

// --- Verifica si ya existe el miembro en el grupo ---
async function memberExists(groupId, userId, name) {
  // Busca por userId o por nombre (para miembros representativos)
  let query = userId
    ? `SELECT id FROM group_members WHERE group_id = ? AND user_id = ?`
    : `SELECT id FROM group_members WHERE group_id = ? AND name = ?`;
  let params = userId ? [groupId, userId] : [groupId, name];
  const [existing] = await pool.execute(query, params);
  return existing.length > 0;
}

// --- Agrega un miembro al grupo ---
async function addMember(groupId, userId, name, email, addedBy) {
  // Inserta el miembro (real o representativo) en la tabla
  const [result] = await pool.execute(
    `INSERT INTO group_members (group_id, user_id, name, email, added_by) VALUES (?, ?, ?, ?, ?)`,
    [groupId, userId || null, name || null, email || null, addedBy]
  );
  return result.insertId;
}

// --- Obtiene un miembro por id ---
async function getMemberById(memberId) {
  const [rows] = await pool.execute(
    `SELECT * FROM group_members WHERE id = ?`,
    [memberId]
  );
  return rows[0];
}

// --- Elimina un miembro del grupo ---
async function removeMember(groupId, memberId) {
  const [result] = await pool.execute(
    `DELETE FROM group_members WHERE id = ? AND group_id = ?`,
    [memberId, groupId]
  );
  return result.affectedRows > 0;
}

// --- Agrega un gasto al grupo y reparte los shares ---
async function addExpense(groupId, paid_by_member_id, amount, description, date, time, shares) {
  // 1. Inserta el gasto principal
  const [result] = await pool.execute(
    `INSERT INTO group_expenses (group_id, paid_by_member_id, amount, description, date, time)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [groupId, paid_by_member_id, amount, description, date, time]
  );
  const expenseId = result.insertId;

  // 2. Inserta los shares (cuánto debe cada miembro)
  for (const share of shares) {
    await pool.execute(
      `INSERT INTO group_expense_shares (expense_id, member_id, share) VALUES (?, ?, ?)`,
      [expenseId, share.member_id, share.share]
    );
  }

  // 3. Valida que la suma de los shares sea igual al monto
  const totalShares = shares.reduce((sum, s) => sum + Number(s.share), 0);
  if (Math.abs(totalShares - amount) > 0.01) {
    throw new Error('La suma de los shares debe ser igual al monto del gasto.');
  }

  return expenseId;
}

// --- Lista los gastos de un grupo ---
async function listExpenses(groupId) {
  const [expenses] = await pool.execute(
    `SELECT e.id, e.amount, e.description, e.date, e.time, e.paid_by_member_id, 
            gm.name AS pagado_por
       FROM group_expenses e
       LEFT JOIN group_members gm ON gm.id = e.paid_by_member_id
      WHERE e.group_id = ?
      ORDER BY e.date DESC, e.time DESC`,
    [groupId]
  );
  return expenses;
}

// --- Lista los miembros de un grupo y devuelve también el creador y el usuario actual ---
async function listMembers(groupId, myUserId) {
  // Trae los miembros y el creador del grupo
  const [members] = await pool.execute(
    `SELECT gm.*, ud.username
     FROM group_members gm
     LEFT JOIN users_data ud ON gm.user_id = ud.user_id
     WHERE gm.group_id = ?`,
    [groupId]
  );
  const [groupRows] = await pool.execute(
    `SELECT created_by FROM groups_ WHERE id = ?`,
    [groupId]
  );
  const createdBy = groupRows.length ? groupRows[0].created_by : null;

  return {
    members,
    created_by: createdBy,
    my_user_id: myUserId
  };
}

// --- Calcula el resumen de deudas/saldos de un grupo ---
async function groupSummary(groupId) {
  // 1. Trae miembros
  const [members] = await pool.execute(
    `SELECT gm.id, gm.name, gm.user_id, ud.username
     FROM group_members gm
     LEFT JOIN users_data ud ON gm.user_id = ud.user_id
     WHERE gm.group_id = ?`,
    [groupId]
  );
  const summary = {};
  for (const m of members) {
    if (!m.id) continue;
    summary[m.id] = {
      id: m.id,
      name: m.username || m.name || m.user_id,
      user_id: m.user_id,
      pagado: 0,
      debe: 0
    };
  }

  // 2. Lo que pagó cada uno
  const [pagos] = await pool.execute(
    `SELECT paid_by_member_id, SUM(amount) as pagado FROM group_expenses WHERE group_id = ? GROUP BY paid_by_member_id`,
    [groupId]
  );
  for (const p of pagos) {
    if (summary[p.paid_by_member_id]) summary[p.paid_by_member_id].pagado = Number(p.pagado);
  }

  // 3. Lo que debe cada uno
  const [deudas] = await pool.execute(
    `SELECT member_id, SUM(share) as debe FROM group_expense_shares WHERE expense_id IN (SELECT id FROM group_expenses WHERE group_id = ?) GROUP BY member_id`,
    [groupId]
  );
  for (const d of deudas) {
    if (summary[d.member_id]) summary[d.member_id].debe = Number(d.debe);
  }

  // 4. Calcula saldo neto
  for (const id in summary) {
    summary[id].saldo = Number((summary[id].pagado - summary[id].debe).toFixed(2));
  }

  // 5. Descontar settlements (pagos entre miembros)
  const [settlements] = await pool.execute(
    `SELECT from_member_id, to_member_id, SUM(amount) as total FROM group_settlements WHERE group_id = ? GROUP BY from_member_id, to_member_id`,
    [groupId]
  );
  for (const s of settlements) {
    if (summary[s.from_member_id]) summary[s.from_member_id].saldo = Number((summary[s.from_member_id].saldo + Number(s.total)).toFixed(2));
    if (summary[s.to_member_id]) summary[s.to_member_id].saldo = Number((summary[s.to_member_id].saldo - Number(s.total)).toFixed(2));
  }

  return Object.values(summary);
}

// --- Edita un gasto y sus shares ---
async function editExpense(expenseId, amount, description, date, time, shares) {
  // Actualiza el gasto y reemplaza los shares
  await pool.execute(
    `UPDATE group_expenses SET amount=?, description=?, date=?, time=? WHERE id=?`,
    [amount, description, date, time, expenseId]
  );
  await pool.execute(`DELETE FROM group_expense_shares WHERE expense_id=?`, [expenseId]);
  for (const share of shares) {
    await pool.execute(
      `INSERT INTO group_expense_shares (expense_id, member_id, share) VALUES (?, ?, ?)`,
      [expenseId, share.member_id, share.share]
    );
  }
  // Valida que la suma de los shares sea igual al monto
  const totalShares = shares.reduce((sum, s) => sum + Number(s.share), 0);
  if (Math.abs(totalShares - amount) > 0.01) {
    throw new Error('La suma de los shares debe ser igual al monto del gasto.');
  }
  return true;
}

// --- Elimina un gasto y sus shares ---
async function deleteExpense(expenseId) {
  await pool.execute(`DELETE FROM group_expense_shares WHERE expense_id=?`, [expenseId]);
  await pool.execute(`DELETE FROM group_expenses WHERE id=?`, [expenseId]);
  return true;
}

// --- Agrega un pago/liquidación entre miembros del grupo ---
async function addSettlement(groupId, from_member_id, to_member_id, amount, date, time) {
  const [result] = await pool.execute(
    `INSERT INTO group_settlements (group_id, from_member_id, to_member_id, amount, date, time)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [groupId, from_member_id, to_member_id, amount, date, time]
  );
  return result.insertId;
}

// --- Simplifica las deudas del grupo y sugiere pagos ---
async function simplifyGroupDebts(groupId) {
  // 1. Trae miembros y calcula saldos igual que groupSummary
  const [members] = await pool.execute(
    `SELECT gm.id, gm.name, gm.user_id, ud.username
     FROM group_members gm
     LEFT JOIN users_data ud ON gm.user_id = ud.user_id
     WHERE gm.group_id = ?`,
    [groupId]
  );
  const summary = {};
  for (const m of members) {
    if (!m.id) continue;
    summary[m.id] = {
      id: m.id,
      name: m.username || m.name || m.user_id,
      user_id: m.user_id,
      pagado: 0,
      debe: 0
    };
  }
  const [pagos] = await pool.execute(
    `SELECT paid_by_member_id, SUM(amount) as pagado FROM group_expenses WHERE group_id = ? GROUP BY paid_by_member_id`,
    [groupId]
  );
  for (const p of pagos) {
    if (summary[p.paid_by_member_id]) summary[p.paid_by_member_id].pagado = Number(p.pagado);
  }
  const [deudas] = await pool.execute(
    `SELECT member_id, SUM(share) as debe FROM group_expense_shares WHERE expense_id IN (SELECT id FROM group_expenses WHERE group_id = ?) GROUP BY member_id`,
    [groupId]
  );
  for (const d of deudas) {
    if (summary[d.member_id]) summary[d.member_id].debe = Number(d.debe);
  }
  for (const id in summary) {
    summary[id].saldo = summary[id].pagado - summary[id].debe;
  }
  const [settlementsDb] = await pool.execute(
    `SELECT from_member_id, to_member_id, SUM(amount) as total FROM group_settlements WHERE group_id = ? GROUP BY from_member_id, to_member_id`,
    [groupId]
  );
  for (const s of settlementsDb) {
    if (summary[s.from_member_id]) summary[s.from_member_id].saldo += Number(s.total);
    if (summary[s.to_member_id]) summary[s.to_member_id].saldo -= Number(s.total);
  }
  // 2. Simplifica deudas
  // Este algoritmo empareja deudas, realizando pagos entre ellos por el monto máximo posible en cada paso,
  // minimizando así la cantidad de transacciones necesarias para saldar todas las deudas del grupo.
  function simplifyDebts(saldos) {
    const debtors = saldos.filter(s => s.saldo < -0.01).map(s => ({ ...s }));
    const creditors = saldos.filter(s => s.saldo > 0.01).map(s => ({ ...s }));
    const settlements = [];
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(-debtor.saldo, creditor.saldo);
      if (amount > 0.01) {
        settlements.push({
          from: debtor.id,
          to: creditor.id,
          amount
        });
        debtor.saldo += amount;
        creditor.saldo -= amount;
      }
      if (Math.abs(debtor.saldo) < 0.01) i++;
      if (creditor.saldo < 0.01) j++;
    }
    return settlements;
  }
  const saldos = Object.values(summary);
  const settlements = simplifyDebts(saldos);
  // 3. Devuelve sugerencias de pagos con nombres
  const settlementsWithNames = settlements.map((s, i) => ({
    id: `${s.from}-${s.to}-${i}`,
    from: s.from,
    to: s.to,
    amount: s.amount,
    from_name: saldos.find(m => m.id === s.from)?.name,
    to_name: saldos.find(m => m.id === s.to)?.name
  }));
  return settlementsWithNames;
}

// --- Lista los grupos donde el usuario es miembro ---
async function listGroups(userId) {
  const [rows] = await pool.execute(
    `SELECT g.id, g.name, g.description, g.created_at
       FROM groups_ g
       JOIN group_members gm ON gm.group_id = g.id
      WHERE gm.user_id = ?`,
    [userId]
  );
  return rows;
}

// --- Elimina un grupo y todas sus dependencias (en orden para evitar errores de FK) ---
async function deleteGroup(groupId) {
  await pool.execute(`DELETE FROM group_settlements WHERE group_id = ?`, [groupId]);
  await pool.execute(
    `DELETE FROM group_expense_shares WHERE expense_id IN (SELECT id FROM group_expenses WHERE group_id = ?)`,
    [groupId]
  );
  await pool.execute(`DELETE FROM group_expenses WHERE group_id = ?`, [groupId]);
  await pool.execute(`DELETE FROM group_members WHERE group_id = ?`, [groupId]);
  await pool.execute(`DELETE FROM groups_ WHERE id = ?`, [groupId]);
  return true;
}

// --- Lista los pagos/liquidaciones entre miembros de un grupo ---
async function listSettlements(groupId) {
  const [rows] = await pool.execute(
    `SELECT s.id, s.from_member_id, s.to_member_id, s.amount, s.date, s.time,
            gm_from.name as from_name, gm_to.name as to_name
       FROM group_settlements s
       LEFT JOIN group_members gm_from ON gm_from.id = s.from_member_id
       LEFT JOIN group_members gm_to ON gm_to.id = s.to_member_id
      WHERE s.group_id = ?
      ORDER BY s.date DESC, s.time DESC`,
    [groupId]
  );
  return rows;
}

// --- Invitar a un amigo a un miembro representativo ---
async function inviteFriendToMember(groupId, memberId, friendUserId, invitedBy) {
  // Verifica que el miembro no tenga user_id y que no exista invitación pendiente
  const [rows] = await pool.execute(
    'SELECT user_id FROM group_members WHERE id = ? AND group_id = ?', [memberId, groupId]
  );
  if (!rows.length || rows[0].user_id) {
    throw new Error('Solo puedes invitar a miembros sin usuario.');
  }
  const [existing] = await pool.execute(
    'SELECT id FROM group_invitations WHERE member_id = ? AND invited_user_id = ? AND status = "pending"',
    [memberId, friendUserId]
  );
  if (existing.length) {
    throw new Error('Ya existe una invitación pendiente para este amigo.');
  }
  // Crea la invitación
  await pool.execute(
    `INSERT INTO group_invitations (group_id, member_id, invited_user_id, invited_by_user_id)
     VALUES (?, ?, ?, ?)`,
    [groupId, memberId, friendUserId, invitedBy]
  );
  return true;
}

// --- Aceptar invitación de grupo ---
async function acceptGroupInvitation(invitationId, userId) {
  // Busca la invitación y verifica que sea para este usuario
  const [rows] = await pool.execute(
    'SELECT * FROM group_invitations WHERE id = ? AND invited_user_id = ? AND status = "pending"',
    [invitationId, userId]
  );
  if (!rows.length) throw new Error('Invitación no encontrada.');
  const { group_id, member_id } = rows[0];
  // Verifica que el miembro aún no tenga user_id
  const [memberRows] = await pool.execute(
    'SELECT user_id FROM group_members WHERE id = ? AND group_id = ?', [member_id, group_id]
  );
  if (!memberRows.length || memberRows[0].user_id) {
    throw new Error('El miembro ya fue asignado a un usuario.');
  }
  // Actualiza el miembro para asignar el user_id
  await pool.execute(
    'UPDATE group_members SET user_id = ? WHERE id = ? AND group_id = ?',
    [userId, member_id, group_id]
  );
  // Marca la invitación como aceptada
  await pool.execute(
    'UPDATE group_invitations SET status = "accepted" WHERE id = ?',
    [invitationId]
  );
  return true;
}

// --- Listar invitaciones de grupo pendientes para el usuario ---
async function listGroupInvitations(userId) {
  const [rows] = await pool.execute(
    `SELECT gi.*, gm.name as member_name, g.name as group_name
       FROM group_invitations gi
       JOIN group_members gm ON gm.id = gi.member_id
       JOIN groups_ g ON g.id = gi.group_id
      WHERE gi.invited_user_id = ? AND gi.status = 'pending'
      ORDER BY gi.created_at DESC`,
    [userId]
  );
  return rows;
}

// --- Dejar un grupo (convertirse en miembro representativo) ---
async function leaveGroup(groupId, memberId, userId) {
  // Verifica que el miembro corresponde al usuario
  const [rows] = await pool.execute(
    'SELECT * FROM group_members WHERE id = ? AND group_id = ? AND user_id = ?',
    [memberId, groupId, userId]
  );
  if (!rows.length) throw new Error('Miembro no encontrado.');
  // Dejar un miembro representativo (quita user_id, deja el nombre)
  await pool.execute(
    'UPDATE group_members SET user_id = NULL, name = "Miembro" WHERE id = ? AND group_id = ?',
    [memberId, groupId]
  );
  return true;
}

module.exports = {
  createGroup,
  memberExists,
  addMember,
  getMemberById,
  removeMember,
  addExpense,
  listExpenses,
  listMembers,
  groupSummary,
  editExpense,
  deleteExpense,
  addSettlement,
  simplifyGroupDebts,
  listGroups,
  deleteGroup,
  listSettlements,
  inviteFriendToMember,
  acceptGroupInvitation,
  listGroupInvitations,
  leaveGroup,
};