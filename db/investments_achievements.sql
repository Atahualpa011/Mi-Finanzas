-- ============================================================================
-- INVERSIONES - LOGROS DE GAMIFICACIÓN
-- Fase 4: Integración con sistema de gamificación
-- ============================================================================

USE appfinanzas;

-- Agregar nueva categoría de logros: INVESTMENTS
-- Nota: Primero hay que modificar el ENUM de la tabla achievements
ALTER TABLE achievements 
MODIFY COLUMN category ENUM('savings', 'discipline', 'social', 'streaks', 'milestones', 'investments') NOT NULL;

-- ============================================================================
-- LOGROS DE INVERSIONES
-- ============================================================================

INSERT INTO `achievements` (`code`, `name`, `description`, `category`, `icon`, `points`, `target_value`) VALUES
-- Primeras inversiones
('first_investment', 'Primera Inversión', 'Crea tu primera inversión', 'investments', 'bi-graph-up-arrow', 15, 1),
('investments_5', 'Inversor Diversificado', 'Gestiona 5 inversiones simultáneamente', 'investments', 'bi-pie-chart', 50, 5),
('investments_10', 'Portafolio Sólido', 'Gestiona 10 inversiones simultáneamente', 'investments', 'bi-briefcase', 100, 10),

-- Tipos de inversiones
('crypto_investor', 'Cripto Entusiasta', 'Invierte en criptomonedas', 'investments', 'bi-currency-bitcoin', 25, 1),
('stock_investor', 'Inversor en Acciones', 'Invierte en acciones', 'investments', 'bi-graph-up', 25, 1),
('real_estate_investor', 'Inversor Inmobiliario', 'Invierte en inmuebles', 'investments', 'bi-building', 50, 1),

-- Seguimiento y valuaciones
('valuations_10', 'Seguimiento Activo', 'Actualiza el valor de tus inversiones 10 veces', 'investments', 'bi-arrow-repeat', 30, 10),
('valuations_50', 'Analista Dedicado', 'Actualiza el valor de tus inversiones 50 veces', 'investments', 'bi-bar-chart-line', 75, 50),

-- Rentabilidad
('first_profit', 'Primera Ganancia', 'Cierra una inversión con ganancia', 'investments', 'bi-cash-coin', 30, 1),
('profit_10_percent', 'Ganancia del 10%', 'Cierra una inversión con 10% o más de ganancia', 'investments', 'bi-trophy', 50, 10),
('profit_25_percent', 'Ganancia del 25%', 'Cierra una inversión con 25% o más de ganancia', 'investments', 'bi-award', 100, 25),
('profit_50_percent', 'Ganancia del 50%', 'Cierra una inversión con 50% o más de ganancia', 'investments', 'bi-gem', 200, 50),

-- Inversiones cerradas
('closed_5', 'Inversor Experimentado', 'Cierra 5 inversiones', 'investments', 'bi-lock', 40, 5),
('closed_10', 'Inversor Veterano', 'Cierra 10 inversiones', 'investments', 'bi-lock-fill', 100, 10),

-- Portafolio
('portfolio_100k', 'Portafolio de $100K', 'Alcanza un portafolio de $100,000 en inversiones activas', 'investments', 'bi-wallet2', 150, 100000),
('portfolio_500k', 'Portafolio de $500K', 'Alcanza un portafolio de $500,000 en inversiones activas', 'investments', 'bi-safe', 300, 500000),
('portfolio_1m', 'Millonario Inversor', 'Alcanza un portafolio de $1,000,000 en inversiones activas', 'investments', 'bi-safe-fill', 500, 1000000);

-- ============================================================================
-- FIN DE SCRIPT
-- ============================================================================
