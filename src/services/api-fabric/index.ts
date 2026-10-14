// GAGO OPEN ARTIFACT FACTORY - Universal API Fabric
// API Pública - Fase 2

// Connector Registry
export {
  getInitialConnectors,
  installInitialConnectors,
  findConnector,
  findConnectorsByCategory,
  findConnectorsByStatus,
  updateConnectorStatus,
} from './connector-registry';

// Free Tier Policy Engine
export {
  ZERO_COST_POLICY,
  isEligibleForZeroCost,
  isConnectorEligible,
  isCapabilityEligible,
  filterEligibleConnectors,
  estimateOperationCost,
  canExecuteOperation,
} from './free-tier-policy';
export type { FreeTierPolicy } from './free-tier-policy';

// Capability Discovery Engine
export {
  discoverCapabilities,
  installDiscoveredCapabilities,
  updateCapabilityStatus,
  findCapabilitiesByModule,
  findCapabilitiesByCategory,
  getPendingCapabilities,
  getAutoConnectEligibleCapabilities,
} from './capability-discovery';

// Quota and Budget Manager
export {
  recordQuotaUsage,
  checkQuotaLimit,
  canExecuteWithQuota,
  updateQuotaFromHeaders,
  getConnectorUsage,
  resetQuotaUsage,
  getUsageStatistics,
} from './quota-manager';
export type { QuotaCheck } from './quota-manager';

// Integration Orchestrator
export {
  selectFreeCompatibleProvider,
  autoConnectCapability,
  executeOperation,
  autoConnectAllEligible,
  getIntegrationStatus,
} from './orchestrator';
export type { OrchestrationRequest, OrchestrationResult } from './orchestrator';
