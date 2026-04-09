import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import {
  generateCaseFromTemplate,
  getAllFrameworks,
  PATHOLOGY_FRAMEWORKS,
} from "./pathology_templates.tsx";

const app = new Hono();

/**
 * =========================================================
 * Middlewares
 * =========================================================
 */
app.use("*", logger(console.log));

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

/**
 * =========================================================
 * Tipos
 * =========================================================
 */
type TrainingStage =
  | "ANAMNESIS"
  | "ANAMNESIS_VALORACION"
  | "ANAMNESIS_VALORACION_TRATAMIENTO";

type ClinicalArea = "MSK" | "NEURO" | "RESPI";

type TrainingConfig = {
  stage: TrainingStage;
  area?: ClinicalArea;
  academicLevel?: "1" | "2" | "3" | "4";
};

type StoredCaseData = {
  id: string;
  patientName: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  pathology: string;
  date: string;
  trainingConfig?: TrainingConfig;
  [key: string]: unknown;
};

type StoredExamCaseData = {
  id: string;
  caseStatement: string;
  isCustom: boolean;
  date: string;
  [key: string]: unknown;
};

/**
 * =========================================================
 * Helpers generales
 * =========================================================
 */
function jsonError(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function safeTrainingConfig(input: unknown): TrainingConfig | undefined {
  if (!input || typeof input !== "object") return undefined;

  const obj = input as Record<string, unknown>;
  const stage =
    obj.stage === "ANAMNESIS" ||
    obj.stage === "ANAMNESIS_VALORACION" ||
    obj.stage === "ANAMNESIS_VALORACION_TRATAMIENTO"
      ? obj.stage
      : undefined;

  const area =
    obj.area === "MSK" || obj.area === "NEURO" || obj.area === "RESPI"
      ? obj.area
      : undefined;

  const academicLevel =
    obj.academicLevel === "1" ||
    obj.academicLevel === "2" ||
    obj.academicLevel === "3" ||
    obj.academicLevel === "4"
      ? obj.academicLevel
      : undefined;

  if (!stage) return undefined;

  return {
    stage,
    area,
    academicLevel,
  };
}

function randomOf<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function buildCaseDate(): string {
  return new Date().toLocaleDateString("es-ES");
}

function normalizeGeneratedCase(rawCase: any, trainingConfig?: TrainingConfig): StoredCaseData {
  return {
    ...rawCase,
    id: String(rawCase?.id || Date.now()),
    patientName: rawCase?.patientName || "Paciente",
    age: Number(rawCase?.age || 35),
    gender: rawCase?.gender || "No especificado",
    chiefComplaint: rawCase?.chiefComplaint || "Refiere dolor y limitación funcional.",
    pathology: rawCase?.pathology || "Caso clínico musculoesquelético",
    date: rawCase?.date || buildCaseDate(),
    trainingConfig,
  };
}

function inferFrameworkKeysByArea(area?: ClinicalArea): string[] {
  const allKeys = Object.keys(PATHOLOGY_FRAMEWORKS || {});

  if (!area) return allKeys;

  const lowered = allKeys.map((key) => ({
    key,
    lower: key.toLowerCase(),
    name: String(PATHOLOGY_FRAMEWORKS[key]?.name || "").toLowerCase(),
  }));

  if (area === "MSK") {
    const neuroHints = ["neuro", "neurol", "vestib", "vertigo", "mareo"];
    const respiHints = ["respi", "asma", "epoc", "disnea", "pulmon"];
    return lowered
      .filter(
        ({ lower, name }) =>
          !neuroHints.some((h) => lower.includes(h) || name.includes(h)) &&
          !respiHints.some((h) => lower.includes(h) || name.includes(h))
      )
      .map((item) => item.key);
  }

  if (area === "NEURO") {
    const neuroHints = ["neuro", "neurol", "vestib", "vertigo", "mareo"];
    const filtered = lowered.filter(({ lower, name }) =>
      neuroHints.some((h) => lower.includes(h) || name.includes(h))
    );
    return filtered.length ? filtered.map((item) => item.key) : allKeys;
  }

  if (area === "RESPI") {
    const respiHints = ["respi", "asma", "epoc", "disnea", "pulmon"];
    const filtered = lowered.filter(({ lower, name }) =>
      respiHints.some((h) => lower.includes(h) || name.includes(h))
    );
    return filtered.length ? filtered.map((item) => item.key) : allKeys;
  }

  return allKeys;
}

function generateFallbackExamCase(): StoredExamCaseData {
  const localExamCases = [
    `PACIENTE: Mujer de 42 años, profesora de primaria, refiere dolor cervical bilateral de 3 semanas de evolución.

ANTECEDENTES: Sedentarismo, trabajo prolongado de pie y en flexión cervical (corrección de cuadernos), episodios previos de cervicalgia hace 2 años. Sin traumatismos recientes. Estrés laboral elevado.

SINTOMATOLOGÍA: Dolor sordo y constante en región cervical posterior, EVA 6/10, que aumenta al final de la jornada laboral y con movimientos de rotación. Irradia ocasionalmente hacia región escapular bilateral. Mejora parcialmente con calor local y reposo nocturno.

EXPLORACIÓN FÍSICA:
- Postura: Anteriorización de cabeza, hombros protruidos
- Palpación: Hipertonía y puntos gatillo en trapecios superiores bilateral, musculatura suboccipital tensa
- Rangos de movimiento cervical: Rotación limitada bilateral (60° dcha, 55° izq), extensión con molestias
- Tests neurodinámicos: Negativos
- Fuerza muscular: Conservada

OBJETIVO: Realizar diagnóstico fisioterápico, identificar factores contribuyentes y proponer plan de tratamiento inicial con objetivos SMART.`,

    `PACIENTE: Varón de 28 años, runner aficionado, presenta dolor en rodilla derecha desde hace 5 semanas.

ANTECEDENTES: Deportista activo (running 4-5 días/semana), aumentó volumen de entrenamiento hace 2 meses preparando media maratón. Sin lesiones previas en miembro inferior. Calzado deportivo con más de 800 km.

SINTOMATOLOGÍA: Dolor retropatelar derecho, EVA 5-6/10 durante y después de correr, especialmente al bajar escaleras. Sensación de "crepitación" al flexionar rodilla. Sin inflamación visible. Mejora con reposo de 2-3 días pero recidiva al retomar actividad.

EXPLORACIÓN FÍSICA:
- Observación: Leve valgo dinámico de rodilla en apoyo monopodal, debilidad aparente de glúteo medio
- Palpación: Dolor a la compresión patelar, bordes rotulianos sensibles (lateral > medial)
- Rangos de movimiento: Completos, crepitación palpable en flexo-extensión
- Tests específicos:
  * Test de compresión rotuliana: Positivo
  * Sentadilla monopodal: Reproduce dolor, valgo visible
  * Fuerza de cuádriceps: 4/5 (comparado con izquierda)

OBJETIVO: Establecer diagnóstico diferencial, explicar biomecánica de la lesión y diseñar programa de rehabilitación progresivo.`,
  ];

  return {
    id: String(Date.now()),
    caseStatement: randomOf(localExamCases),
    isCustom: false,
    date: buildCaseDate(),
  };
}

async function callOpenAIChat({
  system,
  user,
  temperature = 0.7,
  maxTokens = 700,
}: {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
}) {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey) return null;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const txt = await response.text().catch(() => "");
    throw new Error(`OpenAI API error: ${txt || response.status}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() || null;
}

/**
 * =========================================================
 * Health
 * =========================================================
 */
app.get("/make-server-eba6a2ba/health", (c) => {
  return c.json({ status: "ok" });
});

/**
 * =========================================================
 * Auth
 * =========================================================
 */
app.post("/make-server-eba6a2ba/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Email y contraseña son requeridos" }, 400);
    }

    const { createClient } = await import("jsr:@supabase/supabase-js@2");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      if (error?.message?.includes("Invalid login credentials")) {
        return c.json(
          {
            error:
              "Email o contraseña incorrectos. Si no tienes cuenta, regístrate primero.",
          },
          401
        );
      }

      if (error?.message?.includes("Email not confirmed")) {
        return c.json(
          {
            error: "Por favor confirma tu email antes de iniciar sesión.",
          },
          401
        );
      }

      return c.json(
        {
          error: error?.message || "Error al iniciar sesión.",
        },
        401
      );
    }

    const userName = data.user.user_metadata?.name || email.split("@")[0];

    return c.json({
      userId: data.user.id,
      userName,
      accessToken: data.session.access_token,
    });
  } catch (error) {
    console.error("Error in login endpoint:", error);
    return c.json(
      { error: `Error al iniciar sesión: ${error.message}` },
      500
    );
  }
});

app.post("/make-server-eba6a2ba/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json(
        { error: "Email, password y nombre son requeridos" },
        400
      );
    }

    if (password.length < 6) {
      return c.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        400
      );
    }

    const { createClient } = await import("jsr:@supabase/supabase-js@2");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true,
    });

    if (error) {
      if (
        error.message?.includes("already registered") ||
        error.message?.includes("duplicate") ||
        error.message?.includes("already been registered")
      ) {
        return c.json(
          {
            error:
              "Este email ya está registrado. Usa iniciar sesión en su lugar.",
          },
          400
        );
      }

      return c.json({ error: error.message || "Error al crear usuario" }, 400);
    }

    if (!data.user) {
      return c.json({ error: "No se pudo crear el usuario" }, 500);
    }

    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const { data: sessionData, error: sessionError } =
      await supabaseAnon.auth.signInWithPassword({
        email,
        password,
      });

    if (sessionError || !sessionData.session) {
      return c.json({
        userId: data.user.id,
        userName: name,
        message: "Cuenta creada. Por favor inicia sesión.",
      });
    }

    return c.json({
      userId: data.user.id,
      userName: name,
      accessToken: sessionData.session.access_token,
    });
  } catch (error) {
    console.error("Error in signup endpoint:", error);
    return c.json(
      { error: `Error al registrar usuario: ${error.message}` },
      500
    );
  }
});

/**
 * =========================================================
 * Cases
 * =========================================================
 */
app.post("/make-server-eba6a2ba/cases/save", async (c) => {
  try {
    const { userId, caseData } = await c.req.json();

    if (!userId || !caseData) {
      return c.json({ error: "Missing userId or caseData" }, 400);
    }

    const existingCases = safeArray<StoredCaseData>(
      await kv.get(`cases:${userId}`)
    );

    existingCases.push(caseData);

    await kv.set(`cases:${userId}`, existingCases);

    return c.json({ success: true });
  } catch (error) {
    console.error("Error saving case:", error);
    return c.json({ error: `Error saving case: ${error.message}` }, 500);
  }
});

app.get("/make-server-eba6a2ba/cases/get", async (c) => {
  try {
    const userId = c.req.query("userId");

    if (!userId) {
      return c.json({ error: "Missing userId" }, 400);
    }

    const cases = safeArray<StoredCaseData>(await kv.get(`cases:${userId}`));
    return c.json({ cases });
  } catch (error) {
    console.error("Error fetching cases:", error);
    return c.json({ error: `Error fetching cases: ${error.message}` }, 500);
  }
});

app.get("/make-server-eba6a2ba/cases/frameworks", (c) => {
  try {
    const frameworks = getAllFrameworks();
    return c.json({ frameworks });
  } catch (error) {
    console.error("Error fetching frameworks:", error);
    return c.json(
      { error: `Error fetching frameworks: ${error.message}` },
      500
    );
  }
});

app.post("/make-server-eba6a2ba/cases/generate", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const trainingConfig = safeTrainingConfig(body?.trainingConfig);

    const allowedFrameworkKeys = inferFrameworkKeysByArea(trainingConfig?.area);
    const frameworkPool =
      allowedFrameworkKeys.length > 0
        ? allowedFrameworkKeys
        : Object.keys(PATHOLOGY_FRAMEWORKS);

    const chosenFrameworkKey = randomOf(frameworkPool);
    const rawCase = generateCaseFromTemplate(chosenFrameworkKey);

    if (!rawCase) {
      throw new Error("Failed to generate case from template");
    }

    const newCase = normalizeGeneratedCase(rawCase, trainingConfig);

    return c.json({
      case: newCase,
      meta: {
        selectedFrameworkKey: chosenFrameworkKey,
        trainingConfig: trainingConfig || null,
      },
    });
  } catch (error) {
    console.error("Error generating case:", error);
    return c.json({ error: `Error generating case: ${error.message}` }, 500);
  }
});

app.post("/make-server-eba6a2ba/cases/generate-specific", async (c) => {
  try {
    const { frameworkKey, trainingConfig } = await c.req.json();

    if (!frameworkKey) {
      return c.json({ error: "frameworkKey is required" }, 400);
    }

    const rawCase = generateCaseFromTemplate(frameworkKey);

    if (!rawCase) {
      return c.json({ error: `Framework ${frameworkKey} not found` }, 404);
    }

    const newCase = normalizeGeneratedCase(
      rawCase,
      safeTrainingConfig(trainingConfig)
    );

    return c.json({ case: newCase });
  } catch (error) {
    console.error("Error generating specific case:", error);
    return c.json({ error: `Error generating case: ${error.message}` }, 500);
  }
});

/**
 * =========================================================
 * AI config
 * =========================================================
 */
app.get("/make-server-eba6a2ba/ai/check", (c) => {
  const hasKey = !!Deno.env.get("OPENAI_API_KEY");
  return c.json({ hasKey });
});

/**
 * =========================================================
 * Legacy AI endpoints
 * =========================================================
 * Se mantienen por compatibilidad, pero la lógica clínica principal
 * ya vive en /.netlify/functions/chat
 */
app.post("/make-server-eba6a2ba/ai/response", async (c) => {
  try {
    const { caseData } = await c.req.json();

    const fallback =
      caseData?.patientName && caseData?.chiefComplaint
        ? `Hola, soy ${caseData.patientName}. ${caseData.chiefComplaint}`
        : "Hola, cuéntame qué te ocurre.";

    return c.json({
      response: fallback,
      deprecated: true,
      message:
        "Este endpoint es legacy. La lógica clínica principal usa /.netlify/functions/chat",
    });
  } catch (error) {
    console.error("Error in legacy ai/response:", error);
    return c.json({ error: `Error generating response: ${error.message}` }, 500);
  }
});

app.post("/make-server-eba6a2ba/ai/evaluation", async (c) => {
  try {
    return c.json({
      evaluation: null,
      deprecated: true,
      message:
        "Este endpoint es legacy. La evaluación clínica principal usa /.netlify/functions/chat",
    });
  } catch (error) {
    console.error("Error in legacy ai/evaluation:", error);
    return c.json({ error: `Error generating evaluation: ${error.message}` }, 500);
  }
});

/**
 * =========================================================
 * Exam
 * =========================================================
 */
app.post("/make-server-eba6a2ba/exam/generate", async (c) => {
  try {
    const system =
      "Eres un profesor de fisioterapia creando casos clínicos de examen. Generas casos realistas, claros y bien estructurados.";
    const user = `Genera un caso clínico de fisioterapia en formato examen profesional. Debe incluir:
1. Datos del paciente
2. Antecedentes relevantes
3. Características del dolor o problema
4. Exploración física con hallazgos objetivos
5. Objetivo para el estudiante

Requisitos:
- Patologías comunes y realistas
- Español profesional
- Nivel universitario
- Texto claro y útil para razonamiento clínico

Devuelve solo el texto del caso.`;

    let caseStatement: string | null = null;

    try {
      caseStatement = await callOpenAIChat({
        system,
        user,
        temperature: 0.8,
        maxTokens: 700,
      });
    } catch (error) {
      console.error("OpenAI exam generation error:", error);
    }

    const examCase = caseStatement
      ? {
          id: String(Date.now()),
          caseStatement,
          isCustom: false,
          date: buildCaseDate(),
        }
      : generateFallbackExamCase();

    return c.json({ examCase });
  } catch (error) {
    console.error("Error generating exam case:", error);
    return c.json({ error: `Error generating exam case: ${error.message}` }, 500);
  }
});

app.post("/make-server-eba6a2ba/exam/save", async (c) => {
  try {
    const { userId, examCaseData } = await c.req.json();

    if (!userId || !examCaseData) {
      return c.json({ error: "Missing userId or examCaseData" }, 400);
    }

    const existingExamCases = safeArray<StoredExamCaseData>(
      await kv.get(`exam-cases:${userId}`)
    );

    existingExamCases.push(examCaseData);

    await kv.set(`exam-cases:${userId}`, existingExamCases);

    return c.json({ success: true });
  } catch (error) {
    console.error("Error saving exam case:", error);
    return c.json({ error: `Error saving exam case: ${error.message}` }, 500);
  }
});

app.get("/make-server-eba6a2ba/exam/get", async (c) => {
  try {
    const userId = c.req.query("userId");

    if (!userId) {
      return c.json({ error: "Missing userId" }, 400);
    }

    const examCases = safeArray<StoredExamCaseData>(
      await kv.get(`exam-cases:${userId}`)
    );

    return c.json({ examCases });
  } catch (error) {
    console.error("Error fetching exam cases:", error);
    return c.json(
      { error: `Error fetching exam cases: ${error.message}` },
      500
    );
  }
});

/**
 * =========================================================
 * Study
 * =========================================================
 */
app.post("/make-server-eba6a2ba/study/explain", async (c) => {
  try {
    const { content, question, chatHistory } = await c.req.json();

    if (!content || !question) {
      return c.json({ error: "Content and question are required" }, 400);
    }

    const conversationContext = safeArray<any>(chatHistory)
      .map((msg) => `${msg.role === "student" ? "Estudiante" : "Tutor"}: ${msg.content}`)
      .join("\n");

    try {
      const explanation = await callOpenAIChat({
        system:
          "Eres un tutor pedagógico experto en fisioterapia, claro, didáctico y profesional.",
        user: `CONTENIDO DE ESTUDIO:
${content}

HISTORIAL DE CONVERSACIÓN:
${conversationContext || "Esta es la primera pregunta"}

PREGUNTA DEL ESTUDIANTE:
${question}

Responde de forma pedagógica, rigurosa y clara. Máximo 300 palabras.`,
        temperature: 0.7,
        maxTokens: 500,
      });

      if (explanation) {
        return c.json({ explanation });
      }
    } catch (error) {
      console.error("OpenAI study explanation error:", error);
    }

    const genericResponse = `He analizado tu pregunta sobre el contenido. Para entenderlo mejor:
1. Identifica los conceptos clave
2. Relaciónalos con casos clínicos
3. Intenta explicarlo con tus propias palabras

En fisioterapia importa tanto la teoría como su aplicación clínica real.`;

    return c.json({ explanation: genericResponse });
  } catch (error) {
    console.error("Error in study explain endpoint:", error);
    return c.json({ error: `Error explaining content: ${error.message}` }, 500);
  }
});

app.post("/make-server-eba6a2ba/study/quiz", async (c) => {
  try {
    const { content } = await c.req.json();

    if (!content) {
      return c.json({ error: "Content is required" }, 400);
    }

    try {
      const rawQuiz = await callOpenAIChat({
        system:
          "Eres un profesor de fisioterapia experto en evaluación. Respondes siempre en JSON válido.",
        user: `Basándote en este contenido:

${content}

Genera:
1. Un resumen breve
2. 5 preguntas tipo test con 4 opciones
3. Respuesta correcta y explicación breve

Devuelve JSON con este formato:
{
  "summary": "...",
  "questions": [
    {
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "..."
    }
  ]
}`,
        temperature: 0.8,
        maxTokens: 1500,
      });

      if (rawQuiz) {
        const cleaned = rawQuiz
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();

        const parsedQuiz = JSON.parse(cleaned);
        return c.json({ quiz: parsedQuiz });
      }
    } catch (error) {
      console.error("OpenAI quiz generation error:", error);
    }

    const genericQuiz = {
      summary:
        "Has cargado contenido de estudio de fisioterapia. El objetivo es comprender los conceptos y saber aplicarlos clínicamente.",
      questions: [
        {
          question: "¿Cuál es el objetivo principal de estudiar este contenido?",
          options: [
            "Memorizar términos",
            "Comprender conceptos y aplicarlos clínicamente",
            "Aprobar sin entender",
            "Repetir definiciones",
          ],
          correctAnswer: "B",
          explanation:
            "Lo importante es comprender el contenido y trasladarlo a situaciones clínicas reales.",
        },
      ],
    };

    return c.json({ quiz: genericQuiz });
  } catch (error) {
    console.error("Error in quiz generation endpoint:", error);
    return c.json({ error: `Error generating quiz: ${error.message}` }, 500);
  }
});

Deno.serve(app.fetch);
