// GAGO OPEN ARTIFACT FACTORY — JOULE PREDICT
// Componente de estimación de recursos basado en observaciones históricas.

import type {
  JouleCategory,
  JouleRoute,
  JouleExperienceMap,
  JouleExperienceEntry,
  JouleConfidence,
} from '../../types/joule';

/**
 * Estimación para una ruta específica.
 */
export interface RouteEstimate {
  routeId: string;
  estimatedDurationMs: number;
  estimatedCostUnits: number;
  estimatedEnergyMj: number | undefined;
  estimatedSuccessRate: number;
  confidence: JouleConfidence;
  sampleSize: number;
  note?: string;
}

/**
 * Estima los recursos de una ruta basándose en el mapa de experiencia.
 *
 * Reglas:
 * - Si no hay observaciones suficientes → confianza baja/unknown
 * - Si hay pocas observaciones → conservador
 * - La probabilidad de éxito se calcula solo con éxitos verificados
 * - No se extrapolan resultados entre categorías diferentes
 */
export function joulePredictRoute(
  category: JouleCategory,
  route: JouleRoute,
  experienceMap: JouleExperienceMap
): RouteEstimate {
  const key = `${category}::${route.id}`;
  const entry = experienceMap.entries[key];

  // Sin datos históricos
  if (!entry || entry.executions === 0) {
    return {
      routeId: route.id,
      estimatedDurationMs: route.cost.latencyMs,
      estimatedCostUnits: route.cost.units,
      estimatedEnergyMj: route.cost.energyMj,
      estimatedSuccessRate: route.estimatedSuccessRate,
      confidence: 'unknown',
      sampleSize: 0,
      note: 'Sin observaciones históricas. Usando estimación del adaptador.',
    };
  }

  // Calcular métricas observadas
  const avgDurationMs = entry.totalDurationMs / entry.executions;
  const avgCostUnits = entry.totalCostUnits / entry.executions;
  const avgEnergyMj = entry.executions > 0 ? entry.totalEnergyMj / entry.executions : undefined;
  const successRate = entry.executions > 0
    ? entry.verifiedSuccesses / entry.executions
    : 0;

  // Determinar confianza basada en tamaño de muestra
  const confidence = determineConfidence(entry);

  // Si la confianza es baja, usar estimación conservadora
  // (promedio entre observación y estimación del adaptador)
  const adjustedDurationMs = confidence === 'low' || confidence === 'unknown'
    ? (avgDurationMs + route.cost.latencyMs) / 2
    : avgDurationMs;

  const adjustedCostUnits = confidence === 'low' || confidence === 'unknown'
    ? (avgCostUnits + route.cost.units) / 2
    : avgCostUnits;

  const adjustedSuccessRate = confidence === 'low' || confidence === 'unknown'
    ? (successRate + route.estimatedSuccessRate) / 2
    : successRate;

  return {
    routeId: route.id,
    estimatedDurationMs: adjustedDurationMs,
    estimatedCostUnits: adjustedCostUnits,
    estimatedEnergyMj: avgEnergyMj,
    estimatedSuccessRate: adjustedSuccessRate,
    confidence,
    sampleSize: entry.executions,
  };
}

/**
 * Estima todas las rutas candidatas para una categoría.
 */
export function joulePredictAllRoutes(
  category: JouleCategory,
  routes: JouleRoute[],
  experienceMap: JouleExperienceMap
): RouteEstimate[] {
  return routes.map(route => joulePredictRoute(category, route, experienceMap));
}

/**
 * Determina el nivel de confianza basado en el tamaño de muestra y consistencia.
 */
function determineConfidence(entry: JouleExperienceEntry): JouleConfidence {
  const { executions, verifiedSuccesses, failures } = entry;

  // Muy pocas observaciones
  if (executions < 3) return 'low';

  // Pocas observaciones pero consistentes
  if (executions < 10) {
    const successRate = verifiedSuccesses / executions;
    // Si hay alta varianza (muchos fallos), reducir confianza
    if (failures > executions * 0.3) return 'low';
    return 'medium';
  }

  // Suficientes observaciones
  if (executions >= 10) {
    const successRate = verifiedSuccesses / executions;
    // Alta consistencia
    if (failures < executions * 0.1) return 'high';
    // Variabilidad moderada
    if (failures < executions * 0.3) return 'medium';
    // Alta variabilidad
    return 'low';
  }

  return 'unknown';
}

/**
 * Calcula el coste esperado de una ruta incluyendo reintentos.
 *
 * Fórmula:
 * costeEsperado = costeUnitario / probabilidadDeÉxito
 *
 * Esto incorpora el coste de los fallos y reintentos.
 */
export function joulePredictExpectedCost(estimate: RouteEstimate): number {
  if (estimate.estimatedSuccessRate <= 0) {
    return Infinity; // Ruta inviable
  }
  return estimate.estimatedCostUnits / estimate.estimatedSuccessRate;
}

/**
 * Calcula la latencia esperada incluyendo reintentos.
 *
 * Fórmula simplificada:
 * latenciaEsperada = latenciaUnitaria * (1 + (1 - probÉxito) * reintentosPromedio)
 */
export function joulePredictExpectedLatency(
  estimate: RouteEstimate,
  maxRetries: number = 2
): number {
  const failureRate = 1 - estimate.estimatedSuccessRate;
  const expectedRetries = failureRate * maxRetries;
  return estimate.estimatedDurationMs * (1 + expectedRetries);
}
