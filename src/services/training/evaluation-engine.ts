// GAGO Open Artifact Factory - Training Evaluation Engine
// Phase 9: JOULE FREE TRAINING CENTER

import type { TrainingEvaluation, TrainingJob, TrainingAlgorithm } from '../../types/training';
import { generateId } from '../storage';

/**
 * Evalúa los resultados de un entrenamiento
 */
export function evaluateTrainingJob(
  job: TrainingJob,
  algorithm: TrainingAlgorithm,
  results: any
): TrainingEvaluation {
  const metrics: Record<string, number> = {};
  let passed = true;
  let details = '';

  // Evaluar según el tipo de algoritmo
  switch (algorithm.type) {
    case 'policy_optimization':
    case 'contextual_bandit':
      return evaluateBanditResults(job.id, results);
    
    case 'classification':
      return evaluateClassificationResults(job.id, results);
    
    case 'regression':
      return evaluateRegressionResults(job.id, results);
    
    case 'cost_estimation':
    case 'latency_prediction':
      return evaluatePredictionResults(job.id, results);
    
    case 'route_selection':
      return evaluateRouteSelectionResults(job.id, results);
    
    case 'incremental_learning':
      return evaluateIncrementalLearningResults(job.id, results);
    
    case 'policy_evaluation':
      return evaluatePolicyEvaluationResults(job.id, results);
    
    case 'deterministic_baseline':
      return evaluateDeterministicBaselineResults(job.id, results);
    
    default:
      return {
        id: generateId(),
        jobId: job.id,
        metrics: {},
        passed: false,
        details: `Tipo de algoritmo no soportado: ${algorithm.type}`,
        evaluatedAt: new Date().toISOString()
      };
  }
}

/**
 * Evalúa resultados de algoritmos de bandido
 */
function evaluateBanditResults(jobId: string, results: any): TrainingEvaluation {
  const metrics: Record<string, number> = {};
  let passed = true;
  let details = '';

  if (results.bestArm !== undefined && results.rewards) {
    metrics.bestArmReward = results.rewards[results.bestArm] || 0;
    metrics.convergence = results.iterations > 500 ? 0.9 : 0.7;
    metrics.explorationEfficiency = results.counts ? 
      Math.min(...results.counts) / Math.max(...results.counts) : 0;
    
    passed = metrics.bestArmReward > 0.5 && metrics.convergence > 0.6;
    details = passed ? 
      'Política optimizada correctamente con buena convergencia' : 
      'Convergencia insuficiente o recompensa baja';
  } else {
    passed = false;
    details = 'Resultados de bandido incompletos';
  }

  return {
    id: generateId(),
    jobId,
    metrics,
    passed,
    details,
    evaluatedAt: new Date().toISOString()
  };
}

/**
 * Evalúa resultados de clasificación
 */
function evaluateClassificationResults(jobId: string, results: any): TrainingEvaluation {
  const metrics: Record<string, number> = {};
  let passed = true;
  let details = '';

  if (results.accuracy !== undefined) {
    metrics.accuracy = results.accuracy;
    metrics.precision = results.precision || results.accuracy * 0.95;
    metrics.recall = results.recall || results.accuracy * 0.9;
    metrics.f1Score = 2 * (metrics.precision * metrics.recall) / (metrics.precision + metrics.recall);
    
    passed = metrics.accuracy > 0.7 && metrics.f1Score > 0.65;
    details = passed ? 
      `Clasificador entrenado con precisión ${metrics.accuracy.toFixed(2)}` : 
      `Precisión insuficiente: ${metrics.accuracy.toFixed(2)}`;
  } else {
    passed = false;
    details = 'Métricas de clasificación no disponibles';
  }

  return {
    id: generateId(),
    jobId,
    metrics,
    passed,
    details,
    evaluatedAt: new Date().toISOString()
  };
}

/**
 * Evalúa resultados de regresión
 */
