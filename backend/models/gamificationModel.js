const db = require('../db');

// ============================================================================
// NIVELES Y EXPERIENCIA
// ============================================================================

// Obtener nivel y experiencia del usuario
async function getUserLevel(userId) {
  const [rows] = await db.query(`
    SELECT user_id, level, experience_points, total_achievements, updated_at
    FROM user_levels
    WHERE user_id = ?
  `, [userId]);
  
  // Si no existe, inicializar
  if (rows.length === 0) {
    await db.query(`
      INSERT INTO user_levels (user_id, level, experience_points, total_achievements)
      VALUES (?, 1, 0, 0)
    `, [userId]);
    return { user_id: userId, level: 1, experience_points: 0, total_achievements: 0 };
  }
  
  return rows[0];
}

// Calcular XP requerido para el siguiente nivel
// Fórmula: nivel * 100 (nivel 2 = 100 XP, nivel 3 = 200 XP, nivel 4 = 300 XP, etc.)
function getXPRequiredForLevel(level) {
  return level * 100;
}

// Agregar experiencia y verificar level-up
async function addExperience(userId, points) {
  const userLevel = await getUserLevel(userId);
  const newXP = userLevel.experience_points + points;
  let currentLevel = userLevel.level;
  let remainingXP = newXP;
  
  // Verificar si sube de nivel (puede subir múltiples niveles)
  let leveledUp = false;
  while (remainingXP >= getXPRequiredForLevel(currentLevel)) {
    remainingXP -= getXPRequiredForLevel(currentLevel);
    currentLevel++;
    leveledUp = true;
  }
  
  // Actualizar en la base de datos
  await db.query(`
    UPDATE user_levels
    SET level = ?, experience_points = ?
    WHERE user_id = ?
  `, [currentLevel, remainingXP, userId]);
  
  return {
    leveledUp,
    oldLevel: userLevel.level,
    newLevel: currentLevel,
    currentXP: remainingXP,
    xpRequired: getXPRequiredForLevel(currentLevel)
  };
}

// ============================================================================
// LOGROS (ACHIEVEMENTS)
// ============================================================================

// Obtener todos los logros del sistema
async function getAllAchievements() {
  const [rows] = await db.query(`
    SELECT id, code, name, description, category, icon, points, target_value, created_at
    FROM achievements
    ORDER BY category, points ASC
  `);
  return rows;
}

// Obtener logros del usuario (desbloqueados y bloqueados)
async function getUserAchievements(userId) {
  const [rows] = await db.query(`
    SELECT 
      a.id,
      a.code,
      a.name,
      a.description,
      a.category,
      a.icon,
      a.points,
      a.target_value,
      ua.unlocked_at,
      ua.progress,
      CASE WHEN ua.id IS NOT NULL THEN TRUE ELSE FALSE END AS unlocked
    FROM achievements a
    LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
    ORDER BY unlocked DESC, a.category, a.points ASC
  `, [userId]);
  return rows;
}

// Obtener logros desbloqueados del usuario
async function getUnlockedAchievements(userId) {
  const [rows] = await db.query(`
    SELECT 
      a.id,
      a.code,
      a.name,
      a.description,
      a.category,
      a.icon,
      a.points,
      ua.unlocked_at,
      ua.progress
    FROM achievements a
    INNER JOIN user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = ?
    ORDER BY ua.unlocked_at DESC
  `, [userId]);
  return rows;
}

// Verificar si el usuario tiene un logro desbloqueado
async function hasAchievement(userId, achievementCode) {
  const [rows] = await db.query(`
    SELECT ua.id
    FROM user_achievements ua
    INNER JOIN achievements a ON ua.achievement_id = a.id
    WHERE ua.user_id = ? AND a.code = ?
  `, [userId, achievementCode]);
  return rows.length > 0;
}

