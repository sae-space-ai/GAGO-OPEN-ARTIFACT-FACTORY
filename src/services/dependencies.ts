// GAGO OPEN ARTIFACT FACTORY - Dependency Graph Service
// Fase 0.1 — Detección de ciclos y validación de dependencias

import type { ScopeRequirement } from '../types/scope';

/**
 * Detecta si existe un ciclo en el grafo de dependencias a partir de un nodo.
 * Retorna true si agregar `fromId -> toId` crearía un ciclo.
 */
export function wouldCreateCycle(
  requirements: ScopeRequirement[],
  fromId: string,
  toId: string
): boolean {
  if (fromId === toId) return true; // No puede depender de sí mismo

  // BFS desde toId siguiendo sus dependencias; si llegamos a fromId hay ciclo
  const visited = new Set<string>();
  const queue: string[] = [toId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === fromId) return true;
    if (visited.has(current)) continue;
    visited.add(current);

    const req = requirements.find(r => r.id === current);
    if (!req) continue;
    for (const dep of req.dependencies) {
      if (!visited.has(dep)) queue.push(dep);
    }
  }
  return false;
}

/**
 * Detecta todos los ciclos existentes en el conjunto de requisitos.
 * Retorna un array de arrays con los IDs involucrados en cada ciclo.
 */
export function detectCycles(requirements: ScopeRequirement[]): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const inStack = new Set<string>();

  function dfs(id: string, path: string[]): boolean {
    if (inStack.has(id)) {
      const cycleStart = path.indexOf(id);
      if (cycleStart >= 0) {
        cycles.push(path.slice(cycleStart));
      }
      return true;
    }
    if (visited.has(id)) return false;

    visited.add(id);
    inStack.add(id);
    path.push(id);

    const req = requirements.find(r => r.id === id);
    if (req) {
      for (const dep of req.dependencies) {
        dfs(dep, [...path]);
      }
    }

    inStack.delete(id);
    return false;
  }

  for (const req of requirements) {
    if (!visited.has(req.id)) {
      dfs(req.id, []);
    }
  }

  return cycles;
}

/**
 * Valida las dependencias de un requisito.
 * Retorna un objeto con errores encontrados.
 */
export function validateDependencies(
  requirement: Partial<ScopeRequirement>,
  allRequirements: ScopeRequirement[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const deps = requirement.dependencies || [];

  // No puede depender de sí mismo
  if (requirement.id && deps.includes(requirement.id)) {
    errors.push('Un requisito no puede depender de sí mismo.');
  }

  // Todas las dependencias deben existir
  for (const depId of deps) {
    const exists = allRequirements.some(r => r.id === depId);
    if (!exists) {
      errors.push(`La dependencia "${depId}" no existe.`);
    }
  }

  // No debe crear ciclo
  if (requirement.id) {
    for (const depId of deps) {
      if (wouldCreateCycle(allRequirements, requirement.id, depId)) {
        errors.push(`La dependencia "${depId}" crearía un ciclo.`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Obtiene las dependencias transitivas de un requisito.
 */
export function getTransitiveDependencies(
  requirementId: string,
  requirements: ScopeRequirement[]
): string[] {
  const result = new Set<string>();
  const queue = [...(requirements.find(r => r.id === requirementId)?.dependencies || [])];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (result.has(current)) continue;
    result.add(current);
    const req = requirements.find(r => r.id === current);
    if (req) {
      for (const dep of req.dependencies) {
        if (!result.has(dep)) queue.push(dep);
      }
    }
  }

  return Array.from(result);
}

/**
 * Determina si un requisito está bloqueado por sus dependencias.
 * Un requisito está bloqueado si alguna dependencia no está implementada.
 */
export function isBlockedByDependencies(
  requirement: ScopeRequirement,
  requirements: ScopeRequirement[]
): { blocked: boolean; blockers: string[] } {
  const blockers: string[] = [];
  for (const depId of requirement.dependencies) {
    const dep = requirements.find(r => r.id === depId);
    if (!dep) {
      blockers.push(`Dependencia inexistente: ${depId}`);
    } else if (dep.implementationStatus !== 'implemented' && dep.implementationStatus !== 'discarded') {
      blockers.push(`${dep.code}: ${dep.name} (${dep.implementationStatus})`);
    }
  }
  return { blocked: blockers.length > 0, blockers };
}
