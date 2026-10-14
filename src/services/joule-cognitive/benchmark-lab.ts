// GAGO OPEN ARTIFACT FACTORY — JOULE MODEL BENCHMARK LAB
// Fase 12 — Laboratorio para comparar modelos mediante tareas reproducibles

import type {
  Benchmark,
  BenchmarkResult,
  JouleTaskType,
  ProgrammingLanguage
} from '../../types/joule-cognitive';
import { generateId } from '../storage';
import { DECIMAL_ADDITION_BENCHMARK } from './code-verifier';

/**
 * Laboratorio de benchmarks para evaluación de modelos
 */
export class ModelBenchmarkLab {
  private benchmarks: Map<string, Benchmark> = new Map();
  private results: Map<string, BenchmarkResult[]> = new Map();

  constructor() {
    // Registrar benchmarks iniciales
    this.initializeDefaultBenchmarks();
  }

  /**
   * Inicializa los benchmarks por defecto
   */
  private initializeDefaultBenchmarks(): void {
    // Benchmark obligatorio: Suma decimal
    this.registerBenchmark(DECIMAL_ADDITION_BENCHMARK);

    // Benchmark: Presupuestos monetarios
    this.registerBenchmark({
      id: 'benchmark-monetary-budget-001',
      name: 'Cálculo de Presupuesto Monetario',
      description: 'Verifica que el código calcula correctamente presupuestos en céntimos',
      category: 'calculation',
      language: 'typescript',
      input: 'Calcular el total de 3 items: $10.99, $5.50, $20.75',
      expectedOutput: '37.24',
      acceptanceCriteria: [
        {
          id: 'criterion-monetary-001',
          description: 'El resultado debe ser exacto sin errores de punto flotante',
          type: 'functional',
          testable: true,
          expectedResult: 37.24,
          tolerance: 0.001
        }
      ],
      timeout: 5000,
      difficulty: 'medium',
      version: '1.0.0',
      createdAt: new Date().toISOString()
    });

    // Benchmark: Validación de entradas
    this.registerBenchmark({
      id: 'benchmark-input-validation-001',
      name: 'Validación de Email',
      description: 'Verifica que el código valida correctamente direcciones de email',
      category: 'validation',
      language: 'typescript',
      input: 'Función que valida emails',
      expectedOutput: 'Función que retorna true para emails válidos y false para inválidos',
      acceptanceCriteria: [
        {
          id: 'criterion-validation-001',
          description: 'Debe aceptar emails válidos como user@example.com',
          type: 'functional',
          testable: true
        },
        {
          id: 'criterion-validation-002',
          description: 'Debe rechazar emails inválidos como user@',
          type: 'functional',
          testable: true
        }
      ],
      timeout: 5000,
      difficulty: 'easy',
      version: '1.0.0',
      createdAt: new Date().toISOString()
    });

    // Benchmark: Funciones TypeScript
    this.registerBenchmark({
      id: 'benchmark-typescript-function-001',
      name: 'Función TypeScript con Tipos',
      description: 'Verifica que el código TypeScript usa tipos correctamente',
      category: 'code_generation',
      language: 'typescript',
      input: 'Función que suma dos números con tipos TypeScript',
      expectedOutput: 'Función tipada correctamente',
      acceptanceCriteria: [
        {
          id: 'criterion-ts-001',
          description: 'Debe usar tipos explícitos (no any)',
          type: 'quality',
          testable: true
        },
        {
          id: 'criterion-ts-002',
          description: 'Debe compilar sin errores de TypeScript',
          type: 'quality',
          testable: true
        }
      ],
      timeout: 5000,
      difficulty: 'easy',
      version: '1.0.0',
      createdAt: new Date().toISOString()
    });

    // Benchmark: Estructuras de datos
    this.registerBenchmark({
      id: 'benchmark-data-structures-001',
      name: 'Ordenación de Array',
      description: 'Verifica que el código ordena correctamente un array de números',
      category: 'code_generation',
      language: 'typescript',
      input: 'Función que ordena un array de números de menor a mayor',
      expectedOutput: 'Array ordenado',
      acceptanceCriteria: [
        {
          id: 'criterion-sort-001',
          description: 'El array resultante debe estar ordenado ascendentemente',
          type: 'functional',
          testable: true
        },
        {
          id: 'criterion-sort-002',
          description: 'No debe modificar el array original',
          type: 'quality',
          testable: true
        }
      ],
      timeout: 5000,
      difficulty: 'easy',
      version: '1.0.0',
      createdAt: new Date().toISOString()
    });

    // Benchmark: Manejo de errores
    this.registerBenchmark({
      id: 'benchmark-error-handling-001',
      name: 'Manejo de Errores en API',
      description: 'Verifica que el código maneja correctamente errores de API',
      category: 'code_generation',
      language: 'typescript',
      input: 'Función que hace una llamada API con manejo de errores',
      expectedOutput: 'Función con try-catch y manejo adecuado de errores',
      acceptanceCriteria: [
        {
          id: 'criterion-error-001',
          description: 'Debe usar try-catch para manejar errores',
          type: 'quality',
          testable: true
        },
        {
          id: 'criterion-error-002',
          description: 'Debe retornar un valor por defecto o lanzar error descriptivo',
          type: 'functional',
          testable: true
        }
      ],
      timeout: 5000,
      difficulty: 'medium',
      version: '1.0.0',
      createdAt: new Date().toISOString()
    });
  }

