// GAGO OPEN ARTIFACT FACTORY - API Fabric Tests
// Fase 2 - Universal API Integration and Zero Cost Orchestration

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getInitialConnectors,
  installInitialConnectors,
  findConnector,
  findConnectorsByCategory,
  findConnectorsByStatus,
  updateConnectorStatus,
} from '../services/api-fabric/connector-registry';
import {
  ZERO_COST_POLICY,
  isEligibleForZeroCost,
  isConnectorEligible,
  isCapabilityEligible,
  filterEligibleConnectors,
  estimateOperationCost,
  canExecuteOperation,
} from '../services/api-fabric/free-tier-policy';
import {
  discoverCapabilities,
  installDiscoveredCapabilities,
  findCapabilitiesByModule,
  findCapabilitiesByCategory,
  getPendingCapabilities,
  getAutoConnectEligibleCapabilities,
} from '../services/api-fabric/capability-discovery';
import {
  recordQuotaUsage,
  checkQuotaLimit,
  canExecuteWithQuota,
  getConnectorUsage,
  resetQuotaUsage,
  getUsageStatistics,
} from '../services/api-fabric/quota-manager';
import {
  selectFreeCompatibleProvider,
  autoConnectCapability,
  getIntegrationStatus,
} from '../services/api-fabric/orchestrator';
import type { Connector, ConnectorCapability, CapabilityRequirement, QuotaUsage } from '../types/api-fabric';

describe('Connector Registry', () => {
  it('should return initial connectors', () => {
    const connectors = getInitialConnectors();
    expect(connectors).toBeDefined();
    expect(Array.isArray(connectors)).toBe(true);
    expect(connectors.length).toBeGreaterThan(0);
  });

  it('should install connectors idempotently', () => {
    const existing: Connector[] = [];
    const first = installInitialConnectors(existing);
    const second = installInitialConnectors(first);
    expect(first.length).toBe(second.length);
  });

  it('should find connector by ID', () => {
    const connectors = getInitialConnectors();
    const github = findConnector(connectors, 'connector-github');
    expect(github).toBeDefined();
    expect(github?.name).toBe('GitHub');
  });

  it('should find connectors by category', () => {
    const connectors = getInitialConnectors();
    const repos = findConnectorsByCategory(connectors, 'repository');
    expect(repos.length).toBeGreaterThan(0);
    expect(repos.every(c => c.category === 'repository')).toBe(true);
  });

  it('should find connectors by status', () => {
    const connectors = getInitialConnectors();
    const available = findConnectorsByStatus(connectors, 'available');
    expect(available.length).toBeGreaterThan(0);
    expect(available.every(c => c.status === 'available')).toBe(true);
  });

  it('should update connector status', () => {
    const connectors = getInitialConnectors();
    const updated = updateConnectorStatus(connectors, 'connector-github', 'verified');
    const github = findConnector(updated, 'connector-github');
    expect(github?.status).toBe('verified');
  });
});

describe('Free Tier Policy Engine', () => {
  it('should have zero cost policy by default', () => {
    expect(ZERO_COST_POLICY.maxMonetaryCost).toBe(0);
    expect(ZERO_COST_POLICY.allowPaidOperations).toBe(false);
  });

  it('should identify eligible billing models', () => {
    expect(isEligibleForZeroCost('free_permanent')).toBe(true);
    expect(isEligibleForZeroCost('free_tier')).toBe(true);
    expect(isEligibleForZeroCost('local_execution')).toBe(true);
    expect(isEligibleForZeroCost('pay_per_use')).toBe(false);
    expect(isEligibleForZeroCost('subscription')).toBe(false);
  });

  it('should check connector eligibility', () => {
    const connectors = getInitialConnectors();
    const ollama = findConnector(connectors, 'connector-ollama');
    expect(ollama).toBeDefined();
    
    const result = isConnectorEligible(ollama!, ZERO_COST_POLICY);
    expect(result.eligible).toBe(true);
  });

  it('should estimate operation cost', () => {
    const capability: ConnectorCapability = {
      id: 'test',
      name: 'Test',
      description: 'Test capability',
      category: 'internal',
      requiresAuth: false,
      authMethod: 'none',
      endpoints: [],
      costModel: 'local_execution',
      verified: false,
    };

    const estimate = estimateOperationCost(capability, ZERO_COST_POLICY);
    expect(estimate.cost).toBe(0);
    expect(estimate.isFree).toBe(true);
  });

  it('should check if operation can be executed', () => {
    const capability: ConnectorCapability = {
      id: 'test',
      name: 'Test',
      description: 'Test capability',
      category: 'internal',
      requiresAuth: false,
      authMethod: 'none',
      endpoints: [],
      costModel: 'local_execution',
      verified: false,
    };

    const result = canExecuteOperation(capability, ZERO_COST_POLICY);
    expect(result.allowed).toBe(true);
    expect(result.requiresAuth).toBe(false);
  });

  it('should filter eligible connectors', () => {
    const connectors = getInitialConnectors();
    const eligible = filterEligibleConnectors(connectors, ZERO_COST_POLICY);
    expect(eligible.length).toBeGreaterThan(0);
    expect(eligible.length).toBeLessThanOrEqual(connectors.length);
  });
});

