import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';

// --- Página de análisis emocional de gastos ---
export default function EmotionalAnalysis() {
  // --- Estados principales ---
  const [emotionStats, setEmotionStats] = useState({}); // Estadísticas por emoción para el gráfico
  const [separated, setSeparated] = useState({ positive: [], negative: [], neutral: [], other: [] }); // Gastos separados por tipo de emoción
  const [loading, setLoading] = useState(true); // Estado de carga

  // --- Cargar datos de análisis emocional al montar ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/analysis/emotional', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        setEmotionStats(data.emotionStats);
        setSeparated(data.separated);
        setLoading(false);
      });
  }, []);

  // --- Datos para el gráfico de torta ---
  const pieData = {
    labels: Object.keys(emotionStats),
    datasets: [
      {
        data: Object.values(emotionStats).map(e => e.total),
        backgroundColor: [
          '#198754', '#dc3545', '#ffc107', '#0d6efd', '#20c997', '#6610f2', '#fd7e14', '#6c757d'
        ],
      },
    ],
  };

  // --- Render principal ---
  return (
    <div>
      <h2 className="mb-4 text-center">Análisis emocional</h2>
      {loading ? (
        <div>Cargando datos…</div>
      ) : (
        <>
          {/* Gráfico de distribución de gastos por emoción */}
          <h4 className="mb-3">Distribución de gastos por emoción</h4>
          <div style={{ maxWidth: 400, margin: '0 auto' }}>
            <Pie data={pieData} />
          </div>
          {/* Listas de gastos por tipo de emoción */}
          <div className="row mt-5">
            <div className="col-md-4">
              <h5 className="text-success">Gastos positivos</h5>
              <ul className="list-group">
                {separated.positive.length === 0 && <li className="list-group-item">Sin gastos positivos.</li>}
                {separated.positive.map((tx, i) => (
                  <li key={i} className="list-group-item">
                    {tx.emotion}: ${Number(tx.amount).toFixed(2)} - {tx.description}
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-md-4">
              <h5 className="text-danger">Gastos negativos</h5>
              <ul className="list-group">
                {separated.negative.length === 0 && <li className="list-group-item">Sin gastos negativos.</li>}
                {separated.negative.map((tx, i) => (
                  <li key={i} className="list-group-item">
                    {tx.emotion}: ${Number(tx.amount).toFixed(2)} - {tx.description}
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-md-4">
              <h5 className="text-secondary">Gastos neutros</h5>
              <ul className="list-group">
                {separated.neutral.length === 0 && <li className="list-group-item">Sin gastos neutros.</li>}
                {separated.neutral.map((tx, i) => (
                  <li key={i} className="list-group-item">
                    {tx.emotion}: ${Number(tx.amount).toFixed(2)} - {tx.description}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}