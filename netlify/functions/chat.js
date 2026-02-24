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

    if (!mode) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Falta 'mode'" }),
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
      case "casos_libres":
        if (action === "paciente") {
          systemPrompt = `
Eres un paciente real en consulta de fisioterapia.
REGLAS:
- No uses lenguaje técnico.
- No sugieras diagnóstico.
- No propongas pruebas.
- Responde solo a lo que te preguntan.
- Si no sabes algo, di que no lo sabes.
- Mantén coherencia con tu historia clínica.
          `;
          temperature = 0.2;
          max_output_tokens = 400;
        }

        if (action === "evaluar") {
          systemPrompt = 
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
- Si falta información para puntuar una competencia, no inventes: pon una puntuación conservadora y explica qué faltó.
- Mantén criterio consistente entre casos.

FORMATO JSON EXACTO:
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

      // -------------------------
      // 2️⃣ MODO EXAMEN
      // -------------------------
      case "examen":
        systemPrompt = `
Eres examinador de fisioterapia.
Genera o corrige casos clínicos tipo examen.

Responde estructurado, claro y sin divagar.
Evalúa por rúbrica cuando el alumno responda.
        `;
        temperature = 0.3;
        max_output_tokens = 700;
        break;

      // -------------------------
      // 3️⃣ MODO ESTUDIO
      // -------------------------
      case "estudio":
        systemPrompt = `
Eres tutor académico de fisioterapia.
Explica conceptos con rigor fisiopatológico.
No inventes datos.
Si falta información, indícalo.
Responde estructurado.
        `;
        temperature = 0.2;
        max_output_tokens = 600;
        break;

      // -------------------------
      // 4️⃣ PROGRESO
      // -------------------------
      case "progreso":
        systemPrompt = `
Analiza el rendimiento del alumno.
Detecta patrones de error.
Sugiere áreas de mejora.
Responde estructurado.
        `;
        temperature = 0.3;
        max_output_tokens = 500;
        break;

      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Modo inválido" }),
        };
    }

    // 🔷 CONSTRUCCIÓN DE MENSAJES
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

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: resp.output_text }),
    };
  } catch (err) {
    console.error("ERROR:", err);

    const status =
      err?.status || err?.response?.status || 500;

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
