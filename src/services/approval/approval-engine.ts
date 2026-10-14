// GAGO Open Artifact Factory - Approval Engine
// Phase 8: JOULE AUTONOMOUS APPROVAL ENGINE

import type { 
  ModuleManifest, 
  ModuleEvaluation, 
  ApprovalDecision, 
  ModuleStatus,
  TestEvidence,
  ApprovalPolicy 
} from '../../types/approval';
import { generateId } from '../storage';
import { checkDependenciesSatisfied } from './dependency-analyzer';
import { classifyModuleRisk, requiresManualReview } from './risk-classifier';

/**
 * Política de aprobación por defecto
 */
export const DEFAULT_APPROVAL_POLICY: ApprovalPolicy = {
  id: 'policy-default',
  name: 'Política de Aprobación Estándar',
  version: '1.0.0',
  autoApproveLowRisk: true,
  autoApproveMediumRisk: false,
  requireManualReview: ['HIGH', 'CRITICAL'],
  requiredTests: ['unit', 'typecheck', 'build'],
  requiredQualityGates: ['GATE-01', 'GATE-02', 'GATE-03'],
  evidenceRequirements: {
    minTests: 1,
    minEvidences: 1,
    requireAuthenticated: false
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

/**
 * Evalúa un módulo y determina si puede ser aprobado
 */
export function evaluateModule(
  module: ModuleManifest,
  modules: ModuleManifest[],
  testEvidences: TestEvidence[],
  policy: ApprovalPolicy = DEFAULT_APPROVAL_POLICY
): ModuleEvaluation {
  const evaluationId = generateId();
  const evaluationDate = new Date().toISOString();
  const reasons: string[] = [];
  const blockers: string[] = [];
  const recommendations: string[] = [];

  // 1. Verificar que el módulo existe y está implementado
  if (module.status === 'NOT_IMPLEMENTED') {
    return {
      id: evaluationId,
      moduleId: module.id,
      moduleVersion: module.version,
      commitRef: module.commitRef,
      evaluationDate,
      evaluator: 'JOULE_AUTONOMOUS_APPROVAL_ENGINE',
      status: 'NOT_IMPLEMENTED',
      decision: 'REJECTED',
      requirementsChecked: module.requirements.length,
      requirementsPassed: 0,
      testsExecuted: 0,
      testsPassed: 0,
      testsFailed: 0,
      evidencesVerified: 0,
      evidencesPending: 0,
      dependenciesChecked: module.dependencies.length,
      dependenciesSatisfied: 0,
      qualityGatesApplied: policy.requiredQualityGates,
      qualityGatesPassed: [],
      qualityGatesFailed: policy.requiredQualityGates,
      securityChecks: [],
      securityIssues: [],
      riskLevel: 'CRITICAL',
      reasons: ['Módulo no implementado'],
      blockers: ['Implementación requerida'],
      recommendations: ['Implementar el módulo antes de evaluar'],
      approvalPolicy: policy.id,
      autoApproved: false,
      requiresManualReview: true
    };
  }

  // 2. Verificar dependencias
  const depCheck = checkDependenciesSatisfied(module, modules);
  const dependenciesSatisfied = depCheck.satisfied ? module.dependencies.length : 
    module.dependencies.length - depCheck.unsatisfied.length;

  if (!depCheck.satisfied) {
    blockers.push(`Dependencias no satisfechas: ${depCheck.unsatisfied.join(', ')}`);
    recommendations.push('Resolver dependencias antes de aprobar');
  }

  // 3. Verificar pruebas
  const moduleTests = testEvidences.filter(e => 
    module.tests.some(t => e.testName.includes(t))
  );
  
  const testsPassed = moduleTests.filter(t => t.result === 'passed').length;
  const testsFailed = moduleTests.filter(t => t.result === 'failed').length;

  if (testsFailed > 0) {
    blockers.push(`${testsFailed} prueba(s) fallida(s)`);
    recommendations.push('Corregir pruebas fallidas');
  }

  if (moduleTests.length < policy.evidenceRequirements.minTests) {
    blockers.push(`Insuficientes pruebas: ${moduleTests.length}/${policy.evidenceRequirements.minTests}`);
    recommendations.push('Agregar más pruebas');
  }

  // 4. Verificar evidencias
  const moduleEvidences = testEvidences.filter(e => 
    module.evidences.includes(e.id) || module.tests.some(t => e.testName.includes(t))
  );

  const evidencesVerified = moduleEvidences.filter(e => e.authenticated).length;
  const evidencesPending = moduleEvidences.filter(e => !e.authenticated).length;

  if (evidencesVerified < policy.evidenceRequirements.minEvidences) {
    blockers.push(`Insuficientes evidencias verificadas: ${evidencesVerified}/${policy.evidenceRequirements.minEvidences}`);
    recommendations.push('Proporcionar más evidencias verificadas');
  }

  if (policy.evidenceRequirements.requireAuthenticated && evidencesPending > 0) {
    blockers.push('Evidencias no autenticadas presentes');
    recommendations.push('Autenticar todas las evidencias');
  }

  // 5. Clasificar riesgo
  const riskLevel = classifyModuleRisk(module);

  // 6. Determinar si requiere revisión manual
  const needsManualReview = requiresManualReview(module, riskLevel) || 
    policy.requireManualReview.includes(riskLevel);

  // 7. Determinar decisión
  let decision: ApprovalDecision = 'PENDING';
  let status: ModuleStatus = 'READY_FOR_REVIEW';

  if (blockers.length > 0) {
    decision = 'REJECTED';
    status = 'TEST_FAILED';
    reasons.push('Bloqueos detectados');
  } else if (needsManualReview) {
    decision = 'PENDING';
    status = 'MANUAL_REVIEW_REQUIRED';
    reasons.push('Requiere revisión manual por nivel de riesgo');
  } else if (testsPassed >= policy.evidenceRequirements.minTests && 
             evidencesVerified >= policy.evidenceRequirements.minEvidences &&
             depCheck.satisfied) {
    // Verificar si puede ser aprobado automáticamente
    if ((riskLevel === 'LOW' && policy.autoApproveLowRisk) ||
        (riskLevel === 'MEDIUM' && policy.autoApproveMediumRisk)) {
      decision = 'APPROVED';
      status = 'AUTO_APPROVED';
      reasons.push('Todos los criterios de aprobación cumplidos');
    } else {
      decision = 'PENDING';
      status = 'VERIFIED';
      reasons.push('Módulo verificado pero requiere aprobación manual');
    }
  }

  // 8. Generar recomendaciones adicionales
  if (decision === 'APPROVED') {
    recommendations.push('Módulo listo para integración');
  } else if (decision === 'REJECTED') {
    recommendations.push('Resolver bloqueos y reevaluar');
  }

  return {
    id: evaluationId,
    moduleId: module.id,
    moduleVersion: module.version,
    commitRef: module.commitRef,
    evaluationDate,
    evaluator: 'JOULE_AUTONOMOUS_APPROVAL_ENGINE',
    status,
    decision,
    requirementsChecked: module.requirements.length,
    requirementsPassed: decision === 'APPROVED' ? module.requirements.length : 0,
    testsExecuted: moduleTests.length,
    testsPassed,
    testsFailed,
    evidencesVerified,
    evidencesPending,
    dependenciesChecked: module.dependencies.length,
    dependenciesSatisfied,
    qualityGatesApplied: policy.requiredQualityGates,
    qualityGatesPassed: decision === 'APPROVED' ? policy.requiredQualityGates : [],
    qualityGatesFailed: decision === 'REJECTED' ? policy.requiredQualityGates : [],
    securityChecks: [],
    securityIssues: [],
    riskLevel,
    reasons,
    blockers,
    recommendations,
    approvalPolicy: policy.id,
    autoApproved: decision === 'APPROVED' && !needsManualReview,
    requiresManualReview: needsManualReview
  };
}

/**
 * Evalúa todos los módulos y genera un informe
 */
export function evaluateAllModules(
  modules: ModuleManifest[],
  testEvidences: TestEvidence[],
  policy: ApprovalPolicy = DEFAULT_APPROVAL_POLICY
): {
  evaluations: ModuleEvaluation[];
  summary: {
    total: number;
    approved: number;
    rejected: number;
    pending: number;
    autoApproved: number;
    manualReview: number;
  };
} {
  const evaluations: ModuleEvaluation[] = [];

  for (const module of modules) {
    const evaluation = evaluateModule(module, modules, testEvidences, policy);
    evaluations.push(evaluation);
  }

  const summary = {
    total: evaluations.length,
    approved: evaluations.filter(e => e.decision === 'APPROVED').length,
    rejected: evaluations.filter(e => e.decision === 'REJECTED').length,
    pending: evaluations.filter(e => e.decision === 'PENDING').length,
    autoApproved: evaluations.filter(e => e.autoApproved).length,
    manualReview: evaluations.filter(e => e.requiresManualReview).length
  };

  return { evaluations, summary };
}

/**
 * Determina si un módulo necesita reevaluación
 */
export function needsReevaluation(
  module: ModuleManifest,
  lastEvaluation: ModuleEvaluation
): boolean {
  // Necesita reevaluación si la versión cambió
  if (module.version !== lastEvaluation.moduleVersion) {
    return true;
  }

  // Necesita reevaluación si el commit cambió
  if (module.commitRef && lastEvaluation.commitRef && 
      module.commitRef !== lastEvaluation.commitRef) {
    return true;
  }

  // Necesita reevaluación si el estado cambió
  if (module.status !== lastEvaluation.status) {
    return true;
  }

  return false;
}

/**
 * Invalida aprobaciones obsoletas
 */
export function invalidateStaleApprovals(
  modules: ModuleManifest[],
  evaluations: ModuleEvaluation[]
): ModuleEvaluation[] {
  return evaluations.map(evaluation => {
    const module = modules.find(m => m.id === evaluation.moduleId);
    
    if (module && needsReevaluation(module, evaluation)) {
      return {
        ...evaluation,
        status: 'STALE_APPROVAL' as ModuleStatus,
        decision: 'PENDING' as ApprovalDecision,
        reasons: [...evaluation.reasons, 'Aprobación obsoleta - requiere reevaluación']
      };
    }

    return evaluation;
  });
}
