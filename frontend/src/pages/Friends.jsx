import { useEffect, useState } from 'react';

export default function Friends() {
  const [friends, setFriends] = useState([]);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [pending, setPending] = useState([]);
  const [messageType, setMessageType] = useState('info'); 

  // Cargar amigos y solicitudes pendientes al montar
  useEffect(() => {
    const token = localStorage.getItem('token');
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
    const token = localStorage.getItem('token');
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
    const token = localStorage.getItem('token');
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
    const token = localStorage.getItem('token');
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

  return (
    <div>
      <h2 className="mb-4 text-center">Amigos</h2>
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
              <th>Usuario</th>
              <th>Desde</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {friends.length === 0 && (
              <tr>
                <td colSpan={3}>No tienes amigos agregados.</td>
              </tr>
            )}
            {friends.map(f => (
              <tr key={f.friend_id}>
                <td>{f.username}</td>
                <td>{f.since ? new Date(f.since).toLocaleDateString() : '-'}</td>
                <td>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDeleteFriend(f.friend_id)}
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
    </div>
  );
}