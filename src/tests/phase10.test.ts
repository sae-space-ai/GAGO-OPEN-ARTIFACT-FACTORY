// GAGO Open Artifact Factory - Phase 10 Tests
// Final Integration Repair and Production Readiness

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  checkGitHubConnection,
  checkVercelConnection,
  checkQwenConnection,
  checkAllConnections,
  getInitialConnectionState,
  getConnectionSummary
} from '../services/system-connection-manager';
import {
  checkGitHubAPIAvailability,
  getPublicRepositoryInfo,
  verifyPublicAccess,
  getPublicBranches,
  GITHUB_REPO_OWNER,
  GITHUB_REPO_NAME
} from '../services/github-adapter';
import {
  checkVercelConfig,
  verifyViteCompatibility,
  getCurrentDeploymentInfo,
  getVercelSummary,
  VERCEL_PROJECT_NAME
} from '../services/vercel-adapter';
import {
  checkQwenDevelopmentTool,
  checkQwenInferenceAPI,
  getQwenSummary,
  generateQwenOrder,
  getQwenConfigurationRequirements,
  isQwenInferenceReady
} from '../services/qwen-adapter';

describe('System Connection Manager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getInitialConnectionState', () => {
    it('debe inicializar el estado de conexiones', () => {
      const state = getInitialConnectionState();
      expect(state.connections).toBeDefined();
      expect(state.connections.github).toBeDefined();
      expect(state.connections.vercel).toBeDefined();
      expect(state.connections.qwen).toBeDefined();
      expect(state.lastGlobalCheck).toBeNull();
    });

    it('debe inicializar todas las conexiones como NOT_CONFIGURED', () => {
      const state = getInitialConnectionState();
      expect(state.connections.github.status).toBe('NOT_CONFIGURED');
      expect(state.connections.vercel.status).toBe('NOT_CONFIGURED');
      expect(state.connections.qwen.status).toBe('NOT_CONFIGURED');
    });
  });

  describe('checkGitHubConnection', () => {
    it('debe comprobar la conexión con GitHub', async () => {
      (globalThis as any).fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          rate: { limit: 60, remaining: 59 }
        })
      });

      const connection = await checkGitHubConnection();
      expect(connection.id).toBe('github');
      expect(connection.name).toBe('GitHub');
      expect(connection.lastChecked).toBeDefined();
      expect((globalThis as any).fetch).toHaveBeenCalled();
    });

    it('debe manejar errores de red', async () => {
      (globalThis as any).fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const connection = await checkGitHubConnection();
      expect(connection.status).toBe('DISCONNECTED');
      expect(connection.errors.length).toBeGreaterThan(0);
    });

    it('debe manejar rate limit excedido', async () => {
      (globalThis as any).fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403
      });

      const connection = await checkGitHubConnection();
      expect(connection.status).toBe('DEGRADED');
    });
  });

  describe('checkVercelConnection', () => {
    it('debe comprobar la configuración de Vercel', async () => {
      (globalThis as any).fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          buildCommand: 'npm run build',
          outputDirectory: 'dist',
          framework: 'vite'
        })
      });

      const connection = await checkVercelConnection();
      expect(connection.id).toBe('vercel');
      expect(connection.name).toBe('Vercel');
      expect(connection.lastChecked).toBeDefined();
    });

    it('debe manejar configuración faltante', async () => {
      (globalThis as any).fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404
      });

      const connection = await checkVercelConnection();
      expect(connection.status).toBe('NOT_CONFIGURED');
    });
  });

  describe('checkQwenConnection', () => {
    it('debe comprobar el estado de Qwen', async () => {
      const connection = await checkQwenConnection();
      expect(connection.id).toBe('qwen');
      expect(connection.name).toBe('Qwen Coder');
      expect(connection.status).toBe('AUTH_REQUIRED');
      expect(connection.pendingAuthorization).toBe(true);
    });
  });

  describe('checkAllConnections', () => {
    it('debe comprobar todas las conexiones', async () => {
      (globalThis as any).fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({})
      });

      const state = await checkAllConnections();
      expect(state.connections.github).toBeDefined();
      expect(state.connections.vercel).toBeDefined();
      expect(state.connections.qwen).toBeDefined();
      expect(state.lastGlobalCheck).toBeDefined();
    });
  });

  describe('getConnectionSummary', () => {
    it('debe generar un resumen del estado de conexiones', () => {
      const state = getInitialConnectionState();
      const summary = getConnectionSummary(state);
      
      expect(summary.total).toBe(3);
      expect(summary.verified).toBe(0);
      expect(summary.connected).toBe(0);
      expect(summary.errors).toBe(0);
    });
  });
});

