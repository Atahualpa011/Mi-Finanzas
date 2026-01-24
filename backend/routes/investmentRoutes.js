const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investmentController');
const authenticate = require('../middleware/authenticate');

// Todas las rutas requieren autenticación
router.use(authenticate);

// --- Rutas de inversiones ---
router.get('/', investmentController.getAll);                           // GET /api/investments - Listar todas las inversiones del usuario
router.get('/summary', investmentController.getSummary);                // GET /api/investments/summary - Obtener resumen de inversiones
router.get('/:id', investmentController.getOne);                        // GET /api/investments/:id - Obtener inversión por ID
router.post('/', investmentController.create);                          // POST /api/investments - Crear nueva inversión
router.put('/:id', investmentController.update);                        // PUT /api/investments/:id - Actualizar inversión
router.post('/:id/close', investmentController.close);                  // POST /api/investments/:id/close - Cerrar inversión
router.delete('/:id', investmentController.delete);                     // DELETE /api/investments/:id - Eliminar inversión

// --- Rutas de valuaciones ---
router.get('/:id/valuations', investmentController.getValuations);      // GET /api/investments/:id/valuations - Obtener valuaciones de inversión
router.post('/:id/valuations', investmentController.createValuation);   // POST /api/investments/:id/valuations - Crear nueva valuación

module.exports = router;
