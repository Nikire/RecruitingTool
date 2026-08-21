---
title: "¿Qué es un ATS? Guía para agencias de reclutamiento en LATAM"
slug: "que-es-un-ats-guia-agencias-latam"
description: "Qué es un ATS, qué no es, cómo funciona por dentro y en qué momento una agencia de reclutamiento en LATAM realmente necesita uno. Con el modelo de datos explicado, los mitos desarmados y un plan de implementación de dos semanas."
lang: "es"
publishedAt: "2026-08-20"
updatedAt: "2026-08-20"
keywords:
  - "qué es un ATS"
  - "ATS reclutamiento"
  - "sistema de seguimiento de candidatos"
  - "software de reclutamiento LATAM"
  - "cómo funciona un ATS"
canonical: "https://borderlessats.com/blog/que-es-un-ats-guia-agencias-latam"
author: "Equipo Borderless"
category: "guide"
readingTimeMinutes: 9
draft: false
---

Si buscaste "qué es un ATS" probablemente ya estés en una de estas dos situaciones: tenés una agencia de reclutamiento creciendo con Excel y WhatsApp y sospechás que hay una forma mejor, o un cliente te preguntó qué sistema usás y no supiste qué contestar.

Esta guía responde las dos cosas, sin humo.

## La definición corta

**ATS** son las siglas de _Applicant Tracking System_: sistema de seguimiento de candidatos. Es el software donde vive tu proceso de selección de punta a punta —la vacante, los postulantes, en qué etapa está cada uno, qué se le dijo a quién y cuándo, y qué pasó al final—.

La definición formal no dice mucho. La definición útil es esta: **un ATS es el lugar donde el estado de una búsqueda existe fuera de la cabeza de un reclutador.**

Ese es el punto entero. Si tu socio se va de vacaciones y nadie sabe en qué quedó el candidato de la búsqueda de backend semi senior, no tenés un problema de organización personal: te falta un ATS.

## Qué NO es un ATS

Acá se pierde mucho dinero, así que vale la pena ser explícito.

**No es una bolsa de trabajo.** Computrabajo, Bumeran, Zonajobs o LinkedIn son lugares donde publicás y desde donde llega gente. El ATS es donde esa gente se gestiona después. Son capas distintas.

**No es un software de nómina ni una suite de RRHH.** Factorial, Buk, Rippling y similares gestionan _empleados_: vacaciones, liquidación, desempeño, asistencia. Un ATS gestiona _candidatos_, que por definición todavía no son empleados de nadie. Si sos una agencia, gestionás candidatos de otras empresas, y una suite de RRHH no tiene el modelo de datos para eso.

**No es un CRM.** Un CRM administra la relación comercial con tus clientes —quién te debe una propuesta, qué cuenta hay que renovar—. Algunos ATS para agencias incorporan un módulo comercial, pero son funciones distintas.

**No es un robot que rechaza currículums.** Sobre esto hay que hablar aparte.

## El mito del CV rechazado automáticamente

Circula mucho la idea de que "los ATS descartan tu CV antes de que un humano lo vea" y de que hay que llenar el currículum de palabras clave invisibles para engañarlo.

En la práctica, la mayoría de los ATS **no rechazan a nadie automáticamente**. Lo que hacen es leer el CV, extraer datos estructurados (nombre, contacto, experiencia, habilidades) y ordenar o puntuar la lista para que el reclutador empiece por arriba. La decisión de descartar la toma una persona.

En Borderless, por ejemplo, la IA genera un puntaje y un ranking contra la vacante, y los pesos de ese puntaje —habilidades, experiencia, educación— los configura cada agencia y deben sumar 100. El sistema nunca cambia el estado de una postulación por su cuenta.

Vale la pena entender esto por dos razones: porque como agencia vas a tener que explicárselo a candidatos ansiosos, y porque te dice qué esperar de la herramienta. La IA te ahorra el orden de lectura, no el criterio.

## Cómo funciona por dentro: el modelo de datos

Todos los ATS serios comparten la misma estructura. Entenderla te permite evaluar cualquier producto en diez minutos.

**Vacante (o puesto).** El rol que estás buscando cubrir: título, descripción, modalidad, ubicación, rango salarial, requisitos. Es lo que se publica.

**Candidato.** La persona. Existe una sola vez, independientemente de a cuántas búsquedas se presente. Este punto es crítico en una agencia: la misma persona puede aparecer en tres búsquedas distintas a lo largo de dos años, y querés ver ese historial completo.

**Postulación.** El vínculo entre un candidato y una vacante en un momento dado, con su propio estado: pendiente, revisada, aceptada, rechazada.

**Proceso de selección.** El recorrido de ese candidato dentro de esa búsqueda.

**Etapas.** Los pasos del proceso. Acá hay un detalle de diseño que conviene mirar en cualquier demo: las etapas definidas en la vacante deberían funcionar como **plantilla**, y cada candidato debería recibir su **propia copia** al entrar. Si el sistema comparte las etapas entre candidatos, mover a uno altera el proceso de otro, y eso es un desastre silencioso.

