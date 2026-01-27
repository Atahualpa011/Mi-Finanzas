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
      case 'investments': return 'primary';
      case 'emotional': return 'purple';
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
      case 'investments': return 'Inversiones';
      case 'emotional': return 'Emocional';
      default: return category;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const isUnlocked = achievement.unlocked || achievement.unlocked_at;
  const categoryColor = getCategoryColor(achievement.category);

  return (
    <div 
      className={`card border-light shadow-sm h-100 ${!isUnlocked ? 'opacity-50' : ''}`} 
      style={{ 
        borderRadius: 'var(--border-radius-lg)',
        transition: 'all 0.3s ease',
        cursor: 'default'
      }}
      onMouseEnter={e => {
        if (isUnlocked) {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = 'var(--box-shadow-lg)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <div className={`card-header bg-${categoryColor} bg-opacity-10 border-0 d-flex align-items-center justify-content-between`} style={{ borderRadius: 'var(--border-radius-lg) var(--border-radius-lg) 0 0', padding: '0.75rem 1rem' }}>
        <span className={`badge bg-${categoryColor} bg-opacity-25 text-${categoryColor}`} style={{ fontSize: '0.75rem' }}>
          {getCategoryName(achievement.category)}
        </span>
        
        {isUnlocked ? (
          <i className="bi bi-check-circle-fill text-success fs-5"></i>
        ) : (
          <i className="bi bi-lock-fill text-secondary fs-6"></i>
        )}
      </div>
      
      <div className="card-body d-flex flex-column">
        <div className="text-center mb-3">
          <div 
            className={`d-inline-flex align-items-center justify-content-center rounded-circle`}
            style={{ 
              width: '80px', 
              height: '80px',
              backgroundColor: isUnlocked ? `rgba(var(--bs-${categoryColor}-rgb), 0.1)` : 'rgba(108, 117, 125, 0.05)',
              border: `3px solid ${isUnlocked ? `var(--bs-${categoryColor})` : 'var(--bs-secondary)'}`
            }}
          >
            <i 
              className={`bi ${getIconClass(achievement.icon)} ${isUnlocked ? `text-${categoryColor}` : 'text-secondary'}`}
              style={{ fontSize: '2.5rem' }}
            ></i>
          </div>
        </div>
        
        <h6 className="text-center fw-bold mb-2" style={{ fontSize: '0.95rem', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {achievement.name}
        </h6>
        
        <p className="text-muted small text-center mb-3 flex-grow-1" style={{ fontSize: '0.8rem' }}>
          {achievement.description}
        </p>
        
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="badge bg-primary d-flex align-items-center" style={{ fontSize: '0.85rem', padding: '0.4rem 0.7rem', borderRadius: 'var(--border-radius-md)' }}>
              <i className="bi bi-lightning-charge-fill me-1"></i>
              {achievement.points} XP
            </span>
            
            {isUnlocked && achievement.unlocked_at && (
              <small className="text-success d-flex align-items-center" style={{ fontSize: '0.75rem' }}>
                <i className="bi bi-calendar-check-fill me-1"></i>
                {formatDate(achievement.unlocked_at)}
              </small>
            )}
            
            {!isUnlocked && achievement.target_value && (
              <small className="text-muted d-flex align-items-center" style={{ fontSize: '0.75rem' }}>
                <i className="bi bi-bullseye me-1"></i>
                Meta: {achievement.target_value}
              </small>
            )}
          </div>
          
          {achievement.progress !== undefined && achievement.progress < 100 && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>Progreso</small>
                <small className="text-primary fw-bold" style={{ fontSize: '0.75rem' }}>{achievement.progress}%</small>
              </div>
              <div className="progress" style={{ height: '8px', borderRadius: 'var(--border-radius-md)', backgroundColor: '#e9ecef' }}>
                <div 
                  className={`progress-bar bg-${categoryColor}`}
                  role="progressbar" 
                  style={{ 
                    width: `${achievement.progress}%`,
                    transition: 'width 0.6s ease'
                  }}
                  aria-valuenow={achievement.progress} 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
