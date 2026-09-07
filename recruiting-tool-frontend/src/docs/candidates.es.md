# Candidatos

**Ruta:** `/hr/candidates`
**Acceso:** HR, HR_MANAGER, COMPANY_OWNER, ADMIN, SUPER_ADMIN

La página de Candidatos es el directorio central de todas las personas en tu pipeline de reclutamiento. Un candidato representa a una persona — no a una solicitud específica para una posición de trabajo.

## Qué Puedes Hacer

- **Ver todos los candidatos** en la base de datos de tu empresa
- **Crear un candidato** manualmente (nombre, email, teléfono)
- **Editar los datos** del candidato
- **Eliminar un candidato** (eliminación lógica)
- **Subir un currículum/CV** (PDF, DOC, DOCX, TXT — máximo 10 MB)
- **Agregar notas** visibles solo para el equipo de RRHH
- **Ver la línea de tiempo de actividad** con todas las acciones realizadas sobre un candidato
- **Puntuar al candidato con IA** respecto a una posición de trabajo
- **Crear un proceso de contratación** directamente desde el perfil del candidato

## Candidato vs. Solicitud

| Concepto | Descripción |
|---------|-------------|
| **Candidato** | Una persona en tu base de datos — reutilizable en múltiples posiciones |
| **Solicitud** | Un envío desde la página pública de empleo para un trabajo específico |
| **Proceso de contratación** | Una evaluación activa de un candidato para una posición de trabajo específica |

> Un candidato puede tener múltiples procesos de contratación (para distintas posiciones), pero solo UNO por posición a la vez.

## Puntuación con IA

Desde el perfil de un candidato, puedes hacer clic en **"Puntuar con IA"** para obtener una puntuación automatizada usando Google Gemini. La puntuación (0–100) refleja qué tan bien el currículum del candidato coincide con los requisitos del puesto.

> Requiere un currículum subido y descuenta de la cuota de IA de tu empresa.

## Carga de Archivos

Formatos admitidos: `PDF`, `DOC`, `DOCX`, `TXT`
Tamaño máximo: `10 MB`

Los archivos se almacenan de forma segura en MinIO (compatible con S3). Los enlaces expiran después de un período determinado por razones de seguridad.
