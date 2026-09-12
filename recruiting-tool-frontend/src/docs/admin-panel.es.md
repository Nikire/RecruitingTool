# Panel de Administración

**Ruta:** `/admin`
**Acceso:** Solo ADMIN, SUPER_ADMIN

El Panel de Administración es el centro de control a nivel de plataforma para Borderless. Los usuarios de RRHH no pueden acceder a esta área. Desde aquí gestionas toda la plataforma: cada empresa y usuario, suscripciones y cuotas, la cola de moderación de ofertas, el CRM de ventas y las campañas de prospección, y los paneles de reporte a nivel plataforma.

---

## Cómo funciona el acceso

Hay tres controles distintos que deciden qué puedes ver. No siempre coinciden, así que conviene conocer los tres.

1. **El guard de rutas** (`App.tsx`) admite tanto a `ADMIN` como a `SUPER_ADMIN` en todas las rutas `/admin/*`.
2. **El menú lateral** (`AdminLayout.tsx`) oculta las entradas exclusivas de SUPER_ADMIN a un ADMIN, así que un ADMIN simplemente nunca ve esos ítems.
3. **La página misma** puede volver a verificar tu rol. Empresas, Usuarios, Límites de Plan, Banderas de Funcionalidad, Configuración General, Webhooks y Claves API, Planes Personalizados y Configuración muestran un panel de **Acceso Denegado** a un usuario que no sea SUPER_ADMIN y llegue escribiendo la URL.

En el backend la lista de roles es una escalera, no un conjunto: `@Auth(['ADMIN'])` significa "ADMIN y todo lo que esté por encima", así que SUPER_ADMIN también pasa. `@Auth(['SUPER_ADMIN'])` es la única barrera realmente exclusiva.

---

## Mapa de navegación

El menú lateral agrupa las 29 páginas así.

| Grupo                   | Página                    | Ruta                          | Rol requerido |
| ----------------------- | ------------------------- | ----------------------------- | ------------- |
| —                       | Dashboard                 | `/admin`                      | ADMIN         |
| Outreach                | CRM de Prospectos         | `/admin/outreach-crm`         | ADMIN         |
| Outreach                | Plantillas de Outreach    | `/admin/outreach-templates`   | ADMIN         |
| Outreach                | Campañas de Prospección   | `/admin/outreach-campaigns`   | ADMIN         |
| Gestión                 | Empresas                  | `/admin/companies`            | SUPER_ADMIN   |
| Gestión                 | Usuarios                  | `/admin/users`                | SUPER_ADMIN   |
| Gestión                 | Suscripciones             | `/admin/subscriptions`        | ADMIN         |
| Gestión                 | Registros Eliminados      | `/admin/deleted-records`      | ADMIN         |
| Gestión                 | Mensajes de Contacto      | `/admin/contact-messages`     | ADMIN         |
| Gestión                 | Registro de Correos       | `/admin/email-logs`           | SUPER_ADMIN   |
| Inteligencia de Negocio | Panel de Ingresos         | `/admin/revenue`              | ADMIN         |
| Inteligencia de Negocio | Inspector de Cuotas       | `/admin/quota-inspector`      | ADMIN         |
| Inteligencia de Negocio | Salud de Empresas         | `/admin/health`               | ADMIN         |
| Inteligencia de Negocio | Rastreador de Trials      | `/admin/trials`               | ADMIN         |
| Inteligencia de Negocio | Analítica del Pipeline    | `/admin/pipeline-analytics`   | ADMIN         |
| Operaciones             | Moderación de ofertas     | `/admin/job-moderation`       | SUPER_ADMIN   |
| Operaciones             | Demos Agendadas           | `/admin/demos`                | ADMIN         |
| Operaciones             | Salud del Email           | `/admin/email-deliverability` | ADMIN         |
| Operaciones             | Changelog                 | `/admin/changelog`            | ADMIN         |
| Operaciones             | Gestor de Tareas          | `/admin/tasks`                | ADMIN         |
| Configuración           | Límites de Plan           | `/admin/plan-limits`          | SUPER_ADMIN   |
| Configuración           | Banderas de Funcionalidad | `/admin/feature-flags`        | SUPER_ADMIN   |
| Configuración           | Configuración General     | `/admin/general-settings`     | SUPER_ADMIN   |
| Configuración           | Webhooks y Claves API     | `/admin/webhooks`             | SUPER_ADMIN   |
| Configuración           | Planes Personalizados     | `/admin/custom-plans`         | SUPER_ADMIN   |
| Configuración           | Cuota de IA               | `/admin/ai-quota`             | SUPER_ADMIN   |
| Configuración           | Configuración             | `/admin/settings`             | SUPER_ADMIN   |
| Configuración           | Documentación             | `/admin/docs`                 | SUPER_ADMIN   |

Tres rutas existen pero no tienen entrada en el menú:

| Página                | Ruta                        | Cómo llegar                                     |
| --------------------- | --------------------------- | ----------------------------------------------- |
| Detalle de empresa    | `/admin/companies/:uid`     | Haz clic en una fila de Empresas                |
| Detalle de prospecto  | `/admin/outreach-crm/:uid`  | Haz clic en **Ver Detalles** en un prospecto    |
| Analítica de Outreach | `/admin/outreach-analytics` | La tarjeta **Outreach Analytics** del Dashboard |

