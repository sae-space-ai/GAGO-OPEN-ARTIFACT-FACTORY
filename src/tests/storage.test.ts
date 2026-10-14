import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadStore,
  saveStore,
  createProject,
  updateProject,
  deleteProject,
  createTask,
  updateTask,
  deleteTask,
  createArtifact,
  updateArtifact,
  deleteArtifact,
  createEvidence,
  updateEvidence,
  deleteEvidence,
  exportData,
  importData,
  resetStore,
  generateId,
} from '../services/storage';
import type { DataStore } from '../types';
import { SCHEMA_VERSION } from '../types';

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

function getEmptyStore(): DataStore {
  return {
    version: SCHEMA_VERSION,
    projects: [],
    tasks: [],
    artifacts: [],
    evidence: [],
    settings: { theme: 'dark', language: 'es', version: SCHEMA_VERSION },
  };
}

describe('Storage Service', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });
  });

  describe('loadStore / saveStore', () => {
    it('returns default store when empty', () => {
      const store = loadStore();
      expect(store.version).toBe(SCHEMA_VERSION);
      expect(store.projects).toEqual([]);
      expect(store.tasks).toEqual([]);
    });

    it('persists and retrieves data', () => {
      const store = getEmptyStore();
      const withProject = createProject(store, { name: 'Test', description: 'Desc', status: 'planning', priority: 'medium' });
      saveStore(withProject);
      const loaded = loadStore();
      expect(loaded.projects).toHaveLength(1);
      expect(loaded.projects[0].name).toBe('Test');
    });

    it('handles corrupted data gracefully', () => {
      localStorageMock.setItem('gago-factory-data', 'invalid json{{{');
      const store = loadStore();
      expect(store.projects).toEqual([]);
    });

    it('handles invalid structure gracefully', () => {
      localStorageMock.setItem('gago-factory-data', JSON.stringify({ invalid: true }));
      const store = loadStore();
      expect(store.projects).toEqual([]);
    });
  });

  describe('Project operations', () => {
    it('creates a project with correct fields', () => {
      const store = getEmptyStore();
      const result = createProject(store, { name: 'Project A', description: 'Description', status: 'planning', priority: 'high' });
      expect(result.projects).toHaveLength(1);
      expect(result.projects[0].name).toBe('Project A');
      expect(result.projects[0].id).toBeTruthy();
      expect(result.projects[0].createdAt).toBeTruthy();
      expect(result.projects[0].archived).toBe(false);
    });

    it('updates a project', () => {
      const store = getEmptyStore();
      const withProject = createProject(store, { name: 'Original', description: '', status: 'planning', priority: 'low' });
      const id = withProject.projects[0].id;
      const updated = updateProject(withProject, id, { name: 'Updated', status: 'development' });
      expect(updated.projects[0].name).toBe('Updated');
      expect(updated.projects[0].status).toBe('development');
    });

    it('deletes a project and associated tasks', () => {
      const store = getEmptyStore();
      const withProject = createProject(store, { name: 'To Delete', description: '', status: 'planning', priority: 'low' });
      const projectId = withProject.projects[0].id;
      const withTask = createTask(withProject, { projectId, title: 'Task', description: '', priority: 'low', status: 'pending', isAutomated: false });
      const result = deleteProject(withTask, projectId);
      expect(result.projects).toHaveLength(0);
      expect(result.tasks).toHaveLength(0);
    });
  });

  describe('Task operations', () => {
    it('creates a task', () => {
      const store = getEmptyStore();
      const withProject = createProject(store, { name: 'P', description: '', status: 'planning', priority: 'low' });
      const result = createTask(withProject, { projectId: withProject.projects[0].id, title: 'Task 1', description: 'Do something', priority: 'high', status: 'pending', isAutomated: false });
      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].title).toBe('Task 1');
      expect(result.tasks[0].isAutomated).toBe(false);
    });

    it('updates task status', () => {
      const store = getEmptyStore();
      const withProject = createProject(store, { name: 'P', description: '', status: 'planning', priority: 'low' });
      const withTask = createTask(withProject, { projectId: withProject.projects[0].id, title: 'Task', description: '', priority: 'medium', status: 'pending', isAutomated: false });
      const taskId = withTask.tasks[0].id;
      const updated = updateTask(withTask, taskId, { status: 'completed' });
      expect(updated.tasks[0].status).toBe('completed');
    });
  });

  describe('Artifact operations', () => {
    it('creates and deletes artifacts', () => {
      const store = getEmptyStore();
      const withArtifact = createArtifact(store, { name: 'App', description: 'Web app', type: 'web_app', projectId: '', version: '1.0.0', status: 'draft' });
      expect(withArtifact.artifacts).toHaveLength(1);
      const id = withArtifact.artifacts[0].id;
      const result = deleteArtifact(withArtifact, id);
      expect(result.artifacts).toHaveLength(0);
    });
  });

  describe('Evidence operations', () => {
    it('creates evidence with correct status', () => {
      const store = getEmptyStore();
      const result = createEvidence(store, { title: 'Test result', description: 'Passed', type: 'test', status: 'declared', source: 'local', reference: 'test-001' });
      expect(result.evidence).toHaveLength(1);
      expect(result.evidence[0].status).toBe('declared');
      expect(result.evidence[0].type).toBe('test');
    });

    it('updates evidence status to verified', () => {
      const store = getEmptyStore();
      const withEv = createEvidence(store, { title: 'Test', description: '', type: 'test', status: 'declared', source: '', reference: '' });
      const id = withEv.evidence[0].id;
      const updated = updateEvidence(withEv, id, { status: 'verified' });
      expect(updated.evidence[0].status).toBe('verified');
    });
  });

  describe('Export / Import', () => {
    it('exports data as valid JSON', () => {
      const store = getEmptyStore();
      const withProject = createProject(store, { name: 'Export Test', description: '', status: 'planning', priority: 'low' });
      const json = exportData(withProject);
      expect(() => JSON.parse(json)).not.toThrow();
      const parsed = JSON.parse(json);
      expect(parsed.projects).toHaveLength(1);
    });

    it('imports valid data', () => {
      const store = getEmptyStore();
      const withProject = createProject(store, { name: 'Import Test', description: '', status: 'development', priority: 'high' });
      const json = exportData(withProject);
      const imported = importData(json);
      expect(imported).not.toBeNull();
      expect(imported!.projects).toHaveLength(1);
      expect(imported!.projects[0].name).toBe('Import Test');
    });

    it('rejects invalid data', () => {
      const result = importData('not valid json');
      expect(result).toBeNull();
    });

    it('rejects data with wrong structure', () => {
      const result = importData(JSON.stringify({ wrong: 'structure' }));
      expect(result).toBeNull();
    });
  });

  describe('resetStore', () => {
    it('returns empty store', () => {
      const store = resetStore();
      expect(store.projects).toHaveLength(0);
      expect(store.tasks).toHaveLength(0);
      expect(store.artifacts).toHaveLength(0);
      expect(store.evidence).toHaveLength(0);
    });
  });
});
