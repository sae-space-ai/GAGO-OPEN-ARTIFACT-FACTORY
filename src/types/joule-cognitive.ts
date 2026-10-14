// GAGO OPEN ARTIFACT FACTORY — JOULE COGNITIVE OPTIMIZATION AND VERIFIED AI ENGINE
// Fase 12 — Contratos TypeScript para verificación independiente y optimización cognitiva

/**
 * Tipo de tarea para clasificación inteligente
 */
export type JouleTaskType =
  | 'code_generation'      // Generación de código
  | 'code_analysis'        // Análisis de código existente
  | 'documentation'        // Generación de documentación
  | 'calculation'          // Cálculos matemáticos
  | 'validation'           // Validación de datos/estructuras
  | 'refactoring'          // Refactorización de código
  | 'debugging'            // Depuración
  | 'testing'              // Generación de pruebas
  | 'translation'          // Traducción entre lenguajes
  | 'other';               // Otras tareas

/**
 * Lenguaje de programación soportado
 */
export type ProgrammingLanguage =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'java'
  | 'cpp'
  | 'csharp'
  | 'go'
  | 'rust'
  | 'php'
  | 'ruby'
  | 'swift'
  | 'kotlin'
  | 'unknown';

/**
 * Estado de verificación de código generado
 */
export type VerificationStatus =
  | 'PENDING'              // Pendiente de verificación
  | 'STATIC_VALIDATED'     // Validación estática completada
  | 'TESTS_PASSED'         // Pruebas ejecutadas y superadas
  | 'TESTS_FAILED'         // Pruebas ejecutadas pero fallaron
  | 'BLOCKED'              // Bloqueado (sin entorno de ejecución)
  | 'NO_EXECUTION_ENV';    // No hay entorno de ejecución disponible

/**
 * Resultado de una verificación independiente
 */
export interface VerificationResult {
  id: string;
  taskId: string;
  codeHash: string;
  status: VerificationStatus;
  language: ProgrammingLanguage;
  syntaxValid: boolean;
  typeCheckPassed?: boolean;
  testsExecuted: number;
  testsPassed: number;
  testsFailed: number;
  executionTimeMs?: number;
  errors: string[];
  warnings: string[];
  verifiedAt: string;
  verifiedBy: 'static_analysis' | 'unit_tests' | 'integration_tests' | 'manual';
  evidenceId: string;
}

/**
 * Criterio de aceptación para una tarea
 */
export interface AcceptanceCriterion {
  id: string;
  description: string;
  type: 'functional' | 'performance' | 'security' | 'quality';
  testable: boolean;
  testCode?: string;
  expectedResult?: any;
  tolerance?: number;
}

/**
 * Tarea clasificada por JOULE TASK INTELLIGENCE
 */
export interface ClassifiedTask {
  id: string;
  originalRequest: string;
  taskType: JouleTaskType;
  language: ProgrammingLanguage;
  complexity: 'simple' | 'moderate' | 'complex';
  riskLevel: 'low' | 'medium' | 'high';
  dataSensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
  acceptanceCriteria: AcceptanceCriterion[];
  requiredCapabilities: string[];
  estimatedDuration: number;
  budget: number;
  requiresIsolation: boolean;
  classifiedAt: string;
}

/**
 * Benchmark específico para evaluación de modelos
 */
export interface Benchmark {
  id: string;
  name: string;
  description: string;
  category: JouleTaskType;
  language: ProgrammingLanguage;
  input: string;
  expectedOutput: string;
  acceptanceCriteria: AcceptanceCriterion[];
  testCode?: string;
  timeout: number;
  difficulty: 'easy' | 'medium' | 'hard';
  version: string;
  createdAt: string;
}

/**
 * Resultado de un benchmark ejecutado
 */
export interface BenchmarkResult {
  id: string;
  benchmarkId: string;
  modelId: string;
  modelVersion: string;
  providerId: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  score: number;
  executionTimeMs: number;
  tokensUsed?: number;
  errors: string[];
  verificationResult?: VerificationResult;
  executedAt: string;
}

