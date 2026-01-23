export default function StreakDisplay({ streak }) {
  if (!streak) {
    return (
      <div className="card border-light shadow-sm" style={{ borderRadius: 'var(--border-radius-lg)' }}>
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  const getStreakColor = (days) => {
    if (days >= 30) return 'danger';
    if (days >= 14) return 'warning';
    if (days >= 7) return 'info';
    if (days >= 3) return 'primary';
    return 'secondary';
  };

  const getStreakIcon = (days) => {
    if (days >= 30) return 'bi-fire';
    if (days >= 7) return 'bi-lightning-fill';
    if (days >= 3) return 'bi-flame';
    return 'bi-star';
  };

  const getStreakMessage = (days) => {
    if (days === 0) return 'Registra una transacción hoy para comenzar tu racha';
    if (days === 1) return '¡Primer día! Sigue así';
    if (days >= 30) return '¡Racha imparable! Eres una leyenda';
    if (days >= 14) return '¡Excelente consistencia!';
    if (days >= 7) return '¡Una semana completa!';
    if (days >= 3) return '¡Buen comienzo!';
    return 'Continúa registrando transacciones';
  };

  const streakColor = getStreakColor(streak.current_streak);
  const streakIcon = getStreakIcon(streak.current_streak);

  return (
    <div className="card border-light shadow-sm h-100" style={{ borderRadius: 'var(--border-radius-lg)' }}>
      <div className={`card-header bg-${streakColor} bg-opacity-10 border-0 d-flex align-items-center`} style={{ borderRadius: 'var(--border-radius-lg) var(--border-radius-lg) 0 0' }}>
        <i className={`bi ${streakIcon} fs-5 text-${streakColor} me-2`}></i>
        <span className={`fw-semibold text-${streakColor}`}>Racha de Actividad</span>
      </div>
      <div className="card-body text-center">
        <div className="mb-4">
          <div 
            className={`d-inline-flex align-items-center justify-content-center rounded-circle bg-${streakColor} bg-opacity-10`}
            style={{ width: '100px', height: '100px' }}
          >
            <i className={`bi ${streakIcon} text-${streakColor}`} style={{ fontSize: '3.5rem' }}></i>
          </div>
        </div>
        
        <h2 className={`mb-2 text-${streakColor} fw-bold`} style={{ fontSize: '2.5rem' }}>
          {streak.current_streak}
        </h2>
        
        <p className="text-muted mb-1 fw-semibold">
          {streak.current_streak === 1 ? 'día consecutivo' : 'días consecutivos'}
        </p>
        
        <div className={`alert alert-${streakColor} alert-dismissible fade show mt-3 mb-3`} role="alert" style={{ borderRadius: 'var(--border-radius-md)', border: 'none', backgroundColor: `var(--bs-${streakColor}-bg-subtle)` }}>
          <i className={`bi bi-chat-dots-fill me-2`}></i>
          <small className="fw-semibold">{getStreakMessage(streak.current_streak)}</small>
        </div>
        
        {streak.longest_streak > 0 && (
          <div className="mt-4 pt-3 border-top">
            <div className="row g-3">
              <div className="col-6">
                <div className="p-3 bg-light rounded-3">
                  <i className="bi bi-trophy-fill text-warning fs-4 mb-2 d-block"></i>
                  <div className="fw-bold text-dark" style={{ fontSize: '1.3rem' }}>{streak.longest_streak}</div>
                  <small className="text-muted">Récord personal</small>
                </div>
              </div>
              
              <div className="col-6">
                <div className="p-3 bg-light rounded-3">
                  <i className="bi bi-calendar-check text-success fs-4 mb-2 d-block"></i>
                  <div className="fw-bold text-dark" style={{ fontSize: '1.1rem' }}>
                    {streak.last_transaction_date 
                      ? new Date(streak.last_transaction_date).toLocaleDateString('es-AR', { 
                          day: 'numeric', 
                          month: 'short' 
                        })
                      : 'N/A'
                    }
                  </div>
                  <small className="text-muted">Última transacción</small>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {streak.current_streak >= 7 && (
          <div className="mt-3">
            <span className="badge bg-success" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', borderRadius: 'var(--border-radius-md)' }}>
              <i className="bi bi-check-circle-fill me-2"></i>
              ¡Semana completa!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
