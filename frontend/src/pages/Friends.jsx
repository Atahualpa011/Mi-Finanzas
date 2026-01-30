import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import HelpButton from '../components/HelpButton';
import { HELP_CONTENTS } from '../utils/helpContents';

function Friends() {
  const [friends, setFriends] = useState([]);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [pending, setPending] = useState([]);
  const [messageType, setMessageType] = useState('info'); 
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friendStats, setFriendStats] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false); 
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  // Cargar amigos y solicitudes pendientes al montar
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('http://localhost:3001/api/friends', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json()),
      fetch('http://localhost:3001/api/friends/pending', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json())
    ])
      .then(([friendsData, pendingData]) => {
        setFriends(friendsData);
        setPending(pendingData);
      })
      .catch(() => {
        setFriends([]);
        setPending([]);
      })
      .finally(() => setLoading(false));
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
    <div className="container-fluid" style={{ padding: 'var(--spacing-lg)' }}>
      {/* Botón de ayuda */}
      <div className="mb-3">
        <HelpButton section="friends" helpContent={HELP_CONTENTS.friends} />
      </div>

      {/* Loading State */}
      {loading ? (
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
            Cargando amigos...
          </p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <h2 
              style={{ 
                fontWeight: '700', 
                color: 'var(--text-primary)',
                marginBottom: 'var(--spacing-xs)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)'
              }}
            >
              <i className="bi bi-people-fill" style={{ color: 'var(--primary)' }}></i>
              Mis Amigos
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 0 }}>
              Gestiona tus amistades, envía solicitudes y consulta estadísticas
            </p>
          </div>

          {/* Form para agregar amigo */}
          <div 
            className="card"
            style={{
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: 'var(--spacing-xl)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div 
              className="card-body"
              style={{ padding: 'var(--spacing-lg)' }}
            >
              <h5 
                style={{ 
                  fontWeight: '600', 
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--spacing-md)',
                  fontSize: '1.1rem'
                }}
              >
                <i className="bi bi-person-plus me-2" style={{ color: 'var(--primary)' }}></i>
                Agregar Nuevo Amigo
              </h5>
              <form onSubmit={sendRequest} className="d-flex align-items-center gap-2">
                <div style={{ flex: 1 }}>
                  <input
                    type="email"
                    className="form-control"
                    style={{
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem'
                    }}
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button 
                  className="btn" 
                  type="submit"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.5rem 1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--primary-dark)';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'var(--primary)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <i className="bi bi-send me-1"></i>
                  Enviar Solicitud
                </button>
              </form>
            </div>
          </div>

          {/* Mensaje de alerta */}
          {message && (
            <div 
              className={`alert alert-${messageType}`}
              style={{
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--spacing-lg)',
                border: `1px solid var(--${messageType === 'success' ? 'success' : messageType === 'danger' ? 'danger' : 'info'})`,
                backgroundColor: `var(--${messageType === 'success' ? 'success' : messageType === 'danger' ? 'danger' : 'info'}-light)`
              }}
              role="alert"
            >
              <i className={`bi bi-${messageType === 'success' ? 'check-circle' : messageType === 'danger' ? 'exclamation-triangle' : 'info-circle'} me-2`}></i>
              {message}
            </div>
          )}

          {/* Solicitudes pendientes */}
          {pending.length > 0 && (
            <div 
              className="card"
              style={{
                border: '1px solid var(--warning)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: 'var(--spacing-xl)',
                boxShadow: 'var(--shadow-sm)',
                backgroundColor: 'var(--warning-light)'
              }}
            >
              <div 
                className="card-body"
                style={{ padding: 'var(--spacing-lg)' }}
              >
                <h5 
                  style={{ 
                    fontWeight: '600', 
                    color: 'var(--warning)',
                    marginBottom: 'var(--spacing-md)',
                    fontSize: '1.1rem'
                  }}
                >
                  <i className="bi bi-bell-fill me-2"></i>
                  Solicitudes Pendientes ({pending.length})
                </h5>
                <div className="d-flex flex-column gap-2">
                  {pending.map(req => (
                    <div 
                      key={req.user_id}
                      className="card"
                      style={{
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--spacing-md)',
                        backgroundColor: 'white'
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                            <i className="bi bi-person-circle me-2" style={{ color: 'var(--primary)' }}></i>
                            {req.username}
                          </strong>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                            {req.full_name} • {req.country}
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-sm"
                            style={{
                              backgroundColor: 'var(--success)',
                              color: 'white',
                              border: 'none',
                              borderRadius: 'var(--radius-md)',
                              padding: '0.375rem 1rem',
                              fontSize: '0.875rem',
                              fontWeight: '500'
                            }}
                            onClick={() => respondRequest(req.user_id, 'accepted')}
                          >
                            <i className="bi bi-check-lg me-1"></i>
                            Aceptar
                          </button>
                          <button 
                            className="btn btn-sm"
                            style={{
                              backgroundColor: 'var(--danger)',
                              color: 'white',
                              border: 'none',
                              borderRadius: 'var(--radius-md)',
                              padding: '0.375rem 1rem',
                              fontSize: '0.875rem',
                              fontWeight: '500'
                            }}
                            onClick={() => respondRequest(req.user_id, 'rejected')}
                          >
                            <i className="bi bi-x-lg me-1"></i>
                            Rechazar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Lista de amigos */}
          <div 
            className="card"
            style={{
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'visible'
            }}
          >
            <div 
              className="card-body"
              style={{ padding: 'var(--spacing-lg)', overflow: 'visible' }}
            >
              <h5 
                style={{ 
                  fontWeight: '600', 
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--spacing-lg)',
                  fontSize: '1.1rem'
                }}
              >
                <i className="bi bi-people me-2" style={{ color: 'var(--primary)' }}></i>
                Lista de Amigos ({friends.length})
              </h5>

              {friends.length === 0 ? (
                <div 
                  className="text-center"
                  style={{ 
                    padding: 'var(--spacing-2xl)', 
                    backgroundColor: 'var(--info-light)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <i 
                    className="bi bi-people" 
                    style={{ 
                      fontSize: '3rem', 
                      color: 'var(--info)',
                      marginBottom: 'var(--spacing-md)'
                    }}
                  ></i>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 0 }}>
                    No tienes amigos agregados. ¡Envía una solicitud para empezar!
                  </p>
                </div>
              ) : (
                <div className="table-responsive" style={{ overflow: 'visible' }}>
                  <table className="table" style={{ marginBottom: 0 }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                        <th style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.875rem', padding: 'var(--spacing-sm) var(--spacing-md)' }}>
                          NOMBRE
                        </th>
                        <th style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.875rem', padding: 'var(--spacing-sm) var(--spacing-md)' }}>
                          DESDE
                        </th>
                        <th style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.875rem', padding: 'var(--spacing-sm) var(--spacing-md)' }}>
                          BALANCE
                        </th>
                        <th style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.875rem', padding: 'var(--spacing-sm) var(--spacing-md)' }}>
                          ESTADO
                        </th>
                        <th style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.875rem', padding: 'var(--spacing-sm) var(--spacing-md)' }}>
                          ACCIONES
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {friends.map(friend => (
                        <tr key={friend.friend_id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: 'var(--spacing-md)', color: 'var(--text-primary)', fontWeight: '500' }}>
                            <i className="bi bi-person-circle me-2" style={{ color: 'var(--primary)' }}></i>
                            {friend.username}
                          </td>
                          <td style={{ padding: 'var(--spacing-md)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            <i className="bi bi-calendar3 me-1"></i>
                            {new Date(friend.since).toLocaleDateString('es-AR', {
                              year: 'numeric',
                              month: 'long'
                            })}
                          </td>
                          <td style={{ padding: 'var(--spacing-md)' }}>
                            <span 
                              style={{ 
                                color: friend.amount_exp >= 0 ? 'var(--success)' : 'var(--danger)',
                                fontWeight: '600',
                                fontSize: '0.9rem'
                              }}
                            >
                              <i className={`bi bi-${friend.amount_exp >= 0 ? 'arrow-up-circle' : 'arrow-down-circle'} me-1`}></i>
                              ${Math.abs(friend.amount_exp).toLocaleString('es-AR')}
                              <span style={{ fontSize: '0.75rem', fontWeight: '400', marginLeft: '0.25rem' }}>
                                {friend.amount_exp >= 0 ? 'a favor' : 'en deuda'}
                              </span>
                            </span>
                          </td>
                          <td style={{ padding: 'var(--spacing-md)' }}>
                            {friend.blocked ? (
                              <span 
                                className="badge"
                                style={{
                                  backgroundColor: 'var(--danger-light)',
                                  color: 'var(--danger)',
                                  padding: '0.375rem 0.75rem',
                                  borderRadius: 'var(--radius-full)',
                                  fontSize: '0.75rem',
                                  fontWeight: '600'
                                }}
                              >
                                <i className="bi bi-slash-circle me-1"></i>
                                Bloqueado
                              </span>
                            ) : (
                              <span 
                                className="badge"
                                style={{
                                  backgroundColor: 'var(--success-light)',
                                  color: 'var(--success)',
                                  padding: '0.375rem 0.75rem',
                                  borderRadius: 'var(--radius-full)',
                                  fontSize: '0.75rem',
                                  fontWeight: '600'
                                }}
                              >
                                <i className="bi bi-check-circle me-1"></i>
                                Activo
                              </span>
                            )}
                          </td>
                          <td style={{ padding: 'var(--spacing-md)' }}>
                            <div className="dropdown">
                              <button 
                                className="btn btn-sm"
                                data-bs-toggle="dropdown"
                                style={{
                                  backgroundColor: 'transparent',
                                  border: '1px solid var(--border-light)',
                                  color: 'var(--text-secondary)',
                                  borderRadius: 'var(--radius-md)',
                                  padding: '0.25rem 0.5rem',
                                  cursor: 'pointer'
                                }}
                              >
                                <i className="bi bi-three-dots-vertical"></i>
                              </button>
                              <ul className="dropdown-menu dropdown-menu-end">
                                <li>
                                  <button 
                                    className="dropdown-item"
                                    onClick={() => {
                                      setSelectedFriend(friend);
                                      fetchFriendStats(friend.friend_id);
                                    }}
                                    style={{
                                      color: 'var(--text-primary)',
                                      fontSize: '0.875rem'
                                    }}
                                  >
                                    <i className="bi bi-graph-up me-2" style={{ color: 'var(--info)' }}></i>
                                    Ver estadísticas
                                  </button>
                                </li>
                                <li>
                                  <button 
                                    className="dropdown-item"
                                    onClick={() => handleBlockFriend(friend.friend_id, friend.blocked)}
                                    style={{
                                      color: 'var(--text-primary)',
                                      fontSize: '0.875rem'
                                    }}
                                  >
                                    <i className={`bi bi-${friend.blocked ? 'unlock' : 'lock'} me-2`} style={{ color: 'var(--warning)' }}></i>
                                    {friend.blocked ? 'Desbloquear' : 'Bloquear'}
                                  </button>
                                </li>
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                  <button 
                                    className="dropdown-item"
                                    onClick={() => handleDeleteFriend(friend.friend_id)}
                                    style={{
                                      color: 'var(--danger)',
                                      fontSize: '0.875rem'
                                    }}
                                  >
                                    <i className="bi bi-trash me-2"></i>
                                    Eliminar
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal de estadísticas */}
      {showStatsModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div 
              className="modal-content"
              style={{
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)'
              }}
            >
              <div 
                className="modal-header"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderBottom: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                  padding: 'var(--spacing-lg)'
                }}
              >
                <h5 
                  className="modal-title"
                  style={{
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    fontSize: '1.1rem'
                  }}
                >
                  <i className="bi bi-graph-up me-2" style={{ color: 'var(--primary)' }}></i>
                  Estadísticas con {selectedFriend?.username}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={closeStatsModal}
                ></button>
              </div>
              <div className="modal-body" style={{ padding: 'var(--spacing-lg)' }}>
                {friendStats ? (
                  <div>
                    {/* Fecha de amistad */}
                    <div 
                      style={{
                        padding: 'var(--spacing-md)',
                        backgroundColor: 'var(--info-light)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--spacing-lg)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <i className="bi bi-calendar-heart" style={{ fontSize: '1.5rem', color: 'var(--info)' }}></i>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>
                            Amigos desde
                          </div>
                          <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                            {selectedFriend?.since ? new Date(selectedFriend.since).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Gastos compartidos */}
                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                      <div 
                        style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: '600', 
                          color: 'var(--text-primary)',
                          marginBottom: 'var(--spacing-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--spacing-xs)'
                        }}
                      >
                        <i className="bi bi-receipt" style={{ color: 'var(--primary)' }}></i>
                        Gastos Compartidos
                      </div>
                      <div 
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 'var(--spacing-md)',
                          padding: 'var(--spacing-md)',
                          backgroundColor: 'var(--bg-secondary)',
                          borderRadius: 'var(--radius-md)'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                            Cantidad
                          </div>
                          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                            {friendStats.shared_expenses_count ?? 0}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                            Total
                          </div>
                          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)' }}>
                            ${(friendStats.shared_expenses_total ?? 0).toLocaleString('es-AR')}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Transferencias enviadas */}
                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                      <div 
                        style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: '600', 
                          color: 'var(--text-primary)',
                          marginBottom: 'var(--spacing-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--spacing-xs)'
                        }}
                      >
                        <i className="bi bi-arrow-up-circle" style={{ color: 'var(--danger)' }}></i>
                        Transferencias Enviadas
                      </div>
                      <div 
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 'var(--spacing-md)',
                          padding: 'var(--spacing-md)',
                          backgroundColor: 'var(--bg-secondary)',
                          borderRadius: 'var(--radius-md)'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                            Cantidad
                          </div>
                          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                            {friendStats.transfers_sent_count ?? 0}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                            Total
                          </div>
                          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--danger)' }}>
                            ${(friendStats.transfers_sent_total ?? 0).toLocaleString('es-AR')}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Transferencias recibidas */}
                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                      <div 
                        style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: '600', 
                          color: 'var(--text-primary)',
                          marginBottom: 'var(--spacing-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--spacing-xs)'
                        }}
                      >
                        <i className="bi bi-arrow-down-circle" style={{ color: 'var(--success)' }}></i>
                        Transferencias Recibidas
                      </div>
                      <div 
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 'var(--spacing-md)',
                          padding: 'var(--spacing-md)',
                          backgroundColor: 'var(--bg-secondary)',
                          borderRadius: 'var(--radius-md)'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                            Cantidad
                          </div>
                          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                            {friendStats.transfers_received_count ?? 0}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                            Total
                          </div>
                          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--success)' }}>
                            ${(friendStats.transfers_received_total ?? 0).toLocaleString('es-AR')}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Balance actual */}
                    <div 
                      style={{
                        padding: 'var(--spacing-lg)',
                        backgroundColor: selectedFriend?.amount_exp >= 0 ? 'var(--success-light)' : 'var(--danger-light)',
                        borderRadius: 'var(--radius-md)',
                        border: `2px solid ${selectedFriend?.amount_exp >= 0 ? 'var(--success)' : 'var(--danger)'}`
                      }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)', fontWeight: '600', textTransform: 'uppercase' }}>
                          Balance Actual
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: selectedFriend?.amount_exp >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                          <i className={`bi bi-${selectedFriend?.amount_exp >= 0 ? 'arrow-up-circle-fill' : 'arrow-down-circle-fill'} me-2`}></i>
                          ${Math.abs(selectedFriend?.amount_exp ?? 0).toLocaleString('es-AR')}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: selectedFriend?.amount_exp >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: '500', marginTop: 'var(--spacing-xs)' }}>
                          {selectedFriend?.amount_exp >= 0 ? 'a tu favor' : 'en deuda'}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center" style={{ padding: 'var(--spacing-xl)' }}>
                    <div 
                      className="spinner-border" 
                      style={{ 
                        width: '2.5rem', 
                        height: '2.5rem',
                        color: 'var(--primary)'
                      }} 
                      role="status"
                    >
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p style={{ marginTop: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>
                      Cargando estadísticas...
                    </p>
                  </div>
                )}
              </div>
              <div 
                className="modal-footer"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderTop: '1px solid var(--border-light)',
                  borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                  padding: 'var(--spacing-lg)'
                }}
              >
                <button 
                  type="button" 
                  className="btn-secondary-custom"
                  style={{
                    padding: '0.5rem 1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer'
                  }}
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