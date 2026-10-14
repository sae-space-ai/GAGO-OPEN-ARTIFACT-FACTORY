// GAGO Open Artifact Factory - Enhanced Ollama Adapter
// Phase 11: JOULE HYBRID AI PROVIDER ENGINE

import type {
  AIProvider,
  AIModel,
  AIInferenceRequest,
  AIInferenceResponse,
  AIConnectionEvidence,
  AIModelCapability
} from '../../types/ai-provider';
import { aiProviderManager } from './manager';

/**
 * Adaptador mejorado para Ollama
 * Ollama es ahora opcional, no obligatorio
 * Funciona como alternativa local cuando está disponible
 */

const OLLAMA_BASE_URL = 'http://localhost:11434';

/**
 * Inicializa el proveedor Ollama
 */
export function initializeOllama(): AIProvider {
  const provider: AIProvider = {
    id: 'ollama',
    name: 'Ollama (Local)',
    type: 'ollama',
    status: 'disconnected',
    baseUrl: OLLAMA_BASE_URL,
    requiresAuth: false,
    hasKey: false,
    models: [],
    capabilities: ['code_generation', 'code_analysis', 'documentation', 'reasoning'],
    lastChecked: undefined,
    error: undefined
  };

  aiProviderManager.registerProvider(provider);
  
  // Ollama no tiene coste monetario (ejecución local)
  aiProviderManager.setBudget({
    providerId: 'ollama',
    monthlyLimit: Infinity, // Sin límite monetario
    monthlyUsed: 0,
    perRequestLimit: Infinity,
    currency: 'EUR',
    alertThreshold: Infinity
  });

  return provider;
}

/**
 * Verifica la conectividad con Ollama
 */
export async function checkOllamaConnectivity(): Promise<AIConnectionEvidence> {
  const evidence: AIConnectionEvidence = {
    id: generateId(),
    providerId: 'ollama',
    modelId: '',
    testType: 'connectivity',
    success: false,
    timestamp: new Date().toISOString()
  };

  const startTime = Date.now();

  try {
    // Verificar si Ollama está corriendo
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000) // Timeout de 5 segundos
    });

    evidence.latency = Date.now() - startTime;

    if (response.ok) {
      const data = await response.json();
      const models = data.models || [];
      
      evidence.success = true;
      evidence.details = `Ollama disponible con ${models.length} modelo(s)`;
      
      // Actualizar estado del proveedor
      aiProviderManager.updateProviderStatus('ollama', 'connected');
      
      // Actualizar lista de modelos
      updateOllamaModels(models);
      
    } else {
      evidence.error = `Error HTTP ${response.status}`;
      evidence.details = 'Ollama respondió pero con error';
      aiProviderManager.updateProviderStatus('ollama', 'error', evidence.error);
    }
  } catch (error) {
    evidence.latency = Date.now() - startTime;
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        evidence.error = 'Timeout';
        evidence.details = 'Ollama no respondió en 5 segundos. Verifica que esté instalado y corriendo.';
      } else if (error.message.includes('Failed to fetch')) {
        evidence.error = 'No disponible';
        evidence.details = 'Ollama no está corriendo o no es accesible en localhost:11434';
      } else {
        evidence.error = error.message;
        evidence.details = 'Error al conectar con Ollama';
      }
    } else {
      evidence.error = 'Error desconocido';
      evidence.details = 'No se pudo establecer conexión con Ollama';
    }
    
    aiProviderManager.updateProviderStatus('ollama', 'disconnected', evidence.error);
  }

  aiProviderManager.addEvidence(evidence);
  return evidence;
}

/**
 * Actualiza la lista de modelos de Ollama
 */
function updateOllamaModels(ollamaModels: any[]): void {
  const models: AIModel[] = ollamaModels.map((m: any) => ({
    id: m.name,
    providerId: 'ollama',
    name: m.name,
    description: `Modelo local: ${m.name}`,
    capabilities: inferOllamaCapabilities(m.name),
    contextWindow: m.details?.parameter_size ? estimateContextWindow(m.details.parameter_size) : 4096,
    maxTokens: 2048,
    isFree: true, // Ollama es gratuito (ejecución local)
    requiresAuth: false,
    available: true
  }));

  const provider = aiProviderManager.getProvider('ollama');
  if (provider) {
    provider.models = models;
  }
}

/**
 * Infiere las capacidades de un modelo de Ollama basado en su nombre
 */
