import OpenAI from "openai";

const MAX_HISTORY_MESSAGES = 16;
const MODEL = "gpt-4o-mini";

/**
 * =========================================================
 * KB MSK
 * =========================================================
 */
const KB_MS = {
  version: "2.0",
  frameworks: {
    SOBRECARGA_MECANICA: {
      label: "Sobrecarga mecánica tisular",
      pain_profile: "mecanico",
      typical_irritability: ["baja", "media"],
      forbidden_tokens: [
        "fiebre",
        "pérdida de peso",
        "pérdida de control de esfínteres",
        "anestesia en silla de montar",
      ],
    },
    LESION_MUSCULAR_SIMPLE: {
      label: "Lesión muscular estructural simple",
      pain_profile: "mecanico",
      typical_irritability: ["media"],
      forbidden_tokens: ["fiebre", "pérdida de peso", "esfínteres"],
    },
    DISFUNCION_MECANICA: {
      label: "Disfunción articular mecánica",
      pain_profile: "mecanico",
      typical_irritability: ["baja", "media"],
      forbidden_tokens: ["fiebre", "pérdida de peso", "esfínteres"],
    },
    COMPRESION_NEURAL_LEVE: {
      label: "Compresión neural periférica leve",
      pain_profile: "neural_mixto",
      typical_irritability: ["media"],
      forbidden_tokens: [
        "fiebre",
        "pérdida de control de esfínteres",
        "anestesia en silla de montar",
      ],
    },
    INFLAMACION_LOCAL: {
      label: "Inflamación local no sistémica",
      pain_profile: "inflamatorio_local",
      typical_irritability: ["media", "alta"],
      forbidden_tokens: ["fiebre", "pérdida de peso", "escalofríos"],
    },
    DEGENERACION_LEVE: {
      label: "Degeneración articular leve",
      pain_profile: "mecanico_rigidez",
      typical_irritability: ["baja", "media"],
      forbidden_tokens: ["fiebre", "pérdida de peso", "escalofríos"],
    },
    INESTABILIDAD_FUNCIONAL: {
      label: "Inestabilidad funcional",
      pain_profile: "mecanico_inestabilidad",
      typical_irritability: ["baja", "media"],
      forbidden_tokens: ["fiebre", "pérdida de peso"],
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
            aggravating: [
              "levantar el brazo",
              "coger peso con el brazo separado",
              "ponerme la chaqueta",
            ],
            relieving: ["reposo", "bajar el brazo", "evitar cargar"],
            onset: ["progresivo", "tras semanas de más carga"],
            night: [
              "a veces me molesta al dormir sobre ese lado",
              "me despierta si me pongo encima",
            ],
            function: [
              "me cuesta coger cosas de arriba",
              "me molesta vestirme",
              "me da guerra al entrenar",
            ],
          },
        },
        BURSITIS_SUBACROMIAL: {
          frameworks: ["INFLAMACION_LOCAL"],
          patient_story: {
            location: ["parte lateral del hombro"],
            aggravating: [
              "levantar el brazo",
              "movimientos repetidos por encima de la cabeza",
            ],
            relieving: ["reposo", "evitar gestos repetidos"],
            onset: ["progresivo", "tras varios días de sobreuso"],
            night: ["molesta al dormir de ese lado"],
            function: [
              "me limita peinarme",
              "me molesta alcanzar arriba",
              "me cuesta cargar bolsas",
            ],
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
            function: [
              "me molesta ponerme ropa",
              "me cuesta llegar arriba",
              "me da miedo moverlo rápido",
            ],
          },
        },
        DISQUINESIA_ESCAPULAR: {
          frameworks: ["DISFUNCION_MECANICA"],
          patient_story: {
            location: [
              "zona del hombro y omóplato",
              "entre escápula y columna",
            ],
            aggravating: [
              "mucho ordenador",
              "entrenar hombro o pecho",
              "levantar el brazo repetido",
            ],
            relieving: ["descanso", "cambiar postura", "calor suave"],
            onset: ["progresivo"],
            night: ["no suele despertarme, pero me deja incómodo"],
            function: [
              "me noto cargado al final del día",
              "pierdo comodidad al trabajar",
              "me molesta repetir gestos",
            ],
          },
        },
        INESTABILIDAD_LEVE: {
          frameworks: ["INESTABILIDAD_FUNCIONAL"],
          patient_story: {
            location: ["hombro por dentro", "sensación interna en el hombro"],
            aggravating: [
              "gestos rápidos",
              "lanzar",
              "poner el brazo atrás",
            ],
            relieving: ["evitar posiciones raras", "movimientos lentos"],
            onset: ["episódico", "desde hace meses"],
            night: ["a veces si duermo mal colocado"],
            function: [
              "siento como si se fuera a salir",
              "me da inseguridad en algunos gestos",
              "evito ciertos movimientos",
            ],
          },
        },
      },
      forbidden_extra: [
        "rotura masiva",
        "luxación recidivante grave",
        "artritis reumatoide",
      ],
    },

    RODILLA: {
      allowed_frameworks: [
        "SOBRECARGA_MECANICA",
        "DISFUNCION_MECANICA",
        "DEGENERACION_LEVE",
        "INFLAMACION_LOCAL",
      ],
      pathologies: {
        TENDINOPATIA_ROTULIANA: {
          frameworks: ["SOBRECARGA_MECANICA"],
          patient_story: {
            location: ["debajo de la rótula", "tendón rotuliano"],
            aggravating: [
              "saltos",
              "bajar escaleras",
              "sentadillas",
              "correr",
            ],
            relieving: [
              "reposo relativo",
              "bajar carga",
              "evitar saltar",
            ],
            onset: ["progresivo", "tras aumentar entrenos"],
            night: ["no suele ser lo principal", "a veces si he cargado mucho"],
            function: [
              "me limita entrenar",
              "me cuesta bajar escaleras",
              "me molesta agacharme",
            ],
          },
        },
        SINDROME_FEMOROPATELAR: {
          frameworks: ["DISFUNCION_MECANICA", "SOBRECARGA_MECANICA"],
          patient_story: {
            location: [
              "parte delantera de la rodilla",
              "alrededor de la rótula",
            ],
            aggravating: [
              "escaleras",
              "estar mucho rato sentado",
              "ponerme en cuclillas",
            ],
            relieving: ["estirar la pierna", "cambiar postura", "reposo"],
            onset: ["progresivo"],
            night: ["normalmente no"],
            function: [
              "me molesta el cine o coche",
              "me da guerra al subir y bajar",
              "me incomoda agacharme",
            ],
          },
        },
        GONARTROSIS_LEVE: {
          frameworks: ["DEGENERACION_LEVE"],
          patient_story: {
            location: ["rodilla difusa", "zona interna a veces"],
            aggravating: [
              "caminar mucho",
              "estar de pie",
              "bajar escaleras",
            ],
            relieving: ["descanso", "mover un poco al principio", "calor"],
            onset: ["lento, meses o años"],
            night: [
              "rigidez más que dolor",
              "a veces molesta al final del día",
            ],
            function: [
              "me cuesta arrancar",
              "me noto rígido",
              "aguanto peor caminatas largas",
            ],
          },
        },
        BURSITIS_PRERROTULIANA: {
          frameworks: ["INFLAMACION_LOCAL"],
          patient_story: {
            location: ["encima de la rótula", "zona superficial de delante"],
            aggravating: ["arrodillarme", "presionar la zona"],
            relieving: ["evitar apoyar", "reposo"],
            onset: ["tras apoyar mucho la rodilla", "días o semanas"],
            night: ["solo si presiono sin querer"],
            function: [
              "me cuesta arrodillarme",
              "me da guerra apoyar la rodilla",
              "molesta más por contacto que por mover",
            ],
          },
        },
      },
      forbidden_extra: ["rotura LCA completa", "artritis séptica", "derrame masivo"],
    },

    TOBILLO_PIE: {
      allowed_frameworks: [
        "INESTABILIDAD_FUNCIONAL",
        "SOBRECARGA_MECANICA",
        "INFLAMACION_LOCAL",
        "LESION_MUSCULAR_SIMPLE",
      ],
      pathologies: {
        ESGUINCE_LATERAL_LEVE: {
          frameworks: ["INESTABILIDAD_FUNCIONAL", "INFLAMACION_LOCAL"],
          patient_story: {
            location: ["parte externa del tobillo"],
            aggravating: ["caminar rápido", "terreno irregular", "girar el pie"],
            relieving: ["reposo", "elevar", "evitar torcer"],
            onset: ["agudo tras torcedura", "hace días o semanas"],
            night: ["si se hincha, me molesta un poco"],
            function: [
              "voy con cuidado",
              "me noto inseguro en irregularidades",
              "me limita andar rápido",
            ],
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
            function: [
              "siento que puede fallar",
              "evito cambios de dirección",
              "me da inseguridad al correr",
            ],
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
            function: [
              "me cuesta correr",
              "me tira al impulsarme",
              "me molesta al subir escaleras",
            ],
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
            function: [
              "me cuesta arrancar al levantarme",
              "aguanto peor de pie",
              "me molesta tras muchas horas",
            ],
          },
        },
      },
      forbidden_extra: ["trombosis", "rotura aquílea completa", "fractura"],
    },

    LUMBAR: {
      allowed_frameworks: [
        "DISFUNCION_MECANICA",
        "COMPRESION_NEURAL_LEVE",
        "DEGENERACION_LEVE",
      ],
      pathologies: {
        LUMBALGIA_MECANICA: {
          frameworks: ["DISFUNCION_MECANICA"],
          patient_story: {
            location: ["zona baja de la espalda"],
            aggravating: [
              "agacharme",
              "estar mucho rato sentado",
              "coger peso",
            ],
            relieving: ["cambiar postura", "andar un poco", "reposo relativo"],
            onset: ["tras mala postura o carga", "progresivo o tras esfuerzo"],
            night: ["no suele, salvo postura mala"],
            function: [
              "me cuesta inclinarme",
              "me limita estar sentado",
              "me da guerra al levantar cosas",
            ],
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
            function: [
              "me limita estar sentado",
              "me preocupa si baja por la pierna",
              "voy más torpe con algunas posturas",
            ],
          },
        },
        ESPONDILOARTROSIS_LEVE: {
          frameworks: ["DEGENERACION_LEVE"],
          patient_story: {
            location: ["lumbar difusa"],
            aggravating: ["estar de pie mucho rato", "final del día"],
            relieving: ["moverme suave", "calor"],
            onset: ["lento, meses o años"],
            night: ["rigidez más que dolor"],
            function: [
              "me noto rígido",
              "arranco peor al inicio",
              "aguanto peor al final del día",
            ],
          },
        },
      },
      forbidden_extra: [
        "esfínteres",
        "anestesia en silla de montar",
        "fiebre persistente",
      ],
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
            function: [
              "me molesta trabajar",
              "me carga al final del día",
              "me cuesta girar cómodo",
            ],
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
            function: [
              "me molesta trabajar con ordenador",
              "me preocupa el hormigueo",
              "me incomoda mover el cuello",
            ],
          },
        },
      },
      forbidden_extra: ["mielopatía", "pérdida de fuerza progresiva severa"],
    },

    CADERA: {
      allowed_frameworks: [
        "SOBRECARGA_MECANICA",
        "INFLAMACION_LOCAL",
        "DEGENERACION_LEVE",
        "DISFUNCION_MECANICA",
      ],
      pathologies: {
        DOLOR_TROCANTERICO: {
          frameworks: ["SOBRECARGA_MECANICA", "INFLAMACION_LOCAL"],
          patient_story: {
            location: ["lado de la cadera", "trocánter"],
            aggravating: [
              "subir escaleras",
              "andar mucho",
              "tumbarme de ese lado",
            ],
            relieving: ["evitar ese lado al dormir", "reposo"],
            onset: ["progresivo"],
            night: ["sí, por dormir encima"],
            function: [
              "me cuesta andar mucho",
              "me limita dormir cómodo",
              "me da guerra subir escaleras",
            ],
          },
        },
        COXARTROSIS_LEVE: {
          frameworks: ["DEGENERACION_LEVE"],
          patient_story: {
            location: ["ingle", "cadera por delante"],
            aggravating: [
              "caminar mucho",
              "levantarme de la silla",
              "ponerme calcetines",
            ],
            relieving: ["descanso", "calentar un poco"],
            onset: ["lento"],
            night: ["rigidez más que dolor"],
            function: [
              "me cuesta calzarme",
              "me noto rígido al arrancar",
              "me limita levantarme",
            ],
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
            function: [
              "me molesta subir escaleras",
              "me da guerra correr",
              "me tira al levantar la pierna",
            ],
          },
        },
      },
      forbidden_extra: ["fractura", "necrosis avascular", "artritis séptica"],
    },
  },
};

