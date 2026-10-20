import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { generateCaseFromTemplate, getAllFrameworks, PATHOLOGY_FRAMEWORKS } from "./pathology_templates.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);


// Authenticate the student with Supabase Auth; never trust client-supplied userId.
async function authenticatedStudent(c: any) {
  const authorization = c.req.header("Authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!token) return null;
  const { createClient } = await import("jsr:@supabase/supabase-js@2");
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data, error } = await supabase.auth.getUser(token);
  return error ? null : data.user;
}

// Require a real student session before invoking paid AI endpoints.
// This also applies to study and exam features, not only free simulation.
const protectedAIPrefixes = [
  "/make-server-eba6a2ba/ai/response",
  "/make-server-eba6a2ba/ai/evaluation",
  "/make-server-eba6a2ba/exam/generate",
  "/make-server-eba6a2ba/exam/evaluation",
  "/make-server-eba6a2ba/study/explain",
  "/make-server-eba6a2ba/study/quiz",
  "/make-server-eba6a2ba/ai/check",
  "/make-server-eba6a2ba/cases/generate",
  "/make-server-eba6a2ba/cases/generate-specific",
];
app.use("*", async (c, next) => {
  if (protectedAIPrefixes.includes(c.req.path)) {
    const student = await authenticatedStudent(c);
    if (!student) return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
});

// Health check endpoint
app.get("/make-server-eba6a2ba/health", (c) => {
  return c.json({ status: "ok" });
});

// Auth - Login
app.post("/make-server-eba6a2ba/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: "Email y contraseÃ±a son requeridos" }, 400);
    }

    console.log(`Attempting login for: ${email}`);

    const { createClient } = await import("jsr:@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error || !data.session) {
      console.error(`Login failed for ${email}:`, error?.message);
      
      // Mensaje mÃ¡s claro para el usuario
      if (error?.message?.includes('Invalid login credentials')) {
        console.log(`User not found or wrong password: ${email}. They may need to sign up first.`);
        return c.json({ 
          error: "Email o contraseÃ±a incorrectos. Si no tienes cuenta, haz clic en 'Registrarse' para crear una nueva." 
        }, 401);
      }
      
      if (error?.message?.includes('Email not confirmed')) {
        return c.json({ 
          error: "Por favor confirma tu email antes de iniciar sesiÃ³n." 
        }, 401);
      }
      
      return c.json({ 
        error: error?.message || "Error al iniciar sesiÃ³n. Por favor verifica tus credenciales." 
      }, 401);
    }

    const userName = data.user.user_metadata?.name || email.split('@')[0];

    console.log(`âœ“ User logged in successfully: ${email} (ID: ${data.user.id})`);
    return c.json({ 
      userId: data.user.id,
      userName: userName,
      accessToken: data.session.access_token,
    });

  } catch (error) {
    console.error("Error in login endpoint:", error);
    return c.json({ error: `Error al iniciar sesiÃ³n: ${error.message}` }, 500);
  }
});

// Auth - Sign Up
app.post("/make-server-eba6a2ba/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: "Email, password y nombre son requeridos" }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: "La contraseÃ±a debe tener al menos 6 caracteres" }, 400);
    }

    console.log(`Attempting signup for: ${email}`);

    const { createClient } = await import("jsr:@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      user_metadata: { name: name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error(`Signup failed for ${email}:`, error.message);
      
      // Mensaje mÃ¡s claro para usuario duplicado
      if (error.message?.includes('already registered') || error.message?.includes('duplicate') || error.message?.includes('already been registered')) {
        console.log(`User already exists: ${email}`);
        return c.json({ error: "Este email ya estÃ¡ registrado. Por favor usa 'Iniciar SesiÃ³n' en su lugar." }, 400);
      }
      
      return c.json({ error: error.message || "Error al crear el usuario" }, 400);
    }

    if (!data.user) {
      console.error("User creation returned no user data");
      return c.json({ error: "No se pudo crear el usuario" }, 500);
    }

    console.log(`âœ“ User created successfully: ${email} (ID: ${data.user.id})`);

    // Iniciar sesiÃ³n automÃ¡ticamente despuÃ©s del registro usando ANON_KEY (no SERVICE_ROLE_KEY)
    console.log(`Attempting auto-login for: ${email}`);
    const supabaseAnon = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );
    
    const { data: sessionData, error: sessionError } = await supabaseAnon.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (sessionError || !sessionData.session) {
      // Usuario creado pero no se pudo iniciar sesiÃ³n automÃ¡ticamente
      console.error(`Auto-login failed for ${email}:`, sessionError?.message);
      console.log(`User can login manually with email: ${email}`);
      return c.json({ 
        userId: data.user.id,
        userName: name,
        message: "Cuenta creada. Por favor inicia sesiÃ³n.",
      });
    }

    console.log(`âœ“ User auto-logged in successfully: ${email}`);
    return c.json({ 
      userId: data.user.id,
      userName: name,
      accessToken: sessionData.session.access_token,
    });

  } catch (error) {
    console.error("Error in signup endpoint:", error);
    return c.json({ error: `Error al registrar usuario: ${error.message}` }, 500);
  }
});

