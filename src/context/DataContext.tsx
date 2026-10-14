import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { DataStore, Project, Task, Artifact, Evidence, AppSettings } from '../types';
import { loadStore, saveStore, createProject, updateProject, deleteProject, createTask, updateTask, deleteTask, createArtifact, updateArtifact, deleteArtifact, createEvidence, updateEvidence, deleteEvidence, importData, exportData, resetStore } from '../services/storage';

interface DataContextType {
  store: DataStore;
  // Projects
  addProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'archived'>) => void;
  editProject: (id: string, data: Partial<Project>) => void;
  removeProject: (id: string) => void;
  // Tasks
  addTask: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editTask: (id: string, data: Partial<Task>) => void;
  removeTask: (id: string) => void;
  // Artifacts
  addArtifact: (data: Omit<Artifact, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editArtifact: (id: string, data: Partial<Artifact>) => void;
  removeArtifact: (id: string) => void;
  // Evidence
  addEvidence: (data: Omit<Evidence, 'id' | 'createdAt'>) => void;
  editEvidence: (id: string, data: Partial<Evidence>) => void;
  removeEvidence: (id: string) => void;
  // Settings
  updateSettings: (data: Partial<AppSettings>) => void;
  // Import/Export
  exportAllData: () => string;
  importAllData: (json: string) => boolean;
  resetAllData: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<DataStore>(loadStore);

  useEffect(() => {
    saveStore(store);
  }, [store]);

  const addProject = useCallback((data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'archived'>) => {
    setStore(s => createProject(s, data));
  }, []);

  const editProject = useCallback((id: string, data: Partial<Project>) => {
    setStore(s => updateProject(s, id, data));
  }, []);

  const removeProject = useCallback((id: string) => {
    setStore(s => deleteProject(s, id));
  }, []);

  const addTask = useCallback((data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    setStore(s => createTask(s, data));
  }, []);

  const editTask = useCallback((id: string, data: Partial<Task>) => {
    setStore(s => updateTask(s, id, data));
  }, []);

  const removeTask = useCallback((id: string) => {
    setStore(s => deleteTask(s, id));
  }, []);

  const addArtifact = useCallback((data: Omit<Artifact, 'id' | 'createdAt' | 'updatedAt'>) => {
    setStore(s => createArtifact(s, data));
  }, []);

  const editArtifact = useCallback((id: string, data: Partial<Artifact>) => {
    setStore(s => updateArtifact(s, id, data));
  }, []);

  const removeArtifact = useCallback((id: string) => {
    setStore(s => deleteArtifact(s, id));
  }, []);

  const addEvidence = useCallback((data: Omit<Evidence, 'id' | 'createdAt'>) => {
    setStore(s => createEvidence(s, data));
  }, []);

  const editEvidence = useCallback((id: string, data: Partial<Evidence>) => {
    setStore(s => updateEvidence(s, id, data));
  }, []);

  const removeEvidence = useCallback((id: string) => {
    setStore(s => deleteEvidence(s, id));
  }, []);

  const updateSettings = useCallback((data: Partial<AppSettings>) => {
    setStore(s => ({ ...s, settings: { ...s.settings, ...data } }));
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

  return (
    <DataContext.Provider value={{
      store, addProject, editProject, removeProject,
      addTask, editTask, removeTask,
      addArtifact, editArtifact, removeArtifact,
      addEvidence, editEvidence, removeEvidence,
      updateSettings, exportAllData, importAllData, resetAllData,
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
