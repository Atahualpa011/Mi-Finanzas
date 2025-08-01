// src/pages/AddTransaction.jsx
// Importaciones de React y librerías auxiliares
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Definición de las emociones posibles, agrupadas por tipo
const EMOCIONES = [
  { value: 'Felicidad', label: 'Felicidad', group: 'Emociones positivas' },
  { value: 'Alivio', label: 'Alivio', group: 'Emociones positivas' },
  { value: 'Orgullo', label: 'Orgullo', group: 'Emociones positivas' },
  { value: 'Generosidad/Amor', label: 'Generosidad/Amor', group: 'Emociones positivas' },
  { value: 'Emocion/Entusiasmo', label: 'Emocion/Entusiasmo', group: 'Emociones positivas' },
  { value: 'Culpa', label: 'Culpa', group: 'Emociones negativas' },
  { value: 'Ansiedad/Estres', label: 'Ansiedad/Estres', group: 'Emociones negativas' },
  { value: 'Arrepentimiento', label: 'Arrepentimiento', group: 'Emociones negativas' },
  { value: 'Frustracion', label: 'Frustracion', group: 'Emociones negativas' },
  { value: 'Verguenza', label: 'Verguenza', group: 'Emociones negativas' },
  { value: 'Indiferencia', label: 'Indiferencia', group: 'Emociones neutras' },
  { value: 'Ambivalencia', label: 'Ambivalencia', group: 'Emociones neutras' },
];

// Opciones agrupadas para el selector de emociones
const groupedOptions = [
  {
    label: 'Emociones positivas',
    options: EMOCIONES.filter(e => e.group === 'Emociones positivas'),
  },
  {
    label: 'Emociones negativas',
    options: EMOCIONES.filter(e => e.group === 'Emociones negativas'),
  },
  {
    label: 'Emociones neutras',
    options: EMOCIONES.filter(e => e.group === 'Emociones neutras'),
  },
];

export default function AddTransaction() {
  // --- Estados principales del formulario ---
  const [type, setType]           = useState('expense'); // 'expense' o 'income'
  const [amount, setAmount]       = useState('');
  const [date, setDate]           = useState(new Date());
  const [time, setTime]           = useState(new Date().toTimeString().slice(0,5));
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [emotion, setEmotion]     = useState([]);    // Array de emociones seleccionadas
  const [destination, setDestination] = useState(''); // Motivo/destino del gasto
  const [source, setSource]       = useState('');    // Fuente del ingreso
  const [error, setError]         = useState(null);  // Mensaje de error
  const navigate                  = useNavigate();   // Para redirigir tras guardar
  const [categories, setCategories] = useState([]);  // Lista de categorías disponibles

  // --- Cargar categorías desde el backend al montar el componente ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:3001/api/categories', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  // --- Maneja el envío del formulario ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const token = localStorage.getItem('token');

    // Armamos el payload incluyendo solo los campos de detalle según tipo
    const payload = {
      type,
      amount,
      date: date.toISOString().slice(0,10),
      time,
      categoryId,
      description,
      ...(type === 'expense'
        ? { emotion: emotion.map(e => e.value).join(','), destination }
        : { source }
      )
    };

    try {
      // Enviar la transacción al backend
      const res = await fetch('http://localhost:3001/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar la transacción');
      }

      // Redirige al dashboard tras crear
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  // --- Filtra las categorías según el tipo seleccionado (gasto o ingreso) ---
  const filteredCategories = categories.filter(c => c.type === type);

  // --- Renderizado del formulario ---
  return (
    <div className="d-flex justify-content-center">
      <div className="card shadow-sm p-4" style={{ maxWidth: 500, width: '100%' }}>
        <h2 className="mb-4 text-center">Agregar transacción</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          {/* Tipo de transacción */}
          <div className="mb-3">
            <label className="form-label">Tipo</label>
            <select
              className="form-select"
              value={type}
              onChange={e => setType(e.target.value)}
            >
              <option value="expense">Gasto</option>
              <option value="income">Ingreso</option>
            </select>
          </div>

          {/* Monto */}
          <div className="mb-3">
            <label className="form-label">Monto</label>
            <input
              type="number"
              className="form-control"
              value={amount}
              min="0"
              step="0.01"
              required
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          {/* Fecha y Hora */}
          <div className="row">
            <div className="col mb-3">
              <label className="form-label">Fecha</label>
              <DatePicker
                selected={date}
                onChange={date => setDate(date)}
                className="form-control"
                dateFormat="yyyy-MM-dd"
                maxDate={new Date()}
              />
            </div>
            <div className="col mb-3">
              <label className="form-label">Hora</label>
              <DatePicker
                selected={date}
                onChange={date => {
                  // Mantiene la fecha, pero actualiza solo la hora
                  const newDate = new Date(date);
                  setDate(prev => {
                    const d = new Date(prev);
                    d.setHours(newDate.getHours());
                    d.setMinutes(newDate.getMinutes());
                    return d;
                  });
                  setTime(newDate.toTimeString().slice(0,5));
                }}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={5}
                timeCaption="Hora"
                dateFormat="HH:mm"
                className="form-control"
                value={time}
              />
            </div>
          </div>

          {/* Categoría */}
          <div className="mb-3">
            <label className="form-label">Categoría</label>
            <select
              className="form-select"
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
            >
              <option value="">Sin categoría</option>
              {filteredCategories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div className="mb-3">
            <label className="form-label">Descripción</label>
            <textarea
              className="form-control"
              rows="2"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Campos específicos para gastos */}
          {type === 'expense' && (
            <>
              <div className="mb-3">
                <label className="form-label">Emociones</label>
                <Select
                  isMulti
                  options={groupedOptions}
                  value={emotion}
                  onChange={setEmotion}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  placeholder="Seleccioná emociones..."
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Motivo</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: Cafetería, Supermercado..."
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Campo específico para ingresos */}
          {type === 'income' && (
            <div className="mb-3">
              <label className="form-label">Fuente</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej: Nómina, Freelance..."
                value={source}
                onChange={e => setSource(e.target.value)}
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary w-100 mt-3">
            Guardar
          </button>
        </form>
      </div>
    </div>
  );
}
