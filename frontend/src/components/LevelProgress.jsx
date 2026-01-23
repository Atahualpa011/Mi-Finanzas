import { useEffect, useState } from 'react';

export default function LevelProgress({ userLevel }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (userLevel) {
      // Calcular progreso hacia el siguiente nivel
      const xpRequired = userLevel.level * 100;
      const percentage = (userLevel.experience_points / xpRequired) * 100;
      setProgress(Math.min(percentage, 100));
    }
  }, [userLevel]);

  if (!userLevel) {
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

  const xpRequired = userLevel.level * 100;

  return (
    <div className="card border-light shadow-sm h-100" style={{ borderRadius: 'var(--border-radius-lg)' }}>
      <div className="card-header bg-primary bg-opacity-10 border-0 d-flex align-items-center" style={{ borderRadius: 'var(--border-radius-lg) var(--border-radius-lg) 0 0' }}>
        <i className="bi bi-graph-up-arrow fs-5 text-primary me-2"></i>
        <span className="fw-semibold text-primary">Progreso de Nivel</span>
      </div>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="mb-1 fw-bold text-primary">Nivel {userLevel.level}</h4>
            <small className="text-muted">
              <i className="bi bi-lightning-charge-fill text-warning me-1"></i>
              {userLevel.experience_points} / {xpRequired} XP
            </small>
          </div>
          <div className="text-end">
            <div 
              className="d-flex align-items-center justify-content-center rounded-circle" 
              style={{ 
                width: '80px', 
                height: '80px', 
                backgroundColor: 'var(--bs-primary)',
                border: '3px solid var(--bs-primary)',
                boxShadow: '0 4px 12px rgba(13, 110, 253, 0.3)'
              }}
            >
              <div className="text-center text-white">
                <i className="bi bi-star-fill d-block mb-1" style={{ fontSize: '1.5rem' }}></i>
                <span className="fw-bold" style={{ fontSize: '1.4rem' }}>{userLevel.level}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <small className="text-muted fw-semibold">Progreso</small>
            <small className="text-primary fw-bold">{progress.toFixed(1)}%</small>
          </div>
          <div className="progress" style={{ height: '28px', borderRadius: 'var(--border-radius-md)', backgroundColor: '#e9ecef' }}>
            <div 
              className="progress-bar progress-bar-striped progress-bar-animated" 
              role="progressbar" 
              style={{ 
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #0d6efd 0%, #0dcaf0 100%)',
                transition: 'width 0.6s ease'
              }}
              aria-valuenow={progress} 
              aria-valuemin="0" 
              aria-valuemax="100"
            >
              <span className="fw-semibold px-2">{progress.toFixed(1)}%</span>
            </div>
          </div>
        </div>
        
        <div className="text-center p-3 bg-light rounded-3 mb-3">
          <i className="bi bi-bullseye text-info me-2"></i>
          <span className="text-dark fw-semibold">{xpRequired - userLevel.experience_points} XP</span>
          <span className="text-muted small"> para nivel {userLevel.level + 1}</span>
        </div>
        
        {userLevel.total_achievements > 0 && (
          <div className="mt-3 pt-3 border-top">
            <div className="d-flex align-items-center justify-content-center p-2 bg-warning bg-opacity-10 rounded-3">
              <i className="bi bi-trophy-fill text-warning fs-4 me-3"></i>
              <div className="text-start">
                <div className="fw-bold text-dark" style={{ fontSize: '1.1rem' }}>{userLevel.total_achievements}</div>
                <small className="text-muted">logro{userLevel.total_achievements !== 1 ? 's' : ''} desbloqueado{userLevel.total_achievements !== 1 ? 's' : ''}</small>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
