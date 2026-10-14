import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  verifyGitHubPublicAccess,
  verifyVercelConfiguration,
  verifyOllamaLocal,
  verifyJouleEngine,
  verifyNetworkConnectivity,
  verifyLocalStorage,
  determineConnectionStatus
} from '../services/auto-config';
import {
  diagnoseConnectionError,
  classifyErrorSeverity,
  generateDiagnosticSummary
} from '../services/connection-recovery';
import type { ConnectionTest, ErrorCategory } from '../types/phase3';

describe('Phase 3 - Auto Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('verifyNetworkConnectivity', () => {
    it('debería verificar conectividad de red exitosamente', async () => {
      (globalThis as any).fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ url: 'https://httpbin.org/get' })
      });

      const result = await verifyNetworkConnectivity();
      
      expect(result.success).toBe(true);
      expect(result.verified).toBe(true);
      expect(result.connectorId).toBe('network');
      expect(result.duration).toBeGreaterThan(0);
    });

    it('debería manejar errores de red', async () => {
      (globalThis as any).fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await verifyNetworkConnectivity();
      
      expect(result.success).toBe(false);
      expect(result.errorCategory).toBe('NETWORK_ERROR');
      expect(result.recoveryAction).toBe('CHECK_NETWORK');
    });

    it('debería manejar errores CORS', async () => {
      (globalThis as any).fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

      const result = await verifyNetworkConnectivity();
      
      expect(result.success).toBe(false);
      expect(result.errorCategory).toBe('CORS_ERROR');
    });
  });

  describe('verifyLocalStorage', () => {
    it('debería verificar localStorage exitosamente', () => {
      const result = verifyLocalStorage();
      
      expect(result.success).toBe(true);
      expect(result.verified).toBe(true);
      expect(result.connectorId).toBe('storage');
    });
  });

  describe('verifyGitHubPublicAccess', () => {
    it('debería verificar acceso público a GitHub', async () => {
      (globalThis as any).fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          resources: {
            core: { limit: 60, remaining: 59 }
          }
        })
      });

      const result = await verifyGitHubPublicAccess();
      
      expect(result.success).toBe(true);
      expect(result.verified).toBe(true);
      expect(result.connectorId).toBe('github');
      expect(result.capabilityId).toBe('public-api');
    });

    it('debería manejar límite de tasa de GitHub', async () => {
      (globalThis as any).fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: () => Promise.resolve({
          message: 'API rate limit exceeded'
        })
      });

      const result = await verifyGitHubPublicAccess();
      
      expect(result.success).toBe(false);
      expect(result.errorCategory).toBe('RATE_LIMITED');
      expect(result.recoveryAction).toBe('WAIT_AND_RETRY');
    });
  });

  describe('verifyVercelConfiguration', () => {
    it('debería verificar configuración de Vercel', async () => {
      (globalThis as any).fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          version: 2,
          builds: [{ src: '*.tsx', use: '@vercel/static-build' }]
        })
      });

      const result = await verifyVercelConfiguration();
      
      expect(result.success).toBe(true);
      expect(result.verified).toBe(true);
      expect(result.connectorId).toBe('vercel');
      expect(result.capabilityId).toBe('deployment-config');
    });

    it('debería manejar configuración faltante de Vercel', async () => {
      (globalThis as any).fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404
      });

      const result = await verifyVercelConfiguration();
      
      expect(result.success).toBe(false);
      expect(result.errorCategory).toBe('CONFIG_INCOMPLETE');
      expect(result.recoveryAction).toBe('MANUAL_INTERVENTION');
    });
  });

  describe('verifyOllamaLocal', () => {
    it('debería verificar Ollama local cuando está disponible', async () => {
      (globalThis as any).fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          models: [
            { name: 'llama2', size: '7B' },
            { name: 'codellama', size: '13B' }
          ]
        })
      });

      const result = await verifyOllamaLocal();
      
      expect(result.success).toBe(true);
      expect(result.verified).toBe(true);
      expect(result.connectorId).toBe('ollama');
      expect(result.capabilityId).toBe('local-inference');
    });

    it('debería manejar Ollama no disponible', async () => {
      (globalThis as any).fetch = vi.fn().mockRejectedValue(new Error('Connection refused'));

      const result = await verifyOllamaLocal();
      
      expect(result.success).toBe(false);
      expect(result.errorCategory).toBe('SERVICE_UNAVAILABLE');
      expect(result.recoveryAction).toBe('INSTALL_DEPENDENCY');
    });
  });

  describe('verifyJouleEngine', () => {
    it('debería verificar JOULE engine cuando está disponible', () => {
      const jouleState = {
        version: '1.0.0',
        mode: 'shadow',
        enabled: true
      };

      const result = verifyJouleEngine(jouleState);
      
      expect(result.success).toBe(true);
      expect(result.verified).toBe(true);
      expect(result.connectorId).toBe('joule');
      expect(result.capabilityId).toBe('optimization-engine');
    });

    it('debería manejar JOULE no configurado', () => {
      const result = verifyJouleEngine(null);
      
      expect(result.success).toBe(false);
      expect(result.errorCategory).toBe('CONFIG_INCOMPLETE');
      expect(result.recoveryAction).toBe('MANUAL_INTERVENTION');
    });
  });

  describe('determineConnectionStatus', () => {
    it('debería determinar estado NOT_CONFIGURED cuando no hay tests', () => {
      const status = determineConnectionStatus([]);
      expect(status).toBe('NOT_CONFIGURED');
    });

    it('debería determinar estado VERIFIED cuando el último test fue exitoso', () => {
      const tests: ConnectionTest[] = [
        {
          id: 'test-1',
          connectorId: 'github',
          capabilityId: 'public-api',
          timestamp: new Date().toISOString(),
          success: true,
          verified: true,
          duration: 100
        }
      ];

      const status = determineConnectionStatus(tests);
      expect(status).toBe('VERIFIED');
    });

    it('debería determinar estado ERROR cuando el último test falló', () => {
      const tests: ConnectionTest[] = [
        {
          id: 'test-1',
          connectorId: 'github',
          capabilityId: 'public-api',
          timestamp: new Date().toISOString(),
          success: false,
          verified: false,
          duration: 100,
          errorCategory: 'NETWORK_ERROR'
        }
      ];

      const status = determineConnectionStatus(tests);
      expect(status).toBe('ERROR');
    });

    it('debería determinar estado AUTH_REQUIRED cuando faltan credenciales', () => {
      const tests: ConnectionTest[] = [
        {
          id: 'test-1',
          connectorId: 'github',
          capabilityId: 'private-api',
          timestamp: new Date().toISOString(),
          success: false,
          verified: false,
          duration: 100,
          errorCategory: 'CREDENTIALS_MISSING'
        }
      ];

      const status = determineConnectionStatus(tests);
      expect(status).toBe('AUTH_REQUIRED');
    });
  });
});

