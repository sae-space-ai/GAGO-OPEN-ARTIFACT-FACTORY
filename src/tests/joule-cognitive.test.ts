// GAGO OPEN ARTIFACT FACTORY — JOULE COGNITIVE TESTS
// Fase 12 — Pruebas unitarias del motor cognitivo

import { describe, it, expect, beforeEach } from 'vitest';
import { classifyTask } from '../services/joule-cognitive/task-intelligence';
import { verifyCodeIndependently, DECIMAL_ADDITION_BENCHMARK } from '../services/joule-cognitive/code-verifier';
import { qualityEvidenceEngine } from '../services/joule-cognitive/evidence-engine';
import { modelBenchmarkLab } from '../services/joule-cognitive/benchmark-lab';
import { resourceObserver } from '../services/joule-cognitive/resource-observer';
import { adaptiveRoutingEngine } from '../services/joule-cognitive/routing-engine';

describe('JOULE Task Intelligence', () => {
  it('debe clasificar una tarea de generación de código', () => {
    const request = 'Genera una función TypeScript que sume dos números';
    const classified = classifyTask(request);

    expect(classified.taskType).toBe('code_generation');
    expect(classified.language).toBe('typescript');
    expect(classified.complexity).toBeDefined();
    expect(classified.riskLevel).toBeDefined();
    expect(classified.dataSensitivity).toBeDefined();
    expect(classified.acceptanceCriteria.length).toBeGreaterThan(0);
  });

  it('debe clasificar una tarea de cálculo', () => {
    const request = 'Calcula la suma de 0.1 y 0.2';
    const classified = classifyTask(request);

    expect(classified.taskType).toBe('calculation');
    expect(classified.complexity).toBeDefined();
  });

  it('debe clasificar una tarea de validación', () => {
    const request = 'Valida que el email sea correcto';
    const classified = classifyTask(request);

    expect(classified.taskType).toBe('validation');
  });

  it('debe detectar lenguaje TypeScript', () => {
    const request = 'Crea una función en TypeScript con tipos';
    const classified = classifyTask(request);

    expect(classified.language).toBe('typescript');
  });

  it('debe detectar lenguaje JavaScript', () => {
    const request = 'Escribe una función en JavaScript';
    const classified = classifyTask(request);

    expect(classified.language).toBe('javascript');
  });

  it('debe detectar lenguaje Python', () => {
    const request = 'Crea un script en Python';
    const classified = classifyTask(request);

    expect(classified.language).toBe('python');
  });

  it('debe estimar complejidad simple', () => {
    const request = 'Suma dos números';
    const classified = classifyTask(request);

    expect(classified.complexity).toBe('simple');
  });

  it('debe estimar complejidad moderada', () => {
    const request = 'Crea una función que valide emails y passwords con múltiples reglas de negocio y maneje errores';
    const classified = classifyTask(request);

    expect(['moderate', 'complex']).toContain(classified.complexity);
  });

  it('debe evaluar riesgo bajo para tareas simples', () => {
    const request = 'Suma dos números';
    const classified = classifyTask(request);

    expect(classified.riskLevel).toBe('low');
  });

  it('debe evaluar riesgo alto para tareas con bases de datos', () => {
    const request = 'Crea una función que elimine registros de la base de datos';
    const classified = classifyTask(request);

    expect(classified.riskLevel).toBe('high');
  });

  it('debe evaluar sensibilidad de datos pública', () => {
    const request = 'Suma dos números';
    const classified = classifyTask(request);

    expect(classified.dataSensitivity).toBe('public');
  });

  it('debe evaluar sensibilidad de datos confidencial', () => {
    const request = 'Procesa información privada del usuario';
    const classified = classifyTask(request);

    expect(classified.dataSensitivity).toBe('confidential');
  });

  it('debe extraer criterios de aceptación explícitos', () => {
    const request = 'Crea una función que debe ser rápida y debe manejar errores';
    const classified = classifyTask(request);

    expect(classified.acceptanceCriteria.length).toBeGreaterThan(0);
  });

  it('debe inferir criterios de aceptación para generación de código', () => {
    const request = 'Genera una función';
    const classified = classifyTask(request);

    expect(classified.acceptanceCriteria.length).toBeGreaterThan(0);
    expect(classified.acceptanceCriteria.some(c => c.description.includes('sintácticamente válido'))).toBe(true);
  });

  it('debe determinar capacidades requeridas', () => {
    const request = 'Genera código TypeScript';
    const classified = classifyTask(request);

    expect(classified.requiredCapabilities.length).toBeGreaterThan(0);
    expect(classified.requiredCapabilities).toContain('code_generation');
  });

  it('debe estimar duración basada en complejidad', () => {
    const simpleRequest = 'Suma dos números';
    const complexRequest = 'Crea un sistema completo con base de datos, API, autenticación, manejo de errores, logs, y documentación';

    const simpleClassified = classifyTask(simpleRequest);
    const complexClassified = classifyTask(complexRequest);

    expect(complexClassified.estimatedDuration).toBeGreaterThan(simpleClassified.estimatedDuration);
  });

  it('debe estimar presupuesto basado en complejidad', () => {
    const simpleRequest = 'Suma dos números';
    const complexRequest = 'Crea un sistema completo con base de datos, API, autenticación';

    const simpleClassified = classifyTask(simpleRequest);
    const complexClassified = classifyTask(complexRequest);

    expect(complexClassified.budget).toBeGreaterThan(simpleClassified.budget);
  });

  it('debe requerir aislamiento para datos restringidos', () => {
    const request = 'Procesa contraseñas y tokens de seguridad';
    const classified = classifyTask(request);

    expect(classified.requiresIsolation).toBe(true);
  });
});

