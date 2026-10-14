// GAGO OPEN ARTIFACT FACTORY - Data Models
// Version: 0.1.0

export type ProjectStatus = 'planning' | 'development' | 'review' | 'completed' | 'archived';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'pending' | 'in_progress' | 'review' | 'blocked' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type ArtifactType = 'web_app' | 'document' | 'component' | 'report' | 'prototype' | 'code_package';
export type ArtifactStatus = 'draft' | 'in_progress' | 'review' | 'approved' | 'published';
export type EvidenceType = 'test' | 'report' | 'commit' | 'issue' | 'verification' | 'other';
export type EvidenceStatus = 'declared' | 'provided' | 'verified';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  isAutomated: boolean;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

export interface Artifact {
  id: string;
  name: string;
  description: string;
  type: ArtifactType;
  projectId: string;
  version: string;
  status: ArtifactStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Evidence {
  id: string;
  title: string;
  description: string;
  type: EvidenceType;
  status: EvidenceStatus;
  projectId?: string;
  taskId?: string;
  artifactId?: string;
  source: string;
  reference: string;
  createdAt: string;
  hash?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  language: 'es' | 'en';
  version: string;
}

export interface QwenOrder {
  projectId: string;
  objective: string;
  requirements: string[];
  constraints: string[];
  acceptanceCriteria: string[];
  generatedAt: string;
}

export interface DataStore {
  version: string;
  projects: Project[];
  tasks: Task[];
  artifacts: Artifact[];
  evidence: Evidence[];
  settings: AppSettings;
  // Phase 0.1 — Matriz de Alcance y Puertas de Calidad
  scopeMatrix?: import('./scope').ScopeRequirement[];
  qualityGates?: import('./scope').QualityGate[];
}

export const SCHEMA_VERSION = '0.1.0';

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: 'Planificación',
  development: 'Desarrollo',
  review: 'Revisión',
  completed: 'Completado',
  archived: 'Archivado',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En curso',
  review: 'En revisión',
  blocked: 'Bloqueada',
  completed: 'Completada',
};

export const ARTIFACT_TYPE_LABELS: Record<ArtifactType, string> = {
  web_app: 'Aplicación web',
  document: 'Documento',
  component: 'Componente',
  report: 'Informe',
  prototype: 'Prototipo',
  code_package: 'Paquete de código',
};

export const EVIDENCE_STATUS_LABELS: Record<EvidenceStatus, string> = {
  declared: 'Declarada',
  provided: 'Aportada',
  verified: 'Verificada',
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica',
};
