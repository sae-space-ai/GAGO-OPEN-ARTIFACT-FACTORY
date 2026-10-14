// GAGO OPEN ARTIFACT FACTORY — JOULE RESOURCE OBSERVER
// Fase 12 — Observador ampliado de recursos y métricas

import type { ResourceObservation } from '../../types/joule-cognitive';
import { generateId } from '../storage';

/**
 * Observador de recursos ampliado
 * Registra métricas detalladas de operaciones de IA
 */
export class ResourceObserver {
  private observations: ResourceObservation[] = [];

  /**
   * Registra una nueva observación de recursos
   */
  recordObservation(params: {
    taskId: string;
    modelId: string;
    providerId: string;
    startTime: string;
    endTime: string;
    providerReportedDurationMs?: number;
    tokensGenerated?: number;
    tokensInput?: number;
    memoryUsageMB?: number;
    cpuUsagePercent?: number;
    energyConsumedMj?: number;
    status: 'success' | 'error' | 'timeout' | 'cancelled';
    errorMessage?: string;
    retryCount?: number;
  }): ResourceObservation {
    const totalDurationMs = new Date(params.endTime).getTime() - new Date(params.startTime).getTime();
    const browserObservedDurationMs = totalDurationMs;

    // Calcular velocidad de generación si hay datos suficientes
    let generationSpeed: number | undefined;
    if (params.tokensGenerated && totalDurationMs > 0) {
      generationSpeed = (params.tokensGenerated / totalDurationMs) * 1000; // tokens/second
    }

    const observation: ResourceObservation = {
      id: generateId(),
      taskId: params.taskId,
      modelId: params.modelId,
      providerId: params.providerId,
      startTime: params.startTime,
      endTime: params.endTime,
      totalDurationMs,
      providerReportedDurationMs: params.providerReportedDurationMs,
      browserObservedDurationMs,
      tokensGenerated: params.tokensGenerated,
      tokensInput: params.tokensInput,
      generationSpeed,
      memoryUsageMB: params.memoryUsageMB,
      cpuUsagePercent: params.cpuUsagePercent,
      energyConsumedMj: params.energyConsumedMj,
      status: params.status,
      errorMessage: params.errorMessage,
      retryCount: params.retryCount || 0
    };

    this.observations.push(observation);
    return observation;
  }

  /**
   * Obtiene todas las observaciones
   */
  getAllObservations(): ResourceObservation[] {
    return [...this.observations];
  }

  /**
   * Obtiene observaciones de una tarea específica
   */
  getObservationsByTask(taskId: string): ResourceObservation[] {
    return this.observations.filter(o => o.taskId === taskId);
  }

  /**
   * Obtiene observaciones de un modelo específico
   */
  getObservationsByModel(modelId: string): ResourceObservation[] {
    return this.observations.filter(o => o.modelId === modelId);
  }

  /**
   * Obtiene observaciones de un proveedor específico
   */
  getObservationsByProvider(providerId: string): ResourceObservation[] {
    return this.observations.filter(o => o.providerId === providerId);
  }

  /**
   * Obtiene observaciones por estado
   */
  getObservationsByStatus(status: 'success' | 'error' | 'timeout' | 'cancelled'): ResourceObservation[] {
    return this.observations.filter(o => o.status === status);
  }

  /**
   * Calcula estadísticas de latencia para un modelo
   */
  getLatencyStatistics(modelId: string): {
    count: number;
    averageMs: number;
    medianMs: number;
    p95Ms: number;
    p99Ms: number;
    minMs: number;
    maxMs: number;
  } {
    const observations = this.getObservationsByModel(modelId)
      .filter(o => o.status === 'success')
      .map(o => o.totalDurationMs)
      .sort((a, b) => a - b);

    if (observations.length === 0) {
      return {
        count: 0,
        averageMs: 0,
        medianMs: 0,
        p95Ms: 0,
        p99Ms: 0,
        minMs: 0,
        maxMs: 0
      };
    }

    const count = observations.length;
    const averageMs = observations.reduce((sum, d) => sum + d, 0) / count;
    const medianMs = this.percentile(observations, 50);
    const p95Ms = this.percentile(observations, 95);
    const p99Ms = this.percentile(observations, 99);
    const minMs = observations[0];
    const maxMs = observations[count - 1];

    return {
      count,
      averageMs,
      medianMs,
      p95Ms,
      p99Ms,
      minMs,
      maxMs
    };
  }

