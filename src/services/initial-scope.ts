// GAGO OPEN ARTIFACT FACTORY - Initial Scope Requirements
// Fase 0.1 — 16 requisitos de la matriz inicial
// Estos registros se instalan de forma idempotente.

import type { ScopeRequirement, ScopeModule } from '../types/scope';

// IDs estables para los 16 requisitos iniciales
export const INITIAL_SCOPE_IDS: Record<ScopeModule, string> = {
  M01: 'scope-m01-protection',
  M02: 'scope-m02-data-model',
  M03: 'scope-m03-persistence',
  M04: 'scope-m04-ui',
  M05: 'scope-m05-editing',
  M06: 'scope-m06-relations',
  M07: 'scope-m07-dependencies',
  M08: 'scope-m08-impl-status',
  M09: 'scope-m09-test-status',
  M10: 'scope-m10-evidence',
  M11: 'scope-m11-acceptance',
  M12: 'scope-m12-progress',
  M13: 'scope-m13-export',
  M14: 'scope-m14-qwen',
  M15: 'scope-m15-validation',
  M16: 'scope-m16-publishing',
};

// Phase 1 — JOULE requirements
export const JOULE_SCOPE_IDS = {
  J01: 'scope-j01-observe',
  J02: 'scope-j02-profile',
  J03: 'scope-j03-predict',
  J04: 'scope-j04-optimize',
  J05: 'scope-j05-execute',
  J06: 'scope-j06-verify',
  J07: 'scope-j07-learn',
  J08: 'scope-j08-engine',
  J09: 'scope-j09-policies',
  J10: 'scope-j10-dashboard',
  J11: 'scope-j11-shadow',
  J12: 'scope-j12-canary',
  J13: 'scope-j13-killswitch',
  J14: 'scope-j14-integration',
};

function makeRequirement(
  code: ScopeModule,
  name: string,
  functionalDescription: string,
  technicalObjective: string,
  priority: ScopeRequirement['priority'],
  dependencies: string[],
  executor: ScopeRequirement['executor'],
  actionType: ScopeRequirement['actionType'],
  actionReference: string,
  acceptanceCriteria: string[]
): ScopeRequirement {
  const now = new Date().toISOString();
  return {
    id: INITIAL_SCOPE_IDS[code],
    code,
    phase: '0.1',
    module: 'Matriz de Alcance',
    name,
    functionalDescription,
    technicalObjective,
    priority,
    dependencies,
    executor,
    implementationStatus: 'not_started',
    testStatus: 'not_tested',
    verificationStatus: 'not_verified',
    acceptanceCriteria,
    evidenceIds: [],
    relatedProjectIds: [],
    relatedTaskIds: [],
    relatedArtifactIds: [],
    actionType,
    actionReference,
    blockers: [],
    observations: '',
    versionRef: 'phase-0.1-initial',
    createdAt: now,
    updatedAt: now,
    archived: false,
  };
}

