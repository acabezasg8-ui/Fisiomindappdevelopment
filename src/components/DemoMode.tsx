import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { CheckCircle2, XCircle, ArrowRight, Sparkles, ChevronRight, MessageSquare, FileText, ClipboardList } from 'lucide-react';
import { CaseSimulation } from './CaseSimulation';
import type { CaseData, EvaluationResult } from '../App';
import { generateRandomCase } from '../utils/clinicalFrameworks';

type DemoStage = 'welcome' | 'simulation' | 'diagnosis' | 'evaluation' | 'progress' | 'complete';

type SimplifiedEvaluation = {
  anamnesis: 'correcto' | 'incompleto';
  exploracion: 'correcto' | 'incompleto';
  diagnostico: 'correcto' | 'incorrecto';
};

type CompletedCase = {
  caseData: any;
  chatHistory: Array<{ role: 'student' | 'patient'; message: string }>;
  notes: string;
  userDiagnosis: string;
  evaluation: SimplifiedEvaluation;
};

type DemoModeProps = {
  onExit: () => void;
};

export function DemoMode({ onExit }: DemoModeProps) {
  const [stage, setStage] = useState<DemoStage>('welcome');
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [currentCase, setCurrentCase] = useState<CaseData | null>(null);
  const [completedCases, setCompletedCases] = useState<CompletedCase[]>([]);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'student' | 'patient'; message: string }>>([]);
  const [notes, setNotes] = useState('');
  const [userDiagnosis, setUserDiagnosis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);

  const TOTAL_DEMO_CASES = 3;

  const handleStartCase = async () => {
    setIsLoading(true);
    try {
      const newCase = await generateRandomCase();
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
    setUserDiagnosis(''); // Reset diagnosis for new case
    setStage('diagnosis'); // Go to diagnosis stage first
  };

  const handleSubmitDiagnosis = () => {
    // Generar evaluación simplificada
    const evaluation = generateSimplifiedEvaluation(chatHistory, notes, userDiagnosis);
    setCompletedCases([...completedCases, { 
      caseData: currentCase, 
      chatHistory, 
      notes, 
      userDiagnosis,
      evaluation 
    }]);
    setStage('evaluation');
  };

  const generateSimplifiedEvaluation = (
    history: Array<{ role: 'student' | 'patient'; message: string }>,
    notes: string,
    diagnosis: string
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
    
    // Evaluar diagnóstico (si mencionaron la patología correcta en el diagnóstico escrito)
    const pathologyLower = (currentCase?.pathology || '').toLowerCase();
    const diagnosisLower = diagnosis.toLowerCase();
    
    // Extraer palabras clave del diagnóstico correcto
    const pathologyKeywords = pathologyLower.split(/\s+/);
    const hasDiagnosis = pathologyKeywords.some(keyword => 
      keyword.length > 4 && diagnosisLower.includes(keyword)
    );
    
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
      // Al completar el último caso, mostrar pantalla de progreso
      setStage('progress');
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

  if (stage === 'diagnosis') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f5f5f7] to-white flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl w-full"
        >
          <Card className="p-12 bg-white/80 backdrop-blur-xl border-[#d2d2d7] shadow-2xl">
            <div className="space-y-8">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#0071e3] to-[#005bb5] mb-6">
                  <ClipboardList className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-4xl font-semibold text-[#1d1d1f] tracking-tight mb-4">
                  Conclusión clínica
                </h2>
                
                <p className="text-lg text-[#6e6e73] leading-relaxed max-w-xl mx-auto">
                  Formula tu hipótesis diagnóstica en base a la información recogida durante la anamnesis y exploración
                </p>
              </motion.div>

              {/* Resumen del caso */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#f5f5f7] rounded-2xl p-6 space-y-3"
              >
                <h3 className="text-sm font-medium text-[#6e6e73] uppercase tracking-wide">
                  Datos del paciente
                </h3>
                <div className="text-[#1d1d1f]">
                  <p><span className="font-semibold">Nombre:</span> {currentCase?.patientName}</p>
                  <p><span className="font-semibold">Edad:</span> {currentCase?.age} años</p>
                  <p><span className="font-semibold">Ocupación:</span> {currentCase?.occupation}</p>
                  <p><span className="font-semibold">Motivo de consulta:</span> "{currentCase?.chiefComplaint}"</p>
                </div>
              </motion.div>

              {/* Campo de diagnóstico */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <label className="block">
                  <span className="text-base font-medium text-[#1d1d1f] mb-2 block">
                    Tu diagnóstico clínico
                  </span>
                  <textarea
                    value={userDiagnosis}
                    onChange={(e) => setUserDiagnosis(e.target.value)}
                    placeholder="Escribe tu hipótesis diagnóstica basada en los hallazgos de anamnesis y exploración física..."
                    className="w-full min-h-[120px] px-4 py-3 rounded-xl border-2 border-[#d2d2d7] focus:border-[#0071e3] focus:outline-none bg-white text-[#1d1d1f] placeholder:text-[#86868b] resize-none transition-colors"
                  />
                </label>
                
                <p className="text-sm text-[#6e6e73] italic">
                  Ejemplo: "Lumbalgia mecánica aguda por sobrecarga postural"
                </p>
              </motion.div>

              {/* Botón enviar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="pt-4"
              >
                <Button
                  onClick={handleSubmitDiagnosis}
                  disabled={!userDiagnosis.trim()}
                  className="w-full px-8 py-6 text-lg bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Enviar diagnóstico
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (stage === 'evaluation') {
    const lastCase = completedCases[completedCases.length - 1];
    const evaluation = lastCase.evaluation;
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f5f5f7] to-white flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl w-full"
        >
          <Card className="p-12 bg-white/80 backdrop-blur-xl border-[#d2d2d7] shadow-2xl">
            <div className="space-y-8">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 mb-4"
                >
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </motion.div>
                
                <h2 className="text-3xl font-semibold text-[#1d1d1f]">
                  Evaluación del caso
                </h2>
              </div>

              {/* Comparación de diagnósticos */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#f5f5f7] rounded-2xl p-6 space-y-4"
              >
                <h3 className="text-sm font-medium text-[#6e6e73] uppercase tracking-wide">
                  Razonamiento clínico
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-[#6e6e73] mb-1">Tu diagnóstico:</p>
                    <p className="text-base text-[#1d1d1f] font-medium bg-white rounded-lg p-3">
                      {lastCase.userDiagnosis}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-[#6e6e73] mb-1">Diagnóstico correcto:</p>
                    <p className={`text-base font-medium rounded-lg p-3 ${
                      evaluation.diagnostico === 'correcto' 
                        ? 'text-green-700 bg-green-50' 
                        : 'text-[#1d1d1f] bg-white'
                    }`}>
                      {lastCase.caseData.pathology}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Evaluación de competencias */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#1d1d1f] text-center">
                  Evaluación de competencias
                </h3>
                
                <EvaluationItem
                  label="Calidad de la anamnesis"
                  status={evaluation.anamnesis}
                />
                <EvaluationItem
                  label="Uso de exploración física"
                  status={evaluation.exploracion}
                />
                <EvaluationItem
                  label="Coherencia del diagnóstico"
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
                  className="w-full px-8 py-6 text-lg bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full shadow-lg hover:shadow-xl transition-all"
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

  if (stage === 'progress') {
    const selectedCase = completedCases[selectedCaseIndex];
    const correctAnamnesis = completedCases.filter(c => c.evaluation.anamnesis === 'correcto').length;
    const correctExploracion = completedCases.filter(c => c.evaluation.exploracion === 'correcto').length;
    const correctDiagnostico = completedCases.filter(c => c.evaluation.diagnostico === 'correcto').length;

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f5f5f7] to-white p-6">
        <div className="max-w-6xl mx-auto py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-semibold text-[#1d1d1f] tracking-tight mb-4">
              Progreso del Demo
            </h1>
            <p className="text-lg text-[#6e6e73]">
              Repasa tus respuestas y evaluación de los {TOTAL_DEMO_CASES} casos completados
            </p>
          </motion.div>

          {/* Tabs de casos */}
          <div className="flex gap-2 mb-6 justify-center">
            {completedCases.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedCaseIndex(index)}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  selectedCaseIndex === index
                    ? 'bg-[#0071e3] text-white shadow-lg'
                    : 'bg-white text-[#6e6e73] hover:bg-[#f5f5f7]'
                }`}
              >
                Caso {index + 1}
              </button>
            ))}
          </div>

          <motion.div
            key={selectedCaseIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Información del caso */}
            <Card className="p-6 bg-white/80 backdrop-blur-xl border-[#d2d2d7]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0071e3] to-[#005bb5] flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-[#1d1d1f]">
                    {selectedCase.caseData.patientName}
                  </h2>
                  <p className="text-sm text-[#6e6e73]">
                    {selectedCase.caseData.age} años • {selectedCase.caseData.gender} • {selectedCase.caseData.occupation}
                  </p>
                </div>
              </div>
              <div className="bg-[#f5f5f7] rounded-xl p-4">
                <p className="text-sm font-medium text-[#6e6e73] mb-1">Diagnóstico</p>
                <p className="text-lg text-[#1d1d1f] font-medium">{selectedCase.caseData.pathology}</p>
              </div>
            </Card>

            {/* Diagnóstico y Evaluación */}
            <Card className="p-6 bg-white/80 backdrop-blur-xl border-[#d2d2d7]">
              <h3 className="text-xl font-semibold text-[#1d1d1f] mb-4">Razonamiento diagnóstico</h3>
              
              <div className="bg-[#f5f5f7] rounded-xl p-4 mb-4 space-y-3">
                <div>
                  <p className="text-sm font-medium text-[#6e6e73] mb-1">Tu diagnóstico:</p>
                  <p className="text-base text-[#1d1d1f]">{selectedCase.userDiagnosis}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#6e6e73] mb-1">Diagnóstico correcto:</p>
                  <p className={`text-base font-medium ${
                    selectedCase.evaluation.diagnostico === 'correcto' 
                      ? 'text-green-600' 
                      : 'text-[#1d1d1f]'
                  }`}>
                    {selectedCase.caseData.pathology}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-[#6e6e73] uppercase tracking-wide">
                  Evaluación de competencias
                </h4>
                <EvaluationItem
                  label="Calidad de la anamnesis"
                  status={selectedCase.evaluation.anamnesis}
                />
                <EvaluationItem
                  label="Uso de exploración física"
                  status={selectedCase.evaluation.exploracion}
                />
                <EvaluationItem
                  label="Coherencia del diagnóstico"
                  status={selectedCase.evaluation.diagnostico}
                />
              </div>
            </Card>

            {/* Historial de chat */}
            <Card className="p-6 bg-white/80 backdrop-blur-xl border-[#d2d2d7]">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-[#0071e3]"/>
                <h3 className="text-xl font-semibold text-[#1d1d1f]">Conversación con el paciente</h3>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedCase.chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl ${
                      msg.role === 'student'
                        ? 'bg-[#0071e3] text-white ml-8'
                        : 'bg-[#f5f5f7] text-[#1d1d1f] mr-8'
                    }`}
                  >
                    <p className="text-sm font-medium mb-1">
                      {msg.role === 'student' ? 'Tú' : selectedCase.caseData.patientName}
                    </p>
                    <p>{msg.message}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Notas */}
            {selectedCase.notes && (
              <Card className="p-6 bg-white/80 backdrop-blur-xl border-[#d2d2d7]">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-[#0071e3]"/>
                  <h3 className="text-xl font-semibold text-[#1d1d1f]">Tus notas</h3>
                </div>
                <div className="bg-[#f5f5f7] rounded-xl p-4">
                  <p className="text-[#1d1d1f] whitespace-pre-wrap">{selectedCase.notes}</p>
                </div>
              </Card>
            )}
          </motion.div>

          {/* Botón continuar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <Button
              onClick={() => setStage('complete')}
              className="px-8 py-6 text-lg bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              Continuar
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (stage === 'complete') {
    const correctAnamnesis = completedCases.filter(c => c.evaluation.anamnesis === 'correcto').length;
    const correctExploracion = completedCases.filter(c => c.evaluation.exploracion === 'correcto').length;
    const correctDiagnostico = completedCases.filter(c => c.evaluation.diagnostico === 'correcto').length;

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
                Has completado {TOTAL_DEMO_CASES} casos clínicos con IA
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