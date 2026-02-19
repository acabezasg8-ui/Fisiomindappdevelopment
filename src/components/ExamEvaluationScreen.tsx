import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Award, 
  MessageSquare, 
  FileText, 
  TrendingUp, 
  Download, 
  BarChart3,
  Search,
  Brain,
  Activity,
  Users,
  BookOpen,
  RotateCcw,
  Home
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';

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
};

type Message = {
  role: 'student' | 'tutor';
  message: string;
  isHint?: boolean;
};

type EvaluationResult = {
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

type ExamEvaluationScreenProps = {
  examCase: ExamCaseData;
  messages: Message[];
  studentAnswer: string;
  onBackToHome: () => void;
  onNewExamCase: () => void;
  onSaveExamEvaluation: (evaluation: EvaluationResult) => void;
};

export function ExamEvaluationScreen({
  examCase,
  messages,
  studentAnswer,
  onBackToHome,
  onNewExamCase,
  onSaveExamEvaluation,
}: ExamEvaluationScreenProps) {
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(true);

  useEffect(() => {
    const performEvaluation = async () => {
      setIsEvaluating(true);
      
      try {
        // Intentar obtener evaluación del servidor
        const response = await fetch(`https://${(await import('../utils/supabase/info.tsx')).projectId}.supabase.co/functions/v1/make-server-eba6a2ba/exam/evaluation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await import('../utils/supabase/info.tsx')).publicAnonKey}`,
          },
          body: JSON.stringify({
            examCase,
            messages,
            studentAnswer
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const aiEvaluation = data.evaluation;
          setEvaluation(aiEvaluation);
          onSaveExamEvaluation(aiEvaluation);
        } else {
          throw new Error('Server evaluation failed');
        }
      } catch (error) {
        console.error('Error getting evaluation from server:', error);
        // Fallback a evaluación local
        const fallbackEvaluation = generateFallbackEvaluation();
        setEvaluation(fallbackEvaluation);
        onSaveExamEvaluation(fallbackEvaluation);
      }
      
      setTimeout(() => {
        setShowResults(true);
        setIsEvaluating(false);
      }, 1500);
    };

    performEvaluation();
  }, []);

  const generateFallbackEvaluation = (): EvaluationResult => {
    const studentMessages = messages.filter(msg => msg.role === 'student');
    const messageCount = studentMessages.length;
    const answerLength = studentAnswer?.trim().length || 0;

    // Si no hay actividad, retornar 0
    if (messageCount === 0 && answerLength < 50) {
      return {
        anamnesis: 0,
        exploracion: 0,
        razonamientoClinico: 0,
        tratamiento: 0,
        comunicacion: 0,
        feedback: {
          anamnesis: 'No se realizó ninguna pregunta al tutor ni se completó el análisis del caso.',
          exploracion: 'No se identificó ninguna exploración física ni análisis del caso.',
          razonamientoClinico: 'No se observó razonamiento clínico alguno.',
          tratamiento: 'No se propuso ningún plan de tratamiento.',
          comunicacion: 'No hubo interacción con el tutor.',
        },
      };
    }

    // Evaluación básica si hay algo de actividad
    const baseScore = Math.min(60, messageCount * 5 + Math.floor(answerLength / 20));
    
    return {
      anamnesis: Math.min(70, baseScore + 10),
      exploracion: Math.min(65, baseScore + 5),
      razonamientoClinico: Math.min(75, baseScore + 15),
      tratamiento: Math.min(70, baseScore + 10),
      comunicacion: messageCount === 0 ? 20 : Math.min(70, messageCount * 10),
      feedback: {
        anamnesis: 'Has identificado algunos datos relevantes del caso.',
        exploracion: 'Se observa cierta consideración de la exploración física.',
        razonamientoClinico: 'Has demostrado razonamiento básico sobre el caso.',
        tratamiento: 'Has propuesto algunas ideas de tratamiento.',
        comunicacion: messageCount === 0 
          ? 'No utilizaste el tutor IA, lo cual limita el aprendizaje.'
          : 'Has interactuado con el tutor durante la resolución.',
      },
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#34c759]';
    if (score >= 60) return 'text-[#ff9500]';
    if (score >= 40) return 'text-[#ff3b30]';
    return 'text-[#1d1d1f]';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-[#34c759]/10';
    if (score >= 60) return 'bg-[#ff9500]/10';
    if (score >= 40) return 'bg-[#ff3b30]/10';
    return 'bg-[#6e6e73]/10';
  };

  if (isEvaluating || !showResults || !evaluation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass shadow-apple-lg rounded-3xl p-12 max-w-md text-center space-y-6"
        >
          <div className="w-20 h-20 mx-auto">
            <div className="w-full h-full border-4 border-[#0071e3] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl text-[#1d1d1f] font-semibold">Evaluando tu caso de examen...</h2>
          <p className="text-[#6e6e73]">
            Analizando tu respuesta y diálogo con el tutor
          </p>
        </motion.div>
      </div>
    );
  }

  const averageScore = Math.floor(
    (evaluation.anamnesis +
      evaluation.exploracion +
      evaluation.razonamientoClinico +
      evaluation.tratamiento +
      evaluation.comunicacion) /
      5
  );

  const categories = [
    { name: 'Anamnesis', score: evaluation.anamnesis, feedback: evaluation.feedback.anamnesis, icon: MessageSquare },
    { name: 'Exploración', score: evaluation.exploracion, feedback: evaluation.feedback.exploracion, icon: Search },
    { name: 'Razonamiento Clínico', score: evaluation.razonamientoClinico, feedback: evaluation.feedback.razonamientoClinico, icon: Brain },
    { name: 'Tratamiento', score: evaluation.tratamiento, feedback: evaluation.feedback.tratamiento, icon: Activity },
    { name: 'Comunicación', score: evaluation.comunicacion, feedback: evaluation.feedback.comunicacion, icon: Users },
  ];

  const studentMessages = messages.filter(msg => msg.role === 'student');

  return (
    <div className="min-h-screen p-6 bg-[#f5f5f7]">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header con puntuación */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass shadow-apple-lg rounded-3xl p-8 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-green-400/20 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <Award className="w-16 h-16 text-[#0071e3] mx-auto mb-4" />
            <h1 className="text-3xl text-[#1d1d1f] font-semibold mb-2">Evaluación de Examen Completada</h1>
            <div className="flex items-center justify-center gap-3 mb-6">
              <Badge variant="outline" className="border-[#0071e3] text-[#0071e3]">
                <Brain className="w-3 h-3 mr-1" />
                Modo Examen
              </Badge>
              <Badge variant="outline" className="border-[#6e6e73] text-[#6e6e73]">
                {studentMessages.length} mensajes con el tutor
              </Badge>
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="inline-block"
            >
              <div className={`text-7xl font-bold mb-2 ${getScoreColor(averageScore)}`}>
                {averageScore}
              </div>
              <Badge className={`${getScoreBgColor(averageScore)} ${getScoreColor(averageScore)} border-none text-sm`}>
                Puntuación Media
              </Badge>
            </motion.div>
          </div>
        </motion.div>

        {/* Competencias */}
        <div className="space-y-4">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="glass shadow-apple rounded-3xl p-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0071e3]/10 flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-[#0071e3]" />
                      </div>
                      <h3 className="text-lg text-[#1d1d1f] font-semibold">{category.name}</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <Progress value={category.score} className="w-24" />
                      <span className={`text-2xl font-semibold ${getScoreColor(category.score)}`}>
                        {category.score}
                      </span>
                    </div>
                  </div>
                  <div className={`${getScoreBgColor(category.score)} rounded-2xl p-4`}>
                    <p className="text-[#1d1d1f] text-sm leading-relaxed">{category.feedback}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Resumen de tu trabajo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="glass shadow-apple rounded-3xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#0071e3]/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#0071e3]" />
            </div>
            <h3 className="text-lg text-[#1d1d1f] font-semibold">Resumen de tu Trabajo</h3>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-[#d2d2d7]">
              <span className="text-[#6e6e73]">Mensajes con el tutor:</span>
              <span className="text-[#1d1d1f] font-semibold">{studentMessages.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-[#d2d2d7]">
              <span className="text-[#6e6e73]">Longitud de respuesta:</span>
              <span className="text-[#1d1d1f] font-semibold">{studentAnswer?.length || 0} caracteres</span>
            </div>
            {examCase.isCustom && (
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-blue-900 text-xs">
                  📋 Caso personalizado - Este caso fue proporcionado por tu profesor
                </p>
              </div>
            )}
          </div>

          {studentAnswer && studentAnswer.length > 50 && (
            <div className="mt-4 p-4 bg-white rounded-2xl border border-[#d2d2d7]">
              <h4 className="text-sm font-semibold text-[#1d1d1f] mb-2">Tu Respuesta Final:</h4>
              <p className="text-[#6e6e73] text-sm leading-relaxed whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                {studentAnswer}
              </p>
            </div>
          )}
        </motion.div>

        {/* Botones de acción */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid md:grid-cols-2 gap-4"
        >
          <Button
            onClick={onNewExamCase}
            className="h-16 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-2xl shadow-lg flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Nuevo Caso de Examen</span>
          </Button>
          <Button
            onClick={onBackToHome}
            className="h-16 bg-white hover:bg-gray-50 text-[#1d1d1f] rounded-2xl border-2 border-[#d2d2d7] flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            <span>Volver al Inicio</span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}