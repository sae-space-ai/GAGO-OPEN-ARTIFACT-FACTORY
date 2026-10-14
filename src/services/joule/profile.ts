// GAGO OPEN ARTIFACT FACTORY — JOULE PROFILE
// Componente de clasificación de operaciones.

import type {
  JouleTaskProfile,
  JouleCategory,
  JoulePriority,
  JouleRiskLevel,
  JouleDataSensitivity,
} from '../../types/joule';
import { generateId } from '../storage';

/**
 * Entrada para clasificar una operación.
 */
export interface ProfileInput {
  category: JouleCategory;
  description: string;
  dataSensitivity?: JouleDataSensitivity;
  requiresVerification?: boolean;
  estimatedDurationMs?: number;
  estimatedBytes?: number;
  estimatedCostUnits?: number;
}

/**
 * Clasifica una operación y produce un perfil de tarea.
 *
 * Reglas de clasificación:
 * - Operaciones con datos confidenciales/restringidos → riesgo alto
 * - Operaciones críticas → requieren verificación
 * - Operaciones de IA → riesgo medio-alto
 * - Operaciones locales → riesgo bajo
 */
export function jouleProfileTask(input: ProfileInput): JouleTaskProfile {
  const traceId = generateId();

  // Determinar prioridad por defecto según categoría
  const defaultPriority = inferPriority(input.category);

  // Determinar nivel de riesgo
  const riskLevel = inferRiskLevel(input.category, input.dataSensitivity);

  // Determinar sensibilidad de datos
  const dataSensitivity = input.dataSensitivity ?? inferSensitivity(input.category);

  // Determinar si requiere verificación
  const requiresVerification = input.requiresVerification ?? inferVerification(input.category, riskLevel);

  // Recursos estimados (conservadores si no se proporcionan)
  const estimatedResources = {
    durationMs: input.estimatedDurationMs ?? estimateDuration(input.category),
    bytes: input.estimatedBytes ?? estimateBytes(input.category),
    costUnits: input.estimatedCostUnits ?? estimateCost(input.category),
  };

  return {
    id: generateId(),
    category: input.category,
    priority: defaultPriority,
    riskLevel,
    dataSensitivity,
    budget: {
      maxDurationMs: estimatedResources.durationMs * 3, // 3x margen
      maxCostUnits: estimatedResources.costUnits * 2, // 2x margen
      maxRetries: riskLevel === 'critical' ? 0 : 2,
    },
    qualityCriterion: {
      minSuccessRate: riskLevel === 'critical' ? 0.99 : 0.95,
      requiresVerification,
    },
    estimatedResources,
    traceId,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Infiere la prioridad por defecto según la categoría.
 */
function inferPriority(category: JouleCategory): JoulePriority {
  switch (category) {
    case 'ai_request':
    case 'artifact_generation':
      return 'high';
    case 'test_execution':
    case 'compilation':
      return 'medium';
    case 'ui_render':
    case 'storage_read':
    case 'storage_write':
    case 'network_request':
    case 'data_processing':
    case 'document_analysis':
    case 'other':
      return 'medium';
  }
}

/**
 * Infiere el nivel de riesgo según categoría y sensibilidad.
 */
function inferRiskLevel(category: JouleCategory, sensitivity?: JouleDataSensitivity): JouleRiskLevel {
  // Datos sensibles elevan el riesgo
  if (sensitivity === 'restricted') return 'critical';
  if (sensitivity === 'confidential') return 'high';

  switch (category) {
    case 'ai_request':
      return 'medium'; // Requiere verificación pero no es crítico
    case 'artifact_generation':
      return 'medium';
    case 'test_execution':
    case 'compilation':
      return 'low';
    case 'ui_render':
    case 'storage_read':
    case 'storage_write':
    case 'network_request':
    case 'data_processing':
    case 'document_analysis':
    case 'other':
      return 'low';
  }
}

/**
 * Infiere la sensibilidad de datos por defecto según la categoría.
 */
function inferSensitivity(category: JouleCategory): JouleDataSensitivity {
  switch (category) {
    case 'ai_request':
      return 'internal'; // Podría contener código sensible
    case 'storage_read':
    case 'storage_write':
      return 'internal'; // Datos locales
    case 'ui_render':
    case 'test_execution':
    case 'compilation':
    case 'network_request':
    case 'data_processing':
    case 'document_analysis':
    case 'artifact_generation':
    case 'other':
      return 'public';
  }
}

/**
 * Infiere si la operación requiere verificación.
 */
function inferVerification(category: JouleCategory, riskLevel: JouleRiskLevel): boolean {
  // Operaciones de alto riesgo o críticas siempre requieren verificación
  if (riskLevel === 'high' || riskLevel === 'critical') return true;

  switch (category) {
    case 'ai_request':
    case 'artifact_generation':
      return true; // Resultados deben verificarse
    case 'test_execution':
    case 'compilation':
      return true; // Resultados deben validarse
    case 'ui_render':
    case 'storage_read':
    case 'storage_write':
    case 'network_request':
    case 'data_processing':
    case 'document_analysis':
    case 'other':
      return false;
  }
}

/**
 * Estima la duración por defecto según la categoría (ms).
 */
function estimateDuration(category: JouleCategory): number {
  switch (category) {
    case 'ui_render':
      return 16; // 1 frame a 60fps
    case 'storage_read':
      return 5;
    case 'storage_write':
      return 10;
    case 'artifact_generation':
      return 1000;
    case 'test_execution':
      return 500;
    case 'document_analysis':
      return 200;
    case 'ai_request':
      return 5000; // Estimación conservadora
    case 'data_processing':
      return 100;
    case 'network_request':
      return 500;
    case 'compilation':
      return 3000;
    case 'other':
      return 100;
  }
}

/**
 * Estima los bytes por defecto según la categoría.
 */
function estimateBytes(category: JouleCategory): number {
  switch (category) {
    case 'ui_render':
      return 0;
    case 'storage_read':
    case 'storage_write':
      return 1024; // 1 KB
    case 'artifact_generation':
      return 10240; // 10 KB
    case 'test_execution':
      return 512;
    case 'document_analysis':
      return 2048;
    case 'ai_request':
      return 4096;
    case 'data_processing':
      return 1024;
    case 'network_request':
      return 2048;
    case 'compilation':
      return 51200; // 50 KB
    case 'other':
      return 1024;
  }
}

/**
 * Estima el coste en unidades abstractas por defecto.
 */
function estimateCost(category: JouleCategory): number {
  switch (category) {
    case 'ui_render':
    case 'storage_read':
    case 'storage_write':
      return 0; // Operaciones locales sin coste monetario
    case 'artifact_generation':
      return 10;
    case 'test_execution':
      return 5;
    case 'document_analysis':
      return 2;
    case 'ai_request':
      return 100; // Estimación conservadora
    case 'data_processing':
      return 1;
    case 'network_request':
      return 1;
    case 'compilation':
      return 0; // Compilación local
    case 'other':
      return 1;
  }
}
