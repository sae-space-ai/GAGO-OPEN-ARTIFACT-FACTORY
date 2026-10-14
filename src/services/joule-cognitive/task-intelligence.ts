// GAGO OPEN ARTIFACT FACTORY — JOULE TASK INTELLIGENCE
// Fase 12 — Clasificador inteligente de solicitudes

import type {
  ClassifiedTask,
  JouleTaskType,
  ProgrammingLanguage,
  AcceptanceCriterion
} from '../../types/joule-cognitive';
import { generateId } from '../storage';

/**
 * Clasifica una solicitud de tarea analizando su contenido
 */
export function classifyTask(request: string): ClassifiedTask {
  const taskType = detectTaskType(request);
  const language = detectLanguage(request);
  const complexity = estimateComplexity(request);
  const riskLevel = assessRiskLevel(request, taskType);
  const dataSensitivity = assessDataSensitivity(request);
  const acceptanceCriteria = extractAcceptanceCriteria(request, taskType);
  const requiredCapabilities = determineRequiredCapabilities(taskType, language);
  const estimatedDuration = estimateDuration(complexity, taskType);
  const budget = estimateBudget(complexity, taskType);
  const requiresIsolation = determineIsolationRequirement(riskLevel, dataSensitivity);

  return {
    id: generateId(),
    originalRequest: request,
    taskType,
    language,
    complexity,
    riskLevel,
    dataSensitivity,
    acceptanceCriteria,
    requiredCapabilities,
    estimatedDuration,
    budget,
    requiresIsolation,
    classifiedAt: new Date().toISOString()
  };
}

/**
 * Detecta el tipo de tarea basado en palabras clave y patrones
 */
function detectTaskType(request: string): JouleTaskType {
  const lowerRequest = request.toLowerCase();

  // Patrones para cada tipo de tarea
  const patterns: Record<JouleTaskType, RegExp[]> = {
    code_generation: [
      /\b(crea|genera|implementa|desarrolla|escribe)\b.*\b(código|función|clase|módulo|componente)\b/i,
      /\b(create|generate|implement|develop|write)\b.*\b(code|function|class|module|component)\b/i,
      /\bfunction\b.*\bshould\b/i,
      /\bimplement\b.*\bthat\b/i
    ],
    code_analysis: [
      /\b(analiza|revisa|examina|inspecciona)\b.*\b(código)\b/i,
      /\b(analyze|review|examine|inspect)\b.*\b(code)\b/i,
      /\bwhat does\b.*\bdo\b/i,
      /\bexplain\b.*\bcode\b/i
    ],
    documentation: [
      /\b(documenta|documenta|comenta|explica)\b/i,
      /\b(document|comment|explain)\b/i,
      /\b(write|create)\b.*\b(documentation|docs|readme)\b/i,
      /\bgenerate\b.*\b(jsdoc|tsdoc|comments)\b/i
    ],
    calculation: [
      /\b(calcula|computa|resuelve)\b.*\b(número|valor|resultado|suma|resta|multiplicación|división)\b/i,
      /\b(calculate|compute|solve)\b.*\b(number|value|result|sum|subtract|multiply|divide)\b/i,
      /\bwhat is\b.*\d+.*[\+\-\*\/].*\d+/i,
      /\bmath\b.*\bproblem\b/i
    ],
    validation: [
      /\b(valida|verifica|comprueba|chequear)\b/i,
      /\b(validate|verify|check)\b/i,
      /\bensure\b.*\b(is|are)\b.*\b(valid|correct|proper)\b/i,
      /\bmake sure\b/i
    ],
    refactoring: [
      /\b(refactoriza|mejora|optimiza|reestructura)\b.*\b(código)\b/i,
      /\b(refactor|improve|optimize|restructure)\b.*\b(code)\b/i,
      /\bclean up\b.*\bcode\b/i,
      /\bmake\b.*\b(more|better)\b.*\b(efficient|readable|maintainable)\b/i
    ],
    debugging: [
      /\b(depurar|debug|encontrar|detectar)\b.*\b(error|bug|problema|fallo)\b/i,
      /\b(debug|find|detect)\b.*\b(error|bug|problem|issue)\b/i,
      /\bfix\b.*\b(bug|error|issue|problem)\b/i,
      /\bwhy.*\b(failing|not working|broken)\b/i
    ],
    testing: [
      /\b(genera|crea|escribe)\b.*\b(pruebas|tests|test cases)\b/i,
      /\b(generate|create|write)\b.*\b(tests|test cases|unit tests)\b/i,
      /\btest\b.*\b(coverage|scenarios|cases)\b/i,
      /\bwrite\b.*\btests\b.*\bfor\b/i
    ],
    translation: [
      /\b(traduce|convierte|transforma)\b.*\b(de|a|from|to)\b/i,
      /\b(translate|convert|transform)\b.*\b(from|to)\b/i,
      /\b(port|adapt)\b.*\b(to|from)\b.*\b(language|framework)\b/i
    ],
    other: []
  };

  // Buscar coincidencias
  for (const [type, typePatterns] of Object.entries(patterns)) {
    for (const pattern of typePatterns) {
      if (pattern.test(request)) {
        return type as JouleTaskType;
      }
    }
  }

  // Si no hay coincidencia clara, asumir generación de código
  return 'code_generation';
}

