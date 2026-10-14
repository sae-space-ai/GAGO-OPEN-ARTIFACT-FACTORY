// GAGO Open Artifact Factory - Training Job Scheduler
// Phase 9: JOULE FREE TRAINING CENTER

import type { TrainingJob, TrainingJobStatus } from '../../types/training';
import { generateId } from '../storage';

/**
 * Cola de trabajos de entrenamiento
 */
export class TrainingJobScheduler {
  private queue: TrainingJob[] = [];
  private runningJobs: Map<string, TrainingJob> = new Map();
  private completedJobs: TrainingJob[] = [];
  private failedJobs: TrainingJob[] = [];

  /**
   * Añade un trabajo a la cola
   */
  enqueue(job: TrainingJob): void {
    this.queue.push(job);
    this.sortQueue();
  }

  /**
   * Ordena la cola por prioridad y tiempo de creación
   */
  private sortQueue(): void {
    this.queue.sort((a, b) => {
      // Prioridad por tiempo de creación (FIFO)
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  /**
   * Obtiene el siguiente trabajo de la cola
   */
  dequeue(): TrainingJob | undefined {
    return this.queue.shift();
  }

  /**
   * Marca un trabajo como en ejecución
   */
  markAsRunning(jobId: string): TrainingJob | undefined {
    const jobIndex = this.queue.findIndex(j => j.id === jobId);
    if (jobIndex === -1) return undefined;

    const job = this.queue[jobIndex];
    this.queue.splice(jobIndex, 1);

    const runningJob: TrainingJob = {
      ...job,
      status: 'RUNNING',
      startedAt: new Date().toISOString()
    };

    this.runningJobs.set(jobId, runningJob);
    return runningJob;
  }

  /**
   * Marca un trabajo como completado
   */
  markAsCompleted(jobId: string, results?: any): TrainingJob | undefined {
    const job = this.runningJobs.get(jobId);
    if (!job) return undefined;

    const completedJob: TrainingJob = {
      ...job,
      status: 'COMPLETED',
      results,
      completedAt: new Date().toISOString()
    };

    this.runningJobs.delete(jobId);
    this.completedJobs.push(completedJob);
    return completedJob;
  }

  /**
   * Marca un trabajo como fallido
   */
  markAsFailed(jobId: string, error: string): TrainingJob | undefined {
    const job = this.runningJobs.get(jobId);
    if (!job) return undefined;

    const failedJob: TrainingJob = {
      ...job,
      status: 'FAILED',
      error,
      completedAt: new Date().toISOString()
    };

    this.runningJobs.delete(jobId);
    this.failedJobs.push(failedJob);
    return failedJob;
  }

  /**
   * Cancela un trabajo
   */
  cancelJob(jobId: string): TrainingJob | undefined {
    // Buscar en la cola
    const queueIndex = this.queue.findIndex(j => j.id === jobId);
    if (queueIndex !== -1) {
      const job = this.queue[queueIndex];
      this.queue.splice(queueIndex, 1);
      return {
        ...job,
        status: 'CANCELLED',
        cancelledAt: new Date().toISOString()
      };
    }

    // Buscar en trabajos en ejecución
    const job = this.runningJobs.get(jobId);
    if (job) {
      this.runningJobs.delete(jobId);
      return {
        ...job,
        status: 'CANCELLED',
        cancelledAt: new Date().toISOString()
      };
    }

    return undefined;
  }

  /**
   * Obtiene todos los trabajos en cola
   */
  getQueuedJobs(): TrainingJob[] {
    return [...this.queue];
  }

  /**
   * Obtiene todos los trabajos en ejecución
   */
  getRunningJobs(): TrainingJob[] {
    return Array.from(this.runningJobs.values());
  }

  /**
   * Obtiene todos los trabajos completados
   */
  getCompletedJobs(): TrainingJob[] {
    return [...this.completedJobs];
  }

  /**
   * Obtiene todos los trabajos fallidos
   */
  getFailedJobs(): TrainingJob[] {
    return [...this.failedJobs];
  }

  /**
   * Obtiene un trabajo por ID
   */
  getJob(jobId: string): TrainingJob | undefined {
    return (
      this.queue.find(j => j.id === jobId) ||
      this.runningJobs.get(jobId) ||
      this.completedJobs.find(j => j.id === jobId) ||
      this.failedJobs.find(j => j.id === jobId)
    );
  }

  /**
   * Obtiene trabajos por usuario
   */
  getJobsByUser(userId: string): TrainingJob[] {
    const allJobs = [
      ...this.queue,
      ...Array.from(this.runningJobs.values()),
      ...this.completedJobs,
      ...this.failedJobs
    ];
    return allJobs.filter(j => j.userId === userId);
  }

  /**
   * Obtiene estadísticas del planificador
   */
  getStatistics(): {
    queued: number;
    running: number;
    completed: number;
    failed: number;
    total: number;
  } {
    return {
      queued: this.queue.length,
      running: this.runningJobs.size,
      completed: this.completedJobs.length,
      failed: this.failedJobs.length,
      total: this.queue.length + this.runningJobs.size + this.completedJobs.length + this.failedJobs.length
    };
  }

  /**
   * Limpia trabajos antiguos completados o fallidos
   */
  cleanup(maxAgeMs: number = 86400000): void {
    const now = Date.now();
    
    this.completedJobs = this.completedJobs.filter(job => {
      const completedAt = job.completedAt ? new Date(job.completedAt).getTime() : 0;
      return (now - completedAt) < maxAgeMs;
    });

    this.failedJobs = this.failedJobs.filter(job => {
      const completedAt = job.completedAt ? new Date(job.completedAt).getTime() : 0;
      return (now - completedAt) < maxAgeMs;
    });
  }
}

/**
 * Crea un nuevo trabajo de entrenamiento
 */
export function createTrainingJob(
  userId: string,
  algorithmId: string,
  datasetId: string,
  modality: 'local_browser' | 'local_node' | 'shared',
  parameters: Record<string, any>,
  estimatedResources: {
    memoryMB: number;
    durationMs: number;
    costUnits: number;
  }
): TrainingJob {
  return {
    id: generateId(),
    userId,
    algorithmId,
    datasetId,
    modality,
    status: 'DRAFT',
    parameters,
    estimatedResources,
    createdAt: new Date().toISOString()
  };
}

/**
 * Actualiza el estado de un trabajo
 */
export function updateJobStatus(
  job: TrainingJob,
  status: TrainingJobStatus,
  additionalData?: Partial<TrainingJob>
): TrainingJob {
  return {
    ...job,
    ...additionalData,
    status
  };
}

/**
 * Valida si un trabajo puede ser ejecutado
 */
export function validateJobForExecution(job: TrainingJob): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!job.algorithmId) {
    errors.push('Falta ID del algoritmo');
  }

  if (!job.datasetId) {
    errors.push('Falta ID del dataset');
  }

  if (!job.userId) {
    errors.push('Falta ID del usuario');
  }

  if (!job.estimatedResources) {
    errors.push('Faltan recursos estimados');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
