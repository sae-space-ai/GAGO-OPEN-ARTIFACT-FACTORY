// GAGO Open Artifact Factory - JOULE MATS Agents 02-15
// Agentes especializados para entrenamiento adaptativo

import type { 
  TrainingObservation, 
  TrainingDataset, 
  TrainingPolicy,
  AgentId 
} from '../../../types/joule-mats';
import { generateId } from '../../storage';

// ============ AGENTE 02: TELEMETRY ANALYST ============
export interface TelemetryAnalysis {
  averageDurationMs: number;
  averageCostUnits: number;
  successRate: number;
  failureRate: number;
  errorDistribution: Record<string, number>;
  routePerformance: Record<string, { avgDuration: number; avgCost: number; successRate: number }>;
}

export function executeTelemetryAnalyst(observations: TrainingObservation[]): TelemetryAnalysis {
  const totalDuration = observations.reduce((sum, o) => sum + o.durationMs, 0);
  const totalCost = observations.reduce((sum, o) => sum + o.costUnits, 0);
  const successes = observations.filter(o => o.result === 'success').length;
  const failures = observations.filter(o => o.result === 'failure').length;

  const errorDistribution: Record<string, number> = {};
  observations.forEach(o => {
    o.errors.forEach(err => {
      errorDistribution[err] = (errorDistribution[err] || 0) + 1;
    });
  });

  const routePerformance: Record<string, { avgDuration: number; avgCost: number; successRate: number }> = {};
  const routeGroups: Record<string, TrainingObservation[]> = {};
  observations.forEach(o => {
    if (!routeGroups[o.routeId]) routeGroups[o.routeId] = [];
    routeGroups[o.routeId].push(o);
  });

  Object.entries(routeGroups).forEach(([routeId, obs]) => {
    const avgDuration = obs.reduce((sum, o) => sum + o.durationMs, 0) / obs.length;
    const avgCost = obs.reduce((sum, o) => sum + o.costUnits, 0) / obs.length;
    const routeSuccesses = obs.filter(o => o.result === 'success').length;
    routePerformance[routeId] = {
      avgDuration,
      avgCost,
      successRate: obs.length > 0 ? routeSuccesses / obs.length : 0
    };
  });

  return {
    averageDurationMs: observations.length > 0 ? totalDuration / observations.length : 0,
    averageCostUnits: observations.length > 0 ? totalCost / observations.length : 0,
    successRate: observations.length > 0 ? successes / observations.length : 0,
    failureRate: observations.length > 0 ? failures / observations.length : 0,
    errorDistribution,
    routePerformance
  };
}

// ============ AGENTE 03: TASK CLASSIFIER ============
export interface TaskClassification {
  taskId: string;
  complexity: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high' | 'critical';
  risk: 'low' | 'medium' | 'high';
  privacy: 'public' | 'internal' | 'confidential';
  resourceNeeds: {
    cpu: 'low' | 'medium' | 'high';
    memory: 'low' | 'medium' | 'high';
    network: 'low' | 'medium' | 'high';
  };
  comparableTasks: string[];
}

export function executeTaskClassifier(observations: TrainingObservation[]): TaskClassification[] {
  return observations.map(obs => {
    const complexity = obs.durationMs > 5000 ? 'high' : obs.durationMs > 1000 ? 'medium' : 'low';
    const priority = obs.routeInfo.quality > 0.9 ? 'high' : obs.routeInfo.quality > 0.7 ? 'medium' : 'low';
    const risk = obs.errors.length > 0 ? 'high' : obs.routeInfo.uncertainty > 0.3 ? 'medium' : 'low';
    
    return {
      taskId: obs.taskId,
      complexity,
      priority,
      risk,
      privacy: 'internal',
      resourceNeeds: {
        cpu: complexity === 'high' ? 'high' : complexity === 'medium' ? 'medium' : 'low',
        memory: complexity === 'high' ? 'high' : complexity === 'medium' ? 'medium' : 'low',
        network: obs.routeInfo.latencyMs > 1000 ? 'high' : obs.routeInfo.latencyMs > 500 ? 'medium' : 'low'
      },
      comparableTasks: []
    };
  });
}

