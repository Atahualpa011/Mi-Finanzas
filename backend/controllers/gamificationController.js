const gamificationModel = require('../models/gamificationModel');

// ============================================================================
// DASHBOARD DE GAMIFICACIÓN
// ============================================================================

// Obtener dashboard completo de gamificación
async function getDashboard(req, res) {
  try {
    const userId = req.user.userId;
    
    // Obtener nivel y XP
    const userLevel = await gamificationModel.getUserLevel(userId);
    const xpRequired = gamificationModel.getXPRequiredForLevel(userLevel.level);
    
    // Obtener racha actual
    const streak = await gamificationModel.getUserStreak(userId);
    
    // Obtener últimos logros desbloqueados (5 más recientes)
    const allAchievements = await gamificationModel.getUnlockedAchievements(userId);
    const recentAchievements = allAchievements.slice(0, 5);
    
    // Obtener desafíos activos
    const challenges = await gamificationModel.getUserChallenges(userId);
    const activeChallenges = challenges.filter(c => c.status === 'active');
    
    res.json({
      level: {
        current_level: userLevel.level,
        experience_points: userLevel.experience_points,
        xp_required: xpRequired,
        progress_percentage: ((userLevel.experience_points / xpRequired) * 100).toFixed(2),
        total_achievements: userLevel.total_achievements
      },
      streak: {
        current_streak: streak.current_streak,
        longest_streak: streak.longest_streak,
        last_transaction_date: streak.last_transaction_date
      },
      recent_achievements: recentAchievements,
      active_challenges: activeChallenges,
      stats: {
        total_unlocked: allAchievements.length,
        active_challenges_count: activeChallenges.length
      }
    });
  } catch (error) {
    console.error('Error al obtener dashboard de gamificación:', error);
    res.status(500).json({ error: 'Error al obtener dashboard de gamificación' });
  }
}

// ============================================================================
// LOGROS
// ============================================================================

// Obtener todos los logros (desbloqueados y bloqueados)
async function getAchievements(req, res) {
  try {
    const userId = req.user.userId;
    const achievements = await gamificationModel.getUserAchievements(userId);
    
    // Agrupar por categoría
    const grouped = {
      milestones: achievements.filter(a => a.category === 'milestones'),
      streaks: achievements.filter(a => a.category === 'streaks'),
      discipline: achievements.filter(a => a.category === 'discipline'),
      social: achievements.filter(a => a.category === 'social'),
      savings: achievements.filter(a => a.category === 'savings')
    };
    
    // Calcular estadísticas
    const totalAchievements = achievements.length;
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalPoints = achievements
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + (a.points || 0), 0);
    
    res.json({
      achievements: grouped,
      stats: {
        total: totalAchievements,
        unlocked: unlockedCount,
        locked: totalAchievements - unlockedCount,
        completion_percentage: ((unlockedCount / totalAchievements) * 100).toFixed(2),
        total_points_earned: totalPoints
      }
    });
  } catch (error) {
    console.error('Error al obtener logros:', error);
    res.status(500).json({ error: 'Error al obtener logros' });
  }
}

// Obtener logro específico por código
async function getAchievement(req, res) {
  try {
    const userId = req.user.userId;
    const { code } = req.params;
    
    const achievements = await gamificationModel.getUserAchievements(userId);
    const achievement = achievements.find(a => a.code === code);
    
    if (!achievement) {
      return res.status(404).json({ error: 'Logro no encontrado' });
    }
    
    res.json(achievement);
  } catch (error) {
    console.error('Error al obtener logro:', error);
    res.status(500).json({ error: 'Error al obtener logro' });
  }
}

// ============================================================================
// DESAFÍOS
// ============================================================================

// Obtener desafíos disponibles
async function getChallenges(req, res) {
  try {
    const userId = req.user.userId;
    
    // Obtener desafíos activos del sistema
    const activeChallenges = await gamificationModel.getActiveChallenges();
    
    // Obtener desafíos asignados al usuario
    const userChallenges = await gamificationModel.getUserChallenges(userId);
    
    // Marcar cuáles ya tiene el usuario
    const challengesWithStatus = activeChallenges.map(challenge => {
      const userChallenge = userChallenges.find(uc => uc.id === challenge.id);
      return {
        ...challenge,
        user_status: userChallenge ? userChallenge.status : 'available',
        user_progress: userChallenge ? userChallenge.current_progress : 0,
        progress_percentage: userChallenge 
          ? ((userChallenge.current_progress / userChallenge.target_value) * 100).toFixed(2)
          : 0
      };
    });
    
    res.json({
      challenges: challengesWithStatus,
      user_active_count: userChallenges.filter(c => c.status === 'active').length,
      user_completed_count: userChallenges.filter(c => c.status === 'completed').length
    });
  } catch (error) {
    console.error('Error al obtener desafíos:', error);
    res.status(500).json({ error: 'Error al obtener desafíos' });
  }
}

