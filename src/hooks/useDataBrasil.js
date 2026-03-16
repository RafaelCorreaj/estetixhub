// src/hooks/useDataBrasil.js
import { useMemo } from 'react';
import moment from 'moment';
import 'moment/locale/pt-br';

// Configurar moment uma única vez
moment.locale('pt-br');

export function useDataBrasil() {
  const formatos = useMemo(() => ({
    // Formatos com moment (já em português)
    moment: {
      completa: (data) => moment(data).format('dddd, D [de] MMMM [de] YYYY'),
      diaSemana: (data) => moment(data).format('dddd'),
      dataCurta: (data) => moment(data).format('DD/MM/YYYY'),
      mesAno: (data) => moment(data).format('MMMM [de] YYYY'),
      hora: (data) => moment(data).format('HH:mm'),
      diaMes: (data) => moment(data).format('D [de] MMMM'),
    },
    // Formatos com Intl (fallback)
    intl: {
      completa: (data) => new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(new Date(data)),
      diaSemana: (data) => new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long'
      }).format(new Date(data)),
      dataCurta: (data) => new Intl.DateTimeFormat('pt-BR').format(new Date(data)),
    }
  }), []);

  const formatarData = (data, formato = 'completa') => {
    try {
      // Tenta com moment primeiro
      return formatos.moment[formato]?.(data) || formatos.intl[formato]?.(data) || data;
    } catch (error) {
      // Fallback para Intl
      return formatos.intl[formato]?.(data) || data;
    }
  };

  return { formatarData };
}