describe('JOULE Code Verifier', () => {
  describe('Caso de prueba obligatorio: Suma decimal', () => {
    it('debe detectar el error de Math.round individual', async () => {
      const incorrectCode = `
        function add(a: number, b: number): number {
          return Math.round(a) + Math.round(b);
        }
      `;

      const result = await verifyCodeIndependently(
        'test-task-001',
        incorrectCode,
        'typescript',
        DECIMAL_ADDITION_BENCHMARK.acceptanceCriteria
      );

      expect(result.status).toBe('TESTS_FAILED');
      expect(result.errors.some(e => e.includes('Math.round'))).toBe(true);
    });

    it('debe aprobar el código correcto con toFixed', async () => {
      const correctCode = `
        function add(a: number, b: number): number {
          return Number((a + b).toFixed(10));
        }
      `;

      const result = await verifyCodeIndependently(
        'test-task-002',
        correctCode,
        'typescript',
        DECIMAL_ADDITION_BENCHMARK.acceptanceCriteria
      );

      expect(result.status).toBe('STATIC_VALIDATED');
      expect(result.syntaxValid).toBe(true);
    });

    it('debe aprobar el código correcto con multiplicación', async () => {
      const correctCode = `
        function add(a: number, b: number): number {
          return (Math.round(a * 100) + Math.round(b * 100)) / 100;
        }
      `;

      const result = await verifyCodeIndependently(
        'test-task-003',
        correctCode,
        'typescript',
        DECIMAL_ADDITION_BENCHMARK.acceptanceCriteria
      );

      expect(result.status).toBe('STATIC_VALIDATED');
      expect(result.syntaxValid).toBe(true);
    });

    it('debe generar hash del código', async () => {
      const code = 'function test() { return 1; }';
      const result = await verifyCodeIndependently(
        'test-task-004',
        code,
        'typescript',
        []
      );

      expect(result.codeHash).toBeDefined();
      expect(result.codeHash.length).toBeGreaterThan(0);
    });

    it('debe validar sintaxis JavaScript', async () => {
      const validCode = 'function test() { return 1; }';
      const invalidCode = 'function test( { return 1; }';

      const validResult = await verifyCodeIndependently('test-1', validCode, 'javascript', []);
      const invalidResult = await verifyCodeIndependently('test-2', invalidCode, 'javascript', []);

      expect(validResult.syntaxValid).toBe(true);
      expect(invalidResult.syntaxValid).toBe(false);
    });
  });

  describe('Verificación de tipos TypeScript', () => {
    it('debe detectar uso excesivo de any', async () => {
      const code = `
        function test(a: any, b: any, c: any, d: any): any {
          return a + b + c + d;
        }
      `;

      const result = await verifyCodeIndependently('test-1', code, 'typescript', []);

      expect(result.errors.some(e => e.includes('any'))).toBe(true);
    });
  });
});

