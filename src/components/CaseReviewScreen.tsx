import { ArrowLeft, MessageSquare, FileText, Award, Search, Brain, Activity, Users, Calendar, User } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { CaseData } from '../App';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';

type CaseReviewScreenProps = {
  caseData: CaseData;
  onBack: () => void;
};

export function CaseReviewScreen({ caseData, onBack }: CaseReviewScreenProps) {
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

  const averageScore = caseData.evaluation
    ? Math.floor(
        (caseData.evaluation.anamnesis +
          caseData.evaluation.exploracion +
          caseData.evaluation.razonamientoClinico +
          caseData.evaluation.tratamiento +
          caseData.evaluation.comunicacion) /
          5
      )
    : 0;

  const categories = caseData.evaluation
    ? [
        { name: 'Anamnesis', score: caseData.evaluation.anamnesis, feedback: caseData.evaluation.feedback.anamnesis, icon: MessageSquare },
        { name: 'Exploración', score: caseData.evaluation.exploracion, feedback: caseData.evaluation.feedback.exploracion, icon: Search },
        { name: 'Razonamiento Clínico', score: caseData.evaluation.razonamientoClinico, feedback: caseData.evaluation.feedback.razonamientoClinico, icon: Brain },
        { name: 'Tratamiento', score: caseData.evaluation.tratamiento, feedback: caseData.evaluation.feedback.tratamiento, icon: Activity },
        { name: 'Comunicación', score: caseData.evaluation.comunicacion, feedback: caseData.evaluation.feedback.comunicacion, icon: Users },
      ]
    : [];

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
            <h1 className="text-4xl text-[#1d1d1f] font-semibold mb-2">Revisión de Caso</h1>
            <p className="text-[#6e6e73]">Revisa tu desempeño y aprendizaje</p>
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
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <User className="w-6 h-6 text-[#0071e3]" />
                  <h2 className="text-2xl text-[#1d1d1f] font-semibold">{caseData.patientName}</h2>
                  <Badge className="bg-[#0071e3]/10 text-[#0071e3] border-none">Modo Libre</Badge>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-2 text-[#6e6e73]">
                    <Calendar className="w-4 h-4" />
                    <span>{caseData.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#6e6e73]">
                    <User className="w-4 h-4" />
                    <span>{caseData.age} años • {caseData.gender}</span>
                  </div>
                </div>
              </div>

              {caseData.evaluation && (
                <div className="text-center">
                  <div className={`text-5xl font-bold mb-1 ${getScoreColor(averageScore)}`}>
                    {averageScore}
                  </div>
                  <div className="text-xs text-[#6e6e73]">Puntuación Media</div>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-[#d2d2d7]">
                <p className="text-sm text-[#6e6e73] mb-1">Motivo de Consulta</p>
                <p className="text-[#1d1d1f] font-medium">{caseData.chiefComplaint}</p>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-[#d2d2d7]">
                <p className="text-sm text-[#6e6e73] mb-1">Diagnóstico</p>
                <p className="text-[#1d1d1f] font-medium">{caseData.pathology}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Conversación */}
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
              <h3 className="text-xl text-[#1d1d1f] font-semibold">Conversación</h3>
              {caseData.chatHistory && (
                <Badge variant="outline" className="border-[#6e6e73] text-[#6e6e73]">
                  {caseData.chatHistory.length} mensajes
                </Badge>
              )}
            </div>

            <ScrollArea className="h-[500px] pr-4">
              {caseData.chatHistory && caseData.chatHistory.length > 0 ? (
                <div className="space-y-4">
                  {caseData.chatHistory.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-4 ${
                          msg.role === 'student'
                            ? 'bg-[#0071e3] text-white'
                            : 'bg-white border border-[#d2d2d7] text-[#1d1d1f]'
                        }`}
                      >
                        <div className="text-xs mb-1 opacity-70">
                          {msg.role === 'student' ? 'Tú' : caseData.patientName}
                        </div>
                        <p className="text-sm leading-relaxed">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-[#6e6e73]">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No hay mensajes registrados</p>
                </div>
              )}
            </ScrollArea>
          </motion.div>

          {/* Notas */}
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
              <h3 className="text-xl text-[#1d1d1f] font-semibold">Notas Clínicas</h3>
              {caseData.notes && caseData.notes.length > 0 && (
                <Badge variant="outline" className="border-[#34c759] text-[#34c759]">
                  {caseData.notes.length} caracteres
                </Badge>
              )}
            </div>

            <ScrollArea className="h-[500px] pr-4">
              {caseData.notes && caseData.notes.length > 0 ? (
                <div className="bg-white rounded-2xl p-4 border border-[#d2d2d7]">
                  <p className="text-[#1d1d1f] whitespace-pre-wrap leading-relaxed">{caseData.notes}</p>
                </div>
              ) : (
                <div className="text-center py-12 text-[#6e6e73]">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No se tomaron notas durante este caso</p>
                </div>
              )}
            </ScrollArea>
          </motion.div>
        </div>

        {/* Evaluación */}
        {caseData.evaluation && (
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
