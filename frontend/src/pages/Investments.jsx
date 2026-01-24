import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../hooks/useCurrency';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

export default function Investments() {
  const navigate = useNavigate();
  const { CURRENCIES } = useCurrency();
  const [investments, setInvestments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    type: 'plazo_fijo',
    name: '',
    description: '',
    initialAmount: '',
    currencyCode: 'ARS',
    currencySymbol: '$',
    platform: '',
    investmentDate: new Date().toISOString().split('T')[0]
  });

  // Estado para Fase 2: Valuaciones
  const [showValuationModal, setShowValuationModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [valuations, setValuations] = useState([]);
  const [loadingValuations, setLoadingValuations] = useState(false);
  const [valuationForm, setValuationForm] = useState({
    valuationDate: new Date().toISOString().split('T')[0],
    currentValue: '',
    notes: ''
  });
  const [closeForm, setCloseForm] = useState({
    closeDate: new Date().toISOString().split('T')[0],
    finalAmount: ''
  });

  // Estado para Fase 3: Filtros
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    searchTerm: ''
  });

  // Tipos de inversión con iconos y nombres
  const investmentTypes = {
    plazo_fijo: { icon: 'bi-bank', label: 'Plazo Fijo', color: 'var(--info)' },
    acciones: { icon: 'bi-graph-up', label: 'Acciones', color: 'var(--success)' },
    cripto: { icon: 'bi-currency-bitcoin', label: 'Criptomonedas', color: 'var(--warning)' },
    fondos: { icon: 'bi-pie-chart', label: 'Fondos Comunes', color: 'var(--primary)' },
    bonos: { icon: 'bi-receipt', label: 'Bonos', color: 'var(--secondary)' },
    inmuebles: { icon: 'bi-building', label: 'Inmuebles', color: 'var(--danger)' },
    otros: { icon: 'bi-box', label: 'Otros', color: 'var(--text-secondary)' }
  };

  // Cargar inversiones y resumen
  useEffect(() => {
    fetchInvestments();
    fetchSummary();
  }, []);

  const fetchInvestments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/investments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setInvestments(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar inversiones:', error);
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/investments/summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSummary(data);
    } catch (error) {
      console.error('Error al cargar resumen:', error);
    }
  };

  // Abrir modal para crear/editar
  const openModal = (investment = null) => {
    if (investment) {
      setEditingInvestment(investment);
      setFormData({
        type: investment.type,
        name: investment.name,
        description: investment.description || '',
        initialAmount: investment.initial_amount,
        currencyCode: investment.currency_code,
        currencySymbol: investment.currency_symbol,
        platform: investment.platform || '',
        investmentDate: investment.investment_date
      });
    } else {
      setEditingInvestment(null);
      setFormData({
        type: 'plazo_fijo',
        name: '',
        description: '',
        initialAmount: '',
        currencyCode: 'ARS',
        currencySymbol: '$',
        platform: '',
        investmentDate: new Date().toISOString().split('T')[0]
      });
    }
    setShowModal(true);
  };

  // Guardar inversión (crear o editar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      if (editingInvestment) {
        // Editar inversión existente
        const res = await fetch(`/api/investments/${editingInvestment.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            platform: formData.platform
          })
        });
        
        if (!res.ok) throw new Error('Error al actualizar inversión');
      } else {
        // Crear nueva inversión
        const res = await fetch('/api/investments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        
        if (!res.ok) throw new Error('Error al crear inversión');
      }
      
      setShowModal(false);
      fetchInvestments();
      fetchSummary();
    } catch (error) {
      console.error('Error al guardar inversión:', error);
      alert('No se pudo guardar la inversión');
    }
  };

  // Eliminar inversión
  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta inversión? Esta acción no se puede revertir.')) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/investments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Error al eliminar inversión');
      
      fetchInvestments();
      fetchSummary();
    } catch (error) {
      console.error('Error al eliminar inversión:', error);
      alert('No se pudo eliminar la inversión');
    }
  };

  // Actualizar moneda seleccionada
  const handleCurrencyChange = (code) => {
    const currency = CURRENCIES.find(c => c.code === code);
    setFormData({
      ...formData,
      currencyCode: code,
      currencySymbol: currency.symbol
    });
  };

  // ============ FASE 2: FUNCIONES DE VALUACIONES ============
  
  // Abrir modal de actualizar valor
  const openValuationModal = (investment) => {
    setSelectedInvestment(investment);
    setValuationForm({
      valuationDate: new Date().toISOString().split('T')[0],
      currentValue: investment.current_value,
      notes: ''
    });
    setShowValuationModal(true);
  };

  // Crear nueva valuación
  const handleCreateValuation = async (e) => {
    e.preventDefault();
    
    if (!valuationForm.currentValue || parseFloat(valuationForm.currentValue) < 0) {
      alert('El valor actual debe ser mayor o igual a 0');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/investments/${selectedInvestment.id}/valuations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          valuationDate: valuationForm.valuationDate,
          currentValue: parseFloat(valuationForm.currentValue),
          notes: valuationForm.notes
        })
      });

      if (res.ok) {
        setShowValuationModal(false);
        fetchInvestments();
        fetchSummary();
        alert('✅ Valor actualizado exitosamente');
      } else {
        const error = await res.json();
        alert(`Error: ${error.message || 'No se pudo actualizar el valor'}`);
      }
    } catch (error) {
      console.error('Error al crear valuación:', error);
      alert('Error al actualizar el valor');
    }
  };

  // Abrir modal de historial
  const openHistoryModal = async (investment) => {
    setSelectedInvestment(investment);
    setShowHistoryModal(true);
    setLoadingValuations(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/investments/${investment.id}/valuations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setValuations(data);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setLoadingValuations(false);
    }
  };

  // Abrir modal de cerrar inversión
  const openCloseModal = (investment) => {
    setSelectedInvestment(investment);
    setCloseForm({
      closeDate: new Date().toISOString().split('T')[0],
      finalAmount: investment.current_value
    });
    setShowCloseModal(true);
  };

  // Cerrar inversión
  const handleCloseInvestment = async (e) => {
    e.preventDefault();

    if (!closeForm.finalAmount || parseFloat(closeForm.finalAmount) < 0) {
      alert('El monto final debe ser mayor o igual a 0');
      return;
    }

    if (!window.confirm(`¿Está seguro de cerrar la inversión "${selectedInvestment.name}"? Esta acción no se puede revertir.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/investments/${selectedInvestment.id}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          closeDate: closeForm.closeDate,
          finalAmount: parseFloat(closeForm.finalAmount)
        })
      });

      if (res.ok) {
        setShowCloseModal(false);
        fetchInvestments();
        fetchSummary();
        alert('✅ Inversión cerrada exitosamente');
      } else {
        const error = await res.json();
        alert(`Error: ${error.message || 'No se pudo cerrar la inversión'}`);
      }
    } catch (error) {
      console.error('Error al cerrar inversión:', error);
      alert('Error al cerrar la inversión');
    }
  };

  // ============ FASE 3: FILTRADO DE INVERSIONES ============
  
  const filteredInvestments = investments.filter(inv => {
    // Filtro por tipo
    if (filters.type !== 'all' && inv.type !== filters.type) {
      return false;
    }
    
    // Filtro por estado
    if (filters.status !== 'all' && inv.status !== filters.status) {
      return false;
    }
    
    // Filtro por búsqueda de texto
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesName = inv.name.toLowerCase().includes(searchLower);
      const matchesPlatform = inv.platform?.toLowerCase().includes(searchLower);
      const matchesDescription = inv.description?.toLowerCase().includes(searchLower);
      
      if (!matchesName && !matchesPlatform && !matchesDescription) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1" style={{ color: 'var(--text-primary)', fontWeight: '700' }}>
            <i className="bi bi-graph-up-arrow me-2" style={{ color: 'var(--primary)' }}></i>
            Mis Inversiones
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
            Gestiona y monitorea tu portafolio de inversiones
          </p>
        </div>
        <button
          className="btn btn-primary"
          style={{
            padding: 'var(--spacing-sm) var(--spacing-lg)',
            fontWeight: '600',
            borderRadius: 'var(--radius-md)'
          }}
          onClick={() => openModal()}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Nueva Inversión
        </button>
      </div>

      {/* Cards de resumen */}
      {summary && (
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card" style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)' }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="text-muted" style={{ fontSize: '0.875rem' }}>Total Invertido</span>
                  <i className="bi bi-cash-stack" style={{ color: 'var(--info)', fontSize: '1.5rem' }}></i>
                </div>
                <h3 className="mb-0" style={{ color: 'var(--text-primary)', fontWeight: '700' }}>
                  ${parseFloat(summary.total_invested || 0).toFixed(2)}
                </h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card" style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)' }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="text-muted" style={{ fontSize: '0.875rem' }}>Valor Actual</span>
                  <i className="bi bi-wallet2" style={{ color: 'var(--success)', fontSize: '1.5rem' }}></i>
                </div>
                <h3 className="mb-0" style={{ color: 'var(--text-primary)', fontWeight: '700' }}>
                  ${parseFloat(summary.total_current_value || 0).toFixed(2)}
                </h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card" style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)' }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="text-muted" style={{ fontSize: '0.875rem' }}>Ganancia Total</span>
                  <i className="bi bi-graph-up" style={{ color: parseFloat(summary.total_profit_loss) >= 0 ? 'var(--success)' : 'var(--danger)', fontSize: '1.5rem' }}></i>
                </div>
                <h3 className="mb-0" style={{ color: parseFloat(summary.total_profit_loss) >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: '700' }}>
                  {parseFloat(summary.total_profit_loss) >= 0 ? '+' : ''}{parseFloat(summary.total_profit_loss || 0).toFixed(2)}
                </h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card" style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)' }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="text-muted" style={{ fontSize: '0.875rem' }}>Rendimiento</span>
                  <i className="bi bi-percent" style={{ color: parseFloat(summary.total_percentage) >= 0 ? 'var(--success)' : 'var(--danger)', fontSize: '1.5rem' }}></i>
                </div>
                <h3 className="mb-0" style={{ color: parseFloat(summary.total_percentage) >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: '700' }}>
                  {parseFloat(summary.total_percentage) >= 0 ? '+' : ''}{parseFloat(summary.total_percentage || 0).toFixed(2)}%
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ FASE 3: FILTROS ============ */}
      <div className="card mb-4" style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="card-body" style={{ padding: 'var(--spacing-lg)' }}>
          <div className="row g-3 align-items-end">
            {/* Búsqueda */}
            <div className="col-md-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <i className="bi bi-search me-1"></i>
                Buscar
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Nombre, plataforma o descripción..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                style={{ fontSize: '0.875rem' }}
              />
            </div>

            {/* Filtro por tipo */}
            <div className="col-md-3">
              <label className="form-label fw-semibold" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <i className="bi bi-funnel me-1"></i>
                Tipo
              </label>
              <select
                className="form-select"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                style={{ fontSize: '0.875rem' }}
              >
                <option value="all">Todos los tipos</option>
                {Object.entries(investmentTypes).map(([key, value]) => (
                  <option key={key} value={key}>{value.label}</option>
                ))}
              </select>
            </div>

            {/* Filtro por estado */}
            <div className="col-md-3">
              <label className="form-label fw-semibold" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <i className="bi bi-toggles me-1"></i>
                Estado
              </label>
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                style={{ fontSize: '0.875rem' }}
              >
                <option value="all">Todos los estados</option>
                <option value="active">🟢 Activas</option>
                <option value="closed">⚫ Cerradas</option>
              </select>
            </div>

            {/* Botón limpiar filtros */}
            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => setFilters({ type: 'all', status: 'all', searchTerm: '' })}
                style={{ fontSize: '0.875rem' }}
              >
                <i className="bi bi-x-circle me-1"></i>
                Limpiar
              </button>
            </div>
          </div>

          {/* Mostrar cantidad de resultados */}
          {(filters.type !== 'all' || filters.status !== 'all' || filters.searchTerm) && (
            <div className="mt-3">
              <small className="text-muted">
                Mostrando {filteredInvestments.length} de {investments.length} inversiones
              </small>
            </div>
          )}
        </div>
      </div>

      {/* Tabla de inversiones */}
      <div className="card" style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="card-header" style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)', padding: 'var(--spacing-lg)' }}>
          <h5 className="mb-0" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
            <i className="bi bi-list-ul me-2"></i>
            Portafolio de Inversiones
          </h5>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : investments.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox" style={{ fontSize: '3rem', color: 'var(--text-secondary)' }}></i>
              <p className="text-muted mt-3">No hay inversiones registradas</p>
              <button className="btn btn-primary" onClick={() => openModal()}>
                <i className="bi bi-plus-circle me-2"></i>
                Crear Primera Inversión
              </button>
            </div>
          ) : filteredInvestments.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-filter-circle" style={{ fontSize: '3rem', color: 'var(--text-secondary)' }}></i>
              <p className="text-muted mt-3">No hay inversiones que coincidan con los filtros</p>
              <button className="btn btn-outline-secondary" onClick={() => setFilters({ type: 'all', status: 'all', searchTerm: '' })}>
                <i className="bi bi-x-circle me-2"></i>
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-light)' }}>
                  <tr>
                    <th style={{ padding: 'var(--spacing-md)', fontWeight: '600', fontSize: '0.875rem' }}>Tipo</th>
                    <th style={{ padding: 'var(--spacing-md)', fontWeight: '600', fontSize: '0.875rem' }}>Nombre</th>
                    <th style={{ padding: 'var(--spacing-md)', fontWeight: '600', fontSize: '0.875rem' }}>Plataforma</th>
                    <th style={{ padding: 'var(--spacing-md)', fontWeight: '600', fontSize: '0.875rem' }}>Inversión</th>
                    <th style={{ padding: 'var(--spacing-md)', fontWeight: '600', fontSize: '0.875rem' }}>Valor Actual</th>
                    <th style={{ padding: 'var(--spacing-md)', fontWeight: '600', fontSize: '0.875rem' }}>Ganancia</th>
                    <th style={{ padding: 'var(--spacing-md)', fontWeight: '600', fontSize: '0.875rem' }}>Rendimiento</th>
                    <th style={{ padding: 'var(--spacing-md)', fontWeight: '600', fontSize: '0.875rem' }}>Estado</th>
                    <th style={{ padding: 'var(--spacing-md)', fontWeight: '600', fontSize: '0.875rem' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvestments.map(inv => {
                    const typeInfo = investmentTypes[inv.type];
                    const profitClass = inv.profit_loss >= 0 ? 'success' : 'danger';
                    
                    return (
                      <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: 'var(--spacing-md)' }}>
                          <span style={{ color: typeInfo.color }}>
                            <i className={`bi ${typeInfo.icon} me-2`}></i>
                            {typeInfo.label}
                          </span>
                        </td>
                        <td style={{ padding: 'var(--spacing-md)', fontWeight: '600' }}>{inv.name}</td>
                        <td style={{ padding: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>
                          {inv.platform || '-'}
                        </td>
                        <td style={{ padding: 'var(--spacing-md)' }}>
                          {inv.currency_symbol}{parseFloat(inv.initial_amount).toFixed(2)}
                        </td>
                        <td style={{ padding: 'var(--spacing-md)', fontWeight: '600' }}>
                          {inv.currency_symbol}{parseFloat(inv.current_value).toFixed(2)}
                        </td>
                        <td style={{ padding: 'var(--spacing-md)', color: `var(--${profitClass})`, fontWeight: '600' }}>
                          {inv.profit_loss >= 0 ? '+' : ''}{inv.currency_symbol}{parseFloat(inv.profit_loss).toFixed(2)}
                        </td>
                        <td style={{ padding: 'var(--spacing-md)' }}>
                          <span className={`badge bg-${profitClass}`}>
                            {inv.percentage >= 0 ? '+' : ''}{inv.percentage}%
                          </span>
                        </td>
                        <td style={{ padding: 'var(--spacing-md)' }}>
                          {inv.status === 'active' ? (
                            <span className="badge bg-success">🟢 Activa</span>
                          ) : (
                            <span className="badge bg-secondary">⚫ Cerrada</span>
                          )}
                        </td>
                        <td style={{ padding: 'var(--spacing-md)' }}>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => openModal(inv)}
                            title="Editar"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          
                          {inv.status === 'active' && (
                            <>
                              <button
                                className="btn btn-sm btn-outline-success me-2"
                                onClick={() => openValuationModal(inv)}
                                title="Actualizar Valor"
                              >
                                <i className="bi bi-arrow-up-circle"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-warning me-2"
                                onClick={() => openCloseModal(inv)}
                                title="Cerrar Inversión"
                              >
                                <i className="bi bi-lock"></i>
                              </button>
                            </>
                          )}
                          
                          <button
                            className="btn btn-sm btn-outline-info me-2"
                            onClick={() => openHistoryModal(inv)}
                            title="Ver Historial"
                          >
                            <i className="bi bi-clock-history"></i>
                          </button>
                          
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(inv.id)}
                            title="Eliminar"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de crear/editar inversión */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowModal(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ borderRadius: 'var(--radius-lg)', border: 'none' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid var(--border-light)' }}>
                <h5 className="modal-title" style={{ fontWeight: '600' }}>
                  <i className="bi bi-graph-up-arrow me-2" style={{ color: 'var(--primary)' }}></i>
                  {editingInvestment ? 'Editar Inversión' : 'Nueva Inversión'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    {/* Tipo de inversión */}
                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        <i className="bi bi-tag me-1"></i>
                        Tipo de Inversión <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        disabled={!!editingInvestment}
                        required
                      >
                        {Object.entries(investmentTypes).map(([key, value]) => (
                          <option key={key} value={key}>
                            {value.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Nombre */}
                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        <i className="bi bi-card-heading me-1"></i>
                        Nombre <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ej: 100 acciones AAPL"
                        required
                      />
                    </div>

                    {/* Descripción */}
                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        <i className="bi bi-text-left me-1"></i>
                        Descripción
                      </label>
                      <textarea
                        className="form-control"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Detalles adicionales (opcional)"
                        rows="2"
                      ></textarea>
                    </div>

                    {/* Monto inicial y Moneda */}
                    {!editingInvestment && (
                      <>
                        <div className="col-8">
                          <label className="form-label fw-semibold">
                            <i className="bi bi-cash-stack me-1"></i>
                            Monto Inicial <span className="text-danger">*</span>
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            value={formData.initialAmount}
                            onChange={(e) => setFormData({ ...formData, initialAmount: e.target.value })}
                            placeholder="0.00"
                            min="0.01"
                            step="0.01"
                            required
                          />
                        </div>
                        <div className="col-4">
                          <label className="form-label fw-semibold">
                            <i className="bi bi-currency-exchange me-1"></i>
                            Moneda
                          </label>
                          <select
                            className="form-select"
                            value={formData.currencyCode}
                            onChange={(e) => handleCurrencyChange(e.target.value)}
                          >
                            {CURRENCIES.map(curr => (
                              <option key={curr.code} value={curr.code}>
                                {curr.symbol} {curr.code}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {/* Plataforma */}
                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        <i className="bi bi-building me-1"></i>
                        Plataforma/Entidad
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.platform}
                        onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                        placeholder="Ej: Banco Galicia, Binance, eToro"
                      />
                    </div>

                    {/* Fecha de inversión */}
                    {!editingInvestment && (
                      <div className="col-12">
                        <label className="form-label fw-semibold">
                          <i className="bi bi-calendar me-1"></i>
                          Fecha de Inversión <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.investmentDate}
                          onChange={(e) => setFormData({ ...formData, investmentDate: e.target.value })}
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer" style={{ borderTop: '1px solid var(--border-light)' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-check-circle me-2"></i>
                    {editingInvestment ? 'Guardar Cambios' : 'Crear Inversión'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer legal */}
      <div className="alert alert-warning mt-4" style={{ borderRadius: 'var(--radius-md)' }}>
        <i className="bi bi-exclamation-triangle me-2"></i>
        <strong>Aviso Legal:</strong> Esta herramienta es solo para seguimiento personal. No constituye asesoramiento financiero. 
        Consulte con un profesional certificado antes de tomar decisiones de inversión.
      </div>

      {/* ============ FASE 2: MODAL ACTUALIZAR VALOR ============ */}
      {showValuationModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: 'var(--radius-lg)' }}>
              <div className="modal-header" style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-arrow-up-circle me-2" style={{ color: 'var(--success)' }}></i>
                  Actualizar Valor
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowValuationModal(false)}></button>
              </div>
              <form onSubmit={handleCreateValuation}>
                <div className="modal-body">
                  <div className="alert alert-info mb-3">
                    <strong>Inversión:</strong> {selectedInvestment?.name}
                    <br />
                    <small>Valor actual: {selectedInvestment?.currency_symbol}{parseFloat(selectedInvestment?.current_value || 0).toFixed(2)}</small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-calendar me-1"></i>
                      Fecha de Valuación <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={valuationForm.valuationDate}
                      onChange={(e) => setValuationForm({ ...valuationForm, valuationDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-cash-coin me-1"></i>
                      Nuevo Valor ({selectedInvestment?.currency_code}) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={valuationForm.currentValue}
                      onChange={(e) => setValuationForm({ ...valuationForm, currentValue: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                    {valuationForm.currentValue && selectedInvestment && (
                      <small className="text-muted">
                        Ganancia/Pérdida: {' '}
                        <span style={{ 
                          color: (parseFloat(valuationForm.currentValue) - parseFloat(selectedInvestment.initial_amount)) >= 0 ? 'var(--success)' : 'var(--danger)',
                          fontWeight: '600'
                        }}>
                          {(parseFloat(valuationForm.currentValue) - parseFloat(selectedInvestment.initial_amount)) >= 0 ? '+' : ''}
                          {selectedInvestment.currency_symbol}
                          {(parseFloat(valuationForm.currentValue) - parseFloat(selectedInvestment.initial_amount)).toFixed(2)}
                          {' '}
                          ({((parseFloat(valuationForm.currentValue) / parseFloat(selectedInvestment.initial_amount) - 1) * 100).toFixed(2)}%)
                        </span>
                      </small>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-chat-left-text me-1"></i>
                      Notas (opcional)
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={valuationForm.notes}
                      onChange={(e) => setValuationForm({ ...valuationForm, notes: e.target.value })}
                      placeholder="Ej: Dividendos, split de acciones, rendimiento mensual..."
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer" style={{ borderTop: '1px solid var(--border-light)' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowValuationModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-success">
                    <i className="bi bi-check-circle me-2"></i>
                    Guardar Valuación
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============ FASE 2: MODAL VER HISTORIAL ============ */}
      {showHistoryModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content" style={{ borderRadius: 'var(--radius-lg)' }}>
              <div className="modal-header" style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-clock-history me-2" style={{ color: 'var(--info)' }}></i>
                  Historial de Valuaciones
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowHistoryModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info mb-3">
                  <strong>Inversión:</strong> {selectedInvestment?.name}
                  <br />
                  <small>
                    Inversión inicial: {selectedInvestment?.currency_symbol}{parseFloat(selectedInvestment?.initial_amount || 0).toFixed(2)}
                    {' '} | {' '}
                    Valor actual: {selectedInvestment?.currency_symbol}{parseFloat(selectedInvestment?.current_value || 0).toFixed(2)}
                  </small>
                </div>

                {loadingValuations ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                  </div>
                ) : valuations.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-inbox" style={{ fontSize: '2rem', color: 'var(--text-secondary)' }}></i>
                    <p className="text-muted mt-2">No hay valuaciones registradas</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <tr>
                          <th style={{ padding: 'var(--spacing-md)', fontSize: '0.875rem' }}>Fecha</th>
                          <th style={{ padding: 'var(--spacing-md)', fontSize: '0.875rem' }}>Valor</th>
                          <th style={{ padding: 'var(--spacing-md)', fontSize: '0.875rem' }}>Ganancia/Pérdida</th>
                          <th style={{ padding: 'var(--spacing-md)', fontSize: '0.875rem' }}>Rendimiento</th>
                          <th style={{ padding: 'var(--spacing-md)', fontSize: '0.875rem' }}>Notas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {valuations.map((val, index) => {
                          const profit = parseFloat(val.current_value) - parseFloat(selectedInvestment.initial_amount);
                          const percentage = ((parseFloat(val.current_value) / parseFloat(selectedInvestment.initial_amount) - 1) * 100).toFixed(2);
                          const profitClass = profit >= 0 ? 'success' : 'danger';
                          
                          return (
                            <tr key={val.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                              <td style={{ padding: 'var(--spacing-md)' }}>
                                {new Date(val.valuation_date).toLocaleDateString('es-AR')}
                                {index === 0 && (
                                  <span className="badge bg-primary ms-2" style={{ fontSize: '0.7rem' }}>Más reciente</span>
                                )}
                              </td>
                              <td style={{ padding: 'var(--spacing-md)', fontWeight: '600' }}>
                                {selectedInvestment?.currency_symbol}{parseFloat(val.current_value).toFixed(2)}
                              </td>
                              <td style={{ padding: 'var(--spacing-md)', color: `var(--${profitClass})`, fontWeight: '600' }}>
                                {profit >= 0 ? '+' : ''}{selectedInvestment?.currency_symbol}{profit.toFixed(2)}
                              </td>
                              <td style={{ padding: 'var(--spacing-md)' }}>
                                <span className={`badge bg-${profitClass}`}>
                                  {profit >= 0 ? '+' : ''}{percentage}%
                                </span>
                              </td>
                              <td style={{ padding: 'var(--spacing-md)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                {val.notes || '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid var(--border-light)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowHistoryModal(false)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ FASE 2: MODAL CERRAR INVERSIÓN ============ */}
      {showCloseModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: 'var(--radius-lg)' }}>
              <div className="modal-header" style={{ backgroundColor: 'var(--warning)', borderBottom: '1px solid var(--border-light)' }}>
                <h5 className="modal-title fw-bold text-white">
                  <i className="bi bi-lock me-2"></i>
                  Cerrar Inversión
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCloseModal(false)}></button>
              </div>
              <form onSubmit={handleCloseInvestment}>
                <div className="modal-body">
                  <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    <strong>Atención:</strong> Una vez cerrada la inversión, no podrá actualizarse nuevamente.
                  </div>

                  <div className="alert alert-info mb-3">
                    <strong>Inversión:</strong> {selectedInvestment?.name}
                    <br />
                    <small>
                      Inversión inicial: {selectedInvestment?.currency_symbol}{parseFloat(selectedInvestment?.initial_amount || 0).toFixed(2)}
                      {' '} | {' '}
                      Valor actual: {selectedInvestment?.currency_symbol}{parseFloat(selectedInvestment?.current_value || 0).toFixed(2)}
                    </small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-calendar me-1"></i>
                      Fecha de Cierre <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={closeForm.closeDate}
                      onChange={(e) => setCloseForm({ ...closeForm, closeDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-cash-stack me-1"></i>
                      Monto Final ({selectedInvestment?.currency_code}) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={closeForm.finalAmount}
                      onChange={(e) => setCloseForm({ ...closeForm, finalAmount: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                    {closeForm.finalAmount && selectedInvestment && (
                      <div className="mt-2 p-3" style={{ 
                        backgroundColor: 'var(--bg-secondary)', 
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-light)'
                      }}>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Inversión Inicial:</span>
                          <strong>{selectedInvestment.currency_symbol}{parseFloat(selectedInvestment.initial_amount).toFixed(2)}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Monto Final:</span>
                          <strong>{selectedInvestment.currency_symbol}{parseFloat(closeForm.finalAmount).toFixed(2)}</strong>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between">
                          <span className="fw-bold">Resultado:</span>
                          <strong style={{ 
                            color: (parseFloat(closeForm.finalAmount) - parseFloat(selectedInvestment.initial_amount)) >= 0 ? 'var(--success)' : 'var(--danger)',
                            fontSize: '1.1rem'
                          }}>
                            {(parseFloat(closeForm.finalAmount) - parseFloat(selectedInvestment.initial_amount)) >= 0 ? '+' : ''}
                            {selectedInvestment.currency_symbol}
                            {(parseFloat(closeForm.finalAmount) - parseFloat(selectedInvestment.initial_amount)).toFixed(2)}
                            {' '}
                            ({((parseFloat(closeForm.finalAmount) / parseFloat(selectedInvestment.initial_amount) - 1) * 100).toFixed(2)}%)
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer" style={{ borderTop: '1px solid var(--border-light)' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCloseModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-warning">
                    <i className="bi bi-lock-fill me-2"></i>
                    Confirmar Cierre
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
