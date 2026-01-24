import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../hooks/useCurrency';

export default function Profile() {
  // --- Estados principales ---
  const [profile, setProfile] = useState(null);      // Datos del perfil del usuario
  const [edit, setEdit] = useState(false);           // Si está en modo edición
  const [form, setForm] = useState({});              // Datos del formulario de edición
  const [error, setError] = useState(null);          // Mensaje de error
  const [message, setMessage] = useState(null);      // Mensaje de éxito
  const [loading, setLoading] = useState(true);      // Estado de carga
  const navigate = useNavigate();                    // Para redireccionar
  const { CURRENCIES } = useCurrency();              // Lista de monedas disponibles

  // --- Cargar perfil al montar el componente ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    setLoading(true);
    fetch('http://localhost:3001/api/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setProfile(data); // Guarda los datos del perfil
        setForm({
          username: data.username,
          fullName: data.fullName,
          country: data.country,
          preferredCurrency: data.preferredCurrency || 'ARS'
        }); // Inicializa el formulario con los datos actuales
      })
      .catch(() => {
        setError('Error al cargar el perfil');
      })
      .finally(() => setLoading(false));
  }, []);

  // --- Maneja cambios en los campos del formulario ---
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- Guardar cambios del perfil ---
  const handleSave = async e => {
    e.preventDefault();
    setError(null); setMessage(null);
    const token = localStorage.getItem('token');
    try {
      // Llama al backend para actualizar el perfil
      const res = await fetch('http://localhost:3001/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar perfil');
      setMessage('Perfil actualizado');
      setProfile({ ...profile, ...form }); // Actualiza el estado del perfil
      setEdit(false); // Sale del modo edición
    } catch (err) {
      setError(err.message);
    }
  };

  // --- Si aún no se cargó el perfil, muestra pantalla de carga ---
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
          Cargando perfil...
        </p>
      </div>
    );
  }

  // --- Render principal ---
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
          <i className="bi bi-person-circle" style={{ color: 'var(--primary)' }}></i>
          Mi Perfil
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 0 }}>
          Gestiona tu información personal y configuración de cuenta
        </p>
      </div>

      {/* Mensajes de alerta */}
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
      {message && (
        <div 
          className="alert alert-success"
          style={{
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--spacing-lg)',
            border: '1px solid var(--success)',
            backgroundColor: 'var(--success-light)'
          }}
          role="alert"
        >
          <i className="bi bi-check-circle me-2"></i>
          {message}
        </div>
      )}

      {/* Card principal */}
      <div className="d-flex justify-content-center">
        <div 
          className="card"
          style={{
            maxWidth: '600px',
            width: '100%',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <div className="card-body" style={{ padding: 'var(--spacing-xl)' }}>
            {/* Modo visualización */}
            {!edit ? (
              <>
                {/* Información del perfil */}
                <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                  <div 
                    style={{
                      padding: 'var(--spacing-lg)',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: 'var(--spacing-md)'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600', marginBottom: 'var(--spacing-xs)' }}>
                      <i className="bi bi-envelope me-1"></i>
                      Email
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                      {profile.email}
                    </div>
                  </div>

                  <div 
                    style={{
                      padding: 'var(--spacing-lg)',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: 'var(--spacing-md)'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600', marginBottom: 'var(--spacing-xs)' }}>
                      <i className="bi bi-person me-1"></i>
                      Usuario
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                      {profile.username}
                    </div>
                  </div>

                  <div 
                    style={{
                      padding: 'var(--spacing-lg)',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: 'var(--spacing-md)'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600', marginBottom: 'var(--spacing-xs)' }}>
                      <i className="bi bi-person-badge me-1"></i>
                      Nombre Completo
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                      {profile.fullName}
                    </div>
                  </div>

                  <div 
                    style={{
                      padding: 'var(--spacing-lg)',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600', marginBottom: 'var(--spacing-xs)' }}>
                      <i className="bi bi-geo-alt me-1"></i>
                      País
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                      {profile.country}
                    </div>
                  </div>

                  <div 
                    style={{
                      padding: 'var(--spacing-lg)',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600', marginBottom: 'var(--spacing-xs)' }}>
                      <i className="bi bi-currency-exchange me-1"></i>
                      Moneda Favorita
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                      {CURRENCIES.find(c => c.code === (profile.preferredCurrency || 'ARS'))?.label || 'Pesos argentinos'}
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <button 
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
                    transition: 'all var(--transition-fast)',
                    marginBottom: 'var(--spacing-md)'
                  }}
                  onClick={() => setEdit(true)}
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
                  <i className="bi bi-pencil me-2"></i>
                  Editar Datos
                </button>

                <button
                  className="btn w-100"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--danger)',
                    border: '1px solid var(--danger)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-sm) var(--spacing-lg)',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  onClick={async () => {
                    if (!window.confirm('¿Estás seguro de eliminar tu cuenta? Esta acción es irreversible.')) {
                      return;
                    }
                    const token = localStorage.getItem('token');
                    try {
                      // Llama al backend para eliminar la cuenta
                      const res = await fetch('http://localhost:3001/api/profile/me', {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      if (!res.ok) {
                        const err = await res.json();
                        throw new Error(err.error || 'No se pudo eliminar la cuenta');
                      }
                      localStorage.removeItem('token');
                      navigate('/register', { replace: true });
                    } catch (e) {
                      setError(e.message);
                    }
                  }}
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
                  Eliminar Cuenta
                </button>
              </>
            ) : (
                // Si está en modo edición, muestra el formulario
                <form onSubmit={handleSave}>
                  <h5 
                    style={{ 
                      fontWeight: '600', 
                      color: 'var(--text-primary)',
                      marginBottom: 'var(--spacing-lg)',
                      fontSize: '1.1rem'
                    }}
                  >
                    <i className="bi bi-pencil-square me-2" style={{ color: 'var(--primary)' }}></i>
                    Editar Información
                  </h5>

                  <div className="mb-3">
                    <label 
                      className="form-label" 
                      style={{ 
                        fontWeight: '600', 
                        color: 'var(--text-primary)', 
                        fontSize: '0.875rem',
                        marginBottom: 'var(--spacing-xs)'
                      }}
                    >
                      <i className="bi bi-person me-1"></i>
                      Usuario <span style={{ color: 'var(--danger)' }}>*</span>
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
                        fontSize: '0.95rem',
                        transition: 'all var(--transition-fast)'
                      }}
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label 
                      className="form-label" 
                      style={{ 
                        fontWeight: '600', 
                        color: 'var(--text-primary)', 
                        fontSize: '0.875rem',
                        marginBottom: 'var(--spacing-xs)'
                      }}
                    >
                      <i className="bi bi-person-badge me-1"></i>
                      Nombre Completo <span style={{ color: 'var(--danger)' }}>*</span>
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
                        fontSize: '0.95rem',
                        transition: 'all var(--transition-fast)'
                      }}
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label 
                      className="form-label" 
                      style={{ 
                        fontWeight: '600', 
                        color: 'var(--text-primary)', 
                        fontSize: '0.875rem',
                        marginBottom: 'var(--spacing-xs)'
                      }}
                    >
                      <i className="bi bi-geo-alt me-1"></i>
                      País <span style={{ color: 'var(--danger)' }}>*</span>
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
                        fontSize: '0.95rem',
                        transition: 'all var(--transition-fast)'
                      }}
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label 
                      className="form-label" 
                      style={{ 
                        fontWeight: '600', 
                        color: 'var(--text-primary)', 
                        fontSize: '0.875rem',
                        marginBottom: 'var(--spacing-xs)'
                      }}
                    >
                      <i className="bi bi-currency-exchange me-1"></i>
                      Moneda Favorita <span style={{ color: 'var(--danger)' }}>*</span>
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
                        transition: 'all var(--transition-fast)'
                      }}
                      name="preferredCurrency"
                      value={form.preferredCurrency}
                      onChange={handleChange}
                      required
                    >
                      {CURRENCIES.map(curr => (
                        <option key={curr.code} value={curr.code}>
                          {curr.symbol} - {curr.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button 
                    type="submit" 
                    className="btn w-100"
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
                      marginBottom: 'var(--spacing-sm)'
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
                    <i className="bi bi-check-circle me-2"></i>
                    Guardar Cambios
                  </button>
                  <button 
                    type="button" 
                    className="btn w-100"
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--text-secondary)',
                      border: 'none',
                      padding: 'var(--spacing-sm) var(--spacing-lg)',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                    onClick={() => {
                      setEdit(false);
                      setForm({
                        username: profile.username,
                        fullName: profile.fullName,
                        country: profile.country
                      });
                    }}
                  >
                    Cancelar
                  </button>
                </form>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}