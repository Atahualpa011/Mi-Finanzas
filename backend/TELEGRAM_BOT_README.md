# Chatbot de Telegram - Mi-Finanzas

## Descripción

El bot de Telegram permite a los usuarios de Mi-Finanzas gestionar sus finanzas directamente desde Telegram, sin necesidad de abrir la aplicación web.

## Configuración

### 1. Crear el Bot en Telegram

1. Abre Telegram y busca **@BotFather**
2. Envía el comando `/newbot`
3. Sigue las instrucciones:
   - Nombre del bot: `Mi Finanzas Bot` (o el nombre que prefieras)
   - Username: `MiFinanzasBot` (debe terminar en "bot")
4. BotFather te enviará el **token de acceso**. Cópialo.

### 2. Configurar Variables de Entorno

Agrega el token a tu archivo `.env` en la carpeta `backend`:

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

### 3. Ejecutar la Migración de Base de Datos

Ejecuta el script SQL para crear las tablas necesarias:

```bash
# Conectar a MySQL
mysql -u root -p

# En MySQL
USE appfinanzas;
SOURCE db/telegram_migration.sql;
```

O directamente:
```bash
mysql -u root -p appfinanzas < db/telegram_migration.sql
```

### 4. Instalar Dependencias

```bash
cd backend
npm install
```

### 5. Iniciar el Servidor

```bash
npm run dev
```

El bot se iniciará automáticamente junto con el servidor.

---

## Vinculación de Cuenta

### Desde la App Web (recomendado)

1. Inicia sesión en Mi-Finanzas web
2. Ve a **Perfil** → sección **Telegram**
3. Haz clic en **"Generar código de vinculación"**
4. Copia el código de 6 caracteres
5. En Telegram, busca tu bot y envía el código

### Desde la API (para desarrolladores)

```bash
# Generar código de vinculación (requiere JWT)
curl -X POST http://localhost:3001/api/telegram/generate-link-code \
  -H "Authorization: Bearer TU_JWT_TOKEN"
```

---

## Comandos Disponibles

### Gestión de Cuenta

| Comando | Descripción |
|---------|-------------|
| `/start` | Iniciar el bot y ver estado de vinculación |
| `/ayuda` o `/help` | Mostrar lista de comandos |
| `/desvincular` | Desvincular cuenta de Telegram |

### Registrar Transacciones

| Comando | Formato | Ejemplo |
|---------|---------|---------|
| `/ingreso` | `/ingreso <monto> <categoría> [descripción]` | `/ingreso 50000 Sueldo Pago enero` |
| `/gasto` | `/gasto <monto> <categoría> [descripción]` | `/gasto 1500 Alimentación Pizza` |

**Notas:**
- La descripción es opcional
- Soporta decimales: `1500.50`
- Detección de moneda: `US$100`, `€50`, `R$200`

### Consultas

| Comando | Descripción | Ejemplo |
|---------|-------------|---------|
| `/balance` | Ver balance actual (ingresos - gastos) | `/balance` |
| `/ultimos [n]` | Ver últimas n transacciones (default: 5) | `/ultimos 10` |
| `/resumen` | Resumen del mes actual | `/resumen` |
| `/presupuestos` | Ver estado de presupuestos | `/presupuestos` |
| `/categorias` | Listar categorías disponibles | `/categorias` |

---

## Ejemplos de Uso

### Registrar un ingreso
```
/ingreso 50000 Sueldo Pago mensual enero
```
Respuesta:
```
💰 Ingreso registrado

💼 Categoría: Sueldo
💵 Monto: $50,000.00

✅ Transacción guardada exitosamente.
```

### Registrar un gasto
```
/gasto 1500 Alimentación Pizza con amigos
```

### Ver balance
```
/balance
```
Respuesta:
```
📊 Tu Balance Actual
─────────────────────────
💰 Ingresos: $1,000,000.00
💸 Gastos: $250,000.00
────────────────────
📈 Balance: $750,000.00
```

### Ver últimas transacciones
```
/ultimos 5
```

### Ver presupuestos
```
/presupuestos
```
Respuesta:
```
📋 Tus Presupuestos
─────────────────────────

🍽️ Alimentación
[██████░░░░] 60%
$30,000.00 / $50,000.00
⚠️ Cerca del límite

────────────────────

🚗 Transporte
[███░░░░░░░] 30%
$15,000.00 / $50,000.00
✅ OK
```

---

## API Endpoints

El backend expone endpoints para integración con la app web:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/telegram/generate-link-code` | Genera código de vinculación |
| GET | `/api/telegram/status` | Obtiene estado de vinculación |
| DELETE | `/api/telegram/unlink` | Desvincula cuenta |
| PUT | `/api/telegram/notifications` | Actualiza preferencias de notificaciones |

Todos requieren autenticación JWT.

---

## Troubleshooting

### El bot no responde

1. Verifica que el token esté correcto en `.env`
2. Revisa la consola por errores de polling
3. Asegúrate de que el servidor esté corriendo

### "Cuenta de Telegram ya está vinculada"

Un usuario solo puede tener una cuenta de Telegram vinculada. Desvincúlala primero con `/desvincular`.

### "Código inválido o expirado"

Los códigos de vinculación expiran en 5 minutos. Genera uno nuevo desde la app web.

### "Categoría no encontrada"

Usa `/categorias` para ver las categorías disponibles. Los nombres deben coincidir (parcialmente).

### Error de polling

Si ves "Error de polling", puede ser:
- Token inválido
- Problemas de red
- Otro proceso usando el mismo token

---

## Estructura de Archivos

```
backend/
├── bot/
│   ├── telegramBot.js          # Inicialización del bot
│   ├── commands/
│   │   ├── authCommands.js     # /start, vinculación
│   │   ├── transactionCommands.js  # /ingreso, /gasto
│   │   ├── queryCommands.js    # /balance, /ultimos, /resumen
│   │   ├── budgetCommands.js   # /presupuestos
│   │   └── utilityCommands.js  # /ayuda, /desvincular
│   ├── middleware/
│   │   └── botAuth.js          # Verificación de vinculación
│   └── utils/
│       ├── messageFormatter.js # Formateo de mensajes
│       └── validators.js       # Validación de inputs
├── controllers/
│   └── botController.js        # Controlador API
├── models/
│   └── telegramUserModel.js    # Modelo de datos
└── routes/
    └── botRoutes.js            # Rutas API
```

---

## Seguridad

- Los códigos de vinculación expiran en 5 minutos
- Cada usuario solo puede tener una cuenta de Telegram vinculada
- Los tokens JWT nunca se exponen en el bot
- Las contraseñas nunca se transmiten por Telegram

---

## Contribuir

Para agregar nuevos comandos:

1. Crea un handler en `bot/commands/`
2. Usa `requireLinkedUser()` para comandos que requieren autenticación
3. Registra el comando en la función `register*Commands()`
4. Actualiza esta documentación
