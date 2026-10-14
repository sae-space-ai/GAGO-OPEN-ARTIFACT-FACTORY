// GAGO Open Artifact Factory - JOULE MATS Agent 01: Data Curator
// Recopila y prepara datos válidos de entrenamiento

import type { TrainingObservation, TrainingDataset } from '../../../types/joule-mats';
import { generateId } from '../../storage';

export interface DataCuratorResult {
  validObservations: TrainingObservation[];
  removedDuplicates: number;
  removedInconsistent: number;
  removedUnverified: number;
  dataset: TrainingDataset;
}

/**
 * Agente 01: Data Curator
 * Recopila y prepara datos válidos de entrenamiento.
 * Elimina duplicaciones, detecta inconsistencias y distingue información real de sintética.
 */
export function executeDataCurator(
  rawObservations: TrainingObservation[],
  datasetName: string
): DataCuratorResult {
  const validObservations: TrainingObservation[] = [];
  let removedDuplicates = 0;
  let removedInconsistent = 0;
  let removedUnverified = 0;

  const seen = new Set<string>();

  for (const obs of rawObservations) {
    // Eliminar duplicados
    const key = `${obs.taskId}-${obs.routeId}-${obs.timestamp}`;
    if (seen.has(key)) {
      removedDuplicates++;
      continue;
    }
    seen.add(key);

    // Validar consistencia
    if (!validateObservation(obs)) {
      removedInconsistent++;
      continue;
    }

    // Separar verificados de no verificados
    if (obs.result === 'unverified') {
      removedUnverified++;
      continue;
    }

    validObservations.push(obs);
  }

  const realCount = validObservations.filter(o => !o.isSynthetic).length;
  const syntheticCount = validObservations.filter(o => o.isSynthetic).length;

  const dataset: TrainingDataset = {
    id: generateId(),
    name: datasetName,
    version: '1.0.0',
    description: `Dataset curado con ${validObservations.length} observaciones válidas`,
    observationCount: validObservations.length,
    syntheticCount,
    realCount,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: realCount > 0 && syntheticCount > 0 ? 'mixed' : realCount > 0 ? 'real' : 'synthetic',
    validated: true
  };

  return {
    validObservations,
    removedDuplicates,
    removedInconsistent,
    removedUnverified,
    dataset
  };
}

function validateObservation(obs: TrainingObservation): boolean {
  // Validar campos requeridos
  if (!obs.taskId || !obs.routeId || !obs.timestamp) {
    return false;
  }

  // Validar valores numéricos
  if (obs.durationMs < 0 || obs.costUnits < 0) {
    return false;
  }

  // Validar routeInfo
  if (!obs.routeInfo || 
      obs.routeInfo.availability < 0 || 
      obs.routeInfo.quality < 0 || 
      obs.routeInfo.latencyMs < 0) {
    return false;
  }

  // Validar resultado
  if (!['success', 'failure', 'unverified'].includes(obs.result)) {
    return false;
  }

  return true;
}
