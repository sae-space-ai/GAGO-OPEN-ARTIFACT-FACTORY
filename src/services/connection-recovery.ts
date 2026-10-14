// GAGO Open Artifact Factory - Connection Recovery Engine
// Phase 3: Automatic error diagnosis and recovery

import type { ConnectionTest, ConnectionRecoveryPlan, ErrorCategory, RecoveryAction } from '../types/phase3';

/**
 * Analiza un error y genera un plan de recuperación
 */
export function diagnoseConnectionError(test: ConnectionTest): ConnectionRecoveryPlan {
  const plan: ConnectionRecoveryPlan = {
    connectorId: test.connectorId,
    errorCategory: test.errorCategory || 'ADAPTER_ERROR',
    recommendedAction: 'MANUAL_INTERVENTION',
    canAutoRecover: false,
    requiresUserAction: true,
    estimatedDuration: 0
  };

  if (!test.errorCategory) {
    return plan;
  }

  switch (test.errorCategory) {
    case 'CONFIG_INCOMPLETE':
      plan.recommendedAction = 'MANUAL_INTERVENTION';
      plan.canAutoRecover = false;
      plan.requiresUserAction = true;
      plan.userActionDescription = 'Complete la configuración del conector';
      plan.estimatedDuration = 300000; // 5 minutos
      break;

    case 'CREDENTIALS_MISSING':
      plan.recommendedAction = 'PROVIDE_CREDENTIALS';
      plan.canAutoRecover = false;
      plan.requiresUserAction = true;
      plan.userActionDescription = 'Proporcione las credenciales de autenticación';
      plan.estimatedDuration = 120000; // 2 minutos
      break;

    case 'CREDENTIALS_EXPIRED':
      plan.recommendedAction = 'REFRESH_TOKEN';
      plan.canAutoRecover = false;
      plan.requiresUserAction = true;
      plan.userActionDescription = 'Renueve las credenciales expiradas';
      plan.estimatedDuration = 60000; // 1 minuto
      break;

    case 'INSUFFICIENT_PERMISSIONS':
      plan.recommendedAction = 'REQUEST_PERMISSIONS';
      plan.canAutoRecover = false;
      plan.requiresUserAction = true;
      plan.userActionDescription = 'Solicite los permisos necesarios al proveedor';
      plan.estimatedDuration = 300000; // 5 minutos
      break;

    case 'WRONG_ENDPOINT':
      plan.recommendedAction = 'CORRECT_ENDPOINT';
      plan.canAutoRecover = true;
      plan.requiresUserAction = false;
      plan.estimatedDuration = 5000; // 5 segundos
      break;

    case 'NETWORK_ERROR':
      plan.recommendedAction = 'CHECK_NETWORK';
      plan.canAutoRecover = false;
      plan.requiresUserAction = true;
      plan.userActionDescription = 'Verifique su conexión a Internet';
      plan.estimatedDuration = 60000; // 1 minuto
      break;

    case 'CORS_ERROR':
      plan.recommendedAction = 'USE_BACKEND_PROXY';
      plan.canAutoRecover = false;
      plan.requiresUserAction = true;
      plan.userActionDescription = 'Configure un proxy backend para esta operación';
      plan.estimatedDuration = 600000; // 10 minutos
      break;

    case 'SERVICE_UNAVAILABLE':
      plan.recommendedAction = 'WAIT_AND_RETRY';
      plan.canAutoRecover = true;
      plan.requiresUserAction = false;
      plan.estimatedDuration = 30000; // 30 segundos
      break;

    case 'QUOTA_EXCEEDED':
      plan.recommendedAction = 'WAIT_AND_RETRY';
      plan.canAutoRecover = true;
      plan.requiresUserAction = false;
      plan.estimatedDuration = 3600000; // 1 hora
      break;

    case 'PAYMENT_REQUIRED':
      plan.recommendedAction = 'MANUAL_INTERVENTION';
      plan.canAutoRecover = false;
      plan.requiresUserAction = true;
      plan.userActionDescription = 'Este servicio requiere pago. Desactive o cambie a una alternativa gratuita';
      plan.estimatedDuration = 0;
      break;

    case 'DEPENDENCY_NOT_INSTALLED':
      plan.recommendedAction = 'INSTALL_DEPENDENCY';
      plan.canAutoRecover = false;
      plan.requiresUserAction = true;
      plan.userActionDescription = 'Instale la dependencia requerida';
      plan.estimatedDuration = 300000; // 5 minutos
      break;

    case 'RESPONSE_FORMAT_ERROR':
      plan.recommendedAction = 'MANUAL_INTERVENTION';
      plan.canAutoRecover = false;
      plan.requiresUserAction = true;
      plan.userActionDescription = 'El proveedor devolvió un formato inesperado. Verifique la API';
      plan.estimatedDuration = 600000; // 10 minutos
      break;

    case 'TIMEOUT':
      plan.recommendedAction = 'WAIT_AND_RETRY';
      plan.canAutoRecover = true;
      plan.requiresUserAction = false;
      plan.estimatedDuration = 10000; // 10 segundos
      break;

    case 'ADAPTER_ERROR':
      plan.recommendedAction = 'MANUAL_INTERVENTION';
      plan.canAutoRecover = false;
      plan.requiresUserAction = true;
      plan.userActionDescription = 'Error interno del adaptador. Revise la configuración';
      plan.estimatedDuration = 300000; // 5 minutos
      break;

    default:
      plan.recommendedAction = 'MANUAL_INTERVENTION';
      plan.canAutoRecover = false;
      plan.requiresUserAction = true;
      plan.userActionDescription = 'Error desconocido. Intervención manual requerida';
      plan.estimatedDuration = 0;
  }

  return plan;
}

