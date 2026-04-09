import { ArrowLeft, Calendar, TrendingUp, Award, MessageSquare, FileText, Search, Brain, Activity, Users, Eye, Target, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { CaseData } from '../App';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

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
  messages?: Array<{ role: 'student' | 'tutor'; message: string; isHint?: boolean }>;
  studentAnswer?: string;
};

type ProgressScreenProps = {
  completedCases: CaseData[];
  completedExamCases: ExamCaseData[];
  onBackToHome: () => void;
  onReviewCase: (caseData: CaseData) => void;
  onReviewExamCase: (examCaseData: ExamCaseData) => void;
};

type UnifiedCase = {
  id: string;
  type: 'libre' | 'examen';
  title: string;
  subtitle: string;
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
  raw: CaseData | ExamCaseData;
};

type CategoryKey =
  | 'anamnesis'
  | 'exploracion'
  | 'razonamientoClinico'
  | 'tratamiento'
  | 'comunicacion';

function getCaseAverage(caseItem: { evaluation?: UnifiedCase['evaluation'] }): number {
  if (!caseItem.evaluation) return 0;

  const { anamnesis, exploracion, razonamientoClinico, tratamiento, comunicacion } =
    caseItem.evaluation;

  return Math.round(
    (anamnesis + exploracion + razonamientoClinico + tratamiento + comunicacion) / 5
  );
}

function parseSpanishDate(dateStr: string): Date {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return new Date(0);

  const day = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const year = Number(parts[2]);

  return new Date(year, month, day);
}

function getScoreColor(score: number) {
  if (score >= 80) return 'text-[#34c759]';
  if (score >= 60) return 'text-[#ff9500]';
  return 'text-[#ff3b30]';
}

function getScoreBgColor(score: number) {
  if (score >= 80) return 'bg-[#34c759]/10 text-[#34c759]';
  if (score >= 60) return 'bg-[#ff9500]/10 text-[#ff9500]';
  return 'bg-[#ff3b30]/10 text-[#ff3b30]';
}

function getCategoryLabel(key: CategoryKey) {
  if (key === 'anamnesis') return 'Anamnesis';
  if (key === 'exploracion') return 'Exploración';
  if (key === 'razonamientoClinico') return 'Razonamiento clínico';
  if (key === 'tratamiento') return 'Tratamiento';
  return 'Comunicación';
}

function getCategoryIcon(key: CategoryKey) {
  if (key === 'anamnesis') return MessageSquare;
  if (key === 'exploracion') return Search;
  if (key === 'razonamientoClinico') return Brain;
  if (key === 'tratamiento') return Activity;
  return Users;
}

function getUnifiedCases(
  completedCases: CaseData[],
  completedExamCases: ExamCaseData[]
): UnifiedCase[] {
  const freeCases: UnifiedCase[] = completedCases.map((caseItem) => ({
    id: caseItem.id,
    type: 'libre',
    title: caseItem.patientName,
    subtitle: caseItem.chiefComplaint,
    date: caseItem.date,
    evaluation: caseItem.evaluation,
    raw: caseItem,
  }));

  const examCases: UnifiedCase[] = completedExamCases.map((examCase) => ({
    id: examCase.id,
    type: 'examen',
    title: 'Caso de examen',
    subtitle: examCase.caseStatement.slice(0, 140),
    date: examCase.date,
    evaluation: examCase.evaluation,
    raw: examCase,
  }));

  return [...freeCases, ...examCases].sort(
    (a, b) => parseSpanishDate(b.date).getTime() - parseSpanishDate(a.date).getTime()
  );
}

function calculateAverageScore(allCases: UnifiedCase[]): number {
  const evaluatedCases = allCases.filter((item) => item.evaluation);
  if (evaluatedCases.length === 0) return 0;

  const total = evaluatedCases.reduce((sum, item) => sum + getCaseAverage(item), 0);
  return Math.round(total / evaluatedCases.length);
}