export function getInitialScopeRequirements(): ScopeRequirement[] {
  const M01 = INITIAL_SCOPE_IDS.M01;
  const M02 = INITIAL_SCOPE_IDS.M02;
  const M03 = INITIAL_SCOPE_IDS.M03;
  const M04 = INITIAL_SCOPE_IDS.M04;
  const M05 = INITIAL_SCOPE_IDS.M05;
  const M06 = INITIAL_SCOPE_IDS.M06;
  const M15 = INITIAL_SCOPE_IDS.M15;

  return [
    makeRequirement(
      'M01',
      'Protección de la Fase 0',
      'Conservar todas las funcionalidades existentes de la Fase 0.',
      'Inventariar módulos, rutas, comandos, datos y pruebas antes de modificar el proyecto.',
      'critical',
      [],
      'human',
      'manual_procedure',
      'Informe de línea base',
      [
        'La comparación posterior no revela regresiones atribuibles a la ampliación.',
        'Todos los módulos de la Fase 0 continúan funcionando.',
      ]
    ),
    makeRequirement(
      'M02',
      'Modelo de datos de la matriz',
      'Implementar una estructura tipada de requisitos.',
      'Definir interfaces, enumeraciones, validadores e identificadores.',
      'critical',
      [],
      'human',
      'local_ui',
      'src/types/scope.ts',
      [
        'Los registros válidos se procesan correctamente.',
        'Los registros incorrectos se rechazan sin corrupción.',
      ]
    ),
    makeRequirement(
      'M03',
      'Persistencia compatible',
      'Conservar la matriz y los datos anteriores.',
      'Ampliar la capa de almacenamiento y versionar su esquema.',
      'critical',
      [M02],
      'human',
      'local_ui',
      'src/services/storage.ts',
      [
        'Los registros de Fase 0 continúan siendo legibles.',
        'La matriz persiste al actualizar el navegador.',
      ]
    ),
    makeRequirement(
      'M04',
      'Interfaz de la matriz',
      'Visualizar todos los elementos de alcance.',
      'Crear una página específica integrada en la navegación.',
      'high',
      [M02, M03],
      'human',
      'local_ui',
      'src/pages/ScopeMatrix.tsx',
      [
        'Permite consultar requisitos y muestra correctamente sus estados.',
        'La página está accesible desde la barra lateral.',
      ]
    ),
    makeRequirement(
      'M05',
      'Edición de requisitos',
      'Gestionar el alcance mediante operaciones reales.',
      'Implementar creación, edición, consulta y archivo de registros.',
      'high',
      [M04],
      'human',
      'local_ui',
      'src/pages/ScopeMatrix.tsx',
      [
        'Las modificaciones válidas se conservan.',
        'Los errores se comunican al usuario.',
      ]
    ),
    makeRequirement(
      'M06',
      'Relaciones entre módulos',
      'Vincular requisitos con proyectos, tareas, artefactos y evidencias.',
      'Utilizar identificadores y referencias coherentes con los modelos existentes.',
      'high',
      [M04],
      'human',
      'local_ui',
      'src/pages/ScopeMatrix.tsx',
      [
        'Los elementos relacionados pueden consultarse sin duplicaciones.',
      ]
    ),
    makeRequirement(
      'M07',
      'Gestión de dependencias',
      'Identificar requisitos bloqueados por otros requisitos.',
      'Establecer relaciones entre registros y detectar dependencias inexistentes y ciclos.',
      'high',
      [M02],
      'human',
      'local_ui',
      'src/services/dependencies.ts',
      [
        'El sistema impide dependencias circulares.',
        'Muestra los bloqueos correctamente.',
      ]
    ),
    makeRequirement(
      'M08',
      'Estados de implementación',
      'Conocer el progreso real del desarrollo.',
      'Implementar los estados: no iniciado, en desarrollo, implementado, bloqueado y descartado.',
      'high',
      [M02],
      'human',
      'local_ui',
      'src/types/scope.ts',
      [
        'Los estados se guardan correctamente.',
        'Las transiciones inválidas se rechazan.',
      ]
    ),
    makeRequirement(
      'M09',
      'Estados de validación',
      'Separar implementación de verificación.',
      'Implementar los estados: no probado, prueba fallida, prueba superada y verificado.',
      'critical',
      [M02],
      'human',
      'local_ui',
      'src/types/scope.ts',
      [
        'Ningún requisito adquiere automáticamente el estado verificado solo por estar implementado.',
      ]
    ),
    makeRequirement(
      'M10',
      'Registro de evidencias',
      'Asociar pruebas y resultados a cada requisito.',
      'Integrar la matriz con el registro de evidencias existente.',
      'critical',
      [M04, M06],
      'human',
      'local_ui',
      'src/pages/ScopeMatrix.tsx',
      [
        'Cada evidencia mantiene una referencia válida al requisito.',
      ]
    ),
    makeRequirement(
      'M11',
      'Criterios de aceptación',
      'Determinar cuándo un requisito puede darse por completado.',
      'Permitir registrar y comprobar criterios específicos.',
      'high',
      [M02],
      'human',
      'local_ui',
      'src/pages/ScopeMatrix.tsx',
      [
        'Los criterios pendientes son visibles.',
        'No se confunden con verificaciones satisfactorias.',
      ]
    ),
    makeRequirement(
      'M12',
      'Panel de progreso',
      'Mostrar indicadores reales de la fase.',
      'Calcular número de requisitos, implementados, probados, verificados y bloqueados.',
      'high',
      [M04],
      'human',
      'local_ui',
      'src/pages/ScopeMatrix.tsx',
      [
        'Los indicadores coinciden con los registros almacenados.',
      ]
    ),
    makeRequirement(
      'M13',
      'Exportación e importación',
      'Permitir portabilidad de la matriz.',
      'Ampliar las operaciones JSON ya existentes sin romper su formato anterior.',
      'high',
      [M03],
      'human',
      'local_ui',
      'src/services/storage.ts',
      [
        'Los archivos válidos se importan correctamente.',
        'Los incompatibles se rechazan de forma controlada.',
      ]
    ),
    makeRequirement(
      'M14',
      'Integración con Qwen Coder',
      'Generar órdenes de desarrollo a partir de requisitos pendientes.',
      'Conectar la matriz con el generador local de instrucciones de la Fase 0.',
      'high',
      [M04, M05],
      'human',
      'local_ui',
      'src/pages/QwenGenerator.tsx',
      [
        'Se obtiene una orden que contiene los requisitos seleccionados.',
        'No se afirma que Qwen Coder ha ejecutado el trabajo.',
      ]
    ),
    makeRequirement(
      'M15',
      'Validación continua',
      'Detectar regresiones y errores técnicos.',
      'Ampliar las pruebas existentes y configurar su ejecución en GitHub Actions.',
      'critical',
      [M01],
      'automated',
      'automated_check',
      'npm run test && npm run build',
      [
        'El workflow ejecuta las comprobaciones establecidas.',
        'Falla cuando alguna comprobación obligatoria falla.',
      ]
    ),
    makeRequirement(
      'M16',
      'Preparación de publicación',
      'Garantizar compatibilidad con Vite y Vercel.',
      'Verificar compilación, recursos, navegación y configuración de despliegue.',
      'critical',
      [M15],
      'automated',
      'automated_check',
      'npm run build',
      [
        'La aplicación compilada funciona.',
        'Las rutas son compatibles con el entorno previsto.',
      ]
    ),
  ];
}

