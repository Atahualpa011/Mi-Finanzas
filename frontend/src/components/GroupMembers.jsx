import { useEffect, useState } from 'react';

export default function GroupMembers({ groupId, refresh, onChange }) {
  // --- Estados principales ---
  const [members, setMembers] = useState([]);              // Lista de miembros del grupo
  const [createdBy, setCreatedBy] = useState(null);        // ID del creador del grupo
  const [myUserId, setMyUserId] = useState(null);          // ID del usuario actual
  const [showInvite, setShowInvite] = useState(null);      // ID del miembro a invitar (para mostrar modal)
  const [selectedFriendId, setSelectedFriendId] = useState(''); // Amigo seleccionado para invitar
  const [friends, setFriends] = useState([]);              // Lista de amigos del usuario
  const [inviteError, setInviteError] = useState(null);    // Error al invitar amigo
  const [error, setError] = useState(null);                // Error general
  const [name, setName] = useState('');                    // Nombre/email para agregar miembro

  // --- Cargar miembros del grupo al montar o cuando cambian groupId/refresh ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`/api/groups/${groupId}/members`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        setMembers(data.members);
        setCreatedBy(data.created_by);
        setMyUserId(data.my_user_id); // Guarda el ID del usuario actual
      });
  }, [groupId, refresh]);

  // --- Trae la lista de amigos del usuario (para invitar) ---
  const fetchFriends = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/friends', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setFriends(data);
  };

  // --- Invita a un amigo a ocupar un lugar de miembro "vacío" ---
  const handleInvite = async (memberId, friendUserId) => {
    setInviteError(null);
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/groups/${groupId}/members/${memberId}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ friendUserId })
    });
    const data = await res.json();
    if (!res.ok) {
      setInviteError(data.error || 'No se pudo enviar la invitación');
    } else {
      setShowInvite(null);
      setSelectedFriendId('');
      if (onChange) onChange(); // Notifica para refrescar datos
    }
  };

  // --- Elimina un miembro del grupo (solo el creador puede, y no a sí mismo) ---
  const handleDelete = async (memberId) => {
    if (!window.confirm('¿Eliminar este miembro?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/groups/${groupId}/members/${memberId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('No se pudo eliminar el miembro');
      if (onChange) onChange(); // Notifica para refrescar datos
    } catch (err) {
      setError(err.message);
    }
  };

  // --- Agrega un nuevo miembro al grupo (por nombre o email) ---
  const handleAdd = async (e) => {
    e.preventDefault();
    setError(null);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo agregar el miembro');
      setName('');
      if (onChange) onChange(); // Notifica para refrescar datos
    } catch (err) {
      setError(err.message);
    }
  };

  // --- Render principal ---
  return (
    <div 
      className="card"
      style={{
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 'var(--spacing-xl)'
      }}
    >
      <div 
        className="card-header"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-light)',
          padding: 'var(--spacing-lg)'
        }}
      >
        <h5 
          style={{ 
            marginBottom: 0,
            fontWeight: '600',
            color: 'var(--text-primary)',
            fontSize: '1.1rem'
          }}
        >
          <i className="bi bi-people me-2" style={{ color: 'var(--primary)' }}></i>
          Miembros del Grupo
        </h5>
      </div>
      
      <div className="card-body" style={{ padding: 'var(--spacing-xl)' }}>
        {/* Formulario para agregar miembro por nombre/email */}
        <form className="mb-4" onSubmit={handleAdd}>
          <label 
            className="form-label" 
            style={{ 
              fontWeight: '600', 
              color: 'var(--text-primary)', 
              fontSize: '0.875rem',
              marginBottom: 'var(--spacing-sm)'
            }}
          >
            <i className="bi bi-person-plus me-1"></i>
            Agregar Nuevo Miembro
          </label>
          <div className="d-flex gap-2">
            <input 
              className="form-control" 
              style={{
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                flex: 1
              }}
              placeholder="Nombre o email del miembro" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
            <button 
              className="btn" 
              type="submit"
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
              <i className="bi bi-plus-lg me-1"></i>
              Agregar
            </button>
          </div>
        </form>

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

        {/* Lista de miembros */}
        <div>
          <h6 
            style={{ 
              fontWeight: '600',
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              marginBottom: 'var(--spacing-md)'
            }}
          >
            Lista de Miembros ({members.filter(m => m.id).length})
          </h6>
          <ul 
            className="list-group"
            style={{
              borderRadius: 'var(--radius-md)'
            }}
          >
            {members.filter(m => m.id).map((m, index) => (
              <li 
                key={m.id} 
                className="list-group-item d-flex justify-content-between align-items-center"
                style={{
                  border: '1px solid var(--border-light)',
                  borderTop: index === 0 ? '1px solid var(--border-light)' : 'none',
                  padding: 'var(--spacing-md) var(--spacing-lg)',
                  backgroundColor: 'white',
                  transition: 'background-color var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <i className="bi bi-person-circle" style={{ color: 'var(--primary)', fontSize: '1.25rem' }}></i>
                  <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                    {m.username || m.name || m.email || m.user_id}
                  </span>
                  {/* Badge si es el creador */}
                  {createdBy == m.user_id && (
                    <span 
                      className="badge"
                      style={{
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        fontSize: '0.7rem',
                        padding: '3px 8px'
                      }}
                    >
                      <i className="bi bi-star-fill me-1"></i>
                      Creador
                    </span>
                  )}
                  {/* Badge si es tú */}
                  {myUserId == m.user_id && createdBy != m.user_id && (
                    <span 
                      className="badge"
                      style={{
                        backgroundColor: 'var(--info)',
                        color: 'white',
                        fontSize: '0.7rem',
                        padding: '3px 8px'
                      }}
                    >
                      Tú
                    </span>
                  )}
                  {/* Badge si es lugar vacío */}
                  {!m.user_id && (
                    <span 
                      className="badge"
                      style={{
                        backgroundColor: 'var(--warning-light)',
                        color: 'var(--warning)',
                        border: '1px solid var(--warning)',
                        fontSize: '0.7rem',
                        padding: '3px 8px'
                      }}
                    >
                      <i className="bi bi-hourglass-split me-1"></i>
                      Pendiente
                    </span>
                  )}
                </span>
                <span style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                  {/* Si el miembro es "vacío" (sin user_id), permite invitar un amigo */}
                  {!m.user_id && (
                    <button
                      className="btn btn-sm"
                      style={{
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        padding: '4px 12px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                      onClick={async () => {
                        setShowInvite(m.id);
                        setSelectedFriendId('');
                        await fetchFriends();
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'var(--primary-dark)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'var(--primary)';
                      }}
                    >
                      <i className="bi bi-envelope me-1"></i>
                      Invitar Amigo
                    </button>
                  )}
                  {/* SOLO el creador puede eliminar, y no puede eliminarse a sí mismo */}
                  {createdBy == myUserId && m.user_id != myUserId && (
                    <button
                      className="btn btn-sm"
                      style={{
                        backgroundColor: 'transparent',
                        color: 'var(--danger)',
                        border: '1px solid var(--danger)',
                        borderRadius: 'var(--radius-md)',
                        padding: '4px 12px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                      onClick={() => handleDelete(m.id)}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'var(--danger)';
                        e.target.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = 'var(--danger)';
                      }}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Modal para invitar amigo a ocupar un lugar de miembro */}
      {showInvite && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => { setShowInvite(null); setSelectedFriendId(''); }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: 0,
              borderRadius: 'var(--radius-lg)',
              maxWidth: '500px',
              width: '90%',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--border-light)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div 
              style={{
                padding: 'var(--spacing-lg)',
                borderBottom: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-secondary)'
              }}
            >
              <h5 
                style={{ 
                  margin: 0,
                  fontWeight: '600',
                  color: 'var(--text-primary)'
                }}
              >
                <i className="bi bi-person-plus-fill me-2" style={{ color: 'var(--primary)' }}></i>
                Invitar Amigo a este Miembro
              </h5>
            </div>

            {/* Body */}
            <div style={{ padding: 'var(--spacing-xl)' }}>
              {inviteError && (
                <div 
                  className="alert alert-danger"
                  style={{
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--spacing-lg)',
                    border: '1px solid var(--danger)',
                    backgroundColor: 'var(--danger-light)'
                  }}
                >
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {inviteError}
                </div>
              )}

              <label 
                className="form-label" 
                style={{ 
                  fontWeight: '600', 
                  color: 'var(--text-primary)', 
                  fontSize: '0.875rem',
                  marginBottom: 'var(--spacing-sm)'
                }}
              >
                <i className="bi bi-people me-1"></i>
                Selecciona un Amigo
              </label>
              <select
                className="form-select"
                style={{
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  marginBottom: 'var(--spacing-lg)'
                }}
                value={selectedFriendId}
                onChange={e => setSelectedFriendId(e.target.value)}
              >
                <option value="">Selecciona un amigo...</option>
                {friends.map(f => (
                  <option key={f.friend_id} value={f.friend_id}>{f.username}</option>
                ))}
              </select>
            </div>

            {/* Footer */}
            <div 
              style={{
                padding: 'var(--spacing-lg)',
                borderTop: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex',
                gap: 'var(--spacing-sm)',
                justifyContent: 'flex-end'
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
                onClick={() => { setShowInvite(null); setSelectedFriendId(''); }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--bg-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                Cancelar
              </button>
              <button
                className="btn"
                disabled={!selectedFriendId}
                style={{
                  backgroundColor: selectedFriendId ? 'var(--primary)' : 'var(--bg-secondary)',
                  color: selectedFriendId ? 'white' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--spacing-xs) var(--spacing-lg)',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: selectedFriendId ? 'pointer' : 'not-allowed',
                  transition: 'all var(--transition-fast)',
                  opacity: selectedFriendId ? 1 : 0.6
                }}
                onClick={() => handleInvite(showInvite, selectedFriendId)}
                onMouseEnter={(e) => {
                  if (selectedFriendId) {
                    e.target.style.backgroundColor = 'var(--primary-dark)';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = 'var(--shadow-md)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedFriendId) {
                    e.target.style.backgroundColor = 'var(--primary)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                <i className="bi bi-send me-2"></i>
                Enviar Invitación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}