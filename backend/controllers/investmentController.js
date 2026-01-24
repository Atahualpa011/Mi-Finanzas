const investmentModel = require('../models/investmentModel');
const transactionModel = require('../models/transactionModel');
const gamificationModel = require('../models/gamificationModel');

// --- Obtener todas las inversiones del usuario ---
exports.getAll = async (req, res) => {
  try {
    const userId = req.user.userId;
    const investments = await investmentModel.getAllByUser(userId);
    
    // Calcular ganancia/pérdida para cada inversión
    const investmentsWithProfit = investments.map(inv => {
      const currentValue = inv.current_value || inv.initial_amount;
      const profitLoss = currentValue - inv.initial_amount;
      const percentage = inv.initial_amount > 0 
        ? ((profitLoss / inv.initial_amount) * 100).toFixed(2)
        : 0;
      
      return {
        ...inv,
        current_value: currentValue,
        profit_loss: profitLoss,
        percentage: parseFloat(percentage)
      };
    });
    
    res.json(investmentsWithProfit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron obtener las inversiones.' });
  }
};

// --- Obtener inversión por ID ---
exports.getOne = async (req, res) => {
  try {
    const userId = req.user.userId;
    const investmentId = req.params.id;
    
    const investment = await investmentModel.getById(investmentId, userId);
    if (!investment) {
      return res.status(404).json({ error: 'Inversión no encontrada.' });
    }
    
    res.json(investment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo obtener la inversión.' });
  }
};

// --- Crear nueva inversión ---
exports.create = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type, name, description, initialAmount, currencyCode, currencySymbol, platform, investmentDate } = req.body;
    
    // Validaciones
    if (!type || !name || !initialAmount || !investmentDate) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: type, name, initialAmount, investmentDate.' });
    }
    
    if (initialAmount <= 0) {
      return res.status(400).json({ error: 'El monto inicial debe ser mayor a 0.' });
    }
    
    const validTypes = ['plazo_fijo', 'acciones', 'cripto', 'fondos', 'bonos', 'inmuebles', 'otros'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Tipo de inversión no válido.' });
    }
    
    const investmentId = await investmentModel.createInvestment(
      userId, type, name, description, initialAmount, currencyCode, currencySymbol, platform, investmentDate
    );
    
    // Verificar logros de inversiones
    try {
      // Primera inversión
      const hasFirstInvestment = await gamificationModel.hasAchievement(userId, 'first_investment');
      if (!hasFirstInvestment) {
        await gamificationModel.unlockAchievement(userId, 'first_investment');
      }
      
      // Logros por tipo de inversión
      if (type === 'cripto') {
        await gamificationModel.unlockAchievement(userId, 'crypto_investor');
      } else if (type === 'acciones') {
        await gamificationModel.unlockAchievement(userId, 'stock_investor');
      } else if (type === 'inmuebles') {
        await gamificationModel.unlockAchievement(userId, 'real_estate_investor');
      }
      
      // Contar inversiones activas
      const investments = await investmentModel.getAllByUser(userId);
      const activeCount = investments.filter(inv => inv.status === 'active').length;
      
      if (activeCount >= 10) {
        await gamificationModel.unlockAchievement(userId, 'investments_10');
      } else if (activeCount >= 5) {
        await gamificationModel.unlockAchievement(userId, 'investments_5');
      }
      
      // Verificar valor total del portafolio
      const summary = await investmentModel.getSummary(userId);
      const totalInvested = parseFloat(summary.total_invested) || 0;
      
      if (totalInvested >= 1000000) {
        await gamificationModel.unlockAchievement(userId, 'portfolio_1m');
      } else if (totalInvested >= 500000) {
        await gamificationModel.unlockAchievement(userId, 'portfolio_500k');
      } else if (totalInvested >= 100000) {
        await gamificationModel.unlockAchievement(userId, 'portfolio_100k');
      }
    } catch (achErr) {
      console.error('Error al verificar logros:', achErr);
      // No fallar la creación si falla la gamificación
    }
    
    res.status(201).json({ ok: true, investmentId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo crear la inversión.' });
  }
};;

// --- Actualizar inversión ---
exports.update = async (req, res) => {
  try {
    const userId = req.user.userId;
    const investmentId = req.params.id;
    const { name, description, platform } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'El nombre es obligatorio.' });
    }
    
    const updated = await investmentModel.updateInvestment(investmentId, userId, name, description, platform);
    if (!updated) {
      return res.status(404).json({ error: 'Inversión no encontrada.' });
    }
    
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo actualizar la inversión.' });
  }
};

