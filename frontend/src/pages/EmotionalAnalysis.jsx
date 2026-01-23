import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';

// --- Página de análisis emocional de gastos ---
export default function EmotionalAnalysis() {
  // --- Estados principales ---
  const [emotionStats, setEmotionStats] = useState({}); // Estadísticas por emoción para el gráfico
  const [separated, setSeparated] = useState({ positive: [], negative: [], neutral: [], other: [] }); // Gastos separados por tipo de emoción
  const [loading, setLoading] = useState(true); // Estado de carga

  // --- Cargar datos de análisis emocional al montar ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/analysis/emotional', { 
      headers: { 
        Authorization: `Bearer ${token}`
      } 
    })
      .then(r => r.json())
      .then(data => {
        setEmotionStats(data.emotionStats);
        setSeparated(data.separated);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error cargando análisis:', err);
        setLoading(false);
      });
  }, []);

  // --- Datos para el gráfico de torta ---
  const pieData = {
    labels: Object.keys(emotionStats),
    datasets: [
      {
        data: Object.values(emotionStats).map(e => e.total),
        backgroundColor: [
          '#198754', '#dc3545', '#ffc107', '#0d6efd', '#20c997', '#6610f2', '#fd7e14', '#6c757d'
        ],
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12 }
        }
      }
    }
  };

  // --- Render principal ---
  return (
    <div className="container-fluid py-4">
      {/* Encabezado */}
      <div className="d-flex align-items-center mb-4">
        <i className="bi bi-emoji-smile fs-3 text-primary me-3"></i>
        <h2 className="mb-0">Análisis Emocional</h2>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted mt-3">Analizando tus gastos...</p>
        </div>
      ) : (
        <>
          {/* Tarjeta del gráfico */}
          <div className="card border-light shadow-sm mb-4" style={{ borderRadius: 'var(--border-radius-lg)' }}>
            <div className="card-header bg-secondary border-0 d-flex align-items-center" style={{ borderRadius: 'var(--border-radius-lg) var(--border-radius-lg) 0 0' }}>
              <i className="bi bi-pie-chart-fill me-2"></i>
              <span className="fw-semibold">Distribución de gastos por emoción</span>
            </div>
            <div className="card-body text-center" style={{ padding: '2rem' }}>
              {Object.keys(emotionStats).length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-inbox fs-1 text-muted mb-3"></i>
                  <p className="text-muted">No hay datos suficientes para generar el análisis.</p>
                  <small className="text-muted">Registra algunos gastos para ver tu análisis emocional.</small>
                </div>
              ) : (
                <div style={{ maxWidth: 450, margin: '0 auto' }}>
                  <Pie data={pieData} options={pieOptions} />
                </div>
              )}
            </div>
          </div>

          {/* Tarjetas de categorías emocionales */}
          <div className="row g-4">
            {/* Gastos positivos */}
            <div className="col-md-4">
              <div className="card border-light shadow-sm h-100" style={{ borderRadius: 'var(--border-radius-lg)' }}>
                <div className="card-header bg-success bg-opacity-10 border-0 d-flex align-items-center justify-content-between" style={{ borderRadius: 'var(--border-radius-lg) var(--border-radius-lg) 0 0' }}>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-emoji-laughing fs-5 text-success me-2"></i>
                    <span className="fw-semibold text-success">Gastos Positivos</span>
                  </div>
                  <span className="badge bg-success">{separated.positive.length}</span>
                </div>
                <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {separated.positive.length === 0 ? (
                    <div className="text-center py-3">
                      <i className="bi bi-inbox fs-3 text-muted mb-2"></i>
                      <p className="text-muted small mb-0">Sin gastos positivos.</p>
                    </div>
                  ) : (
                    <ul className="list-unstyled mb-0">
                      {separated.positive.map((tx, i) => (
                        <li key={i} className="mb-3 p-3 bg-light rounded-3" style={{ transition: 'all 0.2s ease', cursor: 'default' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e7f5ec'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}>
                          <div className="d-flex align-items-start">
                            <i className="bi bi-emoji-smile text-success me-2 mt-1"></i>
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start mb-1">
                                <span className="badge bg-success bg-opacity-25 text-success small">{tx.emotion}</span>
                                <span className="fw-bold text-success">${Number(tx.amount).toFixed(2)}</span>
                              </div>
                              <p className="mb-0 small text-dark">{tx.description}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Gastos negativos */}
            <div className="col-md-4">
              <div className="card border-light shadow-sm h-100" style={{ borderRadius: 'var(--border-radius-lg)' }}>
                <div className="card-header bg-danger bg-opacity-10 border-0 d-flex align-items-center justify-content-between" style={{ borderRadius: 'var(--border-radius-lg) var(--border-radius-lg) 0 0' }}>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-emoji-frown fs-5 text-danger me-2"></i>
                    <span className="fw-semibold text-danger">Gastos Negativos</span>
                  </div>
                  <span className="badge bg-danger">{separated.negative.length}</span>
                </div>
                <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {separated.negative.length === 0 ? (
                    <div className="text-center py-3">
                      <i className="bi bi-inbox fs-3 text-muted mb-2"></i>
                      <p className="text-muted small mb-0">Sin gastos negativos.</p>
                    </div>
                  ) : (
                    <ul className="list-unstyled mb-0">
                      {separated.negative.map((tx, i) => (
                        <li key={i} className="mb-3 p-3 bg-light rounded-3" style={{ transition: 'all 0.2s ease', cursor: 'default' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8d7da'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}>
                          <div className="d-flex align-items-start">
                            <i className="bi bi-emoji-frown text-danger me-2 mt-1"></i>
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start mb-1">
                                <span className="badge bg-danger bg-opacity-25 text-danger small">{tx.emotion}</span>
                                <span className="fw-bold text-danger">${Number(tx.amount).toFixed(2)}</span>
                              </div>
                              <p className="mb-0 small text-dark">{tx.description}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Gastos neutros */}
            <div className="col-md-4">
              <div className="card border-light shadow-sm h-100" style={{ borderRadius: 'var(--border-radius-lg)' }}>
                <div className="card-header bg-secondary bg-opacity-10 border-0 d-flex align-items-center justify-content-between" style={{ borderRadius: 'var(--border-radius-lg) var(--border-radius-lg) 0 0' }}>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-emoji-neutral fs-5 text-secondary me-2"></i>
                    <span className="fw-semibold text-secondary">Gastos Neutros</span>
                  </div>
                  <span className="badge bg-secondary">{separated.neutral.length}</span>
                </div>
                <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {separated.neutral.length === 0 ? (
                    <div className="text-center py-3">
                      <i className="bi bi-inbox fs-3 text-muted mb-2"></i>
                      <p className="text-muted small mb-0">Sin gastos neutros.</p>
                    </div>
                  ) : (
                    <ul className="list-unstyled mb-0">
                      {separated.neutral.map((tx, i) => (
                        <li key={i} className="mb-3 p-3 bg-light rounded-3" style={{ transition: 'all 0.2s ease', cursor: 'default' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e2e3e5'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}>
                          <div className="d-flex align-items-start">
                            <i className="bi bi-emoji-neutral text-secondary me-2 mt-1"></i>
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start mb-1">
                                <span className="badge bg-secondary bg-opacity-25 text-secondary small">{tx.emotion}</span>
                                <span className="fw-bold text-secondary">${Number(tx.amount).toFixed(2)}</span>
                              </div>
                              <p className="mb-0 small text-dark">{tx.description}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}