// Obtener desafíos del usuario (activos y completados)
async function getUserChallengesEndpoint(req, res) {
  try {
    const userId = req.user.userId;
    const challenges = await gamificationModel.getUserChallenges(userId);
    
    // Separar por estado
    const active = challenges.filter(c => c.status === 'active');
    const completed = challenges.filter(c => c.status === 'completed');
    const failed = challenges.filter(c => c.status === 'failed');
    const expired = challenges.filter(c => c.status === 'expired');
    
    res.json({
      active,
      completed,
      failed,
      expired,
      stats: {
        total: challenges.length,
        active_count: active.length,
        completed_count: completed.length,
        failed_count: failed.length,
        expired_count: expired.length
      }
    });
  } catch (error) {
    console.error('Error al obtener desafíos del usuario:', error);
    res.status(500).json({ error: 'Error al obtener desafíos del usuario' });
  }
}

// Aceptar/asignar desafío
async function acceptChallenge(req, res) {
  try {
    const userId = req.user.userId;
    const challengeId = parseInt(req.params.id);
    
    if (!challengeId || isNaN(challengeId)) {
      return res.status(400).json({ error: 'ID de desafío inválido' });
    }
    
    const result = await gamificationModel.assignChallenge(userId, challengeId);
    
    if (result.alreadyHas) {
      return res.status(400).json({ error: 'Ya tienes este desafío asignado' });
    }
    
    if (result.error) {
      return res.status(404).json({ error: result.error });
    }
    
    res.status(201).json({ 
      message: 'Desafío aceptado exitosamente',
      assigned: true
    });
  } catch (error) {
    console.error('Error al aceptar desafío:', error);
    res.status(500).json({ error: 'Error al aceptar desafío' });
  }
}

// ============================================================================
// LEADERBOARD (OPCIONAL)
// ============================================================================

// Obtener ranking de usuarios
async function getLeaderboard(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const db = require('../db');
    const [rows] = await db.query(`
      SELECT 
        u.id,
        ud.username,
        ul.level,
        ul.experience_points,
        ul.total_achievements,
        RANK() OVER (ORDER BY ul.level DESC, ul.experience_points DESC) AS rank_position
      FROM user_levels ul
      INNER JOIN users u ON ul.user_id = u.id
      INNER JOIN users_data ud ON u.id = ud.user_id
      ORDER BY ul.level DESC, ul.experience_points DESC
      LIMIT ?
    `, [limit]);
    
    res.json({
      leaderboard: rows,
      total_users: rows.length
    });
  } catch (error) {
    console.error('Error al obtener leaderboard:', error);
    res.status(500).json({ error: 'Error al obtener leaderboard' });
  }
}

// Obtener posición del usuario en el ranking
async function getUserRank(req, res) {
  try {
    const userId = req.user.userId;
    
    const db = require('../db');
    const [rows] = await db.query(`
      SELECT 
        user_id,
        level,
        experience_points,
        total_achievements,
        rank_position
      FROM (
        SELECT 
          ul.user_id,
          ul.level,
          ul.experience_points,
          ul.total_achievements,
          RANK() OVER (ORDER BY ul.level DESC, ul.experience_points DESC) AS rank_position
        FROM user_levels ul
      ) AS ranked
      WHERE user_id = ?
    `, [userId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Ranking no disponible' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener ranking del usuario:', error);
    res.status(500).json({ error: 'Error al obtener ranking del usuario' });
  }
}

// ============================================================================
// EXPORTAR FUNCIONES
// ============================================================================

module.exports = {
  getDashboard,
  getAchievements,
  getAchievement,
  getChallenges,
  getUserChallengesEndpoint,
  acceptChallenge,
  getLeaderboard,
  getUserRank
};
