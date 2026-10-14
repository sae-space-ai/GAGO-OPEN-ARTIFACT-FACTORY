// GAGO Open Artifact Factory - Training Quota Manager
// Phase 9: JOULE FREE TRAINING CENTER

import type { TrainingQuota, TrainingModality } from '../../types/training';

/**
 * Configuración inicial de cuotas por modalidad
 */
export const DEFAULT_QUOTAS: Record<TrainingModality, TrainingQuota['limits']> = {
  local_browser: {
    maxJobsPerMonth: 100,
    maxDurationPerJobMs: 600000, // 10 minutos
    maxTotalDurationMsPerMonth: 3600000, // 1 hora
    maxConcurrentJobs: 2,
    maxDatasetSizeMB: 10,
    maxExamplesPerJob: 50000
  },
  local_node: {
    maxJobsPerMonth: 50,
    maxDurationPerJobMs: 1800000, // 30 minutos
    maxTotalDurationMsPerMonth: 10800000, // 3 horas
    maxConcurrentJobs: 1,
    maxDatasetSizeMB: 50,
    maxExamplesPerJob: 100000
  },
  shared: {
    maxJobsPerMonth: 3,
    maxDurationPerJobMs: 600000, // 10 minutos
    maxTotalDurationMsPerMonth: 1800000, // 30 minutos
    maxConcurrentJobs: 1,
    maxDatasetSizeMB: 5,
    maxExamplesPerJob: 5000
  }
};

/**
 * Crea una cuota inicial para un usuario
 */
export function createInitialQuota(
  userId: string,
  modality: TrainingModality
): TrainingQuota {
  const now = new Date();
  const renewalDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return {
    userId,
    modality,
    limits: DEFAULT_QUOTAS[modality],
    usage: {
      jobsThisMonth: 0,
      durationThisMonthMs: 0,
      currentConcurrentJobs: 0
    },
    renewalDate: renewalDate.toISOString()
  };
}

/**
 * Verifica si un usuario puede iniciar un nuevo trabajo
 */
export function canStartJob(
  quota: TrainingQuota,
  estimatedDurationMs: number,
  datasetSizeMB: number,
  numExamples: number
): { allowed: boolean; reason?: string } {
  // Verificar límite de trabajos por mes
  if (quota.usage.jobsThisMonth >= quota.limits.maxJobsPerMonth) {
    return {
      allowed: false,
      reason: `Límite de trabajos mensuales alcanzado (${quota.limits.maxJobsPerMonth})`
    };
  }

  // Verificar duración máxima por trabajo
  if (estimatedDurationMs > quota.limits.maxDurationPerJobMs) {
    return {
      allowed: false,
      reason: `Duración estimada (${estimatedDurationMs}ms) excede el límite por trabajo (${quota.limits.maxDurationPerJobMs}ms)`
    };
  }

  // Verificar duración total mensual
  const projectedTotalDuration = quota.usage.durationThisMonthMs + estimatedDurationMs;
  if (projectedTotalDuration > quota.limits.maxTotalDurationMsPerMonth) {
    return {
      allowed: false,
      reason: `Duración total mensual proyectada (${projectedTotalDuration}ms) excede el límite (${quota.limits.maxTotalDurationMsPerMonth}ms)`
    };
  }

  // Verificar trabajos concurrentes
  if (quota.usage.currentConcurrentJobs >= quota.limits.maxConcurrentJobs) {
    return {
      allowed: false,
      reason: `Límite de trabajos concurrentes alcanzado (${quota.limits.maxConcurrentJobs})`
    };
  }

  // Verificar tamaño del dataset
  if (datasetSizeMB > quota.limits.maxDatasetSizeMB) {
    return {
      allowed: false,
      reason: `Tamaño del dataset (${datasetSizeMB}MB) excede el límite (${quota.limits.maxDatasetSizeMB}MB)`
    };
  }

  // Verificar número de ejemplos
  if (numExamples > quota.limits.maxExamplesPerJob) {
    return {
      allowed: false,
      reason: `Número de ejemplos (${numExamples}) excede el límite (${quota.limits.maxExamplesPerJob})`
    };
  }

  return { allowed: true };
}

/**
 * Registra el inicio de un trabajo
 */
export function registerJobStart(quota: TrainingQuota): TrainingQuota {
  return {
    ...quota,
    usage: {
      ...quota.usage,
      jobsThisMonth: quota.usage.jobsThisMonth + 1,
      currentConcurrentJobs: quota.usage.currentConcurrentJobs + 1
    }
  };
}

/**
 * Registra la finalización de un trabajo
 */
export function registerJobEnd(quota: TrainingQuota, durationMs: number): TrainingQuota {
  return {
    ...quota,
    usage: {
      ...quota.usage,
      durationThisMonthMs: quota.usage.durationThisMonthMs + durationMs,
      currentConcurrentJobs: Math.max(0, quota.usage.currentConcurrentJobs - 1)
    }
  };
}

/**
 * Renueva las cuotas mensuales
 */
export function renewQuota(quota: TrainingQuota): TrainingQuota {
  const now = new Date();
  const renewalDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return {
    ...quota,
    usage: {
      jobsThisMonth: 0,
      durationThisMonthMs: 0,
      currentConcurrentJobs: quota.usage.currentConcurrentJobs
    },
    renewalDate: renewalDate.toISOString()
  };
}

/**
 * Calcula el porcentaje de uso de cuota
 */
export function getQuotaUsagePercentage(quota: TrainingQuota): {
  jobsPercentage: number;
  durationPercentage: number;
  concurrentPercentage: number;
} {
  return {
    jobsPercentage: (quota.usage.jobsThisMonth / quota.limits.maxJobsPerMonth) * 100,
    durationPercentage: (quota.usage.durationThisMonthMs / quota.limits.maxTotalDurationMsPerMonth) * 100,
    concurrentPercentage: (quota.usage.currentConcurrentJobs / quota.limits.maxConcurrentJobs) * 100
  };
}

/**
 * Verifica si las cuotas necesitan renovación
 */
export function needsRenewal(quota: TrainingQuota): boolean {
  const now = new Date();
  const renewalDate = new Date(quota.renewalDate);
  return now >= renewalDate;
}

/**
 * Obtiene el tiempo restante hasta la renovación
 */
export function getTimeUntilRenewal(quota: TrainingQuota): number {
  const now = new Date().getTime();
  const renewalDate = new Date(quota.renewalDate).getTime();
  return Math.max(0, renewalDate - now);
}
