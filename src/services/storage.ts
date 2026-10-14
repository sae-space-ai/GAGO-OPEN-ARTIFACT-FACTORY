// GAGO OPEN ARTIFACT FACTORY - Local Storage Service
import { v4 as uuidv4 } from 'uuid';
import type { DataStore, Project, Task, Artifact, Evidence, AppSettings } from '../types';
import { SCHEMA_VERSION } from '../types';

const STORAGE_KEY = 'gago-factory-data';

function getDefaultSettings(): AppSettings {
  const saved = localStorage.getItem('gago-theme');
  return {
    theme: (saved as 'light' | 'dark') || 'dark',
    language: 'es',
    version: SCHEMA_VERSION,
  };
}

function getDefaultStore(): DataStore {
  return {
    version: SCHEMA_VERSION,
    projects: [],
    tasks: [],
    artifacts: [],
    evidence: [],
    settings: getDefaultSettings(),
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

export function loadStore(): DataStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultStore();
    const parsed = JSON.parse(raw);
    if (validateStore(parsed)) {
      return parsed;
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
export function createProject(store: DataStore, data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'archived'>): DataStore {
  const now = new Date().toISOString();
  const project: Project = { ...data, id: generateId(), createdAt: now, updatedAt: now, archived: false };
  return { ...store, projects: [...store.projects, project] };
}

export function updateProject(store: DataStore, id: string, data: Partial<Project>): DataStore {
  return {
    ...store,
    projects: store.projects.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p),
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
export function createTask(store: DataStore, data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): DataStore {
  const now = new Date().toISOString();
  const task: Task = { ...data, id: generateId(), createdAt: now, updatedAt: now };
  return { ...store, tasks: [...store.tasks, task] };
}

export function updateTask(store: DataStore, id: string, data: Partial<Task>): DataStore {
  return {
    ...store,
    tasks: store.tasks.map(t => t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t),
  };
}

export function deleteTask(store: DataStore, id: string): DataStore {
  return { ...store, tasks: store.tasks.filter(t => t.id !== id) };
}

// Artifact operations
export function createArtifact(store: DataStore, data: Omit<Artifact, 'id' | 'createdAt' | 'updatedAt'>): DataStore {
  const now = new Date().toISOString();
  const artifact: Artifact = { ...data, id: generateId(), createdAt: now, updatedAt: now };
  return { ...store, artifacts: [...store.artifacts, artifact] };
}

export function updateArtifact(store: DataStore, id: string, data: Partial<Artifact>): DataStore {
  return {
    ...store,
    artifacts: store.artifacts.map(a => a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a),
  };
}

export function deleteArtifact(store: DataStore, id: string): DataStore {
  return { ...store, artifacts: store.artifacts.filter(a => a.id !== id) };
}

// Evidence operations
export function createEvidence(store: DataStore, data: Omit<Evidence, 'id' | 'createdAt'>): DataStore {
  const evidence: Evidence = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  return { ...store, evidence: [...store.evidence, evidence] };
}

export function updateEvidence(store: DataStore, id: string, data: Partial<Evidence>): DataStore {
  return {
    ...store,
    evidence: store.evidence.map(e => e.id === id ? { ...e, ...data } : e),
  };
}

export function deleteEvidence(store: DataStore, id: string): DataStore {
  return { ...store, evidence: store.evidence.filter(e => e.id !== id) };
}

// Export/Import
export function exportData(store: DataStore): string {
  return JSON.stringify(store, null, 2);
}

export function importData(json: string): DataStore | null {
  try {
    const parsed = JSON.parse(json);
    if (validateStore(parsed)) {
      return parsed;
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
