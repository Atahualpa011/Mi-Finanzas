import { useEffect, useState } from 'react';
import { Pie, Bar, Line } from 'react-chartjs-2';

// --- Página de análisis emocional de gastos (REFACTORIZADO) ---
export default function EmotionalAnalysis() {
  // --- Estados principales ---
  const [emotionStats, setEmotionStats] = useState({}); // Estadísticas básicas (gráfico torta)
  const [separated, setSeparated] = useState({ positive: [], negative: [], neutral: [], other: [] }); // Gastos separados
  const [correlational, setCorrelational] = useState(null); // Datos correlacionales (NUEVO)
  const [recommendations, setRecommendations] = useState(null); // Recomendaciones (NUEVO)
  const [trends, setTrends] = useState(null); // Tendencias temporales (NUEVO)
  const [loading, setLoading] = useState(true);

  // --- Cargar datos de análisis emocional al montar ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Cargar datos básicos (existente)
    Promise.all([
      fetch('/api/analysis/emotional', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/analysis/correlational', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/analysis/emotional-recommendations', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/analysis/emotional-trends?weeks=12', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
    ])
      .then(([basicData, correlData, recomData, trendsData]) => {
        setEmotionStats(basicData.emotionStats);
        setSeparated(basicData.separated);
        setCorrelational(correlData);
        setRecommendations(recomData);
        setTrends(trendsData);
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

  // --- Datos para el gráfico de barras comparativo (NUEVO) ---
  const barData = correlational ? {
    labels: Object.keys(correlational.byEmotion),
    datasets: [
      {
        label: 'Gasto Promedio',
        data: Object.values(correlational.byEmotion).map(e => e.avgSpent),
        backgroundColor: Object.keys(correlational.byEmotion).map(emotion => {
          const type = correlational.byEmotion[emotion].type;
          return type === 'positive' ? 'rgba(25, 135, 84, 0.7)' : 
                 type === 'negative' ? 'rgba(220, 53, 69, 0.7)' : 
                 'rgba(108, 117, 125, 0.7)';
        }),
        borderColor: Object.keys(correlational.byEmotion).map(emotion => {
          const type = correlational.byEmotion[emotion].type;
          return type === 'positive' ? '#198754' : 
                 type === 'negative' ? '#dc3545' : 
                 '#6c757d';
        }),
        borderWidth: 2
      }
    ]
  } : null;

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Promedio: $${context.parsed.y.toFixed(2)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`
        }
      }
    }
  };

  // --- Datos para el gráfico de línea de tendencias (NUEVO) ---
  const lineData = trends && trends.datasets.length > 0 ? {
    labels: trends.labels,
    datasets: trends.datasets.map(dataset => {
      // Asignar colores según el tipo de emoción
      const emotionType = dataset.type;
      let color = '#6c757d'; // Neutral por defecto
      
      if (emotionType === 'positive') color = '#198754'; // Verde
      else if (emotionType === 'negative') color = '#dc3545'; // Rojo
      
      return {
        label: dataset.label,
        data: dataset.data,
        borderColor: color,
        backgroundColor: `${color}33`, // Color con transparencia
        tension: 0.3, // Línea suave
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6
      };
    })
  } : null;

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 15,
          font: { size: 11 },
          usePointStyle: true
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  // --- Render principal ---
  return (
    <div className="container-fluid py-4">
      {/* Encabezado */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center">
          <i className="bi bi-emoji-smile fs-3 text-primary me-3"></i>
          <div>
            <h2 className="mb-0">Análisis Emocional</h2>
            <p className="text-muted mb-0 small">Descubre cómo tus emociones impactan tus gastos</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted mt-3">Analizando tus gastos...</p>
        </div>
      ) : !correlational || Object.keys(correlational.byEmotion).length === 0 ? (
        <div className="card border-light shadow-sm">
          <div className="card-body text-center py-5">
            <i className="bi bi-inbox fs-1 text-muted mb-3"></i>
            <h5 className="text-muted">No hay datos suficientes</h5>
            <p className="text-muted">Registra gastos con emociones asociadas para ver tu análisis emocional.</p>
            <a href="/add-transaction" className="btn btn-primary mt-3">
              <i className="bi bi-plus-circle me-2"></i>Registrar gasto
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* SECCIÓN 1: TARJETAS DE MÉTRICAS CLAVE (NUEVO) */}
          <div className="row g-4 mb-4">
            {/* Emoción más cara */}
            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #dc3545' }}>
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-currency-dollar fs-4 text-danger me-2"></i>
                    <h6 className="mb-0 text-muted small">Emoción más cara</h6>
                  </div>
                  <h4 className="mb-1 fw-bold text-danger">
                    {correlational.summary.mostExpensiveEmotion || 'N/A'}
                  </h4>
                  <p className="mb-0 small text-muted">
                    ${correlational.byEmotion[correlational.summary.mostExpensiveEmotion]?.totalSpent.toFixed(2) || 0}
                    <span className="ms-2">
                      ({correlational.byEmotion[correlational.summary.mostExpensiveEmotion]?.percentage.toFixed(1) || 0}%)
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Emoción más frecuente */}
            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #0d6efd' }}>
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-bar-chart fs-4 text-primary me-2"></i>
                    <h6 className="mb-0 text-muted small">Emoción más frecuente</h6>
                  </div>
                  <h4 className="mb-1 fw-bold text-primary">
                    {correlational.summary.mostFrequentEmotion || 'N/A'}
                  </h4>
                  <p className="mb-0 small text-muted">
                    {correlational.byEmotion[correlational.summary.mostFrequentEmotion]?.frequency || 0} veces registrada
                  </p>
                </div>
              </div>
            </div>

            {/* Riesgo emocional */}
            <div className="col-md-3">
              <div className={`card border-0 shadow-sm h-100`} style={{ 
                borderLeft: `4px solid ${
                  correlational.summary.emotionalRisk === 'high' ? '#dc3545' : 
                  correlational.summary.emotionalRisk === 'medium' ? '#ffc107' : 
                  '#198754'
                }` 
              }}>
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <i className={`bi bi-exclamation-triangle fs-4 me-2`} style={{ color: 
                      correlational.summary.emotionalRisk === 'high' ? '#dc3545' : 
                      correlational.summary.emotionalRisk === 'medium' ? '#ffc107' : 
                      '#198754' 
                    }}></i>
                    <h6 className="mb-0 text-muted small">Riesgo emocional</h6>
                  </div>
                  <h4 className="mb-1 fw-bold" style={{ color: 
                    correlational.summary.emotionalRisk === 'high' ? '#dc3545' : 
                    correlational.summary.emotionalRisk === 'medium' ? '#ffc107' : 
                    '#198754' 
                  }}>
                    {correlational.summary.emotionalRisk === 'high' ? 'Alto' : 
                     correlational.summary.emotionalRisk === 'medium' ? 'Medio' : 
                     'Bajo'}
                  </h4>
                  <p className="mb-0 small text-muted">
                    {correlational.summary.negativePercentage}% gastos negativos
                  </p>
                </div>
              </div>
            </div>

            {/* Balance positivo vs negativo */}
            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #6610f2' }}>
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-percent fs-4 text-purple me-2"></i>
                    <h6 className="mb-0 text-muted small">Balance emocional</h6>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-success">Positivo</small>
                      <p className="mb-0 fw-bold text-success">
                        ${correlational.summary.positiveVsNegative.positive.toFixed(0)}
                      </p>
                    </div>
                    <div className="text-end">
                      <small className="text-danger">Negativo</small>
                      <p className="mb-0 fw-bold text-danger">
                        ${correlational.summary.positiveVsNegative.negative.toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: ALERTAS Y PATRONES DETECTADOS (NUEVO) */}
          {recommendations && recommendations.alerts && recommendations.alerts.length > 0 && (
            <div className="card border-warning shadow-sm mb-4">
              <div className="card-header bg-warning bg-opacity-10 border-0">
                <div className="d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle-fill text-warning fs-5 me-2"></i>
                  <h5 className="mb-0">Patrones detectados</h5>
                </div>
              </div>
              <div className="card-body">
                {recommendations.alerts.map((alert, idx) => (
                  <div 
                    key={idx} 
                    className={`alert alert-${alert.severity === 'danger' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'info'} mb-3`}
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

          {/* SECCIÓN 3: GRÁFICOS */}
          <div className="row g-4 mb-4">
            {/* Gráfico de torta (existente) */}
            <div className="col-md-6">
              <div className="card border-light shadow-sm" style={{ borderRadius: 'var(--border-radius-lg)' }}>
                <div className="card-header bg-secondary border-0 d-flex align-items-center" style={{ borderRadius: 'var(--border-radius-lg) var(--border-radius-lg) 0 0' }}>
                  <i className="bi bi-pie-chart-fill me-2"></i>
                  <span className="fw-semibold">Distribución de gastos por emoción</span>
                </div>
                <div className="card-body text-center" style={{ padding: '2rem' }}>
                  <div style={{ maxWidth: 400, margin: '0 auto' }}>
                    <Pie data={pieData} options={pieOptions} />
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico de barras comparativo (NUEVO) */}
            <div className="col-md-6">
              <div className="card border-light shadow-sm" style={{ borderRadius: 'var(--border-radius-lg)' }}>
                <div className="card-header bg-secondary border-0 d-flex align-items-center" style={{ borderRadius: 'var(--border-radius-lg) var(--border-radius-lg) 0 0' }}>
                  <i className="bi bi-bar-chart-fill me-2"></i>
                  <span className="fw-semibold">Gasto promedio por emoción</span>
                </div>
                <div className="card-body" style={{ padding: '2rem', height: '400px' }}>
                  {barData && <Bar data={barData} options={barOptions} />}
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3.5: GRÁFICO DE TENDENCIAS TEMPORALES (NUEVO) */}
          {trends && trends.datasets.length > 0 && (
            <div className="card border-light shadow-sm mb-4">
              <div className="card-header bg-secondary border-0 d-flex align-items-center justify-content-between" style={{ borderRadius: 'var(--border-radius-lg) var(--border-radius-lg) 0 0' }}>
                <div className="d-flex align-items-center">
                  <i className="bi bi-graph-up me-2"></i>
                  <span className="fw-semibold">Tendencia temporal de gastos emocionales</span>
                </div>
                <span className="badge bg-light text-dark">
                  Últimas {trends.metadata.totalWeeks} semanas
                </span>
              </div>
              <div className="card-body" style={{ padding: '2rem', height: '450px' }}>
                {lineData && <Line data={lineData} options={lineOptions} />}
              </div>
              <div className="card-footer bg-light border-0">
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  Este gráfico muestra cómo evolucionan tus gastos asociados a cada emoción semana a semana
                </small>
              </div>
            </div>
          )}

          {/* SECCIÓN 4: TABLA DE CORRELACIONES (NUEVO) */}
          <div className="card border-light shadow-sm mb-4">
            <div className="card-header bg-secondary border-0 d-flex align-items-center">
              <i className="bi bi-table me-2"></i>
              <span className="fw-semibold">Análisis detallado por emoción</span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Emoción</th>
                      <th className="text-center">Tipo</th>
                      <th className="text-end">Frecuencia</th>
                      <th className="text-end">Gasto Total</th>
                      <th className="text-end">Promedio</th>
                      <th className="text-end">% del Total</th>
                      <th className="text-center">Tendencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(correlational.byEmotion)
                      .sort((a, b) => b[1].totalSpent - a[1].totalSpent)
                      .map(([emotion, data]) => {
                        const monthlyData = correlational.monthlyComparison[emotion];
                        return (
                          <tr key={emotion}>
                            <td className="fw-semibold">{emotion}</td>
                            <td className="text-center">
                              <span className={`badge ${
                                data.type === 'positive' ? 'bg-success' : 
                                data.type === 'negative' ? 'bg-danger' : 
                                'bg-secondary'
                              }`}>
                                {data.type === 'positive' ? 'Positiva' : 
                                 data.type === 'negative' ? 'Negativa' : 
                                 'Neutra'}
                              </span>
                            </td>
                            <td className="text-end">{data.frequency}</td>
                            <td className="text-end fw-bold">${data.totalSpent.toFixed(2)}</td>
                            <td className="text-end">${data.avgSpent.toFixed(2)}</td>
                            <td className="text-end">
                              <span className="badge bg-primary">{data.percentage.toFixed(1)}%</span>
                            </td>
                            <td className="text-center">
                              {monthlyData ? (
                                monthlyData.trend === 'increasing' ? (
                                  <span className="text-danger">
                                    <i className="bi bi-arrow-up-circle-fill"></i> +{monthlyData.changePercentage.toFixed(0)}%
                                  </span>
                                ) : monthlyData.trend === 'decreasing' ? (
                                  <span className="text-success">
                                    <i className="bi bi-arrow-down-circle-fill"></i> {monthlyData.changePercentage.toFixed(0)}%
                                  </span>
                                ) : (
                                  <span className="text-muted">
                                    <i className="bi bi-dash-circle-fill"></i> Estable
                                  </span>
                                )
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* SECCIÓN 5: RECOMENDACIONES (NUEVO) */}
          {recommendations && recommendations.recommendations && recommendations.recommendations.length > 0 && (
            <div className="card border-primary shadow-sm mb-4">
              <div className="card-header bg-primary bg-opacity-10 border-0">
                <div className="d-flex align-items-center">
                  <i className="bi bi-lightbulb-fill text-primary fs-5 me-2"></i>
                  <h5 className="mb-0">Recomendaciones personalizadas</h5>
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

          {/* SECCIÓN 6: Tarjetas de categorías emocionales (EXISTENTE - Compactado) */}
          <div className="card border-light shadow-sm">
            <div className="card-header bg-secondary border-0">
              <div className="d-flex align-items-center">
                <i className="bi bi-list-ul me-2"></i>
                <span className="fw-semibold">Listado de gastos por tipo de emoción</span>
              </div>
            </div>
            <div className="card-body">
              <div className="row g-4">
                {/* Gastos positivos */}
                <div className="col-md-4">
                  <div className="card border-success h-100">
                    <div className="card-header bg-success bg-opacity-10 border-0 d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-emoji-laughing fs-5 text-success me-2"></i>
                        <span className="fw-semibold text-success">Gastos Positivos</span>
                      </div>
                      <span className="badge bg-success">{separated.positive.length}</span>
                    </div>
                    <div className="card-body" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {separated.positive.length === 0 ? (
                        <div className="text-center py-3">
                          <i className="bi bi-inbox fs-3 text-muted mb-2"></i>
                          <p className="text-muted small mb-0">Sin gastos positivos.</p>
                        </div>
                      ) : (
                        <ul className="list-unstyled mb-0">
                          {separated.positive.slice(0, 10).map((tx, i) => (
                            <li key={i} className="mb-2 p-2 bg-light rounded-2">
                              <div className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1">
                                  <span className="badge bg-success bg-opacity-25 text-success small">{tx.emotion}</span>
                                  <p className="mb-0 small text-dark">{tx.description}</p>
                                </div>
                                <span className="fw-bold text-success small">${Number(tx.amount).toFixed(2)}</span>
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
                  <div className="card border-danger h-100">
                    <div className="card-header bg-danger bg-opacity-10 border-0 d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-emoji-frown fs-5 text-danger me-2"></i>
                        <span className="fw-semibold text-danger">Gastos Negativos</span>
                      </div>
                      <span className="badge bg-danger">{separated.negative.length}</span>
                    </div>
                    <div className="card-body" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {separated.negative.length === 0 ? (
                        <div className="text-center py-3">
                          <i className="bi bi-inbox fs-3 text-muted mb-2"></i>
                          <p className="text-muted small mb-0">Sin gastos negativos.</p>
                        </div>
                      ) : (
                        <ul className="list-unstyled mb-0">
                          {separated.negative.slice(0, 10).map((tx, i) => (
                            <li key={i} className="mb-2 p-2 bg-light rounded-2">
                              <div className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1">
                                  <span className="badge bg-danger bg-opacity-25 text-danger small">{tx.emotion}</span>
                                  <p className="mb-0 small text-dark">{tx.description}</p>
                                </div>
                                <span className="fw-bold text-danger small">${Number(tx.amount).toFixed(2)}</span>
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
                  <div className="card border-secondary h-100">
                    <div className="card-header bg-secondary bg-opacity-10 border-0 d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-emoji-neutral fs-5 text-secondary me-2"></i>
                        <span className="fw-semibold text-secondary">Gastos Neutros</span>
                      </div>
                      <span className="badge bg-secondary">{separated.neutral.length}</span>
                    </div>
                    <div className="card-body" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {separated.neutral.length === 0 ? (
                        <div className="text-center py-3">
                          <i className="bi bi-inbox fs-3 text-muted mb-2"></i>
                          <p className="text-muted small mb-0">Sin gastos neutros.</p>
                        </div>
                      ) : (
                        <ul className="list-unstyled mb-0">
                          {separated.neutral.slice(0, 10).map((tx, i) => (
                            <li key={i} className="mb-2 p-2 bg-light rounded-2">
                              <div className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1">
                                  <span className="badge bg-secondary bg-opacity-25 text-secondary small">{tx.emotion}</span>
                                  <p className="mb-0 small text-dark">{tx.description}</p>
                                </div>
                                <span className="fw-bold text-secondary small">${Number(tx.amount).toFixed(2)}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}