// Desbloquear logro
async function unlockAchievement(userId, achievementCode) {
  // Verificar si ya está desbloqueado
  const alreadyUnlocked = await hasAchievement(userId, achievementCode);
  if (alreadyUnlocked) {
    return { unlocked: false, alreadyHad: true };
  }
  
  // Obtener el logro
  const [achievements] = await db.query(`
    SELECT id, points FROM achievements WHERE code = ?
  `, [achievementCode]);
  
  if (achievements.length === 0) {
    return { unlocked: false, error: 'Achievement not found' };
  }
  
  const achievement = achievements[0];
  
  // Desbloquear
  await db.query(`
    INSERT INTO user_achievements (user_id, achievement_id, progress)
    VALUES (?, ?, 100)
  `, [userId, achievement.id]);
  
  // Actualizar contador de logros
  await db.query(`
    UPDATE user_levels
    SET total_achievements = total_achievements + 1
    WHERE user_id = ?
  `, [userId]);
  
  // Agregar experiencia
  if (achievement.points > 0) {
    await addExperience(userId, achievement.points);
  }
  
  return { unlocked: true, points: achievement.points };
}

// ============================================================================
// RACHAS (STREAKS)
// ============================================================================

// Obtener racha del usuario
async function getUserStreak(userId) {
  const [rows] = await db.query(`
    SELECT user_id, current_streak, longest_streak, last_transaction_date, updated_at
    FROM user_streaks
    WHERE user_id = ?
  `, [userId]);
  
  if (rows.length === 0) {
    return { user_id: userId, current_streak: 0, longest_streak: 0, last_transaction_date: null };
  }
  
  return rows[0];
}

// Actualizar racha al registrar transacción
async function updateStreak(userId, transactionDate) {
  const streak = await getUserStreak(userId);
  
  // Si no hay registro previo, crear
  if (!streak.last_transaction_date) {
    await db.query(`
      INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_transaction_date)
      VALUES (?, 1, 1, ?)
    `, [userId, transactionDate]);
    
    // Verificar logros de racha
    await checkStreakAchievements(userId, 1);
    return { current_streak: 1, longest_streak: 1, continued: true };
  }
  
  const lastDate = new Date(streak.last_transaction_date);
  const currentDate = new Date(transactionDate);
  
  // Calcular diferencia en días
  const diffTime = currentDate - lastDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  let newCurrentStreak = streak.current_streak;
  let newLongestStreak = streak.longest_streak;
  let continued = false;
  
  if (diffDays === 0) {
    // Misma fecha, no hacer nada
    return { current_streak: newCurrentStreak, longest_streak: newLongestStreak, continued: false };
  } else if (diffDays === 1) {
    // Día consecutivo, incrementar racha
    newCurrentStreak++;
    continued = true;
    if (newCurrentStreak > newLongestStreak) {
      newLongestStreak = newCurrentStreak;
    }
  } else {
    // Se rompió la racha
    newCurrentStreak = 1;
    continued = false;
  }
  
  // Actualizar
  await db.query(`
    UPDATE user_streaks
    SET current_streak = ?, longest_streak = ?, last_transaction_date = ?
    WHERE user_id = ?
  `, [newCurrentStreak, newLongestStreak, transactionDate, userId]);
  
  // Verificar logros de racha
  if (continued) {
    await checkStreakAchievements(userId, newCurrentStreak);
  }
  
  return { current_streak: newCurrentStreak, longest_streak: newLongestStreak, continued };
}

// Verificar y desbloquear logros de racha
async function checkStreakAchievements(userId, currentStreak) {
  const streakMilestones = [
    { days: 3, code: 'streak_3' },
    { days: 7, code: 'streak_7' },
    { days: 14, code: 'streak_14' },
    { days: 30, code: 'streak_30' },
    { days: 60, code: 'streak_60' },
    { days: 100, code: 'streak_100' }
  ];
  
  for (const milestone of streakMilestones) {
    if (currentStreak >= milestone.days) {
      await unlockAchievement(userId, milestone.code);
    }
  }
}

// ============================================================================
// DESAFÍOS (CHALLENGES)
// ============================================================================

// Obtener desafíos activos
async function getActiveChallenges() {
  const [rows] = await db.query(`
    SELECT 
      id, code, name, description, type, target_value, 
      reward_points, category_id, start_date, end_date, is_active
    FROM challenges
    WHERE is_active = TRUE
    ORDER BY type, reward_points DESC
  `);
  return rows;
}

