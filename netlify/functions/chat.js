import OpenAI from "openai";

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    // ✅ DEBUG SEGURO (NO imprime la key)
    const hasKey = !!process.env.OPENAI_API_KEY;
    console.log("ENV OPENAI_API_KEY exists:", hasKey);
    console.log(
      "ENV OPENAI* keys:",
      Object.keys(process.env).filter((k) => k.includes("OPENAI"))
    );

    if (!hasKey) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error:
            "OPENAI_API_KEY no está disponible en runtime. Revisa Environment variables (Functions/Runtime scopes) y redeploy.",
          openaiEnvKeys: Object.keys(process.env).filter((k) =>
            k.includes("OPENAI")
          ),
        }),
      };
    }

    const { message } = JSON.parse(event.body || "{}");
    if (!message || typeof message !== "string") {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Falta 'message' (string)" }),
      };
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const resp = await client.responses.create({
      model: "gpt-4o-mini",
      instructions:
        "Eres un asistente de fisioterapia para estudiantes. Responde claro y seguro. Si faltan datos, pregunta. No inventes.",
      input: message,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: resp.output_text }),
    };
  } catch (e) {
    console.error("FUNCTION ERROR:", e);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: e?.message || "Error desconocido" }),
    };
  }
};
