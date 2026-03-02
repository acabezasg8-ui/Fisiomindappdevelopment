import OpenAI from "openai";

const MAX_HISTORY_MESSAGES = 12;
const MODEL = "gpt-4o-mini";

// ============================
// KB MSK (TU MISMA KB)
// ============================
const KB_MS = {
  version: "1.0",
  frameworks: {
    SOBRECARGA_MECANICA: {
      label: "Sobrecarga mecánica tisular",
      forbidden_tokens: ["fiebre", "pérdida de peso", "esfínteres", "anestesia en silla de montar"],
      pain_profile: "mecanico",
    },
    LESION_MUSCULAR_SIMPLE: {
      label: "Lesión muscular estructural simple",
      forbidden_tokens: ["fiebre", "pérdida de peso", "esfínteres"],
      pain_profile: "mecanico",
    },
    DISFUNCION_MECANICA: {
      label: "Disfunción articular mecánica",
      forbidden_tokens: ["fiebre", "pérdida de peso", "esfínteres"],
      pain_profile: "mecanico",
    },
    COMPRESION_NEURAL_LEVE: {
      label: "Compresión neural periférica leve",
      forbidden_tokens: ["fiebre", "pérdida de control de esfínteres", "anestesia en silla de montar"],
      pain_profile: "neuro_mixto",
    },
    INFLAMACION_LOCAL: {
      label: "Inflamación local no sistémica",
      forbidden_tokens: ["fiebre", "pérdida de peso", "escalofríos"],
      pain_profile: "mecanico_local",
    },
    DEGENERACION_LEVE: {
      label: "Degeneración articular leve",
      forbidden_tokens: ["fiebre", "pérdida de peso", "escalofríos"],
      pain_profile: "mecanico_rigidez",
    },
    INESTABILIDAD_FUNCIONAL: {
      label: "Inestabilidad funcional",
      forbidden_tokens: ["fiebre", "pérdida de peso"],
      pain_profile: "mecanico",
    },
  },
  regions: {
    // ... (TU MISMA KB_MS.regions ENTERA)
    // ✅ Mantén tal cual todo lo que ya pegaste (HOMBRO, RODILLA, etc.)
  },
};

// ============================
// KB NEURO (BÁSICA, AMPLIARÁS LUEGO)
// ============================
const KB_NEURO = {
  version: "0.1",
  frameworks: {
    DEFICIT_NEURO_LEVE: {
      label: "Déficit neurológico leve no agudo",
      forbidden_tokens: ["debut súbito hoy", "pérdida de consciencia", "cefalea en trueno", "convulsiones", "fiebre alta"],
      profile: "neuro_leve",
    },
    DOLOR_NEUROPATICO_PERIFERICO_LEVE: {
      label: "Síntomas neuropáticos periféricos leves",
      forbidden_tokens: ["pérdida de fuerza progresiva severa", "caídas frecuentes sin causa", "incontinencia reciente"],
      profile: "neuropatico",
    },
    VESTIBULAR_LEVE: {
      label: "Mareo/vertigo periférico leve",
      forbidden_tokens: ["debut súbito con signos neurológicos", "diplopía", "disartria", "ataxia severa"],
      profile: "vestibular",
    },
  },
  topics: {
    // “topics” en lugar de regiones para simplificar
    NEURO_PERIFERICO: {
      allowed_frameworks: ["DOLOR_NEUROPATICO_PERIFERICO_LEVE"],
      pathologies: {
        SINTOMAS_TUNEL_CARPiano_LEVE: {
          frameworks: ["DOLOR_NEUROPATICO_PERIFERICO_LEVE"],
          patient_story: {
            location: ["mano y muñeca", "dedos pulgar-índice-medio"],
            onset: ["progresivo, semanas-meses"],
            aggravating: ["usar mucho el móvil/teclado", "por la noche"],
            relieving: ["sacudir la mano", "cambiar postura"],
            night: ["me despierta a veces con hormigueo"],
          },
        },
        NEURALGIA_CUBITAL_LEVE: {
          frameworks: ["DOLOR_NEUROPATICO_PERIFERICO_LEVE"],
          patient_story: {
            location: ["codo y antebrazo", "meñique y anular"],
            onset: ["progresivo"],
            aggravating: ["apoyar el codo", "flexionar el codo mucho rato"],
            relieving: ["dejar de apoyar", "estirar el brazo"],
            night: ["a veces hormiguea por la noche"],
          },
        },
      },
      forbidden_extra: ["ictus agudo", "síndrome de cola de caballo"],
    },
    NEURO_CENTRAL_LEVE: {
      allowed_frameworks: ["DEFICIT_NEURO_LEVE"],
      pathologies: {
        SECUELAS_ICTUS_LEVES_CRONICAS: {
          frameworks: ["DEFICIT_NEURO_LEVE"],
          patient_story: {
            location: ["un lado del cuerpo (ligero)", "mano/pie"],
            onset: ["hace meses/años, no es de hoy"],
            aggravating: ["fatiga", "actividades largas"],
            relieving: ["descansar", "hacerlo con calma"],
            night: ["no es lo principal"],
          },
        },
      },
      forbidden_extra: ["ictus agudo hoy", "signos de alarma neurológicos agudos"],
    },
    VESTIBULAR: {
      allowed_frameworks: ["VESTIBULAR_LEVE"],
      pathologies: {
        VERTIGO_POSICIONAL_LEVE: {
          frameworks: ["VESTIBULAR_LEVE"],
          patient_story: {
            location: ["cabeza (mareo)", "sensación de giro"],
            onset: ["episódico, días-semanas"],
            aggravating: ["girar en la cama", "mirar hacia arriba"],
            relieving: ["quedarme quieto", "pasar unos segundos"],
            night: ["si me giro en la cama"],
          },
        },
      },
      forbidden_extra: ["signos neurológicos centrales"],
    },
  },
};

