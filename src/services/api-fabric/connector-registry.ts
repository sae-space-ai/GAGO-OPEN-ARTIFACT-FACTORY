// GAGO OPEN ARTIFACT FACTORY - Connector Registry
// Fase 2 - Universal API Fabric

import type { Connector, ConnectorCategory, ConnectorStatus } from '../../types/api-fabric';
import { generateId } from '../storage';

/**
 * Catálogo inicial de conectores conocidos.
 * Todos los conectores comienzan en estado 'discovered' o 'available'.
 * Ninguno está verificado hasta que se realice una prueba real.
 */
export function getInitialConnectors(): Connector[] {
  const now = new Date().toISOString();

  return [
    // GitHub - Repositorio de código
    {
      id: 'connector-github',
      name: 'GitHub',
      provider: 'GitHub Inc.',
      category: 'repository',
      version: '2024-01',
      description: 'Plataforma de desarrollo colaborativo mediante Git',
      capabilities: [
        {
          id: 'github-repo-read',
          name: 'Lectura de Repositorios',
          description: 'Consultar repositorios, ramas, archivos y commits',
          category: 'repository',
          requiresAuth: false, // Lectura pública no requiere auth
          authMethod: 'none',
          endpoints: ['https://api.github.com/repos/{owner}/{repo}'],
          rateLimit: { requests: 60, period: 'hour' },
          costModel: 'free_tier',
          freeTierLimits: {
            requests: 60,
            period: 'hour',
            notes: 'Sin autenticación. Con token: 5000/hora',
          },
          verified: false,
        },
        {
          id: 'github-repo-write',
          name: 'Escritura en Repositorios',
          description: 'Crear commits, PRs, issues (requiere autorización)',
          category: 'repository',
          requiresAuth: true,
          authMethod: 'github_app',
          endpoints: ['https://api.github.com/repos/{owner}/{repo}/git/refs'],
          rateLimit: { requests: 5000, period: 'hour' },
          costModel: 'free_tier',
          freeTierLimits: {
            requests: 5000,
            period: 'hour',
            notes: 'Requiere GitHub App o token personal',
          },
          verified: false,
        },
        {
          id: 'github-actions',
          name: 'GitHub Actions',
          description: 'Consultar workflows y ejecuciones',
          category: 'repository',
          requiresAuth: true,
          authMethod: 'github_app',
          endpoints: ['https://api.github.com/repos/{owner}/{repo}/actions/runs'],
          rateLimit: { requests: 5000, period: 'hour' },
          costModel: 'free_tier',
          freeTierLimits: {
            requests: 2000,
            period: 'month',
            notes: '2000 minutos/mes para cuentas gratuitas',
          },
          verified: false,
        },
      ],
      status: 'available',
      authMethod: 'github_app',
      configurationRequired: ['github_app_id', 'github_private_key'],
      endpoints: {
        production: 'https://api.github.com',
        documentation: 'https://docs.github.com/en/rest',
      },
      costModel: 'free_tier',
      freeTierInfo: {
        limits: '60 req/h sin auth, 5000 req/h con auth',
        conditions: 'Uso razonable, no scraping masivo',
        verified: true,
        lastChecked: now,
      },
      securityRestrictions: [
        'No almacenar tokens en frontend',
        'Usar GitHub App con permisos mínimos',
        'No exponer claves privadas',
      ],
      documentationUrl: 'https://docs.github.com/en/rest',
      createdAt: now,
      updatedAt: now,
    },

    // Vercel - Despliegue
    {
      id: 'connector-vercel',
      name: 'Vercel',
      provider: 'Vercel Inc.',
      category: 'deployment',
      version: '2024-01',
      description: 'Plataforma de despliegue para aplicaciones frontend',
      capabilities: [
        {
          id: 'vercel-deploy-status',
          name: 'Estado de Despliegues',
          description: 'Consultar estado de despliegues existentes',
          category: 'deployment',
          requiresAuth: true,
          authMethod: 'bearer_token',
          endpoints: ['https://api.vercel.com/v13/deployments'],
          rateLimit: { requests: 100, period: 'hour' },
          costModel: 'free_tier',
          freeTierLimits: {
            requests: 100,
            period: 'hour',
            notes: 'Hobby plan: despliegues ilimitados, API limitada',
          },
          verified: false,
        },
      ],
      status: 'configuration_required',
      authMethod: 'bearer_token',
      configurationRequired: ['vercel_token'],
      endpoints: {
        production: 'https://api.vercel.com',
        documentation: 'https://vercel.com/docs/rest-api',
      },
      costModel: 'free_tier',
      freeTierInfo: {
        limits: 'Despliegues ilimitados en Hobby plan',
        conditions: 'Uso comercial requiere plan Pro',
        verified: true,
        lastChecked: now,
      },
      securityRestrictions: [
        'No almacenar tokens en frontend',
        'Usar integración nativa GitHub-Vercel cuando sea posible',
        'No activar funciones serverless sin autorización',
      ],
      documentationUrl: 'https://vercel.com/docs/rest-api',
      createdAt: now,
      updatedAt: now,
    },

    // Qwen - Proveedor de IA
    {
      id: 'connector-qwen',
      name: 'Qwen',
      provider: 'Alibaba Cloud',
      category: 'ai_provider',
      version: '2024-01',
      description: 'Modelos de lenguaje de Alibaba Cloud',
      capabilities: [
        {
          id: 'qwen-code',
          name: 'Qwen Coder',
          description: 'Generación y análisis de código',
          category: 'ai_provider',
          requiresAuth: true,
          authMethod: 'api_key',
          endpoints: ['https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'],
          costModel: 'pay_per_use',
          verified: false,
        },
      ],
      status: 'authorization_required',
      authMethod: 'api_key',
      configurationRequired: ['qwen_api_key', 'backend_proxy'],
      endpoints: {
        production: 'https://dashscope.aliyuncs.com',
        documentation: 'https://help.aliyun.com/zh/dashscope/',
      },
      costModel: 'pay_per_use',
      securityRestrictions: [
        'Requiere backend seguro para credenciales',
        'No exponer API key en frontend',
        'Verificar cuotas y precios antes de usar',
        'No es gratuito por defecto',
      ],
      documentationUrl: 'https://help.aliyun.com/zh/dashscope/',
      createdAt: now,
      updatedAt: now,
    },

    // Ollama - IA Local
    {
      id: 'connector-ollama',
      name: 'Ollama',
      provider: 'Local',
      category: 'local_ai',
      version: '0.1.0',
      description: 'Ejecución local de modelos de lenguaje',
      capabilities: [
        {
          id: 'ollama-generate',
          name: 'Generación Local',
          description: 'Ejecutar modelos localmente mediante Ollama',
          category: 'local_ai',
          requiresAuth: false,
          authMethod: 'none',
          endpoints: ['http://localhost:11434/api/generate'],
          costModel: 'local_execution',
          verified: false,
        },
        {
          id: 'ollama-list-models',
          name: 'Listar Modelos',
          description: 'Consultar modelos disponibles localmente',
          category: 'local_ai',
          requiresAuth: false,
          authMethod: 'none',
          endpoints: ['http://localhost:11434/api/tags'],
          costModel: 'local_execution',
          verified: false,
        },
      ],
      status: 'available',
      authMethod: 'none',
      configurationRequired: ['ollama_installed', 'ollama_server_running'],
      endpoints: {
        production: 'http://localhost:11434',
        documentation: 'https://github.com/ollama/ollama/blob/main/docs/api.md',
      },
      costModel: 'local_execution',
      freeTierInfo: {
        limits: 'Sin límites de API (recursos locales)',
        conditions: 'Requiere instalación local y recursos suficientes',
        verified: true,
        lastChecked: now,
      },
      securityRestrictions: [
        'Solo accesible desde localhost',
        'No exponer a Internet sin autorización',
        'Consumo de recursos locales (CPU/RAM)',
        'No disponible desde Vercel',
      ],
      documentationUrl: 'https://github.com/ollama/ollama/blob/main/docs/api.md',
      createdAt: now,
      updatedAt: now,
    },

    // JOULE - Motor interno
    {
      id: 'connector-joule',
      name: 'JOULE',
      provider: 'Interno',
      category: 'internal',
      version: '1.0.0',
      description: 'Motor de optimización adaptativa de recursos',
      capabilities: [
        {
          id: 'joule-optimize',
          name: 'Optimización de Rutas',
          description: 'Seleccionar la ruta más eficiente para una operación',
          category: 'internal',
          requiresAuth: false,
          authMethod: 'internal',
          endpoints: ['internal://joule/optimize'],
          costModel: 'local_execution',
          verified: true,
          lastVerified: now,
        },
        {
          id: 'joule-measure',
          name: 'Medición de Operaciones',
          description: 'Registrar y analizar métricas de operaciones',
          category: 'internal',
          requiresAuth: false,
          authMethod: 'internal',
          endpoints: ['internal://joule/observe'],
          costModel: 'local_execution',
          verified: true,
          lastVerified: now,
        },
      ],
      status: 'verified',
      authMethod: 'internal',
      configurationRequired: [],
      endpoints: {
        production: 'internal://joule',
        documentation: 'docs/JOULE.md',
      },
      costModel: 'local_execution',
      freeTierInfo: {
        limits: 'Sin límites (ejecución local)',
        conditions: 'Siempre disponible',
        verified: true,
        lastChecked: now,
      },
      securityRestrictions: [
        'No accede a credenciales externas',
        'No activa proveedores de pago automáticamente',
        'Respeta políticas de calidad y seguridad',
      ],
      documentationUrl: 'docs/JOULE.md',
      createdAt: now,
      updatedAt: now,
    },

    // Supabase - Almacenamiento (opcional)
    {
      id: 'connector-supabase',
      name: 'Supabase',
      provider: 'Supabase Inc.',
      category: 'storage',
      version: '2024-01',
      description: 'Base de datos PostgreSQL con autenticación y almacenamiento',
      capabilities: [
        {
          id: 'supabase-query',
          name: 'Consultas de Base de Datos',
          description: 'Leer y escribir en base de datos PostgreSQL',
          category: 'storage',
          requiresAuth: true,
          authMethod: 'api_key',
          endpoints: ['https://{project}.supabase.co/rest/v1/'],
          costModel: 'free_tier',
          freeTierLimits: {
            requests: -1, // Ilimitado en free tier
            period: 'month',
            notes: '500MB base de datos, 1GB almacenamiento, 2GB transferencia',
          },
          verified: false,
        },
      ],
      status: 'configuration_required',
      authMethod: 'api_key',
      configurationRequired: ['supabase_url', 'supabase_anon_key'],
      endpoints: {
        production: 'https://supabase.com',
        documentation: 'https://supabase.com/docs',
      },
      costModel: 'free_tier',
      freeTierInfo: {
        limits: '500MB DB, 1GB storage, 2GB transfer/mes',
        conditions: 'Free tier permanente con limitaciones',
        verified: true,
        lastChecked: now,
      },
      securityRestrictions: [
        'No exponer service_role key en frontend',
        'Usar Row Level Security para datos privados',
        'anon_key es segura para frontend',
        'No desactivar RLS para simplificar',
      ],
      documentationUrl: 'https://supabase.com/docs',
      createdAt: now,
      updatedAt: now,
    },

    // Google Drive - Documentos (opcional)
    {
      id: 'connector-google-drive',
      name: 'Google Drive',
      provider: 'Google',
      category: 'document',
      version: 'v3',
      description: 'Almacenamiento de documentos en la nube',
      capabilities: [
        {
          id: 'gdrive-files',
          name: 'Gestión de Archivos',
          description: 'Listar, subir y descargar archivos',
          category: 'document',
          requiresAuth: true,
          authMethod: 'oauth2',
          endpoints: ['https://www.googleapis.com/drive/v3/files'],
          costModel: 'free_tier',
          freeTierLimits: {
            requests: 1200,
            period: 'minute',
            notes: '15GB almacenamiento gratuito',
          },
          verified: false,
        },
      ],
      status: 'authorization_required',
      authMethod: 'oauth2',
      configurationRequired: ['google_oauth_client_id', 'google_oauth_client_secret'],
      endpoints: {
        production: 'https://www.googleapis.com/drive/v3',
        documentation: 'https://developers.google.com/drive/api/guides/about-sdk',
      },
      costModel: 'free_tier',
      freeTierInfo: {
        limits: '15GB almacenamiento, 1200 req/min',
        conditions: 'Requiere cuenta de Google',
        verified: true,
        lastChecked: now,
      },
      securityRestrictions: [
        'Solicitar permisos mínimos necesarios',
        'No acceder a todos los archivos sin autorización',
        'Usar OAuth 2.0 con scopes específicos',
        'No sincronización masiva automática',
      ],
      documentationUrl: 'https://developers.google.com/drive/api/guides/about-sdk',
      createdAt: now,
      updatedAt: now,
    },

    // n8n - Automatización (opcional)
    {
      id: 'connector-n8n',
      name: 'n8n',
      provider: 'n8n Inc.',
      category: 'automation',
      version: '1.0',
      description: 'Plataforma de automatización de flujos de trabajo',
      capabilities: [
        {
          id: 'n8n-workflows',
          name: 'Ejecución de Workflows',
          description: 'Trigger y ejecución de workflows automatizados',
          category: 'automation',
          requiresAuth: true,
          authMethod: 'api_key',
          endpoints: ['{n8n_instance_url}/api/v1/workflows'],
          costModel: 'local_execution', // Self-hosted es gratuito
          verified: false,
        },
      ],
      status: 'configuration_required',
      authMethod: 'api_key',
      configurationRequired: ['n8n_instance_url', 'n8n_api_key'],
      endpoints: {
        production: 'Self-hosted o n8n Cloud',
        documentation: 'https://docs.n8n.io/api/',
      },
      costModel: 'local_execution',
      freeTierInfo: {
        limits: 'Self-hosted: ilimitado, Cloud: 5 ejecuciones/día en free',
        conditions: 'Self-hosted requiere instalación propia',
        verified: true,
        lastChecked: now,
      },
      securityRestrictions: [
        'No exponer endpoints administrativos',
        'Autenticar webhooks sensibles',
        'No ejecutar workflows arbitrarios sin validación',
        'Instancia local no es obligatoria',
      ],
      documentationUrl: 'https://docs.n8n.io/api/',
      createdAt: now,
      updatedAt: now,
    },
  ];
}

/**
 * Instala los conectores iniciales de forma idempotente.
 */
export function installInitialConnectors(existing: Connector[]): Connector[] {
  const existingIds = new Set(existing.map(c => c.id));
  const initial = getInitialConnectors();
  const toAdd = initial.filter(c => !existingIds.has(c.id));
  return [...existing, ...toAdd];
}

/**
 * Busca un conector por ID.
 */
export function findConnector(connectors: Connector[], id: string): Connector | undefined {
  return connectors.find(c => c.id === id);
}

/**
 * Busca conectores por categoría.
 */
export function findConnectorsByCategory(connectors: Connector[], category: ConnectorCategory): Connector[] {
  return connectors.filter(c => c.category === category);
}

/**
 * Busca conectores por estado.
 */
export function findConnectorsByStatus(connectors: Connector[], status: ConnectorStatus): Connector[] {
  return connectors.filter(c => c.status === status);
}

/**
 * Actualiza el estado de un conector.
 */
export function updateConnectorStatus(
  connectors: Connector[],
  id: string,
  status: ConnectorStatus
): Connector[] {
  return connectors.map(c =>
    c.id === id ? { ...c, status, updatedAt: new Date().toISOString() } : c
  );
}
