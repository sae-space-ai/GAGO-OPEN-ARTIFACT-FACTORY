// GAGO OPEN ARTIFACT FACTORY — JOULE EXECUTE
// Componente de ejecución dentro de los permisos autorizados.

import type { JouleRoute, JouleResourcePolicy } from '../../types/joule';
import { jouleObserveAsync, jouleObserveSync } from './observe';
import type { JouleMeasurement } from '../../types/joule';

/**
 * Adaptador de ejecución.
 * Cada ruta puede tener un adaptador específico.
 */
export interface JouleExecutor<TInput, TOutput> {
  routeId: string;
  execute: (input: TInput, route: JouleRoute) => Promise<TOutput>;
  verify?: (output: TOutput) => boolean;
}

/**
 * Ejecuta una operación usando la ruta seleccionada.
 *
 * Reglas:
 * - Solo ejecuta si la ruta está autorizada
 * - Registra mediciones reales
 * - No ejecuta operaciones no idempotentes sin control
 * - Respeta límites de reintentos
 */
export async function jouleExecute<TInput, TOutput>(
  taskId: string,
  route: JouleRoute,
  executor: JouleExecutor<TInput, TOutput>,
  input: TInput,
  policy: JouleResourcePolicy,
  maxRetries?: number
): Promise<{ output: TOutput | null; measurements: JouleMeasurement[]; success: boolean }> {
  const measurements: JouleMeasurement[] = [];
  const retries = maxRetries ?? Math.min(policy.limits.maxRetriesPerOp, route.constraints.idempotent ? 2 : 0);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const { result, measurement } = await jouleObserveAsync(
      taskId,
      route.id,
      'other', // Categoría se determina en el perfil
      () => executor.execute(input, route),
      {
        verify: executor.verify,
      }
    );

    measurements.push(measurement);

    if (measurement.success && measurement.verified) {
      return { output: result, measurements, success: true };
    }

    if (!measurement.success) {
      lastError = new Error(measurement.errorMessage);
      // No reintentar si la operación no es idempotente
      if (!route.constraints.idempotent && attempt > 0) {
        break;
      }
    }
  }

  return {
    output: null,
    measurements,
    success: false,
  };
}

/**
 * Ejecuta una operación síncrona.
 */
export function jouleExecuteSync<TInput, TOutput>(
  taskId: string,
  route: JouleRoute,
  executor: (input: TInput) => TOutput,
  input: TInput,
  verify?: (output: TOutput) => boolean
): { output: TOutput | null; measurement: JouleMeasurement; success: boolean } {
  const { result, measurement } = jouleObserveSync(
    taskId,
    route.id,
    'other',
    () => executor(input),
    { verify }
  );

  return {
    output: result,
    measurement,
    success: measurement.success && measurement.verified,
  };
}
