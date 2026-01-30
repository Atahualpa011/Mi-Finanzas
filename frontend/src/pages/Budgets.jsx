import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BudgetAlerts from '../components/BudgetAlerts';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import HelpButton from '../components/HelpButton';
import { HELP_CONTENTS } from '../utils/helpContents';

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
    alertThreshold: 80,
    isEmotional: false,
    emotionFilter: ''
  });

  // Lista de emociones disponibles (NUEVO)
  const EMOTIONS = [
    'Felicidad', 'Alivio', 'Orgullo', 'Generosidad/Amor', 'Emocion/Entusiasmo',
    'Culpa', 'Ansiedad/Estres', 'Arrepentimiento', 'Frustracion', 'Verguenza',
    'Indiferencia', 'Ambivalencia'
  ];

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
    
    // Validaciones según tipo de presupuesto
    if (formData.isEmotional && !formData.emotionFilter) {
      alert('Por favor selecciona una emoción para el presupuesto emocional');
      return;
    }
    
    if (!formData.isEmotional && !formData.categoryId) {
      alert('Por favor selecciona una categoría para el presupuesto normal');
      return;
    }
    
    if (!formData.amount || !formData.startDate) {
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
      categoryId: budget.category_id || '',
      amount: budget.budget_amount,
      period: budget.period,
      startDate: budget.start_date,
      endDate: budget.end_date || '',
      alertThreshold: budget.alert_threshold,
      isEmotional: budget.is_emotional || false,
      emotionFilter: budget.emotion_filter || ''
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
      alertThreshold: 80,
      isEmotional: false,
      emotionFilter: ''
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
        <div className="spinner-border" style={{ color: 'var(--primary)', width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3" style={{ color: 'var(--text-secondary)' }}>Cargando presupuestos...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Botón de ayuda */}
      <div className="mb-3">
        <HelpButton section="budgets" helpContent={HELP_CONTENTS.budgets} />
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 
            className="mb-1" 
            style={{ 
              fontWeight: '700', 
              color: 'var(--text-primary)',
              fontSize: '1.75rem'
            }}
          >
            <i className="bi bi-wallet2 me-2" style={{ color: 'var(--primary)' }}></i>
            Mis Presupuestos
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: 0 }}>
            Controla tus gastos por categoría
          </p>
        </div>
        <button 
          className="btn"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-sm) var(--spacing-lg)',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            boxShadow: 'var(--shadow-sm)'
          }}
          onClick={handleNewBudget}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'var(--primary-dark)';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = 'var(--shadow-md)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'var(--primary)';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'var(--shadow-sm)';
          }}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Nuevo Presupuesto
        </button>
      </div>

      {/* Alertas de presupuestos */}
      <BudgetAlerts />

      {budgets.length === 0 ? (
        <div 
          className="alert"
          style={{
            backgroundColor: 'var(--info-light)',
            border: '1px solid var(--info)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-xl)'
          }}
        >
          <div className="text-center">
            <i className="bi bi-wallet2" style={{ fontSize: '3rem', color: 'var(--info)' }}></i>
            <h5 className="mt-3 mb-2" style={{ color: 'var(--info)', fontWeight: '600' }}>
              No tienes presupuestos creados
            </h5>
            <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>
              Crea tu primer presupuesto para controlar tus gastos por categoría y recibir alertas cuando te acerques al límite.
            </p>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {budgets.map(budget => (
            <div key={budget.id} className="col-md-6 col-lg-4">
              <div 
                className="card h-100"
                style={{
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-sm)',
                  overflow: 'hidden',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div 
                  className="card-header d-flex justify-content-between align-items-center"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderBottom: '1px solid var(--border-light)',
                    padding: 'var(--spacing-md)'
                  }}
                >
                  <div>
                    {budget.is_emotional ? (
                      <span 
                        className="badge rounded-pill me-2" 
                        style={{ 
                          backgroundColor: '#6f42c1',
                          color: 'white',
                          padding: '0.375rem 0.875rem',
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}
                      >
                        <i className="bi bi-emoji-smile-fill me-1"></i>
                        {budget.emotion_filter}
                      </span>
                    ) : (
                      <span 
                        className="badge rounded-pill me-2" 
                        style={{ 
                          backgroundColor: budget.category_color || '#6c757d',
                          color: 'white',
                          padding: '0.375rem 0.875rem',
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}
                      >
                        <i className="bi bi-tag-fill me-1"></i>
                        {budget.category_name}
                      </span>
                    )}
                    <span 
                      className="badge"
                      style={{
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        padding: '0.375rem 0.875rem',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}
                    >
                      <i className="bi bi-calendar-range me-1"></i>
                      {getPeriodLabel(budget.period)}
                    </span>
                  </div>
                  <div className="dropdown">
                    <button 
                      className="btn btn-sm"
                      data-bs-toggle="dropdown"
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        fontSize: '1.2rem',
                        padding: '0.25rem 0.5rem',
                        cursor: 'pointer'
                      }}
                    >
                      <i className="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li>
                        <button 
                          className="dropdown-item"
                          onClick={() => handleEdit(budget)}
                          style={{
                            color: 'var(--text-primary)',
                            fontSize: '0.875rem'
                          }}
                        >
                          <i className="bi bi-pencil me-2"></i>
                          Editar
                        </button>
                      </li>
                      <li>
                        <button 
                          className="dropdown-item"
                          onClick={() => handleDelete(budget.id)}
                          style={{
                            color: 'var(--danger)',
                            fontSize: '0.875rem'
                          }}
                        >
                          <i className="bi bi-trash me-2"></i>
                          Eliminar
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="card-body" style={{ padding: 'var(--spacing-lg)' }}>
                  {/* Montos */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500' }}>
                        Gastado
                      </span>
                      <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                        ${budget.total_spent.toLocaleString('es-AR')} / ${budget.budget_amount.toLocaleString('es-AR')}
                      </span>
                    </div>
                    
                    {/* Barra de progreso */}
                    <div 
                      className="progress" 
                      style={{ 
                        height: '24px',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden'
                      }}
                    >
                      <div 
                        className="progress-bar"
                        role="progressbar"
                        style={{ 
                          width: `${Math.min(budget.percentage_used, 100)}%`,
                          backgroundColor: 
                            budget.status === 'exceeded' ? 'var(--danger)' :
                            budget.status === 'warning' ? 'var(--warning)' : 
                            'var(--success)',
                          transition: 'width var(--transition-base)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '600',
                          fontSize: '0.8rem',
                          color: budget.status === 'warning' ? 'var(--text-primary)' : 'white'
                        }}
                      >
                        {budget.percentage_used}%
                      </div>
                    </div>
                  </div>

                  {/* Estado */}
                  {budget.status === 'exceeded' && (
                    <div 
                      className="alert py-2 mb-3"
                      style={{
                        backgroundColor: 'var(--danger-light)',
                        border: '1px solid var(--danger)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--spacing-md)'
                      }}
                    >
                      <small style={{ color: 'var(--danger)' }}>
                        <strong>
                          <i className="bi bi-exclamation-triangle-fill me-1"></i>
                          Presupuesto excedido
                        </strong>
                        <br />
                        Has superado el límite en ${Math.abs(budget.remaining).toLocaleString('es-AR')}
                      </small>
                    </div>
                  )}
                  
                  {budget.status === 'warning' && (
                    <div 
                      className="alert py-2 mb-3"
                      style={{
                        backgroundColor: 'var(--warning-light)',
                        border: '1px solid var(--warning)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--spacing-md)'
                      }}
                    >
                      <small style={{ color: '#856404' }}>
                        <strong>
                          <i className="bi bi-exclamation-circle-fill me-1"></i>
                          Acercándose al límite
                        </strong>
                        <br />
                        Te quedan ${budget.remaining.toLocaleString('es-AR')}
                      </small>
                    </div>
                  )}

                  {budget.status === 'ok' && (
                    <div 
                      className="alert py-2 mb-3"
                      style={{
                        backgroundColor: 'var(--success-light)',
                        border: '1px solid var(--success)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--spacing-md)'
                      }}
                    >
                      <small style={{ color: 'var(--success)' }}>
                        <strong>
                          <i className="bi bi-check-circle-fill me-1"></i>
                          En control
                        </strong>
                        <br />
                        Te quedan ${budget.remaining.toLocaleString('es-AR')}
                      </small>
                    </div>
                  )}

                  {/* Información adicional */}
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <div className="d-flex justify-content-between mb-2">
                      <span>
                        <i className="bi bi-list-check me-1"></i>
                        Transacciones:
                      </span>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                        {budget.transaction_count}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>
                        <i className="bi bi-calendar-event me-1"></i>
                        Período:
                      </span>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                        {new Date(budget.start_date).toLocaleDateString('es-AR')}
                        {budget.end_date && ` - ${new Date(budget.end_date).toLocaleDateString('es-AR')}`}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>
                        <i className="bi bi-bell me-1"></i>
                        Alerta en:
                      </span>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                        {budget.alert_threshold}%
                      </span>
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
              <div 
                className="modal-content"
                style={{
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)'
                }}
              >
                <div 
                  className="modal-header"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderBottom: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                    padding: 'var(--spacing-lg)'
                  }}
                >
                  <h5 
                    className="modal-title"
                    style={{
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      fontSize: '1.1rem'
                    }}
                  >
                    <i className={`bi ${editingBudget ? 'bi-pencil' : 'bi-plus-circle'} me-2`} style={{ color: 'var(--primary)' }}></i>
                    {editingBudget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => { setShowModal(false); resetForm(); }}
                  ></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body" style={{ padding: 'var(--spacing-lg)' }}>
                    {/* Tipo de presupuesto (NUEVO) */}
                    <div className="mb-3">
                      <div className="form-check" style={{ padding: 'var(--spacing-sm)' }}>
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="isEmotionalCheck"
                          checked={formData.isEmotional}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            isEmotional: e.target.checked,
                            categoryId: e.target.checked ? '' : formData.categoryId,
                            emotionFilter: e.target.checked ? formData.emotionFilter : ''
                          })}
                          style={{ cursor: 'pointer' }}
                        />
                        <label 
                          className="form-check-label" 
                          htmlFor="isEmotionalCheck"
                          style={{ 
                            cursor: 'pointer',
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                            fontSize: '0.95rem'
                          }}
                        >
                          <i className="bi bi-emoji-smile me-2" style={{ color: '#6f42c1' }}></i>
                          Presupuesto Emocional
                        </label>
                        <small className="form-text d-block ms-4" style={{ color: 'var(--text-secondary)' }}>
                          Controla gastos asociados a una emoción específica (ej: Ansiedad/Estrés)
                        </small>
                      </div>
                    </div>

                    {/* Selector de emoción (solo si es emocional) */}
                    {formData.isEmotional && (
                      <div className="mb-3">
                        <label 
                          className="form-label" 
                          style={{ 
                            fontWeight: '600', 
                            color: 'var(--text-primary)', 
                            fontSize: '0.875rem',
                            marginBottom: 'var(--spacing-xs)'
                          }}
                        >
                          <i className="bi bi-emoji-smile me-1" style={{ color: '#6f42c1' }}></i>
                          Emoción a Controlar <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <select 
                          className="form-select"
                          style={{
                            border: '2px solid #6f42c1',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            backgroundColor: '#f8f0ff',
                            color: 'var(--text-primary)',
                            fontSize: '0.95rem',
                            transition: 'all var(--transition-fast)'
                          }}
                          value={formData.emotionFilter}
                          onChange={(e) => setFormData({ ...formData, emotionFilter: e.target.value })}
                          required={formData.isEmotional}
                        >
                          <option value="">Selecciona una emoción</option>
                          {EMOTIONS.map(emotion => (
                            <option key={emotion} value={emotion}>{emotion}</option>
                          ))}
                        </select>
                        <small className="form-text" style={{ color: '#6f42c1' }}>
                          <i className="bi bi-info-circle me-1"></i>
                          Solo se contarán gastos con esta emoción registrada
                        </small>
                      </div>
                    )}

                    {/* Categoría (solo si NO es emocional) */}
                    {!formData.isEmotional && (
                      <div className="mb-3">
                        <label 
                          className="form-label" 
                          style={{ 
                            fontWeight: '600', 
                            color: 'var(--text-primary)', 
                            fontSize: '0.875rem',
                            marginBottom: 'var(--spacing-xs)'
                          }}
                        >
                          <i className="bi bi-tag me-1"></i>
                          Categoría <span style={{ color: 'var(--danger)' }}>*</span>
                        </label>
                        <select 
                          className="form-select"
                          style={{
                            border: '1px solid var(--border-light)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            fontSize: '0.95rem',
                            transition: 'all var(--transition-fast)'
                          }}
                          value={formData.categoryId}
                          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                          required={!formData.isEmotional}
                        >
                          <option value="">Selecciona una categoría</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Monto */}
                    <div className="mb-3">
                      <label 
                        className="form-label" 
                        style={{ 
                          fontWeight: '600', 
                          color: 'var(--text-primary)', 
                          fontSize: '0.875rem',
                          marginBottom: 'var(--spacing-xs)'
                        }}
                      >
                        <i className="bi bi-currency-dollar me-1"></i>
                        Monto del Presupuesto <span style={{ color: 'var(--danger)' }}>*</span>
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
                          fontSize: '0.95rem',
                          transition: 'all var(--transition-fast)'
                        }}
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="Ej: 50000"
                        required
                      />
                    </div>

                    {/* Período */}
                    <div className="mb-3">
                      <label 
                        className="form-label" 
                        style={{ 
                          fontWeight: '600', 
                          color: 'var(--text-primary)', 
                          fontSize: '0.875rem',
                          marginBottom: 'var(--spacing-xs)'
                        }}
                      >
                        <i className="bi bi-calendar-range me-1"></i>
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
                          fontSize: '0.95rem',
                          transition: 'all var(--transition-fast)'
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

                    {/* Fechas */}
                    <div className="row">
                      <div className="col-md-6 mb-3">
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
                            fontSize: '0.95rem',
                            transition: 'all var(--transition-fast)'
                          }}
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
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
                            fontSize: '0.95rem',
                            transition: 'all var(--transition-fast)'
                          }}
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                        <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          Dejar vacío para presupuesto continuo
                        </small>
                      </div>
                    </div>

                    {/* Umbral de alerta */}
                    <div className="mb-3">
                      <label 
                        className="form-label" 
                        style={{ 
                          fontWeight: '600', 
                          color: 'var(--text-primary)', 
                          fontSize: '0.875rem',
                          marginBottom: 'var(--spacing-xs)'
                        }}
                      >
                        <i className="bi bi-bell me-1"></i>
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
                      <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        <i className="bi bi-info-circle me-1"></i>
                        Recibirás una alerta al alcanzar el {formData.alertThreshold}% del presupuesto
                      </small>
                    </div>
                  </div>
                  <div 
                    className="modal-footer"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderTop: '1px solid var(--border-light)',
                      borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                      padding: 'var(--spacing-lg)'
                    }}
                  >
                    <button 
                      type="button" 
                      className="btn-secondary-custom"
                      style={{
                        padding: '0.5rem 1.25rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      onClick={() => { setShowModal(false); resetForm(); }}
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
                        padding: '0.5rem 1.5rem',
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
                      <i className={`bi ${editingBudget ? 'bi-check-circle' : 'bi-plus-circle'} me-1`}></i>
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
