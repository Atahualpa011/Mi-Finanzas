import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GroupMembers from '../components/GroupMembers';
import GroupExpenses from '../components/GroupExpenses';
import GroupSummary from '../components/GroupSummary';
import GroupSettlements from '../components/GroupSettlements';
import GroupAddExpense from '../components/GroupAddExpense';
import GroupMovements from '../components/GroupMovements';

// --- Página de detalle de grupo ---
export default function GroupDetail() {
  // --- Hooks de navegación y parámetros ---
  const { groupId } = useParams();
  const navigate = useNavigate();

  // --- Estados principales ---
  const [refresh, setRefresh] = useState(0); // Para forzar recarga de datos
  const [createdBy, setCreatedBy] = useState(null); // ID del creador del grupo
  const [myUserId, setMyUserId] = useState(null);   // user_id del usuario actual
  const [members, setMembers] = useState([]);       // Miembros del grupo
  const [groupInfo, setGroupInfo] = useState(null); // Información del grupo (nombre, descripción, created_at)
  const [loading, setLoading] = useState(true);     // Estado de carga

  // --- Cargar miembros y datos del grupo al montar o refrescar ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Obtener información del grupo
    fetch(`/api/groups/${groupId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        setGroupInfo(data);
        setCreatedBy(data.created_by);
      })
      .catch(err => console.error('Error al cargar info del grupo:', err));
    
    // Obtener miembros del grupo
    fetch(`/api/groups/${groupId}/members`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        setMyUserId(data.my_user_id);
        setMembers(data.members);
        setLoading(false);
      });
  }, [groupId, refresh]);

  // --- Función para refrescar datos hijos (miembros, gastos, etc) ---
  const triggerRefresh = () => setRefresh(r => r + 1);

  // --- Eliminar grupo (solo creador) ---
  const handleDeleteGroup = async () => {
    if (!window.confirm('¿Eliminar este grupo? Esta acción es irreversible.')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/groups/${groupId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'No se pudo eliminar el grupo');
      return;
    }
    navigate('/groups');
  };

  // --- Salir del grupo (miembro) ---
  const handleLeaveGroup = async () => {
    if (!window.confirm('¿Seguro que quieres salir del grupo?')) return;
    const token = localStorage.getItem('token');
    const myMember = members.find(m => m.user_id == myUserId);
    if (!myMember) {
      alert('No se encontró tu miembro en el grupo.');
      return;
    }
    const res = await fetch(`/api/groups/${groupId}/members/${myMember.id}/leave`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'No se pudo salir del grupo');
      return;
    }
    navigate('/groups');
  };

  // --- Botón de acción (eliminar o salir) según rol ---
  let actionButton = null;
  if (!loading) {
    if (createdBy == myUserId) {
      actionButton = (
        <button className="btn btn-danger" style={{ position: 'absolute', top: 24, right: 32 }} onClick={handleDeleteGroup}>
          Eliminar grupo
        </button>
      );
    } else if (members.some(m => m.user_id == myUserId)) {
      actionButton = (
        <button className="btn btn-warning" style={{ position: 'absolute', top: 24, right: 32 }} onClick={handleLeaveGroup}>
          Salir del grupo
        </button>
      );
    }
  }

  // --- Render principal ---
  return (
    <div style={{ position: 'relative' }}>
      {actionButton}
      <button
        className="btn btn-secondary mb-3"
        onClick={() => navigate('/groups')}
      >
        ← Volver
      </button>
      
      {/* Información del grupo */}
      <div className="card mb-4">
        <div className="card-body">
          <h2 className="card-title">{groupInfo?.name || 'Cargando...'}</h2>
          {groupInfo?.description && (
            <p className="text-muted mb-2">{groupInfo.description}</p>
          )}
          {groupInfo?.created_at && (
            <p className="text-muted mb-0">
              <small>
                Creado el {new Date(groupInfo.created_at).toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </small>
            </p>
          )}
        </div>
      </div>
      <GroupMembers groupId={groupId} refresh={refresh} onChange={triggerRefresh} />
      <GroupAddExpense groupId={groupId} onExpenseAdded={triggerRefresh} />
      <GroupExpenses groupId={groupId} refresh={refresh} />
      <GroupSummary groupId={groupId} refresh={refresh} />
      <GroupSettlements groupId={groupId} refresh={refresh} />
      <GroupMovements groupId={groupId} refresh={refresh} />
    </div>
  );
}