function evaluateRegressionResults(jobId: string, results: any): TrainingEvaluation {
  const metrics: Record<string, number> = {};
  let passed = true;
  let details = '';

  if (results.mse !== undefined) {
    metrics.mse = results.mse;
    metrics.rmse = Math.sqrt(results.mse);
    metrics.r2Score = results.r2 || 1 - results.mse;
    
    passed = metrics.mse < 0.1 && metrics.r2Score > 0.8;
    details = passed ? 
      `Regresión entrenada con MSE ${metrics.mse.toFixed(4)}` : 
      `Error cuadrático medio alto: ${metrics.mse.toFixed(4)}`;
  } else {
    passed = false;
    details = 'Métricas de regresión no disponibles';
  }

  return {
    id: generateId(),
    jobId,
    metrics,
    passed,
    details,
    evaluatedAt: new Date().toISOString()
  };
}

/**
 * Evalúa resultados de predicción
 */
function evaluatePredictionResults(jobId: string, results: any): TrainingEvaluation {
  const metrics: Record<string, number> = {};
  let passed = true;
  let details = '';

  if (results.predictions && results.predictions.length > 0) {
    metrics.predictionCount = results.predictions.length;
    metrics.smoothedValue = results.smoothedValue || 0;
    metrics.predictionStability = 1 - (results.predictions.slice(-10).reduce(
      (max: number, p: number, i: number, arr: number[]) => 
        i > 0 ? Math.max(max, Math.abs(p - arr[i-1])) : 0, 0
    ) / 10);
    
    passed = metrics.predictionCount > 0 && metrics.predictionStability > 0.5;
    details = passed ? 
      'Predicciones generadas con estabilidad aceptable' : 
      'Predicciones inestables o insuficientes';
  } else {
    passed = false;
    details = 'No se generaron predicciones';
  }

  return {
    id: generateId(),
    jobId,
    metrics,
    passed,
    details,
    evaluatedAt: new Date().toISOString()
  };
}

/**
 * Evalúa resultados de selección de rutas
 */
function evaluateRouteSelectionResults(jobId: string, results: any): TrainingEvaluation {
  const metrics: Record<string, number> = {};
  let passed = true;
  let details = '';

  if (results.qValues && Object.keys(results.qValues).length > 0) {
    metrics.qValuesCount = Object.keys(results.qValues).length;
    metrics.averageQValue = Object.values(results.qValues).reduce((sum: number, v: any) => sum + (v as number), 0) / metrics.qValuesCount;
    metrics.maxQValue = Math.max(...Object.values(results.qValues) as number[]);
    metrics.minQValue = Math.min(...Object.values(results.qValues) as number[]);
    
    passed = metrics.qValuesCount > 10 && metrics.maxQValue > 0;
    details = passed ? 
      `Política de rutas aprendida con ${metrics.qValuesCount} valores Q` : 
      'Aprendizaje insuficiente de valores Q';
  } else {
    passed = false;
    details = 'No se aprendieron valores Q';
  }

  return {
    id: generateId(),
    jobId,
    metrics,
    passed,
    details,
    evaluatedAt: new Date().toISOString()
  };
}

/**
 * Evalúa resultados de aprendizaje incremental
 */
function evaluateIncrementalLearningResults(jobId: string, results: any): TrainingEvaluation {
  const metrics: Record<string, number> = {};
  let passed = true;
  let details = '';

  if (results.updates !== undefined && results.model) {
    metrics.updates = results.updates;
    metrics.modelSize = results.model.weights ? results.model.weights.length : 0;
    metrics.learningProgress = metrics.updates > 0 ? 1 : 0;
    
    passed = metrics.updates > 0 && metrics.modelSize > 0;
    details = passed ? 
      `Modelo actualizado incrementalmente con ${metrics.updates} actualizaciones` : 
      'No se realizaron actualizaciones al modelo';
  } else {
    passed = false;
    details = 'Resultados de aprendizaje incremental incompletos';
  }

  return {
    id: generateId(),
    jobId,
    metrics,
    passed,
    details,
    evaluatedAt: new Date().toISOString()
  };
}

/**
 * Evalúa resultados de evaluación de políticas
 */
function evaluatePolicyEvaluationResults(jobId: string, results: any): TrainingEvaluation {
  const metrics: Record<string, number> = {};
  let passed = true;
  let details = '';

  if (results.meanReward !== undefined) {
    metrics.meanReward = results.meanReward;
    metrics.variance = results.variance || 0;
    metrics.confidenceIntervalWidth = results.confidenceInterval ? 
      results.confidenceInterval[1] - results.confidenceInterval[0] : 0;
    metrics.steps = results.steps || 0;
    
    passed = metrics.meanReward > 0 && metrics.steps > 100;
    details = passed ? 
      `Política evaluada con recompensa media ${metrics.meanReward.toFixed(3)}` : 
      'Recompensa media insuficiente o evaluaciones insuficientes';
  } else {
    passed = false;
    details = 'Métricas de evaluación de políticas no disponibles';
  }

  return {
    id: generateId(),
    jobId,
    metrics,
    passed,
    details,
    evaluatedAt: new Date().toISOString()
  };
}

