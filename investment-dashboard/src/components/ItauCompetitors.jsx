import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Star,
  Users,
  RefreshCw,
  Eye,
  BarChart3,
  Target
} from 'lucide-react';

const ItauCompetitors = () => {
  const [competitorsData, setCompetitorsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);

  const API_BASE_URL = 'https://bff-analyse.vercel.app/api';

  // Apps concorrentes do Itaú
  const competitorApps = [
    {
      app_id: 'br.com.xp.carteira',
      name: 'XP Investimentos',
      category: 'Finanças',
      store: 'google_play'
    },
    {
      app_id: 'com.btg.pactual.digital.mobile',
      name: 'BTG Pactual Investimentos',
      category: 'Finanças',
      store: 'google_play'
    },
    {
      app_id: 'br.com.bb.investimentosbb',
      name: 'Investimentos BB Taxa Zero',
      category: 'Finanças',
      store: 'google_play'
    },
    {
      app_id: 'br.com.rico.mobile',
      name: 'Rico: só vantagem pra investir',
      category: 'Finanças',
      store: 'google_play'
    }
  ];

  useEffect(() => {
    const fetchCompetitorsData = async () => {
      try {
        const competitorsWithData = [];
        
        for (const competitor of competitorApps) {
          try {
            const response = await fetch(`${API_BASE_URL}/apps/${competitor.app_id}?store=${competitor.store}`);
            if (response.ok) {
              const data = await response.json();
              competitorsWithData.push({
                ...competitor,
                ...data,
                id: competitor.app_id
              });
            } else {
              // Se não conseguir buscar dados da API, usar dados básicos
              competitorsWithData.push({
                ...competitor,
                id: competitor.app_id,
                rating: 0,
                total_reviews: 0,
                icon_url: null
              });
            }
          } catch (error) {
            console.error(`Erro ao buscar dados do ${competitor.name}:`, error);
            // Adicionar com dados básicos em caso de erro
            competitorsWithData.push({
              ...competitor,
              id: competitor.app_id,
              rating: 0,
              total_reviews: 0,
              icon_url: null
            });
          }
        }
        
        setCompetitorsData(competitorsWithData);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitorsData();
  }, []);

  const fetchCompetitorAnalysis = async (appId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/apps/${appId}/analysis?store=google_play`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar análise do concorrente:', error);
      return null;
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num?.toString() || '0';
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-yellow-600';
    if (rating >= 3.0) return 'text-orange-600';
    return 'text-red-600';
  };

  const getCompetitorRank = (competitor) => {
    const sortedByRating = [...competitorsData].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return sortedByRating.findIndex(c => c.id === competitor.id) + 1;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#1E3A5F] flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Concorrentes Itaú
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Carregando dados dos concorrentes...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#1E3A5F] flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Concorrentes Itaú
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-8">
            Erro ao carregar dados dos concorrentes
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header da Seção */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-orange-900 flex items-center">
            <Target className="h-6 w-6 mr-2" />
            Análise Competitiva - Concorrentes Itaú
          </CardTitle>
          <p className="text-orange-700">
            Monitoramento dos principais concorrentes no segmento de investimentos
          </p>
        </CardHeader>
      </Card>

      {/* Grid de Concorrentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {competitorsData.map((competitor, index) => (
          <Card key={competitor.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                {competitor.icon_url ? (
                  <img 
                    src={competitor.icon_url} 
                    alt={competitor.name} 
                    className="h-10 w-10 rounded-lg"
                  />
                ) : (
                  <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-gray-500" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-sm leading-tight">{competitor.name}</h3>
                  <Badge variant="outline" className="text-xs mt-1">
                    #{getCompetitorRank(competitor)} Ranking
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Rating */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avaliação:</span>
                  <div className="flex items-center space-x-1">
                    <Star className={`h-4 w-4 ${getRatingColor(competitor.rating)}`} />
                    <span className={`font-medium ${getRatingColor(competitor.rating)}`}>
                      {competitor.rating ? competitor.rating.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Reviews */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Reviews:</span>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">
                      {formatNumber(competitor.total_reviews)}
                    </span>
                  </div>
                </div>

                {/* Categoria */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Categoria:</span>
                  <Badge variant="secondary" className="text-xs">
                    {competitor.category}
                  </Badge>
                </div>

                {/* Botão de Análise */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={() => setSelectedCompetitor(competitor)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Ver Análise
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparativo Resumido */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#1E3A5F] flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Comparativo Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">App</th>
                  <th className="text-center py-2">Avaliação</th>
                  <th className="text-center py-2">Reviews</th>
                  <th className="text-center py-2">Posição</th>
                  <th className="text-center py-2">Tendência</th>
                </tr>
              </thead>
              <tbody>
                {competitorsData
                  .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                  .map((competitor, index) => (
                    <tr key={competitor.id} className="border-b hover:bg-gray-50">
                      <td className="py-3">
                        <div className="flex items-center space-x-2">
                          {competitor.icon_url ? (
                            <img 
                              src={competitor.icon_url} 
                              alt={competitor.name} 
                              className="h-6 w-6 rounded"
                            />
                          ) : (
                            <div className="h-6 w-6 bg-gray-200 rounded"></div>
                          )}
                          <span className="font-medium">{competitor.name}</span>
                        </div>
                      </td>
                      <td className="text-center py-3">
                        <div className="flex items-center justify-center space-x-1">
                          <Star className={`h-3 w-3 ${getRatingColor(competitor.rating)}`} />
                          <span className={getRatingColor(competitor.rating)}>
                            {competitor.rating ? competitor.rating.toFixed(1) : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="text-center py-3">
                        {formatNumber(competitor.total_reviews)}
                      </td>
                      <td className="text-center py-3">
                        <Badge variant={index === 0 ? "default" : "secondary"}>
                          #{index + 1}
                        </Badge>
                      </td>
                      <td className="text-center py-3">
                        {index < 2 ? (
                          <TrendingUp className="h-4 w-4 text-green-500 mx-auto" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights Competitivos */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-blue-900">
            Insights Competitivos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">
                {competitorsData.length}
              </div>
              <p className="text-sm text-blue-700">Concorrentes Monitorados</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">
                {competitorsData.length > 0 ? 
                  (competitorsData.reduce((sum, c) => sum + (c.rating || 0), 0) / competitorsData.length).toFixed(1) : 
                  'N/A'
                }
              </div>
              <p className="text-sm text-blue-700">Avaliação Média</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">
                {formatNumber(competitorsData.reduce((sum, c) => sum + (c.total_reviews || 0), 0))}
              </div>
              <p className="text-sm text-blue-700">Total de Reviews</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ItauCompetitors;