/**
 * Requisitos de la Fase 3 - Automatic Configuration and Connection Recovery
 */
const PHASE3_SCOPE_IDS = {
  P3_01: 'scope-p3-01-connection-verification',
  P3_02: 'scope-p3-02-auto-configuration',
  P3_03: 'scope-p3-03-error-recovery',
  P3_04: 'scope-p3-04-connection-control-center',
  P3_05: 'scope-p3-05-github-integration',
  P3_06: 'scope-p3-06-vercel-integration',
  P3_07: 'scope-p3-07-ollama-integration',
  P3_08: 'scope-p3-08-joule-connection',
  P3_09: 'scope-p3-09-security-validation',
  P3_10: 'scope-p3-10-testing',
};

function getPhase3ScopeRequirements(): ScopeRequirement[] {
  const now = new Date().toISOString();

  function makePhase3Req(
    id: string,
    name: string,
    description: string,
    objective: string,
    priority: 'critical' | 'high' | 'medium' | 'low',
    dependencies: string[]
  ): ScopeRequirement {
    return {
      id,
      code: 'M01',
      phase: '3',
      module: 'Conexiones',
      name,
      functionalDescription: description,
      technicalObjective: objective,
      priority,
      dependencies,
      executor: 'human',
      implementationStatus: 'implemented',
      testStatus: 'not_tested',
      verificationStatus: 'not_verified',
      acceptanceCriteria: [],
      evidenceIds: [],
      relatedProjectIds: [],
      relatedTaskIds: [],
      relatedArtifactIds: [],
      actionType: 'local_ui',
      actionReference: 'src/services/auto-config.ts',
      blockers: [],
      observations: '',
      versionRef: 'phase-3-connections',
      createdAt: now,
      updatedAt: now,
      archived: false,
    };
  }

  return [
    makePhase3Req(PHASE3_SCOPE_IDS.P3_01, 'Verificación de Conexiones', 'Verificar conectividad real', 'Implementar sistema de verificación de conexiones', 'critical', []),
    makePhase3Req(PHASE3_SCOPE_IDS.P3_02, 'Autoconfiguración', 'Configuración automática segura', 'Implementar Automatic Configuration Engine', 'critical', [PHASE3_SCOPE_IDS.P3_01]),
    makePhase3Req(PHASE3_SCOPE_IDS.P3_03, 'Recuperación de Errores', 'Diagnóstico y reparación automática', 'Implementar Connection Recovery Engine', 'high', [PHASE3_SCOPE_IDS.P3_01]),
    makePhase3Req(PHASE3_SCOPE_IDS.P3_04, 'Centro de Control de Conexiones', 'Interfaz de gestión de conexiones', 'Implementar Connection Control Center', 'high', [PHASE3_SCOPE_IDS.P3_02, PHASE3_SCOPE_IDS.P3_03]),
    makePhase3Req(PHASE3_SCOPE_IDS.P3_05, 'Integración GitHub', 'Verificación de API pública', 'Implementar verificación de GitHub', 'high', [PHASE3_SCOPE_IDS.P3_01]),
    makePhase3Req(PHASE3_SCOPE_IDS.P3_06, 'Integración Vercel', 'Verificación de configuración', 'Implementar verificación de Vercel', 'medium', [PHASE3_SCOPE_IDS.P3_01]),
    makePhase3Req(PHASE3_SCOPE_IDS.P3_07, 'Integración Ollama', 'Verificación de servicio local', 'Implementar verificación de Ollama', 'high', [PHASE3_SCOPE_IDS.P3_01]),
    makePhase3Req(PHASE3_SCOPE_IDS.P3_08, 'Conexión JOULE', 'Verificación del motor', 'Implementar verificación de JOULE', 'critical', [PHASE3_SCOPE_IDS.P3_01]),
    makePhase3Req(PHASE3_SCOPE_IDS.P3_09, 'Validación de Seguridad', 'Protección de credenciales', 'Implementar validaciones de seguridad', 'critical', [PHASE3_SCOPE_IDS.P3_02]),
    makePhase3Req(PHASE3_SCOPE_IDS.P3_10, 'Pruebas de Fase 3', 'Validación de funcionalidades', 'Implementar pruebas de conexiones', 'critical', [PHASE3_SCOPE_IDS.P3_01, PHASE3_SCOPE_IDS.P3_02, PHASE3_SCOPE_IDS.P3_03]),
  ];
}

