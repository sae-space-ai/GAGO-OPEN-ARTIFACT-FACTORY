import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Toast } from '../components/UI';
import { generateQwenOrder, downloadAsFile, copyToClipboard } from '../services/qwen-generator';
import { Terminal, Copy, Download, AlertCircle, Plus, X, Target } from 'lucide-react';
import { IMPLEMENTATION_STATUS_LABELS } from '../types/scope';

export default function QwenGenerator() {
  const { store } = useData();
  const [projectId, setProjectId] = useState(store.projects[0]?.id || '');
  const [objective, setObjective] = useState('');
  const [requirements, setRequirements] = useState<string[]>([]);
  const [constraints, setConstraints] = useState<string[]>([]);
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<string[]>([]);
  const [newReq, setNewReq] = useState('');
  const [newConstraint, setNewConstraint] = useState('');
  const [newCriteria, setNewCriteria] = useState('');
  const [generated, setGenerated] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  function addRequirement() {
    if (newReq.trim()) { setRequirements([...requirements, newReq.trim()]); setNewReq(''); }
  }
  function addConstraint() {
    if (newConstraint.trim()) { setConstraints([...constraints, newConstraint.trim()]); setNewConstraint(''); }
  }
  function addCriteria() {
    if (newCriteria.trim()) { setAcceptanceCriteria([...acceptanceCriteria, newCriteria.trim()]); setNewCriteria(''); }
  }

  function handleGenerate() {
    if (!objective.trim()) {
      setToast({ message: 'Debes especificar un objetivo', type: 'error' });
      return;
    }
    const order = {
      projectId,
      objective: objective.trim(),
      requirements,
      constraints,
      acceptanceCriteria,
      generatedAt: new Date().toISOString(),
    };
    const project = store.projects.find(p => p.id === projectId);
    const doc = generateQwenOrder(order, project);
    setGenerated(doc);
    setToast({ message: 'Orden generada correctamente', type: 'success' });
  }

  async function handleCopy() {
    const ok = await copyToClipboard(generated);
    setToast({ message: ok ? 'Copiado al portapapeles' : 'Error al copiar', type: ok ? 'success' : 'error' });
  }

  function handleDownload() {
    const filename = `qwen-order-${new Date().toISOString().slice(0, 10)}.md`;
    downloadAsFile(generated, filename);
    setToast({ message: 'Archivo descargado', type: 'success' });
  }

  return (
    <div className="space-y-6">
      {/* Warning banner */}
      <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Generador local de instrucciones</p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
            Esta herramienta genera documentos de instrucciones mediante plantillas locales. No se conecta a Qwen Coder ni a ningún modelo de IA.
            El proveedor de inteligencia artificial no está configurado en la Fase Cero. Copia el resultado y utilízalo manualmente.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Proyecto</label>
            <select value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Sin proyecto específico</option>
              {store.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Objetivo de desarrollo *</label>
            <textarea value={objective} onChange={e => setObjective(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Describe qué debe construirse..." maxLength={1000} />
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Requisitos</label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={newReq} onChange={e => setNewReq(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addRequirement())} className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Añadir requisito..." maxLength={200} />
              <button onClick={addRequirement} className="px-3 py-2 rounded-lg bg-slate-700 dark:bg-slate-600 text-white hover:bg-slate-800 text-sm"><Plus className="w-4 h-4" /></button>
            </div>
            {requirements.length > 0 && (
              <ul className="space-y-1">
                {requirements.map((r, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg">
                    <span className="flex-1">{r}</span>
                    <button onClick={() => setRequirements(requirements.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Constraints */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Restricciones</label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={newConstraint} onChange={e => setNewConstraint(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addConstraint())} className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Añadir restricción..." maxLength={200} />
              <button onClick={addConstraint} className="px-3 py-2 rounded-lg bg-slate-700 dark:bg-slate-600 text-white hover:bg-slate-800 text-sm"><Plus className="w-4 h-4" /></button>
            </div>
            {constraints.length > 0 && (
              <ul className="space-y-1">
                {constraints.map((c, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg">
                    <span className="flex-1">{c}</span>
                    <button onClick={() => setConstraints(constraints.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Acceptance criteria */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Criterios de aceptación</label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={newCriteria} onChange={e => setNewCriteria(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCriteria())} className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Añadir criterio..." maxLength={200} />
              <button onClick={addCriteria} className="px-3 py-2 rounded-lg bg-slate-700 dark:bg-slate-600 text-white hover:bg-slate-800 text-sm"><Plus className="w-4 h-4" /></button>
            </div>
            {acceptanceCriteria.length > 0 && (
              <ul className="space-y-1">
                {acceptanceCriteria.map((c, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg">
                    <span className="flex-1">{c}</span>
                    <button onClick={() => setAcceptanceCriteria(acceptanceCriteria.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Scope Matrix Integration */}
          {store.scopeMatrix && store.scopeMatrix.length > 0 && (
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" /> Requisitos de la Matriz (Fase 0.1)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Selecciona requisitos pendientes para incluirlos en la orden.
              </p>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {store.scopeMatrix
                  .filter(r => !r.archived && r.implementationStatus !== 'implemented' && r.implementationStatus !== 'discarded')
                  .map(req => (
                    <label key={req.id} className="flex items-center gap-2 text-xs p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 dark:border-slate-600"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRequirements(prev => [...prev, `[${req.code}] ${req.name}: ${req.functionalDescription}`]);
                            setAcceptanceCriteria(prev => [...prev, ...req.acceptanceCriteria.map(c => `[${req.code}] ${c}`)]);
                          } else {
                            setRequirements(prev => prev.filter(r => !r.startsWith(`[${req.code}]`)));
                            setAcceptanceCriteria(prev => prev.filter(c => !c.startsWith(`[${req.code}]`)));
                          }
                        }}
                      />
                      <span className="font-medium text-slate-700 dark:text-slate-300">{req.code}</span>
                      <span className="text-slate-600 dark:text-slate-400 truncate flex-1">{req.name}</span>
                      <span className="text-[10px] text-slate-400">{IMPLEMENTATION_STATUS_LABELS[req.implementationStatus]}</span>
                    </label>
                  ))}
              </div>
            </div>
          )}

          <button onClick={handleGenerate} className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <Terminal className="w-4 h-4" /> Generar orden
          </button>
        </div>

        {/* Output */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Resultado</h3>
            {generated && (
              <div className="flex gap-2">
                <button onClick={handleCopy} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium">
                  <Copy className="w-3.5 h-3.5" /> Copiar
                </button>
                <button onClick={handleDownload} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium">
                  <Download className="w-3.5 h-3.5" /> Descargar
                </button>
              </div>
            )}
          </div>
          <div className="bg-slate-900 dark:bg-slate-950 rounded-xl border border-slate-700 p-4 min-h-[400px] overflow-auto">
            {generated ? (
              <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">{generated}</pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[350px] text-center">
                <Terminal className="w-10 h-10 text-slate-600 mb-3" />
                <p className="text-sm text-slate-500">Completa el formulario y genera la orden para ver el resultado aquí.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
