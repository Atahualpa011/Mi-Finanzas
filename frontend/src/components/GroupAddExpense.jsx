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
    // Cargar miembros del grupo
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
        <h5 
          style={{ 
            marginBottom: 0,
            fontWeight: '600',
            color: 'var(--text-primary)',
            fontSize: '1.1rem'
          }}
        >
          <i className="bi bi-receipt me-2" style={{ color: 'var(--primary)' }}></i>
          Agregar Gasto al Grupo
        </h5>
      </div>
      
      <div className="card-body" style={{ padding: 'var(--spacing-xl)' }}>
        <form onSubmit={handleSubmit}>
          {/* Campos principales: descripción, monto, pagado por */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label 
                className="form-label" 
                style={{ 
                  fontWeight: '600', 
                  color: 'var(--text-primary)', 
                  fontSize: '0.875rem',
                  marginBottom: 'var(--spacing-xs)'
                }}
              >
                <i className="bi bi-text-left me-1"></i>
                Descripción <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                className="form-control"
                style={{
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem'
                }}
                placeholder="Ej: Cena en restaurante"
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="col-md-4">
              <label 
                className="form-label" 
                style={{ 
                  fontWeight: '600', 
                  color: 'var(--text-primary)', 
                  fontSize: '0.875rem',
                  marginBottom: 'var(--spacing-xs)'
                }}
              >
                <i className="bi bi-cash-stack me-1"></i>
                Monto Total <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                className="form-control"
                type="number"
                min="0"
                step="0.01"
                style={{
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem'
                }}
                placeholder="Ej: 5000"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="col-md-4">
              <label 
                className="form-label" 
                style={{ 
                  fontWeight: '600', 
                  color: 'var(--text-primary)', 
                  fontSize: '0.875rem',
                  marginBottom: 'var(--spacing-xs)'
                }}
              >
                <i className="bi bi-person-check me-1"></i>
                Pagado Por <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <select
                className="form-select"
                style={{
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem'
                }}
                value={paidBy}
                onChange={e => setPaidBy(e.target.value)}
                required
              >
                <option value="">Selecciona quién pagó...</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.username || m.name || m.email || m.user_id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sección de reparto */}
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <div 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-md)'
              }}
            >
              <label 
                style={{ 
                  fontWeight: '600', 
                  color: 'var(--text-primary)', 
                  fontSize: '0.95rem',
                  marginBottom: 0
                }}
              >
                <i className="bi bi-pie-chart me-2" style={{ color: 'var(--primary)' }}></i>
                Reparto del Gasto
              </label>
              <button
                type="button"
                className="btn btn-sm"
                style={{
                  backgroundColor: 'var(--info)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--spacing-xs) var(--spacing-md)',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
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
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--info-dark)';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'var(--info)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <i className="bi bi-distribute-vertical me-1"></i>
                Repartir en Partes Iguales
              </button>
            </div>

            {/* Campos para repartir el gasto entre miembros, con opción de bloquear/desbloquear */}
            <div className="row g-3">
              {members.map((m, i) => (
                <div className="col-md-3 col-sm-6" key={m.id}>
                  <div className="input-group">
                    <span 
                      className="input-group-text" 
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-light)',
                        color: 'var(--text-primary)',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      {m.username || m.name || m.email || m.user_id}
                    </span>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      step="0.01"
                      style={{
                        border: '1px solid var(--border-light)',
                        backgroundColor: locked[i] ? 'var(--warning-light)' : 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.95rem'
                      }}
                      value={shares[i]?.share}
                      onChange={e => handleShareChange(i, e.target.value)}
                      required
                      disabled={locked[i]}
                    />
                    <button
                      type="button"
                      className="btn"
                      style={{
                        backgroundColor: locked[i] ? 'var(--warning)' : 'transparent',
                        color: locked[i] ? 'white' : 'var(--text-secondary)',
                        border: `1px solid ${locked[i] ? 'var(--warning)' : 'var(--border-light)'}`,
                        borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                        padding: '0 12px',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                      onClick={() => {
                        setLocked(locked => {
                          const arr = [...locked];
                          arr[i] = !arr[i];
                          return arr;
                        });
                      }}
                      tabIndex={-1}
                      title={locked[i] ? 'Desbloquear' : 'Bloquear'}
                      onMouseEnter={(e) => {
                        if (!locked[i]) {
                          e.target.style.backgroundColor = 'var(--bg-secondary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!locked[i]) {
                          e.target.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <i className={`bi bi-${locked[i] ? 'lock-fill' : 'unlock'}`}></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div 
              style={{
                marginTop: 'var(--spacing-md)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                backgroundColor: 'var(--info-light)',
                border: '1px solid var(--info)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)'
              }}
            >
              <i className="bi bi-info-circle me-2" style={{ color: 'var(--info)' }}></i>
              <strong>Tip:</strong> Usa el candado para fijar montos específicos. Los campos desbloqueados se ajustarán automáticamente.
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

          <button 
            className="btn w-100" 
            type="submit"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--spacing-sm) var(--spacing-lg)',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--primary-dark)';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'var(--primary)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Agregar Gasto al Grupo
          </button>
        </form>
      </div>
    </div>
  );
}