  /**
   * Registra un nuevo benchmark
   */
  registerBenchmark(benchmark: Benchmark): void {
    this.benchmarks.set(benchmark.id, benchmark);
  }

  /**
   * Obtiene un benchmark por ID
   */
  getBenchmark(benchmarkId: string): Benchmark | undefined {
    return this.benchmarks.get(benchmarkId);
  }

  /**
   * Obtiene todos los benchmarks
   */
  getAllBenchmarks(): Benchmark[] {
    return Array.from(this.benchmarks.values());
  }

  /**
   * Obtiene benchmarks por categoría
   */
  getBenchmarksByCategory(category: JouleTaskType): Benchmark[] {
    return this.getAllBenchmarks().filter(b => b.category === category);
  }

  /**
   * Obtiene benchmarks por dificultad
   */
  getBenchmarksByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Benchmark[] {
    return this.getAllBenchmarks().filter(b => b.difficulty === difficulty);
  }

  /**
   * Ejecuta un benchmark con un modelo específico
   * NOTA: En producción, esto enviaría la solicitud al modelo real
   * Por ahora, simulamos la ejecución
   */
  async executeBenchmark(
    benchmarkId: string,
    modelId: string,
    modelVersion: string,
    providerId: string,
    actualOutput: string,
    executionTimeMs: number,
    tokensUsed?: number
  ): Promise<BenchmarkResult> {
    const benchmark = this.getBenchmark(benchmarkId);
    if (!benchmark) {
      throw new Error(`Benchmark ${benchmarkId} no encontrado`);
    }

    // Verificar si la salida coincide con lo esperado
    const passed = this.verifyOutput(actualOutput, benchmark.expectedOutput, benchmark.acceptanceCriteria);
    
    // Calcular puntuación
    const score = this.calculateScore(passed, executionTimeMs, benchmark.timeout);

    const result: BenchmarkResult = {
      id: generateId(),
      benchmarkId,
      modelId,
      modelVersion,
      providerId,
      input: benchmark.input,
      expectedOutput: benchmark.expectedOutput,
      actualOutput,
      passed,
      score,
      executionTimeMs,
      tokensUsed,
      errors: passed ? [] : ['La salida no cumple con los criterios de aceptación'],
      executedAt: new Date().toISOString()
    };

    // Almacenar resultado
    if (!this.results.has(modelId)) {
      this.results.set(modelId, []);
    }
    this.results.get(modelId)!.push(result);

    return result;
  }

