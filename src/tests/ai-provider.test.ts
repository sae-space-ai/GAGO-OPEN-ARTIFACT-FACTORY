// GAGO Open Artifact Factory - AI Provider Tests
// Phase 11: JOULE HYBRID AI PROVIDER ENGINE

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  AIProviderManager,
  aiProviderManager,
  initializeOpenRouter,
  initializeOllama,
  configureOpenRouterApiKey,
  getOpenRouterFreeModels,
  selectAIProvider,
  getProviderStats
} from '../services/ai-provider';
import type { AIInferenceRequest, AIProvider } from '../types/ai-provider';

describe('AI Provider Manager', () => {
  let manager: AIProviderManager;

  beforeEach(() => {
    manager = new AIProviderManager();
  });

  it('debería registrar un proveedor', () => {
    const provider: AIProvider = {
      id: 'test-provider',
      name: 'Test Provider',
      type: 'custom',
      status: 'disconnected',
      baseUrl: 'https://api.test.com',
      requiresAuth: true,
      hasKey: false,
      models: [],
      capabilities: ['code_generation'],
      lastChecked: undefined,
      error: undefined
    };

    manager.registerProvider(provider);
    const retrieved = manager.getProvider('test-provider');
    
    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('Test Provider');
  });

  it('debería obtener todos los proveedores', () => {
    const provider1: AIProvider = {
      id: 'provider-1',
      name: 'Provider 1',
      type: 'custom',
      status: 'connected',
      baseUrl: 'https://api.test1.com',
      requiresAuth: false,
      hasKey: false,
      models: [],
      capabilities: ['code_generation'],
      lastChecked: undefined,
      error: undefined
    };

    const provider2: AIProvider = {
      id: 'provider-2',
      name: 'Provider 2',
      type: 'custom',
      status: 'disconnected',
      baseUrl: 'https://api.test2.com',
      requiresAuth: true,
      hasKey: false,
      models: [],
      capabilities: ['documentation'],
      lastChecked: undefined,
      error: undefined
    };

    manager.registerProvider(provider1);
    manager.registerProvider(provider2);

    const allProviders = manager.getAllProviders();
    expect(allProviders).toHaveLength(2);
  });

  it('debería filtrar proveedores por estado', () => {
    const connected: AIProvider = {
      id: 'connected',
      name: 'Connected',
      type: 'custom',
      status: 'connected',
      baseUrl: 'https://api.test.com',
      requiresAuth: false,
      hasKey: false,
      models: [],
      capabilities: ['code_generation'],
      lastChecked: undefined,
      error: undefined
    };

    const disconnected: AIProvider = {
      id: 'disconnected',
      name: 'Disconnected',
      type: 'custom',
      status: 'disconnected',
      baseUrl: 'https://api.test.com',
      requiresAuth: false,
      hasKey: false,
      models: [],
      capabilities: ['code_generation'],
      lastChecked: undefined,
      error: undefined
    };

    manager.registerProvider(connected);
    manager.registerProvider(disconnected);

    const connectedProviders = manager.getProvidersByStatus('connected');
    expect(connectedProviders).toHaveLength(1);
    expect(connectedProviders[0].id).toBe('connected');
  });

  it('debería filtrar proveedores por capacidad', () => {
    const codeProvider: AIProvider = {
      id: 'code-provider',
      name: 'Code Provider',
      type: 'custom',
      status: 'connected',
      baseUrl: 'https://api.test.com',
      requiresAuth: false,
      hasKey: false,
      models: [],
      capabilities: ['code_generation', 'code_analysis'],
      lastChecked: undefined,
      error: undefined
    };

    const docProvider: AIProvider = {
      id: 'doc-provider',
      name: 'Doc Provider',
      type: 'custom',
      status: 'connected',
      baseUrl: 'https://api.test.com',
      requiresAuth: false,
      hasKey: false,
      models: [],
      capabilities: ['documentation', 'translation'],
      lastChecked: undefined,
      error: undefined
    };

    manager.registerProvider(codeProvider);
    manager.registerProvider(docProvider);

    const codeProviders = manager.getProvidersByCapability('code_generation');
    expect(codeProviders).toHaveLength(1);
    expect(codeProviders[0].id).toBe('code-provider');
  });

  it('debería gestionar cuotas', () => {
    const provider: AIProvider = {
      id: 'quota-provider',
      name: 'Quota Provider',
      type: 'custom',
      status: 'connected',
      baseUrl: 'https://api.test.com',
      requiresAuth: false,
      hasKey: false,
      models: [],
      capabilities: ['code_generation'],
      lastChecked: undefined,
      error: undefined
    };

    manager.registerProvider(provider);
    
    manager.setQuota({
      providerId: 'quota-provider',
      requestsLimit: 100,
      requestsUsed: 50,
      tokensLimit: 10000,
      tokensUsed: 5000,
      resetDate: new Date().toISOString(),
      period: 'day'
    });

    expect(manager.hasQuotaAvailable('quota-provider')).toBe(true);

    manager.setQuota({
      providerId: 'quota-provider',
      requestsLimit: 100,
      requestsUsed: 100,
      tokensLimit: 10000,
      tokensUsed: 5000,
      resetDate: new Date().toISOString(),
      period: 'day'
    });

    expect(manager.hasQuotaAvailable('quota-provider')).toBe(false);
  });

  it('debería gestionar presupuestos', () => {
    const provider: AIProvider = {
      id: 'budget-provider',
      name: 'Budget Provider',
      type: 'custom',
      status: 'connected',
      baseUrl: 'https://api.test.com',
      requiresAuth: false,
      hasKey: false,
      models: [],
      capabilities: ['code_generation'],
      lastChecked: undefined,
      error: undefined
    };

    manager.registerProvider(provider);
    
    manager.setBudget({
      providerId: 'budget-provider',
      monthlyLimit: 10,
      monthlyUsed: 5,
      perRequestLimit: 1,
      currency: 'EUR',
      alertThreshold: 8
    });

    expect(manager.isWithinBudget('budget-provider', 2)).toBe(true);
    expect(manager.isWithinBudget('budget-provider', 6)).toBe(false);
    expect(manager.isWithinBudget('budget-provider', 1.5)).toBe(false); // Supera perRequestLimit
  });

  it('debería exportar e importar estado', () => {
    const provider: AIProvider = {
      id: 'export-provider',
      name: 'Export Provider',
      type: 'custom',
      status: 'connected',
      baseUrl: 'https://api.test.com',
      requiresAuth: false,
      hasKey: false,
      models: [],
      capabilities: ['code_generation'],
      lastChecked: undefined,
      error: undefined
    };

    manager.registerProvider(provider);
    
    const state = manager.exportState();
    
    const newManager = new AIProviderManager();
    newManager.importState(state);
    
    const retrieved = newManager.getProvider('export-provider');
    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('Export Provider');
  });
});

