import OpenAI from "openai";

// Ajustes simples para estabilidad/coste
const MAX_HISTORY_MESSAGES = 12; // recorta historial (últimos N mensajes)
const MODEL = "gpt-4o-mini";

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

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    if (!process.env.OPENAI_API_KEY) {
      return json(500, { error: "OPENAI_API_KEY missing" });
    }

    const body = JSON.parse(event.body || "{}");
    const { mode, action, message, history = [] } = body;

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
- Si te preguntan por síntomas graves (pérdida de fuerza súbita, fiebre, pérdida de control de esfínteres, etc.), responde con sinceridad acorde a tu historia (si existen, dilo; si no, dilo).

SALIDA
- Responde SOLO como paciente. No uses listas a menos que el alumno pida “enumera”.
`;
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
`;
          temperature = 0.2;
          max_output_tokens = 550;
          break;
        }

        return json(400, {
          error: "Action inválida para casos_libres. Usa 'paciente' o 'evaluar'.",
        });
      }

      case "examen": {
        // Puedes dividir luego en action=generar/corregir, pero para MVP vale.
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
`;
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
`;
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
`;
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
      error:
        err?.response?.data?.error?.message ||
        err?.message ||
        "Error interno",
    });
  }
};
