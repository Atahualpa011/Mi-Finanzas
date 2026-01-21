import { useEffect, useState } from 'react';

export default function UserLevelBadge() {
  const [userLevel, setUserLevel] = useState(null);

  useEffect(() => {
    fetchUserLevel();
  }, []);

  const fetchUserLevel = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/gamification/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserLevel(data.level);
      }
    } catch (error) {
      console.error('Error al cargar nivel del usuario:', error);
    }
  };

  if (!userLevel) return null;

  return (
    <div 
      className="d-inline-flex align-items-center bg-primary bg-opacity-10 rounded-pill px-3 py-1"
      style={{ cursor: 'pointer' }}
      title={`${userLevel.experience_points} / ${userLevel.current_level * 100} XP`}
    >
      <i className="bi bi-star-fill text-warning me-2"></i>
      <span className="fw-bold text-primary">Nv. {userLevel.current_level}</span>
    </div>
  );
}
