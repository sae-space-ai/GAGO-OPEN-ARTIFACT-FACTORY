// GAGO Open Artifact Factory - JOULE Multi Agent Training System Types
// Phase 4: 15 Specialized Agents for Adaptive Training

export type AgentId =
  | 'agent-01-data-curator'
  | 'agent-02-telemetry-analyst'
  | 'agent-03-task-classifier'
  | 'agent-04-synthetic-lab'
  | 'agent-05-labeling-evidence'
  | 'agent-06-feature-engineer'
  | 'agent-07-baseline-scientist'
  | 'agent-08-policy-trainer'
  | 'agent-09-cost-optimizer'
  | 'agent-10-latency-optimizer'
  | 'agent-11-energy-optimizer'
  | 'agent-12-quality-reliability'
  | 'agent-13-adversarial-trainer'
  | 'agent-14-independent-evaluator'
  | 'agent-15-training-governor';

export type AgentStatus = 'idle' | 'running' | 'completed' | 'failed' | 'blocked' | 'cancelled';

export type AgentCapability =
  | 'data_collection'
  | 'data_validation'
  | 'telemetry_analysis'
  | 'task_classification'
  | 'synthetic_generation'
  | 'labeling'
  | 'feature_engineering'
  | 'baseline_establishment'
  | 'policy_training'
  | 'cost_optimization'
  | 'latency_optimization'
  | 'energy_optimization'
  | 'quality_evaluation'
  | 'adversarial_testing'
  | 'independent_evaluation'
  | 'coordination';

export interface JouleAgent {
  id: AgentId;
  name: string;
  specialty: string;
  description: string;
  capabilities: AgentCapability[];
  dependencies: AgentId[];
  status: AgentStatus;
  lastExecution?: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
  blockedReasons: string[];
  permissions: string[];
  inputs: string[];
  outputs: string[];
  evidenceIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TrainingDataset {
  id: string;
  name: string;
  version: string;
  description: string;
  observationCount: number;
  syntheticCount: number;
  realCount: number;
  createdAt: string;
  updatedAt: string;
  source: 'real' | 'synthetic' | 'mixed';
  validated: boolean;
}

export interface TrainingObservation {
  id: string;
  taskId: string;
  taskFeatures: Record<string, number | string | boolean>;
  routeId: string;
  routeInfo: {
    availability: number;
    quality: number;
    latencyMs: number;
    costUnits: number;
    uncertainty: number;
  };
  result: 'success' | 'failure' | 'unverified';
  durationMs: number;
  costUnits: number;
  errors: string[];
  verificationRef?: string;
  timestamp: string;
  isSynthetic: boolean;
}

export interface TrainingPolicy {
  id: string;
  name: string;
  version: string;
  description: string;
  algorithm: string;
  parameters: Record<string, number>;
  trainingDatasetId: string;
  evaluationDatasetId?: string;
  metrics: {
    costPerCorrectResult: number;
    successRate: number;
    averageLatencyMs: number;
    qualityScore: number;
    sampleSize: number;
    confidence: number;
  };
  status: 'candidate' | 'validated' | 'approved' | 'rejected' | 'deployed';
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingCycle {
  id: string;
  name: string;
  status: 'planned' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt?: string;
  completedAt?: string;
  datasetId: string;
  policiesGenerated: string[];
  bestPolicyId?: string;
  metrics: {
    totalCost: number;
    averageCostPerResult: number;
    improvementOverBaseline: number;
    qualityMaintained: boolean;
  };
  agentExecutions: Array<{
    agentId: AgentId;
    status: AgentStatus;
    startedAt: string;
    completedAt?: string;
    outputs: string[];
  }>;
  createdAt: string;
}

export interface DriftDetection {
  id: string;
  detectedAt: string;
  metric: string;
  currentValue: number;
  baselineValue: number;
  deviationPercent: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
  evidenceIds: string[];
}

export interface JouleMATSState {
  agents: Record<AgentId, JouleAgent>;
  datasets: TrainingDataset[];
  observations: TrainingObservation[];
  policies: TrainingPolicy[];
  trainingCycles: TrainingCycle[];
  driftDetections: DriftDetection[];
  activePolicyId?: string;
  baselinePolicyId?: string;
  shadowMode: boolean;
  canaryPercentage: number;
  version: string;
}

export const AGENT_STATUS_LABELS: Record<AgentStatus, string> = {
  idle: 'Inactivo',
  running: 'Ejecutando',
  completed: 'Completado',
  failed: 'Fallido',
  blocked: 'Bloqueado',
  cancelled: 'Cancelado'
};

export const AGENT_CAPABILITY_LABELS: Record<AgentCapability, string> = {
  data_collection: 'Recolección de datos',
  data_validation: 'Validación de datos',
  telemetry_analysis: 'Análisis de telemetría',
  task_classification: 'Clasificación de tareas',
  synthetic_generation: 'Generación sintética',
  labeling: 'Etiquetado',
  feature_engineering: 'Ingeniería de características',
  baseline_establishment: 'Establecimiento de línea base',
  policy_training: 'Entrenamiento de políticas',
  cost_optimization: 'Optimización de costes',
  latency_optimization: 'Optimización de latencia',
  energy_optimization: 'Optimización energética',
  quality_evaluation: 'Evaluación de calidad',
  adversarial_testing: 'Pruebas adversariales',
  independent_evaluation: 'Evaluación independiente',
  coordination: 'Coordinación'
};
