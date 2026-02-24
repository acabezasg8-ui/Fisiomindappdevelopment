import OpenAI from "openai";

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    if (!process.env.OPENAI_API_KEY) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "OPENAI_API_KEY missing" }),
      };
    }

    const body = JSON.parse(event.body || "{}");
    const { mode, action, message, history = [] } = body;

    if (!mode || typeof mode !== "string") {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Falta 'mode' (string)" }),
      };
    }

    if (!action || typeof action !== "string") {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Falta 'action' (string)" }),
      };
    }

    if (!message || typeof message !== "string") {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Falta 'message' (string)" }),
      };
    }

    // history opcional pero si viene, validamos forma mínima
    if (!Array.isArray(history)) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "'history' debe ser un array" }),
      };
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // 🔵 CONFIG BASE
    let systemPrompt = "";
    let temperature = 0.3;
    let max_output_tokens = 600;

    // =========================
    // 🔷 SWITCH POR MODO
    // =========================
    switch (mode) {
      // -------------------------
      // 1️⃣ CASOS CLÍNICOS LIBRES
      // -------------------------
      case "casos_libres": {
        if (action === "paciente") {
          systemPrompt = `
Eres un paciente real en consulta de fisioterapia.

REGLAS:
- Habla como una persona normal (sin lenguaje técnico).
- No sugieras diagnósticos ni nombres de patologías.
- No propongas pruebas clínicas ni tratamientos.
- Responde SOLO a lo que te preguntan (no des información extra).
- Si no sabes algo o no te acuerdas, dilo.
- Mantén coherencia con tu historia clínica durante toda la conversación.
`;
          temperature = 0.2;
          max_output_tokens = 400;
          break;
        }

        if (action === "evaluar") {
          systemPrompt = `
Eres un docente universitario experto en fisioterapia clínica y evaluación por competencias.
Vas a evaluar el desempeño del alumno según 5 competencias:

1) Anamnesis
2) Exploración
3) Razonamiento clínico
4) Tratamiento
5) Comunicación

REGLAS:
- Devuelve EXCLUSIVAMENTE un JSON válido (sin texto extra, sin markdown).
- Puntuaciones de 0 a 100 (enteros).
- Feedback breve (1-2 frases) por competencia, específico y accionable.
- Si falta información para puntuar una competencia, NO inventes: asigna puntuación conservadora y explica qué faltó.
- Mantén criterio consistente entre casos.

FORMATO JSON EXACTO (respeta ids):
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
`;
          temperature = 0.2;
          max_output_tokens = 500;
          break;
        }

        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            error: "Action inválida para casos_libres. Usa 'paciente' o 'evaluar'.",
          }),
        };
      }

      // -------------------------
      // 2️⃣ MODO EXAMEN
      // -------------------------
      case "examen": {
        systemPrompt = `
Eres examinador de fisioterapia.
Genera o corrige casos clínicos tipo examen.

REGLAS:
- Responde estructurado, claro y sin divagar.
- Si te piden generar: crea un caso realista, con datos clínicos coherentes y pregunta final.
- Si te piden corregir: evalúa con criterios claros y sugiere mejoras.
- No inventes referencias científicas específicas.
`;
        temperature = 0.3;
        max_output_tokens = 700;
        break;
      }

      // -------------------------
      // 3️⃣ MODO ESTUDIO
      // -------------------------
      case "estudio": {
        systemPrompt = `
Eres tutor académico de fisioterapia.
Explica conceptos con rigor fisiopatológico.

REGLAS:
- No inventes datos.
- Si falta información o no se proporciona el documento/fragmento, indícalo.
- Responde estructurado (definición → claves → ejemplo → resumen si aplica).
`;
        temperature = 0.2;
        max_output_tokens = 600;
        break;
      }

      // -------------------------
      // 4️⃣ PROGRESO
      // -------------------------
      case "progreso": {
        systemPrompt = `
Eres un analista docente.
Analiza el rendimiento del alumno, detecta patrones de error y propone mejoras.

REGLAS:
- Sé concreto y accionable.
- Devuelve puntos fuertes, puntos débiles y plan de mejora.
`;
        temperature = 0.3;
        max_output_tokens = 500;
        break;
      }

      default:
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Modo inválido" }),
        };
    }

    // 🔷 CONSTRUCCIÓN DE MENSAJES
    // Nota: OpenAI Responses API acepta un array con roles en `input`
    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message },
    ];

    const resp = await client.responses.create({
      model: "gpt-4o-mini",
      input: messages,
      temperature,
      max_output_tokens,
    });

    const output = (resp.output_text || "").trim();

    // ✅ Si es evaluación, intentamos parsear JSON y devolvemos `evaluation`
    if (mode === "casos_libres" && action === "evaluar") {
      try {
        const evaluation = JSON.parse(output);
        return {
          statusCode: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ evaluation }),
        };
      } catch (parseErr) {
        // fallback: devolvemos raw para debug en frontend sin romperlo
        return {
          statusCode: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            evaluation: null,
            error: "La IA no devolvió JSON válido en evaluación.",
            raw: output,
          }),
        };
      }
    }

    // ✅ Respuesta normal (chat)
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: output }),
    };
  } catch (err) {
    console.error("ERROR:", err);

    // Propaga status si existe (ej. 429)
    const status = err?.status || err?.response?.status || 500;

    return {
      statusCode: status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error:
          err?.response?.data?.error?.message ||
          err?.message ||
          "Error interno",
      }),
    };
  }
};
