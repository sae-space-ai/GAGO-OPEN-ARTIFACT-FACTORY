# Universal API Fabric — Documentación Técnica

## Arquitectura

**Universal API Fabric** es la infraestructura común de conectividad de GAGO Open Artifact Factory. Proporciona un mecanismo homogéneo para que todos los módulos utilicen servicios externos de forma segura, eficiente y con coste cero por defecto.

## Principios de Diseño

1. **Coste Cero por Defecto**: Presupuesto monetario = 0 EUR. No se permiten operaciones pagadas sin autorización explícita.
2. **Seguridad Primero**: Las credenciales nunca se almacenan en el frontend.
3. **Offline-First**: La aplicación funciona sin conexiones externas.
4. **Priorización de Servicios Gratuitos**: Se prefieren servicios locales y APIs con cuotas gratuitas verificadas.
5. **Trazabilidad**: Todas las operaciones quedan registradas con evidencias.
6. **No Destructivo**: Las fases anteriores (0, 0.1, 1) permanecen intactas.

## Componentes Principales

### 1. Connector Registry

Registro central de todos los conectores disponibles.

**Ubicación**: `src/services/api-fabric/connector-registry.ts`

**Funciones principales**:
- `getInitialConnectors()`: Obtiene el catálogo inicial de conectores
- `installInitialConnectors()`: Instala conectores de forma idempotente
- `findConnector()`: Busca un conector por ID
- `findConnectorsByCategory()`: Filtra por categoría
- `findConnectorsByStatus()`: Filtra por estado
- `updateConnectorStatus()`: Actualiza el estado de un conector

**Conectores iniciales**:
- GitHub (repository)
- Vercel (deployment)
- Qwen (ai_provider)
- Ollama (local_ai)
- JOULE (internal)
- Supabase (storage)
- Google Drive (document)
- n8n (automation)

**Estados de conectores**:
- `discovered`: Identificado pero no configurado
- `available`: Documentado y disponible bajo condiciones
- `configuration_required`: Necesita configuración
- `authorization_required`: Necesita autorización
- `connected`: Configuración de conexión existe
- `verified`: Prueba real satisfactoria
- `degraded`: Funciona parcialmente
- `rate_limited`: Cuota agotada
- `blocked`: Política impide uso
- `disabled`: Desactivado manualmente
- `unsupported`: No disponible con requisitos actuales

### 2. Free Tier Policy Engine

Motor de políticas de coste cero.

**Ubicación**: `src/services/api-fabric/free-tier-policy.ts`

**Funciones principales**:
- `isEligibleForZeroCost()`: Verifica si un modelo de facturación es elegible
- `isConnectorEligible()`: Verifica si un conector es elegible
- `isCapabilityEligible()`: Verifica si una capacidad es elegible
- `filterEligibleConnectors()`: Filtra conectores elegibles
- `estimateOperationCost()`: Estima el coste de una operación
- `canExecuteOperation()`: Verifica si una operación puede ejecutarse

**Política por defecto (ZERO_COST_POLICY)**:
```typescript
{
  maxMonetaryCost: 0,
  currency: 'EUR',
  allowPaidOperations: false,
  requireExplicitAuthorization: true,
  blockedProviders: [],
  allowedFreeTiers: ['free_permanent', 'free_tier', 'local_execution']
}
```

**Modelos de facturación**:
- `free_permanent`: Gratuito permanente
- `free_tier`: Cuota gratuita limitada
- `free_promotional`: Crédito promocional temporal
- `pay_per_use`: Pago por uso
- `subscription`: Suscripción
- `local_execution`: Ejecución local (sin API)
- `unknown`: No verificado

### 3. Capability Discovery Engine

Motor de descubrimiento automático de capacidades.

**Ubicación**: `src/services/api-fabric/capability-discovery.ts`

**Funciones principales**:
- `discoverCapabilities()`: Descubre capacidades de los módulos
- `installDiscoveredCapabilities()`: Instala capacidades de forma idempotente
- `updateCapabilityStatus()`: Actualiza el estado de una capacidad
- `findCapabilitiesByModule()`: Busca por módulo
- `findCapabilitiesByCategory()`: Busca por categoría
- `getPendingCapabilities()`: Obtiene capacidades pendientes
- `getAutoConnectEligibleCapabilities()`: Obtiene capacidades elegibles para autoconexión

**Capacidades descubiertas**:
- Sincronización con GitHub (Proyectos)
- Vinculación con GitHub Issues (Tareas)
- Almacenamiento de Versiones (Artefactos)
- Resultados de GitHub Actions (Evidencias)
- Vinculación con APIs (Matriz de Alcance)
- Verificación Automatizada (Quality Gates)
- Generación de Código con IA (Qwen)
- Optimización de Recursos (JOULE)
- Exportación a Google Drive (Configuración)
- Estado de Despliegue (Dashboard)
- Ejecución Local de Modelos (Ollama)
- Workflows con n8n (Automatización)

### 4. Quota and Budget Manager

Gestor de cuotas y presupuestos.

