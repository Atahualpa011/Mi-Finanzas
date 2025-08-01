import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register({ onAuthChange }) {
  // --- Estados principales para los campos del formulario ---
  const [email, setEmail]         = useState('');      // Email del usuario
  const [password, setPassword]   = useState('');      // Contraseña
  const [username, setUsername]   = useState('');      // Nombre de usuario
  const [fullName, setFullName]   = useState('');      // Nombre completo
  const [country, setCountry]     = useState('');      // País
  const [error, setError]         = useState(null);    // Mensaje de error
  const [message, setMessage]     = useState(null);    // Mensaje de éxito
  const navigate                  = useNavigate();     // Para redireccionar tras registro

  // --- Maneja el envío del formulario de registro ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null); setMessage(null);

    try {
      // Llama al backend para registrar el usuario
      const res = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          username,
          fullName,
          country
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error en registro');

      // Si el registro fue exitoso, muestra mensaje y redirige al login
      setMessage('¡Registro exitoso! Redirigiendo al login…');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  // --- Render principal ---
  return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="card shadow-sm" style={{ maxWidth: 400, width: '100%', margin: '24px' }}>
          <div className="card-body p-4">
            <h2 className="card-title text-center mb-4">Registro</h2>
            {/* Muestra mensaje de error si pasa */}
            {error && <div className="alert alert-danger mb-3">{error}</div>}
            {/* Muestra mensaje de éxito si pasa */}
            {message && <div className="alert alert-success mb-3">{message}</div>}
            {/* Formulario de registro */}
            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label className="form-label">Nombre de Usuario:</label>
                <input
                  type="text"
                  className="form-control"
                  value={username}
                  required
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Nombre completo:</label>
                <input
                  type="text"
                  className="form-control"
                  value={fullName}
                  required
                  onChange={e => setFullName(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">País:</label>
                <input
                  type="text"
                  className="form-control"
                  value={country}
                  required
                  onChange={e => setCountry(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email:</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  required
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="form-label">Contraseña:</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  required
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-success w-100 mt-2">
                Registrarse
              </button>
            </form>
          </div>
        </div>
      </div>
  );
}