// ============================
// KB RESPI (BÁSICA, AMPLIARÁS LUEGO)
// ============================
const KB_RESPI = {
  version: "0.1",
  frameworks: {
    DESACONDICIONAMIENTO: {
      label: "Desacondicionamiento y disnea de esfuerzo",
      forbidden_tokens: ["dolor torácico opresivo", "síncope", "hemoptisis", "fiebre alta persistente"],
      profile: "disnea_esfuerzo",
    },
    ASMA_LEVE_CONTROLABLE: {
      label: "Asma leve con síntomas desencadenados",
      forbidden_tokens: ["disnea en reposo severa", "cianosis", "uso de musculatura accesoria marcado"],
      profile: "asma",
    },
    EPOC_LEVE_ESTABLE: {
      label: "EPOC leve estable",
      forbidden_tokens: ["exacerbación grave", "fiebre alta", "confusión"],
      profile: "epoc",
    },
  },
  topics: {
    RESPI_GENERAL: {
      allowed_frameworks: ["DESACONDICIONAMIENTO", "ASMA_LEVE_CONTROLABLE", "EPOC_LEVE_ESTABLE"],
      pathologies: {
        POST_INFECCION_DESACOND: {
          frameworks: ["DESACONDICIONAMIENTO"],
          patient_story: {
            location: ["pecho (sensación de falta de aire)", "cansancio general"],
            onset: ["desde hace semanas"],
            aggravating: ["subir escaleras", "andar rápido"],
            relieving: ["parar y respirar", "ir más lento"],
            night: ["no suele despertarme"],
          },
        },
        ASMA_EJERCICIO_LEVE: {
          frameworks: ["ASMA_LEVE_CONTROLABLE"],
          patient_story: {
            location: ["pecho (opresión ligera)", "sensación de pitidos"],
            onset: ["episódico"],
            aggravating: ["ejercicio intenso", "frío"],
            relieving: ["descansar", "respirar tranquilo"],
            night: ["a veces tos nocturna leve"],
          },
        },
        EPOC_LEVE_ESTABLE: {
          frameworks: ["EPOC_LEVE_ESTABLE"],
          patient_story: {
            location: ["disnea al esfuerzo", "tos ocasional"],
            onset: ["meses-años"],
            aggravating: ["cuestas", "cargar peso"],
            relieving: ["ritmo suave", "parar"],
            night: ["variable, no principal"],
          },
        },
      },
      forbidden_extra: ["neumonía grave", "embolia pulmonar"],
    },
  },
};

// ----------- helpers: JSON response -----------
function json(statusCode, payload) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  };
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];
  const cleaned = history
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .map((m) => ({ role: m.role, content: m.content.trim() }));
  return cleaned.slice(-MAX_HISTORY_MESSAGES);
}

