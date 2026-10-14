// GAGO OPEN ARTIFACT FACTORY — JOULE VERIFY
// Componente de verificación independiente de resultados.

import type { JouleVerification } from '../../types/joule';
import { generateId } from '../storage';

/**
 * Verifica un resultado mediante un método independiente.
 *
 * Reglas:
 * - La verificación debe ser independiente del generador
 * - No se acepta la declaración del modelo como verificación
 * - Se registran el método y el resultado
 */
export function jouleVerify(
  traceId: string,
  taskId: string,
  method: string,
  passed: boolean,
  details: string,
  verifier: 'automated' | 'human' | 'hybrid' = 'automated'
): JouleVerification {
  return {
    id: generateId(),
    traceId,
    taskId,
    method,
    passed,
    details,
    verifiedAt: new Date().toISOString(),
    verifier,
  };
}

/**
 * Verificación estructural básica.
 * Comprueba que el resultado no sea null/undefined y cumpla un predicado.
 */
export function jouleVerifyStructural<T>(
  traceId: string,
  taskId: string,
  result: T | null | undefined,
  predicate: (value: T) => boolean,
  description: string
): JouleVerification {
  if (result === null || result === undefined) {
    return jouleVerify(
      traceId,
      taskId,
      'structural',
      false,
      `Resultado nulo o indefinido. Esperado: ${description}`,
      'automated'
    );
  }

  const passed = predicate(result);
  return jouleVerify(
    traceId,
    taskId,
    'structural',
    passed,
    passed
      ? `Verificación estructural superada: ${description}`
      : `Verificación estructural fallida: ${description}`,
    'automated'
  );
}

/**
 * Verificación de tipo.
 * Comprueba que el resultado es del tipo esperado.
 */
export function jouleVerifyType(
  traceId: string,
  taskId: string,
  result: unknown,
  expectedType: string
): JouleVerification {
  const actualType = typeof result;
  const passed = actualType === expectedType;

  return jouleVerify(
    traceId,
    taskId,
    'type_check',
    passed,
    passed
      ? `Tipo correcto: ${expectedType}`
      : `Tipo esperado: ${expectedType}, obtenido: ${actualType}`,
    'automated'
  );
}
