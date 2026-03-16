import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Send, Edit, User, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/services/api';
import ModalOpcoesAnamnese from './ModalOpcoesAnamnese';

export default function ClienteCard({ cliente, onEdit, onAgendamento, onAnamnese }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [linkGerado, setLinkGerado] = useState('');

  const handleEnviarAnamnese = async () => {
    try {
      const toastId = toast.loading('Gerando link da anamnese...');
      
      const response = await api.gerarTokenAnamnese(cliente.id);
      const link = response.link;
      
      setLinkGerado(link);
      setModalOpen(true);
      
      toast.success('Link gerado!', {
        id: toastId,
        description: 'Escolha como deseja enviar.',
        duration: 3000,
      });

    } catch (error) {
      console.error('Erro ao gerar link:', error);
      toast.error('Erro ao gerar link', {
        description: error.message || 'Tente novamente mais tarde.',
      });
    }
  };

  return (
    <>
      <Card className="border-0 shadow-sm hover:shadow-md transition-all group">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
              <User className="w-6 h-6 text-purple-600" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{cliente.nome}</h3>
              
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <Phone className="w-3 h-3" />
                <span className="truncate">{cliente.telefone || 'Não informado'}</span>
              </div>
              
              {cliente.email && (
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{cliente.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center justify-end gap-1 mt-4 pt-3 border-t border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAgendamento(cliente)}
              className="text-gray-400 hover:text-purple-600"
              title="Novo agendamento"
            >
              <Calendar className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAnamnese(cliente)}
              className="text-gray-400 hover:text-blue-600"
              title="Histórico de anamnese"
            >
              <FileText className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleEnviarAnamnese}
              className="text-gray-400 hover:text-green-600"
              title="Enviar link da anamnese"
            >
              <Send className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(cliente)}
              className="text-gray-400 hover:text-blue-600"
              title="Editar cliente"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de opções */}
      <ModalOpcoesAnamnese
        open={modalOpen}
        onOpenChange={setModalOpen}
        link={linkGerado}
        cliente={cliente}
      />
    </>
  );
}