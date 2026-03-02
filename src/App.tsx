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
import {
  getCompletedCases,
  generateNewCase,
  saveCompletedCase,
  generateExamCase,
  checkSession,
  logout,
  saveCompletedExamCase,
  getCompletedExamCases,
} from './utils/supabase/client';
import { toast, Toaster } from 'sonner@2.0.3';

/** =========================
 * NUEVO: training config types
 * ========================= */
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

export type CaseData = {
  id: string;
  patientName: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  pathology: string;
  date: string;

  /** ✅ NUEVO: guardamos la config para que el caso sea “por competencias” */
  trainingConfig?: TrainingConfig;

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

type Screen =
  | 'home'
  | 'simulation-setup'
  | 'simulation'
  | 'evaluation'
  | 'progress'
  | 'exam-mode'
  | 'exam-resolution'
  | 'exam-evaluation'
  | 'case-review'
  | 'exam-case-review'
  | 'fisio-study';

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

function labelStage(s: TrainingStage) {
  if (s === 'ANAMNESIS') return 'Solo anamnesis';
  if (s === 'ANAMNESIS_VALORACION') return 'Anamnesis + valoración';
  return 'Anamnesis + valoración + tratamiento';
}

function labelArea(a?: ClinicalArea) {
  if (a === 'MSK') return 'Musculoesquelético';
  if (a === 'NEURO') return 'Neurológico';
  if (a === 'RESPI') return 'Respiratorio';
  return 'Cualquiera';
}

function SimulationSetupScreen({
  onBack,
  onConfirm,
}: {
  onBack: () => void;
  onConfirm: (cfg: TrainingConfig) => void;
}) {
  const [cfg, setCfg] = useState<TrainingConfig>({
    stage: 'ANAMNESIS',
    area: 'MSK',
    academicLevel: '2',
  });

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl glass rounded-3xl p-8 shadow-apple-lg border border-[#d2d2d7]">
        <div className="space-y-1">
          <h1 className="text-2xl text-[#1d1d1f] font-semibold">Configurar entrenamiento</h1>
          <p className="text-[#6e6e73]">
            Selecciona qué quieres entrenar antes de generar el caso. La simulación se adaptará al nivel elegido.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {/* STAGE */}
          <div>
            <p className="text-[#1d1d1f] font-medium mb-2">Competencia a entrenar</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(
                [
                  { id: 'ANAMNESIS', label: 'Solo anamnesis' },
                  { id: 'ANAMNESIS_VALORACION', label: 'Anamnesis + valoración' },
                  { id: 'ANAMNESIS_VALORACION_TRATAMIENTO', label: 'Anamnesis + valoración + tratamiento' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setCfg((p) => ({ ...p, stage: opt.id }))}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    cfg.stage === opt.id
                      ? 'border-[#0071e3] bg-[#0071e3]/10'
                      : 'border-[#d2d2d7] bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="text-[#1d1d1f] font-medium">{opt.label}</div>
                  <div className="text-[#6e6e73] text-sm mt-1">
                    {opt.id === 'ANAMNESIS'
                      ? 'Historia clínica, síntomas y red flags.'
                      : opt.id === 'ANAMNESIS_VALORACION'
                      ? 'Incluye exploración y hallazgos simples.'
                      : 'Incluye objetivos y plan (lo propone el alumno).'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* AREA + LEVEL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-[#1d1d1f] font-medium mb-2">Área clínica</p>
              <div className="flex flex-wrap gap-2">
                {(['MSK', 'NEURO', 'RESPI'] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => setCfg((p) => ({ ...p, area: a }))}
                    className={`rounded-full border px-4 py-2 transition ${
                      cfg.area === a
                        ? 'border-[#0071e3] bg-[#0071e3]/10 text-[#0071e3]'
                        : 'border-[#d2d2d7] bg-white hover:bg-gray-50 text-[#1d1d1f]'
                    }`}
                  >
                    {labelArea(a)}
                  </button>
                ))}
                <button
                  onClick={() => setCfg((p) => ({ ...p, area: undefined }))}
                  className={`rounded-full border px-4 py-2 transition ${
                    !cfg.area
                      ? 'border-[#0071e3] bg-[#0071e3]/10 text-[#0071e3]'
                      : 'border-[#d2d2d7] bg-white hover:bg-gray-50 text-[#1d1d1f]'
                  }`}
                >
                  Cualquiera
                </button>
              </div>
            </div>

            <div>
              <p className="text-[#1d1d1f] font-medium mb-2">Curso / nivel</p>
              <div className="flex flex-wrap gap-2">
                {(['1', '2', '3', '4'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setCfg((p) => ({ ...p, academicLevel: lvl }))}
                    className={`rounded-full border px-4 py-2 transition ${
                      cfg.academicLevel === lvl
                        ? 'border-[#0071e3] bg-[#0071e3]/10 text-[#0071e3]'
                        : 'border-[#d2d2d7] bg-white hover:bg-gray-50 text-[#1d1d1f]'
                    }`}
                  >
                    {lvl}º
                  </button>
                ))}
                <button
                  onClick={() => setCfg((p) => ({ ...p, academicLevel: undefined }))}
                  className={`rounded-full border px-4 py-2 transition ${
                    !cfg.academicLevel
                      ? 'border-[#0071e3] bg-[#0071e3]/10 text-[#0071e3]'
                      : 'border-[#d2d2d7] bg-white hover:bg-gray-50 text-[#1d1d1f]'
                  }`}
                >
                  Cualquiera
                </button>
              </div>
            </div>
          </div>

          {/* SUMMARY + ACTIONS */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-2">
            <div className="text-[#6e6e73]">
              Selección:{' '}
              <span className="text-[#1d1d1f] font-medium">{labelStage(cfg.stage)}</span>
              {' · '}
              <span className="text-[#1d1d1f] font-medium">{labelArea(cfg.area)}</span>
              {cfg.academicLevel ? (
                <>
                  {' · '}
                  <span className="text-[#1d1d1f] font-medium">Nivel {cfg.academicLevel}º</span>
                </>
              ) : null}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="bg-white hover:bg-gray-50 border border-[#d2d2d7] rounded-xl h-11 px-5"
              >
                Volver
              </button>
              <button
                onClick={() => onConfirm(cfg)}
                className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl h-11 px-5 shadow-lg"
              >
                Generar caso
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
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

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const session = await checkSession();
        if (session) {
          setIsAuthenticated(true);
          setUserName(session.userName);

          const cases = await getCompletedCases();
          setCompletedCases(cases);

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

  const handleAuthSuccess = async (_userId: string, name: string) => {
    setIsAuthenticated(true);
    setUserName(name);

    try {
      const cases = await getCompletedCases();
      setCompletedCases(cases);

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

  /** ✅ NUEVO: startNewCase recibe trainingConfig */
  const startNewCase = async (trainingConfig: TrainingConfig) => {
    try {
      setIsLoading(true);

      const newCase = await generateNewCase(trainingConfig);

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

  const endCase = () => setCurrentScreen('evaluation');

  const saveEvaluation = async (evaluation: EvaluationResult) => {
    if (currentCase) {
      try {
        const updatedCase = {
          ...currentCase,
          evaluation,
          chatHistory,
          notes,
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

  const startExamMode = () => setCurrentScreen('exam-mode');

  const startExamCase = async (customCaseText: string, isCustom: boolean) => {
    try {
      setIsLoading(true);
      let examCase: ExamCaseData;

      if (isCustom) {
        examCase = {
          id: Date.now().toString(),
          caseStatement: customCaseText,
          isCustom: true,
          date: new Date().toLocaleDateString('es-ES'),
        };
      } else {
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
          onStartNewCase={() => setCurrentScreen('simulation-setup')} // ✅ CAMBIO: setup antes de generar
          onStartExamMode={startExamMode}
          onViewProgress={() => setCurrentScreen('progress')}
          onStartFisioStudy={() => setCurrentScreen('fisio-study')}
          onLogout={handleLogout}
          completedCasesCount={completedCases.length}
          userName={userName}
          isLoading={isLoading}
        />
      )}

      {currentScreen === 'simulation-setup' && (
        <SimulationSetupScreen
          onBack={() => setCurrentScreen('home')}
          onConfirm={(cfg) => startNewCase(cfg)}
        />
      )}

      {currentScreen === 'exam-mode' && (
        <ExamModeScreen onBackToHome={() => setCurrentScreen('home')} onStartExamCase={startExamCase} />
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
          onNewCase={() => setCurrentScreen('simulation-setup')}
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
        <CaseReviewScreen caseData={reviewCase} onBack={() => setCurrentScreen('progress')} />
      )}

      {currentScreen === 'exam-case-review' && reviewExamCase && (
        <ExamCaseReviewScreen examCaseData={reviewExamCase} onBack={() => setCurrentScreen('progress')} />
      )}

      {currentScreen === 'fisio-study' && <FisioStudyScreen onBackToHome={() => setCurrentScreen('home')} />}

      <Toaster position="top-right" richColors />
    </div>
  );
}