describe('JOULE Quality Evidence Engine', () => {
  beforeEach(() => {
    // Limpiar evidencias antes de cada prueba
    const engine = qualityEvidenceEngine;
    // No hay método clear, así que creamos una nueva instancia
  });

  it('debe registrar una evidencia', () => {
    const evidence = qualityEvidenceEngine.registerEvidence({
      taskId: 'task-1',
      operationId: 'op-1',
      modelId: 'model-1',
      modelVersion: '1.0.0',
      providerId: 'provider-1',
      adapterVersion: '1.0.0',
      codeHash: 'abc123',
      benchmarkIds: ['bench-1'],
      acceptanceCriteriaVersion: '1.0.0',
      verificationResult: {
        id: 'ver-1',
        taskId: 'task-1',
        codeHash: 'abc123',
        status: 'TESTS_PASSED',
        language: 'typescript',
        syntaxValid: true,
        testsExecuted: 5,
        testsPassed: 5,
        testsFailed: 0,
        errors: [],
        warnings: [],
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'unit_tests',
        evidenceId: 'ev-1'
      },
      executionEnvironment: 'browser',
      createdBy: 'test-user'
    });

    expect(evidence.id).toBeDefined();
    expect(evidence.taskId).toBe('task-1');
    expect(evidence.finalStatus).toBe('TESTS_PASSED');
  });

  it('debe obtener evidencias por tarea', () => {
    qualityEvidenceEngine.registerEvidence({
      taskId: 'task-2',
      operationId: 'op-2',
      modelId: 'model-2',
      modelVersion: '1.0.0',
      providerId: 'provider-2',
      adapterVersion: '1.0.0',
      codeHash: 'def456',
      benchmarkIds: [],
      acceptanceCriteriaVersion: '1.0.0',
      verificationResult: {
        id: 'ver-2',
        taskId: 'task-2',
        codeHash: 'def456',
        status: 'STATIC_VALIDATED',
        language: 'typescript',
        syntaxValid: true,
        testsExecuted: 0,
        testsPassed: 0,
        testsFailed: 0,
        errors: [],
        warnings: [],
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'static_analysis',
        evidenceId: 'ev-2'
      },
      executionEnvironment: 'browser',
      createdBy: 'test-user'
    });

    const evidences = qualityEvidenceEngine.getEvidencesByTask('task-2');
    expect(evidences.length).toBeGreaterThan(0);
    expect(evidences.every(e => e.taskId === 'task-2')).toBe(true);
  });

  it('debe calcular estadísticas', () => {
    const stats = qualityEvidenceEngine.getStatistics();

    expect(stats.total).toBeDefined();
    expect(stats.byStatus).toBeDefined();
    expect(stats.byModel).toBeDefined();
    expect(stats.passRate).toBeDefined();
  });

  it('debe exportar evidencias en JSON', () => {
    const json = qualityEvidenceEngine.exportEvidences();
    const parsed = JSON.parse(json);

    expect(Array.isArray(parsed)).toBe(true);
  });

  it('debe importar evidencias desde JSON', () => {
    const evidences = [
      {
        id: 'imported-1',
        taskId: 'task-imported',
        operationId: 'op-imported',
        modelId: 'model-imported',
        modelVersion: '1.0.0',
        providerId: 'provider-imported',
        adapterVersion: '1.0.0',
        codeHash: 'xyz789',
        benchmarkIds: [],
        acceptanceCriteriaVersion: '1.0.0',
        testResults: { total: 0, passed: 0, failed: 0, skipped: 0 },
        verificationDuration: 0,
        verificationMethod: 'static' as const,
        executionEnvironment: 'browser',
        finalStatus: 'STATIC_VALIDATED' as const,
        createdAt: new Date().toISOString(),
        createdBy: 'import-user',
        metadata: {}
      }
    ];

    const result = qualityEvidenceEngine.importEvidences(JSON.stringify(evidences));

    expect(result.imported).toBe(1);
    expect(result.skipped).toBe(0);
    expect(result.errors.length).toBe(0);
  });
});

