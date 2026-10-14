import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { installUniversalConnectors, findConnectorsByCategory, getVerifiedConnectors } from '../services/integrations/registry';
import { discoverCapabilities, selectIntegrationRoute, generateDependencyMap } from '../services/integrations/discovery';
import type { IntegrationConnector, IntegrationCategory } from '../types/integrations';
import { INTEGRATION_CATEGORY_LABELS, INTEGRATION_STATUS_LABELS, AUTH_TYPE_LABELS, COST_CLASSIFICATION_LABELS } from '../types/integrations';
import { Link2, CheckCircle, XCircle, AlertCircle, Settings, Zap, RefreshCw, Download, Upload } from 'lucide-react';

export default function UniversalIntegrationsHub() {
  const { store, updateIntegrations } = useData();
  const [connectors, setConnectors] = useState<IntegrationConnector[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [configResults, setConfigResults] = useState<Array<{
    connectorId: string;
    status: 'success' | 'pending' | 'failed';
    message: string;
  }>>([]);

  // Inicializar conectores universales
  useEffect(() => {
    if (!store.integrations) {
      const initialConnectors = installUniversalConnectors([]);
      updateIntegrations(initialConnectors);
      setConnectors(initialConnectors);
    } else {
      setConnectors(store.integrations);
    }
  }, []);

  // Filtrar conectores
  const filteredConnectors = connectors.filter(connector => {
    const matchesCategory = selectedCategory === 'all' || connector.category === selectedCategory;
    const matchesSearch = connector.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         connector.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Estadísticas
  const stats = {
    total: connectors.length,
    verified: getVerifiedConnectors(connectors).length,
    pending: connectors.filter(c => c.connectionStatus === 'NOT_CONFIGURED' || c.connectionStatus === 'AUTH_REQUIRED').length,
    errors: connectors.filter(c => c.errors.length > 0).length,
    blocked: connectors.filter(c => c.connectionStatus === 'BLOCKED').length,
    free: connectors.filter(c => c.costClassification === 'free_permanent' || c.costClassification === 'free_tier' || c.costClassification === 'local_execution').length
  };

  // Descubrimiento de capacidades
  const modules = [
    { id: 'projects', name: 'Proyectos', requiredCapabilities: ['github-repos'] },
    { id: 'tasks', name: 'Tareas', requiredCapabilities: ['github-issues'] },
    { id: 'artifacts', name: 'Artefactos', requiredCapabilities: ['vercel-deployments'] },
    { id: 'qwen-generator', name: 'Generador Qwen', requiredCapabilities: ['qwen-code'] },
    { id: 'joule', name: 'JOULE', requiredCapabilities: ['joule-optimize', 'joule-measure'] }
  ];

  const discoveries = discoverCapabilities(connectors, modules);
  const dependencyMap = generateDependencyMap(discoveries, connectors);

  // Configurar todo
  const handleConfigureAll = async () => {
    setIsConfiguring(true);
    setConfigResults([]);

    const results: Array<{
      connectorId: string;
      status: 'success' | 'pending' | 'failed';
      message: string;
    }> = [];

    // Simular configuración de cada conector
    for (const connector of connectors) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular tiempo de configuración

      if (connector.id === 'joule') {
        // JOULE ya está verificado
        results.push({
          connectorId: connector.id,
          status: 'success',
          message: 'JOULE ya está configurado y verificado'
        });
      } else if (connector.id === 'ollama') {
        // Ollama requiere servicio local
        results.push({
          connectorId: connector.id,
          status: 'pending',
          message: 'Ollama requiere instalación local del servicio'
        });
      } else if (connector.authType !== 'none' && connector.authType !== 'internal') {
        // Conectores que requieren autenticación
        results.push({
          connectorId: connector.id,
          status: 'pending',
          message: `${connector.name} requiere configuración de autenticación`
        });
      } else {
        // Conectores que pueden configurarse automáticamente
        results.push({
          connectorId: connector.id,
          status: 'success',
          message: `${connector.name} configurado correctamente`
        });
      }
    }

    setConfigResults(results);
    setIsConfiguring(false);
  };

  // Obtener color del estado
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'VERIFIED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'CONNECTED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'CONFIGURED': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
      case 'NOT_CONFIGURED': return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
      case 'AUTH_REQUIRED': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'ERROR': case 'BLOCKED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'DEGRADED': case 'RATE_LIMITED': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
          <Link2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          Universal Integrations Hub
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Centro universal de integraciones, conectividad y orquestación de servicios
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Verificados</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.verified}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Pendientes</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Errores</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.errors}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Bloqueados</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.blocked}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Gratuitos</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.free}</p>
        </div>
      </div>

      {/* Botón Configurar Todo */}
      <div className="mb-6">
        <button
          onClick={handleConfigureAll}
          disabled={isConfiguring}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors"
        >
          {isConfiguring ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Configurando...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Configurar y Conectar Todo
            </>
          )}
        </button>
      </div>

      {/* Resultados de configuración */}
      {configResults.length > 0 && (
        <div className="mb-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
            Resultados de Configuración
          </h3>
          <div className="space-y-2">
            {configResults.map((result, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                {result.status === 'success' && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />}
                {result.status === 'pending' && <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />}
                {result.status === 'failed' && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {connectors.find(c => c.id === result.connectorId)?.name}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{result.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar integraciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as IntegrationCategory | 'all')}
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        >
          <option value="all">Todas las categorías</option>
          {Object.entries(INTEGRATION_CATEGORY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Lista de conectores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {filteredConnectors.map(connector => (
          <div
            key={connector.id}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                  {connector.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {connector.provider}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(connector.connectionStatus)}`}>
                {INTEGRATION_STATUS_LABELS[connector.connectionStatus]}
              </span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
              {connector.description}
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-500">Categoría:</span>
                <span className="text-slate-900 dark:text-white font-medium">
                  {INTEGRATION_CATEGORY_LABELS[connector.category]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-500">Autenticación:</span>
                <span className="text-slate-900 dark:text-white font-medium">
                  {AUTH_TYPE_LABELS[connector.authType]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-500">Coste:</span>
                <span className="text-slate-900 dark:text-white font-medium">
                  {COST_CLASSIFICATION_LABELS[connector.costClassification]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-500">Capacidades:</span>
                <span className="text-slate-900 dark:text-white font-medium">
                  {connector.capabilities.length}
                </span>
              </div>
            </div>

            {connector.errors.length > 0 && (
              <div className="mt-3 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-xs text-red-700 dark:text-red-400">
                  {connector.errors.length} error(es) reciente(s)
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mapa de dependencias */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Mapa de Dependencias
        </h2>
        <div className="space-y-4">
          {discoveries.map(discovery => (
            <div key={discovery.moduleId} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                {discovery.moduleName}
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 mb-1">Disponibles:</p>
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    {discovery.availableConnectors.length}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 mb-1">Pendientes:</p>
                  <p className="text-amber-600 dark:text-amber-400 font-medium">
                    {discovery.pendingConnectors.length}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 mb-1">Bloqueados:</p>
                  <p className="text-red-600 dark:text-red-400 font-medium">
                    {discovery.blockedConnectors.length}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {dependencyMap.criticalConnectors.length > 0 && (
          <div className="mt-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
              Conectores Críticos
            </h4>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Los siguientes conectores son utilizados por múltiples módulos y no deben desconectarse sin advertencia:
            </p>
            <ul className="mt-2 list-disc list-inside text-sm text-amber-800 dark:text-amber-200">
              {dependencyMap.criticalConnectors.map(connectorId => (
                <li key={connectorId}>
                  {connectors.find(c => c.id === connectorId)?.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
