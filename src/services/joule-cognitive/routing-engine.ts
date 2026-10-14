// GAGO OPEN ARTIFACT FACTORY — JOULE ADAPTIVE ROUTING ENGINE
// Fase 12 — Motor de enrutamiento adaptativo basado en evidencia

import type {
  RouteScore,
  RoutingDecision,
  RoutingPolicy,
  ClassifiedTask,
  VerifiedLearningMemory
} from '../../types/joule-cognitive';
import { generateId } from '../storage';
import { resourceObserver } from './resource-observer';
import { qualityEvidenceEngine } from './evidence-engine';

/**
 * Motor de enrutamiento adaptativo
 * Selecciona la mejor ruta basada en evidencia verificada y restricciones
 */
export class AdaptiveRoutingEngine {
  private policies: Map<string, RoutingPolicy> = new Map();
  private decisions: RoutingDecision[] = [];
  private activePolicyId: string;

  constructor() {
    // Política por defecto
    const defaultPolicy: RoutingPolicy = {
      id: 'policy-default',
      name: 'Política por Defecto',
      version: '1.0.0',
      description: 'Política estándar con énfasis en calidad y seguridad',
      weights: {
        quality: 0.35,
        reliability: 0.25,
        latency: 0.15,
        cost: 0.10,
        privacy: 0.10,
        security: 0.05,
        energy: 0.00
      },
      constraints: {
        maxCost: 0, // Presupuesto cero
        maxLatencyMs: 30000,
        minQualityScore: 0.7,
        minReliabilityScore: 0.8,
        requirePrivacy: true,
        requireSecurity: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.policies.set(defaultPolicy.id, defaultPolicy);
    this.activePolicyId = defaultPolicy.id;
  }

  /**
   * Registra una nueva política de enrutamiento
   */
  registerPolicy(policy: RoutingPolicy): void {
    this.policies.set(policy.id, policy);
  }

  /**
   * Obtiene una política por ID
   */
  getPolicy(policyId: string): RoutingPolicy | undefined {
    return this.policies.get(policyId);
  }

  /**
   * Obtiene todas las políticas
   */
  getAllPolicies(): RoutingPolicy[] {
    return Array.from(this.policies.values());
  }

  /**
   * Establece la política activa
   */
  setActivePolicy(policyId: string): void {
    if (!this.policies.has(policyId)) {
      throw new Error(`Política ${policyId} no encontrada`);
    }
    this.activePolicyId = policyId;
  }

  /**
   * Obtiene la política activa
   */
  getActivePolicy(): RoutingPolicy {
    return this.policies.get(this.activePolicyId)!;
  }

  /**
   * Evalúa y selecciona la mejor ruta para una tarea
   */
  async selectBestRoute(
    task: ClassifiedTask,
    availableRoutes: Array<{
      routeId: string;
      providerId: string;
      modelId: string;
      modelVersion: string;
    }>
  ): Promise<RoutingDecision> {
    const policy = this.getActivePolicy();

    // Filtrar rutas por restricciones obligatorias
    const admissibleRoutes = await this.filterByConstraints(availableRoutes, task, policy);

    if (admissibleRoutes.length === 0) {
      // No hay rutas admisibles
      return {
        id: generateId(),
        taskId: task.id,
        selectedRouteId: '',
        alternativeRoutes: [],
        scores: [],
        policyId: policy.id,
        policyVersion: policy.version,
        reasoning: 'No hay rutas que cumplan con las restricciones obligatorias',
        constraints: Object.keys(policy.constraints),
        decisionAt: new Date().toISOString(),
        confidence: 0
      };
    }

    // Calcular puntuaciones para rutas admisibles
    const scores = await this.calculateRouteScores(admissibleRoutes, task, policy);

    // Seleccionar la mejor ruta
    const bestRoute = scores.reduce((best, current) => 
      current.totalScore > best.totalScore ? current : best
    );

    // Crear decisión
    const decision: RoutingDecision = {
      id: generateId(),
      taskId: task.id,
      selectedRouteId: bestRoute.routeId,
      alternativeRoutes: scores
        .filter(s => s.routeId !== bestRoute.routeId)
        .map(s => s.routeId),
      scores,
      policyId: policy.id,
      policyVersion: policy.version,
      reasoning: this.generateReasoning(bestRoute, scores),
      constraints: this.getAppliedConstraints(task, policy),
      decisionAt: new Date().toISOString(),
      confidence: bestRoute.confidence
    };

    // Almacenar decisión
    this.decisions.push(decision);

    return decision;
  }

  /**
   * Filtra rutas por restricciones obligatorias
   */
  private async filterByConstraints(
    routes: Array<{ routeId: string; providerId: string; modelId: string; modelVersion: string }>,
    task: ClassifiedTask,
    policy: RoutingPolicy
  ): Promise<Array<{ routeId: string; providerId: string; modelId: string; modelVersion: string }>> {
    const filtered: Array<{ routeId: string; providerId: string; modelId: string; modelVersion: string }> = [];

    for (const route of routes) {
      // Verificar seguridad
      if (policy.constraints.requireSecurity) {
        const securityScore = await this.assessSecurity(route, task);
        if (securityScore < 0.8) continue;
      }

      // Verificar privacidad
      if (policy.constraints.requirePrivacy && task.dataSensitivity !== 'public') {
        const privacyScore = await this.assessPrivacy(route, task);
        if (privacyScore < 0.9) continue;
      }

      // Verificar presupuesto
      const estimatedCost = await this.estimateCost(route, task);
      if (estimatedCost > policy.constraints.maxCost) continue;

      // Verificar latencia máxima
      const estimatedLatency = await this.estimateLatency(route, task);
      if (estimatedLatency > policy.constraints.maxLatencyMs) continue;

      filtered.push(route);
    }

    return filtered;
  }

  /**
   * Calcula las puntuaciones de las rutas
   */
  private async calculateRouteScores(
    routes: Array<{ routeId: string; providerId: string; modelId: string; modelVersion: string }>,
    task: ClassifiedTask,
    policy: RoutingPolicy
  ): Promise<RouteScore[]> {
    const scores: RouteScore[] = [];

    for (const route of routes) {
      const qualityScore = await this.assessQuality(route, task);
      const reliabilityScore = await this.assessReliability(route);
      const latencyScore = await this.assessLatency(route, task);
      const costScore = await this.assessCost(route, task);
      const privacyScore = await this.assessPrivacy(route, task);
      const securityScore = await this.assessSecurity(route, task);
      const energyScore = await this.assessEnergy(route);

      // Calcular puntuación total ponderada
      const totalScore = 
        qualityScore * policy.weights.quality +
        reliabilityScore * policy.weights.reliability +
        latencyScore * policy.weights.latency +
        costScore * policy.weights.cost +
        privacyScore * policy.weights.privacy +
        securityScore * policy.weights.security +
        (energyScore !== undefined ? energyScore * policy.weights.energy : 0);

      // Calcular confianza basada en tamaño de muestra
      const sampleSize = this.getSampleSize(route.modelId);
      const confidence = this.calculateConfidence(sampleSize);

      scores.push({
        routeId: route.routeId,
        providerId: route.providerId,
        modelId: route.modelId,
        qualityScore,
        reliabilityScore,
        latencyScore,
        costScore,
        privacyScore,
        securityScore,
        energyScore,
        totalScore,
        confidence,
        sampleSize,
        reasons: this.generateScoreReasons(route, {
          qualityScore,
          reliabilityScore,
          latencyScore,
          costScore,
          privacyScore,
          securityScore,
          energyScore
        })
      });
    }

    return scores;
  }

  /**
   * Evalúa la calidad funcional de una ruta
   */
  private async assessQuality(
    route: { modelId: string },
    task: ClassifiedTask
  ): Promise<number> {
    // Obtener evidencias de calidad del modelo
    const evidences = qualityEvidenceEngine.getEvidencesByModel(route.modelId);
    
    if (evidences.length === 0) {
      return 0.5; // Confianza media si no hay evidencia
    }

    // Calcular tasa de éxito
    const passedEvidences = evidences.filter(e => 
      e.finalStatus === 'TESTS_PASSED' || e.finalStatus === 'STATIC_VALIDATED'
    );

    return passedEvidences.length / evidences.length;
  }

  /**
   * Evalúa la fiabilidad estadística de una ruta
   */
  private async assessReliability(route: { modelId: string }): Promise<number> {
    const stats = resourceObserver.getSuccessRate(route.modelId);
    return stats.successRate;
  }

  /**
   * Evalúa la latencia de una ruta
   */
  private async assessLatency(
    route: { modelId: string },
    task: ClassifiedTask
  ): Promise<number> {
    const stats = resourceObserver.getLatencyStatistics(route.modelId);
    
    if (stats.count === 0) {
      return 0.5; // Confianza media si no hay datos
    }

    // Normalizar latencia (menor es mejor)
    // Asumimos que 30 segundos es el máximo aceptable
    const maxAcceptableLatency = 30000;
    const normalizedLatency = Math.min(stats.medianMs / maxAcceptableLatency, 1);
    
    return 1 - normalizedLatency; // Invertir para que menor latencia = mayor puntuación
  }

  /**
   * Evalúa el coste de una ruta
   */
  private async assessCost(
    route: { providerId: string; modelId: string },
    task: ClassifiedTask
  ): Promise<number> {
    // Si el proveedor es local (Ollama), coste cero
    if (route.providerId === 'ollama') {
      return 1.0; // Máxima puntuación para coste cero
    }

    // Para proveedores remotos, verificar si hay coste conocido
    // Por ahora, asumimos coste cero si está dentro del presupuesto
    const estimatedCost = await this.estimateCost(route, task);
    
    if (estimatedCost === 0) {
      return 1.0;
    }

    // Penalizar costes positivos
    return Math.max(0, 1 - (estimatedCost / task.budget));
  }

  /**
   * Evalúa el cumplimiento de privacidad
   */
  private async assessPrivacy(
    route: { providerId: string },
    task: ClassifiedTask
  ): Promise<number> {
    // Datos públicos: cualquier proveedor es aceptable
    if (task.dataSensitivity === 'public') {
      return 1.0;
    }

    // Datos internos: preferir proveedores locales
    if (task.dataSensitivity === 'internal') {
      return route.providerId === 'ollama' ? 1.0 : 0.7;
    }

    // Datos confidenciales: solo proveedores locales o muy seguros
    if (task.dataSensitivity === 'confidential') {
      return route.providerId === 'ollama' ? 1.0 : 0.3;
    }

    // Datos restringidos: solo proveedores locales
    if (task.dataSensitivity === 'restricted') {
      return route.providerId === 'ollama' ? 1.0 : 0.0;
    }

    return 0.5;
  }

  /**
   * Evalúa el cumplimiento de seguridad
   */
  private async assessSecurity(
    route: { providerId: string },
    task: ClassifiedTask
  ): Promise<number> {
    // Tareas de bajo riesgo: cualquier proveedor es aceptable
    if (task.riskLevel === 'low') {
      return 1.0;
    }

    // Tareas de riesgo medio: preferir proveedores con autenticación
    if (task.riskLevel === 'medium') {
      return route.providerId === 'ollama' ? 1.0 : 0.8;
    }

    // Tareas de alto riesgo: solo proveedores locales o muy seguros
    if (task.riskLevel === 'high') {
      return route.providerId === 'ollama' ? 1.0 : 0.5;
    }

    // Tareas críticas: solo proveedores locales
    return route.providerId === 'ollama' ? 1.0 : 0.0;
  }

  /**
   * Evalúa el consumo energético (si hay medición)
   */
  private async assessEnergy(route: { modelId: string }): Promise<number | undefined> {
    // Por ahora, no tenemos mediciones energéticas reales
    // Retornamos undefined para indicar dato no disponible
    return undefined;
  }

  /**
   * Estima el coste de una ruta
   */
  private async estimateCost(
    route: { providerId: string; modelId: string },
    task: ClassifiedTask
  ): Promise<number> {
    // Ollama es gratuito (local)
    if (route.providerId === 'ollama') {
      return 0;
    }

    // Para otros proveedores, estimar basado en tokens
    // (En producción, esto consultaría la tabla de precios del proveedor)
    return 0; // Asumimos coste cero para proveedores gratuitos
  }

  /**
   * Estima la latencia de una ruta
   */
  private async estimateLatency(
    route: { modelId: string },
    task: ClassifiedTask
  ): Promise<number> {
    const stats = resourceObserver.getLatencyStatistics(route.modelId);
    
    if (stats.count === 0) {
      // Estimación basada en complejidad de la tarea
      return task.estimatedDuration;
    }

    return stats.medianMs;
  }

  /**
   * Obtiene el tamaño de muestra para un modelo
   */
  private getSampleSize(modelId: string): number {
    const observations = resourceObserver.getObservationsByModel(modelId);
    return observations.length;
  }

  /**
   * Calcula la confianza basada en el tamaño de muestra
   */
  private calculateConfidence(sampleSize: number): number {
    if (sampleSize === 0) return 0;
    if (sampleSize < 5) return 0.3;
    if (sampleSize < 10) return 0.5;
    if (sampleSize < 30) return 0.7;
    if (sampleSize < 100) return 0.85;
    return 0.95;
  }

  /**
   * Genera el razonamiento de la decisión
   */
  private generateReasoning(bestRoute: RouteScore, allScores: RouteScore[]): string {
    const reasons: string[] = [];

    reasons.push(`Ruta seleccionada: ${bestRoute.routeId} (modelo: ${bestRoute.modelId})`);
    reasons.push(`Puntuación total: ${bestRoute.totalScore.toFixed(3)}`);
    reasons.push(`Confianza: ${(bestRoute.confidence * 100).toFixed(1)}% (basada en ${bestRoute.sampleSize} observaciones)`);

    if (allScores.length > 1) {
      const secondBest = allScores.sort((a, b) => b.totalScore - a.totalScore)[1];
      const margin = bestRoute.totalScore - secondBest.totalScore;
      reasons.push(`Margen sobre segunda opción: ${margin.toFixed(3)}`);
    }

    reasons.push(`Calidad: ${bestRoute.qualityScore.toFixed(2)}, Fiabilidad: ${bestRoute.reliabilityScore.toFixed(2)}`);

    return reasons.join('. ');
  }

  /**
   * Genera razones detalladas para cada componente de la puntuación
   */
  private generateScoreReasons(
    route: { providerId: string; modelId: string },
    scores: {
      qualityScore: number;
      reliabilityScore: number;
      latencyScore: number;
      costScore: number;
      privacyScore: number;
      securityScore: number;
      energyScore?: number;
    }
  ): string[] {
    const reasons: string[] = [];

    reasons.push(`Calidad: ${(scores.qualityScore * 100).toFixed(1)}%`);
    reasons.push(`Fiabilidad: ${(scores.reliabilityScore * 100).toFixed(1)}%`);
    reasons.push(`Latencia: ${(scores.latencyScore * 100).toFixed(1)}%`);
    reasons.push(`Coste: ${(scores.costScore * 100).toFixed(1)}%`);
    reasons.push(`Privacidad: ${(scores.privacyScore * 100).toFixed(1)}%`);
    reasons.push(`Seguridad: ${(scores.securityScore * 100).toFixed(1)}%`);

    if (scores.energyScore !== undefined) {
      reasons.push(`Energía: ${(scores.energyScore * 100).toFixed(1)}%`);
    }

    return reasons;
  }

  /**
   * Obtiene las restricciones aplicadas
   */
  private getAppliedConstraints(task: ClassifiedTask, policy: RoutingPolicy): string[] {
    const constraints: string[] = [];

    if (policy.constraints.requireSecurity) {
      constraints.push('Seguridad requerida');
    }

    if (policy.constraints.requirePrivacy) {
      constraints.push('Privacidad requerida');
    }

    if (policy.constraints.maxCost === 0) {
      constraints.push('Presupuesto cero');
    }

    if (task.dataSensitivity !== 'public') {
      constraints.push(`Sensibilidad de datos: ${task.dataSensitivity}`);
    }

    if (task.riskLevel !== 'low') {
      constraints.push(`Nivel de riesgo: ${task.riskLevel}`);
    }

    return constraints;
  }

  /**
   * Obtiene todas las decisiones de enrutamiento
   */
  getAllDecisions(): RoutingDecision[] {
    return [...this.decisions];
  }

  /**
   * Obtiene decisiones para una tarea específica
   */
  getDecisionsByTask(taskId: string): RoutingDecision[] {
    return this.decisions.filter(d => d.taskId === taskId);
  }

  /**
   * Exporta decisiones en formato JSON
   */
  exportDecisions(): string {
    return JSON.stringify(this.decisions, null, 2);
  }
}

// Instancia global del motor de enrutamiento
export const adaptiveRoutingEngine = new AdaptiveRoutingEngine();
