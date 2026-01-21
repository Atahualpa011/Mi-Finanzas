export default function StreakDisplay({ streak }) {
  if (!streak) {
    return (
      <div className="card mb-4">
        <div className="card-body text-center">
          <div className="spinner-border spinner-border-sm"></div>
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

  return (
    <div className="card mb-4 border-0 shadow-sm">
      <div className={`card-body text-center bg-${getStreakColor(streak.current_streak)} bg-opacity-10`}>
        <div className="mb-3">
          <i className={`bi ${getStreakIcon(streak.current_streak)} text-${getStreakColor(streak.current_streak)} display-3`}></i>
        </div>
        
        <h3 className={`mb-2 text-${getStreakColor(streak.current_streak)} fw-bold`}>
          {streak.current_streak} {streak.current_streak === 1 ? 'día' : 'días'}
        </h3>
        
        <p className="text-muted mb-0">Racha actual</p>
        
        <p className="small text-muted mt-2 mb-3">
          {getStreakMessage(streak.current_streak)}
        </p>
        
        {streak.longest_streak > 0 && (
          <div className="mt-3 pt-3 border-top">
            <div className="row text-center">
              <div className="col-6">
                <div className="text-muted small">Récord personal</div>
                <div className="fw-bold fs-5 text-primary">
                  <i className="bi bi-trophy me-1"></i>
                  {streak.longest_streak}
                </div>
              </div>
              
              <div className="col-6">
                <div className="text-muted small">Última transacción</div>
                <div className="fw-bold fs-6">
                  {streak.last_transaction_date 
                    ? new Date(streak.last_transaction_date).toLocaleDateString('es-AR', { 
                        day: 'numeric', 
                        month: 'short' 
                      })
                    : 'N/A'
                  }
                </div>
              </div>
            </div>
          </div>
        )}
        
        {streak.current_streak >= 7 && (
          <div className="mt-3">
            <span className="badge bg-success">
              <i className="bi bi-check-circle me-1"></i>
              ¡Semana completa!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
