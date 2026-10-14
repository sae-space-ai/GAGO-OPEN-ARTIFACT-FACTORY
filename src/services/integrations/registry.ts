// GAGO Open Artifact Factory - Universal Integration Registry
// Fase 6: Centro Universal de Integraciones

import type { IntegrationConnector, IntegrationCategory, IntegrationStatus } from '../../types/integrations';
import { generateId } from '../storage';

/**
 * Catálogo completo de integraciones disponibles
 */
export function getUniversalConnectors(): IntegrationConnector[] {
  const now = new Date().toISOString();

  return [
    // GitHub - Control de Versiones
    {
      id: 'github',
      name: 'GitHub',
      provider: 'GitHub Inc.',
      category: 'version_control',
      version: '2024-01',
      description: 'Plataforma de desarrollo colaborativo mediante Git',
      capabilities: [
        {
          id: 'github-repos',
          name: 'Repositorios',
          description: 'Gestión de repositorios Git',
          category: 'version_control',
          requiresAuth: false,
          isLocal: false,
          isFree: true,
          verified: false
        },
        {
          id: 'github-issues',
          name: 'Incidencias',
          description: 'Gestión de issues y tareas',
          category: 'version_control',
          requiresAuth: false,
          isLocal: false,
          isFree: true,
          verified: false
        },
        {
          id: 'github-actions',
          name: 'GitHub Actions',
          description: 'Automatización de workflows CI/CD',
          category: 'version_control',
          requiresAuth: true,
          isLocal: false,
          isFree: true,
          verified: false
        }
      ],
      operations: [
        {
          id: 'github-list-repos',
          name: 'Listar Repositorios',
          description: 'Obtener lista de repositorios públicos',
          method: 'GET',
          endpoint: 'https://api.github.com/user/repos',
          requiresAuth: false,
          permissions: ['read:org'],
          idempotent: true,
          rateLimited: true
        },
        {
          id: 'github-get-repo',
          name: 'Obtener Repositorio',
          description: 'Obtener información de un repositorio',
          method: 'GET',
          endpoint: 'https://api.github.com/repos/{owner}/{repo}',
          requiresAuth: false,
          permissions: [],
          idempotent: true,
          rateLimited: true
        }
      ],
      authType: 'github_app',
      requiredPermissions: ['read:org', 'repo'],
      restrictions: {
        maxRequests: 5000,
        maxConcurrent: 10,
        allowedOrigins: ['https://api.github.com']
      },
      costClassification: 'free_tier',
      quotas: {
        limit: 5000,
        period: 'hour',
        current: 0
      },
      technicalRequirements: {
        network: true,
        localService: false,
        browserCompatible: true,
        serverRequired: false
      },
      configStatus: 'NOT_CONFIGURED',
      connectionStatus: 'NOT_CONFIGURED',
      errors: [],
      dependencies: [],
      documentationUrl: 'https://docs.github.com/en/rest',
      evidenceIds: [],
      createdAt: now,
      updatedAt: now
    },

    // Vercel - Despliegue
    {
      id: 'vercel',
      name: 'Vercel',
      provider: 'Vercel Inc.',
      category: 'deployment',
      version: '2024-01',
      description: 'Plataforma de despliegue para aplicaciones frontend',
      capabilities: [
        {
          id: 'vercel-deployments',
          name: 'Despliegues',
          description: 'Gestión de despliegues de aplicaciones',
          category: 'deployment',
          requiresAuth: true,
          isLocal: false,
          isFree: true,
          verified: false
        }
      ],
      operations: [
        {
          id: 'vercel-list-deployments',
          name: 'Listar Despliegues',
          description: 'Obtener lista de despliegues',
          method: 'GET',
          endpoint: 'https://api.vercel.com/v6/deployments',
          requiresAuth: true,
          permissions: ['deployment:read'],
          idempotent: true,
          rateLimited: true
        }
      ],
      authType: 'bearer_token',
      requiredPermissions: ['deployment:read'],
      restrictions: {
        maxRequests: 1000,
        maxConcurrent: 5,
        allowedOrigins: ['https://api.vercel.com']
      },
      costClassification: 'free_tier',
      quotas: {
        limit: 1000,
        period: 'day',
        current: 0
      },
      technicalRequirements: {
        network: true,
        localService: false,
        browserCompatible: true,
        serverRequired: false
      },
      configStatus: 'NOT_CONFIGURED',
      connectionStatus: 'NOT_CONFIGURED',
      errors: [],
      dependencies: [],
      documentationUrl: 'https://vercel.com/docs/rest-api',
      evidenceIds: [],
      createdAt: now,
      updatedAt: now
    },

    // Qwen - Inferencia IA
    {
      id: 'qwen',
      name: 'Qwen',
      provider: 'Alibaba Cloud',
      category: 'ai_inference',
      version: '2024-01',
      description: 'Modelos de lenguaje de Alibaba Cloud',
      capabilities: [
        {
          id: 'qwen-code',
          name: 'Qwen Coder',
          description: 'Generación y análisis de código',
          category: 'ai_inference',
          requiresAuth: true,
          isLocal: false,
          isFree: false,
          verified: false
        }
      ],
      operations: [
        {
          id: 'qwen-generate',
          name: 'Generar Código',
          description: 'Generar código mediante IA',
          method: 'POST',
          endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
          requiresAuth: true,
          permissions: ['inference:execute'],
          idempotent: false,
          rateLimited: true
        }
      ],
      authType: 'api_key',
      requiredPermissions: ['inference:execute'],
      restrictions: {
        maxRequests: 100,
        maxConcurrent: 2,
        allowedOrigins: ['https://dashscope.aliyuncs.com']
      },
      costClassification: 'pay_per_use',
      quotas: {
        limit: 100,
        period: 'day',
        current: 0
      },
      technicalRequirements: {
        network: true,
        localService: false,
        browserCompatible: false,
        serverRequired: true
      },
      configStatus: 'AUTH_REQUIRED',
      connectionStatus: 'NOT_CONFIGURED',
      errors: [],
      dependencies: [],
      documentationUrl: 'https://help.aliyun.com/zh/dashscope/',
      evidenceIds: [],
      createdAt: now,
      updatedAt: now
    },

    // Ollama - IA Local
    {
      id: 'ollama',
      name: 'Ollama',
      provider: 'Local',
      category: 'ai_inference',
      version: '0.1.0',
      description: 'Ejecución local de modelos de lenguaje',
      capabilities: [
        {
          id: 'ollama-generate',
          name: 'Generación Local',
          description: 'Ejecutar modelos localmente',
          category: 'ai_inference',
          requiresAuth: false,
          isLocal: true,
          isFree: true,
          verified: false
        },
        {
          id: 'ollama-list-models',
          name: 'Listar Modelos',
          description: 'Consultar modelos disponibles',
          category: 'ai_inference',
          requiresAuth: false,
          isLocal: true,
          isFree: true,
          verified: false
        }
      ],
      operations: [
        {
          id: 'ollama-generate',
          name: 'Generar Texto',
          description: 'Generar texto con modelo local',
          method: 'POST',
          endpoint: 'http://localhost:11434/api/generate',
          requiresAuth: false,
          permissions: [],
          idempotent: false,
          rateLimited: false
        },
        {
          id: 'ollama-list-models',
          name: 'Listar Modelos',
          description: 'Obtener modelos instalados',
          method: 'GET',
          endpoint: 'http://localhost:11434/api/tags',
          requiresAuth: false,
          permissions: [],
          idempotent: true,
          rateLimited: false
        }
      ],
      authType: 'none',
      requiredPermissions: [],
      restrictions: {
        maxConcurrent: 1,
        allowedOrigins: ['http://localhost:11434']
      },
      costClassification: 'local_execution',
      quotas: {},
      technicalRequirements: {
        network: false,
        localService: true,
        browserCompatible: false,
        serverRequired: false
      },
      configStatus: 'NOT_CONFIGURED',
      connectionStatus: 'NOT_CONFIGURED',
      errors: [],
      dependencies: [],
      documentationUrl: 'https://github.com/ollama/ollama/blob/main/docs/api.md',
      evidenceIds: [],
      createdAt: now,
      updatedAt: now
    },

    // JOULE - Interno
    {
      id: 'joule',
      name: 'JOULE',
      provider: 'Interno',
      category: 'internal',
      version: '1.0.0',
      description: 'Motor de optimización adaptativa de recursos',
      capabilities: [
        {
          id: 'joule-optimize',
          name: 'Optimización',
          description: 'Seleccionar rutas óptimas',
          category: 'internal',
          requiresAuth: false,
          isLocal: true,
          isFree: true,
          verified: true
        },
        {
          id: 'joule-measure',
          name: 'Medición',
          description: 'Registrar y analizar métricas',
          category: 'internal',
          requiresAuth: false,
          isLocal: true,
          isFree: true,
          verified: true
        }
      ],
      operations: [
        {
          id: 'joule-optimize-route',
          name: 'Optimizar Ruta',
          description: 'Seleccionar mejor ruta de ejecución',
          method: 'POST',
          endpoint: 'internal://joule/optimize',
          requiresAuth: false,
          permissions: [],
          idempotent: true,
          rateLimited: false
        }
      ],
      authType: 'internal',
      requiredPermissions: [],
      restrictions: {},
      costClassification: 'local_execution',
      quotas: {},
      technicalRequirements: {
        network: false,
        localService: false,
        browserCompatible: true,
        serverRequired: false
      },
      configStatus: 'VERIFIED',
      connectionStatus: 'VERIFIED',
      lastVerified: now,
      errors: [],
      dependencies: [],
      documentationUrl: 'docs/JOULE.md',
      evidenceIds: [],
      createdAt: now,
      updatedAt: now
    },

    // Supabase - Almacenamiento
    {
      id: 'supabase',
      name: 'Supabase',
      provider: 'Supabase Inc.',
      category: 'storage',
      version: '2024-01',
      description: 'Base de datos PostgreSQL con autenticación',
      capabilities: [
        {
          id: 'supabase-query',
          name: 'Consultas',
          description: 'Leer y escribir en base de datos',
          category: 'storage',
          requiresAuth: true,
          isLocal: false,
          isFree: true,
          verified: false
        }
      ],
      operations: [
        {
          id: 'supabase-query',
          name: 'Ejecutar Consulta',
          description: 'Ejecutar consulta SQL',
          method: 'POST',
          endpoint: 'https://{project}.supabase.co/rest/v1/rpc/{function}',
          requiresAuth: true,
          permissions: ['database:read', 'database:write'],
          idempotent: false,
          rateLimited: true
        }
      ],
      authType: 'api_key',
      requiredPermissions: ['database:read', 'database:write'],
      restrictions: {
        maxRequests: 10000,
        maxConcurrent: 10,
        allowedOrigins: ['https://*.supabase.co']
      },
      costClassification: 'free_tier',
      quotas: {
        limit: 10000,
        period: 'month',
        current: 0
      },
      technicalRequirements: {
        network: true,
        localService: false,
        browserCompatible: true,
        serverRequired: false
      },
      configStatus: 'NOT_CONFIGURED',
      connectionStatus: 'NOT_CONFIGURED',
      errors: [],
      dependencies: [],
      documentationUrl: 'https://supabase.com/docs',
      evidenceIds: [],
      createdAt: now,
      updatedAt: now
    },

    // Google Drive - Documentos
    {
      id: 'google-drive',
      name: 'Google Drive',
      provider: 'Google',
      category: 'documents',
      version: 'v3',
      description: 'Almacenamiento de documentos en la nube',
      capabilities: [
        {
          id: 'gdrive-files',
          name: 'Archivos',
          description: 'Gestión de archivos y carpetas',
          category: 'documents',
          requiresAuth: true,
          isLocal: false,
          isFree: true,
          verified: false
        }
      ],
      operations: [
        {
          id: 'gdrive-list-files',
          name: 'Listar Archivos',
          description: 'Obtener lista de archivos',
          method: 'GET',
          endpoint: 'https://www.googleapis.com/drive/v3/files',
          requiresAuth: true,
          permissions: ['drive.readonly'],
          idempotent: true,
          rateLimited: true
        }
      ],
      authType: 'oauth2',
      requiredPermissions: ['drive.readonly'],
      restrictions: {
        maxRequests: 1200,
        maxConcurrent: 10,
        allowedOrigins: ['https://www.googleapis.com']
      },
      costClassification: 'free_tier',
      quotas: {
        limit: 1200,
        period: 'minute',
        current: 0
      },
      technicalRequirements: {
        network: true,
        localService: false,
        browserCompatible: true,
        serverRequired: false
      },
      configStatus: 'AUTH_REQUIRED',
      connectionStatus: 'NOT_CONFIGURED',
      errors: [],
      dependencies: [],
      documentationUrl: 'https://developers.google.com/drive/api/guides/about-sdk',
      evidenceIds: [],
      createdAt: now,
      updatedAt: now
    },

    // n8n - Automatización
    {
      id: 'n8n',
      name: 'n8n',
      provider: 'n8n Inc.',
      category: 'automation',
      version: '1.0',
      description: 'Plataforma de automatización de workflows',
      capabilities: [
        {
          id: 'n8n-workflows',
          name: 'Workflows',
          description: 'Ejecución de workflows automatizados',
          category: 'automation',
          requiresAuth: true,
          isLocal: false,
          isFree: true,
          verified: false
        }
      ],
      operations: [
        {
          id: 'n8n-execute-workflow',
          name: 'Ejecutar Workflow',
          description: 'Ejecutar un workflow específico',
          method: 'POST',
          endpoint: '{n8n_instance_url}/webhook/{webhook_id}',
          requiresAuth: true,
          permissions: ['workflow:execute'],
          idempotent: false,
          rateLimited: true
        }
      ],
      authType: 'api_key',
      requiredPermissions: ['workflow:execute'],
      restrictions: {
        maxRequests: 1000,
        maxConcurrent: 5,
        allowedOrigins: []
      },
      costClassification: 'local_execution',
      quotas: {},
      technicalRequirements: {
        network: true,
        localService: true,
        browserCompatible: false,
        serverRequired: true
      },
      configStatus: 'NOT_CONFIGURED',
      connectionStatus: 'NOT_CONFIGURED',
      errors: [],
      dependencies: [],
      documentationUrl: 'https://docs.n8n.io/api/',
      evidenceIds: [],
      createdAt: now,
      updatedAt: now
    }
  ];
}

