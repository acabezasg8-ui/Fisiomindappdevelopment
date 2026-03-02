import OpenAI from "openai";

// Ajustes simples para estabilidad/coste
const MAX_HISTORY_MESSAGES = 12; // recorta historial (últimos N mensajes)
const MODEL = "gpt-4o-mini";

/**
 * ============================
 * KB: Marcos fisiopatológicos (MSK) + Regiones
 * ============================
 * - frameworks: códigos internos (no se revelan al alumno)
 * - allowed_pathologies: catálogo cerrado
 * - patient_story: síntomas típicos que el "paciente" puede relatar
 * - exam_hints: cosas que suelen salir en exploración (el paciente NO las propone)
 * - forbidden: cosas que NO deben aparecer (salvo que se metan explícitamente en el caso)
 */
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
    HOMBRO: {
      allowed_frameworks: [
        "SOBRECARGA_MECANICA",
        "INFLAMACION_LOCAL",
        "DISFUNCION_MECANICA",
        "INESTABILIDAD_FUNCIONAL",
      ],
      pathologies: {
        TENDINOPATIA_SUPRAESPINOSO: {
          frameworks: ["SOBRECARGA_MECANICA"],
          patient_story: {
            location: ["parte lateral del hombro", "zona del deltoides"],
            aggravating: ["levantar el brazo", "coger peso con el brazo separado", "ponerme la chaqueta"],
            relieving: ["reposo", "bajar el brazo", "evitar cargar"],
            onset: ["progresivo", "tras semanas de más carga"],
            night: ["a veces me molesta al dormir sobre ese lado", "me despierta si me pongo encima"],
          },
        },
        BURSITIS_SUBACROMIAL: {
          frameworks: ["INFLAMACION_LOCAL"],
          patient_story: {
            location: ["parte lateral del hombro"],
            aggravating: ["levantar el brazo", "movimientos repetidos por encima de la cabeza"],
            relieving: ["reposo", "evitar gestos repetidos"],
            onset: ["progresivo", "tras varios días de sobreuso"],
            night: ["molesta al dormir de ese lado"],
          },
        },
        SINDROME_SUBACROMIAL: {
          frameworks: ["DISFUNCION_MECANICA", "SOBRECARGA_MECANICA"],
          patient_story: {
            location: ["parte anterior y lateral del hombro"],
            aggravating: ["arco al levantar el brazo", "alcanzar estanterías"],
            relieving: ["reposo", "cambiar postura"],
            onset: ["progresivo"],
            night: ["molestia nocturna mecánica"],
          },
        },
        DISQUINESIA_ESCAPULAR: {
          frameworks: ["DISFUNCION_MECANICA"],
          patient_story: {
            location: ["zona del hombro y omóplato", "entre escápula y columna"],
            aggravating: ["mucho ordenador", "entrenar hombro/pecho", "levantar el brazo repetido"],
            relieving: ["descanso", "cambiar postura", "calor suave"],
            onset: ["progresivo"],
            night: ["no suele despertarme, pero me deja incómodo"],
          },
        },
        INESTABILIDAD_LEVE: {
          frameworks: ["INESTABILIDAD_FUNCIONAL"],
          patient_story: {
            location: ["hombro (sensación interna)"],
            aggravating: ["gestos rápidos", "lanzar", "poner el brazo atrás"],
            relieving: ["evitar posiciones raras", "movimientos lentos"],
            onset: ["episódico", "desde hace meses"],
            night: ["a veces si duermo mal colocado"],
          },
        },
      },
      forbidden_extra: ["rotura masiva", "luxación recidivante grave", "artritis reumatoide"],
    },

    RODILLA: {
      allowed_frameworks: ["SOBRECARGA_MECANICA", "DISFUNCION_MECANICA", "DEGENERACION_LEVE", "INFLAMACION_LOCAL"],
      pathologies: {
        TENDINOPATIA_ROTULIANA: {
          frameworks: ["SOBRECARGA_MECANICA"],
          patient_story: {
            location: ["debajo de la rótula", "tendón rotuliano"],
            aggravating: ["saltos", "bajar escaleras", "sentadillas", "correr"],
            relieving: ["reposo relativo", "bajar carga", "evitar saltar"],
            onset: ["progresivo", "tras aumentar entrenos"],
            night: ["no suele ser lo principal", "a veces si he cargado mucho"],
          },
        },
        SINDROME_FEMOROPATELAR: {
          frameworks: ["DISFUNCION_MECANICA", "SOBRECARGA_MECANICA"],
          patient_story: {
            location: ["parte delantera de la rodilla", "alrededor de la rótula"],
            aggravating: ["escaleras", "estar mucho rato sentado", "ponerse en cuclillas"],
            relieving: ["estirar la pierna", "cambiar postura", "reposo"],
            onset: ["progresivo"],
            night: ["normalmente no"],
          },
        },
        GONARTROSIS_LEVE: {
          frameworks: ["DEGENERACION_LEVE"],
          patient_story: {
            location: ["rodilla (difuso)", "zona interna a veces"],
            aggravating: ["caminar mucho", "estar de pie", "bajar escaleras"],
            relieving: ["descanso", "mover un poco al principio", "calor"],
            onset: ["lento, meses/años"],
            night: ["rigidez más que dolor", "a veces molesta al final del día"],
          },
        },
        BURSITIS_PRERROTULIANA: {
          frameworks: ["INFLAMACION_LOCAL"],
          patient_story: {
            location: ["encima de la rótula", "zona superficial de delante"],
            aggravating: ["arrodillarme", "presionar la zona"],
            relieving: ["evitar apoyar", "reposo"],
            onset: ["tras apoyar mucho la rodilla", "días-semanas"],
            night: ["solo si presiono sin querer"],
          },
        },
      },
      forbidden_extra: ["rotura LCA completa", "artritis séptica", "derrame masivo"],
    },

    TOBILLO_PIE: {
      allowed_frameworks: ["INESTABILIDAD_FUNCIONAL", "SOBRECARGA_MECANICA", "INFLAMACION_LOCAL", "LESION_MUSCULAR_SIMPLE"],
      pathologies: {
        ESGUINCE_LATERAL_LEVE: {
          frameworks: ["INESTABILIDAD_FUNCIONAL", "INFLAMACION_LOCAL"],
          patient_story: {
            location: ["parte externa del tobillo"],
            aggravating: ["caminar rápido", "terreno irregular", "girar el pie"],
            relieving: ["reposo", "elevar", "evitar torcer"],
            onset: ["agudo tras torcedura", "hace días-semanas"],
            night: ["si se hincha, me molesta un poco"],
          },
        },
        INESTABILIDAD_FUNCIONAL_TOBILLO: {
          frameworks: ["INESTABILIDAD_FUNCIONAL"],
          patient_story: {
            location: ["tobillo externo", "sensación de fallo"],
            aggravating: ["terreno irregular", "deporte", "bajar bordillos"],
            relieving: ["ir con cuidado", "calzado estable"],
            onset: ["repetido desde varios esguinces", "meses"],
            night: ["no suele"],
          },
        },
        TENDINOPATIA_AQUILEA: {
          frameworks: ["SOBRECARGA_MECANICA"],
          patient_story: {
            location: ["tendón de Aquiles", "parte de atrás del tobillo"],
            aggravating: ["correr", "subir cuestas", "ponerme de puntillas"],
            relieving: ["reposo relativo", "bajar carga"],
            onset: ["progresivo", "tras aumentar entreno"],
            night: ["rigidez al levantarme", "mejora al mover"],
          },
        },
        FASCITIS_PLANTAR: {
          frameworks: ["SOBRECARGA_MECANICA"],
          patient_story: {
            location: ["talón por debajo", "planta del pie"],
            aggravating: ["primeros pasos por la mañana", "estar mucho de pie"],
            relieving: ["caminar un poco y se pasa", "descanso"],
            onset: ["progresivo"],
            night: ["no, es más al empezar a caminar"],
          },
        },
      },
      forbidden_extra: ["trombosis", "rotura aquílea completa", "fractura"],
    },

    LUMBAR: {
      allowed_frameworks: ["DISFUNCION_MECANICA", "COMPRESION_NEURAL_LEVE", "DEGENERACION_LEVE"],
      pathologies: {
        LUMBALGIA_MECANICA: {
          frameworks: ["DISFUNCION_MECANICA"],
          patient_story: {
            location: ["zona baja de la espalda"],
            aggravating: ["agacharme", "estar mucho rato sentado", "coger peso"],
            relieving: ["cambiar postura", "andar un poco", "reposo relativo"],
            onset: ["tras mala postura o carga", "progresivo o tras esfuerzo"],
            night: ["no suele, salvo postura mala"],
          },
        },
        RADICULOPATIA_LUMBAR_LEVE: {
          frameworks: ["COMPRESION_NEURAL_LEVE"],
          patient_story: {
            location: ["lumbar y pierna", "dolor que baja por la pierna"],
            aggravating: ["sentarme mucho", "inclinarme", "coger peso"],
            relieving: ["andar", "cambiar postura", "tumbarme"],
            onset: ["subagudo", "semanas"],
            night: ["a veces molesta si estoy mucho rato quieto"],
          },
        },
        ESPONDILOARTROSIS_LEVE: {
          frameworks: ["DEGENERACION_LEVE"],
          patient_story: {
            location: ["lumbar difuso"],
            aggravating: ["estar de pie mucho rato", "final del día"],
            relieving: ["moverme suave", "calor"],
            onset: ["lento, meses/años"],
            night: ["rigidez más que dolor"],
          },
        },
      },
      forbidden_extra: ["esfínteres", "anestesia en silla de montar", "fiebre persistente"],
    },

    CERVICAL: {
      allowed_frameworks: ["DISFUNCION_MECANICA", "COMPRESION_NEURAL_LEVE"],
      pathologies: {
        CERVICALGIA_MECANICA: {
          frameworks: ["DISFUNCION_MECANICA"],
          patient_story: {
            location: ["cuello", "zona de trapecios"],
            aggravating: ["ordenador", "mirar el móvil", "girar el cuello"],
            relieving: ["cambiar postura", "descansar", "calor suave"],
            onset: ["progresivo"],
            night: ["si duermo mal, al día siguiente peor"],
          },
        },
        RADICULOPATIA_CERVICAL_LEVE: {
          frameworks: ["COMPRESION_NEURAL_LEVE"],
          patient_story: {
            location: ["cuello y brazo", "hormigueo que baja al brazo"],
            aggravating: ["postura mantenida", "girar el cuello"],
            relieving: ["cambiar postura", "apoyar el brazo", "descanso relativo"],
            onset: ["subagudo"],
            night: ["a veces hormiguea por la noche"],
          },
        },
      },
      forbidden_extra: ["mielopatía", "pérdida de fuerza progresiva severa"],
    },

    CADERA: {
      allowed_frameworks: ["SOBRECARGA_MECANICA", "INFLAMACION_LOCAL", "DEGENERACION_LEVE", "DISFUNCION_MECANICA"],
      pathologies: {
        DOLOR_TROCANTERICO: {
          frameworks: ["SOBRECARGA_MECANICA", "INFLAMACION_LOCAL"],
          patient_story: {
            location: ["lado de la cadera", "trocánter"],
            aggravating: ["subir escaleras", "andar mucho", "tumbarme de ese lado"],
            relieving: ["evitar ese lado al dormir", "reposo"],
            onset: ["progresivo"],
            night: ["sí, por dormir encima"],
          },
        },
        COXARTROSIS_LEVE: {
          frameworks: ["DEGENERACION_LEVE"],
          patient_story: {
            location: ["ingle", "cadera por delante"],
            aggravating: ["caminar mucho", "levantarme de la silla", "ponerme calcetines"],
            relieving: ["descanso", "calentar un poco"],
            onset: ["lento"],
            night: ["rigidez más que dolor"],
          },
        },
        TENDINOPATIA_ILIOPSOAS_LEVE: {
          frameworks: ["SOBRECARGA_MECANICA"],
          patient_story: {
            location: ["ingle", "parte anterior de la cadera"],
            aggravating: ["subir escaleras", "levantar la rodilla", "correr"],
            relieving: ["reposo relativo"],
            onset: ["progresivo"],
            night: ["no suele"],
          },
        },
      },
      forbidden_extra: ["fractura", "necrosis avascular", "artritis séptica"],
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
  // Esperamos [{role:"user"|"assistant", content:"..."}]
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

  // Recorte al final (más reciente)
  return cleaned.slice(-MAX_HISTORY_MESSAGES);
}

