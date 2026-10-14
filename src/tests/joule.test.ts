import { describe, it, expect } from 'vitest';
import {
  jouleCreateInitialState,
  jouleActivate,
  jouleDeactivate,
  jouleEngageKillSwitch,
  jouleDisengageKillSwitch,
  jouleShouldOptimize,
  jouleProcessTask,
  jouleGetMetrics,
} from '../services/joule/engine';
import { jouleProfileTask } from '../services/joule/profile';
import { jouleOptimizeTask } from '../services/joule/optimize';
import { jouleLearn, jouleCreateEmptyExperienceMap, jouleGetCostPerCorrectResult } from '../services/joule/learn';
import { jouleVerify, jouleVerifyStructural } from '../services/joule/verify';
import { REFERENCE_POLICY, CONSERVATIVE_POLICY } from '../services/joule/policies';
import type { JouleRoute, JouleMeasurement } from '../types/joule';

// Rutas de prueba
const localRoute: JouleRoute = {
  id: 'route-local',
  kind: 'local',
  capabilities: ['storage', 'computation'],
  constraints: {
    requiresAuth: false,
    requiresNetwork: false,
    privacyLevel: 'restricted',
    idempotent: true,
    reversible: true,
  },
  cost: { monetary: 0, units: 1, latencyMs: 10, energyMj: 0 },
  estimatedSuccessRate: 0.99,
  confidence: 'high',
  available: true,
  version: '1.0.0',
};

const aiRoute: JouleRoute = {
  id: 'route-ai',
  kind: 'ai_provider',
  provider: 'test-provider',
  capabilities: ['generation', 'analysis'],
  constraints: {
    requiresAuth: true,
    requiresNetwork: true,
    privacyLevel: 'internal',
    idempotent: false,
    reversible: false,
  },
  cost: { monetary: 0.01, units: 100, latencyMs: 5000 },
  estimatedSuccessRate: 0.85,
  confidence: 'medium',
  available: true,
  version: '1.0.0',
};

