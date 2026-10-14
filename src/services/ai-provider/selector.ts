// GAGO Open Artifact Factory - AI Provider Selector
// Phase 11: JOULE HYBRID AI PROVIDER ENGINE

import type {
  AIInferenceRequest,
  AIInferenceResponse,
  AIProviderRoute,
  AIModelCapability
} from '../../types/ai-provider';
import { aiProviderManager } from './manager';
import { openRouterInference } from './openrouter-adapter';
import { ollamaInference } from './ollama-adapter';

/**
 * Selector inteligente de proveedores de IA
 * Implementa fallback automático y optimización con JOULE
 */

/**
 * Selecciona el mejor proveedor para una solicitud
 */
export async function selectAIProvider(
  request: AIInferenceRequest
): Promise<AIProviderRoute | null> {
  const routes: AIProviderRoute[] = [];

  // Obtener proveedores que soportan las capacidades requeridas
  const compatibleProviders = aiProviderManager.getProvidersByCapability(
    request.capabilities[0] || 'code_generation'
  );

  for (const provider of compatibleProviders) {
    // Verificar que el proveedor esté conectado o autenticado
    if (provider.status !== 'connected' && provider.status !== 'authenticated') {
      continue;
    }

    // Verificar que tenga modelos disponibles
    const availableModels = provider.models.filter(m => 
      m.available && 
      m.capabilities.some(c => request.capabilities.includes(c))
    );

    if (availableModels.length === 0) {
      continue;
    }

    // Verificar cuota
    if (!aiProviderManager.hasQuotaAvailable(provider.id)) {
      continue;
    }

    // Verificar presupuesto
    const model = request.modelId 
      ? availableModels.find(m => m.id === request.modelId)
      : availableModels[0];

    if (!model) {
      continue;
    }

    const estimatedCost = model.costPerToken 
      ? (request.prompt.length / 4) * model.costPerToken
      : model.costPerRequest || 0;

    if (!aiProviderManager.isWithinBudget(provider.id, estimatedCost)) {
      continue;
    }

    // Calcular score basado en múltiples factores
    const score = calculateProviderScore(provider, model, request);

    routes.push({
      providerId: provider.id,
      modelId: model.id,
      score,
      estimatedCost,
      estimatedLatency: estimateLatency(provider),
      available: true,
      reason: `Score: ${score.toFixed(2)}, Cost: ${estimatedCost.toFixed(4)} EUR`
    });
  }

  // Ordenar por score (mayor es mejor)
  routes.sort((a, b) => b.score - a.score);

  // Retornar la mejor ruta
  return routes.length > 0 ? routes[0] : null;
}

/**
 * Calcula el score de un proveedor basado en múltiples factores
 */
function calculateProviderScore(
  provider: any,
  model: any,
  request: AIInferenceRequest
): number {
  let score = 0;

  // Factor 1: Coste (menor es mejor, máximo 40 puntos)
  const cost = model.costPerToken || model.costPerRequest || 0;
  if (cost === 0) {
    score += 40; // Máximo para modelos gratuitos
  } else {
    score += Math.max(0, 40 - (cost * 1000)); // Penalizar costes altos
  }

  // Factor 2: Prioridad de la solicitud (hasta 20 puntos)
  const priorityScores = { low: 5, medium: 10, high: 15, critical: 20 };
  score += priorityScores[request.priority] || 10;

  // Factor 3: Capacidad del modelo (hasta 20 puntos)
  const capabilityMatch = model.capabilities.filter((c: AIModelCapability) => 
    request.capabilities.includes(c)
  ).length;
  score += (capabilityMatch / request.capabilities.length) * 20;

  // Factor 4: Estado del proveedor (hasta 10 puntos)
  if (provider.status === 'authenticated') {
    score += 10;
  } else if (provider.status === 'connected') {
    score += 7;
  }

  // Factor 5: Cuota disponible (hasta 10 puntos)
  const quota = aiProviderManager.getQuota(provider.id);
  if (!quota) {
    score += 10; // Sin límites
  } else {
    const remaining = quota.requestsLimit - quota.requestsUsed;
    const ratio = remaining / quota.requestsLimit;
    score += ratio * 10;
  }

  return score;
}

/**
 * Estima la latencia de un proveedor
 */
function estimateLatency(provider: any): number {
  // Latencias estimadas basadas en el tipo de proveedor
  switch (provider.type) {
    case 'ollama':
      return 2000; // 2 segundos para modelos locales
    case 'openrouter':
      return 5000; // 5 segundos para API remota
    case 'qwen_code':
      return 3000; // 3 segundos para Qwen
    default:
      return 10000; // 10 segundos por defecto
  }
}

