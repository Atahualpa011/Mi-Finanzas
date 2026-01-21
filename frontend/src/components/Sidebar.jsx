import { Link, useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

// --- Componente Sidebar: menú lateral de navegación ---
export default function Sidebar({ expanded, setExpanded }) {
  const navigate = useNavigate();
  const location = useLocation();

  // --- Cierra sesión y redirige al login ---
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  // --- Menú de navegación: rutas, íconos y etiquetas ---
  const menu = [
    { to: '/dashboard', icon: 'bi-house-door', label: 'Dashboard' },
    { to: '/add-transaction', icon: 'bi-plus-circle', label: 'Agregar transacción' },
    { to: '/profile', icon: 'bi-person', label: 'Mi Perfil' },
    { to: '/movements', icon: 'bi-list-ul', label: 'Mis movimientos' },
    { to: '/budgets', icon: 'bi-wallet2', label: 'Presupuestos' },
    { to: '/friends', icon: 'bi-people', label: 'Amigos' },
    { to: '/groups', icon: 'bi-collection', label: 'Grupos' },
    { to: '/emotional-analysis', icon: 'bi-bar-chart', label: 'Análisis emocional' },
  ];

  // --- Render principal ---
  return (
    <div
      className="sidebar d-flex flex-column flex-shrink-0 text-bg-dark"
      style={{
        width: expanded ? 220 : 60,
        minHeight: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1040,
        background: 'linear-gradient(180deg, #1f28a5 60%, #4b52b4 100%)',
        transition: 'width 0.3s cubic-bezier(.4,0,.2,1)'
      }}
    >
      {/* Botón para expandir/comprimir el menú */}
      <button
        className="btn btn-sm btn-light mb-3 mx-auto"
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          marginTop: 12,
          transition: 'transform 0.2s'
        }}
        onClick={() => setExpanded(e => !e)}
        aria-label={expanded ? 'Comprimir menú' : 'Expandir menú'}
      >
        {expanded
          ? <span className="bi bi-chevron-left"></span>
          : <span className="bi bi-chevron-right"></span>
        }
      </button>
      {/* Nombre de la app */}
      <span className={`fs-4 fw-bold mb-4 text-center`}>
        {expanded ? 'Mi Finanzas' : <span className="bi bi-currency-dollar"></span>}
      </span>
      {/* Lista de enlaces de navegación */}
      <ul className="nav nav-pills flex-column mb-auto">
        {menu.map(item => (
          <li className="nav-item" key={item.to}>
            <Link
              to={item.to}
              className={`nav-link d-flex align-items-center ${location.pathname.startsWith(item.to) ? 'active' : 'text-white'}`}
              title={item.label}
            >
              <span className={`me-2 bi ${item.icon}`}></span>
              {expanded && item.label}
            </Link>
          </li>
        ))}
        {/* Botón para cerrar sesión */}
        <li>
          <button
            className="nav-link text-white mt-3 d-flex align-items-center"
            style={{ background: 'none', border: 'none', textAlign: 'left' }}
            onClick={handleLogout}
            title="Cerrar sesión"
          >
            <span className="me-2 bi bi-box-arrow-right"></span>
            {expanded && 'Cerrar sesión'}
          </button>
        </li>
      </ul>
    </div>
  );
}