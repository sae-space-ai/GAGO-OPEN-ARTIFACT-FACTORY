// GAGO OPEN ARTIFACT FACTORY - Local Storage Service
// Fase 0.1 — Ampliado con Matriz de Alcance y Quality Gates
import { v4 as uuidv4 } from 'uuid';
import type { DataStore, Project, Task, Artifact, Evidence, AppSettings } from '../types';
import type { ScopeRequirement, QualityGate } from '../types/scope';
import { installInitialScope } from './initial-scope';
import { installInitialGates } from './quality-gates';

const STORAGE_KEY = 'gago-factory-data';

// New schema version for Phase 0.1
export const CURRENT_SCHEMA_VERSION = '0.1.1';

function getDefaultSettings(): AppSettings {
  const saved = localStorage.getItem('gago-theme');
  return {
    theme: (saved as 'light' | 'dark') || 'dark',
    language: 'es',
    version: CURRENT_SCHEMA_VERSION,
  };
}

function getDefaultStore(): DataStore {
  return {
    version: CURRENT_SCHEMA_VERSION,
    projects: [],
    tasks: [],
    artifacts: [],
    evidence: [],
    settings: getDefaultSettings(),
    scopeMatrix: installInitialScope([]),
    qualityGates: installInitialGates([]),
  };
}

function validateStore(data: unknown): data is DataStore {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  if (typeof d.version !== 'string') return false;
  if (!Array.isArray(d.projects)) return false;
  if (!Array.isArray(d.tasks)) return false;
  if (!Array.isArray(d.artifacts)) return false;
  if (!Array.isArray(d.evidence)) return false;
  return true;
}

/**
 * Migrates data from Phase 0 (schema 0.1.0) to Phase 0.1 (schema 0.1.1).
 * Adds scopeMatrix and qualityGates fields if missing.
 * Does not delete or modify existing data.
 */
function migrateStore(data: DataStore): DataStore {
  if (data.version === CURRENT_SCHEMA_VERSION) {
    // Ensure scope matrix and gates are installed idempotently
    return {
      ...data,
      scopeMatrix: installInitialScope(data.scopeMatrix || []),
      qualityGates: installInitialGates(data.qualityGates || []),
    };
  }

  // Migration from 0.1.0 to 0.1.1
  if (data.version === '0.1.0') {
    const extended = data as DataStore & { scopeMatrix?: ScopeRequirement[]; qualityGates?: QualityGate[] };
    return {
      ...data,
      version: CURRENT_SCHEMA_VERSION,
      scopeMatrix: installInitialScope(extended.scopeMatrix || []),
      qualityGates: installInitialGates(extended.qualityGates || []),
    };
  }

  // Unknown version: try to preserve data but add missing fields
  const extended = data as DataStore & { scopeMatrix?: ScopeRequirement[]; qualityGates?: QualityGate[] };
  return {
    ...data,
    version: CURRENT_SCHEMA_VERSION,
    scopeMatrix: installInitialScope(extended.scopeMatrix || []),
    qualityGates: installInitialGates(extended.qualityGates || []),
  };
}

export function loadStore(): DataStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultStore();
    const parsed = JSON.parse(raw);
    if (validateStore(parsed)) {
      return migrateStore(parsed);
    }
    console.warn('Datos almacenados inválidos. Iniciando con almacén vacío.');
    return getDefaultStore();
  } catch (e) {
    console.error('Error al cargar datos:', e);
    return getDefaultStore();
  }
}

export function saveStore(store: DataStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Error al guardar datos:', e);
  }
}

export function generateId(): string {
  return uuidv4();
}

// Project operations
export function createProject(store: DataStore, input: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'archived'>): DataStore {
  const now = new Date().toISOString();
  const project: Project = { ...input, id: generateId(), createdAt: now, updatedAt: now, archived: false };
  return { ...store, projects: [...store.projects, project] };
}

export function updateProject(store: DataStore, id: string, input: Partial<Project>): DataStore {
  return {
    ...store,
    projects: store.projects.map(p => p.id === id ? { ...p, ...input, updatedAt: new Date().toISOString() } : p),
  };
}