  /**
   * Calcula el percentil de un array ordenado
   */
  private percentile(sortedArray: number[], p: number): number {
    if (sortedArray.length === 0) return 0;
    const index = (p / 100) * (sortedArray.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    
    if (upper >= sortedArray.length) return sortedArray[sortedArray.length - 1];
    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
  }

  /**
   * Calcula estadísticas de uso de tokens para un modelo
   */
  getTokenStatistics(modelId: string): {
    count: number;
    averageInputTokens: number;
    averageOutputTokens: number;
    totalInputTokens: number;
    totalOutputTokens: number;
  } {
    const observations = this.getObservationsByModel(modelId)
      .filter(o => o.status === 'success' && o.tokensInput !== undefined && o.tokensGenerated !== undefined);

    if (observations.length === 0) {
      return {
        count: 0,
        averageInputTokens: 0,
        averageOutputTokens: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0
      };
    }

    const totalInputTokens = observations.reduce((sum, o) => sum + (o.tokensInput || 0), 0);
    const totalOutputTokens = observations.reduce((sum, o) => sum + (o.tokensGenerated || 0), 0);

    return {
      count: observations.length,
      averageInputTokens: totalInputTokens / observations.length,
      averageOutputTokens: totalOutputTokens / observations.length,
      totalInputTokens,
      totalOutputTokens
    };
  }

  /**
   * Calcula la tasa de éxito para un modelo
   */
  getSuccessRate(modelId: string): {
    total: number;
    successful: number;
    failed: number;
    timeout: number;
    cancelled: number;
    successRate: number;
  } {
    const observations = this.getObservationsByModel(modelId);
    const total = observations.length;
    const successful = observations.filter(o => o.status === 'success').length;
    const failed = observations.filter(o => o.status === 'error').length;
    const timeout = observations.filter(o => o.status === 'timeout').length;
    const cancelled = observations.filter(o => o.status === 'cancelled').length;

    return {
      total,
      successful,
      failed,
      timeout,
      cancelled,
      successRate: total > 0 ? successful / total : 0
    };
  }

  /**
   * Compara el rendimiento de múltiples modelos
   */
  compareModelPerformance(modelIds: string[]): {
    modelId: string;
    averageLatencyMs: number;
    successRate: number;
    totalObservations: number;
    tokensPerSecond: number;
  }[] {
    return modelIds.map(modelId => {
      const latencyStats = this.getLatencyStatistics(modelId);
      const successStats = this.getSuccessRate(modelId);
      const tokenStats = this.getTokenStatistics(modelId);

      // Calcular tokens por segundo promedio
      const observations = this.getObservationsByModel(modelId)
        .filter(o => o.status === 'success' && o.generationSpeed !== undefined);
      
      const tokensPerSecond = observations.length > 0
        ? observations.reduce((sum, o) => sum + (o.generationSpeed || 0), 0) / observations.length
        : 0;

      return {
        modelId,
        averageLatencyMs: latencyStats.averageMs,
        successRate: successStats.successRate,
        totalObservations: successStats.total,
        tokensPerSecond
      };
    });
  }

  /**
   * Detecta anomalías en las observaciones
   */
  detectAnomalies(modelId: string): {
    latencyAnomalies: ResourceObservation[];
    errorSpikes: { timestamp: string; count: number }[];
    performanceDegradation: boolean;
  } {
    const observations = this.getObservationsByModel(modelId);
    
    // Detectar anomalías de latencia (más de 3 desviaciones estándar)
    const successfulObs = observations.filter(o => o.status === 'success');
    const latencies = successfulObs.map(o => o.totalDurationMs);
    
    let latencyAnomalies: ResourceObservation[] = [];
    if (latencies.length > 1) {
      const mean = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
      const variance = latencies.reduce((sum, l) => sum + Math.pow(l - mean, 2), 0) / latencies.length;
      const stdDev = Math.sqrt(variance);
      const threshold = mean + 3 * stdDev;
      
      latencyAnomalies = successfulObs.filter(o => o.totalDurationMs > threshold);
    }

    // Detectar picos de errores (más de 3 errores en 1 hora)
    const errorSpikes: { timestamp: string; count: number }[] = [];
    const errors = observations.filter(o => o.status === 'error');
    
    if (errors.length >= 3) {
      // Agrupar errores por hora
      const errorsByHour: Record<string, number> = {};
      errors.forEach(e => {
        const hour = new Date(e.endTime).toISOString().slice(0, 13);
        errorsByHour[hour] = (errorsByHour[hour] || 0) + 1;
      });
      
      Object.entries(errorsByHour).forEach(([hour, count]) => {
        if (count >= 3) {
          errorSpikes.push({ timestamp: hour, count });
        }
      });
    }

    // Detectar degradación de rendimiento (últimas 10 observaciones vs promedio histórico)
    let performanceDegradation = false;
    if (successfulObs.length >= 20) {
      const recentObs = successfulObs.slice(-10);
      const historicalObs = successfulObs.slice(0, -10);
      
      const recentAvgLatency = recentObs.reduce((sum, o) => sum + o.totalDurationMs, 0) / recentObs.length;
      const historicalAvgLatency = historicalObs.reduce((sum, o) => sum + o.totalDurationMs, 0) / historicalObs.length;
      
      // Degradación si la latencia reciente es más del 50% mayor que el histórico
      performanceDegradation = recentAvgLatency > historicalAvgLatency * 1.5;
    }

    return {
      latencyAnomalies,
      errorSpikes,
      performanceDegradation
    };
  }

  /**
   * Obtiene estadísticas generales del observador
   */
  getOverallStatistics(): {
    totalObservations: number;
    successfulObservations: number;
    failedObservations: number;
    averageLatencyMs: number;
    totalTokensGenerated: number;
    totalTokensInput: number;
  } {
    const totalObservations = this.observations.length;
    const successfulObservations = this.observations.filter(o => o.status === 'success').length;
    const failedObservations = totalObservations - successfulObservations;
    
    const successfulObs = this.observations.filter(o => o.status === 'success');
    const averageLatencyMs = successfulObs.length > 0
      ? successfulObs.reduce((sum, o) => sum + o.totalDurationMs, 0) / successfulObs.length
      : 0;
    
    const totalTokensGenerated = this.observations.reduce((sum, o) => sum + (o.tokensGenerated || 0), 0);
    const totalTokensInput = this.observations.reduce((sum, o) => sum + (o.tokensInput || 0), 0);

    return {
      totalObservations,
      successfulObservations,
      failedObservations,
      averageLatencyMs,
      totalTokensGenerated,
      totalTokensInput
    };
  }

  /**
   * Exporta observaciones en formato JSON
   */
  exportObservations(modelId?: string): string {
    const observations = modelId ? this.getObservationsByModel(modelId) : this.observations;
    return JSON.stringify(observations, null, 2);
  }

  /**
   * Limpia observaciones antiguas (más de 30 días)
   */
  cleanupOldObservations(daysToKeep: number = 30): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const beforeCount = this.observations.length;
    this.observations = this.observations.filter(o => new Date(o.endTime) > cutoffDate);
    const removedCount = beforeCount - this.observations.length;
    
    return removedCount;
  }
}

// Instancia global del observador
export const resourceObserver = new ResourceObserver();
