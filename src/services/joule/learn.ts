// GAGO OPEN ARTIFACT FACTORY — JOULE LEARN
// Componente de aprendizaje adaptativo.
// Actualiza el mapa de experiencia SOLO con observaciones verificadas.

import type {
  JouleExperienceMap,
  JouleExperienceEntry,
  JouleMeasurement,
  JouleCategory,
} from '../../types/joule';

/**
 * Actualiza el mapa de experiencia con una medición.
 *
 * Reglas:
 * - Solo aprende de mediciones verificadas (verified === true)
 * - No aprende de respuestas cuya corrección no haya sido verificada
 * - No extrapola entre categorías diferentes
 * - Registra la versión de política y adaptador
 */
export function jouleLearn(
  experienceMap: JouleExperienceMap,
  measurement: JouleMeasurement,
  category: JouleCategory,
  policyVersion: string,
  adapterVersion: string
): JouleExperienceMap {
  // Solo aprender de mediciones verificadas
  if (!measurement.verified) {
    return experienceMap;
  }

  const key = `${category}::${measurement.routeId}`;
  const existing = experienceMap.entries[key];

  const updatedEntry: JouleExperienceEntry = {
    category,
    routeId: measurement.routeId,
    executions: (existing?.executions ?? 0) + 1,
    verifiedSuccesses: (existing?.verifiedSuccesses ?? 0) + (measurement.success ? 1 : 0),
    failures: (existing?.failures ?? 0) + (measurement.success ? 0 : 1),
    totalDurationMs: (existing?.totalDurationMs ?? 0) + measurement.durationMs,
    totalCostUnits: (existing?.totalCostUnits ?? 0) + measurement.costUnits,
    totalEnergyMj: (existing?.totalEnergyMj ?? 0) + (measurement.energyMj ?? 0),
    lastObservedAt: measurement.completedAt,
    policyVersion,
    adapterVersion,
  };

  return {
    entries: {
      ...experienceMap.entries,
      [key]: updatedEntry,
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Calcula la tasa de éxito verificada para una entrada.
 */
export function jouleGetSuccessRate(entry: JouleExperienceEntry | undefined): number {
  if (!entry || entry.executions === 0) return 0;
  return entry.verifiedSuccesses / entry.executions;
}

/**
 * Calcula el coste promedio por ejecución.
 */
export function jouleGetAverageCost(entry: JouleExperienceEntry | undefined): number {
  if (!entry || entry.executions === 0) return 0;
  return entry.totalCostUnits / entry.executions;
}

/**
 * Calcula la latencia promedio.
 */
export function jouleGetAverageLatency(entry: JouleExperienceEntry | undefined): number {
  if (!entry || entry.executions === 0) return 0;
  return entry.totalDurationMs / entry.executions;
}

/**
 * Calcula el coste por resultado correcto.
 *
 * Fórmula:
 * costePorResultadoCorrecto = costeTotal / resultadosCorrectosVerificados
 *
 * Incluye todos los intentos (exitosos y fallidos).
 */
export function jouleGetCostPerCorrectResult(entry: JouleExperienceEntry | undefined): number {
  if (!entry || entry.verifiedSuccesses === 0) return Infinity;
  return entry.totalCostUnits / entry.verifiedSuccesses;
}

/**
 * Crea un mapa de experiencia vacío.
 */
export function jouleCreateEmptyExperienceMap(): JouleExperienceMap {
  return {
    entries: {},
    updatedAt: new Date().toISOString(),
  };
}
