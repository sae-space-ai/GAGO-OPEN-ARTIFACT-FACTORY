// GAGO Open Artifact Factory - OpenRouter Adapter
// Phase 11: JOULE HYBRID AI PROVIDER ENGINE

import type {
  AIProvider,
  AIModel,
  AIInferenceRequest,
  AIInferenceResponse,
  AIProviderQuota,
  AIConnectionEvidence,
  AIModelCapability
} from '../../types/ai-provider';
import { aiProviderManager } from './manager';

/**
 * Adaptador para OpenRouter
 * Proporciona acceso a múltiples modelos de IA mediante API compatible con OpenAI
 * https://openrouter.ai/docs
 */

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

/**
 * Modelos gratuitos conocidos en OpenRouter (verificados)
 * Nota: Los modelos gratuitos pueden cambiar, esta lista debe actualizarse periódicamente
 */
const FREE_MODELS: AIModel[] = [
  {
    id: 'meta-llama/llama-3.2-3b-instruct:free',
    providerId: 'openrouter',
    name: 'Llama 3.2 3B Instruct (Free)',
    description: 'Modelo de Meta optimizado para instrucciones, versión gratuita',
    capabilities: ['code_generation', 'code_analysis', 'documentation', 'reasoning'],
    contextWindow: 8192,
    maxTokens: 4096,
    isFree: true,
    requiresAuth: true,
    available: true
  },
  {
    id: 'meta-llama/llama-3.1-8b-instruct:free',
    providerId: 'openrouter',
    name: 'Llama 3.1 8B Instruct (Free)',
    description: 'Modelo de Meta de 8B parámetros, versión gratuita',
    capabilities: ['code_generation', 'code_analysis', 'documentation', 'reasoning', 'translation'],
    contextWindow: 8192,
    maxTokens: 4096,
    isFree: true,
    requiresAuth: true,
    available: true
  },
  {
    id: 'google/gemma-2-9b-it:free',
    providerId: 'openrouter',
    name: 'Gemma 2 9B IT (Free)',
    description: 'Modelo de Google optimizado para instrucciones, versión gratuita',
    capabilities: ['code_generation', 'documentation', 'reasoning', 'summarization'],
    contextWindow: 8192,
    maxTokens: 4096,
    isFree: true,
    requiresAuth: true,
    available: true
  },
  {
    id: 'mistralai/mistral-7b-instruct:free',
    providerId: 'openrouter',
    name: 'Mistral 7B Instruct (Free)',
    description: 'Modelo de Mistral AI, versión gratuita',
    capabilities: ['code_generation', 'code_analysis', 'documentation', 'reasoning'],
    contextWindow: 8192,
    maxTokens: 4096,
    isFree: true,
    requiresAuth: true,
    available: true
  },
  {
    id: 'qwen/qwen-2-7b-instruct:free',
    providerId: 'openrouter',
    name: 'Qwen 2 7B Instruct (Free)',
    description: 'Modelo de Alibaba Cloud, versión gratuita',
    capabilities: ['code_generation', 'code_analysis', 'documentation', 'reasoning', 'translation'],
    contextWindow: 8192,
    maxTokens: 4096,
    isFree: true,
    requiresAuth: true,
    available: true
  }
];

/**
 * Inicializa el proveedor OpenRouter
 */
export function initializeOpenRouter(): AIProvider {
  const provider: AIProvider = {
    id: 'openrouter',
    name: 'OpenRouter',
    type: 'openrouter',
    status: 'disconnected',
    baseUrl: OPENROUTER_BASE_URL,
    requiresAuth: true,
    hasKey: false,
    models: FREE_MODELS,
    capabilities: ['code_generation', 'code_analysis', 'documentation', 'reasoning', 'translation', 'summarization'],
    lastChecked: undefined,
    error: undefined
  };

  aiProviderManager.registerProvider(provider);
  
  // Configurar presupuesto cero por defecto
  aiProviderManager.setBudget({
    providerId: 'openrouter',
    monthlyLimit: 0, // Presupuesto cero
    monthlyUsed: 0,
    perRequestLimit: 0,
    currency: 'EUR',
    alertThreshold: 0
  });

  return provider;
}

/**
 * Configura la API key de OpenRouter
 * IMPORTANTE: La API key debe provenir de una fuente segura (backend, variable de entorno)
 * NUNCA debe estar hardcodeada en el frontend
 */
