import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadStore,
  saveStore,
  createScopeRequirement,
  updateScopeRequirement,
  deleteScopeRequirement,
  updateQualityGate,
  exportData,
  importData,
} from '../services/storage';
import { installInitialScope } from '../services/initial-scope';
import { installInitialGates } from '../services/quality-gates';
import { CURRENT_SCHEMA_VERSION } from '../services/storage';
import type { DataStore } from '../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('Scope Matrix (Phase 0.1)', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('Initial installation', () => {
    it('installs 16 initial requirements', () => {
      const result = installInitialScope([]);
      expect(result).toHaveLength(16);
    });

    it('installation is idempotent', () => {
      const first = installInitialScope([]);
      const second = installInitialScope(first);
      expect(second).toHaveLength(16); // No duplicates
    });

    it('preserves existing custom requirements', () => {
      const existing = installInitialScope([]);
      const custom = {
        id: 'custom-req',
        code: 'M01' as const,
        phase: '0.1' as const,
        module: 'Test',
        name: 'Custom',
        functionalDescription: '',
        technicalObjective: '',
        priority: 'medium' as const,
        dependencies: [],
        executor: 'human' as const,
        implementationStatus: 'not_started' as const,
        testStatus: 'not_tested' as const,
        verificationStatus: 'not_verified' as const,
        acceptanceCriteria: [],
        evidenceIds: [],
        relatedProjectIds: [],
        relatedTaskIds: [],
        relatedArtifactIds: [],
        actionType: 'local_ui' as const,
        actionReference: '',
        blockers: [],
        observations: '',
        versionRef: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        archived: false,
      };
      const result = installInitialScope([...existing, custom]);
      expect(result).toHaveLength(17);
      expect(result.find(r => r.id === 'custom-req')).toBeTruthy();
    });
  });

  describe('Store migration', () => {
    it('migrates from Phase 0 schema', () => {
      // Simulate Phase 0 data
      const phase0Data = {
        version: '0.1.0',
        projects: [{ id: 'p1', name: 'Test', description: '', status: 'planning' as const, priority: 'low' as const, createdAt: '', updatedAt: '', archived: false }],
        tasks: [],
        artifacts: [],
        evidence: [],
        settings: { theme: 'dark' as const, language: 'es' as const, version: '0.1.0' },
      };
      localStorageMock.setItem('gago-factory-data', JSON.stringify(phase0Data));
      const loaded = loadStore();
      expect(loaded.version).toBe(CURRENT_SCHEMA_VERSION);
      expect(loaded.projects).toHaveLength(1);
      expect(loaded.projects[0].name).toBe('Test');
      expect(loaded.scopeMatrix).toBeDefined();
      expect(loaded.scopeMatrix!.length).toBe(16);
    });

    it('preserves existing data during migration', () => {
      const phase0Data = {
        version: '0.1.0',
        projects: [
          { id: 'p1', name: 'Project A', description: 'Desc', status: 'development' as const, priority: 'high' as const, createdAt: '2025-01-01', updatedAt: '2025-01-01', archived: false },
        ],
        tasks: [
          { id: 't1', projectId: 'p1', title: 'Task 1', description: '', priority: 'medium' as const, status: 'pending' as const, isAutomated: false, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
        ],
        artifacts: [],
        evidence: [],
        settings: { theme: 'dark' as const, language: 'es' as const, version: '0.1.0' },
      };
      localStorageMock.setItem('gago-factory-data', JSON.stringify(phase0Data));
      const loaded = loadStore();
      expect(loaded.projects).toHaveLength(1);
      expect(loaded.tasks).toHaveLength(1);
      expect(loaded.scopeMatrix!.length).toBe(16);
    });
  });

  describe('Scope operations', () => {
    it('creates a scope requirement', () => {
      const store = loadStore();
      const result = createScopeRequirement(store, {
        code: 'M01',
        phase: '0.1',
        module: 'Test',
        name: 'New Requirement',
        functionalDescription: 'Test description',
        technicalObjective: 'Test objective',
        priority: 'high',
        dependencies: [],
        executor: 'human',
        implementationStatus: 'not_started',
        testStatus: 'not_tested',
        verificationStatus: 'not_verified',
        acceptanceCriteria: ['Criterion 1'],
        evidenceIds: [],
        relatedProjectIds: [],
        relatedTaskIds: [],
        relatedArtifactIds: [],
        actionType: 'local_ui',
        actionReference: '',
        blockers: [],
        observations: '',
        versionRef: '',
      });
      expect(result.scopeMatrix!.length).toBe(17); // 16 initial + 1 new
    });

    it('updates a scope requirement status', () => {
      const store = loadStore();
      const reqId = store.scopeMatrix![0].id;
      const updated = updateScopeRequirement(store, reqId, { implementationStatus: 'implemented' });
      expect(updated.scopeMatrix!.find(r => r.id === reqId)?.implementationStatus).toBe('implemented');
    });

    it('deletes a custom scope requirement', () => {
      let store = loadStore();
      store = createScopeRequirement(store, {
        code: 'M01',
        phase: '0.1',
        module: 'Test',
        name: 'To Delete',
        functionalDescription: '',
        technicalObjective: '',
        priority: 'low',
        dependencies: [],
        executor: 'human',
        implementationStatus: 'not_started',
        testStatus: 'not_tested',
        verificationStatus: 'not_verified',
        acceptanceCriteria: [],
        evidenceIds: [],
        relatedProjectIds: [],
        relatedTaskIds: [],
        relatedArtifactIds: [],
        actionType: 'local_ui',
        actionReference: '',
        blockers: [],
        observations: '',
        versionRef: '',
      });
      const customId = store.scopeMatrix![16].id;
      const result = deleteScopeRequirement(store, customId);
      expect(result.scopeMatrix!.length).toBe(16);
    });
  });

  describe('Quality Gates', () => {
    it('installs 8 initial gates', () => {
      const gates = installInitialGates([]);
      expect(gates).toHaveLength(8);
    });

    it('gate installation is idempotent', () => {
      const first = installInitialGates([]);
      const second = installInitialGates(first);
      expect(second).toHaveLength(8);
    });

    it('updates gate status', () => {
      const store = loadStore();
      const gateId = store.qualityGates![0].id;
      const updated = updateQualityGate(store, gateId, { status: 'passed', lastCheck: new Date().toISOString() });
      expect(updated.qualityGates!.find(g => g.id === gateId)?.status).toBe('passed');
    });
  });

  describe('Export/Import with scope data', () => {
    it('exports data including scope matrix', () => {
      const store = loadStore();
      const json = exportData(store);
      const parsed = JSON.parse(json);
      expect(parsed.scopeMatrix).toBeDefined();
      expect(parsed.scopeMatrix.length).toBe(16);
      expect(parsed.qualityGates).toBeDefined();
      expect(parsed.qualityGates.length).toBe(8);
    });

    it('imports data with scope matrix', () => {
      const store = loadStore();
      const json = exportData(store);
      const imported = importData(json);
      expect(imported).not.toBeNull();
      expect(imported!.scopeMatrix!.length).toBe(16);
    });

    it('rejects invalid JSON', () => {
      const result = importData('not valid');
      expect(result).toBeNull();
    });
  });
});
