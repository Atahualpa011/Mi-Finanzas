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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge bg-success">Activo</span>;
      case 'completed':
        return <span className="badge bg-primary"><i className="bi bi-check-circle me-1"></i>Completado</span>;
      case 'failed':
        return <span className="badge bg-danger">Fallido</span>;
      case 'expired':
        return <span className="badge bg-secondary">Expirado</span>;
      default:
        return <span className="badge bg-light text-dark">Disponible</span>;
    }
  };

  const progress = challenge.user_progress || challenge.current_progress || 0;
  const target = challenge.target_value;
  const progressPercentage = (progress / target) * 100;
  const status = userStatus || challenge.user_status || challenge.status;
  const isAvailable = status === 'available' || !status;
  const isActive = status === 'active';
  const isCompleted = status === 'completed';

  return (
    <div className={`card h-100 ${isCompleted ? 'border-success' : ''}`}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="flex-grow-1">
            <h6 className="mb-1 fw-bold">{challenge.name}</h6>
            <span className={`badge bg-${getTypeColor(challenge.type)} bg-opacity-75`}>
              {getTypeName(challenge.type)}
            </span>
          </div>
          {getStatusBadge(status)}
        </div>
        
        <p className="text-muted small mb-3">{challenge.description}</p>
        
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <small className="text-muted">Progreso</small>
            <small className="fw-bold">{progress} / {target}</small>
          </div>
          <div className="progress" style={{ height: '8px' }}>
            <div 
              className={`progress-bar ${isCompleted ? 'bg-success' : 'bg-primary'}`}
              role="progressbar" 
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              aria-valuenow={progressPercentage} 
              aria-valuemin="0" 
              aria-valuemax="100"
            ></div>
          </div>
          {isActive && progressPercentage > 0 && (
            <small className="text-muted">{progressPercentage.toFixed(1)}% completado</small>
          )}
        </div>
        
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <span className="badge bg-primary">
              <i className="bi bi-star-fill me-1"></i>
              {challenge.reward_points} XP
            </span>
          </div>
          
          {isAvailable && onAccept && (
            <button 
              className="btn btn-sm btn-success"
              onClick={() => onAccept(challenge.id)}
            >
              <i className="bi bi-play-fill me-1"></i>
              Aceptar
            </button>
          )}
          
          {isActive && (
            <span className="text-success small">
              <i className="bi bi-lightning-fill me-1"></i>
              En progreso
            </span>
          )}
          
          {isCompleted && (
            <span className="text-success small">
              <i className="bi bi-check-circle-fill me-1"></i>
              Completado
            </span>
          )}
        </div>
        
        {challenge.end_date && (
          <div className="mt-3 pt-2 border-top">
            <small className="text-muted">
              <i className="bi bi-calendar-event me-1"></i>
              Vence: {new Date(challenge.end_date).toLocaleDateString('es-AR')}
            </small>
          </div>
        )}
      </div>
    </div>
  );
}
