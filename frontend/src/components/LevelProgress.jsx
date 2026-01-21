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
      <div className="text-center py-3">
        <div className="spinner-border spinner-border-sm"></div>
      </div>
    );
  }

  const xpRequired = userLevel.level * 100;

  return (
    <div className="card mb-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0">Nivel {userLevel.level}</h5>
            <small className="text-muted">
              {userLevel.experience_points} / {xpRequired} XP
            </small>
          </div>
          <div className="text-end">
            <span className="badge bg-primary" style={{ fontSize: '1.5rem', padding: '0.5rem 1rem' }}>
              <i className="bi bi-star-fill me-2"></i>
              {userLevel.level}
            </span>
          </div>
        </div>
        
        <div className="progress" style={{ height: '25px' }}>
          <div 
            className="progress-bar progress-bar-striped progress-bar-animated bg-success" 
            role="progressbar" 
            style={{ width: `${progress}%` }}
            aria-valuenow={progress} 
            aria-valuemin="0" 
            aria-valuemax="100"
          >
            {progress.toFixed(1)}%
          </div>
        </div>
        
        <div className="mt-3 text-center">
          <small className="text-muted">
            {xpRequired - userLevel.experience_points} XP para nivel {userLevel.level + 1}
          </small>
        </div>
        
        {userLevel.total_achievements > 0 && (
          <div className="mt-3 pt-3 border-top text-center">
            <i className="bi bi-trophy-fill text-warning me-2"></i>
            <span className="fw-bold">{userLevel.total_achievements}</span>
            <span className="text-muted"> logro{userLevel.total_achievements !== 1 ? 's' : ''} desbloqueado{userLevel.total_achievements !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
}
