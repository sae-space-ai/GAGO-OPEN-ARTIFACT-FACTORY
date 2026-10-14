// GAGO Open Artifact Factory - Phase 6 Types
// Universal Integrations Hub

export type IntegrationCategory = 
  | 'version_control'
  | 'deployment'
  | 'ai_inference'
  | 'storage'
  | 'automation'
  | 'agents'
  | 'documents'
  | 'communications'
  | 'open_data'
  | 'development'
  | 'internal';

export type IntegrationStatus = 
  | 'DISCOVERED'
  | 'NOT_CONFIGURED'
  | 'AUTH_REQUIRED'
  | 'CONFIGURED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'VERIFIED'
  | 'DEGRADED'
  | 'RATE_LIMITED'
  | 'BLOCKED'
  | 'DISCONNECTED'
  | 'ERROR'
  | 'DISABLED';

export type AuthType = 
  | 'none'
  | 'api_key'
  | 'oauth2'
  | 'bearer_token'
  | 'basic'
  | 'github_app'
  | 'service_account'
  | 'internal';

export type CostClassification = 
  | 'free_permanent'
  | 'free_tier'
  | 'free_promotional'
  | 'pay_per_use'
  | 'subscription'
  | 'local_execution'
  | 'unknown';

export interface IntegrationConnector {
  id: string;
  name: string;
  provider: string;
  category: IntegrationCategory;
  version: string;
  description: string;
  capabilities: IntegrationCapability[];
  operations: IntegrationOperation[];
  authType: AuthType;
  requiredPermissions: string[];
  restrictions: {
    maxRequests?: number;
    maxConcurrent?: number;
    allowedOrigins?: string[];
    blockedOperations?: string[];
  };
  costClassification: CostClassification;
  quotas: {
    limit?: number;
    period?: string;
    current?: number;
    resetAt?: string;
  };
  technicalRequirements: {
    network?: boolean;
    localService?: boolean;
    browserCompatible?: boolean;
    serverRequired?: boolean;
  };
  configStatus: IntegrationStatus;
  connectionStatus: IntegrationStatus;
  lastVerified?: string;
  errors: IntegrationError[];
  dependencies: string[];
  documentationUrl: string;
  evidenceIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationCapability {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  requiresAuth: boolean;
  isLocal: boolean;
  isFree: boolean;
  verified: boolean;
  lastTested?: string;
}

export interface IntegrationOperation {
  id: string;
  name: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  requiresAuth: boolean;
  permissions: string[];
  idempotent: boolean;
  rateLimited: boolean;
  inputSchema?: Record<string, any>;
  outputSchema?: Record<string, any>;
}

export interface IntegrationError {
  id: string;
  timestamp: string;
  category: 'config' | 'auth' | 'permission' | 'network' | 'endpoint' | 'response' | 'quota' | 'service' | 'timeout' | 'version' | 'policy';
  message: string;
  details?: string;
  resolved: boolean;
  resolution?: string;
}

export interface CapabilityDiscovery {
  moduleId: string;
  moduleName: string;
  requiredCapabilities: string[];
  availableConnectors: string[];
  pendingConnectors: string[];
  blockedConnectors: string[];
  dependencies: Record<string, string[]>;
}

export interface IntegrationRoute {
  id: string;
  capabilityId: string;
  connectorId: string;
  priority: number;
  estimatedCost: number;
  estimatedLatency: number;
  confidence: number;
  restrictions: string[];
  selected: boolean;
}

export interface IntegrationEvent {
  id: string;
  type: string;
  source: string;
  timestamp: string;
  payload: Record<string, any>;
  signature?: string;
  verified: boolean;
  processed: boolean;
}

export interface IntegrationWebhook {
  id: string;
  connectorId: string;
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
  lastTriggered?: string;
  deliveryCount: number;
  failureCount: number;
}

export interface IntegrationAuditLog {
  id: string;
  timestamp: string;
  action: string;
  connectorId?: string;
  capabilityId?: string;
  userId?: string;
  agentId?: string;
  workflowId?: string;
  details: Record<string, any>;
  result: 'success' | 'failure' | 'blocked';
  errorMessage?: string;
}

export const INTEGRATION_CATEGORY_LABELS: Record<IntegrationCategory, string> = {
  version_control: 'Control de Versiones',
  deployment: 'Despliegue',
  ai_inference: 'Inferencia IA',
  storage: 'Almacenamiento',
  automation: 'Automatización',
  agents: 'Agentes',
  documents: 'Documentos',
  communications: 'Comunicaciones',
  open_data: 'Datos Abiertos',
  development: 'Desarrollo',
  internal: 'Interno'
};

export const INTEGRATION_STATUS_LABELS: Record<IntegrationStatus, string> = {
  DISCOVERED: 'Descubierto',
  NOT_CONFIGURED: 'No Configurado',
  AUTH_REQUIRED: 'Autorización Requerida',
  CONFIGURED: 'Configurado',
  CONNECTING: 'Conectando',
  CONNECTED: 'Conectado',
  VERIFIED: 'Verificado',
  DEGRADED: 'Degradado',
  RATE_LIMITED: 'Cuota Limitada',
  BLOCKED: 'Bloqueado',
  DISCONNECTED: 'Desconectado',
  ERROR: 'Error',
  DISABLED: 'Deshabilitado'
};

export const AUTH_TYPE_LABELS: Record<AuthType, string> = {
  none: 'Sin Autenticación',
  api_key: 'API Key',
  oauth2: 'OAuth 2.0',
  bearer_token: 'Bearer Token',
  basic: 'Basic Auth',
  github_app: 'GitHub App',
  service_account: 'Service Account',
  internal: 'Interno'
};

export const COST_CLASSIFICATION_LABELS: Record<CostClassification, string> = {
  free_permanent: 'Gratuito Permanente',
  free_tier: 'Cuota Gratuita',
  free_promotional: 'Crédito Promocional',
  pay_per_use: 'Pago por Uso',
  subscription: 'Suscripción',
  local_execution: 'Ejecución Local',
  unknown: 'No Verificado'
};
