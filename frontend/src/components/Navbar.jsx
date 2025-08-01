import { Link, useNavigate } from 'react-router-dom';
import { useCurrency } from '../hooks/useCurrency';

export default function Navbar({ onAuthChange }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');           // Obtiene el token JWT del usuario
  const isAuth = !!token;                                // Determina si el usuario está autenticado
  const { currency, setCurrency, CURRENCIES } = useCurrency(); // Hook para manejar la moneda seleccionada

  // --- Cerrar sesión ---
  const handleLogout = () => {
    localStorage.removeItem('token');                    // Elimina el token del almacenamiento local
    if (onAuthChange) onAuthChange(); // Notifica a App que cambió el auth
    navigate('/login', { replace: true });              // Redirige al login
  };

  // --- Render principal ---
  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark navbar-large"
      style={{ backgroundColor: 'rgb(31, 40, 165)' }}
    >
      <div className="container">
        {/* Logo/Navegación principal: va al dashboard si está autenticado, sino a la landing */}
        <Link className="navbar-brand fw-bold" to={isAuth ? '/dashboard' : '/'}>
          Mi Finanzas
        </Link>

        <div className="navbar-nav ms-auto d-flex align-items-center">
          {/* Selector de moneda solo si está autenticado */}
          {isAuth && (
            <select
              className="form-select me-3"
              style={{ width: 120 }}
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              title="Seleccionar moneda"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.label}
                </option>
              ))}
            </select>
          )}
          {/* Botones según autenticación */}
          {isAuth ? (
            <>
              <button
                className="btn btn-outline-light me-2"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link className="nav-link" to="/login">Login</Link>
              <Link className="nav-link" to="/register">Registro</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}



