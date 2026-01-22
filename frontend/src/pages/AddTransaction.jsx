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
      <div 
        className="card-custom" 
        style={{ 
          maxWidth: 600, 
          width: '100%',
          padding: 'var(--spacing-xl)',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div className="mb-4">
          <h2 
            className="mb-1" 
            style={{ 
              fontWeight: '700', 
              color: 'var(--text-primary)',
              fontSize: '1.75rem'
            }}
          >
            <i className="bi bi-plus-circle me-2" style={{ color: 'var(--primary)' }}></i>
            Agregar transacción
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: 0 }}>
            Registra un nuevo ingreso o gasto
          </p>
        </div>

        {error && (
          <div 
            className="alert alert-danger" 
            style={{
              backgroundColor: 'var(--danger-light)',
              border: '1px solid var(--danger)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--danger)',
              marginBottom: 'var(--spacing-lg)'
            }}
          >
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Tipo de transacción */}
          <div className="mb-3">
            <label 
              className="form-label" 
              style={{ 
                fontWeight: '600', 
                color: 'var(--text-primary)', 
                fontSize: '0.875rem',
                marginBottom: 'var(--spacing-xs)'
              }}
            >
              Tipo de transacción
            </label>
            <select
              className="form-select"
              style={{
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                transition: 'all var(--transition-fast)'
              }}
              value={type}
              onChange={e => setType(e.target.value)}
            >
              <option value="expense">Gasto</option>
              <option value="income">Ingreso</option>
            </select>
          </div>

          {/* Monto */}
          <div className="mb-3">
            <label 
              className="form-label" 
              style={{ 
                fontWeight: '600', 
                color: 'var(--text-primary)', 
                fontSize: '0.875rem',
                marginBottom: 'var(--spacing-xs)'
              }}
            >
              Monto <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="number"
              className="form-control"
              style={{
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                transition: 'all var(--transition-fast)'
              }}
              value={amount}
              min="0"
              step="0.01"
              required
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          {/* Fecha y Hora */}
          <div className="row">
            <div className="col mb-3">
              <label 
                className="form-label" 
                style={{ 
                  fontWeight: '600', 
                  color: 'var(--text-primary)', 
                  fontSize: '0.875rem',
                  marginBottom: 'var(--spacing-xs)'
                }}
              >
                <i className="bi bi-calendar3 me-1"></i>
                Fecha
              </label>
              <DatePicker
                selected={date}
                onChange={date => setDate(date)}
                className="form-control"
                dateFormat="yyyy-MM-dd"
                maxDate={new Date()}
                style={{
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem'
                }}
              />
            </div>
            <div className="col mb-3">
              <label 
                className="form-label" 
                style={{ 
                  fontWeight: '600', 
                  color: 'var(--text-primary)', 
                  fontSize: '0.875rem',
                  marginBottom: 'var(--spacing-xs)'
                }}
              >
                <i className="bi bi-clock me-1"></i>
                Hora
              </label>
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
                style={{
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          </div>

          {/* Categoría */}
          <div className="mb-3">
            <label 
              className="form-label" 
              style={{ 
                fontWeight: '600', 
                color: 'var(--text-primary)', 
                fontSize: '0.875rem',
                marginBottom: 'var(--spacing-xs)'
              }}
            >
              <i className="bi bi-tag me-1"></i>
              Categoría
            </label>
            <select
              className="form-select"
              style={{
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                transition: 'all var(--transition-fast)'
              }}
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
                <label 
                  className="form-label" 
                  style={{ 
                    fontWeight: '600', 
                    color: 'var(--text-primary)', 
                    fontSize: '0.875rem',
                    marginBottom: 'var(--spacing-xs)'
                  }}
                >
                  <i className="bi bi-emoji-smile me-1"></i>
                  Emociones asociadas
                </label>
                <Select
                  isMulti
                  options={groupedOptions}
                  value={emotion}
                  onChange={setEmotion}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  placeholder="Seleccioná emociones..."
                  styles={{
                    control: (base) => ({
                      ...base,
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      padding: '2px',
                      backgroundColor: 'var(--bg-secondary)',
                      boxShadow: 'none',
                      '&:hover': {
                        borderColor: 'var(--primary)'
                      }
                    }),
                    menu: (base) => ({
                      ...base,
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-md)',
                      border: '1px solid var(--border-light)'
                    })
                  }}
                />
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  Opcional: ¿Cómo te sentiste al hacer este gasto?
                </small>
              </div>
              <div className="mb-3">
                <label 
                  className="form-label" 
                  style={{ 
                    fontWeight: '600', 
                    color: 'var(--text-primary)', 
                    fontSize: '0.875rem',
                    marginBottom: 'var(--spacing-xs)'
                  }}
                >
                  <i className="bi bi-geo-alt me-1"></i>
                  Motivo / Destino
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                    transition: 'all var(--transition-fast)'
                  }}
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
              <label 
                className="form-label" 
                style={{ 
                  fontWeight: '600', 
                  color: 'var(--text-primary)', 
                  fontSize: '0.875rem',
                  marginBottom: 'var(--spacing-xs)'
                }}
              >
                <i className="bi bi-wallet2 me-1"></i>
                Fuente del ingreso
              </label>
              <input
                type="text"
                className="form-control"
                style={{
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  transition: 'all var(--transition-fast)'
                }}
                placeholder="Ej: Nómina, Freelance..."
                value={source}
                onChange={e => setSource(e.target.value)}
              />
            </div>
          )}

          <button 
            type="submit" 
            className="btn w-100 mt-4"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--spacing-md) var(--spacing-lg)',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              boxShadow: 'var(--shadow-sm)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--primary-dark)';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'var(--primary)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <i className="bi bi-check-circle me-2"></i>
            Guardar transacción
          </button>
        </form>
      </div>
    </div>
  );
}
