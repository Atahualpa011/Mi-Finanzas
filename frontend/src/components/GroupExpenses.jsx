import { useEffect, useState } from 'react';

export default function GroupExpenses({ groupId, refresh }) {
  // --- Estado principal ---
  const [expenses, setExpenses] = useState([]); // Lista de gastos del grupo

  // --- Cargar gastos del grupo al montar o cuando cambian groupId/refresh ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    // Llama al backend para obtener los gastos del grupo
    fetch(`/api/groups/${groupId}/expenses`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setExpenses);
  }, [groupId, refresh]); // Se actualiza si cambia el grupo o se fuerza refresh

  // --- Render principal ---
  return (
    <div className="mb-4">
      <h4>Gastos</h4>
      <ul className="list-group">
        {/* Si no hay gastos, muestra mensaje */}
        {expenses.length === 0 ? (
          <li key="no-data" className="list-group-item">Sin gastos</li>
        ) : (
          // Muestra cada gasto con descripción, monto, fecha y quién pagó
          expenses.filter(e => e.id).map(e => (
            <li key={e.id} className="list-group-item">
              {e.description} - ${e.amount} - {e.date} <br />
              <small>Pagado por: {e.pagado_por}</small>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}