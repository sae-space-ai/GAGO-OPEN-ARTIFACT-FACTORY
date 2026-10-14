// GAGO OPEN ARTIFACT FACTORY - Scope Matrix Types
// Fase 0.1 — Matriz de Alcance Ejecutable
// Este archivo amplía los modelos de la Fase 0 sin modificarlos.

export type ScopeModule =
  | 'M01' | 'M02' | 'M03' | 'M04' | 'M05' | 'M06'
  | 'M07' | 'M08' | 'M09' | 'M10' | 'M11' | 'M12'
  | 'M13' | 'M14' | 'M15' | 'M16';

export type ScopePhase = '0' | '0.1' | '1' | '2' | '3' | '4';

export type ImplementationStatus =
  | 'not_started'
  | 'in_development'
  | 'implemented'
  | 'blocked'
  | 'discarded';

export type TestStatus =
  | 'not_tested'
  | 'test_failed'
  | 'test_passed'
  | 'verified';

export type ExecutorType = 'human' | 'ai_supervised' | 'automated' | 'external_tool';

export type ActionType = 'local_ui' | 'external_tool' | 'automated_check' | 'manual_procedure';

export interface ScopeRequirement {
  id: string;
  code: ScopeModule;
  phase: ScopePhase;
  module: string;
  name: string;
  functionalDescription: string;
  technicalObjective: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  dependencies: string[]; // IDs of other ScopeRequirement
  executor: ExecutorType;
  implementationStatus: ImplementationStatus;
  testStatus: TestStatus;
  verificationStatus: 'not_verified' | 'partially_verified' | 'fully_verified';
  acceptanceCriteria: string[];
  evidenceIds: string[]; // IDs of Evidence records
  relatedProjectIds: string[];
  relatedTaskIds: string[];
  relatedArtifactIds: string[];
  actionType: ActionType;
  actionReference: string; // command, URL, or procedure ID
  blockers: string[]; // descriptions of blockers
  observations: string;
  versionRef: string; // commit or version reference
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export type GateStatus = 'pending' | 'passed' | 'failed' | 'blocked';

export interface QualityGate {
  id: string;
  code: string; // GATE 01, GATE 02, etc.
  name: string;
  description: string;
  status: GateStatus;
  lastCheck: string | null; // ISO date
  source: string; // origin of the result
  reference: string; // verifiable reference (commit, log, etc.)
  procedure: string; // what to check
  automated: boolean;
  requiresHumanAuth: boolean;
  createdAt: string;
  updatedAt: string;
}

export const IMPLEMENTATION_STATUS_LABELS: Record<ImplementationStatus, string> = {
  not_started: 'No iniciado',
  in_development: 'En desarrollo',
  implemented: 'Implementado',
  blocked: 'Bloqueado',
  discarded: 'Descartado',
};

export const TEST_STATUS_LABELS: Record<TestStatus, string> = {
  not_tested: 'No probado',
  test_failed: 'Prueba fallida',
  test_passed: 'Prueba superada',
  verified: 'Verificado',
};

export const VERIFICATION_STATUS_LABELS: Record<ScopeRequirement['verificationStatus'], string> = {
  not_verified: 'No verificado',
  partially_verified: 'Parcialmente verificado',
  fully_verified: 'Verificado',
};

export const EXECUTOR_LABELS: Record<ExecutorType, string> = {
  human: 'Humano',
  ai_supervised: 'IA supervisada',
  automated: 'Automatizado',
  external_tool: 'Herramienta externa',
};

export const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  local_ui: 'Acción local (navegador)',
  external_tool: 'Herramienta externa',
  automated_check: 'Comprobación automatizada',
  manual_procedure: 'Procedimiento manual',
};

export const GATE_STATUS_LABELS: Record<GateStatus, string> = {
  pending: 'Pendiente',
  passed: 'Superada',
  failed: 'Fallida',
  blocked: 'Bloqueada',
};

export const SCOPE_MODULE_LABELS: Record<ScopeModule, string> = {
  M01: 'M01 — Protección Fase 0',
  M02: 'M02 — Modelo de datos',
  M03: 'M03 — Persistencia',
  M04: 'M04 — Interfaz matriz',
  M05: 'M05 — Edición requisitos',
  M06: 'M06 — Relaciones',
  M07: 'M07 — Dependencias',
  M08: 'M08 — Estados implementación',
  M09: 'M09 — Estados validación',
  M10: 'M10 — Registro evidencias',
  M11: 'M11 — Criterios aceptación',
  M12: 'M12 — Panel progreso',
  M13: 'M13 — Export/Import',
  M14: 'M14 — Integración Qwen',
  M15: 'M15 — Validación continua',
  M16: 'M16 — Preparación publicación',
};
