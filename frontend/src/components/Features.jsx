// Componente que muestra las características principales de la app en la landing page
export default function Features() {
  return (
    <div className="container py-5">
      {/* Fila con tres columnas, cada una representa una funcionalidad */}
      <div className="row text-center">
        {/* Característica 1: Transparencia total */}
        <div className="col-md-4">
          <img
            src="/img/icon1.png"
            alt="icono"
            className="mb-3 features-icon"
          />
          <h3>Transparencia total</h3>
          <p className="text-muted">
            Sabé exactamente tus ingresos y gastos en cualquier momento.
          </p>
        </div>
        {/* Característica 2: División de gastos */}
        <div className="col-md-4">
          <img
            src="/img/icon2.png"
            alt="icono"
            className="mb-3 features-icon"
          />
          <h3>Divide gastos fácilmente</h3>
          <p className="text-muted">
            Dividí automáticamente gastos entre amigos.
          </p>
        </div>
        {/* Característica 3: Notificaciones */}
        <div className="col-md-4">
          <img
            src="/img/icon3.png"
            alt="icono"
            className="mb-3 features-icon"
          />
          <h3>Notificaciones claras</h3>
          <p className="text-muted">
            Recibí alertas sobre gastos emocionales.
          </p>
        </div>
      </div>
    </div>
  );
}
