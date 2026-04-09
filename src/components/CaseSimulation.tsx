import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Home, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { CaseData } from '../App';

type ChatMessage = {
  role: 'student' | 'patient';
  message: string;
};

type CaseSimulationProps = {
  caseData: CaseData;
  chatHistory: ChatMessage[];
  onChatUpdate: (history: ChatMessage[]) => void;
  notes: string;
  onNotesUpdate: (notes: string) => void;
  onEndCase: () => void;
  onBackToHome: () => void;
};

type TrainingStage =
  | 'ANAMNESIS'
  | 'ANAMNESIS_VALORACION'
  | 'ANAMNESIS_VALORACION_TRATAMIENTO';

type TrainingArea = 'MSK' | 'NEURO' | 'RESPI';

type ChatApiResponse = {
  reply?: string;
  error?: string;
  caseMeta?: {
    region_or_topic?: string;
    framework?: string;
    pathology_hidden?: string;
    difficulty?: string;
  };
};

function stageLabel(stage?: TrainingStage): string {
  if (stage === 'ANAMNESIS') return 'Solo anamnesis';
  if (stage === 'ANAMNESIS_VALORACION') return 'Anamnesis + valoración';
  if (stage === 'ANAMNESIS_VALORACION_TRATAMIENTO') {
    return 'Anamnesis + valoración + tratamiento';
  }
  return 'Entrenamiento';
}

function areaLabel(area?: TrainingArea | string): string {
  if (area === 'MSK') return 'Musculoesquelético';
  if (area === 'NEURO') return 'Neurológico';
  if (area === 'RESPI') return 'Respiratorio';
  return 'Cualquiera';
}

function mapHistoryToApi(history: ChatMessage[]) {
  return history.map((msg) => ({
    role: msg.role === 'student' ? 'user' : 'assistant',
    content: msg.message,
  }));
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return 'Error desconocido';
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
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const cfg = caseData.trainingConfig;

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatHistory, isTyping]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
  }, [message]);

  const handleSendMessage = useCallback(async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isTyping || isSending) return;

    if (!caseData.trainingConfig) {
      toast.error(
        'Este caso no tiene trainingConfig. Vuelve atrás y genera un caso desde la pantalla de configuración.'
      );
      return;
    }

    const optimisticHistory: ChatMessage[] = [
      ...chatHistory,
      { role: 'student', message: trimmedMessage },
    ];

    onChatUpdate(optimisticHistory);
    setMessage('');
    setIsTyping(true);
    setIsSending(true);

    try {
      const res = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'casos_libres',
          action: 'paciente',
          message: trimmedMessage,
          history: mapHistoryToApi(optimisticHistory),
          trainingConfig: caseData.trainingConfig,
          seed: caseData.id,
        }),
      });

      let data: ChatApiResponse | null = null;

      try {
        data = (await res.json()) as ChatApiResponse;
      } catch {
        if (!res.ok) {
          throw new Error('La respuesta del servidor no es JSON válido.');
        }
      }

      if (!res.ok) {
        const backendError =
          data?.error ||
          `Error ${res.status}: no se pudo obtener respuesta del paciente`;
        throw new Error(backendError);
      }

      const reply =
        typeof data?.reply === 'string' && data.reply.trim()
          ? data.reply.trim()
          : 'Disculpe, ¿puede repetir la pregunta?';

      onChatUpdate([
        ...optimisticHistory,
        {
          role: 'patient',
          message: reply,
        },
      ]);
    } catch (error) {
      console.error('Error getting AI response:', error);

      toast.error('Error al obtener respuesta del paciente');

      onChatUpdate([
        ...optimisticHistory,
        {
          role: 'patient',
          message: 'Disculpe, ¿puede repetir la pregunta?',
        },
      ]);

      const errorMessage = extractErrorMessage(error);
      console.warn('Detalle del error:', errorMessage);
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  }, [
    message,
    isTyping,
    isSending,
    caseData.trainingConfig,
    caseData.id,
    chatHistory,
    onChatUpdate,
  ]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  const handleClickSend = () => {
    void handleSendMessage();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f7]">
      <div className="glass border-b border-[#d2d2d7] px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <h1 className="text-2xl text-[#1d1d1f] font-semibold">
              Simulación Clínica
            </h1>

            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[#6e6e73] truncate">{caseData.patientName}</p>

              <Badge className="bg-[#0071e3]/10 text-[#0071e3] border-none hover:bg-[#0071e3]/20">
                {caseData.age} años
              </Badge>

              <Badge className="bg-[#0071e3]/10 text-[#0071e3] border-none hover:bg-[#0071e3]/20">
                {caseData.gender}
              </Badge>

              {cfg ? (
                <>
                  <Badge className="bg-[#1d1d1f]/5 text-[#1d1d1f] border-none">
                    {stageLabel(cfg.stage as TrainingStage)}
                  </Badge>

                  <Badge className="bg-[#1d1d1f]/5 text-[#1d1d1f] border-none">
                    {areaLabel(cfg.area as TrainingArea)}
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

          <div className="flex gap-3 shrink-0">
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
          <div
            ref={scrollRef}
            className="flex-1 space-y-4 overflow-y-auto pb-4"
          >
            <AnimatePresence initial={false}>
              {chatHistory.map((chat, index) => (
                <motion.div
                  key={`${chat.role}-${index}-${chat.message.slice(0, 20)}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${
                    chat.role === 'student' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[75%] rounded-3xl px-5 py-3 ${
                      chat.role === 'student'
                        ? 'bg-[#0071e3] text-white shadow-lg'
                        : 'glass shadow-apple border border-[#d2d2d7]'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                      {chat.message}
                    </p>
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
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="flex-1 resize-none border-none bg-transparent focus:ring-0 text-[15px] min-h-[44px] max-h-[180px]"
                disabled={isTyping || isSending}
              />

              <Button
                onClick={handleClickSend}
                disabled={!message.trim() || isTyping || isSending}
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
