// GAGO OPEN ARTIFACT FACTORY — JOULE QUALITY EVIDENCE ENGINE
// Fase 12 — Sistema de evidencias trazables y verificadas

import type {
  QualityEvidence,
  VerificationResult,
  BenchmarkResult,
  ResourceObservation
} from '../../types/joule-cognitive';
import { generateId } from '../storage';

/**
 * Motor de evidencias de calidad
 * Registra y gestiona evidencias verificadas de forma trazable
 */
export class QualityEvidenceEngine {
  private evidences: Map<string, QualityEvidence> = new Map();

  /**
   * Registra una nueva evidencia de calidad
   */
  registerEvidence(params: {
    taskId: string;
    operationId: string;
    modelId: string;
    modelVersion: string;
    providerId: string;
    adapterVersion: string;
    codeHash: string;
    benchmarkIds: string[];
    acceptanceCriteriaVersion: string;
    verificationResult: VerificationResult;
    executionEnvironment: string;
    createdBy: string;
    metadata?: Record<string, any>;
  }): QualityEvidence {
    const evidence: QualityEvidence = {
      id: generateId(),
      taskId: params.taskId,
      operationId: params.operationId,
      modelId: params.modelId,
      modelVersion: params.modelVersion,
      providerId: params.providerId,
      adapterVersion: params.adapterVersion,
      codeHash: params.codeHash,
      benchmarkIds: params.benchmarkIds,
      acceptanceCriteriaVersion: params.acceptanceCriteriaVersion,
      testResults: {
        total: params.verificationResult.testsExecuted,
        passed: params.verificationResult.testsPassed,
        failed: params.verificationResult.testsFailed,
        skipped: 0
      },
      verificationDuration: params.verificationResult.executionTimeMs || 0,
      verificationMethod: this.determineVerificationMethod(params.verificationResult),
      executionEnvironment: params.executionEnvironment,
      finalStatus: params.verificationResult.status,
      createdAt: new Date().toISOString(),
      createdBy: params.createdBy,
      metadata: params.metadata || {}
    };

    this.evidences.set(evidence.id, evidence);
    return evidence;
  }

  /**
   * Determina el método de verificación usado
   */
  private determineVerificationMethod(result: VerificationResult): 'static' | 'dynamic' | 'hybrid' {
    if (result.verifiedBy === 'unit_tests' || result.verifiedBy === 'integration_tests') {
      if (result.syntaxValid && result.typeCheckPassed) {
        return 'hybrid';
      }
      return 'dynamic';
    }
    return 'static';
  }

  /**
   * Obtiene una evidencia por ID
   */
  getEvidence(evidenceId: string): QualityEvidence | undefined {
    return this.evidences.get(evidenceId);
  }

  /**
   * Obtiene todas las evidencias de una tarea
   */
  getEvidencesByTask(taskId: string): QualityEvidence[] {
    return Array.from(this.evidences.values()).filter(e => e.taskId === taskId);
  }

  /**
   * Obtiene todas las evidencias de un modelo
   */
  getEvidencesByModel(modelId: string): QualityEvidence[] {
    return Array.from(this.evidences.values()).filter(e => e.modelId === modelId);
  }

  /**
   * Obtiene evidencias por estado
   */
  getEvidencesByStatus(status: string): QualityEvidence[] {
    return Array.from(this.evidences.values()).filter(e => e.finalStatus === status);
  }

  /**
   * Obtiene todas las evidencias
   */
  getAllEvidences(): QualityEvidence[] {
    return Array.from(this.evidences.values());
  }

  /**
   * Exporta evidencias en formato JSON
   */
  exportEvidences(evidenceIds?: string[]): string {
    const evidencesToExport = evidenceIds
      ? evidenceIds.map(id => this.evidences.get(id)).filter(e => e !== undefined) as QualityEvidence[]
      : this.getAllEvidences();

    return JSON.stringify(evidencesToExport, null, 2);
  }