export function configureOpenRouterApiKey(apiKey: string): void {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('API key no puede estar vacía');
  }

  aiProviderManager.configureProvider({
    providerId: 'openrouter',
    apiKey,
    baseUrl: OPENROUTER_BASE_URL,
    maxRetries: 3,
    timeout: 30000,
    enableFallback: true
  });

  const provider = aiProviderManager.getProvider('openrouter');
  if (provider) {
    provider.hasKey = true;
  }
}

/**
 * Verifica la conectividad con OpenRouter
 */
export async function checkOpenRouterConnectivity(): Promise<AIConnectionEvidence> {
  const evidence: AIConnectionEvidence = {
    id: generateId(),
    providerId: 'openrouter',
    modelId: '',
    testType: 'connectivity',
    success: false,
    timestamp: new Date().toISOString()
  };

  const startTime = Date.now();

  try {
    const config = aiProviderManager.getConfiguration('openrouter');
    if (!config || !config.apiKey) {
      evidence.error = 'API key no configurada';
      evidence.details = 'Se requiere una API key válida de OpenRouter';
      aiProviderManager.updateProviderStatus('openrouter', 'unauthorized', evidence.error);
      aiProviderManager.addEvidence(evidence);
      return evidence;
    }

    // Verificar conectividad con endpoint de modelos
    const response = await fetch(`${OPENROUTER_BASE_URL}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    evidence.latency = Date.now() - startTime;

    if (response.ok) {
      evidence.success = true;
      evidence.details = 'Conectividad verificada con OpenRouter';
      aiProviderManager.updateProviderStatus('openrouter', 'connected');
    } else if (response.status === 401) {
      evidence.error = 'API key inválida';
      evidence.details = 'La API key proporcionada no es válida';
      aiProviderManager.updateProviderStatus('openrouter', 'unauthorized', evidence.error);
    } else if (response.status === 429) {
      evidence.error = 'Cuota excedida';
      evidence.details = 'Se ha excedido el límite de solicitudes';
      aiProviderManager.updateProviderStatus('openrouter', 'quota_exceeded', evidence.error);
    } else {
      evidence.error = `Error HTTP ${response.status}`;
      evidence.details = await response.text();
      aiProviderManager.updateProviderStatus('openrouter', 'error', evidence.error);
    }
  } catch (error) {
    evidence.latency = Date.now() - startTime;
    evidence.error = error instanceof Error ? error.message : 'Error de red';
    evidence.details = 'No se pudo establecer conexión con OpenRouter';
    aiProviderManager.updateProviderStatus('openrouter', 'error', evidence.error);
  }

  aiProviderManager.addEvidence(evidence);
  return evidence;
}

/**
 * Realiza una solicitud de inferencia a OpenRouter
 */
export async function openRouterInference(
  request: AIInferenceRequest
): Promise<AIInferenceResponse> {
  const response: AIInferenceResponse = {
    id: generateId(),
    requestId: request.id,
    providerId: 'openrouter',
    modelId: request.modelId || FREE_MODELS[0].id,
    content: '',
    usage: {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      estimatedCost: 0
    },
    cost: 0,
    latency: 0,
    success: false,
    timestamp: new Date().toISOString()
  };

  const startTime = Date.now();

  try {
    const config = aiProviderManager.getConfiguration('openrouter');
    if (!config || !config.apiKey) {
      response.error = 'API key no configurada';
      aiProviderManager.addResponse(response);
      return response;
    }

    // Verificar presupuesto (debe ser cero para modelos gratuitos)
    const model = FREE_MODELS.find(m => m.id === response.modelId);
    if (!model) {
      response.error = `Modelo ${response.modelId} no encontrado`;
      aiProviderManager.addResponse(response);
      return response;
    }

    if (!model.isFree) {
      response.error = 'Modelo no gratuito no permitido bajo presupuesto cero';
      aiProviderManager.addResponse(response);
      return response;
    }

    // Verificar cuota
    if (!aiProviderManager.hasQuotaAvailable('openrouter')) {
      response.error = 'Cuota excedida';
      aiProviderManager.addResponse(response);
      return response;
    }

    // Preparar solicitud
    const messages: Array<{ role: string; content: string }> = [];
    
    if (request.systemPrompt) {
      messages.push({
        role: 'system',
        content: request.systemPrompt
      });
    }
    
    messages.push({
      role: 'user',
      content: request.prompt
    });

    // Realizar solicitud a OpenRouter
    const apiResponse = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'GAGO Open Artifact Factory'
      },
      body: JSON.stringify({
        model: response.modelId,
        messages,
        max_tokens: request.maxTokens || model.maxTokens,
        temperature: request.temperature || 0.7
      })
    });

    response.latency = Date.now() - startTime;

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}));
      response.error = errorData.error?.message || `Error HTTP ${apiResponse.status}`;
      aiProviderManager.addResponse(response);
      return response;
    }

    const data = await apiResponse.json();

    // Extraer respuesta
    response.content = data.choices?.[0]?.message?.content || '';
    
    // Extraer uso de tokens
    if (data.usage) {
      response.usage.promptTokens = data.usage.prompt_tokens || 0;
      response.usage.completionTokens = data.usage.completion_tokens || 0;
      response.usage.totalTokens = data.usage.total_tokens || 0;
    }

    // Calcular coste (debe ser cero para modelos gratuitos)
    response.cost = model.costPerToken 
      ? response.usage.totalTokens * model.costPerToken 
      : model.costPerRequest || 0;

    response.usage.estimatedCost = response.cost;
    response.success = true;

    // Verificar que el coste es cero (presupuesto cero)
    if (response.cost > 0) {
      response.error = 'Modelo generó coste inesperado bajo política de presupuesto cero';
      response.success = false;
    }

  } catch (error) {
    response.latency = Date.now() - startTime;
    response.error = error instanceof Error ? error.message : 'Error desconocido';
  }

  aiProviderManager.addResponse(response);
  return response;
}

/**
 * Obtiene los modelos gratuitos disponibles
 */
export function getOpenRouterFreeModels(): AIModel[] {
  return FREE_MODELS.filter(m => m.isFree && m.available);
}

/**
 * Verifica la disponibilidad de un modelo específico
 */
export async function checkModelAvailability(modelId: string): Promise<boolean> {
  try {
    const config = aiProviderManager.getConfiguration('openrouter');
    if (!config || !config.apiKey) {
      return false;
    }

    const response = await fetch(`${OPENROUTER_BASE_URL}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    const model = data.data?.find((m: any) => m.id === modelId);
    
    return !!model;
  } catch {
    return false;
  }
}

/**
 * Actualiza la lista de modelos gratuitos
 * Debe llamarse periódicamente para mantener la lista actualizada
 */
export async function refreshFreeModels(): Promise<AIModel[]> {
  try {
    const config = aiProviderManager.getConfiguration('openrouter');
    if (!config || !config.apiKey) {
      return FREE_MODELS;
    }

    const response = await fetch(`${OPENROUTER_BASE_URL}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return FREE_MODELS;
    }

    const data = await response.json();
    const allModels = data.data || [];

    // Filtrar modelos gratuitos
    const freeModels = allModels
      .filter((m: any) => m.pricing?.prompt === '0' && m.pricing?.completion === '0')
      .map((m: any) => ({
        id: m.id,
        providerId: 'openrouter',
        name: m.name || m.id,
        description: m.description || '',
        capabilities: inferCapabilities(m.id),
        contextWindow: m.context_length || 4096,
        maxTokens: m.top_p || 4096,
        isFree: true,
        requiresAuth: true,
        available: true
      }));

    // Actualizar la lista de modelos del proveedor
    const provider = aiProviderManager.getProvider('openrouter');
    if (provider) {
      provider.models = freeModels.length > 0 ? freeModels : FREE_MODELS;
    }

    return freeModels.length > 0 ? freeModels : FREE_MODELS;
  } catch {
    return FREE_MODELS;
  }
}

/**
 * Infiere las capacidades de un modelo basado en su ID
 */
function inferCapabilities(modelId: string): AIModelCapability[] {
  const capabilities: AIModelCapability[] = [];
  
  const lowerId = modelId.toLowerCase();
  
  if (lowerId.includes('code') || lowerId.includes('coder')) {
    capabilities.push('code_generation', 'code_analysis');
  }
  
  if (lowerId.includes('instruct') || lowerId.includes('chat')) {
    capabilities.push('documentation', 'reasoning');
  }
  
  if (lowerId.includes('translate')) {
    capabilities.push('translation');
  }
  
  if (lowerId.includes('summar')) {
    capabilities.push('summarization');
  }
  
  // Capacidades por defecto para modelos generales
  if (capabilities.length === 0) {
    capabilities.push('code_generation', 'documentation', 'reasoning');
  }
  
  return capabilities;
}

/**
 * Genera un ID único
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}
