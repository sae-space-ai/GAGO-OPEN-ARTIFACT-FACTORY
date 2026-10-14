// GAGO OPEN ARTIFACT FACTORY — JOULE OPTIMIZE
// Algoritmo central de selección adaptativa de recursos.

import type {
  JouleTaskProfile,
  JouleRoute,
  JouleResourcePolicy,
  JouleExperienceMap,
  JouleDecision,
  JouleDecisionStatus,
} from '../../types/joule';
import { generateId } from '../storage';
import { joulePredictAllRoutes, joulePredictExpectedCost } from './predict';

/**
 * Resultado del proceso de optimización.
 */
export interface OptimizationResult {
  decision: JouleDecision;
  selectedRoute: JouleRoute | null;
  allEstimates: Array<{
    routeId: string;
    effectiveCost: number;
    valid: boolean;
    rejectionReason?: string;
  }>;
}

/**
 * Función principal de optimización: jouleOptimizeTask.
 *
 * Secuencia obligatoria:
 * 1. Recibir la operación (perfil de tarea)
 * 2. Clasificarla (ya está clasificado en el perfil)
 * 3. Consultar las políticas activas
 * 4. Identificar las rutas técnicamente disponibles
 * 5. Consultar resultados históricos comparables
 * 6. Obtener las estimaciones y su nivel de confianza
 * 7. Eliminar las rutas incompatibles con los requisitos obligatorios
 * 8. Calcular el coste efectivo esperado de las rutas válidas
 * 9. Seleccionar la alternativa más eficiente dentro de las restricciones
 * 10. Comprobar que el presupuesto y los Quality Gates permiten su ejecución
 * 11-17. (Ejecución, verificación y aprendizaje se hacen fuera de esta función)
 */
export function jouleOptimizeTask(
  profile: JouleTaskProfile,
  candidateRoutes: JouleRoute[],
  policy: JouleResourcePolicy,
  experienceMap: JouleExperienceMap
): OptimizationResult {
  const traceId = profile.traceId;
  const decisionId = generateId();

  // Paso 4: Identificar rutas disponibles
  const availableRoutes = candidateRoutes.filter(r => r.available);

  if (availableRoutes.length === 0) {
    return {
      decision: {
        id: decisionId,
        traceId,
        taskId: profile.id,
        status: 'blocked',
        selectedRouteId: null,
        alternativeRoutes: [],
        reasons: ['No hay rutas disponibles'],
        appliedConstraints: [],
        estimatedCost: 0,
        estimatedLatencyMs: 0,
        estimatedSuccessRate: 0,
        confidence: 'unknown',
        policyVersion: policy.version,
        createdAt: new Date().toISOString(),
      },
      selectedRoute: null,
      allEstimates: [],
    };
  }

  // Paso 5-6: Obtener estimaciones
  const estimates = joulePredictAllRoutes(profile.category, availableRoutes, experienceMap);

  // Paso 7: Eliminar rutas incompatibles
  const validRoutes: Array<{
    route: JouleRoute;
    estimate: typeof estimates[0];
    effectiveCost: number;
  }> = [];

  const rejectedRoutes: Array<{
    routeId: string;
    reason: string;
  }> = [];

  for (const estimate of estimates) {
    const route = availableRoutes.find(r => r.id === estimate.routeId)!;

    // Verificar restricciones duras
    const constraintCheck = checkConstraints(profile, route, policy);
    if (!constraintCheck.valid) {
      rejectedRoutes.push({
        routeId: route.id,
        reason: constraintCheck.reason,
      });
      continue;
    }

    // Paso 8: Calcular coste efectivo esperado
    const effectiveCost = joulePredictExpectedCost(estimate);

    validRoutes.push({ route, estimate, effectiveCost });
  }

  // Si no hay rutas válidas
  if (validRoutes.length === 0) {
    // Buscar ruta de referencia
    const referenceRoute = availableRoutes.find(r => r.kind === 'reference' || r.kind === 'local');

    if (referenceRoute && profile.priority !== 'critical') {
      // Usar ruta de referencia como fallback
      const refEstimate = estimates.find(e => e.routeId === referenceRoute.id);
      return {
        decision: {
          id: decisionId,
          traceId,
          taskId: profile.id,
          status: 'fallback',
          selectedRouteId: referenceRoute.id,
          alternativeRoutes: [],
          reasons: [
            'No hay rutas válidas que cumplan todas las restricciones',
            'Usando ruta de referencia como fallback',
          ],
          appliedConstraints: rejectedRoutes.map(r => r.reason),
          estimatedCost: refEstimate?.estimatedCostUnits ?? 0,
          estimatedLatencyMs: refEstimate?.estimatedDurationMs ?? 0,
          estimatedSuccessRate: refEstimate?.estimatedSuccessRate ?? 0,
          confidence: refEstimate?.confidence ?? 'unknown',
          policyVersion: policy.version,
          createdAt: new Date().toISOString(),
        },
        selectedRoute: referenceRoute,
        allEstimates: [
          ...rejectedRoutes.map(r => ({
            routeId: r.routeId,
            effectiveCost: Infinity,
            valid: false,
            rejectionReason: r.reason,
          })),
        ],
      };
    }

    // Bloquear si es crítico o no hay referencia
    return {
      decision: {
        id: decisionId,
        traceId,
        taskId: profile.id,
        status: 'blocked',
        selectedRouteId: null,
        alternativeRoutes: [],
        reasons: [
          'No hay rutas válidas que cumplan todas las restricciones',
          'Operación crítica sin ruta de referencia segura',
        ],
        appliedConstraints: rejectedRoutes.map(r => r.reason),
        estimatedCost: 0,
        estimatedLatencyMs: 0,
        estimatedSuccessRate: 0,
        confidence: 'unknown',
        policyVersion: policy.version,
        createdAt: new Date().toISOString(),
      },
      selectedRoute: null,
      allEstimates: rejectedRoutes.map(r => ({
        routeId: r.routeId,
        effectiveCost: Infinity,
        valid: false,
        rejectionReason: r.reason,
      })),
    };
  }

  // Paso 9: Seleccionar la ruta con menor coste efectivo
  validRoutes.sort((a, b) => a.effectiveCost - b.effectiveCost);
  const best = validRoutes[0];

  // Paso 10: Verificar presupuesto
  const budgetCheck = checkBudget(profile, best.estimate, policy);
  if (!budgetCheck.valid) {
    return {
      decision: {
        id: decisionId,
        traceId,
        taskId: profile.id,
        status: 'blocked',
        selectedRouteId: null,
        alternativeRoutes: validRoutes.map(v => v.route.id),
        reasons: [budgetCheck.reason],
        appliedConstraints: [],
        estimatedCost: 0,
        estimatedLatencyMs: 0,
        estimatedSuccessRate: 0,
        confidence: 'unknown',
        policyVersion: policy.version,
        createdAt: new Date().toISOString(),
      },
      selectedRoute: null,
      allEstimates: validRoutes.map(v => ({
        routeId: v.route.id,
        effectiveCost: v.effectiveCost,
        valid: false,
        rejectionReason: budgetCheck.reason,
      })),
    };
  }

  // Selección exitosa
  return {
    decision: {
      id: decisionId,
      traceId,
      taskId: profile.id,
      status: 'selected',
      selectedRouteId: best.route.id,
      alternativeRoutes: validRoutes.slice(1).map(v => v.route.id),
      reasons: [
        `Menor coste efectivo: ${best.effectiveCost.toFixed(2)} unidades`,
        `Confianza: ${best.estimate.confidence}`,
        `Tasa de éxito estimada: ${(best.estimate.estimatedSuccessRate * 100).toFixed(1)}%`,
      ],
      appliedConstraints: [],
      estimatedCost: best.estimate.estimatedCostUnits,
      estimatedLatencyMs: best.estimate.estimatedDurationMs,
      estimatedSuccessRate: best.estimate.estimatedSuccessRate,
      confidence: best.estimate.confidence,
      policyVersion: policy.version,
      createdAt: new Date().toISOString(),
    },
    selectedRoute: best.route,
    allEstimates: [
      ...validRoutes.map(v => ({
        routeId: v.route.id,
        effectiveCost: v.effectiveCost,
        valid: true,
      })),
      ...rejectedRoutes.map(r => ({
        routeId: r.routeId,
        effectiveCost: Infinity,
        valid: false,
        rejectionReason: r.reason,
      })),
    ],
  };
}

