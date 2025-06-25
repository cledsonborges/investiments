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

  useEffect(() => {
    const loadReviewsData = async () => {
      if (selectedApp) {
        const reviews = await fetchAppReviews(selectedApp.app_id);
        const analysis = await fetchAppAnalysis(selectedApp.app_id);
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
        const analysis = await fetchAppAnalysis(selectedApp.app_id);
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
      const positiveReviews = reviewsData.filter(r => r.sentiment === 'positive').length;
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
    const positiveAppReviews = reviewsData.filter(r => r.sentiment === 'positive').length;
    const appSentiment = appReviewsCount > 0 ? Math.round((positiveAppReviews / appReviewsCount) * 100) : 0;

    return {
      totalApps: 1,
      totalReviews: appReviewsCount,
      averageRating: appRating,
      positivesentiment: analysisData ? analysisData.positive_percentage : appSentiment,
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
      <header className="bg-gradient-to-r from-[#1E3A5F] to-[#2A4A6B] text-white shadow-lg">
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
                <div className="w-8 h-8 bg-[#FF6B35] rounded-lg flex items-center justify-center font-bold">
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
              <a href="#" className="hover:text-[#FF6B35] transition-colors">Dashboard</a>
              <a href="#" className="hover:text-[#FF6B35] transition-colors">Apps</a>
              <a href="#" className="hover:text-[#FF6B35] transition-colors">Reviews</a>
              <a href="#" className="hover:text-[#FF6B35] transition-colors">Relatórios</a>
              <a href="#" className="hover:text-[#FF6B35] transition-colors">Configurações</a>
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
                className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white"
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
          <div className="p-6">
            <nav className="space-y-2">
              <div className="font-semibold text-gray-900 mb-4">
                <button
                  onClick={handleBackToGeneral}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    !selectedApp ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                  }`}
                >
                  Dashboard Geral
                </button>
              </div>
              
              <div className="space-y-1">
                <div className="font-medium text-gray-700 text-sm mb-2">Apps do Itaú</div>
                {appsData.map(app => (
                  <button
                    key={app.id}
                    onClick={() => handleAppSelect(app)}
                    className={`w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                      selectedApp?.id === app.id 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {app.icon_url && <img src={app.icon_url} alt={app.name} className="h-5 w-5" />}
                    <span className="truncate">{app.name}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-1 mt-6">
                <div className="font-medium text-gray-700 text-sm mb-2">Analytics</div>
                <a href="#" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Sentimentos</a>
                <a href="#" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Performance</a>
                <a href="#" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Comparativos</a>
              </div>

              <div className="space-y-1 mt-6">
                <div className="font-medium text-gray-700 text-sm mb-2">Reviews</div>
                <a href="#" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Últimas Reviews</a>
                <a href="#" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Análise de Sentimentos</a>
                <a href="#" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Palavras-chave</a>
              </div>

              <div className="space-y-1 mt-6">
                <div className="font-medium text-gray-700 text-sm mb-2">Backlog IA</div>
                <a href="#" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Sugestões Automáticas</a>
                <a href="#" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Priorização</a>
                <a href="#" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Roadmap</a>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:ml-0">
          {/* Informações do App Selecionado */}
          {selectedApp && (
            <div className="mb-8">
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    {selectedApp.icon_url && <img src={selectedApp.icon_url} alt={selectedApp.name} className="h-12 w-12" />}
                    <div className="flex-1">
                      <CardTitle className="text-2xl text-blue-900">{selectedApp.name}</CardTitle>
                      <p className="text-blue-700 mt-1">{selectedApp.description}</p>
                      <div className="flex items-center space-x-4 mt-3">
                        <Badge variant="outline" className="bg-white">
                          <Package className="h-3 w-3 mr-1" />
                          v{selectedApp.current_version}
                        </Badge>
                        <Badge variant="outline" className="bg-white">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(selectedApp.last_updated)}
                        </Badge>
                        <Badge variant="outline" className="bg-white">
                          <Download className="h-3 w-3 mr-1" />
                          {formatNumber(selectedApp.total_reviews)} reviews
                        </Badge>
                        <Badge variant="outline" className="bg-white">
                          {selectedApp.category}
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
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">
                  {selectedApp ? 'App Selecionado' : 'Total de Apps'}
                </CardTitle>
                <Smartphone className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{filteredData.totalApps}</div>
                <p className="text-xs text-green-600 mt-1">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  {selectedApp ? selectedApp.name : '+0% vs período anterior'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Total de Reviews</CardTitle>
                <MessageSquare className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">
                  {filteredData.analysisData ? 
                    formatNumber(filteredData.analysisData.total_reviews) : 
                    formatNumber(filteredData.totalReviews)
                  }
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +12% vs período anterior
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-800">Nota Média</CardTitle>
                <Star className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900">{filteredData.averageRating}</div>
                <div className="flex items-center mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3 w-3 ${star <= Math.floor(filteredData.averageRating) ? 'text-orange-500 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-pink-800">Sentimento Geral</CardTitle>
                <ThumbsUp className="h-4 w-4 text-pink-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-pink-900">{filteredData.positivesentiment}%</div>
                <div className="flex items-center space-x-1 mt-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-pink-500 h-2 rounded-full" 
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
                <CardTitle className="text-lg font-semibold text-[#1E3A5F]">
                  Evolução de Reviews {selectedApp && `- ${selectedApp.name}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                    <p>Gráfico de evolução temporal</p>
                    <p className="text-sm">
                      {selectedApp ? `Dados do ${selectedApp.name}` : `Dados dos últimos ${selectedPeriod}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Distribuição de Sentimentos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#1E3A5F]">Distribuição de Sentimentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Positivo</span>
                    <span className="text-sm font-medium text-green-600">
                      {filteredData.analysisData ? 
                        filteredData.analysisData.positive_percentage : 
                        filteredData.positivesentiment}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ 
                      width: `${filteredData.analysisData ? 
                        filteredData.analysisData.positive_percentage : 
                        filteredData.positivesentiment}%` 
                    }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Neutro</span>
                    <span className="text-sm font-medium text-yellow-600">
                      {filteredData.analysisData ? 
                        filteredData.analysisData.neutral_percentage : 
                        Math.round((100 - filteredData.positivesentiment) * 0.7)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ 
                      width: `${filteredData.analysisData ? 
                        filteredData.analysisData.neutral_percentage : 
                        Math.round((100 - filteredData.positivesentiment) * 0.7)}%` 
                    }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Negativo</span>
                    <span className="text-sm font-medium text-red-600">
                      {filteredData.analysisData ? 
                        filteredData.analysisData.negative_percentage : 
                        Math.round((100 - filteredData.positivesentiment) * 0.3)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ 
                      width: `${filteredData.analysisData ? 
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
                    filteredData.recentReviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
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

