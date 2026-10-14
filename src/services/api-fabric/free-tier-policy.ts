// GAGO OPEN ARTIFACT FACTORY - Free Tier Policy Engine
// Fase 2 - Universal API Fabric
// Principio: Presupuesto monetario predeterminado = 0

import type { Connector, BillingModel, ConnectorCapability } from '../../types/api-fabric';

export interface FreeTierPolicy {
  id: string;
  name: string;
  maxMonetaryCost: number; // Default: 0 (zero cost)
  currency: string;
  allowPaidOperations: boolean;
  requireExplicitAuthorization: boolean;
  blockedProviders: string[];
  allowedFreeTiers: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Política de coste cero por defecto.
 * No permite ninguna operación que pueda generar gastos sin autorización explícita.
 */
export const ZERO_COST_POLICY: FreeTierPolicy = {
  id: 'policy-zero-cost',
  name: 'Coste Cero (Default)',
  maxMonetaryCost: 0,
  currency: 'EUR',
  allowPaidOperations: false,
  requireExplicitAuthorization: true,
  blockedProviders: [],
  allowedFreeTiers: ['free_permanent', 'free_tier', 'local_execution'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Verifica si un modelo de facturación es elegible bajo la política de coste cero.
 */
export function isEligibleForZeroCost(
  billingModel: BillingModel,
  policy: FreeTierPolicy = ZERO_COST_POLICY
): boolean {
  // Si el modelo está explícitamente bloqueado
  if (policy.blockedProviders.includes(billingModel)) {
    return false;
  }

  // Si está en la lista de permitidos
  if (policy.allowedFreeTiers.includes(billingModel)) {
    return true;
  }

  // Si no permite operaciones pagadas
  if (!policy.allowPaidOperations) {
    // Solo permite modelos gratuitos o locales
    return billingModel === 'free_permanent' ||
           billingModel === 'free_tier' ||
           billingModel === 'local_execution';
  }

  return false;
}

/**
 * Verifica si un conector es elegible bajo la política de coste cero.
 */
export function isConnectorEligible(
  connector: Connector,
  policy: FreeTierPolicy = ZERO_COST_POLICY
): { eligible: boolean; reason?: string } {
  // Verificar modelo de facturación del conector
  if (!isEligibleForZeroCost(connector.costModel, policy)) {
    return {
      eligible: false,
      reason: `Modelo de facturación '${connector.costModel}' no es elegible para coste cero`,
    };
  }

  // Verificar que no esté en la lista de bloqueados
  if (policy.blockedProviders.includes(connector.id)) {
    return {
      eligible: false,
      reason: `Conector '${connector.name}' está bloqueado por política`,
    };
  }

  // Verificar información de free tier si existe
  if (connector.freeTierInfo && !connector.freeTierInfo.verified) {
    return {
      eligible: false,
      reason: `Información de cuota gratuita no verificada para '${connector.name}'`,
    };
  }

  return { eligible: true };
}

/**
 * Verifica si una capacidad específica es elegible bajo la política de coste cero.
 */
export function isCapabilityEligible(
  capability: ConnectorCapability,
  policy: FreeTierPolicy = ZERO_COST_POLICY
): { eligible: boolean; reason?: string } {
  if (!isEligibleForZeroCost(capability.costModel, policy)) {
    return {
      eligible: false,
      reason: `Modelo de facturación '${capability.costModel}' no es elegible para coste cero`,
    };
  }

  return { eligible: true };
}

/**
 * Filtra conectores elegibles según la política de coste cero.
 */
export function filterEligibleConnectors(
  connectors: Connector[],
  policy: FreeTierPolicy = ZERO_COST_POLICY
): Connector[] {
  return connectors.filter(c => isConnectorEligible(c, policy).eligible);
}

/**
 * Calcula el coste estimado de una operación.
 * Retorna 0 si es gratuito o local, o el coste si es pagado.
 */
export function estimateOperationCost(
  capability: ConnectorCapability,
  policy: FreeTierPolicy = ZERO_COST_POLICY
): { cost: number; currency: string; isFree: boolean; warning?: string } {
  // Operaciones locales siempre son gratuitas
  if (capability.costModel === 'local_execution') {
    return { cost: 0, currency: policy.currency, isFree: true };
  }

  // Operaciones gratuitas permanentes
  if (capability.costModel === 'free_permanent') {
    return { cost: 0, currency: policy.currency, isFree: true };
  }

  // Free tier con límites
  if (capability.costModel === 'free_tier') {
    const withinLimits = capability.freeTierLimits?.requests === -1 || // Ilimitado
                         capability.freeTierLimits?.requests === undefined; // No especificado
    
    if (withinLimits) {
      return { cost: 0, currency: policy.currency, isFree: true };
    }

    return {
      cost: 0,
      currency: policy.currency,
      isFree: true,
      warning: `Dentro de cuota gratuita (${capability.freeTierLimits?.requests} ${capability.freeTierLimits?.period})`,
    };
  }

  // Crédito promocional temporal
  if (capability.costModel === 'free_promotional') {
    return {
      cost: 0,
      currency: policy.currency,
      isFree: true,
      warning: 'Crédito promocional temporal - puede expirar',
    };
  }

  // Pago por uso o suscripción
  if (capability.costModel === 'pay_per_use' || capability.costModel === 'subscription') {
    return {
      cost: -1, // Coste desconocido
      currency: policy.currency,
      isFree: false,
      warning: 'Operación con coste - requiere autorización explícita',
    };
  }

  // Modelo desconocido
  return {
    cost: -1,
    currency: policy.currency,
    isFree: false,
    warning: 'Modelo de facturación no verificado',
  };
}

/**
 * Verifica si una operación puede ejecutarse bajo la política actual.
 */
export function canExecuteOperation(
  capability: ConnectorCapability,
  policy: FreeTierPolicy = ZERO_COST_POLICY
): { allowed: boolean; reason?: string; requiresAuth: boolean } {
  const eligibility = isCapabilityEligible(capability, policy);
  
  if (!eligibility.eligible) {
    return {
      allowed: false,
      reason: eligibility.reason,
      requiresAuth: false,
    };
  }

  const costEstimate = estimateOperationCost(capability, policy);
  
  // Si tiene coste y la política no permite operaciones pagadas
  if (!costEstimate.isFree && !policy.allowPaidOperations) {
    return {
      allowed: false,
      reason: 'Operación con coste no permitida bajo política de coste cero',
      requiresAuth: policy.requireExplicitAuthorization,
    };
  }

  // Si requiere autenticación
  if (capability.requiresAuth) {
    return {
      allowed: true,
      requiresAuth: true,
    };
  }

  return {
    allowed: true,
    requiresAuth: false,
  };
}
