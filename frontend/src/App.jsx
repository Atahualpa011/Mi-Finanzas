import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar          from './components/Navbar';
import ProtectedRoute  from './components/ProtectedRoute';
import Sidebar         from './components/Sidebar';
import Layout          from './components/Layout';
import Landing         from './pages/Landing';
import Login           from './pages/Login';
import Register        from './pages/Register';
import Dashboard       from './pages/Dashboard';
import AddTransaction  from './pages/AddTransaction';
import Profile         from './pages/Profile';
import Movements       from './pages/Movements';
import Friends         from './pages/Friends';
import GroupsList      from './pages/GroupsList';
import GroupDetail     from './pages/GroupDetail';
import EmotionalAnalysis from './pages/EmotionalAnalysis';
import Budgets         from './pages/Budgets';
import Gamification    from './pages/Gamification';
import './App.css';

// --- Componente principal de la aplicación: define rutas y layout global ---
function App() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true); // Estado para expandir/comprimir el sidebar
  const [authChanged, setAuthChanged] = useState(0);            // Estado para forzar actualización tras login/logout

  const isLoggedIn = !!localStorage.getItem('token');           // Determina si el usuario está autenticado

  return (
    <BrowserRouter>
      {/* Barra de navegación superior */}
      <Navbar onAuthChange={() => setAuthChanged(a => a + 1)} />
      {/* Sidebar lateral solo si el usuario está logueado */}
      {isLoggedIn && (
        <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
      )}
      {/* Layout principal, ajusta el margen si hay sidebar */}
      <Layout withSidebar={isLoggedIn ? sidebarExpanded : false}>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/"        element={<Landing />} />
          <Route path="/login"   element={<Login onAuthChange={() => setAuthChanged(a => a + 1)} />} />
          <Route path="/register" element={<Register onAuthChange={() => setAuthChanged(a => a + 1)} />} />
          {/* Rutas protegidas (requieren login) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />  
          <Route
            path="/add-transaction"
            element={
              <ProtectedRoute>
                <AddTransaction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/movements"
            element={
              <ProtectedRoute>
                <Movements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/friends"
            element={
              <ProtectedRoute>
                <Friends />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups"
            element={
              <ProtectedRoute>
                <GroupsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups/:groupId"
            element={
              <ProtectedRoute>
                <GroupDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/budgets"
            element={
              <ProtectedRoute>
                <Budgets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gamification"
            element={
              <ProtectedRoute>
                <Gamification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/emotional-analysis"
            element={<EmotionalAnalysis />}
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;


