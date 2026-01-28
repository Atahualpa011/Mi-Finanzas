const pool = require('../db');

/**
 * Middleware para limitar requests a endpoints de IA
 * Límites: 3 requests por día, 30 por mes
 */
async function rateLimitMiddleware(req, res, next) {
  const userId = req.user.userId;
  
  // Límites configurables desde variables de entorno
  const DAILY_LIMIT = parseInt(process.env.INSIGHTS_RATE_LIMIT_DAILY) || 3;
  const MONTHLY_LIMIT = parseInt(process.env.INSIGHTS_RATE_LIMIT_MONTHLY) || 30;
  
  try {
    // Obtener datos de rate limit del usuario
    const [rows] = await pool.execute(
      'SELECT * FROM insights_rate_limit WHERE user_id = ?',
      [userId]
    );
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    let userLimit;
    
    if (rows.length === 0) {
      // Primera vez que usa el endpoint, crear registro
      await pool.execute(
        `INSERT INTO insights_rate_limit 
         (user_id, last_request_at, requests_today, requests_this_month, last_reset_date)
         VALUES (?, ?, 1, 1, ?)`,
        [userId, now, today]
      );
      
      // Permitir la request
      return next();
    } else {
      userLimit = rows[0];
      
      // Verificar si es un nuevo día (reset contador diario)
      const lastResetDate = userLimit.last_reset_date 
        ? userLimit.last_reset_date.toISOString().split('T')[0]
        : null;
      
      let requestsToday = userLimit.requests_today;
      let requestsThisMonth = userLimit.requests_this_month;
      
      if (lastResetDate !== today) {
        // Nuevo día, resetear contador diario
        requestsToday = 0;
        
        // Verificar si también es nuevo mes
        const lastMonth = userLimit.last_request_at 
          ? new Date(userLimit.last_request_at).getMonth()
          : null;
        const currentMonth = now.getMonth();
        
        if (lastMonth !== currentMonth) {
          // Nuevo mes, resetear contador mensual
          requestsThisMonth = 0;
        }
      }
      
      // Verificar límites
      if (requestsToday >= DAILY_LIMIT) {
        // Calcular cuándo se resetea (mañana a las 00:00)
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        return res.status(429).json({
          error: 'Límite de solicitudes excedido',
          message: `Has alcanzado el límite de ${DAILY_LIMIT} recomendaciones IA por día. Próximo reset: ${tomorrow.toISOString()}`,
          resetAt: tomorrow.toISOString(),
          requestsRemaining: 0,
          limits: {
            daily: DAILY_LIMIT,
            monthly: MONTHLY_LIMIT
          }
        });
      }
      
      if (requestsThisMonth >= MONTHLY_LIMIT) {
        // Calcular cuándo se resetea (primer día del próximo mes)
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        
        return res.status(429).json({
          error: 'Límite mensual de solicitudes excedido',
          message: `Has alcanzado el límite de ${MONTHLY_LIMIT} recomendaciones IA por mes. Próximo reset: ${nextMonth.toISOString()}`,
          resetAt: nextMonth.toISOString(),
          requestsRemaining: 0,
          limits: {
            daily: DAILY_LIMIT,
            monthly: MONTHLY_LIMIT
          }
        });
      }
      
      // Incrementar contadores
      await pool.execute(
        `UPDATE insights_rate_limit 
         SET last_request_at = ?,
             requests_today = ?,
             requests_this_month = ?,
             last_reset_date = ?
         WHERE user_id = ?`,
        [now, requestsToday + 1, requestsThisMonth + 1, today, userId]
      );
      
      // Agregar info de rate limit a la request para logging
      req.rateLimit = {
        requestsToday: requestsToday + 1,
        requestsThisMonth: requestsThisMonth + 1,
        remainingToday: DAILY_LIMIT - (requestsToday + 1),
        remainingThisMonth: MONTHLY_LIMIT - (requestsThisMonth + 1)
      };
      
      // Permitir la request
      return next();
    }
  } catch (error) {
    console.error('Error en rate limit middleware:', error);
    // En caso de error, permitir la request (fail-open)
    return next();
  }
}

module.exports = rateLimitMiddleware;