En Borderless vienen 18 tipos de etapa: llamada de filtro, entrevista con RRHH, técnica, panel, grupal, presencial, caso de estudio, prueba para llevar a casa, evaluación de habilidades, revisión de portafolio, ajuste cultural, verificación de antecedentes, verificación de referencias, entrevista final, oferta y negociación salarial, entre otras.

## Qué problemas resuelve concretamente

### Deja de perderse gente

El costo real de no tener ATS no es la desorganización: es el candidato bueno que quedó sin respuesta y que no te vuelve a atender el teléfono. En un mercado chico —y todos los mercados de LATAM son chicos dentro de su vertical— tu reputación entre candidatos _es_ tu pipeline.

### La comunicación se vuelve automática y consistente

Un ATS con plantillas de correo manda la confirmación de postulación, la invitación a entrevista y —lo más importante— el rechazo. Con variables como `{{candidateName}}` y `{{positionTitle}}`, y con registro de todo lo enviado. Cuando el cliente pregunta si al candidato le avisaron, hay una respuesta.

### El agendamiento deja de consumir horas

Las herramientas modernas permiten **autoagendamiento**: generás tus horarios disponibles, el sistema arma un enlace, el candidato elige su turno en una página pública sin crear cuenta y el enlace de videollamada se crea solo. Es la función que más horas de coordinación devuelve.

### Aparecen números que le podés mostrar a un cliente

Tiempo de contratación, conversión por etapa del embudo, efectividad por fuente de origen. Sin un sistema, todo eso es una estimación. Con un sistema, es un reporte.

### Tenés un portal de empleos propio

Un ATS decente publica una página de vacantes pública, con detalle por puesto y postulación directa. Si además emite datos estructurados `JobPosting` correctos, esas vacantes pueden aparecer en la experiencia de empleos de Google —tráfico que no pagaste—. Lo explicamos en [nuestra guía técnica de JSON-LD](/blog/google-jobs-schema-json-ld-guide), y podés ver [vacantes reales publicadas con este formato acá](/jobs).

## ¿Cuándo lo necesitás de verdad?

Señales claras, en orden de gravedad:

1. **Manejás más de dos o tres búsquedas simultáneas.** Con una, la cabeza alcanza.
2. **Son más de dos personas.** Con dos y buena comunicación, el Excel aguanta. Con cuatro, no.
3. **Ya te pasó perder un candidato** por falta de seguimiento.
4. **Un cliente te pidió un reporte** y tuviste que armarlo a mano.
5. **Recibís postulaciones espontáneas** y no tenés dónde ponerlas.
6. **No podés responder** cuántos días tardás en promedio en cerrar una búsqueda.

Si marcaste tres o más, el ATS ya se paga solo.

## Cuánto cuesta y cómo se cobra

Hay dos modelos, y la diferencia importa más que el número.

**Por asiento (por reclutador, por mes).** Es el modelo dominante. Funciona bien con equipos estables. En una agencia tiene dos efectos molestos: la factura crece con cada persona que sumás, y desalienta meter al coordinador, al sourcer junior y al socio en el sistema —con lo cual el sistema deja de reflejar la realidad—.

**Plano por empresa.** Un precio fijo mensual sin importar cuánta gente entre.

Borderless usa el modelo plano: prueba de 30 días gratis (3 vacantes, 3 usuarios, 500 MB, 20 créditos de IA), **Professional a USD 79 por mes** (hasta 10 usuarios, 15 vacantes activas, 200 candidatos por vacante, 10 GB, 200 créditos de IA y panel de analíticas) y **Enterprise a USD 249 por mes** (sin límites, con API y soporte prioritario con SLA).

Hagas lo que hagas, corré la cuenta con la cantidad de gente que vas a tener en doce meses, no con la de hoy.

## Cómo implementarlo sin frenar la operación

El error clásico es querer migrar todo el histórico primero. Se convierte en un proyecto de fin de semana, se posterga, y el ATS queda vacío.

**Semana 1.** Elegí **una** búsqueda activa y armala completa: vacante, etapas, publicación en el portal, los candidatos que ya tenés en esa búsqueda. Nada más.

**Semana 2.** Hacé pasar todo por el sistema. Mandá los correos —incluido un rechazo—. Agendá una entrevista con el flujo de autoagendamiento. Al cierre, sacá el reporte del embudo.

**Después.** Si funcionó, sumá las demás búsquedas activas. El histórico viejo se importa por CSV cuando tengas tiempo, o nunca: su valor real suele ser menor al que uno cree.

---

Un ATS no te va a conseguir clientes ni va a entrevistar por vos. Lo que hace es que el estado de tus búsquedas exista fuera de la memoria de una persona, que ningún candidato se caiga del proceso en silencio y que tengas números para mostrar cuando te los pidan. Para una agencia que crece, eso deja de ser un lujo bastante antes de lo que uno espera.

Si querés probarlo con una búsqueda real, Borderless tiene 30 días gratis con la plataforma completa, en español y sin tarjeta.
