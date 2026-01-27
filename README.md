# AppFinanzas - Aplicación de Gestión de Finanzas Personales

## Descripción General

AppFinanzas es una aplicación web full-stack para la gestión de finanzas personales que permite a los usuarios:
- Registrar y categorizar ingresos y gastos
- Crear y gestionar presupuestos personales por categoría
- Crear presupuestos compartidos en grupos
- Recibir alertas automáticas de límites de presupuesto
- Compartir gastos en grupos con división automática
- Realizar transferencias entre amigos
- Gestionar amistades (bloqueo, estadísticas, antigüedad)
- Obtener análisis emocional de sus gastos
- Recibir sugerencias automáticas de transacciones
- Gestionar invitaciones y liquidaciones de grupos
- Visualizar estadísticas de grupos e interacciones

## Arquitectura del Proyecto

### Stack Tecnológico

**Frontend:**
- React 19.1.0
- Vite (Build tool)
- React Router DOM (Navegación)
- Chart.js & React-ChartJS-2 (Gráficos)
- Bootstrap 5.3.6 (UI/Estilos)
- React Select (Componentes de selección)
- React DatePicker (Selector de fechas)
- Date-fns (Manipulación de fechas)

**Backend:**
- Node.js + Express 5.1.0
- MySQL2 (Base de datos)
- JWT (Autenticación)
- Bcrypt (Encriptación de contraseñas)
- CORS (Cross-Origin Resource Sharing)
- dotenv (Variables de entorno)

### Estructura de Carpetas

```
AppFinanzas/
├── backend/                    # Servidor Node.js + Express
│   ├── server.js              # Punto de entrada del servidor
│   ├── db.js                  # Configuración de conexión a MySQL
│   ├── controllers/           # Lógica de negocio
│   │   ├── authController.js
│   │   ├── transactionController.js
│   │   ├── groupController.js
│   │   ├── friendController.js
│   │   ├── transferController.js
│   │   ├── analysisController.js
│   │   ├── categoryController.js
│   │   ├── profileController.js
│   │   ├── budgetController.js
│   │   ├── gamificationController.js
│   │   ├── investmentController.js
│   │   └── suggestedTransactionController.js
│   ├── models/                # Acceso a datos (queries SQL)
│   │   ├── userModel.js
│   │   ├── transactionModel.js
│   │   ├── groupModel.js
│   │   ├── friendModel.js
│   │   ├── transferModel.js
│   │   ├── categoryModel.js
│   │   ├── budgetModel.js
│   │   ├── gamificationModel.js
│   │   ├── investmentModel.js
│   │   ├── suggestedTransactionModel.js
│   │   └── emotionalAnalysisModel.js
│   ├── routes/                # Definición de endpoints de la API
│   │   ├── authRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── groupRoutes.js
│   │   ├── friendRoutes.js
│   │   ├── transferRoutes.js
│   │   ├── analysisRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── budgetRoutes.js
│   │   ├── gamificationRoutes.js
│   │   ├── investmentRoutes.js
│   │   └── suggestedTransactionRoutes.js
│   └── middleware/            # Middleware personalizado
│       ├── authenticate.js    # Verificación de JWT
│       └── groupMember.js     # Verificación de membresía en grupos
├── frontend/                  # Aplicación React
│   ├── src/
│   │   ├── main.jsx          # Punto de entrada de React
│   │   ├── App.jsx           # Componente raíz con rutas
│   │   ├── pages/            # Páginas principales
│   │   │   ├── Landing.jsx   # Página de inicio
│   │   │   ├── Login.jsx     # Inicio de sesión
│   │   │   ├── Register.jsx  # Registro de usuarios
│   │   │   ├── Dashboard.jsx # Panel principal
│   │   │   ├── Movements.jsx # Gestión de movimientos
│   │   │   ├── AddTransaction.jsx
│   │   │   ├── Friends.jsx   # Gestión de amigos
│   │   │   ├── GroupsList.jsx
│   │   │   ├── GroupDetail.jsx
│   │   │   ├── Budgets.jsx   # Gestión de presupuestos
│   │   │   ├── Investments.jsx # Gestión de inversiones
│   │   │   ├── Gamification.jsx # Sistema de gamificación
│   │   │   ├── EmotionalAnalysis.jsx
│   │   │   └── Profile.jsx
│   │   ├── components/       # Componentes reutilizables
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Features.jsx
│   │   │   ├── GroupMembers.jsx
│   │   │   ├── GroupExpenses.jsx
│   │   │   ├── GroupSummary.jsx
│   │   │   ├── GroupSettlements.jsx
│   │   │   ├── GroupInvitations.jsx
│   │   │   ├── GroupMovements.jsx
│   │   │   ├── GroupAddExpense.jsx
│   │   │   ├── GroupBudgets.jsx
│   │   │   ├── BudgetAlerts.jsx
│   │   │   ├── LevelProgress.jsx
│   │   │   ├── AchievementCard.jsx
│   │   │   ├── StreakDisplay.jsx
│   │   │   ├── ChallengeCard.jsx
│   │   │   ├── AchievementNotification.jsx
│   │   │   ├── UserLevelBadge.jsx
│   │   │   └── EmotionalRecommendations.jsx
│   │   └── hooks/            # Custom hooks
│   │       ├── useCurrency.js  # Hook para gestión de monedas
│   │       └── useAchievementNotifications.js
│   ├── public/               # Archivos estáticos
│   └── vite.config.js        # Configuración de Vite
├── config/                    # Archivos de configuración (vacío actualmente)
├── db/                       # Scripts de base de datos
    ├── schema.sql            # Esquema completo de la base de datos
    ├── currency_migration.sql # Migración del sistema de monedas
    ├── budgets_migration.sql # Migración de presupuestos y alertas
    ├── gamification_migration.sql # Migración del sistema de gamificación
    ├── investments_migration.sql # Migración del sistema de inversiones
    ├── investments_achievements.sql # Logros de inversiones
    └── emotional_achievements.sql # Logros emocionales
```