// --- Cerrar inversión ---
exports.close = async (req, res) => {
  try {
    const userId = req.user.userId;
    const investmentId = req.params.id;
    const { closeDate, finalAmount } = req.body;
    
    if (!closeDate || !finalAmount) {
      return res.status(400).json({ error: 'Faltan campos: closeDate, finalAmount.' });
    }
    
    if (finalAmount < 0) {
      return res.status(400).json({ error: 'El monto final no puede ser negativo.' });
    }
    
    // Obtener datos de la inversión antes de cerrarla
    const investment = await investmentModel.getById(investmentId, userId);
    if (!investment) {
      return res.status(404).json({ error: 'Inversión no encontrada.' });
    }
    
    if (investment.status === 'closed') {
      return res.status(400).json({ error: 'La inversión ya está cerrada.' });
    }
    
    // Cerrar la inversión
    const closed = await investmentModel.closeInvestment(investmentId, userId, closeDate, finalAmount);
    if (!closed) {
      return res.status(404).json({ error: 'No se pudo cerrar la inversión.' });
    }
    
    // Calcular ganancia o pérdida
    const initialAmount = parseFloat(investment.initial_amount);
    const finalAmountNum = parseFloat(finalAmount);
    const profitLoss = finalAmountNum - initialAmount;
    const percentage = initialAmount > 0 ? ((profitLoss / initialAmount) * 100) : 0;
    
    // Crear transacción automática del resultado
    try {
      const transactionType = profitLoss >= 0 ? 'income' : 'expense';
      const transactionAmount = Math.abs(profitLoss);
      const description = profitLoss >= 0 
        ? `Ganancia de inversión: ${investment.name} (${percentage.toFixed(2)}%)`
        : `Pérdida de inversión: ${investment.name} (${percentage.toFixed(2)}%)`;
      
      // Solo crear transacción si hay ganancia o pérdida (no si quedó igual)
      if (transactionAmount > 0) {
        await transactionModel.createTransaction(
          userId,
          transactionType,
          transactionAmount,
          closeDate,
          null, // category_id (null = sin categoría)
          description,
          investment.currency_code,
          investment.currency_symbol
        );
      }
    } catch (txErr) {
      console.error('Error al crear transacción de cierre:', txErr);
      // No fallar el cierre si falla la transacción
    }
    
    // Verificar logros de inversiones
    try {
      // Primera inversión cerrada con ganancia
      if (profitLoss > 0) {
        const hasFirstProfit = await gamificationModel.hasAchievement(userId, 'first_profit');
        if (!hasFirstProfit) {
          await gamificationModel.unlockAchievement(userId, 'first_profit');
        }
        
        // Logros por porcentaje de ganancia
        if (percentage >= 50) {
          await gamificationModel.unlockAchievement(userId, 'profit_50_percent');
        } else if (percentage >= 25) {
          await gamificationModel.unlockAchievement(userId, 'profit_25_percent');
        } else if (percentage >= 10) {
          await gamificationModel.unlockAchievement(userId, 'profit_10_percent');
        }
      }
      
      // Contar inversiones cerradas
      const closedInvestments = await investmentModel.getAllByUser(userId);
      const closedCount = closedInvestments.filter(inv => inv.status === 'closed').length;
      
      if (closedCount >= 10) {
        await gamificationModel.unlockAchievement(userId, 'closed_10');
      } else if (closedCount >= 5) {
        await gamificationModel.unlockAchievement(userId, 'closed_5');
      }
    } catch (achErr) {
      console.error('Error al verificar logros:', achErr);
      // No fallar el cierre si falla la gamificación
    }
    
    res.json({ ok: true, profitLoss, percentage: percentage.toFixed(2) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo cerrar la inversión.' });
  }
};

// --- Eliminar inversión ---
exports.delete = async (req, res) => {
  try {
    const userId = req.user.userId;
    const investmentId = req.params.id;
    
    const deleted = await investmentModel.deleteInvestment(investmentId, userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Inversión no encontrada.' });
    }
    
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo eliminar la inversión.' });
  }
};

// --- Obtener valuaciones de una inversión ---
exports.getValuations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const investmentId = req.params.id;
    
    const valuations = await investmentModel.getValuations(investmentId, userId);
    if (valuations === null) {
      return res.status(404).json({ error: 'Inversión no encontrada.' });
    }
    
    res.json(valuations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron obtener las valuaciones.' });
  }
};

// --- Crear nueva valuación ---
exports.createValuation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const investmentId = req.params.id;
    const { valuationDate, currentValue, notes } = req.body;
    
    if (!valuationDate || !currentValue) {
      return res.status(400).json({ error: 'Faltan campos: valuationDate, currentValue.' });
    }
    
    if (currentValue < 0) {
      return res.status(400).json({ error: 'El valor actual no puede ser negativo.' });
    }
    
    const valuationId = await investmentModel.createValuation(investmentId, userId, valuationDate, currentValue, notes);
    
    // Verificar logros de valuaciones
    try {
      const valuations = await investmentModel.getValuations(investmentId, userId);
      const totalValuations = valuations.length;
      
      if (totalValuations >= 50) {
        await gamificationModel.unlockAchievement(userId, 'valuations_50');
      } else if (totalValuations >= 10) {
        await gamificationModel.unlockAchievement(userId, 'valuations_10');
      }
    } catch (achErr) {
      console.error('Error al verificar logros de valuaciones:', achErr);
      // No fallar la creación si falla la gamificación
    }
    
    res.status(201).json({ ok: true, valuationId });
  } catch (err) {
    console.error(err);
    if (err.message.includes('no encontrada') || err.message.includes('cerrada')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'No se pudo crear la valuación.' });
  }
};

// --- Obtener resumen de inversiones ---
exports.getSummary = async (req, res) => {
  try {
    const userId = req.user.userId;
    const summary = await investmentModel.getSummary(userId);
    
    // Obtener valor actual total de inversiones activas
    const investments = await investmentModel.getAllByUser(userId);
    const activeInvestments = investments.filter(inv => inv.status === 'active');
    
    let totalCurrentValue = 0;
    activeInvestments.forEach(inv => {
      const currentValue = inv.current_value || inv.initial_amount;
      totalCurrentValue += parseFloat(currentValue);
    });
    
    const totalInvested = parseFloat(summary.total_invested) || 0;
    const totalProfitLoss = totalCurrentValue - totalInvested;
    const totalPercentage = totalInvested > 0 
      ? ((totalProfitLoss / totalInvested) * 100).toFixed(2)
      : 0;
    
    res.json({
      total_invested: totalInvested.toFixed(2),
      active_count: parseInt(summary.active_investments) || 0,
      closed_count: parseInt(summary.closed_investments) || 0,
      total_current_value: totalCurrentValue.toFixed(2),
      total_profit_loss: totalProfitLoss.toFixed(2),
      total_percentage: parseFloat(totalPercentage)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo obtener el resumen.' });
  }
};

module.exports = exports;