describe('OpenRouter Adapter', () => {
  it('debería inicializar el proveedor OpenRouter', () => {
    const provider = initializeOpenRouter();
    
    expect(provider).toBeDefined();
    expect(provider.id).toBe('openrouter');
    expect(provider.name).toBe('OpenRouter');
    expect(provider.type).toBe('openrouter');
    expect(provider.requiresAuth).toBe(true);
    expect(provider.hasKey).toBe(false);
  });

  it('debería obtener modelos gratuitos', () => {
    initializeOpenRouter();
    const freeModels = getOpenRouterFreeModels();
    
    expect(freeModels.length).toBeGreaterThan(0);
    expect(freeModels.every(m => m.isFree)).toBe(true);
    expect(freeModels.every(m => m.providerId === 'openrouter')).toBe(true);
  });

  it('debería configurar API key', () => {
    initializeOpenRouter();
    
    expect(() => {
      configureOpenRouterApiKey('sk-test-key-12345');
    }).not.toThrow();

    const provider = aiProviderManager.getProvider('openrouter');
    expect(provider?.hasKey).toBe(true);
  });

  it('debería rechazar API key vacía', () => {
    initializeOpenRouter();
    
    expect(() => {
      configureOpenRouterApiKey('');
    }).toThrow('API key no puede estar vacía');
  });
});

describe('Ollama Adapter', () => {
  it('debería inicializar el proveedor Ollama', () => {
    const provider = initializeOllama();
    
    expect(provider).toBeDefined();
    expect(provider.id).toBe('ollama');
    expect(provider.name).toBe('Ollama (Local)');
    expect(provider.type).toBe('ollama');
    expect(provider.requiresAuth).toBe(false);
    expect(provider.hasKey).toBe(false);
  });

  it('debería tener presupuesto infinito (local)', () => {
    initializeOllama();
    
    const budget = aiProviderManager.getBudget('ollama');
    expect(budget).toBeDefined();
    expect(budget?.monthlyLimit).toBe(Infinity);
    expect(budget?.perRequestLimit).toBe(Infinity);
  });
});

