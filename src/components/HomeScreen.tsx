import { useState, useEffect } from 'react';
import { TrendingUp, Stethoscope, GraduationCap, LogOut, User, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { SettingsButton } from './SettingsButton';
import { Badge } from './ui/badge';

type HomeScreenProps = {
  onStartNewCase: () => void;
  onStartExamMode: () => void;
  onViewProgress: () => void;
  onStartFisioStudy: () => void;
  onLogout: () => void;
  completedCasesCount: number;
  userName: string;
  isLoading?: boolean;
};

const motivationalPhrases = [
  "No tratas músculos. Acompañas personas.",
  "Tu empatía puede aliviar más que tus manos.",
  "Cada paciente es una historia esperando ser entendida.",
  "El cuerpo habla, y tú estás aprendiendo a escucharlo.",
  "Comprender el dolor es el primer paso para aliviarlo.",
  "El toque más terapéutico es el que nace del entendimiento.",
  "Escuchar también forma parte del tratamiento.",
  "Siente, razona, actúa: eso es ser fisioterapeuta.",
  "Cada error te enseña a mirar con más precisión.",
  "Hoy practicas. Mañana transformas vidas.",
  "No pares hasta entender el porqué de cada movimiento.",
  "El esfuerzo invisible también cuenta.",
  "La excelencia no se alcanza, se entrena.",
  "Tu mejor herramienta es la constancia."
];

export function HomeScreen({ onStartNewCase, onStartExamMode, onViewProgress, onStartFisioStudy, onLogout, completedCasesCount, userName, isLoading }: HomeScreenProps) {
  const [showContent, setShowContent] = useState(false);
  const [randomPhrase, setRandomPhrase] = useState('');

  useEffect(() => {
    // Seleccionar frase aleatoria
    const phrase = motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)];
    setRandomPhrase(phrase);

    // Mostrar contenido después de la animación del título
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f5f5f7] relative overflow-hidden">
      {/* Background blur effects - Apple style */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
      
      {/* Header con usuario y settings */}
      <motion.div
        className="absolute top-6 left-0 right-0 px-6 z-50 flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.3 }}
      >
        <div className="glass rounded-2xl px-4 py-2 flex items-center gap-3 shadow-apple">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0071e3] to-[#0077ed] flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-[#1d1d1f] font-medium">{userName}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <SettingsButton />
          <Button
            onClick={onLogout}
            variant="ghost"
            className="glass rounded-2xl px-4 py-2 hover:bg-[#ff3b30]/10 text-[#ff3b30] shadow-apple"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </motion.div>
      
      <div className="max-w-5xl w-full space-y-12 relative z-10">
        {/* Título animado */}
        <div className="text-center space-y-6">
          <motion.h1
            className="text-[#1d1d1f] tracking-tight"
            initial={{ fontSize: "8rem", fontWeight: 700, letterSpacing: "-0.05em" }}
            animate={{ fontSize: "4.5rem", fontWeight: 600, letterSpacing: "-0.02em" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            style={{ lineHeight: 1 }}
          >
            FisioMind
          </motion.h1>
          
          {/* Frase motivadora */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex items-center justify-center"
          >
            <p className="text-lg text-[#6e6e73] font-normal max-w-2xl text-center">
              {randomPhrase}
            </p>
          </motion.div>
        </div>

        {/* Tarjetas de acción - Apple style */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 30 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {/* Card Nuevo Caso */}
          <motion.div
            whileHover={{ scale: 1.02, y: -6 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="glass shadow-apple-lg rounded-3xl p-10 h-full">
              <div className="space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl text-[#1d1d1f] font-semibold">Simulación Libre</h2>
                  <p className="text-[#6e6e73] leading-relaxed">
                    Practica con un paciente virtual. Interactúa, explora y aprende sin presión.
                  </p>
                </div>
                <Button
                  onClick={onStartNewCase}
                  className="w-full bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-2xl h-14 text-base font-medium shadow-lg hover:shadow-xl transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? 'Generando...' : 'Comenzar'}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Card Modo Examen */}
          <motion.div
            whileHover={{ scale: 1.02, y: -6 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="glass shadow-apple-lg rounded-3xl p-10 h-full">
              <div className="space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl text-[#1d1d1f] font-semibold">Modo Examen</h2>
                  <p className="text-[#6e6e73] leading-relaxed">
                    Resuelve casos en formato examen con ayuda del tutor IA. Prepárate para aprobar.
                  </p>
                </div>
                <Button
                  onClick={onStartExamMode}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl h-14 text-base font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Ir a Examen
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Card FisioStudy */}
          <motion.div
            whileHover={{ scale: 1.02, y: -6 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="glass shadow-apple-lg rounded-3xl p-10 h-full">
              <div className="space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl text-[#1d1d1f] font-semibold">FisioStudy</h2>
                  <p className="text-[#6e6e73] leading-relaxed">
                    Entiende la teoría como nunca antes con tu tutor IA personalizado.
                  </p>
                </div>
                <Button
                  onClick={onStartFisioStudy}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl h-14 text-base font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Estudiar Teoría
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Card Progreso */}
          <motion.div
            whileHover={{ scale: 1.02, y: -6 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="glass shadow-apple-lg rounded-3xl p-10 h-full">
              <div className="space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl text-[#1d1d1f] font-semibold">Mi Progreso</h2>
                  <p className="text-[#6e6e73] leading-relaxed">
                    Revisa tus casos completados y observa tu evolución como futuro profesional.
                  </p>
                </div>
                <div className="flex items-baseline gap-3 pb-4">
                  <motion.span
                    className="text-5xl text-green-600 font-semibold"
                    initial={{ scale: 0 }}
                    animate={{ scale: showContent ? 1 : 0 }}
                    transition={{ type: "spring", stiffness: 200, delay: 1 }}
                  >
                    {completedCasesCount}
                  </motion.span>
                  <span className="text-[#6e6e73]">casos completados</span>
                </div>
                <Button
                  onClick={onViewProgress}
                  className="w-full bg-white hover:bg-gray-50 text-[#1d1d1f] rounded-2xl h-14 text-base font-medium border-2 border-[#d2d2d7] shadow-sm hover:shadow transition-all"
                >
                  Ver Progreso
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Footer minimalista */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showContent ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="text-center"
        >
          <div className="glass rounded-3xl p-6 shadow-apple inline-block">
            <p className="text-sm text-[#6e6e73]">
              Simulaciones clínicas con inteligencia artificial
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
