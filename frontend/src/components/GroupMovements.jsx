import { useEffect, useState } from 'react';

export default function GroupMovements({ groupId, refresh }) {
  // --- Estados principales ---
  const [expenses, setExpenses] = useState([]);      // Lista de gastos del grupo
  const [settlements, setSettlements] = useState([]); // Lista de pagos/liquidaciones del grupo
  const [error, setError] = useState(null);          // Mensaje de error
  const [filter, setFilter] = useState('all');       // Filtro: 'all', 'expense', 'settlement'
  const [searchTerm, setSearchTerm] = useState(''); // Búsqueda por descripción
  const [currentPage, setCurrentPage] = useState(1); // Página actual para paginación
  const itemsPerPage = 10; // Cantidad de movimientos por página

  // --- Cargar gastos y liquidaciones al montar o cuando cambian groupId/refresh ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    // Trae los gastos del grupo
    fetch(`/api/groups/${groupId}/expenses`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setExpenses)
      .catch(() => setExpenses([]));
    // Trae las liquidaciones del grupo
    fetch(`/api/groups/${groupId}/settlements`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setSettlements)
      .catch(() => setSettlements([]));
  }, [groupId, refresh]);

  // --- Unifica y ordena los movimientos por fecha+hora ---
  const movimientos = [
    // Mapea los gastos a un formato común
    ...expenses.map(e => ({
      type: 'expense',
      id: `exp-${e.id}`,
      description: e.description,
      amount: e.amount,
      date: e.date,
      time: e.time,
      by: e.pagado_por
    })),
    // Mapea las liquidaciones a un formato común
    ...settlements.map(s => ({
      type: 'settlement',
      id: `set-${s.id}`,
      description: `Pago de ${s.from_name} a ${s.to_name}`,
      amount: s.amount,
      date: s.date,
      time: s.time,
      by: s.from_name
    }))
  ].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)); // Ordena descendente por fecha+hora

  // --- Aplicar filtros ---
  const movimientosFiltrados = movimientos.filter(m => {
    // Filtro por tipo
    const matchesType = filter === 'all' || m.type === filter;
    
    // Filtro por búsqueda (descripción o nombre de quien pagó)
    const matchesSearch = searchTerm === '' || 
      m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.by && m.by.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesType && matchesSearch;
  });

  // --- Paginación ---
  const totalPages = Math.ceil(movimientosFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const movimientosPaginados = movimientosFiltrados.slice(startIndex, endIndex);

  // Reiniciar a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  // --- Render principal ---
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
        className="card-header"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-light)',
          padding: 'var(--spacing-lg)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h5 
            style={{ 
              marginBottom: 0,
              fontWeight: '600',
              color: 'var(--text-primary)',
              fontSize: '1.1rem'
            }}
          >
            <i className="bi bi-clock-history me-2" style={{ color: 'var(--primary)' }}></i>
            Historial de Movimientos
          </h5>
          <span 
            className="badge"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'white',
              fontSize: '0.85rem',
              fontWeight: '500',
              padding: '0.35em 0.65em'
            }}
          >
            {movimientosFiltrados.length} de {movimientos.length}
          </span>
        </div>
      </div>
      
      <div className="card-body" style={{ padding: 'var(--spacing-lg)' }}>
        {/* Filtros */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label 
              className="form-label" 
              style={{ 
                fontWeight: '600', 
                color: 'var(--text-primary)', 
                fontSize: '0.875rem',
                marginBottom: 'var(--spacing-xs)'
              }}
            >
              <i className="bi bi-funnel me-1"></i>
              Filtrar por tipo
            </label>
            <div className="btn-group w-100" role="group">
              <button
                type="button"
                style={{
                  backgroundColor: filter === 'all' ? 'var(--primary)' : 'transparent',
                  color: filter === 'all' ? 'white' : 'var(--primary)',
                  border: `1px solid var(--primary)`,
                  padding: 'var(--spacing-xs) var(--spacing-md)',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  borderRadius: 'var(--radius-md) 0 0 var(--radius-md)'
                }}
                onClick={() => setFilter('all')}
                onMouseEnter={(e) => {
                  if (filter !== 'all') e.target.style.backgroundColor = 'var(--primary-light)';
                }}
                onMouseLeave={(e) => {
                  if (filter !== 'all') e.target.style.backgroundColor = 'transparent';
                }}
              >
                <i className="bi bi-list-ul me-1"></i>
                Todos ({movimientos.length})
              </button>
              <button
                type="button"
                style={{
                  backgroundColor: filter === 'expense' ? 'var(--danger)' : 'transparent',
                  color: filter === 'expense' ? 'white' : 'var(--danger)',
                  border: `1px solid var(--danger)`,
                  borderLeft: 'none',
                  borderRight: 'none',
                  padding: 'var(--spacing-xs) var(--spacing-md)',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
                onClick={() => setFilter('expense')}
                onMouseEnter={(e) => {
                  if (filter !== 'expense') e.target.style.backgroundColor = 'var(--danger-light)';
                }}
                onMouseLeave={(e) => {
                  if (filter !== 'expense') e.target.style.backgroundColor = 'transparent';
                }}
              >
                <i className="bi bi-arrow-down-circle me-1"></i>
                Gastos ({expenses.length})
              </button>
              <button
                type="button"
                style={{
                  backgroundColor: filter === 'settlement' ? 'var(--success)' : 'transparent',
                  color: filter === 'settlement' ? 'white' : 'var(--success)',
                  border: `1px solid var(--success)`,
                  padding: 'var(--spacing-xs) var(--spacing-md)',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  borderRadius: '0 var(--radius-md) var(--radius-md) 0'
                }}
                onClick={() => setFilter('settlement')}
                onMouseEnter={(e) => {
                  if (filter !== 'settlement') e.target.style.backgroundColor = 'var(--success-light)';
                }}
                onMouseLeave={(e) => {
                  if (filter !== 'settlement') e.target.style.backgroundColor = 'transparent';
                }}
              >
                <i className="bi bi-arrow-up-circle me-1"></i>
                Pagos ({settlements.length})
              </button>
            </div>
          </div>
          <div className="col-md-6">
            <label 
              className="form-label" 
              style={{ 
                fontWeight: '600', 
                color: 'var(--text-primary)', 
                fontSize: '0.875rem',
                marginBottom: 'var(--spacing-xs)'
              }}
            >
              <i className="bi bi-search me-1"></i>
              Buscar
            </label>
            <input
              type="text"
              className="form-control"
              style={{
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-xs) var(--spacing-md)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem'
              }}
              placeholder="Descripción o persona..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div 
            className="alert alert-danger"
            style={{
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--spacing-lg)',
              border: '1px solid var(--danger)',
              backgroundColor: 'var(--danger-light)'
            }}
            role="alert"
          >
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {/* Lista de movimientos */}
        {movimientosFiltrados.length === 0 ? (
          <div 
            style={{ 
              padding: 'var(--spacing-xxl)',
              textAlign: 'center',
              backgroundColor: 'var(--info-light)',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            <i 
              className="bi bi-inbox" 
              style={{ 
                fontSize: '3rem', 
                color: 'var(--info)',
                marginBottom: 'var(--spacing-md)',
                display: 'block'
              }}
            ></i>
            <p 
              style={{ 
                color: 'var(--text-secondary)', 
                marginBottom: 0,
                fontSize: '0.95rem'
              }}
            >
              {searchTerm || filter !== 'all' 
                ? 'No hay movimientos que coincidan con los filtros' 
                : 'Sin movimientos registrados'}
            </p>
          </div>
        ) : (
          <>
            <ul className="list-group list-group-flush" style={{ marginLeft: '-1rem', marginRight: '-1rem' }}>
              {movimientosPaginados.map(m => (
              <li 
                key={m.id} 
                className="list-group-item"
                style={{
                  border: 'none',
                  borderBottom: '1px solid var(--border-light)',
                  padding: 'var(--spacing-lg)',
                  transition: 'all var(--transition-fast)',
                  cursor: 'default'
                }}
                onMouseEnter={(el) => {
                  el.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                }}
                onMouseLeave={(el) => {
                  el.currentTarget.style.backgroundColor = 'white';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--spacing-md)' }}>
                  <div style={{ flex: 1 }}>
                    {m.type === 'expense' ? (
                      <>
                        <div style={{ marginBottom: 'var(--spacing-xs)' }}>
                          <span 
                            className="badge me-2"
                            style={{
                              backgroundColor: 'var(--danger-light)',
                              color: 'var(--danger)',
                              border: '1px solid var(--danger)',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              padding: '0.25em 0.65em'
                            }}
                          >
                            <i className="bi bi-cart-fill me-1"></i>
                            Gasto
                          </span>
                          <span 
                            style={{ 
                              fontWeight: '600', 
                              color: 'var(--text-primary)',
                              fontSize: '0.95rem'
                            }}
                          >
                            {m.description}
                          </span>
                        </div>
                        <small style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          <i className="bi bi-person-check me-1" style={{ color: 'var(--success)' }}></i>
                          Pagado por: <strong>{m.by}</strong>
                          <span className="mx-2">•</span>
                          <i className="bi bi-calendar3 me-1" style={{ color: 'var(--info)' }}></i>
                          {new Date(m.date).toLocaleDateString('es-AR')} {m.time}
                        </small>
                      </>
                    ) : (
                      <>
                        <div style={{ marginBottom: 'var(--spacing-xs)' }}>
                          <span 
                            className="badge me-2"
                            style={{
                              backgroundColor: 'var(--success-light)',
                              color: 'var(--success)',
                              border: '1px solid var(--success)',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              padding: '0.25em 0.65em'
                            }}
                          >
                            <i className="bi bi-check-circle-fill me-1"></i>
                            Pago
                          </span>
                          <span 
                            style={{ 
                              fontWeight: '600', 
                              color: 'var(--text-primary)',
                              fontSize: '0.95rem'
                            }}
                          >
                            {m.description}
                          </span>
                        </div>
                        <small style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          <i className="bi bi-calendar3 me-1" style={{ color: 'var(--info)' }}></i>
                          {new Date(m.date).toLocaleDateString('es-AR')} {m.time}
                        </small>
                      </>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '100px' }}>
                    <h5 
                      style={{ 
                        marginBottom: 0,
                        fontWeight: '700',
                        color: m.type === 'expense' ? 'var(--danger)' : 'var(--success)',
                        fontSize: '1.1rem'
                      }}
                    >
                      ${Number(m.amount).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h5>
                  </div>
                </div>
              </li>
              ))}
            </ul>

            {/* Controles de paginación */}
            {totalPages > 1 && (
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  marginTop: 'var(--spacing-lg)',
                  paddingTop: 'var(--spacing-lg)',
                  borderTop: '1px solid var(--border-light)'
                }}
              >
                {/* Botón Anterior */}
                <button
                  className="btn btn-sm"
                  style={{
                    backgroundColor: currentPage === 1 ? 'transparent' : 'var(--primary)',
                    color: currentPage === 1 ? 'var(--text-secondary)' : 'white',
                    border: `1px solid ${currentPage === 1 ? 'var(--border-light)' : 'var(--primary)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-xs) var(--spacing-md)',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  onMouseEnter={(e) => {
                    if (currentPage !== 1) {
                      e.target.style.backgroundColor = 'var(--primary-dark)';
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== 1) {
                      e.target.style.backgroundColor = 'var(--primary)';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <i className="bi bi-chevron-left me-1"></i>
                  Anterior
                </button>

                {/* Números de página */}
                <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                    // Mostrar solo páginas cercanas a la actual
                    if (
                      pageNum === 1 || 
                      pageNum === totalPages || 
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          className="btn btn-sm"
                          style={{
                            backgroundColor: currentPage === pageNum ? 'var(--primary)' : 'transparent',
                            color: currentPage === pageNum ? 'white' : 'var(--primary)',
                            border: `1px solid var(--primary)`,
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--spacing-xs)',
                            minWidth: '36px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)'
                          }}
                          onClick={() => setCurrentPage(pageNum)}
                          onMouseEnter={(e) => {
                            if (currentPage !== pageNum) {
                              e.target.style.backgroundColor = 'var(--primary-light)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (currentPage !== pageNum) {
                              e.target.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return (
                        <span 
                          key={pageNum} 
                          style={{ 
                            padding: 'var(--spacing-xs)',
                            color: 'var(--text-secondary)',
                            fontWeight: '600'
                          }}
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                {/* Botón Siguiente */}
                <button
                  className="btn btn-sm"
                  style={{
                    backgroundColor: currentPage === totalPages ? 'transparent' : 'var(--primary)',
                    color: currentPage === totalPages ? 'var(--text-secondary)' : 'white',
                    border: `1px solid ${currentPage === totalPages ? 'var(--border-light)' : 'var(--primary)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-xs) var(--spacing-md)',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  onMouseEnter={(e) => {
                    if (currentPage !== totalPages) {
                      e.target.style.backgroundColor = 'var(--primary-dark)';
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== totalPages) {
                      e.target.style.backgroundColor = 'var(--primary)';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  Siguiente
                  <i className="bi bi-chevron-right ms-1"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}