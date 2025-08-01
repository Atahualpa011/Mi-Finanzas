// Importa el componente principal de bienvenida (Hero)
import Hero from '../components/Hero';
// Importa el componente de características/funcionalidades destacadas
import Features from '../components/Features';

// Componente principal de la landing page
export default function Landing() {
  // Renderiza la página de inicio
  return (
    <div>
      {/* Sección principal de bienvenida*/}
      <Hero />
      {/* Sección de características, muestra las funcionalidades clave de la app */}
      <Features />
    </div>
  );
}