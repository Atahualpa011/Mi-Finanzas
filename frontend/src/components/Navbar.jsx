import { Link, useNavigate } from 'react-router-dom';
import { useCurrency } from '../hooks/useCurrency';

export default function Navbar({ onAuthChange, sidebarExpanded }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isAuth = !!token;
  const { currency, setCurrency, CURRENCIES } = useCurrency();

  // --- Cerrar sesión ---
  const handleLogout = () => {
    localStorage.removeItem('token');
    if (onAuthChange) onAuthChange();
    navigate('/login', { replace: true });
  };

  // --- Render principal ---
  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{
        height: 'var(--navbar-height)',
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        position: 'fixed',
        top: 0,
        left: isAuth ? (sidebarExpanded ? 'var(--sidebar-width)' : 'var(--sidebar-collapsed-width)') : 0,
        right: 0,
        zIndex: 1030,
        transition: 'left var(--transition-base)'
      }}
    >
      <div className="container-fluid px-4">
        {/* Logo/Marca */}
        <Link 
          className="navbar-brand d-flex align-items-center" 
          to={isAuth ? '/dashboard' : '/'}
          style={{
            fontWeight: '700',
            fontSize: '1.25rem',
            color: 'var(--text-primary)',
            textDecoration: 'none',
            transition: 'color var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-primary)'}
        >
          <i className="bi bi-currency-dollar me-2" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}></i>
          <span>AppFinanzas</span>
        </Link>

        {/* Navegación derecha */}
        <div className="d-flex align-items-center gap-3">
          {/* Selector de moneda (solo autenticado) */}
          {isAuth && (
            <div 
              className="d-flex align-items-center gap-2"
              style={{
                padding: '0.25rem 0.75rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)'
              }}
            >
              <i 
                className="bi bi-cash-coin" 
                style={{ 
                  fontSize: '1.1rem',
                  color: 'var(--primary)' 
                }}
              ></i>
              <select
                className="form-select form-select-sm"
                style={{
                  width: '120px',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  padding: '0.375rem 0.5rem',
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  fontWeight: '500'
                }}
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                title="Seleccionar moneda"
                onFocus={(e) => {
                  e.target.style.outline = 'none';
                }}
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Autenticado: Botón de cerrar sesión */}
          {isAuth ? (
            <button
              className="btn btn-sm d-flex align-items-center"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-secondary)',
                borderRadius: 'var(--radius-md)',
                padding: '0.375rem 1rem',
                fontWeight: '500',
                fontSize: '0.875rem',
                transition: 'all var(--transition-fast)'
              }}
              onClick={handleLogout}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--danger-light)';
                e.currentTarget.style.borderColor = 'var(--danger)';
                e.currentTarget.style.color = 'var(--danger)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'var(--border-medium)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              <span>Cerrar sesión</span>
            </button>
          ) : (
            /* No autenticado: Links de Login y Registro */
            <div className="d-flex align-items-center gap-2">
              <Link 
                to="/login"
                className="btn btn-sm"
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  padding: '0.375rem 1rem',
                  textDecoration: 'none',
                  transition: 'color var(--transition-fast)'
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
              >
                Iniciar sesión
              </Link>
              <Link 
                to="/register"
                className="btn btn-sm"
                style={{
                  backgroundColor: 'var(--primary)',
                  border: 'none',
                  color: 'white',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  padding: '0.375rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
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
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}



