const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');   // Middleware para verificar JWT
const groupMember = require('../middleware/groupMember');     // Middleware para verificar membresía en el grupo
const groupController = require('../controllers/groupController'); // Lógica de grupos
const budgetController = require('../controllers/budgetController'); // Lógica de presupuestos

// --- Crear un nuevo grupo ---
// POST /api/groups
router.post('/', authenticate, groupController.createGroup);
// - El frontend llama a este endpoint para crear un grupo nuevo.
// - El controlador valida y crea el grupo y su primer miembro (el usuario actual).

// --- Agregar miembro a un grupo ---
// POST /api/groups/:groupId/members
router.post('/:groupId/members', authenticate, groupController.addMember);
// - El frontend llama a este endpoint para agregar un miembro (real o representativo) a un grupo.

// --- Quitar miembro de un grupo ---
// DELETE /api/groups/:groupId/members/:memberId
router.delete('/:groupId/members/:memberId', authenticate, groupController.removeMember);
// - El frontend llama a este endpoint para eliminar un miembro del grupo.

// --- Agregar gasto al grupo ---
// POST /api/groups/:groupId/expenses
router.post('/:groupId/expenses', authenticate, groupMember, groupController.addExpense);
// - Solo miembros pueden agregar gastos al grupo.

// --- Listar miembros de un grupo ---
// GET /api/groups/:groupId/members
router.get('/:groupId/members', authenticate, groupMember, groupController.listMembers);
// - El frontend llama a este endpoint para mostrar la lista de miembros del grupo.

// --- Resumen de deudas/saldos del grupo ---
// GET /api/groups/:groupId/summary
router.get('/:groupId/summary', authenticate, groupMember, groupController.groupSummary);
// - El frontend llama a este endpoint para mostrar el resumen de deudas/saldos del grupo.

// --- Registrar un pago entre miembros ---
// POST /api/groups/:groupId/settlements
router.post('/:groupId/settlements', authenticate, groupMember, groupController.addSettlement);
// - El frontend llama a este endpoint para registrar un pago entre miembros.

// --- Sugerencias de pagos para simplificar deudas ---
// GET /api/groups/:groupId/simplify
router.get('/:groupId/simplify', authenticate, groupMember, groupController.simplifyGroupDebts);
// - El frontend llama a este endpoint para obtener sugerencias de pagos que simplifican las deudas del grupo.

// --- Listar invitaciones de grupo pendientes ---
// GET /api/groups/invitations
router.get('/invitations', authenticate, groupController.listGroupInvitations);
// - El frontend llama a este endpoint para mostrar las invitaciones de grupo pendientes para el usuario.

// --- Obtener detalles de un grupo específico ---
// GET /api/groups/:groupId
router.get('/:groupId', authenticate, groupMember, groupController.getGroupDetails);
// - El frontend llama a este endpoint para obtener nombre, descripción y fecha de creación del grupo.

// --- Listar todos los grupos del usuario ---
// GET /api/groups
router.get('/', authenticate, groupController.listGroups);
// - El frontend llama a este endpoint para mostrar la lista de grupos donde el usuario es miembro.

// --- Eliminar un grupo ---
// DELETE /api/groups/:groupId
router.delete('/:groupId', authenticate, groupController.deleteGroup);
// - El frontend llama a este endpoint para eliminar un grupo (solo el creador puede hacerlo).

// --- Listar gastos del grupo ---
// GET /api/groups/:groupId/expenses
router.get('/:groupId/expenses', authenticate, groupMember, groupController.listExpenses);
// - El frontend llama a este endpoint para mostrar los gastos del grupo.

// --- Listar pagos del grupo ---
// GET /api/groups/:groupId/settlements
router.get('/:groupId/settlements', authenticate, groupMember, groupController.listSettlements);
// - El frontend llama a este endpoint para mostrar los pagos registrados en el grupo.

// --- Invitar amigo a ocupar un lugar de miembro representativo ---
// POST /api/groups/:groupId/members/:memberId/invite
router.post('/:groupId/members/:memberId/invite', authenticate, groupMember, groupController.inviteFriendToMember);
// - El frontend llama a este endpoint para invitar a un amigo a ocupar un lugar de miembro representativo.

// --- Aceptar invitación de grupo ---
// POST /api/groups/invitations/:invitationId/accept
router.post('/invitations/:invitationId/accept', authenticate, groupController.acceptGroupInvitation);
// - El frontend llama a este endpoint para aceptar una invitación de grupo.

// --- Dejar grupo (convertirse en miembro representativo) ---
// POST /api/groups/:groupId/members/:memberId/leave
router.post('/:groupId/members/:memberId/leave', authenticate, groupController.leaveGroup);
// - El frontend llama a este endpoint para que el usuario deje el grupo (su miembro queda como representativo).

// --- PRESUPUESTOS GRUPALES ---
// GET /api/groups/:groupId/budgets - Listar presupuestos del grupo
router.get('/:groupId/budgets', authenticate, groupMember, budgetController.getGroupBudgets);

// POST /api/groups/:groupId/budgets - Crear presupuesto grupal
router.post('/:groupId/budgets', authenticate, groupMember, budgetController.createGroupBudget);

// GET /api/groups/:groupId/budgets/:id - Obtener presupuesto específico
router.get('/:groupId/budgets/:id', authenticate, groupMember, budgetController.getGroupBudget);

// PUT /api/groups/:groupId/budgets/:id - Actualizar presupuesto grupal
router.put('/:groupId/budgets/:id', authenticate, groupMember, budgetController.updateGroupBudget);

// DELETE /api/groups/:groupId/budgets/:id - Eliminar presupuesto grupal
router.delete('/:groupId/budgets/:id', authenticate, groupMember, budgetController.deleteGroupBudget);

module.exports = router; // Exporta el router para ser usado en server.js