---

## Dashboard (`/admin`)

El Dashboard es un lanzador, no un reporte. Muestra tu nombre y una cuadrícula de tarjetas de navegación divididas en secciones de **Gestión** y **Configuración** — una tarjeta por destino, con una descripción de una línea. Las tarjetas de páginas exclusivas de SUPER_ADMIN se ocultan a un ADMIN.

No hay contadores de plataforma en esta página. Para números, ve al Panel de Ingresos, a Analítica del Pipeline o al Inspector de Cuotas.

---

## Outreach

### CRM de Prospectos (`/admin/outreach-crm`)

Sigue a las empresas a las que les estás vendiendo. Este es el pipeline comercial, totalmente separado de los datos de candidatos.

**En la página de listado puedes:**

- Leer las cuatro tarjetas de estadísticas: Total de Prospectos, En Proceso, Demo Agendada, Convertidos
- Buscar por nombre de empresa y filtrar por estado, por origen o por **Solo destacados**
- Hacer clic en **Agregar Prospecto** para crear uno — Nombre de la Empresa, Sitio Web, Industria, Tamaño, País, Ciudad, **Encontrado en**, Estado, Etiquetas y Notas
- Marcar un prospecto con estrella para fijarlo en tu lista corta
- Hacer clic en **Ver Detalles** para abrir la ficha del prospecto
- Eliminar un prospecto mediante un diálogo de confirmación

**Estados:** Nuevo, Contactado, Seguimiento 1, Seguimiento 2, Respondió, Demo Agendada, Demo Realizada, Propuesta Enviada, Convertido, Perdido, Archivado.

**Orígenes:** Clutch, GoodFirms, LinkedIn, Sales Navigator, Upwork, Toptal, Google Maps, Referido, Directo, Otro, Apollo Campaign, n8n Workflow.

**En la página de detalle (`/admin/outreach-crm/:uid`) puedes:**

- Revisar la **Info de la Empresa** y la campaña vinculada
- Agregar y quitar **Contactos** — nombre completo, cargo, email, URL de LinkedIn, teléfono y una marca de "contacto principal"
- **Registrar Actividad** con un tipo de actividad, un canal opcional, un cambio de estado opcional y notas. Los tipos son Nota, Mensaje Enviado, Respuesta Recibida, Seguimiento, Demo Agendada, Demo Completada, Propuesta Enviada, Estado Cambiado y Contacto Agregado. Los canales son LinkedIn, Email, WhatsApp, Teléfono, En Persona y Otro.
- Elegir una plantilla de outreach guardada al registrar la actividad, para que quede grabado el mensaje que realmente enviaste
- Leer la Línea de Tiempo de Actividad

> **Cuidado:** eliminar un prospecto borra también sus contactos y todo su historial de actividad. No hay restauración.

### Analítica de Outreach (`/admin/outreach-analytics`)

Un reporte de embudo de solo lectura sobre los mismos datos del CRM. Muestra cuatro KPIs — Total de Prospectos, Tasa de Respuesta, Demos Agendadas y Tasa de Conversión (con el promedio de días para convertir) — más un embudo de conversión, prospectos por origen, prospectos por estado y actividades de los últimos 30 días.

No hay enlace en el menú lateral. Ábrela desde la tarjeta **Outreach Analytics** del Dashboard.

### Plantillas de Outreach (`/admin/outreach-templates`)

La biblioteca de textos de prospección en frío. Las plantillas se agrupan por canal — solicitud de conexión de LinkedIn, mensaje de LinkedIn, email, WhatsApp, manejo de respuestas y directorios — y cada una tiene varias variantes en español y en inglés.

**Qué puedes hacer:**

- Expandir una plantilla para leer sus variantes
- Copiar una variante al portapapeles
- Editar una variante. Al guardar se almacena una **sobrescritura persistente** para ese ID de plantilla, idioma y número de variante.
- Restablecer una variante, lo que elimina la sobrescritura y vuelve al texto que viene en el código

Variables disponibles: `{{NOMBRE}}`, `{{EMPRESA}}`, `{{CARGO}}`, `{{CIUDAD}}`, `{{N_POSICIONES}}`, `{{CANAL}}`, `{{TU_NOMBRE}}`, `{{DESCUENTO}}`.

> **Hay dos editores distintos en esta página.** Las plantillas de outreach son textos comerciales dirigidos a prospectos. La página también muestra las **Plantillas de Correo** de tu empresa, que son los emails transaccionales que reciben los candidatos. Editar la equivocada cambia lo que reciben los candidatos.

### Campañas de Prospección (`/admin/outreach-campaigns`)

Ejecuta campañas de prospección en frío sobre listas de leads importadas. Cada campaña es una pestaña; la etiqueta muestra el número de leads.

**Qué puedes hacer:**

