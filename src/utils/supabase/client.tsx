import { projectId, publicAnonKey } from './info.tsx';

/**
 * =========================================================
 * Tipos compartidos
 * =========================================================
 */
export type TrainingStage =
  | 'ANAMNESIS'
  | 'ANAMNESIS_VALORACION'
  | 'ANAMNESIS_VALORACION_TRATAMIENTO';

export type ClinicalArea = 'MSK' | 'NEURO' | 'RESPI';

export type TrainingConfig = {
  stage: TrainingStage;
  area?: ClinicalArea;
  academicLevel?: '1' | '2' | '3' | '4';
};

export type ChatMessage = {
  role: 'student' | 'patient';
  message: string;
};

export type EvaluationResult = {
  anamnesis: number;
  exploracion: number;
  razonamientoClinico: number;
  tratamiento: number;
  comunicacion: number;
  feedback: {
    anamnesis: string;
    exploracion: string;
    razonamientoClinico: string;
    tratamiento: string;
    comunicacion: string;
  };
};

export type CaseData = {
  id: string;
  patientName: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  pathology: string;
  date: string;
  trainingConfig?: TrainingConfig;
  evaluation?: EvaluationResult;
  chatHistory?: ChatMessage[];
  notes?: string;
};

export type ExamMessage = {
  role: 'student' | 'tutor';
  message: string;
  isHint?: boolean;
};

export type ExamCaseData = {
  id: string;
  caseStatement: string;
  patientInfo?: {
    age?: number;
    occupation?: string;
    chiefComplaint?: string;
  };
  pathology?: string;
  isCustom: boolean;
  date: string;
  evaluation?: EvaluationResult;
  messages?: ExamMessage[];
  studentAnswer?: string;
};

type SessionData = {
  userId: string;
  userName: string;
  accessToken: string;
};

type ChatEvaluationResponse = {
  evaluation?: {
    competencias?: Array<{
      id?: string;
      score?: number;
      feedback?: string;
    }>;
    global?: {
      score?: number;
      resumen?: string;
    };
    fortalezas?: string[];
    errores_clave?: string[];
    preguntas_omitidas?: string[];
    sesgos_detectados?: string[];
    siguiente_paso?: string;
  };
  error?: string;
  raw?: string;
};

/**
 * =========================================================
 * Endpoints
 * =========================================================
 */
const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-eba6a2ba`;
const CHAT_FUNCTION_URL = '/.netlify/functions/chat';

/**
 * =========================================================
 * Helpers base
 * =========================================================
 */
function getAnonHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${publicAnonKey}`,
  };
}