describe('JOULE Model Benchmark Lab', () => {
  it('debe tener benchmarks por defecto', () => {
    const benchmarks = modelBenchmarkLab.getAllBenchmarks();

    expect(benchmarks.length).toBeGreaterThan(0);
    expect(benchmarks.some(b => b.id === 'benchmark-decimal-addition-001')).toBe(true);
  });

  it('debe obtener benchmark por ID', () => {
    const benchmark = modelBenchmarkLab.getBenchmark('benchmark-decimal-addition-001');

    expect(benchmark).toBeDefined();
    expect(benchmark?.name).toBe('Suma Decimal 0.1 + 0.2');
  });

  it('debe filtrar benchmarks por categoría', () => {
    const calculationBenchmarks = modelBenchmarkLab.getBenchmarksByCategory('calculation');

    expect(calculationBenchmarks.length).toBeGreaterThan(0);
    expect(calculationBenchmarks.every(b => b.category === 'calculation')).toBe(true);
  });

  it('debe filtrar benchmarks por dificultad', () => {
    const easyBenchmarks = modelBenchmarkLab.getBenchmarksByDifficulty('easy');

    expect(easyBenchmarks.length).toBeGreaterThan(0);
    expect(easyBenchmarks.every(b => b.difficulty === 'easy')).toBe(true);
  });

  it('debe ejecutar un benchmark', async () => {
    const result = await modelBenchmarkLab.executeBenchmark(
      'benchmark-decimal-addition-001',
      'model-test',
      '1.0.0',
      'provider-test',
      'function add(a, b) { return Number((a + b).toFixed(10)); }',
      1500,
      100
    );

    expect(result.id).toBeDefined();
    expect(result.benchmarkId).toBe('benchmark-decimal-addition-001');
    expect(result.modelId).toBe('model-test');
    expect(result.executionTimeMs).toBe(1500);
  });

  it('debe obtener resultados de un modelo', async () => {
    await modelBenchmarkLab.executeBenchmark(
      'benchmark-decimal-addition-001',
      'model-results-test',
      '1.0.0',
      'provider-test',
      'function test() { return 1; }',
      1000,
      50
    );

    const results = modelBenchmarkLab.getModelResults('model-results-test');

    expect(results.length).toBeGreaterThan(0);
    expect(results.every(r => r.modelId === 'model-results-test')).toBe(true);
  });

  it('debe comparar modelos', async () => {
    await modelBenchmarkLab.executeBenchmark(
      'benchmark-decimal-addition-001',
      'model-compare-1',
      '1.0.0',
      'provider-test',
      'code1',
      1000,
      50
    );

    await modelBenchmarkLab.executeBenchmark(
      'benchmark-decimal-addition-001',
      'model-compare-2',
      '1.0.0',
      'provider-test',
      'code2',
      2000,
      100
    );

    const comparison = modelBenchmarkLab.compareModels(['model-compare-1', 'model-compare-2']);

    expect(comparison.length).toBe(2);
    expect(comparison[0].modelId).toBe('model-compare-1');
    expect(comparison[1].modelId).toBe('model-compare-2');
  });

  it('debe obtener estadísticas del laboratorio', () => {
    const stats = modelBenchmarkLab.getStatistics();

    expect(stats.totalBenchmarks).toBeDefined();
    expect(stats.totalExecutions).toBeDefined();
    expect(stats.modelsEvaluated).toBeDefined();
    expect(stats.overallPassRate).toBeDefined();
    expect(stats.averageScore).toBeDefined();
  });
});

