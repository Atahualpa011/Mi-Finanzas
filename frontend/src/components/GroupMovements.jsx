import { useEffect, useState } from 'react';

export default function GroupMovements({ groupId, refresh }) {
  // --- Estados principales ---
  const [expenses, setExpenses] = useState([]);      // Lista de gastos del grupo
  const [settlements, setSettlements] = useState([]); // Lista de pagos/liquidaciones del grupo
  const [error, setError] = useState(null);          // Mensaje de error
  const [filter, setFilter] = useState('all');       // Filtro: 'all', 'expense', 'settlement'
  const [searchTerm, setSearchTerm] = useState(''); // Búsqueda por descripción

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

  // --- Render principal ---
  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Movimientos del grupo</h4>
        <span className="badge bg-secondary">{movimientosFiltrados.length} de {movimientos.length}</span>
      </div>

      {/* Filtros */}
      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <div className="btn-group w-100" role="group">
            <button
              type="button"
              className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('all')}
            >
              📋 Todos ({movimientos.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filter === 'expense' ? 'btn-danger' : 'btn-outline-danger'}`}
              onClick={() => setFilter('expense')}
            >
              🧾 Gastos ({expenses.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filter === 'settlement' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setFilter('settlement')}
            >
              💸 Pagos ({settlements.length})
            </button>
          </div>
        </div>
        <div className="col-md-6">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="🔍 Buscar por descripción o persona..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Lista de movimientos */}
      <ul className="list-group">
        {movimientosFiltrados.length === 0 ? (
          <li className="list-group-item text-center text-muted">
            {searchTerm || filter !== 'all' 
              ? 'No hay movimientos que coincidan con los filtros' 
              : 'Sin movimientos'}
          </li>
        ) : (
          movimientosFiltrados.map(m => (
            <li key={m.id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  {m.type === 'expense' ? (
                    <>
                      <span className="badge bg-danger me-2">Gasto</span>
                      <strong>{m.description}</strong>
                      <br />
                      <small className="text-muted">
                        Pagado por: <span className="fw-bold">{m.by}</span> — {new Date(m.date).toLocaleDateString('es-AR')} {m.time}
                      </small>
                    </>
                  ) : (
                    <>
                      <span className="badge bg-success me-2">Pago</span>
                      <strong>{m.description}</strong>
                      <br />
                      <small className="text-muted">
                        {new Date(m.date).toLocaleDateString('es-AR')} {m.time}
                      </small>
                    </>
                  )}
                </div>
                <div className="text-end">
                  <h5 className={`mb-0 ${m.type === 'expense' ? 'text-danger' : 'text-success'}`}>
                    ${Number(m.amount).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h5>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}