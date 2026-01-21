import { useState, useEffect } from 'react';

/**
 * Hook para gestionar notificaciones de logros desbloqueados
 * Escucha eventos de logros y muestra notificaciones toast
 */
export function useAchievementNotifications() {
  const [notification, setNotification] = useState(null);
  const [queue, setQueue] = useState([]);

  // Procesar cola de notificaciones
  useEffect(() => {
    if (queue.length > 0 && !notification) {
      const next = queue[0];
      setNotification(next);
      setQueue(q => q.slice(1));
    }
  }, [queue, notification]);

  // Función para agregar notificación a la cola
  const showAchievement = (achievement) => {
    setQueue(q => [...q, achievement]);
  };

  // Función para cerrar notificación actual
  const closeNotification = () => {
    setNotification(null);
  };

  // Función para verificar nuevos logros (llamar después de acciones importantes)
  const checkNewAchievements = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/gamification/achievements', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        // Buscar logros desbloqueados recientemente (últimos 5 segundos)
        const recentlyUnlocked = [];
        data.forEach(category => {
          category.achievements.forEach(achievement => {
            if (achievement.unlocked) {
              const unlockedDate = new Date(achievement.unlocked_at);
              const now = new Date();
              const diffSeconds = (now - unlockedDate) / 1000;
              if (diffSeconds < 5) {
                recentlyUnlocked.push(achievement);
              }
            }
          });
        });
        
        // Mostrar notificaciones
        recentlyUnlocked.forEach(achievement => {
          showAchievement(achievement);
        });
      }
    } catch (error) {
      console.error('Error al verificar nuevos logros:', error);
    }
  };

  return {
    notification,
    showAchievement,
    closeNotification,
    checkNewAchievements
  };
}