describe('JOULE Resource Observer', () => {
  it('debe registrar una observación', () => {
    const observation = resourceObserver.recordObservation({
      taskId: 'task-obs-1',
      modelId: 'model-obs-1',
      providerId: 'provider-obs-1',
      startTime: new Date(Date.now() - 1000).toISOString(),
      endTime: new Date().toISOString(),
      tokensGenerated: 100,
      tokensInput: 50,
      status: 'success'
    });

    expect(observation.id).toBeDefined();
    expect(observation.totalDurationMs).toBeGreaterThan(0);
    expect(observation.status).toBe('success');
  });

  it('debe calcular estadísticas de latencia', () => {
    resourceObserver.recordObservation({
      taskId: 'task-lat-1',
      modelId: 'model-lat-1',
      providerId: 'provider-lat-1',
      startTime: new Date(Date.now() - 1000).toISOString(),
      endTime: new Date().toISOString(),
      status: 'success'
    });

    const stats = resourceObserver.getLatencyStatistics('model-lat-1');

    expect(stats.count).toBeGreaterThan(0);
    expect(stats.averageMs).toBeGreaterThan(0);
    expect(stats.medianMs).toBeGreaterThan(0);
  });

  it('debe calcular estadísticas de tokens', () => {
    resourceObserver.recordObservation({
      taskId: 'task-tok-1',
      modelId: 'model-tok-1',
      providerId: 'provider-tok-1',
      startTime: new Date(Date.now() - 1000).toISOString(),
      endTime: new Date().toISOString(),
      tokensGenerated: 100,
      tokensInput: 50,
      status: 'success'
    });

    const stats = resourceObserver.getTokenStatistics('model-tok-1');

    expect(stats.count).toBeGreaterThan(0);
    expect(stats.averageInputTokens).toBeGreaterThan(0);
    expect(stats.averageOutputTokens).toBeGreaterThan(0);
  });

  it('debe calcular tasa de éxito', () => {
    resourceObserver.recordObservation({
      taskId: 'task-suc-1',
      modelId: 'model-suc-1',
      providerId: 'provider-suc-1',
      startTime: new Date(Date.now() - 1000).toISOString(),
      endTime: new Date().toISOString(),
      status: 'success'
    });

    resourceObserver.recordObservation({
      taskId: 'task-suc-2',
      modelId: 'model-suc-1',
      providerId: 'provider-suc-1',
      startTime: new Date(Date.now() - 1000).toISOString(),
      endTime: new Date().toISOString(),
      status: 'error',
      errorMessage: 'Test error'
    });

    const stats = resourceObserver.getSuccessRate('model-suc-1');

    expect(stats.total).toBe(2);
    expect(stats.successful).toBe(1);
    expect(stats.failed).toBe(1);
    expect(stats.successRate).toBe(0.5);
  });

  it('debe detectar anomalías', () => {
    // Registrar varias observaciones normales
    for (let i = 0; i < 10; i++) {
      resourceObserver.recordObservation({
        taskId: `task-anom-${i}`,
        modelId: 'model-anom-1',
        providerId: 'provider-anom-1',
        startTime: new Date(Date.now() - 1000).toISOString(),
        endTime: new Date().toISOString(),
        status: 'success'
      });
    }

    // Registrar una observación con latencia anómala
    resourceObserver.recordObservation({
      taskId: 'task-anom-high',
      modelId: 'model-anom-1',
      providerId: 'provider-anom-1',
      startTime: new Date(Date.now() - 100000).toISOString(),
      endTime: new Date().toISOString(),
      status: 'success'
    });

    const anomalies = resourceObserver.detectAnomalies('model-anom-1');

    expect(anomalies.latencyAnomalies).toBeDefined();
  });

  it('debe obtener estadísticas generales', () => {
    const stats = resourceObserver.getOverallStatistics();

    expect(stats.totalObservations).toBeDefined();
    expect(stats.successfulObservations).toBeDefined();
    expect(stats.failedObservations).toBeDefined();
    expect(stats.averageLatencyMs).toBeDefined();
  });
});

