// src/utils/formatarData.js
import moment from 'moment';
import 'moment/locale/pt-br';

moment.locale('pt-br');

export const formatarDataBrasil = (data, formato = 'completo') => {
  if (!data) return '';
  
  const formatos = {
    completo: 'dddd, D [de] MMMM [de] YYYY',
    diaSemana: 'dddd',
    dataCurta: 'DD/MM/YYYY',
    mesAno: 'MMMM [de] YYYY',
    hora: 'HH:mm',
    diaMes: 'D [de] MMMM',
    mesDia: 'DD/MM',
  };

  try {
    return moment(data).format(formatos[formato] || formato);
  } catch {
    return String(data);
  }
};

// Uso em qualquer lugar:
// formatarDataBrasil(new Date(), 'completo')
// Retorna: "segunda-feira, 16 de março de 2026"