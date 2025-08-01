import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  // --- Estados principales ---
  const [profile, setProfile] = useState(null);      // Datos del perfil del usuario
  const [edit, setEdit] = useState(false);           // Si está en modo edición
  const [form, setForm] = useState({});              // Datos del formulario de edición
  const [error, setError] = useState(null);          // Mensaje de error
  const [message, setMessage] = useState(null);      // Mensaje de éxito
  const navigate = useNavigate();                    // Para redireccionar

  // --- Cargar perfil al montar el componente ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:3001/api/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setProfile(data); // Guarda los datos del perfil
        setForm({
          username: data.username,
          fullName: data.fullName,
          country: data.country
        }); // Inicializa el formulario con los datos actuales
      });
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
  if (!profile) return <div className="text-center mt-5">Cargando perfil…</div>;

  // --- Render principal ---
  return (
    <>
        <div className="d-flex justify-content-center">
          <div className="card shadow-sm" style={{ maxWidth: 500, width: '100%' }}>
            <div className="card-body">
              <h2 className="mb-4 text-center">Mi Perfil</h2>
              {error && <div className="alert alert-danger">{error}</div>}
              {message && <div className="alert alert-success">{message}</div>}
              {/* Si no está en modo edición, muestra los datos */}
              {!edit ? (
                <>
                  <div className="mb-3"><b>Email:</b> {profile.email}</div>
                  <div className="mb-3"><b>Usuario:</b> {profile.username}</div>
                  <div className="mb-3"><b>Nombre completo:</b> {profile.fullName}</div>
                  <div className="mb-3"><b>País:</b> {profile.country}</div>
                  <button className="btn btn-primary w-100" onClick={() => setEdit(true)}>
                    Editar datos
                  </button>
                </>
              ) : (
                // Si está en modo edición, muestra el formulario
                <form onSubmit={handleSave}>
                  <div className="mb-3">
                    <label className="form-label">Usuario</label>
                    <input
                      type="text"
                      className="form-control"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Nombre completo</label>
                    <input
                      type="text"
                      className="form-control"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">País</label>
                    <input
                      type="text"
                      className="form-control"
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-success w-100">
                    Guardar cambios
                  </button>
                  <button type="button" className="btn btn-link w-100 mt-2" onClick={() => setEdit(false)}>
                    Cancelar
                  </button>
                </form>
              )}
              {/* Botón para eliminar cuenta (solo si no está editando) */}
              {!edit && (
                <button
                  className="btn btn-outline-danger w-100 mt-3"
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
                      alert(e.message);
                    }
                  }}
                >
                  Eliminar cuenta
                </button>
              )}
            </div>
          </div>
        </div>
    </>
  );
}