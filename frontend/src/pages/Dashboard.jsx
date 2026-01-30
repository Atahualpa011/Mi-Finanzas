// --- Importaciones principales ---
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { useCurrency } from '../hooks/useCurrency';
import { format, parseISO } from 'date-fns';
import EmotionalRecommendations from '../components/EmotionalRecommendations';
import HelpButton from '../components/HelpButton';
import { HELP_CONTENTS } from '../utils/helpContents';

// --- Registro de componentes de Chart.js ---
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// --- Función auxiliar para agrupar fechas ---
function getGroupKey(dateStr, groupBy) {
  const date = parseISO(dateStr);
  if (groupBy === 'year') return format(date, 'yyyy');
  if (groupBy === 'month') return format(date, 'yyyy-MM');
  return format(date, 'yyyy-MM-dd');
}

// --- Función para armar datos del gráfico de línea (saldo acumulado) ---
function getLineChartData(transactions, groupBy, currencySymbol) {
  // Agrupa transacciones por clave (día, mes, año)
  const groups = {};
  transactions.forEach(tx => {
    const key = getGroupKey(tx.date, groupBy);
    if (!groups[key]) groups[key] = 0;
    groups[key] += tx.type === 'income'
      ? Number(tx.amount)
      : -Number(tx.amount);
  });

  // Ordena las claves por fecha
  const sortedKeys = Object.keys(groups).sort();

  // Calcula saldo acumulado
  let saldo = 0;
  const data = sortedKeys.map(key => {
    saldo += groups[key];
    return saldo;
  });

  return {
    labels: sortedKeys,
    datasets: [
      {
        label: 'Saldo acumulado',
        data,
        fill: false,
        borderColor: '#0d6efd',
        backgroundColor: '#0d6efd',
        tension: 0.2,
        pointRadius: 3,
      },
    ],
  };
}

