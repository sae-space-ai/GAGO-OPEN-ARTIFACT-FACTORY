import React, { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { ConfirmDialog, Toast } from '../components/UI';
import { Moon, Sun, Download, Upload, RotateCcw, Info, Shield } from 'lucide-react';
import { SCHEMA_VERSION } from '../types';

export default function Settings() {
  const { store, updateSettings, exportAllData, importAllData, resetAllData } = useData();
  const { theme, toggleTheme, setTheme } = useTheme();
  const [resetConfirm, setResetConfirm] = useState(false);
  const [importError, setImportError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gago-factory-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToast({ message: 'Datos exportados correctamente', type: 'success' });
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setImportError('El archivo es demasiado grande (máximo 10 MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const success = importAllData(content);
      if (success) {
        setImportError('');
        setToast({ message: 'Datos importados correctamente', type: 'success' });
      } else {
        setImportError('El archivo no tiene una estructura válida. No se han modificado los datos.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleReset() {
    resetAllData();
    setToast({ message: 'Datos restaurados al estado inicial', type: 'info' });
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Appearance */}
      <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Apariencia</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-700 dark:text-slate-300">Tema</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Selecciona el modo de visualización</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setTheme('light')} className={`p-2 rounded-lg ${theme === 'light' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`} title="Modo claro">
              <Sun className="w-5 h-5" />
            </button>
            <button onClick={() => setTheme('dark')} className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`} title="Modo oscuro">
              <Moon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Language */}
      <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Idioma</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-700 dark:text-slate-300">Idioma de la interfaz</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">El inglés estará disponible en futuras versiones</p>
          </div>
          <select value={store.settings.language} onChange={e => updateSettings({ language: e.target.value as 'es' | 'en' })} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
            <option value="es">Español</option>
            <option value="en">English (próximamente)</option>
          </select>
        </div>
      </section>

      {/* Data management */}
      <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Datos</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-300">Exportar datos</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Descarga todos los registros en formato JSON</p>
            </div>
            <button onClick={handleExport} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium">
              <Download className="w-4 h-4" /> Exportar
            </button>
          </div>
          <hr className="border-slate-200 dark:border-slate-700" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-300">Importar datos</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Carga una copia de seguridad (valida la estructura)</p>
            </div>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium cursor-pointer">
              <Upload className="w-4 h-4" /> Importar
              <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
          {importError && <p className="text-xs text-red-600 dark:text-red-400">{importError}</p>}
          <hr className="border-slate-200 dark:border-slate-700" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-300">Restaurar entorno</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Elimina todos los datos y vuelve al estado inicial</p>
            </div>
            <button onClick={() => setResetConfirm(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium">
              <RotateCcw className="w-4 h-4" /> Restaurar
            </button>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Información</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Aplicación</span>
            <span className="text-slate-900 dark:text-white font-medium">GAGO Open Artifact Factory</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Versión</span>
            <span className="text-slate-900 dark:text-white">{SCHEMA_VERSION}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Esquema de datos</span>
            <span className="text-slate-900 dark:text-white">v{SCHEMA_VERSION}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Licencia</span>
            <span className="text-slate-900 dark:text-white">MIT</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Almacenamiento</span>
            <span className="text-slate-900 dark:text-white">localStorage (navegador local)</span>
          </div>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-xs text-slate-600 dark:text-slate-400">
          <p className="flex items-center gap-2"><Info className="w-4 h-4" /> Los datos se almacenan únicamente en este navegador y dispositivo. No están sincronizados con ningún servidor. Exporta regularmente para no perder tu trabajo.</p>
        </div>
      </section>

      <ConfirmDialog open={resetConfirm} onClose={() => setResetConfirm(false)} onConfirm={handleReset} title="Restaurar entorno" message="Se eliminarán todos los proyectos, tareas, artefactos y evidencias. Esta acción no se puede deshacer. ¿Deseas continuar?" />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