/**
 * =========================================================
 * KB NEURO
 * =========================================================
 */
const KB_NEURO = {
  version: "1.0",
  frameworks: {
    DEFICIT_NEURO_LEVE: {
      label: "Déficit neurológico leve no agudo",
      forbidden_tokens: [
        "debut súbito hoy",
        "pérdida de consciencia",
        "cefalea en trueno",
        "convulsiones",
        "fiebre alta",
      ],
    },
    DOLOR_NEUROPATICO_PERIFERICO_LEVE: {
      label: "Síntomas neuropáticos periféricos leves",
      forbidden_tokens: [
        "pérdida de fuerza progresiva severa",
        "caídas frecuentes sin causa",
        "incontinencia reciente",
      ],
    },
    VESTIBULAR_LEVE: {
      label: "Mareo o vértigo periférico leve",
      forbidden_tokens: ["diplopía", "disartria", "ataxia severa"],
    },
  },
  topics: {
    NEURO_PERIFERICO: {
      allowed_frameworks: ["DOLOR_NEUROPATICO_PERIFERICO_LEVE"],
      pathologies: {
        SINTOMAS_TUNEL_CARPIANO_LEVE: {
          frameworks: ["DOLOR_NEUROPATICO_PERIFERICO_LEVE"],
          patient_story: {
            location: ["mano y muñeca", "dedos pulgar índice y medio"],
            onset: ["progresivo, semanas o meses"],
            aggravating: ["usar mucho el móvil o teclado", "por la noche"],
            relieving: ["sacudir la mano", "cambiar postura"],
            night: ["me despierta a veces con hormigueo"],
            function: [
              "se me duermen los dedos",
              "me molesta al usar el móvil",
              "me incomoda por la noche",
            ],
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
            function: [
              "me molesta apoyar el codo",
              "se me duerme parte de la mano",
              "me da guerra en posturas mantenidas",
            ],
          },
        },
      },
      forbidden_extra: ["ictus agudo", "síndrome de cola de caballo"],
    },
    VESTIBULAR: {
      allowed_frameworks: ["VESTIBULAR_LEVE"],
      pathologies: {
        VERTIGO_POSICIONAL_LEVE: {
          frameworks: ["VESTIBULAR_LEVE"],
          patient_story: {
            location: ["mareo", "sensación de giro"],
            onset: ["episódico, días o semanas"],
            aggravating: ["girar en la cama", "mirar hacia arriba"],
            relieving: ["quedarme quieto", "pasa en segundos"],
            night: ["si me giro en la cama"],
            function: [
              "me da inseguridad al mover la cabeza",
              "me pasa en cambios de posición",
              "intento moverme con cuidado",
            ],
          },
        },
      },
      forbidden_extra: ["signos centrales"],
    },
  },
};

