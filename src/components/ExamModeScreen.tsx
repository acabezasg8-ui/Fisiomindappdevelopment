import { useState } from 'react';
import { ArrowLeft, FileText, Upload, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';

type ExamModeScreenProps = {
  onBackToHome: () => void;
  onStartExamCase: (caseText: string, isCustom: boolean) => void;
};

export function ExamModeScreen({ onBackToHome, onStartExamCase }: ExamModeScreenProps) {
  const [selectedMode, setSelectedMode] = useState<'ai' | 'custom' | null>(null);
  const [customCaseText, setCustomCaseText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAICase = async () => {
    setIsGenerating(true);
    try {
      // Llamar al backend para generar caso en formato examen
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación
      onStartExamCase('', false);
      toast.success('Caso de examen generado');
    } catch (error) {
      console.error('Error generating exam case:', error);
      toast.error('Error al generar caso de examen');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartCustomCase = () => {
    if (!customCaseText.trim()) {
      toast.error('Por favor, ingresa el enunciado del caso');
      return;
    }
    
    onStartExamCase(customCaseText, true);
    toast.success('Caso personalizado cargado');
  };

  if (selectedMode === null) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] p-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <Button
            variant="ghost"
            onClick={onBackToHome}
            className="mb-6 text-[#0071e3] hover:bg-[#0071e3]/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl text-[#1d1d1f] font-semibold mb-4">Modo Examen</h1>
            <p className="text-xl text-[#6e6e73] max-w-3xl">
              Practica con casos clínicos en formato examen. Prepárate para aprobar con casos generados por IA o usando ejemplos de tu profesor.
            </p>
          </motion.div>
        </div>

        {/* Opciones */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Opción 1: Casos generados por IA */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="glass shadow-apple-lg rounded-3xl p-8 h-full hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-[#0071e3]/30"
              onClick={() => setSelectedMode('ai')}
            >
              <div className="flex flex-col h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0071e3] to-[#0077ed] flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                
                <h2 className="text-2xl text-[#1d1d1f] font-semibold mb-3">
                  Casos Generados por IA
                </h2>
                
                <p className="text-[#6e6e73] mb-6 flex-grow">
                  La IA creará casos clínicos realistas en formato examen, similares a los que encontrarás en tus evaluaciones. Cada caso incluye datos del paciente, antecedentes y objetivos clínicos.
                </p>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#0071e3] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[#1d1d1f]">Casos ilimitados y variados</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#0071e3] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[#1d1d1f]">Formato profesional de examen</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#0071e3] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[#1d1d1f]">Evaluación automática detallada</span>
                  </div>
                </div>

                <Button className="w-full mt-6 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl h-12">
                  Generar Caso de Examen
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Opción 2: Caso personalizado del profesor */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="glass shadow-apple-lg rounded-3xl p-8 h-full hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-[#34c759]/30"
              onClick={() => setSelectedMode('custom')}
            >
              <div className="flex flex-col h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#34c759] to-[#30d158] flex items-center justify-center mb-6">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                
                <h2 className="text-2xl text-[#1d1d1f] font-semibold mb-3">
                  Caso del Profesor
                </h2>
                
                <p className="text-[#6e6e73] mb-6 flex-grow">
                  Copia y pega el enunciado del caso clínico que te ha proporcionado tu profesor. La IA te ayudará a resolverlo paso a paso, explicándote el razonamiento detrás de cada decisión.
                </p>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#34c759] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[#1d1d1f]">Practica casos específicos</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#34c759] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[#1d1d1f]">Prepárate para tu examen</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#34c759] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[#1d1d1f]">Tutorización personalizada</span>
                  </div>
                </div>

                <Button className="w-full mt-6 bg-[#34c759] hover:bg-[#30d158] text-white rounded-xl h-12">
                  Usar Caso Personalizado
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Pantalla para generar caso con IA
  if (selectedMode === 'ai') {
    return (
      <div className="min-h-screen bg-[#f5f5f7] p-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setSelectedMode(null)}
            className="mb-6 text-[#0071e3] hover:bg-[#0071e3]/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cambiar modo
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass shadow-apple-lg rounded-3xl p-10"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0071e3] to-[#0077ed] flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl text-[#1d1d1f] font-semibold mb-3">
                Generar Caso de Examen
              </h2>
              <p className="text-lg text-[#6e6e73] max-w-2xl mx-auto">
                La IA creará un caso clínico realista en formato examen. Incluirá datos del paciente, antecedentes médicos y objetivos de evaluación, tal como aparecen en los exámenes reales.
              </p>
            </div>

            <div className="bg-[#f5f5f7] rounded-2xl p-6 mb-8">
              <h3 className="text-sm font-semibold text-[#6e6e73] mb-3 uppercase tracking-wide">
                Ejemplo de Formato
              </h3>
              <div className="bg-white rounded-xl p-5 border border-[#d2d2d7]">
                <p className="text-[#1d1d1f] leading-relaxed">
                  <strong>Paciente:</strong> 35 años, oficinista, dolor lumbar que aumenta al final del día.<br/>
                  <strong>Antecedentes:</strong> Sedentarismo, estrés laboral, sin lesiones previas.<br/>
                  <strong>Objetivo:</strong> Identificar posibles causas funcionales y plan de actuación inicial.
                </p>
              </div>
            </div>

            <Button 
              onClick={handleGenerateAICase}
              disabled={isGenerating}
              className="w-full bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl h-14 text-lg"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Generando caso...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generar Caso Aleatorio
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Pantalla para caso personalizado
  if (selectedMode === 'custom') {
    return (
      <div className="min-h-screen bg-[#f5f5f7] p-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setSelectedMode(null)}
            className="mb-6 text-[#0071e3] hover:bg-[#0071e3]/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cambiar modo
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass shadow-apple-lg rounded-3xl p-10"
          >
            <div className="mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#34c759] to-[#30d158] flex items-center justify-center mb-6">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl text-[#1d1d1f] font-semibold mb-3">
                Caso Personalizado del Profesor
              </h2>
              <p className="text-lg text-[#6e6e73]">
                Copia y pega el enunciado completo del caso clínico que te proporcionó tu profesor. La IA analizará el caso y te guiará en el proceso de resolución.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <label className="block">
                <span className="text-sm font-semibold text-[#1d1d1f] mb-2 block">
                  Enunciado del Caso Clínico
                </span>
                <Textarea
                  value={customCaseText}
                  onChange={(e) => setCustomCaseText(e.target.value)}
                  placeholder="Ejemplo:&#10;&#10;Paciente: 45 años, trabajador de almacén, dolor en hombro derecho.&#10;Antecedentes: Sobreesfuerzo hace 3 semanas al levantar carga pesada.&#10;Exploración: Arco doloroso 60-120°, test de Neer positivo.&#10;Objetivo: Diagnóstico diferencial y propuesta de tratamiento."
                  className="min-h-[300px] rounded-xl border-[#d2d2d7] focus:border-[#0071e3] focus:ring-[#0071e3] resize-none"
                />
              </label>
              
              <p className="text-sm text-[#6e6e73] flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Incluye toda la información relevante: datos del paciente, antecedentes, síntomas, exploración y objetivos.
              </p>
            </div>

            <Button 
              onClick={handleStartCustomCase}
              disabled={!customCaseText.trim()}
              className="w-full bg-[#34c759] hover:bg-[#30d158] text-white rounded-xl h-14 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-5 h-5 mr-2" />
              Comenzar con Este Caso
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
}