- **Nueva Campaña** — nombre y descripción opcional
- Copiar el **UID de campaña** (n8n y otras automatizaciones se dirigen a la campaña por este UID)
- **Importar CSV** — sube una lista de leads. Las exportaciones de Apollo.io se mapean automáticamente: First Name + Last Name → nombre de contacto, Company Name → empresa, Email → email, Person Linkedin Url → LinkedIn, y Title / Industry / # Employees / Country se guardan en Notas.
- Leer la franja de analítica de la campaña: Total de Leads, Con Email, Aperturas Únicas, Aperturas Totales, Clics Únicos, Clics Totales
- Filtrar leads por estado, por canal y por fecha de alta
- Editar las notas de un lead
- **Previsualizar** el email renderizado para un lead, copiar el asunto, el cuerpo o el email completo, y avanzar lead a lead con **Agregar a CRM y Siguiente**
- Copiar la variante de **Mensaje de LinkedIn** generada para un lead
- **Agregar al CRM** — convierte el lead en un prospecto del CRM mediante un diálogo de confirmación, y permite asignar etiquetas en el mismo paso
- **Eliminar Campaña** — con diálogo de confirmación. Borra la campaña _y todos sus leads_, y no se puede deshacer.

**Lo que la interfaz no hace hoy:** el botón **Enviar** de cada lead está permanentemente deshabilitado y muestra el tooltip "Envío de email temporalmente deshabilitado". No se puede enviar ningún correo de prospección desde esta página. Los endpoints de envío sí existen en la API (`POST /api/outreach-campaigns/:uid/leads/:leadUid/send-email` y `POST /api/outreach-campaigns/:uid/send-test-email`) y los usa la automatización de n8n, así que un lead sí puede recibir correo — pero no desde un clic en esta pantalla.

> **Nota de API:** la mayor parte de este controlador requiere ADMIN, pero los endpoints de envío, previsualización y correo de prueba están abiertos a HR y superiores. No son alcanzables desde ninguna pantalla de RRHH, pero sí con un token de HR.

---

## Gestión

### Empresas (`/admin/companies`)

Solo SUPER_ADMIN. Lista todas las empresas de la plataforma con búsqueda y paginación.

- **Agregar Empresa** para crear una manualmente (el diálogo se titula _Crear Nueva Empresa_ y pide nombre y descripción)
- Haz clic en una fila para abrir el detalle de la empresa
- **Eliminar** una empresa mediante un diálogo de confirmación

> **La eliminación es física y normalmente falla.** Los usuarios y las posiciones están enlazados a la empresa con una clave foránea restrictiva, así que la base de datos rechaza borrar una empresa que todavía tenga cualquiera de las dos. En la práctica solo puedes eliminar una empresa vacía. No hay borrado lógico y nada aparece en Registros Eliminados.

### Detalle de empresa (`/admin/companies/:uid`)

Se abre desde una fila de Empresas. Muestra la tarjeta de la empresa (nombre, descripción, cantidad de usuarios, cantidad de posiciones) y una tabla de **Miembros de la Empresa** con nombre, email, roles, estado y fecha de alta, paginada.

Sobre la tabla de Miembros de la Empresa hay dos acciones de alto impacto:

| Acción                      | Qué hace                                                                               | Notas                                                                                                                                                                         |
| --------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Transferir Propiedad**    | Mueve el rol `COMPANY_OWNER` del propietario actual a otro miembro de la misma empresa | Deshabilitada si la empresa tiene menos de dos miembros. El nuevo propietario debe ya pertenecer a la empresa. El anterior conserva sus otros roles pero pierde la propiedad. |
| **Forzar Unión de Usuario** | Agrega a cualquier usuario, por UID de usuario, a esta empresa con el Rol que elijas   | Salta por completo el flujo de invitación — no se le consulta al usuario ni recibe invitación.                                                                                |

Ambas son inmediatas y ninguna tiene deshacer. Transferir Propiedad, en particular, no puede revertirla la persona que la perdió.

### Usuarios (`/admin/users`)

Solo SUPER_ADMIN; un ADMIN que navegue aquí ve un panel de Acceso Denegado.

- Un único cuadro **Buscar por nombre o correo** sobre la lista, con paginación
- **Crear Usuario** abre un diálogo para agregar un usuario manualmente
- Cada fila ofrece **Editar** y **Eliminar**

Las columnas de la tabla son nombre, email, roles, empresa y fecha de creación.

> **Eliminar es el único control destructivo de esta página, y es un borrado físico.** El registro del usuario se elimina de la base de datos; no se desactiva y no aparece en Registros Eliminados.

La API también expone desactivar (`PUT /api/users/:uid/deactivate`), reactivar (`PUT /api/users/:uid/reactivate`) y un registro de actividad (`GET /api/users/:uid/activity`), pero ninguno está conectado a un control de esta página. No hay forma de suspender un usuario desde la interfaz, ni vista de registro de actividad.

### Suscripciones (`/admin/subscriptions`)

Todas las suscripciones en una sola grilla: empresa, propietario, email, plan, estado, MRR, fin de período y fecha de creación. Encima hay cinco tarjetas resumen — Total, Activas, En Trial, Pago Pendiente y MRR Total.

La propia página lo advierte: _el MRR se estima a partir del precio de lista de cada plan, no de los importes cobrados por el proveedor de pagos._

**Cambiar Plan.** Abre el diálogo desde una fila, elige el nuevo plan y, opcionalmente, escribe una nota que explique el cambio.