// ----------- deterministic selector (seed) -----------
function hashStringToInt(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}
function pickOne(arr, seedInt) {
  if (!arr.length) return null;
  const idx = seedInt % arr.length;
  return arr[idx];
}

/**
 * pickCaseSpecGeneric:
 * - Similar a tu pickCaseSpec pero soporta “KB con regions” (MSK) o “KB con topics” (NEURO/RESPI).
 */
function pickCaseSpecGeneric({
  kb,
  regionOrTopic,
  framework,
  pathology,
  seed = "default",
  difficulty = "basico",
}) {
  const difficultyTag = ["basico", "intermedio"].includes(difficulty) ? difficulty : "basico";

  // KB tipo MSK (regions)
  const hasRegions = !!kb.regions;
  const pool = hasRegions ? kb.regions : kb.topics;

  // 1) Region/Topic
  let pickedKey = regionOrTopic && pool[regionOrTopic] ? regionOrTopic : null;
  if (!pickedKey) {
    const keys = Object.keys(pool);
    pickedKey = pickOne(keys, hashStringToInt(seed));
  }
  const node = pool[pickedKey];

  // 2) Framework
  let pickedFramework = framework && node.allowed_frameworks?.includes(framework) ? framework : null;
  if (!pickedFramework) {
    pickedFramework = pickOne(node.allowed_frameworks || [], hashStringToInt(seed + "|fw|" + pickedKey));
  }

  // 3) Pathology
  const pathologyKeys = Object.keys(node.pathologies || {});
  let pickedPathology = pathology && node.pathologies?.[pathology] ? pathology : null;

  if (pickedPathology) {
    const allowedFws = node.pathologies[pickedPathology].frameworks || [];
    if (pickedFramework && !allowedFws.includes(pickedFramework)) pickedPathology = null;
  }

  if (!pickedPathology) {
    const compatible = pathologyKeys.filter((p) =>
      (node.pathologies[p].frameworks || []).includes(pickedFramework)
    );
    pickedPathology = pickOne(
      (compatible.length ? compatible : pathologyKeys),
      hashStringToInt(seed + "|px|" + pickedKey + "|" + pickedFramework)
    );
  }

  const px = node.pathologies[pickedPathology] || {};
  const fw = kb.frameworks[pickedFramework] || {};

  return {
    kb_version: kb.version,
    region_or_topic: pickedKey,
    framework: pickedFramework,
    pathology: pickedPathology,
    difficulty: difficultyTag,
    forbidden: [
      ...(fw?.forbidden_tokens || []),
      ...(node?.forbidden_extra || []),
    ],
    patient_story: px?.patient_story || {},
    framework_label: fw?.label || pickedFramework,
    kb_kind: hasRegions ? "regions" : "topics",
  };
}

function buildInternalPatientBrief(spec) {
  const ps = spec.patient_story || {};
  return `
HISTORIA INTERNA DEL CASO (NO REVELAR AL ALUMNO)
- KB version: ${spec.kb_version}
- Contexto: ${spec.kb_kind === "regions" ? "Región" : "Tema"} = ${spec.region_or_topic}
- Marco fisiopatológico: ${spec.framework_label} (${spec.framework})
- Patología objetivo (NO decirla): ${spec.pathology}
- Dificultad: ${spec.difficulty}

PATRÓN DE RELATO (elige y mantén consistencia)
- Localización típica (elige 1): ${JSON.stringify(ps.location || [])}
- Inicio (elige 1): ${JSON.stringify(ps.onset || [])}
- Agravantes (elige 2 máx): ${JSON.stringify(ps.aggravating || [])}
- Alivio (elige 1–2): ${JSON.stringify(ps.relieving || [])}
- Noche/mañana (elige 1 máx): ${JSON.stringify(ps.night || [])}

RESTRICCIONES DURAS (NO introducir salvo que el alumno pregunte y sea compatible)
- Prohibidos/Red flags no incluidos: ${JSON.stringify(spec.forbidden)}

REGLA DE COHERENCIA
- No cambies cronología, localización, ni patrón de agravantes/alivio durante la conversación.
- Si el alumno pregunta por red flags del listado prohibido: responde NEGÁNDOLOS, salvo que se te hubiera indicado lo contrario (aquí NO se incluyen).
`.trim();
}