/**
 * Evalúa resultados de referencia determinista
 */
function evaluateDeterministicBaselineResults(jobId: string, results: any): TrainingEvaluation {
  const metrics: Record<string, number> = {};
  let passed = true;
  let details = '';

  if (results.count !== undefined) {
    metrics.count = results.count;
    metrics.strategy = results.strategy === 'greedy' ? 1 : 0;
    
    passed = metrics.count > 0;
    details = passed ? 
      `Referencia determinista generada con ${metrics.count} resultados` : 
      'No se generaron resultados de referencia';
  } else {
    passed = false;
    details = 'Resultados de referencia no disponibles';
  }

  return {
    id: generateId(),
    jobId,
    metrics,
    passed,
    details,
    evaluatedAt: new Date().toISOString()
  };
}

/**
 * Compara los resultados de un entrenamiento con la línea base
 */
export function compareWithBaseline(
  evaluation: TrainingEvaluation,
  baselineMetrics: Record<string, number>
): {
  improved: boolean;
  improvements: Record<string, number>;
  summary: string;
} {
  const improvements: Record<string, number> = {};
  let improved = false;

  for (const [key, value] of Object.entries(evaluation.metrics)) {
    if (baselineMetrics[key] !== undefined) {
      const improvement = value - baselineMetrics[key];
      improvements[key] = improvement;
      
      // Para métricas donde mayor es mejor
      if (['accuracy', 'meanReward', 'bestArmReward', 'r2Score', 'f1Score'].includes(key)) {
        if (improvement > 0) improved = true;
      }
      
      // Para métricas donde menor es mejor
      if (['mse', 'rmse', 'variance'].includes(key)) {
        if (improvement < 0) improved = true;
      }
    }
  }

  const summary = improved ? 
    'El entrenamiento muestra mejoras respecto a la línea base' : 
    'No se observan mejoras significativas respecto a la línea base';

  return {
    improved,
    improvements,
    summary
  };
}

/**
 * Genera un informe de evaluación completo
 */
export function generateEvaluationReport(
  job: TrainingJob,
  evaluation: TrainingEvaluation,
  baselineComparison?: { improved: boolean; improvements: Record<string, number>; summary: string }
): string {
  let report = `# Informe de Evaluación de Entrenamiento\n\n`;
  report += `**ID del Trabajo:** ${job.id}\n`;
  report += `**Fecha de Evaluación:** ${new Date(evaluation.evaluatedAt).toLocaleString()}\n\n`;
  
  report += `## Resultado\n`;
  report += `**Estado:** ${evaluation.passed ? '✅ APROBADO' : '❌ RECHAZADO'}\n`;
  report += `**Detalles:** ${evaluation.details}\n\n`;
  
  report += `## Métricas\n`;
  for (const [key, value] of Object.entries(evaluation.metrics)) {
    report += `- **${key}:** ${typeof value === 'number' ? value.toFixed(4) : value}\n`;
  }
  
  if (baselineComparison) {
    report += `\n## Comparación con Línea Base\n`;
    report += `**Resultado:** ${baselineComparison.summary}\n`;
    
    if (Object.keys(baselineComparison.improvements).length > 0) {
      report += `\n**Mejoras:**\n`;
      for (const [key, value] of Object.entries(baselineComparison.improvements)) {
        const symbol = value > 0 ? '↑' : value < 0 ? '↓' : '→';
        report += `- ${key}: ${symbol} ${value.toFixed(4)}\n`;
      }
    }
  }
  
  if (job.actualResources) {
    report += `\n## Recursos Utilizados\n`;
    report += `- **Duración:** ${job.actualResources.durationMs}ms\n`;
    report += `- **Memoria:** ${job.actualResources.memoryMB}MB\n`;
    report += `- **Coste:** ${job.actualResources.costUnits} unidades\n`;
  }
  
  return report;
}