function getAuthHeaders() {
  const accessToken = localStorage.getItem('fisiomind_access_token');

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken || publicAnonKey}`,
  };
}

function getUserId(): string | null {
  return localStorage.getItem('fisiomind_user_id');
}

function getUserName(): string | null {
  return localStorage.getItem('fisiomind_user_name');
}

function getAccessToken(): string | null {
  return localStorage.getItem('fisiomind_access_token');
}

async function parseJsonSafe<T = any>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function parseErrorMessage(
  response: Response,
  fallbackMessage: string
): Promise<string> {
  const data = await parseJsonSafe<{ error?: string }>(response);
  return data?.error || fallbackMessage;
}

function mapChatHistoryToOpenAIFormat(history: ChatMessage[]) {
  return history.map((msg) => ({
    role: msg.role === 'student' ? 'user' : 'assistant',
    content: msg.message,
  }));
}

function clampScore(value: unknown): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function safeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function getCompetencyScore(
  competencias: ChatEvaluationResponse['evaluation'] extends { competencias?: infer T }
    ? T
    : never,
  id: string
): number {
  if (!Array.isArray(competencias)) return 0;
  const item = competencias.find((c: any) => c?.id === id);
  return clampScore(item?.score);
}

function getCompetencyFeedback(
  competencias: ChatEvaluationResponse['evaluation'] extends { competencias?: infer T }
    ? T
    : never,
  id: string,
  fallback: string
): string {
  if (!Array.isArray(competencias)) return fallback;
  const item = competencias.find((c: any) => c?.id === id);
  return safeString(item?.feedback, fallback);
}

function normalizeChatEvaluationToAppFormat(
  raw: ChatEvaluationResponse['evaluation'] | null | undefined
): EvaluationResult | null {
  if (!raw || !Array.isArray(raw.competencias)) return null;

  const anamnesis = getCompetencyScore(raw.competencias, 'anamnesis');
  const exploracion = getCompetencyScore(raw.competencias, 'exploracion');
  const razonamientoClinico = getCompetencyScore(
    raw.competencias,
    'razonamiento_clinico'
  );
  const tratamiento = getCompetencyScore(raw.competencias, 'tratamiento');
  const comunicacion = getCompetencyScore(raw.competencias, 'comunicacion');

  const hasSomeScore =
    anamnesis > 0 ||
    exploracion > 0 ||
    razonamientoClinico > 0 ||
    tratamiento > 0 ||
    comunicacion > 0;

  if (!hasSomeScore) return null;

  return {
    anamnesis,
    exploracion,
    razonamientoClinico,
    tratamiento,
    comunicacion,
    feedback: {
      anamnesis: getCompetencyFeedback(
        raw.competencias,
        'anamnesis',
        'La anamnesis puede afinarse mejor en cronología, comportamiento y factores agravantes o alivio.'
      ),
      exploracion: getCompetencyFeedback(
        raw.competencias,
        'exploracion',
        'La exploración debe relacionarse mejor con tus hipótesis clínicas.'
      ),
      razonamientoClinico: getCompetencyFeedback(
        raw.competencias,
        'razonamiento_clinico',
        'El razonamiento clínico puede mejorar si conectas mejor datos, hipótesis y decisiones.'
      ),
      tratamiento: getCompetencyFeedback(
        raw.competencias,
        'tratamiento',
        'El tratamiento debe encajar mejor con el caso y con el objetivo funcional.'
      ),
      comunicacion: getCompetencyFeedback(
        raw.competencias,
        'comunicacion',
        'La comunicación puede ganar claridad, estructura y enfoque centrado en el paciente.'
      ),
    },
  };
}

/**
 * =========================================================
 * Auth
 * =========================================================
 */
export const login = async (
  email: string,
  password: string
): Promise<SessionData | null> => {
  try {
    const response = await fetch(`${SERVER_URL}/auth/login`, {
      method: 'POST',
      headers: getAnonHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorMessage = await parseErrorMessage(
        response,
        'Error al iniciar sesión'
      );
      throw new Error(errorMessage);
    }

    const data = await parseJsonSafe<SessionData>(response);

    if (!data?.userId || !data?.accessToken) {
      throw new Error('Respuesta inválida del servidor al iniciar sesión');
    }

    localStorage.setItem('fisiomind_user_id', data.userId);
    localStorage.setItem('fisiomind_user_name', data.userName);
    localStorage.setItem('fisiomind_access_token', data.accessToken);

    return data;
  } catch (error) {
    console.error('Error in login:', error);
    throw error;
  }
};

export const signup = async (
  email: string,
  password: string,
  name: string
): Promise<SessionData> => {
  try {
    const response = await fetch(`${SERVER_URL}/auth/signup`, {
      method: 'POST',
      headers: getAnonHeaders(),
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const errorMessage = await parseErrorMessage(
        response,
        'Error al crear cuenta'
      );
      throw new Error(errorMessage);
    }

    const data = await parseJsonSafe<{
      userId: string;
      accessToken: string;
      userName?: string;
    }>(response);

    if (!data?.userId || !data?.accessToken) {
      throw new Error('Respuesta inválida del servidor al crear cuenta');
    }

    const session: SessionData = {
      userId: data.userId,
      userName: data.userName || name,
      accessToken: data.accessToken,
    };

    localStorage.setItem('fisiomind_user_id', session.userId);
    localStorage.setItem('fisiomind_user_name', session.userName);
    localStorage.setItem('fisiomind_access_token', session.accessToken);

    return session;
  } catch (error) {
    console.error('Error in signup:', error);
    throw error;
  }
};

export const checkSession = async (): Promise<{
  userId: string;
  userName: string;
} | null> => {
  const userId = getUserId();
  const userName = getUserName();
  const accessToken = getAccessToken();

  if (!userId || !accessToken) {
    return null;
  }

  return {
    userId,
    userName: userName || 'Estudiante',
  };
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem('fisiomind_user_id');
  localStorage.removeItem('fisiomind_user_name');
  localStorage.removeItem('fisiomind_access_token');
};

/**
 * =========================================================
 * Casos clínicos - persistencia Supabase
 * =========================================================
 */
export const saveCompletedCase = async (caseData: CaseData): Promise<void> => {
  try {
    const userId = getUserId();

    if (!userId) {
      throw new Error('No user session');
    }

    const response = await fetch(`${SERVER_URL}/cases/save`, {
      method: 'POST',
      headers: getAnonHeaders(),
      body: JSON.stringify({ userId, caseData }),
    });

    if (!response.ok) {
      const errorMessage = await parseErrorMessage(
        response,
        'Error saving case'
      );
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error saving case:', error);
    throw error;
  }
};

export const getCompletedCases = async (): Promise<CaseData[]> => {
  try {
    const userId = getUserId();

    if (!userId) {
      return [];
    }

    const response = await fetch(`${SERVER_URL}/cases/get?userId=${userId}`, {
      method: 'GET',
      headers: getAnonHeaders(),
    });

    if (!response.ok) {
      const errorMessage = await parseErrorMessage(
        response,
        'Error fetching cases'
      );
      throw new Error(errorMessage);
    }

    const data = await parseJsonSafe<{ cases?: CaseData[] }>(response);
    return data?.cases || [];
  } catch (error) {
    console.error('Error fetching cases:', error);
    return [];
  }
};

/**
 * =========================================================
 * Generación de casos
 * =========================================================
 */
export const generateNewCase = async (
  trainingConfig: TrainingConfig
): Promise<CaseData> => {
  try {
    const response = await fetch(`${SERVER_URL}/cases/generate`, {
      method: 'POST',
      headers: getAnonHeaders(),
      body: JSON.stringify({ trainingConfig }),
    });

    if (!response.ok) {
      const errorMessage = await parseErrorMessage(
        response,
        'Error generating case'
      );
      throw new Error(errorMessage);
    }

    const data = await parseJsonSafe<{ case?: CaseData }>(response);

    if (!data?.case) {
      throw new Error('No se recibió ningún caso desde el servidor');
    }

    return {
      ...data.case,
      trainingConfig,
    };
  } catch (error) {
    console.error('Error generating case:', error);
    throw error;
  }
};

/**
 * =========================================================
 * IA clínica - NETLIFY FUNCTION NUEVA
 * =========================================================
 * Mantener aquí el cliente te permite centralizar llamadas
 * aunque la UI ya llame directo al backend si quieres.
 */
export const generatePatientReply = async ({
  message,
  caseData,
  chatHistory,
}: {
  message: string;
  caseData: CaseData;
  chatHistory: ChatMessage[];
}): Promise<{
  reply: string;
  caseMeta?: {
    region_or_topic?: string;
    framework?: string;
    pathology_hidden?: string;
    difficulty?: string;
  };
}> => {
  try {
    const response = await fetch(CHAT_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'casos_libres',
        action: 'paciente',
        message,
        history: mapChatHistoryToOpenAIFormat(chatHistory),
        trainingConfig: caseData.trainingConfig,
        seed: caseData.id,
      }),
    });

    const data = await parseJsonSafe<{
      reply?: string;
      error?: string;
      caseMeta?: {
        region_or_topic?: string;
        framework?: string;
        pathology_hidden?: string;
        difficulty?: string;
      };
    }>(response);

    if (!response.ok) {
      throw new Error(data?.error || 'Error al generar respuesta del paciente');
    }

    return {
      reply:
        safeString(data?.reply, 'Disculpe, ¿puede repetir la pregunta?'),
      caseMeta: data?.caseMeta,
    };
  } catch (error) {
    console.error('Error generating patient reply:', error);
    return {
      reply: 'Disculpe, ¿puede repetir la pregunta?',
    };
  }
};

/**
 * =========================================================
 * Compatibilidad con código antiguo
 * =========================================================
 */
export const generateAIResponse = async (
  message: string,
  caseData: CaseData,
  chatHistory: ChatMessage[],
  isExamMode = false
): Promise<string> => {
  if (isExamMode) {
    return 'Este flujo de examen no usa generateAIResponse en la arquitectura actual.';
  }

  const result = await generatePatientReply({
    message,
    caseData,
    chatHistory,
  });

  return result.reply;
};

/**
 * =========================================================
 * Evaluación IA - NETLIFY FUNCTION NUEVA
 * =========================================================
 */
export const generateAIEvaluation = async (
  caseData: CaseData,
  chatHistory: ChatHistoryMessage[],
  notes: string
): Promise<EvaluationResult | null> => {
  try {
    const studentMessages = chatHistory
      .filter((msg) => msg.role === 'student')
      .map((msg) => msg.message)
      .join('\n');

    const patientMessages = chatHistory
      .filter((msg) => msg.role === 'patient')
      .map((msg) => msg.message)
      .join('\n');

    const stage = caseData.trainingConfig?.stage || 'ANAMNESIS_VALORACION_TRATAMIENTO';
    const area = caseData.trainingConfig?.area || 'MSK';
    const academicLevel = caseData.trainingConfig?.academicLevel || '2';

    const evaluationPrompt = `
