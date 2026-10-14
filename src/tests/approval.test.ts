// GAGO Open Artifact Factory - Approval Engine Tests
// Phase 8: JOULE AUTONOMOUS APPROVAL ENGINE

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  discoverModules, 
  findModule, 
  findModulesByPhase,
  installDiscoveredModules 
} from '../services/approval/module-discovery';
import { 
  buildDependencyGraph, 
  checkDependenciesSatisfied, 
  getEvaluationOrder,
  hasDependencyCycle,
  getAffectedModules
} from '../services/approval/dependency-analyzer';
import { 
  classifyModuleRisk, 
  analyzeChangeImpact,
  requiresManualReview
} from '../services/approval/risk-classifier';
import { 
  evaluateModule, 
  evaluateAllModules,
  DEFAULT_APPROVAL_POLICY,
  needsReevaluation,
  invalidateStaleApprovals
} from '../services/approval/approval-engine';
import { 
  TestEvidenceCollector,
  createMockTestEvidences,
  validateEvidenceAuthenticity,
  generateEvidenceSummary
} from '../services/approval/test-evidence-collector';
import type { ModuleManifest, TestEvidence } from '../types/approval';

describe('Module Discovery Engine', () => {
  it('debe descubrir todos los módulos conocidos', () => {
    const modules = discoverModules();
    expect(modules.length).toBeGreaterThan(0);
    expect(modules.some(m => m.id === 'module-projects')).toBe(true);
    expect(modules.some(m => m.id === 'module-joule')).toBe(true);
  });

  it('debe instalar módulos de forma idempotente', () => {
    const existing: ModuleManifest[] = [];
    const first = installDiscoveredModules(existing);
    const second = installDiscoveredModules(first);
    expect(first.length).toBe(second.length);
  });

  it('debe buscar módulos por ID', () => {
    const modules = discoverModules();
    const found = findModule(modules, 'module-projects');
    expect(found).toBeDefined();
    expect(found?.name).toBe('Gestión de Proyectos');
  });

  it('debe buscar módulos por fase', () => {
    const modules = discoverModules();
    const phase0Modules = findModulesByPhase(modules, '0');
    expect(phase0Modules.length).toBeGreaterThan(0);
    expect(phase0Modules.every(m => m.phase === '0')).toBe(true);
  });
});

