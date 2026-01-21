import { useState, useEffect } from 'react';

export default function GroupBudgets({ groupId }) {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  
  const [formData, setFormData] = useState({
    amount: '',
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    alertThreshold: 80
  });

  useEffect(() => {
    fetchBudgets();
  }, [groupId]);

  const fetchBudgets = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/groups/${groupId}/budgets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setBudgets(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar presupuestos del grupo:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.startDate) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingBudget 
        ? `/api/groups/${groupId}/budgets/${editingBudget.id}`
        : `/api/groups/${groupId}/budgets`;
      const method = editingBudget ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Error al guardar presupuesto');
        return;
      }

      alert(editingBudget ? 'Presupuesto actualizado' : 'Presupuesto grupal creado exitosamente');
      setShowModal(false);
      resetForm();
      fetchBudgets();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar presupuesto');
    }
  };

  const handleDelete = async (budgetId) => {
    if (!window.confirm('¿Eliminar este presupuesto?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/groups/${groupId}/budgets/${budgetId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Error al eliminar presupuesto');
        return;
      }

      alert('Presupuesto eliminado');
      fetchBudgets();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar presupuesto');
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      amount: budget.budget_amount,
      period: budget.period,
      startDate: budget.start_date,
      endDate: budget.end_date || '',
      alertThreshold: budget.alert_threshold
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      alertThreshold: 80
    });
    setEditingBudget(null);
  };

  const getProgressColor = (status) => {
    if (status === 'exceeded') return 'danger';
    if (status === 'warning') return 'warning';
    return 'success';
  };

  const getPeriodLabel = (period) => {
    const labels = { monthly: 'Mensual', weekly: 'Semanal', yearly: 'Anual' };
    return labels[period] || period;
  };

  if (loading) {
    return <div className="text-center py-3"><div className="spinner-border spinner-border-sm"></div></div>;
  }

  return (
    <div className="card mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">💰 Presupuestos del Grupo</h5>
        <button className="btn btn-sm btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          + Nuevo
        </button>
      </div>
      <div className="card-body">
        {budgets.length === 0 ? (
          <p className="text-muted mb-0">
            No hay presupuestos creados. Crea uno para controlar los gastos del grupo.
          </p>
        ) : (
          <div className="row g-3">
            {budgets.map(budget => (
              <div key={budget.id} className="col-md-6">
                <div className="border rounded p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <span className="badge bg-secondary me-2">{getPeriodLabel(budget.period)}</span>
                      {budget.status === 'exceeded' && <span className="badge bg-danger">Excedido</span>}
                      {budget.status === 'warning' && <span className="badge bg-warning">Advertencia</span>}
                      {budget.status === 'ok' && <span className="badge bg-success">OK</span>}
                    </div>
                    <div className="dropdown">
                      <button className="btn btn-sm btn-link text-dark p-0" data-bs-toggle="dropdown">⋮</button>
                      <ul className="dropdown-menu">
                        <li><button className="dropdown-item" onClick={() => handleEdit(budget)}>Editar</button></li>
                        <li><button className="dropdown-item text-danger" onClick={() => handleDelete(budget.id)}>Eliminar</button></li>
                      </ul>
                    </div>
                  </div>

                  {/* Montos */}
                  <div className="mb-2">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted small">Gastado</span>
                      <span className="fw-bold small">
                        ${budget.total_spent.toLocaleString('es-AR')} / ${budget.budget_amount.toLocaleString('es-AR')}
                      </span>
                    </div>
                    
                    {/* Barra de progreso */}
                    <div className="progress" style={{ height: '15px' }}>
                      <div 
                        className={`progress-bar bg-${getProgressColor(budget.status)}`}
                        style={{ width: `${Math.min(budget.percentage_used, 100)}%` }}
                      >
                        <small>{budget.percentage_used}%</small>
                      </div>
                    </div>
                  </div>

                  {/* Info adicional */}
                  <div className="text-muted small">
                    <div className="d-flex justify-content-between">
                      <span>Gastos:</span>
                      <span>{budget.expense_count}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Restante:</span>
                      <span className={budget.remaining < 0 ? 'text-danger fw-bold' : ''}>
                        ${Math.abs(budget.remaining).toLocaleString('es-AR')}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Período:</span>
                      <span>
                        {new Date(budget.start_date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                        {budget.end_date && ` - ${new Date(budget.end_date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingBudget ? 'Editar' : 'Nuevo'} Presupuesto Grupal</h5>
                <button type="button" className="btn-close" onClick={() => { setShowModal(false); resetForm(); }}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Monto Total *</label>
                    <input 
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="Ej: 100000"
                      required
                    />
                    <small className="text-muted">Presupuesto total del grupo para este período</small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Período *</label>
                    <select 
                      className="form-select"
                      value={formData.period}
                      onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                      required
                    >
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensual</option>
                      <option value="yearly">Anual</option>
                    </select>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Fecha de Inicio *</label>
                      <input 
                        type="date"
                        className="form-control"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Fecha de Fin</label>
                      <input 
                        type="date"
                        className="form-control"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Umbral de Alerta ({formData.alertThreshold}%)</label>
                    <input 
                      type="range"
                      className="form-range"
                      min="50"
                      max="100"
                      step="5"
                      value={formData.alertThreshold}
                      onChange={(e) => setFormData({ ...formData, alertThreshold: e.target.value })}
                    />
                    <small className="text-muted">Alerta al alcanzar el {formData.alertThreshold}% del presupuesto</small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingBudget ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