**Ubicación**: `src/services/api-fabric/quota-manager.ts`

**Funciones principales**:
- `recordQuotaUsage()`: Registra el uso de una capacidad
- `checkQuotaLimit()`: Verifica límites de cuota
- `canExecuteWithQuota()`: Verifica si se puede ejecutar considerando cuotas
- `updateQuotaFromHeaders()`: Actualiza cuotas desde cabeceras HTTP
- `getConnectorUsage()`: Obtiene uso de un conector
- `resetQuotaUsage()`: Reinicia cuotas
- `getUsageStatistics()`: Obtiene estadísticas de uso

### 5. Integration Orchestrator

Orquestador de integraciones.

**Ubicación**: `src/services/api-fabric/orchestrator.ts`

**Funciones principales**:
- `selectFreeCompatibleProvider()`: Selecciona el mejor proveedor gratuito
- `autoConnectCapability()`: Intenta autoconectar una capacidad
- `executeOperation()`: Ejecuta una operación a través del orquestador
- `autoConnectAllEligible()`: Autoconecta todas las capacidades elegibles
- `getIntegrationStatus()`: Obtiene el estado general de integraciones

### 6. API Control Center

Centro de control visual de todas las integraciones.

**Ubicación**: `src/pages/APIControlCenter.tsx`

**Características**:
- Dashboard con métricas en tiempo real
- Política de presupuesto visible
- Filtros por categoría y estado
- Tarjetas de conectores con información detallada
- Estados visuales con iconos y colores
- Enlaces a documentación

## Integración con el Almacenamiento

La API Fabric se integra con el `DataStore` existente:

```typescript
interface DataStore {
  // ... campos de Fases 0, 0.1 y 1
  apiFabricState?: {
    connectors: Connector[];
    capabilityRequirements: CapabilityRequirement[];
    quotaUsage: Record<string, QuotaUsage>;
    budgetPolicy: BudgetPolicy;
    integrationEvidence: IntegrationEvidence[];
    version: string;
  };
}
```

## Migración de Datos

La migración de Fase 1 a Fase 2 es no destructiva:

1. Preserva todos los datos existentes
2. Añade `apiFabricState` con estado inicial
3. No modifica proyectos, tareas, artefactos, evidencias, matriz, puertas ni JOULE

## Seguridad

### Principios de Seguridad

1. **No almacenar credenciales en el frontend**
2. **No utilizar variables VITE para secretos**
3. **No almacenar tokens administrativos en localStorage**
4. **No imprimir secretos en logs**
5. **Usar permisos mínimos**
6. **Las credenciales deben poder revocarse**

### Gestión de Credenciales

Para conexiones externas privadas:
- Utilizar funciones de servidor cuando sea necesario
- Implementar controles de autenticación y autorización adecuados
- No construir un proxy de uso público sin restricciones
- Las operaciones administrativas deben estar protegidas

## Modo Offline-First

La factoría conserva sus funciones locales cuando no existe conexión a Internet:

- Los proyectos pueden consultarse
- Las tareas pueden gestionarse
- Los artefactos locales permanecen accesibles
- La matriz de alcance funciona
- Las evidencias almacenadas localmente permanecen disponibles
- JOULE puede utilizar las capacidades locales

Las integraciones externas aparecen como desconectadas o pendientes.

## Clasificación de Gratuidad

### Gratuitos Permanentes
- **JOULE**: Motor interno, siempre disponible

### Cuota Gratuita Limitada
- **GitHub**: 60 req/h sin auth, 5000 req/h con auth
- **Vercel**: Despliegues ilimitados en Hobby plan
- **Ollama**: Sin límites de API (recursos locales)
- **Supabase**: 500MB DB, 1GB storage, 2GB transfer/mes
- **Google Drive**: 15GB almacenamiento, 1200 req/min
- **n8n**: Self-hosted ilimitado, Cloud 5 ejecuciones/día

### Pago por Uso (Requieren Autorización)
- **Qwen**: Requiere API key y backend seguro

## Pruebas

Ver `src/tests/api-fabric.test.ts` para pruebas de:

- Connector Registry
- Free Tier Policy Engine
- Capability Discovery Engine
- Quota and Budget Manager
- Integration Orchestrator
- Seguridad (bloqueo de operaciones pagadas, verificación de free tier)

## Reversión

Para desactivar API Fabric completamente:

1. Eliminar `apiFabricState` del `DataStore`
2. La aplicación vuelve al comportamiento de la Fase 1
3. Los datos de las Fases 0, 0.1 y 1 permanecen intactos

## Documentación Adicional

- `docs/FASE_2_INFORME.md`: Informe completo de la Fase 2
- `docs/CHANGELOG.md`: Historial de cambios
- `README.md`: Documentación principal

## Próximos Pasos

1. Configurar conectores que requieren autenticación
2. Implementar adaptadores adicionales según necesidades
3. Evaluar inferencia en navegador con WebGPU
4. Integrar con módulos existentes para usar capacidades descubiertas
5. Implementar sistema de fallback avanzado
6. Añadir monitor de salud de APIs
