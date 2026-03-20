# Posiciones de Trabajo

**Ruta:** `/hr/job-positions`
**Acceso:** HR, HR_MANAGER, COMPANY_OWNER, ADMIN, SUPER_ADMIN

Las Posiciones de Trabajo representan los roles abiertos en tu empresa. Son la base de todo el flujo de contratación — las solicitudes y los procesos de contratación siempre están vinculados a una posición de trabajo.

## Estados

| Estado | Significado |
|--------|---------|
| `OPEN` | Activo — visible en la página de empleo, acepta solicitudes |
| `CLOSED` | Ya no acepta nuevos candidatos |
| `CANCELLED` | Posición cancelada — archivada |

## Etapas (Plantilla del Pipeline de Contratación)

Cada posición de trabajo tiene una **plantilla de etapas** — una lista ordenada de pasos por los que pasa un candidato. Ejemplos:
- Llamada de selección
- Entrevista técnica
- Entrevista final
- Oferta

Cuando creas un proceso de contratación para un candidato, estas etapas se **copian** a ese proceso. Cada candidato tiene su propia copia independiente de las etapas.

### Campos de Etapa
- **Título** — Nombre de la etapa
- **Tipo** — Categoría (Entrevista, Evaluación, etc.)
- **Tiempo estimado** — Duración en días
- **Posición** — Orden en el pipeline

## Página de Empleo

Las posiciones de trabajo con estado `OPEN` y visibilidad pública se listan automáticamente en `/careers`. Los candidatos pueden postularse directamente desde allí.

## Página de Detalle

Al hacer clic en una posición de trabajo se abre la página de detalle (`/hr/job-positions/:uid`) que muestra:
- Todos los procesos de contratación activos para esta posición
- Pipeline de candidatos con la etapa actual
- Rankings de IA para todos los candidatos
- Métricas de conversión por etapa
