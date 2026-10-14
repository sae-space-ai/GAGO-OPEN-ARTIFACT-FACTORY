// GAGO Open Artifact Factory - Free Training Tests
// Phase 9: JOULE FREE TRAINING CENTER

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  getInitialAlgorithms, 
  findAlgorithm, 
  findAlgorithmsByType,
  getCompatibleAlgorithms,
  validateAlgorithmParameters
} from '../services/training/algorithm-registry';
import { 
  validateDataset, 
  createTrainingDataset, 
  generateSyntheticDataset,
  validateDatasetStructure,
  getDatasetStatistics,
  splitDataset
} from '../services/training/dataset-manager';
import { 
  createInitialQuota, 
  canStartJob, 
  registerJobStart, 
  registerJobEnd,
  getQuotaUsagePercentage,
  needsRenewal
} from '../services/training/quota-manager';
import { 
  INITIAL_GLOBAL_BUDGET,
  hasGlobalCapacity,
  reserveGlobalResources,
  releaseGlobalResources,
  getBudgetUsagePercentage,
  isBudgetNearLimit
} from '../services/training/budget-controller';
import { 
  TrainingJobScheduler, 
  createTrainingJob,
  validateJobForExecution
} from '../services/training/job-scheduler';
import { 
  admitFreeTrainingJob,
  estimateTrainingResources,
  validateJobParameters
} from '../services/training/admission-algorithm';
import { 
  evaluateTrainingJob
} from '../services/training/evaluation-engine';
import { 
  getInitialDonationState,
  isDonationSystemAvailable,
  createPendingDonation,
  validateDonationAmount
} from '../services/training/donation-manager';
import type { TrainingAlgorithm, TrainingDataset, TrainingQuota } from '../types/training';

describe('Algorithm Registry', () => {
  it('debe obtener los algoritmos iniciales', () => {
    const algorithms = getInitialAlgorithms();
    expect(algorithms.length).toBeGreaterThan(0);
    expect(algorithms.some(a => a.type === 'policy_optimization')).toBe(true);
  });

  it('debe buscar un algoritmo por ID', () => {
    const algorithms = getInitialAlgorithms();
    const found = findAlgorithm(algorithms, 'algo-policy-optimization');
    expect(found).toBeDefined();
    expect(found?.type).toBe('policy_optimization');
  });

  it('debe buscar algoritmos por tipo', () => {
    const algorithms = getInitialAlgorithms();
    const found = findAlgorithmsByType(algorithms, 'classification');
    expect(found.length).toBeGreaterThan(0);
    expect(found.every(a => a.type === 'classification')).toBe(true);
  });

  it('debe filtrar algoritmos compatibles', () => {
    const algorithms = getInitialAlgorithms();
    const compatible = getCompatibleAlgorithms(algorithms);
    expect(compatible.every(a => a.compatible)).toBe(true);
  });

  it('debe validar parámetros de algoritmo', () => {
    const algorithms = getInitialAlgorithms();
    const algo = findAlgorithm(algorithms, 'algo-policy-optimization')!;
    
    const validParams = { ...algo.parameters };
    const result = validateAlgorithmParameters(algo, validParams);
    expect(result.valid).toBe(true);
  });
});

