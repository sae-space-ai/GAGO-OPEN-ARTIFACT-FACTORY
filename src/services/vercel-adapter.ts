// GAGO Open Artifact Factory - Vercel Adapter
// Phase 10: Final Integration Repair

export interface VercelConfig {
  version?: number;
  buildCommand?: string;
  outputDirectory?: string;
  framework?: string;
  rewrites?: Array<{ source: string; destination: string }>;
  headers?: Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
}

export interface VercelConnectionResult {
  success: boolean;
  config?: VercelConfig;
  capabilities: string[];
  errors: string[];
  deploymentInfo?: {
    environment: string;
    url?: string;
    ready?: boolean;
  };
}

/**
 * Proyecto Vercel de referencia
 */
export const VERCEL_PROJECT_NAME = 'montemolin-open-factory';
export const VERCEL_PROJECT_ID = 'prj_oi4vpyAktwFD42mWkNuDiQi1dsnm';

/**
 * Verifica la configuración local de Vercel (vercel.json)
 */
export async function checkVercelConfig(): Promise<VercelConnectionResult> {
  const result: VercelConnectionResult = {
    success: false,
    capabilities: [],
    errors: []
  };

  try {
    const response = await fetch('/vercel.json', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const config = await response.json();
      result.config = config;
      result.success = true;

      // Verificar campos requeridos
      if (config.buildCommand) {
        result.capabilities.push('Build command configurado');
      } else {
        result.errors.push('Build command no definido');
      }

      if (config.outputDirectory) {
        result.capabilities.push('Output directory configurado');
      } else {
        result.errors.push('Output directory no definido');
      }

      if (config.framework) {
        result.capabilities.push(`Framework: ${config.framework}`);
      } else {
        result.errors.push('Framework no definido');
      }

      // Verificar compatibilidad con Vite
      if (config.framework === 'vite') {
        result.capabilities.push('Compatible con Vite');
      }

      // Verificar rewrites (para React Router)
      if (config.rewrites && Array.isArray(config.rewrites)) {
        result.capabilities.push('Rewrites configurados');
      }

    } else if (response.status === 404) {
      result.errors.push('vercel.json no encontrado');
    } else {
      result.errors.push(`HTTP ${response.status}`);
    }
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Error de red');
  }

  return result;
}

/**
 * Verifica que la configuración sea compatible con Vite
 */
export function verifyViteCompatibility(config: VercelConfig): {
  compatible: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Verificar framework
  if (config.framework !== 'vite') {
    issues.push(`Framework esperado: vite, encontrado: ${config.framework || 'no definido'}`);
  }

  // Verificar build command
  if (!config.buildCommand || !config.buildCommand.includes('build')) {
    issues.push('Build command debe incluir "build"');
  }

  // Verificar output directory
  if (!config.outputDirectory || config.outputDirectory !== 'dist') {
    issues.push(`Output directory esperado: dist, encontrado: ${config.outputDirectory || 'no definido'}`);
  }

  // Verificar rewrites para React Router
  if (!config.rewrites || config.rewrites.length === 0) {
    issues.push('Rewrites no configurados (necesario para React Router)');
  } else {
    // Verificar que existe un rewrite catch-all
    const hasCatchAll = config.rewrites.some(r => r.source === '/(.*)' || r.source === '/*');
    if (!hasCatchAll) {
      issues.push('Falta rewrite catch-all para React Router');
    }
  }

  return {
    compatible: issues.length === 0,
    issues
  };
}

/**
 * Obtiene información del despliegue actual
 */
export function getCurrentDeploymentInfo(): {
  environment: 'production' | 'preview' | 'development';
  url: string;
  branch?: string;
  commit?: string;
} {
  // Detectar entorno basado en variables de entorno de Vercel
  const isProduction = typeof window !== 'undefined' && 
    window.location.hostname === VERCEL_PROJECT_NAME.toLowerCase() + '.vercel.app';
  
  const isPreview = typeof window !== 'undefined' && 
    window.location.hostname.includes('.vercel.app') && 
    !isProduction;

  let environment: 'production' | 'preview' | 'development';
  if (isProduction) {
    environment = 'production';
  } else if (isPreview) {
    environment = 'preview';
  } else {
    environment = 'development';
  }

  return {
    environment,
    url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
    branch: undefined, // No disponible desde el frontend sin API
    commit: undefined  // No disponible desde el frontend sin API
  };
}

/**
 * Verifica que el directorio de salida existe (simulado desde frontend)
 */
export async function verifyOutputDirectory(): Promise<{
  exists: boolean;
  accessible: boolean;
  error?: string;
}> {
  try {
    // Intentar acceder a un recurso estático del directorio dist
    const response = await fetch('/index.html', {
      method: 'HEAD'
    });

    return {
      exists: response.ok,
      accessible: response.ok,
      error: response.ok ? undefined : `HTTP ${response.status}`
    };
  } catch (error) {
    return {
      exists: false,
      accessible: false,
      error: error instanceof Error ? error.message : 'Error de red'
    };
  }
}

/**
 * Verifica que las rutas de React Router funcionan
 */
export async function verifyReactRouterRoutes(): Promise<{
  working: boolean;
  testedRoutes: string[];
  failedRoutes: string[];
}> {
  const routesToTest = ['/', '/projects', '/tasks', '/artifacts'];
  const testedRoutes: string[] = [];
  const failedRoutes: string[] = [];

  for (const route of routesToTest) {
    try {
      const response = await fetch(route, {
        method: 'HEAD'
      });

      if (response.ok) {
        testedRoutes.push(route);
      } else {
        failedRoutes.push(route);
      }
    } catch (error) {
      failedRoutes.push(route);
    }
  }

  return {
    working: failedRoutes.length === 0,
    testedRoutes,
    failedRoutes
  };
}

/**
 * Obtiene un resumen completo de la configuración de Vercel
 */
export async function getVercelSummary(): Promise<{
  configured: boolean;
  compatible: boolean;
  deploymentReady: boolean;
  config?: VercelConfig;
  compatibilityIssues: string[];
  deploymentInfo: {
    environment: string;
    url: string;
  };
}> {
  // Verificar configuración
  const configResult = await checkVercelConfig();
  
  // Verificar compatibilidad
  let compatibilityIssues: string[] = [];
  if (configResult.config) {
    const compatibility = verifyViteCompatibility(configResult.config);
    compatibilityIssues = compatibility.issues;
  }

  // Verificar despliegue
  const outputVerification = await verifyOutputDirectory();
  const deploymentInfo = getCurrentDeploymentInfo();

  return {
    configured: configResult.success,
    compatible: compatibilityIssues.length === 0,
    deploymentReady: outputVerification.exists && outputVerification.accessible,
    config: configResult.config,
    compatibilityIssues,
    deploymentInfo: {
      environment: deploymentInfo.environment,
      url: deploymentInfo.url
    }
  };
}
