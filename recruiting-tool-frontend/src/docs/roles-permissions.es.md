# Roles y Permisos

Borderless utiliza control de acceso basado en roles (RBAC). Cada usuario tiene uno o más roles que determinan qué puede ver y hacer.

## Jerarquía de Roles

```
SUPER_ADMIN (Más alto — administrador global de la plataforma)
    ↓
ADMIN (Administrador de la plataforma)
    ↓
COMPANY_OWNER / COMPANY_ADMIN
    ↓
HR_MANAGER
    ↓
HR / RECRUITER
    ↓
USER (Más bajo — empleado básico/entrevistador)
```

## Descripción de Roles

| Rol | Para quién es | Acceso principal |
|------|-------------|-----------|
| `SUPER_ADMIN` | Propietario de la plataforma | Acceso completo a todo — todas las empresas, todas las configuraciones, panel de administración |
| `ADMIN` | Administrador de la plataforma | Panel de administración, gestión de usuarios y empresas |
| `COMPANY_OWNER` | Propietario de la empresa | Todas las funciones de RRHH + gestión de facturación |
| `COMPANY_ADMIN` | Administrador de la empresa | Todas las funciones de RRHH + configuración de la empresa |
| `HR_MANAGER` | RRHH senior | Todas las funciones de RRHH + gestión de equipos + invitaciones |
| `HR` | Generalista de RRHH | Funciones principales de RRHH (candidatos, contratación, entrevistas) |
| `RECRUITER` | Reclutador | Funciones principales de RRHH |
| `USER` | Empleado regular | Solo participar en entrevistas |

## Matriz de Permisos

| Funcionalidad | USER | HR | HR_MANAGER | COMPANY_OWNER | ADMIN | SUPER_ADMIN |
|---------|------|----|----|----|----|-----|
| Ver candidatos | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Crear/editar candidatos | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Gestionar posiciones de trabajo | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Gestionar procesos de contratación | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Programar entrevistas | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Participar en entrevistas | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Puntuación con IA | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Plantillas de correo | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Analíticas | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Invitar miembros del equipo | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Gestionar roles del equipo | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Editar perfil de empresa | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Gestionar facturación | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Acceder al panel de administración | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Gestionar todas las empresas | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Desactivar usuarios | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Gestionar cuotas de IA | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Gestionar límites de plan | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Indicadores de funcionalidad | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
