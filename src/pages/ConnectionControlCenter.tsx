// GAGO Open Artifact Factory - Connection Control Center
// Phase 3: Real-time connection status and management

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import {
  verifyGitHubPublicAccess,
  verifyVercelConfiguration,
  verifyOllamaLocal,
  verifyJouleEngine,
  verifyNetworkConnectivity,
  verifyLocalStorage,
  determineConnectionStatus
} from '../services/auto-config';
import { diagnoseConnectionError, generateDiagnosticSummary } from '../services/connection-recovery';
import type { ConnectionTest, ConnectionStatus } from '../types/phase3';
import { CONNECTION_STATUS_LABELS } from '../types/phase3';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
  RefreshCw,
  Wifi,
  WifiOff,
  Database,
  GitBranch,
  Cloud,
  Cpu,
  Zap
} from 'lucide-react';

interface ConnectionInfo {
  id: string;
  name: string;
  icon: React.ElementType;
  status: ConnectionStatus;
  lastTest?: ConnectionTest;
  capabilities: string[];
  isTesting: boolean;
}

export default function ConnectionControlCenter() {
  const { store } = useData();
  const [connections, setConnections] = useState<ConnectionInfo[]>([]);
  const [isConnectingAll, setIsConnectingAll] = useState(false);
  const [diagnosticSummary, setDiagnosticSummary] = useState<any>(null);

  // Inicializar conexiones
  useEffect(() => {
    initializeConnections();
  }, []);

  const initializeConnections = () => {
    setConnections([
      {
        id: 'network',
        name: 'Conectividad de Red',
        icon: Wifi,
        status: 'NOT_CONFIGURED',
        capabilities: ['Internet'],
        isTesting: false
      },
      {
        id: 'storage',
        name: 'Almacenamiento Local',
        icon: Database,
        status: 'NOT_CONFIGURED',
        capabilities: ['localStorage'],
        isTesting: false
      },
      {
        id: 'github',
        name: 'GitHub',
        icon: GitBranch,
        status: 'NOT_CONFIGURED',
        capabilities: ['API pública', 'Repos', 'Issues'],
        isTesting: false
      },
      {
        id: 'vercel',
        name: 'Vercel',
        icon: Cloud,
        status: 'NOT_CONFIGURED',
        capabilities: ['Deploy', 'Config'],
        isTesting: false
      },
      {
        id: 'ollama',
        name: 'Ollama Local',
        icon: Cpu,
        status: 'NOT_CONFIGURED',
        capabilities: ['Modelos locales'],
        isTesting: false
      },
      {
        id: 'joule',
        name: 'JOULE Engine',
        icon: Zap,
        status: 'NOT_CONFIGURED',
        capabilities: ['Optimización', 'Rutas'],
        isTesting: false
      }
    ]);
  };

  // Verificar una conexión específica
  const testConnection = async (connectionId: string) => {
    setConnections(prev => prev.map(c =>
      c.id === connectionId ? { ...c, isTesting: true } : c
    ));

    let test: ConnectionTest;

    try {
      switch (connectionId) {
        case 'network':
          test = await verifyNetworkConnectivity();
          break;
        case 'storage':
          test = verifyLocalStorage();
          break;
        case 'github':
          test = await verifyGitHubPublicAccess();
          break;
        case 'vercel':
          test = await verifyVercelConfiguration();
          break;
        case 'ollama':
          test = await verifyOllamaLocal();
          break;
        case 'joule':
          test = verifyJouleEngine(store.jouleState);
          break;
        default:
          throw new Error('Conexión desconocida');
      }

      const status = determineConnectionStatus([test]);

      setConnections(prev => prev.map(c =>
        c.id === connectionId
          ? { ...c, status, lastTest: test, isTesting: false }
          : c
      ));
    } catch (error) {
      const errorTest: ConnectionTest = {
        id: `test-${Date.now()}`,
        connectorId: connectionId,
        capabilityId: 'unknown',
        timestamp: new Date().toISOString(),
        success: false,
        duration: 0,
        verified: false,
        errorMessage: error instanceof Error ? error.message : 'Error desconocido',
        errorCategory: 'ADAPTER_ERROR'
      };

      setConnections(prev => prev.map(c =>
        c.id === connectionId
          ? { ...c, status: 'ERROR', lastTest: errorTest, isTesting: false }
          : c
      ));
    }
  };

  // Verificar todas las conexiones
  const connectAll = async () => {
    setIsConnectingAll(true);
    const allTests: ConnectionTest[] = [];

    for (const connection of connections) {
      await testConnection(connection.id);
      
      // Obtener el último test de esta conexión
      const updatedConnection = connections.find(c => c.id === connection.id);
      if (updatedConnection?.lastTest) {
        allTests.push(updatedConnection.lastTest);
      }
    }

    // Generar resumen de diagnóstico
    const summary = generateDiagnosticSummary(allTests);
    setDiagnosticSummary(summary);
    setIsConnectingAll(false);
  };

  // Obtener color del estado
  const getStatusColor = (status: ConnectionStatus): string => {
    switch (status) {
      case 'VERIFIED':
      case 'CONNECTED':
        return 'text-green-600 dark:text-green-400';
      case 'CONNECTING':
        return 'text-blue-600 dark:text-blue-400';
      case 'DEGRADED':
      case 'RATE_LIMITED':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'ERROR':
      case 'DISCONNECTED':
      case 'BLOCKED':
        return 'text-red-600 dark:text-red-400';
      case 'AUTH_REQUIRED':
      case 'NOT_CONFIGURED':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Obtener icono del estado
  const getStatusIcon = (status: ConnectionStatus, isTesting: boolean) => {
    if (isTesting) {
      return <Loader className="w-5 h-5 animate-spin text-blue-500" />;
    }

    switch (status) {
      case 'VERIFIED':
      case 'CONNECTED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'DEGRADED':
      case 'RATE_LIMITED':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'ERROR':
      case 'DISCONNECTED':
      case 'BLOCKED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'AUTH_REQUIRED':
      case 'NOT_CONFIGURED':
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Centro de Control de Conexiones
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Verificación y gestión de todas las integraciones del sistema
        </p>
      </div>

      {/* Botón Conectar Todo */}
      <div className="mb-6">
        <button
          onClick={connectAll}
          disabled={isConnectingAll}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors"
        >
          {isConnectingAll ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Verificando todas las conexiones...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              Conectar Todo
            </>
          )}
        </button>
      </div>

      <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
        <p className="text-sm text-slate-700 dark:text-slate-300">Para conectar Ollama desde una web pública utiliza el puente local con emparejamiento. La verificación directa de localhost:11434 de esta pantalla no constituye un acceso autorizado desde Vercel.</p>
        <Link to="/integrations/ollama-local" className="mt-2 inline-flex rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white">Abrir configuración segura de Ollama</Link>
      </div>
      {/* Resumen de Diagnóstico */}
      {diagnosticSummary && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Resumen de Diagnóstico
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {diagnosticSummary.totalErrors}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Errores Totales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {diagnosticSummary.criticalErrors}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Críticos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {diagnosticSummary.autoRecoverable}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Auto-recuperables</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {diagnosticSummary.requiresManual}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Manuales</div>
            </div>
          </div>
          {diagnosticSummary.recommendations.length > 0 && (
            <div className="space-y-2">
              {diagnosticSummary.recommendations.map((rec: string, idx: number) => (
                <div key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                  {rec}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lista de Conexiones */}
      <div className="grid gap-4">
        {connections.map((connection) => (
          <div
            key={connection.id}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-700 ${getStatusColor(connection.status)}`}>
                  <connection.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {connection.name}
                    </h3>
                    {getStatusIcon(connection.status, connection.isTesting)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Estado: <span className={`font-medium ${getStatusColor(connection.status)}`}>
                      {CONNECTION_STATUS_LABELS[connection.status]}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                    Capacidades: {connection.capabilities.join(', ')}
                  </div>
                  {connection.lastTest && (
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      Última verificación: {new Date(connection.lastTest.timestamp).toLocaleString('es-ES')}
                      {' • '}
                      Duración: {connection.lastTest.duration}ms
                      {connection.lastTest.errorMessage && (
                        <div className="mt-1 text-red-600 dark:text-red-400">
                          {connection.lastTest.errorMessage}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => testConnection(connection.id)}
                disabled={connection.isTesting}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors"
              >
                {connection.isTesting ? 'Verificando...' : 'Verificar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Información adicional */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
          ℹ️ Información Importante
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Las verificaciones son reales y pueden consumir cuotas de API</li>
          <li>• GitHub API pública tiene un límite de 60 solicitudes/hora sin autenticación</li>
          <li>• Ollama debe estar instalado y corriendo localmente para ser detectado</li>
          <li>• JOULE se verifica localmente sin conexión a internet</li>
          <li>• Las credenciales nunca se almacenan en el navegador</li>
        </ul>
      </div>
    </div>
  );
}