/**
 * Instala los requisitos iniciales de forma idempotente.
 * No duplica registros si ya existen.
 */
export function installInitialScope(existing: ScopeRequirement[]): ScopeRequirement[] {
  const existingIds = new Set(existing.map(r => r.id));
  const initial = [
    ...getInitialScopeRequirements(),
    ...getJouleScopeRequirements(),
    ...getAPIFabricScopeRequirements(),
    ...getPhase3ScopeRequirements()
  ];
  const toAdd = initial.filter(r => !existingIds.has(r.id));
  return [...existing, ...toAdd];
}

// Phase 2 — API Fabric requirements
export const API_FABRIC_SCOPE_IDS = {
  API201: 'scope-api201-capability-inventory',
  API202: 'scope-api202-connector-registry',
  API203: 'scope-api203-auto-discovery',
  API204: 'scope-api204-auth-manager',
  API205: 'scope-api205-zero-cost-policy',
  API206: 'scope-api206-quota-manager',
  API207: 'scope-api207-github-adapter',
  API208: 'scope-api208-vercel-adapter',
  API209: 'scope-api209-qwen-adapter',
  API210: 'scope-api210-ollama-adapter',
  API211: 'scope-api211-browser-inference',
  API212: 'scope-api212-joule-connection',
  API213: 'scope-api213-document-connectors',
  API214: 'scope-api214-orchestrator',
  API215: 'scope-api215-fallback',
  API216: 'scope-api216-health-monitor',
  API217: 'scope-api217-control-center',
  API218: 'scope-api218-tests-security',
};

/**
 * Requisitos de API Fabric (Fase 2).
 */