/**
 * Métricas de observación de recursos ampliadas
 */
export interface ResourceObservation {
  id: string;
  taskId: string;
  modelId: string;
  providerId: string;
  startTime: string;
  endTime: string;
  totalDurationMs: number;
  providerReportedDurationMs?: number;
  browserObservedDurationMs: number;
  tokensGenerated?: number;
  tokensInput?: number;
  generationSpeed?: number; // tokens/second
  memoryUsageMB?: number;
  cpuUsagePercent?: number;
  energyConsumedMj?: number;
  status: 'success' | 'error' | 'timeout' | 'cancelled';
  errorMessage?: string;
  retryCount: number;
}

/**
 * Puntuación de una ruta para selección adaptativa
 */
export interface RouteScore {
  routeId: string;
  providerId: string;
  modelId: string;
  qualityScore: number;        // Q: Calidad funcional verificada (0-1)
  reliabilityScore: number;    // R: Fiabilidad estadística (0-1)
  latencyScore: number;        // L: Latencia normalizada (0-1, menor es mejor)
  costScore: number;           // C: Coste normalizado (0-1, menor es mejor)
  privacyScore: number;        // P: Cumplimiento privacidad (0-1)
  securityScore: number;       // S: Cumplimiento seguridad (0-1)
  energyScore?: number;        // E: Consumo energético (0-1, solo si hay medición)
  totalScore: number;          // Puntuación total ponderada
  confidence: number;          // Confianza en la evaluación (0-1)
  sampleSize: number;          // Número de observaciones
  reasons: string[];           // Motivos de la puntuación
}

/**
 * Memoria de aprendizaje verificado
 */
export interface VerifiedLearningMemory {
  id: string;
  taskType: JouleTaskType;
  language: ProgrammingLanguage;
  modelId: string;
  modelVersion: string;
  providerId: string;
  routeId: string;
  benchmarksRun: number;
  benchmarksPassed: number;
  averageQualityScore: number;
  averageLatencyMs: number;
  averageCost: number;
  failureRate: number;
  lastUpdated: string;
  confidence: number;
  recommendations: string[];
}

/**
 * Decisión de enrutamiento con explicación
 */
export interface RoutingDecision {
  id: string;
  taskId: string;
  selectedRouteId: string;
  alternativeRoutes: string[];
  scores: RouteScore[];
  policyId: string;
  policyVersion: string;
  reasoning: string;
  constraints: string[];
  decisionAt: string;
  confidence: number;
}

/**
 * Estado del motor cognitivo JOULE
 */
export interface JouleCognitiveState {
  version: string;
  classifiedTasks: ClassifiedTask[];
  verificationResults: VerificationResult[];
  benchmarks: Benchmark[];
  benchmarkResults: BenchmarkResult[];
  resourceObservations: ResourceObservation[];
  learningMemory: VerifiedLearningMemory[];
  routingDecisions: RoutingDecision[];
  policies: RoutingPolicy[];
  activePolicyId: string;
  lastUpdated: string;
}

/**
 * Política de enrutamiento
 */
export interface RoutingPolicy {
  id: string;
  name: string;
  version: string;
  description: string;
  weights: {
    quality: number;
    reliability: number;
    latency: number;
    cost: number;
    privacy: number;
    security: number;
    energy: number;
  };
  constraints: {
    maxCost: number;
    maxLatencyMs: number;
    minQualityScore: number;
    minReliabilityScore: number;
    requirePrivacy: boolean;
    requireSecurity: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Evidencia de calidad verificada
 */
export interface QualityEvidence {
  id: string;
  taskId: string;
  operationId: string;
  modelId: string;
  modelVersion: string;
  providerId: string;
  adapterVersion: string;
  codeHash: string;
  benchmarkIds: string[];
  acceptanceCriteriaVersion: string;
  testResults: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  verificationDuration: number;
  verificationMethod: 'static' | 'dynamic' | 'hybrid';
  executionEnvironment: string;
  finalStatus: VerificationStatus;
  createdAt: string;
  createdBy: string;
  metadata: Record<string, any>;
}
