require('dotenv').config();           // Carga variables de entorno desde .env (DB, JWT, etc.)
const express = require('express');   // Framework principal para el servidor HTTP
const cors = require('cors');         // Middleware para permitir CORS (peticiones desde el frontend)
const app = express();

app.use(cors());                      // Para peticiones desde cualquier origen (frontend)
app.use(express.json());              // Para recibir y parsear JSON en las peticiones

// --- Importar rutas de la API ---
const authRoutes        = require('./routes/authRoutes');        // Registro y login
const profileRoutes     = require('./routes/profileRoutes');     // Perfil de usuario
const transactionRoutes = require('./routes/transactionRoutes'); // Movimientos (gastos/ingresos)
const categoryRoutes    = require('./routes/categoryRoutes');    // Categorías de transacciones
const transferRoutes    = require('./routes/transferRoutes');    // Transferencias entre amigos
const friendRoutes      = require('./routes/friendRoutes');      // Gestión de amigos
const groupRoutes       = require('./routes/groupRoutes');       // Grupos y gastos compartidos
const analysisRoutes    = require('./routes/analysisRoutes');    // Análisis y estadísticas
const suggestedTransactionRoutes = require('./routes/suggestedTransactionRoutes'); // Transacciones sugeridas
const budgetRoutes      = require('./routes/budgetRoutes');      // Presupuestos personales y grupales

// --- Usar rutas bajo el prefijo /api ---
app.use('/api',           authRoutes);        // /api/register, /api/login
app.use('/api/profile',   profileRoutes);     // /api/profile, /api/profile/by-email
app.use('/api/transactions', transactionRoutes); // /api/transactions
app.use('/api/categories', categoryRoutes);   // /api/categories
app.use('/api/transfers',  transferRoutes);   // /api/transfers
app.use('/api/friends',    friendRoutes);     // /api/friends
app.use('/api/groups',     groupRoutes);      // /api/groups
app.use('/api/analysis',   analysisRoutes);   // /api/analysis/emotional
app.use('/api/suggested-transactions', suggestedTransactionRoutes); // /api/suggested-transactions
app.use('/api/budgets',    budgetRoutes);     // /api/budgets

// --- Iniciar el servidor en el puerto 3001 ---
app.listen(3001, () => console.log('API escuchando en puerto 3001'));
// El frontend hace peticiones HTTP a http://localhost:3001/api/...