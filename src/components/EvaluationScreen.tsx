import { useEffect, useMemo, useState } from 'react';
import {
  RefreshCw,
  PlusCircle,
  BarChart3,
  Award,
  MessageSquare,
  Search,
  Brain,
  Activity,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { CaseData, EvaluationResult } from '../App';
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

type RawAIEvaluation = {
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

function clampScore(value: unknown): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function safeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function getCompetencyFeedback(
  competencias: RawAIEvaluation['competencias'],
  id: string,
  fallback: string
): string {
  const item = competencias?.find((c) => c.id === id);
  return safeString(item?.feedback, fallback);
}

function getCompetencyScore(
  competencias: RawAIEvaluation['competencias'],
  id: string
): number {
  const item = competencias?.find((c) => c.id === id);
  return clampScore(item?.score);
}

function normalizeAIEvaluation(raw: RawAIEvaluation | null | undefined): EvaluationResult | null {
  if (!raw || !Array.isArray(raw.competencias)) return null;

  const anamnesis = getCompetencyScore(raw.competencias, 'anamnesis');
  const exploracion = getCompetencyScore(raw.competencias, 'exploracion');
  const razonamientoClinico = getCompetencyScore(raw.competencias, 'razonamiento_clinico');
  const tratamiento = getCompetencyScore(raw.competencias, 'tratamiento');
  const comunicacion = getCompetencyScore(raw.competencias, 'comunicacion');

  const hasAnyData =
    anamnesis > 0 ||
    exploracion > 0 ||
    razonamientoClinico > 0 ||
    tratamiento > 0 ||
    comunicacion > 0;

  if (!hasAnyData) return null;

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
        'La anamnesis puede afinarse más en cronología, comportamiento, factores agravantes y alivio.'
      ),
      exploracion: getCompetencyFeedback(
        raw.competencias,
        'exploracion',
        'La exploración puede ganar intención clínica y relación más clara con tus hipótesis.'
      ),
      razonamientoClinico: getCompetencyFeedback(
        raw.competencias,
        'razonamiento_clinico',
        'El razonamiento clínico puede mejorar si conectas mejor datos, hipótesis y decisiones.'
      ),
      tratamiento: getCompetencyFeedback(
        raw.competencias,
        'tratamiento',
        'El plan de tratamiento debe ajustarse mejor a la información obtenida y al objetivo funcional.'
      ),
      comunicacion: getCompetencyFeedback(
        raw.competencias,
        'comunicacion',
        'La comunicación puede mejorar en claridad, estructura y enfoque centrado en el paciente.'
      ),
    },
  };
}

function calculateKeywordCoverage(
  messages: Array<{ role: string; message: string }>,
  keywords: string[]
): number {
  let matches = 0;

  for (const msg of messages) {
    const lower = msg.message.toLowerCase();
    for (const keyword of keywords) {
      if (lower.includes(keyword)) matches += 1;
    }
  }

  return matches;
}

function calculateScaledScore(
  matches: number,
  totalKeywords: number,
  min: number,
  max: number
): number {
  const normalized = Math.min(1, matches / Math.max(1, totalKeywords * 1.5));
  return clampScore((min + normalized * (max - min)) * 100);
}

