import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Brain, Mail, Lock, User, GraduationCap } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { login, signup } from '../utils/supabase/client';

type AuthScreenProps = {
  onAuthSuccess: (userId: string, userName: string) => void;
};

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await login(loginEmail, loginPassword);
      
      if (!result) {
        toast.error('Error al iniciar sesión. Por favor intenta de nuevo.');
        return;
      }
      
      toast.success(`¡Bienvenido de nuevo, ${result.userName}!`);
      onAuthSuccess(result.userId, result.userName);
    } catch (error: any) {
      console.error('Error during login:', error);
      // Mostrar el mensaje de error específico del servidor
      const errorMessage = error.message || 'Error al iniciar sesión. Por favor intenta de nuevo.';
      toast.error(errorMessage);
      
      // Si el error es de credenciales inválidas, sugerir registro
      if (errorMessage.includes('incorrectos') || errorMessage.includes('Invalid')) {
        setTimeout(() => {
          toast.info('💡 Si es tu primera vez, haz clic en "Registrarse"', { duration: 5000 });
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (signupPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signup(signupEmail, signupPassword, signupName);
      
      toast.success(`¡Cuenta creada exitosamente! Bienvenido, ${result.userName}`);
      onAuthSuccess(result.userId, result.userName);
    } catch (error: any) {
      console.error('Error during signup:', error);
      toast.error(error.message || 'Error al crear la cuenta. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-400/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass shadow-apple-lg rounded-3xl p-8 md:p-12 max-w-md w-full relative z-10"
      >
        {/* Logo y título */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#0071e3] to-[#0077ed] flex items-center justify-center shadow-lg"
          >
            <Brain className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl text-[#1d1d1f] font-semibold mb-2">FisioMind</h1>
          <p className="text-[#6e6e73]">
            Simulación de casos clínicos con IA
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-[#e8e8ed] rounded-xl">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 px-4 rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white text-[#1d1d1f] shadow-sm'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 px-4 rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-white text-[#1d1d1f] shadow-sm'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            Registrarse
          </button>
        </div>
        
        {/* Banner informativo para nuevos usuarios */}
        {mode === 'signup' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl"
          >
            <p className="text-sm text-blue-900">
              <span className="font-medium">¿Primera vez en FisioMind?</span> Crea tu cuenta para comenzar a practicar con casos clínicos simulados.
            </p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {mode === 'login' ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleLogin}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-[#1d1d1f]">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6e6e73]" />
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="estudiante@example.com"
                    className="pl-11 rounded-xl border-[#d2d2d7] h-12"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-[#1d1d1f]">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6e6e73]" />
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-11 rounded-xl border-[#d2d2d7] h-12"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl mt-6 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
              
              {/* Mensaje de ayuda */}
              <p className="text-center text-sm text-[#6e6e73] mt-4">
                ¿Primera vez? Usa el botón <span className="font-medium text-[#1d1d1f]">Registrarse</span> para crear tu cuenta
              </p>
            </motion.form>
          ) : (
            <motion.form
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSignup}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-[#1d1d1f]">
                  Nombre Completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6e6e73]" />
                  <Input
                    id="signup-name"
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Juan Pérez"
                    className="pl-11 rounded-xl border-[#d2d2d7] h-12"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-[#1d1d1f]">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6e6e73]" />
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="estudiante@example.com"
                    className="pl-11 rounded-xl border-[#d2d2d7] h-12"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-[#1d1d1f]">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6e6e73]" />
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="pl-11 rounded-xl border-[#d2d2d7] h-12"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm" className="text-[#1d1d1f]">
                  Confirmar Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6e6e73]" />
                  <Input
                    id="signup-confirm"
                    type="password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="Confirma tu contraseña"
                    className="pl-11 rounded-xl border-[#d2d2d7] h-12"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#34c759] hover:bg-[#30d158] text-white rounded-xl mt-6 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Crear Cuenta
                  </>
                )}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-[#6e6e73]">
          <p>
            Al registrarte aceptas que tus datos de aprendizaje se guarden
            <br />
            de forma segura para tu progreso personalizado
          </p>
        </div>
      </motion.div>
    </div>
  );
}