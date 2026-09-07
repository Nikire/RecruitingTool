# Integraciones

## Google Calendar

**Configuración:** `/settings/calendar`

Conecta tu cuenta de Google para sincronizar las entrevistas con tu calendario personal.

### Pasos de Configuración
1. Ve a **Configuración → Calendario**
2. Haz clic en **"Conectar Google Calendar"**
3. Autoriza mediante Google OAuth
4. Listo — las entrevistas futuras crearán automáticamente eventos en el calendario

### Qué se Sincroniza
- Título, fecha, hora y duración de la entrevista
- Asistentes (entrevistadores)
- Enlace de video de Google Meet generado automáticamente
- Cancelaciones y reprogramaciones

> Cada usuario conecta su propio calendario de forma individual. La vista del calendario de equipo en `/hr/calendar` agrega todas las entrevistas del equipo.

---

## Stripe (Pagos)

Stripe gestiona toda la facturación y la administración de suscripciones.

### Operaciones Admitidas
- Creación de suscripciones mediante Stripe Checkout
- Actualizaciones y degradaciones de plan
- Renovación automática
- Gestión de facturas
- Cancelación (al final del período)
- Sincronización del estado de suscripción mediante webhooks

### Para SUPER_ADMIN
Configura las claves de API de Stripe en **Administración → Configuración del Sistema**.

---

## Google Gemini AI

Impulsa la funcionalidad de puntuación de candidatos con IA.

### Configuración
Establece la variable de entorno `GEMINI_API_KEY` en el backend.

### Límites de Velocidad
Las llamadas a la API se gestionan por cuota por empresa. Configura los límites por empresa en `/admin/ai-quota`.

---

## Correo Electrónico (Resend)

Borderless utiliza la **Resend HTTP API** para todos los correos transaccionales.

### Configuración
Establece en el entorno del backend:
- `SMTP_PASSWORD` — Clave de API de Resend (usada como token Bearer)
- `SMTP_ENABLED=true` — Activa el envío de correos
- `SMTP_FROM` — Dirección de remitente (p. ej., `noreply@borderlessats.com`)

### Tipos de Correo
- Confirmaciones de solicitudes
- Notificaciones de programación de entrevistas
- Recordatorios de entrevistas (24 h antes)
- Notificaciones de cambio de estado
- Invitaciones de equipo
- Correos de restablecimiento de contraseña

---

## MinIO / S3 (Almacenamiento de Archivos)

Todos los archivos subidos (currículums, documentos) se almacenan en MinIO (local) o AWS S3 (producción).

### Tipos de Archivo Admitidos
`PDF`, `DOC`, `DOCX`, `TXT`

### Límite de Tamaño
10 MB por archivo

### Seguridad
Los archivos se almacenan con acceso privado. Se generan URLs firmadas para acceso temporal y limitado en el tiempo.

---

## N8N (Automatización de Flujos de Trabajo)

N8N puede integrarse para flujos de trabajo personalizados activados por eventos de Borderless mediante webhooks.

### Casos de Uso
- Flujos de notificación personalizados
- Integraciones con CRM
- Notificaciones en Slack sobre acciones de candidatos
- Informes personalizados

Consulta la documentación de Integración con N8N para ver los detalles de configuración.
