import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  Zap,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
  Bug,
  Lightbulb,
  TrendingUp,
  ExternalLink,
  Settings,
  Play,
  Download,
  RefreshCw,
  Loader2
} from 'lucide-react';

const BacklogAI = ({ selectedApp, appsData }) => {
  const [backlogData, setBacklogData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCreatingJiraIssues, setIsCreatingJiraIssues] = useState(false);
  const [jiraConfig, setJiraConfig] = useState({
    jira_url: '',
    email: '',
    api_token: '',
    project_key: ''
  });
  const [jiraProjects, setJiraProjects] = useState([]);
  const [jiraConnectionStatus, setJiraConnectionStatus] = useState(null);
  const [jiraResults, setJiraResults] = useState(null);
  const [error, setError] = useState(null);

   const API_BASE_URL = 'https://bff-analyse.vercel.app';

  const analyzeAppBacklog = async () => {
    if (!selectedApp) {
      setError('Selecione um aplicativo para análise');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/apps/${selectedApp.app_id}/backlog?store=google_play&limit=100`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na análise: ${response.status}`);
      }

      const data = await response.json();
      
      // Adaptar a resposta da nova API para o formato esperado pelo frontend
      const adaptedData = {
        success: true,
        backlog_data: {
          summary: {
            total_reviews_analyzed: data.total_reviews_processed || 0,
            critical_issues_found: data.generated_backlog_items?.filter(item => item.priority === 'High').length || 0,
            improvement_suggestions: data.generated_backlog_items?.filter(item => item.type === 'improvement').length || 0
          },
          backlog_items: data.generated_backlog_items?.map((item, index) => ({
            title: item.description,
            description: item.description,
            category: item.type,
            priority: item.priority,
            estimated_effort: '3',
            user_impact: 'Medium',
            evidence: [`Baseado em análise de ${data.total_reviews_processed} reviews`],
            acceptance_criteria: [`Implementar: ${item.description}`]
          })) || []
        }
      };
      
      setBacklogData(adaptedData.backlog_data);
    } catch (error) {
      console.error('Erro ao analisar backlog:', error);
      setError(`Erro ao analisar backlog: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const testJiraConnection = async () => {
    if (!jiraConfig.jira_url || !jiraConfig.email || !jiraConfig.api_token) {
      setError('Preencha todos os campos de configuração do Jira');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/jira/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jiraConfig)
      });

      const data = await response.json();
      setJiraConnectionStatus(data);

      if (data.success) {
        // Buscar projetos disponíveis
        const projectsResponse = await fetch(`${API_BASE_URL}/jira/projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jiraConfig)
        });

        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          setJiraProjects(projectsData.projects || []);
        }
      }
    } catch (error) {
      console.error('Erro ao testar conexão Jira:', error);
      setJiraConnectionStatus({
        success: false,
        message: `Erro de conexão: ${error.message}`
      });
    }
  };

  const createJiraIssues = async () => {
    if (!backlogData || !jiraConfig.project_key) {
      setError('Configure o Jira e gere o backlog primeiro');
      return;
    }

    setIsCreatingJiraIssues(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/backlog/create-jira-issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          backlog_data: backlogData,
          project_key: jiraConfig.project_key,
          jira_config: jiraConfig
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar issues: ${response.status}`);
      }

      const data = await response.json();
      setJiraResults(data);
    } catch (error) {
      console.error('Erro ao criar issues no Jira:', error);
      setError(`Erro ao criar issues: ${error.message}`);
    } finally {
      setIsCreatingJiraIssues(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'bug': return <Bug className="h-4 w-4" />;
      case 'feature': return <Lightbulb className="h-4 w-4" />;
      case 'improvement': return <TrendingUp className="h-4 w-4" />;
      case 'performance': return <Zap className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const formatEffort = (effort) => {
    const effortMap = {
      '1': '1 (XS)',
      '2': '2 (S)',
      '3': '3 (M)',
      '5': '5 (L)',
      '8': '8 (XL)',
      '13': '13 (XXL)'
    };
    return effortMap[effort] || effort;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Backlog com IA</h2>
            <p className="text-gray-600">Análise inteligente de reviews para geração de backlog</p>
          </div>
        </div>
        
        {selectedApp && (
          <Button
            onClick={analyzeAppBacklog}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            {isAnalyzing ? 'Analisando...' : 'Analisar com IA'}
          </Button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* App Selection */}
      {!selectedApp && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span>Selecione um Aplicativo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Para gerar um backlog com IA, primeiro selecione um aplicativo específico na barra lateral.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {appsData.slice(0, 6).map((app) => (
                <div key={app.id} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <img src={app.icon_url} alt={app.name} className="w-10 h-10 rounded-lg" />
                    <div>
                      <h4 className="font-medium">{app.name}</h4>
                      <p className="text-sm text-gray-500">Rating: {app.rating || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backlog Results */}
      {backlogData && (
        <Tabs defaultValue="backlog" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="backlog">Backlog Gerado</TabsTrigger>
            <TabsTrigger value="sprints">Recomendações de Sprint</TabsTrigger>
            <TabsTrigger value="jira">Integração Jira</TabsTrigger>
          </TabsList>

          {/* Backlog Tab */}
          <TabsContent value="backlog" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">Reviews Analisadas</p>
                      <p className="text-2xl font-bold">{backlogData.summary?.total_reviews_analyzed || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm text-gray-600">Problemas Críticos</p>
                      <p className="text-2xl font-bold">{backlogData.summary?.critical_issues_found || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm text-gray-600">Melhorias</p>
                      <p className="text-2xl font-bold">{backlogData.summary?.improvement_suggestions || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-600">Total de Itens</p>
                      <p className="text-2xl font-bold">{backlogData.backlog_items?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Backlog Items */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Itens do Backlog</h3>
              {backlogData.backlog_items?.map((item, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
                          <p className="text-gray-600 mb-3">{item.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                        <Badge variant="outline">
                          {item.category}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Esforço Estimado</Label>
                        <p className="text-sm">{formatEffort(item.estimated_effort)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Impacto no Usuário</Label>
                        <p className="text-sm">{item.user_impact}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Evidências</Label>
                        <p className="text-sm">{item.evidence?.length || 0} reviews</p>
                      </div>
                    </div>

                    {/* Acceptance Criteria */}
                    {item.acceptance_criteria && item.acceptance_criteria.length > 0 && (
                      <div className="mb-4">
                        <Label className="text-sm font-medium text-gray-500 mb-2 block">Critérios de Aceitação</Label>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          {item.acceptance_criteria.map((criteria, idx) => (
                            <li key={idx}>{criteria}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Evidence */}
                    {item.evidence && item.evidence.length > 0 && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Users className="h-4 w-4 mr-2" />
                            Ver Evidências ({item.evidence.length})
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Evidências dos Usuários</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-3">
                            {item.evidence.map((evidence, idx) => (
                              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700">"{evidence}"</p>
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Sprint Recommendations Tab */}
          <TabsContent value="sprints" className="space-y-6">
            {backlogData.sprint_recommendations && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Recomendações de Sprint</h3>
                
                {Object.entries(backlogData.sprint_recommendations.recommendations).map(([sprintKey, sprint]) => (
                  <Card key={sprintKey}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{sprintKey.replace('_', ' ').toUpperCase()}</span>
                        <Badge variant="outline">
                          {sprint.estimated_effort} pontos
                        </Badge>
                      </CardTitle>
                      <p className="text-gray-600">{sprint.focus}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {sprint.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              {getCategoryIcon(item.category)}
                              <span className="font-medium">{item.title}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getPriorityColor(item.priority)} size="sm">
                                {item.priority}
                              </Badge>
                              <Badge variant="outline" size="sm">
                                {formatEffort(item.estimated_effort)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Jira Integration Tab */}
          <TabsContent value="jira" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Configuração do Jira</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="jira_url">URL do Jira</Label>
                    <Input
                      id="jira_url"
                      placeholder="https://company.atlassian.net"
                      value={jiraConfig.jira_url}
                      onChange={(e) => setJiraConfig({...jiraConfig, jira_url: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu-email@empresa.com"
                      value={jiraConfig.email}
                      onChange={(e) => setJiraConfig({...jiraConfig, email: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="api_token">Token de API</Label>
                  <Input
                    id="api_token"
                    type="password"
                    placeholder="Seu token de API do Jira"
                    value={jiraConfig.api_token}
                    onChange={(e) => setJiraConfig({...jiraConfig, api_token: e.target.value})}
                  />
                </div>

                <Button onClick={testJiraConnection} variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Testar Conexão
                </Button>

                {jiraConnectionStatus && (
                  <Alert className={jiraConnectionStatus.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    <CheckCircle className={`h-4 w-4 ${jiraConnectionStatus.success ? 'text-green-600' : 'text-red-600'}`} />
                    <AlertDescription className={jiraConnectionStatus.success ? 'text-green-800' : 'text-red-800'}>
                      {jiraConnectionStatus.message}
                      {jiraConnectionStatus.user && ` (Usuário: ${jiraConnectionStatus.user})`}
                    </AlertDescription>
                  </Alert>
                )}

                {jiraProjects.length > 0 && (
                  <div>
                    <Label htmlFor="project_key">Projeto</Label>
                    <Select value={jiraConfig.project_key} onValueChange={(value) => setJiraConfig({...jiraConfig, project_key: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um projeto" />
                      </SelectTrigger>
                      <SelectContent>
                        {jiraProjects.map((project) => (
                          <SelectItem key={project.key} value={project.key}>
                            {project.name} ({project.key})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {jiraConnectionStatus?.success && jiraConfig.project_key && (
                  <Button
                    onClick={createJiraIssues}
                    disabled={isCreatingJiraIssues}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isCreatingJiraIssues ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    {isCreatingJiraIssues ? 'Criando Issues...' : 'Criar Issues no Jira'}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Jira Results */}
            {jiraResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Resultado da Criação</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{jiraResults.summary?.created_count || 0}</p>
                      <p className="text-sm text-green-700">Issues Criadas</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{jiraResults.summary?.failed_count || 0}</p>
                      <p className="text-sm text-red-700">Falhas</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{jiraResults.summary?.total_items || 0}</p>
                      <p className="text-sm text-blue-700">Total de Itens</p>
                    </div>
                  </div>

                  {jiraResults.created_issues && jiraResults.created_issues.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-green-700">Issues Criadas com Sucesso:</h4>
                      {jiraResults.created_issues.map((issue, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <p className="font-medium">{issue.title}</p>
                            <p className="text-sm text-gray-600">{issue.issue_key}</p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={issue.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Ver no Jira
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {jiraResults.failed_issues && jiraResults.failed_issues.length > 0 && (
                    <div className="space-y-3 mt-6">
                      <h4 className="font-semibold text-red-700">Issues com Falha:</h4>
                      {jiraResults.failed_issues.map((issue, idx) => (
                        <div key={idx} className="p-3 bg-red-50 rounded-lg">
                          <p className="font-medium text-red-800">{issue.title}</p>
                          <p className="text-sm text-red-600">{issue.error}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default BacklogAI;