// Guardar un caso completado
app.post("/make-server-eba6a2ba/cases/save", async (c) => {
  try {
    const { caseData } = await c.req.json();
    const student = await authenticatedStudent(c);
    if (!student) return c.json({ error: "Unauthorized" }, 401);
    const userId = student.id;
    
    if (!userId || !caseData) {
      return c.json({ error: "Missing userId or caseData" }, 400);
    }

    // Obtener casos existentes
    const existingCases = await kv.get(`cases:${userId}`) || [];
    
    // AÃ±adir el nuevo caso
    existingCases.push(caseData);
    
    // Guardar de vuelta
    await kv.set(`cases:${userId}`, existingCases);
    
    console.log(`Case saved for user ${userId}. Total cases: ${existingCases.length}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error saving case:", error);
    return c.json({ error: `Error saving case: ${error.message}` }, 500);
  }
});

// Obtener casos completados
app.get("/make-server-eba6a2ba/cases/get", async (c) => {
  try {
    const student = await authenticatedStudent(c);
    if (!student) return c.json({ error: "Unauthorized" }, 401);
    const userId = student.id;
    
    console.log(`Fetching cases for user: ${userId}`);
    
    if (!userId) {
      console.error("Missing userId parameter");
      return c.json({ error: "Missing userId" }, 400);
    }

    const cases = await kv.get(`cases:${userId}`) || [];
    
    console.log(`âœ“ Retrieved ${cases.length} cases for user ${userId}`);
    
    return c.json({ cases });
  } catch (error) {
    console.error("Error fetching cases:", error.message, error.stack);
    return c.json({ error: `Error fetching cases: ${error.message}` }, 500);
  }
});

// Obtener lista de marcos fisiopatolÃ³gicos disponibles
app.get("/make-server-eba6a2ba/cases/frameworks", (c) => {
  try {
    console.log("Fetching available pathology frameworks...");
    const frameworks = getAllFrameworks();
    console.log(`âœ“ Retrieved ${frameworks.length} frameworks`);
    return c.json({ frameworks });
  } catch (error) {
    console.error("Error fetching frameworks:", error.message);
    return c.json({ error: `Error fetching frameworks: ${error.message}` }, 500);
  }
});

// Generar nuevo caso clÃ­nico usando marcos fisiopatolÃ³gicos
app.post("/make-server-eba6a2ba/cases/generate", async (c) => {
  try {
    console.log("Generating new case from pathology frameworks...");
    
    // Seleccionar un marco fisiopatolÃ³gico aleatorio
    const frameworkKeys = Object.keys(PATHOLOGY_FRAMEWORKS);
    const randomFrameworkKey = frameworkKeys[Math.floor(Math.random() * frameworkKeys.length)];
    
    console.log(`Selected framework: ${PATHOLOGY_FRAMEWORKS[randomFrameworkKey].name}`);
    
    // Generar caso desde el template
    const newCase = generateCaseFromTemplate(randomFrameworkKey);
    
    if (!newCase) {
      throw new Error("Failed to generate case from template");
    }

    console.log(`âœ“ Generated new case: ${newCase.patientName} - ${newCase.pathology}`);
    
    return c.json({ case: newCase });
  } catch (error) {
    console.error("Error generating case:", error.message, error.stack);
    return c.json({ error: `Error generating case: ${error.message}` }, 500);
  }
});

// Generar caso especÃ­fico de un marco fisiopatolÃ³gico
app.post("/make-server-eba6a2ba/cases/generate-specific", async (c) => {
  try {
    const { frameworkKey } = await c.req.json();
    
    if (!frameworkKey) {
      return c.json({ error: "frameworkKey is required" }, 400);
    }
    
    console.log(`Generating case from specific framework: ${frameworkKey}`);
    
    const newCase = generateCaseFromTemplate(frameworkKey);
    
    if (!newCase) {
      return c.json({ error: `Framework ${frameworkKey} not found` }, 404);
    }

    console.log(`âœ“ Generated case from ${frameworkKey}: ${newCase.patientName} - ${newCase.pathology}`);
    
    return c.json({ case: newCase });
  } catch (error) {
    console.error("Error generating specific case:", error.message, error.stack);
    return c.json({ error: `Error generating case: ${error.message}` }, 500);
  }
});

// Verificar si OpenAI estÃ¡ configurado
app.get("/make-server-eba6a2ba/ai/check", (c) => {
  const hasKey = !!Deno.env.get("OPENAI_API_KEY");
  return c.json({ hasKey });
});

// Generar respuesta de IA
app.post("/make-server-eba6a2ba/ai/response", async (c) => {
  try {
    const { message, caseData, chatHistory, isExamMode } = await c.req.json();
    
    // Intentar usar OpenAI si estÃ¡ configurado
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (openaiKey) {
      try {
        // Preparar informaciÃ³n clÃ­nica detallada si estÃ¡ disponible
        const clinicalDetailsText = caseData.clinicalDetails ? `

INFORMACIÃ“N CLÃNICA DETALLADA (USO INTERNO - NO REVELAR DIRECTAMENTE):
- Tipo de inicio: ${caseData.clinicalDetails.onsetType}
- CronologÃ­a: ${caseData.clinicalDetails.chronologyWeeks} semanas
- Factores agravantes: ${caseData.clinicalDetails.aggravatingFactors.join(', ')}
- Factores aliviantes: ${caseData.clinicalDetails.relievingFactors.join(', ')}
- OcupaciÃ³n: ${caseData.occupation}

HALLAZGOS DE EXPLORACIÃ“N FÃSICA (responder segÃºn corresponda):
- PalpaciÃ³n: ${caseData.clinicalDetails.physicalFindings.palpation}
- Rango de movimiento: ${caseData.clinicalDetails.physicalFindings.rom}
- Fuerza muscular: ${caseData.clinicalDetails.physicalFindings.strength}
- Tests especiales: ${caseData.clinicalDetails.physicalFindings.specialTests}` : '';

        // Prompt diferente para modo examen (tutor) vs simulaciÃ³n (paciente)
        const systemPrompt = isExamMode ? 
        `Eres un TUTOR EXPERTO de fisioterapia ayudando a un estudiante a resolver un caso clÃ­nico de examen.

TU ROL: Guiar al estudiante hacia la soluciÃ³n correcta mediante el mÃ©todo socrÃ¡tico, sin dar respuestas directas.

CASO CLÃNICO:
- Paciente: ${caseData.age} aÃ±os, ${caseData.gender}
- OcupaciÃ³n: ${caseData.occupation || 'no especificada'}
- Motivo de consulta: ${caseData.chiefComplaint}
${clinicalDetailsText}

ESTRATEGIA PEDAGÃ“GICA:
1. Cuando te pregunten â†’ Responde con otra pregunta que les haga pensar
2. Si van por buen camino â†’ Refuerza positivamente y anima a profundizar
3. Si estÃ¡n perdidos â†’ Da pistas indirectas que les orienten
4. Si cometen errores â†’ Pregunta por quÃ© piensan eso y guÃ­ales sutilmente
5. EnseÃ±a el RAZONAMIENTO, no solo la respuesta

ÃREAS A CUBRIR:
- IdentificaciÃ³n de datos clave del enunciado
- AnatomÃ­a y biomecÃ¡nica relevante
- DiagnÃ³stico diferencial (2-3 opciones)
- JustificaciÃ³n del diagnÃ³stico principal
- Objetivos terapÃ©uticos SMART
- Plan de tratamiento basado en evidencia
- EducaciÃ³n y prevenciÃ³n

ESTILO DE COMUNICACIÃ“N:
- SocrÃ¡tico: "Â¿QuÃ© estructuras anatÃ³micas estÃ¡n implicadas segÃºn la localizaciÃ³n?"
- Positivo: "Exacto, vas por buen camino. Â¿Y quÃ© mÃ¡s?"
- Orientador: "Piensa en la edad y ocupaciÃ³n del paciente. Â¿QuÃ© te sugiere?"
- Explicativo cuando lo pidan: "Te explico el porquÃ©..."

NUNCA des la respuesta completa directamente. Objetivo: que el estudiante APRENDA y RAZONE.

MantÃ©n respuestas de 2-4 frases, claras y motivadoras.`
        :
        `Eres un PACIENTE REAL que acude a consulta de fisioterapia. Tu comportamiento debe ser 100% realista.

INFORMACIÃ“N DEL PACIENTE:
- Nombre: ${caseData.patientName}
- Edad: ${caseData.age} aÃ±os
- GÃ©nero: ${caseData.gender}
- OcupaciÃ³n: ${caseData.occupation || 'no especificada'}
- Queja: ${caseData.chiefComplaint}
${clinicalDetailsText}

1. PRIMER MENSAJE - Saluda y di tu queja SIMPLE:
   - "Hola doctor, vengo con un dolor de rodilla que no se me pasa"
   - "Buenas, llevo dÃ­as con dolor de cabeza y cuello rÃ­gido"
   - NO des detalles ni uses tÃ©rminos mÃ©dicos

2. RESPONDE SOLO LO QUE TE PREGUNTEN:
   - NO sabes quÃ© tienes (NUNCA digas "tendinitis", "hernia", tÃ©rminos mÃ©dicos)
   - Sensaciones simples: "me duele", "no puedo...", "siento que..."
   - Si dolor: intensidad simple ("mucho", "poco"), tipo cotidiano ("punzante", "sordo")
   - Si cuÃ¡ndo empezÃ³: aproximado ("hace unas semanas", "unos dÃ­as")
   - Si exploraciÃ³n: responde natural segÃºn hallazgos ("Ay duele", "No llego", "Tira")
   - 1-3 frases mÃ¡ximo, habla como paciente real
   - NUNCA digas diagnÃ³stico ni tÃ©rminos mÃ©dicos

3. PISTAS si olvidan:
   - Tras 5-6 mensajes sin explorar: "Â¿No me va a revisar?"
   - Si no preguntan cronologÃ­a: "llevo tiempo asÃ­"`;

        const messages = [
          { role: "system", content: systemPrompt },
          ...chatHistory.slice(-12).map((msg: any) => ({
            role: msg.role === 'student' ? 'user' : 'assistant',
            content: msg.message,
          })),
          { role: "user", content: message },
        ];

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: messages,
            temperature: 0.8,
            max_tokens: 200,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const aiResponse = data.choices[0].message.content;
          console.log(`OpenAI response generated for case: ${caseData.patientName}`);
          return c.json({ response: aiResponse });
        }
      } catch (error) {
        console.error("OpenAI API error:", error);
        // Fallback a respuesta local
      }
    }

    // Respuesta local mejorada si no hay OpenAI configurado
    const localResponse = generateLocalResponse(message, caseData, chatHistory);
    console.log(`Local response generated for case: ${caseData.patientName}`);
    return c.json({ response: localResponse });
    
  } catch (error) {
    console.error("Error generating AI response:", error);
    return c.json({ error: `Error generating response: ${error.message}` }, 500);
  }
});

// FunciÃ³n para generar respuestas locales mejoradas
function generateLocalResponse(message: string, caseData: any, chatHistory: any[]): string {
  const lowerMessage = message.toLowerCase();
  const studentMessages = chatHistory.filter(msg => msg.role === 'student');
  const messageCount = studentMessages.length;
  
  // PRIMER MENSAJE - Saludo inicial del paciente
  if (messageCount === 0 || (messageCount === 1 && (lowerMessage.includes('hola') || lowerMessage.includes('buenos') || lowerMessage.includes('buenas') || lowerMessage.includes('pase')))) {
    // El paciente se presenta con queja simple y general
    const simpleGreetings = [
      `Hola doctor, vengo porque ${caseData.chiefComplaint.toLowerCase()}`,
      `Buenas, ${caseData.chiefComplaint.toLowerCase()}`,
      `Hola, necesito que me vea porque ${caseData.chiefComplaint.toLowerCase()}`
    ];
    return simpleGreetings[Math.floor(Math.random() * simpleGreetings.length)];
  }
  
  // Analizar si han hecho preguntas clave
  const hasAskedPain = chatHistory.some(msg => 
    msg.role === 'student' && (msg.message.toLowerCase().includes('dolor') || msg.message.toLowerCase().includes('molestia'))
  );
  const hasAskedOnset = chatHistory.some(msg => 
    msg.role === 'student' && (msg.message.toLowerCase().includes('cuÃ¡ndo') || msg.message.toLowerCase().includes('empezÃ³'))
  );
  const hasAskedWork = chatHistory.some(msg => 
    msg.role === 'student' && (msg.message.toLowerCase().includes('trabajo') || msg.message.toLowerCase().includes('actividad'))
  );
  const hasExamined = chatHistory.some(msg => 
    msg.role === 'student' && (msg.message.toLowerCase().includes('exploraciÃ³n') || msg.message.toLowerCase().includes('examinar') || msg.message.toLowerCase().includes('movimiento'))
  );
  
  // RESPUESTAS ESPECÃFICAS SEGÃšN PATOLOGÃA Y PREGUNTA

  // PREGUNTAS SOBRE CARACTERÃSTICAS DEL DOLOR
  if (lowerMessage.includes('dolor') || lowerMessage.includes('molestia') || lowerMessage.includes('duele')) {
    if (lowerMessage.includes('intensidad') || lowerMessage.includes('eva') || lowerMessage.includes('escala') || lowerMessage.includes('cuÃ¡nto')) {
      if (caseData.pathology.includes('cervical')) {
        return 'Pues bastante, dirÃ­a que un 6 Ã³ 7. Hay dÃ­as que es insoportable.';
      } else if (caseData.pathology.includes('lumbar')) {
        return 'Cuando estoy sentado mucho rato es muy fuerte, un 7 fÃ¡cilmente.';
      } else if (caseData.pathology.includes('hombro') || caseData.pathology.includes('supraespinoso')) {
        return 'En reposo casi nada, pero al levantar el brazo me duele muchÃ­simo, un 8.';
      } else {
        return 'Depende del momento, pero suele estar en 6 Ã³ 7 cuando me molesta.';
      }
    }
    
    if (lowerMessage.includes('tipo') || lowerMessage.includes('cÃ³mo') || lowerMessage.includes('describe')) {
      if (caseData.pathology.includes('cervical')) {
        return 'Es como una tensiÃ³n constante, un dolor sordo y profundo en la parte posterior del cuello. A veces irradia hacia los trapecios y la base del crÃ¡neo, como si llevara un peso encima.';
      } else if (caseData.pathology.includes('lumbar')) {
        return 'Es un dolor difuso, como una rigidez constante en la zona lumbar. No es punzante, mÃ¡s bien es un dolor sordo que se intensifica con ciertas posiciones.';
      } else if (caseData.pathology.includes('hombro') || caseData.pathology.includes('supraespinoso')) {
        return 'Es un dolor punzante y agudo cuando hago ciertos movimientos, especialmente al levantar el brazo lateralmente o al intentar alcanzar algo por encima de mi cabeza. En reposo es mÃ¡s bien una molestia sorda.';
      } else if (caseData.pathology.includes('rodilla') || caseData.pathology.includes('patelofemoral')) {
        return 'Siento como una presiÃ³n profunda detrÃ¡s de la rÃ³tula, especialmente notable al subir escaleras. A veces tambiÃ©n noto crepitaciÃ³n, como un "crujido" al flexionar la rodilla.';
      } else if (caseData.pathology.includes('plantar')) {
        return 'Es como una punzada muy aguda en el talÃ³n, especialmente con los primeros pasos de la maÃ±ana. Luego se convierte en un dolor mÃ¡s sordo y constante si estoy mucho tiempo de pie.';
      } else if (caseData.pathology.includes('epicondilitis') || caseData.pathology.includes('codo')) {
        return 'Es un dolor agudo en la parte externa del codo que se intensifica al agarrar objetos o al girar la muÃ±eca. A veces irradia hacia el antebrazo.';
      }
    }
    
    // Pregunta general sobre dolor
    if (caseData.pathology.includes('cervical')) {
      return 'El dolor estÃ¡ localizado principalmente en la zona posterior del cuello, bilateral pero mÃ¡s intenso en el lado derecho. Lo noto especialmente al final del dÃ­a despuÃ©s de horas frente al ordenador.';
    } else if (caseData.pathology.includes('lumbar')) {
      return 'El dolor se concentra en la regiÃ³n lumbar baja, es bilateral y se agrava mucho con la sedestaciÃ³n prolongada. Mejora ligeramente al caminar o cambiar de posiciÃ³n.';
    } else if (caseData.pathology.includes('hombro') || caseData.pathology.includes('supraespinoso')) {
      return 'El dolor estÃ¡ en el hombro derecho, especÃ­ficamente en la regiÃ³n lateral. Es muy agudo con la elevaciÃ³n del brazo, especialmente entre 60Â° y 120Â° de abducciÃ³n.';
    } else if (caseData.pathology.includes('rodilla')) {
      return 'Siento el dolor en la parte anterior de la rodilla derecha, justo detrÃ¡s de la rÃ³tula. Se intensifica al subir escaleras, agacharme o tras estar sentado mucho tiempo.';
    } else if (caseData.pathology.includes('manos') || caseData.pathology.includes('artrosis')) {
      return 'Las manos me duelen y estÃ¡n muy rÃ­gidas, especialmente por las maÃ±anas. Afecta sobre todo a las articulaciones interfalÃ¡ngicas. Me limita para tareas que requieren precisiÃ³n.';
    } else if (caseData.pathology.includes('plantar') || caseData.pathology.includes('pie')) {
      return 'El dolor es muy intenso en el talÃ³n y la zona medial de la planta del pie. Los primeros pasos al levantarme son casi insoportables, luego mejora algo pero vuelve con actividad prolongada.';
    } else if (caseData.pathology.includes('codo') || caseData.pathology.includes('epicondilitis')) {
      return 'Me duele mucho la parte externa del codo derecho, en el epicÃ³ndilo lateral. Se intensifica al agarrar objetos, girar la muÃ±eca o al jugar al tenis.';
    } else if (caseData.pathology.includes('contractura') || caseData.pathology.includes('paravertebral')) {
      return 'Tengo un dolor muy intenso en la espalda media-baja, unilateral en el lado derecho. Noto la musculatura muy tensa y contracturada. Cualquier movimiento me duele.';
    }
  }

  // PREGUNTAS SOBRE INICIO Y CRONOLOGÃA
  if (lowerMessage.includes('cuÃ¡ndo') || lowerMessage.includes('cuando') || lowerMessage.includes('empezÃ³') || lowerMessage.includes('comenzÃ³') || lowerMessage.includes('inicio') || lowerMessage.includes('tiempo')) {
    if (caseData.pathology.includes('cervical')) {
      return 'EmpecÃ© a notarlo hace unas 2-3 semanas. CoincidiÃ³ con un perÃ­odo de mucho estrÃ©s en el trabajo y jornadas muy largas frente al ordenador. Al principio era una molestia leve, pero ha ido empeorando progresivamente.';
    } else if (caseData.pathology.includes('lumbar')) {
      return 'Llevo con este dolor aproximadamente 3-4 meses. EmpezÃ³ de forma gradual, sin un traumatismo claro. Creo que fue empeorando desde que comencÃ© a teletrabajar y paso mÃ¡s horas sentado.';
    } else if (caseData.pathology.includes('hombro') || caseData.pathology.includes('supraespinoso')) {
      return 'ComenzÃ³ hace unas 3 semanas. Recuerdo que ese dÃ­a en el trabajo tuve que cargar varias cajas pesadas por encima de la cabeza. SentÃ­ un pinchazo agudo y desde entonces no he mejorado, incluso ha empeorado.';
    } else if (caseData.pathology.includes('rodilla') || caseData.pathology.includes('patelofemoral')) {
      return 'Llevo notÃ¡ndolo unas 4-5 semanas. EmpezÃ³ despuÃ©s de aumentar la intensidad de mis entrenamientos de running. Al principio solo me molestaba al subir escaleras, ahora es mÃ¡s constante.';
    } else if (caseData.pathology.includes('plantar')) {
      return 'EmpecÃ© con este dolor hace aproximadamente 6 semanas. Trabajo de pie muchas horas al dÃ­a y ese mes tuve turnos extra. Los primeros dÃ­as pensÃ© que se me pasarÃ­a con reposo, pero ha ido a peor.';
    } else if (caseData.pathology.includes('epicondilitis')) {
      return 'Llevo asÃ­ unas 4 semanas. Juego al tenis 3 veces por semana y ese mes intensifiquÃ© los entrenamientos preparando un torneo. El dolor apareciÃ³ gradualmente y ahora me limita incluso para actividades cotidianas.';
    } else if (caseData.pathology.includes('contractura')) {
      return 'Esto empezÃ³ hace 3-4 dÃ­as. Estaba moviendo muebles en casa y levantÃ© un peso de forma brusca con mala postura. SentÃ­ un dolor agudo instantÃ¡neo y desde entonces apenas puedo moverme.';
    } else if (caseData.pathology.includes('artrosis')) {
      return 'Este problema lo tengo desde hace varios aÃ±os, pero en los Ãºltimos 2-3 meses ha empeorado bastante. La rigidez matutina es cada vez mÃ¡s prolongada y las tareas cotidianas me cuestan mÃ¡s.';
    } else {
      return `EmpecÃ© a notarlo hace aproximadamente ${Math.floor(Math.random() * 3) + 2} semanas. Al principio era leve pero ha ido aumentando progresivamente, por eso decidÃ­ venir.`;
    }
  }

  // PREGUNTAS SOBRE ACTIVIDADES Y OCUPACIÃ“N
  if (lowerMessage.includes('actividad') || lowerMessage.includes('trabajo') || lowerMessage.includes('haces') || lowerMessage.includes('profesiÃ³n') || lowerMessage.includes('ocupaciÃ³n') || lowerMessage.includes('deporte')) {
    if (caseData.pathology.includes('cervical')) {
      return 'Trabajo como administrativo en una oficina, paso entre 8-10 horas diarias frente al ordenador. Mi postura no es muy buena y Ãºltimamente el estrÃ©s laboral ha aumentado mucho. No hago ejercicio regular, la verdad.';
    } else if (caseData.pathology.includes('lumbar')) {
      return 'Soy programador y trabajo desde casa. Paso prÃ¡cticamente todo el dÃ­a sentado, a veces hasta 12 horas sin apenas levantarme. Mi setup no es muy ergonÃ³mico y creo que mi silla es bastante mala.';
    } else if (caseData.pathology.includes('hombro') || caseData.pathology.includes('supraespinoso')) {
      return 'Trabajo en logÃ­stica, en un almacÃ©n. Mi trabajo implica levantar y mover cajas con frecuencia, muchas veces por encima de la cabeza. TambiÃ©n juego a baloncesto los fines de semana.';
    } else if (caseData.pathology.includes('rodilla') || caseData.pathology.includes('patelofemoral')) {
      return 'Trabajo en una tienda, estoy de pie o caminando la mayor parte del dÃ­a. AdemÃ¡s, salgo a correr 4-5 dÃ­as a la semana. Hace poco aumentÃ© el kilometraje preparando una media maratÃ³n.';
    } else if (caseData.pathology.includes('plantar')) {
      return 'Soy enfermero/a, trabajo en un hospital y paso todo mi turno de pie o caminando. Son turnos de 12 horas. Ãšltimamente he hecho muchas horas extra. No uso calzado muy adecuado, la verdad.';
    } else if (caseData.pathology.includes('epicondilitis')) {
      return 'Soy diseÃ±ador grÃ¡fico, uso mucho el ratÃ³n durante todo el dÃ­a. AdemÃ¡s, juego al tenis 3 veces por semana a nivel amateur competitivo. TambiÃ©n hago algo de pÃ¡del ocasionalmente.';
    } else if (caseData.pathology.includes('contractura')) {
      return 'Trabajo en una mudanza, pero este dolor especÃ­fico me vino por mover muebles en mi propia casa. Hice un mal movimiento levantando un sofÃ¡ sin ayuda y con mala tÃ©cnica.';
    } else if (caseData.pathology.includes('artrosis')) {
      return 'Estoy jubilado/a, pero durante muchos aÃ±os trabajÃ© como cocinero/a, con mucha actividad manual repetitiva. Ahora hago tareas domÃ©sticas y algo de jardinerÃ­a, aunque cada vez me cuesta mÃ¡s.';
    } else {
      return 'Mi trabajo es principalmente sedentario, aunque intento hacer algo de ejercicio cuando puedo. Ãšltimamente he notado que ciertas actividades me provocan mÃ¡s molestias de lo habitual.';
    }
  }

  if (lowerMessage.includes('noche') || lowerMessage.includes('dormir') || lowerMessage.includes('sueÃ±o')) {
    return 'Por las noches a veces me cuesta encontrar una postura cÃ³moda, pero en general puedo dormir. Me despierto con un poco de rigidez pero se me va pasando.';
  }

  if (lowerMessage.includes('medicaciÃ³n') || lowerMessage.includes('medicamento') || lowerMessage.includes('tomado')) {
    return 'He tomado algÃºn ibuprofeno cuando el dolor era mÃ¡s intenso, y me alivia un poco temporalmente. No tomo ninguna otra medicaciÃ³n de forma habitual.';
  }

  // EXPLORACIÃ“N FÃSICA - Respuestas segÃºn patologÃ­a
  if (lowerMessage.includes('exploraciÃ³n') || lowerMessage.includes('examinar') || lowerMessage.includes('evaluar') || lowerMessage.includes('valorar') || lowerMessage.includes('explorar')) {
    return 'Por supuesto, adelante. DÃ­game quÃ© necesita que haga o cÃ³mo puedo ayudarle con la exploraciÃ³n.';
  }

  if (lowerMessage.includes('movimiento') || lowerMessage.includes('mover') || lowerMessage.includes('flexiÃ³n') || lowerMessage.includes('extensiÃ³n') || lowerMessage.includes('rotaciÃ³n') || lowerMessage.includes('abducciÃ³n') || lowerMessage.includes('aducciÃ³n') || lowerMessage.includes('rango')) {
    if (caseData.pathology.includes('cervical')) {
      return 'Al hacer flexiÃ³n noto bastante tensiÃ³n y me tira por detrÃ¡s del cuello. La rotaciÃ³n tambiÃ©n estÃ¡ limitada, especialmente a la derecha donde llego solo hasta unos 60Â°. La extensiÃ³n me produce dolor en la base del crÃ¡neo.';
    } else if (caseData.pathology.includes('lumbar')) {
      return 'La flexiÃ³n del tronco estÃ¡ muy limitada, apenas llego a tocarme las rodillas por el dolor y rigidez lumbar. La extensiÃ³n tambiÃ©n me duele. Los movimientos laterales estÃ¡n algo mejor pero noto tirantez.';
    } else if (caseData.pathology.includes('hombro') || caseData.pathology.includes('supraespinoso')) {
      return 'Â¡Ay! La abducciÃ³n me duele mucho entre los 60Â° y 120Â°, es un arco doloroso muy claro. No puedo levantar el brazo completamente. La rotaciÃ³n externa tambiÃ©n estÃ¡ limitada y dolorosa. La flexiÃ³n anterior estÃ¡ algo mejor pero tampoco es completa.';
    } else if (caseData.pathology.includes('rodilla') || caseData.pathology.includes('patelofemoral')) {
      return 'Puedo flexionar y extender la rodilla, pero noto crepitaciÃ³n y dolor retropatelar en todo el arco, especialmente en flexiÃ³n profunda. Al subir escaleras es cuando mÃ¡s me duele. En extensiÃ³n activa con resistencia tambiÃ©n me molesta bastante.';
    } else if (caseData.pathology.includes('epicondilitis')) {
      return 'La flexo-extensiÃ³n del codo es normal, pero cuando hago pronaciÃ³n o supinaciÃ³n del antebrazo, especialmente contra resistencia, me produce un dolor agudo en el epicÃ³ndilo lateral. TambiÃ©n me duele al extender la muÃ±eca contra resistencia.';
    } else {
      return 'SÃ­, ese movimiento me produce molestias significativas. Noto limitaciÃ³n del rango y dolor al intentar completar el movimiento. Â¿Quiere que intente otro?';
    }
  }

  if (lowerMessage.includes('palpaciÃ³n') || lowerMessage.includes('palpar') || lowerMessage.includes('tocar') || lowerMessage.includes('presiÃ³n') || lowerMessage.includes('punto') || lowerMessage.includes('zona')) {
    if (caseData.pathology.includes('cervical')) {
      return 'Â¡AhÃ­! Justo ahÃ­ en el trapecio superior y la musculatura cervical posterior noto mucha sensibilidad. EstÃ¡ muy contracturado y doloroso a la palpaciÃ³n, especialmente en el lado derecho. Noto como puntos gatillo.';
    } else if (caseData.pathology.includes('lumbar')) {
      return 'En la musculatura paravertebral lumbar noto mucha tensiÃ³n bilateral. EstÃ¡ muy sensible a la presiÃ³n. La zona estÃ¡ como agarrotada y muy rÃ­gida. Las apÃ³fisis espinosas tambiÃ©n estÃ¡n sensibles.';
    } else if (caseData.pathology.includes('hombro') || caseData.pathology.includes('supraespinoso')) {
      return 'Uff, justo en la regiÃ³n del troquÃ­ter y el espacio subacromial me duele bastante con la palpaciÃ³n. TambiÃ©n noto sensibilidad en la inserciÃ³n del supraespinoso. El test de Neer me provoca dolor.';
    } else if (caseData.pathology.includes('rodilla') || caseData.pathology.includes('patelofemoral')) {
      return 'La palpaciÃ³n de los bordes rotulianos es dolorosa, especialmente el borde lateral. TambiÃ©n me duele al comprimir la rÃ³tula contra el fÃ©mur. No noto derrame pero sÃ­ sensibilidad perirotuliana.';
    } else if (caseData.pathology.includes('plantar')) {
      return 'Â¡Ay! Justo ahÃ­ en la inserciÃ³n de la fascia en el talÃ³n me duele muchÃ­simo. Es muy sensible a la palpaciÃ³n, especialmente en el borde medial del calcÃ¡neo. La fascia se nota engrosada y muy tensa.';
    } else if (caseData.pathology.includes('epicondilitis')) {
      return 'Exacto, en el epicÃ³ndilo lateral es donde mÃ¡s me duele. La palpaciÃ³n ahÃ­ es muy sensible. TambiÃ©n noto dolor con la palpaciÃ³n de la musculatura extensora del antebrazo. El test de Cozen me reproduce el dolor.';
    } else {
      return 'AhÃ­ noto bastante sensibilidad. Esa zona estÃ¡ especialmente dolorida a la presiÃ³n. Me reproduce el dolor que tengo habitualmente.';
    }
  }
  
  // Tests especÃ­ficos
  if (lowerMessage.includes('fuerza') || lowerMessage.includes('resistencia') || lowerMessage.includes('contra') || lowerMessage.includes('mÃºsculo')) {
    if (caseData.pathology.includes('hombro') || caseData.pathology.includes('supraespinoso')) {
      return 'Noto debilidad al intentar mantener la posiciÃ³n contra resistencia, especialmente en abducciÃ³n. El test de Jobe me produce dolor y dificultad para mantener la posiciÃ³n. Claramente tengo menos fuerza que en el lado sano.';
    } else if (caseData.pathology.includes('rodilla')) {
      return 'La fuerza del cuÃ¡driceps parece estar conservada, pero me duele al hacer extensiÃ³n contra resistencia. Noto que evito inconscientemente cargar en esa pierna.';
    } else {
      return 'La fuerza estÃ¡ algo disminuida por el dolor. Me cuesta hacer fuerza contra resistencia en esa zona sin que me duela.';
    }
  }

  if (lowerMessage.includes('tratamiento') || lowerMessage.includes('masaje') || lowerMessage.includes('terapia') || lowerMessage.includes('ejercicio')) {
    return 'De acuerdo, entiendo. Â¿Y eso me va a ayudar? Â¿CuÃ¡nto tiempo tendrÃ© que hacerlo?';
  }

  if (lowerMessage.includes('ejercicios') || lowerMessage.includes('casa') || lowerMessage.includes('recomendaciones')) {
    return 'Perfecto, tomarÃ© nota de todo. Â¿Hay algo mÃ¡s que deba evitar o tener en cuenta en mi dÃ­a a dÃ­a?';
  }

  if (lowerMessage.includes('mejorar') || lowerMessage.includes('recuperaciÃ³n') || lowerMessage.includes('tiempo')) {
    return 'Muchas gracias por la informaciÃ³n. Me quedo mÃ¡s tranquilo/a sabiendo que es algo que tiene soluciÃ³n con el tratamiento adecuado.';
  }

  if (lowerMessage.includes('preguntas') || lowerMessage.includes('dudas')) {
    return 'Creo que por ahora me ha quedado todo claro. Muchas gracias por su atenciÃ³n y profesionalidad.';
  }
  
  // FACTORES AGRAVANTES Y ATENUANTES
  if (lowerMessage.includes('agrava') || lowerMessage.includes('empeora') || lowerMessage.includes('peor') || lowerMessage.includes('aumenta')) {
    if (caseData.pathology.includes('cervical')) {
      return 'El dolor empeora definitivamente con posiciones mantenidas frente al ordenador, el estrÃ©s y al final del dÃ­a. TambiÃ©n noto que empeora en la cama si duermo en mala posiciÃ³n. El frÃ­o tambiÃ©n me afecta.';
    } else if (caseData.pathology.includes('lumbar')) {
      return 'Se agrava muchÃ­simo con la sedestaciÃ³n prolongada, especialmente mÃ¡s de 30 minutos. TambiÃ©n al levantarme despuÃ©s de estar sentado y con movimientos de flexiÃ³n del tronco. Por la maÃ±ana al despertarme tambiÃ©n estÃ¡ peor.';
    } else if (caseData.pathology.includes('hombro')) {
      return 'Empeora claramente con movimientos por encima de la cabeza, al vestirme o al intentar dormir sobre ese hombro. Cargar peso tambiÃ©n lo agrava mucho.';
    } else if (caseData.pathology.includes('rodilla')) {
      return 'Se intensifica al subir y bajar escaleras, especialmente al bajar. TambiÃ©n al estar mucho tiempo sentado con la rodilla flexionada y al levantarme. Correr ahora es imposible.';
    } else {
      return 'Empeora con actividades especÃ­ficas relacionadas con el movimiento de esa zona y tras uso prolongado. TambiÃ©n noto que estÃ¡ peor por las maÃ±anas.';
    }
  }
  
  if (lowerMessage.includes('alivia') || lowerMessage.includes('mejora') || lowerMessage.includes('mejor') || lowerMessage.includes('calma')) {
    if (caseData.pathology.includes('cervical')) {
      return 'Mejora algo con el calor local, masajes suaves en la zona y cuando puedo descansar en posiciÃ³n horizontal. El ibuprofeno tambiÃ©n me ayuda temporalmente. Mover el cuello suavemente parece que afloja un poco.';
    } else if (caseData.pathology.includes('lumbar')) {
      return 'El reposo en decÃºbito supino con las piernas elevadas me alivia bastante. TambiÃ©n mejora cuando camino un poco. El calor local me va bien. La medicaciÃ³n antiinflamatoria reduce el dolor durante unas horas.';
    } else if (caseData.pathology.includes('plantar')) {
      return 'Mejora con el reposo y elevaciÃ³n del pie. El hielo despuÃ©s de estar de pie me va bien. Por la noche, cuando no cargo peso, casi no me molesta. Los estiramientos suaves tambiÃ©n parecen ayudar algo.';
    } else {
      return 'Mejora con reposo, evitando los movimientos que me producen dolor. Los antiinflamatorios me dan alivio temporal. El calor/frÃ­o local tambiÃ©n ayuda.';
    }
  }
  
  // FEEDBACK PEDAGÃ“GICO - Si llevan muchos mensajes sin hacer cosas importantes
  if (messageCount > 8 && !hasExamined) {
    const examPrompts = [
      'Doctor, Â¿no va a examinarme fÃ­sicamente? Me gustarÃ­a saber quÃ© tengo exactamente.',
      'Disculpe, Â¿no me va a hacer una exploraciÃ³n? Creo que serÃ­a importante valorar el movimiento y la zona.',
    ];
    return examPrompts[Math.floor(Math.random() * examPrompts.length)];
  }
  
  if (messageCount > 6 && !hasAskedPain) {
    return 'Por cierto, no sÃ© si le he descrito bien el dolor. Â¿No quiere que le especifique mÃ¡s sobre las caracterÃ­sticas del dolor?';
  }
  
  if (messageCount > 5 && !hasAskedOnset) {
    return 'No le he contado desde cuÃ¡ndo tengo esto ni cÃ³mo empezÃ³. Â¿Le interesa saberlo?';
  }
  
  if (messageCount > 12 && hasExamined) {
    return 'Â¿Ya tiene suficiente informaciÃ³n? Â¿QuÃ© cree que puede ser y quÃ© tratamiento me recomienda?';
  }

  // RESPUESTAS GENÃ‰RICAS MEJORADAS
  const genericResponses = [
    'Entiendo. Â¿QuÃ© mÃ¡s necesita saber para el diagnÃ³stico?',
    'SÃ­, exacto.',
    'No, eso no lo habÃ­a notado especÃ­ficamente.',
    'Me gustarÃ­a que me explicara quÃ© podemos hacer para mejorarlo. Â¿QuÃ© tratamiento me recomienda?',
    'De acuerdo, le escucho. CuÃ©nteme mÃ¡s.',
    'Â¿Eso quÃ© significa? Â¿Es algo grave?',
    'Vale, entiendo. Â¿Y eso cÃ³mo me va a ayudar?',
  ];

  return genericResponses[Math.floor(Math.random() * genericResponses.length)];
}

// Generar evaluaciÃ³n con IA
app.post("/make-server-eba6a2ba/ai/evaluation", async (c) => {
  try {
    const { caseData, chatHistory, notes } = await c.req.json();
    
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (openaiKey) {
      try {
        const studentMessages = chatHistory.filter((msg: any) => msg.role === 'student');
        const conversationSummary = studentMessages.map((msg: any) => msg.message).join('\n- ');
        
        const evaluationPrompt = `Eres un PROFESOR EXPERTO en fisioterapia evaluando a un estudiante. Analiza su desempeÃ±o:

CASO CLÃNICO:
- PatologÃ­a: ${caseData.pathology}
- Paciente: ${caseData.patientName}, ${caseData.age} aÃ±os, ${caseData.gender}
- Queja principal: ${caseData.chiefComplaint}

CONVERSACIÃ“N DEL ESTUDIANTE:
${conversationSummary}

NOTAS DEL ESTUDIANTE:
${notes || 'No tomÃ³ notas'}

EVALÃšA (0-10) y da FEEDBACK EDUCATIVO en estas 5 competencias:

1. ANAMNESIS: Â¿PreguntÃ³ sobre caracterÃ­sticas del dolor (localizaciÃ³n, tipo, intensidad EVA), inicio cronolÃ³gico, factores agravantes/atenuantes, ocupaciÃ³n/actividades?
2. EXPLORACIÃ“N: Â¿RealizÃ³ exploraciÃ³n fÃ­sica adecuada? Â¿Tests especÃ­ficos? Â¿PalpaciÃ³n? Â¿Rangos de movimiento?
3. RAZONAMIENTO CLÃNICO: Â¿AnalizÃ³ los datos correctamente? Â¿UsÃ³ las notas? Â¿LlegÃ³ al diagnÃ³stico correcto?
4. TRATAMIENTO: Â¿Propuso plan terapÃ©utico coherente? Â¿TÃ©cnicas apropiadas? Â¿Objetivos claros?
5. COMUNICACIÃ“N: Â¿ExplicÃ³ bien al paciente? Â¿Lenguaje apropiado? Â¿EmpatÃ­a? Â¿EducaciÃ³n terapÃ©utica?

Responde EXACTAMENTE en este formato JSON:
{
  "anamnesis": nÃºmero de 0-10,
  "exploracion": nÃºmero de 0-10,
  "razonamientoClinico": nÃºmero de 0-10,
  "tratamiento": nÃºmero de 0-10,
  "comunicacion": nÃºmero de 0-10,
  "feedback": {
    "anamnesis": "feedback detallado y constructivo",
    "exploracion": "feedback detallado y constructivo",
    "razonamientoClinico": "feedback detallado y constructivo",
    "tratamiento": "feedback detallado y constructivo",
    "comunicacion": "feedback detallado y constructivo"
  }
}

SÃ© EXIGENTE pero CONSTRUCTIVO. El feedback debe explicar QUÃ‰ hizo bien, QUÃ‰ olvidÃ³ y CÃ“MO mejorar.`;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "Eres un profesor de fisioterapia experto en evaluaciÃ³n clÃ­nica. Respondes SIEMPRE en formato JSON vÃ¡lido." },
              { role: "user", content: evaluationPrompt }
            ],
            temperature: 0.5,
            max_tokens: 1500,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          let evaluationResult = data.choices[0].message.content;
          
          // Limpiar posibles caracteres extra
          evaluationResult = evaluationResult.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          
          const parsedEvaluation = JSON.parse(evaluationResult);
          console.log(`AI evaluation generated for case: ${caseData.patientName}`);
          return c.json({ evaluation: parsedEvaluation });
        }
      } catch (error) {
        console.error("OpenAI evaluation error:", error);
        // Fallback a evaluaciÃ³n local
      }
    }
    
    // Si no hay OpenAI, devolver null para que el frontend use su evaluaciÃ³n local
    return c.json({ evaluation: null });
    
  } catch (error) {
    console.error("Error generating evaluation:", error);
    return c.json({ error: `Error generating evaluation: ${error.message}` }, 500);
  }
});

// Generar caso clÃ­nico en formato examen
app.post("/make-server-eba6a2ba/exam/generate", async (c) => {
  try {
    console.log("Generating exam case...");
    
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (openaiKey) {
      try {
        const examPrompt = `Genera un caso clÃ­nico de fisioterapia en formato de examen profesional. El caso debe incluir:

1. DATOS DEL PACIENTE: Edad, ocupaciÃ³n/profesiÃ³n, motivo de consulta principal
2. ANTECEDENTES: InformaciÃ³n relevante (sedentarismo, actividad fÃ­sica, lesiones previas, factores de riesgo)
3. CARACTERÃSTICAS DEL DOLOR/PROBLEMA: LocalizaciÃ³n, tipo, evoluciÃ³n temporal, factores agravantes/atenuantes
4. EXPLORACIÃ“N FÃSICA (datos objetivos): ObservaciÃ³n, palpaciÃ³n, rangos de movimiento, tests especÃ­ficos con resultados
5. OBJETIVO: QuÃ© se espera del estudiante (diagnÃ³stico diferencial, plan de tratamiento, etc.)

El caso debe ser:
- Realista y basado en patologÃ­as comunes de fisioterapia
- Claro y bien estructurado como aparecerÃ­a en un examen universitario
- Con informaciÃ³n suficiente pero que requiera anÃ¡lisis del estudiante
- En espaÃ±ol profesional

Ejemplos de patologÃ­as: cervicalgia mecÃ¡nica, lumbalgia, tendinopatÃ­as, sÃ­ndromes compresivos, artrosis, lesiones deportivas, etc.

Devuelve SOLO el texto del caso, sin introducciÃ³n ni explicaciones adicionales. Formato profesional como examen.`;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "Eres un profesor de fisioterapia creando casos clÃ­nicos para exÃ¡menes. Generas casos realistas, bien estructurados y pedagÃ³gicos." },
              { role: "user", content: examPrompt }
            ],
            temperature: 0.9,
            max_tokens: 600,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const caseStatement = data.choices[0].message.content.trim();
          
          const examCase = {
            id: Date.now().toString(),
            caseStatement: caseStatement,
            isCustom: false,
            date: new Date().toLocaleDateString('es-ES'),
          };

          console.log(`AI exam case generated`);
          return c.json({ examCase });
        }
      } catch (error) {
        console.error("OpenAI exam generation error:", error);
        // Fallback a caso local
      }
    }

    // Caso de examen local si no hay OpenAI
    const localExamCases = [
      `PACIENTE: Mujer de 42 aÃ±os, profesora de primaria, refiere dolor cervical bilateral de 3 semanas de evoluciÃ³n.

ANTECEDENTES: Sedentarismo, trabajo prolongado de pie y en flexiÃ³n cervical (correcciÃ³n de cuadernos), episodios previos de cervicalgia hace 2 aÃ±os. Sin traumatismos recientes. EstrÃ©s laboral elevado.

SINTOMATOLOGÃA: Dolor sordo y constante en regiÃ³n cervical posterior, EVA 6/10, que aumenta al final de la jornada laboral y con movimientos de rotaciÃ³n. Irradia ocasionalmente hacia regiÃ³n escapular bilateral. Mejora parcialmente con calor local y reposo nocturno.

EXPLORACIÃ“N FÃSICA:
- Postura: AnteriorizaciÃ³n de cabeza, hombros protruidos
- PalpaciÃ³n: HipertonÃ­a y puntos gatillo en trapecios superiores bilateral, musculatura suboccipital tensa
- Rangos de movimiento cervical: RotaciÃ³n limitada bilateral (60Â° dcha, 55Â° izq), extensiÃ³n con molestias
- Tests neurodinÃ¡micos: Negativos
- Fuerza muscular: Conservada

OBJETIVO: Realizar diagnÃ³stico fisioterÃ¡pico, identificar factores contribuyentes y proponer plan de tratamiento inicial con objetivos SMART.`,

      `PACIENTE: VarÃ³n de 28 aÃ±os, runner aficionado, presenta dolor en rodilla derecha desde hace 5 semanas.

ANTECEDENTES: Deportista activo (running 4-5 dÃ­as/semana), aumentÃ³ volumen de entrenamiento hace 2 meses preparando media maratÃ³n. Sin lesiones previas en miembro inferior. Calzado deportivo con mÃ¡s de 800 km.

SINTOMATOLOGÃA: Dolor retropatelar derecho, EVA 5-6/10 durante y despuÃ©s de correr, especialmente al bajar escaleras. SensaciÃ³n de "crepitaciÃ³n" al flexionar rodilla. Sin inflamaciÃ³n visible. Mejora con reposo de 2-3 dÃ­as pero recidiva al retomar actividad.

EXPLORACIÃ“N FÃSICA:
- ObservaciÃ³n: Leve valgo dinÃ¡mico de rodilla en apoyo monopodal, debilidad aparente de glÃºteo medio
- PalpaciÃ³n: Dolor a la compresiÃ³n patelar, bordes rotulianos sensibles (lateral > medial)
- Rangos de movimiento: Completos, crepitaciÃ³n palpable en flexo-extensiÃ³n
- Tests especÃ­ficos: 
  * Test de compresiÃ³n rotuliana: Positivo
  * Sentadilla monopodal: Reproduce dolor, valgo visible
  * Fuerza de cuÃ¡driceps: 4/5 (comparado con izquierda)

OBJETIVO: Establecer diagnÃ³stico diferencial, explicar biomecÃ¡nica de la lesiÃ³n y diseÃ±ar programa de rehabilitaciÃ³n progresivo.`,

      `PACIENTE: Mujer de 58 aÃ±os, administrativa, consulta por dolor y rigidez en ambas manos.

ANTECEDENTES: Trabajo de oficina (uso intensivo de ordenador y escritura), madre con artrosis de manos, menopausia hace 3 aÃ±os. SintomatologÃ­a progresiva en Ãºltimos 6 meses.

SINTOMATOLOGÃA: Rigidez matutina en articulaciones interfalÃ¡ngicas de ambas manos (duraciÃ³n 45-60 minutos), dolor sordo EVA 4/10 que aumenta con actividades de precisiÃ³n (escribir, abrir botes, coser). Mejora con movimiento gradual. SensaciÃ³n de "manos hinchadas" por las maÃ±anas.

EXPLORACIÃ“N FÃSICA:
- ObservaciÃ³n: Leve tumefacciÃ³n en IFP de 2Âº y 3Âº dedos bilateral, nÃ³dulos de Heberden incipientes
- PalpaciÃ³n: Articulaciones IFP sensibles, crepitaciÃ³n palpable, temperatura local normal
- Rangos de movimiento: FlexiÃ³n metacarpofalÃ¡ngica limitada (70-75Â°), dolor al final del rango
- Fuerza de prensiÃ³n: Disminuida bilateral (dinamometrÃ­a: 18 kg dcha, 16 kg izq; normal: 25-30 kg)
- Tests funcionales: Dificultad en tareas de precisiÃ³n y fuerza

OBJETIVO: DiagnÃ³stico diferencial, educaciÃ³n sobre progresiÃ³n de la condiciÃ³n, y programa de tratamiento conservador incluyendo ejercicios, Ã³rtesis y consejos ergonÃ³micos.`,

      `PACIENTE: Hombre de 35 aÃ±os, trabajador de almacÃ©n, dolor agudo en regiÃ³n lumbar baja desde hace 4 dÃ­as.

ANTECEDENTES: Trabajo con manipulaciÃ³n manual de cargas, episodio actual tras levantar caja pesada (â‰ˆ25 kg) con flexiÃ³n de tronco y rotaciÃ³n. Sin antecedentes de lumbalgia. Fumador ocasional.

SINTOMATOLOGÃA: Dolor agudo en regiÃ³n lumbar izquierda (L4-L5 aproximadamente), EVA 7-8/10 en reposo, 9/10 con movimientos. Contractura muscular intensa. Sin irradiaciÃ³n a miembro inferior. Leve mejorÃ­a con decÃºbito lateral y aplicaciÃ³n de frÃ­o.

EXPLORACIÃ“N FÃSICA:
- Postura: Actitud antiÃ¡lgica, escoliosis antÃ¡lgica hacia lado derecho
- PalpaciÃ³n: Contractura severa en musculatura paravertebral lumbar izquierda, espasmo muscular palpable
- Rangos de movimiento: FlexiÃ³n lumbar 30Â° (muy limitada por dolor), extensiÃ³n y lateroflexiones limitadas
- Test de LasÃ¨gue: Negativo bilateral
- Sensibilidad y reflejos: Normales en MMII
- Signos de alarma (red flags): Ausentes

OBJETIVO: DiagnÃ³stico diferencial entre contractura muscular aguda vs. otras causas, manejo del dolor en fase aguda, educaciÃ³n postural y plan de tratamiento para prevenir recurrencias.`
    ];

    const randomExamCase = localExamCases[Math.floor(Math.random() * localExamCases.length)];
    
    const examCase = {
      id: Date.now().toString(),
      caseStatement: randomExamCase,
      isCustom: false,
      date: new Date().toLocaleDateString('es-ES'),
    };

    console.log(`âœ“ Local exam case generated`);
    return c.json({ examCase });
    
  } catch (error) {
    console.error("Error generating exam case:", error.message, error.stack);
    return c.json({ error: `Error generating exam case: ${error.message}` }, 500);
  }
});

// Evaluar caso de examen
app.post("/make-server-eba6a2ba/exam/evaluation", async (c) => {
  try {
    const { examCase, messages, studentAnswer } = await c.req.json();
    
    // Filtrar solo mensajes del estudiante (excluyendo el mensaje inicial del tutor)
    const studentMessages = messages.filter((msg: any) => msg.role === 'student');
    
    // Verificar si el estudiante no ha participado en absoluto
    const hasNoActivity = studentMessages.length === 0 && (!studentAnswer || studentAnswer.trim().length < 50);
    
    // Si no hay actividad, retornar 0 en todo
    if (hasNoActivity) {
      console.log('Exam evaluation: No student activity detected, returning all zeros');
      return c.json({
        evaluation: {
          anamnesis: 0,
          exploracion: 0,
          razonamientoClinico: 0,
          tratamiento: 0,
          comunicacion: 0,
          feedback: {
            anamnesis: 'No se realizÃ³ ninguna pregunta al tutor ni se completÃ³ el anÃ¡lisis del caso. Es fundamental interactuar con el tutor para resolver el caso clÃ­nico.',
            exploracion: 'No se identificÃ³ ninguna exploraciÃ³n fÃ­sica ni anÃ¡lisis del caso. Debes proponer quÃ© pruebas realizarÃ­as segÃºn el enunciado.',
            razonamientoClinico: 'No se observÃ³ razonamiento clÃ­nico alguno. Es esencial analizar los datos del caso, formular hipÃ³tesis diagnÃ³sticas y justificar tu diagnÃ³stico.',
            tratamiento: 'No se propuso ningÃºn plan de tratamiento. Debes establecer objetivos terapÃ©uticos y tÃ©cnicas especÃ­ficas basadas en el diagnÃ³stico.',
            comunicacion: 'No hubo interacciÃ³n con el tutor. La comunicaciÃ³n y el diÃ¡logo durante la resoluciÃ³n del caso son fundamentales para el aprendizaje.'
          }
        }
      });
    }
    
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (openaiKey) {
      try {
        const conversationSummary = studentMessages.map((msg: any) => msg.message).join('\n- ');
        
        const evaluationPrompt = `Eres un PROFESOR EXPERTO en fisioterapia evaluando el desempeÃ±o de un estudiante en un CASO DE EXAMEN.

CASO CLÃNICO PRESENTADO:
${examCase.caseStatement}

INTERACCIÃ“N DEL ESTUDIANTE CON EL TUTOR (${studentMessages.length} mensajes):
${conversationSummary || 'No hubo interacciÃ³n con el tutor'}

RESPUESTA FINAL DEL ESTUDIANTE:
${studentAnswer || 'No proporcionÃ³ respuesta escrita'}

INSTRUCCIONES DE EVALUACIÃ“N:

EvalÃºa el desempeÃ±o del estudiante en 5 competencias clave (0-100):

1. ANAMNESIS (0-100):
   - Â¿IdentificÃ³ correctamente los datos clave del enunciado?
   - Â¿PreguntÃ³ al tutor sobre informaciÃ³n relevante que necesitaba aclarar?
   - Â¿ConsiderÃ³ factores de riesgo, ocupaciÃ³n, cronologÃ­a?
   - SI NO HAY MENSAJES: MÃ¡ximo 30 puntos solo si la respuesta escrita menciona bien la anamnesis

2. EXPLORACIÃ“N FÃSICA (0-100):
   - Â¿IdentificÃ³ quÃ© pruebas/tests realizar segÃºn el caso?
   - Â¿InterpretÃ³ correctamente los datos de exploraciÃ³n del enunciado?
   - Â¿Propuso tests especÃ­ficos coherentes con sus hipÃ³tesis?
   - SI NO HAY MENSAJES: MÃ¡ximo 30 puntos solo si la respuesta menciona exploraciÃ³n detallada

3. RAZONAMIENTO CLÃNICO (0-100):
   - Â¿AnalizÃ³ la informaciÃ³n de forma lÃ³gica y estructurada?
   - Â¿FormulÃ³ diagnÃ³stico diferencial?
   - Â¿JustificÃ³ el diagnÃ³stico principal con los datos del caso?
   - Â¿DemostrÃ³ conocimiento de la patologÃ­a?
   - Este es el criterio MÃS IMPORTANTE

4. TRATAMIENTO (0-100):
   - Â¿Propuso plan terapÃ©utico coherente con el diagnÃ³stico?
   - Â¿EstableciÃ³ objetivos SMART?
   - Â¿MencionÃ³ tÃ©cnicas especÃ­ficas basadas en evidencia?
   - Â¿ConsiderÃ³ prevenciÃ³n y educaciÃ³n?

5. COMUNICACIÃ“N/PEDAGOGÃA (0-100):
   - Â¿UsÃ³ el tutor de forma efectiva para aprender?
   - Â¿Hizo preguntas inteligentes y relevantes?
   - Â¿DemostrÃ³ pensamiento crÃ­tico en el diÃ¡logo?
   - Â¿Su respuesta final estÃ¡ bien estructurada y clara?
   - SI NO HAY MENSAJES: MÃ¡ximo 20 puntos

IMPORTANTE:
- SÃ© EXIGENTE pero JUSTO
- Valora MÃS la calidad que la cantidad
- Si el estudiante no interactuÃ³ con el tutor pero escribiÃ³ buena respuesta: penaliza comunicaciÃ³n pero evalÃºa el contenido
- Si no hay respuesta escrita pero sÃ­ interacciÃ³n: evalÃºa lo que preguntÃ³/discutiÃ³
- El feedback debe ser CONSTRUCTIVO: menciona quÃ© hizo bien, quÃ© faltÃ³, cÃ³mo mejorar
- NO des puntuaciones altas si no demostrÃ³ conocimiento real

Responde EXACTAMENTE en este formato JSON:
{
  "anamnesis": nÃºmero entre 0-100,
  "exploracion": nÃºmero entre 0-100,
  "razonamientoClinico": nÃºmero entre 0-100,
  "tratamiento": nÃºmero entre 0-100,
  "comunicacion": nÃºmero entre 0-100,
  "feedback": {
    "anamnesis": "feedback detallado de 2-3 frases",
    "exploracion": "feedback detallado de 2-3 frases",
    "razonamientoClinico": "feedback detallado de 2-3 frases",
    "tratamiento": "feedback detallado de 2-3 frases",
    "comunicacion": "feedback detallado de 2-3 frases"
  }
}`;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "Eres un profesor de fisioterapia experto en evaluaciÃ³n de casos clÃ­nicos de examen. Eres EXIGENTE pero JUSTO. Respondes SIEMPRE en formato JSON vÃ¡lido." },
              { role: "user", content: evaluationPrompt }
            ],
            temperature: 0.4,
            max_tokens: 1800,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          let evaluationResult = data.choices[0].message.content;
          
          // Limpiar posibles caracteres extra
          evaluationResult = evaluationResult.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          
          const parsedEvaluation = JSON.parse(evaluationResult);
          console.log(`AI exam evaluation generated. Student messages: ${studentMessages.length}, Answer length: ${studentAnswer?.length || 0}`);
          return c.json({ evaluation: parsedEvaluation });
        }
      } catch (error) {
        console.error("OpenAI exam evaluation error:", error);
        // Fallback a evaluaciÃ³n local
      }
    }
    
    // EvaluaciÃ³n local si no hay OpenAI
    console.log('Using local exam evaluation');
    const localEvaluation = generateLocalExamEvaluation(studentMessages, studentAnswer, examCase);
    return c.json({ evaluation: localEvaluation });
    
  } catch (error) {
    console.error("Error evaluating exam case:", error);
    return c.json({ error: `Error evaluating exam case: ${error.message}` }, 500);
  }
});

// FunciÃ³n para generar evaluaciÃ³n local de examen
function generateLocalExamEvaluation(studentMessages: any[], studentAnswer: string, examCase: any): any {
  const messageCount = studentMessages.length;
  const answerLength = studentAnswer?.trim().length || 0;
  
  // Si no hay mensajes ni respuesta suficiente, retornar 0
  if (messageCount === 0 && answerLength < 50) {
    return {
      anamnesis: 0,
      exploracion: 0,
      razonamientoClinico: 0,
      tratamiento: 0,
      comunicacion: 0,
      feedback: {
        anamnesis: 'No se realizÃ³ ninguna pregunta al tutor ni se completÃ³ el anÃ¡lisis del caso. Es fundamental interactuar con el tutor para resolver el caso clÃ­nico.',
        exploracion: 'No se identificÃ³ ninguna exploraciÃ³n fÃ­sica ni anÃ¡lisis del caso. Debes proponer quÃ© pruebas realizarÃ­as segÃºn el enunciado.',
        razonamientoClinico: 'No se observÃ³ razonamiento clÃ­nico alguno. Es esencial analizar los datos del caso, formular hipÃ³tesis diagnÃ³sticas y justificar tu diagnÃ³stico.',
        tratamiento: 'No se propuso ningÃºn plan de tratamiento. Debes establecer objetivos terapÃ©uticos y tÃ©cnicas especÃ­ficas basadas en el diagnÃ³stico.',
        comunicacion: 'No hubo interacciÃ³n con el tutor. La comunicaciÃ³n y el diÃ¡logo durante la resoluciÃ³n del caso son fundamentales para el aprendizaje.'
      }
    };
  }
  
  const allText = (studentMessages.map(m => m.message).join(' ') + ' ' + studentAnswer).toLowerCase();
  const wordCount = allText.split(/\s+/).length;
  
  // Keywords para cada competencia
  const anamnesisKeywords = ['dolor', 'edad', 'ocupaciÃ³n', 'cronologÃ­a', 'inicio', 'evoluciÃ³n', 'antecedentes', 'factores', 'riesgo'];
  const exploracionKeywords = ['exploraciÃ³n', 'palpaciÃ³n', 'test', 'prueba', 'movimiento', 'rango', 'movilidad', 'fuerza', 'flexiÃ³n', 'extensiÃ³n'];
  const razonamientoKeywords = ['diagnÃ³stico', 'diferencial', 'hipÃ³tesis', 'patologÃ­a', 'anÃ¡lisis', 'porque', 'debido', 'considerando', 'indica', 'sugiere'];
  const tratamientoKeywords = ['tratamiento', 'objetivo', 'terapia', 'ejercicio', 'tÃ©cnica', 'plan', 'sesiÃ³n', 'frecuencia', 'progresiÃ³n'];
  const comunicacionKeywords = ['explico', 'entiendo', 'pregunta', 'duda', 'ayuda', 'pista', 'comprendo'];
  
  const countKeywords = (keywords: string[]) => {
    let count = 0;
    keywords.forEach(kw => {
      const regex = new RegExp(kw, 'gi');
      const matches = allText.match(regex);
      if (matches) count += matches.length;
    });
    return count;
  };
  
  // Calcular puntuaciones base
  let anamnesisScore = Math.min(85, (countKeywords(anamnesisKeywords) * 12) + (answerLength > 200 ? 20 : 10));
  let exploracionScore = Math.min(90, (countKeywords(exploracionKeywords) * 10) + (answerLength > 300 ? 25 : 10));
  let razonamientoScore = Math.min(95, (countKeywords(razonamientoKeywords) * 8) + (wordCount > 150 ? 30 : 15));
  let tratamientoScore = Math.min(90, (countKeywords(tratamientoKeywords) * 9) + (answerLength > 250 ? 20 : 10));
  let comunicacionScore = Math.min(85, (messageCount * 8) + (countKeywords(comunicacionKeywords) * 5));
  
  // Penalizaciones si no hay mensajes
  if (messageCount === 0) {
    anamnesisScore = Math.min(anamnesisScore, 30);
    exploracionScore = Math.min(exploracionScore, 30);
    comunicacionScore = Math.min(comunicacionScore, 20);
    razonamientoScore = Math.min(razonamientoScore, 40);
  }
  
  // Penalizaciones si la respuesta es muy corta
  if (answerLength < 100) {
    anamnesisScore = Math.min(anamnesisScore, 25);
    exploracionScore = Math.min(exploracionScore, 25);
    razonamientoScore = Math.min(razonamientoScore, 30);
    tratamientoScore = Math.min(tratamientoScore, 25);
  }
  
  // Asegurar que los valores estÃ©n entre 0 y 100
  anamnesisScore = Math.max(0, Math.min(100, Math.floor(anamnesisScore)));
  exploracionScore = Math.max(0, Math.min(100, Math.floor(exploracionScore)));
  razonamientoScore = Math.max(0, Math.min(100, Math.floor(razonamientoScore)));
  tratamientoScore = Math.max(0, Math.min(100, Math.floor(tratamientoScore)));
  comunicacionScore = Math.max(0, Math.min(100, Math.floor(comunicacionScore)));
  
  // Generar feedback contextual
  const generateFeedback = (score: number, aspect: string): string => {
    if (score === 0) {
      return `No se identificÃ³ ningÃºn trabajo en ${aspect}. Es fundamental desarrollar esta competencia.`;
    } else if (score < 40) {
      return `El trabajo en ${aspect} fue muy limitado. Necesitas profundizar mucho mÃ¡s en esta Ã¡rea y demostrar mejor comprensiÃ³n.`;
    } else if (score < 60) {
      return `Hay evidencia bÃ¡sica de ${aspect}, pero necesitas desarrollar mÃ¡s esta competencia con mayor detalle y profundidad.`;
    } else if (score < 80) {
      return `Buen trabajo en ${aspect}. Has demostrado comprensiÃ³n adecuada, pero podrÃ­as profundizar mÃ¡s y ser mÃ¡s especÃ­fico.`;
    } else {
      return `Excelente trabajo en ${aspect}. Has demostrado comprensiÃ³n sÃ³lida y anÃ¡lisis detallado de esta competencia.`;
    }
  };
  
  return {
    anamnesis: anamnesisScore,
    exploracion: exploracionScore,
    razonamientoClinico: razonamientoScore,
    tratamiento: tratamientoScore,
    comunicacion: comunicacionScore,
    feedback: {
      anamnesis: generateFeedback(anamnesisScore, 'la identificaciÃ³n y anÃ¡lisis de datos anamnÃ©sicos'),
      exploracion: generateFeedback(exploracionScore, 'la propuesta de exploraciÃ³n fÃ­sica'),
      razonamientoClinico: generateFeedback(razonamientoScore, 'el razonamiento clÃ­nico y diagnÃ³stico'),
      tratamiento: generateFeedback(tratamientoScore, 'la planificaciÃ³n del tratamiento'),
      comunicacion: messageCount === 0 
        ? 'No hubo interacciÃ³n con el tutor. Es importante usar esta herramienta pedagÃ³gica para resolver dudas y profundizar en el aprendizaje.'
        : generateFeedback(comunicacionScore, 'la comunicaciÃ³n y uso del tutor pedagÃ³gico')
    }
  };
}

// Guardar caso de examen completado
app.post("/make-server-eba6a2ba/exam/save", async (c) => {
  try {
    const { examCaseData } = await c.req.json();
    const student = await authenticatedStudent(c);
    if (!student) return c.json({ error: "Unauthorized" }, 401);
    const userId = student.id;
    
    if (!userId || !examCaseData) {
      return c.json({ error: "Missing userId or examCaseData" }, 400);
    }

    // Obtener casos de examen existentes
    const existingExamCases = await kv.get(`exam-cases:${userId}`) || [];
    
    // AÃ±adir el nuevo caso de examen
    existingExamCases.push(examCaseData);
    
    // Guardar de vuelta
    await kv.set(`exam-cases:${userId}`, existingExamCases);
    
    console.log(`Exam case saved for user ${userId}. Total exam cases: ${existingExamCases.length}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error saving exam case:", error);
    return c.json({ error: `Error saving exam case: ${error.message}` }, 500);
  }
});

// Obtener casos de examen completados
app.get("/make-server-eba6a2ba/exam/get", async (c) => {
  try {
    const student = await authenticatedStudent(c);
    if (!student) return c.json({ error: "Unauthorized" }, 401);
    const userId = student.id;
    
    console.log(`Fetching exam cases for user: ${userId}`);
    
    if (!userId) {
      console.error("Missing userId parameter");
      return c.json({ error: "Missing userId" }, 400);
    }

    const examCases = await kv.get(`exam-cases:${userId}`) || [];
    
    console.log(`âœ“ Retrieved ${examCases.length} exam cases for user ${userId}`);
    
    return c.json({ examCases });
  } catch (error) {
    console.error("Error fetching exam cases:", error.message, error.stack);
    return c.json({ error: `Error fetching exam cases: ${error.message}` }, 500);
  }
});

// FisioStudy - Explicar contenido de estudio
app.post("/make-server-eba6a2ba/study/explain", async (c) => {
  try {
    const { content, question, chatHistory } = await c.req.json();
    
    if (!content || !question) {
      return c.json({ error: "Content and question are required" }, 400);
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (openaiKey) {
      try {
        const conversationContext = chatHistory
          .map((msg: any) => `${msg.role === 'student' ? 'Estudiante' : 'Tutor'}: ${msg.content}`)
          .join('\n');

        const prompt = `Eres un TUTOR PEDAGÃ“GICO EXPERTO en fisioterapia. Un estudiante estÃ¡ estudiando el siguiente contenido:

CONTENIDO DE ESTUDIO:
${content}

HISTORIAL DE CONVERSACIÃ“N:
${conversationContext || 'Esta es la primera pregunta'}

PREGUNTA DEL ESTUDIANTE:
${question}

INSTRUCCIONES:
1. Responde de manera pedagÃ³gica y profesional
2. Si pide explicaciÃ³n, hazlo de forma clara y comprensible
3. Si pide ejemplos clÃ­nicos, proporciona casos reales aplicados a fisioterapia
4. Si pide simplificaciÃ³n, usa analogÃ­as y lenguaje mÃ¡s sencillo
5. MantÃ©n la rigurosidad acadÃ©mica pero sÃ© didÃ¡ctico
6. Anima al estudiante a reflexionar con preguntas guÃ­a cuando sea apropiado
7. SÃ© conciso pero completo (mÃ¡ximo 300 palabras)

Responde como tutor profesional y cercano.`;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "Eres un tutor pedagÃ³gico experto en fisioterapia, didÃ¡ctico y profesional." },
              { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 500,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const explanation = data.choices[0].message.content;
          console.log('AI study explanation generated');
          return c.json({ explanation });
        } else {
          console.error('OpenAI API error:', await response.text());
          throw new Error('OpenAI API error');
        }
      } catch (error) {
        console.error("OpenAI study explanation error:", error);
        // Fallback a respuesta genÃ©rica
      }
    }
    
    // Respuesta genÃ©rica si no hay OpenAI
    const genericResponse = `He analizado tu pregunta sobre el contenido. Para darte una respuesta mÃ¡s precisa y personalizada, te recomiendo que:

1. Identifica los conceptos clave del tema que has cargado
2. Relaciona estos conceptos con casos clÃ­nicos que hayas visto
3. Intenta explicar el concepto con tus propias palabras

En fisioterapia, es fundamental comprender no solo la teorÃ­a, sino cÃ³mo aplicarla en situaciones reales con pacientes.

Â¿Hay algÃºn concepto especÃ­fico del texto que te resulte especialmente difÃ­cil de comprender?`;

    return c.json({ explanation: genericResponse });
    
  } catch (error) {
    console.error("Error in study explain endpoint:", error);
    return c.json({ error: `Error explaining content: ${error.message}` }, 500);
  }
});

// FisioStudy - Generar quiz de comprensiÃ³n
app.post("/make-server-eba6a2ba/study/quiz", async (c) => {
  try {
    const { content } = await c.req.json();
    
    if (!content) {
      return c.json({ error: "Content is required" }, 400);
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (openaiKey) {
      try {
        const prompt = `Eres un PROFESOR DE FISIOTERAPIA creando material de evaluaciÃ³n. BasÃ¡ndote en el siguiente contenido de estudio:

CONTENIDO:
${content}

GENERA:
1. Un resumen conciso del tema (mÃ¡ximo 150 palabras) que identifique los conceptos clave
2. 5 preguntas tipo test de nivel universitario con 4 opciones cada una
3. Para cada pregunta, indica la respuesta correcta y una breve explicaciÃ³n (mÃ¡ximo 50 palabras)

Las preguntas deben:
- Evaluar comprensiÃ³n real, no memorizaciÃ³n
- Ser relevantes para la prÃ¡ctica clÃ­nica
- Cubrir diferentes aspectos del contenido
- Tener dificultad progresiva (de bÃ¡sico a avanzado)

Responde EXACTAMENTE en este formato JSON:
{
  "summary": "resumen del tema",
  "questions": [
    {
      "question": "texto de la pregunta",
      "options": ["opciÃ³n A", "opciÃ³n B", "opciÃ³n C", "opciÃ³n D"],
      "correctAnswer": "A",
      "explanation": "explicaciÃ³n breve de por quÃ© es correcta"
    }
  ]
}`;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "Eres un profesor de fisioterapia experto en evaluaciÃ³n. Respondes SIEMPRE en formato JSON vÃ¡lido." },
              { role: "user", content: prompt }
            ],
            temperature: 0.8,
            max_tokens: 1500,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          let quizResult = data.choices[0].message.content;
          
          // Limpiar posibles caracteres extra
          quizResult = quizResult.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          
          const parsedQuiz = JSON.parse(quizResult);
          console.log('AI study quiz generated');
          return c.json({ quiz: parsedQuiz });
        } else {
          console.error('OpenAI API error:', await response.text());
          throw new Error('OpenAI API error');
        }
      } catch (error) {
        console.error("OpenAI quiz generation error:", error);
        // Fallback a quiz genÃ©rico
      }
    }
    
    // Quiz genÃ©rico si no hay OpenAI
    const genericQuiz = {
      summary: "Has cargado contenido de estudio sobre fisioterapia. Para una evaluaciÃ³n personalizada basada en tu contenido especÃ­fico, necesitamos configurar la integraciÃ³n con IA. Por ahora, te recomendamos revisar manualmente los conceptos clave y crear tus propias preguntas de autoevaluaciÃ³n.",
      questions: [
        {
          question: "Â¿CuÃ¡l es el objetivo principal del contenido que has estudiado?",
          options: [
            "Memorizar definiciones tÃ©cnicas",
            "Comprender conceptos y su aplicaciÃ³n clÃ­nica",
            "Aprobar el examen sin mÃ¡s",
            "Conocer terminologÃ­a mÃ©dica"
          ],
          correctAnswer: "B",
          explanation: "En fisioterapia, lo importante es comprender los conceptos para aplicarlos en la prÃ¡ctica clÃ­nica real."
        },
        {
          question: "Â¿CÃ³mo aplicarÃ­as este conocimiento en un contexto clÃ­nico?",
          options: [
            "Siguiendo protocolos estrictos sin pensar",
            "AdaptÃ¡ndolo segÃºn cada paciente",
            "Solo en casos muy especÃ­ficos",
            "No es aplicable clÃ­nicamente"
          ],
          correctAnswer: "B",
          explanation: "Cada paciente es Ãºnico y requiere adaptaciÃ³n del conocimiento teÃ³rico a su situaciÃ³n particular."
        }
      ]
    };

    return c.json({ quiz: genericQuiz });
    
  } catch (error) {
    console.error("Error in quiz generation endpoint:", error);
    return c.json({ error: `Error generating quiz: ${error.message}` }, 500);
  }
});

Deno.serve(app.fetch);
