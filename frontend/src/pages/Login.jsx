import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ onAuthChange }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState(null);
  const navigate                = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        // El backend responde con status 401 y { error: 'Credenciales inválidas' }
        throw new Error(data.error || 'Error desconocido');
      }

      // 1) Guardar el token
      localStorage.setItem('token', data.token);

      if (onAuthChange) onAuthChange(); // Notifica a App que cambió el auth

      // 2) Redirigir al dashboard (pantalla principal)
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="card shadow-sm" style={{ maxWidth: 400, width: '100%', margin: '0 16px' }}>
          <div className="card-body p-4">
            <h2 className="card-title text-center mb-4">Iniciar Sesión</h2>
            {error && (
              <div className="alert alert-danger mb-3">
                {error}
              </div>
            )}
            <form onSubmit={handleLogin}>
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
              <div className="mb-3">
                <label className="form-label">Contraseña:</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  required
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary w-100 mt-2">
                Ingresar
              </button>
            </form>
          </div>
        </div>
      </div>
  );
}
