import { useState, useRef, useEffect } from 'react';
import { Send, Home, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { CaseData } from '../App';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';

type TrainingStage = 'ANAMNESIS' | 'ANAMNESIS_VALORACION' | 'ANAMNESIS_VALORACION_TRATAMIENTO';
type ClinicalArea = 'MSK' | 'NEURO' | 'RESPI';

type TrainingConfig = {
  stage: TrainingStage;
  area?: ClinicalArea;
  academicLevel?: '1' | '2' | '3' | '4';
};

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

  // ✅ NUEVO: Configuración previa
  const [trainingConfig, setTrainingConfig] = useState<TrainingConfig | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const stageLabel = (s: TrainingStage) => {
    switch (s) {
      case 'ANAMNESIS':
        return 'Solo anamnesis';
      case 'ANAMNESIS_VALORACION':
        return 'Anamnesis + valoración';
      case 'ANAMNESIS_VALORACION_TRATAMIENTO':
        return 'Anamnesis + valoración + tratamiento';
      default:
        return s;
    }
  };

  const areaLabel = (a?: ClinicalArea) => {
    switch (a) {
      case 'MSK':
        return 'Musculoesquelético';
      case 'NEURO':
        return 'Neurológico';
      case 'RESPI':
        return 'Respiratorio';
      default:
        return 'Sin área';
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    if (!trainingConfig) {
      toast.error('Configura primero el entrenamiento (anamnesis / valoración / tratamiento).');
      return;
    }

    const newHistory = [...chatHistory, { role: 'student' as const, message }];
    onChatUpdate(newHistory);

    const userMessage = message;
    setMessage('');
    setIsTyping(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const res = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'casos_libres',
          action: 'paciente',
          message: userMessage,
          trainingConfig, // ✅ NUEVO: lo mandamos al backend
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

      onChatUpdate([
        ...newHistory,
        { role: 'patient' as const, message: data.reply },
      ]);
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

  // ✅ NUEVO: pantalla previa de configuración
  if (!trainingConfig) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f5f5f7]">
        <div className="glass border-b border-[#d2d2d7] px-6 py-4 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl text-[#1d1d1f] font-semibold">Modo libre</h1>
              <p className="text-[#6e6e73]">Configura qué competencia quieres entrenar antes de iniciar el caso.</p>
            </div>
            <Button
              variant="outline"
              onClick={onBackToHome}
              className="bg-white hover:bg-gray-50 border-[#d2d2d7] rounded-xl h-11"
            >
              <Home className="w-4 h-4 mr-2" />
              Inicio
            </Button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl glass rounded-3xl p-6 shadow-apple-lg border border-[#d2d2d7]">
            <h2 className="text-xl font-semibold text-[#1d1d1f]">Configurar entrenamiento</h2>
            <p className="text-[#6e6e73] mt-1">
              Selecciona el alcance del caso. La IA limitará la información para ajustarse al objetivo.
            </p>

            <div className="mt-6 space-y-5">
              {/* Competencia */}
              <div>
                <p className="text-[#1d1d1f] font-medium mb-2">¿Qué quieres entrenar?</p>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    className="justify-start rounded-2xl h-auto py-3 border-[#d2d2d7] bg-white hover:bg-gray-50"
                    onClick={() =>
                      setTrainingConfig({ stage: 'ANAMNESIS' })
                    }
                  >
                    <span className="font-medium">Solo anamnesis</span>
                    <span className="ml-2 text-[#6e6e73]">— historia clínica y razonamiento inicial</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start rounded-2xl h-auto py-3 border-[#d2d2d7] bg-white hover:bg-gray-50"
                    onClick={() =>
                      setTrainingConfig({ stage: 'ANAMNESIS_VALORACION' })
                    }
                  >
                    <span className="font-medium">Anamnesis + valoración</span>
                    <span className="ml-2 text-[#6e6e73]">— exploración y pruebas funcionales</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start rounded-2xl h-auto py-3 border-[#d2d2d7] bg-white hover:bg-gray-50"
                    onClick={() =>
                      setTrainingConfig({ stage: 'ANAMNESIS_VALORACION_TRATAMIENTO' })
                    }
                  >
                    <span className="font-medium">Anamnesis + valoración + tratamiento</span>
                    <span className="ml-2 text-[#6e6e73]">— objetivos, intervención y progresión</span>
                  </Button>
                </div>
              </div>

              {/* Área + nivel (se habilitan tras elegir stage) */}
              {trainingConfig && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-[#1d1d1f] font-medium mb-2">Área clínica (opcional)</p>
                      <div className="flex flex-wrap gap-2">
                        {(['MSK', 'NEURO', 'RESPI'] as ClinicalArea[]).map((a) => (
                          <Button
                            key={a}
                            variant="outline"
                            className={`rounded-full border-[#d2d2d7] ${
                              trainingConfig.area === a ? 'bg-[#0071e3]/10 text-[#0071e3]' : 'bg-white'
                            }`}
                            onClick={() =>
                              setTrainingConfig((prev) => prev ? { ...prev, area: a } : prev)
                            }
                          >
                            {areaLabel(a)}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          className="rounded-full border-[#d2d2d7] bg-white"
                          onClick={() =>
                            setTrainingConfig((prev) => prev ? { ...prev, area: undefined } : prev)
                          }
                        >
                          Cualquiera
                        </Button>
                      </div>
                    </div>

                    <div>
                      <p className="text-[#1d1d1f] font-medium mb-2">Nivel (opcional)</p>
                      <div className="flex flex-wrap gap-2">
                        {(['1', '2', '3', '4'] as const).map((lvl) => (
                          <Button
                            key={lvl}
                            variant="outline"
                            className={`rounded-full border-[#d2d2d7] ${
                              trainingConfig.academicLevel === lvl ? 'bg-[#0071e3]/10 text-[#0071e3]' : 'bg-white'
                            }`}
                            onClick={() =>
                              setTrainingConfig((prev) => prev ? { ...prev, academicLevel: lvl } : prev)
                            }
                          >
                            {lvl}º
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          className="rounded-full border-[#d2d2d7] bg-white"
                          onClick={() =>
                            setTrainingConfig((prev) => prev ? { ...prev, academicLevel: undefined } : prev)
                          }
                        >
                          Cualquiera
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-[#6e6e73] text-sm">
                      Selección: <span className="text-[#1d1d1f] font-medium">{stageLabel(trainingConfig.stage)}</span>
                      {trainingConfig.area ? (
                        <> · <span className="text-[#1d1d1f] font-medium">{areaLabel(trainingConfig.area)}</span></>
                      ) : null}
                      {trainingConfig.academicLevel ? (
                        <> · <span className="text-[#1d1d1f] font-medium">{trainingConfig.academicLevel}º</span></>
                      ) : null}
                    </div>

                    <Button
                      onClick={() => {
                        // Iniciamos el chat (si quieres, aquí luego dispararemos "generar caso" real desde backend)
                        toast.success('Entrenamiento configurado. Ya puedes iniciar el caso.');
                      }}
                      className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl h-11 shadow-lg"
                    >
                      Continuar
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Vista normal del chat (ya con trainingConfig fijado)
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

              {/* ✅ NUEVO: badges del entrenamiento */}
              <Badge className="bg-[#1d1d1f]/5 text-[#1d1d1f] border-none">
                {stageLabel(trainingConfig.stage)}
              </Badge>
              {trainingConfig.area ? (
                <Badge className="bg-[#1d1d1f]/5 text-[#1d1d1f] border-none">
                  {areaLabel(trainingConfig.area)}
                </Badge>
              ) : null}
              {trainingConfig.academicLevel ? (
                <Badge className="bg-[#1d1d1f]/5 text-[#1d1d1f] border-none">
                  Nivel {trainingConfig.academicLevel}º
                </Badge>
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
          <div ref={scrollRef} className="flex-1 space-y
