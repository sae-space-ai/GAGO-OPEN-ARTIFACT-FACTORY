// GAGO OPEN ARTIFACT FACTORY — JOULE OBSERVE
// Componente de medición de operaciones reales.

import type { JouleMeasurement, JouleCategory } from '../../types/joule';
import { generateId } from '../storage';

/**
 * Contexto de inicio de una operación.
 */
export interface ObserveContext {
  traceId: string;
  taskId: string;
  routeId: string;
  category: JouleCategory;
  startedAt: number; // timestamp en ms
}

/**
 * Inicia la observación de una operación.
 */
export function jouleObserveStart(
  taskId: string,
  routeId: string,
  category: JouleCategory
): ObserveContext {
  return {
    traceId: generateId(),
    taskId,
    routeId,
    category,
    startedAt: performance.now(),
  };
}

/**
 * Finaliza la observación y produce una medición.
 *
 * NOTA: Solo registra valores observables reales.
 * - durationMs: medido con performance.now()
 * - bytesTransferred: proporcionado por el caller (0 si no aplica)
 * - costUnits: proporcionado por el caller (0 si no aplica)
 * - monetaryCost: proporcionado por el caller (0 si no aplica)
 * - energyMj: solo si hay medición directa válida
 */
export function jouleObserveEnd(
  ctx: ObserveContext,
  options: {
    bytesTransferred?: number;
    costUnits?: number;
    monetaryCost?: number;
    energyMj?: number;
    success: boolean;
    verified: boolean;
    errorMessage?: string;
  }
): JouleMeasurement {
  const durationMs = performance.now() - ctx.startedAt;

  return {
    id: generateId(),
    traceId: ctx.traceId,
    taskId: ctx.taskId,
    routeId: ctx.routeId,
    category: ctx.category,
    startedAt: new Date(Date.now() - durationMs).toISOString(),
    completedAt: new Date().toISOString(),
    durationMs,
    bytesTransferred: options.bytesTransferred ?? 0,
    costUnits: options.costUnits ?? 0,
    monetaryCost: options.monetaryCost ?? 0,
    energyMj: options.energyMj, // undefined si no hay medición directa
    success: options.success,
    verified: options.verified,
    errorMessage: options.errorMessage,
    source: 'observed',
  };
}

/**
 * Observa una operación síncrona.
 * Devuelve el resultado y la medición.
 */
export function jouleObserveSync<T>(
  taskId: string,
  routeId: string,
  category: JouleCategory,
  fn: () => T,
  options: {
    bytesTransferred?: number;
    costUnits?: number;
    monetaryCost?: number;
    energyMj?: number;
    verify?: (result: T) => boolean;
  } = {}
): { result: T; measurement: JouleMeasurement } {
  const ctx = jouleObserveStart(taskId, routeId, category);
  let result: T;
  let success = true;
  let verified = true;
  let errorMessage: string | undefined;

  try {
    result = fn();
    if (options.verify) {
      verified = options.verify(result);
    }
  } catch (err) {
    success = false;
    verified = false;
    errorMessage = err instanceof Error ? err.message : String(err);
    result = undefined as T;
  }

  const measurement = jouleObserveEnd(ctx, {
    bytesTransferred: options.bytesTransferred,
    costUnits: options.costUnits,
    monetaryCost: options.monetaryCost,
    energyMj: options.energyMj,
    success,
    verified,
    errorMessage,
  });

  return { result, measurement };
}

/**
 * Observa una operación asíncrona.
 * Devuelve el resultado y la medición.
 */
export async function jouleObserveAsync<T>(
  taskId: string,
  routeId: string,
  category: JouleCategory,
  fn: () => Promise<T>,
  options: {
    bytesTransferred?: number;
    costUnits?: number;
    monetaryCost?: number;
    energyMj?: number;
    verify?: (result: T) => boolean;
  } = {}
): Promise<{ result: T | null; measurement: JouleMeasurement }> {
  const ctx = jouleObserveStart(taskId, routeId, category);
  let result: T | null = null;
  let success = true;
  let verified = true;
  let errorMessage: string | undefined;

  try {
    result = await fn();
    if (options.verify) {
      verified = options.verify(result);
    }
  } catch (err) {
    success = false;
    verified = false;
    errorMessage = err instanceof Error ? err.message : String(err);
  }

  const measurement = jouleObserveEnd(ctx, {
    bytesTransferred: options.bytesTransferred,
    costUnits: options.costUnits,
    monetaryCost: options.monetaryCost,
    energyMj: options.energyMj,
    success,
    verified,
    errorMessage,
  });

  return { result, measurement };
}

/**
 * Observa el rendimiento del navegador usando Performance API.
 * Solo devuelve métricas disponibles. No inventa valores.
 */
export function jouleObserveBrowserPerformance(): Record<string, number | undefined> {
  if (typeof performance === 'undefined') {
    return {};
  }

  const metrics: Record<string, number | undefined> = {};

  // Navigation timing
  if (performance.timing) {
    const timing = performance.timing;
    metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
    metrics.loadComplete = timing.loadEventEnd - timing.navigationStart;
  }

  // Memory (solo si está disponible)
  const perfMemory = (performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory;
  if (perfMemory) {
    metrics.usedJSHeapBytes = perfMemory.usedJSHeapSize;
    metrics.totalJSHeapBytes = perfMemory.totalJSHeapSize;
  }

  return metrics;
}
