import { useEffect, useState } from 'react';
import { useCurrency } from '../hooks/useCurrency';

export default function Movements() {
  // --- Estados principales ---
  const [transactions, setTransactions] = useState([]); // Lista de movimientos (gastos e ingresos)
  const [suggestions, setSuggestions] = useState([]);
  const [message, setMessage] = useState(null);
  const [modalIndex, setModalIndex] = useState(null); // Índice de la sugerencia seleccionada
  const [autoModalShown, setAutoModalShown] = useState(false);
  const { currencyData } = useCurrency();                 // Hook para obtener el símbolo de moneda

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

  // --- Render principal ---
  return (
    <>
        <h2 className="mb-4 text-center">Mis movimientos</h2>
        {message && <div className="alert alert-success">{message}</div>}

        {/* Sugerencias pendientes */}
        {suggestions.length > 0 && (
          <div className="alert alert-info">
            <h5>Movimientos sugeridos de grupos</h5>
            <ul className="list-group mb-2">
              {suggestions.map((s, i) => (
                <li key={s.id} className="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                  <span>
                    <b>{s.type === 'expense' ? 'Gasto' : 'Ingreso'}:</b> {currencyData.symbol}{s.amount} <br />
                    <span className="text-muted">{s.description}</span>
                  </span>
                  <span className="mt-2 mt-md-0">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setModalIndex(i)}
                    >
                      Revisar
                    </button>
                  </span>
                </li>
              ))}
            </ul>
            <small>
              Podés aceptar o rechazar cada sugerencia cuando lo desees.<br />
              Si rechazas, deberás añadir el movimiento manualmente si lo deseas.
            </small>
          </div>
        )}

        {/* Modal reutilizable para aceptar/rechazar sugerencias */}
        {modalIndex !== null && (
          <div className="modal fade show" tabIndex="-1" style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {modalSuggestion.type === 'expense' ? 'Añadir gasto sugerido' : 'Añadir ingreso sugerido'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setModalIndex(null)}></button>
                </div>
                <div className="modal-body">
                  <p>
                    <b>Monto:</b> {currencyData.symbol}{modalSuggestion.amount}
                    <br />
                    <b>Detalle:</b> {modalSuggestion.description}
                  </p>
                  <p className="text-muted">
                    Sugerencia {modalIndex + 1} de {suggestions.length}
                    <br />
                    Si no lo añadís ahora, deberás hacerlo manualmente si lo deseas.
                  </p>
                </div>
                <div className="modal-footer d-flex justify-content-between">
                  <div>
                    <button
                      className="btn btn-outline-secondary me-2"
                      disabled={modalIndex === 0}
                      onClick={() => setModalIndex(modalIndex - 1)}
                    >
                      Anterior
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      disabled={modalIndex === suggestions.length - 1}
                      onClick={() => setModalIndex(modalIndex + 1)}
                    >
                      Siguiente
                    </button>
                  </div>
                  <div>
                    <button
                      className="btn btn-success me-2"
                      onClick={() => handleAccept(modalSuggestion.id)}
                    >
                      Añadir a mis movimientos
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => handleReject(modalSuggestion.id)}
                    >
                      Rechazar
                    </button>
                    <button
                      className="btn btn-secondary ms-2"
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

        <div className="row">
          {/* Tabla de gastos */}
          <div className="col-md-6 mb-4">
            <h4 className="mb-3 text-danger">Gastos</h4>
            {transactions.length === 0 ? (
              <div className="alert alert-info">No hay gastos registrados.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Monto</th>
                      <th>Fecha</th>
                      <th>Categoría</th>
                      <th>Descripción</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.filter(tx => tx.type === 'expense').map(tx => (
                      <tr key={tx.id}>
                        <td>{currencyData.symbol}{Number(tx.amount).toFixed(2)}</td>
                        <td>{new Date(tx.date).toLocaleString()}</td>
                        <td>{tx.category || 'Sin categoría'}</td>
                        <td>{tx.description || '-'}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(tx.id)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* Tabla de ingresos */}
          <div className="col-md-6 mb-4">
            <h4 className="mb-3 text-success">Ingresos</h4>
            {transactions.length === 0 ? (
              <div className="alert alert-info">No hay ingresos registrados.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Monto</th>
                      <th>Fecha</th>
                      <th>Categoría</th>
                      <th>Descripción</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.filter(tx => tx.type === 'income').map(tx => (
                      <tr key={tx.id}>
                        <td>{currencyData.symbol}{Number(tx.amount).toFixed(2)}</td>
                        <td>{new Date(tx.date).toLocaleString()}</td>
                        <td>{tx.category || 'Sin categoría'}</td>
                        <td>{tx.description || '-'}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(tx.id)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
    </>
  );
}