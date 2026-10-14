import { describe, it, expect } from 'vitest';
import { wouldCreateCycle, detectCycles, validateDependencies, getTransitiveDependencies, isBlockedByDependencies } from '../services/dependencies';
import type { ScopeRequirement } from '../types/scope';

function makeReq(id: string, deps: string[] = [], implStatus: ScopeRequirement['implementationStatus'] = 'not_started'): ScopeRequirement {
  return {
    id,
    code: 'M01',
    phase: '0.1',
    module: 'Test',
    name: `Req ${id}`,
    functionalDescription: '',
    technicalObjective: '',
    priority: 'medium',
    dependencies: deps,
    executor: 'human',
    implementationStatus: implStatus,
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archived: false,
  };
}

describe('Dependency Service', () => {
  describe('wouldCreateCycle', () => {
    it('detects self-dependency', () => {
      const reqs = [makeReq('A')];
      expect(wouldCreateCycle(reqs, 'A', 'A')).toBe(true);
    });

    it('detects direct cycle', () => {
      const reqs = [makeReq('A', ['B']), makeReq('B', ['A'])];
      expect(wouldCreateCycle(reqs, 'A', 'B')).toBe(true);
    });

    it('detects indirect cycle', () => {
      const reqs = [
        makeReq('A', ['B']),
        makeReq('B', ['C']),
        makeReq('C', ['A']),
      ];
      expect(wouldCreateCycle(reqs, 'A', 'B')).toBe(true);
    });

    it('allows valid dependency', () => {
      const reqs = [makeReq('A'), makeReq('B'), makeReq('C')];
      expect(wouldCreateCycle(reqs, 'A', 'B')).toBe(false);
    });

    it('allows chain without cycle', () => {
      const reqs = [makeReq('A', ['B']), makeReq('B', ['C']), makeReq('C')];
      expect(wouldCreateCycle(reqs, 'A', 'B')).toBe(false);
    });
  });

  describe('detectCycles', () => {
    it('returns empty for acyclic graph', () => {
      const reqs = [makeReq('A', ['B']), makeReq('B', ['C']), makeReq('C')];
      const cycles = detectCycles(reqs);
      expect(cycles).toHaveLength(0);
    });

    it('detects cycles in graph', () => {
      const reqs = [makeReq('A', ['B']), makeReq('B', ['A'])];
      const cycles = detectCycles(reqs);
      expect(cycles.length).toBeGreaterThan(0);
    });
  });

  describe('validateDependencies', () => {
    it('rejects self-dependency', () => {
      const reqs = [makeReq('A')];
      const result = validateDependencies({ id: 'A', dependencies: ['A'] }, reqs);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('sí mismo'))).toBe(true);
    });

    it('rejects non-existent dependency', () => {
      const reqs = [makeReq('A')];
      const result = validateDependencies({ id: 'A', dependencies: ['non-existent'] }, reqs);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('no existe'))).toBe(true);
    });

    it('rejects cyclic dependency', () => {
      const reqs = [makeReq('A', ['B']), makeReq('B')];
      const result = validateDependencies({ id: 'B', dependencies: ['A'] }, reqs);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('ciclo'))).toBe(true);
    });

    it('accepts valid dependencies', () => {
      const reqs = [makeReq('A'), makeReq('B'), makeReq('C')];
      const result = validateDependencies({ id: 'A', dependencies: ['B', 'C'] }, reqs);
      expect(result.valid).toBe(true);
    });
  });

  describe('getTransitiveDependencies', () => {
    it('returns direct dependencies', () => {
      const reqs = [makeReq('A', ['B']), makeReq('B')];
      const deps = getTransitiveDependencies('A', reqs);
      expect(deps).toContain('B');
    });

    it('returns transitive dependencies', () => {
      const reqs = [makeReq('A', ['B']), makeReq('B', ['C']), makeReq('C')];
      const deps = getTransitiveDependencies('A', reqs);
      expect(deps).toContain('B');
      expect(deps).toContain('C');
    });

    it('returns empty for no dependencies', () => {
      const reqs = [makeReq('A')];
      const deps = getTransitiveDependencies('A', reqs);
      expect(deps).toHaveLength(0);
    });
  });

  describe('isBlockedByDependencies', () => {
    it('returns not blocked when no dependencies', () => {
      const reqs = [makeReq('A')];
      const result = isBlockedByDependencies(reqs[0], reqs);
      expect(result.blocked).toBe(false);
    });

    it('returns blocked when dependency is not implemented', () => {
      const reqs = [makeReq('A', ['B']), makeReq('B', [], 'not_started')];
      const result = isBlockedByDependencies(reqs[0], reqs);
      expect(result.blocked).toBe(true);
    });

    it('returns not blocked when all dependencies are implemented', () => {
      const reqs = [makeReq('A', ['B']), makeReq('B', [], 'implemented')];
      const result = isBlockedByDependencies(reqs[0], reqs);
      expect(result.blocked).toBe(false);
    });

    it('returns not blocked when dependency is discarded', () => {
      const reqs = [makeReq('A', ['B']), makeReq('B', [], 'discarded')];
      const result = isBlockedByDependencies(reqs[0], reqs);
      expect(result.blocked).toBe(false);
    });
  });
});
