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

// Health check endpoint
app.get("/make-server-eba6a2ba/health", (c) => {
  return c.json({ status: "ok" });
});

// Auth - Login
app.post("/make-server-eba6a2ba/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: "Email y contraseña son requeridos" }, 400);
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
      
      // Mensaje más claro para el usuario
      if (error?.message?.includes('Invalid login credentials')) {
        console.log(`User not found or wrong password: ${email}. They may need to sign up first.`);
        return c.json({ 
          error: "Email o contraseña incorrectos. Si no tienes cuenta, haz clic en 'Registrarse' para crear una nueva." 
        }, 401);
      }
      
      if (error?.message?.includes('Email not confirmed')) {
        return c.json({ 
          error: "Por favor confirma tu email antes de iniciar sesión." 
        }, 401);
      }
      
      return c.json({ 
        error: error?.message || "Error al iniciar sesión. Por favor verifica tus credenciales." 
      }, 401);
    }

    const userName = data.user.user_metadata?.name || email.split('@')[0];

    console.log(`✓ User logged in successfully: ${email} (ID: ${data.user.id})`);
    return c.json({ 
      userId: data.user.id,
      userName: userName,
      accessToken: data.session.access_token,
    });

  } catch (error) {
    console.error("Error in login endpoint:", error);
    return c.json({ error: `Error al iniciar sesión: ${error.message}` }, 500);
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
      return c.json({ error: "La contraseña debe tener al menos 6 caracteres" }, 400);
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
      
      // Mensaje más claro para usuario duplicado
      if (error.message?.includes('already registered') || error.message?.includes('duplicate') || error.message?.includes('already been registered')) {
        console.log(`User already exists: ${email}`);
        return c.json({ error: "Este email ya está registrado. Por favor usa 'Iniciar Sesión' en su lugar." }, 400);
      }
      
      return c.json({ error: error.message || "Error al crear el usuario" }, 400);
    }

    if (!data.user) {
      console.error("User creation returned no user data");
      return c.json({ error: "No se pudo crear el usuario" }, 500);
    }

    console.log(`✓ User created successfully: ${email} (ID: ${data.user.id})`);

    // Iniciar sesión automáticamente después del registro usando ANON_KEY (no SERVICE_ROLE_KEY)
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
      // Usuario creado pero no se pudo iniciar sesión automáticamente
      console.error(`Auto-login failed for ${email}:`, sessionError?.message);
      console.log(`User can login manually with email: ${email}`);
      return c.json({ 
        userId: data.user.id,
        userName: name,
        message: "Cuenta creada. Por favor inicia sesión.",
      });
    }

    console.log(`✓ User auto-logged in successfully: ${email}`);
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
    
    // Añadir el nuevo caso
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
    
    console.log(`✓ Retrieved ${cases.length} cases for user ${userId}`);
    
    return c.json({ cases });
  } catch (error) {
    console.error("Error fetching cases:", error.message, error.stack);
    return c.json({ error: `Error fetching cases: ${error.message}` }, 500);
  }
});

// Obtener lista de marcos fisiopatológicos disponibles
app.get("/make-server-eba6a2ba/cases/frameworks", (c) => {
  try {
    console.log("Fetching available pathology frameworks...");
    const frameworks = getAllFrameworks();
    console.log(`✓ Retrieved ${frameworks.length} frameworks`);
    return c.json({ frameworks });
  } catch (error) {
    console.error("Error fetching frameworks:", error.message);
    return c.json({ error: `Error fetching frameworks: ${error.message}` }, 500);
  }
});

// Generar nuevo caso clínico usando marcos fisiopatológicos
app.post("/make-server-eba6a2ba/cases/generate", async (c) => {
  try {
    console.log("Generating new case from pathology frameworks...");
    
    // Seleccionar un marco fisiopatológico aleatorio
    const frameworkKeys = Object.keys(PATHOLOGY_FRAMEWORKS);
    const randomFrameworkKey = frameworkKeys[Math.floor(Math.random() * frameworkKeys.length)];
    
    console.log(`Selected framework: ${PATHOLOGY_FRAMEWORKS[randomFrameworkKey].name}`);
    
    // Generar caso desde el template
    const newCase = generateCaseFromTemplate(randomFrameworkKey);
    
    if (!newCase) {
      throw new Error("Failed to generate case from template");
    }

    console.log(`✓ Generated new case: ${newCase.patientName} - ${newCase.pathology}`);
    
    return c.json({ case: newCase });
  } catch (error) {
    console.error("Error generating case:", error.message, error.stack);
    return c.json({ error: `Error generating case: ${error.message}` }, 500);
  }
});

// Generar caso específico de un marco fisiopatológico
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

    console.log(`✓ Generated case from ${frameworkKey}: ${newCase.patientName} - ${newCase.pathology}`);
    
    return c.json({ case: newCase });
  } catch (error) {
    console.error("Error generating specific case:", error.message, error.stack);
    return c.json({ error: `Error generating case: ${error.message}` }, 500);
  }
});

// Verificar si OpenAI está configurado
app.get("/make-server-eba6a2ba/ai/check", (c) => {
  const hasKey = !!Deno.env.get("OPENAI_API_KEY");
  return c.json({ hasKey });
});

