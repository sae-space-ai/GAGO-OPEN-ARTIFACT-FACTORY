// GAGO OPEN ARTIFACT FACTORY - Quota and Budget Manager
// Fase 2 - Universal API Fabric
// Gestiona cuotas de uso y presupuestos monetarios

import type { QuotaUsage, Connector, ConnectorCapability } from '../../types/api-fabric';
import { ZERO_COST_POLICY, canExecuteOperation } from './free-tier-policy';

export interface QuotaCheck {
  allowed: boolean;
  reason?: string;
  remainingRequests?: number;
  resetAt?: string;
}

/**
 * Registra el uso de una capacidad.
 */
export function recordQuotaUsage(
  quotaUsage: Record<string, QuotaUsage>,
  connectorId: string,
  capabilityId: string
): Record<string, QuotaUsage> {
  const key = `${connectorId}::${capabilityId}`;
  const existing = quotaUsage[key];

  const updated: QuotaUsage = {
    connectorId,
    capabilityId,
    requestsMade: (existing?.requestsMade || 0) + 1,
    requestsLimit: existing?.requestsLimit,
    period: existing?.period || 'unknown',
    resetAt: existing?.resetAt,
    lastUpdated: new Date().toISOString(),
  };

  return {
    ...quotaUsage,
    [key]: updated,
  };
}

/**
 * Verifica si una operación está dentro de los límites de cuota.
 */
export function checkQuotaLimit(
  quotaUsage: Record<string, QuotaUsage>,
  connector: Connector,
  capability: ConnectorCapability
): QuotaCheck {
  const key = `${connector.id}::${capability.id}`;
  const usage = quotaUsage[key];

  // Si no hay información de límite, permitir (política conservadora)
  if (!capability.rateLimit && !capability.freeTierLimits?.requests) {
    return { allowed: true };
  }

  // Si no hay uso registrado aún, permitir
  if (!usage) {
    return {
      allowed: true,
      remainingRequests: capability.rateLimit?.requests || capability.freeTierLimits?.requests,
      resetAt: capability.rateLimit ? `1 ${capability.rateLimit.period}` : undefined,
    };
  }

  const limit = capability.rateLimit?.requests || capability.freeTierLimits?.requests;
  
  // Si no hay límite definido, permitir
  if (!limit || limit === -1) {
    return { allowed: true };
  }

  // Verificar si se ha excedido el límite
  if (usage.requestsMade >= limit) {
    return {
      allowed: false,
      reason: `Cuota agotada: ${usage.requestsMade}/${limit} solicitudes en ${usage.period || 'periodo'}`,
      remainingRequests: 0,
      resetAt: usage.resetAt,
    };
  }

  return {
    allowed: true,
    remainingRequests: limit - usage.requestsMade,
    resetAt: usage.resetAt,
  };
}

/**
 * Verifica si una operación puede ejecutarse considerando cuotas y presupuesto.
 */
export function canExecuteWithQuota(
  quotaUsage: Record<string, QuotaUsage>,
  connector: Connector,
  capability: ConnectorCapability
): { allowed: boolean; reason?: string } {
  // Primero verificar política de coste cero
  const costCheck = canExecuteOperation(capability, ZERO_COST_POLICY);
  if (!costCheck.allowed) {
    return {
      allowed: false,
      reason: costCheck.reason,
    };
  }

  // Luego verificar cuotas
  const quotaCheck = checkQuotaLimit(quotaUsage, connector, capability);
  if (!quotaCheck.allowed) {
    return {
      allowed: false,
      reason: quotaCheck.reason,
    };
  }

  return { allowed: true };
}

/**
 * Actualiza los límites de cuota desde la respuesta del proveedor.
 */
export function updateQuotaFromHeaders(
  quotaUsage: Record<string, QuotaUsage>,
  connectorId: string,
  capabilityId: string,
  headers: Record<string, string>
): Record<string, QuotaUsage> {
  const key = `${connectorId}::${capabilityId}`;
  const existing = quotaUsage[key];

  // Extraer información de cabeceras estándar
  const limit = headers['x-ratelimit-limit'] || headers['rate-limit-limit'];
  const remaining = headers['x-ratelimit-remaining'] || headers['rate-limit-remaining'];
  const reset = headers['x-ratelimit-reset'] || headers['rate-limit-reset'];

  if (!limit && !remaining) {
    return quotaUsage; // No hay información de cuota en las cabeceras
  }

  const updated: QuotaUsage = {
    connectorId,
    capabilityId,
    requestsMade: existing?.requestsMade || 0,
    requestsLimit: limit ? parseInt(limit, 10) : existing?.requestsLimit,
    period: existing?.period || 'unknown',
    resetAt: reset ? new Date(parseInt(reset, 10) * 1000).toISOString() : existing?.resetAt,
    lastUpdated: new Date().toISOString(),
  };

  return {
    ...quotaUsage,
    [key]: updated,
  };
}

/**
 * Calcula el uso total de un conector.
 */
export function getConnectorUsage(
  quotaUsage: Record<string, QuotaUsage>,
  connectorId: string
): { totalRequests: number; capabilities: number } {
  let totalRequests = 0;
  let capabilities = 0;

  Object.entries(quotaUsage).forEach(([key, usage]) => {
    if (key.startsWith(`${connectorId}::`)) {
      totalRequests += usage.requestsMade;
      capabilities++;
    }
  });

  return { totalRequests, capabilities };
}

/**
 * Reinicia las cuotas (cuando cambia el periodo).
 */
export function resetQuotaUsage(
  quotaUsage: Record<string, QuotaUsage>,
  connectorId?: string
): Record<string, QuotaUsage> {
  if (!connectorId) {
    return {}; // Reiniciar todo
  }

  const updated = { ...quotaUsage };
  Object.keys(updated).forEach(key => {
    if (key.startsWith(`${connectorId}::`)) {
      updated[key] = {
        ...updated[key],
        requestsMade: 0,
        lastUpdated: new Date().toISOString(),
      };
    }
  });

  return updated;
}

/**
 * Obtiene estadísticas de uso para el dashboard.
 */
export function getUsageStatistics(quotaUsage: Record<string, QuotaUsage>): {
  totalRequests: number;
  activeConnectors: number;
  rateLimitedConnectors: number;
} {
  const connectors = new Set<string>();
  let rateLimited = 0;

  Object.entries(quotaUsage).forEach(([key, usage]) => {
    const connectorId = key.split('::')[0];
    connectors.add(connectorId);

    // Verificar si está limitado (simplificado)
    if (usage.requestsLimit && usage.requestsMade >= usage.requestsLimit) {
      rateLimited++;
    }
  });

  return {
    totalRequests: Object.values(quotaUsage).reduce((sum, u) => sum + u.requestsMade, 0),
    activeConnectors: connectors.size,
    rateLimitedConnectors: rateLimited,
  };
}
