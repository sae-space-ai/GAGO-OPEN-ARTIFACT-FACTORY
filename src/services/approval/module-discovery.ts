// GAGO Open Artifact Factory - Module Discovery Engine
// Phase 8: JOULE AUTONOMOUS APPROVAL ENGINE

import type { ModuleManifest, RiskLevel } from '../../types/approval';
import { generateId } from '../storage';

/**
 * Catálogo de módulos conocidos de la factoría
 */
export function discoverModules(): ModuleManifest[] {
  const now = new Date().toISOString();

  return [
    // Fase 0 - Núcleo
    {
      id: 'module-projects',
      name: 'Gestión de Proyectos',
      version: '1.0.0',
      category: 'core',
      phase: '0',
      description: 'Sistema de gestión de proyectos con CRUD completo',
      dependencies: [],
      requirements: ['req-projects-crud', 'req-projects-persistence'],
      components: ['Projects.tsx'],
      tests: ['storage.test.ts'],
      evidences: [],
      criticality: 'MEDIUM',
      status: 'IMPLEMENTED',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'module-tasks',
      name: 'Gestión de Tareas',
      version: '1.0.0',
      category: 'core',
      phase: '0',
      description: 'Sistema de gestión de tareas asociadas a proyectos',
      dependencies: ['module-projects'],
      requirements: ['req-tasks-crud', 'req-tasks-association'],
      components: ['Tasks.tsx'],
      tests: ['storage.test.ts'],
      evidences: [],
      criticality: 'MEDIUM',
      status: 'IMPLEMENTED',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'module-artifacts',
      name: 'Registro de Artefactos',
      version: '1.0.0',
      category: 'core',
      phase: '0',
      description: 'Catálogo de artefactos digitales producidos',
      dependencies: ['module-projects'],
      requirements: ['req-artifacts-crud', 'req-artifacts-export'],
      components: ['Artifacts.tsx'],
      tests: ['storage.test.ts'],
      evidences: [],
      criticality: 'MEDIUM',
      status: 'IMPLEMENTED',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'module-evidence',
      name: 'Registro de Evidencias',
      version: '1.0.0',
      category: 'core',
      phase: '0',
      description: 'Sistema de evidencias técnicas con clasificación',
      dependencies: ['module-projects', 'module-tasks', 'module-artifacts'],
      requirements: ['req-evidence-crud', 'req-evidence-classification'],
      components: ['Evidence.tsx'],
      tests: ['storage.test.ts'],
      evidences: [],
      criticality: 'HIGH',
      status: 'IMPLEMENTED',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'module-storage',
      name: 'Sistema de Almacenamiento',
      version: '1.0.0',
      category: 'infrastructure',
      phase: '0',
      description: 'Persistencia local con localStorage y migraciones',
      dependencies: [],
      requirements: ['req-storage-persistence', 'req-storage-migration'],
      components: ['storage.ts'],
      tests: ['storage.test.ts'],
      evidences: [],
      criticality: 'CRITICAL',
      status: 'IMPLEMENTED',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'module-settings',
      name: 'Configuración',
      version: '1.0.0',
      category: 'core',
      phase: '0',
      description: 'Preferencias de usuario y gestión de datos',
      dependencies: ['module-storage'],
      requirements: ['req-settings-theme', 'req-settings-export'],
      components: ['Settings.tsx'],
      tests: [],
      evidences: [],
      criticality: 'LOW',
      status: 'IMPLEMENTED',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'module-qwen-generator',
      name: 'Generador de Órdenes Qwen',
      version: '1.0.0',
      category: 'ai',
      phase: '0',
      description: 'Generación local de instrucciones para Qwen Coder',
      dependencies: ['module-projects'],
      requirements: ['req-qwen-generation', 'req-qwen-local'],
      components: ['QwenGenerator.tsx', 'qwen-generator.ts'],
      tests: ['qwen-generator.test.ts'],
      evidences: [],
      criticality: 'MEDIUM',
      status: 'IMPLEMENTED',
      createdAt: now,
      updatedAt: now
    },

    // Fase 0.1 - Matriz de Alcance
    {
      id: 'module-scope',
      name: 'Matriz de Alcance',
      version: '1.0.0',
      category: 'governance',
      phase: '0.1',
      description: 'Sistema de trazabilidad de requisitos',
      dependencies: ['module-storage'],
      requirements: ['req-scope-requirements', 'req-scope-dependencies'],
      components: ['ScopeMatrix.tsx', 'initial-scope.ts', 'dependencies.ts'],
      tests: ['scope.test.ts', 'dependencies.test.ts'],
      evidences: [],
      criticality: 'HIGH',
      status: 'IMPLEMENTED',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'module-quality-gates',
      name: 'Quality Gates',
      version: '1.0.0',
      category: 'governance',
      phase: '0.1',
      description: 'Puertas de validación automatizadas',
      dependencies: ['module-scope'],
      requirements: ['req-gates-validation', 'req-gates-automation'],
      components: ['QualityGates.tsx', 'quality-gates.ts'],
      tests: ['scope.test.ts'],
      evidences: [],
      criticality: 'CRITICAL',
      status: 'IMPLEMENTED',
      createdAt: now,
      updatedAt: now
    },

    // Fase 1 - JOULE
    {
      id: 'module-joule',
      name: 'JOULE Engine',
      version: '1.0.0',
      category: 'ai',
      phase: '1',
      description: 'Motor de optimización adaptativa de recursos',
      dependencies: ['module-storage'],
      requirements: ['req-joule-optimize', 'req-joule-policies'],
      components: ['joule/engine.ts', 'joule/optimize.ts', 'joule/predict.ts'],
      tests: ['joule.test.ts'],
      evidences: [],
      criticality: 'CRITICAL',
      status: 'IMPLEMENTED',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'module-joule-dashboard',
      name: 'JOULE Dashboard',
      version: '1.0.0',
      category: 'ui',
      phase: '1',
      description: 'Centro de mando del motor JOULE',
      dependencies: ['module-joule'],
      requirements: ['req-joule-ui', 'req-joule-metrics'],
      components: ['JouleDashboard.tsx'],
      tests: [],
      evidences: [],
      criticality: 'MEDIUM',
      status: 'IMPLEMENTED',
      createdAt: now,
      updatedAt: now
    },

    // Fase 2 - API Fabric
    {
      id: 'module-api-fabric',
      name: 'Universal API Fabric',
      version: '2.0.0',
      category: 'infrastructure',
      phase: '2',
      description: 'Infraestructura común de conectividad',
      dependencies: ['module-storage', 'module-joule'],
      requirements: ['req-api-registry', 'req-api-policy'],
      components: ['api-fabric/connector-registry.ts', 'api-fabric/free-tier-policy.ts'],
      tests: ['api-fabric.test.ts'],
      evidences: [],
      criticality: 'HIGH',
      status: 'IMPLEMENTED',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'module-api-control',
      name: 'API Control Center',
      version: '2.0.0',
      category: 'ui',
      phase: '2',
      description: 'Centro de control de integraciones',
      dependencies: ['module-api-fabric'],
      requirements: ['req-api-ui', 'req-api-metrics'],
      components: ['APIControlCenter.tsx'],
      tests: [],
      evidences: [],
      criticality: 'MEDIUM',
      status: 'IMPLEMENTED',
      createdAt: now,
      updatedAt: now
    },

    // Fase 3 - Connection Recovery
    {
      id: 'module-connection-recovery',
      name: 'Connection Recovery Engine',
      version: '3.0.0',
      category: 'infrastructure',
      phase: '3',
      description: 'Sistema de diagnóstico y recuperación de conexiones',
      dependencies: ['module-api-fabric'],
      requirements: ['req-connection-diagnosis', 'req-connection-recovery'],
      components: ['auto-config.ts', 'connection-recovery.ts'],
      tests: ['phase3.test.ts'],
      evidences: [],
      criticality: 'HIGH',
      status: 'IMPLEMENTED',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'module-connection-center',
      name: 'Connection Control Center',
      version: '3.0.0',
      category: 'ui',
      phase: '3',
      description: 'Centro de control de conexiones',
      dependencies: ['module-connection-recovery'],
      requirements: ['req-connection-ui'],
      components: ['ConnectionControlCenter.tsx'],
      tests: [],
      evidences: [],
      criticality: 'MEDIUM',
      status: 'IMPLEMENTED',
      createdAt: now,
      updatedAt: now
    },

    // Fase 4 - JOULE MATS
    {
      id: 'module-joule-mats',
      name: 'JOULE Multi Agent Training System',
      version: '4.0.0',
      category: 'ai',
      phase: '4',
      description: 'Sistema de entrenamiento multiagente',
      dependencies: ['module-joule'],
      requirements: ['req-mats-agents', 'req-mats-training'],
      components: ['joule-mats/orchestrator.ts', 'joule-mats/agents/'],
      tests: ['joule-mats.test.ts'],
      evidences: [],
      criticality: 'HIGH',
      status: 'IMPLEMENTED',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'module-training-center',
      name: 'JOULE Training Center',
      version: '4.0.0',
      category: 'ui',
      phase: '4',
      description: 'Centro de entrenamiento de agentes',
      dependencies: ['module-joule-mats'],
      requirements: ['req-training-ui'],
      components: ['JouleTrainingCenter.tsx'],
      tests: [],
      evidences: [],
      criticality: 'MEDIUM',
      status: 'IMPLEMENTED',
      createdAt: now,
      updatedAt: now
    },

    // Fase 5 - Control Plane
    {
      id: 'module-tool-factory',
      name: 'Tool Factory',
      version: '5.0.0',
      category: 'development',
      phase: '5',
      description: 'Generador de herramientas digitales',
      dependencies: ['module-storage'],
      requirements: ['req-tools-generation', 'req-tools-templates'],
      components: ['ToolFactory.tsx', 'tool-factory.ts'],
      tests: ['tool-factory.test.ts'],
      evidences: [],
      criticality: 'MEDIUM',
      status: 'IMPLEMENTED',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'module-model-registry',
      name: 'Model Registry',
      version: '5.0.0',
      category: 'ai',
      phase: '5',
      description: 'Catálogo de modelos de IA',
      dependencies: ['module-storage'],
      requirements: ['req-models-registry'],
      components: ['ModelRegistry.tsx'],
      tests: [],
      evidences: [],
      criticality: 'MEDIUM',
      status: 'IMPLEMENTED',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'module-global-overview',
      name: 'Global Overview',
      version: '5.0.0',
      category: 'ui',
      phase: '5',
      description: 'Centro de mando general',
      dependencies: ['module-projects', 'module-tasks', 'module-joule'],
      requirements: ['req-overview-metrics'],
      components: ['GlobalOverview.tsx'],
      tests: [],
      evidences: [],
      criticality: 'LOW',
      status: 'IMPLEMENTED',
      createdAt: now,
      updatedAt: now
    },

    // Fase 6 - Universal Integrations Hub
    {
      id: 'module-integrations-hub',
      name: 'Universal Integrations Hub',
      version: '6.0.0',
      category: 'infrastructure',
      phase: '6',
      description: 'Centro universal de integraciones',
      dependencies: ['module-api-fabric', 'module-joule'],
      requirements: ['req-integrations-hub', 'req-integrations-discovery'],
      components: ['integrations/registry.ts', 'integrations/discovery.ts'],
      tests: [],
      evidences: [],
      criticality: 'HIGH',
      status: 'IMPLEMENTED',
      createdAt: now,
      updatedAt: now
    }
  ];
}

/**
 * Instala los módulos descubiertos de forma idempotente
 */
export function installDiscoveredModules(existing: ModuleManifest[]): ModuleManifest[] {
  const existingIds = new Set(existing.map(m => m.id));
  const discovered = discoverModules();
  const toAdd = discovered.filter(m => !existingIds.has(m.id));
  return [...existing, ...toAdd];
}

/**
 * Busca un módulo por ID
 */
export function findModule(modules: ModuleManifest[], id: string): ModuleManifest | undefined {
  return modules.find(m => m.id === id);
}

/**
 * Busca módulos por fase
 */
export function findModulesByPhase(modules: ModuleManifest[], phase: string): ModuleManifest[] {
  return modules.filter(m => m.phase === phase);
}

/**
 * Busca módulos por categoría
 */
export function findModulesByCategory(modules: ModuleManifest[], category: string): ModuleManifest[] {
  return modules.filter(m => m.category === category);
}

/**
 * Actualiza el estado de un módulo
 */
export function updateModuleStatus(
  modules: ModuleManifest[],
  id: string,
  status: ModuleManifest['status']
): ModuleManifest[] {
  return modules.map(m =>
    m.id === id ? { ...m, status, updatedAt: new Date().toISOString() } : m
  );
}