## Configuración e Instalación

### Prerrequisitos

- **Node.js** (v16 o superior)
- **MySQL** (v8.0 o superior)
- **npm** o **yarn**

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd AppFinanzas
```

### 2. Configurar la Base de Datos

#### Iniciar MySQL
Asegúrate de que el servicio MySQL esté corriendo:
- Windows: `services.msc` → Buscar "MySQL" → Iniciar
- O desde CMD: `net start MySQL80`

#### Crear la Base de Datos
```sql
CREATE DATABASE appfinanzas;
USE appfinanzas;

-- Crear las tablas necesarias (ver sección "Esquema de Base de Datos" más abajo)
```

### 3. Configurar el Backend

```bash
cd backend
npm install
```

Crear archivo `.env` en la carpeta `backend`:

```env
# Configuración de la base de datos
DB_HOST=localhost
DB_USER=root
DB_PASS=tu_contraseña_mysql
DB_NAME=appfinanzas

# Configuración de JWT
JWT_SECRET=tu_clave_secreta_muy_segura_aqui

# Puerto del servidor (opcional, por defecto 3000)
PORT=3000
```

**Importante:** MySQL por defecto escucha en el puerto **3306**. Si tu MySQL usa otro puerto, especifícalo como `DB_HOST=localhost:PUERTO`

### 4. Configurar el Frontend

```bash
cd ../frontend
npm install
```

Configurar el proxy en `vite.config.js` (ya configurado):

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

### 5. Ejecutar la Aplicación

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev    # Modo desarrollo con nodemon (reinicio automático)
# o
npm start      # Modo producción

# Para detener: Ctrl + C
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev    # Inicia el servidor de desarrollo de Vite

# Para detener: q + Enter (o Ctrl + C)
```

La aplicación estará disponible en:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api

## Esquema de Base de Datos

La base de datos utiliza MySQL con las siguientes tablas principales:

### Módulo de Usuarios
- `users` - Información de usuarios registrados
- `users_data` - Datos adicionales del perfil (username, biografía, moneda preferida)
  - `preferred_currency` VARCHAR(3) - Moneda favorita del usuario (por defecto: ARS)