function getCategoryAverage(allCases: UnifiedCase[], category: CategoryKey): number {
  const evaluatedCases = allCases.filter((item) => item.evaluation);
  if (evaluatedCases.length === 0) return 0;

  const total = evaluatedCases.reduce((sum, item) => {
    return sum + (item.evaluation?.[category] || 0);
  }, 0);

  return Math.round(total / evaluatedCases.length);
}

function getBestAndWorstCategory(allCases: UnifiedCase[]) {
  const categories: CategoryKey[] = [
    'anamnesis',
    'exploracion',
    'razonamientoClinico',
    'tratamiento',
    'comunicacion',
  ];

  const withScores = categories.map((key) => ({
    key,
    score: getCategoryAverage(allCases, key),
  }));

  const sorted = [...withScores].sort((a, b) => b.score - a.score);

  return {
    best: sorted[0],
    worst: sorted[sorted.length - 1],
  };
}

function getRecentTrend(allCases: UnifiedCase[]) {
  const evaluatedCases = allCases.filter((item) => item.evaluation);
  if (evaluatedCases.length < 2) return null;

  const recent = evaluatedCases.slice(0, 3);
  const older = evaluatedCases.slice(3, 6);

  if (recent.length === 0) return null;

  const recentAvg =
    recent.reduce((sum, item) => sum + getCaseAverage(item), 0) / recent.length;

  if (older.length === 0) {
    return {
      delta: 0,
      label: 'Aún no hay suficiente histórico',
    };
  }

  const olderAvg =
    older.reduce((sum, item) => sum + getCaseAverage(item), 0) / older.length;

  const delta = Math.round(recentAvg - olderAvg);

  if (delta > 2) {
    return { delta, label: 'Tendencia positiva' };
  }
  if (delta < -2) {
    return { delta, label: 'Ha bajado ligeramente' };
  }
  return { delta, label: 'Rendimiento estable' };
}

function getCasesByMode(allCases: UnifiedCase[]) {
  const free = allCases.filter((item) => item.type === 'libre');
  const exam = allCases.filter((item) => item.type === 'examen');

  return {
    freeCount: free.length,
    examCount: exam.length,
    freeAverage: calculateAverageScore(free),
    examAverage: calculateAverageScore(exam),
  };
}