export function deleteProject(store: DataStore, id: string): DataStore {
  return {
    ...store,
    projects: store.projects.filter(p => p.id !== id),
    tasks: store.tasks.filter(t => t.projectId !== id),
    artifacts: store.artifacts.filter(a => a.projectId !== id),
  };
}

// Task operations
export function createTask(store: DataStore, input: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): DataStore {
  const now = new Date().toISOString();
  const task: Task = { ...input, id: generateId(), createdAt: now, updatedAt: now };
  return { ...store, tasks: [...store.tasks, task] };
}

export function updateTask(store: DataStore, id: string, input: Partial<Task>): DataStore {
  return {
    ...store,
    tasks: store.tasks.map(t => t.id === id ? { ...t, ...input, updatedAt: new Date().toISOString() } : t),
  };
}

export function deleteTask(store: DataStore, id: string): DataStore {
  return { ...store, tasks: store.tasks.filter(t => t.id !== id) };
}

// Artifact operations
export function createArtifact(store: DataStore, input: Omit<Artifact, 'id' | 'createdAt' | 'updatedAt'>): DataStore {
  const now = new Date().toISOString();
  const artifact: Artifact = { ...input, id: generateId(), createdAt: now, updatedAt: now };
  return { ...store, artifacts: [...store.artifacts, artifact] };
}

export function updateArtifact(store: DataStore, id: string, input: Partial<Artifact>): DataStore {
  return {
    ...store,
    artifacts: store.artifacts.map(a => a.id === id ? { ...a, ...input, updatedAt: new Date().toISOString() } : a),
  };
}

export function deleteArtifact(store: DataStore, id: string): DataStore {
  return { ...store, artifacts: store.artifacts.filter(a => a.id !== id) };
}

// Evidence operations
export function createEvidence(store: DataStore, input: Omit<Evidence, 'id' | 'createdAt'>): DataStore {
  const evidence: Evidence = { ...input, id: generateId(), createdAt: new Date().toISOString() };
  return { ...store, evidence: [...store.evidence, evidence] };
}

export function updateEvidence(store: DataStore, id: string, input: Partial<Evidence>): DataStore {
  return {
    ...store,
    evidence: store.evidence.map(e => e.id === id ? { ...e, ...input } : e),
  };
}

export function deleteEvidence(store: DataStore, id: string): DataStore {
  return { ...store, evidence: store.evidence.filter(e => e.id !== id) };
}

// Scope Matrix operations (Phase 0.1)
export function createScopeRequirement(store: DataStore, input: Omit<ScopeRequirement, 'id' | 'createdAt' | 'updatedAt' | 'archived'>): DataStore {
  const now = new Date().toISOString();
  const req: ScopeRequirement = { ...input, id: generateId(), createdAt: now, updatedAt: now, archived: false };
  return { ...store, scopeMatrix: [...(store.scopeMatrix || []), req] };
}

export function updateScopeRequirement(store: DataStore, id: string, input: Partial<ScopeRequirement>): DataStore {
  return {
    ...store,
    scopeMatrix: (store.scopeMatrix || []).map(r => r.id === id ? { ...r, ...input, updatedAt: new Date().toISOString() } : r),
  };
}

export function deleteScopeRequirement(store: DataStore, id: string): DataStore {
  return {
    ...store,
    scopeMatrix: (store.scopeMatrix || []).filter(r => r.id !== id),
  };
}

// Quality Gates operations (Phase 0.1)
export function updateQualityGate(store: DataStore, id: string, input: Partial<QualityGate>): DataStore {
  return {
    ...store,
    qualityGates: (store.qualityGates || []).map(g => g.id === id ? { ...g, ...input, updatedAt: new Date().toISOString() } : g),
  };
}

// Export/Import
export function exportData(store: DataStore): string {
  return JSON.stringify(store, null, 2);
}

export function importData(json: string): DataStore | null {
  try {
    const parsed = JSON.parse(json);
    if (validateStore(parsed)) {
      return migrateStore(parsed);
    }
    return null;
  } catch {
    return null;
  }
}

export function resetStore(): DataStore {
  return getDefaultStore();
}

// System checks
export function getSystemStatus() {
  return {
    localStorage: typeof window !== 'undefined' && 'localStorage' in window,
    online: typeof navigator !== 'undefined' ? navigator.onLine : false,
    browser: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
  };
}