### Módulo de Transacciones
- `transactions` - Registro de ingresos y gastos personales con soporte multi-moneda
  - `currency_code` VARCHAR(3) - Código ISO de la moneda (ARS, USD, EUR, BRL)
  - `currency_symbol` VARCHAR(5) - Símbolo de la moneda ($, US$, €, R$)
- `categories` - Categorías personalizadas y predeterminadas

### Módulo de Amigos
- `friends` - Relaciones de amistad entre usuarios
- `transfers` - Transferencias de dinero entre amigos

### Módulo de Grupos
- `groups_` - Grupos creados por usuarios
- `group_members` - Miembros de cada grupo
- `group_expenses` - Gastos compartidos en grupos
- `group_settlements` - Liquidaciones de deudas grupales

### Módulo de Presupuestos
- `budgets` - Presupuestos personales por categoría
- `group_budgets` - Presupuestos compartidos en grupos
- `budget_alerts` - Alertas automáticas de límites excedidos

### Módulo de Sugerencias
- `suggested_transactions` - Transacciones sugeridas automáticamente

### Módulo de Gamificación
- `achievements` - Catálogo de logros disponibles (30 logros predefinidos)
- `user_achievements` - Logros desbloqueados por cada usuario
- `user_streaks` - Rachas de uso consecutivo
- `challenges` - Desafíos disponibles (diarios, semanales, mensuales)
- `user_challenges` - Progreso de usuarios en desafíos
- `user_levels` - Niveles y puntos de experiencia (XP)

### Módulo de Inversiones
- `investments` - Registro de inversiones del usuario con soporte multi-moneda
  - Tipos: plazo_fijo, acciones, cripto, fondos, bonos, inmuebles, otros
  - Estados: active, closed
  - `currency_code` VARCHAR(3) - Código ISO de la moneda
  - `currency_symbol` VARCHAR(5) - Símbolo de la moneda
- `investment_valuations` - Historial de valuaciones de cada inversión
  - `valuation_date` DATE - Fecha de la valuación
  - `current_value` DECIMAL(15,2) - Valor en ese momento
  - `notes` TEXT - Notas opcionales (dividendos, splits, etc.)

**Para ver el schema completo:** Consultar `db/schema.sql`, `db/currency_migration.sql`, `db/budgets_migration.sql`, `db/gamification_migration.sql`, `db/investments_migration.sql` y `db/investments_achievements.sql`

## API Endpoints

### Autenticación
- `POST /api/register` - Registro de usuario
- `POST /api/login` - Inicio de sesión (devuelve JWT)

### Perfil
- `GET /api/profile` - Obtener perfil del usuario autenticado
- `PUT /api/profile` - Actualizar perfil
- `POST /api/profile/by-email` - Buscar usuario por email

### Transacciones
- `GET /api/transactions` - Listar transacciones del usuario
- `POST /api/transactions` - Crear nueva transacción
- `PUT /api/transactions/:id` - Actualizar transacción
- `DELETE /api/transactions/:id` - Eliminar transacción

### Categorías
- `GET /api/categories` - Listar categorías del usuario
- `POST /api/categories` - Crear nueva categoría
- `DELETE /api/categories/:id` - Eliminar categoría

### Amigos
- `GET /api/friends` - Listar amigos
- `GET /api/friends/requests` - Listar solicitudes de amistad
- `POST /api/friends/request` - Enviar solicitud de amistad
- `POST /api/friends/:id/accept` - Aceptar solicitud
- `POST /api/friends/:id/reject` - Rechazar solicitud
- `POST /api/friends/:id/block` - Bloquear amigo
- `POST /api/friends/:id/unblock` - Desbloquear amigo
- `GET /api/friends/:id/stats` - Obtener estadísticas de interacción con un amigo
- `DELETE /api/friends/:id` - Eliminar amistad

### Transferencias
- `GET /api/transfers` - Listar transferencias
- `POST /api/transfers` - Crear nueva transferencia

