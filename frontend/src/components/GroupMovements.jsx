import { useEffect, useState } from 'react';

export default function GroupMovements({ groupId, refresh }) {
  // --- Estados principales ---
  const [expenses, setExpenses] = useState([]);      // Lista de gastos del grupo
  const [settlements, setSettlements] = useState([]); // Lista de pagos/liquidaciones del grupo
  const [error, setError] = useState(null);          // Mensaje de error

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

  // --- Render principal ---
  return (
    <div className="mb-4">
      <h4>Movimientos del grupo</h4>
      {error && <div className="alert alert-danger">{error}</div>}
      <ul className="list-group">
        {movimientos.length === 0 ? (
          <li className="list-group-item">Sin movimientos</li>
        ) : (
          movimientos.map(m => (
            <li key={m.id} className="list-group-item">
              {m.type === 'expense'
                ? <>🧾 <b>{m.description}</b> — <span className="text-danger">${Number(m.amount).toFixed(2)}</span> <br /><small>Pagado por: {m.by} — {m.date} {m.time}</small></>
                : <>💸 <b>{m.description}</b> — <span className="text-success">${Number(m.amount).toFixed(2)}</span> <br /><small>{m.date} {m.time}</small></>
              }
            </li>
          ))
        )}
      </ul>
    </div>
  );
}