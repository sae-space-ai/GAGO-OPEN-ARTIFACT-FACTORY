// GAGO OPEN ARTIFACT FACTORY - API Control Center
// Fase 2 - Universal API Fabric

import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import {
  CONNECTOR_CATEGORY_LABELS,
  CONNECTOR_STATUS_LABELS,
  BILLING_MODEL_LABELS,
  AUTH_METHOD_LABELS,
} from '../types/api-fabric';
import type { Connector, ConnectorStatus, ConnectorCategory } from '../types/api-fabric';
import { getIntegrationStatus } from '../services/api-fabric/orchestrator';
import { getUsageStatistics } from '../services/api-fabric/quota-manager';
import {
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  Zap,
  DollarSign,
  Shield,
  Clock,
  Activity,
} from 'lucide-react';

export default function APIControlCenter() {
  const { store } = useData();
  const [selectedCategory, setSelectedCategory] = useState<ConnectorCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ConnectorStatus | 'all'>('all');

  const apiFabric = store.apiFabricState;

  if (!apiFabric) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500 dark:text-slate-400">API Fabric no inicializada.</p>
      </div>
    );
  }

  const { connectors, capabilityRequirements, quotaUsage, budgetPolicy } = apiFabric;
  const status = getIntegrationStatus(connectors, capabilityRequirements);
  const usageStats = getUsageStatistics(quotaUsage);

  // Filtrar conectores
  const filteredConnectors = connectors.filter(c => {
    if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;
    return true;
  });

  const categories: Array<{ value: ConnectorCategory | 'all'; label: string }> = [
    { value: 'all', label: 'Todas las categorías' },
    ...Object.entries(CONNECTOR_CATEGORY_LABELS).map(([value, label]) => ({
      value: value as ConnectorCategory,
      label,
    })),
  ];

  const statuses: Array<{ value: ConnectorStatus | 'all'; label: string }> = [
    { value: 'all', label: 'Todos los estados' },
    ...Object.entries(CONNECTOR_STATUS_LABELS).map(([value, label]) => ({
      value: value as ConnectorStatus,
      label,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Universal API Fabric</h2>
            <p className="text-blue-100">Control Central de Integraciones</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-3xl font-bold">{status.totalConnectors}</p>
            <p className="text-sm text-blue-100">Conectores</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-3xl font-bold">{status.verifiedConnectors}</p>
            <p className="text-sm text-blue-100">Verificados</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-3xl font-bold">{status.connectedCapabilities}</p>
            <p className="text-sm text-blue-100">Capacidades Conectadas</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-3xl font-bold">{usageStats.totalRequests}</p>
            <p className="text-sm text-blue-100">Solicitudes Totales</p>
          </div>
        </div>
      </div>

      {/* Budget Policy */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex items-center gap-3 mb-3">
          <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Política de Presupuesto</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Coste Máximo</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {budgetPolicy.maxMonetaryCost} {budgetPolicy.currency}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Operaciones Pagadas</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {budgetPolicy.allowPaidOperations ? (
                <span className="text-amber-600 dark:text-amber-400">Permitidas</span>
              ) : (
                <span className="text-green-600 dark:text-green-400">Bloqueadas</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Autorización Requerida</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {budgetPolicy.requireExplicitAuthorization ? 'Sí' : 'No'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Categoría
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ConnectorCategory | 'all')}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Estado
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ConnectorStatus | 'all')}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              {statuses.map((stat) => (
                <option key={stat.value} value={stat.value}>
                  {stat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Connectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredConnectors.map((connector) => (
          <ConnectorCard key={connector.id} connector={connector} />
        ))}
      </div>

      {filteredConnectors.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400">No hay conectores que coincidan con los filtros.</p>
        </div>
      )}
    </div>
  );
}

function ConnectorCard({ connector }: { connector: Connector }) {
  const statusColors: Record<ConnectorStatus, string> = {
    discovered: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    available: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    configuration_required: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    authorization_required: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    connected: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    verified: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    degraded: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    rate_limited: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    blocked: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    disabled: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-500',
    unsupported: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-500',
  };

  const statusIcons: Record<ConnectorStatus, React.ElementType> = {
    discovered: Clock,
    available: Activity,
    configuration_required: Settings,
    authorization_required: Shield,
    connected: CheckCircle,
    verified: CheckCircle,
    degraded: AlertCircle,
    rate_limited: XCircle,
    blocked: XCircle,
    disabled: XCircle,
    unsupported: XCircle,
  };

  const StatusIcon = statusIcons[connector.status];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            {connector.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{connector.provider}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            statusColors[connector.status]
          }`}
        >
          <StatusIcon className="w-3 h-3" />
          {CONNECTOR_STATUS_LABELS[connector.status]}
        </span>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
        {connector.description}
      </p>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">Categoría:</span>
          <span className="text-slate-900 dark:text-white font-medium">
            {CONNECTOR_CATEGORY_LABELS[connector.category]}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">Modelo de Coste:</span>
          <span className="text-slate-900 dark:text-white font-medium">
            {BILLING_MODEL_LABELS[connector.costModel]}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">Autenticación:</span>
          <span className="text-slate-900 dark:text-white font-medium">
            {AUTH_METHOD_LABELS[connector.authMethod]}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">Capacidades:</span>
          <span className="text-slate-900 dark:text-white font-medium">
            {connector.capabilities.length}
          </span>
        </div>
      </div>

      {connector.configurationRequired.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Configuración requerida:</p>
          <ul className="space-y-1">
            {connector.configurationRequired.slice(0, 3).map((req, i) => (
              <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Settings className="w-3 h-3" />
                {req}
              </li>
            ))}
            {connector.configurationRequired.length > 3 && (
              <li className="text-xs text-slate-500 dark:text-slate-500">
                +{connector.configurationRequired.length - 3} más
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <a
          href={connector.documentationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          Documentación →
        </a>
      </div>
    </div>
  );
}
