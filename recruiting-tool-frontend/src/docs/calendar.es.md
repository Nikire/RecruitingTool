# Calendario

**Ruta:** `/hr/calendar`
**Acceso:** HR, HR_MANAGER, COMPANY_OWNER, ADMIN, SUPER_ADMIN

La página de Calendario muestra todas las entrevistas próximas de tu empresa en una vista mensual, semanal o diaria.

## Funcionalidades

- **Vistas mensual / semanal / diaria** — cambia entre vistas de calendario
- **Filtro por miembro del equipo** — filtra entrevistas por entrevistador
- **Detalles de entrevista** — haz clic en cualquier chip de entrevista para ver todos los detalles
- **Panel de notas de etapa** — ve las notas del candidato directamente desde el calendario
- **Acciones rápidas** — reprogramar o cancelar desde el popover

## Popover de Detalle de Entrevista

Al hacer clic en un chip de entrevista se abre un popover con:
- Nombre del candidato y posición
- Fecha, hora y duración de la entrevista
- Enlace de reunión (si está configurado)
- Entrevistadores
- Toggle **"Ver todas las notas"** — muestra todas las notas de evaluación de etapa del candidato

## Configuración de Google Calendar

Para conectar tu Google Calendar personal:
1. Ve a **Configuración → Calendario** (`/settings/calendar`)
2. Haz clic en **"Conectar Google Calendar"**
3. Autoriza a Borderless para acceder a tu calendario
4. Las entrevistas crearán automáticamente eventos en tu Google Calendar

> Cada usuario conecta su propio Google Calendar de forma individual. El calendario de equipo es una vista agregada de solo lectura en la aplicación.

## Reserva de Entrevista por el Candidato

Para ciertas etapas, RRHH puede generar un **token de reserva** para el candidato. El candidato recibe un enlace (`/book-interview/:token`) donde puede elegir entre los horarios disponibles — sin necesidad de iniciar sesión.
