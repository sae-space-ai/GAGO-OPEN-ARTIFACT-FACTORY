// GAGO Open Artifact Factory - Risk Classification Engine
// Phase 8: JOULE AUTONOMOUS APPROVAL ENGINE

import type { ModuleManifest, RiskLevel, ChangeImpact } from '../../types/approval';

/**
 * Clasifica el riesgo de un módulo basado en sus características
 */
export function classifyModuleRisk(module: ModuleManifest): RiskLevel {
  let riskScore = 0;

  // Categoría del módulo
  if (module.category === 'infrastructure') riskScore += 2;
  if (module.category === 'ai') riskScore += 1;
  if (module.category === 'governance') riskScore += 2;
  if (module.category === 'development') riskScore += 1;

  // Criticidad declarada
  if (module.criticality === 'CRITICAL') riskScore += 4;
  else if (module.criticality === 'HIGH') riskScore += 3;
  else if (module.criticality === 'MEDIUM') riskScore += 2;
  else if (module.criticality === 'LOW') riskScore += 1;

  // Dependencias
  if (module.dependencies.length > 5) riskScore += 2;
  else if (module.dependencies.length > 2) riskScore += 1;

  // Componentes
  if (module.components.length > 5) riskScore += 1;

  // Determinar nivel de riesgo
  if (riskScore >= 7) return 'CRITICAL';
  if (riskScore >= 5) return 'HIGH';
  if (riskScore >= 3) return 'MEDIUM';
  return 'LOW';
}

/**
 * Analiza el impacto de un cambio en un módulo
 */
export function analyzeChangeImpact(
  moduleId: string,
  changedFiles: string[],
  modules: ModuleManifest[]
): ChangeImpact {
  const module = modules.find(m => m.id === moduleId);
  if (!module) {
    return {
      moduleId,
      changedFiles,
      affectedModules: [],
      requiresReevaluation: false,
      riskLevel: 'LOW',
      reason: 'Módulo no encontrado'
    };
  }

  // Identificar módulos afectados
  const affectedModules = new Set<string>();
  
  // Módulos que dependen del módulo cambiado
  for (const m of modules) {
    if (m.dependencies.includes(moduleId)) {
      affectedModules.add(m.id);
    }
  }

  // Determinar si requiere reevaluación
  const requiresReevaluation = changedFiles.some(file => 
    module.components.some(comp => file.includes(comp)) ||
    module.tests.some(test => file.includes(test))
  );

  // Clasificar riesgo del cambio
  let riskLevel: RiskLevel = 'LOW';
  
  if (module.category === 'infrastructure' || module.category === 'governance') {
    riskLevel = 'HIGH';
  } else if (module.criticality === 'CRITICAL' || module.criticality === 'HIGH') {
    riskLevel = 'HIGH';
  } else if (affectedModules.size > 3) {
    riskLevel = 'MEDIUM';
  }

  const reason = requiresReevaluation 
    ? `Cambio en componentes o pruebas del módulo ${module.name}`
    : `Cambio no afecta directamente al módulo ${module.name}`;

  return {
    moduleId,
    changedFiles,
    affectedModules: Array.from(affectedModules),
    requiresReevaluation,
    riskLevel,
    reason
  };
}

/**
 * Determina si un módulo requiere revisión manual
 */
export function requiresManualReview(
  module: ModuleManifest,
  riskLevel: RiskLevel
): boolean {
  // Módulos de riesgo crítico o alto siempre requieren revisión manual
  if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
    return true;
  }

  // Módulos de infraestructura o gobernanza requieren revisión manual
  if (module.category === 'infrastructure' || module.category === 'governance') {
    return true;
  }

  // Módulos con muchas dependencias requieren revisión manual
  if (module.dependencies.length > 5) {
    return true;
  }

  return false;
}

/**
 * Calcula la prioridad de evaluación de un módulo
 */
export function calculateEvaluationPriority(
  module: ModuleManifest,
  riskLevel: RiskLevel
): number {
  let priority = 0;

  // Prioridad por nivel de riesgo
  if (riskLevel === 'CRITICAL') priority += 40;
  else if (riskLevel === 'HIGH') priority += 30;
  else if (riskLevel === 'MEDIUM') priority += 20;
  else priority += 10;

  // Prioridad por fase (fases anteriores primero)
  const phaseNum = parseFloat(module.phase);
  priority += (10 - phaseNum) * 5;

  // Prioridad por número de dependientes
  priority += module.dependencies.length * 2;

  return priority;
}

/**
 * Verifica si un cambio es seguro para aprobación automática
 */
export function isChangeSafeForAutoApproval(
  impact: ChangeImpact,
  module: ModuleManifest
): boolean {
  // No es seguro si requiere reevaluación
  if (impact.requiresReevaluation) return false;

  // No es seguro si el riesgo es alto o crítico
  if (impact.riskLevel === 'HIGH' || impact.riskLevel === 'CRITICAL') return false;

  // No es seguro si afecta a muchos módulos
  if (impact.affectedModules.length > 3) return false;

  // No es seguro si el módulo es de infraestructura o gobernanza
  if (module.category === 'infrastructure' || module.category === 'governance') return false;

  return true;
}

/**
 * Genera una recomendación de riesgo para un conjunto de cambios
 */
export function generateRiskRecommendation(
  impacts: ChangeImpact[],
  modules: ModuleManifest[]
): {
  overallRisk: RiskLevel;
  safeForAutoApproval: boolean;
  requiresManualReview: boolean;
  recommendations: string[];
} {
  let overallRisk: RiskLevel = 'LOW';
  const recommendations: string[] = [];

  for (const impact of impacts) {
    // Actualizar riesgo general
    if (impact.riskLevel === 'CRITICAL') overallRisk = 'CRITICAL';
    else if (impact.riskLevel === 'HIGH' && overallRisk !== 'CRITICAL') overallRisk = 'HIGH';
    else if (impact.riskLevel === 'MEDIUM' && overallRisk === 'LOW') overallRisk = 'MEDIUM';

    // Generar recomendaciones
    if (impact.requiresReevaluation) {
      recommendations.push(`Reevaluar módulo ${impact.moduleId}`);
    }

    if (impact.affectedModules.length > 0) {
      recommendations.push(`Verificar módulos afectados: ${impact.affectedModules.join(', ')}`);
    }
  }

  const safeForAutoApproval = overallRisk === 'LOW' && impacts.every(i => !i.requiresReevaluation);
  const requiresManualReview = overallRisk === 'HIGH' || overallRisk === 'CRITICAL';

  return {
    overallRisk,
    safeForAutoApproval,
    requiresManualReview,
    recommendations
  };
}
