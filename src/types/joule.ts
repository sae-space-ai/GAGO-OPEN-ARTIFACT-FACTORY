// GAGO OPEN ARTIFACT FACTORY — JOULE Adaptive Resource Optimization Engine
// Fase 1 — Contratos TypeScript del motor
// JOULE NO sustituye la factoría. JOULE gobierna el consumo de recursos.

/**
 * Categorías de operaciones que JOULE puede clasificar.
 */
export type JouleCategory =
  | 'ui_render'           // Actualizaciones de interfaz
  | 'storage_read'        // Lectura de almacenamiento local
  | 'storage_write'       // Escritura de almacenamiento local
  | 'artifact_generation' // Generación de artefactos
  | 'test_execution'      // Ejecución de pruebas
  | 'document_analysis'   // Análisis documental
  | 'ai_request'          // Solicitud a proveedor de IA
  | 'data_processing'     // Procesamiento de datos
  | 'network_request'     // Solicitud de red
  | 'compilation'         // Compilación (Vite)
  | 'other';              // Otras

/**
 * Nivel de prioridad de una operación.
 */
export type JoulePriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * Nivel de riesgo asociado a una operación.
 */
export type JouleRiskLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Sensibilidad de los datos involucrados.
 */
export type JouleDataSensitivity = 'public' | 'internal' | 'confidential' | 'restricted';

/**
 * Tipo de ruta candidata para ejecutar una operación.
 */
export type JouleRouteKind =
  | 'local'              // Ejecución local en el navegador
  | 'cache'              // Reutilización de resultado en caché
  | 'deferred'           // Ejecución diferida
  | 'batch'              // Procesamiento por lotes
  | 'reuse'              // Reutilización de artefactos previos
  | 'ai_provider'        // Proveedor de IA (requiere integración real)
  | 'reference';         // Ruta de referencia (baseline)

/**
 * Modo operativo de JOULE.
 * - disabled: Motor apagado, aplicación usa ruta de referencia.
 * - shadow: JOULE calcula qué habría hecho, pero no modifica el comportamiento.
 * - canary: JOULE actúa sobre un porcentaje controlado de operaciones elegibles.
 * - active: JOULE actúa sobre todas las operaciones elegibles.
 */
export type JouleMode = 'disabled' | 'shadow' | 'canary' | 'active';

/**
 * Nivel de confianza de una estimación.
 * - high: Suficientes observaciones verificadas.
 * - medium: Observaciones limitadas pero consistentes.
 * - low: Pocos datos, alta incertidumbre.
 * - unknown: Sin datos históricos.
 */
export type JouleConfidence = 'high' | 'medium' | 'low' | 'unknown';

/**
 * Estado de una decisión de JOULE.
 */
export type JouleDecisionStatus =
  | 'selected'     // Ruta seleccionada para ejecución
  | 'shadow'       // Ruta calculada en modo Shadow (no aplicada)
  | 'blocked'      // Bloqueada por restricciones
  | 'fallback'     // Ruta de referencia usada por falta de datos
  | 'failed'       // La ejecución falló
  | 'reverted';    // Revertida por degradación

/**
 * Perfil de una tarea clasificada por JOULE PROFILE.
 *
 * NOTA: Los recursos se expresan en unidades explícitas.
 * - durationMs: milisegundos
 * - bytes: bytes
 * - costUnits: unidades abstractas de coste (NO moneda real salvo que se indique)
 * - energyMj: milijulios (solo si hay medición directa)
 */
export interface JouleTaskProfile {
  id: string;
  category: JouleCategory;
  priority: JoulePriority;
  riskLevel: JouleRiskLevel;
  dataSensitivity: JouleDataSensitivity;
  budget: {
    maxDurationMs: number;
    maxCostUnits: number;
    maxRetries: number;
    maxEnergyMj?: number; // opcional, solo con telemetría válida
  };
  qualityCriterion: {
    minSuccessRate: number; // 0..1
    requiresVerification: boolean;
  };
  estimatedResources: {
    durationMs: number;
    bytes: number;
    costUnits: number;
    energyMj?: number;
  };
  observedResources?: {
    durationMs: number;
    bytes: number;
    costUnits: number;
    energyMj?: number;
  };
  traceId: string; // referencia trazable
  createdAt: string; // ISO 8601
}