> **Un cambio de plan aquí afecta solo a los permisos.** Escribe el nuevo plan en el registro de suscripción y agrega una entrada de auditoría. **No** habla con Stripe ni con Dodo. La facturación real del cliente no cambia, así que después de cualquier cambio aquí debes reconciliar el proveedor de pagos a mano o quedarán desincronizados.

**Registro de Auditoría.** Cada fila abre un panel lateral con el historial de esa empresa — entradas de Cambio de Plan, Cambio de Estado y Trial Extendido, cada una con el valor anterior y el nuevo, la nota, el administrador que lo hizo y la fecha.

Dos operaciones más existen en la API pero no tienen control en la interfaz: `PATCH /api/admin/subscriptions/:companyUid/status` y `POST /api/admin/subscriptions/:companyUid/extend-trial`. Sus entradas de auditoría sí aparecerán en el panel si algo más las invoca.

### Registros Eliminados (`/admin/deleted-records`)

Registros con borrado lógico, en cuatro pestañas: **Candidatos**, **Posiciones de Trabajo**, **Aplicaciones** y **Entrevistas**. Los usuarios no están incluidos — su eliminación es permanente y nunca llega aquí.

Cada fila ofrece dos acciones mediante un diálogo de confirmación compartido:

| Acción                       | Efecto                                                                   |
| ---------------------------- | ------------------------------------------------------------------------ |
| **Restaurar**                | Quita la marca de borrado y reactiva el registro. Seguro y reversible.   |
| **Eliminar Permanentemente** | Borrado físico. Es la vía de supresión para GDPR y no se puede deshacer. |

### Mensajes de Contacto (`/admin/contact-messages`)

Envíos del formulario público `/contact`, con contador de no leídos y paginación. Las columnas son nombre, empresa, mensaje, fecha y estado leído/no leído.

- Haz clic en una fila para abrir el diálogo de detalle
- Marca un mensaje como leído
- Usa el enlace `mailto:` del diálogo para responder desde tu propio cliente de correo

No hay cuadro de respuesta ni seguimiento de respuestas. Una vez que contestas por email, nada de esa respuesta queda guardado en Borderless.

### Registro de Correos (`/admin/email-logs`)

Solo SUPER_ADMIN. El historial completo de cada correo enviado por la plataforma: destinatario, asunto, tipo, estado y fecha de envío, con paginación en el servidor.

- Busca por dirección de correo o por asunto
- Filtra por estado (Enviado / Fallido)
- Filtra por tipo de correo — bienvenida, verificación de email, restablecimiento de contraseña, invitación al equipo, postulación recibida, postulación aceptada, cambio de estado, avance de etapa, notificación de contratación, notificación a RRHH, código de acceso al proceso, invitación a etapa asíncrona, entrevista agendada / reagendada / cancelada / recordatorio, correo de plantilla, prueba del sistema, outreach y más

Esta es la página que hay que abrir cuando un cliente dice que un candidato nunca recibió un correo. **Si no hay fila, el envío nunca ocurrió** — revisa el disparador, no la entregabilidad.

---

## Inteligencia de Negocio

Las cinco páginas de este grupo son de solo lectura. No hay acciones en ellas salvo **Agregar al CRM** en el Rastreador de Trials.

### Panel de Ingresos (`/admin/revenue`)

MRR estimado con su variación mes a mes, empresas de pago activas, empresas en trial, cancelaciones del mes, distribución por plan, desglose por estado de suscripción y nuevas empresas por mes de los últimos seis meses.

El MRR se calcula en el backend multiplicando la cantidad de suscripciones activas por un precio de lista fijo por plan (Free $0, Professional $49, Enterprise $149). No se lee del proveedor de pagos. Como un **Cambiar Plan** en la página de Suscripciones reescribe el plan sin tocar la facturación, cualquier cambio manual aleja este número del dinero realmente cobrado.

### Inspector de Cuotas (`/admin/quota-inspector`)

Consumo en tiempo real contra los límites del plan para cada empresa: Empresa, Plan, Posiciones de Trabajo, Usuarios y Créditos IA, más un **Estado** general. Filtra por plan y por estado. Los límites en `-1` se muestran como **Ilimitado**.

| Salud           | Significado                                                        |
| --------------- | ------------------------------------------------------------------ |
| **OK**          | Todos los recursos limitados están por debajo del 70% de su límite |
| **Advertencia** | Algún recurso limitado llegó al 70%                                |
| **Crítico**     | Algún recurso limitado llegó al 90%                                |
| **Excedido**    | Algún recurso limitado está en el 100% o más                       |

Las filas se ordenan con Excedido primero. Una empresa en **Excedido** ya está siendo rechazada por el guard de cuotas cuando intenta agregar más de ese recurso, así que trata esas filas como incidentes en curso o como conversaciones de upgrade, no como pronósticos.

Ten en cuenta que los créditos de IA usan el registro de Cuota de IA propio de la empresa cuando existe, y recurren a la asignación del plan cuando no.

### Salud de Empresas (`/admin/health`)

Riesgo de abandono por cliente: Puntuación, Nivel de Riesgo, Último Acceso, Empleos Activos, Aplic. (Mes) y Contrat. (Mes). Filtra por nivel de riesgo.

La puntuación se arma con cuatro señales de uso (recencia del login, posiciones activas, volumen de postulaciones, actividad de contratación) y cae en uno de cuatro niveles:

| Puntuación  | Nivel de riesgo |
| ----------- | --------------- |
| 80 o más    | Saludable       |
| 50–79       | En Riesgo       |
| 20–49       | Deteriorando    |
| Menos de 20 | Crítico         |

### Rastreador de Trials (`/admin/trials`)

Empresas en plan gratuito y en trial, ordenadas por profundidad de activación. Las columnas cubren plan, Días en Plataforma, posiciones, candidatos, aplicaciones, equipo, **Puntuación de Activación** y **Disposición**. Filtra por disposición y por plan.

La puntuación de activación suma 20 puntos por cada uno de: al menos 1 posición creada, al menos 5 candidatos agregados, al menos 3 postulaciones recibidas, al menos 1 proceso de contratación iniciado, al menos 2 miembros invitados. La disposición se deriva de la puntuación — **CALIENTE** con 70 o más, **TIBIO** entre 40 y 69, **FRÍO** por debajo de 40; las tarjetas superiores los cuentan como Leads CALIENTES, TIBIOS y FRÍOS. La grilla ordena de más caliente a más frío.

El botón **Agregar al CRM** de la última columna es un atajo: te lleva al CRM de Prospectos. No crea el prospecto por ti — hay que darlo de alta allí. Cuando ya existe un prospecto correspondiente, la celda muestra un chip **En CRM**.

### Analítica del Pipeline (`/admin/pipeline-analytics`)

Métricas de reclutamiento agregadas entre empresas, para revisiones de negocio y conversaciones con inversores: postulaciones totales, postulaciones del mes, posiciones abiertas (contra el total y las cerradas), tiempo promedio de contratación, tasa de conversión, empresas activas, entrevistas totales y del mes, más postulaciones mensuales de seis meses y un desglose de orígenes de postulación.

Todas las cifras están agregadas sobre todos los inquilinos — la página indica bajo el título sobre cuántas empresas activas calcula. No leas ningún número como si perteneciera a un solo cliente.

---

## Operaciones

### Moderación de ofertas (`/admin/job-moderation`)

Solo SUPER_ADMIN. La cola antispam de ofertas de trabajo.

**Cómo llegan las ofertas aquí:** una oferta creada por una empresa **sin suscripción de pago activa** se guarda como `PENDING_APPROVAL` y queda fuera del portal público de empleo hasta que decidas. Las ofertas de empresas con plan de pago se aprueban automáticamente y nunca aparecen en esta cola.

**En la página puedes:**

- Leer las cuatro tarjetas: Pendientes, Aprobadas, Rechazadas y Total de ofertas
- Buscar por título de la oferta o nombre de la empresa
- Cambiar el filtro **Estado de moderación** a Aprobadas o Rechazadas para revisar decisiones pasadas (por defecto muestra Pendientes)
- **Aprobar** directamente con el botón de tilde de la fila
- Abrir **Revisar oferta** para leer la descripción completa, el plan de la empresa y si tiene o no plan de pago, quién la creó y cuándo, y cualquier nota de moderación previa — y aprobar o rechazar desde ahí

**Rechazar exige un motivo** de al menos tres caracteres, y ese motivo se envía tal cual a la empresa y se muestra en su oferta. El rechazo mantiene la oferta fuera del portal público. La aprobación la publica de inmediato en toda la plataforma. Cualquiera de las dos decisiones notifica al usuario que creó la oferta.

### Demos Agendadas (`/admin/demos`)

Cierra el ciclo del flujo público de solicitud de demo. La grilla muestra prospecto, empresa, horario agendado, fecha de creación, resultado actual, notas y si la reserva está vinculada a un prospecto del CRM. Filtra por resultado.

**Establecer resultado** abre un diálogo con un campo de notas y estos cinco resultados: **Pendiente**, **Completado**, **No apareció**, **Reprogramado**, **Cancelado**.

La columna del CRM es de solo lectura — muestra **En CRM** o **Sin CRM**. El endpoint que vincula una reserva con un prospecto (`PATCH /api/admin/demos/:uid/link-prospect`) existe pero todavía no tiene control en esta página.

### Salud del Email (`/admin/email-deliverability`)

Entregabilidad agregada de todos los correos enviados por la plataforma: Total Enviados, Tasa de Entrega, Tasa de Apertura, Tasa de Rebote y Spam / Quejas, una grilla de **Desglose por Tipo de Correo** (entregados, abiertos, rebotados por tipo) y una lista de **Rebotes Recientes** con el tipo de rebote.

Un aviso aparece cuando la tasa de rebote supera el 5%. Como regla, una tasa de rebote por encima del 5% o una tasa de quejas por encima del 0,1% empieza a dañar la reputación del remitente — limpia rápido las direcciones problemáticas.

> **De dónde salen los datos.** El envío marca la fila del registro como `SENT` o `FAILED`. Los estados `DELIVERED`, `OPENED`, `BOUNCED` y `SPAM` solo llegan desde el webhook de entrega de Resend en `POST /api/email/webhooks/resend`. Si ese webhook no está configurado, todo queda en Enviado y las tasas de esta página se mantienen en cero — eso es un webhook faltante, no un problema de entrega.

