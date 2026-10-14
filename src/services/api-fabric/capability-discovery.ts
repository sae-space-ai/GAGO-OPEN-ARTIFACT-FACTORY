// GAGO OPEN ARTIFACT FACTORY - Capability Discovery Engine
// Fase 2 - Universal API Fabric
// Descubre automáticamente las capacidades necesarias de los módulos

import type { CapabilityRequirement, ConnectorCategory } from '../../types/api-fabric';
import { generateId } from '../storage';

/**
 * Inventario de capacidades conocidas de los módulos de la factoría.
 * Este inventario se construye estáticamente a partir del análisis del código.
 */
export function discoverCapabilities(): CapabilityRequirement[] {
  const now = new Date().toISOString();

  return [
    // Módulo: Proyectos
    {
      id: 'cap-projects-github',
      moduleId: 'module-projects',
      moduleName: 'Gestión de Proyectos',
      capabilityName: 'Sincronización con GitHub',
      capabilityDescription: 'Vincular proyectos con repositorios de GitHub',
      category: 'repository',
      priority: 'medium',
      requiresAuth: true,
      autoConnectEligible: false, // Requiere autorización
      detectedAutomatically: true,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    },

    // Módulo: Tareas
    {
      id: 'cap-tasks-github-issues',
      moduleId: 'module-tasks',
      moduleName: 'Gestión de Tareas',
      capabilityName: 'Vinculación con GitHub Issues',
      capabilityDescription: 'Crear y consultar issues de GitHub desde tareas',
      category: 'repository',
      priority: 'medium',
      requiresAuth: true,
      autoConnectEligible: false,
      detectedAutomatically: true,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    },

    // Módulo: Artefactos
    {
      id: 'cap-artifacts-storage',
      moduleId: 'module-artifacts',
      moduleName: 'Registro de Artefactos',
      capabilityName: 'Almacenamiento de Versiones',
      capabilityDescription: 'Almacenar versiones de artefactos en Supabase o similar',
      category: 'storage',
      priority: 'low',
      requiresAuth: true,
      autoConnectEligible: false,
      detectedAutomatically: true,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    },

    // Módulo: Evidencias
    {
      id: 'cap-evidence-github-actions',
      moduleId: 'module-evidence',
      moduleName: 'Registro de Evidencias',
      capabilityName: 'Resultados de GitHub Actions',
      capabilityDescription: 'Importar resultados de workflows como evidencias',
      category: 'repository',
      priority: 'high',
      requiresAuth: true,
      autoConnectEligible: false,
      detectedAutomatically: true,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    },

    // Módulo: Matriz de Alcance
    {
      id: 'cap-scope-requirements',
      moduleId: 'module-scope',
      moduleName: 'Matriz de Alcance',
      capabilityName: 'Vinculación con APIs',
      capabilityDescription: 'Relacionar requisitos con capacidades de API',
      category: 'internal',
      priority: 'high',
      requiresAuth: false,
      autoConnectEligible: true,
      detectedAutomatically: true,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    },

    // Módulo: Quality Gates
    {
      id: 'cap-gates-verification',
      moduleId: 'module-gates',
      moduleName: 'Quality Gates',
      capabilityName: 'Verificación Automatizada',
      capabilityDescription: 'Ejecutar pruebas automatizadas y registrar resultados',
      category: 'internal',
      priority: 'critical',
      requiresAuth: false,
      autoConnectEligible: true,
      detectedAutomatically: true,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    },

    // Módulo: Generador Qwen
    {
      id: 'cap-qwen-generation',
      moduleId: 'module-qwen',
      moduleName: 'Generador de Órdenes Qwen',
      capabilityName: 'Generación de Código con IA',
      capabilityDescription: 'Generar código mediante modelos de IA',
      category: 'ai_provider',
      priority: 'high',
      requiresAuth: true,
      autoConnectEligible: false, // Requiere API key y backend
      detectedAutomatically: true,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    },

    // Módulo: JOULE
    {
      id: 'cap-joule-optimization',
      moduleId: 'module-joule',
      moduleName: 'JOULE',
      capabilityName: 'Optimización de Recursos',
      capabilityDescription: 'Seleccionar rutas óptimas para operaciones',
      category: 'internal',
      priority: 'critical',
      requiresAuth: false,
      autoConnectEligible: true,
      detectedAutomatically: true,
      status: 'verified', // Ya implementado en Fase 1
      connectorId: 'connector-joule',
      createdAt: now,
      updatedAt: now,
    },

    // Módulo: Configuración
    {
      id: 'cap-settings-export',
      moduleId: 'module-settings',
      moduleName: 'Configuración',
      capabilityName: 'Exportación a Google Drive',
      capabilityDescription: 'Exportar datos a Google Drive',
      category: 'document',
      priority: 'low',
      requiresAuth: true,
      autoConnectEligible: false,
      detectedAutomatically: true,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    },

    // Módulo: Dashboard
    {
      id: 'cap-dashboard-vercel',
      moduleId: 'module-dashboard',
      moduleName: 'Centro de Mando',
      capabilityName: 'Estado de Despliegue',
      capabilityDescription: 'Mostrar estado de despliegues en Vercel',
      category: 'deployment',
      priority: 'medium',
      requiresAuth: true,
      autoConnectEligible: false,
      detectedAutomatically: true,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    },

    // Capacidad: Inferencia Local
    {
      id: 'cap-local-inference',
      moduleId: 'module-ai',
      moduleName: 'Inferencia de IA',
      capabilityName: 'Ejecución Local de Modelos',
      capabilityDescription: 'Ejecutar modelos de IA localmente con Ollama',
      category: 'local_ai',
      priority: 'high',
      requiresAuth: false,
      autoConnectEligible: true, // No requiere auth, solo instalación local
      detectedAutomatically: true,
      status: 'available',
      connectorId: 'connector-ollama',
      createdAt: now,
      updatedAt: now,
    },

    // Capacidad: Automatización
    {
      id: 'cap-automation-n8n',
      moduleId: 'module-automation',
      moduleName: 'Automatización',
      capabilityName: 'Workflows con n8n',
      capabilityDescription: 'Ejecutar workflows automatizados con n8n',
      category: 'automation',
      priority: 'low',
      requiresAuth: true,
      autoConnectEligible: false,
      detectedAutomatically: true,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    },
  ];
}

