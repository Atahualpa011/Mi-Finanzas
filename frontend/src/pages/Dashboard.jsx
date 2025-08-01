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
  const { currencyData } = useCurrency(); // Hook para obtener símbolo de moneda
  const [profile, setProfile]           = useState(null); // Datos del usuario
  const [transactions, setTransactions] = useState(null); // Lista de transacciones
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
    fetch('http://localhost:3001/api/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(setProfile)
      .catch(() => { localStorage.removeItem('token'); navigate('/login', { replace: true }); });

    // 2) Trae transacciones del usuario
    fetch('http://localhost:3001/api/transactions', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(setTransactions)
      .catch(err => {
        console.error(err);
        setTransactions([]); // Si falla, deja vacío
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
      {/* Encabezado con saludo y saldo */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <h1 className="h3 mb-2 mb-md-0">¡Hola, {profile.username}!</h1>
        <div className="fs-4 fw-bold">
          Saldo actual: <span className={totalIncome - totalExpense >= 0 ? 'text-success' : 'text-danger'}>
            {currencyData.symbol}{(totalIncome - totalExpense).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Gráfico de línea: evolución del saldo */}
      <div className="mb-4">
        <div className="mb-3 d-flex align-items-center flex-wrap">
          <label className="me-2 mb-0">Agrupar por:</label>
          <select
            className="form-select w-auto me-3"
            value={groupBy}
            onChange={e => setGroupBy(e.target.value)}
          >
            <option value="day">Día</option>
            <option value="month">Mes</option>
            <option value="year">Año</option>
          </select>
          <label className="me-2 mb-0">Filtrar año:</label>
          <select
            className="form-select w-auto"
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
          >
            <option value="all">Todos</option>
            {yearOptions.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <h5 className="mb-3">Evolución de tu saldo</h5>
        <Line
          data={getLineChartData(filteredTransactions, groupBy, currencyData.symbol)}
          options={lineOptions}
          height={80}
        />
      </div>

      {/* Selector de tipo de gráfico para categorías */}
      <div className="mb-3 d-flex align-items-center flex-wrap">
        <label className="me-2 mb-0">Ver gráfico como:</label>
        <select
          className="form-select w-auto"
          value={chartType}
          onChange={e => setChartType(e.target.value)}
        >
          <option value="pie">Torta</option>
          <option value="bar">Barras</option>
        </select>
      </div>

      {/* Gráficos de gastos e ingresos por categoría */}
      {(Object.keys(expenseByCategory).length > 0 || Object.keys(incomeByCategory).length > 0) && (
        <div className="row mb-4 justify-content-center">
          {/* Gastos */}
          <div className="col-md-6 mb-4 mb-md-0">
            {Object.keys(expenseByCategory).length > 0 && (
              <div className="d-flex flex-column align-items-center">
                <h5 className="mb-3 text-center w-100">Gastos</h5>
                <div style={{ width: 300, height: 250, marginBottom: 10 }}>
                  {chartType === 'pie'
                    ? <Pie data={pieData} options={pieOptions} />
                    : <Bar
                        data={{
                          labels: Object.keys(expenseByCategory),
                          datasets: [{
                            label: 'Gastos',
                            data: Object.values(expenseByCategory),
                            backgroundColor: '#dc3545'
                          }]
                      }}
                      options={barOptions}
                      height={250}
                      width={300}
                    />
                  }
                </div>
                <ul className="list-group" style={{ minWidth: 220, maxWidth: 300, width: '100%' }}>
                  {Object.entries(expenseByCategory).map(([cat, amt]) => (
                    <li className="list-group-item d-flex justify-content-between align-items-center" key={cat}>
                      <span>{cat}</span>
                      <span className="fw-bold text-danger">{currencyData.symbol}{amt.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {/* Ingresos */}
          <div className="col-md-6">
            {Object.keys(incomeByCategory).length > 0 && (
              <div className="d-flex flex-column align-items-center">
                <h5 className="mb-3 text-center w-100">Ingresos</h5>
                <div style={{ width: 220, height: 220, marginBottom: 10 }}>
                  {chartType === 'pie'
                    ? <Pie data={incomePieData} options={pieOptions} />
                    : <Bar
                        data={{
                          labels: Object.keys(incomeByCategory),
                          datasets: [{
                            label: 'Ingresos',
                            data: Object.values(incomeByCategory),
                            backgroundColor: '#198754'
                          }]
                      }} options={barOptions} />
                  }
                </div>
                <ul className="list-group" style={{ minWidth: 180, maxWidth: 250, width: '100%' }}>
                  {Object.entries(incomeByCategory).map(([cat, amt]) => (
                    <li className="list-group-item d-flex justify-content-between align-items-center" key={cat}>
                      <span>{cat}</span>
                      <span className="fw-bold text-success">{currencyData.symbol}{amt.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filtros por año y mes para categorías */}
      <div className="mb-3 d-flex align-items-center flex-wrap">
        <label className="me-2 mb-0">Año:</label>
        <select
          className="form-select w-auto me-3"
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
        <label className="me-2 mb-0">Mes:</label>
        <select
          className="form-select w-auto"
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

      {/* Sección de transacciones: últimos 6 movimientos */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-4">Tus movimientos</h5>

          {transactions.length === 0 ? (
            <div className="text-center py-5">
              <p className="mb-3">Todavía no ingresaste ningún gasto.</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/add-transaction')}
              >
                Agregar primer gasto
              </button>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Monto</th>
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
                          <td className={tx.type === 'income' ? 'text-success' : 'text-danger'}>
                            {tx.type === 'income' ? 'Ingreso' : 'Gasto'}
                          </td>
                          <td>{currencyData.symbol}{Number(tx.amount).toFixed(2)}</td>
                          <td>{new Date(tx.date).toLocaleString()}</td>
                          <td>{tx.category || 'Sin categoría'}</td>
                          <td>{tx.description || '-'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {/* Botón "Ver más" solo si hay más de 6 movimientos */}
              {transactions.length > 6 && (
                <div className="d-flex justify-content-end mt-3">
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => navigate('/movements')}
                  >
                    Ver más
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}

