import { ArrowLeft, MessageSquare, Award, Search, Brain, Activity, Users, Calendar, BookOpen, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';

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

type ExamCaseReviewScreenProps = {
  examCaseData: ExamCaseData;
  onBack: () => void;
};

export function ExamCaseReviewScreen({ examCaseData, onBack }: ExamCaseReviewScreenProps) {
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

  const averageScore = examCaseData.evaluation
    ? Math.floor(
        (examCaseData.evaluation.anamnesis +
          examCaseData.evaluation.exploracion +
          examCaseData.evaluation.razonamientoClinico +
          examCaseData.evaluation.tratamiento +
          examCaseData.evaluation.comunicacion) /
          5
      )
    : 0;

  const categories = examCaseData.evaluation
    ? [
        { name: 'Anamnesis', score: examCaseData.evaluation.anamnesis, feedback: examCaseData.evaluation.feedback.anamnesis, icon: MessageSquare },
        { name: 'Exploración', score: examCaseData.evaluation.exploracion, feedback: examCaseData.evaluation.feedback.exploracion, icon: Search },
        { name: 'Razonamiento Clínico', score: examCaseData.evaluation.razonamientoClinico, feedback: examCaseData.evaluation.feedback.razonamientoClinico, icon: Brain },
        { name: 'Tratamiento', score: examCaseData.evaluation.tratamiento, feedback: examCaseData.evaluation.feedback.tratamiento, icon: Activity },
        { name: 'Comunicación', score: examCaseData.evaluation.comunicacion, feedback: examCaseData.evaluation.feedback.comunicacion, icon: Users },
      ]
    : [];

  const studentMessages = examCaseData.messages?.filter(msg => msg.role === 'student') || [];

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
            <h1 className="text-4xl text-[#1d1d1f] font-semibold mb-2">Revisión de Caso de Examen</h1>
            <p className="text-[#6e6e73]">Revisa tu desempeño en el modo examen</p>
          </div>
          <Button
            onClick={onBack}
            className="bg-white hover:bg-gray-50 border-2 border-[#d2d2d7] text-[#1d1d1f] rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </motion.div>

        {/* Información del Caso */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass shadow-apple-lg rounded-3xl p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-green-400/20 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Brain className="w-6 h-6 text-[#0071e3]" />
                  <h2 className="text-2xl text-[#1d1d1f] font-semibold">Caso de Examen</h2>
                  <Badge className="bg-[#0071e3]/10 text-[#0071e3] border-none">Modo Examen</Badge>
                  {examCaseData.isCustom && (
                    <Badge variant="outline" className="border-[#ff9500] text-[#ff9500]">
                      Caso Personalizado
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-[#6e6e73] mt-4">
                  <Calendar className="w-4 h-4" />
                  <span>{examCaseData.date}</span>
                </div>
              </div>

              {examCaseData.evaluation && (
                <div className="text-center">
                  <div className={`text-5xl font-bold mb-1 ${getScoreColor(averageScore)}`}>
                    {averageScore}
                  </div>
                  <div className="text-xs text-[#6e6e73]">Puntuación Media</div>
                </div>
              )}
            </div>

            {/* Enunciado del Caso */}
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-[#d2d2d7] mt-6">
              <p className="text-sm text-[#6e6e73] mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Enunciado del Caso
              </p>
              <p className="text-[#1d1d1f] leading-relaxed whitespace-pre-wrap">{examCaseData.caseStatement}</p>
            </div>

            {/* Información del paciente si existe */}
            {examCaseData.patientInfo && (
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                {examCaseData.patientInfo.age && (
                  <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-[#d2d2d7]">
                    <p className="text-sm text-[#6e6e73] mb-1">Edad</p>
                    <p className="text-[#1d1d1f] font-medium">{examCaseData.patientInfo.age} años</p>
                  </div>
                )}
                {examCaseData.patientInfo.occupation && (
                  <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-[#d2d2d7]">
                    <p className="text-sm text-[#6e6e73] mb-1">Ocupación</p>
                    <p className="text-[#1d1d1f] font-medium">{examCaseData.patientInfo.occupation}</p>
                  </div>
                )}
                {examCaseData.patientInfo.chiefComplaint && (
                  <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-[#d2d2d7]">
                    <p className="text-sm text-[#6e6e73] mb-1">Motivo</p>
                    <p className="text-[#1d1d1f] font-medium">{examCaseData.patientInfo.chiefComplaint}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Diálogo con el Tutor */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass shadow-apple-lg rounded-3xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#0071e3]/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-[#0071e3]" />
              </div>
              <h3 className="text-xl text-[#1d1d1f] font-semibold">Diálogo con el Tutor IA</h3>
              {examCaseData.messages && (
                <Badge variant="outline" className="border-[#6e6e73] text-[#6e6e73]">
                  {examCaseData.messages.length} mensajes
                </Badge>
              )}
            </div>

            <ScrollArea className="h-[500px] pr-4">
              {examCaseData.messages && examCaseData.messages.length > 0 ? (
                <div className="space-y-4">
                  {examCaseData.messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-4 ${
                          msg.role === 'student'
                            ? 'bg-[#0071e3] text-white'
                            : msg.isHint
                            ? 'bg-[#ff9500]/10 border-2 border-[#ff9500] text-[#1d1d1f]'
                            : 'bg-white border border-[#d2d2d7] text-[#1d1d1f]'
                        }`}
                      >
                        <div className="text-xs mb-1 opacity-70">
                          {msg.role === 'student' ? 'Tú' : 'Tutor IA'}
                          {msg.isHint && ' (Pista)'}
                        </div>
                        <p className="text-sm leading-relaxed">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-[#6e6e73]">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No interactuaste con el tutor en este caso</p>
                </div>
              )}
            </ScrollArea>
          </motion.div>

          {/* Respuesta del Estudiante */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass shadow-apple-lg rounded-3xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#34c759]/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#34c759]" />
              </div>
              <h3 className="text-xl text-[#1d1d1f] font-semibold">Tu Respuesta Final</h3>
              {examCaseData.studentAnswer && (
                <Badge variant="outline" className="border-[#34c759] text-[#34c759]">
                  {examCaseData.studentAnswer.length} caracteres
                </Badge>
              )}
            </div>

            <ScrollArea className="h-[500px] pr-4">
              {examCaseData.studentAnswer && examCaseData.studentAnswer.length > 0 ? (
                <div className="bg-white rounded-2xl p-4 border border-[#d2d2d7]">
                  <p className="text-[#1d1d1f] whitespace-pre-wrap leading-relaxed">
                    {examCaseData.studentAnswer}
                  </p>
                </div>
              ) : (
                <div className="text-center py-12 text-[#6e6e73]">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No se proporcionó respuesta final</p>
                </div>
              )}
            </ScrollArea>

            {/* Estadísticas adicionales */}
            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-[#d2d2d7]">
                <span className="text-sm text-[#6e6e73]">Mensajes con el tutor:</span>
                <span className="text-sm text-[#1d1d1f] font-semibold">{studentMessages.length}</span>
              </div>
              {examCaseData.pathology && (
                <div className="p-3 bg-white rounded-xl border border-[#d2d2d7]">
                  <span className="text-sm text-[#6e6e73]">Diagnóstico correcto: </span>
                  <span className="text-sm text-[#1d1d1f] font-semibold">{examCaseData.pathology}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Evaluación */}
        {examCaseData.evaluation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass shadow-apple-lg rounded-3xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#ff9500]/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-[#ff9500]" />
              </div>
              <h3 className="text-xl text-[#1d1d1f] font-semibold">Evaluación de Competencias</h3>
            </div>

            <div className="space-y-4">
              {categories.map((category, index) => {
                const IconComponent = category.icon;
                return (
                  <div key={index} className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-[#d2d2d7]">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#0071e3]/10 flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-[#0071e3]" />
                          </div>
                          <h4 className="text-lg text-[#1d1d1f] font-semibold">{category.name}</h4>
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
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
