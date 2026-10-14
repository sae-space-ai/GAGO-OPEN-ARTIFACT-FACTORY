import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { 
  createToolFromSpecification, 
  getAvailableTemplates, 
  downloadToolCode,
  validateToolSpecification 
} from '../services/tool-factory';
import type { ToolSpecification, ToolCategory } from '../types/control-plane';
import { TOOL_CATEGORY_LABELS } from '../types/control-plane';
import { Wrench, Plus, Download, FileCode, CheckCircle, AlertCircle } from 'lucide-react';

export default function ToolFactory() {
  const { store, addTool } = useData();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('dashboard');
  const [spec, setSpec] = useState<ToolSpecification>({
    name: '',
    category: 'dashboard',
    description: '',
    inputs: [],
    outputs: [],
    permissions: [],
    acceptanceCriteria: []
  });
  const [generatedTool, setGeneratedTool] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const templates = getAvailableTemplates();
  const tools = store.tools || [];

  const handleCreateTool = () => {
    setValidationErrors([]);
    
    // Validar especificación
    const validation = validateToolSpecification(spec);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    try {
      // Generar herramienta
      const result = createToolFromSpecification(spec);
      setGeneratedTool(result);
      
      // Guardar en el store
      addTool(result.manifest);
    } catch (error) {
      setValidationErrors([error instanceof Error ? error.message : 'Error desconocido']);
    }
  };

  const handleDownload = () => {
    if (generatedTool) {
      downloadToolCode(generatedTool.manifest, generatedTool.generatedCode);
    }
  };

  const handleSelectTemplate = (category: ToolCategory) => {
    setSelectedCategory(category);
    const template = templates.find(t => t.category === category);
    if (template) {
      setSpec({
        ...spec,
        category,
        description: template.description
      });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
          <Wrench className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          Tool Factory
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Generador de herramientas digitales con plantillas verificadas
        </p>
      </div>

      <section className="mb-6 flex flex-col gap-4 rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-950/30 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">CalculadoraPresupuestosJOULE</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Herramienta integrada de presupuestos: cálculo exacto en céntimos, tarifas por periodo, límites e importación y exportación JSON/CSV.
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            No crea una segunda herramienta ni modifica registros existentes. Datos independientes guardados en tu navegador.
          </p>
        </div>
        <Link to="/tools/calculadora-presupuestos-joule" className="shrink-0 rounded-lg bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700">
          Abrir calculadora
        </Link>
      </section>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Herramientas Creadas</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{tools.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Plantillas Disponibles</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{templates.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Categorías</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {new Set(templates.map(t => t.category)).size}
          </p>
        </div>
      </div>

      {/* Botón crear nueva herramienta */}
      {!showCreateForm && !generatedTool && (
        <button
          onClick={() => setShowCreateForm(true)}
          className="mb-6 flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Crear Nueva Herramienta
        </button>
      )}

      {/* Formulario de creación */}
      {showCreateForm && !generatedTool && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Nueva Herramienta
          </h2>

          {validationErrors.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                    Errores de validación:
                  </p>
                  <ul className="text-sm text-red-700 dark:text-red-400 list-disc list-inside">
                    {validationErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Selección de plantilla */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Plantilla
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {templates.map(template => (
                <button
                  key={template.category}
                  onClick={() => handleSelectTemplate(template.category)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedCategory === template.category
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <p className="font-semibold text-slate-900 dark:text-white mb-1">
                    {template.name}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {template.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Nombre */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              value={spec.name}
              onChange={e => setSpec({ ...spec, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="Mi Herramienta"
            />
          </div>

          {/* Descripción */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Descripción *
            </label>
            <textarea
              value={spec.description}
              onChange={e => setSpec({ ...spec, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="Descripción de la herramienta..."
            />
          </div>

          {/* Entradas */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Entradas *
            </label>
            <div className="space-y-2">
              {spec.inputs.map((input, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={input.name}
                    onChange={e => {
                      const newInputs = [...spec.inputs];
                      newInputs[idx] = { ...newInputs[idx], name: e.target.value };
                      setSpec({ ...spec, inputs: newInputs });
                    }}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                    placeholder="Nombre"
                  />
                  <select
                    value={input.type}
                    onChange={e => {
                      const newInputs = [...spec.inputs];
                      newInputs[idx] = { ...newInputs[idx], type: e.target.value as any };
                      setSpec({ ...spec, inputs: newInputs });
                    }}
                    className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="string">string</option>
                    <option value="number">number</option>
                    <option value="boolean">boolean</option>
                    <option value="object">object</option>
                    <option value="array">array</option>
                  </select>
                  <button
                    onClick={() => setSpec({ ...spec, inputs: spec.inputs.filter((_, i) => i !== idx) })}
                    className="px-3 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => setSpec({ 
                  ...spec, 
                  inputs: [...spec.inputs, { name: '', type: 'string', required: false, description: '' }] 
                })}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                + Añadir entrada
              </button>
            </div>
          </div>

          {/* Salidas */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Salidas *
            </label>
            <div className="space-y-2">
              {spec.outputs.map((output, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={output.name}
                    onChange={e => {
                      const newOutputs = [...spec.outputs];
                      newOutputs[idx] = { ...newOutputs[idx], name: e.target.value };
                      setSpec({ ...spec, outputs: newOutputs });
                    }}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                    placeholder="Nombre"
                  />
                  <select
                    value={output.type}
                    onChange={e => {
                      const newOutputs = [...spec.outputs];
                      newOutputs[idx] = { ...newOutputs[idx], type: e.target.value as any };
                      setSpec({ ...spec, outputs: newOutputs });
                    }}
                    className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="string">string</option>
                    <option value="number">number</option>
                    <option value="boolean">boolean</option>
                    <option value="object">object</option>
                    <option value="array">array</option>
                  </select>
                  <button
                    onClick={() => setSpec({ ...spec, outputs: spec.outputs.filter((_, i) => i !== idx) })}
                    className="px-3 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => setSpec({ 
                  ...spec, 
                  outputs: [...spec.outputs, { name: '', type: 'string', description: '' }] 
                })}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                + Añadir salida
              </button>
            </div>
          </div>

          {/* Criterios de aceptación */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Criterios de Aceptación
            </label>
            <textarea
              value={spec.acceptanceCriteria.join('\n')}
              onChange={e => setSpec({ ...spec, acceptanceCriteria: e.target.value.split('\n').filter(c => c.trim()) })}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
              placeholder="Un criterio por línea..."
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowCreateForm(false);
                setSpec({
                  name: '',
                  category: 'dashboard',
                  description: '',
                  inputs: [],
                  outputs: [],
                  permissions: [],
                  acceptanceCriteria: []
                });
                setValidationErrors([]);
              }}
              className="px-6 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateTool}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium"
            >
              Generar Herramienta
            </button>
          </div>
        </div>
      )}

      {/* Resultado de generación */}
      {generatedTool && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              Herramienta Generada: {generatedTool.manifest.name}
            </h2>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              <Download className="w-4 h-4" />
              Descargar Código
            </button>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Código Generado
            </h3>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{generatedTool.generatedCode}</code>
            </pre>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Documentación
            </h3>
            <pre className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-4 rounded-lg overflow-x-auto text-sm whitespace-pre-wrap">
              {generatedTool.documentation}
            </pre>
          </div>

          <button
            onClick={() => {
              setGeneratedTool(null);
              setShowCreateForm(false);
            }}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Crear Otra Herramienta
          </button>
        </div>
      )}

      {/* Lista de herramientas existentes */}
      {tools.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Herramientas Registradas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool: any) => (
              <div
                key={tool.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {tool.name}
                    </h3>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    {TOOL_CATEGORY_LABELS[tool.category as ToolCategory]}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                  {tool.description}
                </p>
                <div className="text-xs text-slate-500 dark:text-slate-500">
                  <p>Versión: {tool.version}</p>
                  <p>Entradas: {tool.inputs.length} | Salidas: {tool.outputs.length}</p>
                </div>
                {(tool.category === 'budget_calculator' || tool.name?.toLowerCase().replace(/[^a-z0-9]/g, '') === 'calculadorapresupuestosjoule') && (
                  <Link to="/tools/calculadora-presupuestos-joule" className="mt-3 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                    Abrir calculadora funcional
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
