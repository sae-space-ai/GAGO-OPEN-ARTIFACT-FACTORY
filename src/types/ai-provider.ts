// GAGO Open Artifact Factory - AI Provider Types
// Phase 11: JOULE HYBRID AI PROVIDER ENGINE

export type AIProviderType = 'openrouter' | 'ollama' | 'qwen_code' | 'custom';

export type AIProviderStatus = 
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'authenticated'
  | 'quota_exceeded'
  | 'error'
  | 'unauthorized';

export type AIModelCapability = 
  | 'code_generation'
  | 'code_analysis'
  | 'documentation'
  | 'reasoning'
  | 'translation'
  | 'summarization';

export interface AIProvider {
  id: string;
  name: string;
  type: AIProviderType;
  status: AIProviderStatus;
  baseUrl: string;
  requiresAuth: boolean;
  hasKey: boolean;
  models: AIModel[];
  quota?: AIProviderQuota;
  budget?: AIProviderBudget;
  lastChecked?: string;
  error?: string;
  capabilities: AIModelCapability[];
}

export interface AIModel {
  id: string;
  providerId: string;
  name: string;
  description: string;
  capabilities: AIModelCapability[];
  contextWindow: number;
  maxTokens: number;
  costPerToken?: number;
  costPerRequest?: number;
  isFree: boolean;
  requiresAuth: boolean;
  available: boolean;
}

export interface AIInferenceRequest {
  id: string;
  providerId?: string;
  modelId?: string;
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  capabilities: AIModelCapability[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  budget: number;
  timestamp: string;
}

export interface AIInferenceResponse {
  id: string;
  requestId: string;
  providerId: string;
  modelId: string;
  content: string;
  usage: AIUsageMetrics;
  cost: number;
  latency: number;
  success: boolean;
  error?: string;
  timestamp: string;
}

export interface AIUsageMetrics {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

export interface AIProviderQuota {
  providerId: string;
  requestsLimit: number;
  requestsUsed: number;
  tokensLimit: number;
  tokensUsed: number;
  resetDate: string;
  period: 'hour' | 'day' | 'month';
}

export interface AIProviderBudget {
  providerId: string;
  monthlyLimit: number;
  monthlyUsed: number;
  perRequestLimit: number;
  currency: string;
  alertThreshold: number;
}

export interface AIProviderConfiguration {
  providerId: string;
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
  maxRetries: number;
  timeout: number;
  enableFallback: boolean;
}

export interface AIConnectionEvidence {
  id: string;
  providerId: string;
  modelId: string;
  testType: 'connectivity' | 'authentication' | 'inference' | 'quota';
  success: boolean;
  timestamp: string;
  latency?: number;
  error?: string;
  details?: string;
}

export interface AIProviderRoute {
  providerId: string;
  modelId: string;
  score: number;
  estimatedCost: number;
  estimatedLatency: number;
  available: boolean;
  reason: string;
}

export const AI_PROVIDER_STATUS_LABELS: Record<AIProviderStatus, string> = {
  disconnected: 'Desconectado',
  connecting: 'Conectando',
  connected: 'Conectado',
  authenticated: 'Autenticado',
  quota_exceeded: 'Cuota Excedida',
  error: 'Error',
  unauthorized: 'No Autorizado'
};

export const AI_MODEL_CAPABILITY_LABELS: Record<AIModelCapability, string> = {
  code_generation: 'Generación de Código',
  code_analysis: 'Análisis de Código',
  documentation: 'Documentación',
  reasoning: 'Razonamiento',
  translation: 'Traducción',
  summarization: 'Resumen'
};

/**
 * Estado completo del sistema de proveedores de IA
 */
export interface AIProviderState {
  providers: AIProvider[];
  configurations: AIProviderConfiguration[];
  quotas: AIProviderQuota[];
  budgets: AIProviderBudget[];
  evidences: AIConnectionEvidence[];
  requestHistory: AIInferenceResponse[];
  lastUpdated: string;
}
