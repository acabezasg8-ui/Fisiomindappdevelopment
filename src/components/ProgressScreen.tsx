import { ArrowLeft, Calendar, TrendingUp, Award, MessageSquare, FileText, Search, Brain, Activity, Users, BookOpen, Eye } from 'lucide-react';
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

export function ProgressScreen({ completedCases, completedExamCases, onBackToHome, onReviewCase, onReviewExamCase }: ProgressScreenProps) {
  const calculateAverageScore = (cases: CaseData[], examCases: ExamCaseData[]) => {
    const allCases = [...cases, ...examCases];
    if (allCases.length === 0) return 0;

    const total = allCases.reduce((sum, caseItem) => {
      if (!caseItem.evaluation) return sum;
      const avg =
        (caseItem.evaluation.anamnesis +
          caseItem.evaluation.exploracion +
          caseItem.evaluation.razonamientoClinico +
          caseItem.evaluation.tratamiento +
          caseItem.evaluation.comunicacion) /
        5;
      return sum + avg;
    }, 0);

    return Math.floor(total / allCases.length);
  };

  const getCategoryAverage = (category: string) => {
    const allCases = [...completedCases, ...completedExamCases];
    if (allCases.length === 0) return 0;

    const total = allCases.reduce((sum, caseItem) => {
      if (!caseItem.evaluation) return sum;
      return sum + ((caseItem.evaluation as any)[category] as number);
    }, 0);

    return Math.floor(total / allCases.length);
  };

  const totalCasesCount = completedCases.length + completedExamCases.length;
  const averageScore = calculateAverageScore(completedCases, completedExamCases);

  const categoryAverages = [
    { name: 'Anamnesis', score: getCategoryAverage('anamnesis'), icon: MessageSquare },
    { name: 'Exploración', score: getCategoryAverage('exploracion'), icon: Search },
    { name: 'Razonamiento', score: getCategoryAverage('razonamientoClinico'), icon: Brain },
    { name: 'Tratamiento', score: getCategoryAverage('tratamiento'), icon: Activity },
    { name: 'Comunicación', score: getCategoryAverage('comunicacion'), icon: Users },
  ];

  return (
    <div className="min-h-screen p-6 bg-[#f5f5f7]">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl text-[#1d1d1f] font-semibold mb-2">Mi Progreso</h1>
            <p className="text-[#6e6e73]">Revisa tu evolución y casos completados</p>
          </div>
          <Button 
            onClick={onBackToHome}
            className="bg-white hover:bg-gray-50 border-2 border-[#d2d2d7] text-[#1d1d1f] rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Inicio
          </Button>
        </motion.div>

        {totalCasesCount === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass shadow-apple-lg rounded-3xl p-12 text-center"
          >
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <TrendingUp className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl text-[#1d1d1f] font-semibold">Comienza tu camino</h2>
              <p className="text-[#6e6e73] leading-relaxed">
                Aún no has completado casos. Inicia tu primera simulación para empezar a construir tu historial.
              </p>
              <Button 
                onClick={onBackToHome}
                className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-2xl h-14 px-8 shadow-lg"
              >
                Comenzar Ahora
              </Button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Resumen general */}
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass shadow-apple-lg rounded-3xl p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"></div>
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-[#6e6e73]">Casos Completados</p>
                    <p className="text-4xl text-[#1d1d1f] font-semibold">{totalCasesCount}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-[#0071e3]/10 text-[#0071e3] border-none text-xs">
                        {completedCases.length} Libre
                      </Badge>
                      <Badge className="bg-[#0071e3]/10 text-[#0071e3] border-none text-xs">
                        {completedExamCases.length} Examen
                      </Badge>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass shadow-apple-lg rounded-3xl p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/20 rounded-full blur-2xl"></div>
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-[#6e6e73]">Puntuación Media</p>
                    <p className="text-4xl text-[#1d1d1f] font-semibold">{averageScore}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass shadow-apple-lg rounded-3xl p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl"></div>
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-[#6e6e73]">Último Caso</p>
                    <p className="text-lg text-[#1d1d1f] font-medium">
                      {(() => {
                        const lastRegularCase = completedCases[completedCases.length - 1];
                        const lastExamCase = completedExamCases[completedExamCases.length - 1];
                        
                        if (!lastRegularCase && !lastExamCase) return 'N/A';
                        if (!lastRegularCase) return lastExamCase.date;
                        if (!lastExamCase) return lastRegularCase.date;
                        
                        // Comparar fechas (suponiendo formato español DD/MM/YYYY)
                        const parseDate = (dateStr: string) => {
                          const parts = dateStr.split('/');
                          return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                        };
                        
                        return parseDate(lastRegularCase.date) > parseDate(lastExamCase.date)
                          ? lastRegularCase.date
                          : lastExamCase.date;
                      })()}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Promedios por categoría */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass shadow-apple-lg rounded-3xl p-8"
            >
              <h2 className="text-2xl text-[#1d1d1f] font-semibold mb-6">Rendimiento por Competencia</h2>
              <div className="space-y-5">
                {categoryAverages.map((category, index) => {
                  const IconComponent = category.icon;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#0071e3]/10 flex items-center justify-center">
                            <IconComponent className="w-4 h-4 text-[#0071e3]" />
                          </div>
                          <span className="text-[#1d1d1f] font-medium">{category.name}</span>
                        </div>
                        <span className="text-[#0071e3] font-semibold">{category.score}</span>
                      </div>
                      <Progress value={category.score} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Historial de casos - Modo Libre */}
            {completedCases.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass shadow-apple-lg rounded-3xl p-8"
              >
                <h2 className="text-2xl text-[#1d1d1f] font-semibold mb-6">Casos del Modo Libre</h2>
                <div className="space-y-4">
                  {completedCases.map((caseItem, index) => {
                    const caseAverage = caseItem.evaluation
                      ? Math.floor(
                          (caseItem.evaluation.anamnesis +
                            caseItem.evaluation.exploracion +
                            caseItem.evaluation.razonamientoClinico +
                            caseItem.evaluation.tratamiento +
                            caseItem.evaluation.comunicacion) /
                            5
                        )
                      : 0;

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-[#d2d2d7] hover:shadow-apple transition-all cursor-pointer group"
                        onClick={() => onReviewCase(caseItem)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg text-[#1d1d1f] font-semibold">{caseItem.patientName}</h3>
                              <Badge className="bg-[#0071e3]/10 text-[#0071e3] border-none">
                                Modo Libre
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
                              {caseItem.notes && (
                                <span className="flex items-center gap-1">
                                  <FileText className="w-4 h-4" />
                                  Notas
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <div className="text-4xl text-[#0071e3] font-semibold mb-1">{caseAverage}</div>
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
                                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold ${
                                        item.value >= 80
                                          ? 'bg-[#34c759]/10 text-[#34c759]'
                                          : item.value >= 60
                                          ? 'bg-[#ff9500]/10 text-[#ff9500]'
                                          : 'bg-[#ff3b30]/10 text-[#ff3b30]'
                                      }`}
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
                              Ver Detalles
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Historial de casos - Modo Examen */}
            {completedExamCases.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glass shadow-apple-lg rounded-3xl p-8"
              >
                <h2 className="text-2xl text-[#1d1d1f] font-semibold mb-6">Casos del Modo Examen</h2>
                <div className="space-y-4">
                  {completedExamCases.map((examCase, index) => {
                    const caseAverage = examCase.evaluation
                      ? Math.floor(
                          (examCase.evaluation.anamnesis +
                            examCase.evaluation.exploracion +
                            examCase.evaluation.razonamientoClinico +
                            examCase.evaluation.tratamiento +
                            examCase.evaluation.comunicacion) /
                            5
                        )
                      : 0;

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-[#d2d2d7] hover:shadow-apple transition-all cursor-pointer group"
                        onClick={() => onReviewExamCase(examCase)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Brain className="w-5 h-5 text-[#0071e3]" />
                              <h3 className="text-lg text-[#1d1d1f] font-semibold">Caso de Examen</h3>
                              <Badge className="bg-[#0071e3]/10 text-[#0071e3] border-none">
                                Modo Examen
                              </Badge>
                              {examCase.isCustom && (
                                <Badge variant="outline" className="border-[#ff9500] text-[#ff9500]">
                                  Personalizado
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-[#6e6e73] mb-3 line-clamp-2">
                              {examCase.caseStatement.substring(0, 150)}...
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
                              {examCase.studentAnswer && (
                                <span className="flex items-center gap-1">
                                  <FileText className="w-4 h-4" />
                                  Respuesta completa
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <div className="text-4xl text-[#0071e3] font-semibold mb-1">{caseAverage}</div>
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
                                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold ${
                                        item.value >= 80
                                          ? 'bg-[#34c759]/10 text-[#34c759]'
                                          : item.value >= 60
                                          ? 'bg-[#ff9500]/10 text-[#ff9500]'
                                          : 'bg-[#ff3b30]/10 text-[#ff3b30]'
                                      }`}
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
                              Ver Detalles
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
              transition={{ delay: 0.6 }}
              className="glass rounded-2xl p-4"
            >
              <p className="text-sm text-[#6e6e73] text-center">
                <span className="font-medium text-[#1d1d1f]">Leyenda:</span> A = Anamnesis • E = Exploración • R = Razonamiento • T = Tratamiento • C = Comunicación
              </p>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
