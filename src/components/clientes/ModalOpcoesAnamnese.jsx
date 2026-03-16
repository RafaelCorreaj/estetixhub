import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, MessageCircle, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ModalOpcoesAnamnese({ open, onOpenChange, link, cliente }) {

  const handleCopiarLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link copiado!', {
        description: 'Link da anamnese copiado para área de transferência.',
        duration: 3000,
      });
      onOpenChange(false);
    } catch (error) {
      toast.error('Erro ao copiar', {
        description: 'Não foi possível copiar o link.',
      });
    }
  };

  const handleEnviarWhatsApp = () => {
    const telefone = cliente.telefone?.replace(/\D/g, '') || '';
    
    if (!telefone) {
      toast.error('Cliente sem telefone', {
        description: 'Cadastre um telefone para enviar por WhatsApp.',
      });
      return;
    }

    const mensagem = `Olá ${cliente.nome}, por favor preencha sua ficha de anamnese: ${link}`;
    window.open(`https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`, '_blank');
    toast.success('WhatsApp aberto!', {
      description: 'Mensagem preparada com o link.',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Enviar Anamnese
          </DialogTitle>
          <DialogDescription>
            Escolha como deseja enviar o link para {cliente?.nome}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Opção 1: Copiar link */}
          <div 
            onClick={handleCopiarLink}
            className="flex items-center gap-4 p-4 rounded-lg border-2 border-gray-100 hover:border-purple-200 hover:bg-purple-50 cursor-pointer transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Copy className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Copiar link</h3>
              <p className="text-sm text-gray-500">Copia o link para área de transferência</p>
            </div>
          </div>

          {/* Opção 2: Enviar WhatsApp */}
          <div 
            onClick={handleEnviarWhatsApp}
            className="flex items-center gap-4 p-4 rounded-lg border-2 border-gray-100 hover:border-green-200 hover:bg-green-50 cursor-pointer transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">WhatsApp</h3>
              <p className="text-sm text-gray-500">
                {cliente.telefone 
                  ? `Enviar para ${cliente.telefone}`
                  : 'Cliente sem telefone cadastrado'}
              </p>
            </div>
          </div>

          {/* Link de exemplo */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Link gerado:</p>
            <p className="text-sm text-gray-600 break-all">{link}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}