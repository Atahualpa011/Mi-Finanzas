/**
 * Contenidos de ayuda para cada sección de la aplicación
 * Cada sección tiene un título y contenido HTML con la guía de uso
 */

export const HELP_CONTENTS = {
  dashboard: {
    title: 'Panel de Control (Dashboard)',
    content: `
      <h3><i class="bi bi-speedometer2"></i> ¿Qué es el Dashboard?</h3>
      <p>
        El Dashboard es tu centro de control financiero. Aquí puedes ver un resumen completo de tu situación financiera,
        incluyendo tus ingresos, gastos, saldo actual y tendencias a lo largo del tiempo.
      </p>

      <h3><i class="bi bi-graph-up"></i> Funcionalidades principales</h3>
      
      <h4>Resumen financiero</h4>
      <ul>
        <li><strong>Saldo actual:</strong> Muestra tu balance total calculado a partir de tus ingresos y gastos</li>
        <li><strong>Ingresos totales:</strong> Suma de todos tus ingresos en el período seleccionado</li>
        <li><strong>Gastos totales:</strong> Suma de todos tus gastos en el período seleccionado</li>
        <li><strong>Balance:</strong> Diferencia entre ingresos y gastos</li>
      </ul>

      <h4>Gráficos y visualizaciones</h4>
      <ul>
        <li><strong>Gráfico de línea:</strong> Muestra la evolución de tu saldo a lo largo del tiempo</li>
        <li><strong>Gráfico de barras:</strong> Compara ingresos vs gastos por período</li>
        <li><strong>Gráfico circular:</strong> Visualiza la distribución de gastos por categoría</li>
        <li><strong>Filtros de tiempo:</strong> Puedes agrupar los datos por día, mes o año</li>
      </ul>

      <h4>Presupuestos y alertas</h4>
      <ul>
        <li>Visualiza tus presupuestos activos y su progreso</li>
        <li>Recibe alertas cuando te acerques al límite de tus presupuestos</li>
        <li>Identifica categorías donde estás gastando más de lo planeado</li>
      </ul>

      <h4>Recomendaciones inteligentes</h4>
      <ul>
        <li>El sistema analiza tus patrones de gasto</li>
        <li>Recibe sugerencias personalizadas para mejorar tus finanzas</li>
        <li>Identifica oportunidades de ahorro</li>
      </ul>

      <div class="alert alert-info">
        <strong><i class="bi bi-info-circle"></i> Consejo:</strong> 
        Visita el Dashboard regularmente para mantener el control de tus finanzas.
        Los gráficos te ayudarán a identificar patrones y tomar mejores decisiones.
      </div>
    `
  },

  movements: {
    title: 'Movimientos (Transacciones)',
    content: `
      <h3><i class="bi bi-arrow-left-right"></i> ¿Qué son los Movimientos?</h3>
      <p>
        La sección de Movimientos te permite registrar, ver y gestionar todas tus transacciones financieras,
        tanto ingresos como gastos. Es el corazón de tu gestión financiera.
      </p>

      <h3><i class="bi bi-plus-circle"></i> Agregar una transacción</h3>
      <ol>
        <li>Haz clic en el botón <strong>"+ Nueva Transacción"</strong></li>
        <li>Selecciona el tipo: <strong>Ingreso</strong> o <strong>Gasto</strong></li>
        <li>Ingresa el monto de la transacción</li>
        <li>Selecciona una categoría (ej: Alimentación, Transporte, Salario, etc.)</li>
        <li>Añade una descripción (opcional pero recomendado)</li>
        <li>Selecciona la fecha de la transacción</li>
        <li>Elige la moneda si manejas múltiples divisas</li>
        <li>Haz clic en <strong>"Guardar"</strong></li>
      </ol>

      <h3><i class="bi bi-pencil"></i> Editar o eliminar transacciones</h3>
      <ul>
        <li><strong>Editar:</strong> Haz clic en el ícono del lápiz <i class="bi bi-pencil"></i> en cualquier transacción para modificarla</li>
        <li><strong>Eliminar:</strong> Haz clic en el ícono de la papelera <i class="bi bi-trash"></i> para borrar una transacción</li>
        <li>Los cambios se reflejan inmediatamente en tus estadísticas y gráficos</li>
      </ul>

      <h3><i class="bi bi-funnel"></i> Filtrar transacciones</h3>
      <ul>
        <li><strong>Por tipo:</strong> Filtra solo ingresos o solo gastos</li>
        <li><strong>Por categoría:</strong> Muestra transacciones de una categoría específica</li>
        <li><strong>Por fecha:</strong> Selecciona un rango de fechas para ver transacciones específicas</li>
        <li><strong>Por búsqueda:</strong> Busca por descripción o monto</li>
      </ul>

      <h3><i class="bi bi-folder"></i> Categorías</h3>
      <ul>
        <li>Las categorías te ayudan a organizar y analizar tus gastos</li>
        <li>Puedes crear categorías personalizadas desde la configuración</li>
        <li>Cada categoría puede tener un presupuesto asociado</li>
      </ul>

      <div class="alert alert-success">
        <strong><i class="bi bi-lightbulb"></i> Buena práctica:</strong> 
        Registra tus transacciones lo antes posible para no olvidarlas.
        Una descripción clara te ayudará a recordar el contexto más adelante.
      </div>

      <div class="alert alert-warning">
        <strong><i class="bi bi-exclamation-triangle"></i> Importante:</strong> 
        Al eliminar una transacción, la acción no se puede deshacer.
        Asegúrate de que realmente quieres eliminarla.
      </div>
    `
  },

  friends: {
    title: 'Amigos',
    content: `
      <h3><i class="bi bi-people"></i> ¿Para qué sirve la sección de Amigos?</h3>
      <p>
        La sección de Amigos te permite conectar con otros usuarios de la aplicación para
        compartir gastos, gestionar deudas y facilitar el manejo de gastos compartidos.
      </p>

      <h3><i class="bi bi-person-plus"></i> Agregar amigos</h3>
      <ol>
        <li>Haz clic en <strong>"+ Agregar Amigo"</strong></li>
        <li>Busca por nombre de usuario o email</li>
        <li>Envía una solicitud de amistad</li>
        <li>Espera a que la otra persona acepte la solicitud</li>
      </ol>

      <h3><i class="bi bi-cash-stack"></i> Gestionar gastos compartidos</h3>
      <ul>
        <li><strong>Registrar una deuda:</strong> Indica quién le debe dinero a quién</li>
        <li><strong>Dividir un gasto:</strong> Divide automáticamente un gasto entre varios amigos</li>
        <li><strong>Liquidar deudas:</strong> Marca como pagadas las deudas pendientes</li>
        <li><strong>Ver historial:</strong> Consulta el historial de transacciones con cada amigo</li>
      </ul>

      <h3><i class="bi bi-calculator"></i> Balance con amigos</h3>
      <ul>
        <li>Ve cuánto te deben tus amigos en total</li>
        <li>Ve cuánto debes tú a tus amigos</li>
        <li>El balance neto te muestra si estás en positivo o negativo</li>
        <li>Cada amigo tiene su propio balance individual</li>
      </ul>

      <h3><i class="bi bi-bell"></i> Notificaciones</h3>
      <ul>
        <li>Recibe notificaciones cuando un amigo te envía una solicitud</li>
        <li>Se te notifica cuando alguien registra un gasto compartido</li>
        <li>Alertas cuando se liquida una deuda</li>
      </ul>

      <div class="alert alert-info">
        <strong><i class="bi bi-info-circle"></i> Nota:</strong> 
        Los gastos compartidos con amigos no afectan tu balance general personal,
        solo se registran las deudas pendientes.
      </div>
    `
  },

  groups: {
    title: 'Grupos',
    content: `
      <h3><i class="bi bi-people-fill"></i> ¿Qué son los Grupos?</h3>
      <p>
        Los Grupos son espacios compartidos donde varios usuarios pueden registrar y gestionar gastos en común,
        perfectos para viajes, convivencia, proyectos o cualquier situación con gastos compartidos.
      </p>

      <h3><i class="bi bi-plus-square"></i> Crear un grupo</h3>
      <ol>
        <li>Haz clic en <strong>"+ Nuevo Grupo"</strong></li>
        <li>Dale un nombre al grupo (ej: "Viaje a Barcelona", "Casa compartida")</li>
        <li>Añade una descripción (opcional)</li>
        <li>Selecciona la moneda del grupo</li>
        <li>Invita a los miembros por email o nombre de usuario</li>
      </ol>

      <h3><i class="bi bi-receipt"></i> Registrar gastos del grupo</h3>
      <ul>
        <li><strong>Gasto individual:</strong> Un miembro paga por todos y se divide el gasto</li>
        <li><strong>División personalizada:</strong> Cada miembro paga una cantidad diferente</li>
        <li><strong>División igual:</strong> El gasto se divide equitativamente entre todos</li>
        <li>Especifica quién pagó y quiénes se beneficiaron del gasto</li>
      </ul>

      <h3><i class="bi bi-graph-up-arrow"></i> Funcionalidades del grupo</h3>
      <ul>
        <li><strong>Resumen de gastos:</strong> Ve el total gastado por el grupo</li>
        <li><strong>Balance por miembro:</strong> Identifica quién ha pagado más o menos</li>
        <li><strong>Liquidaciones:</strong> Calcula cómo saldar todas las deudas del grupo con el mínimo de transacciones</li>
        <li><strong>Presupuesto grupal:</strong> Establece límites de gasto para el grupo</li>
        <li><strong>Historial completo:</strong> Consulta todos los gastos registrados</li>
      </ul>

      <h3><i class="bi bi-person-check"></i> Gestión de miembros</h3>
      <ul>
        <li>Invita nuevos miembros en cualquier momento</li>
        <li>Los administradores pueden remover miembros</li>
        <li>Puedes salir de un grupo cuando quieras</li>
        <li>El creador del grupo es automáticamente administrador</li>
      </ul>

      <h3><i class="bi bi-arrow-repeat"></i> Liquidar cuentas</h3>
      <ol>
        <li>Ve a la sección de <strong>"Liquidaciones"</strong> del grupo</li>
        <li>El sistema calcula automáticamente quién debe pagar a quién</li>
        <li>Marca las liquidaciones como completadas cuando se paguen</li>
        <li>El balance se actualiza automáticamente</li>
      </ol>

      <div class="alert alert-success">
        <strong><i class="bi bi-lightbulb"></i> Consejo:</strong> 
        Usa grupos para viajes o eventos donde hay muchos gastos compartidos.
        Es mucho más fácil que llevar cuentas manualmente.
      </div>

      <div class="alert alert-info">
        <strong><i class="bi bi-info-circle"></i> Importante:</strong> 
        Los gastos de grupo no afectan tu balance personal individual.
        Solo se reflejan en el balance del grupo.
      </div>
    `
  },

  budgets: {
    title: 'Presupuestos',
    content: `
      <h3><i class="bi bi-piggy-bank"></i> ¿Qué son los Presupuestos?</h3>
      <p>
        Los presupuestos te ayudan a controlar tus gastos estableciendo límites para diferentes categorías
        o períodos de tiempo. Son una herramienta clave para alcanzar tus metas financieras.
      </p>

      <h3><i class="bi bi-plus-circle"></i> Crear un presupuesto</h3>
      <ol>
        <li>Haz clic en <strong>"+ Nuevo Presupuesto"</strong></li>
        <li>Selecciona una categoría (ej: Alimentación, Entretenimiento)</li>
        <li>Establece el monto límite</li>
        <li>Define el período: mensual, semanal, anual o personalizado</li>
        <li>Opcionalmente añade una fecha de inicio y fin</li>
        <li>Guarda el presupuesto</li>
      </ol>

      <h3><i class="bi bi-bar-chart"></i> Seguimiento de presupuestos</h3>
      <ul>
        <li><strong>Barra de progreso:</strong> Ve visualmente cuánto has gastado del presupuesto</li>
        <li><strong>Porcentaje usado:</strong> Número exacto del progreso</li>
        <li><strong>Monto restante:</strong> Cuánto te queda disponible</li>
        <li><strong>Días restantes:</strong> Tiempo hasta que se reinicie el presupuesto</li>
      </ul>

      <h3><i class="bi bi-bell"></i> Alertas y notificaciones</h3>
      <ul>
        <li>Recibes una alerta al alcanzar el 80% del presupuesto</li>
        <li>Notificación cuando superas el límite establecido</li>
        <li>Alertas semanales con el estado de tus presupuestos</li>
        <li>Puedes configurar umbrales personalizados de alerta</li>
      </ul>

      <h3><i class="bi bi-arrow-clockwise"></i> Presupuestos recurrentes</h3>
      <ul>
        <li><strong>Mensuales:</strong> Se reinician automáticamente cada mes</li>
        <li><strong>Semanales:</strong> Perfectos para gastos del día a día</li>
        <li><strong>Anuales:</strong> Para planificación a largo plazo</li>
        <li>El historial se mantiene para comparar períodos anteriores</li>
      </ul>

      <h3><i class="bi bi-pencil"></i> Ajustar presupuestos</h3>
      <ul>
        <li>Puedes editar el monto en cualquier momento</li>
        <li>Cambia el período si tus necesidades cambian</li>
        <li>Desactiva temporalmente un presupuesto sin eliminarlo</li>
        <li>Duplica presupuestos para crear versiones similares</li>
      </ul>

      <div class="alert alert-success">
        <strong><i class="bi bi-lightbulb"></i> Consejo:</strong> 
        Empieza con presupuestos realistas basados en tus gastos históricos.
        Puedes ajustarlos con el tiempo según tus metas.
      </div>

      <div class="alert alert-warning">
        <strong><i class="bi bi-exclamation-triangle"></i> Recuerda:</strong> 
        Los presupuestos son herramientas de control, no límites estrictos.
        Úsalos como guía para mejorar tus hábitos financieros.
      </div>
    `
  },

  investments: {
    title: 'Inversiones',
    content: `
      <h3><i class="bi bi-graph-up"></i> ¿Qué es la sección de Inversiones?</h3>
      <p>
        Aquí puedes registrar y dar seguimiento a tus inversiones financieras: acciones, bonos,
        criptomonedas, fondos de inversión y más. Mantén todo organizado en un solo lugar.
      </p>

      <h3><i class="bi bi-plus-circle"></i> Registrar una inversión</h3>
      <ol>
        <li>Haz clic en <strong>"+ Nueva Inversión"</strong></li>
        <li>Selecciona el tipo: Acciones, Bonos, Cripto, Fondos, etc.</li>
        <li>Ingresa el nombre o símbolo de la inversión</li>
        <li>Especifica el monto invertido inicialmente</li>
        <li>Indica la fecha de compra</li>
        <li>Añade notas o detalles adicionales (opcional)</li>
      </ol>

      <h3><i class="bi bi-arrow-up-circle"></i> Actualizar el valor</h3>
      <ul>
        <li>Actualiza manualmente el valor actual de cada inversión</li>
        <li>El sistema calcula automáticamente la ganancia/pérdida</li>
        <li>Ve el porcentaje de rendimiento de cada inversión</li>
        <li>Historial de actualizaciones de valor</li>
      </ul>

      <h3><i class="bi bi-pie-chart"></i> Portfolio y estadísticas</h3>
      <ul>
        <li><strong>Valor total:</strong> Suma de todas tus inversiones actuales</li>
        <li><strong>Ganancia/Pérdida total:</strong> Rendimiento general de tu portfolio</li>
        <li><strong>Distribución:</strong> Gráfico de cómo se distribuyen tus inversiones por tipo</li>
        <li><strong>Mejores/Peores:</strong> Identifica qué inversiones están funcionando mejor</li>
      </ul>

      <h3><i class="bi bi-calendar-check"></i> Gestión de inversiones</h3>
      <ul>
        <li><strong>Editar:</strong> Actualiza los detalles de cualquier inversión</li>
        <li><strong>Vender:</strong> Registra la venta de una inversión</li>
        <li><strong>Agregar fondos:</strong> Registra inversiones adicionales en el mismo activo</li>
        <li><strong>Notas:</strong> Guarda observaciones y razones de tus decisiones</li>
      </ul>

      <h3><i class="bi bi-award"></i> Logros de inversión</h3>
      <ul>
        <li>Desbloquea logros por alcanzar hitos de inversión</li>
        <li>Compite con tus propios récords históricos</li>
        <li>Celebra cuando tus inversiones alcanzan objetivos</li>
      </ul>

      <div class="alert alert-info">
        <strong><i class="bi bi-info-circle"></i> Nota:</strong> 
        Esta sección es para tracking personal. No ejecuta operaciones reales de compra/venta.
        Mantén tus inversiones actualizadas para un seguimiento preciso.
      </div>

      <div class="alert alert-warning">
        <strong><i class="bi bi-exclamation-triangle"></i> Aviso:</strong> 
        Esta aplicación no proporciona asesoría financiera.
        Consulta con un profesional antes de tomar decisiones de inversión.
      </div>
    `
  },

  gamification: {
    title: 'Gamificación',
    content: `
      <h3><i class="bi bi-trophy"></i> ¿Qué es la Gamificación?</h3>
      <p>
        La sección de gamificación convierte el manejo de tus finanzas en una experiencia más divertida
        y motivadora mediante logros, niveles, rachas y desafíos.
      </p>

      <h3><i class="bi bi-star"></i> Sistema de niveles</h3>
      <ul>
        <li>Gana experiencia (XP) por realizar acciones financieras</li>
        <li>Sube de nivel mientras usas la aplicación</li>
        <li>Cada nivel desbloquea nuevos beneficios</li>
        <li>Ve tu progreso hacia el siguiente nivel</li>
      </ul>

      <h3><i class="bi bi-award"></i> Logros disponibles</h3>
      <ul>
        <li><strong>Primera transacción:</strong> Registra tu primer ingreso o gasto</li>
        <li><strong>Maestro del presupuesto:</strong> Mantén tus gastos bajo presupuesto</li>
        <li><strong>Ahorrista estrella:</strong> Alcanza metas de ahorro</li>
        <li><strong>Racha perfecta:</strong> Registra transacciones diariamente</li>
        <li><strong>Inversor novato:</strong> Registra tu primera inversión</li>
        <li><strong>Social:</strong> Conecta con amigos y grupos</li>
        <li>¡Y muchos más por descubrir!</li>
      </ul>

      <h3><i class="bi bi-fire"></i> Rachas</h3>
      <ul>
        <li>Mantén una racha registrando transacciones regularmente</li>
        <li>Cada día consecutivo suma a tu racha</li>
        <li>Rachas más largas otorgan más XP y beneficios</li>
        <li>No pierdas tu racha - recibe recordatorios</li>
      </ul>

      <h3><i class="bi bi-target"></i> Desafíos</h3>
      <ul>
        <li>Completa desafíos semanales y mensuales</li>
        <li>Cada desafío tiene recompensas únicas</li>
        <li>Algunos desafíos son limitados en el tiempo</li>
        <li>Desafíos personalizados según tu comportamiento</li>
      </ul>

      <h3><i class="bi bi-gem"></i> Recompensas</h3>
      <ul>
        <li>Gana insignias por logros especiales</li>
        <li>Colecciona títulos y personaliza tu perfil</li>
        <li>Desbloquea funciones premium con XP</li>
        <li>Compite en tablas de clasificación (próximamente)</li>
      </ul>

      <div class="alert alert-success">
        <strong><i class="bi bi-lightbulb"></i> Consejo:</strong> 
        La gamificación está diseñada para motivarte a mantener buenos hábitos financieros.
        ¡Diviértete mientras mejoras tus finanzas!
      </div>
    `
  },

  profile: {
    title: 'Perfil',
    content: `
      <h3><i class="bi bi-person-circle"></i> Tu Perfil</h3>
      <p>
        En tu perfil puedes gestionar tu información personal, preferencias de la aplicación,
        seguridad de la cuenta y configuraciones generales.
      </p>

      <h3><i class="bi bi-pencil-square"></i> Información personal</h3>
      <ul>
        <li><strong>Nombre y apellido:</strong> Actualiza tu nombre visible</li>
        <li><strong>Email:</strong> Tu dirección de correo electrónico</li>
        <li><strong>Foto de perfil:</strong> Personaliza tu avatar</li>
        <li><strong>Biografía:</strong> Añade información sobre ti (opcional)</li>
      </ul>

      <h3><i class="bi bi-gear"></i> Preferencias</h3>
      <ul>
        <li><strong>Moneda principal:</strong> Selecciona tu moneda por defecto</li>
        <li><strong>Idioma:</strong> Cambia el idioma de la interfaz</li>
        <li><strong>Tema:</strong> Modo claro, oscuro o automático</li>
        <li><strong>Formato de fecha:</strong> Elige tu formato preferido</li>
      </ul>

      <h3><i class="bi bi-bell"></i> Notificaciones</h3>
      <ul>
        <li>Activa/desactiva notificaciones por email</li>
        <li>Configura alertas de presupuestos</li>
        <li>Notificaciones de actividad de amigos y grupos</li>
        <li>Recordatorios de transacciones pendientes</li>
      </ul>

      <h3><i class="bi bi-shield-check"></i> Seguridad</h3>
      <ul>
        <li><strong>Cambiar contraseña:</strong> Actualiza tu contraseña regularmente</li>
        <li><strong>Autenticación de dos factores:</strong> Añade una capa extra de seguridad</li>
        <li><strong>Sesiones activas:</strong> Ve y cierra sesiones en otros dispositivos</li>
        <li><strong>Registro de actividad:</strong> Revisa el historial de accesos</li>
      </ul>

      <h3><i class="bi bi-download"></i> Exportar datos</h3>
      <ul>
        <li>Descarga todas tus transacciones en formato CSV o Excel</li>
        <li>Exporta reportes específicos por período</li>
        <li>Backup de toda tu información financiera</li>
      </ul>

      <h3><i class="bi bi-trash"></i> Eliminar cuenta</h3>
      <ul>
        <li>Opción para eliminar permanentemente tu cuenta</li>
        <li>Se te pedirá confirmación antes de eliminar</li>
        <li>Todos tus datos serán borrados (acción irreversible)</li>
      </ul>

      <div class="alert alert-info">
        <strong><i class="bi bi-info-circle"></i> Privacidad:</strong> 
        Tu información está protegida y nunca será compartida con terceros sin tu consentimiento.
      </div>

      <div class="alert alert-warning">
        <strong><i class="bi bi-exclamation-triangle"></i> Importante:</strong> 
        Asegúrate de usar una contraseña fuerte y única para tu cuenta.
        Habilita la autenticación de dos factores para mayor seguridad.
      </div>
    `
  },

  insights: {
    title: 'Estadísticas e Insights',
    content: `
      <h3><i class="bi bi-lightbulb"></i> ¿Qué son los Insights?</h3>
      <p>
        Los Insights son análisis inteligentes de tus datos financieros que te ayudan a identificar
        patrones, tendencias y oportunidades de mejora en tus finanzas personales.
      </p>

      <h3><i class="bi bi-graph-up-arrow"></i> Análisis disponibles</h3>
      <ul>
        <li><strong>Tendencias de gasto:</strong> Identifica si gastas más o menos con el tiempo</li>
        <li><strong>Categorías problemáticas:</strong> Ve dónde gastas más de lo esperado</li>
        <li><strong>Patrones temporales:</strong> Descubre si gastas más en ciertos días o meses</li>
        <li><strong>Comparativas:</strong> Compara períodos (este mes vs. mes anterior)</li>
      </ul>

      <h3><i class="bi bi-bullseye"></i> Predicciones</h3>
      <ul>
        <li>Proyección de gastos futuros basada en tu historial</li>
        <li>Estimación de cuándo alcanzarás tus metas de ahorro</li>
        <li>Alertas de gastos inusuales o anomalías</li>
        <li>Predicción de fin de mes según tu ritmo actual</li>
      </ul>

      <h3><i class="bi bi-emoji-smile"></i> Análisis emocional</h3>
      <ul>
        <li>Relación entre tus emociones y patrones de gasto</li>
        <li>Identifica compras impulsivas o emocionales</li>
        <li>Recomendaciones para mejorar tu bienestar financiero</li>
        <li>Seguimiento de tu salud financiera emocional</li>
      </ul>

      <h3><i class="bi bi-bar-chart-line"></i> Reportes personalizados</h3>
      <ul>
        <li>Genera reportes por categoría, período o tipo</li>
        <li>Exporta gráficos e insights en PDF</li>
        <li>Comparte reportes con asesores financieros</li>
        <li>Programa reportes automáticos periódicos</li>
      </ul>

      <div class="alert alert-success">
        <strong><i class="bi bi-lightbulb"></i> Consejo:</strong> 
        Revisa los insights regularmente para aprovechar las recomendaciones.
        Pequeños ajustes basados en datos pueden generar grandes ahorros.
      </div>
    `
  },

  emotional: {
    title: 'Análisis Emocional',
    content: `
      <h3><i class="bi bi-emoji-smile"></i> ¿Qué es el Análisis Emocional?</h3>
      <p>
        El análisis emocional te ayuda a entender la relación entre tus emociones y tus decisiones financieras,
        proporcionando insights para tomar mejores decisiones conscientes.
      </p>

      <h3><i class="bi bi-heart-pulse"></i> Registro emocional</h3>
      <ul>
        <li>Registra cómo te sientes al hacer transacciones</li>
        <li>Categorías: Feliz, Ansioso, Impulsivo, Satisfecho, Arrepentido, etc.</li>
        <li>El sistema identifica patrones entre emociones y gastos</li>
        <li>Recibe alertas sobre comportamientos emocionales</li>
      </ul>

      <h3><i class="bi bi-graph-up"></i> Patrones identificados</h3>
      <ul>
        <li><strong>Compras emocionales:</strong> Gastos influenciados por emociones negativas</li>
        <li><strong>Días problemáticos:</strong> Identifica si ciertos días provocan más gastos</li>
        <li><strong>Categorías sensibles:</strong> Áreas donde eres más vulnerable emocionalmente</li>
        <li><strong>Triggers:</strong> Situaciones que desencadenan gastos</li>
      </ul>

      <h3><i class="bi bi-chat-quote"></i> Recomendaciones personalizadas</h3>
      <ul>
        <li>Estrategias para manejar compras impulsivas</li>
        <li>Técnicas de mindfulness financiero</li>
        <li>Períodos de reflexión antes de compras grandes</li>
        <li>Alternativas saludables a gastos emocionales</li>
      </ul>

      <div class="alert alert-info">
        <strong><i class="bi bi-info-circle"></i> Privacidad:</strong> 
        Tus datos emocionales son completamente privados y solo se usan para generar insights personales.
      </div>
    `
  }
};
