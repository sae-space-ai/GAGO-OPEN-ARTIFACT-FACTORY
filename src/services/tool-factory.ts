// GAGO Open Artifact Factory - Tool Factory
// Fase 5: Generador de herramientas digitales con plantillas verificadas

import type { ToolManifest, ToolSpecification, ToolCategory } from '../types/control-plane';
import { generateId } from './storage';

/**
 * PROBLEMA 5: Normalización segura de identificadores TypeScript
 * Convierte nombres con acentos, símbolos, números iniciales en identificadores válidos
 */
export function normalizeIdentifier(name: string): string {
  // Eliminar acentos y caracteres especiales
  let normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos
    .replace(/[^a-zA-Z0-9\s]/g, '') // Solo letras, números y espacios
    .trim();
  
  // Convertir a PascalCase
  normalized = normalized
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
  
  // Si empieza con número, añadir prefijo
  if (/^\d/.test(normalized)) {
    normalized = 'Tool' + normalized;
  }
  
  // Si está vacío, usar nombre por defecto
  if (normalized.length === 0) {
    normalized = 'GeneratedTool';
  }
  
  // Verificar que no sea palabra reservada
  const reservedWords = [
    'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
    'default', 'delete', 'do', 'else', 'export', 'extends', 'finally',
    'for', 'function', 'if', 'import', 'in', 'instanceof', 'let', 'new',
    'return', 'super', 'switch', 'this', 'throw', 'try', 'typeof', 'var',
    'void', 'while', 'with', 'yield', 'enum', 'implements', 'interface',
    'package', 'private', 'protected', 'public', 'static', 'abstract',
    'boolean', 'byte', 'char', 'double', 'final', 'float', 'goto', 'int',
    'long', 'native', 'short', 'synchronized', 'throws', 'transient'
  ];
  
  if (reservedWords.includes(normalized.toLowerCase())) {
    normalized = normalized + 'Component';
  }
  
  return normalized;
}

/**
 * Plantillas de herramientas disponibles
 */
const TOOL_TEMPLATES: Record<ToolCategory, {
  name: string;
  description: string;
  defaultInputs: any[];
  defaultOutputs: any[];
  template: string;
}> = {
  dashboard: {
    name: 'Panel de Control',
    description: 'Genera un panel de control con métricas y visualizaciones',
    defaultInputs: [
      { name: 'title', type: 'string', required: true, description: 'Título del panel' },
      { name: 'metrics', type: 'array', required: true, description: 'Lista de métricas a mostrar' }
    ],
    defaultOutputs: [
      { name: 'html', type: 'string', description: 'Código HTML del panel' },
      { name: 'css', type: 'string', description: 'Estilos CSS del panel' }
    ],
    template: 'dashboard-template'
  },
  form: {
    name: 'Formulario',
    description: 'Genera un formulario con validación',
    defaultInputs: [
      { name: 'title', type: 'string', required: true, description: 'Título del formulario' },
      { name: 'fields', type: 'array', required: true, description: 'Campos del formulario' }
    ],
    defaultOutputs: [
      { name: 'html', type: 'string', description: 'Código HTML del formulario' },
      { name: 'validation', type: 'string', description: 'Lógica de validación' }
    ],
    template: 'form-template'
  },
  crud: {
    name: 'Gestor CRUD',
    description: 'Genera un gestor completo de datos (crear, leer, actualizar, eliminar)',
    defaultInputs: [
      { name: 'entityName', type: 'string', required: true, description: 'Nombre de la entidad' },
      { name: 'fields', type: 'array', required: true, description: 'Campos de la entidad' }
    ],
    defaultOutputs: [
      { name: 'component', type: 'string', description: 'Componente React completo' },
      { name: 'types', type: 'string', description: 'Tipos TypeScript' }
    ],
    template: 'crud-template'
  },
  calculator: {
    name: 'Calculadora',
    description: 'Genera una calculadora con operaciones personalizadas',
    defaultInputs: [
      { name: 'name', type: 'string', required: true, description: 'Nombre de la calculadora' },
      { name: 'operations', type: 'array', required: true, description: 'Operaciones disponibles' }
    ],
    defaultOutputs: [
      { name: 'component', type: 'string', description: 'Componente React' }
    ],
    template: 'calculator-template'
  },
  table: {
    name: 'Tabla',
    description: 'Genera una tabla con filtros y ordenación',
    defaultInputs: [
      { name: 'title', type: 'string', required: true, description: 'Título de la tabla' },
      { name: 'columns', type: 'array', required: true, description: 'Columnas de la tabla' }
    ],
    defaultOutputs: [
      { name: 'component', type: 'string', description: 'Componente de tabla' }
    ],
    template: 'table-template'
  },
  report: {
    name: 'Informe',
    description: 'Genera un informe estructurado',
    defaultInputs: [
      { name: 'title', type: 'string', required: true, description: 'Título del informe' },
      { name: 'sections', type: 'array', required: true, description: 'Secciones del informe' }
    ],
    defaultOutputs: [
      { name: 'html', type: 'string', description: 'HTML del informe' }
    ],
    template: 'report-template'
  },
  api_client: {
    name: 'Cliente API',
    description: 'Genera un cliente para una API pública',
    defaultInputs: [
      { name: 'apiName', type: 'string', required: true, description: 'Nombre de la API' },
      { name: 'endpoints', type: 'array', required: true, description: 'Endpoints disponibles' }
    ],
    defaultOutputs: [
      { name: 'client', type: 'string', description: 'Código del cliente' }
    ],
    template: 'api-client-template'
  },
  validator: {
    name: 'Validador',
    description: 'Genera un validador de estructuras',
    defaultInputs: [
      { name: 'schema', type: 'object', required: true, description: 'Esquema a validar' }
    ],
    defaultOutputs: [
      { name: 'validator', type: 'string', description: 'Función validadora' }
    ],
    template: 'validator-template'
  },
  comparator: {
    name: 'Comparador',
    description: 'Genera un comparador de versiones o datos',
    defaultInputs: [
      { name: 'type', type: 'string', required: true, description: 'Tipo de comparación' }
    ],
    defaultOutputs: [
      { name: 'component', type: 'string', description: 'Componente comparador' }
    ],
    template: 'comparator-template'
  },
  evidence_manager: {
    name: 'Gestor de Evidencias',
    description: 'Genera un gestor de evidencias técnicas',
    defaultInputs: [
      { name: 'projectName', type: 'string', required: true, description: 'Nombre del proyecto' }
    ],
    defaultOutputs: [
      { name: 'component', type: 'string', description: 'Componente gestor' }
    ],
    template: 'evidence-manager-template'
  },
  qwen_order: {
    name: 'Órdenes Qwen',
    description: 'Genera órdenes estructuradas para Qwen Coder',
    defaultInputs: [
      { name: 'project', type: 'string', required: true, description: 'Proyecto objetivo' }
    ],
    defaultOutputs: [
      { name: 'order', type: 'string', description: 'Orden generada' }
    ],
    template: 'qwen-order-template'
  },
  workflow_builder: {
    name: 'Constructor de Workflows',
    description: 'Genera un constructor visual de workflows',
    defaultInputs: [
      { name: 'name', type: 'string', required: true, description: 'Nombre del workflow' }
    ],
    defaultOutputs: [
      { name: 'builder', type: 'string', description: 'Componente constructor' }
    ],
    template: 'workflow-builder-template'
  },
  model_spec: {
    name: 'Especificación de Modelo',
    description: 'Genera especificaciones para modelos de IA',
    defaultInputs: [
      { name: 'modelName', type: 'string', required: true, description: 'Nombre del modelo' }
    ],
    defaultOutputs: [
      { name: 'spec', type: 'string', description: 'Especificación generada' }
    ],
    template: 'model-spec-template'
  },
  budget_calculator: {
    name: 'Calculador de Presupuesto',
    description: 'Calcula presupuestos de recursos',
    defaultInputs: [
      { name: 'resources', type: 'array', required: true, description: 'Recursos a presupuestar' }
    ],
    defaultOutputs: [
      { name: 'budget', type: 'object', description: 'Presupuesto calculado' }
    ],
    template: 'budget-calculator-template'
  },
  log_analyzer: {
    name: 'Analizador de Registros',
    description: 'Analiza registros y genera informes',
    defaultInputs: [
      { name: 'logFormat', type: 'string', required: true, description: 'Formato de los registros' }
    ],
    defaultOutputs: [
      { name: 'analysis', type: 'object', description: 'Análisis generado' }
    ],
    template: 'log-analyzer-template'
  }
};

