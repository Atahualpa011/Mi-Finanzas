import { useState, useEffect } from 'react';
import LevelProgress from '../components/LevelProgress';
import AchievementCard from '../components/AchievementCard';
import StreakDisplay from '../components/StreakDisplay';
import ChallengeCard from '../components/ChallengeCard';
import AchievementNotification from '../components/AchievementNotification';
import HelpButton from '../components/HelpButton';
import { HELP_CONTENTS } from '../utils/helpContents';

// Mapeo de categorías para nombres en español e íconos
const CATEGORY_CONFIG = {
  milestones: { 
    name: 'Hitos', 
    icon: 'bi-bullseye',
    badgeColor: 'bg-primary'
  },
  streaks: { 
    name: 'Rachas', 
    icon: 'bi-fire',
    badgeColor: 'bg-danger'
  },
  discipline: { 
    name: 'Disciplina', 
    icon: 'bi-check-circle',
    badgeColor: 'bg-success'
  },
  social: { 
    name: 'Social', 
    icon: 'bi-people',
    badgeColor: 'bg-info'
  },
  savings: { 
    name: 'Ahorros', 
    icon: 'bi-piggy-bank',
    badgeColor: 'bg-warning'
  },
  investments: { 
    name: 'Inversiones', 
    icon: 'bi-graph-up-arrow',
    badgeColor: 'bg-primary'
  },
  emotional: { 
    name: 'Emocional', 
    icon: 'bi-emoji-smile',
    badgeColor: 'bg-gradient-purple'
  }
};