describe('JOULE Engine', () => {
  describe('State management', () => {
    it('creates initial state with JOULE disabled', () => {
      const state = jouleCreateInitialState();
      expect(state.enabled).toBe(false);
      expect(state.mode).toBe('disabled');
      expect(state.killSwitchEngaged).toBe(false);
      expect(state.version).toBe('1.0.0');
    });

    it('activates JOULE in shadow mode', () => {
      const state = jouleCreateInitialState();
      const activated = jouleActivate(state, 'shadow');
      expect(activated.enabled).toBe(true);
      expect(activated.mode).toBe('shadow');
    });

    it('deactivates JOULE', () => {
      const state = jouleActivate(jouleCreateInitialState(), 'active');
      const deactivated = jouleDeactivate(state);
      expect(deactivated.enabled).toBe(false);
      expect(deactivated.mode).toBe('disabled');
    });

    it('engages kill switch', () => {
      const state = jouleCreateInitialState();
      const killed = jouleEngageKillSwitch(state, 'Degradación detectada');
      expect(killed.killSwitchEngaged).toBe(true);
      expect(killed.killSwitchReason).toBe('Degradación detectada');
      expect(killed.enabled).toBe(false);
    });

    it('prevents activation when kill switch is engaged', () => {
      const state = jouleEngageKillSwitch(jouleCreateInitialState(), 'Test');
      const attempted = jouleActivate(state, 'active');
      expect(attempted.enabled).toBe(false);
    });

    it('disengages kill switch', () => {
      const state = jouleEngageKillSwitch(jouleCreateInitialState(), 'Test');
      const disengaged = jouleDisengageKillSwitch(state);
      expect(disengaged.killSwitchEngaged).toBe(false);
    });
  });

  describe('Should optimize', () => {
    it('returns false when disabled', () => {
      const state = jouleCreateInitialState();
      const result = jouleShouldOptimize(state, 'trace-1');
      expect(result.shouldOptimize).toBe(false);
    });

    it('returns true with shadow when enabled', () => {
      const state = jouleActivate(jouleCreateInitialState(), 'shadow');
      const result = jouleShouldOptimize(state, 'trace-1');
      expect(result.shouldOptimize).toBe(true);
      expect(result.isShadow).toBe(true);
    });

    it('returns false when kill switch is engaged', () => {
      const state = jouleEngageKillSwitch(jouleCreateInitialState(), 'Test');
      const result = jouleShouldOptimize(state, 'trace-1');
      expect(result.shouldOptimize).toBe(false);
    });
  });

  describe('Profile', () => {
    it('profiles a task with correct defaults', () => {
      const profile = jouleProfileTask({
        category: 'storage_read',
        description: 'Read from localStorage',
      });
      expect(profile.category).toBe('storage_read');
      expect(profile.riskLevel).toBe('low');
      expect(profile.dataSensitivity).toBe('internal');
      expect(profile.estimatedResources.durationMs).toBeGreaterThan(0);
    });

    it('assigns higher risk for confidential data', () => {
      const profile = jouleProfileTask({
        category: 'ai_request',
        description: 'Send to AI',
        dataSensitivity: 'confidential',
      });
      expect(profile.riskLevel).toBe('high');
    });
  });

  describe('Optimize', () => {
    it('selects local route for low-risk operations', () => {
      const profile = jouleProfileTask({
        category: 'storage_read',
        description: 'Read data',
      });
      const result = jouleOptimizeTask(
        profile,
        [localRoute, aiRoute],
        CONSERVATIVE_POLICY,
        jouleCreateEmptyExperienceMap()
      );
      expect(result.decision.status).toBe('selected');
      expect(result.selectedRoute?.id).toBe('route-local');
    });

    it('blocks AI route for confidential data', () => {
      const profile = jouleProfileTask({
        category: 'ai_request',
        description: 'Process confidential data',
        dataSensitivity: 'confidential',
      });
      const result = jouleOptimizeTask(
        profile,
        [aiRoute],
        CONSERVATIVE_POLICY,
        jouleCreateEmptyExperienceMap()
      );
      // AI route should be blocked due to data sensitivity
      expect(result.decision.status).toBe('blocked');
    });

    it('blocks route requiring auth when policy blocks insecure routes', () => {
      const profile = jouleProfileTask({
        category: 'data_processing',
        description: 'Process data',
      });
      const result = jouleOptimizeTask(
        profile,
        [aiRoute],
        CONSERVATIVE_POLICY,
        jouleCreateEmptyExperienceMap()
      );
      expect(result.decision.status).toBe('blocked');
    });
  });

  describe('Learn', () => {
    it('updates experience map with verified measurement', () => {
      const map = jouleCreateEmptyExperienceMap();
      const measurement: JouleMeasurement = {
        id: 'm1',
        traceId: 't1',
        taskId: 'task1',
        routeId: 'route-local',
        category: 'storage_read',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        durationMs: 10,
        bytesTransferred: 1024,
        costUnits: 1,
        monetaryCost: 0,
        success: true,
        verified: true,
        source: 'observed',
      };
      const updated = jouleLearn(map, measurement, 'storage_read', '1.0.0', '1.0.0');
      expect(updated.entries['storage_read::route-local']).toBeDefined();
      expect(updated.entries['storage_read::route-local'].executions).toBe(1);
      expect(updated.entries['storage_read::route-local'].verifiedSuccesses).toBe(1);
    });

    it('does not learn from unverified measurements', () => {
      const map = jouleCreateEmptyExperienceMap();
      const measurement: JouleMeasurement = {
        id: 'm1',
        traceId: 't1',
        taskId: 'task1',
        routeId: 'route-local',
        category: 'storage_read',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        durationMs: 10,
        bytesTransferred: 0,
        costUnits: 0,
        monetaryCost: 0,
        success: true,
        verified: false,
        source: 'observed',
      };
      const updated = jouleLearn(map, measurement, 'storage_read', '1.0.0', '1.0.0');
      expect(Object.keys(updated.entries)).toHaveLength(0);
    });
  });

  describe('Verify', () => {
    it('creates verification record', () => {
      const verification = jouleVerify('trace1', 'task1', 'structural', true, 'OK', 'automated');
      expect(verification.passed).toBe(true);
      expect(verification.method).toBe('structural');
    });

    it('verifies structural constraints', () => {
      const result = jouleVerifyStructural('trace1', 'task1', { value: 42 }, (v) => v.value > 0, 'positive value');
      expect(result.passed).toBe(true);
    });

    it('fails structural verification for null', () => {
      const result = jouleVerifyStructural('trace1', 'task1', null, () => true, 'not null');
      expect(result.passed).toBe(false);
    });
  });

  describe('Cost per correct result', () => {
    it('calculates cost per correct result', () => {
      const map = jouleCreateEmptyExperienceMap();
      // Simulate 3 executions, 2 verified successes, total cost 30
      const measurements: JouleMeasurement[] = [
        { id: '1', traceId: 't1', taskId: 'task1', routeId: 'r1', category: 'storage_read', startedAt: '', completedAt: '', durationMs: 10, bytesTransferred: 0, costUnits: 10, monetaryCost: 0, success: true, verified: true, source: 'observed' },
        { id: '2', traceId: 't2', taskId: 'task2', routeId: 'r1', category: 'storage_read', startedAt: '', completedAt: '', durationMs: 10, bytesTransferred: 0, costUnits: 10, monetaryCost: 0, success: false, verified: true, source: 'observed' },
        { id: '3', traceId: 't3', taskId: 'task3', routeId: 'r1', category: 'storage_read', startedAt: '', completedAt: '', durationMs: 10, bytesTransferred: 0, costUnits: 10, monetaryCost: 0, success: true, verified: true, source: 'observed' },
      ];
      let currentMap = map;
      for (const m of measurements) {
        currentMap = jouleLearn(currentMap, m, 'storage_read', '1.0.0', '1.0.0');
      }
      const entry = currentMap.entries['storage_read::r1'];
      const costPerCorrect = jouleGetCostPerCorrectResult(entry);
      // 30 total cost / 2 verified successes = 15
      expect(costPerCorrect).toBe(15);
    });
  });

  describe('Metrics', () => {
    it('calculates metrics from state', () => {
      const state = jouleCreateInitialState();
      const metrics = jouleGetMetrics(state);
      expect(metrics.totalOperations).toBe(0);
      expect(metrics.successRate).toBe(0);
    });
  });
});
