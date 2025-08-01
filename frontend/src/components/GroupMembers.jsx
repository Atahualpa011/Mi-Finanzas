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
    <div className="mb-4">
      <h4>Miembros</h4>
      {/* Formulario para agregar miembro por nombre/email */}
      <form className="mb-2 d-flex" onSubmit={handleAdd}>
        <input className="form-control me-2" placeholder="Nombre o email" value={name} onChange={e => setName(e.target.value)} required />
        <button className="btn btn-success" type="submit">Agregar</button>
      </form>
      {error && <div className="alert alert-danger">{error}</div>}
      <ul className="list-group">
        {members.filter(m => m.id).map(m => (
          <li key={m.id} className="list-group-item d-flex justify-content-between align-items-center">
            <span>
              {m.username || m.name || m.email || m.user_id}
            </span>
            <span>
              {/* Si el miembro es "vacío" (sin user_id), permite invitar un amigo */}
              {!m.user_id && (
                <button
                  className="btn btn-outline-primary btn-sm me-2"
                  onClick={async () => {
                    setShowInvite(m.id);
                    setSelectedFriendId('');
                    await fetchFriends();
                  }}
                >
                  Invitar amigo
                </button>
              )}
              {/* SOLO el creador puede eliminar, y no puede eliminarse a sí mismo */}
              {createdBy == myUserId && m.user_id != myUserId && (
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleDelete(m.id)}
                >
                  Eliminar
                </button>
              )}
            </span>
          </li>
        ))}
      </ul>
      {/* Modal para invitar amigo a ocupar un lugar de miembro */}
      {showInvite && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: '#0008',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              background: '#fff',
              padding: 24,
              borderRadius: 8,
              maxWidth: 400,
              width: '100%',
              boxShadow: '0 4px 32px #0004',
              pointerEvents: 'auto'
            }}
            tabIndex={0}
          >
            <h5>Invitar amigo a este miembro</h5>
            {inviteError && <div className="alert alert-danger">{inviteError}</div>}
            <select
              className="form-select mb-2"
              value={selectedFriendId}
              onChange={e => setSelectedFriendId(e.target.value)}
            >
              <option value="">Selecciona un amigo...</option>
              {friends.map(f => (
                <option key={f.friend_id} value={f.friend_id}>{f.username}</option>
              ))}
            </select>
            <button
              className="btn btn-primary me-2"
              disabled={!selectedFriendId}
              onClick={() => handleInvite(showInvite, selectedFriendId)}
            >Enviar invitación</button>
            <button
              className="btn btn-secondary"
              onClick={() => { setShowInvite(null); setSelectedFriendId(''); }}
            >Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}