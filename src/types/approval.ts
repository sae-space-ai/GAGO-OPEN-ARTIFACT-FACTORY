// GAGO Open Artifact Factory - Phase 8 Types
// JOULE AUTONOMOUS APPROVAL ENGINE

export type ModuleStatus =
  | 'DISCOVERED'
  | 'NOT_IMPLEMENTED'
  | 'IMPLEMENTED'
  | 'READY_FOR_REVIEW'
  | 'TESTING'
  | 'TEST_FAILED'
  | 'EVIDENCE_PENDING'
  | 'SECURITY_BLOCKED'
  | 'DEPENDENCY_BLOCKED'
  | 'VERIFIED'
  | 'AUTO_APPROVED'
  | 'MANUAL_REVIEW_REQUIRED'
  | 'REJECTED'
  | 'STALE_APPROVAL';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ApprovalDecision = 'APPROVED' | 'REJECTED' | 'BLOCKED' | 'PENDING';

export interface ModuleManifest {
  id: string;
  name: string;
  version: string;
  category: string;
  phase: string;
  description: string;
  dependencies: string[];
  requirements: string[];
  components: string[];
  tests: string[];
  evidences: string[];
  criticality: RiskLevel;
  status: ModuleStatus;
  commitRef?: string;
  contentHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ModuleEvaluation {
  id: string;
  moduleId: string;
  moduleVersion: string;
  commitRef?: string;
  evaluationDate: string;
  evaluator: string;
  status: ModuleStatus;
  decision: ApprovalDecision;
  requirementsChecked: number;
  requirementsPassed: number;
  testsExecuted: number;
  testsPassed: number;
  testsFailed: number;
  evidencesVerified: number;
  evidencesPending: number;
  dependenciesChecked: number;
  dependenciesSatisfied: number;
  qualityGatesApplied: string[];
  qualityGatesPassed: string[];
  qualityGatesFailed: string[];
  securityChecks: string[];
  securityIssues: string[];
  riskLevel: RiskLevel;
  reasons: string[];
  blockers: string[];
  recommendations: string[];
  approvalPolicy: string;
  autoApproved: boolean;
  requiresManualReview: boolean;
  expiresAt?: string;
}

export interface TestEvidence {
  id: string;
  moduleId: string;
  testType: 'unit' | 'integration' | 'e2e' | 'typecheck' | 'lint' | 'build';
  testName: string;
  result: 'passed' | 'failed' | 'skipped';
  duration: number;
  timestamp: string;
  commitRef?: string;
  source: string;
  details?: string;
  authenticated: boolean;
}

export interface DependencyGraph {
  moduleId: string;
  dependencies: Array<{
    id: string;
    type: 'required' | 'optional';
    status: ModuleStatus;
  }>;
  dependents: Array<{
    id: string;
    type: 'required' | 'optional';
  }>;
  cycles: string[][];
}

export interface ApprovalHistory {
  moduleId: string;
  evaluations: ModuleEvaluation[];
  currentApproval?: ModuleEvaluation;
  previousApprovals: ModuleEvaluation[];
}

export interface ChangeImpact {
  moduleId: string;
  changedFiles: string[];
  affectedModules: string[];
  requiresReevaluation: boolean;
  riskLevel: RiskLevel;
  reason: string;
}

export interface ApprovalPolicy {
  id: string;
  name: string;
  version: string;
  autoApproveLowRisk: boolean;
  autoApproveMediumRisk: boolean;
  requireManualReview: RiskLevel[];
  requiredTests: string[];
  requiredQualityGates: string[];
  evidenceRequirements: {
    minTests: number;
    minEvidences: number;
    requireAuthenticated: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ModuleApprovalReport {
  timestamp: string;
  totalModules: number;
  discovered: number;
  implemented: number;
  evaluated: number;
  verified: number;
  autoApproved: number;
  rejected: number;
  blocked: number;
  pending: number;
  notImplemented: number;
  staleApprovals: number;
  moduleResults: Array<{
    moduleId: string;
    moduleName: string;
    status: ModuleStatus;
    decision: ApprovalDecision;
    reasons: string[];
  }>;
  duration: number;
  evaluatorVersion: string;
}

export const MODULE_STATUS_LABELS: Record<ModuleStatus, string> = {
  DISCOVERED: 'Descubierto',
  NOT_IMPLEMENTED: 'No Implementado',
  IMPLEMENTED: 'Implementado',
  READY_FOR_REVIEW: 'Listo para Revisión',
  TESTING: 'En Pruebas',
  TEST_FAILED: 'Pruebas Fallidas',
  EVIDENCE_PENDING: 'Evidencias Pendientes',
  SECURITY_BLOCKED: 'Bloqueado por Seguridad',
  DEPENDENCY_BLOCKED: 'Bloqueado por Dependencias',
  VERIFIED: 'Verificado',
  AUTO_APPROVED: 'Aprobado Automáticamente',
  MANUAL_REVIEW_REQUIRED: 'Requiere Revisión Manual',
  REJECTED: 'Rechazado',
  STALE_APPROVAL: 'Aprobación Obsoleta'
};

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  LOW: 'Bajo',
  MEDIUM: 'Medio',
  HIGH: 'Alto',
  CRITICAL: 'Crítico'
};

export const APPROVAL_DECISION_LABELS: Record<ApprovalDecision, string> = {
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  BLOCKED: 'Bloqueado',
  PENDING: 'Pendiente'
};
