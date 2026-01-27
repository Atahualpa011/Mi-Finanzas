import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Componente: Widget de recomendaciones emocionales ---
// Puede ser usado en Dashboard (modo compacto) o en EmotionalAnalysis (modo completo)
export default function EmotionalRecommendations({ compact = false }) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/analysis/emotional-recommendations', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setRecommendations(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error cargando recomendaciones:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="text-center py-3">
        <div className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!recommendations || (recommendations.alerts.length === 0 && recommendations.recommendations.length === 0)) {
    return compact ? null : (
      <div className="card border-light shadow-sm">
        <div className="card-body text-center py-4">
          <i className="bi bi-check-circle fs-1 text-success mb-3"></i>
          <h5 className="text-success">¡Todo en orden!</h5>
          <p className="text-muted mb-0">No hay alertas ni recomendaciones emocionales en este momento.</p>
        </div>
      </div>
    );
  }

  // --- MODO COMPACTO (para Dashboard) ---
  if (compact) {
    // Mostrar solo la alerta más importante o la primera recomendación
    const topAlert = recommendations.alerts[0];
    const topRecommendation = recommendations.recommendations[0];
    const item = topAlert || topRecommendation;

    if (!item) return null;

    const isAlert = !!topAlert;
    const severity = isAlert ? item.severity : 'info';
    const icon = isAlert 
      ? (severity === 'danger' ? 'bi-exclamation-octagon-fill' : 
         severity === 'warning' ? 'bi-exclamation-triangle-fill' : 
         'bi-info-circle-fill')
      : 'bi-lightbulb-fill';
    const color = isAlert 
      ? (severity === 'danger' ? 'danger' : 
         severity === 'warning' ? 'warning' : 
         'info')
      : 'primary';

    return (
      <div className={`card border-${color} shadow-sm`}>
        <div className={`card-header bg-${color} bg-opacity-10 border-0`}>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <i className={`bi ${icon} text-${color} me-2`}></i>
              <h6 className="mb-0">{isAlert ? 'Alerta emocional' : 'Recomendación'}</h6>
            </div>
            {recommendations.alerts.length + recommendations.recommendations.length > 1 && (
              <span className="badge bg-secondary">
                +{recommendations.alerts.length + recommendations.recommendations.length - 1}
              </span>
            )}
          </div>
        </div>
        <div className="card-body">
          <p className="mb-2 fw-semibold">
            {isAlert ? item.message : item.title}
          </p>
          <p className="mb-3 small text-muted">
            {isAlert ? item.suggestion : item.description}
          </p>
          <button 
            className="btn btn-sm btn-outline-primary w-100"
            onClick={() => navigate('/emotional-analysis')}
          >
            Ver análisis completo
          </button>
        </div>
      </div>
    );
  }

  // --- MODO COMPLETO (para EmotionalAnalysis u otra página dedicada) ---
  return (
    <div>
      {/* Alertas */}
      {recommendations.alerts && recommendations.alerts.length > 0 && (
        <div className="card border-warning shadow-sm mb-4">
          <div className="card-header bg-warning bg-opacity-10 border-0">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill text-warning fs-5 me-2"></i>
                <h5 className="mb-0">Alertas emocionales</h5>
              </div>
              <span className="badge bg-warning">{recommendations.alerts.length}</span>
            </div>
          </div>
          <div className="card-body">
            {recommendations.alerts.map((alert, idx) => (
              <div 
                key={idx} 
                className={`alert alert-${alert.severity === 'danger' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'info'} ${idx < recommendations.alerts.length - 1 ? 'mb-3' : 'mb-0'}`}
              >
                <div className="d-flex">
                  <i className={`bi ${
                    alert.severity === 'danger' ? 'bi-exclamation-octagon-fill' : 
                    alert.severity === 'warning' ? 'bi-exclamation-triangle-fill' : 
                    'bi-info-circle-fill'
                  } me-3 fs-5`}></i>
                  <div className="flex-grow-1">
                    <h6 className="mb-2 fw-bold">{alert.message}</h6>
                    <p className="mb-0 small">{alert.suggestion}</p>
                    {alert.data && alert.data.changePercentage && (
                      <div className="mt-2 small">
                        <span className="badge bg-secondary me-2">
                          Mes anterior: ${Number(alert.data.previousMonth).toFixed(0)}
                        </span>
                        <span className="badge bg-secondary">
                          Mes actual: ${Number(alert.data.currentMonth).toFixed(0)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      {recommendations.recommendations && recommendations.recommendations.length > 0 && (
        <div className="card border-primary shadow-sm">
          <div className="card-header bg-primary bg-opacity-10 border-0">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <i className="bi bi-lightbulb-fill text-primary fs-5 me-2"></i>
                <h5 className="mb-0">Recomendaciones personalizadas</h5>
              </div>
              <span className="badge bg-primary">{recommendations.recommendations.length}</span>
            </div>
          </div>
          <div className="card-body">
            <div className="row g-3">
              {recommendations.recommendations.map((rec, idx) => (
                <div key={idx} className="col-md-6">
                  <div className={`card h-100 border-${rec.priority === 'high' ? 'danger' : 'info'}`}>
                    <div className="card-body">
                      <div className="d-flex align-items-start mb-2">
                        <i className={`bi bi-bookmark-star-fill fs-5 me-2 text-${rec.priority === 'high' ? 'danger' : 'info'}`}></i>
                        <div className="flex-grow-1">
                          <h6 className="mb-1 fw-bold">{rec.title}</h6>
                          <span className={`badge bg-${rec.priority === 'high' ? 'danger' : 'info'} mb-2`}>
                            {rec.priority === 'high' ? 'Prioridad Alta' : 'Prioridad Media'}
                          </span>
                        </div>
                      </div>
                      <p className="small text-muted mb-2">{rec.description}</p>
                      <div className="alert alert-light mb-2 py-2 px-3">
                        <strong className="small">Acción sugerida:</strong>
                        <p className="mb-0 small">{rec.action}</p>
                      </div>
                      <div className="small text-success">
                        <i className="bi bi-check-circle-fill me-1"></i>
                        <strong>Beneficio:</strong> {rec.benefit}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Resumen de salud emocional */}
      {recommendations.summary && (
        <div className="mt-3 text-center">
          <small className="text-muted">
            Estado de salud emocional: 
            <span className={`ms-2 badge ${
              recommendations.summary.emotionalHealth === 'excellent' ? 'bg-success' : 
              recommendations.summary.emotionalHealth === 'good' ? 'bg-info' : 
              'bg-warning'
            }`}>
              {recommendations.summary.emotionalHealth === 'excellent' ? 'Excelente' : 
               recommendations.summary.emotionalHealth === 'good' ? 'Bueno' : 
               'Requiere atención'}
            </span>
          </small>
        </div>
      )}
    </div>
  );
}