Evalúa el desempeño del alumno en este caso clínico.

DATOS DEL CASO
- Paciente: ${caseData.patientName}
- Edad: ${caseData.age}
- Género: ${caseData.gender}
- Motivo principal: ${caseData.chiefComplaint}
- Patología interna del caso: ${caseData.pathology}
- Stage: ${stage}
- Área: ${area}
- Nivel académico: ${academicLevel}º

CONVERSACIÓN DEL ALUMNO
${studentMessages || 'Sin mensajes del alumno'}

RESPUESTAS DEL PACIENTE
${patientMessages || 'Sin respuestas del paciente'}

NOTAS DEL ALUMNO
${notes || 'Sin notas'}

Evalúa anamnesis, exploración, razonamiento clínico, tratamiento y comunicación según el stage del caso.
`.trim();

    const response = await fetch(CHAT_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'casos_libres',
        action: 'evaluar',
        message: evaluationPrompt,
        history: [],
        trainingConfig: caseData.trainingConfig,
        seed: caseData.id,
      }),
    });

    const data = await parseJsonSafe<ChatEvaluationResponse>(response);

    if (!response.ok) {
      throw new Error(data?.error || 'Error generating evaluation');
    }

    if (data?.evaluation) {
      return normalizeChatEvaluationToAppFormat(data.evaluation);
    }

    return null;
  } catch (error) {
    console.error('Error generating AI evaluation:', error);
    return null;
  }
};

type ChatHistoryMessage = {
  role: 'student' | 'patient';
  message: string;
};

/**
 * =========================================================
 * Casos de examen
 * =========================================================
 */
export const generateExamCase = async (): Promise<ExamCaseData> => {
  try {
    const response = await fetch(`${SERVER_URL}/exam/generate`, {
      method: 'POST',
      headers: getAnonHeaders(),
    });

    if (!response.ok) {
      const errorMessage = await parseErrorMessage(
        response,
        'Error generating exam case'
      );
      throw new Error(errorMessage);
    }

    const data = await parseJsonSafe<{ examCase?: ExamCaseData }>(response);

    if (!data?.examCase) {
      throw new Error('No se recibió ningún caso de examen');
    }

    return data.examCase;
  } catch (error) {
    console.error('Error generating exam case:', error);
    throw error;
  }
};

export const saveCompletedExamCase = async (
  examCaseData: ExamCaseData
): Promise<void> => {
  try {
    const userId = getUserId();

    if (!userId) {
      throw new Error('No user session');
    }

    const response = await fetch(`${SERVER_URL}/exam/save`, {
      method: 'POST',
      headers: getAnonHeaders(),
      body: JSON.stringify({ userId, examCaseData }),
    });

    if (!response.ok) {
      const errorMessage = await parseErrorMessage(
        response,
        'Error saving exam case'
      );
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error saving exam case:', error);
    throw error;
  }
};

export const getCompletedExamCases = async (): Promise<ExamCaseData[]> => {
  try {
    const userId = getUserId();

    if (!userId) {
      return [];
    }

    const response = await fetch(`${SERVER_URL}/exam/get?userId=${userId}`, {
      method: 'GET',
      headers: getAnonHeaders(),
    });

    if (!response.ok) {
      const errorMessage = await parseErrorMessage(
        response,
        'Error fetching exam cases'
      );
      throw new Error(errorMessage);
    }

    const data = await parseJsonSafe<{ examCases?: ExamCaseData[] }>(response);
    return data?.examCases || [];
  } catch (error) {
    console.error('Error fetching exam cases:', error);
    return [];
  }
};

/**
 * =========================================================
 * Estudio
 * =========================================================
 */
export const explainStudyContent = async (
  content: string,
  question: string,
  chatHistory: Array<{ role: 'student' | 'tutor'; content: string }>
): Promise<string> => {
  try {
    const response = await fetch(`${SERVER_URL}/study/explain`, {
      method: 'POST',
      headers: getAnonHeaders(),
      body: JSON.stringify({ content, question, chatHistory }),
    });

    if (!response.ok) {
      const errorMessage = await parseErrorMessage(
        response,
        'Error explaining content'
      );
      throw new Error(errorMessage);
    }

    const data = await parseJsonSafe<{ explanation?: string }>(response);
    return (
      safeString(
        data?.explanation,
        'Lo siento, tuve un problema al generar la explicación.'
      )
    );
  } catch (error) {
    console.error('Error explaining content:', error);
    return 'Lo siento, tuve un problema al generar la explicación. Por favor, intenta de nuevo.';
  }
};

export const generateStudyQuiz = async (content: string): Promise<any> => {
  try {
    const response = await fetch(`${SERVER_URL}/study/quiz`, {
      method: 'POST',
      headers: getAnonHeaders(),
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const errorMessage = await parseErrorMessage(
        response,
        'Error generating quiz'
      );
      throw new Error(errorMessage);
    }

    const data = await parseJsonSafe<{ quiz?: any }>(response);
    return data?.quiz;
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
};

/**
 * =========================================================
 * Config IA
 * =========================================================
 */
export const checkAIConfiguration = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${SERVER_URL}/ai/check`, {
      method: 'GET',
      headers: getAnonHeaders(),
    });

    if (!response.ok) return false;

    const data = await parseJsonSafe<{ hasKey?: boolean }>(response);
    return !!data?.hasKey;
  } catch (error) {
    console.error('Error checking AI configuration:', error);
    return false;
  }
};
