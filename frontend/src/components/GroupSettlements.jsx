import { useEffect, useState } from 'react';

export default function GroupSettlements({ groupId, refresh }) {
  // --- Estados principales ---
  const [settlements, setSettlements] = useState([]); // Sugerencias de pagos para saldar deudas
  const [error, setError] = useState(null);           // Mensaje de error

  // --- Cargar sugerencias de pagos al montar o cuando cambian groupId/refresh ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    // Llama al backend para obtener las sugerencias de pagos (simplificación de deudas)
    fetch(`/api/groups/${groupId}/simplify`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setSettlements(data); // Si la respuesta es un array, la guarda
        else setError(data.error || 'Error al calcular sugerencias');
      })
      .catch(() => setError('Error al conectar con el servidor'));
  }, [groupId, refresh]);

  // --- Registrar un pago (liquidación) entre miembros ---
  const handleSettle = async (from, to, amount, fromName, toName) => {
    // Confirma antes de registrar el pago
    if (!window.confirm(`¿Registrar que ${fromName} pagó $${Number(amount).toFixed(2)} a ${toName}?`)) return;
    const token = localStorage.getItem('token');
    try {
      // Llama al backend para registrar el pago
      const res = await fetch(`/api/groups/${groupId}/settlements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          from_member_id: from,
          to_member_id: to,
          amount,
          date: new Date().toISOString().slice(0, 10),
          time: new Date().toTimeString().slice(0, 8)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo registrar el pago');
      // Refresca la lista de sugerencias si se pasa función refresh
      if (typeof refresh === 'function') refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  // --- Render principal ---
  return (
    <div className="mb-4">
      <h4>Sugerencias de pagos</h4>
      {error && <div className="alert alert-danger">{error}</div>}
      <ul className="list-group">
        {settlements.length === 0 ? (
          <li key="no-data" className="list-group-item">No hay deudas pendientes.</li>
        ) : (
          settlements.map(s => (
            <li key={s.id} className="list-group-item d-flex justify-content-between align-items-center">
              <span>
                <b>{s.from_name}</b> debe pagar <b>${Number(s.amount).toFixed(2)}</b> a <b>{s.to_name}</b>
              </span>
              <button
                className="btn btn-success btn-sm"
                onClick={() => handleSettle(s.from, s.to, s.amount, s.from_name, s.to_name)}
              >
                Saldar
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}