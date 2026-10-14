// GAGO OPEN ARTIFACT FACTORY — JOULE ENGINE
// Motor central que coordina OBSERVE, PROFILE, PREDICT, OPTIMIZE, EXECUTE, VERIFY, LEARN.
// Implementa Kill Switch, Shadow Mode y Canary.

import type {
  JouleState,
  JouleTaskProfile,
  JouleRoute,
  JouleResourcePolicy,
  JouleDecision,
  JouleMeasurement,
  JouleOptimizationReport,
  JouleMode,
} from '../../types/joule';
import { JOULE_ENGINE_VERSION } from '../../types/joule';
import { jouleProfileTask, type ProfileInput } from './profile';
import { jouleOptimizeTask } from './optimize';
import { jouleLearn, jouleCreateEmptyExperienceMap } from './learn';
import { DEFAULT_POLICIES, REFERENCE_POLICY } from './policies';
import { generateId } from '../storage';

/**
 * Crea el estado inicial del motor JOULE.
 * Por defecto: desactivado, modo shadow disponible, política de referencia.
 */
export function jouleCreateInitialState(): JouleState {
  return {
    enabled: false,
    mode: 'disabled',
    canaryPercentage: 0,
    activePolicyId: REFERENCE_POLICY.id,
    policies: { ...DEFAULT_POLICIES },
    experienceMap: jouleCreateEmptyExperienceMap(),
    measurements: [],
    decisions: [],
    verifications: [],
    reports: [],
    killSwitchEngaged: false,
    version: JOULE_ENGINE_VERSION,
  };
}

/**
 * Activa JOULE en el modo especificado.
 * No modifica el comportamiento si kill switch está activado.
 */
export function jouleActivate(
  state: JouleState,
  mode: JouleMode,
  policyId?: string
): JouleState {
  if (state.killSwitchEngaged) {
    console.warn('[JOULE] Kill switch activado. No se puede activar el motor.');
    return state;
  }

  const policy = policyId ? state.policies[policyId] : undefined;
  if (policyId && !policy) {
    console.warn(`[JOULE] Política ${policyId} no encontrada.`);
    return state;
  }

  return {
    ...state,
    enabled: true,
    mode,
    activePolicyId: policy?.id ?? state.activePolicyId,
    canaryPercentage: policy?.canaryPercentage ?? state.canaryPercentage,
  };
}

/**
 * Desactiva JOULE. La aplicación vuelve al comportamiento de referencia.
 * No destruye registros.
 */
export function jouleDeactivate(state: JouleState): JouleState {
  return {
    ...state,
    enabled: false,
    mode: 'disabled',
    canaryPercentage: 0,
    activePolicyId: REFERENCE_POLICY.id,
  };
}

/**
 * Activa el Kill Switch.
 * Bloquea cualquier activación futura hasta que se desactive manualmente.
 */
export function jouleEngageKillSwitch(state: JouleState, reason: string): JouleState {
  return {
    ...jouleDeactivate(state),
    killSwitchEngaged: true,
    killSwitchReason: reason,
  };
}

/**
 * Desactiva el Kill Switch.
 */
export function jouleDisengageKillSwitch(state: JouleState): JouleState {
  return {
    ...state,
    killSwitchEngaged: false,
    killSwitchReason: undefined,
  };
}

/**
 * Determina si una operación debe ser optimizada según el modo y canary.
 *
 * Reglas:
 * - disabled: ninguna operación se optimiza
 * - shadow: todas las operaciones se calculan pero no se aplican
 * - canary: solo un porcentaje de operaciones elegibles se optimizan
 * - active: todas las operaciones elegibles se optimizan
 */
export function jouleShouldOptimize(state: JouleState, traceId: string): {
  shouldOptimize: boolean;
  isShadow: boolean;
  reason: string;
} {
  if (!state.enabled || state.killSwitchEngaged) {
    return { shouldOptimize: false, isShadow: false, reason: 'Motor desactivado o kill switch' };
  }

  if (state.mode === 'disabled') {
    return { shouldOptimize: false, isShadow: false, reason: 'Modo desactivado' };
  }

  if (state.mode === 'shadow') {
    return { shouldOptimize: true, isShadow: true, reason: 'Modo Shadow: cálculo sin aplicación' };
  }

  if (state.mode === 'canary') {
    // Determinar si esta operación entra en el porcentaje canary
    // Usamos un hash simple del traceId para distribución determinista
    const hash = simpleHash(traceId);
    const inCanary = (hash % 100) < state.canaryPercentage;
    return {
      shouldOptimize: inCanary,
      isShadow: false,
      reason: inCanary
        ? `Canary: operación dentro del ${state.canaryPercentage}%`
        : `Canary: operación fuera del ${state.canaryPercentage}%`,
    };
  }

  if (state.mode === 'active') {
    return { shouldOptimize: true, isShadow: false, reason: 'Modo activo' };
  }

  return { shouldOptimize: false, isShadow: false, reason: 'Modo desconocido' };
}