/**
 * Valida una especificación de herramienta
 */
export function validateToolSpecification(spec: ToolSpecification): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!spec.name || spec.name.trim().length === 0) {
    errors.push('El nombre es obligatorio');
  }

  if (!spec.category) {
    errors.push('La categoría es obligatoria');
  }

  if (!spec.description || spec.description.trim().length === 0) {
    errors.push('La descripción es obligatoria');
  }

  if (!spec.inputs || spec.inputs.length === 0) {
    errors.push('Debe definir al menos una entrada');
  }

  if (!spec.outputs || spec.outputs.length === 0) {
    errors.push('Debe definir al menos una salida');
  }

  // Validar permisos
  const validPermissions = ['read_data', 'write_data', 'execute_code', 'network_access', 'file_access'];
  for (const perm of spec.permissions) {
    if (!validPermissions.includes(perm)) {
      errors.push(`Permiso no válido: ${perm}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * PROBLEMA 7: Estados de herramienta diferenciados
 */
export type ToolStatus = 'GENERATED' | 'IMPLEMENTED' | 'TESTED' | 'VERIFIED';

/**
 * PROBLEMA 8: Estructura de persistencia versionada
 */
export interface ToolVersion {
  version: string;
  code: string;
  documentation: string;
  timestamp: string;
  status: ToolStatus;
}

export interface PersistentToolData {
  manifest: ToolManifest;
  versions: ToolVersion[];
  currentVersion: string;
}

/**
 * Crea una herramienta a partir de una especificación validada
 */
export function createToolFromSpecification(spec: ToolSpecification): {
  manifest: ToolManifest;
  generatedCode: string;
  documentation: string;
  persistentData: PersistentToolData;
} {
  // Validar especificación
  const validation = validateToolSpecification(spec);
  if (!validation.valid) {
    throw new Error(`Especificación inválida: ${validation.errors.join(', ')}`);
  }

  // Obtener plantilla
  const template = TOOL_TEMPLATES[spec.category];
  if (!template) {
    throw new Error(`Categoría no soportada: ${spec.category}`);
  }

  // Generar código basado en la plantilla
  const generatedCode = generateToolCode(spec, template);

  // Crear manifiesto
  const manifest: ToolManifest = {
    id: generateId(),
    name: spec.name,
    version: '1.0.0',
    description: spec.description,
    category: spec.category,
    inputs: spec.inputs,
    outputs: spec.outputs,
    permissions: spec.permissions,
    dependencies: [],
    capabilities: [spec.category],
    status: 'GENERATED', // PROBLEMA 7: Estado inicial GENERATED, no IMPLEMENTED
    acceptanceCriteria: spec.acceptanceCriteria,
    tests: [],
    evidenceIds: [],
    license: 'MIT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    versionHistory: [{
      version: '1.0.0',
      date: new Date().toISOString(),
      changes: ['Versión inicial generada']
    }]
  };

  // Generar documentación
  const documentation = generateDocumentation(manifest);

  // PROBLEMA 8: Crear datos persistentes versionados
  const persistentData: PersistentToolData = {
    manifest,
    versions: [{
      version: '1.0.0',
      code: generatedCode,
      documentation,
      timestamp: new Date().toISOString(),
      status: 'GENERATED'
    }],
    currentVersion: '1.0.0'
  };

  return {
    manifest,
    generatedCode,
    documentation,
    persistentData
  };
}

/**
 * PROBLEMA 2: Generadores específicos para las 15 categorías
 */
function generateToolCode(spec: ToolSpecification, template: any): string {
  const componentName = normalizeIdentifier(spec.name);
  
  switch (spec.category) {
    case 'dashboard':
      return generateDashboardCode(spec, componentName);
    case 'form':
      return generateFormCode(spec, componentName);
    case 'crud':
      return generateCrudCode(spec, componentName);
    case 'calculator':
      return generateCalculatorCode(spec, componentName);
    case 'table':
      return generateTableCode(spec, componentName);
    case 'report':
      return generateReportCode(spec, componentName);
    case 'api_client':
      return generateApiClientCode(spec, componentName);
    case 'validator':
      return generateValidatorCode(spec, componentName);
    case 'comparator':
      return generateComparatorCode(spec, componentName);
    case 'evidence_manager':
      return generateEvidenceManagerCode(spec, componentName);
    case 'qwen_order':
      return generateQwenOrderCode(spec, componentName);
    case 'workflow_builder':
      return generateWorkflowBuilderCode(spec, componentName);
    case 'model_spec':
      return generateModelSpecCode(spec, componentName);
    case 'budget_calculator':
      return generateBudgetCalculatorCode(spec, componentName);
    case 'log_analyzer':
      return generateLogAnalyzerCode(spec, componentName);
    default:
      return generateGenericCode(spec, template, componentName);
  }
}

/**
 * PROBLEMA 2: Generador específico para Dashboard
 */
function generateDashboardCode(spec: ToolSpecification, componentName: string): string {
  return `// ${spec.name} - Panel de Control
import React from 'react';

interface Metric {
  label: string;
  value: number | string;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
}

interface ${componentName}Props {
  title: string;
  metrics: Metric[];
  onRefresh?: () => void;
}

export default function ${componentName}({ title, metrics, onRefresh }: ${componentName}Props) {
  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Actualizar
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
          >
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{metric.label}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{metric.value}</p>
            {metric.trend && (
              <div className="flex items-center mt-2">
                <span className={\`text-sm \${
                  metric.trend === 'up' ? 'text-green-600' :
                  metric.trend === 'down' ? 'text-red-600' :
                  'text-slate-500'
                }\`}>
                  {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
`;
}

/**
 * PROBLEMA 3: Generador específico para Form con validación completa
 */
function generateFormCode(spec: ToolSpecification, componentName: string): string {
  return `// ${spec.name} - Formulario con Validación
import React, { useState } from 'react';

interface Field {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'password' | 'textarea' | 'select';
  required?: boolean;
  placeholder?: string;
  options?: string[];
  validation?: (value: any) => string | null;
}

interface ${componentName}Props {
  title: string;
  fields: Field[];
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
}

interface FormErrors {
  [key: string]: string;
}

export default function ${componentName}({ title, fields, onSubmit, onCancel }: ${componentName}Props) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (field: Field, value: any): string | null => {
    // Validación de campo requerido
    if (field.required && (!value || value.toString().trim() === '')) {
      return \`\${field.label} es obligatorio\`;
    }

    // Validación de email
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Email inválido';
      }
    }

    // Validación de número
    if (field.type === 'number' && value) {
      if (isNaN(Number(value))) {
        return 'Debe ser un número';
      }
    }

    // Validación personalizada
    if (field.validation) {
      return field.validation(value);
    }

    return null;
  };

  const handleChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Validar en tiempo real
    const field = fields.find(f => f.name === fieldName);
    if (field) {
      const error = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [fieldName]: error || ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validar todos los campos
    const newErrors: FormErrors = {};
    let hasErrors = false;

    for (const field of fields) {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
        hasErrors = true;
      }
    }

    setErrors(newErrors);

    if (!hasErrors) {
      try {
        await onSubmit(formData);
        setFormData({});
        setErrors({});
      } catch (error) {
        console.error('Error al enviar formulario:', error);
      }
    }

    setIsSubmitting(false);
  };

  const renderField = (field: Field) => {
    const error = errors[field.name];
    const baseClassName = \`w-full px-3 py-2 rounded-lg border \${
      error ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
    } bg-white dark:bg-slate-700 text-slate-900 dark:text-white\`;

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={formData[field.name] || ''}
            onChange={e => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={\`\${baseClassName} min-h-[100px]\`}
            required={field.required}
          />
        );
      case 'select':
        return (
          <select
            value={formData[field.name] || ''}
            onChange={e => handleChange(field.name, e.target.value)}
            className={baseClassName}
            required={field.required}
          >
            <option value="">Seleccionar...</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type={field.type}
            value={formData[field.name] || ''}
            onChange={e => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={baseClassName}
            required={field.required}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow space-y-4">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
      
      {fields.map(field => (
        <div key={field.name} className="space-y-1">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {renderField(field)}
          {errors[field.name] && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors[field.name]}</p>
          )}
        </div>
      ))}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
`;
}

/**
 * PROBLEMA 4: Generador específico para CRUD completo
 */
function generateCrudCode(spec: ToolSpecification, componentName: string): string {
  return `// ${spec.name} - Gestor CRUD Completo
import React, { useState, useEffect } from 'react';

interface ${componentName}Props {
  entityName: string;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'number' | 'email' | 'date';
    required?: boolean;
  }>;
  enablePersistence?: boolean;
  storageKey?: string;
}

interface Item {
  id: string;
  [key: string]: any;
}

export default function ${componentName}({ 
  entityName, 
  fields, 
  enablePersistence = false,
  storageKey = '${componentName.toLowerCase()}_data'
}: ${componentName}Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Cargar datos persistidos
  useEffect(() => {
    if (enablePersistence) {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          setItems(JSON.parse(stored));
        } catch (e) {
          console.error('Error al cargar datos:', e);
        }
      }
    }
  }, [enablePersistence, storageKey]);

  // Guardar datos
  useEffect(() => {
    if (enablePersistence) {
      localStorage.setItem(storageKey, JSON.stringify(items));
    }
  }, [items, enablePersistence, storageKey]);

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      const value = formData[field.name];
      
      if (field.required && (!value || value.toString().trim() === '')) {
        newErrors[field.name] = \`\${field.label} es obligatorio\`;
      }
      
      if (field.type === 'email' && value) {
        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors[field.name] = 'Email inválido';
        }
      }
      
      if (field.type === 'number' && value) {
        if (isNaN(Number(value))) {
          newErrors[field.name] = 'Debe ser un número';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = () => {
    if (!validateForm()) return;
    
    const newItem: Item = {
      id: generateId(),
      ...formData
    };
    
    setItems([...items, newItem]);
    resetForm();
  };

  const handleUpdate = () => {
    if (!editingItem || !validateForm()) return;
    
    setItems(items.map(item => 
      item.id === editingItem.id ? { ...item, ...formData } : item
    ));
    resetForm();
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    setDeleteConfirm(null);
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({});
    setEditingItem(null);
    setShowForm(false);
    setErrors({});
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Gestor de {entityName}
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Nuevo {entityName}
        </button>
      </div>

      {/* Formulario
      {showForm && (
        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
            {editingItem ? 'Editar' : 'Nuevo'} {entityName}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(field => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type={field.type}
                  value={formData[field.name] || ''}
                  onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                  className={\`w-full px-3 py-2 rounded-lg border \${
                    errors[field.name] ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                  } bg-white dark:bg-slate-800 text-slate-900 dark:text-white\`}
                />
                {errors[field.name] && (
                  <p className="text-sm text-red-600 mt-1">{errors[field.name]}</p>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={editingItem ? handleUpdate : handleCreate}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {editingItem ? 'Actualizar' : 'Crear'}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de items */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              {fields.map(field => (
                <th key={field.name} className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {field.label}
                </th>
              ))}
              <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={fields.length + 1} className="text-center py-8 text-slate-500 dark:text-slate-400">
                  No hay {entityName.toLowerCase()} registrados
                </td>
              </tr>
            ) : (
              items.map(item => (
                <tr key={item.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  {fields.map(field => (
                    <td key={field.name} className="py-3 px-4 text-sm text-slate-900 dark:text-white">
                      {item[field.name]}
                    </td>
                  ))}
                  <td className="py-3 px-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(item.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Diálogo de confirmación de eliminación */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Confirmar eliminación
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              ¿Estás seguro de que deseas eliminar este {entityName.toLowerCase()}? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;
}

/**
 * Generador específico para Calculator
 */
function generateCalculatorCode(spec: ToolSpecification, componentName: string): string {
  return `// ${spec.name} - Calculadora
import React, { useState } from 'react';

interface Operation {
  name: string;
  symbol: string;
  execute: (a: number, b: number) => number;
}

interface ${componentName}Props {
  name: string;
  operations: Operation[];
}

export default function ${componentName}({ name, operations }: ${componentName}Props) {
  const [display, setDisplay] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [selectedOp, setSelectedOp] = useState<Operation | null>(null);

  const handleNumber = (num: string) => {
    if (display === '0') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperation = (op: Operation) => {
    const current = parseFloat(display);
    
    if (firstOperand !== null && selectedOp) {
      const result = selectedOp.execute(firstOperand, current);
      setDisplay(result.toString());
      setFirstOperand(result);
    } else {
      setFirstOperand(current);
    }
    
    setSelectedOp(op);
    setDisplay('0');
  };

  const handleEquals = () => {
    if (firstOperand !== null && selectedOp) {
      const current = parseFloat(display);
      const result = selectedOp.execute(firstOperand, current);
      setDisplay(result.toString());
      setFirstOperand(null);
      setSelectedOp(null);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setFirstOperand(null);
    setSelectedOp(null);
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{name}</h1>
      
      <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 mb-4">
        <p className="text-3xl font-mono text-right text-slate-900 dark:text-white">
          {display}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {['7', '8', '9', '/'].map(btn => (
          <button
            key={btn}
            onClick={() => btn === '/' ? handleOperation(operations.find(op => op.symbol === '/') || operations[0]) : handleNumber(btn)}
            className="p-4 bg-slate-200 dark:bg-slate-600 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors text-slate-900 dark:text-white"
          >
            {btn}
          </button>
        ))}
        {['4', '5', '6', '*'].map(btn => (
          <button
            key={btn}
            onClick={() => btn === '*' ? handleOperation(operations.find(op => op.symbol === '*') || operations[0]) : handleNumber(btn)}
            className="p-4 bg-slate-200 dark:bg-slate-600 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors text-slate-900 dark:text-white"
          >
            {btn}
          </button>
        ))}
        {['1', '2', '3', '-'].map(btn => (
          <button
            key={btn}
            onClick={() => btn === '-' ? handleOperation(operations.find(op => op.symbol === '-') || operations[0]) : handleNumber(btn)}
            className="p-4 bg-slate-200 dark:bg-slate-600 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors text-slate-900 dark:text-white"
          >
            {btn}
          </button>
        ))}
        {['0', 'C', '=', '+'].map(btn => (
          <button
            key={btn}
            onClick={() => {
              if (btn === '0') handleNumber(btn);
              else if (btn === 'C') handleClear();
              else if (btn === '=') handleEquals();
              else handleOperation(operations.find(op => op.symbol === '+') || operations[0]);
            }}
            className={\`p-4 rounded-lg transition-colors \${
              btn === '=' ? 'bg-blue-600 text-white hover:bg-blue-700' :
              btn === 'C' ? 'bg-red-600 text-white hover:bg-red-700' :
              'bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-900 dark:text-white'
            }\`}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
}
`;
}

/**
 * Generador específico para Table
 */
function generateTableCode(spec: ToolSpecification, componentName: string): string {
  return `// ${spec.name} - Tabla con Filtros y Ordenación
import React, { useState, useMemo } from 'react';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
}

interface ${componentName}Props {
  title: string;
  columns: Column[];
  data: any[];
  itemsPerPage?: number;
}

export default function ${componentName}({ 
  title, 
  columns, 
  data, 
  itemsPerPage = 10 
}: ${componentName}Props) {
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Aplicar filtro
    if (filter) {
      result = result.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(filter.toLowerCase())
        )
      );
    }

    // Aplicar ordenación
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, filter, sortKey, sortDirection]);

  // Paginación
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{title}</h1>
      
      <input
        type="text"
        placeholder="Buscar..."
        value={filter}
        onChange={e => {
          setFilter(e.target.value);
          setCurrentPage(1);
        }}
        className="w-full mb-4 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
      />

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={\`text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300 \${
                    col.sortable !== false ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700' : ''
                  }\`}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-slate-500 dark:text-slate-400">
                  No hay datos disponibles
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  {columns.map(col => (
                    <td key={col.key} className="py-3 px-4 text-sm text-slate-900 dark:text-white">
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Página {currentPage} de {totalPages} ({filteredAndSortedData.length} registros)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
`;
}

/**
 * Generador específico para Report
 */
function generateReportCode(spec: ToolSpecification, componentName: string): string {
  return `// ${spec.name} - Informe Estructurado
import React from 'react';

interface Section {
  title: string;
  content: string;
  type?: 'text' | 'list' | 'table';
  data?: any[];
}

interface ${componentName}Props {
  title: string;
  sections: Section[];
  author?: string;
  date?: string;
}

export default function ${componentName}({ title, sections, author, date }: ${componentName}Props) {
  const renderSection = (section: Section, idx: number) => {
    return (
      <div key={idx} className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{section.title}</h2>
        {section.type === 'list' && section.data ? (
          <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
            {section.data.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        ) : section.type === 'table' && section.data ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-700">
                  {Object.keys(section.data[0] || {}).map(key => (
                    <th key={key} className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left text-sm font-semibold">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.data.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm">
                        {String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{section.content}</p>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow max-w-4xl mx-auto">
      <div className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{title}</h1>
        {(author || date) && (
          <div className="flex gap-4 text-sm text-slate-600 dark:text-slate-400">
            {author && <span>Autor: {author}</span>}
            {date && <span>Fecha: {date}</span>}
          </div>
        )}
      </div>
      {sections.map(renderSection)}
    </div>
  );
}
`;
}

/**
 * Generador específico para API Client
 */
function generateApiClientCode(spec: ToolSpecification, componentName: string): string {
  return `// ${spec.name} - Cliente API
interface ApiResponse<T> {
  data: T;
  status: number;
  error?: string;
}

interface Endpoint {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
}

export class ${componentName} {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(baseUrl: string, headers: Record<string, string> = {}) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
      ...headers
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(\`\${this.baseUrl}\${endpoint}\`, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          data: null as any,
          status: response.status,
          error: data.message || 'Error en la solicitud'
        };
      }

      return {
        data,
        status: response.status
      };
    } catch (error) {
      return {
        data: null as any,
        status: 0,
        error: error instanceof Error ? error.message : 'Error de red'
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Ejemplo de uso:
// const client = new ${componentName}('https://api.example.com');
// const response = await client.get('/users');
`;
}

/**
 * Generador específico para Validator
 */
function generateValidatorCode(spec: ToolSpecification, componentName: string): string {
  return `// ${spec.name} - Validador de Estructuras
interface ValidationRule {
  field: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

interface ValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
}

export class ${componentName} {
  private rules: ValidationRule[];

  constructor(rules: ValidationRule[]) {
    this.rules = rules;
  }

  validate(data: Record<string, any>): ValidationResult {
    const errors: Array<{ field: string; message: string }> = [];

    for (const rule of this.rules) {
      const value = data[rule.field];

      // Validar campo requerido
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field: rule.field,
          message: \`\${rule.field} es obligatorio\`
        });
        continue;
      }

      // Si no es requerido y no existe, saltar
      if (value === undefined || value === null) {
        continue;
      }

      // Validar tipo
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== rule.type) {
        errors.push({
          field: rule.field,
          message: \`\${rule.field} debe ser de tipo \${rule.type}\`
        });
        continue;
      }

      // Validar longitud/mínimo/máximo para strings y números
      if (rule.type === 'string' || rule.type === 'array') {
        const length = value.length;
        if (rule.min !== undefined && length < rule.min) {
          errors.push({
            field: rule.field,
            message: \`\${rule.field} debe tener al menos \${rule.min} caracteres\`
          });
        }
        if (rule.max !== undefined && length > rule.max) {
          errors.push({
            field: rule.field,
            message: \`\${rule.field} debe tener como máximo \${rule.max} caracteres\`
          });
        }
      }

      if (rule.type === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          errors.push({
            field: rule.field,
            message: \`\${rule.field} debe ser mayor o igual a \${rule.min}\`
          });
        }
        if (rule.max !== undefined && value > rule.max) {
          errors.push({
            field: rule.field,
            message: \`\${rule.field} debe ser menor o igual a \${rule.max}\`
          });
        }
      }

      // Validar patrón para strings
      if (rule.type === 'string' && rule.pattern && !rule.pattern.test(value)) {
        errors.push({
          field: rule.field,
          message: \`\${rule.field} no cumple con el formato esperado\`
        });
      }

      // Validación personalizada
      if (rule.custom) {
        const customError = rule.custom(value);
        if (customError) {
          errors.push({
            field: rule.field,
            message: customError
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Ejemplo de uso:
// const validator = new ${componentName}([
//   { field: 'email', type: 'string', required: true, pattern: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/ },
//   { field: 'age', type: 'number', min: 18, max: 120 }
// ]);
// const result = validator.validate({ email: 'test@example.com', age: 25 });
`;
}

/**
 * Generador específico para Comparator
 */
function generateComparatorCode(spec: ToolSpecification, componentName: string): string {
  return `// ${spec.name} - Comparador de Datos
import React, { useState } from 'react';

interface ComparisonResult {
  field: string;
  value1: any;
  value2: any;
  equal: boolean;
  difference?: string;
}

interface ${componentName}Props {
  type: 'json' | 'text' | 'objects';
  title?: string;
}

export default function ${componentName}({ type, title = 'Comparador' }: ${componentName}Props) {
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [results, setResults] = useState<ComparisonResult[]>([]);

  const compare = () => {
    let data1: any, data2: any;

    try {
      if (type === 'json') {
        data1 = JSON.parse(input1);
        data2 = JSON.parse(input2);
      } else {
        data1 = input1;
        data2 = input2;
      }
    } catch (e) {
      alert('Error al parsear los datos');
      return;
    }

    const comparisonResults: ComparisonResult[] = [];

    if (type === 'objects' || type === 'json') {
      const allKeys = new Set([...Object.keys(data1 || {}), ...Object.keys(data2 || {})]);
      
      allKeys.forEach(key => {
        const val1 = data1?.[key];
        const val2 = data2?.[key];
        const equal = JSON.stringify(val1) === JSON.stringify(val2);
        
        comparisonResults.push({
          field: key,
          value1: val1,
          value2: val2,
          equal,
          difference: equal ? undefined : 'Diferente'
        });
      });
    } else {
      comparisonResults.push({
        field: 'content',
        value1: data1,
        value2: data2,
        equal: data1 === data2,
        difference: data1 === data2 ? undefined : 'Diferente'
      });
    }

    setResults(comparisonResults);
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{title}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Primer elemento
          </label>
          <textarea
            value={input1}
            onChange={e => setInput1(e.target.value)}
            className="w-full h-40 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-sm"
            placeholder={type === 'json' ? '{ "key": "value" }' : 'Texto a comparar...'}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Segundo elemento
          </label>
          <textarea
            value={input2}
            onChange={e => setInput2(e.target.value)}
            className="w-full h-40 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-sm"
            placeholder={type === 'json' ? '{ "key": "value" }' : 'Texto a comparar...'}
          />
        </div>
      </div>

      <button
        onClick={compare}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Comparar
      </button>

      {results.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Resultados</h2>
          <div className="space-y-2">
            {results.map((result, idx) => (
              <div
                key={idx}
                className={\`p-3 rounded-lg border \${
                  result.equal
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }\`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900 dark:text-white">{result.field}</span>
                  <span className={result.equal ? 'text-green-600' : 'text-red-600'}>
                    {result.equal ? '✓ Igual' : '✗ Diferente'}
                  </span>
                </div>
                {!result.equal && (
                  <div className="mt-2 text-sm">
                    <p className="text-slate-600 dark:text-slate-400">
                      <span className="font-medium">Valor 1:</span> {JSON.stringify(result.value1)}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      <span className="font-medium">Valor 2:</span> {JSON.stringify(result.value2)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
`;
}

/**
 * Generador específico para Evidence Manager
 */
function generateEvidenceManagerCode(spec: ToolSpecification, componentName: string): string {
  return `// ${spec.name} - Gestor de Evidencias Técnicas
import React, { useState } from 'react';

interface Evidence {
  id: string;
  title: string;
  description: string;
  type: 'test' | 'report' | 'commit' | 'verification';
  status: 'declared' | 'provided' | 'verified';
  source: string;
  reference: string;
  createdAt: string;
}

interface ${componentName}Props {
  projectName: string;
}

export default function ${componentName}({ projectName }: ${componentName}Props) {
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Evidence>>({});

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  const handleCreate = () => {
    if (!formData.title || !formData.type) {
      alert('Título y tipo son obligatorios');
      return;
    }

    const newEvidence: Evidence = {
      id: generateId(),
      title: formData.title || '',
      description: formData.description || '',
      type: formData.type as Evidence['type'],
      status: 'declared',
      source: formData.source || '',
      reference: formData.reference || '',
      createdAt: new Date().toISOString()
    };

    setEvidences([...evidences, newEvidence]);
    setFormData({});
    setShowForm(false);
  };

  const handleStatusChange = (id: string, status: Evidence['status']) => {
    setEvidences(evidences.map(e =>
      e.id === id ? { ...e, status } : e
    ));
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta evidencia?')) {
      setEvidences(evidences.filter(e => e.id !== id));
    }
  };

  const getStatusColor = (status: Evidence['status']) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'provided': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'declared': return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Evidencias Técnicas</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Proyecto: {projectName}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Nueva Evidencia
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg space-y-3">
          <input
            type="text"
            placeholder="Título"
            value={formData.title || ''}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
          <textarea
            placeholder="Descripción"
            value={formData.description || ''}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            rows={3}
          />
          <select
            value={formData.type || ''}
            onChange={e => setFormData({ ...formData, type: e.target.value as Evidence['type'] })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="">Seleccionar tipo...</option>
            <option value="test">Prueba</option>
            <option value="report">Informe</option>
            <option value="commit">Commit</option>
            <option value="verification">Verificación</option>
          </select>
          <input
            type="text"
            placeholder="Fuente"
            value={formData.source || ''}
            onChange={e => setFormData({ ...formData, source: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
          <input
            type="text"
            placeholder="Referencia"
            value={formData.reference || ''}
            onChange={e => setFormData({ ...formData, reference: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Crear
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {evidences.length === 0 ? (
          <p className="text-center py-8 text-slate-500 dark:text-slate-400">
            No hay evidencias registradas
          </p>
        ) : (
          evidences.map(evidence => (
            <div
              key={evidence.id}
              className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{evidence.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{evidence.description}</p>
                </div>
                <span className={\`px-2 py-1 rounded text-xs font-medium \${getStatusColor(evidence.status)}\`}>
                  {evidence.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                <span>Tipo: {evidence.type}</span>
                <span>Fuente: {evidence.source}</span>
                <span>Ref: {evidence.reference}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <select
                  value={evidence.status}
                  onChange={e => handleStatusChange(evidence.id, e.target.value as Evidence['status'])}
                  className="px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="declared">Declarada</option>
                  <option value="provided">Aportada</option>
                  <option value="verified">Verificada</option>
                </select>
                <button
                  onClick={() => handleDelete(evidence.id)}
                  className="px-2 py-1 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
`;
}

/**
 * Generador específico para Qwen Order
 */
function generateQwenOrderCode(spec: ToolSpecification, componentName: string): string {
  return `// ${spec.name} - Generador de Órdenes para Qwen Coder
import React, { useState } from 'react';

interface ${componentName}Props {
  project: string;
}

interface OrderData {
  objective: string;
  requirements: string[];
  constraints: string[];
  acceptanceCriteria: string[];
}

export default function ${componentName}({ project }: ${componentName}Props) {
  const [orderData, setOrderData] = useState<OrderData>({
    objective: '',
    requirements: [],
    constraints: [],
    acceptanceCriteria: []
  });
  const [newRequirement, setNewRequirement] = useState('');
  const [newConstraint, setNewConstraint] = useState('');
  const [newCriteria, setNewCriteria] = useState('');
  const [generatedOrder, setGeneratedOrder] = useState('');

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setOrderData({
        ...orderData,
        requirements: [...orderData.requirements, newRequirement.trim()]
      });
      setNewRequirement('');
    }
  };

  const addConstraint = () => {
    if (newConstraint.trim()) {
      setOrderData({
        ...orderData,
        constraints: [...orderData.constraints, newConstraint.trim()]
      });
      setNewConstraint('');
    }
  };

  const addCriteria = () => {
    if (newCriteria.trim()) {
      setOrderData({
        ...orderData,
        acceptanceCriteria: [...orderData.acceptanceCriteria, newCriteria.trim()]
      });
      setNewCriteria('');
    }
  };

  const generateOrder = () => {
    const timestamp = new Date().toLocaleString('es-ES');
    const order = \`# ORDEN DE DESARROLLO PARA QWEN CODER
## Generada por GAGO Open Artifact Factory
**Fecha:** \${timestamp}
**Proyecto:** \${project}
**Estado:** Preparada localmente — No ejecutada

---

## Objetivo
\${orderData.objective}

## Requisitos
\${orderData.requirements.length > 0 
  ? orderData.requirements.map((r, i) => \`\${i + 1}. \${r}\`).join('\\n')
  : '- Sin requisitos específicos definidos'}

## Restricciones
\${orderData.constraints.length > 0
  ? orderData.constraints.map((c, i) => \`\${i + 1}. \${c}\`).join('\\n')
  : '- Sin restricciones específicas definidas'}

## Criterios de aceptación
\${orderData.acceptanceCriteria.length > 0
  ? orderData.acceptanceCriteria.map((c, i) => \`\${i + 1}. \${c}\`).join('\\n')
  : '- Sin criterios de aceptación definidos'}

---

## Notas
- Esta orden ha sido generada localmente mediante plantillas de GAGO Factory.
- No ha sido ejecutada por Qwen Coder.
- Copie este documento y utilícelo como instrucción para Qwen Coder.
\`;

    setGeneratedOrder(order);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedOrder);
    alert('Orden copiada al portapapeles');
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
        Generador de Órdenes Qwen
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        Proyecto: {project}
      </p>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Objetivo *
          </label>
          <textarea
            value={orderData.objective}
            onChange={e => setOrderData({ ...orderData, objective: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            rows={3}
            placeholder="Describe qué debe construirse..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Requisitos
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newRequirement}
              onChange={e => setNewRequirement(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && addRequirement()}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="Añadir requisito..."
            />
            <button
              onClick={addRequirement}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Añadir
            </button>
          </div>
          {orderData.requirements.length > 0 && (
            <ul className="space-y-1">
              {orderData.requirements.map((req, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="flex-1">{req}</span>
                  <button
                    onClick={() => setOrderData({
                      ...orderData,
                      requirements: orderData.requirements.filter((_, i) => i !== idx)
                    })}
                    className="text-red-600 hover:text-red-700"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={generateOrder}
          disabled={!orderData.objective.trim()}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
        >
          Generar Orden
        </button>
      </div>

      {generatedOrder && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Orden Generada</h2>
            <button
              onClick={copyToClipboard}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Copiar
            </button>
          </div>
          <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-sm whitespace-pre-wrap">
            {generatedOrder}
          </pre>
        </div>
      )}
    </div>
  );
}
`;
}

/**
 * Generador específico para Workflow Builder
 */
function generateWorkflowBuilderCode(spec: ToolSpecification, componentName: string): string {
  return `// ${spec.name} - Constructor Visual de Workflows
import React, { useState } from 'react';

interface WorkflowNode {
  id: string;
  type: 'start' | 'task' | 'condition' | 'end';
  label: string;
  position: { x: number; y: number };
}

interface WorkflowEdge {
  id: string;
  from: string;
  to: string;
}

interface ${componentName}Props {
  name: string;
}

export default function ${componentName}({ name }: ${componentName}Props) {
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    { id: '1', type: 'start', label: 'Inicio', position: { x: 50, y: 50 } }
  ]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const addNode = (type: WorkflowNode['type']) => {
    const newNode: WorkflowNode = {
      id: Date.now().toString(),
      type,
      label: type === 'start' ? 'Inicio' : type === 'end' ? 'Fin' : 'Tarea',
      position: { x: 100 + nodes.length * 50, y: 100 }
    };
    setNodes([...nodes, newNode]);
  };

  const addEdge = (from: string, to: string) => {
    const newEdge: WorkflowEdge = {
      id: \`\${from}-\${to}\`,
      from,
      to
    };
    setEdges([...edges, newEdge]);
  };

  const deleteNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id));
    setEdges(edges.filter(e => e.from !== id && e.to !== id));
  };

  const validateWorkflow = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    const startNodes = nodes.filter(n => n.type === 'start');
    const endNodes = nodes.filter(n => n.type === 'end');
    
    if (startNodes.length === 0) errors.push('Falta nodo de inicio');
    if (startNodes.length > 1) errors.push('Solo puede haber un nodo de inicio');
    if (endNodes.length === 0) errors.push('Falta nodo de fin');
    
    // Verificar que todos los nodos estén conectados
    const connectedNodes = new Set<string>();
    edges.forEach(e => {
      connectedNodes.add(e.from);
      connectedNodes.add(e.to);
    });
    
    const disconnectedNodes = nodes.filter(n => !connectedNodes.has(n.id) && n.type !== 'start');
    if (disconnectedNodes.length > 0) {
      errors.push(\`Hay \${disconnectedNodes.length} nodo(s) desconectado(s)\`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{name}</h1>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => addNode('task')}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
        >
          + Tarea
        </button>
        <button
          onClick={() => addNode('condition')}
          className="px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors text-sm"
        >
          + Condición
        </button>
        <button
          onClick={() => addNode('end')}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
        >
          + Fin
        </button>
        <button
          onClick={() => {
            const validation = validateWorkflow();
            if (validation.valid) {
              alert('Workflow válido');
            } else {
              alert('Errores:\\n' + validation.errors.join('\\n'));
            }
          }}
          className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
        >
          Validar
        </button>
      </div>

      <div className="relative bg-slate-50 dark:bg-slate-700 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 min-h-[400px] p-4">
        {nodes.map(node => (
          <div
            key={node.id}
            onClick={() => setSelectedNode(node.id)}
            className={\`absolute p-3 rounded-lg cursor-pointer transition-all \${
              node.type === 'start' ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500' :
              node.type === 'end' ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-500' :
              node.type === 'condition' ? 'bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-500' :
              'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
            } \${selectedNode === node.id ? 'ring-2 ring-offset-2 ring-blue-500' : ''}\`}
            style={{ left: node.position.x, top: node.position.y }}
          >
            <p className="text-sm font-medium text-slate-900 dark:text-white">{node.label}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">{node.type}</p>
            {node.type !== 'start' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNode(node.id);
                }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
        <p>Nodos: {nodes.length} | Conexiones: {edges.length}</p>
      </div>
    </div>
  );
}
`;
}

/**
 * Generador específico para Model Spec
 */
function generateModelSpecCode(spec: ToolSpecification, componentName: string): string {
  return `// ${spec.name} - Especificación de Modelo de IA
interface ModelSpec {
  name: string;
  version: string;
  type: 'text' | 'code' | 'vision' | 'audio' | 'classification' | 'embedding';
  architecture: string;
  parameters: {
    total: number;
    trainable: number;
  };
  inputFormat: {
    type: string;
    dimensions?: number[];
    vocabulary?: number;
  };
  outputFormat: {
    type: string;
    dimensions?: number[];
    classes?: number;
  };
  requirements: {
    memory: number; // MB
    compute: string;
    storage: number; // MB
  };
  license: string;
  trainingData: {
    size: number;
    format: string;
    source: string;
  };
}

export class ${componentName} {
  private spec: ModelSpec;

  constructor(spec: ModelSpec) {
    this.spec = spec;
    this.validate();
  }

  private validate(): void {
    if (!this.spec.name) throw new Error('Nombre del modelo requerido');
    if (!this.spec.version) throw new Error('Versión requerida');
    if (this.spec.parameters.total <= 0) throw new Error('Parámetros debe ser mayor que 0');
    if (this.spec.requirements.memory <= 0) throw new Error('Memoria debe ser mayor que 0');
  }

  getSpecification(): ModelSpec {
    return { ...this.spec };
  }

  exportToJSON(): string {
    return JSON.stringify(this.spec, null, 2);
  }

  exportToMarkdown(): string {
    return \`# \${this.spec.name}

## Información General
- **Versión:** \${this.spec.version}
- **Tipo:** \${this.spec.type}
- **Arquitectura:** \${this.spec.architecture}
- **Licencia:** \${this.spec.license}

## Parámetros
- **Total:** \${this.spec.parameters.total.toLocaleString()}
- **Entrenables:** \${this.spec.parameters.trainable.toLocaleString()}

## Formato de Entrada
- **Tipo:** \${this.spec.inputFormat.type}
\${this.spec.inputFormat.dimensions ? \`- **Dimensiones:** \${this.spec.inputFormat.dimensions.join(' x ')}\` : ''}
\${this.spec.inputFormat.vocabulary ? \`- **Vocabulario:** \${this.spec.inputFormat.vocabulary}\` : ''}

## Formato de Salida
- **Tipo:** \${this.spec.outputFormat.type}
\${this.spec.outputFormat.dimensions ? \`- **Dimensiones:** \${this.spec.outputFormat.dimensions.join(' x ')}\` : ''}
\${this.spec.outputFormat.classes ? \`- **Clases:** \${this.spec.outputFormat.classes}\` : ''}

## Requisitos
- **Memoria:** \${this.spec.requirements.memory} MB
- **Computación:** \${this.spec.requirements.compute}
- **Almacenamiento:** \${this.spec.requirements.storage} MB

## Datos de Entrenamiento
- **Tamaño:** \${this.spec.trainingData.size.toLocaleString()} ejemplos
- **Formato:** \${this.spec.trainingData.format}
- **Fuente:** \${this.spec.trainingData.source}
\`;
  }

  estimateInferenceTime(inputSize: number): number {
    // Estimación simplificada basada en parámetros y tamaño de entrada
    const baseTime = this.spec.parameters.total / 1000000; // ms por millón de parámetros
    return baseTime * (inputSize / 1000);
  }
}

// Ejemplo de uso:
// const spec = new ${componentName}({
//   name: 'MiModelo',
//   version: '1.0.0',
//   type: 'text',
//   architecture: 'Transformer',
//   parameters: { total: 125000000, trainable: 125000000 },
//   inputFormat: { type: 'text', vocabulary: 50257 },
//   outputFormat: { type: 'text' },
//   requirements: { memory: 500, compute: 'GPU', storage: 500 },
//   license: 'MIT',
//   trainingData: { size: 1000000, format: 'json', source: 'OpenWebText' }
// });
`;
}

/**
 * Generador específico para Budget Calculator
 */
function generateBudgetCalculatorCode(spec: ToolSpecification, componentName: string): string {
  return `// ${spec.name} - Calculador de Presupuesto
import React, { useState } from 'react';

interface Resource {
  name: string;
  type: 'compute' | 'storage' | 'network' | 'api';
  quantity: number;
  unitCost: number;
  period: 'hour' | 'day' | 'month';
}

interface BudgetResult {
  resources: Array<Resource & { totalCost: number }>;
  totalCost: number;
  currency: string;
}

interface ${componentName}Props {
  resources: Resource[];
  currency?: string;
}

export default function ${componentName}({ resources: initialResources, currency = 'EUR' }: ${componentName}Props) {
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [newResource, setNewResource] = useState<Resource>({
    name: '',
    type: 'compute',
    quantity: 1,
    unitCost: 0,
    period: 'month'
  });

  const calculateBudget = (): BudgetResult => {
    const resourcesWithCost = resources.map(r => {
      let multiplier = 1;
      if (r.period === 'hour') multiplier = 730; // horas en un mes
      else if (r.period === 'day') multiplier = 30;
      
      return {
        ...r,
        totalCost: r.quantity * r.unitCost * multiplier
      };
    });

    const totalCost = resourcesWithCost.reduce((sum, r) => sum + r.totalCost, 0);

    return {
      resources: resourcesWithCost,
      totalCost,
      currency
    };
  };

  const addResource = () => {
    if (newResource.name && newResource.unitCost > 0) {
      setResources([...resources, newResource]);
      setNewResource({ name: '', type: 'compute', quantity: 1, unitCost: 0, period: 'month' });
    }
  };

  const removeResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const budget = calculateBudget();

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Calculador de Presupuesto</h1>

      <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Añadir Recurso</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Nombre"
            value={newResource.name}
            onChange={e => setNewResource({ ...newResource, name: e.target.value })}
            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
          <select
            value={newResource.type}
            onChange={e => setNewResource({ ...newResource, type: e.target.value as Resource['type'] })}
            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="compute">Computación</option>
            <option value="storage">Almacenamiento</option>
            <option value="network">Red</option>
            <option value="api">API</option>
          </select>
          <input
            type="number"
            placeholder="Cantidad"
            value={newResource.quantity}
            onChange={e => setNewResource({ ...newResource, quantity: Number(e.target.value) })}
            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            min="1"
          />
          <input
            type="number"
            placeholder="Coste unitario"
            value={newResource.unitCost || ''}
            onChange={e => setNewResource({ ...newResource, unitCost: Number(e.target.value) })}
            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            min="0"
            step="0.01"
          />
          <button
            onClick={addResource}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Añadir
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Recursos</h2>
        {resources.length === 0 ? (
          <p className="text-center py-8 text-slate-500 dark:text-slate-400">
            No hay recursos añadidos
          </p>
        ) : (
          <div className="space-y-2">
            {budget.resources.map((resource, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{resource.name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {resource.type} • {resource.quantity} × {resource.unitCost} {currency}/{resource.period}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {resource.totalCost.toFixed(2)} {currency}/mes
                  </p>
                  <button
                    onClick={() => removeResource(idx)}
                    className="px-2 py-1 text-sm bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">Coste Total Mensual</p>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
            {budget.totalCost.toFixed(2)} {currency}
          </p>
        </div>
      </div>
    </div>
  );
}
`;
}

/**
 * Generador específico para Log Analyzer
 */
function generateLogAnalyzerCode(spec: ToolSpecification, componentName: string): string {
  return `// ${spec.name} - Analizador de Registros
import React, { useState } from 'react';

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  source?: string;
}

interface AnalysisResult {
  totalEntries: number;
  byLevel: Record<string, number>;
  errors: LogEntry[];
  warnings: LogEntry[];
  timeRange: { start: string; end: string };
  patterns: Array<{ pattern: string; count: number }>;
}

interface ${componentName}Props {
  logFormat: 'json' | 'text' | 'csv';
}

export default function ${componentName}({ logFormat }: ${componentName}Props) {
  const [logs, setLogs] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const parseLogs = (): LogEntry[] => {
    const entries: LogEntry[] = [];

    if (logFormat === 'json') {
      try {
        const parsed = JSON.parse(logs);
        if (Array.isArray(parsed)) {
          entries.push(...parsed);
        }
      } catch (e) {
        alert('Error al parsear JSON');
      }
    } else if (logFormat === 'text') {
      const lines = logs.split('\\n');
      lines.forEach(line => {
        const match = line.match(/\\[(.*?)\\]\\s*(INFO|WARN|ERROR|DEBUG)\\s*(.*)/);
        if (match) {
          entries.push({
            timestamp: match[1],
            level: match[2] as LogEntry['level'],
            message: match[3]
          });
        }
      });
    }

    return entries;
  };

  const analyze = () => {
    const entries = parseLogs();

    if (entries.length === 0) {
      alert('No se encontraron entradas de log válidas');
      return;
    }

    const byLevel: Record<string, number> = {};
    const errors: LogEntry[] = [];
    const warnings: LogEntry[] = [];
    const patternCounts: Record<string, number> = {};

    entries.forEach(entry => {
      byLevel[entry.level] = (byLevel[entry.level] || 0) + 1;

      if (entry.level === 'ERROR') errors.push(entry);
      if (entry.level === 'WARN') warnings.push(entry);

      // Detectar patrones comunes
      const pattern = entry.message.substring(0, 50);
      patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
    });

    const patterns = Object.entries(patternCounts)
      .map(([pattern, count]) => ({ pattern, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    setAnalysis({
      totalEntries: entries.length,
      byLevel,
      errors,
      warnings,
      timeRange: {
        start: entries[0]?.timestamp || '',
        end: entries[entries.length - 1]?.timestamp || ''
      },
      patterns
    });
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Analizador de Registros</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Formato: {logFormat.toUpperCase()}
        </label>
        <textarea
          value={logs}
          onChange={e => setLogs(e.target.value)}
          className="w-full h-40 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-sm"
          placeholder={logFormat === 'json' ? '[{"timestamp": "...", "level": "INFO", "message": "..."}]' : '[2024-01-01 10:00:00] INFO Mensaje de ejemplo'}
        />
      </div>

      <button
        onClick={analyze}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-6"
      >
        Analizar
      </button>

      {analysis && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <p className="text-sm text-slate-600 dark:text-slate-400">Total</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{analysis.totalEntries}</p>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">Errores</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100">{analysis.errors.length}</p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-sm text-amber-600 dark:text-amber-400">Advertencias</p>
              <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{analysis.warnings.length}</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400">Niveles</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{Object.keys(analysis.byLevel).length}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Distribución por Nivel</h2>
            <div className="space-y-2">
              {Object.entries(analysis.byLevel).map(([level, count]) => (
                <div key={level} className="flex items-center gap-3">
                  <span className="w-20 text-sm font-medium text-slate-700 dark:text-slate-300">{level}</span>
                  <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-6 overflow-hidden">
                    <div
                      className={\`h-full \${
                        level === 'ERROR' ? 'bg-red-500' :
                        level === 'WARN' ? 'bg-amber-500' :
                        level === 'INFO' ? 'bg-blue-500' :
                        'bg-slate-500'
                      }\`}
                      style={{ width: \`\${(count / analysis.totalEntries) * 100}%\` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white w-12 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {analysis.patterns.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Patrones Más Frecuentes</h2>
              <div className="space-y-2">
                {analysis.patterns.map((pattern, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700 rounded">
                    <span className="text-sm text-slate-700 dark:text-slate-300 truncate flex-1">{pattern.pattern}</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white ml-2">{pattern.count}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.errors.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3">Errores Detectados</h2>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {analysis.errors.map((error, idx) => (
                  <div key={idx} className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm">
                    <p className="text-red-900 dark:text-red-100">{error.message}</p>
                    <p className="text-xs text-red-700 dark:text-red-300">{error.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
`;
}

/**
 * Generador genérico de fallback
 */
function generateGenericCode(spec: ToolSpecification, template: any, componentName: string): string {
  return `// ${spec.name} - ${template.name}
import React from 'react';

interface ${componentName}Props {
  // Definir props según entradas
}

export default function ${componentName}(props: ${componentName}Props) {
  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{/* ${spec.name} */}</h1>
      <p className="text-slate-600 dark:text-slate-400">
        ${template.description}
      </p>
    </div>
  );
}
`;
}

/**
 * Genera documentación para la herramienta
 */
function generateDocumentation(manifest: ToolManifest): string {
  return `# ${manifest.name}

## Descripción
${manifest.description}

## Categoría
${manifest.category}

## Versión
${manifest.version}

## Entradas
${manifest.inputs.map((i: any) => `- **${i.name}** (${i.type}${i.required ? ', obligatorio' : ''}): ${i.description}`).join('\n')}

## Salidas
${manifest.outputs.map((o: any) => `- **${o.name}** (${o.type}): ${o.description}`).join('\n')}

## Permisos Requeridos
${manifest.permissions.length > 0 ? manifest.permissions.map((p: any) => `- ${p}`).join('\n') : 'Ninguno'}

## Criterios de Aceptación
${manifest.acceptanceCriteria.map((c: any) => `- ${c}`).join('\n')}

## Licencia
${manifest.license}

## Historial de Versiones
${manifest.versionHistory.map((v: any) => `### ${v.version} (${v.date})\n${v.changes.map((c: any) => `- ${c}`).join('\n')}`).join('\n\n')}
`;
}

/**
 * Obtiene las plantillas disponibles
 */
export function getAvailableTemplates(): Array<{
  category: ToolCategory;
  name: string;
  description: string;
  defaultInputs: any[];
  defaultOutputs: any[];
}> {
  return Object.entries(TOOL_TEMPLATES).map(([category, template]) => ({
    category: category as ToolCategory,
    name: template.name,
    description: template.description,
    defaultInputs: template.defaultInputs,
    defaultOutputs: template.defaultOutputs
  }));
}

/**
 * PROBLEMA 6: Descarga de proyecto Vite completo
 */
export function downloadToolProject(manifest: ToolManifest, code: string, documentation: string): void {
  const projectName = manifest.name.toLowerCase().replace(/\s+/g, '-');
  
  // Crear estructura de archivos
  const files: Record<string, string> = {
    'package.json': JSON.stringify({
      name: projectName,
      version: manifest.version,
      description: manifest.description,
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'tsc && vite build',
        preview: 'vite preview'
      },
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0'
      },
      devDependencies: {
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0',
        '@vitejs/plugin-react': '^4.0.0',
        typescript: '^5.0.0',
        vite: '^5.0.0'
      }
    }, null, 2),
    
    'tsconfig.json': JSON.stringify({
      compilerOptions: {
        target: 'ES2020',
        useDefineForClassFields: true,
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'react-jsx',
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true
      },
      include: ['src']
    }, null, 2),
    
    'vite.config.ts': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`,
    
    'index.html': `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${manifest.name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
    
    'src/main.tsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
    
    'src/App.tsx': code,
    
    'README.md': documentation,
    
    '.gitignore': `node_modules
dist
.env
.env.local`
  };
  
  // Crear y descargar ZIP (simulado con múltiples descargas)
  // En un entorno real, usaríamos JSZip
  Object.entries(files).forEach(([filename, content]) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}/${filename}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

/**
 * Descarga el código generado como archivo
 */
export function downloadToolCode(manifest: ToolManifest, code: string): void {
  const filename = `${manifest.name.toLowerCase().replace(/\s+/g, '-')}.tsx`;
  const blob = new Blob([code], { type: 'text/typescript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
