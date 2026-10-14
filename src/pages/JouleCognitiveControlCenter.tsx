// GAGO OPEN ARTIFACT FACTORY — JOULE COGNITIVE CONTROL CENTER
// Fase 12 — Centro de control cognitivo

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  TrendingUp, 
  Clock, 
  Shield,
  Zap,
  BarChart3,
  FileText,
  Target
} from 'lucide-react';
import { 
  modelBenchmarkLab, 
  resourceObserver, 
  qualityEvidenceEngine,
  adaptiveRoutingEngine 
} from '../services/joule-cognitive';
import { classifyTask } from '../services/joule-cognitive/task-intelligence';
import { verifyCodeIndependently, DECIMAL_ADDITION_BENCHMARK } from '../services/joule-cognitive/code-verifier';

export default function JouleCognitiveControlCenter() {
  const [activeTab, setActiveTab] = useState<'overview' | 'benchmarks' | 'evidence' | 'routing'>('overview');
  const [benchmarkStats, setBenchmarkStats] = useState<any>(null);
  const [resourceStats, setResourceStats] = useState<any>(null);
  const [evidenceStats, setEvidenceStats] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = () => {
    setBenchmarkStats(modelBenchmarkLab.getStatistics());
    setResourceStats(resourceObserver.getOverallStatistics());
    setEvidenceStats(qualityEvidenceEngine.getStatistics());
  };

  const runDecimalAdditionTest = async () => {
    setIsRunningTest(true);
    setTestResult(null);

    try {
      // Código INCORRECTO (el que genera el error)
      const incorrectCode = `
        function add(a: number, b: number): number {
          return Math.round(a) + Math.round(b);
        }
      `;

      // Verificar el código incorrecto
      const incorrectResult = await verifyCodeIndependently(
        'test-task-001',
        incorrectCode,
        'typescript',
        DECIMAL_ADDITION_BENCHMARK.acceptanceCriteria
      );

      setTestResult({
        type: 'incorrect',
        result: incorrectResult,
        expected: 'DEBE FALLAR - El código usa Math.round individualmente'
      });

      // Código CORRECTO
      const correctCode = `
        function add(a: number, b: number): number {
          // Usar precisión decimal adecuada
          return Number((a + b).toFixed(10));
        }
      `;

      // Verificar el código correcto
      const correctResult = await verifyCodeIndependently(
        'test-task-002',
        correctCode,
        'typescript',
        DECIMAL_ADDITION_BENCHMARK.acceptanceCriteria
      );

      setTestResult((prev: any) => ({
        ...prev,
        correct: {
          type: 'correct',
          result: correctResult,
          expected: 'DEBE PASAR - El código maneja correctamente la precisión decimal'
        }
      }));

    } catch (error) {
      console.error('Error en la prueba:', error);
    } finally {
      setIsRunningTest(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-600" />
            JOULE Cognitive Control Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Motor de verificación independiente, aprendizaje por evidencias y optimización adaptativa
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Activity className="w-5 h-5 inline-block mr-2" />
              Vista General
            </button>
            <button
              onClick={() => setActiveTab('benchmarks')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'benchmarks'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Target className="w-5 h-5 inline-block mr-2" />
              Benchmarks
            </button>
            <button
              onClick={() => setActiveTab('evidence')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'evidence'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <FileText className="w-5 h-5 inline-block mr-2" />
              Evidencias
            </button>
            <button
              onClick={() => setActiveTab('routing')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'routing'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Zap className="w-5 h-5 inline-block mr-2" />
              Enrutamiento
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Benchmark Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Benchmarks</h3>
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                {benchmarkStats && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{benchmarkStats.totalBenchmarks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Ejecuciones:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{benchmarkStats.totalExecutions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Tasa de éxito:</span>
                      <span className="font-semibold text-green-600">{(benchmarkStats.overallPassRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Puntuación media:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{benchmarkStats.averageScore.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Resource Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recursos</h3>
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                {resourceStats && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Observaciones:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{resourceStats.totalObservations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Exitosas:</span>
                      <span className="font-semibold text-green-600">{resourceStats.successfulObservations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Latencia media:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{resourceStats.averageLatencyMs.toFixed(0)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Tokens generados:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{resourceStats.totalTokensGenerated}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Evidence Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Evidencias</h3>
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                {evidenceStats && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{evidenceStats.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Tasa de éxito:</span>
                      <span className="font-semibold text-green-600">{(evidenceStats.passRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Tiempo medio verif.:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{evidenceStats.averageVerificationTime.toFixed(0)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Por estado:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{Object.keys(evidenceStats.byStatus).length}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Test Case: Decimal Addition */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Caso de Prueba Obligatorio: Suma Decimal (0.1 + 0.2)
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Este benchmark verifica que el código generado maneja correctamente la aritmética de punto flotante.
                El error común es usar Math.round individualmente en los operandos, lo que devuelve 0 + 0 = 0 en lugar de 0.3.
              </p>
              <button
                onClick={runDecimalAdditionTest}
                disabled={isRunningTest}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isRunningTest ? 'Ejecutando prueba...' : 'Ejecutar Prueba de Verificación'}
              </button>

              {testResult && (
                <div className="mt-6 space-y-4">
                  {/* Incorrect Code Result */}
                  <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                          Código INCORRECTO (debe fallar)
                        </h4>
                        <pre className="text-sm bg-red-100 dark:bg-red-900/40 p-3 rounded mb-2 overflow-x-auto">
                          <code>{`function add(a: number, b: number): number {
  return Math.round(a) + Math.round(b);
}`}</code>
                        </pre>
                        <div className="text-sm text-red-800 dark:text-red-200">
                          <p><strong>Estado:</strong> {testResult.result.status}</p>
                          <p><strong>Sintaxis válida:</strong> {testResult.result.syntaxValid ? 'Sí' : 'No'}</p>
                          <p><strong>Pruebas ejecutadas:</strong> {testResult.result.testsExecuted}</p>
                          <p><strong>Pruebas pasadas:</strong> {testResult.result.testsPassed}</p>
                          <p><strong>Pruebas fallidas:</strong> {testResult.result.testsFailed}</p>
                          {testResult.result.errors.length > 0 && (
                            <div className="mt-2">
                              <strong>Errores:</strong>
                              <ul className="list-disc list-inside mt-1">
                                {testResult.result.errors.map((err: string, idx: number) => (
                                  <li key={idx}>{err}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <p className="mt-2 font-semibold">{testResult.expected}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Correct Code Result */}
                  {testResult.correct && (
                    <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                            Código CORRECTO (debe pasar)
                          </h4>
                          <pre className="text-sm bg-green-100 dark:bg-green-900/40 p-3 rounded mb-2 overflow-x-auto">
                            <code>{`function add(a: number, b: number): number {
  // Usar precisión decimal adecuada
  return Number((a + b).toFixed(10));
}`}</code>
                          </pre>
                          <div className="text-sm text-green-800 dark:text-green-200">
                            <p><strong>Estado:</strong> {testResult.correct.result.status}</p>
                            <p><strong>Sintaxis válida:</strong> {testResult.correct.result.syntaxValid ? 'Sí' : 'No'}</p>
                            <p><strong>Pruebas ejecutadas:</strong> {testResult.correct.result.testsExecuted}</p>
                            <p><strong>Pruebas pasadas:</strong> {testResult.correct.result.testsPassed}</p>
                            <p><strong>Pruebas fallidas:</strong> {testResult.correct.result.testsFailed}</p>
                            {testResult.correct.result.errors.length > 0 && (
                              <div className="mt-2">
                                <strong>Errores:</strong>
                                <ul className="list-disc list-inside mt-1">
                                  {testResult.correct.result.errors.map((err: string, idx: number) => (
                                    <li key={idx}>{err}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <p className="mt-2 font-semibold">{testResult.correct.expected}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Benchmarks Tab */}
        {activeTab === 'benchmarks' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Benchmarks Disponibles
              </h3>
              <div className="space-y-4">
                {modelBenchmarkLab.getAllBenchmarks().map(benchmark => (
                  <div key={benchmark.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{benchmark.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{benchmark.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        benchmark.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        benchmark.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {benchmark.difficulty}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p><strong>Categoría:</strong> {benchmark.category}</p>
                      <p><strong>Lenguaje:</strong> {benchmark.language}</p>
                      <p><strong>Timeout:</strong> {benchmark.timeout}ms</p>
                      <p><strong>Criterios de aceptación:</strong> {benchmark.acceptanceCriteria.length}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Evidence Tab */}
        {activeTab === 'evidence' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Evidencias de Calidad
              </h3>
              {evidenceStats && evidenceStats.total > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(evidenceStats.byStatus).map(([status, count]) => (
                      <div key={status} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{status}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{count as number}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Distribución por Modelo</h4>
                    <div className="space-y-2">
                      {Object.entries(evidenceStats.byModel).map(([modelId, count]) => (
                        <div key={modelId} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded p-3">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{modelId}</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{count as number}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No hay evidencias registradas aún.</p>
              )}
            </div>
          </div>
        )}

        {/* Routing Tab */}
        {activeTab === 'routing' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Decisiones de Enrutamiento
              </h3>
              {adaptiveRoutingEngine.getAllDecisions().length > 0 ? (
                <div className="space-y-4">
                  {adaptiveRoutingEngine.getAllDecisions().slice(-10).reverse().map(decision => (
                    <div key={decision.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Tarea: {decision.taskId}
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            Ruta seleccionada: {decision.selectedRouteId || 'Ninguna'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Confianza: {(decision.confidence * 100).toFixed(1)}%
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {new Date(decision.decisionAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                        {decision.reasoning}
                      </p>
                      {decision.constraints.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Restricciones: {decision.constraints.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No hay decisiones de enrutamiento registradas aún.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