### Grupos
- `GET /api/groups` - Listar grupos del usuario
- `POST /api/groups` - Crear nuevo grupo
- `GET /api/groups/:id` - Obtener detalles de un grupo
- `PUT /api/groups/:id` - Actualizar grupo
- `DELETE /api/groups/:id` - Eliminar grupo
- `GET /api/groups/:id/members` - Listar miembros del grupo
- `POST /api/groups/:id/members` - Agregar miembro al grupo
- `DELETE /api/groups/:id/members/:memberId` - Eliminar miembro del grupo
- `POST /api/groups/:id/invite` - Invitar miembro
- `GET /api/groups/invitations` - Listar invitaciones
- `POST /api/groups/invitations/:invId/accept` - Aceptar invitación
- `POST /api/groups/invitations/:invId/reject` - Rechazar invitación
- `POST /api/groups/:id/expenses` - Crear gasto grupal
- `GET /api/groups/:id/expenses` - Listar gastos del grupo
- `GET /api/groups/:id/summary` - Obtener resumen de deudas
- `GET /api/groups/:id/settlements` - Listar liquidaciones
- `POST /api/groups/:id/settlements` - Registrar liquidación
- `GET /api/groups/:id/simplify` - Calcular liquidaciones óptimas
- `POST /api/groups/:id/members/:memberId/leave` - Salir del grupo
- `GET /api/groups/:id/budgets` - Listar presupuestos del grupo
- `POST /api/groups/:id/budgets` - Crear presupuesto grupal
- `GET /api/groups/:id/budgets/:budgetId` - Obtener presupuesto grupal
- `PUT /api/groups/:id/budgets/:budgetId` - Actualizar presupuesto grupal
- `DELETE /api/groups/:id/budgets/:budgetId` - Eliminar presupuesto grupal

### Análisis Emocional
- `GET /api/analysis/emotional` - Obtener análisis emocional básico de gastos
- `GET /api/analysis/correlational` - Obtener análisis correlacional detallado (promedio, frecuencia, tendencias)
- `GET /api/analysis/emotional-recommendations` - Obtener recomendaciones personalizadas basadas en patrones emocionales

### Transacciones Sugeridas
- `GET /api/suggested-transactions` - Listar sugerencias pendientes
- `POST /api/suggested-transactions/:id/accept` - Aceptar sugerencia
- `POST /api/suggested-transactions/:id/reject` - Rechazar sugerencia

### Presupuestos
- `GET /api/budgets` - Listar presupuestos personales con progreso
- `POST /api/budgets` - Crear presupuesto personal
- `GET /api/budgets/:id` - Obtener presupuesto específico
- `PUT /api/budgets/:id` - Actualizar presupuesto
- `DELETE /api/budgets/:id` - Eliminar presupuesto
- `GET /api/budgets/alerts/all` - Obtener alertas de presupuesto
- `POST /api/budgets/alerts/:id/read` - Marcar alerta como leída
- `POST /api/budgets/alerts/read-all` - Marcar todas las alertas como leídas

### Inversiones
- `GET /api/investments` - Listar todas las inversiones con ganancia/pérdida
- `GET /api/investments/summary` - Obtener resumen agregado (totales, rendimiento)
- `GET /api/investments/:id` - Obtener inversión específica
- `POST /api/investments` - Crear nueva inversión (crea valuación inicial automática)
- `PUT /api/investments/:id` - Actualizar inversión (solo nombre, descripción, plataforma)
- `DELETE /api/investments/:id` - Eliminar inversión (con cascade a valuaciones)
- `POST /api/investments/:id/close` - Cerrar inversión (marca como finalizada)
- `GET /api/investments/:id/valuations` - Obtener historial de valuaciones
- `POST /api/investments/:id/valuations` - Crear nueva valuación (solo si está activa)