/**
 * Ruta candidata para ejecutar una operación.
 */
export interface JouleRoute {
  id: string;
  kind: JouleRouteKind;
  provider?: string; // nombre del proveedor (ej: "qwen", "local")
  capabilities: string[]; // capacidades declaradas
  constraints: {
    requiresAuth: boolean;
    requiresNetwork: boolean;
    privacyLevel: JouleDataSensitivity;
    idempotent: boolean;
    reversible: boolean;
  };
  cost: {
    monetary: number; // moneda real (0 si no aplica)
    units: number; // unidades abstractas
    latencyMs: number;
    energyMj?: number; // solo con medición válida
  };
  estimatedSuccessRate: number; // 0..1, basado en observaciones verificadas
  confidence: JouleConfidence;
  available: boolean;
  version: string;
}

/**
 * Política de recursos vigente.
 */
export interface JouleResourcePolicy {
  id: string;
  name: string;
  version: string;
  mode: JouleMode;
  canaryPercentage: number; // 0..100, solo relevante si mode === 'canary'
  limits: {
    maxConcurrentOps: number;
    maxRetriesPerOp: number;
    maxTotalCostUnits: number;
    maxDurationMs: number;
    maxEnergyMj?: number;
  };
  weights: {
    cost: number;
    latency: number;
    energy: number;
    risk: number;
  };
  hardConstraints: {
    blockInsecureRoutes: boolean;
    requireVerificationForCritical: boolean;
    blockExternalDataForConfidential: boolean;
    preserveQualityGates: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Medición de una operación ejecutada.
 */
export interface JouleMeasurement {
  id: string;
  traceId: string;
  taskId: string;
  routeId: string;
  category: JouleCategory;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  bytesTransferred: number;
  costUnits: number;
  monetaryCost: number;
  energyMj?: number; // solo si hay medición directa
  success: boolean;
  verified: boolean;
  errorMessage?: string;
  source: 'observed' | 'estimated' | 'unknown';
}

/**
 * Decisión tomada por JOULE OPTIMIZE.
 */
export interface JouleDecision {
  id: string;
  traceId: string;
  taskId: string;
  status: JouleDecisionStatus;
  selectedRouteId: string | null;
  alternativeRoutes: string[]; // IDs de rutas descartadas
  reasons: string[];
  appliedConstraints: string[];
  estimatedCost: number;
  estimatedLatencyMs: number;
  estimatedSuccessRate: number;
  confidence: JouleConfidence;
  policyVersion: string;
  createdAt: string;
}

/**
 * Resultado de una verificación independiente.
 */
export interface JouleVerification {
  id: string;
  traceId: string;
  taskId: string;
  method: string; // descripción del método de verificación
  passed: boolean;
  details: string;
  verifiedAt: string;
  verifier: 'automated' | 'human' | 'hybrid';
}

/**
 * Registro histórico de experiencia por (categoría, ruta).
 */
export interface JouleExperienceEntry {
  category: JouleCategory;
  routeId: string;
  executions: number;
  verifiedSuccesses: number;
  failures: number;
  totalDurationMs: number;
  totalCostUnits: number;
  totalEnergyMj: number;
  lastObservedAt: string;
  policyVersion: string;
  adapterVersion: string;
}

/**
 * Mapa de experiencia agregado.
 */
export interface JouleExperienceMap {
  entries: Record<string, JouleExperienceEntry>; // key: `${category}::${routeId}`
  updatedAt: string;
}

/**
 * Perfil energético de una operación.
 *
 * IMPORTANTE: energySource distingue entre medición directa y estimación.
 * - 'direct': Medición real procedente de telemetría válida.
 * - 'estimated': Estimación basada en modelo documentado.
 * - 'unknown': Sin datos disponibles.
 */
export interface JouleEnergyProfile {
  taskId: string;
  energyMj: number;
  source: 'direct' | 'estimated' | 'unknown';
  model?: string; // nombre del modelo de estimación si source === 'estimated'
  measuredAt?: string;
}

/**
 * Informe de optimización para una operación.
 */
export interface JouleOptimizationReport {
  traceId: string;
  taskId: string;
  decision: JouleDecision;
  measurements: JouleMeasurement[];
  verification: JouleVerification | null;
  energyProfile: JouleEnergyProfile | null;
  baselineComparison?: {
    referenceRouteId: string;
    referenceCost: number;
    referenceLatencyMs: number;
    deltaCostUnits: number;
    deltaLatencyMs: number;
    note: string; // aclaración si los datos son insuficientes
  };
  createdAt: string;
}

/**
 * Estado global del motor JOULE.
 */
export interface JouleState {
  enabled: boolean;
  mode: JouleMode;
  canaryPercentage: number;
  activePolicyId: string;
  policies: Record<string, JouleResourcePolicy>;
  experienceMap: JouleExperienceMap;
  measurements: JouleMeasurement[];
  decisions: JouleDecision[];
  verifications: JouleVerification[];
  reports: JouleOptimizationReport[];
  killSwitchEngaged: boolean;
  killSwitchReason?: string;
  version: string;
}

/**
 * Constantes del motor.
 */
export const JOULE_ENGINE_VERSION = '1.0.0';
export const JOULE_SCHEMA_VERSION = '1.0.0';

/**
 * Etiquetas legibles.
 */
export const JOULE_CATEGORY_LABELS: Record<JouleCategory, string> = {
  ui_render: 'Renderizado de interfaz',
  storage_read: 'Lectura de almacenamiento',
  storage_write: 'Escritura de almacenamiento',
  artifact_generation: 'Generación de artefactos',
  test_execution: 'Ejecución de pruebas',
  document_analysis: 'Análisis documental',
  ai_request: 'Solicitud a IA',
  data_processing: 'Procesamiento de datos',
  network_request: 'Solicitud de red',
  compilation: 'Compilación',
  other: 'Otro',
};

export const JOULE_MODE_LABELS: Record<JouleMode, string> = {
  disabled: 'Desactivado',
  shadow: 'Shadow (observación)',
  canary: 'Canary (activación gradual)',
  active: 'Activo',
};

export const JOULE_PRIORITY_LABELS: Record<JoulePriority, string> = {
  critical: 'Crítica',
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

export const JOULE_RISK_LABELS: Record<JouleRiskLevel, string> = {
  low: 'Bajo',
  medium: 'Medio',
  high: 'Alto',
  critical: 'Crítico',
};

export const JOULE_SENSITIVITY_LABELS: Record<JouleDataSensitivity, string> = {
  public: 'Público',
  internal: 'Interno',
  confidential: 'Confidencial',
  restricted: 'Restringido',
};

export const JOULE_ROUTE_KIND_LABELS: Record<JouleRouteKind, string> = {
  local: 'Local',
  cache: 'Caché',
  deferred: 'Diferido',
  batch: 'Lote',
  reuse: 'Reutilización',
  ai_provider: 'Proveedor de IA',
  reference: 'Referencia',
};

export const JOULE_DECISION_STATUS_LABELS: Record<JouleDecisionStatus, string> = {
  selected: 'Seleccionada',
  shadow: 'Shadow',
  blocked: 'Bloqueada',
  fallback: 'Referencia',
  failed: 'Fallida',
  reverted: 'Revertida',
};

export const JOULE_CONFIDENCE_LABELS: Record<JouleConfidence, string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
  unknown: 'Desconocida',
};