/**
 * =========================================================
 * KB RESPI
 * =========================================================
 */
const KB_RESPI = {
  version: "1.0",
  frameworks: {
    DESACONDICIONAMIENTO: {
      label: "Desacondicionamiento y disnea de esfuerzo",
      forbidden_tokens: [
        "dolor torácico opresivo",
        "síncope",
        "hemoptisis",
        "fiebre alta persistente",
      ],
    },
    ASMA_LEVE_CONTROLABLE: {
      label: "Asma leve con síntomas desencadenados",
      forbidden_tokens: [
        "disnea en reposo severa",
        "cianosis",
        "uso de musculatura accesoria marcado",
      ],
    },
    EPOC_LEVE_ESTABLE: {
      label: "EPOC leve estable",
      forbidden_tokens: ["exacerbación grave", "fiebre alta", "confusión"],
    },
  },
  topics: {
    RESPI_GENERAL: {
      allowed_frameworks: [
        "DESACONDICIONAMIENTO",
        "ASMA_LEVE_CONTROLABLE",
        "EPOC_LEVE_ESTABLE",
      ],
      pathologies: {
        POST_INFECCION_DESACOND: {
          frameworks: ["DESACONDICIONAMIENTO"],
          patient_story: {
            location: ["pecho por falta de aire", "cansancio general"],
            onset: ["desde hace semanas"],
            aggravating: ["subir escaleras", "andar rápido"],
            relieving: ["parar y respirar", "ir más lento"],
            night: ["no suele despertarme"],
            function: [
              "me fatigo antes",
              "he perdido fondo",
              "me cuesta seguir el ritmo",
            ],
          },
        },
        ASMA_EJERCICIO_LEVE: {
          frameworks: ["ASMA_LEVE_CONTROLABLE"],
          patient_story: {
            location: ["pecho con opresión ligera", "pitidos leves"],
            onset: ["episódico"],
            aggravating: ["ejercicio intenso", "frío"],
            relieving: ["descansar", "respirar tranquilo"],
            night: ["a veces tos nocturna leve"],
            function: [
              "me limita el ejercicio intenso",
              "tengo que parar antes",
              "me noto peor con frío",
            ],
          },
        },
        EPOC_LEVE_ESTABLE: {
          frameworks: ["EPOC_LEVE_ESTABLE"],
          patient_story: {
            location: ["disnea al esfuerzo", "tos ocasional"],
            onset: ["meses o años"],
            aggravating: ["cuestas", "cargar peso"],
            relieving: ["ritmo suave", "parar"],
            night: ["variable, no principal"],
            function: [
              "me fatigo con esfuerzos",
              "voy más lento en cuestas",
              "me cuesta recuperar antes",
            ],
          },
        },
      },
      forbidden_extra: ["neumonía grave", "embolia pulmonar"],
    },
  },
};

/**
 * =========================================================
 * Helpers generales
 * =========================================================
 */
function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(payload),
  };
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .map((m) => ({
      role: m.role,
      content: m.content.trim(),
    }))
    .slice(-MAX_HISTORY_MESSAGES);
}

function hashStringToInt(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function pickOne(arr, seedInt) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr[seedInt % arr.length];
}

function pickSome(arr, seedInt, count = 2) {
  if (!Array.isArray(arr) || arr.length === 0) return [];
  const copy = [...arr];
  const out = [];
  let currentSeed = seedInt;
  while (copy.length > 0 && out.length < count) {
    const idx = currentSeed % copy.length;
    out.push(copy.splice(idx, 1)[0]);
    currentSeed = Math.floor(currentSeed / 7) + 11;
  }
  return out;
}

function maybePick(arr, seedInt, probability = 0.5) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const roll = (seedInt % 100) / 100;
  if (roll > probability) return null;
  return pickOne(arr, seedInt);
}