function getAPIFabricScopeRequirements(): ScopeRequirement[] {
  const now = new Date().toISOString();

  function makeAPIReq(
    id: string,
    name: string,
    description: string,
    objective: string,
    priority: 'critical' | 'high' | 'medium' | 'low',
    dependencies: string[]
  ): ScopeRequirement {
    return {
      id,
      code: 'M01',
      phase: '2',
      module: 'API Fabric',
      name,
      functionalDescription: description,
      technicalObjective: objective,
      priority,
      dependencies,
      executor: 'human',
      implementationStatus: 'implemented',
      testStatus: 'not_tested',
      verificationStatus: 'not_verified',
      acceptanceCriteria: [],
      evidenceIds: [],
      relatedProjectIds: [],
      relatedTaskIds: [],
      relatedArtifactIds: [],
      actionType: 'local_ui',
      actionReference: 'src/services/api-fabric/',
      blockers: [],
      observations: '',
      versionRef: 'phase-2-api-fabric',
      createdAt: now,
      updatedAt: now,
      archived: false,
    };
  }

  return [
    makeAPIReq(API_FABRIC_SCOPE_IDS.API201, 'Inventario de Capacidades', 'Descubrir capacidades de módulos', 'Implementar Capability Discovery Engine', 'critical', []),
    makeAPIReq(API_FABRIC_SCOPE_IDS.API202, 'Registro de Conectores', 'Catálogo central de APIs', 'Implementar Connector Registry', 'critical', []),
    makeAPIReq(API_FABRIC_SCOPE_IDS.API203, 'Descubrimiento Automático', 'Autoconexión de servicios gratuitos', 'Implementar autoConnectAvailableProviders', 'high', [API_FABRIC_SCOPE_IDS.API201, API_FABRIC_SCOPE_IDS.API202]),
    makeAPIReq(API_FABRIC_SCOPE_IDS.API204, 'Gestión de Autenticación', 'Manejo seguro de credenciales', 'Implementar Authentication Manager', 'critical', []),
    makeAPIReq(API_FABRIC_SCOPE_IDS.API205, 'Política de Coste Cero', 'Bloqueo de operaciones pagadas', 'Implementar Free Tier Policy Engine', 'critical', []),
    makeAPIReq(API_FABRIC_SCOPE_IDS.API206, 'Control de Cuotas', 'Gestión de límites de uso', 'Implementar Quota and Budget Manager', 'high', []),
    makeAPIReq(API_FABRIC_SCOPE_IDS.API207, 'Adaptador GitHub', 'Integración con GitHub API', 'Implementar conector para GitHub', 'high', [API_FABRIC_SCOPE_IDS.API202]),
    makeAPIReq(API_FABRIC_SCOPE_IDS.API208, 'Adaptador Vercel', 'Integración con Vercel API', 'Implementar conector para Vercel', 'medium', [API_FABRIC_SCOPE_IDS.API202]),
    makeAPIReq(API_FABRIC_SCOPE_IDS.API209, 'Adaptador Qwen', 'Integración con Qwen API', 'Implementar conector para Qwen', 'high', [API_FABRIC_SCOPE_IDS.API202, API_FABRIC_SCOPE_IDS.API204]),
    makeAPIReq(API_FABRIC_SCOPE_IDS.API210, 'Adaptador Ollama', 'Integración con Ollama local', 'Implementar conector para Ollama', 'high', [API_FABRIC_SCOPE_IDS.API202]),
    makeAPIReq(API_FABRIC_SCOPE_IDS.API211, 'Inferencia en Navegador', 'Ejecución local de modelos', 'Evaluar WebGPU y alternativas', 'medium', [API_FABRIC_SCOPE_IDS.API210]),
    makeAPIReq(API_FABRIC_SCOPE_IDS.API212, 'Conexión JOULE', 'Integración con motor JOULE', 'Conectar API Fabric con JOULE', 'critical', [API_FABRIC_SCOPE_IDS.API202]),
    makeAPIReq(API_FABRIC_SCOPE_IDS.API213, 'Conectores Documentales', 'Google Drive y almacenamiento', 'Implementar conectores opcionales', 'low', [API_FABRIC_SCOPE_IDS.API202, API_FABRIC_SCOPE_IDS.API204]),
    makeAPIReq(API_FABRIC_SCOPE_IDS.API214, 'Orquestador de Integraciones', 'Coordinación de operaciones', 'Implementar Integration Orchestrator', 'critical', [API_FABRIC_SCOPE_IDS.API201, API_FABRIC_SCOPE_IDS.API202, API_FABRIC_SCOPE_IDS.API205]),
    makeAPIReq(API_FABRIC_SCOPE_IDS.API215, 'Sistema de Fallback', 'Recuperación ante fallos', 'Implementar Fallback Manager', 'high', [API_FABRIC_SCOPE_IDS.API214]),
    makeAPIReq(API_FABRIC_SCOPE_IDS.API216, 'Monitor de Conectividad', 'Verificación de salud', 'Implementar API Health Monitor', 'medium', [API_FABRIC_SCOPE_IDS.API202]),
    makeAPIReq(API_FABRIC_SCOPE_IDS.API217, 'Centro de Control', 'Interfaz de gestión', 'Implementar API Control Center', 'high', [API_FABRIC_SCOPE_IDS.API214]),
    makeAPIReq(API_FABRIC_SCOPE_IDS.API218, 'Pruebas y Seguridad', 'Validación continua', 'Implementar pruebas y auditoría', 'critical', [API_FABRIC_SCOPE_IDS.API214]),
  ];
}

