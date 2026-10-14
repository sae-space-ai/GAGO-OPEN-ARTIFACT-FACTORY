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
 * Instala los requisitos iniciales de forma idempotente.
 * No duplica registros si ya existen.
 */
export function installInitialScope(existing: ScopeRequirement[]): ScopeRequirement[] {
  const existingIds = new Set(existing.map(r => r.id));
  const initial = getInitialScopeRequirements();
  const toAdd = initial.filter(r => !existingIds.has(r.id));
  return [...existing, ...toAdd];
}
