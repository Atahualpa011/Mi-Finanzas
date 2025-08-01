import { Navigate } from 'react-router-dom';

// Componente para proteger rutas privadas (solo accesibles si hay token JWT)
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token'); // Obtiene el token JWT del almacenamiento local

  // Si hay token, permite renderizar los hijos (la ruta protegida)
  // Si no hay token, redirige al login
  return token
    ? children
    : <Navigate to="/login" replace />;
}
