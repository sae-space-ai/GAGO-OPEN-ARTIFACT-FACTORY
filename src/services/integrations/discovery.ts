// GAGO Open Artifact Factory - Capability Discovery & Route Selection
// Fase 6: Motor de descubrimiento y selección de rutas

import type { 
  IntegrationConnector, 
  CapabilityDiscovery, 
  IntegrationRoute 
} from '../../types/integrations';

/**
 * Analiza los módulos existentes y descubre sus necesidades de capacidades
 */
export function discoverCapabilities(
  connectors: IntegrationConnector[],
  modules: Array<{ id: string; name: string; requiredCapabilities: string[] }>
): CapabilityDiscovery[] {
  return modules.map(module => {
    const availableConnectors: string[] = [];
    const pendingConnectors: string[] = [];
    const blockedConnectors: string[] = [];

    // Para cada capacidad requerida, buscar conectores compatibles
    module.requiredCapabilities.forEach(capabilityId => {
      const compatibleConnectors = connectors.filter(connector =>
        connector.capabilities.some(cap => cap.id === capabilityId)
      );

      compatibleConnectors.forEach(connector => {
        if (connector.connectionStatus === 'VERIFIED') {
          if (!availableConnectors.includes(connector.id)) {
            availableConnectors.push(connector.id);
          }
        } else if (connector.connectionStatus === 'BLOCKED' || connector.connectionStatus === 'ERROR') {
          if (!blockedConnectors.includes(connector.id)) {
            blockedConnectors.push(connector.id);
          }
        } else {
          if (!pendingConnectors.includes(connector.id)) {
            pendingConnectors.push(connector.id);
          }
        }
      });
    });

    return {
      moduleId: module.id,
      moduleName: module.name,
      requiredCapabilities: module.requiredCapabilities,
      availableConnectors,
      pendingConnectors,
      blockedConnectors,
      dependencies: {}
    };
  });
}

/**
 * Selecciona la mejor ruta de integración para una capacidad
 */
export function selectIntegrationRoute(
  capabilityId: string,
  connectors: IntegrationConnector[],
  context: {
    requiresAuth: boolean;
    permissions: string[];
    maxCost: number;
    maxLatency: number;
    preferLocal: boolean;
  }
): IntegrationRoute | null {
  // Encontrar conectores compatibles
  const compatibleConnectors = connectors.filter(connector =>
    connector.capabilities.some(cap => cap.id === capabilityId)
  );

  if (compatibleConnectors.length === 0) {
    return null;
  }

  // Filtrar por requisitos
  const eligibleConnectors = compatibleConnectors.filter(connector => {
    // Verificar estado de conexión
    if (connector.connectionStatus !== 'VERIFIED' && connector.connectionStatus !== 'CONNECTED') {
      return false;
    }

    // Verificar autenticación
    if (context.requiresAuth && connector.authType === 'none') {
      return false;
    }

    // Verificar permisos
    const hasRequiredPermissions = context.permissions.every(perm =>
      connector.requiredPermissions.includes(perm)
    );
    if (!hasRequiredPermissions) {
      return false;
    }

    // Verificar coste
    if (connector.costClassification === 'pay_per_use' || connector.costClassification === 'subscription') {
      return false; // Bloquear operaciones pagadas por defecto
    }

    // Verificar cuota
    if (connector.quotas.limit && connector.quotas.current && connector.quotas.current >= connector.quotas.limit) {
      return false;
    }

    return true;
  });

  if (eligibleConnectors.length === 0) {
    return null;
  }

  // Calcular puntuación para cada conector elegible
  const routes: IntegrationRoute[] = eligibleConnectors.map(connector => {
    const capability = connector.capabilities.find(cap => cap.id === capabilityId)!;
    
    // Calcular coste estimado (0 para gratuitos, valor para otros)
    let estimatedCost = 0;
    if (connector.costClassification === 'free_tier' && connector.quotas.limit) {
      estimatedCost = 0;
    } else if (connector.costClassification === 'local_execution') {
      estimatedCost = 0;
    }

    // Calcular latencia estimada
    let estimatedLatency = 100; // ms por defecto
    if (capability.isLocal) {
      estimatedLatency = 10; // Local es más rápido
    } else if (connector.category === 'ai_inference') {
      estimatedLatency = 2000; // IA es más lento
    }

    // Calcular confianza basado en estado de verificación
    let confidence = 0.5;
    if (connector.connectionStatus === 'VERIFIED') {
      confidence = 0.95;
    } else if (connector.connectionStatus === 'CONNECTED') {
      confidence = 0.8;
    }

    // Bonus por preferencia local
    if (context.preferLocal && capability.isLocal) {
      confidence += 0.05;
    }

    return {
      id: `route-${connector.id}-${capabilityId}`,
      capabilityId,
      connectorId: connector.id,
      priority: capability.isLocal ? 1 : 2,
      estimatedCost,
      estimatedLatency,
      confidence: Math.min(confidence, 1.0),
      restrictions: connector.restrictions.allowedOrigins || [],
      selected: false
    };
  });

  // Ordenar por prioridad (menor es mejor), luego por confianza (mayor es mejor)
  routes.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return b.confidence - a.confidence;
  });

  // Seleccionar la mejor ruta
  if (routes.length > 0) {
    routes[0].selected = true;
    return routes[0];
  }

  return null;
}

/**
 * Genera un mapa de dependencias entre módulos y conectores
 */
export function generateDependencyMap(
  discoveries: CapabilityDiscovery[],
  connectors: IntegrationConnector[]
): {
  moduleDependencies: Record<string, string[]>;
  connectorDependencies: Record<string, string[]>;
  criticalConnectors: string[];
} {
  const moduleDependencies: Record<string, string[]> = {};
  const connectorDependencies: Record<string, string[]> = {};
  const connectorUsageCount: Record<string, number> = {};

  // Construir dependencias de módulos
  discoveries.forEach(discovery => {
    const allConnectors = [
      ...discovery.availableConnectors,
      ...discovery.pendingConnectors
    ];
    moduleDependencies[discovery.moduleId] = allConnectors;

    // Contar uso de conectores
    allConnectors.forEach(connectorId => {
      connectorUsageCount[connectorId] = (connectorUsageCount[connectorId] || 0) + 1;
      
      if (!connectorDependencies[connectorId]) {
        connectorDependencies[connectorId] = [];
      }
      connectorDependencies[connectorId].push(discovery.moduleId);
    });
  });

  // Identificar conectores críticos (usados por múltiples módulos)
  const criticalConnectors = Object.entries(connectorUsageCount)
    .filter(([_, count]) => count > 1)
    .map(([connectorId, _]) => connectorId);

  return {
    moduleDependencies,
    connectorDependencies,
    criticalConnectors
  };
}

/**
 * Verifica si un conector puede ser desconectado de forma segura
 */
export function canSafelyDisconnect(
  connectorId: string,
  dependencyMap: { connectorDependencies: Record<string, string[]> }
): { safe: boolean; affectedModules: string[] } {
  const affectedModules = dependencyMap.connectorDependencies[connectorId] || [];
  
  return {
    safe: affectedModules.length === 0,
    affectedModules
  };
}

/**
 * Obtiene todas las capacidades disponibles de un conector
 */
export function getConnectorCapabilities(
  connector: IntegrationConnector
): Array<{
  id: string;
  name: string;
  verified: boolean;
  isFree: boolean;
}> {
  return connector.capabilities.map(cap => ({
    id: cap.id,
    name: cap.name,
    verified: cap.verified,
    isFree: cap.isFree
  }));
}
