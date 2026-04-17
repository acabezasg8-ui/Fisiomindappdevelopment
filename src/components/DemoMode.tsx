import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { CheckCircle2, XCircle, ArrowRight, Sparkles, ChevronRight } from 'lucide-react';
import { CaseSimulation } from './CaseSimulation';
import { generateNewCase } from '../utils/supabase/client';
import type { CaseData, EvaluationResult } from '../App';

type DemoStage = 'welcome' | 'simulation' | 'evaluation' | 'complete';

type SimplifiedEvaluation = {
  anamnesis: 'correcto' | 'incompleto';
  exploracion: 'correcto' | 'incompleto';
  diagnostico: 'correcto' | 'incorrecto';
};

type DemoModeProps = {
  onExit: () => void;
};

export function DemoMode({ onExit }: DemoModeProps) {
  const [stage, setStage] = useState<DemoStage>('welcome');
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [currentCase, setCurrentCase] = useState<CaseData | null>(null);
  const [completedCases, setCompletedCases] = useState<SimplifiedEvaluation[]>([]);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'student' | 'patient'; message: string }>>([]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const TOTAL_DEMO_CASES = 3;

  const handleStartCase = async () => {
    setIsLoading(true);
    try {
      const newCase = await generateNewCase();
      setCurrentCase(newCase);
      setChatHistory([]);
      setNotes('');
      setStage('simulation');
    } catch (error) {
      console.error('Error generating demo case:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSimulation = (finalChatHistory: Array<{ role: 'student' | 'patient'; message: string }>, finalNotes: string) => {
    setChatHistory(finalChatHistory);
    setNotes(finalNotes);
    
    // Generar evaluación simplificada
    const evaluation = generateSimplifiedEvaluation(finalChatHistory, finalNotes);
    setCompletedCases([...completedCases, evaluation]);
    setStage('evaluation');
  };

  const generateSimplifiedEvaluation = (
    history: Array<{ role: 'student' | 'patient'; message: string }>,
    notes: string
  ): SimplifiedEvaluation => {
    const studentMessages = history.filter(msg => msg.role === 'student');
    
    // Evaluar anamnesis (si preguntaron sobre dolor, inicio, etc.)
    const hasAskedPain = studentMessages.some(msg => 
      msg.message.toLowerCase().includes('dolor') || 
      msg.message.toLowerCase().includes('molestia')
    );
    const hasAskedOnset = studentMessages.some(msg => 
      msg.message.toLowerCase().includes('cuándo') || 
      msg.message.toLowerCase().includes('empezó')
    );
    const hasAskedWork = studentMessages.some(msg => 
      msg.message.toLowerCase().includes('trabajo') || 
      msg.message.toLowerCase().includes('actividad')
    );
    
    const anamnesisScore = [hasAskedPain, hasAskedOnset, hasAskedWork].filter(Boolean).length;
    
    // Evaluar exploración
    const hasExploration = studentMessages.some(msg => 
      msg.message.toLowerCase().includes('exploración') || 
      msg.message.toLowerCase().includes('examinar') ||
      msg.message.toLowerCase().includes('movimiento') ||
      msg.message.toLowerCase().includes('palpar')
    );
    
    // Evaluar diagnóstico (si mencionaron la patología correcta en notas)
    const hasDiagnosis = notes.toLowerCase().includes(currentCase?.pathology.toLowerCase() || '');
    
    return {
      anamnesis: anamnesisScore >= 2 ? 'correcto' : 'incompleto',
      exploracion: hasExploration ? 'correcto' : 'incompleto',
      diagnostico: hasDiagnosis ? 'correcto' : 'incorrecto'
    };
  };

  const handleNextCase = () => {
    if (currentCaseIndex + 1 < TOTAL_DEMO_CASES) {
      setCurrentCaseIndex(currentCaseIndex + 1);
      setStage('welcome');
    } else {
      setStage('complete');
    }
  };

  if (stage === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f5f5f7] to-white flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full"
        >
          <Card className="p-12 bg-white/80 backdrop-blur-xl border-[#d2d2d7] shadow-2xl">
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#0071e3] to-[#005bb5] mb-4"
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>
              
              <h1 className="text-4xl font-semibold text-[#1d1d1f] tracking-tight">
                Demo de simulación clínica
              </h1>
              
              <p className="text-lg text-[#6e6e73] leading-relaxed max-w-xl mx-auto">
                Prueba cómo funciona FisioMind resolviendo casos clínicos simulados con pacientes virtuales controlados por IA
              </p>

              <div className="pt-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f5f5f7] text-sm text-[#6e6e73]">
                  <span className="font-medium text-[#0071e3]">
                    Caso {currentCaseIndex + 1} de {TOTAL_DEMO_CASES}
                  </span>
                </div>
              </div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="pt-6"
              >
                <Button
                  onClick={handleStartCase}
                  disabled={isLoading}
                  className="px-8 py-6 text-lg bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                  {isLoading ? 'Generando caso...' : 'Empezar caso'}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (stage === 'simulation' && currentCase) {
    return (
      <CaseSimulation
        caseData={currentCase}
        chatHistory={chatHistory}
        onChatUpdate={setChatHistory}
        notes={notes}
        onNotesUpdate={setNotes}
        onEndCase={() => handleEndSimulation(chatHistory, notes)}
        onBackToHome={() => setStage('welcome')}
      />
    );
  }

  if (stage === 'evaluation') {
    const evaluation = completedCases[completedCases.length - 1];
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f5f5f7] to-white flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full"
        >
          <Card className="p-12 bg-white/80 backdrop-blur-xl border-[#d2d2d7] shadow-2xl">
            <div className="text-center space-y-8">
              <h2 className="text-3xl font-semibold text-[#1d1d1f]">
                Evaluación del caso
              </h2>

              <div className="space-y-4">
                <EvaluationItem
                  label="Anamnesis"
                  status={evaluation.anamnesis}
                />
                <EvaluationItem
                  label="Exploración"
                  status={evaluation.exploracion}
                />
                <EvaluationItem
                  label="Diagnóstico"
                  status={evaluation.diagnostico}
                />
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="pt-6"
              >
                <Button
                  onClick={handleNextCase}
                  className="px-8 py-6 text-lg bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                  {currentCaseIndex + 1 < TOTAL_DEMO_CASES ? 'Siguiente caso' : 'Ver resumen'}
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (stage === 'complete') {
    const correctAnamnesis = completedCases.filter(c => c.anamnesis === 'correcto').length;
    const correctExploracion = completedCases.filter(c => c.exploracion === 'correcto').length;
    const correctDiagnostico = completedCases.filter(c => c.diagnostico === 'correcto').length;

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f5f5f7] to-white flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full"
        >
          <Card className="p-12 bg-white/80 backdrop-blur-xl border-[#d2d2d7] shadow-2xl">
            <div className="text-center space-y-8">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 mb-4"
              >
                <CheckCircle2 className="w-10 h-10 text-white" />
              </motion.div>

              <h1 className="text-4xl font-semibold text-[#1d1d1f]">
                ¡Demo completada!
              </h1>

              <p className="text-lg text-[#6e6e73]">
                Has completado {TOTAL_DEMO_CASES} casos clínicos
              </p>

              <div className="bg-[#f5f5f7] rounded-2xl p-6 space-y-3">
                <h3 className="text-sm font-medium text-[#6e6e73] uppercase tracking-wide">
                  Resumen de rendimiento
                </h3>
                <div className="space-y-2 text-left">
                  <SummaryRow
                    label="Anamnesis correcta"
                    value={`${correctAnamnesis}/${TOTAL_DEMO_CASES}`}
                  />
                  <SummaryRow
                    label="Exploración correcta"
                    value={`${correctExploracion}/${TOTAL_DEMO_CASES}`}
                  />
                  <SummaryRow
                    label="Diagnóstico correcto"
                    value={`${correctDiagnostico}/${TOTAL_DEMO_CASES}`}
                  />
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <p className="text-base text-[#6e6e73]">
                  ¿Te gustaría acceder a más de 50 casos clínicos, evaluaciones detalladas con IA y el modo FisioStudy?
                </p>

                <Button
                  onClick={onExit}
                  className="w-full px-8 py-6 text-lg bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                  Accede al acceso anticipado
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                <Button
                  onClick={onExit}
                  variant="ghost"
                  className="w-full text-[#6e6e73] hover:text-[#1d1d1f]"
                >
                  Volver al inicio
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return null;
}

function EvaluationItem({ 
  label, 
  status 
}: { 
  label: string; 
  status: 'correcto' | 'incompleto' | 'incorrecto';
}) {
  const isPositive = status === 'correcto';
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-4 bg-[#f5f5f7] rounded-xl"
    >
      <span className="text-lg text-[#1d1d1f] font-medium">{label}</span>
      <div className="flex items-center gap-2">
        {isPositive ? (
          <>
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <span className="text-green-600 font-medium capitalize">{status}</span>
          </>
        ) : (
          <>
            <XCircle className="w-6 h-6 text-orange-500" />
            <span className="text-orange-500 font-medium capitalize">{status}</span>
          </>
        )}
      </div>
    </motion.div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[#1d1d1f]">{label}</span>
      <span className="text-[#0071e3] font-semibold">{value}</span>
    </div>
  );
}