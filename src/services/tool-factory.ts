// GAGO Open Artifact Factory - Tool Factory
// Fase 5: Generador de herramientas digitales con plantillas verificadas

import type { ToolManifest, ToolSpecification, ToolCategory } from '../types/control-plane';
import { generateId } from './storage';

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
 * Crea una herramienta a partir de una especificación validada
 */
export function createToolFromSpecification(spec: ToolSpecification): {
  manifest: ToolManifest;
  generatedCode: string;
  documentation: string;
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
    status: 'IMPLEMENTED',
    acceptanceCriteria: spec.acceptanceCriteria,
    tests: [],
    evidenceIds: [],
    license: 'MIT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    versionHistory: [{
      version: '1.0.0',
      date: new Date().toISOString(),
      changes: ['Versión inicial']
    }]
  };

  // Generar documentación
  const documentation = generateDocumentation(manifest);

  return {
    manifest,
    generatedCode,
    documentation
  };
}

/**
 * Genera el código de la herramienta basado en la plantilla
 */
function generateToolCode(spec: ToolSpecification, template: any): string {
  // Generar código React/TypeScript basado en la categoría
  switch (spec.category) {
    case 'dashboard':
      return generateDashboardCode(spec);
    case 'form':
      return generateFormCode(spec);
    case 'crud':
      return generateCrudCode(spec);
    case 'table':
      return generateTableCode(spec);
    default:
      return generateGenericCode(spec, template);
  }
}

function generateDashboardCode(spec: ToolSpecification): string {
  return `// ${spec.name} - Panel de Control
import React from 'react';

interface ${spec.name.replace(/\s+/g, '')}Props {
  title: string;
  metrics: Array<{ label: string; value: number | string }>;
}

export default function ${spec.name.replace(/\s+/g, '')}({ title, metrics }: ${spec.name.replace(/\s+/g, '')}Props) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((metric, idx) => (
          <div key={idx} className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow">
            <p className="text-sm text-slate-600 dark:text-slate-400">{metric.label}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{metric.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
`;
}

function generateFormCode(spec: ToolSpecification): string {
  return `// ${spec.name} - Formulario
import React, { useState } from 'react';

interface ${spec.name.replace(/\s+/g, '')}Props {
  title: string;
  onSubmit: (data: any) => void;
}

export default function ${spec.name.replace(/\s+/g, '')}({ title, onSubmit }: ${spec.name.replace(/\s+/g, '')}Props) {
  const [formData, setFormData] = useState({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      {/* Campos del formulario */}
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
        Enviar
      </button>
    </form>
  );
}
`;
}

function generateCrudCode(spec: ToolSpecification): string {
  return `// ${spec.name} - Gestor CRUD
import React, { useState } from 'react';

interface ${spec.name.replace(/\s+/g, '')}Props {
  entityName: string;
}

export default function ${spec.name.replace(/\s+/g, '')}({ entityName }: ${spec.name.replace(/\s+/g, '')}Props) {
  const [items, setItems] = useState<any[]>([]);

  const create = (item: any) => setItems([...items, item]);
  const read = (id: string) => items.find(i => i.id === id);
  const update = (id: string, updates: any) => 
    setItems(items.map(i => i.id === id ? { ...i, ...updates } : i));
  const del = (id: string) => setItems(items.filter(i => i.id !== id));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestor de {entityName}</h1>
      {/* Implementación CRUD */}
    </div>
  );
}
`;
}

function generateTableCode(spec: ToolSpecification): string {
  return `// ${spec.name} - Tabla
import React, { useState } from 'react';

interface ${spec.name.replace(/\s+/g, '')}Props {
  title: string;
  columns: Array<{ key: string; label: string }>;
  data: any[];
}

export default function ${spec.name.replace(/\s+/g, '')}({ title, columns, data }: ${spec.name.replace(/\s+/g, '')}Props) {
  const [sortKey, setSortKey] = useState<string>('');
  const [filter, setFilter] = useState('');

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    return a[sortKey] > b[sortKey] ? 1 : -1;
  });

  const filteredData = sortedData.filter(item =>
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(filter.toLowerCase())
    )
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <input
        type="text"
        placeholder="Filtrar..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
        className="mb-4 px-3 py-2 border rounded"
      />
      <table className="w-full">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} onClick={() => setSortKey(col.key)} className="cursor-pointer">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, idx) => (
            <tr key={idx}>
              {columns.map(col => (
                <td key={col.key}>{row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
`;
}

function generateGenericCode(spec: ToolSpecification, template: any): string {
  return `// ${spec.name} - ${template.name}
import React from 'react';

interface ${spec.name.replace(/\s+/g, '')}Props {
  // Definir props según entradas
}

export default function ${spec.name.replace(/\s+/g, '')}(props: ${spec.name.replace(/\s+/g, '')}Props) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{/* ${spec.name} */}</h1>
      {/* Implementación de ${template.description} */}
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
}> {
  return Object.entries(TOOL_TEMPLATES).map(([category, template]) => ({
    category: category as ToolCategory,
    name: template.name,
    description: template.description
  }));
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
