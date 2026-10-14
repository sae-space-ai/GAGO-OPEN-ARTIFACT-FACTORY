// GAGO Open Artifact Factory - Free Training Center
// Phase 9: JOULE FREE TRAINING CENTER

import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { getInitialAlgorithms, findAlgorithm } from '../services/training/algorithm-registry';
import { createTrainingDataset, generateSyntheticDataset, validateDataset } from '../services/training/dataset-manager';
import { createInitialQuota, getQuotaUsagePercentage, canStartJob } from '../services/training/quota-manager';
import { INITIAL_GLOBAL_BUDGET, getBudgetUsagePercentage } from '../services/training/budget-controller';
import { TrainingJobScheduler, createTrainingJob } from '../services/training/job-scheduler';
import { executeBrowserTraining } from '../services/training/browser-executor';
import { evaluateTrainingJob } from '../services/training/evaluation-engine';
import { admitFreeTrainingJob, estimateTrainingResources } from '../services/training/admission-algorithm';
import { getInitialDonationState, DONATION_NOTICES, SUPPORTED_PAYMENT_PROVIDERS } from '../services/training/donation-manager';
import type { TrainingAlgorithm, TrainingDataset, TrainingJob, TrainingQuota, TrainingModality } from '../types/training';
import { TRAINING_MODALITY_LABELS, TRAINING_JOB_STATUS_LABELS, ALGORITHM_TYPE_LABELS } from '../types/training';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Cpu, 
  Database, 
  Zap,
  TrendingUp,
  AlertCircle,
  Gift
} from 'lucide-react';

