import { useEffect, useState } from 'react';

export default function BudgetAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, [showAll]);

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = showAll ? '/api/budgets/alerts/all' : '/api/budgets/alerts/all?unread=true';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAlerts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar alertas:', error);
      setLoading(false);
    }
  };

  const markAsRead = async (alertId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/budgets/alerts/${alertId}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAlerts();
    } catch (error) {
      console.error('Error al marcar alerta:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/budgets/alerts/read-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAlerts();
    } catch (error) {
      console.error('Error al marcar todas las alertas:', error);
    }
  };

  const getAlertIcon = (type) => {
    if (type === 'exceeded') return '●';
    if (type === 'threshold') return '⚠';
    return '▲';
  };

  const getAlertClass = (type) => {
    if (type === 'exceeded') return 'alert-danger';
    if (type === 'threshold') return 'alert-warning';
    return 'alert-info';
  };

  const unreadCount = alerts.filter(a => !a.is_read).length;

  if (loading) {
    return <div className="text-center py-3"><div className="spinner-border spinner-border-sm"></div></div>;
  }

  if (alerts.length === 0) {
    return null; // No mostrar nada si no hay alertas
  }

  return (
    <div className="card mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          Alertas de Presupuestos
          {unreadCount > 0 && (
            <span className="badge bg-danger ms-2">{unreadCount} nueva{unreadCount !== 1 ? 's' : ''}</span>
          )}
        </h5>
        <div>
          {unreadCount > 0 && (
            <button className="btn btn-sm btn-outline-primary me-2" onClick={markAllAsRead}>
              Marcar todas como leídas
            </button>
          )}
          <button 
            className="btn btn-sm btn-outline-secondary" 
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Solo no leídas' : 'Ver todas'}
          </button>
        </div>
      </div>
      <div className="card-body">
        {alerts.length === 0 ? (
          <p className="text-muted mb-0">No hay alertas {!showAll && 'sin leer'}</p>
        ) : (
          <div className="list-group list-group-flush">
            {alerts.map(alert => (
              <div 
                key={alert.id} 
                className={`list-group-item ${!alert.is_read ? 'border-start border-3 border-primary' : ''}`}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <div className={`alert ${getAlertClass(alert.alert_type)} mb-2 py-2`}>
                      <div className="d-flex align-items-start">
                        <span className="me-2" style={{ fontSize: '1.2rem' }}>
                          {getAlertIcon(alert.alert_type)}
                        </span>
                        <div className="flex-grow-1">
                          <strong>
                            {alert.category_name && `[${alert.category_name}] `}
                            {alert.group_name && `[Grupo: ${alert.group_name}] `}
                          </strong>
                          <div>{alert.message}</div>
                          <small className="text-muted">
                            {new Date(alert.created_at).toLocaleString('es-AR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                  {!alert.is_read && (
                    <button 
                      className="btn btn-sm btn-outline-primary ms-3"
                      onClick={() => markAsRead(alert.id)}
                      title="Marcar como leída"
                    >
                      ✓
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
