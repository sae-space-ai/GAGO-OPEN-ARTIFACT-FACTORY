// GAGO Open Artifact Factory - AI Provider Manager
// Phase 11: JOULE HYBRID AI PROVIDER ENGINE

import type {
  AIProvider,
  AIModel,
  AIInferenceRequest,
  AIInferenceResponse,
  AIProviderQuota,
  AIProviderBudget,
  AIProviderConfiguration,
  AIProviderRoute,
  AIConnectionEvidence,
  AIProviderStatus,
  AIModelCapability
} from '../../types/ai-provider';
import { generateId } from '../storage';

/**
 * Motor central de gestión de proveedores de IA
 * Responsable de registrar, verificar y seleccionar proveedores
 */
export class AIProviderManager {
  private providers: Map<string, AIProvider> = new Map();
  private configurations: Map<string, AIProviderConfiguration> = new Map();
  private quotas: Map<string, AIProviderQuota> = new Map();
  private budgets: Map<string, AIProviderBudget> = new Map();
  private evidences: AIConnectionEvidence[] = [];
  private requestHistory: AIInferenceResponse[] = [];

  /**
   * Registra un nuevo proveedor
   */
  registerProvider(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }

  /**
   * Obtiene un proveedor por ID
   */
  getProvider(providerId: string): AIProvider | undefined {
    return this.providers.get(providerId);
  }

  /**
   * Obtiene todos los proveedores registrados
   */
  getAllProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Obtiene proveedores por estado
   */
  getProvidersByStatus(status: AIProviderStatus): AIProvider[] {
    return this.getAllProviders().filter(p => p.status === status);
  }

  /**
   * Obtiene proveedores que soportan una capacidad específica
   */
  getProvidersByCapability(capability: AIModelCapability): AIProvider[] {
    return this.getAllProviders().filter(p => 
      p.capabilities.includes(capability) && 
      (p.status === 'connected' || p.status === 'authenticated')
    );
  }

  /**
   * Configura un proveedor
   */
  configureProvider(config: AIProviderConfiguration): void {
    this.configurations.set(config.providerId, config);
    
    const provider = this.providers.get(config.providerId);
    if (provider) {
      provider.hasKey = !!config.apiKey;
      if (config.baseUrl) {
        provider.baseUrl = config.baseUrl;
      }
    }
  }

  /**
   * Obtiene la configuración de un proveedor
   */
  getConfiguration(providerId: string): AIProviderConfiguration | undefined {
    return this.configurations.get(providerId);
  }

  /**
   * Actualiza el estado de un proveedor
   */
  updateProviderStatus(providerId: string, status: AIProviderStatus, error?: string): void {
    const provider = this.providers.get(providerId);
    if (provider) {
      provider.status = status;
      provider.error = error;
      provider.lastChecked = new Date().toISOString();
    }
  }

  /**
   * Registra una cuota para un proveedor
   */
  setQuota(quota: AIProviderQuota): void {
    this.quotas.set(quota.providerId, quota);
    
    const provider = this.providers.get(quota.providerId);
    if (provider) {
      provider.quota = quota;
    }
  }

  /**
   * Obtiene la cuota de un proveedor
   */
  getQuota(providerId: string): AIProviderQuota | undefined {
    return this.quotas.get(providerId);
  }

  /**
   * Verifica si un proveedor tiene cuota disponible
   */
  hasQuotaAvailable(providerId: string): boolean {
    const quota = this.quotas.get(providerId);
    if (!quota) return true; // Si no hay cuota definida, asumimos que está disponible
    
    return quota.requestsUsed < quota.requestsLimit && 
           quota.tokensUsed < quota.tokensLimit;
  }

  /**
   * Registra un presupuesto para un proveedor
   */
  setBudget(budget: AIProviderBudget): void {
    this.budgets.set(budget.providerId, budget);
    
    const provider = this.providers.get(budget.providerId);
    if (provider) {
      provider.budget = budget;
    }
  }

  /**
   * Obtiene el presupuesto de un proveedor
   */
  getBudget(providerId: string): AIProviderBudget | undefined {
    return this.budgets.get(providerId);
  }

  /**
   * Verifica si una solicitud está dentro del presupuesto
   */
  isWithinBudget(providerId: string, estimatedCost: number): boolean {
    const budget = this.budgets.get(providerId);
    if (!budget) return true; // Si no hay presupuesto definido, asumimos que está dentro
    
    return (budget.monthlyUsed + estimatedCost) <= budget.monthlyLimit &&
           estimatedCost <= budget.perRequestLimit;
  }

