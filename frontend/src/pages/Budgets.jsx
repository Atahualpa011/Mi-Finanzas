import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Budgets() {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    alertThreshold: 80
  });

  // Cargar presupuestos y categorías
  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, []);

  const fetchBudgets = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/budgets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setBudgets(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar presupuestos:', error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      // Solo categorías de gasto
      setCategories(data.filter(c => c.type === 'expense'));
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.categoryId || !formData.amount || !formData.startDate) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingBudget 
        ? `/api/budgets/${editingBudget.id}`
        : '/api/budgets';
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

      alert(editingBudget ? 'Presupuesto actualizado' : 'Presupuesto creado exitosamente');
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
      const res = await fetch(`/api/budgets/${budgetId}`, {
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
      categoryId: budget.category_id,
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
      categoryId: '',
      amount: '',
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      alertThreshold: 80
    });
    setEditingBudget(null);
  };

  const handleNewBudget = () => {
    resetForm();
    setShowModal(true);
  };

  const getProgressColor = (status) => {
    if (status === 'exceeded') return 'danger';
    if (status === 'warning') return 'warning';
    return 'success';
  };

  const getPeriodLabel = (period) => {
    const labels = {
      monthly: 'Mensual',
      weekly: 'Semanal',
      yearly: 'Anual'
    };
    return labels[period] || period;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Mis Presupuestos</h2>
        <button className="btn btn-primary" onClick={handleNewBudget}>
          + Nuevo Presupuesto
        </button>
      </div>

      {budgets.length === 0 ? (
        <div className="alert alert-info">
          <h5>No tienes presupuestos creados</h5>
          <p className="mb-0">
            Crea tu primer presupuesto para controlar tus gastos por categoría y recibir alertas cuando te acerques al límite.
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {budgets.map(budget => (
            <div key={budget.id} className="col-md-6 col-lg-4">
              <div className="card h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <div>
                    <span 
                      className="badge rounded-pill me-2" 
                      style={{ backgroundColor: budget.category_color || '#6c757d' }}
                    >
                      {budget.category_name}
                    </span>
                    <span className="badge bg-secondary">{getPeriodLabel(budget.period)}</span>
                  </div>
                  <div className="dropdown">
                    <button 
                      className="btn btn-sm btn-link text-dark" 
                      data-bs-toggle="dropdown"
                    >
                      ⋮
                    </button>
                    <ul className="dropdown-menu">
                      <li>
                        <button className="dropdown-item" onClick={() => handleEdit(budget)}>
                          Editar
                        </button>
                      </li>
                      <li>
                        <button 
                          className="dropdown-item text-danger" 
                          onClick={() => handleDelete(budget.id)}
                        >
                          Eliminar
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="card-body">
                  {/* Montos */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted small">Gastado</span>
                      <span className="fw-bold">
                        ${budget.total_spent.toLocaleString('es-AR')} / ${budget.budget_amount.toLocaleString('es-AR')}
                      </span>
                    </div>
                    
                    {/* Barra de progreso */}
                    <div className="progress" style={{ height: '20px' }}>
                      <div 
                        className={`progress-bar bg-${getProgressColor(budget.status)}`}
                        role="progressbar"
                        style={{ width: `${Math.min(budget.percentage_used, 100)}%` }}
                      >
                        {budget.percentage_used}%
                      </div>
                    </div>
                  </div>

                  {/* Estado */}
                  {budget.status === 'exceeded' && (
                    <div className="alert alert-danger py-2 mb-2">
                      <small>
                        <strong>⚠️ Presupuesto excedido</strong>
                        <br />
                        Has superado el límite en ${Math.abs(budget.remaining).toLocaleString('es-AR')}
                      </small>
                    </div>
                  )}
                  
                  {budget.status === 'warning' && (
                    <div className="alert alert-warning py-2 mb-2">
                      <small>
                        <strong>⚡ Acercándose al límite</strong>
                        <br />
                        Te quedan ${budget.remaining.toLocaleString('es-AR')}
                      </small>
                    </div>
                  )}

                  {budget.status === 'ok' && (
                    <div className="alert alert-success py-2 mb-2">
                      <small>
                        <strong>✓ En control</strong>
                        <br />
                        Te quedan ${budget.remaining.toLocaleString('es-AR')}
                      </small>
                    </div>
                  )}

                  {/* Información adicional */}
                  <div className="text-muted small">
                    <div className="d-flex justify-content-between">
                      <span>Transacciones:</span>
                      <span>{budget.transaction_count}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Período:</span>
                      <span>
                        {new Date(budget.start_date).toLocaleDateString('es-AR')}
                        {budget.end_date && ` - ${new Date(budget.end_date).toLocaleDateString('es-AR')}`}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Alerta en:</span>
                      <span>{budget.alert_threshold}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para crear/editar presupuesto */}
      {showModal && (
        <>
          <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingBudget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => { setShowModal(false); resetForm(); }}
                  ></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    {/* Categoría */}
                    <div className="mb-3">
                      <label className="form-label">Categoría *</label>
                      <select 
                        className="form-select"
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        required
                      >
                        <option value="">Selecciona una categoría</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Monto */}
                    <div className="mb-3">
                      <label className="form-label">Monto del Presupuesto *</label>
                      <input 
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="Ej: 50000"
                        required
                      />
                    </div>

                    {/* Período */}
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

                    {/* Fechas */}
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
                        <label className="form-label">Fecha de Fin (Opcional)</label>
                        <input 
                          type="date"
                          className="form-control"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                        <small className="text-muted">Dejar vacío para presupuesto continuo</small>
                      </div>
                    </div>

                    {/* Umbral de alerta */}
                    <div className="mb-3">
                      <label className="form-label">
                        Umbral de Alerta ({formData.alertThreshold}%)
                      </label>
                      <input 
                        type="range"
                        className="form-range"
                        min="50"
                        max="100"
                        step="5"
                        value={formData.alertThreshold}
                        onChange={(e) => setFormData({ ...formData, alertThreshold: e.target.value })}
                      />
                      <small className="text-muted">
                        Recibirás una alerta al alcanzar el {formData.alertThreshold}% del presupuesto
                      </small>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => { setShowModal(false); resetForm(); }}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingBudget ? 'Actualizar' : 'Crear'} Presupuesto
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