function buildScopeRules(trainingConfig) {
  const stage = trainingConfig?.stage || "ANAMNESIS_VALORACION_TRATAMIENTO";
  const academicLevel = trainingConfig?.academicLevel;
  const area = trainingConfig?.area;

  const levelLine = academicLevel ? `- Nivel del alumno: ${academicLevel}º (ajusta complejidad del lenguaje).` : "";

  if (stage === "ANAMNESIS") {
    return `
ALCANCE DEL ENTRENAMIENTO: SOLO ANAMNESIS
- NO reveles resultados de exploración física estructurada, pruebas, test especiales, imagen, constantes, ni “hallazgos objetivos”.
- NO hables de tratamiento. Si el alumno pregunta “qué harías”: responde como paciente (“no lo sé, eso me lo dirás tú/usted”) o “eso lo vería el fisio tras valorarme”.
- Puedes describir síntomas y limitación funcional, y responder a preguntas de historia clínica.
${levelLine}
- Área seleccionada: ${area || "cualquiera"}.
`.trim();
  }

  if (stage === "ANAMNESIS_VALORACION") {
    return `
ALCANCE DEL ENTRENAMIENTO: ANAMNESIS + VALORACIÓN
- Puedes aportar información orientada a valoración SOLO si el alumno la solicita explícitamente (p. ej. movilidad, gestos funcionales, “cuando lo muevo pasa X”).
- No inventes pruebas complejas. Mantén “hallazgos simples” y en lenguaje de paciente.
- NO propongas tratamiento ni ejercicios.
${levelLine}
- Área seleccionada: ${area || "cualquiera"}.
`.trim();
  }

  return `
ALCANCE DEL ENTRENAMIENTO: ANAMNESIS + VALORACIÓN + TRATAMIENTO
- Responde como paciente, pero permite que el alumno explore (hallazgos simples si los pide).
- El tratamiento lo propone el alumno: tú solo comentas preferencias, miedos, objetivos, barreras y adherencia.
${levelLine}
- Área seleccionada: ${area || "cualquiera"}.
`.trim();
}

