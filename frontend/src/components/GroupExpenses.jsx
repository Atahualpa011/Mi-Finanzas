import { useEffect, useState } from 'react';

export default function GroupExpenses({ groupId, refresh }) {
  // --- Estado principal ---
  const [expenses, setExpenses] = useState([]); // Lista de gastos del grupo

  // --- Helpers de formato ---
  const formatDate = (value) => {
    if (!value) return '-';

    const datePart = String(value).split('T')[0];
    const [year, month, day] = datePart.split('-');

    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleDateString('es-AR');
  };

  const formatTime = (value) => {
    if (!value) return '';
    return String(value).slice(0, 5);
  };

  // --- Cargar gastos del grupo al montar o cuando cambian groupId/refresh ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    // Llama al backend para obtener los gastos del grupo
    fetch(`/api/groups/${groupId}/expenses`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setExpenses);
  }, [groupId, refresh]); // Se actualiza si cambia el grupo o se fuerza refresh

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
          <i className="bi bi-receipt-cutoff me-2" style={{ color: 'var(--primary)' }}></i>
          Gastos del Grupo
          {expenses.length > 0 && (
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
              {expenses.filter(e => e.id).length}
            </span>
          )}
        </h5>
      </div>
      
      <div className="card-body" style={{ padding: '0' }}>
        {/* Si no hay gastos, muestra mensaje con diseño */}
        {expenses.length === 0 || expenses.filter(e => e.id).length === 0 ? (
          <div 
            style={{ 
              padding: 'var(--spacing-xxl)',
              textAlign: 'center',
              backgroundColor: 'var(--info-light)',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            <i 
              className="bi bi-inbox" 
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
              No hay gastos registrados en este grupo
            </p>
          </div>
        ) : (
          // Muestra lista de gastos con diseño mejorado
          <ul className="list-group list-group-flush">
            {expenses.filter(e => e.id).map(e => (
              <li 
                key={e.id} 
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div 
                      style={{ 
                        fontWeight: '600', 
                        color: 'var(--text-primary)',
                        fontSize: '0.95rem',
                        marginBottom: 'var(--spacing-xs)'
                      }}
                    >
                      <i className="bi bi-receipt me-2" style={{ color: 'var(--primary)' }}></i>
                      {e.description}
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
                      <small 
                        style={{ 
                          color: 'var(--text-secondary)',
                          fontSize: '0.875rem'
                        }}
                      >
                        <i className="bi bi-person-check me-1" style={{ color: 'var(--success)' }}></i>
                        Pagado por: <strong>{e.pagado_por}</strong>
                      </small>
                      <small 
                        style={{ 
                          color: 'var(--text-secondary)',
                          fontSize: '0.875rem'
                        }}
                      >
                        <i className="bi bi-calendar3 me-1" style={{ color: 'var(--info)' }}></i>
                        {formatDate(e.date)} {formatTime(e.time)}
                      </small>
                    </div>
                  </div>
                  <div 
                    style={{ 
                      fontWeight: '700',
                      color: 'var(--danger)',
                      fontSize: '1.1rem',
                      marginLeft: 'var(--spacing-md)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    ${parseFloat(e.amount).toFixed(2)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
