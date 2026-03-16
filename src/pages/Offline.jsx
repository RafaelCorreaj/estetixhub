import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-10 h-10 text-purple-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Você está offline
        </h1>
        
        <p className="text-gray-600 mb-6">
          Não foi possível conectar à internet. 
          Verifique sua conexão e tente novamente.
        </p>
        
        <div className="space-y-3">
          <Button 
            onClick={() => window.location.reload()}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
          
          <p className="text-sm text-gray-500">
            Dados salvos localmente serão sincronizados 
            automaticamente quando a conexão for restabelecida.
          </p>
        </div>
      </div>
    </div>
  );
}