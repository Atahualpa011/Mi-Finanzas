import { useState, useEffect } from 'react';
import LevelProgress from '../components/LevelProgress';
import AchievementCard from '../components/AchievementCard';
import StreakDisplay from '../components/StreakDisplay';
import ChallengeCard from '../components/ChallengeCard';
import AchievementNotification from '../components/AchievementNotification';

export default function Gamification() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  
  // Dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  
  // Achievements data
  const [achievements, setAchievements] = useState([]);
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
      <div className="row mb-4">
        <div className="col">
          <h2 className="mb-0">
            <i className="bi bi-trophy-fill text-warning me-2"></i>
            Gamificación
          </h2>
          <p className="text-muted">Completa desafíos, desbloquea logros y sube de nivel</p>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <i className="bi bi-speedometer2 me-2"></i>
            Panel
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            <i className="bi bi-award me-2"></i>
            Logros
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'challenges' ? 'active' : ''}`}
            onClick={() => setActiveTab('challenges')}
          >
            <i className="bi bi-flag me-2"></i>
            Desafíos
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'leaderboard' ? 'active' : ''}`}
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
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">
                      <i className="bi bi-flag-fill text-info me-2"></i>
                      Desafíos Activos
                    </h5>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                      <h3 className="mb-0">{dashboardData.stats?.active_challenges_count || 0}</h3>
                      <small className="text-muted">en progreso</small>
                    </div>
                    <div className="text-end">
                      <div className="text-success">
                        <i className="bi bi-check-circle-fill me-1"></i>
                        {dashboardData.active_challenges?.filter(c => c.status === 'completed').length || 0} completados
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Achievements */}
              <div className="col-12 mb-4">
                <h4 className="mb-3">Logros Recientes</h4>
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
                  <h4 className="mb-3">Desafíos Activos</h4>
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
                <div className="btn-group" role="group">
                  <button
                    className={`btn btn-outline-primary ${selectedCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('all')}
                  >
                    Todos
                  </button>
                  <button
                    className={`btn btn-outline-primary ${selectedCategory === 'milestones' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('milestones')}
                  >
                    Hitos {categoryCounts.milestones && `(${categoryCounts.milestones.unlocked}/${categoryCounts.milestones.total})`}
                  </button>
                  <button
                    className={`btn btn-outline-primary ${selectedCategory === 'streaks' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('streaks')}
                  >
                    Rachas {categoryCounts.streaks && `(${categoryCounts.streaks.unlocked}/${categoryCounts.streaks.total})`}
                  </button>
                  <button
                    className={`btn btn-outline-primary ${selectedCategory === 'discipline' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('discipline')}
                  >
                    Disciplina {categoryCounts.discipline && `(${categoryCounts.discipline.unlocked}/${categoryCounts.discipline.total})`}
                  </button>
                  <button
                    className={`btn btn-outline-primary ${selectedCategory === 'social' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('social')}
                  >
                    Social {categoryCounts.social && `(${categoryCounts.social.unlocked}/${categoryCounts.social.total})`}
                  </button>
                  <button
                    className={`btn btn-outline-primary ${selectedCategory === 'savings' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('savings')}
                  >
                    Ahorros {categoryCounts.savings && `(${categoryCounts.savings.unlocked}/${categoryCounts.savings.total})`}
                  </button>
                </div>
              </div>

              {/* Achievements Grid */}
              {filteredAchievements.length === 0 ? (
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  No hay logros disponibles en esta categoría.
                </div>
              ) : (
                filteredAchievements.map(category => (
                  <div key={category.category} className="mb-5">
                    <h4 className="mb-3 text-capitalize">
                      {category.category === 'milestones' && 'Hitos'}
                      {category.category === 'streaks' && 'Rachas'}
                      {category.category === 'discipline' && 'Disciplina'}
                      {category.category === 'social' && 'Social'}
                      {category.category === 'savings' && 'Ahorros'}
                    </h4>
                    <div className="row">
                      {(category.achievements || []).map(achievement => (
                        <div key={achievement.code} className="col-md-6 col-lg-4 col-xl-3 mb-3">
                          <AchievementCard achievement={achievement} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))
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
