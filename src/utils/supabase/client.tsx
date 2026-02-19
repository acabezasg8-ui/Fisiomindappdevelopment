// Cliente de Supabase - Conectado al backend
import { projectId, publicAnonKey } from './info.tsx';

export type CaseData = {
  id: string;
  patientName: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  pathology: string;
  date: string;
  evaluation?: {
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
  chatHistory?: Array<{ role: 'student' | 'patient'; message: string }>;
  notes?: string;
};

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-eba6a2ba`;

// Helper para obtener headers con autenticación
const getHeaders = () => {
  const accessToken = localStorage.getItem('fisiomind_access_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken || publicAnonKey}`,
  };
};

// Helper para obtener userId
const getUserId = (): string | null => {
  return localStorage.getItem('fisiomind_user_id');
};

// ============ FUNCIONES DE AUTENTICACIÓN ============

// Login con Supabase Auth
export const login = async (email: string, password: string): Promise<{ userId: string; userName: string; accessToken: string } | null> => {
  try {
    const response = await fetch(`${SERVER_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Login error:', error);
      // Lanzar error con mensaje del servidor para que AuthScreen lo capture
      throw new Error(error.error || 'Error al iniciar sesión');
    }

    const data = await response.json();
    
    // Guardar sesión en localStorage
    localStorage.setItem('fisiomind_user_id', data.userId);
    localStorage.setItem('fisiomind_user_name', data.userName);
    localStorage.setItem('fisiomind_access_token', data.accessToken);
    
    return data;
  } catch (error) {
    console.error('Error in login:', error);
    throw error; // Propagar el error para que AuthScreen lo maneje
  }
};

// Signup con Supabase Auth
export const signup = async (email: string, password: string, name: string): Promise<{ userId: string; userName: string; accessToken: string }> => {
  try {
    const response = await fetch(`${SERVER_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear cuenta');
    }

    const data = await response.json();
    
    // Guardar sesión en localStorage
    localStorage.setItem('fisiomind_user_id', data.userId);
    localStorage.setItem('fisiomind_user_name', name);
    localStorage.setItem('fisiomind_access_token', data.accessToken);
    
    return { userId: data.userId, userName: name, accessToken: data.accessToken };
  } catch (error) {
    console.error('Error in signup:', error);
    throw error;
  }
};

// Verificar sesión activa
export const checkSession = async (): Promise<{ userId: string; userName: string } | null> => {
  const userId = localStorage.getItem('fisiomind_user_id');
  const userName = localStorage.getItem('fisiomind_user_name');
  const accessToken = localStorage.getItem('fisiomind_access_token');
  
  if (!userId || !accessToken) {
    return null;
  }
  
  return { userId, userName: userName || 'Estudiante' };
};

// Cerrar sesión
export const logout = async (): Promise<void> => {
  localStorage.removeItem('fisiomind_user_id');
  localStorage.removeItem('fisiomind_user_name');
  localStorage.removeItem('fisiomind_access_token');
};

// ============ FUNCIONES DE CASOS CLÍNICOS ============

// Guardar un caso completado
export const saveCompletedCase = async (caseData: CaseData): Promise<void> => {
  try {
    const userId = getUserId();
    if (!userId) {
      throw new Error('No user session');
    }

    const response = await fetch(`${SERVER_URL}/cases/save`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId, caseData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error saving case');
    }

    console.log('Case saved successfully');
  } catch (error) {
    console.error('Error saving case:', error);
    throw error;
  }
};

// Obtener todos los casos completados
export const getCompletedCases = async (): Promise<CaseData[]> => {
  try {
    const userId = getUserId();
    if (!userId) {
      return [];
    }

    const response = await fetch(`${SERVER_URL}/cases/get?userId=${userId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error fetching cases');
    }

    const data = await response.json();
    return data.cases || [];
  } catch (error) {
    console.error('Error fetching cases:', error);
    return [];
  }
};

// Generar un nuevo caso clínico
export const generateNewCase = async (): Promise<CaseData> => {
  try {
    const response = await fetch(`${SERVER_URL}/cases/generate`, {
      method: 'POST',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error generating case');
    }

    const data = await response.json();
    return data.case;
  } catch (error) {
    console.error('Error generating case:', error);
    throw error;
  }
};

// Generar respuesta de IA (paciente virtual o tutor)
export const generateAIResponse = async (
  message: string,
  caseData: CaseData,
  chatHistory: Array<{ role: 'student' | 'patient'; message: string }>,
  isExamMode: boolean = false
): Promise<string> => {
  try {
    const response = await fetch(`${SERVER_URL}/ai/response`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ 
        message, 
        caseData, 
        chatHistory,
        isExamMode 
      }),
    });

    if (!response.ok) {
      throw new Error('Error generating AI response');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error generating AI response:', error);
    return 'Lo siento, tuve un problema al generar la respuesta. Por favor, intenta de nuevo.';
  }
};

// Generar evaluación con IA
export const generateAIEvaluation = async (
  caseData: CaseData,
  chatHistory: Array<{ role: 'student' | 'patient'; message: string }>,
  notes: string
): Promise<any | null> => {
  try {
    const response = await fetch(`${SERVER_URL}/ai/evaluation`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ caseData, chatHistory, notes }),
    });

    if (!response.ok) {
      throw new Error('Error generating evaluation');
    }

    const data = await response.json();
    return data.evaluation;
  } catch (error) {
    console.error('Error generating evaluation:', error);
    return null;
  }
};

// Generar caso de examen
export const generateExamCase = async (): Promise<any> => {
  try {
    const response = await fetch(`${SERVER_URL}/exam/generate`, {
      method: 'POST',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error generating exam case');
    }

    const data = await response.json();
    return data.examCase;
  } catch (error) {
    console.error('Error generating exam case:', error);
    throw error;
  }
};

// Guardar caso de examen completado
export const saveCompletedExamCase = async (examCaseData: any): Promise<void> => {
  try {
    const userId = getUserId();
    if (!userId) {
      throw new Error('No user session');
    }

    const response = await fetch(`${SERVER_URL}/exam/save`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId, examCaseData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error saving exam case');
    }

    console.log('Exam case saved successfully');
  } catch (error) {
    console.error('Error saving exam case:', error);
    throw error;
  }
};

// Obtener casos de examen completados
export const getCompletedExamCases = async (): Promise<any[]> => {
  try {
    const userId = getUserId();
    if (!userId) {
      return [];
    }

    const response = await fetch(`${SERVER_URL}/exam/get?userId=${userId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error fetching exam cases');
    }

    const data = await response.json();
    return data.examCases || [];
  } catch (error) {
    console.error('Error fetching exam cases:', error);
    return [];
  }
};

// Explicar contenido de estudio con IA
export const explainStudyContent = async (
  content: string,
  question: string,
  chatHistory: Array<{ role: 'student' | 'tutor'; content: string }>
): Promise<string> => {
  try {
    const response = await fetch(`${SERVER_URL}/study/explain`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content, question, chatHistory }),
    });

    if (!response.ok) {
      throw new Error('Error explaining content');
    }

    const data = await response.json();
    return data.explanation;
  } catch (error) {
    console.error('Error explaining content:', error);
    return 'Lo siento, tuve un problema al generar la explicación. Por favor, intenta de nuevo.';
  }
};

// Generar quiz de estudio
export const generateStudyQuiz = async (content: string): Promise<any> => {
  try {
    const response = await fetch(`${SERVER_URL}/study/quiz`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error('Error generating quiz');
    }

    const data = await response.json();
    return data.quiz;
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
};

// Verificar si OpenAI está configurado
export const checkAIConfiguration = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${SERVER_URL}/ai/check`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.hasKey || false;
  } catch (error) {
    console.error('Error checking AI configuration:', error);
    return false;
  }
};