// Obtener desafíos del usuario (activos y completados)
async function getUserChallenges(userId) {
  const [rows] = await db.query(`
    SELECT 
      c.id,
      c.code,
      c.name,
      c.description,
      c.type,
      c.target_value,
      c.reward_points,
      c.category_id,
      uc.current_progress,
      uc.status,
      uc.started_at,
      uc.completed_at,
      ROUND((uc.current_progress / uc.target_value) * 100) AS progress_percentage
    FROM challenges c
    INNER JOIN user_challenges uc ON c.id = uc.challenge_id
    WHERE uc.user_id = ?
    ORDER BY uc.status ASC, uc.started_at DESC
  `, [userId]);
  return rows;
}

// Asignar desafío a usuario
async function assignChallenge(userId, challengeId) {
  // Verificar si ya está asignado
  const [existing] = await db.query(`
    SELECT id FROM user_challenges
    WHERE user_id = ? AND challenge_id = ?
  `, [userId, challengeId]);
  
  if (existing.length > 0) {
    return { assigned: false, alreadyHas: true };
  }
  
  // Obtener target_value del desafío
  const [challenge] = await db.query(`
    SELECT target_value FROM challenges WHERE id = ?
  `, [challengeId]);
  
  if (challenge.length === 0) {
    return { assigned: false, error: 'Challenge not found' };
  }
  
  // Asignar
  await db.query(`
    INSERT INTO user_challenges (user_id, challenge_id, target_value, status)
    VALUES (?, ?, ?, 'active')
  `, [userId, challengeId, challenge[0].target_value]);
  
  return { assigned: true };
}

// Actualizar progreso de desafío
async function updateChallengeProgress(userId, challengeCode, incrementValue) {
  // Obtener desafío del usuario
  const [rows] = await db.query(`
    SELECT uc.id, uc.current_progress, uc.target_value, c.reward_points, c.code
    FROM user_challenges uc
    INNER JOIN challenges c ON uc.challenge_id = c.id
    WHERE uc.user_id = ? AND c.code = ? AND uc.status = 'active'
  `, [userId, challengeCode]);
  
  if (rows.length === 0) {
    return { updated: false, notFound: true };
  }
  
  const userChallenge = rows[0];
  const newProgress = userChallenge.current_progress + incrementValue;
  const completed = newProgress >= userChallenge.target_value;
  
  if (completed) {
    // Completar desafío
    await db.query(`
      UPDATE user_challenges
      SET current_progress = ?, status = 'completed', completed_at = NOW()
      WHERE id = ?
    `, [newProgress, userChallenge.id]);
    
    // Otorgar recompensa
    await addExperience(userId, userChallenge.reward_points);
    
    return { 
      updated: true, 
      completed: true, 
      progress: newProgress,
      reward: userChallenge.reward_points
    };
  } else {
    // Actualizar progreso
    await db.query(`
      UPDATE user_challenges
      SET current_progress = ?
      WHERE id = ?
    `, [newProgress, userChallenge.id]);
    
    return { 
      updated: true, 
      completed: false, 
      progress: newProgress,
      remaining: userChallenge.target_value - newProgress
    };
  }
}

// ============================================================================
// VERIFICACIONES AUTOMÁTICAS DE LOGROS
// ============================================================================

// Verificar logros relacionados con transacciones
async function checkTransactionAchievements(userId) {
  // Contar transacciones totales
  const [countRows] = await db.query(`
    SELECT COUNT(*) AS total FROM transactions WHERE user_id = ?
  `, [userId]);
  
  const totalTransactions = countRows[0].total;
  
  // Verificar hitos de transacciones
  const milestones = [
    { count: 1, code: 'first_transaction' },
    { count: 10, code: 'transactions_10' },
    { count: 50, code: 'transactions_50' },
    { count: 100, code: 'transactions_100' },
    { count: 500, code: 'transactions_500' },
    { count: 1000, code: 'transactions_1000' }
  ];
  
  for (const milestone of milestones) {
    if (totalTransactions >= milestone.count) {
      await unlockAchievement(userId, milestone.code);
    }
  }
  
  // Verificar primer ingreso
  const [incomeRows] = await db.query(`
    SELECT id FROM transactions WHERE user_id = ? AND type = 'income' LIMIT 1
  `, [userId]);
  
  if (incomeRows.length > 0) {
    await unlockAchievement(userId, 'first_income');
  }
}

