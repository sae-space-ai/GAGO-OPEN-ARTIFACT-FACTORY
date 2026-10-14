// GAGO OPEN ARTIFACT FACTORY - Universal API Fabric Types
// Fase 2 - Universal API Integration and Zero Cost Orchestration

export type ConnectorCategory = 
  | 'repository'      // GitHub, GitLab, etc.
  | 'deployment'      // Vercel, Netlify, etc.
  | 'ai_provider'     // Qwen, OpenAI, etc.
  | 'local_ai'        // Ollama, WebLLM, etc.
  | 'storage'         // Supabase, Firebase, etc.
  | 'document'        // Google Drive, Dropbox, etc.
  | 'automation'      // n8n, Zapier, etc.
  | 'data'            // APIs de datos abiertos
  | 'internal';       // JOULE y módulos internos

export type ConnectorStatus =
  | 'discovered'           // Identificado pero no configurado
  | 'available'            // Documentado y disponible bajo condiciones
  | 'configuration_required' // Necesita configuración
  | 'authorization_required' // Necesita autorización
  | 'connected'            // Configuración de conexión existe
  | 'verified'             // Prueba real satisfactoria
  | 'degraded'             // Funciona parcialmente
  | 'rate_limited'         // Cuota agotada
  | 'blocked'              // Política impide uso
  | 'disabled'             // Desactivado manualmente
  | 'unsupported';         // No disponible con requisitos actuales

export type BillingModel =
  | 'free_permanent'       // Gratuito permanente
  | 'free_tier'            // Cuota gratuita limitada
  | 'free_promotional'     // Crédito promocional temporal
  | 'pay_per_use'          // Pago por uso
  | 'subscription'         // Suscripción
  | 'local_execution'      // Ejecución local (sin API)
  | 'unknown';             // No verificado

export type AuthenticationMethod =
  | 'none'                 // No requiere autenticación
  | 'api_key'              // API Key
  | 'oauth2'               // OAuth 2.0
  | 'basic'                // Basic Auth
  | 'bearer_token'         // Bearer Token
  | 'github_app'           // GitHub App
  | 'service_account'      // Service Account
  | 'internal';            // Interno (sin credenciales externas)

export interface ConnectorCapability {
  id: string;
  name: string;
  description: string;
  category: ConnectorCategory;
  requiresAuth: boolean;
  authMethod: AuthenticationMethod;
  endpoints: string[];
  rateLimit?: {
    requests: number;
    period: 'second' | 'minute' | 'hour' | 'day';
  };
  costModel: BillingModel;
  freeTierLimits?: {
    requests?: number;
    period?: string;
    notes?: string;
  };
  verified: boolean;
  lastVerified?: string;
}

export interface Connector {
  id: string;
  name: string;
  provider: string;
  category: ConnectorCategory;
  version: string;
  description: string;
  capabilities: ConnectorCapability[];
  status: ConnectorStatus;
  authMethod: AuthenticationMethod;
  configurationRequired: string[];
  endpoints: {
    production: string;
    documentation: string;
  };
  costModel: BillingModel;
  freeTierInfo?: {
    limits: string;
    conditions: string;
    verified: boolean;
    lastChecked: string;
  };
  rateLimits?: {
    maxRequests: number;
    period: string;
    currentUsage?: number;
    resetAt?: string;
  };
  securityRestrictions: string[];
  documentationUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface CapabilityRequirement {
  id: string;
  moduleId: string;
  moduleName: string;
  capabilityName: string;
  capabilityDescription: string;
  category: ConnectorCategory;
  priority: 'critical' | 'high' | 'medium' | 'low';
  requiresAuth: boolean;
  autoConnectEligible: boolean;
  detectedAutomatically: boolean;
  status: 'pending' | 'discovered' | 'available' | 'configured' | 'connected' | 'verified' | 'blocked';
  blockedReason?: string;
  connectorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuotaUsage {
  connectorId: string;
  capabilityId: string;
  requestsMade: number;
  requestsLimit?: number;
  period: string;
  resetAt?: string;
  lastUpdated: string;
}

export interface BudgetPolicy {
  id: string;
  name: string;
  maxMonetaryCost: number; // Default: 0 (zero cost)
  currency: string;
  allowPaidOperations: boolean;
  requireExplicitAuthorization: boolean;
  blockedProviders: string[];
  allowedFreeTiers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationEvidence {
  id: string;
  connectorId: string;
  capabilityId: string;
  testType: 'connectivity' | 'authentication' | 'operation' | 'quota_check';
  status: 'passed' | 'failed' | 'skipped';
  timestamp: string;
  duration: number;
  responseCode?: number;
  errorMessage?: string;
  metadata: Record<string, any>;
}

export interface AutoConnectResult {
  capabilityId: string;
  status: 'connected' | 'authorization_required' | 'configuration_required' | 'blocked' | 'no_provider';
  connectorId?: string;
  reason?: string;
  requiresManualAction: boolean;
  manualActionDescription?: string;
}

export interface APIFabricState {
  connectors: Connector[];
  capabilityRequirements: CapabilityRequirement[];
  quotaUsage: Record<string, QuotaUsage>;
  budgetPolicy: BudgetPolicy;
  integrationEvidence: IntegrationEvidence[];
  version: string;
}

// Labels for UI
export const CONNECTOR_CATEGORY_LABELS: Record<ConnectorCategory, string> = {
  repository: 'Repositorio',
  deployment: 'Despliegue',
  ai_provider: 'Proveedor de IA',
  local_ai: 'IA Local',
  storage: 'Almacenamiento',
  document: 'Documentos',
  automation: 'Automatización',
  data: 'Datos Abiertos',
  internal: 'Interno',
};

export const CONNECTOR_STATUS_LABELS: Record<ConnectorStatus, string> = {
  discovered: 'Descubierto',
  available: 'Disponible',
  configuration_required: 'Configuración Requerida',
  authorization_required: 'Autorización Requerida',
  connected: 'Conectado',
  verified: 'Verificado',
  degraded: 'Degradado',
  rate_limited: 'Cuota Agotada',
  blocked: 'Bloqueado',
  disabled: 'Desactivado',
  unsupported: 'No Soportado',
};

export const BILLING_MODEL_LABELS: Record<BillingModel, string> = {
  free_permanent: 'Gratuito Permanente',
  free_tier: 'Cuota Gratuita',
  free_promotional: 'Crédito Promocional',
  pay_per_use: 'Pago por Uso',
  subscription: 'Suscripción',
  local_execution: 'Ejecución Local',
  unknown: 'No Verificado',
};

export const AUTH_METHOD_LABELS: Record<AuthenticationMethod, string> = {
  none: 'Sin Autenticación',
  api_key: 'API Key',
  oauth2: 'OAuth 2.0',
  basic: 'Basic Auth',
  bearer_token: 'Bearer Token',
  github_app: 'GitHub App',
  service_account: 'Service Account',
  internal: 'Interno',
};