export function ProgressScreen({
  completedCases,
  completedExamCases,
  onBackToHome,
  onReviewCase,
  onReviewExamCase,
}: ProgressScreenProps) {
  const allCases = getUnifiedCases(completedCases, completedExamCases);
  const totalCasesCount = allCases.length;
  const averageScore = calculateAverageScore(allCases);
  const { best, worst } = getBestAndWorstCategory(allCases);
  const recentTrend = getRecentTrend(allCases);
  const modeStats = getCasesByMode(allCases);

  const categoryAverages: Array<{
    name: string;
    score: number;
    icon: any;
    key: CategoryKey;
  }> = [
    {
      name: 'Anamnesis',
      score: getCategoryAverage(allCases, 'anamnesis'),
      icon: MessageSquare,
      key: 'anamnesis',
    },
    {
      name: 'Exploración',
      score: getCategoryAverage(allCases, 'exploracion'),
      icon: Search,
      key: 'exploracion',
    },
    {
      name: 'Razonamiento clínico',
      score: getCategoryAverage(allCases, 'razonamientoClinico'),
      icon: Brain,
      key: 'razonamientoClinico',
    },
    {
      name: 'Tratamiento',
      score: getCategoryAverage(allCases, 'tratamiento'),
      icon: Activity,
      key: 'tratamiento',
    },
    {
      name: 'Comunicación',
      score: getCategoryAverage(allCases, 'comunicacion'),
      icon: Users,
      key: 'comunicacion',
    },
  ];

  if (totalCasesCount === 0) {
    return (
      <div className="min-h-screen p-6 bg-[#f5f5f7]">
        <div className="max-w-6xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-4xl text-[#1d1d1f] font-semibold mb-2">Mi progreso</h1>
              <p className="text-[#6e6e73]">Revisa tu evolución y tus casos completados</p>
            </div>

            <Button
              onClick={onBackToHome}
              className="bg-white hover:bg-gray-50 border-2 border-[#d2d2d7] text-[#1d1d1f] rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Inicio
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass shadow-apple-lg rounded-3xl p-12 text-center"
          >
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <TrendingUp className="w-12 h-12 text-white" />
              </div>

              <h2 className="text-2xl text-[#1d1d1f] font-semibold">Aún no hay progreso registrado</h2>
              <p className="text-[#6e6e73] leading-relaxed">
                Completa tus primeros casos para empezar a ver tu evolución por competencias clínicas.
              </p>

              <Button
                onClick={onBackToHome}
                className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-2xl h-14 px-8 shadow-lg"
              >
                Empezar ahora
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-[#f5f5f7]">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl text-[#1d1d1f] font-semibold mb-2">Mi progreso</h1>
            <p className="text-[#6e6e73]">
              Analiza tu evolución y detecta en qué competencias estás creciendo más.
            </p>
          </div>

          <Button
            onClick={onBackToHome}
            className="bg-white hover:bg-gray-50 border-2 border-[#d2d2d7] text-[#1d1d1f] rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Inicio
          </Button>
        </motion.div>

        {/* KPIs */}
        <div className="grid md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass shadow-apple-lg rounded-3xl p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Award className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-[#6e6e73]">Casos completados</p>
                <p className="text-4xl text-[#1d1d1f] font-semibold">{totalCasesCount}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass shadow-apple-lg rounded-3xl p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/20 rounded-full blur-2xl"></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-[#6e6e73]">Puntuación media</p>
                <p className="text-4xl text-[#1d1d1f] font-semibold">{averageScore}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass shadow-apple-lg rounded-3xl p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl"></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-[#6e6e73]">Mejor competencia</p>
                <p className="text-lg text-[#1d1d1f] font-semibold leading-tight">
                  {getCategoryLabel(best.key)}
                </p>
                <p className={`text-sm font-medium ${getScoreColor(best.score)}`}>
                  {best.score}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass shadow-apple-lg rounded-3xl p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-400/20 rounded-full blur-2xl"></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <AlertCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-[#6e6e73]">Área a reforzar</p>
                <p className="text-lg text-[#1d1d1f] font-semibold leading-tight">
                  {getCategoryLabel(worst.key)}
                </p>
                <p className={`text-sm font-medium ${getScoreColor(worst.score)}`}>
                  {worst.score}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Insight row */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass shadow-apple-lg rounded-3xl p-8"
          >
            <h2 className="text-2xl text-[#1d1d1f] font-semibold mb-6">
              Rendimiento por competencia
            </h2>

            <div className="space-y-5">
              {categoryAverages.map((category) => {
                const IconComponent = category.icon;

                return (
                  <div key={category.key} className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0071e3]/10 flex items-center justify-center">
                          <IconComponent className="w-4 h-4 text-[#0071e3]" />
                        </div>
                        <span className="text-[#1d1d1f] font-medium">{category.name}</span>
                      </div>

                      <span className={`font-semibold ${getScoreColor(category.score)}`}>
                        {category.score}
                      </span>
                    </div>

                    <Progress value={category.score} className="h-2" />
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass shadow-apple-lg rounded-3xl p-8"
          >
            <h2 className="text-2xl text-[#1d1d1f] font-semibold mb-6">
              Lectura rápida de tu progreso
            </h2>

            <div className="space-y-4">
              <div className="rounded-2xl bg-[#0071e3]/8 p-4">
                <p className="text-sm text-[#6e6e73] mb-1">Tendencia reciente</p>
                <p className="text-[#1d1d1f] font-semibold">
                  {recentTrend ? recentTrend.label : 'Aún no hay suficiente histórico'}
                </p>
                {recentTrend ? (
                  <p className={`text-sm mt-1 ${recentTrend.delta >= 0 ? 'text-[#34c759]' : 'text-[#ff3b30]'}`}>
                    {recentTrend.delta >= 0 ? '+' : ''}
                    {recentTrend.delta} puntos frente al bloque anterior
                  </p>
                ) : null}
              </div>

              <div className="rounded-2xl bg-white/60 border border-[#d2d2d7] p-4">
                <p className="text-sm text-[#6e6e73] mb-1">Modo libre</p>
                <div className="flex items-center justify-between">
                  <p className="text-[#1d1d1f] font-semibold">{modeStats.freeCount} casos</p>
                  <span className={`text-sm font-medium ${getScoreColor(modeStats.freeAverage)}`}>
                    media {modeStats.freeAverage}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-white/60 border border-[#d2d2d7] p-4">
                <p className="text-sm text-[#6e6e73] mb-1">Modo examen</p>
                <div className="flex items-center justify-between">
                  <p className="text-[#1d1d1f] font-semibold">{modeStats.examCount} casos</p>
                  <span className={`text-sm font-medium ${getScoreColor(modeStats.examAverage)}`}>
                    media {modeStats.examAverage}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-[#ff9500]/10 p-4">
                <p className="text-sm text-[#6e6e73] mb-1">Foco recomendado</p>
                <p className="text-[#1d1d1f] font-semibold">
                  Refuerza {getCategoryLabel(worst.key).toLowerCase()}
                </p>
                <p className="text-sm text-[#6e6e73] mt-1">
                  Es la competencia con peor media actual. Ahí es donde más retorno vas a sacar.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Historial modo libre */}
        {completedCases.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass shadow-apple-lg rounded-3xl p-8"
          >
            <h2 className="text-2xl text-[#1d1d1f] font-semibold mb-6">Casos del modo libre</h2>

            <div className="space-y-4">
              {completedCases
                .slice()
                .reverse()
                .map((caseItem, index) => {
                  const caseAverage = getCaseAverage(caseItem);

                  return (
                    <motion.div
                      key={`${caseItem.id}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * index }}
                      className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-[#d2d2d7] hover:shadow-apple transition-all cursor-pointer group"
                      onClick={() => onReviewCase(caseItem)}
                    >
                      <div className="flex items-center justify-between gap-6">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-lg text-[#1d1d1f] font-semibold">
                              {caseItem.patientName}
                            </h3>

                            <Badge className="bg-[#0071e3]/10 text-[#0071e3] border-none">
                              Modo libre
                            </Badge>

                            <Badge className="bg-[#6e6e73]/10 text-[#6e6e73] border-none">
                              {caseItem.age} años
                            </Badge>

                            <Badge className="bg-[#6e6e73]/10 text-[#6e6e73] border-none">
                              {caseItem.gender}
                            </Badge>
                          </div>

                          <p className="text-sm text-[#6e6e73] mb-3">{caseItem.chiefComplaint}</p>

                          <div className="flex items-center gap-4 text-sm text-[#6e6e73] flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {caseItem.date}
                            </span>

                            <span>• {caseItem.pathology}</span>

                            {caseItem.chatHistory && (
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                {caseItem.chatHistory.length} mensajes
                              </span>
                            )}

                            {caseItem.notes && caseItem.notes.trim().length > 0 && (
                              <span className="flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                Notas
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-6 shrink-0">
                          <div className="text-center">
                            <div className="text-4xl text-[#0071e3] font-semibold mb-1">
                              {caseAverage}
                            </div>
                            <div className="text-xs text-[#6e6e73]">Media</div>
                          </div>

                          {caseItem.evaluation && (
                            <div className="flex gap-2">
                              {[
                                { label: 'A', value: caseItem.evaluation.anamnesis },
                                { label: 'E', value: caseItem.evaluation.exploracion },
                                { label: 'R', value: caseItem.evaluation.razonamientoClinico },
                                { label: 'T', value: caseItem.evaluation.tratamiento },
                                { label: 'C', value: caseItem.evaluation.comunicacion },
                              ].map((item, idx) => (
                                <div key={idx} className="text-center">
                                  <div className="text-xs text-[#6e6e73] mb-1">{item.label}</div>
                                  <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold ${getScoreBgColor(
                                      item.value
                                    )}`}
                                  >
                                    {item.value}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              onReviewCase(caseItem);
                            }}
                            className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver detalles
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </motion.div>
        )}

        {/* Historial modo examen */}
        {completedExamCases.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass shadow-apple-lg rounded-3xl p-8"
          >
            <h2 className="text-2xl text-[#1d1d1f] font-semibold mb-6">Casos del modo examen</h2>

            <div className="space-y-4">
              {completedExamCases
                .slice()
                .reverse()
                .map((examCase, index) => {
                  const caseAverage = getCaseAverage(examCase);

                  return (
                    <motion.div
                      key={`${examCase.id}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * index }}
                      className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-[#d2d2d7] hover:shadow-apple transition-all cursor-pointer group"
                      onClick={() => onReviewExamCase(examCase)}
                    >
                      <div className="flex items-center justify-between gap-6">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <Brain className="w-5 h-5 text-[#0071e3]" />
                            <h3 className="text-lg text-[#1d1d1f] font-semibold">
                              Caso de examen
                            </h3>

                            <Badge className="bg-[#0071e3]/10 text-[#0071e3] border-none">
                              Modo examen
                            </Badge>

                            {examCase.isCustom && (
                              <Badge
                                variant="outline"
                                className="border-[#ff9500] text-[#ff9500]"
                              >
                                Personalizado
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-[#6e6e73] mb-3 line-clamp-2">
                            {examCase.caseStatement}
                          </p>

                          <div className="flex items-center gap-4 text-sm text-[#6e6e73] flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {examCase.date}
                            </span>

                            {examCase.pathology && <span>• {examCase.pathology}</span>}

                            {examCase.messages && (
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                {examCase.messages.length} mensajes
                              </span>
                            )}

                            {examCase.studentAnswer && examCase.studentAnswer.trim().length > 0 && (
                              <span className="flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                Respuesta completa
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-6 shrink-0">
                          <div className="text-center">
                            <div className="text-4xl text-[#0071e3] font-semibold mb-1">
                              {caseAverage}
                            </div>
                            <div className="text-xs text-[#6e6e73]">Media</div>
                          </div>

                          {examCase.evaluation && (
                            <div className="flex gap-2">
                              {[
                                { label: 'A', value: examCase.evaluation.anamnesis },
                                { label: 'E', value: examCase.evaluation.exploracion },
                                { label: 'R', value: examCase.evaluation.razonamientoClinico },
                                { label: 'T', value: examCase.evaluation.tratamiento },
                                { label: 'C', value: examCase.evaluation.comunicacion },
                              ].map((item, idx) => (
                                <div key={idx} className="text-center">
                                  <div className="text-xs text-[#6e6e73] mb-1">{item.label}</div>
                                  <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold ${getScoreBgColor(
                                      item.value
                                    )}`}
                                  >
                                    {item.value}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              onReviewExamCase(examCase);
                            }}
                            className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver detalles
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </motion.div>
        )}

        {/* Leyenda */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="glass rounded-2xl p-4"
        >
          <p className="text-sm text-[#6e6e73] text-center">
            <span className="font-medium text-[#1d1d1f]">Leyenda:</span> A = Anamnesis • E = Exploración • R = Razonamiento • T = Tratamiento • C = Comunicación
          </p>
        </motion.div>
      </div>
    </div>
  );
}