/**
 * Requisitos de JOULE (Fase 1).
 */
function getJouleScopeRequirements(): ScopeRequirement[] {
  const now = new Date().toISOString();

  function makeJouleReq(
    id: string,
    name: string,
    description: string,
    objective: string,
    priority: 'critical' | 'high' | 'medium' | 'low',
    dependencies: string[]
  ): ScopeRequirement {
    return {
      id,
      code: 'M01', // Se asignará el código correcto según el ID
      phase: '1',
      module: 'JOULE',
      name,
      functionalDescription: description,
      technicalObjective: objective,
      priority,
      dependencies,
      executor: 'human',
      implementationStatus: 'implemented',
      testStatus: 'not_tested',
      verificationStatus: 'not_verified',
      acceptanceCriteria: [],
      evidenceIds: [],
      relatedProjectIds: [],
      relatedTaskIds: [],
      relatedArtifactIds: [],
      actionType: 'local_ui',
      actionReference: 'src/services/joule/',
      blockers: [],
      observations: '',
      versionRef: 'phase-1-joule',
      createdAt: now,
      updatedAt: now,
      archived: false,
    };
  }

  return [
    makeJouleReq(JOULE_SCOPE_IDS.J01, 'JOULE OBSERVE', 'Medición de operaciones reales', 'Implementar componente de observación', 'critical', []),
    makeJouleReq(JOULE_SCOPE_IDS.J02, 'JOULE PROFILE', 'Clasificación de tareas', 'Implementar clasificador de operaciones', 'critical', [JOULE_SCOPE_IDS.J01]),
    makeJouleReq(JOULE_SCOPE_IDS.J03, 'JOULE PREDICT', 'Estimación de recursos', 'Implementar estimador basado en historial', 'high', [JOULE_SCOPE_IDS.J02]),
    makeJouleReq(JOULE_SCOPE_IDS.J04, 'JOULE OPTIMIZE', 'Selección de rutas', 'Implementar algoritmo de optimización', 'critical', [JOULE_SCOPE_IDS.J03]),
    makeJouleReq(JOULE_SCOPE_IDS.J05, 'JOULE EXECUTE', 'Ejecución controlada', 'Implementar ejecutor con límites', 'high', [JOULE_SCOPE_IDS.J04]),
    makeJouleReq(JOULE_SCOPE_IDS.J06, 'JOULE VERIFY', 'Verificación independiente', 'Implementar verificador de resultados', 'critical', [JOULE_SCOPE_IDS.J05]),
    makeJouleReq(JOULE_SCOPE_IDS.J07, 'JOULE LEARN', 'Aprendizaje adaptativo', 'Implementar actualización de experiencia', 'high', [JOULE_SCOPE_IDS.J06]),
    makeJouleReq(JOULE_SCOPE_IDS.J08, 'JOULE ENGINE', 'Motor central', 'Coordinar todos los componentes', 'critical', [JOULE_SCOPE_IDS.J07]),
    makeJouleReq(JOULE_SCOPE_IDS.J09, 'JOULE POLICIES', 'Políticas de recursos', 'Implementar catálogo de políticas', 'high', [JOULE_SCOPE_IDS.J08]),
    makeJouleReq(JOULE_SCOPE_IDS.J10, 'JOULE DASHBOARD', 'Centro de mando', 'Implementar interfaz de control', 'high', [JOULE_SCOPE_IDS.J08]),
    makeJouleReq(JOULE_SCOPE_IDS.J11, 'JOULE SHADOW', 'Modo Shadow', 'Implementar observación sin modificación', 'high', [JOULE_SCOPE_IDS.J08]),
    makeJouleReq(JOULE_SCOPE_IDS.J12, 'JOULE CANARY', 'Modo Canary', 'Implementar activación gradual', 'medium', [JOULE_SCOPE_IDS.J11]),
    makeJouleReq(JOULE_SCOPE_IDS.J13, 'JOULE KILLSWITCH', 'Interruptor de reversión', 'Implementar mecanismo de desactivación', 'critical', [JOULE_SCOPE_IDS.J08]),
    makeJouleReq(JOULE_SCOPE_IDS.J14, 'JOULE INTEGRATION', 'Integración con almacenamiento', 'Integrar JOULE con persistencia', 'high', [JOULE_SCOPE_IDS.J08]),
  ];
}
