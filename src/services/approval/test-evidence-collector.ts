// GAGO Open Artifact Factory - Test Evidence Collector
// Phase 8: JOULE AUTONOMOUS APPROVAL ENGINE

import type { TestEvidence } from '../../types/approval';
import { generateId } from '../storage';

/**
 * Colector de evidencias de pruebas
 * Recopila resultados de pruebas unitarias, integración, typecheck, etc.
 */
export class TestEvidenceCollector {
  private evidences: TestEvidence[] = [];

  /**
   * Registra una evidencia de prueba
   */
  registerEvidence(evidence: Omit<TestEvidence, 'id'>): TestEvidence {
    const fullEvidence: TestEvidence = {
      ...evidence,
      id: generateId()
    };
    this.evidences.push(fullEvidence);
    return fullEvidence;
  }

  /**
   * Obtiene todas las evidencias
   */
  getAllEvidences(): TestEvidence[] {
    return [...this.evidences];
  }

  /**
   * Obtiene evidencias por módulo
   */
  getEvidencesByModule(moduleId: string): TestEvidence[] {
    return this.evidences.filter(e => e.moduleId === moduleId);
  }

  /**
   * Obtiene evidencias por tipo de prueba
   */
  getEvidencesByType(testType: TestEvidence['testType']): TestEvidence[] {
    return this.evidences.filter(e => e.testType === testType);
  }

  /**
   * Obtiene evidencias por resultado
   */
  getEvidencesByResult(result: TestEvidence['result']): TestEvidence[] {
    return this.evidences.filter(e => e.result === result);
  }

  /**
   * Obtiene estadísticas de pruebas
   */
  getStatistics(): {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    byType: Record<TestEvidence['testType'], number>;
    byModule: Record<string, number>;
  } {
    const byType: Record<TestEvidence['testType'], number> = {
      unit: 0,
      integration: 0,
      e2e: 0,
      typecheck: 0,
      lint: 0,
      build: 0
    };

    const byModule: Record<string, number> = {};

    for (const evidence of this.evidences) {
      byType[evidence.testType]++;
      byModule[evidence.moduleId] = (byModule[evidence.moduleId] || 0) + 1;
    }

    return {
      total: this.evidences.length,
      passed: this.evidences.filter(e => e.result === 'passed').length,
      failed: this.evidences.filter(e => e.result === 'failed').length,
      skipped: this.evidences.filter(e => e.result === 'skipped').length,
      byType,
      byModule
    };
  }

  /**
   * Limpia todas las evidencias
   */
  clear(): void {
    this.evidences = [];
  }

  /**
   * Exporta evidencias a JSON
   */
  exportToJSON(): string {
    return JSON.stringify(this.evidences, null, 2);
  }

  /**
   * Importa evidencias desde JSON
   */
  importFromJSON(json: string): void {
    try {
      const imported = JSON.parse(json) as TestEvidence[];
      this.evidences = [...this.evidences, ...imported];
    } catch (error) {
      throw new Error('Error al importar evidencias: JSON inválido');
    }
  }
}

/**
 * Crea evidencias de prueba simuladas para un módulo
 * (Para desarrollo y pruebas del motor de aprobación)
 */
