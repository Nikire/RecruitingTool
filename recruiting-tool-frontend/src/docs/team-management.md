# Gestión de Equipo

**Ruta:** `/settings/team`
**Acceso:** HR_MANAGER, COMPANY_OWNER, COMPANY_ADMIN, ADMIN, SUPER_ADMIN

La Gestión de Equipo te permite invitar y administrar a las personas que tienen acceso al espacio de trabajo de Borderless de tu empresa.

## Invitar a un Miembro del Equipo

1. Ve a **Configuración → Equipo**
2. Haz clic en **"Invitar Miembro del Equipo"**
3. Ingresa su dirección de correo electrónico
4. Selecciona su rol (HR, HR_MANAGER, RECRUITER, COMPANY_ADMIN)
5. Envía la invitación

El invitado recibe un correo con un enlace para aceptar. Si no tiene una cuenta, se le pedirá que se registre primero.

## Roles que Puedes Asignar

| Rol | Ideal Para |
|------|---------|
| `HR` | Reclutamiento diario — candidatos, entrevistas, procesos de contratación |
| `HR_MANAGER` | RRHH senior — gestión de equipo + todas las funciones de RRHH |
| `RECRUITER` | Especialistas en sourcing — igual que HR |
| `COMPANY_ADMIN` | Administradores de empresa — facturación + configuración de empresa + funciones de RRHH |

## Gestión de Miembros Existentes

- **Ver** todos los miembros activos del equipo y sus roles
- **Actualizar rol** — cambiar el rol de un miembro
- **Desactivar** — retirar acceso (el miembro se elimina de forma lógica, no permanentemente)

## Estado de Invitación

| Estado | Significado |
|--------|---------|
| `PENDING` | Invitación enviada, aún no aceptada |
| `ACCEPTED` | El miembro se ha unido |
| `EXPIRED` | El enlace de invitación ha expirado (24 horas) |

## Control de Acceso

- `HR_MANAGER` puede invitar/gestionar a `HR`, `RECRUITER`
- `COMPANY_OWNER` / `COMPANY_ADMIN` puede gestionar todos los roles incluyendo `HR_MANAGER`
- Solo `ADMIN` / `SUPER_ADMIN` pueden desactivar usuarios de forma permanente