/**
 * Detecta el lenguaje de programación
 */
function detectLanguage(request: string): ProgrammingLanguage {
  const lowerRequest = request.toLowerCase();

  const languagePatterns: Record<ProgrammingLanguage, RegExp[]> = {
    typescript: [/\btypescript\b/i, /\bts\b/i, /\.tsx?\b/i, /\binterface\b.*\btype\b/i],
    javascript: [/\bjavascript\b/i, /\bjs\b/i, /\.jsx?\b/i, /\bconst\b.*\bfunction\b/i],
    python: [/\bpython\b/i, /\bpy\b/i, /\.py\b/i, /\bdef\b.*\breturn\b/i],
    java: [/\bjava\b/i, /\.java\b/i, /\bpublic class\b/i, /\bSystem\.out\b/i],
    cpp: [/\bc\+\+\b/i, /\bcpp\b/i, /\.cpp\b/i, /#include\s*<iostream>/i],
    csharp: [/\bc#\b/i, /\bcsharp\b/i, /\.cs\b/i, /\bnamespace\b.*\bclass\b/i],
    go: [/\bgolang\b/i, /\bgo\b.*\blanguage\b/i, /\.go\b/i, /\bfunc\b.*\bmain\b/i],
    rust: [/\brust\b/i, /\.rs\b/i, /\bfn\b.*\bmain\b/i, /\blet mut\b/i],
    php: [/\bphp\b/i, /\.php\b/i, /<\?php/i, /\$[a-zA-Z_]/],
    ruby: [/\bruby\b/i, /\.rb\b/i, /\bdef\b.*\bend\b/i, /\bputs\b/i],
    swift: [/\bswift\b/i, /\.swift\b/i, /\bfunc\b.*\b->\b/i, /\bvar\b.*\blet\b/i],
    kotlin: [/\bkotlin\b/i, /\.kt\b/i, /\bfun\b.*\b->\b/i, /\bval\b.*\bvar\b/i],
    unknown: []
  };

  for (const [lang, patterns] of Object.entries(languagePatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(request)) {
        return lang as ProgrammingLanguage;
      }
    }
  }

  return 'unknown';
}

/**
 * Estima la complejidad de la tarea
 */
function estimateComplexity(request: string): 'simple' | 'moderate' | 'complex' {
  const length = request.length;
  const hasMultipleRequirements = (request.match(/\band\b/gi) || []).length > 2;
  const hasConditions = /\bif\b.*\bthen\b/i.test(request) || /\bwhen\b.*\bshould\b/i.test(request);
  const hasErrorHandling = /\b(error|exception|handle|catch|try)\b/i.test(request);
  const hasValidation = /\b(valid|verify|check|ensure)\b/i.test(request);

  let score = 0;

  if (length > 500) score += 2;
  else if (length > 200) score += 1;

  if (hasMultipleRequirements) score += 2;
  if (hasConditions) score += 1;
  if (hasErrorHandling) score += 1;
  if (hasValidation) score += 1;

  if (score >= 4) return 'complex';
  if (score >= 2) return 'moderate';
  return 'simple';
}

/**
 * Evalúa el nivel de riesgo de la tarea
 */
function assessRiskLevel(request: string, taskType: JouleTaskType): 'low' | 'medium' | 'high' {
  const lowerRequest = request.toLowerCase();

  // Tareas de alto riesgo
  const highRiskPatterns = [
    /\b(database|db|sql|query)\b/i,
    /\b(api|endpoint|route)\b/i,
    /\b(authentication|authorization|security)\b/i,
    /\b(password|credential|secret|token)\b/i,
    /\b(payment|transaction|money|financial)\b/i,
    /\b(delete|remove|destroy)\b.*\b(data|record|file)\b/i,
    /\b(migration|schema)\b/i
  ];

  // Tareas de riesgo medio
  const mediumRiskPatterns = [
    /\b(file|io|stream)\b/i,
    /\b(network|http|request|response)\b/i,
    /\b(cache|session|state)\b/i,
    /\b(config|configuration|settings)\b/i
  ];

  for (const pattern of highRiskPatterns) {
    if (pattern.test(request)) return 'high';
  }

  for (const pattern of mediumRiskPatterns) {
    if (pattern.test(request)) return 'medium';
  }

  // Tipo de tarea también influye
  if (taskType === 'code_generation' || taskType === 'refactoring') return 'medium';

  return 'low';
}

/**
 * Evalúa la sensibilidad de los datos
 */
function assessDataSensitivity(request: string): 'public' | 'internal' | 'confidential' | 'restricted' {
  const lowerRequest = request.toLowerCase();

  const restrictedPatterns = [
    /\b(password|credential|secret|token|api[_-]?key)\b/i,
    /\b(personal|private|sensitive)\b.*\b(data|information)\b/i,
    /\b(ssn|social security|credit card|bank)\b/i
  ];

  const confidentialPatterns = [
    /\b(user|customer|client)\b.*\b(data|information)\b/i,
    /\b(internal|company|business)\b.*\b(data|information)\b/i,
    /\b(authentication|authorization)\b/i
  ];

  const internalPatterns = [
    /\b(project|task|artifact)\b/i,
    /\b(configuration|settings)\b/i,
    /\b(log|debug|trace)\b/i
  ];

  for (const pattern of restrictedPatterns) {
    if (pattern.test(request)) return 'restricted';
  }

  for (const pattern of confidentialPatterns) {
    if (pattern.test(request)) return 'confidential';
  }

  for (const pattern of internalPatterns) {
    if (pattern.test(request)) return 'internal';
  }

  return 'public';
}

/**
 * Extrae criterios de aceptación de la solicitud
 */
function extractAcceptanceCriteria(request: string, taskType: JouleTaskType): AcceptanceCriterion[] {
  const criteria: AcceptanceCriterion[] = [];

  // Buscar patrones de criterios explícitos
  const criterionPatterns = [
    /(?:should|must|needs to|has to)\s+([^.!?]+[.!?]?)/gi,
    /(?:debe|tiene que|necesita)\s+([^.!?]+[.!?]?)/gi,
    /(?:requirement|criterion|constraint)[:\s]+([^.!?]+[.!?]?)/gi,
    /(?:requisito|criterio|restricción)[:\s]+([^.!?]+[.!?]?)/gi
  ];

  for (const pattern of criterionPatterns) {
    let match;
    while ((match = pattern.exec(request)) !== null) {
      const description = match[1].trim();
      if (description.length > 10) {
        criteria.push({
          id: generateId(),
          description,
          type: 'functional',
          testable: true
        });
      }
    }
  }

  // Si no se encontraron criterios explícitos, inferir algunos basados en el tipo de tarea
  if (criteria.length === 0) {
    const inferredCriteria = inferAcceptanceCriteria(taskType);
    criteria.push(...inferredCriteria);
  }

  return criteria;
}

/**
 * Infiera criterios de aceptación basados en el tipo de tarea
 */
function inferAcceptanceCriteria(taskType: JouleTaskType): AcceptanceCriterion[] {
  const criteria: AcceptanceCriterion[] = [];

  switch (taskType) {
    case 'code_generation':
      criteria.push({
        id: generateId(),
        description: 'El código debe ser sintácticamente válido',
        type: 'quality',
        testable: true
      });
      criteria.push({
        id: generateId(),
        description: 'El código debe cumplir con los requisitos funcionales especificados',
        type: 'functional',
        testable: true
      });
      break;

    case 'calculation':
      criteria.push({
        id: generateId(),
        description: 'El resultado debe ser matemáticamente correcto',
        type: 'functional',
        testable: true
      });
      criteria.push({
        id: generateId(),
        description: 'Debe manejar correctamente los casos edge',
        type: 'quality',
        testable: true
      });
      break;

    case 'validation':
      criteria.push({
        id: generateId(),
        description: 'Debe validar correctamente entradas válidas',
        type: 'functional',
        testable: true
      });
      criteria.push({
        id: generateId(),
        description: 'Debe rechazar correctamente entradas inválidas',
        type: 'functional',
        testable: true
      });
      break;

    default:
      criteria.push({
        id: generateId(),
        description: 'La salida debe cumplir con los requisitos especificados',
        type: 'functional',
        testable: true
      });
  }

  return criteria;
}

/**
 * Determina las capacidades requeridas del modelo
 */
function determineRequiredCapabilities(taskType: JouleTaskType, language: ProgrammingLanguage): string[] {
  const capabilities: string[] = [];

  // Capacidades basadas en tipo de tarea
  switch (taskType) {
    case 'code_generation':
    case 'refactoring':
      capabilities.push('code_generation', 'syntax_knowledge');
      break;
    case 'code_analysis':
    case 'debugging':
      capabilities.push('code_analysis', 'reasoning');
      break;
    case 'documentation':
      capabilities.push('documentation', 'explanation');
      break;
    case 'calculation':
      capabilities.push('mathematical_reasoning', 'precision');
      break;
    case 'validation':
      capabilities.push('validation', 'logic');
      break;
    case 'testing':
      capabilities.push('test_generation', 'code_analysis');
      break;
    case 'translation':
      capabilities.push('language_translation', 'syntax_knowledge');
      break;
  }

  // Capacidades basadas en lenguaje
  if (language !== 'unknown') {
    capabilities.push(`${language}_knowledge`);
  }

  return capabilities;
}

/**
 * Estima la duración esperada de la tarea
 */
function estimateDuration(complexity: 'simple' | 'moderate' | 'complex', taskType: JouleTaskType): number {
  const baseDurations: Record<string, number> = {
    simple: 2000,
    moderate: 5000,
    complex: 15000
  };

  const taskMultipliers: Record<JouleTaskType, number> = {
    code_generation: 1.0,
    code_analysis: 0.8,
    documentation: 0.6,
    calculation: 0.5,
    validation: 0.7,
    refactoring: 1.2,
    debugging: 1.5,
    testing: 1.3,
    translation: 0.9,
    other: 1.0
  };

  return Math.round(baseDurations[complexity] * taskMultipliers[taskType]);
}

/**
 * Estima el presupuesto necesario
 */
function estimateBudget(complexity: 'simple' | 'moderate' | 'complex', taskType: JouleTaskType): number {
  const baseBudgets: Record<string, number> = {
    simple: 10,
    moderate: 30,
    complex: 100
  };

  const taskMultipliers: Record<JouleTaskType, number> = {
    code_generation: 1.0,
    code_analysis: 0.8,
    documentation: 0.6,
    calculation: 0.5,
    validation: 0.7,
    refactoring: 1.2,
    debugging: 1.5,
    testing: 1.3,
    translation: 0.9,
    other: 1.0
  };

  return Math.round(baseBudgets[complexity] * taskMultipliers[taskType]);
}

/**
 * Determina si la tarea requiere aislamiento
 */
function determineIsolationRequirement(riskLevel: 'low' | 'medium' | 'high', dataSensitivity: string): boolean {
  return riskLevel === 'high' || dataSensitivity === 'restricted' || dataSensitivity === 'confidential';
}
