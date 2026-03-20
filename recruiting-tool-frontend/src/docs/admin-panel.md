# Panel de Administración

**Ruta:** `/admin`
**Acceso:** Solo ADMIN, SUPER_ADMIN

El Panel de Administración es el centro de control a nivel de plataforma para Borderless. Los usuarios de RRHH no pueden acceder a esta área.

## Dashboard (`/admin`)

Estadísticas generales de toda la plataforma:
- Total de usuarios, empresas, candidatos
- Procesos de contratación activos
- Actividad reciente del sistema

## Empresas (`/admin/companies`) — SUPER_ADMIN

Ver y gestionar todas las empresas en la plataforma:
- Listar todas las empresas con estado de suscripción
- Acceder a una empresa para ver sus usuarios, posiciones y actividad
- Editar los datos de la empresa si es necesario

## Usuarios (`/admin/users`)

Ver todos los usuarios de todas las empresas:
- Filtrar por rol, estado, empresa
- Crear nuevos usuarios manualmente
- Ver registros de actividad de usuarios
- Desactivar/reactivar usuarios (solo SUPER_ADMIN)

## Suscripciones (`/admin/subscriptions`)

Ver todas las suscripciones de empresas:
- Plan actual, estado, fechas de facturación
- MRR (Monthly Recurring Revenue) por empresa
- Filtrar por plan o estado
- Estadísticas resumidas (activos totales, en trial, con pago pendiente)

## Cuota de IA (`/admin/ai-quota`) — SUPER_ADMIN

Gestionar las cuotas de puntuación con IA por empresa:
- Buscar y seleccionar una empresa
- Ver su uso actual de IA (usado / límite / restante)
- Editar el límite mensual
- Establecer en `-1` para ilimitado

## Límites de Plan (`/admin/plan-limits`)

Configurar los límites de funcionalidades para cada nivel de suscripción (Free, Professional, Enterprise):
- Máximo de usuarios
- Máximo de posiciones de trabajo
- Máximo de candidatos por posición
- Límites de almacenamiento
- Créditos de puntuación con IA por mes
- Indicadores de funcionalidad (plantillas de correo, analíticas)

## Indicadores de Funcionalidad (`/admin/feature-flags`)

Activar/desactivar funcionalidades de forma global o por empresa:
- Habilitar/deshabilitar nuevas funcionalidades para un despliegue gradual
- Soporte para pruebas A/B
- Efecto inmediato — no se necesita reiniciar

## Planes Personalizados (`/admin/custom-plans`)

Crear niveles de suscripción personalizados para empresas específicas:
- Precios personalizados
- Asignación personalizada de funcionalidades
- Reemplaza los límites del plan estándar

## Configuración General (`/admin/general-settings`)

Configuración de toda la plataforma:
- Configuración del proveedor de correo
- Parámetros del sistema
- Valores predeterminados

## Configuración del Sistema (`/admin/settings`)

Configuración de bajo nivel del sistema:
- Configuración de base de datos
- Configuración de almacenamiento
- Limitación de velocidad
- Parámetros de seguridad

## Registros Eliminados (`/admin/deleted-records`)

Ver y restaurar entidades eliminadas de forma lógica:
- Candidatos, posiciones de trabajo, usuarios, etc.
- Restaurar registros eliminados accidentalmente
- Eliminar de forma permanente si es necesario

## Mensajes de Contacto (`/admin/contact-messages`)

Ver los envíos del formulario público `/contact`:
- Comentarios e inquietudes de usuarios
- Seguimiento de respuestas

## Webhooks (`/admin/webhooks`)

Configurar webhooks salientes hacia sistemas externos:
- Establecer URLs de destino
- Elegir qué eventos enviar
- Probar la entrega de webhooks
- Ver el historial de entregas y reintentar eventos fallidos
