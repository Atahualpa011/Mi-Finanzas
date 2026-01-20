# AppFinanzas - Aplicación de Gestión de Finanzas Personales

## 📋 Descripción General

AppFinanzas es una aplicación web full-stack para la gestión de finanzas personales que permite a los usuarios:
- Registrar y categorizar ingresos y gastos
- Compartir gastos en grupos
- Realizar transferencias entre amigos
- Obtener análisis emocional de sus gastos
- Recibir sugerencias automáticas de transacciones
- Gestionar invitaciones y liquidaciones de grupos

## 🏗️ Arquitectura del Proyecto

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
│   │   └── suggestedTransactionController.js
│   ├── models/                # Acceso a datos (queries SQL)
│   │   ├── userModel.js
│   │   ├── transactionModel.js
│   │   ├── groupModel.js
│   │   ├── friendModel.js
│   │   ├── transferModel.js
│   │   ├── categoryModel.js
│   │   └── suggestedTransactionModel.js
│   ├── routes/                # Definición de endpoints de la API
│   │   ├── authRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── groupRoutes.js
│   │   ├── friendRoutes.js
│   │   ├── transferRoutes.js
│   │   ├── analysisRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── profileRoutes.js
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
│   │   │   └── GroupAddExpense.jsx
│   │   └── hooks/            # Custom hooks
│   │       └── useCurrency.js
│   ├── public/               # Archivos estáticos
│   └── vite.config.js        # Configuración de Vite
├── config/                    # Archivos de configuración (vacío actualmente)
└── db/                       # Scripts de base de datos (vacío actualmente)
```

## 🔧 Configuración e Instalación

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

## 📊 Esquema de Base de Datos

### Tablas Principales

#### `users`
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(20),
  currency VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `transactions`
```sql
CREATE TABLE transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  category VARCHAR(100),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### `friends`
```sql
CREATE TABLE friends (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  friend_id INT NOT NULL,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### `transfers`
```sql
CREATE TABLE transfers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  from_user_id INT NOT NULL,
  to_user_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### `groups`
```sql
CREATE TABLE groups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);
```

#### `group_members`
```sql
CREATE TABLE group_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  group_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('admin', 'member') DEFAULT 'member',
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'accepted',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### `group_expenses`
```sql
CREATE TABLE group_expenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  group_id INT NOT NULL,
  paid_by INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  FOREIGN KEY (paid_by) REFERENCES users(id) ON DELETE CASCADE
);
```

#### `group_expense_splits`
```sql
CREATE TABLE group_expense_splits (
  id INT PRIMARY KEY AUTO_INCREMENT,
  expense_id INT NOT NULL,
  user_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (expense_id) REFERENCES group_expenses(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### `categories`
```sql
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  name VARCHAR(100) NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### `suggested_transactions`
```sql
CREATE TABLE suggested_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  category VARCHAR(100),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  suggested_date DATE NOT NULL,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🔌 API Endpoints

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
- `POST /api/groups/:id/invite` - Invitar miembro
- `GET /api/groups/:id/invitations` - Listar invitaciones
- `POST /api/groups/:id/invitations/:invId/respond` - Responder invitación
- `POST /api/groups/:id/expenses` - Crear gasto grupal
- `GET /api/groups/:id/expenses` - Listar gastos del grupo
- `GET /api/groups/:id/summary` - Obtener resumen de deudas
- `GET /api/groups/:id/settlements` - Calcular liquidaciones óptimas

### Análisis
- `POST /api/analysis/emotional` - Obtener análisis emocional de gastos

### Transacciones Sugeridas
- `GET /api/suggested-transactions` - Listar sugerencias pendientes
- `POST /api/suggested-transactions/:id/accept` - Aceptar sugerencia
- `POST /api/suggested-transactions/:id/reject` - Rechazar sugerencia

## 🔐 Autenticación y Autorización

La aplicación usa **JWT (JSON Web Tokens)** para la autenticación:

1. El usuario inicia sesión con email y contraseña
2. El backend valida las credenciales y genera un JWT
3. El frontend almacena el token en `localStorage`
4. Todas las peticiones posteriores incluyen el header: `Authorization: Bearer <token>`
5. El middleware `authenticate.js` valida el token en cada petición protegida

### Middleware de Autenticación

**`authenticate.js`**: Verifica que el usuario esté autenticado
**`groupMember.js`**: Verifica que el usuario sea miembro del grupo

## 🎨 Funcionalidades Principales

### 1. Dashboard
- Resumen de ingresos y gastos
- Gráficos de distribución por categorías
- Visualización de tendencias temporales
- Balance general

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

### 4. Grupos y Gastos Compartidos
- Creación de grupos
- Invitación de miembros
- Registro de gastos compartidos con división automática
- Cálculo de deudas entre miembros
- Algoritmo de liquidación óptima (minimiza transacciones)
- Visualización de resumen de deudas

### 5. Análisis Emocional
- Análisis del impacto emocional de los gastos
- Categorización emocional de transacciones
- Visualizaciones y recomendaciones

### 6. Personalización
- Selección de moneda preferida
- Categorías personalizadas
- Perfil de usuario editable

## 🌐 Flujo de Navegación

```
Landing (/)
  ├─> Login (/login)
  │    └─> Dashboard (/dashboard) [Protegido]
  │         ├─> Movements (/movements)
  │         ├─> Add Transaction (/add-transaction)
  │         ├─> Friends (/friends)
  │         ├─> Groups List (/groups)
  │         │    └─> Group Detail (/groups/:id)
  │         ├─> Emotional Analysis (/emotional-analysis)
  │         └─> Profile (/profile)
  │
  └─> Register (/register)
       └─> Login (/login)
```

## 🛡️ Seguridad

- **Contraseñas**: Hasheadas con bcrypt (factor de coste: 10)
- **JWT**: Tokens con expiración configurable
- **SQL Injection**: Prevención mediante consultas parametrizadas (prepared statements)
- **CORS**: Configurado para permitir peticiones del frontend
- **Variables de entorno**: Credenciales almacenadas en `.env` (no versionadas)

## 🚀 Despliegue

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

## 🔍 Solución de Problemas

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

## 📝 Convenciones de Código

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

## 📖 Notas para Desarrollo

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

## 📄 Licencia

Este proyecto es de uso educativo/personal.

## 👥 Contribución

Este proyecto fue desarrollado como una aplicación de gestión financiera personal y grupal.

---

**Última actualización:** Enero 2026