describe('Capability Discovery Engine', () => {
  it('should discover capabilities', () => {
    const capabilities = discoverCapabilities();
    expect(capabilities).toBeDefined();
    expect(Array.isArray(capabilities)).toBe(true);
    expect(capabilities.length).toBeGreaterThan(0);
  });

  it('should install capabilities idempotently', () => {
    const existing: CapabilityRequirement[] = [];
    const first = installDiscoveredCapabilities(existing);
    const second = installDiscoveredCapabilities(first);
    expect(first.length).toBe(second.length);
  });

  it('should find capabilities by module', () => {
    const capabilities = discoverCapabilities();
    const projectsCaps = findCapabilitiesByModule(capabilities, 'module-projects');
    expect(projectsCaps.length).toBeGreaterThan(0);
    expect(projectsCaps.every(c => c.moduleId === 'module-projects')).toBe(true);
  });

  it('should find capabilities by category', () => {
    const capabilities = discoverCapabilities();
    const repoCaps = findCapabilitiesByCategory(capabilities, 'repository');
    expect(repoCaps.length).toBeGreaterThan(0);
    expect(repoCaps.every(c => c.category === 'repository')).toBe(true);
  });

  it('should get pending capabilities', () => {
    const capabilities = discoverCapabilities();
    const pending = getPendingCapabilities(capabilities);
    expect(pending.length).toBeGreaterThan(0);
    expect(pending.every(c => c.status === 'pending')).toBe(true);
  });

  it('should get auto-connect eligible capabilities', () => {
    const capabilities = discoverCapabilities();
    const eligible = getAutoConnectEligibleCapabilities(capabilities);
    expect(eligible.length).toBeGreaterThan(0);
    expect(eligible.every(c => c.autoConnectEligible)).toBe(true);
  });
});

