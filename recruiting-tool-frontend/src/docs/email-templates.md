# Plantillas de Correo

**Ruta:** `/hr/email-templates`
**Acceso:** HR, HR_MANAGER, COMPANY_OWNER, ADMIN, SUPER_ADMIN

Las Plantillas de Correo te permiten personalizar los correos automáticos que Borderless envía a los candidatos.

## Tipos de Plantillas Disponibles

| Tipo | Cuándo se Envía |
|------|----------|
| `APPLICATION_RECEIVED` | Cuando un candidato se postula a través de la página de empleo |
| `APPLICATION_UNDER_REVIEW` | Cuando el estado de la solicitud cambia a REVIEWED |
| `APPLICATION_ACCEPTED` | Cuando la solicitud es aceptada |
| `APPLICATION_REJECTED` | Cuando la solicitud es rechazada |
| `INTERVIEW_SCHEDULED` | Cuando se programa una entrevista |
| `INTERVIEW_CANCELLED` | Cuando se cancela una entrevista |
| `INTERVIEW_REMINDER` | Enviado 24 horas antes de la entrevista |

## Variables de Plantilla

Usa estas **variables de Handlebars** en tus plantillas:

| Variable | Descripción |
|----------|-------------|
| `{{candidateName}}` | Nombre completo del candidato |
| `{{positionTitle}}` | Título de la posición de trabajo |
| `{{companyName}}` | Nombre de tu empresa |
| `{{interviewDate}}` | Fecha de la entrevista |
| `{{interviewTime}}` | Hora de la entrevista |
| `{{meetingLink}}` | Enlace de videoconferencia |
| `{{interviewerName}}` | Nombre del entrevistador |

## Cómo Funciona

1. Crea una plantilla para un tipo específico
2. Borderless verifica primero si existe una plantilla personalizada de tu empresa
3. Si no existe — usa la plantilla predeterminada del sistema como alternativa
4. Las plantillas se renderizan con Handlebars antes de enviar

## Vista Previa

Cada plantilla tiene un botón de **Vista Previa** que muestra cómo se verá el correo con datos de muestra rellenados.

## Texto Sin Formato vs. HTML

Las plantillas admiten tanto texto sin formato como formato HTML básico. Mantén el HTML simple para mayor compatibilidad con los clientes de correo.
