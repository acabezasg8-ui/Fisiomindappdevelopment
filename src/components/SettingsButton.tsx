import { useState } from 'react';
import { Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label';
import { Badge } from './ui/badge';

export function SettingsButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button 
          className="relative glass shadow-apple rounded-full w-11 h-11 hover:bg-white/80 border border-[#d2d2d7] inline-flex items-center justify-center transition-colors"
        >
          <Settings className="w-5 h-5 text-[#1d1d1f]" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md glass shadow-apple-lg rounded-3xl border-[#d2d2d7]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#1d1d1f] font-semibold">Configuración</DialogTitle>
          <DialogDescription className="text-[#6e6e73]">
            Información de FisioMind
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[#1d1d1f] font-medium">Modo de Funcionamiento</Label>
              <Badge className="bg-[#34c759]/10 text-[#34c759] border-none">Local</Badge>
            </div>
            <p className="text-sm text-[#6e6e73] leading-relaxed">
              La aplicación funciona completamente en tu navegador. Todos los datos se guardan localmente en tu dispositivo.
            </p>
          </div>

          <div className="border-t border-[#d2d2d7] pt-4 space-y-3">
            <Label className="text-[#1d1d1f] font-medium">Usuario</Label>
            <p className="text-sm text-[#6e6e73]">
              ID: {localStorage.getItem('fisiomind_user_id')?.substring(0, 20)}...
            </p>
            <p className="text-xs text-[#86868b]">
              Tus datos se guardan localmente en tu navegador
            </p>
          </div>

          <div className="border-t border-[#d2d2d7] pt-4 space-y-3">
            <Label className="text-[#1d1d1f] font-medium">Acerca de</Label>
            <p className="text-xs text-[#86868b] leading-relaxed">
              FisioMind es una aplicación educativa para estudiantes de fisioterapia. Practica casos clínicos, prepara exámenes y estudia con contenido interactivo.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
