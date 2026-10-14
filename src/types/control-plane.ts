// GAGO Open Artifact Factory - Phase 5 Types
// JOULE AI COMPUTE CONTROL PLANE

export type CapabilityStatus = 'IMPLEMENTED' | 'CONFIGURED' | 'CONNECTED' | 'VERIFIED' | 'BLOCKED' | 'PLANNED';

export type ToolCategory = 
  | 'dashboard'
  | 'form'
  | 'crud'
  | 'calculator'
  | 'table'
  | 'report'
  | 'api_client'
  | 'validator'
  | 'comparator'
  | 'evidence_manager'
  | 'qwen_order'
  | 'workflow_builder'
  | 'model_spec'
  | 'budget_calculator'
  | 'log_analyzer';

export type ModelType = 'text' | 'code' | 'vision' | 'audio' | 'classification' | 'embedding';

export type ExecutionMode = 'browser' | 'local' | 'remote';

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'blocked';

export type ResourceStatus = 'declared' | 'detected' | 'verified' | 'unavailable';

export interface ToolManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  category: ToolCategory;
  inputs: ToolInput[];
  outputs: ToolOutput[];
  permissions: string[];
  dependencies: string[];
  capabilities: string[];
  status: CapabilityStatus;
  acceptanceCriteria: string[];
  tests: string[];
  evidenceIds: string[];
  license: string;
  createdAt: string;
  updatedAt: string;
  versionHistory: {
    version: string;
    date: string;
    changes: string[];
  }[];
}

export interface ToolInput {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'file';
  required: boolean;
  description: string;
  validation?: string;
}

export interface ToolOutput {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'file';
  description: string;
}

export interface ToolSpecification {
  name: string;
  category: ToolCategory;
  description: string;
  inputs: ToolInput[];
  outputs: ToolOutput[];
  permissions: string[];
  acceptanceCriteria: string[];
}

export interface ModelManifest {
  id: string;
  name: string;
  version: string;
  architecture: string;
  type: ModelType;
  executionMode: ExecutionMode;
  provider: string;
  license: string;
  capabilities: string[];
  requirements: {
    memory?: number;
    gpu?: boolean;
    cpu?: string;
    storage?: number;
  };
  adapterId?: string;
  status: CapabilityStatus;
  tests: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ResourceProfile {
  id: string;
  name: string;
  provider: string;
  mode: ExecutionMode;
  status: ResourceStatus;
  capabilities: {
    cpu?: string;
    memory?: number;
    storage?: number;
    gpu?: {
      available: boolean;
      memory?: number;
      model?: string;
    };
  };
  restrictions: {
    maxConcurrency: number;
    maxDuration: number;
    budget: number;
  };
  verified: boolean;
  lastChecked?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  version: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  inputs: ToolInput[];
  outputs: ToolOutput[];
  status: 'draft' | 'validated' | 'ready' | 'executing' | 'completed' | 'failed';
  validationErrors: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowNode {
  id: string;
  type: 'tool' | 'operation' | 'service' | 'condition' | 'loop';
  toolId?: string;
  operation?: string;
  serviceId?: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;
}

export interface JobSpecification {
  id: string;
  name: string;
  workflowId?: string;
  toolId?: string;
  inputs: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'critical';
  constraints: {
    maxDuration: number;
    budget: number;
    requiredResources: string[];
  };
  createdAt: string;
}

export interface JobExecution {
  id: string;
  jobId: string;
  status: JobStatus;
  startedAt?: string;
  completedAt?: string;
  resourceId?: string;
  outputs?: Record<string, any>;
  error?: string;
  metrics: {
    duration: number;
    cost: number;
    retries: number;
  };
  evidenceIds: string[];
}

export interface ExecutionPlan {
  id: string;
  jobId: string;
  steps: ExecutionStep[];
  estimatedDuration: number;
  estimatedCost: number;
  requiredResources: string[];
  createdAt: string;
}

export interface ExecutionStep {
  id: string;
  order: number;
  toolId?: string;
  operation?: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  resourceId?: string;
  status: JobStatus;
  dependencies: string[];
}

export interface DatasetManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  license: string;
  source: string;
  size: number;
  format: string;
  isSynthetic: boolean;
  relatedModelIds: string[];
  relatedAgentIds: string[];
  relatedProjectIds: string[];
  status: CapabilityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DeploymentRecord {
  id: string;
  artifactId: string;
  version: string;
  environment: 'preview' | 'production';
  provider: string;
  url?: string;
  status: 'pending' | 'deploying' | 'deployed' | 'failed' | 'rolled_back';
  commitRef?: string;
  deployedAt?: string;
  evidenceIds: string[];
  createdAt: string;
}

export interface ControlPlaneRequest {
  id: string;
  type: 'tool_creation' | 'workflow_execution' | 'model_inference' | 'resource_allocation' | 'job_scheduling';
  payload: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
  createdAt: string;
}

export interface ObservabilityEvent {
  id: string;
  type: 'operation' | 'error' | 'decision' | 'execution' | 'test';
  module: string;
  action: string;
  duration?: number;
  status: 'success' | 'failure' | 'warning';
  details: Record<string, any>;
  timestamp: string;
}

// Labels
export const TOOL_CATEGORY_LABELS: Record<ToolCategory, string> = {
  dashboard: 'Panel de Control',
  form: 'Formulario',
  crud: 'Gestor CRUD',
  calculator: 'Calculadora',
  table: 'Tabla',
  report: 'Informe',
  api_client: 'Cliente API',
  validator: 'Validador',
  comparator: 'Comparador',
  evidence_manager: 'Gestor de Evidencias',
  qwen_order: 'Órdenes Qwen',
  workflow_builder: 'Constructor de Workflows',
  model_spec: 'Especificación de Modelo',
  budget_calculator: 'Calculador de Presupuesto',
  log_analyzer: 'Analizador de Registros'
};

export const CAPABILITY_STATUS_LABELS: Record<CapabilityStatus, string> = {
  IMPLEMENTED: 'Implementado',
  CONFIGURED: 'Configurado',
  CONNECTED: 'Conectado',
  VERIFIED: 'Verificado',
  BLOCKED: 'Bloqueado',
  PLANNED: 'Planificado'
};

export const MODEL_TYPE_LABELS: Record<ModelType, string> = {
  text: 'Texto',
  code: 'Código',
  vision: 'Visión',
  audio: 'Audio',
  classification: 'Clasificación',
  embedding: 'Embedding'
};

export const EXECUTION_MODE_LABELS: Record<ExecutionMode, string> = {
  browser: 'Navegador',
  local: 'Local',
  remote: 'Remoto'
};

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  pending: 'Pendiente',
  running: 'Ejecutando',
  completed: 'Completado',
  failed: 'Fallido',
  cancelled: 'Cancelado',
  blocked: 'Bloqueado'
};
