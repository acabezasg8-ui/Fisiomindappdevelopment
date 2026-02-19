import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, BookOpen, Lightbulb, CheckCircle2, Brain, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { generateAIResponse } from '../utils/supabase/client';

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

type ExamCaseResolutionProps = {
  examCase: ExamCaseData;
  onBackToHome: () => void;
  onFinishCase: (messages: Message[], studentAnswer: string) => void;
};

export function ExamCaseResolution({ examCase, onBackToHome, onFinishCase }: ExamCaseResolutionProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'tutor',
      message: 'Hola, soy tu tutor de IA. He leído el caso clínico. Cuando estés listo, comienza tu análisis. Puedo ayudarte con pistas, explicaciones o respondiendo tus dudas. ¿Por dónde quieres empezar?'
    }
  ]);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHintButton, setShowHintButton] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const studentMsg: Message = {
      role: 'student',
      message: currentMessage.trim()
    };

    setMessages(prev => [...prev, studentMsg]);
    setCurrentMessage('');
    setIsTyping(true);

    try {
      // Llamar a la IA para obtener respuesta como tutor
      const tutorResponse = await getTutorResponse(currentMessage, messages);
      
      const tutorMsg: Message = {
        role: 'tutor',
        message: tutorResponse
      };

      setTimeout(() => {
        setMessages(prev => [...prev, tutorMsg]);
        setIsTyping(false);
      }, 800);
    } catch (error) {
      console.error('Error getting tutor response:', error);
      const fallbackMsg: Message = {
        role: 'tutor',
        message: 'Entiendo tu pregunta. Continúa con tu análisis y razonamiento. ¿Qué más has identificado del caso?'
      };
      setMessages(prev => [...prev, fallbackMsg]);
      setIsTyping(false);
    }
  };

  const getTutorResponse = async (studentMessage: string, chatHistory: Message[]): Promise<string> => {
    try {
      // Crear un caso simulado para el tutor con la información del examen
      const mockCaseData = {
        id: examCase.id,
        patientName: 'Caso de Examen',
        age: examCase.patientInfo?.age || 0,
        gender: 'N/A',
        chiefComplaint: examCase.patientInfo?.chiefComplaint || examCase.caseStatement.substring(0, 100),
        pathology: examCase.pathology || 'Según enunciado',
        date: new Date().toISOString()
      };

      // Convertir mensajes al formato que espera generateAIResponse
      const formattedHistory = chatHistory.map(msg => ({
        role: msg.role === 'student' ? 'student' as const : 'patient' as const,
        message: msg.message
      }));

      const response = await generateAIResponse(studentMessage, mockCaseData, formattedHistory, true);
      return response;
    } catch (error) {
      console.error('Error getting tutor response from AI:', error);
      // Fallback a respuesta local si falla
      return generateLocalTutorResponse(studentMessage);
    }
  };

  const generateLocalTutorResponse = (message: string): string => {
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('ayuda') || lowerMsg.includes('pista') || lowerMsg.includes('hint')) {
      return 'Claro, aquí va una pista: Piensa en la información clave del caso. ¿Qué patrones identificas? Considera la edad, ocupación y características del dolor. ¿Qué estructuras anatómicas podrían estar involucradas?';
    }

    if (lowerMsg.includes('diagnóstico') || lowerMsg.includes('diagnostico') || lowerMsg.includes('qué tiene')) {
      return 'Excelente que estés pensando en el diagnóstico. Antes de concluir, asegúrate de haber analizado: 1) Mecanismo de lesión, 2) Localización exacta, 3) Factores agravantes y atenuantes, 4) Pruebas diagnósticas relevantes. ¿Qué diagnóstico diferencial estás considerando?';
    }

    if (lowerMsg.includes('tratamiento') || lowerMsg.includes('plan') || lowerMsg.includes('terapia')) {
      return 'Bien, estás pensando en el tratamiento. Recuerda que un buen plan debe incluir: objetivos SMART, técnicas apropiadas para la fase del paciente, ejercicios progresivos y educación terapéutica. ¿Qué objetivos principales plantearías?';
    }

    if (lowerMsg.includes('exploración') || lowerMsg.includes('tests') || lowerMsg.includes('pruebas')) {
      return 'Muy bien al pensar en la exploración. Considera qué tests específicos serían apropiados según tu hipótesis. ¿Qué hallazgos esperarías encontrar? ¿Qué pruebas descartarían otros diagnósticos?';
    }

    const responses = [
      'Interesante planteamiento. ¿Puedes desarrollar más esa idea? ¿Qué evidencia del caso apoya tu razonamiento?',
      'Vas por buen camino. Ahora piensa en las implicaciones clínicas. ¿Cómo afecta esto a tu plan de tratamiento?',
      'Buen análisis. ¿Has considerado todos los factores relevantes? Revisa nuevamente el enunciado del caso.',
      'Correcto. Ahora, ¿qué pasos seguirían en el proceso de evaluación? Piensa en el método clínico.',
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const requestHint = () => {
    const hints = [
      'Pista sobre el análisis: Empieza identificando los datos clave del paciente. ¿Qué te dice la edad y ocupación sobre posibles factores de riesgo?',
      'Pista sobre exploración: Piensa qué pruebas específicas harías según la zona afectada. Considera tests de movimiento, palpación y pruebas especiales.',
      'Pista sobre diagnóstico: Haz un diagnóstico diferencial. Lista 2-3 posibles patologías y luego justifica cuál es más probable según los datos.',
      'Pista sobre tratamiento: Un buen plan incluye objetivos a corto y largo plazo. Piensa en las fases: analgesia, recuperación funcional y prevención.',
    ];

    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    
    const hintMsg: Message = {
      role: 'tutor',
      message: randomHint,
      isHint: true
    };

    setMessages(prev => [...prev, hintMsg]);
    toast.success('Pista añadida');
  };

  const handleFinish = () => {
    if (studentAnswer.trim().length < 50) {
      toast.error('Por favor, escribe una respuesta más completa antes de finalizar');
      return;
    }

    onFinishCase(messages, studentAnswer);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col">
      {/* Header */}
      <div className="glass border-b border-[#d2d2d7] p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBackToHome}
            className="text-[#0071e3] hover:bg-[#0071e3]/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Salir
          </Button>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-[#0071e3] text-[#0071e3]">
              <Brain className="w-3 h-3 mr-1" />
              Modo Examen
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid lg:grid-cols-2 gap-6">
        {/* Panel Izquierdo: Caso Clínico */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass shadow-apple-lg rounded-3xl p-6 sticky top-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#0071e3]/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[#0071e3]" />
              </div>
              <h2 className="text-xl text-[#1d1d1f] font-semibold">Caso Clínico</h2>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#d2d2d7] mb-4">
              <p className="text-[#1d1d1f] leading-relaxed whitespace-pre-wrap">
                {examCase.caseStatement}
              </p>
            </div>

            <Button
              onClick={requestHint}
              variant="outline"
              className="w-full border-[#ff9500] text-[#ff9500] hover:bg-[#ff9500]/10 rounded-xl"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Solicitar Pista
            </Button>
          </motion.div>
        </div>

        {/* Panel Derecho: Chat con Tutor y Respuesta */}
        <div className="space-y-4 flex flex-col h-full">
          {/* Chat con tutor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass shadow-apple-lg rounded-3xl p-6 flex-1 flex flex-col min-h-[400px]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#34c759]/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-[#34c759]" />
              </div>
              <h2 className="text-xl text-[#1d1d1f] font-semibold">Tutor IA</h2>
            </div>

            <div className="flex-1 overflow-y-auto pr-4 -mr-4 max-h-[400px]" ref={scrollRef}>
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          msg.role === 'student'
                            ? 'bg-[#0071e3] text-white'
                            : msg.isHint
                            ? 'bg-[#ff9500]/10 border border-[#ff9500] text-[#1d1d1f]'
                            : 'bg-white border border-[#d2d2d7] text-[#1d1d1f]'
                        }`}
                      >
                        {msg.isHint && (
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-4 h-4 text-[#ff9500]" />
                            <span className="text-xs font-semibold text-[#ff9500]">PISTA</span>
                          </div>
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white border border-[#d2d2d7] rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-[#6e6e73] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-[#6e6e73] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-[#6e6e73] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-[#d2d2d7]">
              <Textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Pregunta al tutor, pide ayuda o comparte tu análisis..."
                className="resize-none rounded-xl border-[#d2d2d7] min-h-[60px]"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || isTyping}
                className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl px-6"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Respuesta del estudiante */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass shadow-apple-lg rounded-3xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ff9500]/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-[#ff9500]" />
                </div>
                <h2 className="text-xl text-[#1d1d1f] font-semibold">Tu Respuesta</h2>
              </div>
              <Badge variant="outline" className="text-xs">
                {studentAnswer.length} caracteres
              </Badge>
            </div>

            <Textarea
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              placeholder="Escribe aquí tu análisis completo del caso:&#10;&#10;1. Anamnesis y datos relevantes&#10;2. Exploración física que realizarías&#10;3. Diagnóstico diferencial y principal&#10;4. Plan de tratamiento y objetivos&#10;5. Educación al paciente"
              className="min-h-[200px] mb-4 rounded-xl border-[#d2d2d7] resize-none"
            />

            <Button
              onClick={handleFinish}
              disabled={studentAnswer.trim().length < 50}
              className="w-full bg-[#34c759] hover:bg-[#30d158] text-white rounded-xl h-12 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Finalizar y Evaluar
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}