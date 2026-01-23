import { useEffect, useState } from 'react';

export default function GroupSummary({ groupId, refresh }) {
  // --- Estado principal ---
  const [summary, setSummary] = useState([]); // Lista de saldos por miembro

  // --- Cargar resumen al montar o cuando cambian groupId/refresh ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    // Llama al backend para obtener el resumen de saldos del grupo
    fetch(`/api/groups/${groupId}/summary`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setSummary);
  }, [groupId, refresh]);

  // --- Render principal ---
  return (
    <div 
      className="card"
      style={{
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 'var(--spacing-xl)'
      }}
    >
      <div 
        className="card-header"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-light)',
          padding: 'var(--spacing-lg)'
        }}
      >
        <h5 
          style={{ 
            marginBottom: 0,
            fontWeight: '600',
            color: 'var(--text-primary)',
            fontSize: '1.1rem'
          }}
        >
          <i className="bi bi-graph-up-arrow me-2" style={{ color: 'var(--primary)' }}></i>
          Resumen de Saldos
          {summary.length > 0 && (
            <span 
              className="badge ms-2"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'white',
                fontSize: '0.85rem',
                fontWeight: '500',
                padding: '0.35em 0.65em'
              }}
            >
              {summary.filter(s => s.id).length}
            </span>
          )}
        </h5>
      </div>
      
      <div className="card-body" style={{ padding: '0' }}>
        {/* Si no hay datos, muestra mensaje con diseño */}
        {summary.length === 0 || summary.filter(s => s.id).length === 0 ? (
          <div 
            style={{ 
              padding: 'var(--spacing-xxl)',
              textAlign: 'center',
              backgroundColor: 'var(--info-light)',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            <i 
              className="bi bi-calculator" 
              style={{ 
                fontSize: '3rem', 
                color: 'var(--info)',
                marginBottom: 'var(--spacing-md)',
                display: 'block'
              }}
            ></i>
            <p 
              style={{ 
                color: 'var(--text-secondary)', 
                marginBottom: 0,
                fontSize: '0.95rem'
              }}
            >
              No hay datos de saldos disponibles
            </p>
          </div>
        ) : (
          // Muestra el saldo de cada miembro con colores según el estado
          <ul className="list-group list-group-flush">
            {summary.filter(s => s.id).map(s => {
              // Determinar el estado del saldo
              const isPositive = s.saldo > 0;
              const isNegative = s.saldo < 0;
              const isZero = s.saldo === 0;
              
              // Configuración visual según el estado
              const config = isPositive 
                ? {
                    icon: 'bi-arrow-down-circle-fill',
                    iconColor: 'var(--success)',
                    badgeColor: 'var(--success-light)',
                    badgeBorder: 'var(--success)',
                    text: `A cobrar $${s.saldo.toFixed(2)}`,
                    textColor: 'var(--success)'
                  }
                : isNegative
                ? {
                    icon: 'bi-arrow-up-circle-fill',
                    iconColor: 'var(--danger)',
                    badgeColor: 'var(--danger-light)',
                    badgeBorder: 'var(--danger)',
                    text: `Debe $${(-s.saldo).toFixed(2)}`,
                    textColor: 'var(--danger)'
                  }
                : {
                    icon: 'bi-check-circle-fill',
                    iconColor: 'var(--text-secondary)',
                    badgeColor: 'var(--bg-secondary)',
                    badgeBorder: 'var(--border-light)',
                    text: 'Saldo $0',
                    textColor: 'var(--text-secondary)'
                  };
              
              return (
                <li 
                  key={`summary-${s.id}`} 
                  className="list-group-item"
                  style={{
                    border: 'none',
                    borderBottom: '1px solid var(--border-light)',
                    padding: 'var(--spacing-lg)',
                    transition: 'all var(--transition-fast)',
                    cursor: 'default'
                  }}
                  onMouseEnter={(el) => {
                    el.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                  }}
                  onMouseLeave={(el) => {
                    el.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <i 
                        className="bi bi-person-circle me-3" 
                        style={{ 
                          fontSize: '1.5rem', 
                          color: 'var(--primary)' 
                        }}
                      ></i>
                      <div>
                        <div 
                          style={{ 
                            fontWeight: '600', 
                            color: 'var(--text-primary)',
                            fontSize: '0.95rem',
                            marginBottom: '0.25rem'
                          }}
                        >
                          {s.name}
                        </div>
                        <div 
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.25rem 0.75rem',
                            backgroundColor: config.badgeColor,
                            border: `1px solid ${config.badgeBorder}`,
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.875rem'
                          }}
                        >
                          <i 
                            className={config.icon} 
                            style={{ color: config.iconColor }}
                          ></i>
                          <span style={{ fontWeight: '600', color: config.textColor }}>
                            {config.text}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}