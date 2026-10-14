// GAGO Open Artifact Factory - AI Provider Control Center
// Phase 11: JOULE HYBRID AI PROVIDER ENGINE

import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { 
  aiProviderManager,
  initializeOpenRouter,
  initializeOllama,
  configureOpenRouterApiKey,
  checkOpenRouterConnectivity,
  checkOllamaConnectivity,
  openRouterInference,
  ollamaInference,
  getProviderStats,
  getOpenRouterFreeModels,
  selectAIProvider,
  executeInferenceWithFallback
} from '../services/ai-provider';
import type { 
  AIProvider, 
  AIInferenceRequest, 
  AIInferenceResponse,
  AIModelCapability 
} from '../types/ai-provider';
import { AI_PROVIDER_STATUS_LABELS, AI_MODEL_CAPABILITY_LABELS } from '../types/ai-provider';
import { Brain, Wifi, WifiOff, Key, TestTube, BarChart3, AlertCircle, CheckCircle } from 'lucide-react';

export default function AIProviderControlCenter() {
  const { store } = useData();
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [response, setResponse] = useState<AIInferenceResponse | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [stats, setStats] = useState(getProviderStats());

  // Inicializar proveedores al cargar el componente
  useEffect(() => {
    initializeOpenRouter();
    initializeOllama();
    refreshProviders();
  }, []);

  // Actualizar estadísticas periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getProviderStats());
      refreshProviders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const refreshProviders = () => {
    setProviders(aiProviderManager.getAllProviders());
  };

  const handleConfigureOpenRouter = () => {
    if (!apiKey.trim()) {
      alert('Por favor, ingresa una API key válida');
      return;
    }

    try {
      configureOpenRouterApiKey(apiKey);
      alert('API key configurada correctamente');
      setApiKey('');
      refreshProviders();
    } catch (error) {
      alert(`Error al configurar API key: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleCheckConnectivity = async (providerId: string) => {
    setIsTesting(true);
    
    try {
      if (providerId === 'openrouter') {
        await checkOpenRouterConnectivity();
      } else if (providerId === 'ollama') {
        await checkOllamaConnectivity();
      }
      
      refreshProviders();
    } catch (error) {
      console.error('Error al verificar conectividad:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestInference = async () => {
    if (!prompt.trim()) {
      alert('Por favor, ingresa un prompt');
      return;
    }

    if (!selectedProvider) {
      alert('Por favor, selecciona un proveedor');
      return;
    }

    setIsTesting(true);
    setResponse(null);

    try {
      const request: AIInferenceRequest = {
        id: generateId(),
        providerId: selectedProvider,
        modelId: selectedModel || undefined,
        prompt,
        capabilities: ['code_generation'],
        priority: 'medium',
        budget: 0,
        timestamp: new Date().toISOString()
      };

      let result: AIInferenceResponse;

      if (selectedProvider === 'openrouter') {
        result = await openRouterInference(request);
      } else if (selectedProvider === 'ollama') {
        result = await ollamaInference(request);
      } else {
        throw new Error('Proveedor no soportado');
      }

      setResponse(result);
    } catch (error) {
      console.error('Error en inferencia:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleAutoSelect = async () => {
    if (!prompt.trim()) {
      alert('Por favor, ingresa un prompt');
      return;
    }

    setIsTesting(true);
    setResponse(null);

    try {
      const request: AIInferenceRequest = {
        id: generateId(),
        prompt,
        capabilities: ['code_generation'],
        priority: 'medium',
        budget: 0,
        timestamp: new Date().toISOString()
      };

      const result = await executeInferenceWithFallback(request);
      setResponse(result);
      refreshProviders();
    } catch (error) {
      console.error('Error en selección automática:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'connected':
      case 'authenticated':
        return 'text-green-600 dark:text-green-400';
      case 'connecting':
        return 'text-blue-600 dark:text-blue-400';
      case 'quota_exceeded':
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'unauthorized':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'authenticated':
        return <Wifi className="w-5 h-5" />;
      case 'connecting':
        return <Wifi className="w-5 h-5 animate-pulse" />;
      case 'disconnected':
        return <WifiOff className="w-5 h-5" />;
      case 'error':
      case 'quota_exceeded':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <WifiOff className="w-5 h-5" />;
    }
  };

  const selectedProviderData = providers.find(p => p.id === selectedProvider);
  const freeModels = selectedProviderData?.models.filter(m => m.isFree) || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
          <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          AI Provider Control Center
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Gestión centralizada de proveedores de inteligencia artificial
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Proveedores</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Conectados</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.connected}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Autenticados</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.authenticated}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Desconectados</p>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.disconnected}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Con Errores</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.error}</p>
        </div>
      </div>

      {/* Lista de proveedores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {providers.map(provider => (
          <div
            key={provider.id}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                  {provider.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {provider.type}
                </p>
              </div>
              <div className={`flex items-center gap-2 ${getStatusColor(provider.status)}`}>
                {getStatusIcon(provider.status)}
                <span className="text-sm font-medium">
                  {AI_PROVIDER_STATUS_LABELS[provider.status as keyof typeof AI_PROVIDER_STATUS_LABELS]}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Modelos disponibles:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {provider.models.filter(m => m.available).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Modelos gratuitos:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {provider.models.filter(m => m.isFree).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">API Key configurada:</span>
                <span className="font-medium">
                  {provider.hasKey ? (
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 inline" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 inline" />
                  )}
                </span>
              </div>
            </div>

            {provider.error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  {provider.error}
                </p>
              </div>
            )}

            {provider.id === 'openrouter' && !provider.hasKey && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  API Key de OpenRouter
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-or-..."
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                  />
                  <button
                    onClick={handleConfigureOpenRouter}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Configurar
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  Obtén tu API key en <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">openrouter.ai/keys</a>
                </p>
              </div>
            )}

            <button
              onClick={() => handleCheckConnectivity(provider.id)}
              disabled={isTesting}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <TestTube className="w-4 h-4" />
              {isTesting ? 'Verificando...' : 'Verificar Conectividad'}
            </button>
          </div>
        ))}
      </div>

      {/* Entorno de prueba */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          Entorno de Prueba de Inferencia
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Proveedor
            </label>
            <select
              value={selectedProvider}
              onChange={(e) => {
                setSelectedProvider(e.target.value);
                setSelectedModel('');
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="">Seleccionar proveedor...</option>
              {providers
                .filter(p => p.status === 'connected' || p.status === 'authenticated')
                .map(provider => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Modelo (opcional)
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              disabled={!selectedProvider}
            >
              <option value="">Automático (mejor disponible)</option>
              {freeModels.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} (Gratis)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Escribe tu prompt aquí..."
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white min-h-[100px]"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleTestInference}
            disabled={isTesting || !selectedProvider || !prompt.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
          >
            {isTesting ? 'Procesando...' : 'Probar Inferencia'}
          </button>
          <button
            onClick={handleAutoSelect}
            disabled={isTesting || !prompt.trim()}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
          >
            {isTesting ? 'Procesando...' : 'Selección Automática con Fallback'}
          </button>
        </div>

        {response && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Respuesta
            </h3>
            <div className={`p-4 rounded-lg ${response.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              {response.success ? (
                <>
                  <div className="mb-3">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Contenido:</p>
                    <pre className="text-sm text-slate-900 dark:text-white whitespace-pre-wrap bg-white dark:bg-slate-800 p-3 rounded">
                      {response.content}
                    </pre>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-slate-600 dark:text-slate-400">Proveedor:</p>
                      <p className="font-medium text-slate-900 dark:text-white">{response.providerId}</p>
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-400">Modelo:</p>
                      <p className="font-medium text-slate-900 dark:text-white">{response.modelId}</p>
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-400">Latencia:</p>
                      <p className="font-medium text-slate-900 dark:text-white">{response.latency}ms</p>
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-400">Coste:</p>
                      <p className="font-medium text-green-600 dark:text-green-400">{response.cost.toFixed(4)} EUR</p>
                    </div>
                  </div>
                  <div className="mt-3 text-sm">
                    <p className="text-slate-600 dark:text-slate-400">Tokens:</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      Prompt: {response.usage.promptTokens} | Completado: {response.usage.completionTokens} | Total: {response.usage.totalTokens}
                    </p>
                  </div>
                </>
              ) : (
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">Error:</p>
                  <p className="text-sm text-red-600 dark:text-red-300">{response.error}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Información importante */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-5">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Información Importante
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <li>• <strong>Presupuesto cero:</strong> Solo se utilizan modelos gratuitos. No se generan cargos.</li>
          <li>• <strong>API Keys:</strong> Nunca se almacenan en el navegador. Se configuran manualmente.</li>
          <li>• <strong>Ollama es opcional:</strong> El sistema funciona con proveedores remotos gratuitos.</li>
          <li>• <strong>Fallback automático:</strong> Si un proveedor falla, se intenta con el siguiente.</li>
          <li>• <strong>Privacidad:</strong> Los prompts se envían solo a proveedores autorizados.</li>
        </ul>
      </div>
    </div>
  );
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}
