// GAGO OPEN ARTIFACT FACTORY — JOULE Policies
// Políticas de recursos por defecto.

import type { JouleResourcePolicy } from '../../types/joule';

/**
 * Política de referencia (baseline).
 * Representa el comportamiento de la aplicación sin optimización.
 * Todas las operaciones se ejecutan localmente.
 */
export const REFERENCE_POLICY: JouleResourcePolicy = {
  id: 'policy-reference',
  name: 'Referencia (sin optimización)',
  version: '1.0.0',
  mode: 'disabled',
  canaryPercentage: 0,
  limits: {
    maxConcurrentOps: 10,
    maxRetriesPerOp: 0,
    maxTotalCostUnits: Infinity,
    maxDurationMs: Infinity,
  },
  weights: {
    cost: 0,
    latency: 0,
    energy: 0,
    risk: 0,
  },
  hardConstraints: {
    blockInsecureRoutes: true,
    requireVerificationForCritical: true,
    blockExternalDataForConfidential: true,
    preserveQualityGates: true,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Política conservadora.
 * JOULE activo pero con límites estrictos.
 * Solo rutas locales y caché. Sin proveedores externos.
 */
export const CONSERVATIVE_POLICY: JouleResourcePolicy = {
  id: 'policy-conservative',
  name: 'Conservadora (solo local)',
  version: '1.0.0',
  mode: 'active',
  canaryPercentage: 100,
  limits: {
    maxConcurrentOps: 5,
    maxRetriesPerOp: 1,
    maxTotalCostUnits: 1000,
    maxDurationMs: 30000,
  },
  weights: {
    cost: 0.4,
    latency: 0.3,
    energy: 0.2,
    risk: 0.1,
  },
  hardConstraints: {
    blockInsecureRoutes: true,
    requireVerificationForCritical: true,
    blockExternalDataForConfidential: true,
    preserveQualityGates: true,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Política Shadow.
 * JOULE observa sin modificar el comportamiento.
 */
export const SHADOW_POLICY: JouleResourcePolicy = {
  id: 'policy-shadow',
  name: 'Shadow (observación)',
  version: '1.0.0',
  mode: 'shadow',
  canaryPercentage: 100,
  limits: {
    maxConcurrentOps: 10,
    maxRetriesPerOp: 0,
    maxTotalCostUnits: Infinity,
    maxDurationMs: Infinity,
  },
  weights: {
    cost: 0.4,
    latency: 0.3,
    energy: 0.2,
    risk: 0.1,
  },
  hardConstraints: {
    blockInsecureRoutes: true,
    requireVerificationForCritical: true,
    blockExternalDataForConfidential: true,
    preserveQualityGates: true,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Política Canary.
 * JOULE activo sobre un porcentaje controlado de operaciones.
 */
export const CANARY_POLICY: JouleResourcePolicy = {
  id: 'policy-canary',
  name: 'Canary (activación gradual)',
  version: '1.0.0',
  mode: 'canary',
  canaryPercentage: 5, // 5% inicial
  limits: {
    maxConcurrentOps: 3,
    maxRetriesPerOp: 2,
    maxTotalCostUnits: 500,
    maxDurationMs: 15000,
  },
  weights: {
    cost: 0.4,
    latency: 0.3,
    energy: 0.2,
    risk: 0.1,
  },
  hardConstraints: {
    blockInsecureRoutes: true,
    requireVerificationForCritical: true,
    blockExternalDataForConfidential: true,
    preserveQualityGates: true,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Catálogo de políticas disponibles.
 */
export const DEFAULT_POLICIES: Record<string, JouleResourcePolicy> = {
  [REFERENCE_POLICY.id]: REFERENCE_POLICY,
  [CONSERVATIVE_POLICY.id]: CONSERVATIVE_POLICY,
  [SHADOW_POLICY.id]: SHADOW_POLICY,
  [CANARY_POLICY.id]: CANARY_POLICY,
};