  /**
   * Verifica si la salida cumple con los criterios
   */
  private verifyOutput(
    actualOutput: string,
    expectedOutput: string,
    criteria: any[]
  ): boolean {
    // Verificación básica: la salida debe contener elementos clave del expected
    const expectedKeywords = expectedOutput.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const actualLower = actualOutput.toLowerCase();

    // Al menos el 50% de las palabras clave deben estar presentes
    const matchingKeywords = expectedKeywords.filter(kw => actualLower.includes(kw));
    const matchRatio = matchingKeywords.length / expectedKeywords.length;

    return matchRatio >= 0.5;
  }

  /**
   * Calcula la puntuación del benchmark
   */
  private calculateScore(passed: boolean, executionTimeMs: number, timeout: number): number {
    if (!passed) return 0;

    // Puntuación base por pasar
    let score = 0.7;

    // Bonus por velocidad (hasta 0.3 puntos adicionales)
    const timeRatio = executionTimeMs / timeout;
    if (timeRatio < 0.5) {
      score += 0.3;
    } else if (timeRatio < 0.75) {
      score += 0.2;
    } else if (timeRatio < 0.9) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Obtiene todos los resultados de un modelo
   */
  getModelResults(modelId: string): BenchmarkResult[] {
    return this.results.get(modelId) || [];
  }

  /**
   * Obtiene resultados de un benchmark específico
   */
  getBenchmarkResults(benchmarkId: string): BenchmarkResult[] {
    const allResults: BenchmarkResult[] = [];
    this.results.forEach(results => {
      allResults.push(...results.filter(r => r.benchmarkId === benchmarkId));
    });
    return allResults;
  }

  /**
   * Compara el rendimiento de múltiples modelos
   */
  compareModels(modelIds: string[]): {
    modelId: string;
    totalBenchmarks: number;
    passedBenchmarks: number;
    passRate: number;
    averageScore: number;
    averageExecutionTime: number;
  }[] {
    return modelIds.map(modelId => {
      const results = this.getModelResults(modelId);
      
      if (results.length === 0) {
        return {
          modelId,
          totalBenchmarks: 0,
          passedBenchmarks: 0,
          passRate: 0,
          averageScore: 0,
          averageExecutionTime: 0
        };
      }

      const passedBenchmarks = results.filter(r => r.passed).length;
      const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
      const averageExecutionTime = results.reduce((sum, r) => sum + r.executionTimeMs, 0) / results.length;

      return {
        modelId,
        totalBenchmarks: results.length,
        passedBenchmarks,
        passRate: passedBenchmarks / results.length,
        averageScore,
        averageExecutionTime
      };
    });
  }

  /**
   * Obtiene estadísticas generales del laboratorio
   */
  getStatistics(): {
    totalBenchmarks: number;
    totalExecutions: number;
    modelsEvaluated: number;
    overallPassRate: number;
    averageScore: number;
  } {
    const totalBenchmarks = this.benchmarks.size;
    const allResults: BenchmarkResult[] = [];
    this.results.forEach(results => allResults.push(...results));

    const totalExecutions = allResults.length;
    const modelsEvaluated = this.results.size;
    const passedCount = allResults.filter(r => r.passed).length;
    const overallPassRate = totalExecutions > 0 ? passedCount / totalExecutions : 0;
    const averageScore = totalExecutions > 0
      ? allResults.reduce((sum, r) => sum + r.score, 0) / totalExecutions
      : 0;

    return {
      totalBenchmarks,
      totalExecutions,
      modelsEvaluated,
      overallPassRate,
      averageScore
    };
  }

  /**
   * Exporta resultados en formato JSON
   */
  exportResults(modelId?: string): string {
    if (modelId) {
      return JSON.stringify(this.getModelResults(modelId), null, 2);
    }
    
    const allResults: Record<string, BenchmarkResult[]> = {};
    this.results.forEach((results, modelId) => {
      allResults[modelId] = results;
    });
    
    return JSON.stringify(allResults, null, 2);
  }
}

// Instancia global del laboratorio
export const modelBenchmarkLab = new ModelBenchmarkLab();
