# Solicitudes

**Ruta:** `/hr/applications`
**Acceso:** HR, HR_MANAGER, COMPANY_OWNER, ADMIN, SUPER_ADMIN

Las Solicitudes son envíos de candidatos que se postulan a través de la **página pública de empleo** (`/careers`). Son independientes de los procesos de contratación internos — una solicitud es el punto de entrada antes de decidir crear un proceso de contratación formal.

## Ciclo de Vida de una Solicitud

```
PENDING → REVIEWED → ACCEPTED
                   ↘ REJECTED
```

| Estado | Significado |
|--------|---------|
| `PENDING` | Recién enviada, aún no revisada |
| `REVIEWED` | RRHH la ha abierto y revisado |
| `ACCEPTED` | Candidato aceptado — normalmente crea un proceso de contratación |
| `REJECTED` | Candidato rechazado |

## Qué Puede Hacer RRHH

- **Ver todas las solicitudes** con filtros (estado, posición, fecha)
- **Descargar el currículum** si el solicitante subió uno
- **Agregar notas internas** — solo visibles para el equipo de RRHH
- **Actualizar el estado** — PENDING → REVIEWED → ACCEPTED/REJECTED
- **Enviar correo de estado** al solicitante cuando cambia el estado
- **Crear un proceso de contratación** directamente desde una solicitud aceptada

## Correos Automáticos

Cuando se envía una solicitud:
1. **Correo de confirmación** — enviado al solicitante
2. **Correo de notificación a RRHH** — enviado al equipo de RRHH

Cuando cambia el estado:
- `ACCEPTED` — se envía correo al solicitante
- `REJECTED` — se envía correo al solicitante

> El contenido del correo usa las plantillas de correo de la empresa si están configuradas; de lo contrario, usa las plantillas predeterminadas del sistema.

## Página de Consulta de Estado

Los candidatos pueden consultar el estado de su solicitud en `/check-status` usando su email y referencia de solicitud — sin necesidad de iniciar sesión.
