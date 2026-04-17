import { useState, useRef, useEffect } from 'react';
import { Send, FileText, Home, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { CaseData } from '../App';
import { Badge } from './ui/badge';
import { generateAIResponse } from '../utils/supabase/client';
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
  const [notesOpen, setNotesOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      const newHistory = [...chatHistory, { role: 'student' as const, message }];
      onChatUpdate(newHistory);
      const userMessage = message;
      setMessage('');
      setIsTyping(true);

      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const aiResponse = await generateAIResponse(userMessage, caseData, newHistory, false);
        onChatUpdate([...newHistory, { role: 'patient' as const, message: aiResponse }]);
      } catch (error) {
        console.error('Error getting AI response:', error);
        toast.error('Error al obtener respuesta del paciente');
        onChatUpdate([...newHistory, { role: 'patient' as const, message: 'Disculpe, ¿puede repetir la pregunta?' }]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f7]">
      {/* Header - Apple style */}
      <div className="glass border-b border-[#d2d2d7] px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl text-[#1d1d1f] font-semibold">Simulación Clínica</h1>
            <div className="flex items-center gap-3">
              <p className="text-[#6e6e73]">{caseData.patientName}</p>
              <Badge className="bg-[#0071e3]/10 text-[#0071e3] border-none hover:bg-[#0071e3]/20">
                {caseData.age} años
              </Badge>
              <Badge className="bg-[#0071e3]/10 text-[#0071e3] border-none hover:bg-[#0071e3]/20">
                {caseData.gender}
              </Badge>
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

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-6">
          {/* Messages */}
          <div 
            ref={scrollRef} 
            className="flex-1 space-y-4 overflow-y-auto pb-4"
            style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: '#d2d2d7 transparent'
            }}
          >
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
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                      {chat.message}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="glass shadow-apple border border-[#d2d2d7] rounded-3xl px-5 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-[#6e6e73] rounded-full animate-bounce"></span>
                    <span
                      className="w-2 h-2 bg-[#6e6e73] rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-[#6e6e73] rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input area */}
          <div className="glass rounded-3xl p-4 shadow-apple-lg border border-[#d2d2d7]">
            <div className="flex gap-3 items-end">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="flex-1 resize-none border-none bg-transparent focus:ring-0 text-[15px] min-h-[44px] max-h-[120px]"
                rows={1}
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

        {/* Notes panel */}
        <AnimatePresence>
          {notesOpen ? (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 384, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="border-l border-[#d2d2d7] glass overflow-hidden"
            >
              <div className="w-96 h-full flex flex-col p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg text-[#1d1d1f] font-semibold">Notas Clínicas</h3>
                  <Button
                    onClick={() => setNotesOpen(false)}
                    variant="ghost"
                    className="text-[#6e6e73] hover:text-[#1d1d1f] rounded-full w-8 h-8 p-0"
                  >
                    ×
                  </Button>
                </div>
                <p className="text-sm text-[#6e6e73] mb-4">
                  Anota hallazgos importantes del caso
                </p>
                <Textarea
                  value={notes}
                  onChange={(e) => onNotesUpdate(e.target.value)}
                  placeholder="Ej: Dolor cervical posterior, EVA 6/10..."
                  className="flex-1 resize-none border-[#d2d2d7] rounded-2xl bg-white/50 text-[15px] leading-relaxed"
                />
              </div>
            </motion.div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setNotesOpen(true)}
              className="fixed right-6 bottom-6 glass shadow-apple-lg rounded-full p-4 border border-[#d2d2d7] hover:border-[#0071e3] transition-colors z-50"
            >
              <FileText className="w-6 h-6 text-[#0071e3]" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