/**
 * Ejecuta una solicitud de inferencia con fallback automático
 */
export async function executeInferenceWithFallback(
  request: AIInferenceRequest
): Promise<AIInferenceResponse> {
  const maxRetries = 3;
  const triedProviders: string[] = [];

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Seleccionar el mejor proveedor
    const route = await selectAIProvider(request);

    if (!route) {
      // No hay proveedores disponibles
      return {
        id: generateId(),
        requestId: request.id,
        providerId: '',
        modelId: '',
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
        error: 'No hay proveedores de IA disponibles para esta solicitud',
        timestamp: new Date().toISOString()
      };
    }

    // Evitar reintentar el mismo proveedor
    if (triedProviders.includes(route.providerId)) {
      continue;
    }

    triedProviders.push(route.providerId);

    // Ejecutar la solicitud
    let response: AIInferenceResponse;

    try {
      switch (route.providerId) {
        case 'openrouter':
          response = await openRouterInference({
            ...request,
            providerId: route.providerId,
            modelId: route.modelId
          });
          break;

        case 'ollama':
          response = await ollamaInference({
            ...request,
            providerId: route.providerId,
            modelId: route.modelId
          });
          break;

        default:
          response = {
            id: generateId(),
            requestId: request.id,
            providerId: route.providerId,
            modelId: route.modelId,
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
            error: `Proveedor ${route.providerId} no soportado`,
            timestamp: new Date().toISOString()
          };
      }

      // Si la solicitud fue exitosa, retornar la respuesta
      if (response.success) {
        return response;
      }

      // Si falló, continuar con el siguiente intento
      console.warn(`Intento ${attempt + 1} falló con ${route.providerId}: ${response.error}`);

    } catch (error) {
      console.error(`Error en intento ${attempt + 1}:`, error);
    }
  }

  // Todos los intentos fallaron
  return {
    id: generateId(),
    requestId: request.id,
    providerId: triedProviders[0] || '',
    modelId: '',
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
    error: `Todos los intentos fallaron. Proveedores intentados: ${triedProviders.join(', ')}`,
    timestamp: new Date().toISOString()
  };
}

/**
 * Obtiene las rutas alternativas para una solicitud
 */
export async function getAlternativeRoutes(
  request: AIInferenceRequest,
  limit: number = 5
): Promise<AIProviderRoute[]> {
  const routes: AIProviderRoute[] = [];

  const compatibleProviders = aiProviderManager.getProvidersByCapability(
    request.capabilities[0] || 'code_generation'
  );

  for (const provider of compatibleProviders) {
    if (provider.status !== 'connected' && provider.status !== 'authenticated') {
      continue;
    }

    const availableModels = provider.models.filter(m => 
      m.available && 
      m.capabilities.some(c => request.capabilities.includes(c))
    );

    if (availableModels.length === 0) {
      continue;
    }

    const model = availableModels[0];
    const estimatedCost = model.costPerToken 
      ? (request.prompt.length / 4) * model.costPerToken
      : model.costPerRequest || 0;

    if (!aiProviderManager.isWithinBudget(provider.id, estimatedCost)) {
      continue;
    }

    const score = calculateProviderScore(provider, model, request);

    routes.push({
      providerId: provider.id,
      modelId: model.id,
      score,
      estimatedCost,
      estimatedLatency: estimateLatency(provider),
      available: true,
      reason: `Score: ${score.toFixed(2)}, Cost: ${estimatedCost.toFixed(4)} EUR`
    });

    if (routes.length >= limit) {
      break;
    }
  }

  routes.sort((a, b) => b.score - a.score);
  return routes;
}

/**
 * Verifica si hay proveedores disponibles para una capacidad
 */
export function hasAvailableProviders(capability: AIModelCapability): boolean {
  const providers = aiProviderManager.getProvidersByCapability(capability);
  return providers.length > 0;
}

/**
 * Obtiene estadísticas de proveedores
 */
export function getProviderStats(): {
  total: number;
  connected: number;
  authenticated: number;
  disconnected: number;
  error: number;
} {
  const providers = aiProviderManager.getAllProviders();
  
  return {
    total: providers.length,
    connected: providers.filter(p => p.status === 'connected').length,
    authenticated: providers.filter(p => p.status === 'authenticated').length,
    disconnected: providers.filter(p => p.status === 'disconnected').length,
    error: providers.filter(p => p.status === 'error').length
  };
}

/**
 * Genera un ID único
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}