/**
 * Verifica las restricciones duras de una ruta.
 */
function checkConstraints(
  profile: JouleTaskProfile,
  route: JouleRoute,
  policy: JouleResourcePolicy
): { valid: boolean; reason: string } {
  // Restricción: bloquear rutas inseguras
  if (policy.hardConstraints.blockInsecureRoutes && route.constraints.requiresAuth) {
    // Si requiere autenticación y no está configurada, bloquear
    // (En Fase 1 no hay autenticación, así que bloqueamos rutas que la requieran)
    return {
      valid: false,
      reason: 'Ruta requiere autenticación no configurada',
    };
  }

  // Restricción: datos confidenciales no pueden ir a rutas externas
  if (
    policy.hardConstraints.blockExternalDataForConfidential &&
    (profile.dataSensitivity === 'confidential' || profile.dataSensitivity === 'restricted') &&
    route.kind === 'ai_provider'
  ) {
    return {
      valid: false,
      reason: 'Datos confidenciales no pueden enviarse a proveedores externos',
    };
  }

  // Restricción: privacidad de la ruta
  const sensitivityOrder = ['public', 'internal', 'confidential', 'restricted'];
  const routeLevel = sensitivityOrder.indexOf(route.constraints.privacyLevel);
  const taskLevel = sensitivityOrder.indexOf(profile.dataSensitivity);
  if (routeLevel < taskLevel) {
    return {
      valid: false,
      reason: `Ruta no admite nivel de sensibilidad ${profile.dataSensitivity}`,
    };
  }

  return { valid: true, reason: '' };
}

/**
 * Verifica que la ruta seleccionada cumple el presupuesto.
 */
function checkBudget(
  profile: JouleTaskProfile,
  estimate: { estimatedCostUnits: number; estimatedDurationMs: number },
  policy: JouleResourcePolicy
): { valid: boolean; reason: string } {
  if (estimate.estimatedCostUnits > profile.budget.maxCostUnits) {
    return {
      valid: false,
      reason: `Coste estimado (${estimate.estimatedCostUnits}) excede presupuesto (${profile.budget.maxCostUnits})`,
    };
  }

  if (estimate.estimatedDurationMs > profile.budget.maxDurationMs) {
    return {
      valid: false,
      reason: `Duración estimada (${estimate.estimatedDurationMs}ms) excede límite (${profile.budget.maxDurationMs}ms)`,
    };
  }

  if (estimate.estimatedCostUnits > policy.limits.maxTotalCostUnits) {
    return {
      valid: false,
      reason: `Coste excede límite de política (${policy.limits.maxTotalCostUnits})`,
    };
  }

  if (estimate.estimatedDurationMs > policy.limits.maxDurationMs) {
    return {
      valid: false,
      reason: `Duración excede límite de política (${policy.limits.maxDurationMs}ms)`,
    };
  }

  return { valid: true, reason: '' };
}