### Gamificación
- `GET /api/gamification/dashboard` - Obtener panel completo de gamificación (incluye desafíos completados en últimos 7 días)
- `GET /api/gamification/achievements` - Listar todos los logros agrupados por categoría
- `GET /api/gamification/achievements/:code` - Verificar logro específico
- `GET /api/gamification/challenges` - Listar desafíos disponibles
- `GET /api/gamification/challenges/user` - Listar desafíos del usuario
- `POST /api/gamification/challenges/:id/accept` - Aceptar un desafío
- `GET /api/gamification/leaderboard` - Obtener ranking global (top 10)
- `GET /api/gamification/rank` - Obtener posición del usuario en el ranking

## Autenticación y Autorización

La aplicación usa **JWT (JSON Web Tokens)** para la autenticación:

1. El usuario inicia sesión con email y contraseña
2. El backend valida las credenciales y genera un JWT
3. El frontend almacena el token en `localStorage`
4. Todas las peticiones posteriores incluyen el header: `Authorization: Bearer <token>`
5. El middleware `authenticate.js` valida el token en cada petición protegida

### Middleware de Autenticación

**`authenticate.js`**: Verifica que el usuario esté autenticado
**`groupMember.js`**: Verifica que el usuario sea miembro del grupo

## Funcionalidades Principales

### 1. Dashboard
- Resumen de ingresos y gastos
- Gráficos de distribución por categorías
- Visualización de tendencias temporales
- Balance general
- Card de resumen de inversiones (si hay inversiones activas)
  - Total invertido y valor actual
  - Ganancia/pérdida consolidada
  - Rendimiento porcentual total
  - Contador de inversiones activas y cerradas
  - Acceso directo a página de inversiones

### 2. Gestión de Movimientos
- Registro de ingresos y gastos personales
- Categorización personalizada
- Filtrado y búsqueda
- Sugerencias automáticas de transacciones
- Confirmación antes de eliminar (no reversible)

### 3. Sistema de Amigos
- Envío y aceptación de solicitudes de amistad
- Transferencias de dinero entre amigos
- Historial de transferencias
- Bloqueo y desbloqueo de amigos
- Visualización de antigüedad de la amistad
- Estadísticas de interacción (gastos compartidos, transferencias)

### 4. Grupos y Gastos Compartidos
- Creación de grupos con descripción
- Invitación de miembros
- Registro de gastos compartidos con división automática
- Cálculo de deudas entre miembros
- Algoritmo de liquidación óptima (minimiza transacciones)
- Visualización de resumen de deudas
- Historial de movimientos (gastos y pagos)
- Filtrado de movimientos por tipo
- Búsqueda en el historial
- Estadísticas de grupo (total movimientos, mayor gastador, mayor saldo)
- Visualización de antigüedad del grupo
- Presupuestos grupales compartidos

### 5. Sistema de Presupuestos
- Creación de presupuestos personales por categoría
- Presupuestos grupales compartidos
- Períodos configurables (semanal, mensual, anual)
- Umbrales de alerta personalizables
- Seguimiento automático de gastos vs presupuesto
- Visualización con barras de progreso
- Estados visuales (OK, Advertencia, Excedido)
- Sistema de alertas automáticas:
  - Alerta al alcanzar el umbral configurado
  - Alerta al exceder el presupuesto
  - Alerta al acercarse al límite
- Gestión de alertas (marcar como leídas)
- PreveSistema de Análisis Emocional Avanzado
- **Registro de Emociones:**
  - Asociar múltiples emociones a cada gasto (12 emociones disponibles)
  - Clasificación en positivas, negativas y neutras
  - Campo opcional de destino/motivo del gasto
  
- **Análisis Correlacional:**
  - Promedio de gasto por emoción
  - Frecuencia de cada emoción registrada
  - Porcentaje del total de gastos emocionales
  - Comparación mensual (mes actual vs anterior)
  - Detección de tendencias (creciente/decreciente/estable)
  - Identificación de emoción más cara y más frecuente
  - Cálculo de riesgo emocional (bajo/medio/alto)
  
- **Visualizaciones Avanzadas:**
  - Tarjetas de métricas clave (emoción más cara, más frecuente, riesgo, balance)
  - Gráfico de torta (distribución de gastos)
  - Gráfico de barras comparativo (gasto promedio por emoción)
  - Tabla detallada con correlaciones y tendencias
  - Códigos de color según tipo de emoción
  