// Verificar logros relacionados con amigos
async function checkSocialAchievements(userId) {
  // Contar amigos aceptados
  const [friendRows] = await db.query(`
    SELECT COUNT(*) AS total FROM friends 
    WHERE user_id = ? AND status = 'accepted'
  `, [userId]);
  
  const totalFriends = friendRows[0].total;
  
  const friendMilestones = [
    { count: 1, code: 'first_friend' },
    { count: 5, code: 'friends_5' },
    { count: 10, code: 'friends_10' }
  ];
  
  for (const milestone of friendMilestones) {
    if (totalFriends >= milestone.count) {
      await unlockAchievement(userId, milestone.code);
    }
  }
  
  // Contar transferencias
  const [transferRows] = await db.query(`
    SELECT COUNT(*) AS total FROM transfers WHERE from_user_id = ?
  `, [userId]);
  
  const totalTransfers = transferRows[0].total;
  
  if (totalTransfers >= 1) {
    await unlockAchievement(userId, 'first_transfer');
  }
  if (totalTransfers >= 10) {
    await unlockAchievement(userId, 'transfers_10');
  }
}

// Verificar logros de grupos
async function checkGroupAchievements(userId) {
  // Contar grupos creados
  const [groupRows] = await db.query(`
    SELECT COUNT(*) AS total FROM groups_ WHERE created_by = ?
  `, [userId]);
  
  const totalGroups = groupRows[0].total;
  
  if (totalGroups >= 1) {
    await unlockAchievement(userId, 'first_group');
  }
  if (totalGroups >= 3) {
    await unlockAchievement(userId, 'groups_3');
  }
  
  // Contar gastos grupales pagados
  const [expenseRows] = await db.query(`
    SELECT COUNT(DISTINCT ge.id) AS total
    FROM group_expenses ge
    INNER JOIN group_members gm ON ge.paid_by_member_id = gm.id
    WHERE gm.user_id = ?
  `, [userId]);
  
  const totalExpenses = expenseRows[0].total;
  
  if (totalExpenses >= 10) {
    await unlockAchievement(userId, 'group_expense_10');
  }
}

// Verificar logros de presupuestos
async function checkBudgetAchievements(userId) {
  // Contar presupuestos activos
  const [budgetRows] = await db.query(`
    SELECT COUNT(*) AS total FROM budgets WHERE user_id = ? AND is_active = TRUE
  `, [userId]);
  
  const totalBudgets = budgetRows[0].total;
  
  if (totalBudgets >= 1) {
    await unlockAchievement(userId, 'first_budget');
  }
  if (totalBudgets >= 5) {
    await unlockAchievement(userId, 'budgets_5');
  }
}

// Verificar logros de ahorro (balance positivo)
async function checkSavingsAchievements(userId) {
  // Calcular balance total
  const [rows] = await db.query(`
    SELECT 
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) AS balance
    FROM transactions
    WHERE user_id = ?
  `, [userId]);
  
  const balance = parseFloat(rows[0].balance);
  
  if (balance > 0) {
    await unlockAchievement(userId, 'positive_balance');
  }
  
  const savingsMilestones = [
    { amount: 10000, code: 'save_10k' },
    { amount: 50000, code: 'save_50k' },
    { amount: 100000, code: 'save_100k' },
    { amount: 500000, code: 'save_500k' }
  ];
  
  for (const milestone of savingsMilestones) {
    if (balance >= milestone.amount) {
      await unlockAchievement(userId, milestone.code);
    }
  }
}

// ============================================================================
// EXPORTAR FUNCIONES
// ============================================================================

module.exports = {
  // Niveles y experiencia
  getUserLevel,
  getXPRequiredForLevel,
  addExperience,
  
  // Logros
  getAllAchievements,
  getUserAchievements,
  getUnlockedAchievements,
  hasAchievement,
  unlockAchievement,
  
  // Rachas
  getUserStreak,
  updateStreak,
  checkStreakAchievements,
  
  // Desafíos
  getActiveChallenges,
  getUserChallenges,
  assignChallenge,
  updateChallengeProgress,
  
  // Verificaciones automáticas
  checkTransactionAchievements,
  checkSocialAchievements,
  checkGroupAchievements,
  checkBudgetAchievements,
  checkSavingsAchievements
};
