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
  AlertTriangle
} from 'lucide-react';
import './App.css';

// Dados mockados para demonstração
const mockData = {
  totalApps: 4,
  totalReviews: 2500000,
  averageRating: 4.2,
  positivesentiment: 78,
  apps: [
    { id: 1, name: 'Itaú Empresas', rating: 4.3, reviews: 850000, icon: '🏢' },
    { id: 2, name: 'Itaú Personnalité', rating: 4.5, reviews: 320000, icon: '💎' },
    { id: 3, name: 'Itaú Unibanco', rating: 4.1, reviews: 1200000, icon: '🏦' },
    { id: 4, name: 'Iti by Itaú', rating: 4.0, reviews: 130000, icon: '💳' }
  ],
  recentReviews: [
    { id: 1, user: 'João S.', app: 'Itaú Unibanco', rating: 5, text: 'Excelente app, muito fácil de usar...', sentiment: 'positive', time: '2 min' },
    { id: 2, user: 'Maria L.', app: 'Iti by Itaú', rating: 4, text: 'Gosto muito das funcionalidades...', sentiment: 'positive', time: '5 min' },
    { id: 3, user: 'Carlos M.', app: 'Itaú Empresas', rating: 2, text: 'App está muito lento ultimamente...', sentiment: 'negative', time: '8 min' },
    { id: 4, user: 'Ana P.', app: 'Itaú Personnalité', rating: 5, text: 'Perfeito para minhas necessidades...', sentiment: 'positive', time: '12 min' },
    { id: 5, user: 'Pedro R.', app: 'Itaú Unibanco', rating: 3, text: 'Poderia ter mais funcionalidades...', sentiment: 'neutral', time: '15 min' }
  ],
  aiSuggestions: [
    { id: 1, title: 'Melhorar Performance de Login', priority: 'Alta', category: 'Performance', description: 'Usuários relatam lentidão no login' },
    { id: 2, title: 'Adicionar Biometria Facial', priority: 'Média', category: 'Funcionalidade', description: 'Solicitação frequente nos reviews' },
    { id: 3, title: 'Redesign da Tela Inicial', priority: 'Baixa', category: 'UX', description: 'Interface pode ser mais intuitiva' }
  ]
};

function App() {
  const [isCollecting, setIsCollecting] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30 dias');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleCollectData = () => {
    setIsCollecting(true);
    setTimeout(() => {
      setIsCollecting(false);
    }, 3000);
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
                <h1 className="text-xl font-bold">Analytics Apps Itaú</h1>
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
              <div className="font-semibold text-gray-900 mb-4">Dashboard Geral</div>
              
              <div className="space-y-1">
                <div className="font-medium text-gray-700 text-sm mb-2">Apps do Itaú</div>
                {mockData.apps.map(app => (
                  <a key={app.id} href="#" className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                    <span>{app.icon}</span>
                    <span>{app.name}</span>
                  </a>
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
          {/* Métricas Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Total de Apps</CardTitle>
                <Smartphone className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{mockData.totalApps}</div>
                <p className="text-xs text-green-600 mt-1">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +0% vs período anterior
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Total de Reviews</CardTitle>
                <MessageSquare className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{formatNumber(mockData.totalReviews)}</div>
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
                <div className="text-2xl font-bold text-orange-900">{mockData.averageRating}</div>
                <div className="flex items-center mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3 w-3 ${star <= Math.floor(mockData.averageRating) ? 'text-orange-500 fill-current' : 'text-gray-300'}`}
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
                <div className="text-2xl font-bold text-pink-900">{mockData.positivesentiment}%</div>
                <div className="flex items-center space-x-1 mt-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-pink-500 h-2 rounded-full" 
                      style={{ width: `${mockData.positivesentiment}%` }}
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
                <CardTitle className="text-lg font-semibold text-[#1E3A5F]">Evolução de Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                    <p>Gráfico de evolução temporal</p>
                    <p className="text-sm">Dados dos últimos {selectedPeriod}</p>
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
                    <span className="text-sm font-medium text-green-600">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Neutro</span>
                    <span className="text-sm font-medium text-yellow-600">15%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Negativo</span>
                    <span className="text-sm font-medium text-red-600">7%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '7%' }}></div>
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
                <CardTitle className="text-lg font-semibold text-[#1E3A5F]">Reviews Recentes</CardTitle>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Tempo Real
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {mockData.recentReviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{review.user}</p>
                            <p className="text-xs text-gray-500">{review.app}</p>
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
                          <span className="text-xs text-gray-500">{review.time}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{review.text}</p>
                      <Badge className={getSentimentColor(review.sentiment)}>
                        {review.sentiment === 'positive' ? 'Positivo' : 
                         review.sentiment === 'negative' ? 'Negativo' : 'Neutro'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Backlog IA */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-[#1E3A5F]">Sugestões da IA</CardTitle>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {mockData.aiSuggestions.length} Pendentes
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.aiSuggestions.map((suggestion) => (
                    <div key={suggestion.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">{suggestion.title}</h4>
                        <Badge className={getPriorityColor(suggestion.priority)}>
                          {suggestion.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{suggestion.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {suggestion.category}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            Ver
                          </Button>
                          <Button size="sm" className="text-xs bg-[#4CAF50] hover:bg-[#45A049]">
                            <Plus className="h-3 w-3 mr-1" />
                            Adicionar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
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