function generateLocalEvaluation(
  messages: Array<{ role: string; message: string }>,
  notes: string,
  caseData: CaseData
): EvaluationResult {
  const messageCount = messages.length;
  const totalWords = messages.reduce((sum, msg) => {
    return sum + msg.message.trim().split(/\s+/).filter(Boolean).length;
  }, 0);

  const avgWordsPerMessage = messageCount > 0 ? totalWords / messageCount : 0;
  const notesLength = notes.trim().length;
  const hasSolidNotes = notesLength > 80;

  const anamnesisKeywords = [
    'cuándo',
    'cuando',
    'desde cuándo',
    'empezó',
    'inicio',
    'dolor',
    'molesta',
    'agrava',
    'mejora',
    'peor',
    'mejor',
    'trabajo',
    'deporte',
    'noche',
    'mañana',
    'irradi',
  ];

  const exploracionKeywords = [
    'movimiento',
    'mover',
    'exploración',
    'evaluar',
    'palpación',
    'palpar',
    'rango',
    'flexión',
    'extensión',
    'rotación',
    'fuerza',
    'test',
  ];

  const razonamientoKeywords = [
    'hipótesis',
    'hipotesis',
    'podría',
    'podria',
    'parece',
    'compatible',
    'descartar',
    'confirmar',
    'mecánico',
    'mecanico',
    'neural',
    'inflamatorio',
  ];

  const tratamientoKeywords = [
    'tratamiento',
    'ejercicio',
    'carga',
    'reposo relativo',
    'progresión',
    'progresion',
    'educación',
    'educacion',
    'movilidad',
    'fortalecimiento',
    'recomendación',
    'recomendacion',
  ];

  const comunicacionKeywords = [
    'entiendo',
    'vale',
    'de acuerdo',
    'te explico',
    'vamos a',
    '¿puedes?',
    '¿me puedes?',
    'gracias',
  ];

  const anamnesisMatches = calculateKeywordCoverage(messages, anamnesisKeywords);
  const exploracionMatches = calculateKeywordCoverage(messages, exploracionKeywords);
  const razonamientoMatches = calculateKeywordCoverage(messages, razonamientoKeywords);
  const tratamientoMatches = calculateKeywordCoverage(messages, tratamientoKeywords);
  const comunicacionMatches = calculateKeywordCoverage(messages, comunicacionKeywords);

  const anamnesis = calculateScaledScore(anamnesisMatches, anamnesisKeywords.length, 0.45, 0.9);
  const exploracion = calculateScaledScore(exploracionMatches, exploracionKeywords.length, 0.35, 0.88);

  const razonamientoBase =
    Math.min(0.92, 0.3 + messageCount * 0.03 + (hasSolidNotes ? 0.18 : 0) + razonamientoMatches * 0.025);
  const razonamientoClinico = clampScore(razonamientoBase * 100);

  const tratamiento = calculateScaledScore(tratamientoMatches, tratamientoKeywords.length, 0.3, 0.86);

  const comunicacionBase = Math.min(
    0.95,
    0.35 + comunicacionMatches * 0.03 + Math.min(avgWordsPerMessage / 40, 0.25) + Math.min(messageCount * 0.015, 0.2)
  );
  const comunicacion = clampScore(comunicacionBase * 100);

  const stage = caseData.trainingConfig?.stage;

  const exploracionAdjusted =
    stage === 'ANAMNESIS'
      ? clampScore(Math.max(exploracion, 65))
      : exploracion;

  const tratamientoAdjusted =
    stage === 'ANAMNESIS' || stage === 'ANAMNESIS_VALORACION'
      ? clampScore(Math.max(tratamiento, 60))
      : tratamiento;

  return {
    anamnesis,
    exploracion: exploracionAdjusted,
    razonamientoClinico,
    tratamiento: tratamientoAdjusted,
    comunicacion,
    feedback: {
      anamnesis:
        anamnesis >= 80
          ? 'Buena anamnesis. Has recogido información útil sobre inicio, comportamiento y factores relacionados.'
          : anamnesis >= 60
          ? 'Anamnesis aceptable, pero aún puedes profundizar más en cronología, agravantes, alivio y función.'
          : 'La anamnesis se ha quedado corta. Necesitas explorar mejor inicio, comportamiento, limitación funcional y contexto.',
      exploracion:
        stage === 'ANAMNESIS'
          ? 'El caso estaba limitado a anamnesis, así que la exploración no era el foco principal.'
          : exploracionAdjusted >= 80
          ? 'La exploración va bien encaminada y parece relacionada con tus hipótesis.'
          : exploracionAdjusted >= 60
          ? 'La exploración fue correcta, pero puede ganar intención clínica y priorización.'
          : 'La exploración fue limitada o poco dirigida. Debe servir para confirmar o descartar hipótesis.',
      razonamientoClinico:
        razonamientoClinico >= 80
          ? 'Buen razonamiento clínico. Has conectado bastante bien la información recogida con posibles explicaciones del cuadro.'
          : razonamientoClinico >= 60
          ? 'El razonamiento es aceptable, pero todavía puedes hilar mejor síntomas, hipótesis y decisiones.'
          : 'El razonamiento clínico necesita más estructura. No basta con preguntar; hay que interpretar lo que vas encontrando.',
      tratamiento:
        stage === 'ANAMNESIS' || stage === 'ANAMNESIS_VALORACION'
          ? 'El tratamiento no era el foco principal en este stage, así que esta puntuación tiene menos peso interpretativo.'
          : tratamientoAdjusted >= 80
          ? 'El tratamiento propuesto parece bastante alineado con el caso y con los objetivos funcionales.'
          : tratamientoAdjusted >= 60
          ? 'El tratamiento es razonable, pero puede concretarse mejor en objetivos, progresión y dosificación.'
          : 'El tratamiento necesita más precisión y más relación con la información clínica obtenida.',
      comunicacion:
        comunicacion >= 80
          ? 'Buena comunicación clínica. Tus intervenciones resultan claras y razonablemente centradas en el paciente.'
          : comunicacion >= 60
          ? 'La comunicación es correcta, aunque puede ganar en orden, claridad y naturalidad.'
          : 'La comunicación puede mejorar. Intenta formular preguntas más claras, estructuradas y orientadas al paciente.',
    },
  };
}

function getScoreColor(score: number) {
  if (score >= 80) return 'text-[#34c759]';
  if (score >= 60) return 'text-[#ff9500]';
  return 'text-[#ff3b30]';
}

