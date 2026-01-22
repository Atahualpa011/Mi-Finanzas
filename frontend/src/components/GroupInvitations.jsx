import { useEffect, useState } from 'react';

export default function GroupInvitations({ refresh }) {
  // --- Estados principales ---
  const [invitations, setInvitations] = useState([]); // Lista de invitaciones pendientes
  const [error, setError] = useState(null);           // Mensaje de error

  // --- Cargar invitaciones al montar o cuando cambia refresh ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/groups/invitations', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setInvitations)
      .catch(() => setInvitations([])); // Si falla, deja la lista vacía
  }, [refresh]);

  // --- Aceptar una invitación ---
  const handleAccept = async (invitationId) => {
    setError(null);
    const token = localStorage.getItem('token');
    // Llama al backend para aceptar la invitación
    const res = await fetch(`/api/groups/invitations/${invitationId}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || 'No se pudo aceptar la invitación');
    else setInvitations(invitations.filter(i => i.id !== invitationId)); // Saca la invitación aceptada
    if (typeof refresh === 'function') refresh(); // Si se pasa una función de refresh, la llama
  };

  // --- Render principal ---
  if (invitations.length === 0) return null;

  return (
    <div style={{ marginBottom: 'var(--spacing-xl)' }}>
      <h5 
        style={{ 
          fontWeight: '600', 
          color: 'var(--text-primary)',
          marginBottom: 'var(--spacing-lg)',
          fontSize: '1.1rem'
        }}
      >
        <i className="bi bi-envelope" style={{ color: 'var(--warning)' }}></i>
        <span className="ms-2">Invitaciones Pendientes</span>
        <span 
          className="badge" 
          style={{ 
            backgroundColor: 'var(--warning)',
            color: 'white',
            marginLeft: 'var(--spacing-sm)',
            fontSize: '0.75rem',
            padding: '4px 8px',
            borderRadius: 'var(--radius-full)'
          }}
        >
          {invitations.length}
        </span>
      </h5>

      {error && (
        <div 
          className="alert alert-danger"
          style={{
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--spacing-lg)',
            border: '1px solid var(--danger)',
            backgroundColor: 'var(--danger-light)'
          }}
          role="alert"
        >
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      <div className="row g-3" style={{ marginBottom: 'var(--spacing-lg)' }}>
        {invitations.map(inv => (
          <div key={inv.id} className="col-12">
            <div 
              className="card"
              style={{
                border: '1px solid var(--warning)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                backgroundColor: 'var(--warning-light)'
              }}
            >
              <div 
                className="card-body d-flex justify-content-between align-items-center"
                style={{ padding: 'var(--spacing-lg)' }}
              >
                <div>
                  <p 
                    style={{ 
                      marginBottom: 'var(--spacing-xs)',
                      color: 'var(--text-primary)',
                      fontWeight: '500'
                    }}
                  >
                    <i className="bi bi-person-badge me-2" style={{ color: 'var(--warning)' }}></i>
                    Invitación para ser <strong>{inv.member_name}</strong> en el grupo <strong>{inv.group_name}</strong>
                  </p>
                  <p 
                    style={{ 
                      marginBottom: 0,
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <i className="bi bi-clock me-1"></i>
                    Pendiente de aceptación
                  </p>
                </div>
                <button 
                  className="btn"
                  style={{
                    backgroundColor: 'var(--success)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-sm) var(--spacing-lg)',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    whiteSpace: 'nowrap'
                  }}
                  onClick={() => handleAccept(inv.id)}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--success-dark)';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'var(--success)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <i className="bi bi-check-circle me-2"></i>
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}