/**
 * Instala las capacidades descubiertas de forma idempotente.
 */
export function installDiscoveredCapabilities(existing: CapabilityRequirement[]): CapabilityRequirement[] {
  const existingIds = new Set(existing.map(c => c.id));
  const discovered = discoverCapabilities();
  const toAdd = discovered.filter(c => !existingIds.has(c.id));
  return [...existing, ...toAdd];
}

/**
 * Actualiza el estado de una capacidad.
 */
export function updateCapabilityStatus(
  capabilities: CapabilityRequirement[],
  id: string,
  status: CapabilityRequirement['status'],
  connectorId?: string
): CapabilityRequirement[] {
  return capabilities.map(c =>
    c.id === id
      ? {
          ...c,
          status,
          connectorId: connectorId || c.connectorId,
          updatedAt: new Date().toISOString(),
        }
      : c
  );
}

/**
 * Busca capacidades por módulo.
 */
export function findCapabilitiesByModule(
  capabilities: CapabilityRequirement[],
  moduleId: string
): CapabilityRequirement[] {
  return capabilities.filter(c => c.moduleId === moduleId);
}

/**
 * Busca capacidades por categoría.
 */
export function findCapabilitiesByCategory(
  capabilities: CapabilityRequirement[],
  category: ConnectorCategory
): CapabilityRequirement[] {
  return capabilities.filter(c => c.category === category);
}

/**
 * Obtiene capacidades pendientes de conexión.
 */
export function getPendingCapabilities(capabilities: CapabilityRequirement[]): CapabilityRequirement[] {
  return capabilities.filter(c => c.status === 'pending' || c.status === 'discovered');
}

/**
 * Obtiene capacidades elegibles para autoconexión.
 */
export function getAutoConnectEligibleCapabilities(
  capabilities: CapabilityRequirement[]
): CapabilityRequirement[] {
  return capabilities.filter(c => c.autoConnectEligible && c.status === 'pending');
}
