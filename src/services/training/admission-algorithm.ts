// GAGO Open Artifact Factory - Training Admission Algorithm
// Phase 9: JOULE FREE TRAINING CENTER

import type { 
  TrainingJob, 
  TrainingAlgorithm, 
  TrainingDataset, 
  TrainingQuota,
  TrainingModality 
} from '../../types/training';
import { canStartJob, registerJobStart } from './quota-manager';
import { hasGlobalCapacity, reserveGlobalResources } from './budget-controller';
import type { GlobalBudget } from '../../types/training';
import { generateId } from '../storage';

/**
 * Resultado de la admisión de un trabajo
 */
export interface AdmissionResult {
  admitted: boolean;
  job?: TrainingJob;
  reason?: string;
  estimatedStartTime?: string;
}

/**
 * Algoritmo maestro de admisión de trabajos de entrenamiento
 */
export function admitFreeTrainingJob(
  userId: string,
  algorithm: TrainingAlgorithm,
  dataset: TrainingDataset,
  modality: TrainingModality,
  parameters: Record<string, any>,
  quota: TrainingQuota,
  globalBudget: GlobalBudget
): AdmissionResult {
  // Paso 1: Validar algoritmo
  if (!algorithm.compatible) {
    return {
      admitted: false,
      reason: `El algoritmo ${algorithm.name} no es compatible con el entrenamiento gratuito`
    };
  }

  // Paso 2: Validar dataset
  if (!dataset.validated) {
    return {
      admitted: false,
      reason: 'El dataset no ha sido validado'
    };
  }

  // Paso 3: Validar permisos y privacidad
  if (dataset.ownerId !== userId && modality === 'shared') {
    return {
      admitted: false,
      reason: 'No tienes permisos para usar este dataset en entrenamiento compartido'
    };
  }

  // Paso 4: Estimar recursos necesarios
  const estimatedResources = estimateTrainingResources(algorithm, dataset, parameters);

  // Paso 5: Comprobar cuota individual
  const quotaCheck = canStartJob(
    quota,
    estimatedResources.durationMs,
    dataset.size / (1024 * 1024),
    dataset.size // Asumimos 1 byte por ejemplo para simplificar
  );

  if (!quotaCheck.allowed) {
    return {
      admitted: false,
      reason: quotaCheck.reason
    };
  }

  // Paso 6: Comprobar presupuesto global (solo para modalidad compartida)
  if (modality === 'shared') {
    const budgetCheck = hasGlobalCapacity(
      globalBudget,
      estimatedResources.memoryMB,
      estimatedResources.durationMs
    );

    if (!budgetCheck.available) {
      return {
        admitted: false,
        reason: budgetCheck.reason
      };
    }
  }

  // Paso 7: Verificar disponibilidad del ejecutor
  if (modality === 'shared') {
    // En un sistema real, aquí se verificaría la disponibilidad del ejecutor remoto
    // Por ahora, asumimos que está disponible si hay presupuesto global
  }

  // Paso 8: Crear el trabajo
  const job: TrainingJob = {
    id: generateId(),
    userId,
    algorithmId: algorithm.id,
    datasetId: dataset.id,
    modality,
    status: 'QUEUED',
    parameters,
    estimatedResources,
    createdAt: new Date().toISOString()
  };

  // Paso 9: Estimar tiempo de inicio
  const estimatedStartTime = new Date(Date.now() + 5000).toISOString(); // 5 segundos de cola estimada

  return {
    admitted: true,
    job,
    estimatedStartTime
  };
}

/**
 * Estima los recursos necesarios para un entrenamiento
 */
export function estimateTrainingResources(
  algorithm: TrainingAlgorithm,
  dataset: TrainingDataset,
  parameters: Record<string, any>
): {
  memoryMB: number;
  durationMs: number;
  costUnits: number;
} {
  // Estimación basada en el algoritmo y el tamaño del dataset
  const datasetSizeMB = dataset.size / (1024 * 1024);
  
  // Memoria base del algoritmo + memoria proporcional al dataset
  const baseMemory = algorithm.requirements.minMemoryMB || 64;
  const datasetMemory = datasetSizeMB * 2; // 2 MB por cada MB de dataset
  const memoryMB = Math.ceil(baseMemory + datasetMemory);

  // Duración estimada basada en el tamaño del dataset y complejidad del algoritmo
  const baseDuration = 10000; // 10 segundos base
  const datasetDuration = datasetSizeMB * 1000; // 1 segundo por MB
  const complexityFactor = getAlgorithmComplexityFactor(algorithm.type);
  const durationMs = Math.ceil((baseDuration + datasetDuration) * complexityFactor);

  // Coste en unidades abstractas (para comparación entre algoritmos)
  const costUnits = Math.ceil((memoryMB * durationMs) / 1000000);

  return {
    memoryMB: Math.min(memoryMB, 1024), // Límite de 1 GB
    durationMs: Math.min(durationMs, 1800000), // Límite de 30 minutos
    costUnits
  };
}