### Changelog (`/admin/changelog`)

Redacta las notas de versión que los clientes ven en el modal de novedades al iniciar sesión.

- **Nueva Nota de Lanzamiento** — título, versión, contenido, **Nivel Objetivo** y un interruptor de Publicar
- **Nivel Objetivo** — Todos los Usuarios, Professional+ o Solo Enterprise
- Edita una nota existente
- Cambia el estado **Publicado** desde la grilla o desde el diálogo
- Elimina una nota mediante un diálogo de confirmación
- La grilla muestra el estado de cada nota y un contador de **Visto por**

> **Publicar es visible para el cliente y es inmediato.** En cuanto publicas una nota queda disponible para los clientes que coincidan con el nivel objetivo. Eliminar una nota publicada la retira de todos los que aún no la abrieron. Deja la nota como borrador hasta que el texto esté final.

### Gestor de Tareas (`/admin/tasks`)

Un tablero kanban interno para el equipo de Borderless. Nada de esto es visible para los clientes.

- Cuatro columnas: **Por Hacer**, **En Progreso**, **En Revisión**, **Completado**
- **Agregar Tarea** — Título, Descripción, Estado, Prioridad (Baja, Media, Alta, Urgente), Fecha Límite, Etiquetas, **Asignado a** y una **Empresa Vinculada** opcional
- Los botones de flecha de una tarjeta la mueven una columna atrás o adelante
- Las tareas pasadas de fecha que no están en Completado se resaltan como **Vencido**
- Busca por título y filtra por prioridad y por persona asignada
- Elimina una tarea mediante un diálogo de confirmación

Dos limitaciones conocidas: el selector de **Asignado a** pide `GET /api/users`, una ruta que el backend no define (la API de usuarios expone `/api/users/list`), y el selector de **Empresa Vinculada** pide `GET /api/company`, que es exclusivo de SUPER_ADMIN. Espera que ambos selectores vengan vacíos — el de responsable para todos, el de empresa para un ADMIN.

---

## Configuración

### Límites de Plan (`/admin/plan-limits`)

Solo SUPER_ADMIN. Una tarjeta por nivel sembrado — **Free Trial**, **Professional**, **Agency** y **Enterprise** — cada una con cinco campos numéricos en línea y tres interruptores. Cada edición se guarda sola en cuanto sales del campo o cambias el interruptor.

| Campo                           | Tipo                                           |
| ------------------------------- | ---------------------------------------------- |
| Máx. Posiciones de Trabajo      | número (`-1` = ilimitado)                      |
| Máx. Candidatos por Posición    | número (`-1` = ilimitado)                      |
| Máx. Usuarios                   | número (`-1` = ilimitado)                      |
| Máx. Almacenamiento (MB)        | número (`-1` = ilimitado)                      |
| Créditos de IA / Mes            | número (`-1` = ilimitado, `0` = deshabilitado) |
| Puntuación de IA Habilitada     | interruptor                                    |
| Plantillas de Email Habilitadas | interruptor                                    |
| Analíticas Habilitadas          | interruptor                                    |

> **Editar esta página no cambia lo que pueden hacer los clientes.** Tanto la aplicación de cuotas en tiempo de ejecución como las tarjetas públicas de precios leen un archivo de configuración fijo en el backend (`src/modules/quota/config/plan-limits.config.ts`), no esta tabla. La tabla de base de datos detrás de esta pantalla existe solo para alimentar esta pantalla. Si las dos difieren, gana el archivo. Un cambio real de nivel debe hacerse en ese archivo y reflejarse aquí.

### Banderas de Funcionalidad (`/admin/feature-flags`)

Solo SUPER_ADMIN. Una matriz: seis funcionalidades en las filas, cuatro niveles de plan en las columnas y un interruptor en cada celda. En total, 24 registros de bandera sembrados. Cambiar un interruptor guarda de inmediato.

| Funcionalidad       | Free Trial | STARTER | Professional | Enterprise |
| ------------------- | ---------- | ------- | ------------ | ---------- |
| Selección con IA    | off        | off     | off          | on         |
| Importación Masiva  | off        | on      | on           | on         |
| Analítica Avanzada  | off        | off     | on           | on         |
| Marca Personalizada | off        | off     | on           | on         |
| Acceso a API        | off        | off     | off          | on         |
| Soporte Prioritario | off        | off     | off          | on         |

La tabla de arriba es el valor sembrado por defecto. Al pasar el cursor sobre un interruptor se muestra cuándo se cambió esa bandera por última vez.

No hay segmentación por empresa ni pruebas A/B — una bandera pertenece a un nivel de plan, no a un cliente.

**Las columnas de nivel aquí no coinciden con Límites de Plan.** Esta página usa Free / Starter / Professional / Enterprise; Límites de Plan y los planes de suscripción usan Free / Professional / Agency / Enterprise. No existe traducción para Starter, así que la cabecera muestra la cadena cruda `STARTER`, y no hay columna de Agency.

> **Nada lee estas banderas todavía.** Ningún guard del backend ni componente del frontend consulta los registros de banderas, así que cambiar un interruptor solo cambia el valor guardado. Trata esta página como un editor de la matriz de planes que aún no está conectado, no como un interruptor de emergencia.