function cleanEnum(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function inferDifficultyConfig(difficulty = "basico") {
  switch (difficulty) {
    case "avanzado":
      return {
        ambiguity: "media",
        psychosocialChance: 0.45,
        objectiveDetail: "alto",
      };
    case "intermedio":
      return {
        ambiguity: "baja_media",
        psychosocialChance: 0.35,
        objectiveDetail: "medio",
      };
    default:
      return {
        ambiguity: "baja",
        psychosocialChance: 0.2,
        objectiveDetail: "basico",
      };
  }
}

function pickKBByArea(area) {
  if (area === "NEURO") return KB_NEURO;
  if (area === "RESPI") return KB_RESPI;
  return KB_MS;
}

function getPoolFromKB(kb) {
  return kb.regions || kb.topics || {};
}

/**
 * =========================================================
 * Selección determinista del caso
 * =========================================================
 */
function pickCaseSpecGeneric({
  kb,
  regionOrTopic,
  framework,
  pathology,
  seed = "default",
  difficulty = "basico",
}) {
  const pool = getPoolFromKB(kb);
  const poolKeys = Object.keys(pool);

  let pickedKey = regionOrTopic && pool[regionOrTopic] ? regionOrTopic : null;
  if (!pickedKey) {
    pickedKey = pickOne(poolKeys, hashStringToInt(seed + "|pool"));
  }

  const node = pool[pickedKey];
  const allowedFrameworks = node.allowed_frameworks || [];

  let pickedFramework =
    framework && allowedFrameworks.includes(framework) ? framework : null;
  if (!pickedFramework) {
    pickedFramework = pickOne(
      allowedFrameworks,
      hashStringToInt(seed + "|fw|" + pickedKey)
    );
  }

  const pathologyKeys = Object.keys(node.pathologies || {});
  let pickedPathology =
    pathology && node.pathologies?.[pathology] ? pathology : null;

  if (pickedPathology) {
    const pathologyFrameworks =
      node.pathologies[pickedPathology]?.frameworks || [];
    if (
      pickedFramework &&
      pathologyFrameworks.length > 0 &&
      !pathologyFrameworks.includes(pickedFramework)
    ) {
      pickedPathology = null;
    }
  }

  if (!pickedPathology) {
    const compatible = pathologyKeys.filter((p) =>
      (node.pathologies[p]?.frameworks || []).includes(pickedFramework)
    );

    pickedPathology = pickOne(
      compatible.length ? compatible : pathologyKeys,
      hashStringToInt(seed + "|px|" + pickedKey + "|" + pickedFramework)
    );
  }

  const px = node.pathologies[pickedPathology] || {};
  const fw = kb.frameworks[pickedFramework] || {};
  const difficultyConfig = inferDifficultyConfig(difficulty);

  return {
    kb_version: kb.version,
    kb_kind: kb.regions ? "regions" : "topics",
    region_or_topic: pickedKey,
    framework: pickedFramework,
    framework_label: fw.label || pickedFramework,
    pathology: pickedPathology,
    difficulty: ["basico", "intermedio", "avanzado"].includes(difficulty)
      ? difficulty
      : "basico",
    difficulty_config: difficultyConfig,
    patient_story: px.patient_story || {},
    forbidden: [...(fw.forbidden_tokens || []), ...(node.forbidden_extra || [])],
    pain_profile: fw.pain_profile || "variable",
    typical_irritability: fw.typical_irritability || ["media"],
  };
}

/**
 * =========================================================
 * Generación de capa clínica oculta
 * =========================================================
 */
function buildHiddenCaseModel(spec, trainingConfig = {}) {
  const seedBase = `${spec.region_or_topic}|${spec.framework}|${spec.pathology}|${trainingConfig?.academicLevel || ""}|${spec.difficulty}`;
  const seedInt = hashStringToInt(seedBase);

  const ps = spec.patient_story || {};
  const ageBands = {
    basico: ["19", "22", "26", "31", "38", "44"],
    intermedio: ["24", "29", "35", "42", "49", "57"],
    avanzado: ["21", "33", "46", "54", "61", "68"],
  };

  const patientNames = [
    "Marta",
    "Carlos",
    "Laura",
    "Javier",
    "Lucía",
    "Sergio",
    "Ana",
    "Pablo",
    "Nuria",
    "David",
  ];

  const professions = [
    "estudiante",
    "administrativo",
    "entrenador personal",
    "dependienta",
    "programador",
    "profesor",
    "camarero",
    "fisioterapeuta novel",
    "padre o madre con niños pequeños",
    "trabajador de almacén",
  ];

  const irritability = pickOne(
    spec.typical_irritability,
    hashStringToInt(seedBase + "|irrit")
  );

  const severity =
    irritability === "alta"
      ? pickOne(["media", "alta"], seedInt + 17)
      : pickOne(["baja", "media"], seedInt + 29);

  const onset = pickOne(ps.onset || [], seedInt + 1);
  const location = pickOne(ps.location || [], seedInt + 2);
  const aggravating = pickSome(ps.aggravating || [], seedInt + 3, 2);
  const relieving = pickSome(ps.relieving || [], seedInt + 4, 2);
  const night = maybePick(ps.night || [], seedInt + 5, 0.75);
  const functionLimitation = pickSome(ps.function || [], seedInt + 6, 2);

  const psychosocialLibrary = [
    "me preocupa que esto vaya a más",
    "llevo unos días pensando mucho en ello",
    "me frustra no poder entrenar normal",
    "me da miedo moverme porque noto que empeora",
    "quiero volver a mi rutina cuanto antes",
    "me preocupa que sea algo serio aunque intento no pensarlo",
  ];

  const expectationLibrary = [
    "quiero saber qué tengo y qué puedo hacer",
    "quiero volver a entrenar sin miedo",
    "quiero poder trabajar sin que me moleste",
    "quiero dormir y moverme mejor",
    "quiero saber si puedo seguir haciendo vida normal",
  ];

  const psychosocial = maybePick(
    psychosocialLibrary,
    hashStringToInt(seedBase + "|psycho"),
    spec.difficulty_config.psychosocialChance
  );

  const expectation = pickOne(
    expectationLibrary,
    hashStringToInt(seedBase + "|expect")
  );

  const objectiveHints = buildObjectiveHints({
    region: spec.region_or_topic,
    framework: spec.framework,
    pathology: spec.pathology,
    irritability,
    severity,
    painProfile: spec.pain_profile,
  });

  const initialHypotheses = buildInitialHypotheses({
    region: spec.region_or_topic,
    framework: spec.framework,
    pathology: spec.pathology,
    painProfile: spec.pain_profile,
  });

  const supportRefute = buildSupportAndRefuteData({
    region: spec.region_or_topic,
    pathology: spec.pathology,
    painProfile: spec.pain_profile,
    irritability,
    functionLimitation,
  });

  const usefulExamDirections = buildUsefulExamDirections({
    region: spec.region_or_topic,
    painProfile: spec.pain_profile,
    irritability,
  });

  const functionalDiagnosis = buildFunctionalDiagnosis({
    region: spec.region_or_topic,
    pathology: spec.pathology,
    painProfile: spec.pain_profile,
    irritability,
    severity,
    functionLimitation,
  });

  return {
    patient_identity: {
      name: pickOne(patientNames, seedInt + 100),
      age: pickOne(ageBands[spec.difficulty] || ageBands.basico, seedInt + 101),
      profession: pickOne(professions, seedInt + 102),
    },
    case_core: {
      region_or_topic: spec.region_or_topic,
      framework: spec.framework,
      framework_label: spec.framework_label,
      pathology_hidden: spec.pathology,
      pain_profile: spec.pain_profile,
      severity,
      irritability,
      onset,
      location,
      aggravating,
      relieving,
      night,
      function_limitation: functionLimitation,
      psychosocial,
      expectation,
      forbidden: spec.forbidden,
      difficulty: spec.difficulty,
    },
    reasoning_engine: {
      initial_hypotheses: initialHypotheses,
      data_that_support: supportRefute.supports,
      data_that_refute: supportRefute.refutes,
      useful_exam_directions: usefulExamDirections,
      functional_diagnosis: functionalDiagnosis,
    },
    objective_hints: objectiveHints,
  };
}

function buildObjectiveHints({
  region,
  framework,
  pathology,
  irritability,
  severity,
  painProfile,
}) {
  const common = {
    inspection: "sin hallazgos llamativos a simple vista salvo protección o postura si procede",
    active_movement:
      "los movimientos provocadores reproducen molestia según la región y el patrón",
    passive_movement:
      "puede ser similar o menos marcado que el activo dependiendo del cuadro",
    resisted_tests:
      "pueden molestar si hay componente contráctil o sobrecarga",
    palpation:
      "puede haber sensibilidad local si el cuadro lo justifica",
    neuro:
      painProfile.includes("neural")
        ? "puede haber hormigueo o irradiación leve si el alumno lo explora bien"
        : "sin hallazgos neurológicos llamativos salvo que el alumno fuerce ese camino",
  };

  const map = {
    HOMBRO: {
      active_movement:
        "elevación o gestos funcionales de hombro reproducen el síntoma; según el caso puede haber arco doloroso o sensación de inestabilidad",
      passive_movement:
        "generalmente menos limitados que los activos salvo dolor al final del rango o provocación específica",
    },
    RODILLA: {
      active_movement:
        "sentadilla, escalón, flexión mantenida o carga funcional pueden reproducir dolor",
      passive_movement:
        "a menudo menos relevantes que la carga funcional salvo irritación local",
    },
    TOBILLO_PIE: {
      active_movement:
        "caminar, puntillas, apoyo prolongado o terreno irregular reproducen el síntoma según el caso",
      passive_movement:
        "movimientos finales de rango o tensión local pueden molestar",
    },
    LUMBAR: {
      active_movement:
        "flexión, extensión o sedestación mantenida pueden modular los síntomas según el cuadro",
      passive_movement:
        "menos relevante como dato espontáneo del paciente; el estudiante debe buscar comportamiento",
      neuro:
        painProfile.includes("neural")
          ? "si el alumno pregunta bien pueden aparecer irradiación, hormigueo o dolor que baja por la pierna"
          : "no hay síntomas neurológicos de peso",
    },
    CERVICAL: {
      active_movement:
        "girar o mantener posturas reproduce síntomas; si es neural puede haber irradiación al brazo",
      passive_movement:
        "menos accesible como lenguaje de paciente; responder solo si el alumno lo formula de forma sencilla",
      neuro:
        painProfile.includes("neural")
          ? "puede haber hormigueo o irradiación leve al brazo"
          : "sin déficits neurológicos claros",
    },
    CADERA: {
      active_movement:
        "caminar, subir escaleras, cambios de apoyo o flexión funcional reproducen molestia",
      passive_movement:
        "puede molestar al llevar la cadera a ciertos rangos si el alumno lo explora con sentido",
    },
    NEURO_PERIFERICO: {
      neuro:
        "síntomas sensitivos leves, posicionales o por sobreuso; sin signos graves",
    },
    VESTIBULAR: {
      neuro:
        "síntomas breves y posicionales; sin signos centrales ni déficits neurológicos mayores",
    },
    RESPI_GENERAL: {
      active_movement:
        "la carga funcional aumenta la disnea o fatiga",
      passive_movement:
        "no aplicable de forma relevante",
    },
  };

  return {
    ...common,
    ...(map[region] || {}),
    meta: {
      irritability,
      severity,
      framework,
      pathology_hidden: pathology,
    },
  };
}
function buildInitialHypotheses({ region, framework, pathology, painProfile }) {
  const hypotheses = [];

  const add = (label, kind, probability) => {
    hypotheses.push({ label, kind, probability });
  };

  // Hipótesis principal
  add(pathology, "principal", "alta");

  // Hipótesis secundarias por patrón
  if (painProfile.includes("neural")) {
    add("Componente neural periférico leve", "secundaria", "media");
    add("Disfunción mecánica con sensibilización local", "secundaria", "baja");
  } else if (painProfile.includes("inflamatorio")) {
    add("Irritación inflamatoria local", "secundaria", "media");
    add("Sobrecarga mecánica reactiva", "secundaria", "baja");
  } else {
    add("Disfunción mecánica regional", "secundaria", "media");
    add("Sobrecarga tisular local", "secundaria", "media");
  }

  // Hipótesis por región
  if (region === "HOMBRO") {
    add("Dolor subacromial mecánico", "alternativa", "media");
    add("Déficit de control escapulohumeral", "alternativa", "baja");
  }

  if (region === "LUMBAR") {
    add("Lumbalgia mecánica inespecífica", "alternativa", "media");
    if (painProfile.includes("neural")) {
      add("Radiculopatía lumbar leve", "alternativa", "media");
    }
  }

  if (region === "CERVICAL") {
    add("Cervicalgia mecánica postural", "alternativa", "media");
    if (painProfile.includes("neural")) {
      add("Radiculopatía cervical leve", "alternativa", "media");
    }
  }

  if (region === "RODILLA") {
    add("Dolor femoropatelar mecánico", "alternativa", "media");
    add("Sobrecarga del aparato extensor", "alternativa", "baja");
  }

  if (region === "TOBILLO_PIE") {
    add("Sobrecarga mecánica del pie o tobillo", "alternativa", "media");
    add("Déficit de control o estabilidad regional", "alternativa", "baja");
  }

  if (region === "CADERA") {
    add("Dolor lateral o anterior de cadera mecánico", "alternativa", "media");
    add("Déficit de control lumbopélvico", "alternativa", "baja");
  }

  return hypotheses.slice(0, 5);
}

function buildSupportAndRefuteData({ region, pathology, painProfile, irritability, functionLimitation }) {
  const supports = [];
  const refutes = [];

  supports.push("La conducta del síntoma encaja con el patrón dominante del caso.");
  supports.push("La limitación funcional es coherente con la región afectada.");
  supports.push("La cronología y los agravantes apoyan una hipótesis musculoesquelética plausible.");

  if (painProfile.includes("neural")) {
    supports.push("La presencia de irradiación u hormigueo apoyaría un componente neural leve.");
    refutes.push("La ausencia total de síntomas irradiados o sensitivos debilitaría la hipótesis neural.");
  }

  if (painProfile.includes("inflamatorio")) {
    supports.push("La irritabilidad media-alta y la sensibilidad con carga apoyarían irritación local.");
    refutes.push("La clara dependencia mecánica sin irritabilidad debilitaría el componente inflamatorio.");
  }

  if (irritability === "alta") {
    supports.push("La fácil provocación del síntoma sugiere un cuadro más reactivo o irritable.");
    refutes.push("Si tolera carga y repetición sin cambio relevante, la hipótesis actual pierde fuerza.");
  }

  if (region === "HOMBRO") {
    supports.push("El dolor al elevar el brazo o en tareas por encima de la cabeza reforzaría la hipótesis principal.");
    refutes.push("La movilidad totalmente libre y sin dolor en carga debilitaría una hipótesis de hombro mecánico.");
  }

  if (region === "LUMBAR") {
    supports.push("El cambio por sedestación, flexión o carga apoya una hipótesis lumbar mecánica.");
    refutes.push("La falta total de relación con postura o movimiento debilitaría el cuadro lumbar mecánico.");
  }

  if (region === "RODILLA") {
    supports.push("La reproducción con escaleras, sentadilla o carga funcional refuerza hipótesis de rodilla mecánica.");
    refutes.push("La ausencia de síntomas con carga funcional debilitaría la hipótesis principal.");
  }

  if (functionLimitation?.length) {
    supports.push(`La limitación funcional principal (${functionLimitation[0]}) encaja con la presentación.`);
  }

  refutes.push("Los red flags claros o una incoherencia mayor cambiarían por completo la prioridad clínica.");

  return {
    supports: supports.slice(0, 5),
    refutes: refutes.slice(0, 5),
  };
}

function buildUsefulExamDirections({ region, painProfile, irritability }) {
  const exam = [];

  exam.push("Confirmar comportamiento del dolor con movimiento, postura, carga y repetición.");
  exam.push("Comparar qué hallazgos apoyan la hipótesis principal y cuáles la debilitan.");

  if (region === "HOMBRO") {
    exam.push("Explorar elevación activa, rango doloroso, tolerancia en carga y función escapular.");
  }
  if (region === "LUMBAR") {
    exam.push("Explorar cambio con flexión, extensión, sedestación, marcha y posibles síntomas irradiados.");
  }
  if (region === "CERVICAL") {
    exam.push("Explorar movilidad cervical, relación con brazo, postura y carga mantenida.");
  }
  if (region === "RODILLA") {
    exam.push("Explorar tareas funcionales como sentadilla, escalón, marcha y tolerancia a flexión.");
  }
  if (region === "TOBILLO_PIE") {
    exam.push("Explorar apoyo, marcha, puntillas, control y movimientos que cargan la zona.");
  }
  if (region === "CADERA") {
    exam.push("Explorar marcha, apoyo unipodal, subir escaleras y flexión funcional.");
  }

  if (painProfile.includes("neural")) {
    exam.push("Explorar con intención la presencia de irradiación, hormigueo o cambios sensitivos leves.");
  }

  if (irritability === "alta") {
    exam.push("Dosificar la exploración: poca carga, evitar exceso de provocación y priorizar seguridad.");
  }

  return exam.slice(0, 5);
}

function buildFunctionalDiagnosis({ region, pathology, painProfile, irritability, severity, functionLimitation }) {
  const regionText = String(region || "región no especificada").toLowerCase();
  const limitationText = functionLimitation?.[0] || "actividad funcional relevante";

  return `Cuadro ${painProfile} en ${regionText}, con irritabilidad ${irritability}, severidad ${severity} y limitación principal en ${limitationText}. La etiqueta anatómica oculta compatible es ${pathology}, pero la conclusión útil es funcional y basada en comportamiento del síntoma, carga y función.`;
}
/**
 * =========================================================
 * Prompts
 * =========================================================
 */
function buildScopeRules(trainingConfig = {}) {
  const stage = cleanEnum(
    trainingConfig.stage,
    "ANAMNESIS_VALORACION_TRATAMIENTO"
  );
  const academicLevel = trainingConfig.academicLevel;
  const area = trainingConfig.area || "MSK";

  const levelLine = academicLevel
    ? `- Nivel académico del alumno: ${academicLevel}º. Ajusta complejidad, pero sin convertirte en profesor.`
    : "- El alumno es universitario de fisioterapia. Mantén realismo y sencillez de paciente.";

  if (stage === "ANAMNESIS") {
    return `
ALCANCE ACTIVO: SOLO ANAMNESIS
- NO des resultados de exploración física, pruebas especiales, tests ortopédicos, constantes ni hallazgos objetivos.
- NO hables de tratamiento.
- Si el alumno te pregunta qué tratamiento necesitas: responde como paciente, no como clínico.
- Puedes hablar de síntomas, historia, función, comportamiento y preocupaciones.
${levelLine}
- Área clínica: ${area}.
`.trim();
  }

  if (stage === "ANAMNESIS_VALORACION") {
    return `
ALCANCE ACTIVO: ANAMNESIS + VALORACIÓN
- Puedes aportar información de valoración SOLO si el alumno la pide de forma clara.
- Da hallazgos simples, expresados en lenguaje de paciente o hallazgo funcional básico.
- NO propongas tratamiento ni ejercicios.
${levelLine}
- Área clínica: ${area}.
`.trim();
  }

  return `
ALCANCE ACTIVO: ANAMNESIS + VALORACIÓN + TRATAMIENTO
- Responde como paciente real.
- Puedes describir resultados simples de valoración solo si el alumno los explora.
- Si el alumno propone tratamiento, responde como paciente valorando tolerancia, preferencias, objetivos o dudas.
${levelLine}
- Área clínica: ${area}.
`.trim();
}

function buildInternalPatientBrief(spec, hiddenCase) {
  return `
=== CASO CLÍNICO OCULTO (NO REVELAR) ===
KB version: ${spec.kb_version}
Contexto: ${spec.kb_kind === "regions" ? "Región" : "Tema"} = ${spec.region_or_topic}
Marco fisiopatológico: ${spec.framework_label} (${spec.framework})
Patología oculta: ${spec.pathology}
Dificultad: ${spec.difficulty}

=== IDENTIDAD DEL PACIENTE ===
Nombre: ${hiddenCase.patient_identity.name}
Edad: ${hiddenCase.patient_identity.age}
Profesión o contexto: ${hiddenCase.patient_identity.profession}

=== HISTORIA CLAVE QUE DEBES MANTENER ===
Localización principal: ${hiddenCase.case_core.location || "no especificada"}
Inicio: ${hiddenCase.case_core.onset || "no especificado"}
Agravantes principales: ${JSON.stringify(hiddenCase.case_core.aggravating || [])}
Alivios principales: ${JSON.stringify(hiddenCase.case_core.relieving || [])}
Comportamiento nocturno o matutino: ${hiddenCase.case_core.night || "no relevante"}
Limitación funcional: ${JSON.stringify(hiddenCase.case_core.function_limitation || [])}
Perfil de dolor: ${hiddenCase.case_core.pain_profile}
Severidad: ${hiddenCase.case_core.severity}
Irritabilidad: ${hiddenCase.case_core.irritability}
Preocupación psicosocial: ${hiddenCase.case_core.psychosocial || "ninguna muy marcada"}
Expectativa: ${hiddenCase.case_core.expectation || "quiere mejorar"}

=== RAZONAMIENTO CLÍNICO OCULTO ===
Hipótesis iniciales:
${JSON.stringify(hiddenCase.reasoning_engine.initial_hypotheses || [], null, 2)}

Datos que apoyarían la hipótesis principal:
${JSON.stringify(hiddenCase.reasoning_engine.data_that_support || [], null, 2)}

Datos que la debilitarían:
${JSON.stringify(hiddenCase.reasoning_engine.data_that_refute || [], null, 2)}

Direcciones útiles de exploración:
${JSON.stringify(hiddenCase.reasoning_engine.useful_exam_directions || [], null, 2)}

Diagnóstico funcional interno:
${hiddenCase.reasoning_engine.functional_diagnosis || "no especificado"}

=== HALLAZGOS OBJETIVOS SI EL ALUMNO LOS PIDE ===
Inspección: ${hiddenCase.objective_hints.inspection}
Movimiento activo: ${hiddenCase.objective_hints.active_movement}
Movimiento pasivo: ${hiddenCase.objective_hints.passive_movement}
Tests resistidos o carga: ${hiddenCase.objective_hints.resisted_tests}
Palpación: ${hiddenCase.objective_hints.palpation}
Componente neuro: ${hiddenCase.objective_hints.neuro}

=== RESTRICCIONES ===
- NO digas diagnósticos técnicos.
- NO uses el nombre de la patología.
- NO te conviertas en profesor.
- NO adelantes información no preguntada.
- Si preguntan por red flags de esta lista, debes NEGARLAS salvo que el caso las incluyera, y aquí no las incluye:
${JSON.stringify(hiddenCase.case_core.forbidden || [])}

=== COHERENCIA ===
- Mantén cronología, localización y comportamiento.
- No contradigas la irritabilidad.
- No regales hallazgos de exploración si el alumno aún está en anamnesis.
`.trim();
}

function buildPatientSystemPrompt({ spec, hiddenCase, trainingConfig }) {
  const scopeRules = buildScopeRules(trainingConfig);

  return `
Eres un PACIENTE simulado dentro de una app de razonamiento clínico para fisioterapia.

Tu objetivo es comportarte como una persona real en consulta, no como un libro, no como un profesor y no como una ficha clínica.

PRINCIPIO CENTRAL
- Hablas como paciente real.
- No organizas tu discurso como un profesional sanitario.
- No das información perfecta de golpe.
- No dices diagnósticos ni nombres técnicos.
- No ayudas al alumno a acertar.
- No hablas con lenguaje académico salvo que el propio caso justifique que te hayan dicho algo previamente otros profesionales.

FORMA DE RESPONDER
- Normalmente responde en 1 a 4 frases.
- Usa lenguaje cotidiano y natural.
- A veces eres impreciso.
- A veces no recuerdas exactamente fechas, intensidades o detalles.
- A veces mezclas dolor, función y preocupación en la misma respuesta, como haría una persona normal.
- Si la pregunta del alumno es muy buena y abierta, puedes dar una respuesta más útil.
- Si la pregunta es cerrada, contesta solo a eso.
- Si la pregunta es rara, técnica o poco natural, puedes no entenderla del todo y pedir que te la reformule.

REGLAS HUMANAS IMPORTANTES
- No des listas salvo que el alumno te pida resumir.
- No respondas como si supieras qué quiere explorar el alumno.
- No anticipes red flags, hallazgos físicos ni factores clave si no te los preguntan.
- No seas excesivamente colaborador ni perfecto.
- No cambies tu historia.
- No te contradigas.
- Si no te acuerdas de algo, dilo sin problema.
- Si una pregunta toca algo sensible o importante para ti, puedes expresarlo emocionalmente de forma leve y natural.

CÓMO SUENAS
- Natural
- Humano
- Breve
- Creíble
- A veces cansado, preocupado o frustrado si el caso lo justifica
- Nunca como un docente

CÓMO DEBES ADAPTARTE A LA CALIDAD DE LAS PREGUNTAS
- Si el alumno pregunta mal, responde poco o con ambigüedad razonable.
- Si el alumno pregunta muy bien, da información más útil.
- Si el alumno pregunta varias cosas a la vez, puedes responder a lo principal y dejar algo sin desarrollar.
- Si el alumno te interrumpe con tecnicismos, puedes contestar como alguien que no maneja ese lenguaje.

QUÉ HACER SEGÚN EL STAGE
${scopeRules}

ESTILO DE REALISMO
- Si el caso es irritable, transmite que el síntoma se dispara fácil.
- Si el caso es mecánico, habla en relación a movimiento, posturas, carga o repetición.
- Si el caso es neural, usa descripciones tipo hormigueo, corriente, adormecimiento, quemazón o tirón, sin sonar técnico.
- Si hay preocupación, miedo o frustración, deja que se note.
- Si te preguntan por intensidad del dolor, puedes dar número 0 a 10, pero como paciente, no como evaluador.
- Si te preguntan por exploración física en lenguaje sencillo, responde según el caso oculto.
- Si te piden tratamiento, tú solo hablas de lo que toleras, lo que te preocupa o lo que esperas, no propones un plan.

ERRORES QUE DEBES EVITAR
- No decir: “presento”, “refiero”, “el cuadro”, “la sintomatología”.
- No responder como si estuvieras rellenando una historia clínica.
- No dar una anamnesis completa espontáneamente.
- No sonar como ChatGPT.
- No sonar como OSCE artificial.

${buildInternalPatientBrief(spec, hiddenCase)}
`.trim();
}

function buildEvaluatorSystemPrompt({ trainingConfig }) {
  const stage = cleanEnum(
    trainingConfig?.stage,
    "ANAMNESIS_VALORACION_TRATAMIENTO"
  );

  return `
Eres un DOCENTE EVALUADOR universitario experto en fisioterapia clínica y razonamiento clínico.

Tu misión es evaluar la actuación del alumno según la calidad de su razonamiento, no según si adivina una etiqueta diagnóstica.

PRINCIPIOS DE EVALUACIÓN
- Premia la secuencia clínica con intención.
- Premia explorar comportamiento de síntomas, función, severidad, irritabilidad y evolución.
- Premia mantener varias hipótesis plausibles abiertas.
- Premia elegir exploración con propósito.
- Premia la seguridad clínica.
- Premia conclusiones funcionales y razonadas.

PENALIZA
- Preguntar mucho sin objetivo.
- Saltar demasiado pronto a una patología concreta.
- No explorar red flags cuando proceda.
- Explorar tests irrelevantes o excesivos.
- Conclusiones basadas en intuición sin sostén clínico.
- Hablar de tratamiento sin haber comprendido el caso.
- Comunicación pobre o poco centrada en el paciente.

TEN EN CUENTA EL ALCANCE DEL CASO
- Stage actual: ${stage}
- Si el caso está limitado a anamnesis, no castigues por no hacer exploración física.
- Si el caso incluye valoración, sí puedes valorar exploración e interpretación.
- Si el caso incluye tratamiento, valora si lo propuesto encaja con el cuadro.

FORMATO DE SALIDA
Devuelve EXCLUSIVAMENTE JSON válido, sin markdown, sin comentarios, sin texto antes ni después.

JSON EXACTO:
{
  "competencias": [
    { "id": "anamnesis", "score": 0, "feedback": "..." },
    { "id": "exploracion", "score": 0, "feedback": "..." },
    { "id": "razonamiento_clinico", "score": 0, "feedback": "..." },
    { "id": "tratamiento", "score": 0, "feedback": "..." },
    { "id": "comunicacion", "score": 0, "feedback": "..." }
  ],
  "global": {
    "score": 0,
    "resumen": "..."
  },
  "fortalezas": ["..."],
  "errores_clave": ["..."],
  "preguntas_omitidas": ["..."],
  "sesgos_detectados": ["..."],
  "siguiente_paso": "..."
}

REGLAS DEL JSON
- Scores enteros de 0 a 100.
- Feedback breve, específico y accionable.
- No inventes datos ausentes.
- Si algo no aplica por el stage, usa score prudente y explícalo brevemente.
`.trim();
}

function buildExamSystemPrompt() {
  return `
Eres un examinador clínico de fisioterapia.
Debes mantener coherencia clínica, claridad y exigencia razonable.
No inventes referencias bibliográficas ni citas.
No rellenes con teoría innecesaria.
`.trim();
}

function buildStudySystemPrompt() {
  return `
Eres un tutor académico de fisioterapia.
Explica con claridad, rigor y foco clínico.
No inventes citas, páginas ni referencias exactas si no están en el input.
Prioriza comprensión profunda y razonamiento aplicado.
`.trim();
}

function buildProgressSystemPrompt() {
  return `
Eres un analista docente de fisioterapia.
Identifica patrones del alumno, sesgos frecuentes, debilidades de razonamiento y prioridades de mejora.
Sé claro, útil y accionable.
`.trim();
}

/**
 * =========================================================
 * Llamada OpenAI
 * =========================================================
 */
async function callOpenAI({
  client,
  systemPrompt,
  history,
  userMessage,
  temperature = 0.25,
  max_output_tokens = 700,
}) {
  const messages = [
    { role: "system", content: systemPrompt.trim() },
    ...normalizeHistory(history),
    { role: "user", content: userMessage.trim() },
  ];

  const resp = await client.responses.create({
    model: MODEL,
    input: messages,
    temperature,
    max_output_tokens,
  });

  return (resp.output_text || "").trim();
}

/**
 * =========================================================
 * Handler
 * =========================================================
 */
export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return json(405, { error: "Method Not Allowed" });
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
      trainingConfig = {},
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

    /**
     * =====================================================
     * CASOS LIBRES
     * =====================================================
     */
    if (mode === "casos_libres") {
      if (action === "paciente") {
        const area = trainingConfig?.area || "MSK";
        const kb = pickKBByArea(area);

        const stableSeed =
          typeof seed === "string" && seed.trim()
            ? seed.trim()
            : [
                area,
                region || "auto",
                framework || "auto",
                pathology || "auto",
                difficulty || "basico",
              ].join("|");

        const spec = pickCaseSpecGeneric({
          kb,
          regionOrTopic: region,
          framework,
          pathology,
          seed: stableSeed,
          difficulty: difficulty || "basico",
        });

        const hiddenCase = buildHiddenCaseModel(spec, trainingConfig);
        const systemPrompt = buildPatientSystemPrompt({
          spec,
          hiddenCase,
          trainingConfig,
        });

        const reply = await callOpenAI({
          client,
          systemPrompt,
          history,
          userMessage: message,
          temperature: 0.2,
          max_output_tokens: 420,
        });

        return json(200, {
          reply,
          caseMeta: {
            region_or_topic: spec.region_or_topic,
            framework: spec.framework,
            pathology_hidden: spec.pathology,
            difficulty: spec.difficulty,
          },
        });
      }

      if (action === "evaluar") {
        const systemPrompt = buildEvaluatorSystemPrompt({ trainingConfig });

        const raw = await callOpenAI({
          client,
          systemPrompt,
          history,
          userMessage: message,
          temperature: 0.15,
          max_output_tokens: 900,
        });

        try {
          const evaluation = JSON.parse(raw);
          return json(200, { evaluation });
        } catch {
          return json(200, {
            evaluation: null,
            error: "La IA no devolvió JSON válido.",
            raw,
          });
        }
      }

      return json(400, {
        error:
          "Action inválida para 'casos_libres'. Usa 'paciente' o 'evaluar'.",
      });
    }

    /**
     * =====================================================
     * EXAMEN
     * =====================================================
     */
    if (mode === "examen") {
      const reply = await callOpenAI({
        client,
        systemPrompt: buildExamSystemPrompt(),
        history,
        userMessage: message,
        temperature: 0.3,
        max_output_tokens: 900,
      });

      return json(200, { reply });
    }

    /**
     * =====================================================
     * ESTUDIO
     * =====================================================
     */
    if (mode === "estudio") {
      const reply = await callOpenAI({
        client,
        systemPrompt: buildStudySystemPrompt(),
        history,
        userMessage: message,
        temperature: 0.2,
        max_output_tokens: 900,
      });

      return json(200, { reply });
    }

    /**
     * =====================================================
     * PROGRESO
     * =====================================================
     */
    if (mode === "progreso") {
      const reply = await callOpenAI({
        client,
        systemPrompt: buildProgressSystemPrompt(),
        history,
        userMessage: message,
        temperature: 0.25,
        max_output_tokens: 800,
      });

      return json(200, { reply });
    }

    return json(400, { error: "Modo inválido" });
  } catch (err) {
    console.error("FUNCTION ERROR:", err);

    const status = err?.status || err?.response?.status || 500;
    const message =
      err?.response?.data?.error?.message ||
      err?.message ||
      "Error interno";

    return json(status, { error: message });
  }
};
