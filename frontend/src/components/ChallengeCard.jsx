export default function ChallengeCard({ challenge, onAccept, userStatus }) {
  const getTypeColor = (type) => {
    switch (type) {
      case 'daily': return 'danger';
      case 'weekly': return 'warning';
      case 'monthly': return 'info';
      case 'permanent': return 'primary';
      default: return 'secondary';
    }
  };

  const getTypeName = (type) => {
    switch (type) {
      case 'daily': return 'Diario';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensual';
      case 'permanent': return 'Permanente';
      default: return type;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'daily': return 'bi-sun-fill';
      case 'weekly': return 'bi-calendar-week';
      case 'monthly': return 'bi-calendar-month';
      case 'permanent': return 'bi-infinity';
      default: return 'bi-flag';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge bg-success d-flex align-items-center"><i className="bi bi-lightning-fill me-1"></i>Activo</span>;
      case 'completed':
        return <span className="badge bg-primary d-flex align-items-center"><i className="bi bi-check-circle-fill me-1"></i>Completado</span>;
      case 'failed':
        return <span className="badge bg-danger d-flex align-items-center"><i className="bi bi-x-circle-fill me-1"></i>Fallido</span>;
      case 'expired':
        return <span className="badge bg-secondary d-flex align-items-center"><i className="bi bi-clock-history me-1"></i>Expirado</span>;
      default:
        return <span className="badge bg-light text-dark d-flex align-items-center"><i className="bi bi-circle me-1"></i>Disponible</span>;
    }
  };

  const progress = challenge.user_progress || challenge.current_progress || 0;
  const target = challenge.target_value;
  const progressPercentage = (progress / target) * 100;
  const status = userStatus || challenge.user_status || challenge.status;
  const isAvailable = status === 'available' || !status;
  const isActive = status === 'active';
  const isCompleted = status === 'completed';
  const typeColor = getTypeColor(challenge.type);

  return (
    <div 
      className={`card border-light shadow-sm h-100 ${isCompleted ? 'border-success' : ''}`}
      style={{ 
        borderRadius: 'var(--border-radius-lg)',
        transition: 'all 0.3s ease',
        cursor: 'default',
        borderWidth: isCompleted ? '2px' : '1px'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = 'var(--box-shadow-md)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <div className={`card-header bg-${typeColor} bg-opacity-10 border-0 d-flex align-items-center justify-content-between`} style={{ borderRadius: 'var(--border-radius-lg) var(--border-radius-lg) 0 0', padding: '0.75rem 1rem' }}>
        <div className="d-flex align-items-center">
          <i className={`bi ${getTypeIcon(challenge.type)} text-${typeColor} me-2`}></i>
          <span className={`badge bg-${typeColor} bg-opacity-25 text-${typeColor}`} style={{ fontSize: '0.75rem' }}>
            {getTypeName(challenge.type)}
          </span>
        </div>
        {getStatusBadge(status)}
      </div>
      
      <div className="card-body d-flex flex-column">
        <h6 className="fw-bold mb-2" style={{ fontSize: '0.95rem', minHeight: '40px', display: 'flex', alignItems: 'center' }}>
          <i className={`bi bi-flag-fill text-${typeColor} me-2`}></i>
          {challenge.name}
        </h6>
        
        <p className="text-muted small mb-3 flex-grow-1" style={{ fontSize: '0.8rem' }}>
          {challenge.description}
        </p>
        
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <small className="text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>
              <i className="bi bi-graph-up me-1"></i>
              Progreso
            </small>
            <small className="fw-bold text-dark" style={{ fontSize: '0.8rem' }}>
              {progress} / {target}
            </small>
          </div>
          <div className="progress" style={{ height: '10px', borderRadius: 'var(--border-radius-md)', backgroundColor: '#e9ecef' }}>
            <div 
              className={`progress-bar ${isCompleted ? 'bg-success' : `bg-${typeColor}`}`}
              role="progressbar" 
              style={{ 
                width: `${Math.min(progressPercentage, 100)}%`,
                transition: 'width 0.6s ease'
              }}
              aria-valuenow={progressPercentage} 
              aria-valuemin="0" 
              aria-valuemax="100"
            ></div>
          </div>
          {(isActive || isAvailable) && progressPercentage > 0 && (
            <small className="text-muted mt-1 d-block" style={{ fontSize: '0.7rem' }}>
              {progressPercentage.toFixed(1)}% completado
            </small>
          )}
        </div>
        
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center">
            <span className="badge bg-primary d-flex align-items-center" style={{ fontSize: '0.85rem', padding: '0.4rem 0.7rem', borderRadius: 'var(--border-radius-md)' }}>
              <i className="bi bi-lightning-charge-fill me-1"></i>
              {challenge.reward_points} XP
            </span>
            
            {isAvailable && onAccept && (
              <button 
                className="btn btn-sm btn-success d-flex align-items-center"
                style={{ 
                  borderRadius: 'var(--border-radius-md)',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => onAccept(challenge.id)}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(25, 135, 84, 0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <i className="bi bi-play-fill me-1"></i>
                Aceptar
              </button>
            )}
            
            {isActive && (
              <span className="text-success small d-flex align-items-center fw-semibold" style={{ fontSize: '0.8rem' }}>
                <i className="bi bi-lightning-fill me-1"></i>
                En progreso
              </span>
            )}
            
            {isCompleted && (
              <span className="text-success small d-flex align-items-center fw-semibold" style={{ fontSize: '0.8rem' }}>
                <i className="bi bi-check-circle-fill me-1"></i>
                Completado
              </span>
            )}
          </div>
        </div>
        
        {challenge.end_date && (
          <div className="mt-3 pt-3 border-top">
            <div className="p-2 bg-light rounded-3 text-center">
              <i className={`bi bi-calendar-event-fill text-${typeColor} me-2`}></i>
              <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                Vence: <span className="fw-semibold text-dark">{new Date(challenge.end_date).toLocaleDateString('es-AR')}</span>
              </small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
