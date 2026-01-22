import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GroupMembers from '../components/GroupMembers';
import GroupExpenses from '../components/GroupExpenses';
import GroupSummary from '../components/GroupSummary';
import GroupSettlements from '../components/GroupSettlements';
import GroupAddExpense from '../components/GroupAddExpense';
import GroupMovements from '../components/GroupMovements';
import GroupBudgets from '../components/GroupBudgets';

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
  const [groupStats, setGroupStats] = useState(null); // Estadísticas del grupo
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

    // Obtener estadísticas del grupo (gastos, pagos, resumen)
    Promise.all([
      fetch(`/api/groups/${groupId}/expenses`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`/api/groups/${groupId}/settlements`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`/api/groups/${groupId}/summary`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
    ])
      .then(([expenses, settlements, summary]) => {
        // Calcular estadísticas
        const totalGastos = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
        const totalPagos = settlements.reduce((sum, s) => sum + Number(s.amount), 0);
        const totalMovimientos = expenses.length + settlements.length;
        
        // Miembro que más ha gastado
        const gastosPorMiembro = {};
        expenses.forEach(e => {
          const miembro = e.pagado_por || 'Desconocido';
          gastosPorMiembro[miembro] = (gastosPorMiembro[miembro] || 0) + Number(e.amount);
        });
        const miembroMayorGasto = Object.entries(gastosPorMiembro).sort((a, b) => b[1] - a[1])[0];
        
        // Miembro con mayor saldo (a favor o en contra)
        const miembroMayorSaldo = summary.reduce((max, m) => 
          Math.abs(m.saldo) > Math.abs(max?.saldo || 0) ? m : max
        , {});

        setGroupStats({
          totalGastos,
          totalPagos,
          totalMovimientos,
          cantidadGastos: expenses.length,
          cantidadPagos: settlements.length,
          miembroMayorGasto: miembroMayorGasto ? { nombre: miembroMayorGasto[0], monto: miembroMayorGasto[1] } : null,
          miembroMayorSaldo: miembroMayorSaldo.name ? miembroMayorSaldo : null
        });
      })
      .catch(err => console.error('Error al cargar estadísticas:', err));
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

  // --- Loading state ---
  if (loading) {
    return (
      <div className="text-center" style={{ padding: 'var(--spacing-2xl)' }}>
        <div 
          className="spinner-border" 
          style={{ 
            width: '3rem', 
            height: '3rem',
            color: 'var(--primary)'
          }} 
          role="status"
        >
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p style={{ marginTop: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>
          Cargando grupo...
        </p>
      </div>
    );
  }

  // --- Render principal ---
  return (
    <div className="container-fluid" style={{ padding: 'var(--spacing-lg)' }}>
      {/* Header con botón volver y acción */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 'var(--spacing-xl)'
        }}
      >
        <button
          className="btn"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-xs) var(--spacing-md)',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
          onClick={() => navigate('/groups')}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'var(--bg-secondary)';
            e.target.style.borderColor = 'var(--primary)';
            e.target.style.color = 'var(--primary)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.borderColor = 'var(--border-light)';
            e.target.style.color = 'var(--text-secondary)';
          }}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Volver a Grupos
        </button>

        {/* Botón de acción (eliminar o salir) */}
        {createdBy == myUserId ? (
          <button
            className="btn"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--danger)',
              border: '1px solid var(--danger)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--spacing-xs) var(--spacing-lg)',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            onClick={handleDeleteGroup}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--danger)';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = 'var(--danger)';
            }}
          >
            <i className="bi bi-trash me-2"></i>
            Eliminar Grupo
          </button>
        ) : members.some(m => m.user_id == myUserId) ? (
          <button
            className="btn"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--warning)',
              border: '1px solid var(--warning)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--spacing-xs) var(--spacing-lg)',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            onClick={handleLeaveGroup}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--warning)';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = 'var(--warning)';
            }}
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            Salir del Grupo
          </button>
        ) : null}
      </div>
      
      {/* Información del grupo */}
      <div 
        className="card"
        style={{
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          marginBottom: 'var(--spacing-xl)'
        }}
      >
        <div className="card-body" style={{ padding: 'var(--spacing-xl)' }}>
          {/* Título y descripción */}
          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <h2 
              style={{ 
                fontWeight: '700', 
                color: 'var(--text-primary)',
                marginBottom: 'var(--spacing-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)'
              }}
            >
              <i className="bi bi-people-fill" style={{ color: 'var(--primary)' }}></i>
              {groupInfo?.name || 'Cargando...'}
            </h2>
            {groupInfo?.description && (
              <p 
                style={{ 
                  color: 'var(--text-secondary)', 
                  marginBottom: 'var(--spacing-xs)',
                  fontSize: '1rem'
                }}
              >
                {groupInfo.description}
              </p>
            )}
            {groupInfo?.created_at && (
              <p 
                style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.875rem',
                  marginBottom: 0
                }}
              >
                <i className="bi bi-calendar3 me-2"></i>
                Creado el {new Date(groupInfo.created_at).toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
          </div>

          {/* Estadísticas del grupo */}
          {groupStats && (
            <>
              <div 
                style={{
                  borderTop: '1px solid var(--border-light)',
                  paddingTop: 'var(--spacing-lg)',
                  marginBottom: 'var(--spacing-lg)'
                }}
              >
                <h5 
                  style={{ 
                    fontWeight: '600', 
                    color: 'var(--text-primary)',
                    marginBottom: 'var(--spacing-lg)',
                    fontSize: '1.1rem'
                  }}
                >
                  <i className="bi bi-graph-up me-2" style={{ color: 'var(--primary)' }}></i>
                  Estadísticas del Grupo
                </h5>
                
                <div className="row g-3">
                  <div className="col-md-3 col-6">
                    <div 
                      style={{
                        textAlign: 'center',
                        padding: 'var(--spacing-lg)',
                        backgroundColor: 'var(--primary-light)',
                        border: '1px solid var(--primary)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase', fontWeight: '600', marginBottom: 'var(--spacing-xs)' }}>
                        <i className="bi bi-list-ul me-1"></i>
                        Total Movimientos
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>
                        {groupStats.totalMovimientos}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 col-6">
                    <div 
                      style={{
                        textAlign: 'center',
                        padding: 'var(--spacing-lg)',
                        backgroundColor: 'var(--danger-light)',
                        border: '1px solid var(--danger)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', color: 'var(--danger)', textTransform: 'uppercase', fontWeight: '600', marginBottom: 'var(--spacing-xs)' }}>
                        <i className="bi bi-cart me-1"></i>
                        Gastos
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--danger)' }}>
                        {groupStats.cantidadGastos}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 'var(--spacing-xs)' }}>
                        ${groupStats.totalGastos.toLocaleString('es-AR')}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 col-6">
                    <div 
                      style={{
                        textAlign: 'center',
                        padding: 'var(--spacing-lg)',
                        backgroundColor: 'var(--success-light)',
                        border: '1px solid var(--success)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', color: 'var(--success)', textTransform: 'uppercase', fontWeight: '600', marginBottom: 'var(--spacing-xs)' }}>
                        <i className="bi bi-cash-coin me-1"></i>
                        Pagos
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--success)' }}>
                        {groupStats.cantidadPagos}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 'var(--spacing-xs)' }}>
                        ${groupStats.totalPagos.toLocaleString('es-AR')}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 col-6">
                    <div 
                      style={{
                        textAlign: 'center',
                        padding: 'var(--spacing-lg)',
                        backgroundColor: 'var(--info-light)',
                        border: '1px solid var(--info)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', color: 'var(--info)', textTransform: 'uppercase', fontWeight: '600', marginBottom: 'var(--spacing-xs)' }}>
                        <i className="bi bi-people me-1"></i>
                        Miembros
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--info)' }}>
                        {members.length}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estadísticas adicionales */}
                <div className="row g-3 mt-3">
                  {groupStats.miembroMayorGasto && (
                    <div className="col-md-6">
                      <div 
                        style={{
                          padding: 'var(--spacing-md)',
                          backgroundColor: 'var(--warning-light)',
                          border: '1px solid var(--warning)',
                          borderRadius: 'var(--radius-md)'
                        }}
                      >
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: 'var(--spacing-xs)' }}>
                          <i className="bi bi-trophy-fill me-2" style={{ color: 'var(--warning)' }}></i>
                          Mayor Gastador
                        </div>
                        <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                          {groupStats.miembroMayorGasto.nombre}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          ${groupStats.miembroMayorGasto.monto.toLocaleString('es-AR')} en gastos
                        </div>
                      </div>
                    </div>
                  )}
                  {groupStats.miembroMayorSaldo && Math.abs(groupStats.miembroMayorSaldo.saldo) > 0 && (
                    <div className="col-md-6">
                      <div 
                        style={{
                          padding: 'var(--spacing-md)',
                          backgroundColor: groupStats.miembroMayorSaldo.saldo > 0 ? 'var(--success-light)' : 'var(--danger-light)',
                          border: `1px solid ${groupStats.miembroMayorSaldo.saldo > 0 ? 'var(--success)' : 'var(--danger)'}`,
                          borderRadius: 'var(--radius-md)'
                        }}
                      >
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: 'var(--spacing-xs)' }}>
                          <i className="bi bi-cash-stack me-2" style={{ color: groupStats.miembroMayorSaldo.saldo > 0 ? 'var(--success)' : 'var(--danger)' }}></i>
                          Mayor Saldo
                        </div>
                        <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                          {groupStats.miembroMayorSaldo.name}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {groupStats.miembroMayorSaldo.saldo > 0 ? 'A cobrar' : 'Debe'} ${Math.abs(groupStats.miembroMayorSaldo.saldo).toLocaleString('es-AR')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <GroupBudgets groupId={groupId} />
      <GroupMembers groupId={groupId} refresh={refresh} onChange={triggerRefresh} />
      <GroupAddExpense groupId={groupId} onExpenseAdded={triggerRefresh} />
      <GroupExpenses groupId={groupId} refresh={refresh} />
      <GroupSummary groupId={groupId} refresh={refresh} />
      <GroupSettlements groupId={groupId} refresh={refresh} />
      <GroupMovements groupId={groupId} refresh={refresh} />
    </div>
  );
}