function pickKBByArea(area) {
  if (area === "NEURO") return KB_NEURO;
  if (area === "RESPI") return KB_RESPI;
  return KB_MS; // default
}

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }
    if (!process.env.OPENAI_API_KEY) {
      return json(500, { error: "OPENAI_API_KEY missing" });
    }

    const body = JSON.parse(event.body || "{}");
    const {
      mode,
      action,
      message,
      history = [],
      region,
      framework,
      pathology,
      seed,
      difficulty,

      // ✅ NUEVO
      trainingConfig, // {stage, area, academicLevel}
    } = body;

    if (!mode || typeof mode !== "string") return json(400, { error: "Falta 'mode' (string)" });
    if (!action || typeof action !== "string") return json(400, { error: "Falta 'action' (string)" });
    if (!message || typeof message !== "string") return json(400, { error: "Falta 'message' (string)" });

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    let systemPrompt = "";
    let temperature = 0.25;
    let max_output_tokens = 600;

    switch (mode) {
      case "casos_libres": {
        if (action === "paciente") {
          // ✅ Escoger KB por área (si viene)
          const kb = pickKBByArea(trainingConfig?.area);

          // ✅ Seed estable (si no viene, fallback)
          const stableSeed = typeof seed === "string" && seed.trim() ? seed.trim() : "default";

          // ✅ pick coherente (region solo aplica en MSK; en NEURO/RESPI se interpreta como topic)
          const caseSpec = pickCaseSpecGeneric({
            kb,
            regionOrTopic: region,
            framework,
            pathology,
            seed: stableSeed,
            difficulty: difficulty || "basico",
          });

          const internalBrief = buildInternalPatientBrief(caseSpec);
          const scopeRules = buildScopeRules(trainingConfig);

          systemPrompt = `
Eres un PACIENTE real en una consulta de fisioterapia. Estás respondiendo a un estudiante.

OBJETIVO
- Responder de forma realista, coherente y humana a preguntas clínicas.
- NO enseñar, NO diagnosticar, NO sugerir pruebas ni tratamiento por iniciativa propia.

PERSONA Y TONO
- Habla como paciente (lenguaje cotidiano, sin tecnicismos).
- Respuestas breves (1–4 frases), salvo que te pidan detalles concretos.
- Si te preguntan por escalas (0–10), da un número y explica en una frase.

REGLAS DURAS (OBLIGATORIAS)
- No digas diagnósticos ni nombres de patologías.
- No te pongas en modo profesor.
- No “adelantes” información no solicitada.
- Si no sabes/no recuerdas: di “no estoy seguro/a” o “no me acuerdo”.

COHERENCIA
- Mantén el mismo relato (cronología, localización, irradiación, factores) durante toda la conversación.
- Si el estudiante pregunta lo mismo, responde coherente (puedes variar mínimamente el texto, no el contenido).

${scopeRules}

SALIDA
- Responde SOLO como paciente. No uses listas a menos que el alumno pida “enumera”.

${internalBrief}
`.trim();

          temperature = 0.2;
          max_output_tokens = 380;
          break;
        }

        if (action === "evaluar") {
          // (tu prompt evaluador lo dejo prácticamente igual)
          systemPrompt = `
Eres un DOCENTE EVALUADOR universitario experto en fisioterapia clínica.
Tu tarea es evaluar el desempeño del alumno en este caso clínico.

COMPETENCIAS A EVALUAR (0–100)
- anamnesis
- exploracion
- razonamiento_clinico
- tratamiento
- comunicacion

REGLAS DURAS
- Devuelve EXCLUSIVAMENTE JSON válido. Sin texto adicional. Sin markdown.
- Scores enteros 0–100.
- Feedback por competencia: 1–2 frases, accionable y específico.
- Si falta información para puntuar una competencia: NO inventes. Puntúa conservador y explica lo que faltó.

FORMATO JSON EXACTO
{
  "competencias": [
    { "id": "anamnesis", "score": 0, "feedback": "..." },
    { "id": "exploracion", "score": 0, "feedback": "..." },
    { "id": "razonamiento_clinico", "score": 0, "feedback": "..." },
    { "id": "tratamiento", "score": 0, "feedback": "..." },
    { "id": "comunicacion", "score": 0, "feedback": "..." }
  ],
  "global": { "score": 0, "resumen": "..." }
}
`.trim();
          temperature = 0.2;
          max_output_tokens = 550;
          break;
        }

        return json(400, { error: "Action inválida para casos_libres. Usa 'paciente' o 'evaluar'." });
      }

      case "examen": {
        systemPrompt = `
Eres EXAMINADOR de fisioterapia. Generas o corriges casos tipo examen.

REGLAS GENERALES
- No inventes estudios/citas, guías, porcentajes o referencias.
- Mantén coherencia clínica (síntomas, hallazgos, curso temporal).
- Lenguaje claro y evaluable.
`.trim();
        temperature = 0.35;
        max_output_tokens = 850;
        break;
      }

      case "estudio": {
        systemPrompt = `
Eres un TUTOR ACADÉMICO de fisioterapia.

REGLAS DURAS
- Si la información NO está en el contexto aportado, dilo explícitamente.
- No inventes citas, páginas, autores, porcentajes.
`.trim();
        temperature = 0.2;
        max_output_tokens = 700;
        break;
      }

      case "progreso": {
        systemPrompt = `
Eres un analista docente. Evalúas el PROGRESO del alumno a partir de casos previos.

SALIDA (SIEMPRE)
1) Fortalezas (3 bullets)
2) Debilidades (3 bullets)
3) Patrones detectados (2–4 bullets)
4) Plan de mejora 7 días
5) Recomendación de 3 casos siguientes
`.trim();
        temperature = 0.25;
        max_output_tokens = 700;
        break;
      }

      default:
        return json(400, { error: "Modo inválido" });
    }

    const trimmedHistory = normalizeHistory(history);

    const messages = [
      { role: "system", content: systemPrompt.trim() },
      ...trimmedHistory,
      { role: "user", content: message.trim() },
    ];

    const resp = await client.responses.create({
      model: MODEL,
      input: messages,
      temperature,
      max_output_tokens,
    });

    const output = (resp.output_text || "").trim();

    if (mode === "casos_libres" && action === "evaluar") {
      try {
        const evaluation = JSON.parse(output);
        return json(200, { evaluation });
      } catch {
        return json(200, {
          evaluation: null,
          error: "La IA no devolvió JSON válido en evaluación.",
          raw: output,
        });
      }
    }

    return json(200, { reply: output });
  } catch (err) {
    console.error("FUNCTION ERROR:", err);
    const status = err?.status || err?.response?.status || 500;
    return json(status, {
      error: err?.response?.data?.error?.message || err?.message || "Error interno",
    });
  }
};