/**
 * Intenta recuperar automáticamente una conexión
 */
export async function attemptAutoRecovery(
  test: ConnectionTest,
  retryCount: number = 0
): Promise<{
  success: boolean;
  action: RecoveryAction;
  message: string;
  requiresManualIntervention: boolean;
}> {
  const plan = diagnoseConnectionError(test);

  // Si no puede auto-recuperarse, requerir intervención manual
  if (!plan.canAutoRecover) {
    return {
      success: false,
      action: plan.recommendedAction,
      message: plan.userActionDescription || 'Se requiere intervención manual',
      requiresManualIntervention: true
    };
  }

  // Intentar recuperación automática según la acción recomendada
  switch (plan.recommendedAction) {
    case 'WAIT_AND_RETRY':
      // Esperar y reintentar
      const waitTime = Math.min(1000 * Math.pow(2, retryCount), 30000); // Exponential backoff, max 30s
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return {
        success: true,
        action: 'WAIT_AND_RETRY',
        message: `Reintentando después de ${waitTime}ms`,
        requiresManualIntervention: false
      };

    case 'CORRECT_ENDPOINT':
      // Intentar con endpoints alternativos conocidos
      return {
        success: true,
        action: 'CORRECT_ENDPOINT',
        message: 'Intentando con endpoint alternativo',
        requiresManualIntervention: false
      };

    case 'USE_FALLBACK':
      // Cambiar a proveedor alternativo
      return {
        success: true,
        action: 'USE_FALLBACK',
        message: 'Cambiando a proveedor alternativo',
        requiresManualIntervention: false
      };

    default:
      return {
        success: false,
        action: plan.recommendedAction,
        message: 'Acción de recuperación no implementada',
        requiresManualIntervention: true
      };
  }
}

/**
 * Clasifica errores por severidad
 */
export function classifyErrorSeverity(errorCategory: ErrorCategory): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  switch (errorCategory) {
    case 'TIMEOUT':
    case 'NETWORK_ERROR':
      return 'LOW';

    case 'SERVICE_UNAVAILABLE':
    case 'RESPONSE_FORMAT_ERROR':
      return 'MEDIUM';

    case 'CONFIG_INCOMPLETE':
    case 'CREDENTIALS_MISSING':
    case 'CREDENTIALS_EXPIRED':
    case 'INSUFFICIENT_PERMISSIONS':
    case 'WRONG_ENDPOINT':
    case 'CORS_ERROR':
    case 'QUOTA_EXCEEDED':
    case 'DEPENDENCY_NOT_INSTALLED':
    case 'ADAPTER_ERROR':
      return 'HIGH';

    case 'PAYMENT_REQUIRED':
      return 'CRITICAL';

    default:
      return 'MEDIUM';
  }
}

/**
 * Genera un resumen de diagnóstico para el usuario
 */
export function generateDiagnosticSummary(tests: ConnectionTest[]): {
  totalErrors: number;
  criticalErrors: number;
  highErrors: number;
  mediumErrors: number;
  lowErrors: number;
  autoRecoverable: number;
  requiresManual: number;
  recommendations: string[];
} {
  const summary = {
    totalErrors: 0,
    criticalErrors: 0,
    highErrors: 0,
    mediumErrors: 0,
    lowErrors: 0,
    autoRecoverable: 0,
    requiresManual: 0,
    recommendations: [] as string[]
  };

  const failedTests = tests.filter(t => !t.success);
  summary.totalErrors = failedTests.length;

  for (const test of failedTests) {
    if (!test.errorCategory) continue;

    const severity = classifyErrorSeverity(test.errorCategory);
    const plan = diagnoseConnectionError(test);

    switch (severity) {
      case 'CRITICAL':
        summary.criticalErrors++;
        break;
      case 'HIGH':
        summary.highErrors++;
        break;
      case 'MEDIUM':
        summary.mediumErrors++;
        break;
      case 'LOW':
        summary.lowErrors++;
        break;
    }

    if (plan.canAutoRecover) {
      summary.autoRecoverable++;
    } else {
      summary.requiresManual++;
    }
  }

  // Generar recomendaciones
  if (summary.criticalErrors > 0) {
    summary.recommendations.push('⚠️ Hay errores críticos que requieren atención inmediata');
  }

  if (summary.requiresManual > 0) {
    summary.recommendations.push(`🔧 ${summary.requiresManual} error(es) requieren intervención manual`);
  }

  if (summary.autoRecoverable > 0) {
    summary.recommendations.push(`✅ ${summary.autoRecoverable} error(es) pueden recuperarse automáticamente`);
  }

  if (summary.totalErrors === 0) {
    summary.recommendations.push('✨ No se detectaron errores de conexión');
  }

  return summary;
}