export function createMockTestEvidences(
  moduleId: string,
  options: {
    unitTests?: number;
    integrationTests?: number;
    typecheck?: boolean;
    build?: boolean;
    allPassed?: boolean;
  } = {}
): TestEvidence[] {
  const evidences: TestEvidence[] = [];
  const now = new Date().toISOString();
  const {
    unitTests = 5,
    integrationTests = 2,
    typecheck = true,
    build = true,
    allPassed = true
  } = options;

  // Pruebas unitarias
  for (let i = 0; i < unitTests; i++) {
    evidences.push({
      id: generateId(),
      moduleId,
      testType: 'unit',
      testName: `unit-test-${i + 1}`,
      result: allPassed ? 'passed' : (i === 0 ? 'failed' : 'passed'),
      duration: Math.random() * 100,
      timestamp: now,
      source: 'vitest',
      authenticated: true
    });
  }

  // Pruebas de integración
  for (let i = 0; i < integrationTests; i++) {
    evidences.push({
      id: generateId(),
      moduleId,
      testType: 'integration',
      testName: `integration-test-${i + 1}`,
      result: allPassed ? 'passed' : 'failed',
      duration: Math.random() * 500,
      timestamp: now,
      source: 'vitest',
      authenticated: true
    });
  }

  // Typecheck
  if (typecheck) {
    evidences.push({
      id: generateId(),
      moduleId,
      testType: 'typecheck',
      testName: 'typescript-typecheck',
      result: allPassed ? 'passed' : 'failed',
      duration: Math.random() * 2000,
      timestamp: now,
      source: 'tsc',
      authenticated: true
    });
  }

  // Build
  if (build) {
    evidences.push({
      id: generateId(),
      moduleId,
      testType: 'build',
      testName: 'vite-build',
      result: allPassed ? 'passed' : 'failed',
      duration: Math.random() * 5000,
      timestamp: now,
      source: 'vite',
      authenticated: true
    });
  }

  return evidences;
}

/**
 * Valida la autenticidad de una evidencia
 */
export function validateEvidenceAuthenticity(evidence: TestEvidence): {
  valid: boolean;
  reason?: string;
} {
  // Verificar que la evidencia tenga todos los campos requeridos
  if (!evidence.id || !evidence.moduleId || !evidence.testType || !evidence.testName) {
    return { valid: false, reason: 'Faltan campos requeridos' };
  }

  // Verificar que el resultado sea válido
  if (!['passed', 'failed', 'skipped'].includes(evidence.result)) {
    return { valid: false, reason: 'Resultado de prueba inválido' };
  }

  // Verificar que la fuente sea conocida
  const validSources = ['vitest', 'tsc', 'vite', 'eslint', 'github-actions', 'manual'];
  if (!validSources.includes(evidence.source)) {
    return { valid: false, reason: `Fuente de evidencia desconocida: ${evidence.source}` };
  }

  // Verificar autenticación
  if (!evidence.authenticated) {
    return { valid: false, reason: 'Evidencia no autenticada' };
  }

  return { valid: true };
}

/**
 * Genera un resumen de evidencias para un módulo
 */
export function generateEvidenceSummary(
  moduleId: string,
  evidences: TestEvidence[]
): {
  moduleId: string;
  totalEvidences: number;
  passed: number;
  failed: number;
  skipped: number;
  authenticated: number;
  unauthenticated: number;
  byType: Record<TestEvidence['testType'], { passed: number; failed: number; skipped: number }>;
  lastTestDate: string | null;
} {
  const moduleEvidences = evidences.filter(e => e.moduleId === moduleId);

  const byType: Record<TestEvidence['testType'], { passed: number; failed: number; skipped: number }> = {
    unit: { passed: 0, failed: 0, skipped: 0 },
    integration: { passed: 0, failed: 0, skipped: 0 },
    e2e: { passed: 0, failed: 0, skipped: 0 },
    typecheck: { passed: 0, failed: 0, skipped: 0 },
    lint: { passed: 0, failed: 0, skipped: 0 },
    build: { passed: 0, failed: 0, skipped: 0 }
  };

  for (const evidence of moduleEvidences) {
    byType[evidence.testType][evidence.result]++;
  }

  const lastTestDate = moduleEvidences.length > 0
    ? moduleEvidences.reduce((latest, e) => 
        e.timestamp > latest ? e.timestamp : latest, 
        moduleEvidences[0].timestamp
      )
    : null;

  return {
    moduleId,
    totalEvidences: moduleEvidences.length,
    passed: moduleEvidences.filter(e => e.result === 'passed').length,
    failed: moduleEvidences.filter(e => e.result === 'failed').length,
    skipped: moduleEvidences.filter(e => e.result === 'skipped').length,
    authenticated: moduleEvidences.filter(e => e.authenticated).length,
    unauthenticated: moduleEvidences.filter(e => !e.authenticated).length,
    byType,
    lastTestDate
  };
}
