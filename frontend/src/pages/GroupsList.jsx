import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GroupInvitations from '../components/GroupInvitations';

export default function GroupsList() {
  // --- Estados principales ---
  const [groups, setGroups] = useState([]);      // Lista de grupos del usuario
  const [name, setName] = useState('');          // Nombre para crear nuevo grupo
  const [desc, setDesc] = useState('');          // Descripción para crear nuevo grupo
  const [error, setError] = useState(null);      // Mensaje de error
  const [loading, setLoading] = useState(true);  // Estado de carga
  const navigate = useNavigate();                // Para redireccionar

  // --- Cargar grupos al montar el componente ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    setLoading(true);
    fetch('/api/groups', { headers: { Authorization: `Bearer ${token}` } }) // Llama al backend para traer los grupos
      .then(r => r.json())
      .then(setGroups)
      .catch(() => setError('Error al cargar grupos'))
      .finally(() => setLoading(false));
  }, []);

  // --- Crear un nuevo grupo ---
  const handleCreate = async e => {
    e.preventDefault();
    setError(null);
    const token = localStorage.getItem('token');
    try {
      // Llama al backend para crear el grupo
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, description: desc })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo crear el grupo');
      // Redirige al detalle del grupo recién creado
      navigate(`/groups/${data.groupId}`);
    } catch (err) {
      setError(err.message);
    }
  };

  // --- Eliminar un grupo ---
  const handleDelete = async (groupId) => {
    if (!window.confirm('¿Eliminar este grupo? Esta acción es irreversible.')) return;
    const token = localStorage.getItem('token');
    try {
      // Llama al backend para eliminar el grupo
      const res = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo eliminar el grupo');
      // Actualiza la lista de grupos en el frontend
      setGroups(groups => groups.filter(g => g.id !== groupId));
    } catch (err) {
      setError(err.message);
    }
  };

  // --- Render principal ---
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
          Cargando grupos...
        </p>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ padding: 'var(--spacing-lg)' }}>
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
          <i className="bi bi-people" style={{ color: 'var(--primary)' }}></i>
          Mis Grupos
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 0 }}>
          Administra tus grupos y gestiona gastos compartidos
        </p>
      </div>

      {/* Invitaciones pendientes */}
      <GroupInvitations />

      {/* Formulario para crear grupo */}
      <div 
        className="card"
        style={{
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: 'var(--spacing-xl)'
        }}
      >
        <div className="card-body" style={{ padding: 'var(--spacing-xl)' }}>
          <h5 
            style={{ 
              fontWeight: '600', 
              color: 'var(--text-primary)',
              marginBottom: 'var(--spacing-lg)',
              fontSize: '1.1rem'
            }}
          >
            <i className="bi bi-plus-circle me-2" style={{ color: 'var(--primary)' }}></i>
            Crear Nuevo Grupo
          </h5>

          <form onSubmit={handleCreate}>
            <div className="row g-3">
              <div className="col-md-5">
                <label 
                  className="form-label" 
                  style={{ 
                    fontWeight: '600', 
                    color: 'var(--text-primary)', 
                    fontSize: '0.875rem',
                    marginBottom: 'var(--spacing-xs)'
                  }}
                >
                  <i className="bi bi-tag me-1"></i>
                  Nombre del Grupo <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem'
                  }}
                  placeholder="Ej: Viaje a Europa"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-5">
                <label 
                  className="form-label" 
                  style={{ 
                    fontWeight: '600', 
                    color: 'var(--text-primary)', 
                    fontSize: '0.875rem',
                    marginBottom: 'var(--spacing-xs)'
                  }}
                >
                  <i className="bi bi-text-left me-1"></i>
                  Descripción
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem'
                  }}
                  placeholder="Ej: Gastos del viaje grupal"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                />
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <button 
                  type="submit" 
                  className="btn w-100"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-sm) var(--spacing-lg)',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
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
                  <i className="bi bi-plus-lg me-1"></i>
                  Crear
                </button>
              </div>
            </div>

            {error && (
              <div 
                className="alert alert-danger"
                style={{
                  borderRadius: 'var(--radius-md)',
                  marginTop: 'var(--spacing-lg)',
                  marginBottom: 0,
                  border: '1px solid var(--danger)',
                  backgroundColor: 'var(--danger-light)'
                }}
                role="alert"
              >
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Lista de grupos */}
      <div>
        <h5 
          style={{ 
            fontWeight: '600', 
            color: 'var(--text-primary)',
            marginBottom: 'var(--spacing-lg)',
            fontSize: '1.1rem'
          }}
        >
          <i className="bi bi-list-ul me-2" style={{ color: 'var(--primary)' }}></i>
          Tus Grupos ({groups.length})
        </h5>

        {groups.length === 0 ? (
          <div 
            className="text-center"
            style={{
              padding: 'var(--spacing-2xl)',
              backgroundColor: 'var(--info-light)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--info)'
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
              No tienes grupos aún. ¡Crea uno para empezar!
            </p>
          </div>
        ) : (
          <div className="row g-3">
            {groups.map(g => (
              <div key={g.id} className="col-md-6 col-lg-4">
                <div 
                  className="card h-100"
                  style={{
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all var(--transition-fast)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                >
                  <div className="card-body" style={{ padding: 'var(--spacing-lg)' }}>
                    <h6 
                      style={{ 
                        fontWeight: '600', 
                        color: 'var(--text-primary)',
                        marginBottom: 'var(--spacing-sm)',
                        fontSize: '1rem'
                      }}
                    >
                      <i className="bi bi-people-fill me-2" style={{ color: 'var(--primary)' }}></i>
                      {g.name}
                    </h6>
                    {g.description && (
                      <p 
                        style={{ 
                          color: 'var(--text-secondary)', 
                          fontSize: '0.875rem',
                          marginBottom: 'var(--spacing-lg)'
                        }}
                      >
                        {g.description}
                      </p>
                    )}

                    <div className="d-flex gap-2 mt-auto">
                      <button
                        className="btn flex-grow-1"
                        style={{
                          backgroundColor: 'var(--primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--radius-md)',
                          padding: 'var(--spacing-xs) var(--spacing-md)',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)'
                        }}
                        onClick={() => navigate(`/groups/${g.id}`)}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'var(--primary-dark)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'var(--primary)';
                        }}
                      >
                        <i className="bi bi-eye me-1"></i>
                        Ver
                      </button>
                      <button
                        className="btn"
                        style={{
                          backgroundColor: 'transparent',
                          color: 'var(--danger)',
                          border: '1px solid var(--danger)',
                          borderRadius: 'var(--radius-md)',
                          padding: 'var(--spacing-xs) var(--spacing-md)',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)'
                        }}
                        onClick={() => handleDelete(g.id)}
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
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}