describe('Dataset Manager', () => {
  it('debe validar un dataset correcto', () => {
    const dataset = {
      name: 'Test Dataset',
      size: 1024,
      format: 'json',
      ownerId: 'user-1'
    };
    
    const result = validateDataset(dataset);
    expect(result.valid).toBe(true);
  });

  it('debe rechazar un dataset sin nombre', () => {
    const dataset = {
      name: '',
      size: 1024,
      format: 'json',
      ownerId: 'user-1'
    };
    
    const result = validateDataset(dataset);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('El nombre del dataset es obligatorio');
  });

  it('debe crear un dataset de entrenamiento', () => {
    const data = [{ id: 1, value: 10 }, { id: 2, value: 20 }];
    const dataset = createTrainingDataset('Test', 'Description', data, 'json', 'user-1');
    
    expect(dataset.id).toBeDefined();
    expect(dataset.name).toBe('Test');
    expect(dataset.size).toBeGreaterThan(0);
    expect(dataset.validated).toBe(false);
  });

  it('debe generar un dataset sintético', () => {
    const dataset = generateSyntheticDataset(100, ['f1', 'f2'], ['a', 'b']);
    
    expect(dataset.length).toBe(100);
    expect(dataset[0]).toHaveProperty('id');
    expect(dataset[0]).toHaveProperty('f1');
    expect(dataset[0]).toHaveProperty('label');
  });

  it('debe validar la estructura de un dataset', () => {
    const dataset = [
      { id: 1, value: 10 },
      { id: 2, value: 20 }
    ];
    
    const result = validateDatasetStructure(dataset, ['id', 'value']);
    expect(result.valid).toBe(true);
  });

  it('debe calcular estadísticas de un dataset', () => {
    const dataset = [
      { id: 1, value: 10 },
      { id: 2, value: 20 }
    ];
    
    const stats = getDatasetStatistics(dataset);
    expect(stats.count).toBe(2);
    expect(stats.fields).toContain('id');
    expect(stats.fields).toContain('value');
  });

  it('debe dividir un dataset en entrenamiento y prueba', () => {
    const dataset = Array.from({ length: 100 }, (_, i) => ({ id: i }));
    const { train, test } = splitDataset(dataset, 0.8);
    
    expect(train.length).toBe(80);
    expect(test.length).toBe(20);
  });
});

describe('Quota Manager', () => {
  let quota: TrainingQuota;

  beforeEach(() => {
    quota = createInitialQuota('user-1', 'local_browser');
  });

  it('debe crear una cuota inicial', () => {
    expect(quota.userId).toBe('user-1');
    expect(quota.modality).toBe('local_browser');
    expect(quota.usage.jobsThisMonth).toBe(0);
  });

  it('debe permitir iniciar un trabajo si hay cuota disponible', () => {
    const result = canStartJob(quota, 60000, 1, 1000);
    expect(result.allowed).toBe(true);
  });

  it('debe rechazar un trabajo si se excede la duración máxima', () => {
    const result = canStartJob(quota, 999999999, 1, 1000);
    expect(result.allowed).toBe(false);
  });

  it('debe registrar el inicio de un trabajo', () => {
    const updated = registerJobStart(quota);
    expect(updated.usage.jobsThisMonth).toBe(1);
    expect(updated.usage.currentConcurrentJobs).toBe(1);
  });

  it('debe registrar el final de un trabajo', () => {
    const started = registerJobStart(quota);
    const ended = registerJobEnd(started, 60000);
    
    expect(ended.usage.durationThisMonthMs).toBe(60000);
    expect(ended.usage.currentConcurrentJobs).toBe(0);
  });

  it('debe calcular el porcentaje de uso de cuota', () => {
    const started = registerJobStart(quota);
    const usage = getQuotaUsagePercentage(started);
    
    expect(usage.jobsPercentage).toBeGreaterThan(0);
    expect(usage.concurrentPercentage).toBeGreaterThan(0);
  });
});

describe('Budget Controller', () => {
  it('debe tener un presupuesto global inicial', () => {
    expect(INITIAL_GLOBAL_BUDGET.maxConcurrentJobs).toBeGreaterThan(0);
    expect(INITIAL_GLOBAL_BUDGET.currentConcurrentJobs).toBe(0);
  });

  it('debe verificar si hay capacidad global disponible', () => {
    const result = hasGlobalCapacity(INITIAL_GLOBAL_BUDGET, 100, 60000);
    expect(result.available).toBe(true);
  });

  it('debe rechazar si no hay capacidad global', () => {
    const budget = { ...INITIAL_GLOBAL_BUDGET, currentConcurrentJobs: 10 };
    const result = hasGlobalCapacity(budget, 100, 60000);
    expect(result.available).toBe(false);
  });

  it('debe reservar recursos globales', () => {
    const reserved = reserveGlobalResources(INITIAL_GLOBAL_BUDGET, 100, 60000);
    
    expect(reserved.currentConcurrentJobs).toBe(1);
    expect(reserved.currentMemoryMB).toBe(100);
    expect(reserved.currentDurationMs).toBe(60000);
  });

  it('debe liberar recursos globales', () => {
    const reserved = reserveGlobalResources(INITIAL_GLOBAL_BUDGET, 100, 60000);
    const released = releaseGlobalResources(reserved, 100, 60000);
    
    expect(released.currentConcurrentJobs).toBe(0);
    expect(released.currentMemoryMB).toBe(0);
  });

  it('debe calcular el porcentaje de uso del presupuesto', () => {
    const reserved = reserveGlobalResources(INITIAL_GLOBAL_BUDGET, 100, 60000);
    const usage = getBudgetUsagePercentage(reserved);
    
    expect(usage.concurrentPercentage).toBeGreaterThan(0);
    expect(usage.memoryPercentage).toBeGreaterThan(0);
  });
});

