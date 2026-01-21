import { useEffect, useState } from 'react';

export default function AchievementNotification({ achievement, onClose }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (achievement) {
      setShow(true);
      // Auto-cerrar después de 5 segundos
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [achievement]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  if (!achievement) return null;

  return (
    <div 
      className={`position-fixed top-0 end-0 p-3 ${show ? '' : 'd-none'}`}
      style={{ zIndex: 9999, marginTop: '80px' }}
    >
      <div className={`toast show border-0 shadow-lg`} role="alert">
        <div className="toast-header bg-success text-white">
          <i className="bi bi-trophy-fill me-2"></i>
          <strong className="me-auto">¡Logro Desbloqueado!</strong>
          <button 
            type="button" 
            className="btn-close btn-close-white" 
            onClick={handleClose}
          ></button>
        </div>
        <div className="toast-body bg-success bg-opacity-10">
          <div className="d-flex align-items-center">
            <i className={`bi ${achievement.icon || 'bi-award'} fs-1 text-success me-3`}></i>
            <div className="flex-grow-1">
              <h6 className="mb-1 fw-bold">{achievement.name}</h6>
              <p className="mb-2 small text-muted">{achievement.description}</p>
              <span className="badge bg-success">
                <i className="bi bi-star-fill me-1"></i>
                +{achievement.points} XP
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
