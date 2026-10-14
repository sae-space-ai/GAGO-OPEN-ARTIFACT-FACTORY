// GAGO Open Artifact Factory - Training Algorithm Registry
// Phase 9: JOULE FREE TRAINING CENTER

import type { TrainingAlgorithm, AlgorithmType } from '../../types/training';
import { generateId } from '../storage';

/**
 * Catálogo inicial de algoritmos de entrenamiento compatibles
 */
export function getInitialAlgorithms(): TrainingAlgorithm[] {
  const now = new Date().toISOString();

  return [
    {
      id: 'algo-policy-optimization',
      name: 'Optimización de Políticas JOULE',
      version: '1.0.0',
      type: 'policy_optimization',
      description: 'Optimiza políticas de selección de rutas mediante bandido contextual',
      parameters: {
        learningRate: 0.01,
        explorationRate: 0.1,
        iterations: 1000
      },
      requirements: {
        minMemoryMB: 64,
        maxDurationMs: 300000,
        maxDatasetSize: 10000,
        requiresGPU: false
      },
      compatible: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'algo-contextual-bandit',
      name: 'Bandido Contextual Restringido',
      version: '1.0.0',
      type: 'contextual_bandit',
      description: 'Algoritmo de bandido contextual con restricciones de calidad',
      parameters: {
        explorationFactor: 0.2,
        regularization: 0.01,
        batchSize: 32
      },
      requirements: {
        minMemoryMB: 128,
        maxDurationMs: 600000,
        maxDatasetSize: 50000,
        requiresGPU: false
      },
      compatible: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'algo-classification',
      name: 'Clasificación Sencilla',
      version: '1.0.0',
      type: 'classification',
      description: 'Clasificador basado en regresión logística para tareas simples',
      parameters: {
        maxIterations: 100,
        tolerance: 0.001
      },
      requirements: {
        minMemoryMB: 32,
        maxDurationMs: 120000,
        maxDatasetSize: 5000,
        requiresGPU: false
      },
      compatible: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'algo-regression',
      name: 'Regresión Básica',
      version: '1.0.0',
      type: 'regression',
      description: 'Regresión lineal para estimación de valores continuos',
      parameters: {
        learningRate: 0.01,
        epochs: 100
      },
      requirements: {
        minMemoryMB: 32,
        maxDurationMs: 120000,
        maxDatasetSize: 5000,
        requiresGPU: false
      },
      compatible: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'algo-cost-estimation',
      name: 'Estimación de Coste',
      version: '1.0.0',
      type: 'cost_estimation',
      description: 'Predice el coste de operaciones basado en características',
      parameters: {
        features: ['duration', 'complexity', 'resource_usage'],
        method: 'linear'
      },
      requirements: {
        minMemoryMB: 64,
        maxDurationMs: 180000,
        maxDatasetSize: 10000,
        requiresGPU: false
      },
      compatible: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'algo-latency-prediction',
      name: 'Predicción de Latencia',
      version: '1.0.0',
      type: 'latency_prediction',
      description: 'Estima latencia de rutas basado en historial',
      parameters: {
        windowSize: 100,
        smoothingFactor: 0.3
      },
      requirements: {
        minMemoryMB: 64,
        maxDurationMs: 180000,
        maxDatasetSize: 10000,
        requiresGPU: false
      },
      compatible: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'algo-route-selection',
      name: 'Selección Adaptativa de Rutas',
      version: '1.0.0',
      type: 'route_selection',
      description: 'Aprende a seleccionar rutas óptimas mediante refuerzo',
      parameters: {
        discountFactor: 0.99,
        explorationRate: 0.1,
        updateFrequency: 10
      },
      requirements: {
        minMemoryMB: 128,
        maxDurationMs: 600000,
        maxDatasetSize: 20000,
        requiresGPU: false
      },
      compatible: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'algo-incremental-learning',
      name: 'Aprendizaje Incremental',
      version: '1.0.0',
      type: 'incremental_learning',
      description: 'Actualiza modelos existentes con nuevos datos',
      parameters: {
        learningRate: 0.001,
        batchSize: 16
      },
      requirements: {
        minMemoryMB: 64,
        maxDurationMs: 300000,
        maxDatasetSize: 10000,
        requiresGPU: false
      },
      compatible: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'algo-policy-evaluation',
      name: 'Evaluación de Políticas',
      version: '1.0.0',
      type: 'policy_evaluation',
      description: 'Evalúa el rendimiento de políticas candidatas',
      parameters: {
        evaluationSteps: 1000,
        confidenceLevel: 0.95
      },
      requirements: {
        minMemoryMB: 64,
        maxDurationMs: 300000,
        maxDatasetSize: 10000,
        requiresGPU: false
      },
      compatible: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'algo-deterministic-baseline',
      name: 'Referencia Determinista',
      version: '1.0.0',
      type: 'deterministic_baseline',
      description: 'Algoritmo de referencia para comparación',
      parameters: {
        strategy: 'greedy'
      },
      requirements: {
        minMemoryMB: 16,
        maxDurationMs: 60000,
        maxDatasetSize: 1000,
        requiresGPU: false
      },
      compatible: true,
      createdAt: now,
      updatedAt: now
    }
  ];
}

/**
 * Instala los algoritmos iniciales de forma idempotente
 */
export function installInitialAlgorithms(existing: TrainingAlgorithm[]): TrainingAlgorithm[] {
  const existingIds = new Set(existing.map(a => a.id));
  const initial = getInitialAlgorithms();
  const toAdd = initial.filter(a => !existingIds.has(a.id));
  return [...existing, ...toAdd];
}

/**
 * Busca un algoritmo por ID
 */
export function findAlgorithm(algorithms: TrainingAlgorithm[], id: string): TrainingAlgorithm | undefined {
  return algorithms.find(a => a.id === id);
}

/**
 * Busca algoritmos por tipo
 */
export function findAlgorithmsByType(
  algorithms: TrainingAlgorithm[], 
  type: AlgorithmType
): TrainingAlgorithm[] {
  return algorithms.filter(a => a.type === type);
}

/**
 * Filtra algoritmos compatibles
 */
export function getCompatibleAlgorithms(algorithms: TrainingAlgorithm[]): TrainingAlgorithm[] {
  return algorithms.filter(a => a.compatible);
}

/**
 * Valida los parámetros de un algoritmo
 */
export function validateAlgorithmParameters(
  algorithm: TrainingAlgorithm,
  parameters: Record<string, any>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validar que todos los parámetros requeridos estén presentes
  for (const key of Object.keys(algorithm.parameters)) {
    if (!(key in parameters)) {
      errors.push(`Parámetro requerido faltante: ${key}`);
    }
  }

  // Validar tipos de parámetros
  for (const [key, value] of Object.entries(parameters)) {
    const expectedType = typeof algorithm.parameters[key];
    if (typeof value !== expectedType) {
      errors.push(`Tipo incorrecto para ${key}: esperado ${expectedType}, recibido ${typeof value}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
