import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
} from 'lucide-react'
import './App.css'

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

  const API_BASE_URL = 'https://bff-iarahub.vercel.app/api/scrap/android?';

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAppsData(data.apps.map((app, index) => ({ ...app, id: app.id || index + 1 })));
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, []);

  const fetchAppReviews = async (appId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}ids=${appId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setReviewsData(data.reviews);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppAnalysis = async (appId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}ids=${appId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAnalysisData(data.analysis);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppSelect = (app) => {
    setSelectedApp(app);
    fetchAppReviews(app.id);
    fetchAppAnalysis(app.id);
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    // Re-fetch data based on new period if necessary
  };

  const handleCollectData = () => {
    setIsCollecting(true);
    // Simulate data collection
    setTimeout(() => {
      setIsCollecting(false);
      alert('Coleta de dados concluída!');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`bg-white p-4 shadow-md ${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out`}>
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-2xl font-bold ${sidebarOpen ? 'block' : 'hidden'}`}>Dashboard</h1>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        <nav>
          <ul>
            <li className="mb-4">
              <Button variant="ghost" className="w-full justify-start">
                <Smartphone className="mr-2 h-5 w-5" />
                <span className={sidebarOpen ? 'block' : 'hidden'}>Aplicativos</span>
              </Button>
            </li>
            <li className="mb-4">
              <Button variant="ghost" className="w-full justify-start">
                <Star className="mr-2 h-5 w-5" />
                <span className={sidebarOpen ? 'block' : 'hidden'}>Avaliações</span>
              </Button>
            </li>
            <li className="mb-4">
              <Button variant="ghost" className="w-full justify-start">
                <TrendingUp className="mr-2 h-5 w-5" />
                <span className={sidebarOpen ? 'block' : 'hidden'}>Análises</span>
              </Button>
            </li>
            <li className="mb-4">
              <Button variant="ghost" className="w-full justify-start">
                <Users className="mr-2 h-5 w-5" />
                <span className={sidebarOpen ? 'block' : 'hidden'}>Usuários</span>
              </Button>
            </li>
            <li className="mb-4">
              <Button variant="ghost" className="w-full justify-start">
                <RefreshCw className="mr-2 h-5 w-5" />
                <span className={sidebarOpen ? 'block' : 'hidden'}>Atualizar Dados</span>
              </Button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <header className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-semibold">Visão Geral do Desempenho do Aplicativo</h2>
          <div className="flex items-center space-x-4">
            <Button onClick={handleCollectData} disabled={isCollecting}>
              {isCollecting ? 'Coletando...' : 'Coletar Dados Agora'}
            </Button>
            <select
              className="p-2 border rounded-md"
              value={selectedPeriod}
              onChange={(e) => handlePeriodChange(e.target.value)}
            >
              <option value="7 dias">Últimos 7 dias</option>
              <option value="30 dias">Últimos 30 dias</option>
              <option value="90 dias">Últimos 90 dias</option>
            </select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>
        </header>

        {loading && <p>Carregando dados...</p>}
        {error && <p className="text-red-500">Erro: {error.message}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {appsData.map((app) => (
              <Card key={app.id} className="cursor-pointer" onClick={() => handleAppSelect(app)}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {app.name}
                  </CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{app.totalReviews}</div>
                  <p className="text-xs text-muted-foreground">
                    {app.newReviewsLastPeriod} novas avaliações no último período
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedApp && (
          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-4">Detalhes do Aplicativo: {selectedApp.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Visão Geral das Avaliações
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{selectedApp.averageRating} <Star className="h-5 w-5 inline-block text-yellow-400" /></div>
                  <p className="text-xs text-muted-foreground">
                    Baseado em {selectedApp.totalReviews} avaliações
                  </p>
                  <div className="mt-4 space-y-2">
                    {reviewsData.map((review, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{review.user}</p>
                          <p className="text-xs text-muted-foreground">{review.comment}</p>
                        </div>
                        <Badge variant="secondary">{review.rating} <Star className="h-3 w-3 inline-block text-yellow-400" /></Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Análise de Sentimento
                  </CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {analysisData ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Sentimento Geral: <Badge variant={analysisData.overallSentiment === 'Positivo' ? 'default' : 'destructive'}>{analysisData.overallSentiment}</Badge></p>
                      <p className="text-xs text-muted-foreground">Pontos Chave: {analysisData.keyPoints.join(', ')}</p>
                      <p className="text-xs text-muted-foreground">Sugestões: {analysisData.suggestions.join(', ')}</p>
                    </div>
                  ) : (
                    <p>Nenhum dado de análise disponível.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;