- **Sistema de Recomendaciones:**
  - Alertas automáticas de incrementos en emociones negativas (>30%)
  - Detección de patrones por día de la semana
  - Alertas cuando una emoción representa >40% del gasto total
  - Recomendaciones personalizadas según balance emocional
  - Sugerencias de acciones concretas con beneficios explicados
  - Widget de recomendaciones en Dashboard
  
- **Integración con Gamificación:**
  - 8 logros exclusivos de control emocional
  - Verificación automática al registrar gastos con emociones
  - Progreso dinámico visible en tarjetas de logros
  - Logros por conciencia emocional, control y equilibrio los gastos
- Categorización emocional de transacciones
- Visualizaciones y recomendaciones

### 7. Sistema Multi-Moneda
- **Monedas Soportadas:** ARS (Peso argentino), USD (Dólar), EUR (Euro), BRL (Real brasileño)
- **Moneda Preferida:** Configuración por usuario en el perfil
- **Por Transacción:** Cada ingreso/gasto guarda su moneda original
- **Por Inversión:** Cada inversión guarda su moneda (independiente del usuario)
- **Visualización:**
  - Símbolo de moneda junto al monto en todas las vistas
  - Columna dedicada mostrando nombre completo de la moneda
  - Selector de moneda en formularios de transacciones e inversiones
- **Compatibilidad:** Transacciones antiguas sin moneda muestran la moneda preferida del usuario
- **Alcance:** Transacciones personales e inversiones (grupos y transferencias usan moneda única)

### 8. Sistema de Inversiones
- **Tipos de Inversión:** Plazo fijo, Acciones, Criptomonedas, Fondos comunes, Bonos, Inmuebles, Otros
- **CRUD Completo:**
  - Crear inversión con monto inicial y moneda
  - Editar nombre, descripción y plataforma
  - Eliminar inversión (con cascade a historial)
- **Seguimiento de Valor:**
  - Actualizar valor actual mediante valuaciones
  - Historial completo de valuaciones con fechas y notas
  - Cálculo automático de ganancia/pérdida y rendimiento porcentual
- **Estados:**
  - Activa: Permite actualizaciones de valor
  - Cerrada: No se puede modificar (registro histórico)
- **Funcionalidades Avanzadas:**
  - Modal de actualización rápida de valor
  - Modal de historial con tabla de evolución
  - Cierre de inversión con monto final
  - Resumen agregado (total invertido, valor actual, ganancia total, rendimiento)
- **Visualización:**
  - Tarjetas de resumen con métricas clave
  - Tabla con iconos por tipo de inversión
  - Colores indicadores (verde=ganancia, rojo=pérdida)
  - Badges de estado (activ56 total):**
  - **Hitos:** Primera transacción, 10 transacciones, 50, 100, 500, 1000
  - **Rachas:** 3 días consecutivos, 7, 15, 30, 60, 90 días
  - **Disciplina:** Cumplir presupuesto semanal/mensual, no exceder durante 3/6 meses
  - **Social:** Primer amigo, transferencia, 5/10 amigos, primer/décimo grupo
  - **Ahorros:** $1000, $5000, $10000, $50000, $100000 en ingresos totales
  - **Inversiones (18 logros):**
    - Primera inversión y diversificación (5, 10 inversiones)
    - Por tipo específico (cripto, acciones, inmuebles)
    - Por seguimiento (10, 50 valuaciones)
    - Por rentabilidad (primera ganancia, 10%, 25%, 50%)
    - Por inversiones cerradas (5, 10 cerradas)
    - Por tamaño de portafolio ($100K, $500K, $1M)
  - **Emocionales (8 logros nuevos):**
    - Conciencia Emocional: Primera transacción con emoción (15 XP)
    - Rastreador Emocional: 10 transacciones con emociones (25 XP)
    - Maestro Emocional: 50 transacciones con emociones (50 XP)
    - Autoconocimiento: Visitar página de análisis emocional (30 XP)
    - Control Emocional: Reducir gastos negativos 20% vs mes anterior (100 XP)
    - Inversor Positivo: 80% gastos con emociones positivas (75 XP)
    - Equilibrio Emocional: <30% gastos negativos por 3 meses (150 XP)
    - Gasto Consciente: 5 días sin gastos por ansiedad/estrés (80 XPancia)
  - Logros por seguimiento activo (valuaciones)
  - Logros por portafolio ($100K, $500K, $1M)
