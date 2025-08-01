import { Link } from 'react-router-dom';

// Componente principal de bienvenida de la landing page
export default function Hero() {
    return (
        <div className="container py-5">
            <div className="row align-items-center">
                {/* Columna izquierda: texto y botones de acción */}
                <div className="col-md-6">
                    <div className="text-center">
                        {/* Título destacado */}
                        <h1 className="display-4 fw-bold">
                            Gestionar tus gastos nunca había sido tan fácil
                        </h1>
                        {/* Subtítulo o descripción */}
                        <p className="lead my-4">
                            Llevá el control de tus gastos personales y compartidos con claridad y sin complicaciones.
                        </p>
                        {/* Botón para registrarse (redirige a /register) */}
                        <Link to="/register" className="btn btn-primary btn-lg me-3">
                            Empezá gratis
                        </Link>
                        {/* Botón para ir al login (redirige a /login) */}
                        <Link to="/login" className="btn btn-outline-secondary btn-lg">
                            Ya tengo cuenta
                        </Link>
                    </div>
                </div>
                {/* Columna derecha: imagen ilustrativa */}
                <div className="col-md-6 text-center">
                    <img
                        src="/img/imagen-hero.jpg"
                        alt="App screenshot"
                        className="img-fluid rounded"
                    />
                </div>
            </div>
        </div>
    );
}