/**
 * Hash simple para distribución determinista.
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Procesa una operación a través del motor JOULE.
 *
 * Retorna la decisión y actualiza el estado con mediciones y aprendizaje.
 */
export function jouleProcessTask(
  state: JouleState,
  input: ProfileInput,
  candidateRoutes: JouleRoute[]
): {
  newState: JouleState;
  profile: JouleTaskProfile;
  decision: JouleDecision;
  isShadow: boolean;
} {
  // Clasificar
  const profile = jouleProfileTask(input);

  // Determinar si se debe optimizar
  const { shouldOptimize, isShadow } = jouleShouldOptimize(state, profile.traceId);

  if (!shouldOptimize) {
    // Usar ruta de referencia
    const referenceRoute = candidateRoutes.find(r => r.kind === 'reference' || r.kind === 'local');
    const decision: JouleDecision = {
      id: generateId(),
      traceId: profile.traceId,
      taskId: profile.id,
      status: referenceRoute ? 'fallback' : 'blocked',
      selectedRouteId: referenceRoute?.id ?? null,
      alternativeRoutes: [],
      reasons: ['Motor JOULE desactivado. Usando ruta de referencia.'],
      appliedConstraints: [],
      estimatedCost: referenceRoute?.cost.units ?? 0,
      estimatedLatencyMs: referenceRoute?.cost.latencyMs ?? 0,
      estimatedSuccessRate: referenceRoute?.estimatedSuccessRate ?? 0,
      confidence: 'unknown',
      policyVersion: state.policies[state.activePolicyId]?.version ?? '1.0.0',
      createdAt: new Date().toISOString(),
    };

    return {
      newState: {
        ...state,
        decisions: [...state.decisions, decision],
      },
      profile,
      decision,
      isShadow: false,
    };
  }

  // Optimizar
  const policy = state.policies[state.activePolicyId];
  const result = jouleOptimizeTask(profile, candidateRoutes, policy, state.experienceMap);

  // Si es shadow, registrar decisión pero no aplicarla
  const decision = isShadow
    ? { ...result.decision, status: 'shadow' as const }
    : result.decision;

  const newState: JouleState = {
    ...state,
    decisions: [...state.decisions, decision],
  };

  return {
    newState,
    profile,
    decision,
    isShadow,
  };
}

/**
 * Registra una medición y actualiza el mapa de experiencia.
 */
export function jouleRecordMeasurement(
  state: JouleState,
  measurement: JouleMeasurement,
  category: import('../../types/joule').JouleCategory
): JouleState {
  const newMeasurements = [...state.measurements, measurement];

  // Limitar el tamaño del historial (últimas 1000 mediciones)
  const trimmedMeasurements = newMeasurements.slice(-1000);

  // Actualizar mapa de experiencia solo si la medición está verificada
  const newExperienceMap = jouleLearn(
    state.experienceMap,
    measurement,
    category,
    state.policies[state.activePolicyId]?.version ?? '1.0.0',
    'adapter-1.0.0'
  );

  return {
    ...state,
    measurements: trimmedMeasurements,
    experienceMap: newExperienceMap,
  };
}

/**
 * Calcula métricas agregadas del motor.
 */
export function jouleGetMetrics(state: JouleState): {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  verifiedOperations: number;
  shadowDecisions: number;
  activeDecisions: number;
  averageDurationMs: number;
  averageCostUnits: number;
  successRate: number;
} {
  const measurements = state.measurements;
  const decisions = state.decisions;

  const totalOperations = measurements.length;
  const successfulOperations = measurements.filter(m => m.success).length;
  const failedOperations = measurements.filter(m => !m.success).length;
  const verifiedOperations = measurements.filter(m => m.verified).length;

  const shadowDecisions = decisions.filter(d => d.status === 'shadow').length;
  const activeDecisions = decisions.filter(d => d.status === 'selected').length;

  const averageDurationMs = totalOperations > 0
    ? measurements.reduce((sum, m) => sum + m.durationMs, 0) / totalOperations
    : 0;

  const averageCostUnits = totalOperations > 0
    ? measurements.reduce((sum, m) => sum + m.costUnits, 0) / totalOperations
    : 0;

  const successRate = totalOperations > 0
    ? successfulOperations / totalOperations
    : 0;

  return {
    totalOperations,
    successfulOperations,
    failedOperations,
    verifiedOperations,
    shadowDecisions,
    activeDecisions,
    averageDurationMs,
    averageCostUnits,
    successRate,
  };
}
