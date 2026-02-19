import { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw, PlusCircle, BarChart3, Award, MessageSquare, Search, Brain, Activity, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { CaseData, EvaluationResult } from '../App';
import { Badge } from './ui/badge';
import { generateAIEvaluation } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

type EvaluationScreenProps = {
  caseData: CaseData;
  chatHistory: Array<{ role: 'student' | 'patient'; message: string }>;
  notes: string;
  onSaveEvaluation: (evaluation: EvaluationResult) => void;
  onRepeatCase: () => void;
  onNewCase: () => void;
  onViewProgress: () => void;
};

export function EvaluationScreen({
  caseData,
  chatHistory,
  notes,
  onSaveEvaluation,
  onRepeatCase,
  onNewCase,
  onViewProgress,
}: EvaluationScreenProps) {
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const performEvaluation = async () => {
      try {
        // Intentar evaluación con IA primero
        const aiEvaluation = await generateAIEvaluation(caseData, chatHistory, notes);
        
        let evaluationResult;
        
        if (aiEvaluation) {
          // Usar evaluación de IA
          evaluationResult = aiEvaluation;
          console.log('Using AI-powered evaluation');
        } else {
          // Fallback a evaluación local
          const studentMessages = chatHistory.filter((msg) => msg.role === 'student');
          evaluationResult = generateEvaluation(studentMessages, notes, caseData);
          console.log('Using local evaluation');
        }
        
        setEvaluation(evaluationResult);
        onSaveEvaluation(evaluationResult);
        setShowResults(true);
      } catch (error) {
        console.error('Error in evaluation:', error);
        toast.error('Error al generar la evaluación');
        // Fallback a evaluación local en caso de error
        const studentMessages = chatHistory.filter((msg) => msg.role === 'student');
        const evaluationResult = generateEvaluation(studentMessages, notes, caseData);
        setEvaluation(evaluationResult);
        onSaveEvaluation(evaluationResult);
        setShowResults(true);
      }
    };

    setTimeout(() => {
      performEvaluation();
    }, 1500);
  }, []);

  const generateEvaluation = (
    messages: Array<{ role: string; message: string }>,
    notes: string,
    caseData: CaseData
  ): EvaluationResult => {
    const messageCount = messages.length;
    const totalWords = messages.reduce((sum, msg) => sum + msg.message.split(' ').length, 0);
    const hasNotes = notes.length > 50;

    const anamnesisKeywords = ['dolor', 'cuándo', 'cuando', 'empezó', 'tiempo', 'actividad', 'trabajo'];
    const anamnesisScore = calculateScore(messages, anamnesisKeywords, 0.6, 0.9);

    const exploracionKeywords = [
      'movimiento',
      'exploración',
      'mover',
      'evaluar',
      'palpación',
      'rango',
      'flexión',
      'extensión',
    ];
    const exploracionScore = calculateScore(messages, exploracionKeywords, 0.5, 0.85);

    const razonamientoBase = Math.min(0.95, messageCount * 0.08 + (hasNotes ? 0.3 : 0));
    const razonamientoScore = Math.floor(razonamientoBase * 100) || 0;

    const tratamientoKeywords = ['tratamiento', 'masaje', 'terapia', 'ejercicio', 'recomendaciones'];
    const tratamientoScore = calculateScore(messages, tratamientoKeywords, 0.55, 0.9);

    const avgWordsPerMessage = messageCount > 0 ? totalWords / messageCount : 0;
    const comunicacionBase = Math.min(0.95, (avgWordsPerMessage / 30) * 0.5 + messageCount * 0.05);
    const comunicacionScore = Math.floor(comunicacionBase * 100) || 0;

    return {
      anamnesis: anamnesisScore,
      exploracion: exploracionScore,
      razonamientoClinico: razonamientoScore,
      tratamiento: tratamientoScore,
      comunicacion: comunicacionScore,
      feedback: {
        anamnesis:
          anamnesisScore >= 80
            ? 'Excelente anamnesis. Has recopilado información clave sobre el dolor, su inicio y los factores relacionados.'
            : anamnesisScore >= 60
            ? 'Buena anamnesis, pero podrías profundizar más en el historial del paciente y factores desencadenantes.'
            : 'La anamnesis necesita mejorar. Recuerda preguntar sobre características del dolor, cronología y actividades relacionadas.',
        exploracion:
          exploracionScore >= 80
            ? 'Has realizado una exploración física completa, evaluando movimientos y palpación de forma adecuada.'
            : exploracionScore >= 60
            ? 'Exploración correcta, pero considera incluir más pruebas específicas para el diagnóstico diferencial.'
            : 'La exploración fue limitada. Recuerda evaluar rangos de movimiento, fuerza y realizar tests específicos.',
        razonamientoClinico:
          razonamientoScore >= 80
            ? 'Excelente razonamiento clínico. Has integrado bien la información recopilada.'
            : razonamientoScore >= 60
            ? 'Buen razonamiento, pero podrías elaborar más hipótesis diagnósticas y relacionar mejor los hallazgos.'
            : 'El razonamiento clínico debe fortalecerse. Toma más notas y relaciona los hallazgos con posibles patologías.',
        tratamiento:
          tratamientoScore >= 80
            ? 'Plan de tratamiento bien estructurado con objetivos claros y técnicas apropiadas.'
            : tratamientoScore >= 60
            ? 'Tratamiento adecuado, pero podrías especificar más las técnicas y frecuencias de intervención.'
            : 'El plan de tratamiento necesita más detalle. Especifica técnicas, dosificación y objetivos claros.',
        comunicacion:
          comunicacionScore >= 80
            ? 'Comunicación profesional y empática. Has explicado bien los procedimientos y educado al paciente.'
            : comunicacionScore >= 60
            ? 'Comunicación correcta, pero podrías usar más lenguaje educativo y verificar la comprensión del paciente.'
            : 'La comunicación debe mejorar. Explica más los procedimientos y educa al paciente sobre su condición.',
      },
    };
  };

  const calculateScore = (
    messages: Array<{ role: string; message: string }>,
    keywords: string[],
    minScore: number,
    maxScore: number
  ): number => {
    let matches = 0;
    messages.forEach((msg) => {
      const lowerMsg = msg.message.toLowerCase();
      keywords.forEach((keyword) => {
        if (lowerMsg.includes(keyword)) matches++;
      });
    });

    const normalizedScore = Math.min(1, matches / (keywords.length * 1.5));
    const score = minScore + normalizedScore * (maxScore - minScore);
    const finalScore = Math.floor(score * 100);
    return isNaN(finalScore) ? 0 : finalScore;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#34c759]';
    if (score >= 60) return 'text-[#ff9500]';
    return 'text-[#ff3b30]';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-[#34c759]/10';
    if (score >= 60) return 'bg-[#ff9500]/10';
    return 'bg-[#ff3b30]/10';
  };

  if (!showResults || !evaluation) {
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
          <h2 className="text-2xl text-[#1d1d1f] font-semibold">Evaluando tu desempeño...</h2>
          <p className="text-[#6e6e73]">
            Analizando competencias clínicas
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
            <h1 className="text-3xl text-[#1d1d1f] font-semibold mb-2">Evaluación Completada</h1>
            <p className="text-[#6e6e73] mb-6">{caseData.patientName} • {caseData.chiefComplaint}</p>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="inline-block"
            >
              <div className="text-7xl font-bold text-[#0071e3] mb-2">{averageScore}</div>
              <Badge className="bg-[#0071e3]/10 text-[#0071e3] border-none text-sm">
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

        {/* Info del caso */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="glass shadow-apple rounded-3xl p-6"
        >
          <h3 className="text-lg text-[#1d1d1f] font-semibold mb-3">Diagnóstico del Caso</h3>
          <p className="text-[#6e6e73]">
            <span className="text-[#1d1d1f] font-medium">Patología:</span> {caseData.pathology}
          </p>
        </motion.div>

        {/* Botones de acción */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid md:grid-cols-3 gap-4"
        >
          <Button
            onClick={onRepeatCase}
            className="h-16 bg-white hover:bg-gray-50 text-[#1d1d1f] rounded-2xl border-2 border-[#d2d2d7] flex flex-col gap-1"
          >
            <RefreshCw className="w-5 h-5" />
            <span className="text-sm">Repetir</span>
          </Button>
          <Button
            onClick={onNewCase}
            className="h-16 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-2xl shadow-lg flex flex-col gap-1"
          >
            <PlusCircle className="w-5 h-5" />
            <span className="text-sm">Nuevo Caso</span>
          </Button>
          <Button
            onClick={onViewProgress}
            className="h-16 bg-[#34c759] hover:bg-[#30b350] text-white rounded-2xl shadow-lg flex flex-col gap-1"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm">Progreso</span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