describe('GitHub Adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkGitHubAPIAvailability', () => {
    it('debe verificar la disponibilidad de la API', async () => {
      (globalThis as any).fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          rate: { limit: 60, remaining: 59, reset: 1234567890 }
        })
      });

      const result = await checkGitHubAPIAvailability();
      expect(result.available).toBe(true);
      expect(result.rateLimit).toBeDefined();
    });

    it('debe manejar errores de red', async () => {
      (globalThis as any).fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await checkGitHubAPIAvailability();
      expect(result.available).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getPublicRepositoryInfo', () => {
    it('debe obtener información del repositorio público', async () => {
      (globalThis as any).fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            id: 123,
            name: 'test-repo',
            full_name: 'owner/test-repo',
            private: false,
            html_url: 'https://github.com/owner/test-repo',
            description: 'Test repository',
            default_branch: 'main'
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            sha: 'abc123',
            commit: {
              message: 'Test commit',
              author: { name: 'Test', date: '2024-01-01' }
            },
            html_url: 'https://github.com/owner/test-repo/commit/abc123'
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            rate: { limit: 60, remaining: 59, reset: 1234567890 }
          })
        });

      const result = await getPublicRepositoryInfo();
      expect(result.success).toBe(true);
      expect(result.repository).toBeDefined();
      expect(result.capabilities.length).toBeGreaterThan(0);
    });
  });

  describe('verifyPublicAccess', () => {
    it('debe verificar el acceso público al repositorio', async () => {
      (globalThis as any).fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          private: false,
          default_branch: 'main'
        })
      });

      const result = await verifyPublicAccess();
      expect(result.accessible).toBe(true);
      expect(result.isPublic).toBe(true);
      expect(result.defaultBranch).toBe('main');
    });

    it('debe manejar repositorio no encontrado', async () => {
      (globalThis as any).fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404
      });

      const result = await verifyPublicAccess();
      expect(result.accessible).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getPublicBranches', () => {
    it('debe obtener la lista de ramas públicas', async () => {
      (globalThis as any).fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([
          { name: 'main' },
          { name: 'develop' }
        ])
      });

      const result = await getPublicBranches();
      expect(result.branches).toContain('main');
      expect(result.branches).toContain('develop');
    });
  });

  describe('Constantes', () => {
    it('debe tener el repositorio de referencia configurado', () => {
      expect(GITHUB_REPO_OWNER).toBe('sae-space-ai');
      expect(GITHUB_REPO_NAME).toBe('montemolin-open-factory');
    });
  });
});

