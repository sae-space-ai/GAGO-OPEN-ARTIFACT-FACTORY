// GAGO Open Artifact Factory - Dependency Analyzer
// Phase 8: JOULE AUTONOMOUS APPROVAL ENGINE

import type { ModuleManifest, DependencyGraph } from '../../types/approval';

/**
 * Construye el grafo de dependencias completo
 */
export function buildDependencyGraph(modules: ModuleManifest[]): DependencyGraph[] {
  return modules.map(module => {
    const dependencies = module.dependencies.map(depId => {
      const depModule = modules.find(m => m.id === depId);
      return {
        id: depId,
        type: 'required' as const,
        status: depModule?.status || 'NOT_IMPLEMENTED'
      };
    });

    const dependents = modules
      .filter(m => m.dependencies.includes(module.id))
      .map(m => ({
        id: m.id,
        type: 'required' as const
      }));

    const cycles = detectCycles(module.id, modules);

    return {
      moduleId: module.id,
      dependencies,
      dependents,
      cycles
    };
  });
}

/**
 * Detecta ciclos en el grafo de dependencias
 */
function detectCycles(startId: string, modules: ModuleManifest[]): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const path: string[] = [];

  function dfs(moduleId: string): void {
    if (path.includes(moduleId)) {
      const cycleStart = path.indexOf(moduleId);
      cycles.push(path.slice(cycleStart));
      return;
    }

    if (visited.has(moduleId)) return;

    visited.add(moduleId);
    path.push(moduleId);

    const module = modules.find(m => m.id === moduleId);
    if (module) {
      for (const depId of module.dependencies) {
        dfs(depId);
      }
    }

    path.pop();
  }

  dfs(startId);
  return cycles;
}

/**
 * Verifica si todas las dependencias están satisfechas
 */
export function checkDependenciesSatisfied(
  module: ModuleManifest,
  modules: ModuleManifest[]
): { satisfied: boolean; unsatisfied: string[] } {
  const unsatisfied: string[] = [];

  for (const depId of module.dependencies) {
    const depModule = modules.find(m => m.id === depId);
    
    if (!depModule) {
      unsatisfied.push(depId);
      continue;
    }

    // Una dependencia está satisfecha si está implementada o aprobada
    const satisfiedStatuses = ['IMPLEMENTED', 'VERIFIED', 'AUTO_APPROVED'];
    if (!satisfiedStatuses.includes(depModule.status)) {
      unsatisfied.push(depId);
    }
  }

  return {
    satisfied: unsatisfied.length === 0,
    unsatisfied
  };
}

/**
 * Determina el orden topológico de evaluación
 */
export function getEvaluationOrder(modules: ModuleManifest[]): string[] {
  const order: string[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(moduleId: string): void {
    if (visited.has(moduleId)) return;
    
    if (visiting.has(moduleId)) {
      throw new Error(`Ciclo de dependencias detectado en ${moduleId}`);
    }

    visiting.add(moduleId);

    const module = modules.find(m => m.id === moduleId);
    if (module) {
      for (const depId of module.dependencies) {
        visit(depId);
      }
    }

    visiting.delete(moduleId);
    visited.add(moduleId);
    order.push(moduleId);
  }

  for (const module of modules) {
    visit(module.id);
  }

  return order;
}

/**
 * Identifica módulos afectados por un cambio
 */
export function getAffectedModules(
  changedModuleId: string,
  modules: ModuleManifest[]
): string[] {
  const affected = new Set<string>();
  
  function findDependents(moduleId: string): void {
    for (const module of modules) {
      if (module.dependencies.includes(moduleId) && !affected.has(module.id)) {
        affected.add(module.id);
        findDependents(module.id);
      }
    }
  }

  findDependents(changedModuleId);
  return Array.from(affected);
}

/**
 * Verifica si existe un ciclo de dependencias
 */
export function hasDependencyCycle(modules: ModuleManifest[]): boolean {
  try {
    getEvaluationOrder(modules);
    return false;
  } catch {
    return true;
  }
}

/**
 * Obtiene las dependencias transitivas de un módulo
 */
export function getTransitiveDependencies(
  moduleId: string,
  modules: ModuleManifest[]
): string[] {
  const dependencies = new Set<string>();
  
  function collectDeps(id: string): void {
    const module = modules.find(m => m.id === id);
    if (module) {
      for (const depId of module.dependencies) {
        if (!dependencies.has(depId)) {
          dependencies.add(depId);
          collectDeps(depId);
        }
      }
    }
  }

  collectDeps(moduleId);
  return Array.from(dependencies);
}