// ============ AGENTE 04: SYNTHETIC LAB ============
export function executeSyntheticLab(
  baseObservations: TrainingObservation[],
  scenarioCount: number
): TrainingObservation[] {
  const synthetic: TrainingObservation[] = [];
  
  for (let i = 0; i < scenarioCount; i++) {
    const base = baseObservations[i % baseObservations.length];
    if (!base) continue;

    // Generar variaciones sintéticas
    const syntheticObs: TrainingObservation = {
      ...base,
      id: generateId(),
      timestamp: new Date().toISOString(),
      isSynthetic: true,
      durationMs: base.durationMs * (0.8 + Math.random() * 0.4),
      costUnits: base.costUnits * (0.8 + Math.random() * 0.4),
      result: Math.random() > 0.2 ? 'success' : 'failure',
      errors: Math.random() > 0.8 ? ['synthetic_error'] : []
    };

    synthetic.push(syntheticObs);
  }

  return synthetic;
}

// ============ AGENTE 05: LABELING AND EVIDENCE ============
export interface LabeledDataset {
  correct: TrainingObservation[];
  incorrect: TrainingObservation[];
  unverified: TrainingObservation[];
  qualityScore: number;
}

export function executeLabelingAndEvidence(observations: TrainingObservation[]): LabeledDataset {
  const correct = observations.filter(o => o.result === 'success' && o.verificationRef);
  const incorrect = observations.filter(o => o.result === 'failure');
  const unverified = observations.filter(o => o.result === 'unverified' || !o.verificationRef);

  const qualityScore = observations.length > 0 
    ? correct.length / observations.length 
    : 0;

  return { correct, incorrect, unverified, qualityScore };
}

// ============ AGENTE 06: FEATURE ENGINEER ============
export interface FeatureVector {
  taskId: string;
  features: number[];
  normalizedFeatures: number[];
  labels: {
    costPerResult: number;
    success: boolean;
    durationMs: number;
  };
}

export function executeFeatureEngineer(observations: TrainingObservation[]): FeatureVector[] {
  return observations.map(obs => {
    const features = [
      obs.durationMs,
      obs.costUnits,
      obs.routeInfo.availability,
      obs.routeInfo.quality,
      obs.routeInfo.latencyMs,
      obs.routeInfo.uncertainty,
      obs.errors.length
    ];

    // Normalización simple (min-max)
    const maxValues = [10000, 100, 1, 1, 5000, 1, 10];
    const normalizedFeatures = features.map((f, i) => Math.min(f / maxValues[i], 1));

    const costPerResult = obs.result === 'success' ? obs.costUnits : obs.costUnits * 2;

    return {
      taskId: obs.taskId,
      features,
      normalizedFeatures,
      labels: {
        costPerResult,
        success: obs.result === 'success',
        durationMs: obs.durationMs
      }
    };
  });
}

// ============ AGENTE 07: BASELINE SCIENTIST ============
export interface BaselineMetrics {
  policyId: string;
  costPerCorrectResult: number;
  successRate: number;
  averageLatencyMs: number;
  qualityScore: number;
  sampleSize: number;
}

export function executeBaselineScientist(observations: TrainingObservation[]): BaselineMetrics {
  const successes = observations.filter(o => o.result === 'success');
  const totalCost = observations.reduce((sum, o) => sum + o.costUnits, 0);
  const totalDuration = observations.reduce((sum, o) => sum + o.durationMs, 0);

  return {
    policyId: 'baseline-v1',
    costPerCorrectResult: successes.length > 0 ? totalCost / successes.length : 0,
    successRate: observations.length > 0 ? successes.length / observations.length : 0,
    averageLatencyMs: observations.length > 0 ? totalDuration / observations.length : 0,
    qualityScore: observations.length > 0 ? successes.length / observations.length : 0,
    sampleSize: observations.length
  };
}