function inferOllamaCapabilities(modelName: string): AIModelCapability[] {
  const capabilities: AIModelCapability[] = [];
  const lowerName = modelName.toLowerCase();
  
  // Modelos de código
  if (lowerName.includes('code') || lowerName.includes('coder') || lowerName.includes('deepseek-coder')) {
    capabilities.push('code_generation', 'code_analysis');
  }
  
  // Modelos de instrucciones generales
  if (lowerName.includes('instruct') || lowerName.includes('chat')) {
    capabilities.push('documentation', 'reasoning');
  }
  
  // Modelos de traducción
  if (lowerName.includes('translate')) {
    capabilities.push('translation');
  }
  
  // Capacidades por defecto para modelos generales
  if (capabilities.length === 0) {
    capabilities.push('code_generation', 'documentation', 'reasoning');
  }
  
  return capabilities;
}

/**
 * Estima el tamaño de contexto basado en el tamaño del parámetro
 */
function estimateContextWindow(parameterSize: string): number {
  const sizeMatch = parameterSize.match(/(\d+(\.\d+)?)\s*B/i);
  if (sizeMatch) {
    const size = parseFloat(sizeMatch[1]);
    if (size <= 3) return 4096;
    if (size <= 7) return 8192;
    if (size <= 13) return 4096; // Modelos más grandes suelen tener menos contexto
    return 2048;
  }
  return 4096;
}

/**
 * Realiza una solicitud de inferencia a Ollama
 */
export async function ollamaInference(
  request: AIInferenceRequest
): Promise<AIInferenceResponse> {
  const response: AIInferenceResponse = {
    id: generateId(),
    requestId: request.id,
    providerId: 'ollama',
    modelId: request.modelId || '',
    content: '',
    usage: {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      estimatedCost: 0
    },
    cost: 0, // Ollama es gratuito
    latency: 0,
    success: false,
    timestamp: new Date().toISOString()
  };

  const startTime = Date.now();

  try {
    // Verificar que Ollama esté disponible
    const provider = aiProviderManager.getProvider('ollama');
    if (!provider || provider.status !== 'connected') {
      response.error = 'Ollama no está disponible';
      aiProviderManager.addResponse(response);
      return response;
    }

    // Verificar que el modelo exista
    const model = provider.models.find(m => m.id === response.modelId);
    if (!model) {
      response.error = `Modelo ${response.modelId} no encontrado en Ollama`;
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

    // Realizar solicitud a Ollama
    const apiResponse = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: response.modelId,
        messages,
        stream: false,
        options: {
          temperature: request.temperature || 0.7,
          num_predict: request.maxTokens || model.maxTokens
        }
      }),
      signal: AbortSignal.timeout(60000) // Timeout de 60 segundos para modelos locales
    });

    response.latency = Date.now() - startTime;

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      response.error = `Error HTTP ${apiResponse.status}: ${errorText}`;
      aiProviderManager.addResponse(response);
      return response;
    }

    const data = await apiResponse.json();

    // Extraer respuesta
    response.content = data.message?.content || '';
    
    // Estimar uso de tokens (Ollama no siempre proporciona esta información)
    response.usage.promptTokens = estimateTokens(request.prompt);
    response.usage.completionTokens = estimateTokens(response.content);
    response.usage.totalTokens = response.usage.promptTokens + response.usage.completionTokens;
    
    // Coste es cero para Ollama
    response.cost = 0;
    response.usage.estimatedCost = 0;
    response.success = true;

  } catch (error) {
    response.latency = Date.now() - startTime;
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        response.error = 'Timeout: La inferencia tardó más de 60 segundos';
      } else {
        response.error = error.message;
      }
    } else {
      response.error = 'Error desconocido';
    }
  }

  aiProviderManager.addResponse(response);
  return response;
}

/**
 * Estima el número de tokens en un texto
 * Esta es una estimación aproximada (1 token ≈ 4 caracteres en inglés)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Descarga un modelo en Ollama
 * ADVERTENCIA: Esto puede consumir ancho de banda y tiempo
 */
export async function downloadOllamaModel(modelName: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/pull`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: modelName,
        stream: false
      }),
      signal: AbortSignal.timeout(600000) // Timeout de 10 minutos para descargas
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Error HTTP ${response.status}: ${errorText}`
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

/**
 * Elimina un modelo de Ollama
 */
export async function deleteOllamaModel(modelName: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: modelName
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Error HTTP ${response.status}: ${errorText}`
      };
    }

    // Actualizar lista de modelos
    await checkOllamaConnectivity();

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

/**
 * Obtiene información detallada de un modelo
 */
export async function getOllamaModelInfo(modelName: string): Promise<{
  success: boolean;
  info?: any;
  error?: string;
}> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/show`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: modelName
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Error HTTP ${response.status}: ${errorText}`
      };
    }

    const info = await response.json();
    return { success: true, info };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

/**
 * Genera un ID único
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}
