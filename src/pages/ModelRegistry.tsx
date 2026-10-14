import React, { useState } from 'react';
import { Brain, Plus } from 'lucide-react';
import { MODEL_TYPE_LABELS, EXECUTION_MODE_LABELS, CAPABILITY_STATUS_LABELS } from '../types/control-plane';
import type { ModelType } from '../types/control-plane';

export default function ModelRegistry() {
  const [models] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
          <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          Model Registry
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Catálogo de modelos de inteligencia artificial
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Modelos</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{models.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Verificados</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">0</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Locales</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">0</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Remotos</p>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">0</p>
        </div>
      </div>

      {/* Botón crear modelo */}
      <button
        onClick={() => setShowCreateForm(!showCreateForm)}
        className="mb-6 flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
      >
        <Plus className="w-5 h-5" />
        Registrar Nuevo Modelo
      </button>

      {/* Estado vacío */}
      {models.length === 0 && (
        <div className="text-center py-12">
          <Brain className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 mb-2">No hay modelos registrados</p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            El registro de modelos está preparado para futuras integraciones
          </p>
        </div>
      )}
    </div>
  );
}