describe('Job Scheduler', () => {
  let scheduler: TrainingJobScheduler;

  beforeEach(() => {
    scheduler = new TrainingJobScheduler();
  });

  it('debe crear un trabajo de entrenamiento', () => {
    const job = createTrainingJob(
      'user-1',
      'algo-1',
      'dataset-1',
      'local_browser',
      {},
      { memoryMB: 100, durationMs: 60000, costUnits: 10 }
    );
    
    expect(job.id).toBeDefined();
    expect(job.status).toBe('DRAFT');
  });

  it('debe encolar un trabajo', () => {
    const job = createTrainingJob(
      'user-1',
      'algo-1',
      'dataset-1',
      'local_browser',
      {},
      { memoryMB: 100, durationMs: 60000, costUnits: 10 }
    );
    
    scheduler.enqueue(job);
    const queued = scheduler.getQueuedJobs();
    
    expect(queued.length).toBe(1);
    expect(queued[0].id).toBe(job.id);
  });

  it('debe marcar un trabajo como en ejecución', () => {
    const job = createTrainingJob(
      'user-1',
      'algo-1',
      'dataset-1',
      'local_browser',
      {},
      { memoryMB: 100, durationMs: 60000, costUnits: 10 }
    );
    
    scheduler.enqueue(job);
    const running = scheduler.markAsRunning(job.id);
    
    expect(running).toBeDefined();
    expect(running?.status).toBe('RUNNING');
    expect(scheduler.getQueuedJobs().length).toBe(0);
    expect(scheduler.getRunningJobs().length).toBe(1);
  });

  it('debe marcar un trabajo como completado', () => {
    const job = createTrainingJob(
      'user-1',
      'algo-1',
      'dataset-1',
      'local_browser',
      {},
      { memoryMB: 100, durationMs: 60000, costUnits: 10 }
    );
    
    scheduler.enqueue(job);
    scheduler.markAsRunning(job.id);
    const completed = scheduler.markAsCompleted(job.id, { result: 'success' });
    
    expect(completed).toBeDefined();
    expect(completed?.status).toBe('COMPLETED');
    expect(scheduler.getCompletedJobs().length).toBe(1);
  });

  it('debe cancelar un trabajo', () => {
    const job = createTrainingJob(
      'user-1',
      'algo-1',
      'dataset-1',
      'local_browser',
      {},
      { memoryMB: 100, durationMs: 60000, costUnits: 10 }
    );
    
    scheduler.enqueue(job);
    const cancelled = scheduler.cancelJob(job.id);
    
    expect(cancelled).toBeDefined();
    expect(cancelled?.status).toBe('CANCELLED');
  });

  it('debe validar un trabajo para ejecución', () => {
    const job = createTrainingJob(
      'user-1',
      'algo-1',
      'dataset-1',
      'local_browser',
      {},
      { memoryMB: 100, durationMs: 60000, costUnits: 10 }
    );
    
    const result = validateJobForExecution(job);
    expect(result.valid).toBe(true);
  });
});

