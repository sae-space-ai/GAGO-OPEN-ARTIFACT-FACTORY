// GAGO Open Artifact Factory - JOULE Training Center
// Fase 4: Centro de mando del sistema multiagente

import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { initializeJouleMATS, executeTrainingCycle } from '../services/joule-mats';
import type { JouleAgent, AgentStatus, TrainingObservation } from '../types/joule-mats';
import { AGENT_STATUS_LABELS } from '../types/joule-mats';
import { Play, Pause, RotateCcw, Activity, CheckCircle, XCircle, Clock, AlertTriangle, Users, Zap } from 'lucide-react';

export default function JouleTrainingCenter() {
  const { store, updateJouleMATS } = useData();
  const [isTraining, setIsTraining] = useState(false);
  const [trainingLog, setTrainingLog] = useState<string[]>([]);

  // Inicializar JOULE MATS si no existe
  if (!store.jouleMATS) {
    const initialState = initializeJouleMATS();
    updateJouleMATS(initialState);
    return null;
  }

  const mats = store.jouleMATS;
  const agents = Object.values(mats.agents);

  const handleStartTraining = async () => {
    setIsTraining(true);
    setTrainingLog(['Iniciando ciclo de entrenamiento...']);

    try {
      // Generar observaciones de ejemplo para el entrenamiento
      const sampleObservations: TrainingObservation[] = generateSampleObservations(100);

      setTrainingLog(prev => [...prev, 'Ejecutando 15 agentes especializados...']);

      const result = await executeTrainingCycle(mats, sampleObservations, `cycle-${Date.now()}`);

      if (result.success) {
        setTrainingLog(prev => [
          ...prev,
          '✓ Ciclo de entrenamiento completado exitosamente',
          `✓ Dataset creado: ${result.cycle.datasetId}`,
          `✓ Política generada: ${result.cycle.policiesGenerated[0]}`,
          `✓ Mejora sobre línea base: ${result.cycle.metrics.improvementOverBaseline.toFixed(1)}%`,
          `✓ Calidad mantenida: ${result.cycle.metrics.qualityMaintained ? 'Sí' : 'No'}`
        ]);
        updateJouleMATS(result.newState);
      } else {
        setTrainingLog(prev => [
          ...prev,
          '✗ Ciclo de entrenamiento fallido',
          ...result.errors.map(e => `  Error: ${e}`)
        ]);
        updateJouleMATS(result.newState);
      }
    } catch (error) {
      setTrainingLog(prev => [
        ...prev,
        `✗ Error inesperado: ${error instanceof Error ? error.message : 'Desconocido'}`
      ]);
    } finally {
      setIsTraining(false);
    }
  };

  const handleStopTraining = () => {
    setIsTraining(false);
    setTrainingLog(prev => [...prev, 'Entrenamiento detenido por el usuario']);
  };

  const getStatusIcon = (status: AgentStatus) => {
    switch (status) {
      case 'running':
        return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'blocked':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case 'running':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'completed':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'failed':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'blocked':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const completedAgents = agents.filter(a => a.status === 'completed').length;
  const runningAgents = agents.filter(a => a.status === 'running').length;
  const failedAgents = agents.filter(a => a.status === 'failed').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <Users className="w-8 h-8 text-purple-600" />
          JOULE Training Center
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Sistema Multiagente de Entrenamiento Adaptativo - 15 Agentes Especializados
        </p>
      </div>

      {/* Controles de Entrenamiento */}
      <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
              Control de Entrenamiento
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Modo: {mats.shadowMode ? 'Shadow (observación)' : 'Activo'} | 
              Canary: {mats.canaryPercentage}%
            </p>
          </div>
          <div className="flex gap-3">
            {!isTraining ? (
              <button
                onClick={handleStartTraining}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
              >
                <Play className="w-5 h-5" />
                Iniciar Entrenamiento
              </button>
            ) : (
              <button
                onClick={handleStopTraining}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                <Pause className="w-5 h-5" />
                Detener
              </button>
            )}
            <button
              onClick={() => {
                const resetState = initializeJouleMATS();
                updateJouleMATS(resetState);
                setTrainingLog([]);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Reiniciar
            </button>
          </div>
        </div>

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Completados</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedAgents}/15</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Ejecutando</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{runningAgents}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Fallidos</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{failedAgents}</p>
          </div>
        </div>
      </div>

      {/* Grid de Agentes */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          15 Agentes Especializados
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className={`p-4 rounded-lg border-2 transition-all ${getStatusColor(agent.status)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(agent.status)}
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {agent.name}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {agent.specialty}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                {agent.description}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Ejecuciones: {agent.executionCount}</span>
                <span>Éxitos: {agent.successCount}</span>
              </div>
              {agent.blockedReasons.length > 0 && (
                <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded text-xs text-yellow-800 dark:text-yellow-200">
                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                  {agent.blockedReasons[0]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Log de Entrenamiento */}
      {trainingLog.length > 0 && (
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Log de Entrenamiento
          </h3>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {trainingLog.map((log, idx) => (
              <div key={idx} className="text-gray-300">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Políticas Entrenadas */}
      {mats.policies.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Políticas Entrenadas ({mats.policies.length})
          </h2>
          <div className="space-y-3">
            {mats.policies.slice(-5).reverse().map((policy) => (
              <div
                key={policy.id}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {policy.name}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    policy.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                    policy.status === 'validated' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                    policy.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {policy.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Coste/Resultado:</span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {policy.metrics.costPerCorrectResult.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Tasa de Éxito:</span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {(policy.metrics.successRate * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Latencia:</span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {policy.metrics.averageLatencyMs.toFixed(0)}ms
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Muestra:</span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {policy.metrics.sampleSize}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Función auxiliar para generar observaciones de ejemplo
function generateSampleObservations(count: number): TrainingObservation[] {
  const observations: TrainingObservation[] = [];
  const routes = ['route-local', 'route-cache', 'route-api-1', 'route-api-2'];
  
  for (let i = 0; i < count; i++) {
    const routeId = routes[Math.floor(Math.random() * routes.length)];
    const isSuccess = Math.random() > 0.15; // 85% tasa de éxito
    
    observations.push({
      id: `obs-${i}`,
      taskId: `task-${i}`,
      taskFeatures: {
        complexity: Math.random() > 0.5 ? 'high' : 'low',
        priority: Math.random() > 0.5 ? 'high' : 'low'
      },
      routeId,
      routeInfo: {
        availability: 0.8 + Math.random() * 0.2,
        quality: 0.7 + Math.random() * 0.3,
        latencyMs: 100 + Math.random() * 900,
        costUnits: 1 + Math.random() * 9,
        uncertainty: Math.random() * 0.5
      },
      result: isSuccess ? 'success' : 'failure',
      durationMs: 500 + Math.random() * 4500,
      costUnits: 1 + Math.random() * 9,
      errors: isSuccess ? [] : ['error_' + Math.floor(Math.random() * 3)],
      verificationRef: isSuccess ? `verify-${i}` : undefined,
      timestamp: new Date().toISOString(),
      isSynthetic: false
    });
  }
  
  return observations;
}
