// GAGO Open Artifact Factory - JOULE MATS Tests
// Fase 4: Pruebas del sistema multiagente

import { describe, it, expect } from 'vitest';
import { executeDataCurator } from '../services/joule-mats/agents/agent-01-data-curator';
import {
  executeTelemetryAnalyst,
  executeTaskClassifier,
  executeSyntheticLab,
  executeLabelingAndEvidence,
  executeFeatureEngineer,
  executeBaselineScientist,
  executePolicyTrainer,
  executeCostOptimizer,
  executeLatencyOptimizer,
  executeQualityAndReliability,
  executeAdversarialTrainer,
  executeIndependentEvaluator,
  executeTrainingGovernor
} from '../services/joule-mats/agents/agents-02-15';
import { initializeJouleMATS, executeTrainingCycle } from '../services/joule-mats/orchestrator';
import type { TrainingObservation } from '../types/joule-mats';

describe('JOULE MATS - Agent 01: Data Curator', () => {
  it('debe curar datos y eliminar duplicados', () => {
    const observations: TrainingObservation[] = [
      {
        id: '1',
        taskId: 'task-1',
        taskFeatures: { complexity: 'low' },
        routeId: 'route-1',
        routeInfo: { availability: 0.9, quality: 0.8, latencyMs: 100, costUnits: 5, uncertainty: 0.1 },
        result: 'success',
        durationMs: 500,
        costUnits: 5,
        errors: [],
        timestamp: '2024-01-01T00:00:00Z',
        isSynthetic: false
      },
      {
        id: '2',
        taskId: 'task-1',
        taskFeatures: { complexity: 'low' },
        routeId: 'route-1',
        routeInfo: { availability: 0.9, quality: 0.8, latencyMs: 100, costUnits: 5, uncertainty: 0.1 },
        result: 'success',
        durationMs: 500,
        costUnits: 5,
        errors: [],
        timestamp: '2024-01-01T00:00:00Z',
        isSynthetic: false
      }
    ];

    const result = executeDataCurator(observations, 'test-dataset');
    expect(result.removedDuplicates).toBe(1);
    expect(result.validObservations.length).toBe(1);
  });

  it('debe separar datos reales de sintéticos', () => {
    const observations: TrainingObservation[] = [
      {
        id: '1',
        taskId: 'task-1',
        taskFeatures: {},
        routeId: 'route-1',
        routeInfo: { availability: 0.9, quality: 0.8, latencyMs: 100, costUnits: 5, uncertainty: 0.1 },
        result: 'success',
        durationMs: 500,
        costUnits: 5,
        errors: [],
        timestamp: '2024-01-01T00:00:00Z',
        isSynthetic: false
      },
      {
        id: '2',
        taskId: 'task-2',
        taskFeatures: {},
        routeId: 'route-2',
        routeInfo: { availability: 0.9, quality: 0.8, latencyMs: 100, costUnits: 5, uncertainty: 0.1 },
        result: 'success',
        durationMs: 500,
        costUnits: 5,
        errors: [],
        timestamp: '2024-01-01T00:00:01Z',
        isSynthetic: true
      }
    ];

    const result = executeDataCurator(observations, 'test-dataset');
    expect(result.dataset.realCount).toBe(1);
    expect(result.dataset.syntheticCount).toBe(1);
  });
});

describe('JOULE MATS - Agent 02: Telemetry Analyst', () => {
  it('debe analizar telemetría correctamente', () => {
    const observations: TrainingObservation[] = [
      {
        id: '1',
        taskId: 'task-1',
        taskFeatures: {},
        routeId: 'route-1',
        routeInfo: { availability: 0.9, quality: 0.8, latencyMs: 100, costUnits: 5, uncertainty: 0.1 },
        result: 'success',
        durationMs: 500,
        costUnits: 5,
        errors: [],
        timestamp: '2024-01-01T00:00:00Z',
        isSynthetic: false
      },
      {
        id: '2',
        taskId: 'task-2',
        taskFeatures: {},
        routeId: 'route-1',
        routeInfo: { availability: 0.9, quality: 0.8, latencyMs: 150, costUnits: 7, uncertainty: 0.1 },
        result: 'failure',
        durationMs: 1000,
        costUnits: 7,
        errors: ['timeout'],
        timestamp: '2024-01-01T00:00:01Z',
        isSynthetic: false
      }
    ];

    const result = executeTelemetryAnalyst(observations);
    expect(result.averageDurationMs).toBe(750);
    expect(result.successRate).toBe(0.5);
    expect(result.errorDistribution['timeout']).toBe(1);
  });
});

describe('JOULE MATS - Agent 04: Synthetic Lab', () => {
  it('debe generar datos sintéticos', () => {
    const baseObservations: TrainingObservation[] = [
      {
        id: '1',
        taskId: 'task-1',
        taskFeatures: {},
        routeId: 'route-1',
        routeInfo: { availability: 0.9, quality: 0.8, latencyMs: 100, costUnits: 5, uncertainty: 0.1 },
        result: 'success',
        durationMs: 500,
        costUnits: 5,
        errors: [],
        timestamp: '2024-01-01T00:00:00Z',
        isSynthetic: false
      }
    ];

    const synthetic = executeSyntheticLab(baseObservations, 10);
    expect(synthetic.length).toBe(10);
    expect(synthetic.every(s => s.isSynthetic)).toBe(true);
  });
});