describe('Phase 3 - Connection Recovery', () => {
  describe('diagnoseConnectionError', () => {
    it('debería diagnosticar error de red', () => {
      const test: ConnectionTest = {
        id: 'test-1',
        connectorId: 'github',
        capabilityId: 'public-api',
        timestamp: new Date().toISOString(),
        success: false,
        verified: false,
        duration: 100,
        errorCategory: 'NETWORK_ERROR'
      };

      const plan = diagnoseConnectionError(test);
      
      expect(plan.errorCategory).toBe('NETWORK_ERROR');
      expect(plan.recommendedAction).toBe('CHECK_NETWORK');
      expect(plan.canAutoRecover).toBe(false);
      expect(plan.requiresUserAction).toBe(true);
    });

    it('debería diagnosticar error de credenciales', () => {
      const test: ConnectionTest = {
        id: 'test-1',
        connectorId: 'github',
        capabilityId: 'private-api',
        timestamp: new Date().toISOString(),
        success: false,
        verified: false,
        duration: 100,
        errorCategory: 'CREDENTIALS_MISSING'
      };

      const plan = diagnoseConnectionError(test);
      
      expect(plan.errorCategory).toBe('CREDENTIALS_MISSING');
      expect(plan.recommendedAction).toBe('PROVIDE_CREDENTIALS');
      expect(plan.canAutoRecover).toBe(false);
      expect(plan.requiresUserAction).toBe(true);
    });

    it('debería diagnosticar error de configuración', () => {
      const test: ConnectionTest = {
        id: 'test-1',
        connectorId: 'vercel',
        capabilityId: 'deployment-config',
        timestamp: new Date().toISOString(),
        success: false,
        verified: false,
        duration: 100,
        errorCategory: 'CONFIG_INCOMPLETE'
      };

      const plan = diagnoseConnectionError(test);
      
      expect(plan.errorCategory).toBe('CONFIG_INCOMPLETE');
      expect(plan.recommendedAction).toBe('MANUAL_INTERVENTION');
      expect(plan.canAutoRecover).toBe(false);
      expect(plan.requiresUserAction).toBe(true);
    });
  });

  describe('classifyErrorSeverity', () => {
    it('debería clasificar errores de red como LOW', () => {
      const severity = classifyErrorSeverity('NETWORK_ERROR');
      expect(severity).toBe('LOW');
    });

    it('debería clasificar errores de credenciales como HIGH', () => {
      const severity = classifyErrorSeverity('CREDENTIALS_MISSING');
      expect(severity).toBe('HIGH');
    });

    it('debería clasificar errores de pago como CRITICAL', () => {
      const severity = classifyErrorSeverity('PAYMENT_REQUIRED');
      expect(severity).toBe('CRITICAL');
    });
  });

  describe('generateDiagnosticSummary', () => {
    it('debería generar resumen con errores', () => {
      const tests: ConnectionTest[] = [
        {
          id: 'test-1',
          connectorId: 'github',
          capabilityId: 'public-api',
          timestamp: new Date().toISOString(),
          success: false,
          verified: false,
          duration: 100,
          errorCategory: 'NETWORK_ERROR'
        },
        {
          id: 'test-2',
          connectorId: 'vercel',
          capabilityId: 'deployment-config',
          timestamp: new Date().toISOString(),
          success: false,
          verified: false,
          duration: 100,
          errorCategory: 'CREDENTIALS_MISSING'
        }
      ];

      const summary = generateDiagnosticSummary(tests);
      
      expect(summary.totalErrors).toBe(2);
      expect(summary.highErrors).toBe(1);
      expect(summary.lowErrors).toBe(1);
      expect(summary.requiresManual).toBe(2);
      expect(summary.recommendations.length).toBeGreaterThan(0);
    });

    it('debería generar resumen sin errores', () => {
      const tests: ConnectionTest[] = [
        {
          id: 'test-1',
          connectorId: 'github',
          capabilityId: 'public-api',
          timestamp: new Date().toISOString(),
          success: true,
          verified: true,
          duration: 100
        }
      ];

      const summary = generateDiagnosticSummary(tests);
      
      expect(summary.totalErrors).toBe(0);
      expect(summary.recommendations).toContain('✨ No se detectaron errores de conexión');
    });
  });
});