// ----------- deterministic selector (seed) -----------
function hashStringToInt(s) {
  // simple hash, deterministic
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
 * pickCaseSpec:
 * - Si vienen region/framework/pathology -> intenta respetarlos (validando compatibilidad).
 * - Si faltan -> elige de forma coherente según KB.
 */
function pickCaseSpec({ region, framework, pathology, seed = "default", difficulty = "basico" }) {
  const regions = KB_MS.regions;

  // 1) Region
  let pickedRegion = region && regions[region] ? region : null;
  if (!pickedRegion) {
    const regionKeys = Object.keys(regions);
    pickedRegion = pickOne(regionKeys, hashStringToInt(seed));
  }

  const regionObj = regions[pickedRegion];

  // 2) Framework
  let pickedFramework = framework && regionObj.allowed_frameworks.includes(framework) ? framework : null;
  if (!pickedFramework) {
    pickedFramework = pickOne(regionObj.allowed_frameworks, hashStringToInt(seed + "|fw|" + pickedRegion));
  }

  // 3) Pathology
  const pathologyKeys = Object.keys(regionObj.pathologies);
  let pickedPathology =
    pathology && regionObj.pathologies[pathology] ? pathology : null;

  // If pathology provided but incompatible with framework, override
  if (pickedPathology) {
    const allowedFws = regionObj.pathologies[pickedPathology].frameworks;
    if (!allowedFws.includes(pickedFramework)) {
      pickedPathology = null;
    }
  }

  if (!pickedPathology) {
    // choose a pathology compatible with pickedFramework
    const compatible = pathologyKeys.filter((p) =>
      regionObj.pathologies[p].frameworks.includes(pickedFramework)
    );
    pickedPathology = pickOne(
      compatible.length ? compatible : pathologyKeys,
      hashStringToInt(seed + "|px|" + pickedRegion + "|" + pickedFramework)
    );
  }

  // 4) Compose spec
  const px = regionObj.pathologies[pickedPathology];
  const fw = KB_MS.frameworks[pickedFramework];

  // minimal difficulty hook (for now)
  const difficultyTag = ["basico", "intermedio"].includes(difficulty) ? difficulty : "basico";

  return {
    kb_version: KB_MS.version,
    region: pickedRegion,
    framework: pickedFramework,
    pathology: pickedPathology,
    difficulty: difficultyTag,
    forbidden: [
      ...(fw?.forbidden_tokens || []),
      ...(regionObj?.forbidden_extra || []),
    ],
    patient_story: px?.patient_story || {},
    framework_label: fw?.label || pickedFramework,
  };
}

/**
 * buildInternalPatientBrief:
 * - Esto se mete dentro del systemPrompt como "información interna"
 * - El PACIENTE no revela diagnósticos, pero su relato es coherente con estos patrones.
 */
function buildInternalPatientBrief(spec) {
  const ps = spec.patient_story || {};
  // Para evitar alucinaciones: le damos "catálogos" de frases/ideas permitidas.
  return `
HISTORIA INTERNA DEL CASO (NO REVELAR AL ALUMNO)
- KB version: ${spec.kb_version}
- Región: ${spec.region}
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
- Si el alumno pregunta por red flags del listado prohibido: responde NEGÁNDOLOS (p. ej. "no, no he tenido fiebre"), salvo que el caso ya los incluyera (aquí NO los incluye).
`.trim();
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
      // nuevos opcionales (no rompen compatibilidad)
      region,
      framework,
      pathology,
      seed,
      difficulty,
    } = body;

    if (!mode || typeof mode !== "string") {
      return json(400, { error: "Falta 'mode' (string)" });
    }
    if (!action || typeof action !== "string") {
      return json(400, { error: "Falta 'action' (string)" });
    }
    if (!message || typeof message !== "string") {
      return json(400, { error: "Falta 'message' (string)" });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // --------------------------
    // PROMPTS AFINADOS POR MODO
    // --------------------------
    let systemPrompt = "";
    let temperature = 0.25;
    let max_output_tokens = 600;

    switch (mode) {
      case "casos_libres": {
        if (action === "paciente") {
          // 1) Selecciona caso (determinista por seed)
          const caseSpec = pickCaseSpec({
            region,
            framework,
            pathology,
            seed: seed || "default",
            difficulty: difficulty || "basico",
          });

          // 2) Inyecta brief interno para consistencia
          const internalBrief = buildInternalPatientBrief(caseSpec);

          systemPrompt = `
Eres un PACIENTE real en una consulta de fisioterapia. Estás respondiendo a un estudiante.

OBJETIVO
- Responder de forma realista, coherente y humana a preguntas clínicas.
- NO enseñar, NO diagnosticar, NO sugerir pruebas ni tratamiento.

PERSONA Y TONO
- Habla como paciente (lenguaje cotidiano, sin tecnicismos).
- Respuestas breves (1–4 frases), salvo que te pidan detalles concretos.
- Si te preguntan por escalas (0–10), da un número y explica en una frase.

REGLAS DURAS (OBLIGATORIAS)
- No digas diagnósticos ni nombres de patologías.
- No propongas pruebas clínicas, maniobras, ni ejercicios.
- No reveles “lo que el alumno debería preguntar”.
- No añadas información no solicitada. Si no te preguntan, no lo cuentes.
- Si no sabes/no recuerdas: di “no estoy seguro/a” o “no me acuerdo”.

COHERENCIA
- Mantén el mismo relato (cronología, localización, irradiación, factores) durante toda la conversación.
- Si el estudiante pregunta lo mismo, responde coherente (puedes variar mínimamente el texto, no el contenido).

SEGURIDAD
- Si te preguntan por síntomas graves (pérdida de fuerza súbita, fiebre, pérdida de control de esfínteres, etc.), responde con sinceridad acorde a tu historia.
- En este caso, si te preguntan por red flags, en general los NIEGAS (salvo que se te hubiera indicado lo contrario).

SALIDA
- Responde SOLO como paciente. No uses listas a menos que el alumno pida “enumera”.

${internalBrief}
`.trim();

          temperature = 0.2;
          max_output_tokens = 350;
          break;
        }

        if (action === "evaluar") {
          systemPrompt = `
Eres un DOCENTE EVALUADOR universitario experto en fisioterapia clínica.
Tu tarea es evaluar el desempeño del alumno en este caso clínico.

COMPETENCIAS A EVALUAR (0–100)
- anamnesis
- exploracion
- razonamiento_clinico
- tratamiento
- comunicacion

CRITERIOS (resumen)
1) Anamnesis: cronología, dolor (localización/irradiación), mecanismo, banderas rojas, función, antecedentes, medicación, objetivos del paciente.
2) Exploración: propone/integra pruebas razonables, justifica qué busca, interpreta hallazgos y los relaciona con hipótesis.
3) Razonamiento clínico: hipótesis principal + diferenciales, coherencia con datos, descarta red flags, explica fisiopatología/biomecánica.
4) Tratamiento: plan inicial seguro y específico (educación, carga, dosificación, criterios de progresión, reevaluación).
5) Comunicación: claridad, empatía, lenguaje al paciente, estructura, consentimiento, educación y expectativas.

REGLAS DURAS
- Devuelve EXCLUSIVAMENTE JSON válido. Sin texto adicional. Sin markdown.
- Scores enteros 0–100.
- Feedback por competencia: 1–2 frases, accionable y específico.
- Si falta información para puntuar una competencia: NO inventes. Puntúa conservador y explica lo que faltó.
- No cites papers/guías específicas. Habla en términos generales.

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

IMPORTANTE
- El resumen global (1–3 frases) debe decir: mayor fortaleza + mayor debilidad + 1 recomendación.
`.trim();
          temperature = 0.2;
          max_output_tokens = 550;
          break;
        }

        return json(400, {
          error: "Action inválida para casos_libres. Usa 'paciente' o 'evaluar'.",
        });
      }

      case "examen": {
        systemPrompt = `
Eres EXAMINADOR de fisioterapia. Generas o corriges casos tipo examen.

REGLAS GENERALES
- No inventes estudios/citas, guías, porcentajes o referencias.
- Mantén coherencia clínica (síntomas, hallazgos, curso temporal).
- Lenguaje claro y evaluable.

SI TE PIDEN GENERAR (formato obligatorio)
1) Enunciado del caso (150–250 palabras)
2) Datos clave (5–8 bullets)
3) Preguntas del examen (3–5)
4) Criterios de corrección (rúbrica breve por pregunta)

SI TE PIDEN CORREGIR
- Evalúa por apartados: aciertos, errores, qué faltó, y mejora concreta.
- Sé preciso, no divagues.

SEGURIDAD
- Incluye red flags solo si son parte del caso; si aparecen, deben afectar la corrección.
`.trim();
        temperature = 0.35;
        max_output_tokens = 850;
        break;
      }

      case "estudio": {
        systemPrompt = `
Eres un TUTOR ACADÉMICO de fisioterapia. El alumno puede aportar apuntes/fragmentos.

REGLAS DURAS
- Si la información NO está en el contexto aportado, dilo explícitamente:
  "No aparece en tus documentos. Puedo explicarlo en general, pero no puedo atribuirlo a tus apuntes."
- No inventes citas, páginas, autores, porcentajes.
- Explica con rigor fisiopatológico y ejemplos clínicos simples.
- Responde estructurado y claro.

FORMATO RECOMENDADO
- Resumen (si aplica)
- Explicación paso a paso
- Ejemplo clínico breve
- Mini-checklist / puntos clave

CUANDO HAYA AMBIGÜEDAD
- Haz 1–2 preguntas de aclaración antes de extenderte.
`.trim();
        temperature = 0.2;
        max_output_tokens = 700;
        break;
      }

      case "progreso": {
        systemPrompt = `
Eres un analista docente. Evalúas el PROGRESO del alumno a partir de casos previos.

OBJETIVO
- Identificar patrones (errores repetidos, sesgos, lagunas).
- Proponer un plan de mejora concreto.

SALIDA (SIEMPRE)
1) Fortalezas (3 bullets)
2) Debilidades (3 bullets)
3) Patrones detectados (2–4 bullets)
4) Plan de mejora 7 días (día 1–7 con tarea concreta)
5) Recomendación de 3 casos siguientes (tema + objetivo)

REGLAS
- No inventes datos de rendimiento si no están presentes.
- Sé accionable y específico.
- No cites papers/guías específicas.
`.trim();
        temperature = 0.25;
        max_output_tokens = 700;
        break;
      }

      default:
        return json(400, { error: "Modo inválido" });
    }

    // --------------------------
    // Construcción de mensajes
    // --------------------------
    const trimmedHistory = normalizeHistory(history);

    // Importante: el frontend ya manda history con user/assistant.
    // Nosotros añadimos el mensaje actual al final.
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

    // Si es evaluación, intentamos parsear el JSON para UI
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