describe('Dependency Analyzer', () => {
  it('debe construir el grafo de dependencias', () => {
    const modules = discoverModules();
    const graph = buildDependencyGraph(modules);
    expect(graph.length).toBe(modules.length);
    expect(graph[0].moduleId).toBeDefined();
    expect(graph[0].dependencies).toBeDefined();
  });

  it('debe verificar dependencias satisfechas', () => {
    const modules = discoverModules();
    const module = modules.find(m => m.id === 'module-tasks')!;
    const result = checkDependenciesSatisfied(module, modules);
    expect(result.satisfied).toBe(true);
  });

  it('debe detectar dependencias no satisfechas', () => {
    const modules: ModuleManifest[] = [
      {
        id: 'module-a',
        name: 'Module A',
        version: '1.0.0',
        category: 'core',
        phase: '0',
        description: 'Test',
        dependencies: ['module-b'],
        requirements: [],
        components: [],
        tests: [],
        evidences: [],
        criticality: 'LOW',
        status: 'IMPLEMENTED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const module = modules[0];
    const result = checkDependenciesSatisfied(module, modules);
    expect(result.satisfied).toBe(false);
    expect(result.unsatisfied).toContain('module-b');
  });

  it('debe obtener el orden de evaluación', () => {
    const modules = discoverModules();
    const order = getEvaluationOrder(modules);
    expect(order.length).toBe(modules.length);
  });

  it('debe detectar ciclos de dependencias', () => {
    const modules: ModuleManifest[] = [
      {
        id: 'module-a',
        name: 'Module A',
        version: '1.0.0',
        category: 'core',
        phase: '0',
        description: 'Test',
        dependencies: ['module-b'],
        requirements: [],
        components: [],
        tests: [],
        evidences: [],
        criticality: 'LOW',
        status: 'IMPLEMENTED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'module-b',
        name: 'Module B',
        version: '1.0.0',
        category: 'core',
        phase: '0',
        description: 'Test',
        dependencies: ['module-a'],
        requirements: [],
        components: [],
        tests: [],
        evidences: [],
        criticality: 'LOW',
        status: 'IMPLEMENTED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    expect(hasDependencyCycle(modules)).toBe(true);
  });

  it('debe identificar módulos afectados por un cambio', () => {
    const modules = discoverModules();
    const affected = getAffectedModules('module-storage', modules);
    expect(affected.length).toBeGreaterThan(0);
  });
});

describe('Risk Classifier', () => {
  it('debe clasificar el riesgo de un módulo', () => {
    const modules = discoverModules();
    const module = modules.find(m => m.id === 'module-storage')!;
    const risk = classifyModuleRisk(module);
    expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(risk);
  });

  it('debe clasificar módulos de infraestructura como alto riesgo', () => {
    const module: ModuleManifest = {
      id: 'test',
      name: 'Test',
      version: '1.0.0',
      category: 'infrastructure',
      phase: '0',
      description: 'Test',
      dependencies: [],
      requirements: [],
      components: [],
      tests: [],
      evidences: [],
      criticality: 'CRITICAL',
      status: 'IMPLEMENTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const risk = classifyModuleRisk(module);
    expect(risk).toBe('CRITICAL');
  });

  it('debe analizar el impacto de un cambio', () => {
    const modules = discoverModules();
    const impact = analyzeChangeImpact('module-storage', ['storage.ts'], modules);
    expect(impact.moduleId).toBe('module-storage');
    expect(impact.affectedModules.length).toBeGreaterThan(0);
  });

  it('debe determinar si requiere revisión manual', () => {
    const module: ModuleManifest = {
      id: 'test',
      name: 'Test',
      version: '1.0.0',
      category: 'infrastructure',
      phase: '0',
      description: 'Test',
      dependencies: [],
      requirements: [],
      components: [],
      tests: [],
      evidences: [],
      criticality: 'CRITICAL',
      status: 'IMPLEMENTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    expect(requiresManualReview(module, 'CRITICAL')).toBe(true);
  });
});

describe('Test Evidence Collector', () => {
  let collector: TestEvidenceCollector;

  beforeEach(() => {
    collector = new TestEvidenceCollector();
  });

  it('debe registrar evidencias', () => {
    const evidence = collector.registerEvidence({
      moduleId: 'test',
      testType: 'unit',
      testName: 'test-1',
      result: 'passed',
      duration: 100,
      timestamp: new Date().toISOString(),
      source: 'vitest',
      authenticated: true
    });

    expect(evidence.id).toBeDefined();
    expect(collector.getAllEvidences().length).toBe(1);
  });

  it('debe obtener evidencias por módulo', () => {
    collector.registerEvidence({
      moduleId: 'module-a',
      testType: 'unit',
      testName: 'test-1',
      result: 'passed',
      duration: 100,
      timestamp: new Date().toISOString(),
      source: 'vitest',
      authenticated: true
    });

    collector.registerEvidence({
      moduleId: 'module-b',
      testType: 'unit',
      testName: 'test-2',
      result: 'passed',
      duration: 100,
      timestamp: new Date().toISOString(),
      source: 'vitest',
      authenticated: true
    });

    const evidences = collector.getEvidencesByModule('module-a');
    expect(evidences.length).toBe(1);
  });

  it('debe crear evidencias simuladas', () => {
    const evidences = createMockTestEvidences('test-module', {
      unitTests: 3,
      integrationTests: 2,
      allPassed: true
    });

    expect(evidences.length).toBeGreaterThan(0);
    expect(evidences.every(e => e.moduleId === 'test-module')).toBe(true);
  });

  it('debe validar autenticidad de evidencias', () => {
    const evidence: TestEvidence = {
      id: '1',
      moduleId: 'test',
      testType: 'unit',
      testName: 'test-1',
      result: 'passed',
      duration: 100,
      timestamp: new Date().toISOString(),
      source: 'vitest',
      authenticated: true
    };

    const result = validateEvidenceAuthenticity(evidence);
    expect(result.valid).toBe(true);
  });

  it('debe generar resumen de evidencias', () => {
    const evidences = createMockTestEvidences('test-module', {
      unitTests: 5,
      allPassed: true
    });

    const summary = generateEvidenceSummary('test-module', evidences);
    expect(summary.moduleId).toBe('test-module');
    expect(summary.totalEvidences).toBeGreaterThan(0);
  });
});

describe('Approval Engine', () => {
  it('debe evaluar un módulo con todas las pruebas pasadas', () => {
    const modules = discoverModules();
    const module = modules.find(m => m.id === 'module-projects')!;
    const evidences = createMockTestEvidences(module.id, {
      unitTests: 5,
      integrationTests: 2,
      allPassed: true
    });

    const evaluation = evaluateModule(module, modules, evidences);
    expect(evaluation.moduleId).toBe(module.id);
    expect(evaluation.testsPassed).toBeGreaterThan(0);
    expect(evaluation.decision).toBeDefined();
  });

  it('debe rechazar un módulo no implementado', () => {
    const module: ModuleManifest = {
      id: 'test',
      name: 'Test',
      version: '1.0.0',
      category: 'core',
      phase: '0',
      description: 'Test',
      dependencies: [],
      requirements: [],
      components: [],
      tests: [],
      evidences: [],
      criticality: 'LOW',
      status: 'NOT_IMPLEMENTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const evaluation = evaluateModule(module, [], []);
    expect(evaluation.decision).toBe('REJECTED');
    expect(evaluation.status).toBe('NOT_IMPLEMENTED');
  });

  it('debe evaluar todos los módulos', () => {
    const modules = discoverModules();
    const evidences: TestEvidence[] = [];

    for (const module of modules) {
      const moduleEvidences = createMockTestEvidences(module.id, {
        unitTests: 3,
        allPassed: true
      });
      evidences.push(...moduleEvidences);
    }

    const result = evaluateAllModules(modules, evidences);
    expect(result.evaluations.length).toBe(modules.length);
    expect(result.summary.total).toBe(modules.length);
  });

  it('debe detectar aprobaciones obsoletas', () => {
    const module: ModuleManifest = {
      id: 'test',
      name: 'Test',
      version: '2.0.0',
      category: 'core',
      phase: '0',
      description: 'Test',
      dependencies: [],
      requirements: [],
      components: [],
      tests: [],
      evidences: [],
      criticality: 'LOW',
      status: 'IMPLEMENTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const evaluation = {
      id: '1',
      moduleId: 'test',
      moduleVersion: '1.0.0',
      evaluationDate: new Date().toISOString(),
      evaluator: 'test',
      status: 'AUTO_APPROVED' as const,
      decision: 'APPROVED' as const,
      requirementsChecked: 0,
      requirementsPassed: 0,
      testsExecuted: 0,
      testsPassed: 0,
      testsFailed: 0,
      evidencesVerified: 0,
      evidencesPending: 0,
      dependenciesChecked: 0,
      dependenciesSatisfied: 0,
      qualityGatesApplied: [],
      qualityGatesPassed: [],
      qualityGatesFailed: [],
      securityChecks: [],
      securityIssues: [],
      riskLevel: 'LOW' as const,
      reasons: [],
      blockers: [],
      recommendations: [],
      approvalPolicy: 'test',
      autoApproved: true,
      requiresManualReview: false
    };

    expect(needsReevaluation(module, evaluation)).toBe(true);
  });

  it('debe invalidar aprobaciones obsoletas', () => {
    const modules: ModuleManifest[] = [
      {
        id: 'test',
        name: 'Test',
        version: '2.0.0',
        category: 'core',
        phase: '0',
        description: 'Test',
        dependencies: [],
        requirements: [],
        components: [],
        tests: [],
        evidences: [],
        criticality: 'LOW',
        status: 'IMPLEMENTED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const evaluations = [
      {
        id: '1',
        moduleId: 'test',
        moduleVersion: '1.0.0',
        evaluationDate: new Date().toISOString(),
        evaluator: 'test',
        status: 'AUTO_APPROVED' as const,
        decision: 'APPROVED' as const,
        requirementsChecked: 0,
        requirementsPassed: 0,
        testsExecuted: 0,
        testsPassed: 0,
        testsFailed: 0,
        evidencesVerified: 0,
        evidencesPending: 0,
        dependenciesChecked: 0,
        dependenciesSatisfied: 0,
        qualityGatesApplied: [],
        qualityGatesPassed: [],
        qualityGatesFailed: [],
        securityChecks: [],
        securityIssues: [],
        riskLevel: 'LOW' as const,
        reasons: [],
        blockers: [],
        recommendations: [],
        approvalPolicy: 'test',
        autoApproved: true,
        requiresManualReview: false
      }
    ];

    const invalidated = invalidateStaleApprovals(modules, evaluations);
    expect(invalidated[0].status).toBe('STALE_APPROVAL');
  });
});

describe('Approval Scenarios', () => {
  it('Escenario 1: Módulo implementado con todas las pruebas pasadas', () => {
    const module: ModuleManifest = {
      id: 'test',
      name: 'Test',
      version: '1.0.0',
      category: 'core',
      phase: '0',
      description: 'Test',
      dependencies: [],
      requirements: ['req-1'],
      components: [],
      tests: ['test-1'],
      evidences: ['ev-1'],
      criticality: 'LOW',
      status: 'IMPLEMENTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const evidences = createMockTestEvidences(module.id, {
      unitTests: 5,
      allPassed: true
    });

    const evaluation = evaluateModule(module, [], evidences);
    expect(evaluation.decision).toBe('APPROVED');
    expect(evaluation.autoApproved).toBe(true);
  });

  it('Escenario 2: Módulo con prueba fallida', () => {
    const module: ModuleManifest = {
      id: 'test',
      name: 'Test',
      version: '1.0.0',
      category: 'core',
      phase: '0',
      description: 'Test',
      dependencies: [],
      requirements: [],
      components: [],
      tests: ['test-1'],
      evidences: [],
      criticality: 'LOW',
      status: 'IMPLEMENTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const evidences = createMockTestEvidences(module.id, {
      unitTests: 5,
      allPassed: false
    });

    const evaluation = evaluateModule(module, [], evidences);
    expect(evaluation.testsFailed).toBeGreaterThan(0);
    expect(evaluation.decision).toBe('REJECTED');
  });

  it('Escenario 5: Módulo con dependencia fallida', () => {
    const modules: ModuleManifest[] = [
      {
        id: 'module-a',
        name: 'Module A',
        version: '1.0.0',
        category: 'core',
        phase: '0',
        description: 'Test',
        dependencies: ['module-b'],
        requirements: [],
        components: [],
        tests: ['test-1'],
        evidences: ['ev-1'],
        criticality: 'LOW',
        status: 'IMPLEMENTED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'module-b',
        name: 'Module B',
        version: '1.0.0',
        category: 'core',
        phase: '0',
        description: 'Test',
        dependencies: [],
        requirements: [],
        components: [],
        tests: [],
        evidences: [],
        criticality: 'LOW',
        status: 'TEST_FAILED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const evidences = createMockTestEvidences('module-a', {
      unitTests: 5,
      allPassed: true
    });

    const evaluation = evaluateModule(modules[0], modules, evidences);
    expect(evaluation.dependenciesSatisfied).toBeLessThan(modules[0].dependencies.length);
    expect(evaluation.blockers.length).toBeGreaterThan(0);
  });
});