// Generar respuesta de IA
app.post("/make-server-eba6a2ba/ai/response", async (c) => {
  try {
    const { message, caseData, chatHistory, isExamMode } = await c.req.json();
    
    // Intentar usar OpenAI si está configurado
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (openaiKey) {
      try {
        // Preparar información clínica detallada si está disponible
        const clinicalDetailsText = caseData.clinicalDetails ? `

INFORMACIÓN CLÍNICA DETALLADA (USO INTERNO - NO REVELAR DIRECTAMENTE):
- Tipo de inicio: ${caseData.clinicalDetails.onsetType}
- Cronología: ${caseData.clinicalDetails.chronologyWeeks} semanas
- Factores agravantes: ${caseData.clinicalDetails.aggravatingFactors.join(', ')}
- Factores aliviantes: ${caseData.clinicalDetails.relievingFactors.join(', ')}
- Ocupación: ${caseData.occupation}

HALLAZGOS DE EXPLORACIÓN FÍSICA (responder según corresponda):
- Palpación: ${caseData.clinicalDetails.physicalFindings.palpation}
- Rango de movimiento: ${caseData.clinicalDetails.physicalFindings.rom}
- Fuerza muscular: ${caseData.clinicalDetails.physicalFindings.strength}
- Tests especiales: ${caseData.clinicalDetails.physicalFindings.specialTests}` : '';

        // Prompt diferente para modo examen (tutor) vs simulación (paciente)
        const systemPrompt = isExamMode ? 
        `Eres un TUTOR EXPERTO de fisioterapia ayudando a un estudiante a resolver un caso clínico de examen.

TU ROL: Guiar al estudiante hacia la solución correcta mediante el método socrático, sin dar respuestas directas.

CASO CLÍNICO:
- Paciente: ${caseData.age} años, ${caseData.gender}
- Ocupación: ${caseData.occupation || 'no especificada'}
- Motivo de consulta: ${caseData.chiefComplaint}
${clinicalDetailsText}

ESTRATEGIA PEDAGÓGICA:
1. Cuando te pregunten → Responde con otra pregunta que les haga pensar
2. Si van por buen camino → Refuerza positivamente y anima a profundizar
3. Si están perdidos → Da pistas indirectas que les orienten
4. Si cometen errores → Pregunta por qué piensan eso y guíales sutilmente
5. Enseña el RAZONAMIENTO, no solo la respuesta

ÁREAS A CUBRIR:
- Identificación de datos clave del enunciado
- Anatomía y biomecánica relevante
- Diagnóstico diferencial (2-3 opciones)
- Justificación del diagnóstico principal
- Objetivos terapéuticos SMART
- Plan de tratamiento basado en evidencia
- Educación y prevención

ESTILO DE COMUNICACIÓN:
- Socrático: "¿Qué estructuras anatómicas están implicadas según la localización?"
- Positivo: "Exacto, vas por buen camino. ¿Y qué más?"
- Orientador: "Piensa en la edad y ocupación del paciente. ¿Qué te sugiere?"
- Explicativo cuando lo pidan: "Te explico el porqué..."

NUNCA des la respuesta completa directamente. Objetivo: que el estudiante APRENDA y RAZONE.

Mantén respuestas de 2-4 frases, claras y motivadoras.`
        :
        `Eres un PACIENTE REAL que acude a consulta de fisioterapia. Tu comportamiento debe ser 100% realista.

INFORMACIÓN DEL PACIENTE:
- Nombre: ${caseData.patientName}
- Edad: ${caseData.age} años
- Género: ${caseData.gender}
- Ocupación: ${caseData.occupation || 'no especificada'}
- Queja: ${caseData.chiefComplaint}
${clinicalDetailsText}

1. PRIMER MENSAJE - Saluda y di tu queja SIMPLE:
   - "Hola doctor, vengo con un dolor de rodilla que no se me pasa"
   - "Buenas, llevo días con dolor de cabeza y cuello rígido"
   - NO des detalles ni uses términos médicos

2. RESPONDE SOLO LO QUE TE PREGUNTEN:
   - NO sabes qué tienes (NUNCA digas "tendinitis", "hernia", términos médicos)
   - Sensaciones simples: "me duele", "no puedo...", "siento que..."
   - Si dolor: intensidad simple ("mucho", "poco"), tipo cotidiano ("punzante", "sordo")
   - Si cuándo empezó: aproximado ("hace unas semanas", "unos días")
   - Si exploración: responde natural según hallazgos ("Ay duele", "No llego", "Tira")
   - 1-3 frases máximo, habla como paciente real
   - NUNCA digas diagnóstico ni términos médicos

3. PISTAS si olvidan:
   - Tras 5-6 mensajes sin explorar: "¿No me va a revisar?"
   - Si no preguntan cronología: "llevo tiempo así"`;

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

// Función para generar respuestas locales mejoradas
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
    msg.role === 'student' && (msg.message.toLowerCase().includes('cuándo') || msg.message.toLowerCase().includes('empezó'))
  );
  const hasAskedWork = chatHistory.some(msg => 
    msg.role === 'student' && (msg.message.toLowerCase().includes('trabajo') || msg.message.toLowerCase().includes('actividad'))
  );
  const hasExamined = chatHistory.some(msg => 
    msg.role === 'student' && (msg.message.toLowerCase().includes('exploración') || msg.message.toLowerCase().includes('examinar') || msg.message.toLowerCase().includes('movimiento'))
  );
  
  // RESPUESTAS ESPECÍFICAS SEGÚN PATOLOGÍA Y PREGUNTA

  // PREGUNTAS SOBRE CARACTERÍSTICAS DEL DOLOR
  if (lowerMessage.includes('dolor') || lowerMessage.includes('molestia') || lowerMessage.includes('duele')) {
    if (lowerMessage.includes('intensidad') || lowerMessage.includes('eva') || lowerMessage.includes('escala') || lowerMessage.includes('cuánto')) {
      if (caseData.pathology.includes('cervical')) {
        return 'Pues bastante, diría que un 6 ó 7. Hay días que es insoportable.';
      } else if (caseData.pathology.includes('lumbar')) {
        return 'Cuando estoy sentado mucho rato es muy fuerte, un 7 fácilmente.';
      } else if (caseData.pathology.includes('hombro') || caseData.pathology.includes('supraespinoso')) {
        return 'En reposo casi nada, pero al levantar el brazo me duele muchísimo, un 8.';
      } else {
        return 'Depende del momento, pero suele estar en 6 ó 7 cuando me molesta.';
      }
    }
    
    if (lowerMessage.includes('tipo') || lowerMessage.includes('cómo') || lowerMessage.includes('describe')) {
      if (caseData.pathology.includes('cervical')) {
        return 'Es como una tensión constante, un dolor sordo y profundo en la parte posterior del cuello. A veces irradia hacia los trapecios y la base del cráneo, como si llevara un peso encima.';
      } else if (caseData.pathology.includes('lumbar')) {
        return 'Es un dolor difuso, como una rigidez constante en la zona lumbar. No es punzante, más bien es un dolor sordo que se intensifica con ciertas posiciones.';
      } else if (caseData.pathology.includes('hombro') || caseData.pathology.includes('supraespinoso')) {
        return 'Es un dolor punzante y agudo cuando hago ciertos movimientos, especialmente al levantar el brazo lateralmente o al intentar alcanzar algo por encima de mi cabeza. En reposo es más bien una molestia sorda.';
      } else if (caseData.pathology.includes('rodilla') || caseData.pathology.includes('patelofemoral')) {
        return 'Siento como una presión profunda detrás de la rótula, especialmente notable al subir escaleras. A veces también noto crepitación, como un "crujido" al flexionar la rodilla.';
      } else if (caseData.pathology.includes('plantar')) {
        return 'Es como una punzada muy aguda en el talón, especialmente con los primeros pasos de la mañana. Luego se convierte en un dolor más sordo y constante si estoy mucho tiempo de pie.';
      } else if (caseData.pathology.includes('epicondilitis') || caseData.pathology.includes('codo')) {
        return 'Es un dolor agudo en la parte externa del codo que se intensifica al agarrar objetos o al girar la muñeca. A veces irradia hacia el antebrazo.';
      }
    }
    
    // Pregunta general sobre dolor
    if (caseData.pathology.includes('cervical')) {
      return 'El dolor está localizado principalmente en la zona posterior del cuello, bilateral pero más intenso en el lado derecho. Lo noto especialmente al final del día después de horas frente al ordenador.';
    } else if (caseData.pathology.includes('lumbar')) {
      return 'El dolor se concentra en la región lumbar baja, es bilateral y se agrava mucho con la sedestación prolongada. Mejora ligeramente al caminar o cambiar de posición.';
    } else if (caseData.pathology.includes('hombro') || caseData.pathology.includes('supraespinoso')) {
      return 'El dolor está en el hombro derecho, específicamente en la región lateral. Es muy agudo con la elevación del brazo, especialmente entre 60° y 120° de abducción.';
    } else if (caseData.pathology.includes('rodilla')) {
      return 'Siento el dolor en la parte anterior de la rodilla derecha, justo detrás de la rótula. Se intensifica al subir escaleras, agacharme o tras estar sentado mucho tiempo.';
    } else if (caseData.pathology.includes('manos') || caseData.pathology.includes('artrosis')) {
      return 'Las manos me duelen y están muy rígidas, especialmente por las mañanas. Afecta sobre todo a las articulaciones interfalángicas. Me limita para tareas que requieren precisión.';
    } else if (caseData.pathology.includes('plantar') || caseData.pathology.includes('pie')) {
      return 'El dolor es muy intenso en el talón y la zona medial de la planta del pie. Los primeros pasos al levantarme son casi insoportables, luego mejora algo pero vuelve con actividad prolongada.';
    } else if (caseData.pathology.includes('codo') || caseData.pathology.includes('epicondilitis')) {
      return 'Me duele mucho la parte externa del codo derecho, en el epicóndilo lateral. Se intensifica al agarrar objetos, girar la muñeca o al jugar al tenis.';
    } else if (caseData.pathology.includes('contractura') || caseData.pathology.includes('paravertebral')) {
      return 'Tengo un dolor muy intenso en la espalda media-baja, unilateral en el lado derecho. Noto la musculatura muy tensa y contracturada. Cualquier movimiento me duele.';
    }
  }

  // PREGUNTAS SOBRE INICIO Y CRONOLOGÍA
  if (lowerMessage.includes('cuándo') || lowerMessage.includes('cuando') || lowerMessage.includes('empezó') || lowerMessage.includes('comenzó') || lowerMessage.includes('inicio') || lowerMessage.includes('tiempo')) {
    if (caseData.pathology.includes('cervical')) {
      return 'Empecé a notarlo hace unas 2-3 semanas. Coincidió con un período de mucho estrés en el trabajo y jornadas muy largas frente al ordenador. Al principio era una molestia leve, pero ha ido empeorando progresivamente.';
    } else if (caseData.pathology.includes('lumbar')) {
      return 'Llevo con este dolor aproximadamente 3-4 meses. Empezó de forma gradual, sin un traumatismo claro. Creo que fue empeorando desde que comencé a teletrabajar y paso más horas sentado.';
    } else if (caseData.pathology.includes('hombro') || caseData.pathology.includes('supraespinoso')) {
      return 'Comenzó hace unas 3 semanas. Recuerdo que ese día en el trabajo tuve que cargar varias cajas pesadas por encima de la cabeza. Sentí un pinchazo agudo y desde entonces no he mejorado, incluso ha empeorado.';
    } else if (caseData.pathology.includes('rodilla') || caseData.pathology.includes('patelofemoral')) {
      return 'Llevo notándolo unas 4-5 semanas. Empezó después de aumentar la intensidad de mis entrenamientos de running. Al principio solo me molestaba al subir escaleras, ahora es más constante.';
    } else if (caseData.pathology.includes('plantar')) {
      return 'Empecé con este dolor hace aproximadamente 6 semanas. Trabajo de pie muchas horas al día y ese mes tuve turnos extra. Los primeros días pensé que se me pasaría con reposo, pero ha ido a peor.';
    } else if (caseData.pathology.includes('epicondilitis')) {
      return 'Llevo así unas 4 semanas. Juego al tenis 3 veces por semana y ese mes intensifiqué los entrenamientos preparando un torneo. El dolor apareció gradualmente y ahora me limita incluso para actividades cotidianas.';
    } else if (caseData.pathology.includes('contractura')) {
      return 'Esto empezó hace 3-4 días. Estaba moviendo muebles en casa y levanté un peso de forma brusca con mala postura. Sentí un dolor agudo instantáneo y desde entonces apenas puedo moverme.';
    } else if (caseData.pathology.includes('artrosis')) {
      return 'Este problema lo tengo desde hace varios años, pero en los últimos 2-3 meses ha empeorado bastante. La rigidez matutina es cada vez más prolongada y las tareas cotidianas me cuestan más.';
    } else {
      return `Empecé a notarlo hace aproximadamente ${Math.floor(Math.random() * 3) + 2} semanas. Al principio era leve pero ha ido aumentando progresivamente, por eso decidí venir.`;
    }
  }

  // PREGUNTAS SOBRE ACTIVIDADES Y OCUPACIÓN
  if (lowerMessage.includes('actividad') || lowerMessage.includes('trabajo') || lowerMessage.includes('haces') || lowerMessage.includes('profesión') || lowerMessage.includes('ocupación') || lowerMessage.includes('deporte')) {
    if (caseData.pathology.includes('cervical')) {
      return 'Trabajo como administrativo en una oficina, paso entre 8-10 horas diarias frente al ordenador. Mi postura no es muy buena y últimamente el estrés laboral ha aumentado mucho. No hago ejercicio regular, la verdad.';
    } else if (caseData.pathology.includes('lumbar')) {
      return 'Soy programador y trabajo desde casa. Paso prácticamente todo el día sentado, a veces hasta 12 horas sin apenas levantarme. Mi setup no es muy ergonómico y creo que mi silla es bastante mala.';
    } else if (caseData.pathology.includes('hombro') || caseData.pathology.includes('supraespinoso')) {
      return 'Trabajo en logística, en un almacén. Mi trabajo implica levantar y mover cajas con frecuencia, muchas veces por encima de la cabeza. También juego a baloncesto los fines de semana.';
    } else if (caseData.pathology.includes('rodilla') || caseData.pathology.includes('patelofemoral')) {
      return 'Trabajo en una tienda, estoy de pie o caminando la mayor parte del día. Además, salgo a correr 4-5 días a la semana. Hace poco aumenté el kilometraje preparando una media maratón.';
    } else if (caseData.pathology.includes('plantar')) {
      return 'Soy enfermero/a, trabajo en un hospital y paso todo mi turno de pie o caminando. Son turnos de 12 horas. Últimamente he hecho muchas horas extra. No uso calzado muy adecuado, la verdad.';
    } else if (caseData.pathology.includes('epicondilitis')) {
      return 'Soy diseñador gráfico, uso mucho el ratón durante todo el día. Además, juego al tenis 3 veces por semana a nivel amateur competitivo. También hago algo de pádel ocasionalmente.';
    } else if (caseData.pathology.includes('contractura')) {
      return 'Trabajo en una mudanza, pero este dolor específico me vino por mover muebles en mi propia casa. Hice un mal movimiento levantando un sofá sin ayuda y con mala técnica.';
    } else if (caseData.pathology.includes('artrosis')) {
      return 'Estoy jubilado/a, pero durante muchos años trabajé como cocinero/a, con mucha actividad manual repetitiva. Ahora hago tareas domésticas y algo de jardinería, aunque cada vez me cuesta más.';
    } else {
      return 'Mi trabajo es principalmente sedentario, aunque intento hacer algo de ejercicio cuando puedo. Últimamente he notado que ciertas actividades me provocan más molestias de lo habitual.';
    }
  }

  if (lowerMessage.includes('noche') || lowerMessage.includes('dormir') || lowerMessage.includes('sueño')) {
    return 'Por las noches a veces me cuesta encontrar una postura cómoda, pero en general puedo dormir. Me despierto con un poco de rigidez pero se me va pasando.';
  }

  if (lowerMessage.includes('medicación') || lowerMessage.includes('medicamento') || lowerMessage.includes('tomado')) {
    return 'He tomado algún ibuprofeno cuando el dolor era más intenso, y me alivia un poco temporalmente. No tomo ninguna otra medicación de forma habitual.';
  }

  // EXPLORACIÓN FÍSICA - Respuestas según patología
  if (lowerMessage.includes('exploración') || lowerMessage.includes('examinar') || lowerMessage.includes('evaluar') || lowerMessage.includes('valorar') || lowerMessage.includes('explorar')) {
    return 'Por supuesto, adelante. Dígame qué necesita que haga o cómo puedo ayudarle con la exploración.';
  }

  if (lowerMessage.includes('movimiento') || lowerMessage.includes('mover') || lowerMessage.includes('flexión') || lowerMessage.includes('extensión') || lowerMessage.includes('rotación') || lowerMessage.includes('abducción') || lowerMessage.includes('aducción') || lowerMessage.includes('rango')) {
    if (caseData.pathology.includes('cervical')) {
      return 'Al hacer flexión noto bastante tensión y me tira por detrás del cuello. La rotación también está limitada, especialmente a la derecha donde llego solo hasta unos 60°. La extensión me produce dolor en la base del cráneo.';
    } else if (caseData.pathology.includes('lumbar')) {
      return 'La flexión del tronco está muy limitada, apenas llego a tocarme las rodillas por el dolor y rigidez lumbar. La extensión también me duele. Los movimientos laterales están algo mejor pero noto tirantez.';
    } else if (caseData.pathology.includes('hombro') || caseData.pathology.includes('supraespinoso')) {
      return '¡Ay! La abducción me duele mucho entre los 60° y 120°, es un arco doloroso muy claro. No puedo levantar el brazo completamente. La rotación externa también está limitada y dolorosa. La flexión anterior está algo mejor pero tampoco es completa.';
    } else if (caseData.pathology.includes('rodilla') || caseData.pathology.includes('patelofemoral')) {
      return 'Puedo flexionar y extender la rodilla, pero noto crepitación y dolor retropatelar en todo el arco, especialmente en flexión profunda. Al subir escaleras es cuando más me duele. En extensión activa con resistencia también me molesta bastante.';
    } else if (caseData.pathology.includes('epicondilitis')) {
      return 'La flexo-extensión del codo es normal, pero cuando hago pronación o supinación del antebrazo, especialmente contra resistencia, me produce un dolor agudo en el epicóndilo lateral. También me duele al extender la muñeca contra resistencia.';
    } else {
      return 'Sí, ese movimiento me produce molestias significativas. Noto limitación del rango y dolor al intentar completar el movimiento. ¿Quiere que intente otro?';
    }
  }

  if (lowerMessage.includes('palpación') || lowerMessage.includes('palpar') || lowerMessage.includes('tocar') || lowerMessage.includes('presión') || lowerMessage.includes('punto') || lowerMessage.includes('zona')) {
    if (caseData.pathology.includes('cervical')) {
      return '¡Ahí! Justo ahí en el trapecio superior y la musculatura cervical posterior noto mucha sensibilidad. Está muy contracturado y doloroso a la palpación, especialmente en el lado derecho. Noto como puntos gatillo.';
    } else if (caseData.pathology.includes('lumbar')) {
      return 'En la musculatura paravertebral lumbar noto mucha tensión bilateral. Está muy sensible a la presión. La zona está como agarrotada y muy rígida. Las apófisis espinosas también están sensibles.';
    } else if (caseData.pathology.includes('hombro') || caseData.pathology.includes('supraespinoso')) {
      return 'Uff, justo en la región del troquíter y el espacio subacromial me duele bastante con la palpación. También noto sensibilidad en la inserción del supraespinoso. El test de Neer me provoca dolor.';
    } else if (caseData.pathology.includes('rodilla') || caseData.pathology.includes('patelofemoral')) {
      return 'La palpación de los bordes rotulianos es dolorosa, especialmente el borde lateral. También me duele al comprimir la rótula contra el fémur. No noto derrame pero sí sensibilidad perirotuliana.';
    } else if (caseData.pathology.includes('plantar')) {
      return '¡Ay! Justo ahí en la inserción de la fascia en el talón me duele muchísimo. Es muy sensible a la palpación, especialmente en el borde medial del calcáneo. La fascia se nota engrosada y muy tensa.';
    } else if (caseData.pathology.includes('epicondilitis')) {
      return 'Exacto, en el epicóndilo lateral es donde más me duele. La palpación ahí es muy sensible. También noto dolor con la palpación de la musculatura extensora del antebrazo. El test de Cozen me reproduce el dolor.';
    } else {
      return 'Ahí noto bastante sensibilidad. Esa zona está especialmente dolorida a la presión. Me reproduce el dolor que tengo habitualmente.';
    }
  }
  
  // Tests específicos
  if (lowerMessage.includes('fuerza') || lowerMessage.includes('resistencia') || lowerMessage.includes('contra') || lowerMessage.includes('músculo')) {
    if (caseData.pathology.includes('hombro') || caseData.pathology.includes('supraespinoso')) {
      return 'Noto debilidad al intentar mantener la posición contra resistencia, especialmente en abducción. El test de Jobe me produce dolor y dificultad para mantener la posición. Claramente tengo menos fuerza que en el lado sano.';
    } else if (caseData.pathology.includes('rodilla')) {
      return 'La fuerza del cuádriceps parece estar conservada, pero me duele al hacer extensión contra resistencia. Noto que evito inconscientemente cargar en esa pierna.';
    } else {
      return 'La fuerza está algo disminuida por el dolor. Me cuesta hacer fuerza contra resistencia en esa zona sin que me duela.';
    }
  }

  if (lowerMessage.includes('tratamiento') || lowerMessage.includes('masaje') || lowerMessage.includes('terapia') || lowerMessage.includes('ejercicio')) {
    return 'De acuerdo, entiendo. ¿Y eso me va a ayudar? ¿Cuánto tiempo tendré que hacerlo?';
  }

  if (lowerMessage.includes('ejercicios') || lowerMessage.includes('casa') || lowerMessage.includes('recomendaciones')) {
    return 'Perfecto, tomaré nota de todo. ¿Hay algo más que deba evitar o tener en cuenta en mi día a día?';
  }

  if (lowerMessage.includes('mejorar') || lowerMessage.includes('recuperación') || lowerMessage.includes('tiempo')) {
    return 'Muchas gracias por la información. Me quedo más tranquilo/a sabiendo que es algo que tiene solución con el tratamiento adecuado.';
  }

  if (lowerMessage.includes('preguntas') || lowerMessage.includes('dudas')) {
    return 'Creo que por ahora me ha quedado todo claro. Muchas gracias por su atención y profesionalidad.';
  }
  
  // FACTORES AGRAVANTES Y ATENUANTES
  if (lowerMessage.includes('agrava') || lowerMessage.includes('empeora') || lowerMessage.includes('peor') || lowerMessage.includes('aumenta')) {
    if (caseData.pathology.includes('cervical')) {
      return 'El dolor empeora definitivamente con posiciones mantenidas frente al ordenador, el estrés y al final del día. También noto que empeora en la cama si duermo en mala posición. El frío también me afecta.';
    } else if (caseData.pathology.includes('lumbar')) {
      return 'Se agrava muchísimo con la sedestación prolongada, especialmente más de 30 minutos. También al levantarme después de estar sentado y con movimientos de flexión del tronco. Por la mañana al despertarme también está peor.';
    } else if (caseData.pathology.includes('hombro')) {
      return 'Empeora claramente con movimientos por encima de la cabeza, al vestirme o al intentar dormir sobre ese hombro. Cargar peso también lo agrava mucho.';
    } else if (caseData.pathology.includes('rodilla')) {
      return 'Se intensifica al subir y bajar escaleras, especialmente al bajar. También al estar mucho tiempo sentado con la rodilla flexionada y al levantarme. Correr ahora es imposible.';
    } else {
      return 'Empeora con actividades específicas relacionadas con el movimiento de esa zona y tras uso prolongado. También noto que está peor por las mañanas.';
    }
  }
  
  if (lowerMessage.includes('alivia') || lowerMessage.includes('mejora') || lowerMessage.includes('mejor') || lowerMessage.includes('calma')) {
    if (caseData.pathology.includes('cervical')) {
      return 'Mejora algo con el calor local, masajes suaves en la zona y cuando puedo descansar en posición horizontal. El ibuprofeno también me ayuda temporalmente. Mover el cuello suavemente parece que afloja un poco.';
    } else if (caseData.pathology.includes('lumbar')) {
      return 'El reposo en decúbito supino con las piernas elevadas me alivia bastante. También mejora cuando camino un poco. El calor local me va bien. La medicación antiinflamatoria reduce el dolor durante unas horas.';
    } else if (caseData.pathology.includes('plantar')) {
      return 'Mejora con el reposo y elevación del pie. El hielo después de estar de pie me va bien. Por la noche, cuando no cargo peso, casi no me molesta. Los estiramientos suaves también parecen ayudar algo.';
    } else {
      return 'Mejora con reposo, evitando los movimientos que me producen dolor. Los antiinflamatorios me dan alivio temporal. El calor/frío local también ayuda.';
    }
  }
  
  // FEEDBACK PEDAGÓGICO - Si llevan muchos mensajes sin hacer cosas importantes
  if (messageCount > 8 && !hasExamined) {
    const examPrompts = [
      'Doctor, ¿no va a examinarme físicamente? Me gustaría saber qué tengo exactamente.',
      'Disculpe, ¿no me va a hacer una exploración? Creo que sería importante valorar el movimiento y la zona.',
    ];
    return examPrompts[Math.floor(Math.random() * examPrompts.length)];
  }
  
  if (messageCount > 6 && !hasAskedPain) {
    return 'Por cierto, no sé si le he descrito bien el dolor. ¿No quiere que le especifique más sobre las características del dolor?';
  }
  
  if (messageCount > 5 && !hasAskedOnset) {
    return 'No le he contado desde cuándo tengo esto ni cómo empezó. ¿Le interesa saberlo?';
  }
  
  if (messageCount > 12 && hasExamined) {
    return '¿Ya tiene suficiente información? ¿Qué cree que puede ser y qué tratamiento me recomienda?';
  }

  // RESPUESTAS GENÉRICAS MEJORADAS
  const genericResponses = [
    'Entiendo. ¿Qué más necesita saber para el diagnóstico?',
    'Sí, exacto.',
    'No, eso no lo había notado específicamente.',
    'Me gustaría que me explicara qué podemos hacer para mejorarlo. ¿Qué tratamiento me recomienda?',
    'De acuerdo, le escucho. Cuénteme más.',
    '¿Eso qué significa? ¿Es algo grave?',
    'Vale, entiendo. ¿Y eso cómo me va a ayudar?',
  ];

  return genericResponses[Math.floor(Math.random() * genericResponses.length)];
}

// Generar evaluación con IA
app.post("/make-server-eba6a2ba/ai/evaluation", async (c) => {
  try {
    const { caseData, chatHistory, notes } = await c.req.json();
    
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (openaiKey) {
      try {
        const studentMessages = chatHistory.filter((msg: any) => msg.role === 'student');
        const conversationSummary = studentMessages.map((msg: any) => msg.message).join('\n- ');
        
        const evaluationPrompt = `Eres un PROFESOR EXPERTO en fisioterapia evaluando a un estudiante. Analiza su desempeño:

CASO CLÍNICO:
- Patología: ${caseData.pathology}
- Paciente: ${caseData.patientName}, ${caseData.age} años, ${caseData.gender}
- Queja principal: ${caseData.chiefComplaint}

CONVERSACIÓN DEL ESTUDIANTE:
${conversationSummary}

NOTAS DEL ESTUDIANTE:
${notes || 'No tomó notas'}

EVALÚA (0-10) y da FEEDBACK EDUCATIVO en estas 5 competencias:

1. ANAMNESIS: ¿Preguntó sobre características del dolor (localización, tipo, intensidad EVA), inicio cronológico, factores agravantes/atenuantes, ocupación/actividades?
2. EXPLORACIÓN: ¿Realizó exploración física adecuada? ¿Tests específicos? ¿Palpación? ¿Rangos de movimiento?
3. RAZONAMIENTO CLÍNICO: ¿Analizó los datos correctamente? ¿Usó las notas? ¿Llegó al diagnóstico correcto?
4. TRATAMIENTO: ¿Propuso plan terapéutico coherente? ¿Técnicas apropiadas? ¿Objetivos claros?
5. COMUNICACIÓN: ¿Explicó bien al paciente? ¿Lenguaje apropiado? ¿Empatía? ¿Educación terapéutica?

Responde EXACTAMENTE en este formato JSON:
{
  "anamnesis": número de 0-10,
  "exploracion": número de 0-10,
  "razonamientoClinico": número de 0-10,
  "tratamiento": número de 0-10,
  "comunicacion": número de 0-10,
  "feedback": {
    "anamnesis": "feedback detallado y constructivo",
    "exploracion": "feedback detallado y constructivo",
    "razonamientoClinico": "feedback detallado y constructivo",
    "tratamiento": "feedback detallado y constructivo",
    "comunicacion": "feedback detallado y constructivo"
  }
}

Sé EXIGENTE pero CONSTRUCTIVO. El feedback debe explicar QUÉ hizo bien, QUÉ olvidó y CÓMO mejorar.`;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "Eres un profesor de fisioterapia experto en evaluación clínica. Respondes SIEMPRE en formato JSON válido." },
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
        // Fallback a evaluación local
      }
    }
    
    // Si no hay OpenAI, devolver null para que el frontend use su evaluación local
    return c.json({ evaluation: null });
    
  } catch (error) {
    console.error("Error generating evaluation:", error);
    return c.json({ error: `Error generating evaluation: ${error.message}` }, 500);
  }
});

// Generar caso clínico en formato examen
app.post("/make-server-eba6a2ba/exam/generate", async (c) => {
  try {
    console.log("Generating exam case...");
    
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (openaiKey) {
      try {
        const examPrompt = `Genera un caso clínico de fisioterapia en formato de examen profesional. El caso debe incluir:

1. DATOS DEL PACIENTE: Edad, ocupación/profesión, motivo de consulta principal
2. ANTECEDENTES: Información relevante (sedentarismo, actividad física, lesiones previas, factores de riesgo)
3. CARACTERÍSTICAS DEL DOLOR/PROBLEMA: Localización, tipo, evolución temporal, factores agravantes/atenuantes
4. EXPLORACIÓN FÍSICA (datos objetivos): Observación, palpación, rangos de movimiento, tests específicos con resultados
5. OBJETIVO: Qué se espera del estudiante (diagnóstico diferencial, plan de tratamiento, etc.)

El caso debe ser:
- Realista y basado en patologías comunes de fisioterapia
- Claro y bien estructurado como aparecería en un examen universitario
- Con información suficiente pero que requiera análisis del estudiante
- En español profesional

Ejemplos de patologías: cervicalgia mecánica, lumbalgia, tendinopatías, síndromes compresivos, artrosis, lesiones deportivas, etc.

Devuelve SOLO el texto del caso, sin introducción ni explicaciones adicionales. Formato profesional como examen.`;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "Eres un profesor de fisioterapia creando casos clínicos para exámenes. Generas casos realistas, bien estructurados y pedagógicos." },
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

      `PACIENTE: Mujer de 58 años, administrativa, consulta por dolor y rigidez en ambas manos.

ANTECEDENTES: Trabajo de oficina (uso intensivo de ordenador y escritura), madre con artrosis de manos, menopausia hace 3 años. Sintomatología progresiva en últimos 6 meses.

SINTOMATOLOGÍA: Rigidez matutina en articulaciones interfalángicas de ambas manos (duración 45-60 minutos), dolor sordo EVA 4/10 que aumenta con actividades de precisión (escribir, abrir botes, coser). Mejora con movimiento gradual. Sensación de "manos hinchadas" por las mañanas.

EXPLORACIÓN FÍSICA:
- Observación: Leve tumefacción en IFP de 2º y 3º dedos bilateral, nódulos de Heberden incipientes
- Palpación: Articulaciones IFP sensibles, crepitación palpable, temperatura local normal
- Rangos de movimiento: Flexión metacarpofalángica limitada (70-75°), dolor al final del rango
- Fuerza de prensión: Disminuida bilateral (dinamometría: 18 kg dcha, 16 kg izq; normal: 25-30 kg)
- Tests funcionales: Dificultad en tareas de precisión y fuerza

OBJETIVO: Diagnóstico diferencial, educación sobre progresión de la condición, y programa de tratamiento conservador incluyendo ejercicios, órtesis y consejos ergonómicos.`,

      `PACIENTE: Hombre de 35 años, trabajador de almacén, dolor agudo en región lumbar baja desde hace 4 días.

ANTECEDENTES: Trabajo con manipulación manual de cargas, episodio actual tras levantar caja pesada (≈25 kg) con flexión de tronco y rotación. Sin antecedentes de lumbalgia. Fumador ocasional.

SINTOMATOLOGÍA: Dolor agudo en región lumbar izquierda (L4-L5 aproximadamente), EVA 7-8/10 en reposo, 9/10 con movimientos. Contractura muscular intensa. Sin irradiación a miembro inferior. Leve mejoría con decúbito lateral y aplicación de frío.

EXPLORACIÓN FÍSICA:
- Postura: Actitud antiálgica, escoliosis antálgica hacia lado derecho
- Palpación: Contractura severa en musculatura paravertebral lumbar izquierda, espasmo muscular palpable
- Rangos de movimiento: Flexión lumbar 30° (muy limitada por dolor), extensión y lateroflexiones limitadas
- Test de Lasègue: Negativo bilateral
- Sensibilidad y reflejos: Normales en MMII
- Signos de alarma (red flags): Ausentes

OBJETIVO: Diagnóstico diferencial entre contractura muscular aguda vs. otras causas, manejo del dolor en fase aguda, educación postural y plan de tratamiento para prevenir recurrencias.`
    ];

    const randomExamCase = localExamCases[Math.floor(Math.random() * localExamCases.length)];
    
    const examCase = {
      id: Date.now().toString(),
      caseStatement: randomExamCase,
      isCustom: false,
      date: new Date().toLocaleDateString('es-ES'),
    };

    console.log(`✓ Local exam case generated`);
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
            anamnesis: 'No se realizó ninguna pregunta al tutor ni se completó el análisis del caso. Es fundamental interactuar con el tutor para resolver el caso clínico.',
            exploracion: 'No se identificó ninguna exploración física ni análisis del caso. Debes proponer qué pruebas realizarías según el enunciado.',
            razonamientoClinico: 'No se observó razonamiento clínico alguno. Es esencial analizar los datos del caso, formular hipótesis diagnósticas y justificar tu diagnóstico.',
            tratamiento: 'No se propuso ningún plan de tratamiento. Debes establecer objetivos terapéuticos y técnicas específicas basadas en el diagnóstico.',
            comunicacion: 'No hubo interacción con el tutor. La comunicación y el diálogo durante la resolución del caso son fundamentales para el aprendizaje.'
          }
        }
      });
    }
    
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (openaiKey) {
      try {
        const conversationSummary = studentMessages.map((msg: any) => msg.message).join('\n- ');
        
        const evaluationPrompt = `Eres un PROFESOR EXPERTO en fisioterapia evaluando el desempeño de un estudiante en un CASO DE EXAMEN.

CASO CLÍNICO PRESENTADO:
${examCase.caseStatement}

INTERACCIÓN DEL ESTUDIANTE CON EL TUTOR (${studentMessages.length} mensajes):
${conversationSummary || 'No hubo interacción con el tutor'}

RESPUESTA FINAL DEL ESTUDIANTE:
${studentAnswer || 'No proporcionó respuesta escrita'}

INSTRUCCIONES DE EVALUACIÓN:

Evalúa el desempeño del estudiante en 5 competencias clave (0-100):

1. ANAMNESIS (0-100):
   - ¿Identificó correctamente los datos clave del enunciado?
   - ¿Preguntó al tutor sobre información relevante que necesitaba aclarar?
   - ¿Consideró factores de riesgo, ocupación, cronología?
   - SI NO HAY MENSAJES: Máximo 30 puntos solo si la respuesta escrita menciona bien la anamnesis

2. EXPLORACIÓN FÍSICA (0-100):
   - ¿Identificó qué pruebas/tests realizar según el caso?
   - ¿Interpretó correctamente los datos de exploración del enunciado?
   - ¿Propuso tests específicos coherentes con sus hipótesis?
   - SI NO HAY MENSAJES: Máximo 30 puntos solo si la respuesta menciona exploración detallada

3. RAZONAMIENTO CLÍNICO (0-100):
   - ¿Analizó la información de forma lógica y estructurada?
   - ¿Formuló diagnóstico diferencial?
   - ¿Justificó el diagnóstico principal con los datos del caso?
   - ¿Demostró conocimiento de la patología?
   - Este es el criterio MÁS IMPORTANTE

4. TRATAMIENTO (0-100):
   - ¿Propuso plan terapéutico coherente con el diagnóstico?
   - ¿Estableció objetivos SMART?
   - ¿Mencionó técnicas específicas basadas en evidencia?
   - ¿Consideró prevención y educación?

5. COMUNICACIÓN/PEDAGOGÍA (0-100):
   - ¿Usó el tutor de forma efectiva para aprender?
   - ¿Hizo preguntas inteligentes y relevantes?
   - ¿Demostró pensamiento crítico en el diálogo?
   - ¿Su respuesta final está bien estructurada y clara?
   - SI NO HAY MENSAJES: Máximo 20 puntos

IMPORTANTE:
- Sé EXIGENTE pero JUSTO
- Valora MÁS la calidad que la cantidad
- Si el estudiante no interactuó con el tutor pero escribió buena respuesta: penaliza comunicación pero evalúa el contenido
- Si no hay respuesta escrita pero sí interacción: evalúa lo que preguntó/discutió
- El feedback debe ser CONSTRUCTIVO: menciona qué hizo bien, qué faltó, cómo mejorar
- NO des puntuaciones altas si no demostró conocimiento real

Responde EXACTAMENTE en este formato JSON:
{
  "anamnesis": número entre 0-100,
  "exploracion": número entre 0-100,
  "razonamientoClinico": número entre 0-100,
  "tratamiento": número entre 0-100,
  "comunicacion": número entre 0-100,
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
              { role: "system", content: "Eres un profesor de fisioterapia experto en evaluación de casos clínicos de examen. Eres EXIGENTE pero JUSTO. Respondes SIEMPRE en formato JSON válido." },
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
        // Fallback a evaluación local
      }
    }
    
    // Evaluación local si no hay OpenAI
    console.log('Using local exam evaluation');
    const localEvaluation = generateLocalExamEvaluation(studentMessages, studentAnswer, examCase);
    return c.json({ evaluation: localEvaluation });
    
  } catch (error) {
    console.error("Error evaluating exam case:", error);
    return c.json({ error: `Error evaluating exam case: ${error.message}` }, 500);
  }
});

// Función para generar evaluación local de examen
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
        anamnesis: 'No se realizó ninguna pregunta al tutor ni se completó el análisis del caso. Es fundamental interactuar con el tutor para resolver el caso clínico.',
        exploracion: 'No se identificó ninguna exploración física ni análisis del caso. Debes proponer qué pruebas realizarías según el enunciado.',
        razonamientoClinico: 'No se observó razonamiento clínico alguno. Es esencial analizar los datos del caso, formular hipótesis diagnósticas y justificar tu diagnóstico.',
        tratamiento: 'No se propuso ningún plan de tratamiento. Debes establecer objetivos terapéuticos y técnicas específicas basadas en el diagnóstico.',
        comunicacion: 'No hubo interacción con el tutor. La comunicación y el diálogo durante la resolución del caso son fundamentales para el aprendizaje.'
      }
    };
  }
  
  const allText = (studentMessages.map(m => m.message).join(' ') + ' ' + studentAnswer).toLowerCase();
  const wordCount = allText.split(/\s+/).length;
  
  // Keywords para cada competencia
  const anamnesisKeywords = ['dolor', 'edad', 'ocupación', 'cronología', 'inicio', 'evolución', 'antecedentes', 'factores', 'riesgo'];
  const exploracionKeywords = ['exploración', 'palpación', 'test', 'prueba', 'movimiento', 'rango', 'movilidad', 'fuerza', 'flexión', 'extensión'];
  const razonamientoKeywords = ['diagnóstico', 'diferencial', 'hipótesis', 'patología', 'análisis', 'porque', 'debido', 'considerando', 'indica', 'sugiere'];
  const tratamientoKeywords = ['tratamiento', 'objetivo', 'terapia', 'ejercicio', 'técnica', 'plan', 'sesión', 'frecuencia', 'progresión'];
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
  
  // Asegurar que los valores estén entre 0 y 100
  anamnesisScore = Math.max(0, Math.min(100, Math.floor(anamnesisScore)));
  exploracionScore = Math.max(0, Math.min(100, Math.floor(exploracionScore)));
  razonamientoScore = Math.max(0, Math.min(100, Math.floor(razonamientoScore)));
  tratamientoScore = Math.max(0, Math.min(100, Math.floor(tratamientoScore)));
  comunicacionScore = Math.max(0, Math.min(100, Math.floor(comunicacionScore)));
  
  // Generar feedback contextual
  const generateFeedback = (score: number, aspect: string): string => {
    if (score === 0) {
      return `No se identificó ningún trabajo en ${aspect}. Es fundamental desarrollar esta competencia.`;
    } else if (score < 40) {
      return `El trabajo en ${aspect} fue muy limitado. Necesitas profundizar mucho más en esta área y demostrar mejor comprensión.`;
    } else if (score < 60) {
      return `Hay evidencia básica de ${aspect}, pero necesitas desarrollar más esta competencia con mayor detalle y profundidad.`;
    } else if (score < 80) {
      return `Buen trabajo en ${aspect}. Has demostrado comprensión adecuada, pero podrías profundizar más y ser más específico.`;
    } else {
      return `Excelente trabajo en ${aspect}. Has demostrado comprensión sólida y análisis detallado de esta competencia.`;
    }
  };
  
  return {
    anamnesis: anamnesisScore,
    exploracion: exploracionScore,
    razonamientoClinico: razonamientoScore,
    tratamiento: tratamientoScore,
    comunicacion: comunicacionScore,
    feedback: {
      anamnesis: generateFeedback(anamnesisScore, 'la identificación y análisis de datos anamnésicos'),
      exploracion: generateFeedback(exploracionScore, 'la propuesta de exploración física'),
      razonamientoClinico: generateFeedback(razonamientoScore, 'el razonamiento clínico y diagnóstico'),
      tratamiento: generateFeedback(tratamientoScore, 'la planificación del tratamiento'),
      comunicacion: messageCount === 0 
        ? 'No hubo interacción con el tutor. Es importante usar esta herramienta pedagógica para resolver dudas y profundizar en el aprendizaje.'
        : generateFeedback(comunicacionScore, 'la comunicación y uso del tutor pedagógico')
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
    
    // Añadir el nuevo caso de examen
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
    
    console.log(`✓ Retrieved ${examCases.length} exam cases for user ${userId}`);
    
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

        const prompt = `Eres un TUTOR PEDAGÓGICO EXPERTO en fisioterapia. Un estudiante está estudiando el siguiente contenido:

CONTENIDO DE ESTUDIO:
${content}

HISTORIAL DE CONVERSACIÓN:
${conversationContext || 'Esta es la primera pregunta'}

PREGUNTA DEL ESTUDIANTE:
${question}

INSTRUCCIONES:
1. Responde de manera pedagógica y profesional
2. Si pide explicación, hazlo de forma clara y comprensible
3. Si pide ejemplos clínicos, proporciona casos reales aplicados a fisioterapia
4. Si pide simplificación, usa analogías y lenguaje más sencillo
5. Mantén la rigurosidad académica pero sé didáctico
6. Anima al estudiante a reflexionar con preguntas guía cuando sea apropiado
7. Sé conciso pero completo (máximo 300 palabras)

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
              { role: "system", content: "Eres un tutor pedagógico experto en fisioterapia, didáctico y profesional." },
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
        // Fallback a respuesta genérica
      }
    }
    
    // Respuesta genérica si no hay OpenAI
    const genericResponse = `He analizado tu pregunta sobre el contenido. Para darte una respuesta más precisa y personalizada, te recomiendo que:

1. Identifica los conceptos clave del tema que has cargado
2. Relaciona estos conceptos con casos clínicos que hayas visto
3. Intenta explicar el concepto con tus propias palabras

En fisioterapia, es fundamental comprender no solo la teoría, sino cómo aplicarla en situaciones reales con pacientes.

¿Hay algún concepto específico del texto que te resulte especialmente difícil de comprender?`;

    return c.json({ explanation: genericResponse });
    
  } catch (error) {
    console.error("Error in study explain endpoint:", error);
    return c.json({ error: `Error explaining content: ${error.message}` }, 500);
  }
});