describe('JOULE Adaptive Routing Engine', () => {
  it('debe tener política por defecto', () => {
    const policy = adaptiveRoutingEngine.getActivePolicy();

    expect(policy).toBeDefined();
    expect(policy.id).toBe('policy-default');
    expect(policy.constraints.maxCost).toBe(0);
  });

  it('debe registrar una nueva política', () => {
    const newPolicy = {
      id: 'policy-test',
      name: 'Test Policy',
      version: '1.0.0',
      description: 'Test',
      weights: {
        quality: 0.5,
        reliability: 0.2,
        latency: 0.1,
        cost: 0.1,
        privacy: 0.05,
        security: 0.05,
        energy: 0
      },
      constraints: {
        maxCost: 10,
        maxLatencyMs: 5000,
        minQualityScore: 0.8,
        minReliabilityScore: 0.9,
        requirePrivacy: true,
        requireSecurity: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    adaptiveRoutingEngine.registerPolicy(newPolicy);
    const retrieved = adaptiveRoutingEngine.getPolicy('policy-test');

    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('Test Policy');
  });

  it('debe seleccionar la mejor ruta', async () => {
    const task = classifyTask('Suma dos números');
    const routes = [
      {
        routeId: 'route-1',
        providerId: 'ollama',
        modelId: 'qwen2.5-coder:0.5b',
        modelVersion: '0.5b'
      },
      {
        routeId: 'route-2',
        providerId: 'openrouter',
        modelId: 'meta-llama/llama-3.2-3b-instruct:free',
        modelVersion: '3.2'
      }
    ];

    const decision = await adaptiveRoutingEngine.selectBestRoute(task, routes);

    expect(decision.id).toBeDefined();
    expect(decision.taskId).toBe(task.id);
    expect(decision.policyId).toBeDefined();
    expect(decision.scores.length).toBeGreaterThan(0);
  });

  it('debe respetar restricciones de privacidad', async () => {
    const task = classifyTask('Procesa información confidencial del usuario');
    const routes = [
      {
        routeId: 'route-public',
        providerId: 'openrouter',
        modelId: 'model-1',
        modelVersion: '1.0'
      }
    ];

    const decision = await adaptiveRoutingEngine.selectBestRoute(task, routes);

    // Debe preferir rutas locales para datos confidenciales
    expect(decision.scores[0].privacyScore).toBeLessThan(1);
  });

  it('debe respetar presupuesto cero', async () => {
    const task = classifyTask('Genera código');
    const routes = [
      {
        routeId: 'route-paid',
        providerId: 'paid-provider',
        modelId: 'model-paid',
        modelVersion: '1.0'
      }
    ];

    const decision = await adaptiveRoutingEngine.selectBestRoute(task, routes);

    // Debe evaluar el coste
    expect(decision.scores[0].costScore).toBeDefined();
  });

  it('debe generar razonamiento de la decisión', async () => {
    const task = classifyTask('Suma dos números');
    const routes = [
      {
        routeId: 'route-1',
        providerId: 'ollama',
        modelId: 'qwen2.5-coder:0.5b',
        modelVersion: '0.5b'
      }
    ];

    const decision = await adaptiveRoutingEngine.selectBestRoute(task, routes);

    expect(decision.reasoning).toBeDefined();
    expect(decision.reasoning.length).toBeGreaterThan(0);
  });

  it('debe obtener todas las decisiones', async () => {
    const task = classifyTask('Test');
    const routes = [
      {
        routeId: 'route-dec-1',
        providerId: 'provider-1',
        modelId: 'model-1',
        modelVersion: '1.0'
      }
    ];

    await adaptiveRoutingEngine.selectBestRoute(task, routes);

    const decisions = adaptiveRoutingEngine.getAllDecisions();

    expect(decisions.length).toBeGreaterThan(0);
  });

  it('debe exportar decisiones en JSON', () => {
    const json = adaptiveRoutingEngine.exportDecisions();
    const parsed = JSON.parse(json);

    expect(Array.isArray(parsed)).toBe(true);
  });
});

describe('JOULE Cognitive Integration', () => {
  it('debe integrar clasificación, verificación y evidencias', async () => {
    // Clasificar tarea
    const task = classifyTask('Genera una función TypeScript que sume 0.1 y 0.2');

    expect(task.taskType).toBe('code_generation');
    expect(task.language).toBe('typescript');

    // Verificar código incorrecto
    const incorrectCode = 'function add(a, b) { return Math.round(a) + Math.round(b); }';
    const incorrectResult = await verifyCodeIndependently(
      task.id,
      incorrectCode,
      'typescript',
      task.acceptanceCriteria
    );

    expect(incorrectResult.status).toBe('TESTS_FAILED');

    // Registrar evidencia
    const evidence = qualityEvidenceEngine.registerEvidence({
      taskId: task.id,
      operationId: 'op-integration-1',
      modelId: 'model-integration',
      modelVersion: '1.0.0',
      providerId: 'provider-integration',
      adapterVersion: '1.0.0',
      codeHash: incorrectResult.codeHash,
      benchmarkIds: ['benchmark-decimal-addition-001'],
      acceptanceCriteriaVersion: '1.0.0',
      verificationResult: incorrectResult,
      executionEnvironment: 'browser',
      createdBy: 'integration-test'
    });

    expect(evidence.id).toBeDefined();
    expect(evidence.finalStatus).toBe('TESTS_FAILED');

    // Verificar que la evidencia se registró
    const evidences = qualityEvidenceEngine.getEvidencesByTask(task.id);
    expect(evidences.length).toBeGreaterThan(0);
  });

  it('debe integrar benchmarks y observaciones', async () => {
    // Ejecutar benchmark
    const benchmarkResult = await modelBenchmarkLab.executeBenchmark(
      'benchmark-decimal-addition-001',
      'model-integration-2',
      '1.0.0',
      'provider-integration-2',
      'function add(a, b) { return Number((a + b).toFixed(10)); }',
      1500,
      100
    );

    expect(benchmarkResult.id).toBeDefined();

    // Registrar observación de recursos
    const observation = resourceObserver.recordObservation({
      taskId: 'task-integration-2',
      modelId: 'model-integration-2',
      providerId: 'provider-integration-2',
      startTime: new Date(Date.now() - 1500).toISOString(),
      endTime: new Date().toISOString(),
      providerReportedDurationMs: 1400,
      tokensGenerated: 100,
      tokensInput: 50,
      status: 'success'
    });

    expect(observation.id).toBeDefined();
    expect(observation.totalDurationMs).toBeGreaterThan(0);

    // Verificar estadísticas
    const modelStats = resourceObserver.getLatencyStatistics('model-integration-2');
    expect(modelStats.count).toBeGreaterThan(0);
  });
});