export default function Gamification() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  
  // Dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  
  // Achievements data
  const [achievements, setAchievements] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Challenges data
  const [challenges, setChallenges] = useState([]);
  const [userChallenges, setUserChallenges] = useState([]);
  
  // Leaderboard data
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  
  // Notification
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      if (activeTab === 'dashboard') {
        const res = await fetch('/api/gamification/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDashboardData(data);
        }
      } else if (activeTab === 'achievements') {
        const res = await fetch('/api/gamification/achievements', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Guarda las categorías disponibles
          setAvailableCategories(data.categories || []);
          // Convierte el objeto de logros en un array por categoría
          const achievementsArray = Object.keys(data.achievements).map(category => ({
            category,
            achievements: data.achievements[category]
          }));
          setAchievements(achievementsArray);
        }
      } else if (activeTab === 'challenges') {
        const [challengesRes, userChallengesRes] = await Promise.all([
          fetch('/api/gamification/challenges', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('/api/gamification/challenges/user', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        if (challengesRes.ok && userChallengesRes.ok) {
          const challengesData = await challengesRes.json();
          const userChallengesData = await userChallengesRes.json();              
          setChallenges(challengesData.challenges || []);
          const allUserChallenges = [
            ...(userChallengesData.active || []),
            ...(userChallengesData.completed || []),
            ...(userChallengesData.failed || []),
            ...(userChallengesData.expired || [])
          ];
          setUserChallenges(allUserChallenges);
        }
      } else if (activeTab === 'leaderboard') {
        const [leaderboardRes, rankRes] = await Promise.all([
          fetch('/api/gamification/leaderboard', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('/api/gamification/rank', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        if (leaderboardRes.ok && rankRes.ok) {
          const leaderboardData = await leaderboardRes.json();
          const rankData = await rankRes.json();
          setLeaderboard(leaderboardData.leaderboard || []);
          setUserRank(rankData);
        }
      }
    } catch (error) {
      console.error('Error al cargar datos de gamificación:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptChallenge = async (challengeId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/gamification/challenges/${challengeId}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Error al aceptar desafío:', error);
    }
  };

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter(cat => cat.category === selectedCategory);

  const categoryCounts = achievements.reduce((acc, cat) => {
    const unlocked = cat.achievements?.filter(a => a.unlocked).length || 0;
    const total = cat.achievements?.length || 0;
    acc[cat.category] = { unlocked, total };
    return acc;
  }, {});

  return (
    <div className="container-fluid py-4">
      {/* Botón de ayuda */}
      <div className="mb-3">
        <HelpButton section="gamification" helpContent={HELP_CONTENTS.gamification} />
      </div>

      {/* Encabezado */}
      <div className="d-flex align-items-center mb-4">
        <i className="bi bi-trophy-fill fs-2 text-warning me-3"></i>
        <div>
          <h2 className="mb-0">Gamificación</h2>
          <p className="text-muted mb-0">Completa desafíos, desbloquea logros y sube de nivel</p>
        </div>
      </div>

      {/* Tabs mejorados */}
      <ul className="nav nav-pills mb-4 p-2 bg-light rounded-3" style={{ borderRadius: 'var(--border-radius-lg)' }}>
        <li className="nav-item">
          <button
            className={`nav-link ${
              activeTab === 'dashboard' ? 'active' : ''
            }`}
            style={{
              borderRadius: 'var(--border-radius-md)',
              transition: 'all 0.2s ease',
              fontWeight: activeTab === 'dashboard' ? '600' : '500'
            }}
            onClick={() => setActiveTab('dashboard')}
          >
            <i className="bi bi-speedometer2 me-2"></i>
            Panel
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${
              activeTab === 'achievements' ? 'active' : ''
            }`}
            style={{
              borderRadius: 'var(--border-radius-md)',
              transition: 'all 0.2s ease',
              fontWeight: activeTab === 'achievements' ? '600' : '500'
            }}
            onClick={() => setActiveTab('achievements')}
          >
            <i className="bi bi-award me-2"></i>
            Logros
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${
              activeTab === 'challenges' ? 'active' : ''
            }`}
            style={{
              borderRadius: 'var(--border-radius-md)',
              transition: 'all 0.2s ease',
              fontWeight: activeTab === 'challenges' ? '600' : '500'
            }}
            onClick={() => setActiveTab('challenges')}
          >
            <i className="bi bi-flag me-2"></i>
            Desafíos
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${
              activeTab === 'leaderboard' ? 'active' : ''
            }`}
            style={{
              borderRadius: 'var(--border-radius-md)',
              transition: 'all 0.2s ease',
              fontWeight: activeTab === 'leaderboard' ? '600' : '500'
            }}
            onClick={() => setActiveTab('leaderboard')}
          >
            <i className="bi bi-bar-chart-fill me-2"></i>
            Ranking
          </button>
        </li>
      </ul>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && dashboardData && (
            <div className="row">
              <div className="col-lg-4 mb-4">
                <LevelProgress
                  userLevel={{
                    level: dashboardData.level.current_level,
                    experience_points: dashboardData.level.experience_points,
                    total_achievements: dashboardData.level.total_achievements
                  }}
                />
              </div>
              <div className="col-lg-4 mb-4">
                <StreakDisplay
                  streak={dashboardData.streak}
                />
              </div>
              <div className="col-lg-4 mb-4">
                <div className="card border-light shadow-sm h-100" style={{ borderRadius: 'var(--border-radius-lg)' }}>
                  <div className="card-header bg-info bg-opacity-10 border-0 d-flex align-items-center" style={{ borderRadius: 'var(--border-radius-lg) var(--border-radius-lg) 0 0' }}>
                    <i className="bi bi-flag-fill fs-5 text-info me-2"></i>
                    <span className="fw-semibold text-info">Desafíos Activos</span>
                  </div>
                  <div className="card-body">
                    <div className="text-center mb-3">
                      <div 
                        className="d-inline-flex align-items-center justify-content-center rounded-circle"
                        style={{ 
                          width: '80px', 
                          height: '80px',
                          backgroundColor: 'rgba(13, 202, 240, 0.1)',
                          border: '3px solid var(--bs-info)'
                        }}
                      >
                        <span className="text-info fw-bold" style={{ fontSize: '2rem' }}>
                          {dashboardData.stats?.active_challenges_count || 0}
                        </span>
                      </div>
                    </div>
                    <p className="text-center text-muted mb-3">desafíos en progreso</p>
                    <div className="p-3 bg-success bg-opacity-10 rounded-3 text-center">
                      <i className="bi bi-check-circle-fill text-success fs-4 mb-2 d-block"></i>
                      <div className="fw-bold text-dark" style={{ fontSize: '1.2rem' }}>
                        {dashboardData.recently_completed_challenges?.length || 0}
                      </div>
                      <small className="text-muted">completados recientemente</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Achievements */}
              <div className="col-12 mb-4">
                <div className="d-flex align-items-center mb-3">
                  <i className="bi bi-stars fs-4 text-warning me-2"></i>
                  <h4 className="mb-0 fw-semibold">Logros Recientes</h4>
                </div>
                <div className="row">
                  {dashboardData.recent_achievements.length === 0 ? (
                    <div className="col-12">
                      <div className="alert alert-info">
                        <i className="bi bi-info-circle me-2"></i>
                        Aún no has desbloqueado ningún logro. ¡Empieza a registrar transacciones!
                      </div>
                    </div>
                  ) : (
                    dashboardData.recent_achievements.map(achievement => (
                      <div key={achievement.code} className="col-md-6 col-lg-4 mb-3">
                        <AchievementCard achievement={achievement} />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Active Challenges */}
              {dashboardData.active_challenges.length > 0 && (
                <div className="col-12">
                  <div className="d-flex align-items-center mb-3">
                    <i className="bi bi-lightning-charge-fill fs-4 text-primary me-2"></i>
                    <h4 className="mb-0 fw-semibold">Desafíos Activos</h4>
                  </div>
                  <div className="row">
                    {dashboardData.active_challenges.map(challenge => (
                      <div key={challenge.id} className="col-md-6 col-lg-4 mb-3">
                        <ChallengeCard
                          challenge={challenge}
                          onAccept={handleAcceptChallenge}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div>
              {/* Category Filter */}
              <div className="mb-4">
                <div className="d-flex align-items-center mb-3">
                  <i className="bi bi-filter-circle fs-5 text-primary me-2"></i>
                  <span className="fw-semibold">Filtrar por categoría</span>
                </div>
                <div className="btn-group flex-wrap" role="group" style={{ gap: '0.5rem' }}>
                  <button
                    className={`btn btn-outline-primary ${
                      selectedCategory === 'all' ? 'active' : ''
                    }`}
                    style={{ borderRadius: 'var(--border-radius-md)' }}
                    onClick={() => setSelectedCategory('all')}
                  >
                    <i className="bi bi-grid-3x3-gap me-1"></i>
                    Todos
                  </button>
                  
                  {/* Botones de categoría dinámicos */}
                  {availableCategories.map(category => {
                    const config = CATEGORY_CONFIG[category] || {
                      name: category,
                      icon: 'bi-star',
                      badgeColor: 'bg-secondary'
                    };
                    
                    return (
                      <button
                        key={category}
                        className={`btn btn-outline-primary ${
                          selectedCategory === category ? 'active' : ''
                        }`}
                        style={{ borderRadius: 'var(--border-radius-md)' }}
                        onClick={() => setSelectedCategory(category)}
                      >
                        <i className={`${config.icon} me-1`}></i>
                        {config.name}{' '}
                        {categoryCounts[category] && (
                          <span className={`badge ${config.badgeColor} ms-1`}>
                            {categoryCounts[category].unlocked}/
                            {categoryCounts[category].total}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Achievements Grid */}
              {filteredAchievements.length === 0 ? (
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  No hay logros disponibles en esta categoría.
                </div>
              ) : (
                filteredAchievements.map(category => {
                  const config = CATEGORY_CONFIG[category.category] || {
                    name: category.category,
                    icon: 'bi-star'
                  };
                  
                  return (
                    <div key={category.category} className="mb-5">
                      <h4 className="mb-3">
                        <i className={`${config.icon} me-2`}></i>
                        {config.name}
                      </h4>
                      <div className="row">
                        {(category.achievements || []).map(achievement => (
                          <div key={achievement.code} className="col-md-6 col-lg-4 col-xl-3 mb-3">
                            <AchievementCard achievement={achievement} />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Challenges Tab */}
          {activeTab === 'challenges' && (
            <div className="row">
              {/* Available Challenges */}
              <div className="col-12 mb-4">
                <h4 className="mb-3">Desafíos Disponibles</h4>
                <div className="row">
                  {challenges.filter(c => !userChallenges.find(uc => uc.id === c.id)).length === 0 ? (
                    <div className="col-12">
                      <div className="alert alert-info">
                        <i className="bi bi-info-circle me-2"></i>
                        No hay desafíos disponibles en este momento.
                      </div>
                    </div>
                  ) : (
                    challenges
                      .filter(c => !userChallenges.find(uc => uc.id === c.id))
                      .map(challenge => (
                        <div key={challenge.id} className="col-md-6 col-lg-4 mb-3">
                          <ChallengeCard
                            challenge={challenge}
                            onAccept={handleAcceptChallenge}
                          />
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Active Challenges */}
              {userChallenges.filter(uc => uc.status === 'active').length > 0 && (
                <div className="col-12 mb-4">
                  <h4 className="mb-3">En Progreso</h4>
                  <div className="row">
                    {userChallenges
                      .filter(uc => uc.status === 'active')
                      .map(userChallenge => (
                        <div key={userChallenge.id} className="col-md-6 col-lg-4 mb-3">
                          <ChallengeCard
                            challenge={userChallenge}
                            onAccept={handleAcceptChallenge}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Completed Challenges */}
              {userChallenges.filter(uc => uc.status === 'completed').length > 0 && (
                <div className="col-12">
                  <h4 className="mb-3">Completados</h4>
                  <div className="row">
                    {userChallenges
                      .filter(uc => uc.status === 'completed')
                      .map(userChallenge => (
                        <div key={userChallenge.id} className="col-md-6 col-lg-4 mb-3">
                          <ChallengeCard
                            challenge={userChallenge}
                            onAccept={handleAcceptChallenge}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div className="row">
              <div className="col-lg-8 mx-auto">
                {/* User Rank Card */}
                {userRank && (
                  <div className="card shadow-sm mb-4 bg-primary bg-opacity-10">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h5 className="mb-0">Tu Posición</h5>
                          <p className="text-muted mb-0">en el ranking global</p>
                        </div>
                        <div className="text-end">
                          <h2 className="mb-0 text-primary">#{userRank.rank_position}</h2>
                          <p className="mb-0">
                            <i className="bi bi-star-fill text-warning me-1"></i>
                            Nv. {userRank.level} | {userRank.experience_points} XP
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Leaderboard */}
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title mb-4">
                      <i className="bi bi-trophy-fill text-warning me-2"></i>
                      Top 10 Usuarios
                    </h5>
                    <div className="list-group list-group-flush">
                      {leaderboard.map((user, index) => (
                        <div
                          key={user.id}
                          className={`list-group-item d-flex justify-content-between align-items-center ${
                            userRank && user.id === userRank.user_id ? 'bg-primary bg-opacity-10' : ''
                          }`}
                        >
                          <div className="d-flex align-items-center">
                            <div
                              className={`badge me-3 ${
                                index === 0 ? 'bg-warning' : index === 1 ? 'bg-secondary' : index === 2 ? 'bg-danger' : 'bg-primary'
                              }`}
                              style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}
                            >
                              {index < 3 ? (
                                <i className="bi bi-trophy-fill"></i>
                              ) : (
                                index + 1
                              )}
                            </div>
                            <div>
                              <h6 className="mb-0">{user.username}</h6>
                              <small className="text-muted">
                                {user.total_achievements} logros desbloqueados
                              </small>
                            </div>
                          </div>
                          <div className="text-end">
                            <div className="badge bg-primary bg-opacity-10 text-primary mb-1" style={{ fontSize: '0.9rem' }}>
                              <i className="bi bi-star-fill text-warning me-1"></i>
                              Nv. {user.level}
                            </div>
                            <div>
                              <small className="text-muted">{user.experience_points} XP</small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Achievement Notification */}
      {notification && (
        <AchievementNotification
          achievement={notification}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
