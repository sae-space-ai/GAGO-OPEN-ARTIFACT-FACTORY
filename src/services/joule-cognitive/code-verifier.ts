// GAGO OPEN ARTIFACT FACTORY — JOULE INDEPENDENT CODE VERIFIER
// Fase 12 — Verificación independiente de código generado

import type {
  VerificationResult,
  VerificationStatus,
  ProgrammingLanguage,
  AcceptanceCriterion
} from '../../types/joule-cognitive';
import { generateId } from '../storage';

/**
 * Verifica de forma independiente el código generado
 * Este es el componente prioritario de la Fase 12
 */
export async function verifyCodeIndependently(
  taskId: string,
  code: string,
  language: ProgrammingLanguage,
  acceptanceCriteria: AcceptanceCriterion[],
  testCode?: string
): Promise<VerificationResult> {
  const result: VerificationResult = {
    id: generateId(),
    taskId,
    codeHash: await hashCode(code),
    status: 'PENDING',
    language,
    syntaxValid: false,
    testsExecuted: 0,
    testsPassed: 0,
    testsFailed: 0,
    errors: [],
    warnings: [],
    verifiedAt: new Date().toISOString(),
    verifiedBy: 'static_analysis',
    evidenceId: generateId()
  };

  try {
    // Etapa 1: Validación sintáctica
    const syntaxResult = validateSyntax(code, language);
    result.syntaxValid = syntaxResult.valid;
    
    if (!syntaxResult.valid) {
      result.status = 'STATIC_VALIDATED';
      result.errors.push(...syntaxResult.errors);
      return result;
    }

    result.status = 'STATIC_VALIDATED';

    // Etapa 2: Verificación de tipos (si es TypeScript)
    if (language === 'typescript') {
      const typeCheckResult = await checkTypes(code);
      result.typeCheckPassed = typeCheckResult.passed;
      
      if (!typeCheckResult.passed) {
        result.errors.push(...typeCheckResult.errors);
        return result;
      }
    }

    // Etapa 3: Ejecución de pruebas (si hay entorno de ejecución)
    if (testCode && canExecuteSafely(language)) {
      const testResult = await executeTests(code, testCode, language);
      result.testsExecuted = testResult.total;
      result.testsPassed = testResult.passed;
      result.testsFailed = testResult.failed;
      result.executionTimeMs = testResult.durationMs;
      result.verifiedBy = 'unit_tests';

      if (testResult.failed > 0) {
        result.status = 'TESTS_FAILED';
        result.errors.push(...testResult.errors);
      } else if (testResult.passed > 0) {
        result.status = 'TESTS_PASSED';
      }
    } else if (!canExecuteSafely(language)) {
      result.status = 'BLOCKED';
      result.warnings.push('No hay entorno de ejecución seguro disponible');
    }

    // Etapa 4: Verificación de criterios de aceptación
    const criteriaResults = await verifyAcceptanceCriteria(code, acceptanceCriteria, language);
    
    if (criteriaResults.failed > 0) {
      result.status = 'TESTS_FAILED';
      result.testsFailed += criteriaResults.failed;
      result.errors.push(...criteriaResults.errors);
    } else if (criteriaResults.passed > 0) {
      result.testsPassed += criteriaResults.passed;
      result.testsExecuted += criteriaResults.total;
    }

  } catch (error) {
    result.status = 'BLOCKED';
    result.errors.push(`Error durante la verificación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }

  return result;
}

/**
 * Valida la sintaxis del código
 */
function validateSyntax(code: string, language: ProgrammingLanguage): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  switch (language) {
    case 'typescript':
    case 'javascript':
      // Validación básica de sintaxis JS/TS
      if (!validateJavaScriptSyntax(code)) {
        errors.push('Error de sintaxis JavaScript/TypeScript');
      }
      break;

    case 'python':
      if (!validatePythonSyntax(code)) {
        errors.push('Error de sintaxis Python');
      }
      break;

    default:
      // Para otros lenguajes, validación básica
      if (code.trim().length === 0) {
        errors.push('El código está vacío');
      }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validación básica de sintaxis JavaScript/TypeScript
 */
function validateJavaScriptSyntax(code: string): boolean {
  try {
    // Eliminar comentarios y strings para evitar falsos positivos
    const cleanCode = removeCommentsAndStrings(code);
    
    // Verificar balance de llaves, paréntesis y corchetes
    const braces = countBalanced(cleanCode, '{', '}');
    const parens = countBalanced(cleanCode, '(', ')');
    const brackets = countBalanced(cleanCode, '[', ']');

    return braces && parens && brackets;
  } catch {
    return false;
  }
}

/**
 * Validación básica de sintaxis Python
 */
function validatePythonSyntax(code: string): boolean {
  try {
    const cleanCode = removeCommentsAndStrings(code);
    
    // Verificar indentación consistente (básico)
    const lines = cleanCode.split('\n').filter(l => l.trim().length > 0);
    if (lines.length === 0) return true;

    // Verificar balance de paréntesis, corchetes y llaves
    const parens = countBalanced(cleanCode, '(', ')');
    const brackets = countBalanced(cleanCode, '[', ']');
    const braces = countBalanced(cleanCode, '{', '}');

    return parens && brackets && braces;
  } catch {
    return false;
  }
}

/**
 * Elimina comentarios y strings para análisis sintáctico
 */
function removeCommentsAndStrings(code: string): string {
  // Eliminar strings
  let result = code.replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, '""');
  
  // Eliminar comentarios de una línea
  result = result.replace(/\/\/.*$/gm, '');
  
  // Eliminar comentarios de bloque
  result = result.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Eliminar comentarios Python
  result = result.replace(/#.*$/gm, '');
  
  return result;
}

/**
 * Verifica el balance de caracteres
 */
function countBalanced(code: string, open: string, close: string): boolean {
  let count = 0;
  for (const char of code) {
    if (char === open) count++;
    else if (char === close) count--;
    if (count < 0) return false;
  }
  return count === 0;
}

/**
 * Verificación de tipos mejorada
 * 
 * NOTA: TypeScript Compiler no está disponible en el bundle del navegador.
 * Se usa verificación estática mejorada como método principal.
 * Para verificación completa con TypeScript Compiler, se requiere entorno Node.js.
 */
async function checkTypes(code: string): Promise<{ passed: boolean; errors: string[] }> {
  const errors: string[] = [];

  // Verificación estática mejorada (método principal)
  const basicChecks = performBasicTypeChecks(code);
  errors.push(...basicChecks);

  // Verificación avanzada de patrones comunes
  const advancedChecks = performAdvancedTypeChecks(code);
  errors.push(...advancedChecks);

  // Nota: TypeScript Compiler no está disponible en el navegador
  // Para verificación completa con compilador real, se requiere:
  // - Entorno Node.js con TypeScript instalado
  // - O servicio backend que ejecute la verificación
  // - O integración con CI/CD que ejecute tsc

  return {
    passed: errors.length === 0,
    errors
  };
}

/**
 * Verificación básica de tipos mejorada
 */
function performBasicTypeChecks(code: string): string[] {
  const errors: string[] = [];

  // Verificar uso excesivo de 'any'
  const anyMatches = code.match(/:\s*any\b/g);
  if (anyMatches && anyMatches.length > 3) {
    errors.push('Demasiados usos de tipo "any" - considere usar tipos específicos');
  }

  // Verificar funciones sin tipo de retorno explícito
  const functionWithoutReturn = code.match(/function\s+\w+\s*\([^)]*\)\s*{/g);
  if (functionWithoutReturn && functionWithoutReturn.length > 2) {
    errors.push('Funciones sin tipo de retorno explícito detectadas');
  }

  // Verificar variables sin tipo explícito (cuando sea posible)
  const letWithoutType = code.match(/let\s+\w+\s*=/g);
  if (letWithoutType && letWithoutType.length > 5) {
    errors.push('Múltiples variables "let" sin tipo explícito');
  }

  return errors;
}

/**
 * Verificación avanzada de patrones comunes
 */
function performAdvancedTypeChecks(code: string): string[] {
  const errors: string[] = [];

  // Verificar uso de @ts-ignore o @ts-nocheck
  if (code.includes('@ts-ignore') || code.includes('@ts-nocheck')) {
    errors.push('Directivas @ts-ignore o @ts-nocheck detectadas - evite suprimir errores de tipos');
  }

  // Verificar aserciones de tipo peligrosas
  const asAnyMatches = code.match(/\bas\s+any\b/g);
  if (asAnyMatches && asAnyMatches.length > 0) {
    errors.push('Aserciones "as any" detectadas - considere usar tipos más específicos');
  }

  // Verificar non-null assertions excesivas
  const nonNullMatches = code.match(/!\./g);
  if (nonNullMatches && nonNullMatches.length > 5) {
    errors.push('Múltiples aserciones de no-nulo (!) detectadas - considere verificaciones adecuadas');
  }

  // Verificar uso de eval o Function constructor (peligroso)
  if (code.match(/\beval\s*\(/) || code.match(/new\s+Function\s*\(/)) {
    errors.push('Uso de eval o Function constructor detectado - riesgo de seguridad');
  }

  return errors;
}

/**
 * Determina si se puede ejecutar código de forma segura
 * 
 * IMPORTANTE: En el navegador NO ejecutamos código generado por IA.
 * La ejecución real requiere un entorno aislado (sandbox, CI, contenedor).
 * Esta función verifica la disponibilidad de dicho entorno.
 */
function canExecuteSafely(language: ProgrammingLanguage): boolean {
  // Verificar si estamos en un entorno que permite ejecución aislada
  // En navegador: NO (seguridad)
  // En Node.js con sandbox: SÍ (si está configurado)
  // En CI/CD: SÍ (entorno aislado por diseño)
  
  // Por defecto, en navegador retornamos false
  if (typeof window !== 'undefined') {
    return false;
  }
  
  // En Node.js, verificar si hay sandbox disponible
  // Esto requeriría configuración explícita del entorno
  // Por ahora, retornamos false para ser conservadores
  return false;
}

/**
 * Ejecuta pruebas en entorno aislado
 */
async function executeTests(
  code: string,
  testCode: string,
  language: ProgrammingLanguage
): Promise<{
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  errors: string[];
}> {
  // En un entorno real, esto enviaría el código a un sandbox aislado
  // Por ahora, retornamos un resultado de "no ejecutado"
  
  return {
    total: 0,
    passed: 0,
    failed: 0,
    durationMs: 0,
    errors: ['Entorno de ejecución no disponible en el navegador']
  };
}

/**
 * Verifica los criterios de aceptación
 */
async function verifyAcceptanceCriteria(
  code: string,
  criteria: AcceptanceCriterion[],
  language: ProgrammingLanguage
): Promise<{
  total: number;
  passed: number;
  failed: number;
  errors: string[];
}> {
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const criterion of criteria) {
    if (!criterion.testable) {
      continue;
    }

    // Verificar criterio específico
    const result = await verifySingleCriterion(code, criterion, language);
    
    if (result.passed) {
      passed++;
    } else {
      failed++;
      errors.push(`Criterio no cumplido: ${criterion.description}`);
      if (result.error) {
        errors.push(`  Detalle: ${result.error}`);
      }
    }
  }

  return {
    total: criteria.length,
    passed,
    failed,
    errors
  };
}

/**
 * Verifica un criterio individual
 */
async function verifySingleCriterion(
  code: string,
  criterion: AcceptanceCriterion,
  language: ProgrammingLanguage
): Promise<{ passed: boolean; error?: string }> {
  // CASO DE PRUEBA OBLIGATORIO: Suma decimal 0.1 + 0.2
  if (criterion.description.toLowerCase().includes('suma') || 
      criterion.description.toLowerCase().includes('sum') ||
      criterion.description.toLowerCase().includes('0.1') ||
      criterion.description.toLowerCase().includes('0.2')) {
    
    return verifyDecimalAddition(code, language);
  }

  // Para otros criterios, verificar si hay código de prueba
  if (criterion.testCode) {
    // Sin entorno de ejecución aislado, no podemos ejecutar pruebas
    return { 
      passed: false, 
      error: 'No se puede ejecutar la prueba sin entorno de ejecución aislado' 
    };
  }

  // Si no hay forma de verificar, marcar como no verificable
  return { 
    passed: false, 
    error: 'Criterio no verificable automáticamente - requiere revisión manual' 
  };
}

/**
 * VERIFICACIÓN DEL CASO OBLIGATORIO: Suma decimal 0.1 + 0.2
 * 
 * Este es el caso de prueba inicial y obligatorio de la Fase 12.
 * Detecta el error común de usar Math.round individualmente.
 * Incluye detección de variables, no solo constantes.
 */
function verifyDecimalAddition(code: string, language: ProgrammingLanguage): { passed: boolean; error?: string } {
  const errors: string[] = [];

  // Detectar el patrón INCORRECTO: Math.round aplicado individualmente a operandos
  // Patrones incorrectos con constantes
  const incorrectConstantPatterns = [
    /math\.round\s*\(\s*0\.1\s*\)/i,
    /math\.round\s*\(\s*0\.2\s*\)/i,
    /round\s*\(\s*0\.1\s*\)/i,
    /round\s*\(\s*0\.2\s*\)/i
  ];

  // Patrones incorrectos con variables (más general)
  // Detecta: Math.round(a) + Math.round(b) donde a y b son variables
  const incorrectVariablePattern = /math\.round\s*\(\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\)\s*\+\s*math\.round\s*\(\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\)/i;

  // Verificar patrones incorrectos con constantes
  for (const pattern of incorrectConstantPatterns) {
    if (pattern.test(code)) {
      errors.push('ERROR CRÍTICO: El código usa Math.round() individualmente en operandos decimales, lo que trunca los valores');
      break;
    }
  }

  // Verificar patrón incorrecto con variables
  if (incorrectVariablePattern.test(code)) {
    errors.push('ERROR CRÍTICO: El código aplica Math.round() a variables individuales antes de sumar, lo que trunca los valores decimales');
  }

  // Si hay errores críticos, retornar inmediatamente
  if (errors.length > 0) {
    return {
      passed: false,
      error: errors.join('; ')
    };
  }

  // Verificar que el código maneja correctamente la aritmética decimal
  // Patrones CORRECTOS que indican manejo adecuado de decimales:
  const correctPatterns = [
    // Uso de toFixed para redondeo controlado
    /toFixed\s*\(\s*\d+\s*\)/i,
    
    // Multiplicación por potencia de 10 antes de operar
    /\*\s*100/i,
    /\*\s*1000/i,
    /\*\s*10\s*\*\s*\d+/i,
    
    // Uso de bibliotecas decimales especializadas
    /decimal\.js/i,
    /big\.js/i,
    /bignumber/i,
    /decimal\s*\(/i,
    
    // Conversión a enteros (céntimos)
    /cents?/i,
    /integer/i,
    /Math\.round\s*\([^)]*\*\s*100/i, // Math.round aplicado DESPUÉS de multiplicar
    
    // Comparación con epsilon para tolerancia
    /epsilon/i,
    /Number\.EPSILON/i,
    /math\.abs\s*\(.*\)\s*<\s*0\.0001/i,
    /math\.abs\s*\(.*\)\s*<\s*1e-/i,
    
    // Uso de parseFloat después de operaciones
    /parseFloat\s*\(/i,
    
    // Uso de Number() para conversión explícita
    /Number\s*\(\s*\(/i
  ];

  const hasCorrectPattern = correctPatterns.some(pattern => pattern.test(code));

  // Si no hay patrón correcto explícito, verificar que el código es razonable
  if (!hasCorrectPattern) {
    // Verificación básica: el código debe contener alguna operación aritmética
    const hasArithmetic = /[\+\-\*\/]/.test(code);
    const hasNumbers = /\d+\.\d+/.test(code);
    const hasVariables = /[a-zA-Z_][a-zA-Z0-9_]*/.test(code);
    
    // Si no hay operaciones aritméticas ni números decimales, es sospechoso
    if (!hasArithmetic && !hasNumbers) {
      return {
        passed: false,
        error: 'El código no contiene operaciones aritméticas ni números decimales'
      };
    }

    // Si hay números decimales pero no hay patrón correcto conocido,
    // marcar como "no verificable estáticamente" en lugar de aprobar
    if (hasNumbers && !hasCorrectPattern) {
      return {
        passed: false,
        error: 'El código contiene números decimales pero no se detecta un patrón de manejo correcto. Requiere ejecución real para verificación.'
      };
    }
  }

  // Si llegamos aquí, el código parece correcto o al menos no tiene errores obvios
  return { 
    passed: true,
    error: undefined
  };
}

/**
 * Genera un hash SHA-256 del código para trazabilidad criptográfica
 */
async function hashCode(code: string): Promise<string> {
  try {
    // Usar Web Crypto API para SHA-256
    const encoder = new TextEncoder();
    const data = encoder.encode(code);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    // Fallback si crypto.subtle no está disponible (entorno Node.js antiguo)
    console.warn('crypto.subtle no disponible, usando hash básico');
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      const char = code.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  }
}

/**
 * Benchmark específico para la suma decimal
 */
export const DECIMAL_ADDITION_BENCHMARK = {
  id: 'benchmark-decimal-addition-001',
  name: 'Suma Decimal 0.1 + 0.2',
  description: 'Verifica que el código suma correctamente 0.1 y 0.2 para obtener 0.3',
  category: 'calculation' as const,
  language: 'typescript' as const,
  input: '0.1 + 0.2',
  expectedOutput: '0.3',
  acceptanceCriteria: [
    {
      id: 'criterion-001',
      description: 'El resultado debe ser 0.3 (o muy cercano con tolerancia de 0.0001)',
      type: 'functional' as const,
      testable: true,
      expectedResult: 0.3,
      tolerance: 0.0001
    },
    {
      id: 'criterion-002',
      description: 'No debe usar Math.round individualmente en los operandos',
      type: 'quality' as const,
      testable: true
    }
  ],
  testCode: `
    // Prueba de la suma decimal
    const result = add(0.1, 0.2);
    const expected = 0.3;
    const tolerance = 0.0001;
    
    if (Math.abs(result - expected) > tolerance) {
      throw new Error(\`Expected \${expected}, got \${result}\`);
    }
  `,
  timeout: 5000,
  difficulty: 'easy' as const,
  version: '1.0.0',
  createdAt: new Date().toISOString()
};
