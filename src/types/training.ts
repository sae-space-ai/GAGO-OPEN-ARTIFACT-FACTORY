// GAGO Open Artifact Factory - Phase 9 Types
// JOULE FREE TRAINING AND DONATION SYSTEM

export type TrainingModality = 'local_browser' | 'local_node' | 'shared';

export type TrainingJobStatus = 
  | 'DRAFT'
  | 'VALIDATING'
  | 'QUOTA_PENDING'
  | 'QUEUED'
  | 'PREPARING'
  | 'RUNNING'
  | 'EVALUATING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'TIME_LIMIT'
  | 'RESOURCE_LIMIT'
  | 'BLOCKED';

export type AlgorithmType = 
  | 'policy_optimization'
  | 'contextual_bandit'
  | 'classification'
  | 'regression'
  | 'cost_estimation'
  | 'latency_prediction'
  | 'route_selection'
  | 'incremental_learning'
  | 'policy_evaluation'
  | 'deterministic_baseline';

export interface TrainingAlgorithm {
  id: string;
  name: string;
  version: string;
  type: AlgorithmType;
  description: string;
  parameters: Record<string, any>;
  requirements: {
    minMemoryMB?: number;
    maxDurationMs?: number;
    maxDatasetSize?: number;
    requiresGPU?: boolean;
  };
  compatible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingDataset {
  id: string;
  name: string;
  version: string;
  description: string;
  size: number;
  format: string;
  isSynthetic: boolean;
  ownerId: string;
  validated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingJob {
  id: string;
  userId: string;
  algorithmId: string;
  datasetId: string;
  modality: TrainingModality;
  status: TrainingJobStatus;
  parameters: Record<string, any>;
  estimatedResources: {
    memoryMB: number;
    durationMs: number;
    costUnits: number;
  };
  actualResources?: {
    memoryMB: number;
    durationMs: number;
    costUnits: number;
  };
  results?: any;
  evaluation?: TrainingEvaluation;
  error?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface TrainingEvaluation {
  id: string;
  jobId: string;
  metrics: Record<string, number>;
  passed: boolean;
  details: string;
  evaluatedAt: string;
}

export interface TrainingQuota {
  userId: string;
  modality: TrainingModality;
  limits: {
    maxJobsPerMonth: number;
    maxDurationPerJobMs: number;
    maxTotalDurationMsPerMonth: number;
    maxConcurrentJobs: number;
    maxDatasetSizeMB: number;
    maxExamplesPerJob: number;
  };
  usage: {
    jobsThisMonth: number;
    durationThisMonthMs: number;
    currentConcurrentJobs: number;
  };
  renewalDate: string;
}

export interface GlobalBudget {
  maxConcurrentJobs: number;
  maxTotalMemoryMB: number;
  maxTotalDurationMs: number;
  currentConcurrentJobs: number;
  currentMemoryMB: number;
  currentDurationMs: number;
  lastUpdated: string;
}

export interface Donation {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  provider: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface DonationTransparency {
  totalDonations: number;
  totalDonors: number;
  operationalCosts: number;
  freeCapacityOffered: number;
  freeCapacityUsed: number;
  sustainabilityGoals: string[];
  lastUpdated: string;
}

export const TRAINING_MODALITY_LABELS: Record<TrainingModality, string> = {
  local_browser: 'Entrenamiento Local (Navegador)',
  local_node: 'Entrenamiento Local (Node.js)',
  shared: 'Entrenamiento Compartido'
};

export const TRAINING_JOB_STATUS_LABELS: Record<TrainingJobStatus, string> = {
  DRAFT: 'Borrador',
  VALIDATING: 'Validando',
  QUOTA_PENDING: 'Cuota Pendiente',
  QUEUED: 'En Cola',
  PREPARING: 'Preparando',
  RUNNING: 'Ejecutando',
  EVALUATING: 'Evaluando',
  COMPLETED: 'Completado',
  FAILED: 'Fallido',
  CANCELLED: 'Cancelado',
  TIME_LIMIT: 'Límite de Tiempo',
  RESOURCE_LIMIT: 'Límite de Recursos',
  BLOCKED: 'Bloqueado'
};

export const ALGORITHM_TYPE_LABELS: Record<AlgorithmType, string> = {
  policy_optimization: 'Optimización de Políticas',
  contextual_bandit: 'Bandido Contextual',
  classification: 'Clasificación',
  regression: 'Regresión',
  cost_estimation: 'Estimación de Coste',
  latency_prediction: 'Predicción de Latencia',
  route_selection: 'Selección de Rutas',
  incremental_learning: 'Aprendizaje Incremental',
  policy_evaluation: 'Evaluación de Políticas',
  deterministic_baseline: 'Referencia Determinista'
};

// Re-exportar tipos del donation-manager
export type { DonationSystemState } from '../services/training/donation-manager';
