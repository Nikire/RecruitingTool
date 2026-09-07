# Puntuación con IA

**Acceso:** HR_MANAGER, COMPANY_OWNER, ADMIN, SUPER_ADMIN

Borderless utiliza **Google Gemini AI** para puntuar y clasificar automáticamente a los candidatos en función de su currículum y los requisitos del puesto.

## Cómo Funciona la Puntuación

1. El candidato debe tener un currículum subido
2. Haz clic en **"Analizar"** o **"Re-analizar"** en un candidato
3. Gemini AI lee el currículum y la descripción del puesto
4. Devuelve una **puntuación (0–100)** con un desglose detallado:
   - Coincidencia educativa
   - Relevancia de la experiencia
   - Alineación de habilidades
   - Otros criterios

## Dónde Usarlo

- **Página de Candidatos** — Puntuar candidatos individuales
- **Página de Procesos de Contratación** — Puntuar candidatos desde la vista de lista agrupada (ordenada por puntuación)
- **Detalle de Posición de Trabajo** — Ver todos los candidatos clasificados por puntuación de IA

## Puntuación en Lote

Desde la vista de procesos de contratación, puedes puntuar a todos los candidatos de una posición a la vez usando el botón de análisis en lote.

## Visualización de Puntuación

| Puntuación | Significado |
|-------|---------|
| 80–100 | Coincidencia sólida |
| 60–79 | Buena coincidencia |
| 40–59 | Coincidencia moderada |
| 0–39 | Coincidencia débil |

Las puntuaciones se muestran como chips de colores (verde/amarillo/naranja/rojo).

## Cuota de IA

Cada puntuación consume **1 crédito de IA** de la cuota mensual de tu empresa. La cuota depende del plan de suscripción:

| Plan | Créditos/Mes |
|------|-------------|
| Free | Limitado |
| Professional | Estándar |
| Enterprise | Alto |

> SUPER_ADMIN puede ver y ajustar las cuotas por empresa en `/admin/ai-quota`.

## Visibilidad de la Cuota

Los usuarios pueden ver su uso actual de IA en **Perfil → Suscripción** (`/profile/subscription`).
