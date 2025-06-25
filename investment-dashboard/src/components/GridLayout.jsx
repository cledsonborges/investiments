import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const GridLayout = () => {
  // Dados simulados baseados na imagem anexada
  const gridData = [
    // Linha 1
    { value: '17.6', status: 'positive', titles: true, texts: true, bgColor: 'bg-slate-800', borderColor: 'border-slate-800' },
    { value: '13.8', status: 'positive', titles: true, texts: true, bgColor: 'bg-slate-800', borderColor: 'border-slate-800' },
    { value: '1.8', status: 'negative', titles: true, texts: true, bgColor: 'bg-lime-400', borderColor: 'border-lime-400' },
    { value: '1.6', status: 'negative', titles: true, texts: true, bgColor: 'bg-gray-300', borderColor: 'border-gray-300' },
    { value: '1.6', status: 'negative', titles: true, texts: true, bgColor: 'bg-gray-400', borderColor: 'border-gray-400' },
    { value: '3', status: 'positive', titles: true, texts: true, bgColor: 'bg-orange-500', borderColor: 'border-orange-500' },
    
    // Linha 2
    { value: '10.9', status: 'positive', titles: true, texts: true, bgColor: 'bg-slate-800', borderColor: 'border-slate-800' },
    { value: '8.5', status: 'positive', titles: true, texts: true, bgColor: 'bg-slate-800', borderColor: 'border-slate-800' },
    { value: '1.1', status: 'negative', titles: true, texts: true, bgColor: 'bg-lime-400', borderColor: 'border-lime-400' },
    { value: '1.1', status: 'negative', titles: true, texts: true, bgColor: 'bg-lime-400', borderColor: 'border-lime-400' },
    { value: '1.8', status: 'negative', titles: true, texts: true, bgColor: 'bg-lime-400', borderColor: 'border-lime-400' },
    { value: '1.8', status: 'negative', titles: true, texts: true, bgColor: 'bg-orange-500', borderColor: 'border-orange-500' },
    
    // Linha 3
    { value: '9.6', status: 'positive', titles: true, texts: true, bgColor: 'bg-lime-400', borderColor: 'border-lime-400' },
    { value: '7.5', status: 'positive', titles: true, texts: true, bgColor: 'bg-lime-400', borderColor: 'border-lime-400' },
    { value: '7.5', status: 'positive', titles: true, texts: true, bgColor: 'bg-slate-800', borderColor: 'border-slate-800' },
    { value: '8.5', status: 'positive', titles: true, texts: true, bgColor: 'bg-slate-800', borderColor: 'border-slate-800' },
    { value: '13.8', status: 'positive', titles: true, texts: true, bgColor: 'bg-slate-800', borderColor: 'border-slate-800' },
    { value: '1.6', status: 'negative', titles: true, texts: true, bgColor: 'bg-lime-400', borderColor: 'border-orange-500' },
    
    // Linha 4
    { value: '1.2', status: 'negative', titles: true, texts: true, bgColor: 'bg-slate-800', borderColor: 'border-slate-800' },
    { value: '1.2', status: 'negative', titles: true, texts: true, bgColor: 'bg-slate-800', borderColor: 'border-slate-800' },
    { value: '9.6', status: 'positive', titles: true, texts: true, bgColor: 'bg-lime-400', borderColor: 'border-lime-400' },
    { value: '10.9', status: 'positive', titles: true, texts: true, bgColor: 'bg-slate-800', borderColor: 'border-slate-800' },
    { value: '17.6', status: 'positive', titles: true, texts: true, bgColor: 'bg-slate-800', borderColor: 'border-slate-800' },
    { value: '4.5', status: 'positive', titles: true, texts: true, bgColor: 'bg-slate-800', borderColor: 'border-orange-500' },
    
    // Linha 5
    { value: '5.7', status: 'positive', titles: true, texts: true, bgColor: 'bg-orange-500', borderColor: 'border-orange-500' },
    { value: '4.5', status: 'positive', titles: true, texts: true, bgColor: 'bg-orange-500', borderColor: 'border-orange-500' },
    { value: '1.6', status: 'negative', titles: true, texts: true, bgColor: 'bg-orange-500', borderColor: 'border-lime-400' },
    { value: '1.8', status: 'negative', titles: true, texts: true, bgColor: 'bg-orange-500', borderColor: 'border-orange-500' },
    { value: '3', status: 'positive', titles: true, texts: true, bgColor: 'bg-orange-500', borderColor: 'border-orange-500' },
    { value: '5.7', status: 'positive', titles: true, texts: true, bgColor: 'bg-slate-800', borderColor: 'border-orange-500' },
  ];

  const getStatusIcon = (status) => {
    return status === 'positive' ? (
      <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
      </div>
    ) : (
      <div className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
      </div>
    );
  };

  return (
    <div className="w-full p-6">
      <div className="grid grid-cols-6 gap-4 max-w-7xl mx-auto">
        {gridData.map((item, index) => (
          <Card 
            key={index} 
            className={`relative overflow-hidden ${item.borderColor} border-4 bg-white hover:shadow-lg transition-shadow duration-200`}
          >
            {/* Barra colorida superior */}
            <div className={`h-8 ${item.bgColor} relative`}>
              <div className="absolute inset-0 bg-white/20"></div>
            </div>
            
            {/* Conteúdo principal */}
            <CardContent className="p-4 text-center">
              {/* Valor principal */}
              <div className="text-2xl font-bold text-gray-800 mb-3">
                {item.value}
              </div>
              
              {/* Indicadores */}
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  {getStatusIcon(item.status)}
                  <span className="text-xs text-gray-600">títulos</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  {getStatusIcon(item.status)}
                  <span className="text-xs text-gray-600">textos/ícones</span>
                </div>
              </div>
            </CardContent>
            
            {/* Barra colorida inferior */}
            <div className={`h-8 ${item.bgColor} relative`}>
              <div className="absolute inset-0 bg-black/10"></div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GridLayout;

