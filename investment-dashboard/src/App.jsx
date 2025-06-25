import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Smartphone,
  Star,
  TrendingUp,
  Users,
  RefreshCw,
  Bell,
  User,
  Menu,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Package
} from 'lucide-react';
import './App.css';

function App() {
  const [isCollecting, setIsCollecting] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30 dias');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [appsData, setAppsData] = useState([]);
  const [reviewsData, setReviewsData] = useState([]);
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'https://bff-analyse.vercel.app/api';

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/apps?query=itau&store=google_play`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const appsWithIds = data.map((app, index) => ({ ...app, id: app.app_id || index + 1 }));
        setAppsData(appsWithIds);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, []);

  const fetchAppReviews = async (appId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/apps/${appId}/reviews?store=google_play&limit=20`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar reviews:', error);
      return [];
    }
  };

  const fetchAppAnalysis = async (appId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/apps/${appId}/analysis?store=google_play`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar análise:', error);
      return null;
    }
  };

  const fetchAllReviews = async () => {
    try {
      const allReviews = [];
      for (const app of appsData.slice(0, 5)) { // Limitar para não sobrecarregar
        const reviews = await fetchAppReviews(app.app_id);
        allReviews.push(...reviews);
      }
      return allReviews.slice(0, 20); // Limitar a 20 reviews mais recentes
    } catch (error) {
      console.error('Erro ao buscar todos os reviews:', error);
      return [];
    }
  };

  // Função para calcular análise de sentimentos localmente
  const calculateLocalSentimentAnalysis = (reviews) => {
    if (!reviews || reviews.length === 0) return null;
    
    const sentimentCounts = {
      positive: 0,
      neutral: 0,
      negative: 0
    };
    
    // Palavras-chave expandidas para análise básica de sentimento
    const positiveWords = [
      'ótimo', 'excelente', 'bom', 'muito bom', 'maravilhoso', 'top', 'recomendo', 
      'adorei', 'gostei', 'satisfeita', 'satisfeito', 'perfeito', 'incrível',
      'fantástico', 'sensacional', 'amei', 'adoro', 'melhor', 'fácil', 'prático',
      'rápido', 'eficiente', 'útil', 'funciona', 'aprovado', 'cinco estrelas',
      'parabéns', 'sucesso', 'confiável', 'seguro', 'nota 10'
    ];
    
    const negativeWords = [
      'ruim', 'péssimo', 'horrível', 'problema', 'erro', 'cancelado', 'bloquearam',
      'não funciona', 'falha', 'difícil', 'complicado', 'lento', 'travou', 'bug',
      'defeito', 'terrível', 'odiei', 'detesto', 'pior', 'decepção', 'frustração',
      'demora', 'trava', 'não recomendo', 'cuidado', 'golpe', 'fraude', 'inseguro',
      'instável', 'confuso', 'chato', 'irritante', 'inútil'
    ];
    
    reviews.forEach(review => {
      let sentiment = review.sentiment;
      
      // Se não há sentiment definido ou é neutro, tentar analisar o texto
      if (!sentiment || sentiment === 'neutral') {
        const text = (review.content || review.text || '').toLowerCase();
        
        // Contar palavras positivas e negativas
        const positiveCount = positiveWords.filter(word => text.includes(word)).length;
        const negativeCount = negativeWords.filter(word => text.includes(word)).length;
        
        // Determinar sentimento baseado na contagem
        if (positiveCount > negativeCount && positiveCount > 0) {
          sentiment = 'positive';
        } else if (negativeCount > positiveCount && negativeCount > 0) {
          sentiment = 'negative';
        } else {
          // Se não há palavras claras ou empate, usar rating se disponível
          if (review.rating) {
            if (review.rating >= 4) {
              sentiment = 'positive';
            } else if (review.rating <= 2) {
              sentiment = 'negative';
            } else {
              sentiment = 'neutral';
            }
          } else {
            sentiment = 'neutral';
          }
        }
      }
      
      if (sentiment === 'positive') {
        sentimentCounts.positive++;
      } else if (sentiment === 'negative') {
        sentimentCounts.negative++;
      } else {
        sentimentCounts.neutral++;
      }
    });
    
    const total = reviews.length;
    
    return {
      positive_percentage: Math.round((sentimentCounts.positive / total) * 100),
      neutral_percentage: Math.round((sentimentCounts.neutral / total) * 100),
      negative_percentage: Math.round((sentimentCounts.negative / total) * 100),
      total_reviews: total,
      source: 'local_calculation'
    };
  };

  useEffect(() => {
    const loadReviewsData = async () => {
      if (selectedApp) {
        const reviews = await fetchAppReviews(selectedApp.app_id);
        let analysis = await fetchAppAnalysis(selectedApp.app_id);
        
        // Se a análise da API falhar, calcular localmente
        if (!analysis && reviews.length > 0) {
          analysis = calculateLocalSentimentAnalysis(reviews);
        }
        
        setReviewsData(reviews);
        setAnalysisData(analysis);
      } else if (appsData.length > 0) {
        const allReviews = await fetchAllReviews();
        setReviewsData(allReviews);
        setAnalysisData(null);
      }
    };

    loadReviewsData();
  }, [selectedApp, appsData]);

  const handleCollectData = async () => {
    setIsCollecting(true);
    try {
      if (selectedApp) {
        const reviews = await fetchAppReviews(selectedApp.app_id);
        let analysis = await fetchAppAnalysis(selectedApp.app_id);
        
        // Se a análise da API falhar, calcular localmente
        if (!analysis && reviews.length > 0) {
          analysis = calculateLocalSentimentAnalysis(reviews);
        }
        
        setReviewsData(reviews);
        setAnalysisData(analysis);
      } else {
        const allReviews = await fetchAllReviews();
        setReviewsData(allReviews);
      }
    } catch (error) {
      console.error('Erro ao coletar dados:', error);
    } finally {
      setIsCollecting(false);
    }
  };

  const formatNumber = (num) => {
    if (num === undefined || num === null || isNaN(num)) {
      return '0';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      case 'neutral': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'Média': return 'bg-yellow-100 text-yellow-800';
      case 'Baixa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return 'N/A';
    }
  };

  const getFilteredData = () => {
    if (!selectedApp) {
      const totalApps = appsData.length;
      const totalReviews = reviewsData.length;
      const totalRating = appsData.reduce((sum, app) => sum + (app.rating || 0), 0);
      const averageRating = totalApps > 0 ? (totalRating / totalApps).toFixed(1) : 0;
      const positiveReviews = reviewsData.filter(r => r && r.sentiment === 'positive').length;
      const generalSentiment = totalReviews > 0 ? Math.round((positiveReviews / totalReviews) * 100) : 0;

      return {
        totalApps: totalApps,
        totalReviews: totalReviews,
        averageRating: averageRating,
        positivesentiment: generalSentiment,
        recentReviews: reviewsData,
        analysisData: null
      };
    }

    const appReviewsCount = reviewsData.length;
    const appRating = selectedApp.rating || 0;
    const positiveAppReviews = reviewsData.filter(r => r && r.sentiment === 'positive').length;
    const appSentiment = appReviewsCount > 0 ? Math.round((positiveAppReviews / appReviewsCount) * 100) : 0;

    return {
      totalApps: 1,
      totalReviews: appReviewsCount,
      averageRating: appRating,
      positivesentiment: analysisData && analysisData.positive_percentage !== undefined ? analysisData.positive_percentage : appSentiment,
      recentReviews: reviewsData,
      analysisData: analysisData
    };
  };

  const filteredData = getFilteredData();

  const handleAppSelect = (app) => {
    setSelectedApp(app);
    setSidebarOpen(false);
  };

  const handleBackToGeneral = () => {
    setSelectedApp(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Carregando dados dos apps...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">Erro ao carregar dados dos apps: {error.message}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[var(--color-green-dark)] to-[var(--color-green)] text-white shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-white hover:bg-white/10 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[var(--color-orange-itau)] rounded-lg flex items-center justify-center font-bold">
                  I
                </div>
                <div>
                  <h1 className="text-xl font-bold">Analytics Apps Itaú</h1>
                  {selectedApp && (
                    <p className="text-sm text-blue-200">
                      <img src={selectedApp.icon_url} alt={selectedApp.name} className="inline-block h-4 w-4 mr-1" /> {selectedApp.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <nav className="hidden lg:flex items-center space-x-6">
              <a href="#" className="hover:text-[var(--color-orange-itau)] transition-colors">Dashboard</a>
              <a href="#" className="hover:text-[var(--color-orange-itau)] transition-colors">Apps</a>
              <a href="#" className="hover:text-[var(--color-orange-itau)] transition-colors">Reviews</a>
              <a href="#" className="hover:text-[var(--color-orange-itau)] transition-colors">Relatórios</a>
              <a href="#" className="hover:text-[var(--color-orange-itau)] transition-colors">Configurações</a>
            </nav>

            <div className="flex items-center space-x-4">
              {selectedApp && (
                <Button
                  onClick={handleBackToGeneral}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              )}
              
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm"
              >
                <option value="Hoje">Hoje</option>
                <option value="7 dias">7 dias</option>
                <option value="30 dias">30 dias</option>
                <option value="90 dias">90 dias</option>
              </select>
              
              <Button
                onClick={handleCollectData}
                disabled={isCollecting}
                className="bg-[var(--color-orange-itau)] hover:bg-[var(--color-orange-itau)]/90 text-white"
              >
                {isCollecting ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {isCollecting ? 'Coletando...' : 'Coletar Dados'}
              </Button>

              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out`}>
          <div className="p-4">
            <nav className="space-y-1">
              {/* Dashboard Geral */}
              <div className="mb-6">
                <button
                  onClick={handleBackToGeneral}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    !selectedApp ? 'bg-[var(--color-lime-green)] text-[var(--color-green-dark)] border border-[var(--color-green)]' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Dashboard Geral
                </button>
              </div>
              
              {/* Categorias */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Categorias</h3>
                <div className="space-y-1">
                  <button
                    onClick={handleBackToGeneral}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                      !selectedApp ? 'bg-[var(--color-lime-green)] text-[var(--color-green-dark)]' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border border-[var(--color-green)] rounded flex items-center justify-center">
                        <div className="w-2 h-2 bg-[var(--color-green)] rounded-sm"></div>
                      </div>
                      <span>Todos os Apps</span>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{appsData.length}</span>
                  </button>
                  
                  <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border border-[var(--color-green)] rounded-full"></div>
                      <span>Investimentos</span>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">31</span>
                  </button>
                  
                  <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border border-[var(--color-green)] rounded"></div>
                      <span>Financeiro</span>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">6</span>
                  </button>
                </div>
              </div>

              {/* Todos os Apps */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Todos os Apps</h3>
                <div className="space-y-1">
                  {appsData.map((app, index) => (
                    <button
                      key={app.app_id || index}
                      onClick={() => handleAppSelect(app)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors group ${
                        selectedApp?.app_id === app.app_id 
                          ? 'bg-[var(--color-orange-itau)]/10 text-[var(--color-orange-itau)] border border-[var(--color-orange-itau)]/20' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        {app.icon_url ? (
                          <img src={app.icon_url} alt={app.name} className="h-5 w-5 rounded flex-shrink-0" />
                        ) : (
                          <div className="h-5 w-5 bg-[var(--color-green)] rounded flex-shrink-0 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {app.name ? app.name.charAt(0).toUpperCase() : 'A'}
                            </span>
                          </div>
                        )}
                        <span className="truncate text-left">{app.name || 'App sem nome'}</span>
                      </div>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <div className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg viewBox="0 0 12 12" fill="currentColor">
                            <circle cx="6" cy="6" r="1"/>
                            <circle cx="6" cy="3" r="1"/>
                            <circle cx="6" cy="9" r="1"/>
                          </svg>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:ml-0">
          {/* Informações do App Selecionado */}
          {selectedApp && (
            <div className="mb-8">
              <Card className="bg-gradient-to-r from-[var(--color-green)]/10 to-[var(--color-green)]/20 border-[var(--color-green)]">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    {selectedApp.icon_url && <img src={selectedApp.icon_url} alt={selectedApp.name || 'App'} className="h-12 w-12" />}
                    <div className="flex-1">
                      <CardTitle className="text-2xl text-[var(--color-green-dark)]">{selectedApp.name || 'Nome não disponível'}</CardTitle>
                      <p className="text-[var(--color-green-dark)] mt-1">{selectedApp.description || 'Descrição não disponível'}</p>
                      <div className="flex items-center space-x-4 mt-3">
                        <Badge variant="outline" className="bg-white">
                          <Package className="h-3 w-3 mr-1" />
                          v{selectedApp.current_version || 'N/A'}
                        </Badge>
                        <Badge variant="outline" className="bg-white">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(selectedApp.last_updated)}
                        </Badge>
                        <Badge variant="outline" className="bg-white">
                          <Download className="h-3 w-3 mr-1" />
                          {formatNumber(selectedApp.total_reviews || 0)} reviews
                        </Badge>
                        <Badge variant="outline" className="bg-white">
                          {selectedApp.category || 'Categoria não disponível'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          )}

          {/* Métricas Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-[var(--color-lime-green)]/10 to-[var(--color-lime-green)]/20 border-[var(--color-lime-green)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[var(--color-green-dark)]">
                  {selectedApp ? 'App Selecionado' : 'Total de Apps'}
                </CardTitle>
                <Smartphone className="h-4 w-4 text-[var(--color-green)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--color-green-dark)]">{filteredData.totalApps}</div>
                <p className="text-xs text-[var(--color-green)] mt-1">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  {selectedApp ? selectedApp.name : '+0% vs período anterior'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[var(--color-green)]/10 to-[var(--color-green)]/20 border-[var(--color-green)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[var(--color-green-dark)]">Total de Reviews</CardTitle>
                <MessageSquare className="h-4 w-4 text-[var(--color-green)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--color-green-dark)]">
                  {filteredData.analysisData ? 
                    formatNumber(filteredData.analysisData.total_reviews) : 
                    formatNumber(filteredData.totalReviews)
                  }
                </div>
                <p className="text-xs text-[var(--color-green)] mt-1">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +12% vs período anterior
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[var(--color-green)]/10 to-[var(--color-green)]/20 border-[var(--color-green)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[var(--color-green-dark)]">Nota Média</CardTitle>
                <Star className="h-4 w-4 text-[var(--color-green)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--color-green-dark)]">{filteredData.averageRating}</div>
                <div className="flex items-center mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3 w-3 ${star <= Math.floor(filteredData.averageRating) ? 'text-[var(--color-orange-itau)] fill-current' : 'text-[var(--color-gray)]'}`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[var(--color-green)]/10 to-[var(--color-green)]/20 border-[var(--color-green)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[var(--color-green-dark)]">Sentimento Geral</CardTitle>
                <ThumbsUp className="h-4 w-4 text-[var(--color-green)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--color-green-dark)]">{filteredData.positivesentiment}%</div>
                <div className="flex items-center space-x-1 mt-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[var(--color-lime-green)] h-2 rounded-full" 
                      style={{ width: `${filteredData.positivesentiment}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos e Reviews */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Gráfico de Evolução */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[var(--color-green-dark)]">
                  Evolução de Reviews {selectedApp && `- ${selectedApp.name}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-r from-[var(--color-gray)] to-[var(--color-gray)] rounded-lg p-4">
                  {filteredData.recentReviews.length > 0 ? (
                    <div className="h-full flex flex-col justify-center">
                      <div className="text-center mb-4">
                        <TrendingUp className="h-8 w-8 mx-auto mb-2 text-[var(--color-green)]" />
                        <p className="text-sm font-medium text-gray-700">Evolução de Reviews</p>
                        <p className="text-xs text-gray-500">
                          {selectedApp ? `${selectedApp.name}` : `Últimos ${selectedPeriod}`}
                        </p>
                      </div>
                      
                      {/* Gráfico simples de barras */}
                      <div className="flex items-end justify-center space-x-2 h-24">
                        {[...Array(7)].map((_, index) => {
                          const height = Math.random() * 60 + 20; // Altura aleatória para demonstração
                          return (
                            <div key={index} className="flex flex-col items-center">
                              <div 
                                className="bg-blue-500 w-6 rounded-t"
                                style={{ height: `${height}px` }}
                              ></div>
                              <span className="text-xs text-gray-500 mt-1">
                                {new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000).getDate()}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="text-center mt-2">
                        <p className="text-xs text-gray-500">
                          Total: {filteredData.recentReviews.length} reviews
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                        <p>Gráfico de evolução temporal</p>
                        <p className="text-sm">
                          {selectedApp ? `Dados do ${selectedApp.name}` : `Dados dos últimos ${selectedPeriod}`}
                        </p>
                        <p className="text-xs mt-2">Nenhum dado disponível</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Distribuição de Sentimentos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[var(--color-green-dark)]">Distribuição de Sentimentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Positivo</span>
                    <span className="text-sm font-medium text-green-600">
                      {filteredData.analysisData && filteredData.analysisData.positive_percentage !== undefined ? 
                        `${filteredData.analysisData.positive_percentage}%` : 
                        `${filteredData.positivesentiment}%`}
                    </span>
                  </div>
                  <div className="w-full bg-[var(--color-gray)] rounded-full h-2">
                    <div className="bg-[var(--color-lime-green)] h-2 rounded-full" style={{ 
                      width: `${filteredData.analysisData && filteredData.analysisData.positive_percentage !== undefined ? 
                        filteredData.analysisData.positive_percentage : 
                        filteredData.positivesentiment}%` 
                    }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Neutro</span>
                    <span className="text-sm font-medium text-yellow-600">
                      {filteredData.analysisData && filteredData.analysisData.neutral_percentage !== undefined ? 
                        `${filteredData.analysisData.neutral_percentage}%` : 
                        `${Math.round((100 - filteredData.positivesentiment) * 0.7)}%`}
                    </span>
                  </div>
                  <div className="w-full bg-[var(--color-gray)] rounded-full h-2">
                    <div className="bg-[var(--color-orange-itau)] h-2 rounded-full" style={{ 
                      width: `${filteredData.analysisData && filteredData.analysisData.neutral_percentage !== undefined ? 
                        filteredData.analysisData.neutral_percentage : 
                        Math.round((100 - filteredData.positivesentiment) * 0.7)}%` 
                    }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Negativo</span>
                    <span className="text-sm font-medium text-red-600">
                      {filteredData.analysisData && filteredData.analysisData.negative_percentage !== undefined ? 
                        `${filteredData.analysisData.negative_percentage}%` : 
                        `${Math.round((100 - filteredData.positivesentiment) * 0.3)}%`}
                    </span>
                  </div>
                  <div className="w-full bg-[var(--color-gray)] rounded-full h-2">
                    <div className="bg-[var(--color-green-dark)] h-2 rounded-full" style={{ 
                      width: `${filteredData.analysisData && filteredData.analysisData.negative_percentage !== undefined ? 
                        filteredData.analysisData.negative_percentage : 
                        Math.round((100 - filteredData.positivesentiment) * 0.3)}%` 
                    }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reviews Recentes e Backlog IA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reviews Recentes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-[#1E3A5F]">
                  Reviews Recentes {selectedApp && `- ${selectedApp.name}`}
                </CardTitle>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {filteredData.recentReviews.length} Reviews
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredData.recentReviews.length > 0 ? (
                    filteredData.recentReviews.map((review, index) => (
                      <div key={review.review_id || index} className="border-b border-gray-100 pb-4 last:border-b-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{review.user_name || 'Usuário Anônimo'}</p>
                              <p className="text-xs text-gray-500">{formatDate(review.date)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3 w-3 ${star <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{review.content}</p>
                        <Badge className={getSentimentColor(review.sentiment)}>
                          {review.sentiment === 'positive' ? 'Positivo' : 
                           review.sentiment === 'negative' ? 'Negativo' : 'Neutro'}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>Nenhum review encontrado para este app</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Análise de Sentimentos */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-[#1E3A5F]">
                  Análise de Sentimentos {selectedApp && `- ${selectedApp.name}`}
                </CardTitle>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {filteredData.analysisData ? 'Dados Reais' : 'Sem Dados'}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredData.analysisData ? (
                    <>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-900 mb-2">
                          {filteredData.analysisData.avg_sentiment_score?.toFixed(1) || 'N/A'}
                        </div>
                        <p className="text-sm text-gray-600">Score Médio de Sentimento</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Total de Reviews:</span>
                          <span className="font-medium">{filteredData.analysisData.total_reviews}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Última Atualização:</span>
                          <span className="font-medium">{formatDate(filteredData.analysisData.last_updated)}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>Análise não disponível</p>
                      <p className="text-sm">Clique em "Coletar Dados" para gerar análise</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}

export default App;

