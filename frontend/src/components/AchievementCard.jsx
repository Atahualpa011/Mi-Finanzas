export default function AchievementCard({ achievement }) {
  const getIconClass = (icon) => {
    return icon || 'bi-award';
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'milestones': return 'primary';
      case 'streaks': return 'danger';
      case 'discipline': return 'success';
      case 'social': return 'info';
      case 'savings': return 'warning';
      default: return 'secondary';
    }
  };

  const getCategoryName = (category) => {
    switch (category) {
      case 'milestones': return 'Hitos';
      case 'streaks': return 'Rachas';
      case 'discipline': return 'Disciplina';
      case 'social': return 'Social';
      case 'savings': return 'Ahorro';
      default: return category;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const isUnlocked = achievement.unlocked || achievement.unlocked_at;

  return (
    <div className={`card h-100 ${!isUnlocked ? 'opacity-50' : ''}`}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center mb-2">
              <i 
                className={`bi ${getIconClass(achievement.icon)} fs-3 me-2 text-${getCategoryColor(achievement.category)}`}
              ></i>
              <div>
                <h6 className="mb-0 fw-bold">{achievement.name}</h6>
                <small className="text-muted">
                  <span className={`badge bg-${getCategoryColor(achievement.category)} bg-opacity-10 text-${getCategoryColor(achievement.category)}`}>
                    {getCategoryName(achievement.category)}
                  </span>
                </small>
              </div>
            </div>
          </div>
          
          {isUnlocked && (
            <i className="bi bi-check-circle-fill text-success fs-4"></i>
          )}
          
          {!isUnlocked && (
            <i className="bi bi-lock-fill text-secondary"></i>
          )}
        </div>
        
        <p className="text-muted small mb-2">{achievement.description}</p>
        
        <div className="d-flex justify-content-between align-items-center mt-3">
          <span className="badge bg-primary">
            <i className="bi bi-star-fill me-1"></i>
            {achievement.points} XP
          </span>
          
          {isUnlocked && achievement.unlocked_at && (
            <small className="text-muted">
              <i className="bi bi-calendar-check me-1"></i>
              {formatDate(achievement.unlocked_at)}
            </small>
          )}
          
          {!isUnlocked && achievement.target_value && (
            <small className="text-muted">
              Meta: {achievement.target_value}
            </small>
          )}
        </div>
        
        {achievement.progress !== undefined && achievement.progress < 100 && (
          <div className="mt-3">
            <div className="progress" style={{ height: '5px' }}>
              <div 
                className="progress-bar bg-primary" 
                role="progressbar" 
                style={{ width: `${achievement.progress}%` }}
                aria-valuenow={achievement.progress} 
                aria-valuemin="0" 
                aria-valuemax="100"
              ></div>
            </div>
            <small className="text-muted">{achievement.progress}% completado</small>
          </div>
        )}
      </div>
    </div>
  );
}