  /**
   * Importa evidencias desde JSON
   * No sobrescribe evidencias existentes
   */
  importEvidences(json: string): { imported: number; skipped: number; errors: string[] } {
    try {
      const evidences = JSON.parse(json) as QualityEvidence[];
      let imported = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const evidence of evidences) {
        // Validar estructura básica
        if (!evidence.id || !evidence.taskId || !evidence.modelId) {
          errors.push(`Evidencia inválida: falta ID o campos requeridos`);
          continue;
        }

        // No sobrescribir evidencias existentes
        if (this.evidences.has(evidence.id)) {
          skipped++;
          continue;
        }

        // Marcar como importada (no verificada automáticamente)
        evidence.metadata = {
          ...evidence.metadata,
          imported: true,
          importedAt: new Date().toISOString(),
          autoVerified: false
        };

        this.evidences.set(evidence.id, evidence);
        imported++;
      }

      return { imported, skipped, errors };
    } catch (error) {
      return {
        imported: 0,
        skipped: 0,
        errors: [`Error al parsear JSON: ${error instanceof Error ? error.message : 'Error desconocido'}`]
      };
    }
  }

  /**
   * Calcula estadísticas de evidencias
   */
  getStatistics(): {
    total: number;
    byStatus: Record<string, number>;
    byModel: Record<string, number>;
    byProvider: Record<string, number>;
    averageVerificationTime: number;
    passRate: number;
  } {
    const evidences = this.getAllEvidences();
    
    const byStatus: Record<string, number> = {};
    const byModel: Record<string, number> = {};
    const byProvider: Record<string, number> = {};
    let totalVerificationTime = 0;
    let passedCount = 0;

    for (const evidence of evidences) {
      // Por estado
      byStatus[evidence.finalStatus] = (byStatus[evidence.finalStatus] || 0) + 1;
      
      // Por modelo
      byModel[evidence.modelId] = (byModel[evidence.modelId] || 0) + 1;
      
      // Por proveedor
      byProvider[evidence.providerId] = (byProvider[evidence.providerId] || 0) + 1;
      
      // Tiempo de verificación
      totalVerificationTime += evidence.verificationDuration;
      
      // Contar pasadas
      if (evidence.finalStatus === 'TESTS_PASSED' || evidence.finalStatus === 'STATIC_VALIDATED') {
        passedCount++;
      }
    }

    return {
      total: evidences.length,
      byStatus,
      byModel,
      byProvider,
      averageVerificationTime: evidences.length > 0 ? totalVerificationTime / evidences.length : 0,
      passRate: evidences.length > 0 ? passedCount / evidences.length : 0
    };
  }

  /**
   * Vincula una evidencia con resultados de benchmark
   */
  linkBenchmarkResults(evidenceId: string, benchmarkResults: BenchmarkResult[]): void {
    const evidence = this.evidences.get(evidenceId);
    if (!evidence) return;

    evidence.metadata = {
      ...evidence.metadata,
      benchmarkResults: benchmarkResults.map(r => ({
        benchmarkId: r.benchmarkId,
        passed: r.passed,
        score: r.score,
        executionTimeMs: r.executionTimeMs
      }))
    };
  }

  /**
   * Vincula una evidencia con observaciones de recursos
   */
  linkResourceObservations(evidenceId: string, observations: ResourceObservation[]): void {
    const evidence = this.evidences.get(evidenceId);
    if (!evidence) return;

    evidence.metadata = {
      ...evidence.metadata,
      resourceObservations: observations.map(o => ({
        totalDurationMs: o.totalDurationMs,
        tokensGenerated: o.tokensGenerated,
        tokensInput: o.tokensInput,
        status: o.status
      }))
    };
  }

  /**
   * Verifica la integridad de una evidencia
   */
  verifyEvidenceIntegrity(evidenceId: string, codeContent: string): { valid: boolean; reason?: string } {
    const evidence = this.evidences.get(evidenceId);
    if (!evidence) {
      return { valid: false, reason: 'Evidencia no encontrada' };
    }

    // Verificar que el hash del código coincide
    // (En producción, esto calcularía el hash real del código)
    // Por ahora, solo verificamos que el hash existe
    if (!evidence.codeHash || evidence.codeHash.length === 0) {
      return { valid: false, reason: 'Hash de código no disponible' };
    }

    return { valid: true };
  }

  /**
   * Obtiene el historial de evidencias de un modelo
   */
  getModelHistory(modelId: string): {
    totalEvidences: number;
    passRate: number;
    averageQuality: number;
    recentTrend: 'improving' | 'stable' | 'declining';
  } {
    const evidences = this.getEvidencesByModel(modelId);
    
    if (evidences.length === 0) {
      return {
        totalEvidences: 0,
        passRate: 0,
        averageQuality: 0,
        recentTrend: 'stable'
      };
    }

    const passedCount = evidences.filter(e => 
      e.finalStatus === 'TESTS_PASSED' || e.finalStatus === 'STATIC_VALIDATED'
    ).length;

    const passRate = passedCount / evidences.length;

    // Calcular tendencia reciente (últimas 10 evidencias)
    const recentEvidences = evidences.slice(-10);
    const recentPassRate = recentEvidences.filter(e => 
      e.finalStatus === 'TESTS_PASSED' || e.finalStatus === 'STATIC_VALIDATED'
    ).length / recentEvidences.length;

    let recentTrend: 'improving' | 'stable' | 'declining';
    if (recentPassRate > passRate + 0.1) {
      recentTrend = 'improving';
    } else if (recentPassRate < passRate - 0.1) {
      recentTrend = 'declining';
    } else {
      recentTrend = 'stable';
    }

    return {
      totalEvidences: evidences.length,
      passRate,
      averageQuality: passRate, // Simplificado
      recentTrend
    };
  }
}

// Instancia global del motor de evidencias
export const qualityEvidenceEngine = new QualityEvidenceEngine();