describe('Admission Algorithm', () => {
  it('debe estimar los recursos de entrenamiento', () => {
    const algorithms = getInitialAlgorithms();
    const algo = findAlgorithm(algorithms, 'algo-policy-optimization')!;
    
    const dataset: TrainingDataset = {
      id: 'dataset-1',
      name: 'Test',
      version: '1.0.0',
      description: 'Test',
      size: 1024 * 1024, // 1 MB
      format: 'json',
      isSynthetic: true,
      ownerId: 'user-1',
      validated: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const resources = estimateTrainingResources(algo, dataset, {});
    
    expect(resources.memoryMB).toBeGreaterThan(0);
    expect(resources.durationMs).toBeGreaterThan(0);
    expect(resources.costUnits).toBeGreaterThan(0);
  });

  it('debe admitir un trabajo válido', () => {
    const algorithms = getInitialAlgorithms();
    const algo = findAlgorithm(algorithms, 'algo-policy-optimization')!;
    
    const dataset: TrainingDataset = {
      id: 'dataset-1',
      name: 'Test',
      version: '1.0.0',
      description: 'Test',
      size: 1024,
      format: 'json',
      isSynthetic: true,
      ownerId: 'user-1',
      validated: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const quota = createInitialQuota('user-1', 'local_browser');
    
    const result = admitFreeTrainingJob(
      'user-1',
      algo,
      dataset,
      'local_browser',
      {},
      quota,
      INITIAL_GLOBAL_BUDGET
    );
    
    expect(result.admitted).toBe(true);
    expect(result.job).toBeDefined();
  });

  it('debe rechazar un trabajo con dataset no validado', () => {
    const algorithms = getInitialAlgorithms();
    const algo = findAlgorithm(algorithms, 'algo-policy-optimization')!;
    
    const dataset: TrainingDataset = {
      id: 'dataset-1',
      name: 'Test',
      version: '1.0.0',
      description: 'Test',
      size: 1024,
      format: 'json',
      isSynthetic: true,
      ownerId: 'user-1',
      validated: false, // No validado
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const quota = createInitialQuota('user-1', 'local_browser');
    
    const result = admitFreeTrainingJob(
      'user-1',
      algo,
      dataset,
      'local_browser',
      {},
      quota,
      INITIAL_GLOBAL_BUDGET
    );
    
    expect(result.admitted).toBe(false);
    expect(result.reason).toContain('validado');
  });
});

describe('Evaluation Engine', () => {
  it('debe evaluar un trabajo completado', () => {
    const algorithms = getInitialAlgorithms();
    const algo = findAlgorithm(algorithms, 'algo-policy-optimization')!;
    
    const job = createTrainingJob(
      'user-1',
      algo.id,
      'dataset-1',
      'local_browser',
      {},
      { memoryMB: 100, durationMs: 60000, costUnits: 10 }
    );
    
    const results = {
      bestArm: 2,
      rewards: [0.3, 0.5, 0.8, 0.4, 0.2],
      counts: [100, 150, 300, 120, 80],
      iterations: 1000
    };
    
    const evaluation = evaluateTrainingJob(job, algo, results);
    
    expect(evaluation.id).toBeDefined();
    expect(evaluation.jobId).toBe(job.id);
    expect(evaluation.metrics).toBeDefined();
    expect(evaluation.passed).toBeDefined();
  });
});

describe('Donation Manager', () => {
  it('debe obtener el estado inicial de donaciones', () => {
    const state = getInitialDonationState();
    
    expect(state.enabled).toBe(false);
    expect(state.donations.length).toBe(0);
  });

  it('debe verificar si el sistema de donaciones está disponible', () => {
    const state = getInitialDonationState();
    const available = isDonationSystemAvailable(state);
    
    expect(available).toBe(false);
  });

  it('debe crear una donación pendiente', () => {
    const donation = createPendingDonation('user-1', 10, 'EUR', 'stripe');
    
    expect(donation.id).toBeDefined();
    expect(donation.status).toBe('pending');
    expect(donation.amount).toBe(10);
  });

  it('debe validar un importe de donación', () => {
    const valid = validateDonationAmount(10, 'EUR');
    expect(valid.valid).toBe(true);
    
    const invalid = validateDonationAmount(0, 'EUR');
    expect(invalid.valid).toBe(false);
  });
});