describe('JOULE MATS - Agent 08: Policy Trainer', () => {
  it('debe entrenar una política candidata', () => {
    const featureVectors = [
      {
        taskId: 'task-1',
        features: [1, 2, 3],
        normalizedFeatures: [0.1, 0.2, 0.3],
        labels: { costPerResult: 5, success: true, durationMs: 500 }
      },
      {
        taskId: 'task-2',
        features: [4, 5, 6],
        normalizedFeatures: [0.4, 0.5, 0.6],
        labels: { costPerResult: 7, success: false, durationMs: 1000 }
      }
    ];

    const policy = executePolicyTrainer(featureVectors, 'test-policy');
    expect(policy.name).toBe('test-policy');
    expect(policy.algorithm).toBe('contextual-bandit');
    expect(policy.status).toBe('candidate');
    expect(policy.metrics.sampleSize).toBe(2);
  });
});

describe('JOULE MATS - Agent 14: Independent Evaluator', () => {
  it('debe evaluar una política independientemente', () => {
    const policy = {
      id: 'policy-1',
      name: 'test-policy',
      version: '1.0.0',
      description: 'Test',
      algorithm: 'contextual-bandit',
      parameters: {},
      trainingDatasetId: 'dataset-1',
      metrics: {
        costPerCorrectResult: 5,
        successRate: 0.9,
        averageLatencyMs: 500,
        qualityScore: 0.9,
        sampleSize: 100,
        confidence: 0.95
      },
      status: 'candidate' as const,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };

    const baseline = {
      policyId: 'baseline',
      costPerCorrectResult: 10,
      successRate: 0.8,
      averageLatencyMs: 600,
      qualityScore: 0.8,
      sampleSize: 100
    };

    const evalObs: TrainingObservation[] = [
      {
        id: '1',
        taskId: 'task-1',
        taskFeatures: {},
        routeId: 'route-1',
        routeInfo: { availability: 0.9, quality: 0.9, latencyMs: 400, costUnits: 4, uncertainty: 0.1 },
        result: 'success',
        durationMs: 400,
        costUnits: 4,
        errors: [],
        timestamp: '2024-01-01T00:00:00Z',
        isSynthetic: false
      }
    ];

    const evaluation = executeIndependentEvaluator(policy, baseline, evalObs);
    expect(evaluation.comparison.betterThanBaseline).toBe(true);
    expect(evaluation.comparison.improvementPercent).toBeGreaterThan(0);
  });
});

describe('JOULE MATS - Orchestrator', () => {
  it('debe inicializar los 15 agentes', () => {
    const state = initializeJouleMATS();
    expect(Object.keys(state.agents).length).toBe(15);
    expect(state.version).toBe('4.0.0');
  });

  it('debe ejecutar un ciclo de entrenamiento completo', async () => {
    const state = initializeJouleMATS();
    const observations: TrainingObservation[] = Array.from({ length: 50 }, (_, i) => ({
      id: `obs-${i}`,
      taskId: `task-${i}`,
      taskFeatures: { complexity: 'low' },
      routeId: 'route-1',
      routeInfo: { availability: 0.9, quality: 0.8, latencyMs: 100, costUnits: 5, uncertainty: 0.1 },
      result: 'success' as const,
      durationMs: 500,
      costUnits: 5,
      errors: [],
      timestamp: new Date().toISOString(),
      isSynthetic: false
    }));

    const result = await executeTrainingCycle(state, observations, 'test-cycle');
    expect(result.success).toBe(true);
    expect(result.cycle.status).toBe('completed');
    expect(result.newState.datasets.length).toBeGreaterThan(0);
    expect(result.newState.policies.length).toBeGreaterThan(0);
  });
});

describe('JOULE MATS - Quality Gates Integration', () => {
  it('no debe aprobar políticas con calidad degradada', () => {
    const policy = {
      id: 'policy-1',
      name: 'bad-policy',
      version: '1.0.0',
      description: 'Test',
      algorithm: 'contextual-bandit',
      parameters: {},
      trainingDatasetId: 'dataset-1',
      metrics: {
        costPerCorrectResult: 5,
        successRate: 0.5, // Calidad baja
        averageLatencyMs: 500,
        qualityScore: 0.5,
        sampleSize: 100,
        confidence: 0.95
      },
      status: 'candidate' as const,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };

    const baseline = {
      policyId: 'baseline',
      costPerCorrectResult: 10,
      successRate: 0.9,
      averageLatencyMs: 600,
      qualityScore: 0.9,
      sampleSize: 100
    };

    const evalObs: TrainingObservation[] = [
      {
        id: '1',
        taskId: 'task-1',
        taskFeatures: {},
        routeId: 'route-1',
        routeInfo: { availability: 0.9, quality: 0.5, latencyMs: 400, costUnits: 4, uncertainty: 0.1 },
        result: 'success',
        durationMs: 400,
        costUnits: 4,
        errors: [],
        timestamp: '2024-01-01T00:00:00Z',
        isSynthetic: false
      }
    ];

    const evaluation = executeIndependentEvaluator(policy, baseline, evalObs);
    expect(evaluation.comparison.qualityMaintained).toBe(false);
    expect(evaluation.recommendation).toBe('reject');
  });
});