- **Automatización al Cerrar:**
  - Creación automática de transacción con ganancia/pérdida
  - La transacción refleja el resultado de la inversión
  - Verificación automática de logros de rentabilidad
  - Mantiene histórico completo en ambos módulos
- **Multi-moneda:** Cada inversión mantiene su moneda original

### 9. Personalización
- Selección de moneda preferida en perfil
- Categorías personalizadas
- Perfil de usuario editable

### 10. Sistema de Gamificación
- **Sistema de Niveles y Experiencia (XP):**
  - Gana XP por cada acción (transacciones, presupuestos, amigos, grupos, inversiones)
  - Sube de nivel automáticamente (Nivel 2 = 100 XP, Nivel 3 = 200 XP, etc.)
  - Barra de progreso visual con XP restante
  - Verificación de logros emocionales al registrar gastos con emociones

- **Sistema Dinámico de Categorías:**
  - Categorías de logros cargadas dinámicamente desde la base de datos
  - 7 categorías: Hitos, Rachas, Disciplina, Social, Ahorros, Inversiones, Emocional
  - Filtros en frontend generados automáticamente
  - Configuración visual centralizada en `CATEGORY_CONFIG` (íconos, colores, nombres)
  - Categoría "Emocional" con ícono 😊 y color púrpura
  - Escalable: agregar nuevas categorías solo requiere insertar en BD
  - Sin código hardcodeado: permite extensibilidad futura