describe('Vercel Adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkVercelConfig', () => {
    it('debe verificar la configuración de Vercel', async () => {
      (globalThis as any).fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          buildCommand: 'npm run build',
          outputDirectory: 'dist',
          framework: 'vite',
          rewrites: [{ source: '/(.*)', destination: '/index.html' }]
        })
      });

      const result = await checkVercelConfig();
      expect(result.success).toBe(true);
      expect(result.config).toBeDefined();
      expect(result.capabilities.length).toBeGreaterThan(0);
    });
  });

  describe('verifyViteCompatibility', () => {
    it('debe verificar compatibilidad con Vite', () => {
      const config = {
        buildCommand: 'npm run build',
        outputDirectory: 'dist',
        framework: 'vite',
        rewrites: [{ source: '/(.*)', destination: '/index.html' }]
      };

      const result = verifyViteCompatibility(config);
      expect(result.compatible).toBe(true);
      expect(result.issues.length).toBe(0);
    });

    it('debe detectar incompatibilidades', () => {
      const config = {
        buildCommand: 'npm run build',
        outputDirectory: 'build',
        framework: 'nextjs'
      };

      const result = verifyViteCompatibility(config);
      expect(result.compatible).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('getCurrentDeploymentInfo', () => {
    it('debe obtener información del despliegue actual', () => {
      const info = getCurrentDeploymentInfo();
      expect(info.environment).toBeDefined();
      expect(info.url).toBeDefined();
    });
  });

  describe('getVercelSummary', () => {
    it('debe generar un resumen completo de Vercel', async () => {
      (globalThis as any).fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            buildCommand: 'npm run build',
            outputDirectory: 'dist',
            framework: 'vite'
          })
        })
        .mockResolvedValueOnce({
          ok: true
        });

      const summary = await getVercelSummary();
      expect(summary.configured).toBeDefined();
      expect(summary.compatible).toBeDefined();
      expect(summary.deploymentInfo).toBeDefined();
    });
  });

  describe('Constantes', () => {
    it('debe tener el proyecto de referencia configurado', () => {
      expect(VERCEL_PROJECT_NAME).toBe('montemolin-open-factory');
    });
  });
});

describe('Qwen Adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkQwenDevelopmentTool', () => {
    it('debe verificar la herramienta de desarrollo', () => {
      const result = checkQwenDevelopmentTool();
      expect(result.available).toBe(true);
      expect(result.details).toBeDefined();
    });
  });

  describe('checkQwenInferenceAPI', () => {
    it('debe verificar la API de inferencia', async () => {
      const result = await checkQwenInferenceAPI();
      expect(result.available).toBe(false);
      expect(result.configured).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getQwenSummary', () => {
    it('debe generar un resumen del estado de Qwen', async () => {
      const summary = await getQwenSummary();
      expect(summary.mode).toBeDefined();
      expect(summary.capabilities.length).toBeGreaterThan(0);
      expect(summary.configurationRequired.length).toBeGreaterThan(0);
    });
  });

  describe('generateQwenOrder', () => {
    it('debe generar una orden para Qwen Coder', () => {
      const order = generateQwenOrder(
        'Crear una función de suma',
        ['Debe sumar dos números', 'Debe manejar errores'],
        ['Usar TypeScript', 'Seguir convenciones del proyecto'],
        ['La función devuelve el resultado correcto']
      );

      expect(order).toContain('ORDEN DE DESARROLLO PARA QWEN CODER');
      expect(order).toContain('Crear una función de suma');
      expect(order).toContain('Debe sumar dos números');
    });
  });

  describe('getQwenConfigurationRequirements', () => {
    it('debe obtener los requisitos de configuración', () => {
      const requirements = getQwenConfigurationRequirements();
      expect(requirements.backend.length).toBeGreaterThan(0);
      expect(requirements.frontend.length).toBeGreaterThan(0);
      expect(requirements.security.length).toBeGreaterThan(0);
    });
  });

  describe('isQwenInferenceReady', () => {
    it('debe verificar si la inferencia está lista', () => {
      const result = isQwenInferenceReady();
      expect(result.ready).toBe(false);
      expect(result.missingRequirements.length).toBeGreaterThan(0);
    });
  });
});

describe('Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe integrar SystemConnectionManager con los adaptadores', async () => {
    (globalThis as any).fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({})
    });

    const state = await checkAllConnections();
    
    expect(state.connections.github).toBeDefined();
    expect(state.connections.vercel).toBeDefined();
    expect(state.connections.qwen).toBeDefined();
    
    const summary = getConnectionSummary(state);
    expect(summary.total).toBe(3);
  });

  it('debe manejar fallos gracefully', async () => {
    (globalThis as any).fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const state = await checkAllConnections();
    
    expect(state.connections.github.status).toBe('DISCONNECTED');
    expect(state.connections.vercel.status).toBe('ERROR');
    expect(state.connections.qwen.status).toBe('AUTH_REQUIRED');
  });
});
