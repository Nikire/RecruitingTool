# Procesos de Contratación

**Ruta:** `/hr/hiring-processes`
**Acceso:** HR, HR_MANAGER, COMPANY_OWNER, ADMIN, SUPER_ADMIN

Un Proceso de Contratación representa la evaluación de un **candidato específico** para una **posición de trabajo específica**. Es el objeto central del flujo de trabajo que rastrea en qué punto del pipeline se encuentra un candidato.

## Cómo Funciona

1. Creas un proceso de contratación vinculando un **candidato** + **posición de trabajo**
2. El sistema copia la plantilla de etapas de la posición y crea instancias individuales de cada etapa
3. La primera etapa se establece como `CURRENT`
4. Avanzas al candidato por las etapas a medida que progresa
5. El proceso termina con el estado `CLOSED` (contratado), `REJECTED` o `CANCELLED`

> **Restricción:** Solo puede haber un proceso de contratación activo por candidato por posición de trabajo.

## Estados

| Estado | Significado |
|--------|---------|
| `OPEN` | Recién creado, sin iniciar |
| `IN_PROGRESS` | En evaluación activa |
| `CLOSED` | Candidato contratado / proceso completado |
| `REJECTED` | Candidato rechazado |
| `CANCELLED` | Proceso cancelado |

## Estados de Etapa

| Estado | Significado |
|--------|---------|
| `CURRENT` | Etapa activa en la que se encuentra el candidato |
| `DONE` | Etapa completada |
| `CANCELLED` | Etapa omitida / cancelada |

## Acciones de Etapa

Desde un proceso de contratación, puedes:
- **Programar una entrevista** para la etapa actual
- **Agregar una nota de etapa** — califica y describe el desempeño del candidato
- **Avanzar a la siguiente etapa** — marcar la etapa actual como DONE y pasar a la siguiente
- **Rechazar al candidato** — finalizar el proceso

## Puntuación con IA en Procesos de Contratación

La vista de lista agrupada muestra las puntuaciones de IA por candidato (si han sido puntuados). Puedes:
- **Analizar** — Puntuar a un candidato por primera vez
- **Re-analizar** — Volver a puntuar a un candidato ya puntuado
- Ordenar candidatos por puntuación para priorizar

> Solo HR_MANAGER, COMPANY_OWNER, ADMIN, SUPER_ADMIN pueden activar la puntuación.
