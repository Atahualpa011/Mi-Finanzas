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
    { to: '/add-transaction', icon: 'bi-plus-circle', label: 'Nueva transacción' },
    { to: '/movements', icon: 'bi-list-ul', label: 'Movimientos' },
    { to: '/budgets', icon: 'bi-wallet2', label: 'Presupuestos' },
    { to: '/investments', icon: 'bi-graph-up-arrow', label: 'Inversiones' },
    { to: '/gamification', icon: 'bi-trophy', label: 'Gamificación' },
    { to: '/friends', icon: 'bi-people', label: 'Amigos' },
    { to: '/groups', icon: 'bi-collection', label: 'Grupos' },
    { to: '/emotional-analysis', icon: 'bi-bar-chart', label: 'Análisis' },
    { to: '/insights', icon: 'bi-lightbulb', label: 'Insights' },
    { to: '/profile', icon: 'bi-person', label: 'Perfil' },
  ];

  // --- Render principal ---
  return (
    <div
      className="sidebar d-flex flex-column"
      style={{
        width: expanded ? 'var(--sidebar-width)' : 'var(--sidebar-collapsed-width)',
        minHeight: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1040,
        background: 'var(--sidebar-bg)',
        transition: 'width var(--transition-base)',
        boxShadow: 'var(--shadow-lg)'
      }}
    >
      {/* Header del sidebar */}
      <div className="p-3 border-bottom border-white border-opacity-10">
        <div className="d-flex align-items-center justify-content-between">
          {/* Logo/nombre de la app */}
          <div className="d-flex align-items-center" style={{ minHeight: '40px' }}>
            {expanded ? (
              <div>
                <h5 className="mb-0 text-white fw-bold">AppFinanzas</h5>
                <small className="text-white text-opacity-75" style={{ fontSize: '0.75rem' }}>Gestión personal</small>
              </div>
            ) : (
              <span className="bi bi-currency-dollar text-white fs-4"></span>
            )}
          </div>
          
          {/* Botón para expandir/comprimir */}
          <button
            className="btn btn-sm p-0 text-white border-0"
            style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--radius-md)',
              transition: 'all var(--transition-fast)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }}
            onClick={() => setExpanded(e => !e)}
            aria-label={expanded ? 'Comprimir menú' : 'Expandir menú'}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          >
            <i className={`bi ${expanded ? 'bi-chevron-left' : 'bi-chevron-right'}`}></i>
          </button>
        </div>
      </div>

      {/* Lista de navegación */}
      <nav className="flex-grow-1 overflow-auto py-3">
        <ul className="nav flex-column px-2" style={{ listStyle: 'none' }}>
          {menu.map(item => {
            const isActive = location.pathname === item.to || 
                           (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
            
            return (
              <li key={item.to} className="mb-1">
                <Link
                  to={item.to}
                  className="nav-link d-flex align-items-center position-relative text-decoration-none"
                  style={{
                    padding: '0.65rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    color: isActive ? 'white' : 'rgba(255, 255, 255, 0.8)',
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                    fontWeight: isActive ? '600' : '500',
                    fontSize: '0.875rem',
                    transition: 'all var(--transition-fast)',
                    overflow: 'hidden'
                  }}
                  title={!expanded ? item.label : ''}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.color = 'white';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                    }
                  }}
                >
                  {/* Indicador de página activa */}
                  {isActive && (
                    <div 
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '3px',
                        height: '20px',
                        backgroundColor: 'white',
                        borderRadius: '0 2px 2px 0'
                      }}
                    />
                  )}
                  
                  {/* Icono */}
                  <i 
                    className={`bi ${item.icon}`}
                    style={{ 
                      fontSize: '1.1rem',
                      minWidth: '24px',
                      textAlign: 'center'
                    }}
                  ></i>
                  
                  {/* Label (solo si está expandido) */}
                  {expanded && (
                    <span className="ms-3" style={{ whiteSpace: 'nowrap' }}>
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer con botón de cerrar sesión */}
      <div className="border-top border-white border-opacity-10 p-2">
        <button
          className="btn w-100 d-flex align-items-center text-white border-0"
          style={{
            padding: '0.65rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'transparent',
            fontWeight: '500',
            fontSize: '0.875rem',
            transition: 'all var(--transition-fast)'
          }}
          onClick={handleLogout}
          title={!expanded ? 'Cerrar sesión' : ''}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <i 
            className="bi bi-box-arrow-right" 
            style={{ 
              fontSize: '1.1rem',
              minWidth: '24px',
              textAlign: 'center'
            }}
          ></i>
          {expanded && <span className="ms-3">Cerrar sesión</span>}
        </button>
      </div>
    </div>
  );
}