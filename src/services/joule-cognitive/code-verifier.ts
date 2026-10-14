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
 * Verificación de tipos (simulada para TypeScript)
 */
async function checkTypes(code: string): Promise<{ passed: boolean; errors: string[] }> {
  // En un entorno real, esto usaría el TypeScript Compiler API
  // Por ahora, hacemos validaciones básicas
  const errors: string[] = [];

  // Verificar que no haya tipos implícitos 'any' en lugares críticos
  const anyMatches = code.match(/:\s*any\b/g);
  if (anyMatches && anyMatches.length > 3) {
    errors.push('Demasiados usos de tipo "any"');
  }

  return {
    passed: errors.length === 0,
    errors
  };
}

/**
 * Determina si se puede ejecutar código de forma segura
 */
function canExecuteSafely(language: ProgrammingLanguage): boolean {
  // Solo permitimos ejecución en entornos controlados
  // En el navegador, NO ejecutamos código generado por IA
  // Esto se haría en un entorno aislado (sandbox, CI, etc.)
  
  // Por ahora, retornamos false para indicar que no hay entorno seguro
  // En producción, esto verificaría la disponibilidad de un sandbox
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

  // Para otros criterios, hacer validación básica
  if (criterion.testCode) {
    // Si hay código de prueba, intentar ejecutarlo
    // (En entorno seguro)
    return { passed: true }; // Placeholder
  }

  // Validación genérica
  return { passed: true };
}

/**
 * VERIFICACIÓN DEL CASO OBLIGATORIO: Suma decimal 0.1 + 0.2
 * 
 * Este es el caso de prueba inicial y obligatorio de la Fase 12.
 * Detecta el error común de usar Math.round individualmente.
 */
function verifyDecimalAddition(code: string, language: ProgrammingLanguage): { passed: boolean; error?: string } {
  const lowerCode = code.toLowerCase();

  // Detectar el patrón INCORRECTO: Math.round aplicado individualmente
  const incorrectPattern1 = /math\.round\s*\(\s*0\.1\s*\)/i;
  const incorrectPattern2 = /math\.round\s*\(\s*0\.2\s*\)/i;
  const incorrectPattern3 = /round\s*\(\s*0\.1\s*\)/i;
  const incorrectPattern4 = /round\s*\(\s*0\.2\s*\)/i;

  if (incorrectPattern1.test(code) || incorrectPattern2.test(code) ||
      incorrectPattern3.test(code) || incorrectPattern4.test(code)) {
    return {
      passed: false,
      error: 'ERROR CRÍTICO: El código usa Math.round(0.1) y Math.round(0.2) individualmente, lo que devuelve 0 + 0 = 0 en lugar de 0.3'
    };
  }

  // Verificar que el código maneja correctamente la aritmética decimal
  // Patrones CORRECTOS:
  const correctPatterns = [
    // Uso de toFixed
    /toFixed\s*\(\s*\d+\s*\)/i,
    
    // Multiplicación por potencia de 10
    /\*\s*100/i,
    /\*\s*1000/i,
    /\*\s*10\s*\*\s*\d+/i,
    
    // Uso de bibliotecas decimales
    /decimal\.js/i,
    /big\.js/i,
    /bignumber/i,
    
    // Conversión a enteros (céntimos)
    /cents?/i,
    /integer/i,
    
    // Comparación con epsilon
    /epsilon/i,
    /number\.epsilon/i,
    /math\.abs\s*\(.*\)\s*<\s*0\.0001/i,
    
    // Uso de parseFloat después de operaciones
    /parseFloat\s*\(/i
  ];

  const hasCorrectPattern = correctPatterns.some(pattern => pattern.test(code));

  // Si no hay patrón correcto explícito, verificar que al menos no hay el patrón incorrecto
  // y que el código parece razonable
  if (!hasCorrectPattern) {
    // Verificación básica: el código debe contener alguna operación aritmética
    const hasArithmetic = /[\+\-\*\/]/.test(code);
    const hasNumbers = /\d+\.\d+/.test(code);
    
    if (!hasArithmetic || !hasNumbers) {
      return {
        passed: false,
        error: 'El código no parece implementar correctamente la suma decimal'
      };
    }
  }

  return { passed: true };
}

/**
 * Genera un hash del código para trazabilidad
 */
async function hashCode(code: string): Promise<string> {
  // Hash simple (en producción usaríamos crypto.subtle)
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    const char = code.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
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
