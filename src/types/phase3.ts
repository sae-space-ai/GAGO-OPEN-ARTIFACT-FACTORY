// GAGO Open Artifact Factory - Phase 3 Types
// Automatic Configuration and Connection Recovery

export type ConnectionStatus =
  | 'NOT_CONFIGURED'
  | 'AUTH_REQUIRED'
  | 'CONFIGURED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'VERIFIED'
  | 'DEGRADED'
  | 'RATE_LIMITED'
  | 'DISCONNECTED'
  | 'BLOCKED'
  | 'ERROR'
  | 'DISABLED';

export type ErrorCategory =
  | 'CONFIG_INCOMPLETE'
  | 'CREDENTIALS_MISSING'
  | 'CREDENTIALS_EXPIRED'
  | 'INSUFFICIENT_PERMISSIONS'
  | 'WRONG_ENDPOINT'
  | 'NETWORK_ERROR'
  | 'CORS_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'QUOTA_EXCEEDED'
  | 'PAYMENT_REQUIRED'
  | 'DEPENDENCY_NOT_INSTALLED'
  | 'RESPONSE_FORMAT_ERROR'
  | 'TIMEOUT'
  | 'ADAPTER_ERROR';

export type RecoveryAction =
  | 'PROVIDE_CREDENTIALS'
  | 'REFRESH_TOKEN'
  | 'REQUEST_PERMISSIONS'
  | 'CORRECT_ENDPOINT'
  | 'WAIT_AND_RETRY'
  | 'USE_FALLBACK'
  | 'INSTALL_DEPENDENCY'
  | 'CHECK_NETWORK'
  | 'USE_BACKEND_PROXY'
  | 'MANUAL_INTERVENTION';

export interface ConnectionTest {
  id: string;
  connectorId: string;
  capabilityId: string;
  timestamp: string;
  success: boolean;
  duration: number;
  statusCode?: number;
  errorMessage?: string;
  errorCategory?: ErrorCategory;
  recoveryAction?: RecoveryAction;
  verified: boolean;
}

export interface ConnectionConfig {
  connectorId: string;
  status: ConnectionStatus;
  lastTest?: ConnectionTest;
  capabilities: {
    [capabilityId: string]: {
      status: ConnectionStatus;
      lastVerified?: string;
      testCount: number;
      successCount: number;
    };
  };
  errorHistory: ConnectionTest[];
  recoveryAttempts: number;
  lastRecoveryAttempt?: string;
}

export interface AutoConfigResult {
  connectorId: string;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'REQUIRES_AUTH';
  message: string;
  capabilitiesVerified: string[];
  capabilitiesPending: string[];
  errors: ConnectionTest[];
  requiresManualAction: boolean;
  manualActionDescription?: string;
}

export interface ConnectionRecoveryPlan {
  connectorId: string;
  errorCategory: ErrorCategory;
  recommendedAction: RecoveryAction;
  canAutoRecover: boolean;
  requiresUserAction: boolean;
  userActionDescription?: string;
  estimatedDuration?: number;
}

export interface ConnectAllResult {
  timestamp: string;
  totalConnectors: number;
  successfulConnections: number;
  partialConnections: number;
  failedConnections: number;
  requiresAuth: number;
  results: AutoConfigResult[];
  duration: number;
}

export const CONNECTION_STATUS_LABELS: Record<ConnectionStatus, string> = {
  NOT_CONFIGURED: 'No configurado',
  AUTH_REQUIRED: 'Autorización requerida',
  CONFIGURED: 'Configurado',
  CONNECTING: 'Conectando...',
  CONNECTED: 'Conectado',
  VERIFIED: 'Verificado',
  DEGRADED: 'Degradado',
  RATE_LIMITED: 'Cuota agotada',
  DISCONNECTED: 'Desconectado',
  BLOCKED: 'Bloqueado',
  ERROR: 'Error',
  DISABLED: 'Desactivado'
};

export const ERROR_CATEGORY_LABELS: Record<ErrorCategory, string> = {
  CONFIG_INCOMPLETE: 'Configuración incompleta',
  CREDENTIALS_MISSING: 'Credenciales ausentes',
  CREDENTIALS_EXPIRED: 'Credenciales expiradas',
  INSUFFICIENT_PERMISSIONS: 'Permisos insuficientes',
  WRONG_ENDPOINT: 'Endpoint incorrecto',
  NETWORK_ERROR: 'Error de red',
  CORS_ERROR: 'Error CORS',
  SERVICE_UNAVAILABLE: 'Servicio no disponible',
  QUOTA_EXCEEDED: 'Cuota excedida',
  PAYMENT_REQUIRED: 'Pago requerido',
  DEPENDENCY_NOT_INSTALLED: 'Dependencia no instalada',
  RESPONSE_FORMAT_ERROR: 'Formato de respuesta incorrecto',
  TIMEOUT: 'Tiempo de espera agotado',
  ADAPTER_ERROR: 'Error del adaptador'
};

export const RECOVERY_ACTION_LABELS: Record<RecoveryAction, string> = {
  PROVIDE_CREDENTIALS: 'Proporcionar credenciales',
  REFRESH_TOKEN: 'Actualizar token',
  REQUEST_PERMISSIONS: 'Solicitar permisos',
  CORRECT_ENDPOINT: 'Corregir endpoint',
  WAIT_AND_RETRY: 'Esperar y reintentar',
  USE_FALLBACK: 'Usar alternativa',
  INSTALL_DEPENDENCY: 'Instalar dependencia',
  CHECK_NETWORK: 'Verificar red',
  USE_BACKEND_PROXY: 'Usar proxy backend',
  MANUAL_INTERVENTION: 'Intervención manual requerida'
};
