import { useState, useEffect } from 'react';
import HelpButton from '../components/HelpButton';
import { HELP_CONTENTS } from '../utils/helpContents';

export default function Insights() {
  const [period, setPeriod] = useState('current');
  const [metrics, setMetrics] = useState(null);
  const [findings, setFindings] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState({ metrics: false, findings: false, recommendations: false, snapshots: false });
  const [error, setError] = useState({ metrics: null, findings: null, recommendations: null, snapshots: null });
  const [activeTab, setActiveTab] = useState('recommendations');

  const token = localStorage.getItem('token');

  // --- Fetch métricas ---
  const fetchMetrics = async () => {
    setLoading(prev => ({ ...prev, metrics: true }));
    setError(prev => ({ ...prev, metrics: null }));
    try {
      const response = await fetch(`/api/insights/metrics?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al cargar métricas');
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(prev => ({ ...prev, metrics: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, metrics: false }));
    }
  };

  // --- Fetch hallazgos ---
  const fetchFindings = async () => {
    setLoading(prev => ({ ...prev, findings: true }));
    setError(prev => ({ ...prev, findings: null }));
    try {
      const response = await fetch(`/api/insights/findings?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al cargar hallazgos');
      const data = await response.json();
      setFindings(data);
    } catch (err) {
      setError(prev => ({ ...prev, findings: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, findings: false }));
    }
  };

  // --- Fetch recomendaciones (con IA) ---
  const fetchRecommendations = async () => {
    setLoading(prev => ({ ...prev, recommendations: true }));
    setError(prev => ({ ...prev, recommendations: null }));
    setRecommendations(null); // Limpiar recomendaciones anteriores
    
    try {
      const response = await fetch(`/api/insights/recommendations?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.status === 429) {
        const data = await response.json();
        setError(prev => ({ 
          ...prev, 
          recommendations: `${data.message || 'Límite de solicitudes excedido'}. ${data.resetAt ? `Próximo reset: ${formatDateTime(data.resetAt)}` : ''}` 
        }));
        setLoading(prev => ({ ...prev, recommendations: false }));
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al cargar recomendaciones');
      }
      
      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      setError(prev => ({ ...prev, recommendations: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, recommendations: false }));
    }
  };

  // --- Fetch historial de snapshots ---
  const fetchSnapshots = async () => {
    setLoading(prev => ({ ...prev, snapshots: true }));
    setError(prev => ({ ...prev, snapshots: null }));
    try {
      const response = await fetch(`/api/insights/snapshots?limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al cargar historial');
      const data = await response.json();
      setSnapshots(data.snapshots || []);
    } catch (err) {
      setError(prev => ({ ...prev, snapshots: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, snapshots: false }));
    }
  };

  // --- Cargar datos al montar y cuando cambia el período ---
  useEffect(() => {
    if (activeTab === 'recommendations') {
      fetchMetrics();
      // No cargar recomendaciones automáticamente
    } else if (activeTab === 'findings') {
      fetchFindings();
    } else if (activeTab === 'snapshots') {
      fetchSnapshots();
    }
  }, [period, activeTab]);

  // --- Priority badge color ---
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };

  // --- Severity badge color ---
  const getSeverityColor = (severity) => {
    const normalizedSeverity = String(severity || '').trim().toLowerCase();
    switch (normalizedSeverity) {
      case 'warning': return 'warning';
      case 'alert': return 'danger';
      case 'info': return 'info';
      case 'positive': return 'success';
      case 'success': return 'success';
      default: return 'secondary';
    }
  };

  // --- Category translation ---
  const getCategoryLabel = (category) => {
    const labels = {
      spending_control: 'Control de gastos',
      budgets: 'Presupuestos',
      emotional_health: 'Salud emocional',
      savings: 'Ahorros',
      income: 'Ingresos',
      spending_trends: 'Tendencias de gasto',
      income_trends: 'Tendencias de ingreso',
      balance: 'Balance',
      emotional: 'Emocional',
      category_analysis: 'Análisis de categorías',
      patterns: 'Patrones'
    };
    return labels[category] || category;
  };

  // --- Severity translation ---
  const getSeverityLabel = (severity) => {
    const normalizedSeverity = String(severity || '').trim().toLowerCase();
    const labels = {
      warning: 'Advertencia',
      alert: 'Alerta',
      info: 'Información',
      positive: 'Positivo',
      success: 'Éxito'
    };
    if (labels[normalizedSeverity]) return labels[normalizedSeverity];

    if (!severity) return 'Sin categoría';

    const raw = String(severity).trim();
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  };

  // --- Format date helper ---
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return 'N/A';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Botón de ayuda */}
      <div className="mb-3">
        <HelpButton section="insights" helpContent={HELP_CONTENTS.insights} />
      </div>

      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h2 className="mb-2">
            <i className="bi bi-lightbulb me-2"></i>
            Insights y Recomendaciones
          </h2>
          <p className="text-muted">
            Análisis inteligente de tus finanzas con recomendaciones personalizadas
          </p>
        </div>
      </div>

      {/* Selector de período */}
      <div className="row mb-4">
        <div className="col-md-6">
          <label className="form-label fw-semibold">Período de análisis</label>
          <select 
            className="form-select" 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="current">Mes actual</option>
            <option value="last_month">Mes pasado</option>
            <option value="last_3_months">Últimos 3 meses</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'recommendations' ? 'active' : ''}`}
            onClick={() => setActiveTab('recommendations')}
          >
            <i className="bi bi-magic me-2"></i>
            Recomendaciones IA
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'findings' ? 'active' : ''}`}
            onClick={() => setActiveTab('findings')}
          >
            <i className="bi bi-search me-2"></i>
            Hallazgos
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'snapshots' ? 'active' : ''}`}
            onClick={() => setActiveTab('snapshots')}
          >
            <i className="bi bi-clock-history me-2"></i>
            Historial
          </button>
        </li>
      </ul>

      {/* TAB: Recomendaciones IA */}
      {activeTab === 'recommendations' && (
        <>
          {/* Métricas resumen */}
          {loading.metrics && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando métricas...</span>
              </div>
            </div>
          )}

          {error.metrics && (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error.metrics}
            </div>
          )}

          {metrics && !loading.metrics && (
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-arrow-down-circle text-danger fs-4 me-2"></i>
                      <h6 className="mb-0 text-muted">Gastos</h6>
                    </div>
                    <h4 className="mb-1">${metrics.expenses?.total?.toLocaleString() || 0}</h4>
                    {metrics.expenses?.changePercentage !== undefined && (
                      <small className={metrics.expenses.changePercentage > 0 ? 'text-danger' : 'text-success'}>
                        {metrics.expenses.changePercentage > 0 ? '↑' : '↓'} 
                        {Math.abs(metrics.expenses.changePercentage).toFixed(1)}% vs anterior
                      </small>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-arrow-up-circle text-success fs-4 me-2"></i>
                      <h6 className="mb-0 text-muted">Ingresos</h6>
                    </div>
                    <h4 className="mb-1">${metrics.income?.total?.toLocaleString() || 0}</h4>
                    {metrics.income?.changePercentage !== undefined && (
                      <small className={metrics.income.changePercentage > 0 ? 'text-success' : 'text-danger'}>
                        {metrics.income.changePercentage > 0 ? '↑' : '↓'} 
                        {Math.abs(metrics.income.changePercentage).toFixed(1)}% vs anterior
                      </small>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-2">
                      <i className={`bi ${metrics.balance?.current >= 0 ? 'bi-graph-up' : 'bi-graph-down'} ${metrics.balance?.current >= 0 ? 'text-success' : 'text-danger'} fs-4 me-2`}></i>
                      <h6 className="mb-0 text-muted">Balance</h6>
                    </div>
                    <h4 className={`mb-1 ${metrics.balance?.current >= 0 ? 'text-success' : 'text-danger'}`}>
                      ${metrics.balance?.current?.toLocaleString() || 0}
                    </h4>
                    <small className="text-muted">
                      {metrics.balance?.current >= 0 ? 'Positivo' : 'Negativo'}
                    </small>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-wallet2 text-primary fs-4 me-2"></i>
                      <h6 className="mb-0 text-muted">Presupuestos</h6>
                    </div>
                    <h4 className="mb-1">{metrics.budgets?.exceeded || 0}</h4>
                    <small className="text-muted">Excedidos de {metrics.budgets?.total || 0}</small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botón para generar recomendaciones */}
          {!recommendations && !loading.recommendations && !error.recommendations && metrics && (
            <div className="text-center py-5">
              <div className="mb-3">
                <i className="bi bi-magic fs-1 text-primary"></i>
              </div>
              <h5 className="mb-3">Genera recomendaciones personalizadas con IA</h5>
              <p className="text-muted mb-4">
                Nuestro sistema analizará tus datos financieros y generará recomendaciones<br/>
                personalizadas para mejorar tu salud financiera.
              </p>
              <button 
                className="btn btn-primary btn-lg"
                onClick={fetchRecommendations}
              >
                <i className="bi bi-lightbulb me-2"></i>
                Generar Recomendaciones
              </button>
              <div className="mt-3">
                <small className="text-muted">
                  Este proceso puede tardar 10-15 segundos
                </small>
              </div>
            </div>
          )}

          {/* Recomendaciones */}
          {loading.recommendations && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Generando recomendaciones...</span>
              </div>
              <p className="mt-3 text-muted">La IA está analizando tus datos...</p>
            </div>
          )}

          {error.recommendations && (
            <div className="alert alert-warning">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error.recommendations}
            </div>
          )}

          {recommendations && !loading.recommendations && (
            <>
              {/* Meta info */}
              <div className="alert alert-info mb-4">
                <div className="d-flex align-items-start">
                  <i className="bi bi-info-circle me-3 fs-5"></i>
                  <div className="flex-grow-1">
                    <div className="mb-2">
                      {recommendations.meta?.isAiFallback ? (
                        <>
                          <strong>Recomendaciones básicas</strong>
                          <p className="mb-1 small">
                            Generadas por reglas automáticas. 
                            {recommendations.meta.fallbackReason === 'missing_api_key' && ' (IA no configurada)'}
                            {recommendations.meta.fallbackReason === 'timeout' && ' (IA tardó demasiado)'}
                            {recommendations.meta.fallbackReason === 'network_error' && ' (Error de conexión con IA)'}
                          </p>
                        </>
                      ) : (
                        <>
                          <strong>
                            <i className="bi bi-stars text-warning me-1"></i>
                            Recomendaciones generadas por IA
                          </strong>
                          <p className="mb-1 small">
                            Modelo: {recommendations.meta?.model} | 
                            Tiempo: {recommendations.meta?.generationTimeMs}ms
                          </p>
                        </>
                      )}
                    </div>
                    {recommendations.meta?.rateLimit && (
                      <small className="text-muted">
                        Solicitudes hoy: {recommendations.meta.rateLimit.requestsToday}/{recommendations.meta.rateLimit.dailyLimit} | 
                        Restantes: {recommendations.meta.rateLimit.remainingToday}
                      </small>
                    )}
                  </div>
                </div>
              </div>

              {/* Lista de recomendaciones */}
              <div className="row g-3">
                {recommendations.recommendations?.map((rec, index) => (
                  <div key={rec.id || index} className="col-12">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body">
                        <div className="d-flex align-items-start mb-3">
                          <span className={`badge bg-${getPriorityColor(rec.priority)} me-2`}>
                            {rec.priority === 'high' ? 'Alta prioridad' : 
                             rec.priority === 'medium' ? 'Prioridad media' : 
                             'Prioridad baja'}
                          </span>
                          <span className="badge bg-secondary">{getCategoryLabel(rec.category)}</span>
                        </div>
                        
                        <h5 className="card-title mb-3">
                          <i className="bi bi-lightbulb-fill text-warning me-2"></i>
                          {rec.title}
                        </h5>
                        
                        <div className="mb-3">
                          <h6 className="text-muted mb-2">
                            <i className="bi bi-eye me-2"></i>
                            Observación
                          </h6>
                          <p className="mb-0">{rec.observation}</p>
                        </div>
                        
                        <div className="bg-light rounded p-3">
                          <h6 className="text-primary mb-2">
                            <i className="bi bi-check-circle me-2"></i>
                            Sugerencia
                          </h6>
                          <p className="mb-0">{rec.suggestion}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              {recommendations.disclaimer && (
                <div className="alert alert-light border mt-4">
                  <small className="text-muted">
                    <i className="bi bi-shield-check me-2"></i>
                    {recommendations.disclaimer}
                  </small>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* TAB: Hallazgos */}
      {activeTab === 'findings' && (
        <>
          {loading.findings && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando hallazgos...</span>
              </div>
            </div>
          )}

          {error.findings && (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error.findings}
            </div>
          )}

          {findings && !loading.findings && (
            <div className="row g-3">
              {findings.findings?.map((finding, index) => (
                <div key={index} className="col-md-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-start mb-2">
                        <span className={`badge bg-${getSeverityColor(finding.severity)} me-2`}>
                          {getSeverityLabel(finding.severity)}
                        </span>
                        <span className="badge bg-light text-dark">{getCategoryLabel(finding.category)}</span>
                      </div>
                      
                      <h6 className="card-title">{finding.title}</h6>
                      <p className="card-text text-muted mb-0">{finding.observation}</p>
                    </div>
                  </div>
                </div>
              ))}

              {(!findings.findings || findings.findings.length === 0) && (
                <div className="col-12">
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    No se encontraron hallazgos para este período
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* TAB: Historial de Snapshots */}
      {activeTab === 'snapshots' && (
        <>
          {loading.snapshots && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando historial...</span>
              </div>
            </div>
          )}

          {error.snapshots && (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error.snapshots}
            </div>
          )}

          {!loading.snapshots && !error.snapshots && (
            <div className="row g-3">
              {snapshots.map((snapshot) => (
                <div key={snapshot.id} className="col-md-6">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h6 className="mb-1">
                            <i className="bi bi-calendar3 me-2"></i>
                            {formatDate(snapshot.createdAt)}
                          </h6>
                          <small className="text-muted">
                            {formatDateTime(snapshot.createdAt).split(',')[1]?.trim() || 'N/A'}
                          </small>
                        </div>
                        <span className={`badge ${snapshot.isAiGenerated ? 'bg-success' : 'bg-secondary'}`}>
                          {snapshot.isAiGenerated ? 'Con IA' : 'Básico'}
                        </span>
                      </div>
                      
                      <div className="mb-2">
                        <small className="text-muted">Período:</small>
                        <div className="small">
                          {snapshot.periodStart && snapshot.periodEnd ? (
                            <>
                              {formatDate(snapshot.periodStart)} - {formatDate(snapshot.periodEnd)}
                            </>
                          ) : (
                            'N/A'
                          )}
                        </div>
                      </div>

                      {snapshot.aiModel && (
                        <div className="mb-2">
                          <small className="text-muted">Modelo:</small>
                          <div className="small">{snapshot.aiModel}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {snapshots.length === 0 && (
                <div className="col-12">
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    No hay snapshots guardados aún. Las recomendaciones generadas se guardarán automáticamente.
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