/**
 * Instala los conectores universales de forma idempotente
 */
export function installUniversalConnectors(existing: IntegrationConnector[]): IntegrationConnector[] {
  const existingIds = new Set(existing.map(c => c.id));
  const universal = getUniversalConnectors();
  const toAdd = universal.filter(c => !existingIds.has(c.id));
  return [...existing, ...toAdd];
}

/**
 * Busca un conector por ID
 */
export function findConnector(connectors: IntegrationConnector[], id: string): IntegrationConnector | undefined {
  return connectors.find(c => c.id === id);
}

/**
 * Busca conectores por categoría
 */
export function findConnectorsByCategory(
  connectors: IntegrationConnector[], 
  category: IntegrationCategory
): IntegrationConnector[] {
  return connectors.filter(c => c.category === category);
}

/**
 * Busca conectores por estado
 */
export function findConnectorsByStatus(
  connectors: IntegrationConnector[], 
  status: IntegrationStatus
): IntegrationConnector[] {
  return connectors.filter(c => c.connectionStatus === status);
}

/**
 * Actualiza el estado de un conector
 */
export function updateConnectorStatus(
  connectors: IntegrationConnector[],
  id: string,
  configStatus: IntegrationStatus,
  connectionStatus: IntegrationStatus
): IntegrationConnector[] {
  return connectors.map(c =>
    c.id === id 
      ? { 
          ...c, 
          configStatus, 
          connectionStatus,
          updatedAt: new Date().toISOString() 
        } 
      : c
  );
}

/**
 * Añade un error a un conector
 */
export function addConnectorError(
  connectors: IntegrationConnector[],
  id: string,
  error: Omit<IntegrationConnector['errors'][0], 'id'>
): IntegrationConnector[] {
  return connectors.map(c =>
    c.id === id
      ? {
          ...c,
          errors: [...c.errors, { ...error, id: generateId() }],
          updatedAt: new Date().toISOString()
        }
      : c
  );
}

/**
 * Obtiene conectores verificados
 */
export function getVerifiedConnectors(connectors: IntegrationConnector[]): IntegrationConnector[] {
  return connectors.filter(c => c.connectionStatus === 'VERIFIED');
}

/**
 * Obtiene conectores gratuitos
 */
export function getFreeConnectors(connectors: IntegrationConnector[]): IntegrationConnector[] {
  return connectors.filter(c => 
    c.costClassification === 'free_permanent' ||
    c.costClassification === 'free_tier' ||
    c.costClassification === 'local_execution'
  );
}
