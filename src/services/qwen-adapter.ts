// GAGO Open Artifact Factory - Qwen Adapter
// Phase 10: Final Integration Repair

export interface QwenConnectionResult {
  success: boolean;
  capabilities: string[];
  errors: string[];
  mode: 'development_tool' | 'inference_api' | 'not_available';
  configurationRequired: string[];
}

/**
 * Verifica el estado de Qwen Coder como herramienta de desarrollo
 */
export function checkQwenDevelopmentTool(): {
  available: boolean;
  details: string;
} {
  // Qwen Coder es una herramienta de desarrollo instalada en el entorno
  // No es accesible desde la aplicación web desplegada
  return {
    available: true,
    details: 'Qwen Coder está disponible como herramienta de desarrollo en el entorno local. No es accesible desde la aplicación web desplegada.'
  };
}

/**
 * Verifica la disponibilidad de la API de inferencia de Qwen
 */
export async function checkQwenInferenceAPI(): Promise<{
  available: boolean;
  configured: boolean;
  error?: string;
}> {
  // La API de inferencia requiere:
  // 1. API key configurada en backend seguro
  // 2. Endpoint de proxy configurado
  // 3. Autenticación de usuario
  
  // Desde el frontend, solo podemos verificar si está configurado
  // No podemos hacer llamadas directas a la API sin backend
  
  return {
    available: false,
    configured: false,
    error: 'La API de inferencia de Qwen requiere configuración de backend seguro con API key. No está disponible desde el frontend.'
  };
}

/**
 * Obtiene un resumen del estado de Qwen
 */
export async function getQwenSummary(): Promise<QwenConnectionResult> {
  const result: QwenConnectionResult = {
    success: false,
    capabilities: [],
    errors: [],
    mode: 'not_available',
    configurationRequired: []
  };

  // Verificar herramienta de desarrollo
  const devTool = checkQwenDevelopmentTool();
  if (devTool.available) {
    result.capabilities.push('Qwen Coder como herramienta de desarrollo');
    result.mode = 'development_tool';
  }

  // Verificar API de inferencia
  const inferenceAPI = await checkQwenInferenceAPI();
  if (inferenceAPI.configured) {
    result.capabilities.push('API de inferencia configurada');
    result.mode = 'inference_api';
    result.success = true;
  } else {
    result.configurationRequired.push('API key de Qwen en backend seguro');
    result.configurationRequired.push('Endpoint de proxy configurado');
    result.configurationRequired.push('Sistema de autenticación de usuarios');
    result.errors.push(inferenceAPI.error || 'API de inferencia no configurada');
  }

  return result;
}

/**
 * Genera una orden para Qwen Coder (herramienta de desarrollo)
 */
export function generateQwenOrder(
  objective: string,
  requirements: string[],
  constraints: string[],
  acceptanceCriteria: string[]
): string {
  const timestamp = new Date().toISOString();
  
  let order = `# ORDEN DE DESARROLLO PARA QWEN CODER
## Generada por GAGO Open Artifact Factory
**Fecha:** ${new Date(timestamp).toLocaleString('es-ES')}
**Estado:** Preparada localmente — No ejecutada

---

## Objetivo
${objective}

## Requisitos
${requirements.length > 0 ? requirements.map((r, i) => `${i + 1}. ${r}`).join('\n') : '- Sin requisitos específicos definidos'}

## Restricciones
${constraints.length > 0 ? constraints.map((c, i) => `${i + 1}. ${c}`).join('\n') : '- Sin restricciones específicas definidas'}

## Criterios de aceptación
${acceptanceCriteria.length > 0 ? acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n') : '- Sin criterios de aceptación definidos'}

---

## Notas
- Esta orden ha sido generada localmente mediante plantillas de GAGO Factory.
- No ha sido ejecutada por Qwen Coder.
- Copie este documento y utilícelo como instrucción para Qwen Coder en su entorno de desarrollo.
- Qwen Coder debe estar instalado y configurado en su entorno local.
`;

  return order;
}

/**
 * Prepara la configuración necesaria para habilitar la API de inferencia
 */
export function getQwenConfigurationRequirements(): {
  backend: string[];
  frontend: string[];
  security: string[];
} {
  return {
    backend: [
      'Configurar API key de Qwen en variables de entorno del servidor',
      'Implementar endpoint de proxy para llamadas a la API',
      'Configurar límites de rate limiting',
      'Implementar sistema de logging de uso',
      'Configurar sistema de facturación o control de cuotas'
    ],
    frontend: [
      'Implementar interfaz de selección de modelo',
      'Implementar validación de parámetros',
      'Implementar manejo de errores',
      'Implementar cancelación de solicitudes',
      'Implementar visualización de resultados'
    ],
    security: [
      'Nunca exponer API keys en el frontend',
      'Implementar autenticación de usuarios',
      'Implementar autorización por usuario',
      'Implementar control de quotas por usuario',
      'Implementar auditoría de uso',
      'Implementar protección contra abuso'
    ]
  };
}

/**
 * Verifica si la inferencia de Qwen está lista para usar
 */
export function isQwenInferenceReady(): {
  ready: boolean;
  missingRequirements: string[];
} {
  const requirements = getQwenConfigurationRequirements();
  const missing: string[] = [];

  // En esta fase, todas las configuraciones de backend están pendientes
  missing.push(...requirements.backend);
  missing.push('Configuración de proveedor de pago para API de Qwen');
  missing.push('Pruebas de integración con API real');

  return {
    ready: false,
    missingRequirements: missing
  };
}
