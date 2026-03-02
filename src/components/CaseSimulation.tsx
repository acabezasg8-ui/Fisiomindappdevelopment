import { useState, useRef, useEffect } from 'react';
import { Send, Home, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { CaseData } from '../App';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';

type CaseSimulationProps = {
  caseData: CaseData;
  chatHistory: Array<{ role: 'student' | 'patient'; message: string }>;
  onChatUpdate: (history: Array<{ role: 'student' | 'patient'; message: string }>) => void;
  notes: string;
  onNotesUpdate: (notes: string) => void;
  onEndCase: () => void;
  onBackToHome: () => void;
};

function stageLabel(s?: CaseData['trainingConfig'] extends infer T ? any : any) {
  const stage = (s?.stage || '') as string;
  if (stage === 'ANAMNESIS') return 'Solo anamnesis';
  if (stage === 'ANAMNESIS_VALORACION') return 'Anamnesis + valoración';
  if (stage === 'ANAMNESIS_VALORACION_TRATAMIENTO') return 'Anamnesis + valoración + tratamiento';
  return 'Entrenamiento';
}

function areaLabel(a?: string) {
  if (a === 'MSK') return 'Musculoesquelético';
  if (a === 'NEURO') return 'Neurológico';
  if (a === 'RESPI') return 'Respiratorio';
  return 'Cualquiera';
}

export function CaseSimulation({
  caseData,
  chatHistory,
  onChatUpdate,
  notes,
  onNotesUpdate,
  onEndCase,
  onBackToHome,
}: CaseSimulationProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    if (!caseData.trainingConfig) {
      toast.error('Este caso no tiene trainingConfig. Vuelve atrás y genera un caso desde la pantalla de configuración.');
      return;
    }

    const newHistory = [...chatHistory, { role: 'student' as const, message }];
    onChatUpdate(newHistory);

    const userMessage = message;
    setMessage('');
    setIsTyping(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 250));

      const res = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'casos_libres',
          action: 'paciente',
          message: userMessage,
          trainingConfig: caseData.trainingConfig, // ✅ scope locking
          seed: caseData.id, // ✅ paciente estable durante el caso
          history: newHistory.map((msg) => ({
            role: msg.role === 'student' ? 'user' : 'assistant',
            content: msg.message,
          })),
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt);
      }

      const data = await res.json();

      onChatUpdate([...newHistory, { role: 'patient' as const, message: data.reply }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error('Error al obtener respuesta del paciente');
      onChatUpdate([
        ...newHistory,
        { role: 'patient' as const, message: 'Disculpe, ¿puede repetir la pregunta?' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const cfg = caseData.trainingConfig;

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f7]">
      <div className="glass border-b border-[#d2d2d7] px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl text-[#1d1d1f] font-semibold">Simulación Clínica</h1>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[#6e6e73]">{caseData.patientName}</p>

              <Badge className="bg-[#0071e3]/10 text-[#0071e3] border-none hover:bg-[#0071e3]/20">
                {caseData.age} años
              </Badge>

              <Badge className="bg-[#0071e3]/10 text-[#0071e3] border-none hover:bg-[#0071e3]/20">
                {caseData.gender}
              </Badge>

              {cfg ? (
                <>
                  <Badge className="bg-[#1d1d1f]/5 text-[#1d1d1f] border-none">
                    {stageLabel(cfg)}
                  </Badge>
                  <Badge className="bg-[#1d1d1f]/5 text-[#1d1d1f] border-none">
                    {areaLabel(cfg.area)}
                  </Badge>
                  {cfg.academicLevel ? (
                    <Badge className="bg-[#1d1d1f]/5 text-[#1d1d1f] border-none">
                      Nivel {cfg.academicLevel}º
                    </Badge>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onBackToHome}
              className="bg-white hover:bg-gray-50 border-[#d2d2d7] rounded-xl h-11"
            >
              <Home className="w-4 h-4 mr-2" />
              Inicio
            </Button>
            <Button
              onClick={onEndCase}
              className="bg-[#34c759] hover:bg-[#30b350] text-white rounded-xl h-11 shadow-lg"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Finalizar
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-6">
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto pb-4">
            <AnimatePresence initial={false}>
              {chatHistory.map((chat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${chat.role === 'student' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-3xl px-5 py-3 ${
                      chat.role === 'student'
                        ? 'bg-[#0071e3] text-white shadow-lg'
                        : 'glass shadow-apple border border-[#d2d2d7]'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{chat.message}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <div className="flex justify-start">
                <div className="glass shadow-apple border border-[#d2d2d7] rounded-3xl px-5 py-3">
                  Escribiendo...
                </div>
              </div>
            )}
          </div>

          <div className="glass rounded-3xl p-4 shadow-apple-lg border border-[#d2d2d7]">
            <div className="flex gap-3 items-end">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="flex-1 resize-none border-none bg-transparent focus:ring-0 text-[15px]"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || isTyping}
                className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full w-11 h-11 p-0 shadow-lg disabled:opacity-40"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
