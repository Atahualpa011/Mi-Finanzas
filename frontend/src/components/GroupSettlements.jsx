import { useEffect, useState } from 'react';

export default function GroupSettlements({ groupId, refresh }) {
  // --- Estados principales ---
  const [settlements, setSettlements] = useState([]); // Sugerencias de pagos para saldar deudas
  const [error, setError] = useState(null);           // Mensaje de error

  // --- Cargar sugerencias de pagos al montar o cuando cambian groupId/refresh ---
  useEffect(() => {
    loadSettlements();
  }, [groupId, refresh]);

  // --- Recargar sugerencias de pagos ---
  const loadSettlements = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/groups/${groupId}/simplify`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setSettlements(data);
        setError(null); // Limpia error si la recarga fue exitosa
      } else {
        setError(data.error || 'Error al calcular sugerencias');
      }
    } catch {
      setError('Error al conectar con el servidor');
    }
  };

  // --- Registrar un pago (liquidación) entre miembros ---
  const handleSettle = async (from, to, amount, fromName, toName) => {
    // Confirma antes de registrar el pago
    if (!window.confirm(`¿Registrar que ${fromName} pagó $${Number(amount).toFixed(2)} a ${toName}?`)) return;
    const token = localStorage.getItem('token');
    try {
      // Llama al backend para registrar el pago
      const res = await fetch(`/api/groups/${groupId}/settlements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          from_member_id: from,
          to_member_id: to,
          amount,
          date: new Date().toISOString().slice(0, 10),
          time: new Date().toTimeString().slice(0, 8)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo registrar el pago');
      
      // Refresca la lista de sugerencias localmente
      await loadSettlements();
      
      // También notifica al componente padre para que actualice otros datos
      if (typeof refresh === 'function') refresh();
    } catch (err) {
      setError(err.message);
    }
  };

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
          <i className="bi bi-arrow-left-right me-2" style={{ color: 'var(--primary)' }}></i>
          Sugerencias de Liquidación
          {settlements.length > 0 && (
            <span 
              className="badge ms-2"
              style={{
                backgroundColor: 'var(--warning)',
                color: 'white',
                fontSize: '0.85rem',
                fontWeight: '500',
                padding: '0.35em 0.65em'
              }}
            >
              {settlements.length}
            </span>
          )}
        </h5>
      </div>
      
      <div className="card-body" style={{ padding: '0' }}>
        {error && (
          <div 
            className="alert alert-danger"
            style={{
              margin: 'var(--spacing-lg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--danger)',
              backgroundColor: 'var(--danger-light)'
            }}
            role="alert"
          >
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {/* Si no hay deudas pendientes, muestra mensaje con diseño */}
        {settlements.length === 0 ? (
          <div 
            style={{ 
              padding: 'var(--spacing-xxl)',
              textAlign: 'center',
              backgroundColor: 'var(--success-light)',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            <i 
              className="bi bi-check-circle-fill" 
              style={{ 
                fontSize: '3rem', 
                color: 'var(--success)',
                marginBottom: 'var(--spacing-md)',
                display: 'block'
              }}
            ></i>
            <p 
              style={{ 
                color: 'var(--text-secondary)', 
                marginBottom: 0,
                fontSize: '0.95rem',
                fontWeight: '500'
              }}
            >
              ¡Excelente! No hay deudas pendientes
            </p>
          </div>
        ) : (
          // Muestra lista de sugerencias de pago con diseño mejorado
          <ul className="list-group list-group-flush">
            {settlements.map((s, index) => (
              <li 
                key={s.id || index} 
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                      {/* Pagador */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                        <i className="bi bi-person-fill" style={{ color: 'var(--danger)', fontSize: '1.2rem' }}></i>
                        <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          {s.from_name}
                        </span>
                      </div>

                      {/* Flecha */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <i className="bi bi-arrow-right" style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}></i>
                        <div 
                          style={{
                            backgroundColor: 'var(--warning-light)',
                            border: '1px solid var(--warning)',
                            borderRadius: 'var(--radius-md)',
                            padding: '0.25rem 0.75rem',
                            fontWeight: '700',
                            color: 'var(--warning-dark)',
                            fontSize: '0.95rem'
                          }}
                        >
                          ${Number(s.amount).toFixed(2)}
                        </div>
                        <i className="bi bi-arrow-right" style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}></i>
                      </div>

                      {/* Receptor */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                        <i className="bi bi-person-fill" style={{ color: 'var(--success)', fontSize: '1.2rem' }}></i>
                        <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          {s.to_name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botón Saldar */}
                  <button
                    className="btn btn-sm"
                    style={{
                      backgroundColor: 'var(--success)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--spacing-xs) var(--spacing-lg)',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      whiteSpace: 'nowrap'
                    }}
                    onClick={() => handleSettle(s.from, s.to, s.amount, s.from_name, s.to_name)}
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
                    <i className="bi bi-check-circle me-1"></i>
                    Saldar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}