# Suscripción y Facturación

**Ruta:** `/profile/subscription` (todos los usuarios) · `/hr/billing` (solo COMPANY_OWNER)
**Acceso:** COMPANY_OWNER para gestión de facturación; todos los usuarios para consultar

## Planes

| Plan | Precio | Características Principales |
|------|-------|-------------|
| **Free** | $0 | Usuarios, posiciones, almacenamiento y créditos de IA limitados |
| **Professional** | $79/mes o $799/año | Límites estándar, plantillas de correo, analíticas |
| **Enterprise** | $249/mes o $2.499/año | Límites altos, IA avanzada, funciones personalizadas |

> La facturación anual ahorra aproximadamente un 20%.

## Ciclo de Vida de la Suscripción

1. **Trial** — Las nuevas cuentas comienzan con una prueba gratuita de 14 días (estado TRIALING)
2. **Active** — Suscripción de pago funcionando normalmente
3. **Past Due** — El pago falló, período de gracia activo
4. **Cancelled** — Suscripción cancelada al final del período
5. **Expired** — El trial o la suscripción han terminado

## Uso de Cuota

La página de Suscripción muestra el uso en tiempo real de:
- **Usuarios** — Miembros activos del equipo vs. límite del plan
- **Posiciones de Trabajo** — Posiciones activas vs. límite del plan
- **Candidatos por Posición** — Límite de candidatos por posición
- **Almacenamiento** — Almacenamiento de archivos usado vs. límite del plan
- **Créditos de Puntuación con IA** — Créditos usados este mes vs. límite del plan

## Actualización de Plan

Solo `COMPANY_OWNER` puede actualizar el plan. Ve a `/hr/billing` → selecciona plan → Stripe Checkout.

Después del pago, Stripe envía un webhook y la suscripción se activa en segundos.

## Cancelación

Las cancelaciones tienen efecto al **final del período de facturación actual** — conservas el acceso hasta entonces.

## Planes Personalizados

SUPER_ADMIN puede crear planes personalizados con límites específicos asignados a empresas individuales en `/admin/custom-plans`.
