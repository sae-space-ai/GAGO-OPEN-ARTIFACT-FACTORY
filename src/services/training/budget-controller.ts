// GAGO Open Artifact Factory - Resource Budget Controller
// Phase 9: JOULE FREE TRAINING CENTER

import type { GlobalBudget } from '../../types/training';

/**
 * Configuración inicial del presupuesto global
 */
export const INITIAL_GLOBAL_BUDGET: GlobalBudget = {
  maxConcurrentJobs: 10,
  maxTotalMemoryMB: 4096, // 4 GB
  maxTotalDurationMs: 3600000, // 1 hora por ciclo
  currentConcurrentJobs: 0,
  currentMemoryMB: 0,
  currentDurationMs: 0,
  lastUpdated: new Date().toISOString()
};

/**
 * Verifica si hay capacidad global disponible
 */
export function hasGlobalCapacity(
  budget: GlobalBudget,
  requestedMemoryMB: number,
  requestedDurationMs: number
): { available: boolean; reason?: string } {
  // Verificar trabajos concurrentes
  if (budget.currentConcurrentJobs >= budget.maxConcurrentJobs) {
    return {
      available: false,
      reason: `Límite de trabajos concurrentes alcanzado (${budget.maxConcurrentJobs})`
    };
  }

  // Verificar memoria
  const projectedMemory = budget.currentMemoryMB + requestedMemoryMB;
  if (projectedMemory > budget.maxTotalMemoryMB) {
    return {
      available: false,
      reason: `Memoria proyectada (${projectedMemory}MB) excede el límite global (${budget.maxTotalMemoryMB}MB)`
    };
  }

  // Verificar duración
  const projectedDuration = budget.currentDurationMs + requestedDurationMs;
  if (projectedDuration > budget.maxTotalDurationMs) {
    return {
      available: false,
      reason: `Duración proyectada (${projectedDuration}ms) excede el límite global (${budget.maxTotalDurationMs}ms)`
    };
  }

  return { available: true };
}

/**
 * Reserva recursos globales para un trabajo
 */
export function reserveGlobalResources(
  budget: GlobalBudget,
  memoryMB: number,
  durationMs: number
): GlobalBudget {
  return {
    ...budget,
    currentConcurrentJobs: budget.currentConcurrentJobs + 1,
    currentMemoryMB: budget.currentMemoryMB + memoryMB,
    currentDurationMs: budget.currentDurationMs + durationMs,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Libera recursos globales después de un trabajo
 */
export function releaseGlobalResources(
  budget: GlobalBudget,
  memoryMB: number,
  durationMs: number
): GlobalBudget {
  return {
    ...budget,
    currentConcurrentJobs: Math.max(0, budget.currentConcurrentJobs - 1),
    currentMemoryMB: Math.max(0, budget.currentMemoryMB - memoryMB),
    currentDurationMs: Math.max(0, budget.currentDurationMs - durationMs),
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Reinicia el presupuesto global (para nuevo ciclo)
 */
export function resetGlobalBudget(budget: GlobalBudget): GlobalBudget {
  return {
    ...budget,
    currentConcurrentJobs: 0,
    currentMemoryMB: 0,
    currentDurationMs: 0,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Calcula el porcentaje de uso del presupuesto global
 */
export function getBudgetUsagePercentage(budget: GlobalBudget): {
  concurrentPercentage: number;
  memoryPercentage: number;
  durationPercentage: number;
} {
  return {
    concurrentPercentage: (budget.currentConcurrentJobs / budget.maxConcurrentJobs) * 100,
    memoryPercentage: (budget.currentMemoryMB / budget.maxTotalMemoryMB) * 100,
    durationPercentage: (budget.currentDurationMs / budget.maxTotalDurationMs) * 100
  };
}

/**
 * Verifica si el presupuesto global está cerca del límite
 */
export function isBudgetNearLimit(budget: GlobalBudget, threshold: number = 80): boolean {
  const usage = getBudgetUsagePercentage(budget);
  return (
    usage.concurrentPercentage >= threshold ||
    usage.memoryPercentage >= threshold ||
    usage.durationPercentage >= threshold
  );
}

/**
 * Obtiene los recursos disponibles
 */
export function getAvailableResources(budget: GlobalBudget): {
  availableConcurrentJobs: number;
  availableMemoryMB: number;
  availableDurationMs: number;
} {
  return {
    availableConcurrentJobs: budget.maxConcurrentJobs - budget.currentConcurrentJobs,
    availableMemoryMB: budget.maxTotalMemoryMB - budget.currentMemoryMB,
    availableDurationMs: budget.maxTotalDurationMs - budget.currentDurationMs
  };
}

/**
 * Actualiza el presupuesto global con nuevos límites
 */
export function updateGlobalBudgetLimits(
  budget: GlobalBudget,
  newLimits: Partial<Omit<GlobalBudget, 'currentConcurrentJobs' | 'currentMemoryMB' | 'currentDurationMs' | 'lastUpdated'>>
): GlobalBudget {
  return {
    ...budget,
    ...newLimits,
    lastUpdated: new Date().toISOString()
  };
}
