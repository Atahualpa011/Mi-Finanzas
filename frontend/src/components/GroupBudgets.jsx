import { useState, useEffect } from 'react';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

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

    if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      alert('La fecha de fin no puede ser anterior a la fecha de inicio');
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
    return (
      <div className="text-center" style={{ padding: 'var(--spacing-xl)' }}>
        <div
          className="spinner-border"
          style={{
            width: '2rem',
            height: '2rem',
            color: 'var(--primary)'
          }}
          role="status"
        >
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 'var(--spacing-xl)'
      }}
    >
      <div
        className="card-header d-flex justify-content-between align-items-center"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-light)',
          padding: 'var(--spacing-lg)'
        }}
      >
        <h5
          style={{
            marginBottom: 0,
            fontWeight: '600',
            color: 'var(--text-primary)',
            fontSize: '1.1rem'
          }}
        >
          <i className="bi bi-wallet2 me-2" style={{ color: 'var(--primary)' }}></i>
          Presupuestos del Grupo
        </h5>
        <button
          className="btn"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-xs) var(--spacing-md)',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
          onClick={() => { resetForm(); setShowModal(true); }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'var(--primary-dark)';
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = 'var(--shadow-md)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'var(--primary)';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <i className="bi bi-plus-lg me-1"></i>
          Nuevo Presupuesto
        </button>
      </div>
      <div className="card-body" style={{ padding: 'var(--spacing-xl)' }}>
        {budgets.length === 0 ? (
          <div
            className="text-center"
            style={{
              padding: 'var(--spacing-2xl)',
              backgroundColor: 'var(--info-light)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--info)'
            }}
          >
            <i
              className="bi bi-wallet2"
              style={{
                fontSize: '3rem',
                color: 'var(--info)',
                marginBottom: 'var(--spacing-md)'
              }}
            ></i>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 0 }}>
              No hay presupuestos creados. Crea uno para controlar los gastos del grupo.
            </p>
          </div>
        ) : (
          <div className="row g-3">
            {budgets.map(budget => (
              <div key={budget.id} className="col-md-6">
                <div
                  style={{
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-lg)',
                    transition: 'all var(--transition-fast)',
                    overflow: 'visible'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-light)',
                          marginRight: 'var(--spacing-xs)',
                          fontSize: '0.75rem',
                          padding: '4px 8px'
                        }}
                      >
                        {getPeriodLabel(budget.period)}
                      </span>
                      {budget.status === 'exceeded' && (
                        <span
                          className="badge"
                          style={{
                            backgroundColor: 'var(--danger)',
                            color: 'white',
                            fontSize: '0.75rem',
                            padding: '4px 8px'
                          }}
                        >
                          Excedido
                        </span>
                      )}
                      {budget.status === 'warning' && (
                        <span
                          className="badge"
                          style={{
                            backgroundColor: 'var(--warning)',
                            color: 'white',
                            fontSize: '0.75rem',
                            padding: '4px 8px'
                          }}
                        >
                          Advertencia
                        </span>
                      )}
                      {budget.status === 'ok' && (
                        <span
                          className="badge"
                          style={{
                            backgroundColor: 'var(--success)',
                            color: 'white',
                            fontSize: '0.75rem',
                            padding: '4px 8px'
                          }}
                        >
                          OK
                        </span>
                      )}
                    </div>
                    <div className="dropdown" style={{ overflow: 'visible' }}>
                      <button
                        className="btn btn-sm"
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          padding: '0',
                          fontSize: '1.25rem',
                          lineHeight: '1'
                        }}
                        data-bs-toggle="dropdown"
                      >
                        <i className="bi bi-three-dots-vertical"></i>
                      </button>
                      <ul className="dropdown-menu">
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => handleEdit(budget)}
                            style={{ fontSize: '0.875rem' }}
                          >
                            <i className="bi bi-pencil me-2"></i>
                            Editar
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item text-danger"
                            onClick={() => handleDelete(budget.id)}
                            style={{ fontSize: '0.875rem' }}
                          >
                            <i className="bi bi-trash me-2"></i>
                            Eliminar
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Montos */}
                  <div style={{ marginBottom: 'var(--spacing-md)' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 'var(--spacing-xs)',
                        fontSize: '0.875rem'
                      }}
                    >
                      <span style={{ color: 'var(--text-secondary)' }}>Gastado</span>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                        ${budget.total_spent.toLocaleString('es-AR')} / ${budget.budget_amount.toLocaleString('es-AR')}
                      </span>
                    </div>

                    {/* Barra de progreso */}
                    <div
                      className="progress"
                      style={{
                        height: '24px',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      <div
                        className="progress-bar"
                        style={{
                          width: `${Math.min(budget.percentage_used, 100)}%`,
                          backgroundColor: budget.status === 'exceeded' ? 'var(--danger)' : budget.status === 'warning' ? 'var(--warning)' : 'var(--success)',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {budget.percentage_used}%
                      </div>
                    </div>
                  </div>

                  {/* Info adicional */}
                  <div style={{ fontSize: '0.875rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 'var(--spacing-xs)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      <span>
                        <i className="bi bi-cart me-1"></i>
                        Gastos:
                      </span>
                      <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                        {budget.expense_count}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 'var(--spacing-xs)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      <span>
                        <i className="bi bi-piggy-bank me-1"></i>
                        Restante:
                      </span>
                      <span
                        style={{
                          fontWeight: budget.remaining < 0 ? '700' : '500',
                          color: budget.remaining < 0 ? 'var(--danger)' : 'var(--text-primary)'
                        }}
                      >
                        ${Math.abs(budget.remaining).toLocaleString('es-AR')}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      <span>
                        <i className="bi bi-calendar-range me-1"></i>
                        Período:
                      </span>
                      <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
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
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => {
            if (e.target.className.includes('modal d-block')) {
              setShowModal(false);
              resetForm();
            }
          }}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div
              className="modal-content"
              style={{
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-xl)'
              }}
            >
              <div
                className="modal-header"
                style={{
                  borderBottom: '1px solid var(--border-light)',
                  padding: 'var(--spacing-lg)',
                  backgroundColor: 'var(--bg-secondary)'
                }}
              >
                <h5
                  className="modal-title"
                  style={{
                    fontWeight: '600',
                    color: 'var(--text-primary)'
                  }}
                >
                  <i className="bi bi-wallet2 me-2" style={{ color: 'var(--primary)' }}></i>
                  {editingBudget ? 'Editar' : 'Nuevo'} Presupuesto Grupal
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => { setShowModal(false); resetForm(); }}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body" style={{ padding: 'var(--spacing-xl)' }}>
                  <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <label
                      className="form-label"
                      style={{
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        fontSize: '0.875rem',
                        marginBottom: 'var(--spacing-xs)'
                      }}
                    >
                      <i className="bi bi-cash-stack me-1"></i>
                      Monto Total <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      style={{
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.95rem'
                      }}
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="Ej: 100000"
                      required
                    />
                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                      Presupuesto total del grupo para este período
                    </small>
                  </div>

                  <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <label
                      className="form-label"
                      style={{
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        fontSize: '0.875rem',
                        marginBottom: 'var(--spacing-xs)'
                      }}
                    >
                      <i className="bi bi-calendar-event me-1"></i>
                      Período <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <select
                      className="form-select"
                      style={{
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.95rem'
                      }}
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
                    <div className="col-md-6" style={{ marginBottom: 'var(--spacing-lg)' }}>
                      <label
                        className="form-label"
                        style={{
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          fontSize: '0.875rem',
                          marginBottom: 'var(--spacing-xs)'
                        }}
                      >
                        <i className="bi bi-calendar3 me-1"></i>
                        Fecha de Inicio <span style={{ color: 'var(--danger)' }}>*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        style={{
                          border: '1px solid var(--border-light)',
                          borderRadius: 'var(--radius-md)',
                          padding: 'var(--spacing-sm) var(--spacing-md)',
                          backgroundColor: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.95rem'
                        }}
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6" style={{ marginBottom: 'var(--spacing-lg)' }}>
                      <label
                        className="form-label"
                        style={{
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          fontSize: '0.875rem',
                          marginBottom: 'var(--spacing-xs)'
                        }}
                      >
                        <i className="bi bi-calendar-check me-1"></i>
                        Fecha de Fin
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        style={{
                          border: '1px solid var(--border-light)',
                          borderRadius: 'var(--radius-md)',
                          padding: 'var(--spacing-sm) var(--spacing-md)',
                          backgroundColor: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.95rem'
                        }}
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="form-label"
                      style={{
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        fontSize: '0.875rem',
                        marginBottom: 'var(--spacing-sm)'
                      }}
                    >
                      <i className="bi bi-exclamation-triangle me-1"></i>
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
                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                      Alerta al alcanzar el {formData.alertThreshold}% del presupuesto
                    </small>
                  </div>
                </div>
                <div
                  className="modal-footer"
                  style={{
                    borderTop: '1px solid var(--border-light)',
                    padding: 'var(--spacing-lg)',
                    backgroundColor: 'var(--bg-secondary)'
                  }}
                >
                  <button
                    type="button"
                    className="btn"
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--spacing-xs) var(--spacing-md)',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                    onClick={() => { setShowModal(false); resetForm(); }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'var(--bg-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn"
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--spacing-xs) var(--spacing-lg)',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'var(--primary-dark)';
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = 'var(--shadow-md)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'var(--primary)';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <i className="bi bi-check-circle me-2"></i>
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
