import React, { useState, useEffect } from 'react';

function Friends() {
  const [friends, setFriends] = useState([]);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [pending, setPending] = useState([]);
  const [messageType, setMessageType] = useState('info'); 
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friendStats, setFriendStats] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false); 
  const token = localStorage.getItem('token');

  // Cargar amigos y solicitudes pendientes al montar
  useEffect(() => {
    fetch('http://localhost:3001/api/friends', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setFriends)
      .catch(() => setFriends([]));

    // Cargar solicitudes pendientes
    fetch('http://localhost:3001/api/friends/pending', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setPending)
      .catch(() => setPending([]));
  }, []);

  // Enviar solicitud de amistad
  const sendRequest = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      // Buscar el ID del usuario por email
      const resUser = await fetch('http://localhost:3001/api/profile/by-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email })
      });
      const userData = await resUser.json();
      if (!resUser.ok) throw new Error(userData.error || 'Usuario no encontrado');
      const friendId = userData.userId;

      // Enviar la solicitud de amistad
      const res = await fetch('http://localhost:3001/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ friendId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo agregar amigo');
      setMessage('Solicitud enviada o amigo agregado');
      setEmail('');
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Responder solicitud de amistad
  const respondRequest = async (requesterId, status) => {
    await fetch('http://localhost:3001/api/friends/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ requesterId, status })
    });
    setPending(pending.filter(p => p.user_id !== requesterId));
    // Recargar amigos si aceptaste
    if (status === 'accepted') {
      fetch('http://localhost:3001/api/friends', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(setFriends)
        .catch(() => {});
    }
  };

  // --- Elimina un amigo de la lista ---
  const handleDeleteFriend = async (friendId) => {
    if (!window.confirm('¿Seguro que deseas eliminar este amigo? Esta acción no se puede deshacer.')) return;
    try {
      const res = await fetch(`http://localhost:3001/api/friends/${friendId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo eliminar el amigo');
      // Vuelve a cargar la lista de amigos desde el backend para asegurar consistencia
      fetch('http://localhost:3001/api/friends', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(setFriends);
      setMessage('Amigo eliminado correctamente.');
      setMessageType('success');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage(err.message);
      setMessageType('danger');
      setTimeout(() => setMessage(null), 4000);
    }
  };

  // Bloquear o desbloquear amigo
  const handleBlockFriend = async (friendId, isBlocked) => {
    const action = isBlocked ? 'desbloquear' : 'bloquear';
    if (!window.confirm(`¿Estás seguro de ${action} a este amigo?`)) return;
    
    try {
      const endpoint = isBlocked ? 'unblock' : 'block';
      const response = await fetch(`http://localhost:3001/api/friends/${friendId}/${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        alert(`Amigo ${action}do exitosamente`);
        // Recargar lista de amigos
        fetch('http://localhost:3001/api/friends', {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(r => r.json())
          .then(setFriends);
      }
    } catch (error) {
      console.error(error);
      alert(`Error al ${action} amigo`);
    }
  };

  // Obtener estadísticas del amigo
  const fetchFriendStats = async (friendId) => {
    try {
      console.log('Obteniendo estadísticas para amigo:', friendId);
      const response = await fetch(`http://localhost:3001/api/friends/${friendId}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener estadísticas');
      }
      
      const data = await response.json();
      console.log('Estadísticas recibidas:', data);
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setFriendStats(data);
      setShowStatsModal(true); 
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      setFriendStats({
        shared_expenses_count: 0,
        shared_expenses_total: 0,
        transfers_sent_count: 0,
        transfers_sent_total: 0,
        transfers_received_count: 0,
        transfers_received_total: 0
      });
      setShowStatsModal(true); 
    }
  };

  //
  const closeStatsModal = () => {
    setShowStatsModal(false);
    setFriendStats(null);
    setSelectedFriend(null);
  };

  return (
    <div className="container mt-4">
      <h2>Mis Amigos</h2>
      <form onSubmit={sendRequest} className="mb-4 d-flex align-items-center">
        <input
          type="email"
          className="form-control w-auto me-2"
          placeholder="Email del amigo"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button className="btn btn-primary" type="submit">Agregar amigo</button>
      </form>
      {message && (
        <div className={`alert alert-${messageType} mb-3`} role="alert">
          {message}
        </div>
      )}

      <h4>Lista de amigos</h4>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Desde</th>
              <th>Balance</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {friends.length === 0 && (
              <tr>
                <td colSpan={5}>No tienes amigos agregados.</td>
              </tr>
            )}
            {friends.map(friend => (
              <tr key={friend.friend_id}>
                <td>{friend.username}</td>
                <td>
                  {new Date(friend.since).toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </td>
                <td className={friend.amount_exp >= 0 ? 'text-success' : 'text-danger'}>
                  ${Math.abs(friend.amount_exp).toLocaleString('es-AR')}
                  {friend.amount_exp >= 0 ? ' a favor' : ' en deuda'}
                </td>
                <td>
                  {friend.blocked ? (
                    <span className="badge bg-secondary">Bloqueado</span>
                  ) : (
                    <span className="badge bg-success">Activo</span>
                  )}
                </td>
                <td>
                  <button 
                    className="btn btn-info btn-sm me-2"
                    onClick={() => {
                      setSelectedFriend(friend);
                      fetchFriendStats(friend.friend_id);
                    }}
                    
                  >
                    Ver estadísticas
                  </button>
                  <button 
                    className={`btn ${friend.blocked ? 'btn-success' : 'btn-warning'} btn-sm me-2`}
                    onClick={() => handleBlockFriend(friend.friend_id, friend.blocked)}
                  >
                    {friend.blocked ? 'Desbloquear' : 'Bloquear'}
                  </button>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteFriend(friend.friend_id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h4 className="mt-4">Solicitudes pendientes</h4>
      <ul className="list-group">
        {pending.length === 0 && (
          <li className="list-group-item">No tienes solicitudes pendientes.</li>
        )}
        {pending.map(req => (
          <li className="list-group-item d-flex justify-content-between align-items-center" key={req.user_id}>
            <span>
              <b>{req.username}</b> ({req.full_name}) - {req.country}
            </span>
            <span>
              <button className="btn btn-success btn-sm me-2"
                onClick={() => respondRequest(req.user_id, 'accepted')}>Aceptar</button>
              <button className="btn btn-danger btn-sm"
                onClick={() => respondRequest(req.user_id, 'rejected')}>Rechazar</button>
            </span>
          </li>
        ))}
      </ul>

      {showStatsModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Estadísticas con {selectedFriend?.username}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={closeStatsModal}
                ></button>
              </div>
              <div className="modal-body">
                {friendStats ? (
                  <div>
                    <p><strong>Amigos desde:</strong> {selectedFriend?.since ? new Date(selectedFriend.since).toLocaleDateString('es-AR') : 'N/A'}</p>
                    <hr />
                    <h6>Gastos compartidos</h6>
                    <p>Cantidad: {friendStats.shared_expenses_count ?? 0}</p>
                    <p>Total: ${(friendStats.shared_expenses_total ?? 0).toLocaleString('es-AR')}</p>
                    <hr />
                    <h6>Transferencias enviadas</h6>
                    <p>Cantidad: {friendStats.transfers_sent_count ?? 0}</p>
                    <p>Total: ${(friendStats.transfers_sent_total ?? 0).toLocaleString('es-AR')}</p>
                    <hr />
                    <h6>Transferencias recibidas</h6>
                    <p>Cantidad: {friendStats.transfers_received_count ?? 0}</p>
                    <p>Total: ${(friendStats.transfers_received_total ?? 0).toLocaleString('es-AR')}</p>
                    <hr />
                    <h6>Balance actual</h6>
                    <p className={selectedFriend?.amount_exp >= 0 ? 'text-success' : 'text-danger'}>
                      <strong>${Math.abs(selectedFriend?.amount_exp ?? 0).toLocaleString('es-AR')}</strong>
                      {selectedFriend?.amount_exp >= 0 ? ' a tu favor' : ' debes'}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-2">Cargando estadísticas...</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={closeStatsModal}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Friends;