function getScoreBgColor(score: number) {
  if (score >= 80) return 'bg-[#34c759]/10';
  if (score >= 60) return 'bg-[#ff9500]/10';
  return 'bg-[#ff3b30]/10';
}

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
    let isMounted = true;

    const performEvaluation = async () => {
      try {
        const aiEvaluation = await generateAIEvaluation(caseData, chatHistory, notes);
        const normalizedAI = normalizeAIEvaluation(aiEvaluation as RawAIEvaluation);

        const finalEvaluation =
          normalizedAI ??
          generateLocalEvaluation(
            chatHistory.filter((msg) => msg.role === 'student'),
            notes,
            caseData
          );

        if (!isMounted) return;

        setEvaluation(finalEvaluation);
        onSaveEvaluation(finalEvaluation);
        setShowResults(true);
      } catch (error) {
        console.error('Error in evaluation:', error);

        if (!isMounted) return;

        toast.error('Error al generar la evaluación. Se ha usado evaluación local.');

        const fallbackEvaluation = generateLocalEvaluation(
          chatHistory.filter((msg) => msg.role === 'student'),
          notes,
          caseData
        );

        setEvaluation(fallbackEvaluation);
        onSaveEvaluation(fallbackEvaluation);
        setShowResults(true);
      }
    };

    const timer = window.setTimeout(() => {
      void performEvaluation();
    }, 1200);

    return () => {
      isMounted = false;
      window.clearTimeout(timer);
    };
  }, [caseData, chatHistory, notes, onSaveEvaluation]);

  const averageScore = useMemo(() => {
    if (!evaluation) return 0;
    return Math.round(
      (evaluation.anamnesis +
        evaluation.exploracion +
        evaluation.razonamientoClinico +
        evaluation.tratamiento +
        evaluation.comunicacion) /
        5
    );
  }, [evaluation]);

  const categories = useMemo(() => {
    if (!evaluation) return [];

    return [
      {
        name: 'Anamnesis',
        score: evaluation.anamnesis,
        feedback: evaluation.feedback.anamnesis,
        icon: MessageSquare,
      },
      {
        name: 'Exploración',
        score: evaluation.exploracion,
        feedback: evaluation.feedback.exploracion,
        icon: Search,
      },
      {
        name: 'Razonamiento Clínico',
        score: evaluation.razonamientoClinico,
        feedback: evaluation.feedback.razonamientoClinico,
        icon: Brain,
      },
      {
        name: 'Tratamiento',
        score: evaluation.tratamiento,
        feedback: evaluation.feedback.tratamiento,
        icon: Activity,
      },
      {
        name: 'Comunicación',
        score: evaluation.comunicacion,
        feedback: evaluation.feedback.comunicacion,
        icon: Users,
      },
    ];
  }, [evaluation]);

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
          <h2 className="text-2xl text-[#1d1d1f] font-semibold">
            Evaluando tu desempeño...
          </h2>
          <p className="text-[#6e6e73]">
            Analizando competencias clínicas
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-[#f5f5f7]">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass shadow-apple-lg rounded-3xl p-8 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-green-400/20 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <Award className="w-16 h-16 text-[#0071e3] mx-auto mb-4" />
            <h1 className="text-3xl text-[#1d1d1f] font-semibold mb-2">
              Evaluación completada
            </h1>
            <p className="text-[#6e6e73] mb-6">
              {caseData.patientName} • {caseData.chiefComplaint}
            </p>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="inline-block"
            >
              <div className="text-7xl font-bold text-[#0071e3] mb-2">
                {averageScore}
              </div>
              <Badge className="bg-[#0071e3]/10 text-[#0071e3] border-none text-sm">
                Puntuación media
              </Badge>
            </motion.div>
          </div>
        </motion.div>

        <div className="space-y-4">
          {categories.map((category, index) => {
            const IconComponent = category.icon;

            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 * index }}
                className="glass shadow-apple rounded-3xl p-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#0071e3]/10 flex items-center justify-center shrink-0">
                        <IconComponent className="w-5 h-5 text-[#0071e3]" />
                      </div>
                      <h3 className="text-lg text-[#1d1d1f] font-semibold">
                        {category.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <Progress value={category.score} className="w-24" />
                      <span
                        className={`text-2xl font-semibold ${getScoreColor(
                          category.score
                        )}`}
                      >
                        {category.score}
                      </span>
                    </div>
                  </div>

                  <div className={`${getScoreBgColor(category.score)} rounded-2xl p-4`}>
                    <p className="text-[#1d1d1f] text-sm leading-relaxed">
                      {category.feedback}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="glass shadow-apple rounded-3xl p-6"
        >
          <h3 className="text-lg text-[#1d1d1f] font-semibold mb-3">
            Diagnóstico del caso
          </h3>
          <p className="text-[#6e6e73]">
            <span className="text-[#1d1d1f] font-medium">Patología:</span>{' '}
            {caseData.pathology}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
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
            <span className="text-sm">Nuevo caso</span>
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
