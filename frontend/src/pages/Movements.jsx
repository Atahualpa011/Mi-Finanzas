import { useEffect, useState } from 'react';
import { useCurrency } from '../hooks/useCurrency';
import HelpButton from '../components/HelpButton';
import { HELP_CONTENTS } from '../utils/helpContents';

export default function Movements() {
  // --- Estados principales ---
  const [transactions, setTransactions] = useState([]); // Lista de movimientos (gastos e ingresos)
  const [suggestions, setSuggestions] = useState([]);
  const [message, setMessage] = useState(null);
  const [modalIndex, setModalIndex] = useState(null); // Índice de la sugerencia seleccionada
  const [autoModalShown, setAutoModalShown] = useState(false);
  const [emotionFilter, setEmotionFilter] = useState('all'); // Filtro de emoción (NUEVO)
  const [activeMovementTab, setActiveMovementTab] = useState('expense');
  const [expensePage, setExpensePage] = useState(1);
  const [incomePage, setIncomePage] = useState(1);
  const { currencyData, CURRENCIES } = useCurrency();     // Hook para obtener símbolo y lista de monedas
  const ITEMS_PER_PAGE = 25;

  // --- Lista de emociones disponibles (NUEVO) ---
  const EMOTIONS = [
    'Felicidad', 'Alivio', 'Orgullo', 'Generosidad/Amor', 'Emocion/Entusiasmo',
    'Culpa', 'Ansiedad/Estres', 'Arrepentimiento', 'Frustracion', 'Verguenza',
    'Indiferencia', 'Ambivalencia'
  ];

  // --- Cargar movimientos y sugerencias al montar ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    // Movimientos personales
    fetch('/api/transactions', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setTransactions);

    // Sugerencias de movimientos grupales
    fetch('/api/suggested-transactions', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setSuggestions(data.suggestions || []));
  }, []);

  // --- Abrir automáticamente el modal si hay sugerencias pendientes y no hay modal abierto ---
  useEffect(() => {
    if (suggestions.length > 0 && modalIndex === null && !autoModalShown) {
      setModalIndex(0);
      setAutoModalShown(true);
    }
  }, [suggestions, modalIndex, autoModalShown]);

  // --- Función para recargar movimientos personales ---
  const reloadTransactions = () => {
    const token = localStorage.getItem('token');
    fetch('/api/transactions', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setTransactions);
  };

  // --- Función para filtrar transacciones por emoción (NUEVO) ---
  const filterByEmotion = (txList) => {
    if (emotionFilter === 'all') return txList;
    
    if (emotionFilter === 'with_emotion') {
      return txList.filter(tx => tx.emotion && tx.emotion.trim() !== '');
    }
    
    if (emotionFilter === 'without_emotion') {
      return txList.filter(tx => !tx.emotion || tx.emotion.trim() === '');
    }
    
    // Filtrar por emoción específica
    return txList.filter(tx => {
      if (!tx.emotion) return false;
      const emotions = tx.emotion.split(',').map(e => e.trim());
      return emotions.includes(emotionFilter);
    });
  };

  // --- Eliminar movimiento ---
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      '¿Estás seguro de que deseas eliminar este movimiento?\n\n' +
      'Esta acción no se puede deshacer.'
    );
    
    if (!confirmDelete) return;

    const token = localStorage.getItem('token');
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setMessage('Movimiento eliminado correctamente.');
      setTimeout(() => setMessage(null), 3000);
      reloadTransactions();
    } else {
      setMessage('Error al eliminar el movimiento.');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // --- Aceptar sugerencia ---
  const handleAccept = async (id) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/suggested-transactions/${id}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const newSuggestions = suggestions.filter((s, i) => s.id !== id);
      setSuggestions(newSuggestions);
      setMessage('Movimiento añadido a tu resumen.');
      setTimeout(() => setMessage(null), 3000);
      // --- Recarga la tabla de movimientos en tiempo real ---
      reloadTransactions();
      if (newSuggestions.length === 0) setModalIndex(null);
      else if (modalIndex >= newSuggestions.length) setModalIndex(newSuggestions.length - 1);
    }
  };

  // --- Rechazar sugerencia ---
  const handleReject = async (id) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/suggested-transactions/${id}/reject`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const newSuggestions = suggestions.filter((s, i) => s.id !== id);
      setSuggestions(newSuggestions);
      setMessage('Sugerencia descartada. Si querés, podés añadirla manualmente.');
      setTimeout(() => setMessage(null), 3000);
      if (newSuggestions.length === 0) setModalIndex(null);
      else if (modalIndex >= newSuggestions.length) setModalIndex(newSuggestions.length - 1);
    }
  };

  // --- Modal reusable ---
  const modalSuggestion = modalIndex !== null ? suggestions[modalIndex] : null;

  // --- Datos para tablas y paginación ---
  const expenseTransactions = filterByEmotion(transactions.filter(tx => tx.type === 'expense'));
  const incomeTransactions = transactions.filter(tx => tx.type === 'income');

  const totalExpensePages = Math.max(1, Math.ceil(expenseTransactions.length / ITEMS_PER_PAGE));
  const totalIncomePages = Math.max(1, Math.ceil(incomeTransactions.length / ITEMS_PER_PAGE));

  const paginatedExpenseTransactions = expenseTransactions.slice(
    (expensePage - 1) * ITEMS_PER_PAGE,
    expensePage * ITEMS_PER_PAGE
  );
  const paginatedIncomeTransactions = incomeTransactions.slice(
    (incomePage - 1) * ITEMS_PER_PAGE,
    incomePage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setExpensePage(1);
  }, [emotionFilter, transactions]);

  useEffect(() => {
    setIncomePage(1);
  }, [transactions]);

  // --- Render principal ---
  return (
    <>
      {/* Botón de ayuda */}
      <div className="mb-3">
        <HelpButton section="movements" helpContent={HELP_CONTENTS.movements} />
      </div>

      <div className="mb-4">
        <h2 
          className="mb-1" 
          style={{ 
            fontWeight: '700', 
            color: 'var(--text-primary)',
            fontSize: '1.75rem'
          }}
        >
          <i className="bi bi-list-ul me-2" style={{ color: 'var(--primary)' }}></i>
          Mis movimientos
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Gestiona tus ingresos y gastos personales
        </p>
      </div>

      {message && (
        <div 
          className="alert alert-success" 
          style={{
            backgroundColor: 'var(--success-light)',
            border: '1px solid var(--success)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--success)'
          }}
        >
          <i className="bi bi-check-circle me-2"></i>
          {message}
        </div>
      )}

        {/* Alertas emocionales (NUEVO) */}
        {suggestions.filter(s => s.type === 'emotional_warning').length > 0 && (
          <div 
            className="alert"
            style={{
              backgroundColor: '#f8f0ff',
              border: '2px solid #6f42c1',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-lg)',
              marginBottom: 'var(--spacing-lg)'
            }}
          >
            <h5 
              className="mb-3"
              style={{
                fontWeight: '600',
                color: '#6f42c1',
                fontSize: '1.1rem'
              }}
            >
              <i className="bi bi-emoji-smile me-2"></i>
              Alertas de Salud Emocional
            </h5>
            <ul className="list-group mb-3">
              {suggestions.filter(s => s.type === 'emotional_warning').map((s, i) => {
                let alertData = {};
                try {
                  alertData = JSON.parse(s.description);
                } catch (e) {
                  alertData = { message: s.description, action: 'Ver detalles' };
                }
                
                return (
                  <li 
                    key={s.id} 
                    className="list-group-item"
                    style={{
                      border: '1px solid #e0d4f0',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: 'var(--spacing-xs)',
                      backgroundColor: 'white',
                      padding: 'var(--spacing-md)'
                    }}
                  >
                    <div className="d-flex align-items-start">
                      <div className="flex-shrink-0 me-3">
                        <span className="badge bg-purple" style={{ fontSize: '0.9rem', padding: '0.5rem 0.75rem' }}>
                          {alertData.emotion || 'Alerta'}
                        </span>
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-2 fw-semibold" style={{ color: 'var(--text-primary)' }}>
                          {alertData.message}
                        </p>
                        <p className="mb-3 small" style={{ color: 'var(--text-secondary)' }}>
                          <i className="bi bi-lightbulb me-1"></i>
                          Acción recomendada: {alertData.action}
                        </p>
                        <div className="d-flex gap-2">
                          <a
                            href="/budgets"
                            className="btn btn-sm"
                            style={{
                              backgroundColor: '#6f42c1',
                              color: 'white',
                              border: 'none',
                              padding: '0.375rem 1rem',
                              fontSize: '0.875rem',
                              fontWeight: '500'
                            }}
                          >
                            <i className="bi bi-wallet2 me-1"></i>
                            Crear presupuesto emocional
                          </a>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleReject(s.id)}
                            style={{
                              padding: '0.375rem 1rem',
                              fontSize: '0.875rem'
                            }}
                          >
                            <i className="bi bi-x me-1"></i>
                            Descartar
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <small style={{ color: '#6f42c1' }}>
              <i className="bi bi-info-circle me-1"></i>
              Estas alertas se generan automáticamente basándose en tus patrones de gastos emocionales.
            </small>
          </div>
        )}

        {/* Sugerencias pendientes (MODIFICADO) */}
        {suggestions.filter(s => s.type !== 'emotional_warning').length > 0 && (
          <div 
            className="alert"
            style={{
              backgroundColor: 'var(--info-light)',
              border: '1px solid var(--info)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-lg)',
              marginBottom: 'var(--spacing-lg)'
            }}
          >
            <h5 
              className="mb-3"
              style={{
                fontWeight: '600',
                color: 'var(--info)',
                fontSize: '1.1rem'
              }}
            >
              <i className="bi bi-lightbulb me-2"></i>
              Movimientos sugeridos de grupos
            </h5>
            <ul className="list-group mb-3">
              {suggestions.filter(s => s.type !== 'emotional_warning').map((s, i) => (
                <li 
                  key={s.id} 
                  className="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-md-center"
                  style={{
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--spacing-xs)',
                    backgroundColor: 'var(--bg-primary)',
                    padding: 'var(--spacing-md)'
                  }}
                >
                  <span>
                    <span 
                      className="badge me-2"
                      style={{
                        backgroundColor: s.type === 'expense' ? 'var(--danger-light)' : 'var(--success-light)',
                        color: s.type === 'expense' ? 'var(--danger)' : 'var(--success)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}
                    >
                      {s.type === 'expense' ? 'Gasto' : 'Ingreso'}
                    </span>
                    <b style={{ color: 'var(--text-primary)' }}>{currencyData.symbol}{s.amount}</b>
                    <br />
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {s.description}
                    </span>
                  </span>
                  <span className="mt-2 mt-md-0">
                    <button
                      className="btn-primary-custom"
                      style={{
                        padding: '0.375rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      onClick={() => setModalIndex(i)}
                    >
                      <i className="bi bi-eye me-1"></i>
                      Revisar
                    </button>
                  </span>
                </li>
              ))}
            </ul>
            <small style={{ color: 'var(--text-secondary)' }}>
              <i className="bi bi-info-circle me-1"></i>
              Podés aceptar o rechazar cada sugerencia cuando lo desees.<br />
              Si rechazas, deberás añadir el movimiento manualmente si lo deseas.
            </small>
          </div>
        )}

        {/* Modal reutilizable para aceptar/rechazar sugerencias */}
        {modalIndex !== null && (
          <div className="modal fade show" tabIndex="-1" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
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
                    <i 
                      className={`bi ${modalSuggestion.type === 'expense' ? 'bi-arrow-down-circle' : 'bi-arrow-up-circle'} me-2`}
                      style={{ color: modalSuggestion.type === 'expense' ? 'var(--danger)' : 'var(--success)' }}
                    ></i>
                    {modalSuggestion.type === 'expense' ? 'Añadir gasto sugerido' : 'Añadir ingreso sugerido'}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setModalIndex(null)}
                  ></button>
                </div>
                <div 
                  className="modal-body"
                  style={{
                    padding: 'var(--spacing-lg)'
                  }}
                >
                  <div className="mb-3">
                    <p className="mb-2">
                      <strong style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>MONTO</strong>
                      <br />
                      <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {currencyData.symbol}{modalSuggestion.amount}
                      </span>
                    </p>
                    <p className="mb-0">
                      <strong style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>DETALLE</strong>
                      <br />
                      <span style={{ color: 'var(--text-primary)' }}>
                        {modalSuggestion.description}
                      </span>
                    </p>
                  </div>
                  <div 
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      padding: 'var(--spacing-md)',
                      borderRadius: 'var(--radius-md)',
                      marginTop: 'var(--spacing-md)'
                    }}
                  >
                    <p className="mb-1" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <i className="bi bi-info-circle me-1"></i>
                      Sugerencia <strong>{modalIndex + 1}</strong> de <strong>{suggestions.length}</strong>
                    </p>
                    <p className="mb-0" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      Si no lo añadís ahora, deberás hacerlo manualmente si lo deseas.
                    </p>
                  </div>
                </div>
                <div 
                  className="modal-footer"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderTop: '1px solid var(--border-light)',
                    borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                    padding: 'var(--spacing-lg)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 'var(--spacing-sm)'
                  }}
                >
                  <div>
                    <button
                      className="btn-secondary-custom me-2"
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        border: 'none',
                        cursor: modalIndex === 0 ? 'not-allowed' : 'pointer',
                        opacity: modalIndex === 0 ? 0.5 : 1
                      }}
                      disabled={modalIndex === 0}
                      onClick={() => setModalIndex(modalIndex - 1)}
                    >
                      <i className="bi bi-chevron-left me-1"></i>
                      Anterior
                    </button>
                    <button
                      className="btn-secondary-custom"
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        border: 'none',
                        cursor: modalIndex === suggestions.length - 1 ? 'not-allowed' : 'pointer',
                        opacity: modalIndex === suggestions.length - 1 ? 0.5 : 1
                      }}
                      disabled={modalIndex === suggestions.length - 1}
                      onClick={() => setModalIndex(modalIndex + 1)}
                    >
                      Siguiente
                      <i className="bi bi-chevron-right ms-1"></i>
                    </button>
                  </div>
                  <div>
                    <button
                      className="btn me-2"
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        border: '1px solid var(--success)',
                        backgroundColor: 'var(--success)',
                        color: 'white',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                      onClick={() => handleAccept(modalSuggestion.id)}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#0d9b5f';
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = 'var(--shadow-md)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'var(--success)';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <i className="bi bi-check-circle me-1"></i>
                      Añadir a mis movimientos
                    </button>
                    <button
                      className="btn me-2"
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        border: '1px solid var(--danger)',
                        backgroundColor: 'transparent',
                        color: 'var(--danger)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                      onClick={() => handleReject(modalSuggestion.id)}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'var(--danger-light)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      <i className="bi bi-x-circle me-1"></i>
                      Rechazar
                    </button>
                    <button
                      className="btn-secondary-custom"
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      onClick={() => setModalIndex(null)}
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtro por emoción (NUEVO) */}
        <div className="card mb-4" style={{
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-md)'
        }}>
          <div className="row align-items-center g-3">
            <div className="col-auto">
              <i className="bi bi-emoji-smile fs-5" style={{ color: '#6f42c1' }}></i>
            </div>
            <div className="col-auto">
              <label className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                Filtrar por emoción:
              </label>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={emotionFilter}
                onChange={(e) => setEmotionFilter(e.target.value)}
                style={{
                  borderColor: 'var(--border-light)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem'
                }}
              >
                <option value="all">Todas las emociones</option>
                <option value="with_emotion">Con emoción registrada</option>
                <option value="without_emotion">Sin emoción registrada</option>
                <optgroup label="Emociones específicas">
                  {EMOTIONS.map(emotion => (
                    <option key={emotion} value={emotion}>{emotion}</option>
                  ))}
                </optgroup>
              </select>
            </div>
            {emotionFilter !== 'all' && (
              <div className="col-auto">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setEmotionFilter('all')}
                  style={{ fontSize: '0.875rem' }}
                >
                  <i className="bi bi-x me-1"></i>
                  Limpiar filtro
                </button>
              </div>
            )}
          </div>
        </div>

        <div
          className="card-custom"
          style={{
            padding: 'var(--spacing-lg)',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div className="d-flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              className="btn"
              style={{
                border: '1px solid var(--danger)',
                backgroundColor: activeMovementTab === 'expense' ? 'var(--danger)' : 'transparent',
                color: activeMovementTab === 'expense' ? 'white' : 'var(--danger)',
                fontWeight: '600'
              }}
              onClick={() => setActiveMovementTab('expense')}
            >
              <i className="bi bi-arrow-down-circle me-2"></i>
              Gastos ({expenseTransactions.length})
            </button>
            <button
              type="button"
              className="btn"
              style={{
                border: '1px solid var(--success)',
                backgroundColor: activeMovementTab === 'income' ? 'var(--success)' : 'transparent',
                color: activeMovementTab === 'income' ? 'white' : 'var(--success)',
                fontWeight: '600'
              }}
              onClick={() => setActiveMovementTab('income')}
            >
              <i className="bi bi-arrow-up-circle me-2"></i>
              Ingresos ({incomeTransactions.length})
            </button>
          </div>

          {activeMovementTab === 'expense' && (
            <>
              <h4
                className="mb-4"
                style={{
                  fontWeight: '600',
                  color: 'var(--danger)',
                  fontSize: '1.25rem'
                }}
              >
                <i className="bi bi-arrow-down-circle me-2"></i>
                Gastos
                {emotionFilter !== 'all' && (
                  <span className="ms-2 badge bg-purple" style={{ fontSize: '0.75rem', fontWeight: '500' }}>
                    {emotionFilter === 'with_emotion' ? 'Con emoción' :
                     emotionFilter === 'without_emotion' ? 'Sin emoción' :
                     emotionFilter}
                  </span>
                )}
              </h4>
              {expenseTransactions.length === 0 ? (
                <div
                  className="text-center py-5"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-xl)'
                  }}
                >
                  <i className="bi bi-inbox" style={{ fontSize: '3rem', color: 'var(--text-muted)' }}></i>
                  <p className="mt-3 mb-0" style={{ color: 'var(--text-secondary)' }}>
                    {emotionFilter !== 'all' ? 'No hay gastos con este filtro.' : 'No hay gastos registrados.'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table-custom mb-0">
                      <thead>
                        <tr>
                          <th>Monto</th>
                          <th>Moneda</th>
                          <th>Fecha</th>
                          <th>Categoría</th>
                          <th>Motivo / Destino</th>
                          {emotionFilter === 'all' && <th>Emoción</th>}
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedExpenseTransactions.map(tx => (
                          <tr key={tx.id}>
                            <td style={{ fontWeight: '600', color: 'var(--danger)' }}>
                              {tx.currency_symbol || currencyData.symbol}{Number(tx.amount).toFixed(2)}
                            </td>
                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                              {CURRENCIES.find(c => c.code === (tx.currency_code || currencyData.currency || 'ARS'))?.label || 'No especificado'}
                            </td>
                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                              {new Date(tx.date).toLocaleString()}
                            </td>
                            <td style={{ color: 'var(--text-primary)' }}>
                              {tx.category || 'Sin categoría'}
                            </td>
                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                              {tx.destination || tx.description || '-'}
                            </td>
                            {emotionFilter === 'all' && (
                              <td>
                                {tx.emotion ? (
                                  <span className="badge bg-purple" style={{ fontSize: '0.7rem' }}>
                                    {tx.emotion.split(',').map(e => e.trim()).join(', ')}
                                  </span>
                                ) : (
                                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>-</span>
                                )}
                              </td>
                            )}
                            <td>
                              <button
                                className="btn btn-sm"
                                style={{
                                  padding: '0.25rem 0.75rem',
                                  fontSize: '0.75rem',
                                  fontWeight: '500',
                                  border: '1px solid var(--danger)',
                                  backgroundColor: 'transparent',
                                  color: 'var(--danger)',
                                  borderRadius: 'var(--radius-md)',
                                  cursor: 'pointer',
                                  transition: 'all var(--transition-fast)'
                                }}
                                onClick={() => handleDelete(tx.id)}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = 'var(--danger-light)';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = 'transparent';
                                }}
                              >
                                <i className="bi bi-trash me-1"></i>
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
                    <small style={{ color: 'var(--text-secondary)' }}>
                      Mostrando {paginatedExpenseTransactions.length} de {expenseTransactions.length} gastos
                    </small>
                    <div className="d-flex align-items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        disabled={expensePage === 1}
                        onClick={() => setExpensePage(prev => Math.max(1, prev - 1))}
                      >
                        <i className="bi bi-chevron-left me-1"></i>
                        Anterior
                      </button>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Página {expensePage} de {totalExpensePages}
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        disabled={expensePage === totalExpensePages}
                        onClick={() => setExpensePage(prev => Math.min(totalExpensePages, prev + 1))}
                      >
                        Siguiente
                        <i className="bi bi-chevron-right ms-1"></i>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {activeMovementTab === 'income' && (
            <>
              <h4
                className="mb-4"
                style={{
                  fontWeight: '600',
                  color: 'var(--success)',
                  fontSize: '1.25rem'
                }}
              >
                <i className="bi bi-arrow-up-circle me-2"></i>
                Ingresos
              </h4>
              {incomeTransactions.length === 0 ? (
                <div
                  className="text-center py-5"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-xl)'
                  }}
                >
                  <i className="bi bi-inbox" style={{ fontSize: '3rem', color: 'var(--text-muted)' }}></i>
                  <p className="mt-3 mb-0" style={{ color: 'var(--text-secondary)' }}>
                    No hay ingresos registrados.
                  </p>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table-custom mb-0">
                      <thead>
                        <tr>
                          <th>Monto</th>
                          <th>Moneda</th>
                          <th>Fecha</th>
                          <th>Categoría</th>
                          <th>Fuente</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedIncomeTransactions.map(tx => (
                          <tr key={tx.id}>
                            <td style={{ fontWeight: '600', color: 'var(--success)' }}>
                              {tx.currency_symbol || currencyData.symbol}{Number(tx.amount).toFixed(2)}
                            </td>
                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                              {CURRENCIES.find(c => c.code === (tx.currency_code || currencyData.currency || 'ARS'))?.label || 'No especificado'}
                            </td>
                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                              {new Date(tx.date).toLocaleString()}
                            </td>
                            <td style={{ color: 'var(--text-primary)' }}>
                              {tx.category || 'Sin categoría'}
                            </td>
                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                              {tx.source || tx.description || '-'}
                            </td>
                            <td>
                              <button
                                className="btn btn-sm"
                                style={{
                                  padding: '0.25rem 0.75rem',
                                  fontSize: '0.75rem',
                                  fontWeight: '500',
                                  border: '1px solid var(--danger)',
                                  backgroundColor: 'transparent',
                                  color: 'var(--danger)',
                                  borderRadius: 'var(--radius-md)',
                                  cursor: 'pointer',
                                  transition: 'all var(--transition-fast)'
                                }}
                                onClick={() => handleDelete(tx.id)}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = 'var(--danger-light)';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = 'transparent';
                                }}
                              >
                                <i className="bi bi-trash me-1"></i>
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
                    <small style={{ color: 'var(--text-secondary)' }}>
                      Mostrando {paginatedIncomeTransactions.length} de {incomeTransactions.length} ingresos
                    </small>
                    <div className="d-flex align-items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        disabled={incomePage === 1}
                        onClick={() => setIncomePage(prev => Math.max(1, prev - 1))}
                      >
                        <i className="bi bi-chevron-left me-1"></i>
                        Anterior
                      </button>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Página {incomePage} de {totalIncomePages}
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        disabled={incomePage === totalIncomePages}
                        onClick={() => setIncomePage(prev => Math.min(totalIncomePages, prev + 1))}
                      >
                        Siguiente
                        <i className="bi bi-chevron-right ms-1"></i>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
    </>
  );
}

