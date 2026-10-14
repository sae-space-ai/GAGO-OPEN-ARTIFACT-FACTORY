// GAGO Open Artifact Factory - JOULE MATS Training Orchestrator
// Fase 4: Orquestador central del sistema multiagente

import type { 
  JouleMATSState, 
  JouleAgent, 
  AgentId, 
  TrainingCycle,
  TrainingObservation,
  TrainingPolicy,
  TrainingDataset
} from '../../types/joule-mats';
import { generateId } from '../storage';
import { executeDataCurator } from './agents/agent-01-data-curator';
import {
  executeTelemetryAnalyst,
  executeTaskClassifier,
  executeSyntheticLab,
  executeLabelingAndEvidence,
  executeFeatureEngineer,
  executeBaselineScientist,
  executePolicyTrainer,
  executeCostOptimizer,
  executeLatencyOptimizer,
  executeEnergyOptimizer,
  executeQualityAndReliability,
  executeAdversarialTrainer,
  executeIndependentEvaluator,
  executeTrainingGovernor
} from './agents/agents-02-15';

/**
 * Inicializa el estado de JOULE MATS con los 15 agentes
 */
export function initializeJouleMATS(): JouleMATSState {
  const agents: Record<AgentId, JouleAgent> = {
    'agent-01-data-curator': {
      id: 'agent-01-data-curator',
      name: 'Data Curator',
      specialty: 'Recolección y preparación de datos',
      description: 'Recopila y prepara datos válidos de entrenamiento. Elimina duplicaciones, detecta inconsistencias y distingue información real de sintética.',
      capabilities: ['data_collection', 'data_validation'],
      dependencies: [],
      status: 'idle',
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      blockedReasons: [],
      permissions: ['read_observations', 'write_datasets'],
      inputs: ['raw_observations'],
      outputs: ['curated_dataset'],
      evidenceIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'agent-02-telemetry-analyst': {
      id: 'agent-02-telemetry-analyst',
      name: 'Telemetry Analyst',
      specialty: 'Análisis de telemetría',
      description: 'Analiza tiempos de ejecución, llamadas de red, almacenamiento, compilaciones, errores y recursos observables.',
      capabilities: ['telemetry_analysis'],
      dependencies: ['agent-01-data-curator'],
      status: 'idle',
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      blockedReasons: [],
      permissions: ['read_datasets'],
      inputs: ['curated_dataset'],
      outputs: ['telemetry_analysis'],
      evidenceIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'agent-03-task-classifier': {
      id: 'agent-03-task-classifier',
      name: 'Task Classifier',
      specialty: 'Clasificación de tareas',
      description: 'Clasifica operaciones por complejidad, prioridad, riesgo, privacidad y recursos necesarios.',
      capabilities: ['task_classification'],
      dependencies: ['agent-01-data-curator'],
      status: 'idle',
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      blockedReasons: [],
      permissions: ['read_datasets'],
      inputs: ['curated_dataset'],
      outputs: ['task_classifications'],
      evidenceIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'agent-04-synthetic-lab': {
      id: 'agent-04-synthetic-lab',
      name: 'Synthetic Lab',
      specialty: 'Generación de datos sintéticos',
      description: 'Genera escenarios sintéticos reproducibles para entrenamiento y pruebas.',
      capabilities: ['synthetic_generation'],
      dependencies: ['agent-01-data-curator'],
      status: 'idle',
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      blockedReasons: [],
      permissions: ['read_datasets', 'write_synthetic'],
      inputs: ['curated_dataset'],
      outputs: ['synthetic_observations'],
      evidenceIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'agent-05-labeling-evidence': {
      id: 'agent-05-labeling-evidence',
      name: 'Labeling and Evidence',
      specialty: 'Etiquetado y validación',
      description: 'Comprueba la calidad de las etiquetas de entrenamiento. Separa resultados correctos, incorrectos y no verificados.',
      capabilities: ['labeling'],
      dependencies: ['agent-01-data-curator'],
      status: 'idle',
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      blockedReasons: [],
      permissions: ['read_datasets'],
      inputs: ['curated_dataset'],
      outputs: ['labeled_dataset'],
      evidenceIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'agent-06-feature-engineer': {
      id: 'agent-06-feature-engineer',
      name: 'Feature Engineer',
      specialty: 'Ingeniería de características',
      description: 'Transforma los perfiles de ejecución en características numéricas y categóricas.',
      capabilities: ['feature_engineering'],
      dependencies: ['agent-01-data-curator'],
      status: 'idle',
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      blockedReasons: [],
      permissions: ['read_datasets'],
      inputs: ['curated_dataset'],
      outputs: ['feature_vectors'],
      evidenceIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'agent-07-baseline-scientist': {
      id: 'agent-07-baseline-scientist',
      name: 'Baseline Scientist',
      specialty: 'Establecimiento de línea base',
      description: 'Establece la política de referencia y recopila sus resultados.',
      capabilities: ['baseline_establishment'],
      dependencies: ['agent-01-data-curator'],
      status: 'idle',
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      blockedReasons: [],
      permissions: ['read_datasets', 'write_policies'],
      inputs: ['curated_dataset'],
      outputs: ['baseline_policy', 'baseline_metrics'],
      evidenceIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'agent-08-policy-trainer': {
      id: 'agent-08-policy-trainer',
      name: 'Policy Trainer',
      specialty: 'Entrenamiento de políticas',
      description: 'Entrena las políticas candidatas de JOULE mediante algoritmos ligeros.',
      capabilities: ['policy_training'],
      dependencies: ['agent-06-feature-engineer', 'agent-07-baseline-scientist'],
      status: 'idle',
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      blockedReasons: [],
      permissions: ['read_features', 'write_policies'],
      inputs: ['feature_vectors', 'baseline_metrics'],
      outputs: ['candidate_policies'],
      evidenceIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'agent-09-cost-optimizer': {
      id: 'agent-09-cost-optimizer',
      name: 'Cost Optimizer',
      specialty: 'Optimización de costes',
      description: 'Busca reducir costes de ejecución, solicitudes redundantes y uso innecesario de proveedores.',
      capabilities: ['cost_optimization'],
      dependencies: ['agent-08-policy-trainer'],
      status: 'idle',
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      blockedReasons: [],
      permissions: ['read_policies', 'read_datasets'],
      inputs: ['candidate_policies', 'curated_dataset'],
      outputs: ['cost_optimization_results'],
      evidenceIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'agent-10-latency-optimizer': {
      id: 'agent-10-latency-optimizer',
      name: 'Latency Optimizer',
      specialty: 'Optimización de latencia',
      description: 'Analiza tiempos de respuesta y propone mejoras sin comprometer la fiabilidad.',
      capabilities: ['latency_optimization'],
      dependencies: ['agent-08-policy-trainer'],
      status: 'idle',
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      blockedReasons: [],
      permissions: ['read_policies', 'read_datasets'],
      inputs: ['candidate_policies', 'curated_dataset'],
      outputs: ['latency_optimization_results'],
      evidenceIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'agent-11-energy-optimizer': {
      id: 'agent-11-energy-optimizer',
      name: 'Energy Optimizer',
      specialty: 'Optimización energética',
      description: 'Estudia eficiencia energética mediante datos válidos.',
      capabilities: ['energy_optimization'],
      dependencies: ['agent-08-policy-trainer'],
      status: 'idle',
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      blockedReasons: [],
      permissions: ['read_policies', 'read_datasets'],
      inputs: ['candidate_policies', 'curated_dataset'],
      outputs: ['energy_optimization_results'],
      evidenceIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'agent-12-quality-reliability': {
      id: 'agent-12-quality-reliability',
      name: 'Quality and Reliability',
      specialty: 'Evaluación de calidad',
      description: 'Evalúa tasas de éxito, errores, estabilidad y calidad.',
      capabilities: ['quality_evaluation'],
      dependencies: ['agent-08-policy-trainer'],
      status: 'idle',
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      blockedReasons: [],
      permissions: ['read_policies', 'read_datasets'],
      inputs: ['candidate_policies', 'curated_dataset'],
      outputs: ['quality_evaluation'],
      evidenceIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'agent-13-adversarial-trainer': {
      id: 'agent-13-adversarial-trainer',
      name: 'Adversarial Trainer',
      specialty: 'Pruebas adversariales',
      description: 'Somete las políticas a escenarios controlados de fallos y restricciones críticas.',
      capabilities: ['adversarial_testing'],
      dependencies: ['agent-08-policy-trainer'],
      status: 'idle',
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      blockedReasons: [],
      permissions: ['read_policies', 'read_datasets'],
      inputs: ['candidate_policies', 'curated_dataset'],
      outputs: ['adversarial_results'],
      evidenceIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'agent-14-independent-evaluator': {
      id: 'agent-14-independent-evaluator',
      name: 'Independent Evaluator',
      specialty: 'Evaluación independiente',
      description: 'Evalúa las políticas utilizando conjuntos separados de los empleados para entrenarlas.',
      capabilities: ['independent_evaluation'],
      dependencies: ['agent-08-policy-trainer', 'agent-07-baseline-scientist'],
      status: 'idle',
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      blockedReasons: [],
      permissions: ['read_policies', 'read_datasets', 'write_evaluations'],
      inputs: ['candidate_policies', 'baseline_metrics', 'evaluation_dataset'],
      outputs: ['independent_evaluation'],
      evidenceIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    'agent-15-training-governor': {
      id: 'agent-15-training-governor',
      name: 'Training Governor',
      specialty: 'Gobernanza del entrenamiento',
      description: 'Coordina los agentes, controla presupuestos, dependencias y cancelaciones.',
      capabilities: ['coordination'],
      dependencies: [],
      status: 'idle',
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      blockedReasons: [],
      permissions: ['read_all', 'write_governance'],
      inputs: ['all_agent_statuses', 'budget_info'],
      outputs: ['governance_decisions'],
      evidenceIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };

  return {
    agents,
    datasets: [],
    observations: [],
    policies: [],
    trainingCycles: [],
    driftDetections: [],
    shadowMode: true,
    canaryPercentage: 0,
    version: '4.0.0'
  };
}

/**
 * Ejecuta un ciclo completo de entrenamiento con los 15 agentes
 */
export async function executeTrainingCycle(
  state: JouleMATSState,
  rawObservations: TrainingObservation[],
  cycleName: string
): Promise<{
  newState: JouleMATSState;
  cycle: TrainingCycle;
  success: boolean;
  errors: string[];
}> {
  const errors: string[] = [];
  const cycle: TrainingCycle = {
    id: generateId(),
    name: cycleName,
    status: 'running',
    startedAt: new Date().toISOString(),
    datasetId: '',
    policiesGenerated: [],
    agentExecutions: [],
    metrics: {
      totalCost: 0,
      averageCostPerResult: 0,
      improvementOverBaseline: 0,
      qualityMaintained: false
    },
    createdAt: new Date().toISOString()
  };

  let currentState = { ...state };

  try {
    // Agente 01: Data Curator
    updateAgentStatus(currentState, 'agent-01-data-curator', 'running');
    const curatorResult = executeDataCurator(rawObservations, `dataset-${cycleName}`);
    updateAgentStatus(currentState, 'agent-01-data-curator', 'completed');
    currentState.datasets.push(curatorResult.dataset);
    cycle.datasetId = curatorResult.dataset.id;

    // Agente 02: Telemetry Analyst
    updateAgentStatus(currentState, 'agent-02-telemetry-analyst', 'running');
    const telemetryResult = executeTelemetryAnalyst(curatorResult.validObservations);
    updateAgentStatus(currentState, 'agent-02-telemetry-analyst', 'completed');

    // Agente 03: Task Classifier
    updateAgentStatus(currentState, 'agent-03-task-classifier', 'running');
    const classifications = executeTaskClassifier(curatorResult.validObservations);
    updateAgentStatus(currentState, 'agent-03-task-classifier', 'completed');

    // Agente 04: Synthetic Lab
    updateAgentStatus(currentState, 'agent-04-synthetic-lab', 'running');
    const syntheticObs = executeSyntheticLab(curatorResult.validObservations, 50);
    updateAgentStatus(currentState, 'agent-04-synthetic-lab', 'completed');

    // Agente 05: Labeling and Evidence
    updateAgentStatus(currentState, 'agent-05-labeling-evidence', 'running');
    const labeledDataset = executeLabelingAndEvidence(curatorResult.validObservations);
    updateAgentStatus(currentState, 'agent-05-labeling-evidence', 'completed');

    // Agente 06: Feature Engineer
    updateAgentStatus(currentState, 'agent-06-feature-engineer', 'running');
    const featureVectors = executeFeatureEngineer(labeledDataset.correct);
    updateAgentStatus(currentState, 'agent-06-feature-engineer', 'completed');

    // Agente 07: Baseline Scientist
    updateAgentStatus(currentState, 'agent-07-baseline-scientist', 'running');
    const baselineMetrics = executeBaselineScientist(curatorResult.validObservations);
    updateAgentStatus(currentState, 'agent-07-baseline-scientist', 'completed');

    // Agente 08: Policy Trainer
    updateAgentStatus(currentState, 'agent-08-policy-trainer', 'running');
    const candidatePolicy = executePolicyTrainer(featureVectors, `policy-${cycleName}`);
    updateAgentStatus(currentState, 'agent-08-policy-trainer', 'completed');
    currentState.policies.push(candidatePolicy);
    cycle.policiesGenerated.push(candidatePolicy.id);

    // Agentes 09-12: Optimizadores
    updateAgentStatus(currentState, 'agent-09-cost-optimizer', 'running');
    const costResult = executeCostOptimizer(curatorResult.validObservations, candidatePolicy);
    updateAgentStatus(currentState, 'agent-09-cost-optimizer', 'completed');

    updateAgentStatus(currentState, 'agent-10-latency-optimizer', 'running');
    const latencyResult = executeLatencyOptimizer(curatorResult.validObservations);
    updateAgentStatus(currentState, 'agent-10-latency-optimizer', 'completed');

    updateAgentStatus(currentState, 'agent-11-energy-optimizer', 'running');
    const energyResult = executeEnergyOptimizer(curatorResult.validObservations);
    updateAgentStatus(currentState, 'agent-11-energy-optimizer', 'completed');

    updateAgentStatus(currentState, 'agent-12-quality-reliability', 'running');
    const qualityResult = executeQualityAndReliability(curatorResult.validObservations);
    updateAgentStatus(currentState, 'agent-12-quality-reliability', 'completed');

    // Agente 13: Adversarial Trainer
    updateAgentStatus(currentState, 'agent-13-adversarial-trainer', 'running');
    const adversarialResult = executeAdversarialTrainer(curatorResult.validObservations, candidatePolicy);
    updateAgentStatus(currentState, 'agent-13-adversarial-trainer', 'completed');

    // Agente 14: Independent Evaluator
    updateAgentStatus(currentState, 'agent-14-independent-evaluator', 'running');
    const evaluation = executeIndependentEvaluator(
      candidatePolicy,
      baselineMetrics,
      curatorResult.validObservations.slice(0, Math.floor(curatorResult.validObservations.length * 0.2))
    );
    updateAgentStatus(currentState, 'agent-14-independent-evaluator', 'completed');

    if (evaluation.recommendation === 'approve') {
      candidatePolicy.status = 'validated';
    } else if (evaluation.recommendation === 'reject') {
      candidatePolicy.status = 'rejected';
    }

    // Agente 15: Training Governor
    updateAgentStatus(currentState, 'agent-15-training-governor', 'running');
    const agentStatuses = Object.fromEntries(
      Object.entries(currentState.agents).map(([id, agent]) => [id as AgentId, agent.status])
    );
    const governance = executeTrainingGovernor(1000, 100, agentStatuses);
    updateAgentStatus(currentState, 'agent-15-training-governor', 'completed');

    if (!governance.canProceed) {
      errors.push(...governance.blockedReasons);
    }

    cycle.status = errors.length > 0 ? 'failed' : 'completed';
    cycle.completedAt = new Date().toISOString();
    cycle.bestPolicyId = evaluation.recommendation === 'approve' ? candidatePolicy.id : undefined;
    cycle.metrics = {
      totalCost: costResult.optimizedCost,
      averageCostPerResult: costResult.optimizedCost / curatorResult.validObservations.length,
      improvementOverBaseline: costResult.savingsPercent,
      qualityMaintained: qualityResult.successRate >= 0.9
    };

    return {
      newState: currentState,
      cycle,
      success: errors.length === 0,
      errors
    };

  } catch (error) {
    cycle.status = 'failed';
    cycle.completedAt = new Date().toISOString();
    errors.push(error instanceof Error ? error.message : 'Error desconocido');
    
    return {
      newState: currentState,
      cycle,
      success: false,
      errors
    };
  }
}

function updateAgentStatus(state: JouleMATSState, agentId: AgentId, status: 'idle' | 'running' | 'completed' | 'failed') {
  const agent = state.agents[agentId];
  if (agent) {
    agent.status = status;
    agent.lastExecution = new Date().toISOString();
    agent.updatedAt = new Date().toISOString();
    
    if (status === 'completed') {
      agent.executionCount++;
      agent.successCount++;
    } else if (status === 'failed') {
      agent.executionCount++;
      agent.failureCount++;
    }
  }
}
