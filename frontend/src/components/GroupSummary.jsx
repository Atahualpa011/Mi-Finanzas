import { useEffect, useState } from 'react';

export default function GroupSummary({ groupId, refresh }) {
  // --- Estado principal ---
  const [summary, setSummary] = useState([]); // Lista de saldos por miembro

  // --- Cargar resumen al montar o cuando cambian groupId/refresh ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    // Llama al backend para obtener el resumen de saldos del grupo
    fetch(`/api/groups/${groupId}/summary`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setSummary);
  }, [groupId, refresh]);

  // --- Render principal ---
  return (
    <div className="mb-4">
      <h4>Resumen</h4>
      <ul className="list-group">
        {/* Si no hay datos, muestra mensaje */}
        {summary.length === 0 ? (
          <li key="no-data" className="list-group-item">Sin datos</li>
        ) : (
          // Muestra el saldo de cada miembro: a cobrar, debe o saldo cero
          summary.filter(s => s.id).map(s => (
            <li key={`summary-${s.id}`} className="list-group-item">
              {s.name}: {s.saldo > 0 ? `A cobrar $${s.saldo.toFixed(2)}` : s.saldo < 0 ? `Debe $${(-s.saldo).toFixed(2)}` : 'Saldo $0'}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}