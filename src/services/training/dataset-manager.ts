// GAGO Open Artifact Factory - Training Dataset Manager
// Phase 9: JOULE FREE TRAINING CENTER

import type { TrainingDataset } from '../../types/training';
import { generateId } from '../storage';

/**
 * Valida un dataset de entrenamiento
 */
export function validateDataset(
  dataset: Partial<TrainingDataset>,
  maxSizeMB: number = 5
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validar nombre
  if (!dataset.name || dataset.name.trim().length === 0) {
    errors.push('El nombre del dataset es obligatorio');
  }

  // Validar tamaño
  if (dataset.size === undefined || dataset.size <= 0) {
    errors.push('El tamaño del dataset debe ser mayor que cero');
  }

  // Validar límite de tamaño
  const sizeMB = (dataset.size || 0) / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    errors.push(`El tamaño del dataset (${sizeMB.toFixed(2)} MB) excede el límite de ${maxSizeMB} MB`);
  }

  // Validar formato
  if (!dataset.format || dataset.format.trim().length === 0) {
    errors.push('El formato del dataset es obligatorio');
  }

  // Validar formatos soportados
  const supportedFormats = ['json', 'csv', 'parquet', 'ndjson'];
  if (dataset.format && !supportedFormats.includes(dataset.format.toLowerCase())) {
    errors.push(`Formato no soportado: ${dataset.format}. Formatos soportados: ${supportedFormats.join(', ')}`);
  }

  // Validar propietario
  if (!dataset.ownerId || dataset.ownerId.trim().length === 0) {
    errors.push('El propietario del dataset es obligatorio');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Crea un nuevo dataset de entrenamiento
 */
export function createTrainingDataset(
  name: string,
  description: string,
  data: any[],
  format: string,
  ownerId: string,
  isSynthetic: boolean = false
): TrainingDataset {
  const jsonString = JSON.stringify(data);
  const size = new Blob([jsonString]).size;

  return {
    id: generateId(),
    name,
    version: '1.0.0',
    description,
    size,
    format,
    isSynthetic,
    ownerId,
    validated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Genera un dataset sintético para pruebas
 */
export function generateSyntheticDataset(
  numExamples: number,
  features: string[],
  labels: string[]
): any[] {
  const dataset: any[] = [];

  for (let i = 0; i < numExamples; i++) {
    const example: any = { id: `example-${i}` };
    
    // Generar características aleatorias
    for (const feature of features) {
      example[feature] = Math.random();
    }
    
    // Asignar etiqueta aleatoria
    example.label = labels[Math.floor(Math.random() * labels.length)];
    
    dataset.push(example);
  }

  return dataset;
}

/**
 * Valida la estructura de un dataset
 */
export function validateDatasetStructure(
  dataset: any[],
  requiredFields: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!Array.isArray(dataset)) {
    errors.push('El dataset debe ser un array');
    return { valid: false, errors };
  }

  if (dataset.length === 0) {
    errors.push('El dataset está vacío');
    return { valid: false, errors };
  }

  // Validar que todos los ejemplos tengan los campos requeridos
  for (let i = 0; i < dataset.length; i++) {
    const example = dataset[i];
    
    for (const field of requiredFields) {
      if (!(field in example)) {
        errors.push(`Ejemplo ${i} falta el campo requerido: ${field}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Calcula estadísticas de un dataset
 */
export function getDatasetStatistics(dataset: any[]): {
  count: number;
  fields: string[];
  sizeBytes: number;
  sizeMB: number;
} {
  const fields = dataset.length > 0 ? Object.keys(dataset[0]) : [];
  const jsonString = JSON.stringify(dataset);
  const sizeBytes = new Blob([jsonString]).size;

  return {
    count: dataset.length,
    fields,
    sizeBytes,
    sizeMB: sizeBytes / (1024 * 1024)
  };
}

/**
 * Divide un dataset en conjuntos de entrenamiento y prueba
 */
export function splitDataset(
  dataset: any[],
  trainRatio: number = 0.8
): { train: any[]; test: any[] } {
  const shuffled = [...dataset].sort(() => Math.random() - 0.5);
  const splitIndex = Math.floor(shuffled.length * trainRatio);
  
  return {
    train: shuffled.slice(0, splitIndex),
    test: shuffled.slice(splitIndex)
  };
}

/**
 * Marca un dataset como validado
 */
export function markDatasetAsValidated(dataset: TrainingDataset): TrainingDataset {
  return {
    ...dataset,
    validated: true,
    updatedAt: new Date().toISOString()
  };
}
