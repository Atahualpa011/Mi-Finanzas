import { useEffect, useState } from 'react';

export default function GroupInvitations({ refresh }) {
  // --- Estados principales ---
  const [invitations, setInvitations] = useState([]); // Lista de invitaciones pendientes
  const [error, setError] = useState(null);           // Mensaje de error

  // --- Cargar invitaciones al montar o cuando cambia refresh ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/groups/invitations', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setInvitations)
      .catch(() => setInvitations([])); // Si falla, deja la lista vacía
  }, [refresh]);

  // --- Aceptar una invitación ---
  const handleAccept = async (invitationId) => {
    setError(null);
    const token = localStorage.getItem('token');
    // Llama al backend para aceptar la invitación
    const res = await fetch(`/api/groups/invitations/${invitationId}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || 'No se pudo aceptar la invitación');
    else setInvitations(invitations.filter(i => i.id !== invitationId)); // Saca la invitación aceptada
    if (typeof refresh === 'function') refresh(); // Si se pasa una función de refresh, la llama
  };

  // --- Render principal ---
  return (
    <div className="mb-4">
      <h4>Invitaciones a grupos</h4>
      {error && <div className="alert alert-danger">{error}</div>}
      <ul className="list-group">
        {invitations.length === 0 ? (
          <li className="list-group-item">No tienes invitaciones pendientes.</li>
        ) : (
          invitations.map(inv => (
            <li key={inv.id} className="list-group-item d-flex justify-content-between align-items-center">
              <span>
                Invitación para ser <b>{inv.member_name}</b> en el grupo <b>{inv.group_name}</b>
              </span>
              <button className="btn btn-success btn-sm" onClick={() => handleAccept(inv.id)}>
                Aceptar
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}