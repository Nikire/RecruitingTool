# Entrevistas

**Ruta:** `/hr/interviews`
**Acceso:** HR, HR_MANAGER, COMPANY_OWNER, ADMIN, SUPER_ADMIN

La página de Entrevistas muestra todas las entrevistas programadas en tu empresa. También puedes acceder a la programación de entrevistas desde dentro de una etapa de proceso de contratación.

## Estados de Entrevista

| Estado | Significado |
|--------|---------|
| `PENDING` | Creada pero no confirmada |
| `SCHEDULED` | Confirmada, esperando que ocurra |
| `COMPLETED` | La entrevista ya tuvo lugar |
| `CANCELLED` | La entrevista fue cancelada |

## Programar una Entrevista

1. Abre un proceso de contratación
2. Ve a la etapa actual
3. Haz clic en **"Programar Entrevista"**
4. Completa: fecha, hora, duración, enlace de reunión (opcional), notas
5. Asigna entrevistadores de tu equipo
6. Guarda — se envía notificación por correo al candidato

## Integración con Google Calendar

Si has conectado Google Calendar (`/settings/calendar`):
- Las entrevistas crean automáticamente un evento en Google Calendar
- Se genera y agrega automáticamente un enlace de Google Meet al evento
- Las actualizaciones y cancelaciones se sincronizan con Google Calendar

## Notificaciones por Correo

- **Al programar:** El candidato recibe un correo de confirmación con los detalles
- **Al cancelar:** El candidato recibe una notificación de cancelación
- **Recordatorios:** Se envían recordatorios automáticos 24 horas antes (mediante cron job)

## Notas de Entrevista

Desde la página de Entrevistas, puedes ver todas las notas de etapa de un candidato haciendo clic en el **ícono de notas** junto a una entrevista. Esto muestra todas las notas de evaluación de todas las etapas.

## Reprogramar / Cancelar

Usa los botones de acción en cada tarjeta de entrevista para reprogramar o cancelar. El candidato es notificado automáticamente.