- **Progreso Dinámico:**
  - Cálculo automático de progreso para logros no desbloqueados
  - Barras de progreso visuales en tarjetas de logros
  - Porcentajes actualizados en tiempo real según actividad del usuario
  - Soporte para todos los tipos de logros (transacciones, amigos, rachas, ahorros, emocionale
  - **Inversiones (18 logros nuevos):**
    - Primera inversión y diversificación (5, 10 inversiones)
    - Por tipo específico (cripto, acciones, inmuebles)
    - Por seguimiento (10, 50 valuaciones)
    - Por rentabilidad (primera ganancia, 10%, 25%, 50%)
    - Por inversiones cerradas (5, 10 cerradas)
    - Por tamaño de portafolio ($100K, $500K, $1M)
  - Cada logro otorga XP adicional
  
- **Sistema de Rachas:**
  - Seguimiento de días consecutivos con transacciones
  - Visualización con íconos de fuego/rayo según duración
  - Récord personal de racha más larga
  - Mensajes motivacionales
  
- **Desafíos:**
  - Diarios, semanales, mensuales y permanentes
  - Progreso en tiempo real
  - Recompensas de XP al completar
  - Estados: disponible, activo, completado, fallido
  - Dashboard muestra desafíos completados en últimos 7 días
  
- **Ranking Global:**
  - Top 10 usuarios por nivel y XP
  - Posición personal en el ranking
  - Medallas para los primeros 3 lugares
  - Visualización de logros desbloqueados por usuario
  
- **Integración Automática:**
  - Verificación automática de logros tras cada acción
  - Sistema de logros retroactivos (detecta logros de acciones pasadas)
  - Actualización de racha automática al crear transacciones
  - Progreso de desafíos actualizado en tiempo real
  - Notificaciones toast al desbloquear logros
  - Verificación de logros de inversiones al crear, actualizar y cerrar

- **Sistema Dinámico de Categorías:**
  - Categorías de logros cargadas dinámicamente desde la base de datos
  - Filtros en frontend generados automáticamente
  - Configuración visual centralizada en `CATEGORY_CONFIG` (íconos, colores, nombres)
  - Escalable: agregar nuevas categorías solo requiere insertar en BD
  - Sin código hardcodeado: permite extensibilidad futura (ej: desafíos personalizados)

## Flujo de Navegación

```
Landing (/)
  ├─> Login (/login)
  │    └─> Dashboard (/dashboard) [Protegido]
  │         ├─> Movements (/movements)
  │         ├─> Add Transaction (/add-transaction)
  │         ├─> Budgets (/budgets)
  │         ├─> Investments (/investments)
  │         ├─> Gamification (/gamification)
  │         ├─> Friends (/friends)
  │         ├─> Groups List (/groups)
  │         │    └─> Group Detail (/groups/:id)
  │         ├─> Emotional Analysis (/emotional-analysis)
  │         └─> Profile (/profile)
  │
  └─> Register (/register)
       └─> Login (/login)
```

## Seguridad

- **Contraseñas**: Hasheadas con bcrypt (factor de coste: 10)
- **JWT**: Tokens con expiración configurable
- **SQL Injection**: Prevención mediante consultas parametrizadas (prepared statements)
- **CORS**: Configurado para permitir peticiones del frontend
- **Variables de entorno**: Credenciales almacenadas en `.env` (no versionadas)

## Despliegue

### Backend
1. Configurar variables de entorno en el servidor
2. Instalar dependencias: `npm install --production`
3. Ejecutar: `npm start`

### Frontend
1. Construir para producción: `npm run build`
2. Los archivos estáticos se generarán en `frontend/dist/`
3. Servir con un servidor web (nginx, Apache, etc.)

### Base de Datos
1. Crear base de datos en el servidor MySQL
2. Ejecutar scripts de creación de tablas
3. Configurar credenciales en `.env`

## Solución de Problemas

### MySQL no se conecta
- Verificar que el servicio MySQL esté corriendo: `services.msc` en Windows
- Verificar puerto (por defecto 3306)
- Verificar credenciales en `.env`
- Comprobar que la base de datos exista

### Error de CORS
- Verificar que el proxy esté configurado correctamente en `vite.config.js`
- Verificar que el backend tenga `cors()` habilitado

### JWT inválido
- El token puede haber expirado
- Cerrar sesión y volver a iniciar sesión
- Verificar que `JWT_SECRET` sea el mismo en todas las instancias

### Sugerencias no aparecen automáticamente
- Verificar que existan registros en `suggested_transactions` con `status='pending'`
- El modal se abre automáticamente al cargar la página Movements

## Convenciones de Código

### Backend
- Controladores: Lógica de negocio, validaciones
- Modelos: Únicamente queries a la base de datos
- Rutas: Definición de endpoints y middlewares
- Nombres en camelCase para variables/funciones
- Comentarios en español

### Frontend
- Componentes funcionales con Hooks
- Nombres de archivos en PascalCase para componentes
- Custom hooks con prefijo `use`
- Estilos con Bootstrap y clases personalizadas
- Comentarios en español

## Notas para Desarrollo

### Agregar un nuevo endpoint
1. Crear función en el controlador correspondiente (`controllers/`)
2. Crear query en el modelo si es necesario (`models/`)
3. Definir ruta en el archivo de rutas (`routes/`)
4. Agregar middleware de autenticación si es necesario

### Agregar una nueva página
1. Crear componente en `frontend/src/pages/`
2. Agregar ruta en `App.jsx`
3. Usar `ProtectedRoute` si requiere autenticación
4. Agregar enlace en `Sidebar.jsx` o `Navbar.jsx`

### Trabajar con la base de datos
- Las conexiones usan pool de MySQL2
- Siempre usar consultas parametrizadas para prevenir SQL injection
- Ejemplo: `db.query('SELECT * FROM users WHERE id = ?', [userId])`

## Licencia

Este proyecto es de uso educativo/personal.

## Contribución

Este proyecto fue desarrollado como una aplicación de gestión financiera personal y grupal con sistema de gamificación.

---

**Última actualización:** Enero 2026