  /**
   * Registra una evidencia de conexión
   */
  addEvidence(evidence: AIConnectionEvidence): void {
    this.evidences.push(evidence);
  }

  /**
   * Obtiene evidencias de un proveedor
   */
  getEvidences(providerId: string): AIConnectionEvidence[] {
    return this.evidences.filter(e => e.providerId === providerId);
  }

  /**
   * Registra una respuesta de inferencia
   */
  addResponse(response: AIInferenceResponse): void {
    this.requestHistory.push(response);
    
    // Actualizar cuota
    const quota = this.quotas.get(response.providerId);
    if (quota) {
      quota.requestsUsed++;
      quota.tokensUsed += response.usage.totalTokens;
    }
    
    // Actualizar presupuesto
    const budget = this.budgets.get(response.providerId);
    if (budget) {
      budget.monthlyUsed += response.cost;
    }
  }

  /**
   * Obtiene el historial de solicitudes
   */
  getRequestHistory(limit: number = 50): AIInferenceResponse[] {
    return this.requestHistory.slice(-limit);
  }

  /**
   * Obtiene estadísticas de uso
   */
  getUsageStats(): {
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    averageLatency: number;
    successRate: number;
  } {
    const history = this.requestHistory;
    
    if (history.length === 0) {
      return {
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        averageLatency: 0,
        successRate: 0
      };
    }
    
    const totalRequests = history.length;
    const totalTokens = history.reduce((sum, r) => sum + r.usage.totalTokens, 0);
    const totalCost = history.reduce((sum, r) => sum + r.cost, 0);
    const averageLatency = history.reduce((sum, r) => sum + r.latency, 0) / totalRequests;
    const successRate = history.filter(r => r.success).length / totalRequests;
    
    return {
      totalRequests,
      totalTokens,
      totalCost,
      averageLatency,
      successRate
    };
  }

  /**
   * Obtiene todos los modelos disponibles
   */
  getAllModels(): AIModel[] {
    const models: AIModel[] = [];
    this.providers.forEach(provider => {
      models.push(...provider.models);
    });
    return models;
  }

  /**
   * Obtiene modelos por capacidad
   */
  getModelsByCapability(capability: AIModelCapability): AIModel[] {
    return this.getAllModels().filter(m => 
      m.capabilities.includes(capability) && m.available
    );
  }

  /**
   * Obtiene un modelo por ID
   */
  getModel(modelId: string): AIModel | undefined {
    return this.getAllModels().find(m => m.id === modelId);
  }

  /**
   * Actualiza la disponibilidad de un modelo
   */
  updateModelAvailability(providerId: string, modelId: string, available: boolean): void {
    const provider = this.providers.get(providerId);
    if (provider) {
      const model = provider.models.find(m => m.id === modelId);
      if (model) {
        model.available = available;
      }
    }
  }

  /**
   * Exporta el estado completo del manager
   */
  exportState(): {
    providers: AIProvider[];
    configurations: AIProviderConfiguration[];
    quotas: AIProviderQuota[];
    budgets: AIProviderBudget[];
    evidences: AIConnectionEvidence[];
    requestHistory: AIInferenceResponse[];
  } {
    return {
      providers: this.getAllProviders(),
      configurations: Array.from(this.configurations.values()),
      quotas: Array.from(this.quotas.values()),
      budgets: Array.from(this.budgets.values()),
      evidences: this.evidences,
      requestHistory: this.requestHistory
    };
  }

  /**
   * Importa el estado completo del manager
   */
  importState(state: {
    providers: AIProvider[];
    configurations: AIProviderConfiguration[];
    quotas: AIProviderQuota[];
    budgets: AIProviderBudget[];
    evidences: AIConnectionEvidence[];
    requestHistory: AIInferenceResponse[];
  }): void {
    this.providers.clear();
    state.providers.forEach(p => this.providers.set(p.id, p));
    
    this.configurations.clear();
    state.configurations.forEach(c => this.configurations.set(c.providerId, c));
    
    this.quotas.clear();
    state.quotas.forEach(q => this.quotas.set(q.providerId, q));
    
    this.budgets.clear();
    state.budgets.forEach(b => this.budgets.set(b.providerId, b));
    
    this.evidences = state.evidences;
    this.requestHistory = state.requestHistory;
  }
}

// Instancia global del manager
export const aiProviderManager = new AIProviderManager();
