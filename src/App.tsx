import { useState, useEffect } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { CaseSimulation } from './components/CaseSimulation';
import { EvaluationScreen } from './components/EvaluationScreen';
import { ProgressScreen } from './components/ProgressScreen';
import { ExamModeScreen } from './components/ExamModeScreen';
import { ExamCaseResolution } from './components/ExamCaseResolution';
import { ExamEvaluationScreen } from './components/ExamEvaluationScreen';
import { CaseReviewScreen } from './components/CaseReviewScreen';
import { ExamCaseReviewScreen } from './components/ExamCaseReviewScreen';
import { FisioStudyScreen } from './components/FisioStudyScreen';
import { AuthScreen } from './components/AuthScreen';
import { DemoMode } from './components/DemoMode';
import { 
  getCompletedCases, 
  generateNewCase, 
  saveCompletedCase, 
  generateExamCase, 
  checkSession, 
  logout,
  saveCompletedExamCase,
  getCompletedExamCases
} from './utils/supabase/client';
import { toast, Toaster } from 'sonner@2.0.3';

export type CaseData = {
  id: string;
  patientName: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  pathology: string;
  date: string;
  evaluation?: EvaluationResult;
  chatHistory?: Array<{ role: 'student' | 'patient'; message: string }>;
  notes?: string;
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

type Screen = 'home' | 'simulation' | 'evaluation' | 'progress' | 'exam-mode' | 'exam-resolution' | 'exam-evaluation' | 'case-review' | 'exam-case-review' | 'fisio-study' | 'demo';

type ExamCaseData = {
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
  messages?: Array<{ role: 'student' | 'tutor'; message: string; isHint?: boolean }>;
  studentAnswer?: string;
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [currentCase, setCurrentCase] = useState<CaseData | null>(null);
  const [currentExamCase, setCurrentExamCase] = useState<ExamCaseData | null>(null);
  const [reviewCase, setReviewCase] = useState<CaseData | null>(null);
  const [reviewExamCase, setReviewExamCase] = useState<ExamCaseData | null>(null);
  const [examMessages, setExamMessages] = useState<Array<{ role: 'student' | 'tutor'; message: string; isHint?: boolean }>>([]);
  const [examStudentAnswer, setExamStudentAnswer] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'student' | 'patient'; message: string }>>([]);
  const [notes, setNotes] = useState('');
  const [completedCases, setCompletedCases] = useState<CaseData[]>([]);
  const [completedExamCases, setCompletedExamCases] = useState<ExamCaseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar sesión al inicio
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Verificar si viene desde el botón "Probar demo"
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('mode') === 'demo') {
          setIsDemoMode(true);
          setIsLoading(false);
          return;
        }

        const session = await checkSession();
        
        if (session) {
          setIsAuthenticated(true);
          setUserName(session.userName);
          
          // Cargar casos completados del usuario
          const cases = await getCompletedCases();
          setCompletedCases(cases);
          
          // Cargar casos de examen completados
          const examCases = await getCompletedExamCases();
          setCompletedExamCases(examCases);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleAuthSuccess = async (userId: string, name: string) => {
    setIsAuthenticated(true);
    setUserName(name);
    
    // Cargar casos del usuario
    try {
      const cases = await getCompletedCases();
      setCompletedCases(cases);
      
      // Cargar casos de examen
      const examCases = await getCompletedExamCases();
      setCompletedExamCases(examCases);
    } catch (error) {
      console.error('Error loading cases after auth:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
    setUserName('');
    setCompletedCases([]);
    setCompletedExamCases([]);
    setCurrentScreen('home');
    toast.success('Sesión cerrada correctamente');
  };

  const startNewCase = async () => {
    try {
      setIsLoading(true);
      const newCase = await generateNewCase();
      
      setCurrentCase(newCase);
      setChatHistory([
        {
          role: 'patient',
          message: `Hola, soy ${newCase.patientName}. ${newCase.chiefComplaint}.`,
        },
      ]);
      setNotes('');
      setCurrentScreen('simulation');
      toast.success('Nuevo caso generado');
    } catch (error) {
      console.error('Error generating case:', error);
      toast.error('Error al generar nuevo caso');
    } finally {
      setIsLoading(false);
    }
  };

  const endCase = () => {
    setCurrentScreen('evaluation');
  };

  const saveEvaluation = async (evaluation: EvaluationResult) => {
    if (currentCase) {
      try {
        const updatedCase = { 
          ...currentCase, 
          evaluation,
          chatHistory,
          notes 
        };
        
        await saveCompletedCase(updatedCase);
        setCompletedCases([...completedCases, updatedCase]);
        toast.success('Caso guardado exitosamente');
      } catch (error) {
        console.error('Error saving case:', error);
        toast.error('Error al guardar el caso');
      }
    }
  };

  const repeatCase = () => {
    if (currentCase) {
      setChatHistory([
        {
          role: 'patient',
          message: `Hola, soy ${currentCase.patientName}. ${currentCase.chiefComplaint}.`,
        },
      ]);
      setNotes('');
      setCurrentScreen('simulation');
    }
  };

  const startExamMode = () => {
    setCurrentScreen('exam-mode');
  };

  const startExamCase = async (customCaseText: string, isCustom: boolean) => {
    try {
      setIsLoading(true);

      let examCase: ExamCaseData;

      if (isCustom) {
        // Caso personalizado del profesor
        examCase = {
          id: Date.now().toString(),
          caseStatement: customCaseText,
          isCustom: true,
          date: new Date().toLocaleDateString('es-ES'),
        };
      } else {
        // Generar caso con IA
        examCase = await generateExamCase();
      }

      setCurrentExamCase(examCase);
      setExamMessages([]);
      setExamStudentAnswer('');
      setCurrentScreen('exam-resolution');
    } catch (error) {
      console.error('Error starting exam case:', error);
      toast.error('Error al iniciar el caso de examen');
    } finally {
      setIsLoading(false);
    }
  };

  const finishExamCase = (messages: any[], studentAnswer: string) => {
    setExamMessages(messages);
    setExamStudentAnswer(studentAnswer);
    setCurrentScreen('exam-evaluation');
  };

  const saveExamEvaluation = async (evaluation: EvaluationResult) => {
    if (currentExamCase) {
      try {
        const completedExamCase = {
          ...currentExamCase,
          evaluation,
          messages: examMessages,
          studentAnswer: examStudentAnswer,
        };
        
        await saveCompletedExamCase(completedExamCase);
        setCompletedExamCases([...completedExamCases, completedExamCase]);
        toast.success('Caso de examen guardado exitosamente');
      } catch (error) {
        console.error('Error saving exam case:', error);
        toast.error('Error al guardar el caso de examen');
      }
    }
  };

  // Mostrar loader inicial
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="glass shadow-apple-lg rounded-3xl p-12 text-center space-y-6">
          <div className="w-20 h-20 mx-auto">
            <div className="w-full h-full border-4 border-[#0071e3] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-[#1d1d1f] font-medium">Cargando FisioMind...</p>
        </div>
      </div>
    );
  }

  // Mostrar modo demo si fue activado
  if (isDemoMode) {
    return (
      <>
        <DemoMode 
          onExit={() => {
            setIsDemoMode(false);
            window.history.replaceState({}, '', window.location.pathname);
          }} 
        />
        <Toaster position="top-center" />
      </>
    );
  }

  // Mostrar pantalla de autenticación si no está autenticado
  if (!isAuthenticated) {
    return (
      <>
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {currentScreen === 'home' && (
        <HomeScreen
          onStartNewCase={startNewCase}
          onStartExamMode={startExamMode}
          onViewProgress={() => setCurrentScreen('progress')}
          onStartFisioStudy={() => setCurrentScreen('fisio-study')}
          onLogout={handleLogout}
          completedCasesCount={completedCases.length}
          userName={userName}
          isLoading={isLoading}
        />
      )}

      {currentScreen === 'exam-mode' && (
        <ExamModeScreen
          onBackToHome={() => setCurrentScreen('home')}
          onStartExamCase={startExamCase}
        />
      )}

      {currentScreen === 'exam-resolution' && currentExamCase && (
        <ExamCaseResolution
          examCase={currentExamCase}
          onBackToHome={() => setCurrentScreen('home')}
          onFinishCase={finishExamCase}
        />
      )}

      {currentScreen === 'exam-evaluation' && currentExamCase && (
        <ExamEvaluationScreen
          examCase={currentExamCase}
          messages={examMessages}
          studentAnswer={examStudentAnswer}
          onBackToHome={() => setCurrentScreen('home')}
          onNewExamCase={() => setCurrentScreen('exam-mode')}
          onSaveExamEvaluation={saveExamEvaluation}
        />
      )}

      {currentScreen === 'simulation' && currentCase && (
        <CaseSimulation
          caseData={currentCase}
          chatHistory={chatHistory}
          onChatUpdate={setChatHistory}
          notes={notes}
          onNotesUpdate={setNotes}
          onEndCase={endCase}
          onBackToHome={() => setCurrentScreen('home')}
        />
      )}

      {currentScreen === 'evaluation' && currentCase && (
        <EvaluationScreen
          caseData={currentCase}
          chatHistory={chatHistory}
          notes={notes}
          onSaveEvaluation={saveEvaluation}
          onRepeatCase={repeatCase}
          onNewCase={startNewCase}
          onViewProgress={() => setCurrentScreen('progress')}
        />
      )}

      {currentScreen === 'progress' && (
        <ProgressScreen
          completedCases={completedCases}
          completedExamCases={completedExamCases}
          onBackToHome={() => setCurrentScreen('home')}
          onReviewCase={(caseData) => {
            setReviewCase(caseData);
            setCurrentScreen('case-review');
          }}
          onReviewExamCase={(examCaseData) => {
            setReviewExamCase(examCaseData);
            setCurrentScreen('exam-case-review');
          }}
        />
      )}

      {currentScreen === 'case-review' && reviewCase && (
        <CaseReviewScreen
          caseData={reviewCase}
          onBack={() => setCurrentScreen('progress')}
        />
      )}

      {currentScreen === 'exam-case-review' && reviewExamCase && (
        <ExamCaseReviewScreen
          examCaseData={reviewExamCase}
          onBack={() => setCurrentScreen('progress')}
        />
      )}

      {currentScreen === 'fisio-study' && (
        <FisioStudyScreen
          onBackToHome={() => setCurrentScreen('home')}
        />
      )}
      
      <Toaster position="top-right" richColors />
    </div>
  );
}