// --- Componente principal del Dashboard ---
export default function Dashboard() {
  const { currencyData, CURRENCIES } = useCurrency(); // Hook para obtener símbolo de moneda y lista
  const [profile, setProfile]           = useState(null); // Datos del usuario
  const [transactions, setTransactions] = useState(null); // Lista de transacciones
  const [investments, setInvestments]   = useState(null); // Lista de inversiones (Fase 3)
  const [investmentSummary, setInvestmentSummary] = useState(null); // Resumen de inversiones (Fase 3)
  const [groupBy, setGroupBy]           = useState('month'); // Agrupación para el gráfico de línea
  const [chartType, setChartType]       = useState('pie'); // 'pie' o 'bar'
  const [selectedYear, setSelectedYear] = useState('all'); // Filtro de año para el gráfico de línea
  const [categoryYear, setCategoryYear] = useState('all'); // Filtro de año para gráficos de categorías
  const [categoryMonth, setCategoryMonth] = useState('all'); // Filtro de mes para gráficos de categorías
  const navigate                        = useNavigate();

  // --- Carga datos del backend al montar ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login', { replace: true });

    // 1) Trae perfil del usuario
    fetch('/api/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(setProfile)
      .catch(() => { localStorage.removeItem('token'); navigate('/login', { replace: true }); });

    // 2) Trae transacciones del usuario
    fetch('/api/transactions', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(setTransactions)
      .catch(err => {
        console.error(err);
        setTransactions([]); // Si falla, deja vacío
      });

    // 3) Trae inversiones del usuario (Fase 3)
    fetch('/api/investments', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(setInvestments)
      .catch(err => {
        console.error(err);
        setInvestments([]); // Si falla, deja vacío
      });

    // 4) Trae resumen de inversiones (Fase 3)
    fetch('/api/investments/summary', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(setInvestmentSummary)
      .catch(err => {
        console.error(err);
        setInvestmentSummary(null);
      });
  }, [navigate]);

  // --- Muestra pantalla de carga si falta info ---
  if (!profile || transactions === null) {
    return <div className="text-center mt-5">Cargando dashboard…</div>;
  }

  // --- Opciones de año para filtros ---
  const creationYear = profile?.createdAt ? new Date(profile.createdAt).getFullYear() : 2025;
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = creationYear; y <= currentYear; y++) {
    yearOptions.push(y);
  }

  // --- Filtrar transacciones por año para el gráfico de línea ---
  const filteredTransactions = selectedYear === 'all'
    ? transactions
    : transactions.filter(tx => new Date(tx.date).getFullYear() === Number(selectedYear));

  // --- Cálculo de totales para el gráfico de barras ---
  const totalIncome = filteredTransactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const totalExpense = filteredTransactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  // --- Opciones de Chart.js para barras ---
  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: {
        label: ctx => `${currencyData.symbol}${ctx.parsed.y.toFixed(2)}`
      } }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  // --- Opciones de año y mes para filtros de categorías ---
  const allYears = Array.from(new Set(transactions.map(tx => new Date(tx.date).getFullYear()))).sort();
  const monthsInYear = categoryYear === 'all'
    ? []
    : Array.from(new Set(
        transactions
          .filter(tx => new Date(tx.date).getFullYear() === Number(categoryYear))
          .map(tx => new Date(tx.date).getMonth() + 1)
      )).sort((a, b) => a - b);

  // --- Filtrar transacciones por año y mes para gráficos de categorías ---
  const filteredCategoryTransactions = transactions.filter(tx => {
    const txYear = new Date(tx.date).getFullYear();
    const txMonth = new Date(tx.date).getMonth() + 1;
    if (categoryYear !== 'all' && txYear !== Number(categoryYear)) return false;
    if (categoryMonth !== 'all' && txMonth !== Number(categoryMonth)) return false;
    return true;
  });

  // --- Agrupa gastos por categoría para el gráfico de torta/barra ---
  const expenseByCategory = {};
  filteredCategoryTransactions
    .filter(tx => tx.type === 'expense' && !isNaN(Number(tx.amount)))
    .forEach(tx => {
      const cat = tx.category || 'Sin categoría';
      const amt = Number(tx.amount);
      if (!expenseByCategory[cat]) expenseByCategory[cat] = 0;
      expenseByCategory[cat] += amt;
    });

  const pieData = {
    labels: Object.keys(expenseByCategory),
    datasets: [
      {
        data: Object.values(expenseByCategory),
        backgroundColor: [
          '#dc3545', '#ffc107', '#0d6efd', '#20c997', '#6610f2', '#fd7e14', '#6c757d'
        ],
      },
    ],
  };

  // --- Agrupa ingresos por categoría para el gráfico de torta/barra ---
  const incomeByCategory = {};
  filteredCategoryTransactions
    .filter(tx => tx.type === 'income' && !isNaN(Number(tx.amount)))
    .forEach(tx => {
      const cat = tx.category || 'Sin categoría';
      const amt = Number(tx.amount);
      if (!incomeByCategory[cat]) incomeByCategory[cat] = 0;
      incomeByCategory[cat] += amt;
    });

  const incomePieData = {
    labels: Object.keys(incomeByCategory),
    datasets: [
      {
        data: Object.values(incomeByCategory),
        backgroundColor: [
          '#198754', '#ffc107', '#0d6efd', '#20c997', '#6610f2', '#fd7e14', '#6c757d'
        ],
      },
    ],
  };

  // --- Opciones de Chart.js para el gráfico de línea ---
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => `${currencyData.symbol}${ctx.parsed.y.toFixed(2)}`
        }
      }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  // --- Opciones de Chart.js para gráficos de torta/barra ---
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 18,
          padding: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.label}: ${currencyData.symbol}${ctx.parsed.toFixed(2)}`
        }
      }
    }
  };

  // --- Render principal ---
  return (
    <div>
      {/* Botón de ayuda */}
      <div className="mb-3">
        <HelpButton section="dashboard" helpContent={HELP_CONTENTS.dashboard} />
      </div>

      {/* Encabezado con saludo y saldo */}
      <div 
        className="d-flex justify-content-between align-items-center mb-4 flex-wrap p-4"
        style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          color: 'white'
        }}
      >
        <div>
          <h1 className="h3 mb-1" style={{ fontWeight: '700' }}>
            ¡Hola, {profile.username}!
          </h1>
          <p className="mb-0" style={{ opacity: 0.9, fontSize: '0.95rem' }}>
            Bienvenido a tu panel financiero
          </p>
        </div>
        <div className="text-end">
          <p className="mb-1" style={{ fontSize: '0.875rem', opacity: 0.9 }}>
            Saldo actual
          </p>
          <div className="fs-3 fw-bold">
            <span style={{ 
              color: totalIncome - totalExpense >= 0 ? 'var(--success-light)' : '#ffebee',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {currencyData.symbol}{(totalIncome - totalExpense).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Gráfico de línea: evolución del saldo */}
      <div 
        className="card-custom mb-4"
        style={{
          padding: 'var(--spacing-lg)',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <h5 className="mb-3" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
          Evolución de tu saldo
        </h5>
        <div className="mb-3 d-flex align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center gap-2">
            <label className="mb-0" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
              Agrupar por:
            </label>
            <select
              className="form-select form-select-sm"
              style={{
                width: 'auto',
                minWidth: '100px',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                padding: '0.375rem 0.75rem',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
              value={groupBy}
              onChange={e => setGroupBy(e.target.value)}
            >
              <option value="day">Día</option>
              <option value="month">Mes</option>
              <option value="year">Año</option>
            </select>
          </div>
          <div className="d-flex align-items-center gap-2">
            <label className="mb-0" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
              Filtrar año:
            </label>
            <select
              className="form-select form-select-sm"
              style={{
                width: 'auto',
                minWidth: '100px',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                padding: '0.375rem 0.75rem',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
            >
              <option value="all">Todos</option>
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
        <Line
          data={getLineChartData(filteredTransactions, groupBy, currencyData.symbol)}
          options={lineOptions}
          height={80}
        />
      </div>

      {/* Selector de tipo de gráfico para categorías */}
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2">
          <label className="mb-0" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
            Ver gráfico como:
          </label>
          <select
            className="form-select form-select-sm"
            style={{
              width: 'auto',
              minWidth: '110px',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              padding: '0.375rem 0.75rem',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            value={chartType}
            onChange={e => setChartType(e.target.value)}
          >
            <option value="pie">Torta</option>
            <option value="bar">Barras</option>
          </select>
        </div>
      </div>

      {/* Gráficos de gastos e ingresos por categoría */}
      {(Object.keys(expenseByCategory).length > 0 || Object.keys(incomeByCategory).length > 0) && (
        <div className="row mb-4 justify-content-center g-4">
          {/* Gastos */}
          <div className="col-md-6">
            {Object.keys(expenseByCategory).length > 0 && (
              <div 
                className="card-custom h-100"
                style={{
                  padding: 'var(--spacing-lg)',
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <h5 className="mb-4 text-center" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                  <i className="bi bi-arrow-down-circle me-2" style={{ color: 'var(--danger)' }}></i>
                  Gastos por categoría
                </h5>
                <div className="d-flex justify-content-center mb-3">
                  <div style={{ width: 300, height: 250 }}>
                    {chartType === 'pie'
                      ? <Pie data={pieData} options={pieOptions} />
                      : <Bar
                          data={{
                            labels: Object.keys(expenseByCategory),
                            datasets: [{
                              label: 'Gastos',
                              data: Object.values(expenseByCategory),
                              backgroundColor: 'var(--danger)'
                            }]
                        }}
                        options={barOptions}
                        height={250}
                        width={300}
                      />
                    }
                  </div>
                </div>
                <ul className="list-group" style={{ maxWidth: 400, margin: '0 auto' }}>
                  {Object.entries(expenseByCategory).map(([cat, amt]) => (
                    <li 
                      className="list-group-item d-flex justify-content-between align-items-center"
                      key={cat}
                      style={{
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--spacing-xs)',
                        backgroundColor: 'var(--bg-secondary)',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{cat}</span>
                      <span className="fw-bold" style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>
                        {currencyData.symbol}{amt.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {/* Ingresos */}
          <div className="col-md-6">
            {Object.keys(incomeByCategory).length > 0 && (
              <div 
                className="card-custom h-100"
                style={{
                  padding: 'var(--spacing-lg)',
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <h5 className="mb-4 text-center" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                  <i className="bi bi-arrow-up-circle me-2" style={{ color: 'var(--success)' }}></i>
                  Ingresos por categoría
                </h5>
                <div className="d-flex justify-content-center mb-3">
                  <div style={{ width: 220, height: 220 }}>
                    {chartType === 'pie'
                      ? <Pie data={incomePieData} options={pieOptions} />
                      : <Bar
                          data={{
                            labels: Object.keys(incomeByCategory),
                            datasets: [{
                              label: 'Ingresos',
                              data: Object.values(incomeByCategory),
                              backgroundColor: 'var(--success)'
                            }]
                        }} options={barOptions} />
                    }
                  </div>
                </div>
                <ul className="list-group" style={{ maxWidth: 400, margin: '0 auto' }}>
                  {Object.entries(incomeByCategory).map(([cat, amt]) => (
                    <li 
                      className="list-group-item d-flex justify-content-between align-items-center"
                      key={cat}
                      style={{
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--spacing-xs)',
                        backgroundColor: 'var(--bg-secondary)',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{cat}</span>
                      <span className="fw-bold" style={{ color: 'var(--success)', fontSize: '0.875rem' }}>
                        {currencyData.symbol}{amt.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filtros por año y mes para categorías */}
      <div className="mb-4">
        <div className="d-flex align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center gap-2">
            <label className="mb-0" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
              Año:
            </label>
            <select
              className="form-select form-select-sm"
              style={{
                width: 'auto',
                minWidth: '100px',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                padding: '0.375rem 0.75rem',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
              value={categoryYear}
              onChange={e => {
                setCategoryYear(e.target.value);
                setCategoryMonth('all'); // Reset mes al cambiar año
              }}
            >
              <option value="all">Todos</option>
              {allYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="d-flex align-items-center gap-2">
            <label className="mb-0" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
              Mes:
            </label>
            <select
              className="form-select form-select-sm"
              style={{
                width: 'auto',
                minWidth: '100px',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                padding: '0.375rem 0.75rem',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                opacity: categoryYear === 'all' ? 0.5 : 1
              }}
              value={categoryMonth}
              onChange={e => setCategoryMonth(e.target.value)}
              disabled={categoryYear === 'all'}
            >
              <option value="all">Todos</option>
              {monthsInYear.map(m => (
                <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ============ FASE 3: RESUMEN DE INVERSIONES ============ */}
      {investments && investments.length > 0 && investmentSummary && (
        <div className="mb-4">
          <div 
            className="card-custom"
            style={{
              padding: 'var(--spacing-lg)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 'var(--radius-lg)',
              border: 'none',
              boxShadow: 'var(--shadow-md)',
              color: 'white'
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0" style={{ fontWeight: '600', color: 'white' }}>
                <i className="bi bi-graph-up-arrow me-2"></i>
                Portafolio de Inversiones
              </h5>
              <button
                className="btn btn-light btn-sm"
                onClick={() => navigate('/investments')}
                style={{ fontSize: '0.875rem' }}
              >
                Ver detalles
                <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </div>

            <div className="row g-3">
              {/* Total Invertido */}
              <div className="col-6 col-md-3">
                <div style={{ 
                  backgroundColor: 'rgba(255,255,255,0.15)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: 'var(--spacing-md)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '0.25rem' }}>
                    Total Invertido
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                    ${parseFloat(investmentSummary.total_invested || 0).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Valor Actual */}
              <div className="col-6 col-md-3">
                <div style={{ 
                  backgroundColor: 'rgba(255,255,255,0.15)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: 'var(--spacing-md)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '0.25rem' }}>
                    Valor Actual
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                    ${parseFloat(investmentSummary.total_current_value || 0).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Ganancia/Pérdida */}
              <div className="col-6 col-md-3">
                <div style={{ 
                  backgroundColor: 'rgba(255,255,255,0.15)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: 'var(--spacing-md)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '0.25rem' }}>
                    Ganancia/Pérdida
                  </div>
                  <div style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '700',
                    color: parseFloat(investmentSummary.total_profit_loss || 0) >= 0 ? '#4ade80' : '#fca5a5'
                  }}>
                    {parseFloat(investmentSummary.total_profit_loss || 0) >= 0 ? '+' : ''}
                    ${parseFloat(investmentSummary.total_profit_loss || 0).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Rendimiento */}
              <div className="col-6 col-md-3">
                <div style={{ 
                  backgroundColor: 'rgba(255,255,255,0.15)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: 'var(--spacing-md)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '0.25rem' }}>
                    Rendimiento
                  </div>
                  <div style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '700',
                    color: parseFloat(investmentSummary.total_percentage || 0) >= 0 ? '#4ade80' : '#fca5a5'
                  }}>
                    {parseFloat(investmentSummary.total_percentage || 0) >= 0 ? '+' : ''}
                    {parseFloat(investmentSummary.total_percentage || 0).toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Mini estadísticas */}
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
              <div className="row text-center">
                <div className="col-6">
                  <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Inversiones Activas</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                    {investmentSummary.active_count || 0}
                  </div>
                </div>
                <div className="col-6">
                  <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Inversiones Cerradas</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                    {investmentSummary.closed_count || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ WIDGET DE RECOMENDACIONES EMOCIONALES ============ */}
      <div className="mb-4">
        <EmotionalRecommendations compact={true} />
      </div>

      {/* Sección de transacciones: últimos 6 movimientos */}
      <div 
        className="card-custom"
        style={{
          padding: 'var(--spacing-lg)',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <h5 className="mb-4" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
          <i className="bi bi-list-ul me-2" style={{ color: 'var(--primary)' }}></i>
          Tus movimientos
        </h5>

        {transactions.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-3">
              <i className="bi bi-inbox" style={{ fontSize: '3rem', color: 'var(--text-muted)' }}></i>
            </div>
            <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
              Todavía no ingresaste ningún gasto.
            </p>
            <button
              className="btn-primary-custom"
              style={{
                padding: '0.5rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/add-transaction')}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Agregar primer gasto
            </button>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table-custom mb-0">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Monto</th>
                    <th>Moneda</th>
                    <th>Fecha</th>
                    <th>Categoría</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions
                    .slice()
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 6)
                    .map(tx => (
                      <tr key={tx.id}>
                        <td>
                          <span 
                            className={tx.type === 'income' ? 'badge' : 'badge'}
                            style={{
                              backgroundColor: tx.type === 'income' ? 'var(--success-light)' : 'var(--danger-light)',
                              color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)',
                              padding: '0.25rem 0.75rem',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}
                          >
                            {tx.type === 'income' ? 'Ingreso' : 'Gasto'}
                          </span>
                        </td>
                        <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                          {tx.currency_symbol || currencyData.symbol}{Number(tx.amount).toFixed(2)}
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          {CURRENCIES.find(c => c.code === (tx.currency_code || 'ARS'))?.label || 'No especificado'}
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          {new Date(tx.date).toLocaleString()}
                        </td>
                        <td style={{ color: 'var(--text-primary)' }}>
                          {tx.category || 'Sin categoría'}
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          {tx.description || '-'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {/* Botón "Ver más" solo si hay más de 6 movimientos */}
            {transactions.length > 6 && (
              <div className="d-flex justify-content-end mt-3">
                <button
                  className="btn-secondary-custom"
                  style={{
                    padding: '0.5rem 1.25rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate('/movements')}
                >
                  Ver más
                  <i className="bi bi-arrow-right ms-2"></i>
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

