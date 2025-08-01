import { useEffect, useState } from 'react';

export default function GroupAddExpense({ groupId, onExpenseAdded }) {
  // --- Estados principales ---
  const [members, setMembers]     = useState([]);         // Lista de miembros del grupo
  const [paidBy, setPaidBy]       = useState('');         // Miembro que pagó el gasto
  const [amount, setAmount]       = useState('');         // Monto total del gasto
  const [description, setDescription] = useState('');     // Descripción del gasto
  const [shares, setShares]       = useState([]);         // Cuánto paga cada miembro
  const [locked, setLocked]       = useState([]);         // Estado de bloqueo de cada campo de reparto
  const [error, setError]         = useState(null);       // Mensaje de error

  // --- Cargar miembros del grupo al montar o cambiar groupId ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`/api/groups/${groupId}/members`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        // data.members es el array de miembros
        setMembers(data.members);
        setShares(data.members.map(m => ({ member_id: m.id, share: '' })));
        setLocked(data.members.map(() => false));
      });
  }, [groupId]);

  // --- Maneja el cambio de reparto individual ---
  const handleShareChange = (i, value) => {
    const val = value === '' ? '' : Number(value);
    let newShares = shares.map((s, idx) => idx === i ? { ...s, share: val } : s);

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setShares(newShares);
      return;
    }

    // Si TODOS los campos están desbloqueados, NO reparte automáticamente
    if (locked.every(l => !l)) {
      setShares(newShares);
      return;
    }

    // Sumar los shares bloqueados (excepto el que se edita si está bloqueado)
    const total = Number(amount);
    const lockedIndexes = locked
      .map((isLocked, idx) => isLocked ? idx : null)
      .filter(idx => idx !== null && idx !== i);

    const assigned = newShares
      .filter((s, idx) => locked[idx] && idx !== i)
      .reduce((sum, s) => sum + (s.share === '' ? 0 : Number(s.share)), 0);

    // El campo editado también cuenta como asignado si está bloqueado
    const editValue = val === '' ? 0 : Number(val);
    const isEditLocked = locked[i];
    const totalAssigned = assigned + (isEditLocked ? editValue : 0);

    // Repartir el resto entre los NO bloqueados (excepto el que se edita si está bloqueado)
    let freeIndexes = locked
      .map((isLocked, idx) => (!isLocked && idx !== i) ? idx : null)
      .filter(idx => idx !== null);

    // Si el campo editado NO está bloqueado, también es libre
    if (!isEditLocked) freeIndexes.push(i);

    if (freeIndexes.length > 0) {
      const restante = total - totalAssigned;
      const porCabeza = Math.floor((restante / freeIndexes.length) * 100) / 100;

      let sumExceptLast = 0;
      freeIndexes.forEach((idx, j) => {
        if (j === freeIndexes.length - 1) {
          newShares[idx].share = +(restante - sumExceptLast).toFixed(2);
        } else {
          newShares[idx].share = porCabeza;
          sumExceptLast += porCabeza;
        }
      });
    }

    setShares(newShares);
  };

  // --- Maneja el envío del formulario para agregar gasto ---
  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    const token = localStorage.getItem('token');
    const sharesNum = shares.map(s => ({ ...s, share: Number(s.share) || 0 }));
    const totalShares = sharesNum.reduce((sum, s) => sum + s.share, 0);
    if (Math.abs(totalShares - Number(amount)) > 0.01) {
      setError('La suma de los shares debe ser igual al monto.');
      return;
    }
    try {
      // Llama al backend para agregar el gasto al grupo
      const res = await fetch(`/api/groups/${groupId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          paid_by_member_id: paidBy,
          amount: Number(amount),
          description,
          date: new Date().toISOString().slice(0, 10),
          time: new Date().toTimeString().slice(0, 8),
          shares: sharesNum
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo agregar el gasto');
      // Limpia el formulario
      setAmount('');
      setDescription('');
      setShares(members.map(m => ({ member_id: m.id, share: '' })));
      setPaidBy('');
      setLocked(members.map(() => false));
      if (onExpenseAdded) onExpenseAdded();
    } catch (err) {
      setError(err.message);
    }
  };

  // --- Render principal ---
  return (
    <div className="mb-4">
      <h4>Agregar gasto</h4>
      <form onSubmit={handleSubmit}>
        <div className="row g-2 mb-2">
          <div className="col">
            <input
              className="form-control"
              placeholder="Descripción"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="col">
            <input
              className="form-control"
              type="number"
              min="0"
              step="0.01"
              placeholder="Monto"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="col">
            <select
              className="form-select"
              value={paidBy}
              onChange={e => setPaidBy(e.target.value)}
              required
            >
              <option value="">Pagado por...</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.username || m.name || m.email || m.user_id}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mb-2">
          <label>Reparto:</label>
          <div className="row g-2 mb-2">
            <div className="col-12 mb-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  // Reparte el monto en partes iguales entre todos los miembros
                  if (!amount || isNaN(amount) || Number(amount) <= 0 || members.length === 0) return;
                  const total = Number(amount);
                  const n = members.length;
                  const baseShare = Math.floor((total / n) * 100) / 100;
                  let sharesArr = Array(n).fill(baseShare);
                  const sumExceptLast = sharesArr.slice(0, n - 1).reduce((a, b) => a + b, 0);
                  sharesArr[n - 1] = +(total - sumExceptLast).toFixed(2);
                  setShares(members.map((m, i) => ({ member_id: m.id, share: sharesArr[i].toFixed(2) })));
                  setLocked(members.map(() => false));
                }}
              >
                Repartir en partes iguales
              </button>
            </div>
            {/* Campos para repartir el gasto entre miembros, con opción de bloquear/desbloquear */}
            {members.map((m, i) => (
              <div className="col-md-3 col-6" key={m.id}>
                <div className="input-group">
                  <span className="input-group-text">{m.username || m.name || m.email || m.user_id}</span>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    step="0.01"
                    value={shares[i]?.share}
                    onChange={e => handleShareChange(i, e.target.value)}
                    required
                    disabled={locked[i]}
                  />
                  <button
                    type="button"
                    className={`btn btn-${locked[i] ? 'warning' : 'outline-secondary'}`}
                    onClick={() => {
                      setLocked(locked => {
                        const arr = [...locked];
                        arr[i] = !arr[i];
                        return arr;
                      });
                    }}
                    tabIndex={-1}
                    title={locked[i] ? 'Desbloquear' : 'Bloquear'}
                  >
                    {locked[i] ? '🔒' : '🔓'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button className="btn btn-primary mt-2" type="submit">Agregar gasto</button>
      </form>
    </div>
  );
}