### Configuración General (`/admin/general-settings`)

Solo SUPER_ADMIN. **Esta página es un marcador de posición.** Todas las tarjetas llevan un chip de "Próximamente" y la nota "El soporte de edición completo para esta sección estará disponible en una versión futura."

- La tarjeta **Configuración de Empresa** muestra tres filas — Nombre de la Empresa, Zona Horaria Predeterminada, Idioma Predeterminado — cuyos valores son textos de ejemplo fijos, no datos reales.
- La tarjeta **Configuración de Notificaciones** lista cuatro preferencias futuras (Nueva solicitud recibida, Etapa del candidato cambiada, Candidato marcado como contratado, Alertas y errores del sistema), cada una atenuada y con un chip de Próximamente.

Nada en esta página lee ni escribe en el backend. Para la configuración que sí está activa, usa **Configuración** (`/admin/settings`).

### Webhooks y Claves API (`/admin/webhooks`)

Solo SUPER_ADMIN. **Esta página también es un marcador de posición.** Ambas tarjetas llevan un chip de "Próximamente" y todos los botones están deshabilitados.

- La tarjeta **Claves API** muestra una tabla vacía (Nombre, Prefijo de Clave, Creado, Último Uso, Acciones) y un botón **Generar Clave API** deshabilitado.
- La tarjeta **Webhooks** muestra una tabla vacía (Nombre, URL del Endpoint, Eventos, Estado, Acciones) y un botón **Agregar Webhook** deshabilitado.

Hoy no se puede configurar ningún webhook en ninguna parte de Borderless.

**Las claves API, en cambio, sí funcionan — pero no aquí.** Las claves API por empresa se gestionan en **`/settings/api-keys`**, respaldadas por una API real (`POST`, `GET`, `PATCH`, `DELETE /api/api-keys`) disponible para Propietarios de Empresa, Administradores de Empresa, ADMIN y SUPER_ADMIN. Esa página crea claves, muestra la clave en texto plano una sola vez, y permite renombrarlas, deshabilitarlas y revocarlas. Deriva a los clientes allí.

### Planes Personalizados (`/admin/custom-plans`)

Solo SUPER_ADMIN. Construye configuraciones de plan a medida para empresas concretas.

**Crear o editar un plan.** El diálogo tiene tres secciones:

- Nombre del plan y, opcionalmente, **Asignar a Empresa** (se puede dejar sin asignar y vincular después)
- **Configuración de Cuotas** — Máximo de Usuarios, Máximo de Posiciones de Trabajo, Máximo de Candidatos por Posición, Almacenamiento Máximo (MB), Créditos de IA / Mes (`-1` = ilimitado), más los interruptores de Plantillas de Email Habilitadas y Analítica Habilitada
- **Precios** — Precio Mensual (centavos), Precio Anual (centavos) y Moneda. El monto va **en centavos**: `19900` son $199.00.

**Desde el listado puedes:**

| Acción                     | Qué ocurre                                                                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Asignar**                | Vincula el registro del plan con la empresa que elijas                                                                                                              |
| **Sincronizar con Stripe** | Crea el producto en Stripe si no existe y siempre crea precios nuevos (los precios de Stripe son inmutables), y guarda los IDs de producto, precio y enlace de pago |
| **Editar** / **Eliminar**  | Eliminar va detrás de un diálogo de confirmación y no se puede deshacer                                                                                             |

Filtra el listado por **Todos los planes**, **Modo prueba** o **Modo producción**. La insignia de modo y el enlace al Dashboard de Stripe vienen de la configuración de Stripe; si `STRIPE_SECRET_KEY` no está definida en el servidor, **Sincronizar con Stripe** falla con un error claro en lugar de hacer nada.

> **Sincronizar con Stripe crea objetos de facturación reales** en la cuenta de Stripe contra la que esté configurado el servidor. Revisa la insignia TEST / LIVE antes de hacer clic.

> **Asignar un plan no cambia hoy los permisos de la empresa.** La asignación escribe la empresa en el registro del plan personalizado; nada en la ruta de cuotas ni de límites de plan vuelve a leer los planes personalizados. Las cuotas que configures aquí se guardan, pero no se aplican. Para lo que tenga que tener efecto hoy, usa el plan de la suscripción de la empresa más la Cuota de IA.

### Cuota de IA (`/admin/ai-quota`)

Solo SUPER_ADMIN. Las cuotas son por empresa **y por tipo de cuota**, no un único número mensual.

1. Elige una empresa en el desplegable con búsqueda (la lista se arma desde la grilla de suscripciones)
2. La tabla lista las cuotas de esa empresa — una fila por tipo, con Usado / Límite, Restante y Fecha de Reinicio
3. Usa la acción de edición de la fila para fijar un **Nuevo Límite**

Los tres tipos de cuota son **Análisis de CV**, **Puntuación de candidatos** y **Puntuación por lotes**. Escribe `-1` para ilimitado; el texto de ayuda del campo lo indica y su valor mínimo es `-1`.

El límite de puntuación de candidatos que fijes aquí es el que el Inspector de Cuotas reporta como la asignación de créditos de IA de esa empresa.

### Configuración (`/admin/settings`)

Solo SUPER_ADMIN. Una lectura de solo lectura de la configuración real del servidor, en seis tarjetas.

