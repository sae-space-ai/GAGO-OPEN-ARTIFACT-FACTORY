import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { DataStore, Project, Task, Artifact, Evidence, AppSettings } from '../types';
import type { ScopeRequirement, QualityGate } from '../types/scope';
import type { JouleState } from '../types/joule';
import type { JouleMATSState } from '../types/joule-mats';
import { loadStore, saveStore, createProject, updateProject, deleteProject, createTask, updateTask, deleteTask, createArtifact, updateArtifact, deleteArtifact, createEvidence, updateEvidence, deleteEvidence, importData, exportData, resetStore, createScopeRequirement, updateScopeRequirement, deleteScopeRequirement, updateQualityGate, updateJouleState } from '../services/storage';

interface DataContextType {
  store: DataStore;
  // Projects
  addProject: (input: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'archived'>) => void;
  editProject: (id: string, input: Partial<Project>) => void;
  removeProject: (id: string) => void;
  // Tasks
  addTask: (input: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editTask: (id: string, input: Partial<Task>) => void;
  removeTask: (id: string) => void;
  // Artifacts
  addArtifact: (input: Omit<Artifact, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editArtifact: (id: string, input: Partial<Artifact>) => void;
  removeArtifact: (id: string) => void;
  // Evidence
  addEvidence: (input: Omit<Evidence, 'id' | 'createdAt'>) => void;
  editEvidence: (id: string, input: Partial<Evidence>) => void;
  removeEvidence: (id: string) => void;
  // Settings
  updateSettings: (input: Partial<AppSettings>) => void;
  // Import/Export
  exportAllData: () => string;
  importAllData: (json: string) => boolean;
  resetAllData: () => void;
  // Scope Matrix (Phase 0.1)
  addScopeRequirement: (input: Omit<ScopeRequirement, 'id' | 'createdAt' | 'updatedAt' | 'archived'>) => void;
  editScopeRequirement: (id: string, input: Partial<ScopeRequirement>) => void;
  removeScopeRequirement: (id: string) => void;
  // Quality Gates (Phase 0.1)
  editQualityGate: (id: string, input: Partial<QualityGate>) => void;
  // JOULE (Phase 1)
  updateJouleState: (jouleState: JouleState) => void;
  // JOULE MATS (Phase 4)
  updateJouleMATS: (jouleMATS: JouleMATSState) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<DataStore>(loadStore);

  useEffect(() => {
    saveStore(store);
  }, [store]);

  const addProject = useCallback((input: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'archived'>) => {
    setStore(s => createProject(s, input));
  }, []);

  const editProject = useCallback((id: string, input: Partial<Project>) => {
    setStore(s => updateProject(s, id, input));
  }, []);

  const removeProject = useCallback((id: string) => {
    setStore(s => deleteProject(s, id));
  }, []);

  const addTask = useCallback((input: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    setStore(s => createTask(s, input));
  }, []);

  const editTask = useCallback((id: string, input: Partial<Task>) => {
    setStore(s => updateTask(s, id, input));
  }, []);

  const removeTask = useCallback((id: string) => {
    setStore(s => deleteTask(s, id));
  }, []);

  const addArtifact = useCallback((input: Omit<Artifact, 'id' | 'createdAt' | 'updatedAt'>) => {
    setStore(s => createArtifact(s, input));
  }, []);

  const editArtifact = useCallback((id: string, input: Partial<Artifact>) => {
    setStore(s => updateArtifact(s, id, input));
  }, []);

  const removeArtifact = useCallback((id: string) => {
    setStore(s => deleteArtifact(s, id));
  }, []);

  const addEvidence = useCallback((input: Omit<Evidence, 'id' | 'createdAt'>) => {
    setStore(s => createEvidence(s, input));
  }, []);

  const editEvidence = useCallback((id: string, input: Partial<Evidence>) => {
    setStore(s => updateEvidence(s, id, input));
  }, []);

  const removeEvidence = useCallback((id: string) => {
    setStore(s => deleteEvidence(s, id));
  }, []);

  const updateSettings = useCallback((input: Partial<AppSettings>) => {
    setStore(s => ({ ...s, settings: { ...s.settings, ...input } }));
  }, []);

  const exportAllData = useCallback(() => {
    return exportData(store);
  }, [store]);

  const importAllData = useCallback((json: string) => {
    const result = importData(json);
    if (result) {
      setStore(result);
      return true;
    }
    return false;
  }, []);

  const resetAllData = useCallback(() => {
    setStore(resetStore());
  }, []);

  // Scope Matrix operations
  const addScopeRequirement = useCallback((input: Omit<ScopeRequirement, 'id' | 'createdAt' | 'updatedAt' | 'archived'>) => {
    setStore(s => createScopeRequirement(s, input));
  }, []);

  const editScopeRequirement = useCallback((id: string, input: Partial<ScopeRequirement>) => {
    setStore(s => updateScopeRequirement(s, id, input));
  }, []);

  const removeScopeRequirement = useCallback((id: string) => {
    setStore(s => deleteScopeRequirement(s, id));
  }, []);

  // Quality Gates operations
  const editQualityGate = useCallback((id: string, input: Partial<QualityGate>) => {
    setStore(s => updateQualityGate(s, id, input));
  }, []);

  // JOULE operations
  const updateJouleStateFn = useCallback((jouleState: JouleState) => {
    setStore(s => updateJouleState(s, jouleState));
  }, []);

  // JOULE MATS operations (Phase 4)
  const updateJouleMATS = useCallback((jouleMATS: JouleMATSState) => {
    setStore(s => ({ ...s, jouleMATS }));
  }, []);

  return (
    <DataContext.Provider value={{
      store, addProject, editProject, removeProject,
      addTask, editTask, removeTask,
      addArtifact, editArtifact, removeArtifact,
      addEvidence, editEvidence, removeEvidence,
      updateSettings, exportAllData, importAllData, resetAllData,
      addScopeRequirement, editScopeRequirement, removeScopeRequirement,
      editQualityGate,
      updateJouleState: updateJouleStateFn,
      updateJouleMATS,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextType {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