export default function FreeTrainingCenter() {
  const { store } = useData();
  
  // Estado local
  const [algorithms] = useState<TrainingAlgorithm[]>(getInitialAlgorithms());
  const [datasets, setDatasets] = useState<TrainingDataset[]>([]);
  const [jobs, setJobs] = useState<TrainingJob[]>([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<TrainingAlgorithm | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<TrainingDataset | null>(null);
  const [selectedModality, setSelectedModality] = useState<TrainingModality>('local_browser');
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentJob, setCurrentJob] = useState<TrainingJob | null>(null);
  const [quota] = useState<TrainingQuota>(createInitialQuota('user-1', 'local_browser'));
  const [globalBudget] = useState(INITIAL_GLOBAL_BUDGET);
  const [donationState] = useState(getInitialDonationState());
  const [activeTab, setActiveTab] = useState<'training' | 'history' | 'donations'>('training');

  const scheduler = new TrainingJobScheduler();

  // Cargar datasets de ejemplo
  useEffect(() => {
    const exampleDataset = createTrainingDataset(
      'Dataset de Ejemplo',
      'Dataset sintético generado para demostración',
      generateSyntheticDataset(100, ['feature1', 'feature2', 'feature3'], ['class_a', 'class_b']),
      'json',
      'user-1',
      true
    );
    setDatasets([exampleDataset]);
  }, []);

  // Manejar selección de algoritmo
  const handleAlgorithmSelect = (algorithmId: string) => {
    const algorithm = findAlgorithm(algorithms, algorithmId);
    if (algorithm) {
      setSelectedAlgorithm(algorithm);
      setParameters(algorithm.parameters);
    }
  };

  // Crear dataset sintético
  const handleCreateSyntheticDataset = () => {
    const numExamples = parseInt(prompt('Número de ejemplos (100-10000):') || '1000');
    if (numExamples < 100 || numExamples > 10000) {
      alert('El número de ejemplos debe estar entre 100 y 10000');
      return;
    }

    const dataset = createTrainingDataset(
      `Dataset Sintético ${datasets.length + 1}`,
      `Dataset sintético con ${numExamples} ejemplos`,
      generateSyntheticDataset(numExamples, ['feature1', 'feature2', 'feature3'], ['class_a', 'class_b', 'class_c']),
      'json',
      'user-1',
      true
    );

    setDatasets([...datasets, dataset]);
  };

  // Iniciar entrenamiento
  const handleStartTraining = async () => {
    if (!selectedAlgorithm || !selectedDataset) {
      alert('Por favor, selecciona un algoritmo y un dataset');
      return;
    }

    // Validar dataset
    const validation = validateDataset(selectedDataset, quota.limits.maxDatasetSizeMB);
    if (!validation.valid) {
      alert(`Dataset inválido: ${validation.errors.join(', ')}`);
      return;
    }

    // Verificar cuota
    const estimatedResources = estimateTrainingResources(selectedAlgorithm, selectedDataset, parameters);
    const quotaCheck = canStartJob(quota, estimatedResources.durationMs, selectedDataset.size / (1024 * 1024), 1000);
    
    if (!quotaCheck.allowed) {
      alert(`No se puede iniciar el entrenamiento: ${quotaCheck.reason}`);
      return;
    }

    // Crear trabajo
    const job = createTrainingJob(
      'user-1',
      selectedAlgorithm.id,
      selectedDataset.id,
      selectedModality,
      parameters,
      estimatedResources
    );

    setCurrentJob(job);
    setIsTraining(true);
    setProgress(0);

    // Admitir trabajo
    const admission = admitFreeTrainingJob(
      'user-1',
      selectedAlgorithm,
      selectedDataset,
      selectedModality,
      parameters,
      quota,
      globalBudget
    );

    if (!admission.admitted) {
      alert(`Trabajo no admitido: ${admission.reason}`);
      setIsTraining(false);
      setCurrentJob(null);
      return;
    }

    // Ejecutar entrenamiento
    try {
      const result = await executeBrowserTraining(
        admission.job!,
        selectedAlgorithm,
        JSON.parse(JSON.stringify(selectedDataset)), // Simular carga de datos
        (p) => setProgress(p * 100)
      );

      if (result.success) {
        // Evaluar resultados
        const evaluation = evaluateTrainingJob(admission.job!, selectedAlgorithm, result.results);
        
        const completedJob: TrainingJob = {
          ...admission.job!,
          status: 'COMPLETED',
          results: result.results,
          evaluation,
          actualResources: {
            memoryMB: result.memoryUsedMB || estimatedResources.memoryMB,
            durationMs: result.durationMs,
            costUnits: estimatedResources.costUnits
          },
          completedAt: new Date().toISOString()
        };

        setJobs([...jobs, completedJob]);
        alert(`Entrenamiento completado exitosamente en ${(result.durationMs / 1000).toFixed(2)}s`);
      } else {
        const failedJob: TrainingJob = {
          ...admission.job!,
          status: 'FAILED',
          error: result.error,
          completedAt: new Date().toISOString()
        };

        setJobs([...jobs, failedJob]);
        alert(`Entrenamiento fallido: ${result.error}`);
      }
    } catch (error) {
      alert(`Error durante el entrenamiento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsTraining(false);
      setProgress(0);
      setCurrentJob(null);
    }
  };

  // Cancelar entrenamiento
  const handleCancelTraining = () => {
    if (currentJob) {
      scheduler.cancelJob(currentJob.id);
      const cancelledJob: TrainingJob = {
        ...currentJob,
        status: 'CANCELLED',
        cancelledAt: new Date().toISOString()
      };
      setJobs([...jobs, cancelledJob]);
    }
    setIsTraining(false);
    setProgress(0);
    setCurrentJob(null);
  };

  // Estadísticas de cuota
  const quotaUsage = getQuotaUsagePercentage(quota);
  const budgetUsage = getBudgetUsagePercentage(globalBudget);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
          <Zap className="w-8 h-8 text-green-600 dark:text-green-400" />
          JOULE Free Training Center
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Entrenamiento gratuito y limitado de algoritmos de IA
        </p>
      </div>

      {/* Pestañas */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('training')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'training'
              ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Entrenamiento
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Historial ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab('donations')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'donations'
              ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Gift className="w-4 h-4 inline mr-2" />
          Donaciones
        </button>
      </div>

      {/* Contenido de la pestaña activa */}
      {activeTab === 'training' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel izquierdo: Configuración */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selección de algoritmo */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Cpu className="w-5 h-5" />
                Seleccionar Algoritmo
              </h2>
              <select
                value={selectedAlgorithm?.id || ''}
                onChange={(e) => handleAlgorithmSelect(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="">Selecciona un algoritmo...</option>
                {algorithms.map(algo => (
                  <option key={algo.id} value={algo.id}>
                    {algo.name} ({ALGORITHM_TYPE_LABELS[algo.type]})
                  </option>
                ))}
              </select>
              {selectedAlgorithm && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  {selectedAlgorithm.description}
                </p>
              )}
            </div>

            {/* Selección de dataset */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Database className="w-5 h-5" />
                Seleccionar Dataset
              </h2>
              <select
                value={selectedDataset?.id || ''}
                onChange={(e) => setSelectedDataset(datasets.find(d => d.id === e.target.value) || null)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white mb-3"
              >
                <option value="">Selecciona un dataset...</option>
                {datasets.map(dataset => (
                  <option key={dataset.id} value={dataset.id}>
                    {dataset.name} ({(dataset.size / 1024).toFixed(2)} KB)
                  </option>
                ))}
              </select>
              <button
                onClick={handleCreateSyntheticDataset}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Crear Dataset Sintético
              </button>
            </div>

            {/* Modalidad y parámetros */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Configuración
              </h2>
              
              {/* Modalidad */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Modalidad de Entrenamiento
                </label>
                <select
                  value={selectedModality}
                  onChange={(e) => setSelectedModality(e.target.value as TrainingModality)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  {Object.entries(TRAINING_MODALITY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Parámetros */}
              {selectedAlgorithm && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Parámetros del Algoritmo
                  </label>
                  <div className="space-y-2">
                    {Object.entries(selectedAlgorithm.parameters).map(([key, defaultValue]) => (
                      <div key={key} className="flex items-center gap-2">
                        <label className="text-sm text-slate-600 dark:text-slate-400 w-32">
                          {key}:
                        </label>
                        <input
                          type="number"
                          value={parameters[key] ?? defaultValue}
                          onChange={(e) => setParameters({ ...parameters, [key]: parseFloat(e.target.value) })}
                          className="flex-1 px-3 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                          step="0.01"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Controles de ejecución */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Ejecución
              </h2>
              
              {isTraining ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                    <span className="text-slate-900 dark:text-white">Entrenamiento en progreso...</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Progreso: {progress.toFixed(1)}%
                  </p>
                  <button
                    onClick={handleCancelTraining}
                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Pause className="w-4 h-4" />
                    Cancelar Entrenamiento
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleStartTraining}
                  disabled={!selectedAlgorithm || !selectedDataset}
                  className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Iniciar Entrenamiento
                </button>
              )}
            </div>
          </div>

          {/* Panel derecho: Estadísticas */}
          <div className="space-y-6">
            {/* Cuota individual */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                Tu Cuota Gratuita
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                    <span>Trabajos</span>
                    <span>{quota.usage.jobsThisMonth}/{quota.limits.maxJobsPerMonth}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${quotaUsage.jobsPercentage}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                    <span>Duración</span>
                    <span>{(quota.usage.durationThisMonthMs / 60000).toFixed(1)}/{quota.limits.maxTotalDurationMsPerMonth / 60000} min</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                    <div
                      className="bg-green-600 h-1.5 rounded-full"
                      style={{ width: `${quotaUsage.durationPercentage}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                    <span>Concurrentes</span>
                    <span>{quota.usage.currentConcurrentJobs}/{quota.limits.maxConcurrentJobs}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                    <div
                      className="bg-purple-600 h-1.5 rounded-full"
                      style={{ width: `${quotaUsage.concurrentPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Presupuesto global */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                Capacidad Global
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                    <span>Trabajos Activos</span>
                    <span>{globalBudget.currentConcurrentJobs}/{globalBudget.maxConcurrentJobs}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${budgetUsage.concurrentPercentage}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                    <span>Memoria</span>
                    <span>{globalBudget.currentMemoryMB}/{globalBudget.maxTotalMemoryMB} MB</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                    <div
                      className="bg-green-600 h-1.5 rounded-full"
                      style={{ width: `${budgetUsage.memoryPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-5">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Información Importante
              </h3>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                <li>• El entrenamiento es gratuito y limitado</li>
                <li>• Las cuotas se renuevan mensualmente</li>
                <li>• No se requiere donación para usar el servicio</li>
                <li>• Los resultados son tuyos y privados</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Historial de Entrenamientos
          </h2>
          {jobs.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400 text-center py-8">
              No hay entrenamientos en el historial
            </p>
          ) : (
            <div className="space-y-3">
              {jobs.map(job => (
                <div key={job.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {algorithms.find(a => a.id === job.algorithmId)?.name || 'Algoritmo desconocido'}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {new Date(job.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      job.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                      job.status === 'FAILED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                      job.status === 'CANCELLED' ? 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}>
                      {TRAINING_JOB_STATUS_LABELS[job.status]}
                    </span>
                  </div>
                  {job.evaluation && (
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      <p>{job.evaluation.details}</p>
                      {job.actualResources && (
                        <p className="text-xs mt-1">
                          Duración: {(job.actualResources.durationMs / 1000).toFixed(2)}s | 
                          Memoria: {job.actualResources.memoryMB}MB
                        </p>
                      )}
                    </div>
                  )}
                  {job.error && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                      Error: {job.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'donations' && (
        <div className="space-y-6">
          {/* Información sobre donaciones */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Donaciones Voluntarias
            </h2>
            
            {!donationState.enabled ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-400 mb-2">
                  El sistema de donaciones no está configurado
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  Cuando esté disponible, podrás contribuir voluntariamente al mantenimiento del servicio gratuito
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-600 dark:text-slate-400">
                  Las donaciones son completamente voluntarias y ayudan a mantener y ampliar el servicio gratuito.
                </p>
                
                {/* Proveedores de pago */}
                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Proveedores de Pago Disponibles
                  </h3>
                  <div className="space-y-2">
                    {SUPPORTED_PAYMENT_PROVIDERS.map(provider => (
                      <div key={provider.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{provider.name}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{provider.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          provider.supported 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                        }`}>
                          {provider.supported ? 'Disponible' : 'Próximamente'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Avisos legales */}
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Información Importante
                  </h3>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <li>• {DONATION_NOTICES.voluntary}</li>
                    <li>• {DONATION_NOTICES.noGuarantees}</li>
                    <li>• {DONATION_NOTICES.noTaxAdvice}</li>
                    <li>• {DONATION_NOTICES.privacy}</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Transparencia */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Transparencia
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Donaciones Totales</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {donationState.transparency.totalDonations.toFixed(2)} €
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Donantes</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {donationState.transparency.totalDonors}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                Objetivos de Sostenibilidad
              </h3>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                {donationState.transparency.sustainabilityGoals.map((goal, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