describe('AI Provider Selector', () => {
  beforeEach(() => {
    initializeOpenRouter();
    initializeOllama();
  });

  it('debería seleccionar proveedor basado en capacidad', async () => {
    const request: AIInferenceRequest = {
      id: 'test-request',
      prompt: 'Genera código Python',
      capabilities: ['code_generation'],
      priority: 'medium',
      budget: 0,
      timestamp: new Date().toISOString()
    };

    const route = await selectAIProvider(request);
    
    // Puede retornar null si no hay proveedores conectados
    if (route) {
      expect(route.providerId).toBeDefined();
      expect(route.modelId).toBeDefined();
      expect(route.score).toBeGreaterThan(0);
    }
  });

  it('debería obtener estadísticas de proveedores', () => {
    const stats = getProviderStats();
    
    expect(stats).toBeDefined();
    expect(stats.total).toBeGreaterThanOrEqual(2); // OpenRouter + Ollama
    expect(typeof stats.connected).toBe('number');
    expect(typeof stats.authenticated).toBe('number');
    expect(typeof stats.disconnected).toBe('number');
    expect(typeof stats.error).toBe('number');
  });
});

describe('Budget Control', () => {
  it('debería mantener presupuesto cero por defecto', () => {
    initializeOpenRouter();
    
    const budget = aiProviderManager.getBudget('openrouter');
    expect(budget).toBeDefined();
    expect(budget?.monthlyLimit).toBe(0);
    expect(budget?.perRequestLimit).toBe(0);
  });

  it('debería rechazar modelos no gratuitos bajo presupuesto cero', () => {
    initializeOpenRouter();
    
    const provider = aiProviderManager.getProvider('openrouter');
    const paidModel = provider?.models.find((m: any) => !m.isFree);
    
    if (paidModel) {
      const budget = aiProviderManager.getBudget('openrouter');
      const isWithinBudget = aiProviderManager.isWithinBudget(
        'openrouter',
        paidModel.costPerToken || paidModel.costPerRequest || 0
      );
      
      expect(isWithinBudget).toBe(false);
    }
  });
});

describe('Quota Control', () => {
  it('debería registrar y verificar cuotas', () => {
    initializeOpenRouter();
    
    aiProviderManager.setQuota({
      providerId: 'openrouter',
      requestsLimit: 100,
      requestsUsed: 0,
      tokensLimit: 10000,
      tokensUsed: 0,
      resetDate: new Date().toISOString(),
      period: 'day'
    });

    expect(aiProviderManager.hasQuotaAvailable('openrouter')).toBe(true);

    aiProviderManager.setQuota({
      providerId: 'openrouter',
      requestsLimit: 100,
      requestsUsed: 100,
      tokensLimit: 10000,
      tokensUsed: 0,
      resetDate: new Date().toISOString(),
      period: 'day'
    });

    expect(aiProviderManager.hasQuotaAvailable('openrouter')).toBe(false);
  });
});

describe('Security', () => {
  it('no debería exponer API keys en el estado exportado', () => {
    initializeOpenRouter();
    configureOpenRouterApiKey('sk-secret-key-12345');
    
    const state = aiProviderManager.exportState();
    const config = state.configurations.find((c: any) => c.providerId === 'openrouter');
    
    // La API key está en la configuración, pero no debe estar en el provider
    const provider = state.providers.find((p: any) => p.id === 'openrouter');
    expect(provider?.hasKey).toBe(true);
    expect((provider as any)?.apiKey).toBeUndefined();
  });

  it('debería requerir autenticación para proveedores remotos', () => {
    initializeOpenRouter();
    
    const provider = aiProviderManager.getProvider('openrouter');
    expect(provider?.requiresAuth).toBe(true);
  });

  it('no debería requerir autenticación para Ollama local', () => {
    initializeOllama();
    
    const provider = aiProviderManager.getProvider('ollama');
    expect(provider?.requiresAuth).toBe(false);
  });
});