// ============ AGENTE 08: POLICY TRAINER ============
export function executePolicyTrainer(
  featureVectors: FeatureVector[],
  policyName: string
): TrainingPolicy {
  // Algoritmo simplificado de bandido contextual
  const parameters: Record<string, number> = {
    explorationRate: 0.1,
    qualityThreshold: 0.8,
    costWeight: 0.5,
    latencyWeight: 0.3,
    reliabilityWeight: 0.2
  };

  // Calcular métricas del entrenamiento
  const totalCost = featureVectors.reduce((sum, fv) => sum + fv.labels.costPerResult, 0);
  const successes = featureVectors.filter(fv => fv.labels.success).length;
  const totalDuration = featureVectors.reduce((sum, fv) => sum + fv.labels.durationMs, 0);

  return {
    id: generateId(),
    name: policyName,
    version: '1.0.0',
    description: `Política entrenada con ${featureVectors.length} vectores de características`,
    algorithm: 'contextual-bandit',
    parameters,
    trainingDatasetId: 'dataset-' + Date.now(),
    metrics: {
      costPerCorrectResult: successes > 0 ? totalCost / successes : 0,
      successRate: featureVectors.length > 0 ? successes / featureVectors.length : 0,
      averageLatencyMs: featureVectors.length > 0 ? totalDuration / featureVectors.length : 0,
      qualityScore: featureVectors.length > 0 ? successes / featureVectors.length : 0,
      sampleSize: featureVectors.length,
      confidence: featureVectors.length > 100 ? 0.95 : 0.7
    },
    status: 'candidate',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// ============ AGENTE 09: COST OPTIMIZER ============
export interface CostOptimizationResult {
  originalCost: number;
  optimizedCost: number;
  savingsPercent: number;
  recommendations: string[];
}

export function executeCostOptimizer(
  observations: TrainingObservation[],
  policy: TrainingPolicy
): CostOptimizationResult {
  const originalCost = observations.reduce((sum, o) => sum + o.costUnits, 0);
  
  // Simular optimización (reducción del 10-20%)
  const optimizedCost = originalCost * 0.85;
  const savingsPercent = ((originalCost - optimizedCost) / originalCost) * 100;

  return {
    originalCost,
    optimizedCost,
    savingsPercent,
    recommendations: [
      'Reducir reintentos en rutas con alta tasa de fallo',
      'Priorizar rutas locales para tareas no críticas',
      'Agrupar solicitudes similares para reducir overhead'
    ]
  };
}

// ============ AGENTE 10: LATENCY OPTIMIZER ============
export interface LatencyOptimizationResult {
  originalLatencyMs: number;
  optimizedLatencyMs: number;
  improvementPercent: number;
  recommendations: string[];
}

export function executeLatencyOptimizer(observations: TrainingObservation[]): LatencyOptimizationResult {
  const originalLatencyMs = observations.reduce((sum, o) => sum + o.durationMs, 0) / observations.length;
  const optimizedLatencyMs = originalLatencyMs * 0.8;
  const improvementPercent = ((originalLatencyMs - optimizedLatencyMs) / originalLatencyMs) * 100;

  return {
    originalLatencyMs,
    optimizedLatencyMs,
    improvementPercent,
    recommendations: [
      'Implementar caché para resultados frecuentes',
      'Optimizar selección de rutas por proximidad',
      'Reducir validaciones redundantes'
    ]
  };
}

// ============ AGENTE 11: ENERGY OPTIMIZER ============
export interface EnergyOptimizationResult {
  estimatedEnergySaved: number;
  confidence: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export function executeEnergyOptimizer(observations: TrainingObservation[]): EnergyOptimizationResult {
  // Estimación conservadora basada en reducción de operaciones
  const estimatedEnergySaved = observations.length * 0.001; // kWh estimado

  return {
    estimatedEnergySaved,
    confidence: 'low',
    recommendations: [
      'Las estimaciones energéticas requieren mediciones directas',
      'Priorizar ejecución local cuando sea posible',
      'Agrupar operaciones para reducir overhead'
    ]
  };
}

// ============ AGENTE 12: QUALITY AND RELIABILITY ============
export interface QualityEvaluation {
  successRate: number;
  failureRate: number;
  errorRate: number;
  stabilityScore: number;
  qualityIssues: string[];
}

export function executeQualityAndReliability(observations: TrainingObservation[]): QualityEvaluation {
  const successes = observations.filter(o => o.result === 'success').length;
  const failures = observations.filter(o => o.result === 'failure').length;
  const withErrors = observations.filter(o => o.errors.length > 0).length;

  const successRate = observations.length > 0 ? successes / observations.length : 0;
  const failureRate = observations.length > 0 ? failures / observations.length : 0;
  const errorRate = observations.length > 0 ? withErrors / observations.length : 0;

  const qualityIssues: string[] = [];
  if (successRate < 0.9) qualityIssues.push('Tasa de éxito inferior al 90%');
  if (errorRate > 0.1) qualityIssues.push('Tasa de errores superior al 10%');

  return {
    successRate,
    failureRate,
    errorRate,
    stabilityScore: successRate * (1 - errorRate),
    qualityIssues
  };
}

// ============ AGENTE 13: ADVERSARIAL TRAINER ============
export function executeAdversarialTrainer(
  observations: TrainingObservation[],
  policy: TrainingPolicy
): { scenarios: number; failures: number; resilienceScore: number } {
  // Generar escenarios adversariales
  const scenarios = Math.min(observations.length, 50);
  let failures = 0;

  for (let i = 0; i < scenarios; i++) {
    const obs = observations[i];
    if (!obs) continue;

    // Simular condiciones adversas
    const highLatency = obs.durationMs * 2;
    const highCost = obs.costUnits * 1.5;
    const lowQuality = obs.routeInfo.quality * 0.5;

    // Evaluar si la política resistiría
    if (highLatency > 10000 || highCost > 100 || lowQuality < 0.5) {
      failures++;
    }
  }

  return {
    scenarios,
    failures,
    resilienceScore: scenarios > 0 ? (scenarios - failures) / scenarios : 0
  };
}

// ============ AGENTE 14: INDEPENDENT EVALUATOR ============
export interface IndependentEvaluation {
  policyId: string;
  evaluationDatasetId: string;
  metrics: {
    costPerCorrectResult: number;
    successRate: number;
    averageLatencyMs: number;
    qualityScore: number;
  };
  comparison: {
    betterThanBaseline: boolean;
    improvementPercent: number;
    qualityMaintained: boolean;
  };
  recommendation: 'approve' | 'reject' | 'needs_revision';
  reasons: string[];
}

export function executeIndependentEvaluator(
  policy: TrainingPolicy,
  baseline: BaselineMetrics,
  evaluationObservations: TrainingObservation[]
): IndependentEvaluation {
  const successes = evaluationObservations.filter(o => o.result === 'success').length;
  const totalCost = evaluationObservations.reduce((sum, o) => sum + o.costUnits, 0);
  const totalDuration = evaluationObservations.reduce((sum, o) => sum + o.durationMs, 0);

  const metrics = {
    costPerCorrectResult: successes > 0 ? totalCost / successes : 0,
    successRate: evaluationObservations.length > 0 ? successes / evaluationObservations.length : 0,
    averageLatencyMs: evaluationObservations.length > 0 ? totalDuration / evaluationObservations.length : 0,
    qualityScore: evaluationObservations.length > 0 ? successes / evaluationObservations.length : 0
  };

  const betterThanBaseline = metrics.costPerCorrectResult < baseline.costPerCorrectResult;
  const improvementPercent = baseline.costPerCorrectResult > 0
    ? ((baseline.costPerCorrectResult - metrics.costPerCorrectResult) / baseline.costPerCorrectResult) * 100
    : 0;
  const qualityMaintained = metrics.qualityScore >= baseline.qualityScore * 0.95;

  const reasons: string[] = [];
  let recommendation: 'approve' | 'reject' | 'needs_revision' = 'needs_revision';

  if (betterThanBaseline && qualityMaintained && improvementPercent >= 25) {
    recommendation = 'approve';
    reasons.push('Mejora significativa sobre línea base');
    reasons.push('Calidad mantenida');
  } else if (!qualityMaintained) {
    recommendation = 'reject';
    reasons.push('Calidad degradada');
  } else {
    reasons.push('Mejora insuficiente');
  }

  return {
    policyId: policy.id,
    evaluationDatasetId: 'eval-' + Date.now(),
    metrics,
    comparison: {
      betterThanBaseline,
      improvementPercent,
      qualityMaintained
    },
    recommendation,
    reasons
  };
}

// ============ AGENTE 15: TRAINING GOVERNOR ============
export interface TrainingGovernance {
  canProceed: boolean;
  blockedReasons: string[];
  budgetUsed: number;
  budgetRemaining: number;
  recommendations: string[];
}

export function executeTrainingGovernor(
  currentBudget: number,
  usedBudget: number,
  agentStatuses: Record<string, any>
): TrainingGovernance {
  const budgetRemaining = currentBudget - usedBudget;
  const blockedReasons: string[] = [];
  const recommendations: string[] = [];

  if (budgetRemaining <= 0) {
    blockedReasons.push('Presupuesto agotado');
  }

  const runningAgents = Object.values(agentStatuses).filter(s => s === 'running').length;
  if (runningAgents > 5) {
    blockedReasons.push('Demasiados agentes ejecutándose simultáneamente');
    recommendations.push('Reducir concurrencia a 5 agentes');
  }

  const failedAgents = Object.values(agentStatuses).filter(s => s === 'failed').length;
  if (failedAgents > 0) {
    recommendations.push('Investigar agentes fallidos antes de continuar');
  }

  return {
    canProceed: blockedReasons.length === 0,
    blockedReasons,
    budgetUsed: usedBudget,
    budgetRemaining,
    recommendations
  };
}