/**
 * Factor de complejidad por tipo de algoritmo
 */
function getAlgorithmComplexityFactor(type: string): number {
  const factors: Record<string, number> = {
    'policy_optimization': 1.5,
    'contextual_bandit': 2.0,
    'classification': 1.0,
    'regression': 0.8,
    'cost_estimation': 1.2,
    'latency_prediction': 1.0,
    'route_selection': 1.8,
    'incremental_learning': 1.3,
    'policy_evaluation': 1.5,
    'deterministic_baseline': 0.5
  };

  return factors[type] || 1.0;
}

/**
 * Admite y prepara un trabajo para ejecución
 */
export function admitAndPrepareJob(
  userId: string,
  algorithm: TrainingAlgorithm,
  dataset: TrainingDataset,
  modality: TrainingModality,
  parameters: Record<string, any>,
  quota: TrainingQuota,
  globalBudget: GlobalBudget
): {
  admitted: boolean;
  job?: TrainingJob;
  updatedQuota?: TrainingQuota;
  updatedBudget?: GlobalBudget;
  reason?: string;
} {
  // Admitir el trabajo
  const admission = admitFreeTrainingJob(
    userId,
    algorithm,
    dataset,
    modality,
    parameters,
    quota,
    globalBudget
  );

  if (!admission.admitted || !admission.job) {
    return {
      admitted: false,
      reason: admission.reason
    };
  }

  // Actualizar cuota individual
  const updatedQuota = registerJobStart(quota);

  // Actualizar presupuesto global (solo para modalidad compartida)
  let updatedBudget = globalBudget;
  if (modality === 'shared') {
    updatedBudget = reserveGlobalResources(
      globalBudget,
      admission.job.estimatedResources.memoryMB,
      admission.job.estimatedResources.durationMs
    );
  }

  // Cambiar estado a PREPARING
  const preparedJob: TrainingJob = {
    ...admission.job,
    status: 'PREPARING'
  };

  return {
    admitted: true,
    job: preparedJob,
    updatedQuota,
    updatedBudget
  };
}

/**
 * Valida los parámetros de un trabajo antes de la admisión
 */
export function validateJobParameters(
  algorithm: TrainingAlgorithm,
  parameters: Record<string, any>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validar que todos los parámetros requeridos estén presentes
  for (const [key, defaultValue] of Object.entries(algorithm.parameters)) {
    if (!(key in parameters)) {
      errors.push(`Parámetro requerido faltante: ${key}`);
    }
  }

  // Validar tipos de parámetros
  for (const [key, value] of Object.entries(parameters)) {
    const expectedType = typeof algorithm.parameters[key];
    if (expectedType !== 'undefined' && typeof value !== expectedType) {
      errors.push(`Tipo incorrecto para ${key}: esperado ${expectedType}, recibido ${typeof value}`);
    }
  }

  // Validar rangos de parámetros
  if (parameters.learningRate !== undefined) {
    if (parameters.learningRate <= 0 || parameters.learningRate > 1) {
      errors.push('learningRate debe estar entre 0 y 1');
    }
  }

  if (parameters.iterations !== undefined) {
    if (parameters.iterations <= 0 || parameters.iterations > 100000) {
      errors.push('iterations debe estar entre 1 y 100000');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Calcula la prioridad de un trabajo en la cola
 */
export function calculateJobPriority(
  job: TrainingJob,
  userQuota: TrainingQuota
): number {
  let priority = 0;

  // Prioridad base por tiempo de espera
  const waitTimeMs = Date.now() - new Date(job.createdAt).getTime();
  priority += waitTimeMs / 1000; // 1 punto por segundo de espera

  // Prioridad por uso de cuota (menor uso = mayor prioridad)
  const quotaUsagePercent = (userQuota.usage.jobsThisMonth / userQuota.limits.maxJobsPerMonth) * 100;
  priority += (100 - quotaUsagePercent) / 10;

  // Prioridad por modalidad (local tiene prioridad sobre compartido)
  if (job.modality === 'local_browser' || job.modality === 'local_node') {
    priority += 50;
  }

  return priority;
}