| Tarjeta                                  | Qué muestra                                                           | Origen                                                                                                                  |
| ---------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Configuración de Email**               | estado SMTP, host, puerto, remitente                                  | `SMTP_ENABLED`, `SMTP_HOST`, `SMTP_PORT`, `EMAIL_FROM`                                                                  |
| **Configuración de IA**                  | modelo y nivel                                                        | `GEMINI_MODEL`, `GEMINI_TIER`                                                                                           |
| **Configuración de Almacenamiento**      | tipo y bucket                                                         | `STORAGE_TYPE`, `S3_BUCKET_NAME`                                                                                        |
| **Límite de Velocidad**                  | peticiones por ventana para tráfico general, de autenticación y de IA | `THROTTLE_TTL` / `THROTTLE_LIMIT`, `THROTTLE_AUTH_TTL` / `THROTTLE_AUTH_LIMIT`, `THROTTLE_AI_TTL` / `THROTTLE_AI_LIMIT` |
| **Configuración de Copias de Seguridad** | habilitado, programación, días de retención, último backup            | `BACKUP_ENABLED`, `BACKUP_SCHEDULE`, `BACKUP_RETENTION_DAYS`                                                            |
| **Información de la Aplicación**         | entorno y versión                                                     | `NODE_ENV`                                                                                                              |

Una séptima tarjeta, **Estadísticas de Correo**, resume el último mes de envíos: total, enviados, fallidos y un desglose por tipo de correo.

Solo dos cosas de esta página son interactivas:

- El interruptor **Emails de Aplicación Habilitados**, que persiste una sobrescritura del valor por defecto de `ENABLE_APPLICATION_EMAILS`
- **Probar Conexión** en la tarjeta de Configuración de Email, que envía un mensaje de prueba real. Está deshabilitado cuando SMTP está apagado.

Todo lo demás se define con variables de entorno en el servidor y no se puede cambiar desde la interfaz. Las copias de seguridad, en particular, requieren reiniciar el servidor.

### Documentación (`/admin/docs`)

Solo SUPER_ADMIN. La guía que estás leyendo. Renderiza dieciséis secciones — Resumen, Roles y Permisos, Candidatos, Posiciones de Trabajo, Procesos de Contratación, Postulaciones, Entrevistas, Calendario, Puntuación con IA, Plantillas de Correo, Analíticas, Gestión de Equipo, Suscripción y Facturación, Panel de Administración, Integraciones y ¿Por qué Borderless? — desde archivos markdown empaquetados con el frontend.

**Para quien mantiene la documentación:**

- Cada sección es un par de archivos en `recruiting-tool-frontend/src/docs/`: `<seccion>.md` para inglés y `<seccion>.es.md` para español. La página elige el archivo en español cuando el idioma de la interfaz empieza por `es`.
- Los archivos se importan en tiempo de compilación. No hay CMS — editar un documento significa editar el archivo markdown y reconstruir el frontend.
- **Actualiza siempre los dos archivos.** Si cambias solo el inglés, los lectores en español siguen viendo el texto viejo sin ningún aviso en ninguna parte.
- Los archivos `hr-*.md` de la misma carpeta son otra superficie distinta — alimentan la guía de RRHH en `/hr/guide` y no se listan aquí.

---

## Acciones destructivas de un vistazo

| Página                        | Acción                       | ¿Reversible?                                                               |
| ----------------------------- | ---------------------------- | -------------------------------------------------------------------------- |
| Empresas                      | Eliminar empresa             | No — borrado físico (y bloqueado mientras existan usuarios o posiciones)   |
| Detalle de empresa            | Transferir Propiedad         | No — no por el propietario anterior                                        |
| Detalle de empresa            | Forzar Unión de Usuario      | Solo editando después los roles del usuario                                |
| Usuarios                      | Eliminar usuario             | No — borrado físico                                                        |
| Suscripciones                 | Cambiar Plan                 | El valor sí; el desfase de facturación que crea, solo a mano               |
| Registros Eliminados          | Eliminar Permanentemente     | No — supresión GDPR                                                        |
| Moderación de ofertas         | Rechazar oferta              | El estado sí; el motivo ya se le mostró a la empresa                       |
| Changelog                     | Publicar / Eliminar una nota | Publicar es visible al instante; eliminar la quita de quienes no la vieron |
| Campañas de Prospección       | Eliminar Campaña             | No — se lleva todos sus leads                                              |
| CRM de Prospectos             | Eliminar Prospecto           | No — se lleva contactos e historial de actividad                           |
| Planes Personalizados         | Sincronizar con Stripe       | Crea objetos reales en Stripe                                              |
| Planes Personalizados         | Eliminar plan                | No                                                                         |
| Cuota de IA / Límites de Plan | Edición de límites           | Sí — vuelve a editar el valor                                              |

---

## Relacionado

- [Roles y Permisos](./roles-permissions.es.md) — la escalera de roles completa y la matriz de permisos
- [Suscripción y Facturación](./subscription.es.md) — lo que ven los clientes sobre planes y cuotas
- [Integraciones](./integrations.es.md) — claves API, calendario y correo saliente
- [Resumen](./overview.es.md) — cómo encaja el producto