// FisioStudy - Generar quiz de comprensión
app.post("/make-server-eba6a2ba/study/quiz", async (c) => {
  try {
    const { content } = await c.req.json();
    
    if (!content) {
      return c.json({ error: "Content is required" }, 400);
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (openaiKey) {
      try {
        const prompt = `Eres un PROFESOR DE FISIOTERAPIA creando material de evaluación. Basándote en el siguiente contenido de estudio:

CONTENIDO:
${content}

GENERA:
1. Un resumen conciso del tema (máximo 150 palabras) que identifique los conceptos clave
2. 5 preguntas tipo test de nivel universitario con 4 opciones cada una
3. Para cada pregunta, indica la respuesta correcta y una breve explicación (máximo 50 palabras)

Las preguntas deben:
- Evaluar comprensión real, no memorización
- Ser relevantes para la práctica clínica
- Cubrir diferentes aspectos del contenido
- Tener dificultad progresiva (de básico a avanzado)

Responde EXACTAMENTE en este formato JSON:
{
  "summary": "resumen del tema",
  "questions": [
    {
      "question": "texto de la pregunta",
      "options": ["opción A", "opción B", "opción C", "opción D"],
      "correctAnswer": "A",
      "explanation": "explicación breve de por qué es correcta"
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
              { role: "system", content: "Eres un profesor de fisioterapia experto en evaluación. Respondes SIEMPRE en formato JSON válido." },
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
        // Fallback a quiz genérico
      }
    }
    
    // Quiz genérico si no hay OpenAI
    const genericQuiz = {
      summary: "Has cargado contenido de estudio sobre fisioterapia. Para una evaluación personalizada basada en tu contenido específico, necesitamos configurar la integración con IA. Por ahora, te recomendamos revisar manualmente los conceptos clave y crear tus propias preguntas de autoevaluación.",
      questions: [
        {
          question: "¿Cuál es el objetivo principal del contenido que has estudiado?",
          options: [
            "Memorizar definiciones técnicas",
            "Comprender conceptos y su aplicación clínica",
            "Aprobar el examen sin más",
            "Conocer terminología médica"
          ],
          correctAnswer: "B",
          explanation: "En fisioterapia, lo importante es comprender los conceptos para aplicarlos en la práctica clínica real."
        },
        {
          question: "¿Cómo aplicarías este conocimiento en un contexto clínico?",
          options: [
            "Siguiendo protocolos estrictos sin pensar",
            "Adaptándolo según cada paciente",
            "Solo en casos muy específicos",
            "No es aplicable clínicamente"
          ],
          correctAnswer: "B",
          explanation: "Cada paciente es único y requiere adaptación del conocimiento teórico a su situación particular."
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