describe('Quota and Budget Manager', () => {
  let quotaUsage: Record<string, QuotaUsage>;

  beforeEach(() => {
    quotaUsage = {};
  });

  it('should record quota usage', () => {
    const updated = recordQuotaUsage(quotaUsage, 'connector-test', 'capability-test');
    expect(updated['connector-test::capability-test']).toBeDefined();
    expect(updated['connector-test::capability-test'].requestsMade).toBe(1);
  });

  it('should increment quota usage', () => {
    let updated = recordQuotaUsage(quotaUsage, 'connector-test', 'capability-test');
    updated = recordQuotaUsage(updated, 'connector-test', 'capability-test');
    expect(updated['connector-test::capability-test'].requestsMade).toBe(2);
  });

  it('should check quota limit', () => {
    const connector: Connector = {
      id: 'test',
      name: 'Test',
      provider: 'Test',
      category: 'internal',
      version: '1.0.0',
      description: 'Test',
      capabilities: [],
      status: 'available',
      authMethod: 'none',
      configurationRequired: [],
      endpoints: { production: '', documentation: '' },
      costModel: 'free_tier',
      securityRestrictions: [],
      documentationUrl: '',
      createdAt: '',
      updatedAt: '',
    };

    const capability: ConnectorCapability = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      category: 'internal',
      requiresAuth: false,
      authMethod: 'none',
      endpoints: [],
      rateLimit: { requests: 100, period: 'hour' },
      costModel: 'free_tier',
      verified: false,
    };

    const check = checkQuotaLimit(quotaUsage, connector, capability);
    expect(check.allowed).toBe(true);
  });

  it('should get connector usage', () => {
    let updated = recordQuotaUsage(quotaUsage, 'connector-test', 'cap1');
    updated = recordQuotaUsage(updated, 'connector-test', 'cap2');
    
    const usage = getConnectorUsage(updated, 'connector-test');
    expect(usage.totalRequests).toBe(2);
    expect(usage.capabilities).toBe(2);
  });

  it('should reset quota usage', () => {
    let updated = recordQuotaUsage(quotaUsage, 'connector-test', 'capability-test');
    updated = resetQuotaUsage(updated, 'connector-test');
    expect(updated['connector-test::capability-test'].requestsMade).toBe(0);
  });

  it('should get usage statistics', () => {
    let updated = recordQuotaUsage(quotaUsage, 'conn1', 'cap1');
    updated = recordQuotaUsage(updated, 'conn2', 'cap1');
    
    const stats = getUsageStatistics(updated);
    expect(stats.totalRequests).toBe(2);
    expect(stats.activeConnectors).toBe(2);
  });
});

describe('Integration Orchestrator', () => {
  it('should select free compatible provider', () => {
    const connectors = getInitialConnectors();
    const capabilities = discoverCapabilities();
    const quotaUsage: Record<string, QuotaUsage> = {};

    const requirement = capabilities.find(c => c.autoConnectEligible);
    expect(requirement).toBeDefined();

    if (requirement) {
      const result = selectFreeCompatibleProvider(requirement, connectors, quotaUsage);
      // Puede o no encontrar un proveedor dependiendo de la categoría
      expect(result).toBeDefined();
      expect(result.reason).toBeDefined();
    }
  });

  it('should auto-connect capability', () => {
    const connectors = getInitialConnectors();
    const capabilities = discoverCapabilities();
    const quotaUsage: Record<string, QuotaUsage> = {};

    const requirement = capabilities.find(c => c.autoConnectEligible && !c.requiresAuth);
    expect(requirement).toBeDefined();

    if (requirement) {
      const result = autoConnectCapability(requirement, connectors, quotaUsage);
      expect(result).toBeDefined();
      expect(result.capabilityId).toBe(requirement.id);
      expect(result.status).toBeDefined();
    }
  });

  it('should get integration status', () => {
    const connectors = getInitialConnectors();
    const capabilities = discoverCapabilities();

    const status = getIntegrationStatus(connectors, capabilities);
    expect(status).toBeDefined();
    expect(status.totalConnectors).toBe(connectors.length);
    expect(status.totalCapabilities).toBe(capabilities.length);
  });
});

describe('Security Tests', () => {
  it('should not allow paid operations with zero cost policy', () => {
    const capability: ConnectorCapability = {
      id: 'test',
      name: 'Test',
      description: 'Test',
      category: 'ai_provider',
      requiresAuth: true,
      authMethod: 'api_key',
      endpoints: [],
      costModel: 'pay_per_use',
      verified: false,
    };

    const result = canExecuteOperation(capability, ZERO_COST_POLICY);
    expect(result.allowed).toBe(false);
  });

  it('should block connectors with unverified free tier info', () => {
    const connector: Connector = {
      id: 'test',
      name: 'Test',
      provider: 'Test',
      category: 'ai_provider',
      version: '1.0.0',
      description: 'Test',
      capabilities: [],
      status: 'available',
      authMethod: 'api_key',
      configurationRequired: [],
      endpoints: { production: '', documentation: '' },
      costModel: 'free_tier',
      freeTierInfo: {
        limits: 'Unknown',
        conditions: 'Unknown',
        verified: false,
        lastChecked: '',
      },
      securityRestrictions: [],
      documentationUrl: '',
      createdAt: '',
      updatedAt: '',
    };

    const result = isConnectorEligible(connector, ZERO_COST_POLICY);
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain('no verificada');
  });
});
