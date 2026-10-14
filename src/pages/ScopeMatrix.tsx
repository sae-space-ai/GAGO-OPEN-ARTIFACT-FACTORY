import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Modal, ConfirmDialog, EmptyState, StatusBadge, Toast } from '../components/UI';
import { Plus, Search, Edit2, Trash2, Target, Filter, Link2, AlertTriangle } from 'lucide-react';
import type { ScopeRequirement, ImplementationStatus, TestStatus, ScopeModule, ScopePhase, ExecutorType, ActionType } from '../types/scope';
import {
  IMPLEMENTATION_STATUS_LABELS, TEST_STATUS_LABELS, VERIFICATION_STATUS_LABELS,
  EXECUTOR_LABELS, ACTION_TYPE_LABELS, SCOPE_MODULE_LABELS,
} from '../types/scope';
import { PRIORITY_LABELS } from '../types';
import { validateDependencies, isBlockedByDependencies } from '../services/dependencies';

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  high: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  low: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

export default function ScopeMatrix() {
  const { store, addScopeRequirement, editScopeRequirement, removeScopeRequirement } = useData();
  const matrix = store.scopeMatrix || [];

  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [implFilter, setImplFilter] = useState<string>('all');
  const [testFilter, setTestFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReq, setEditingReq] = useState<ScopeRequirement | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [detailReq, setDetailReq] = useState<ScopeRequirement | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [depError, setDepError] = useState<string>('');

  interface FormState {
    code: ScopeModule;
    phase: ScopePhase;
    module: string;
    name: string;
    functionalDescription: string;
    technicalObjective: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    dependencies: string[];
    executor: ExecutorType;
    implementationStatus: ImplementationStatus;
    testStatus: TestStatus;
    verificationStatus: 'not_verified' | 'partially_verified' | 'fully_verified';
    acceptanceCriteria: string[];
    evidenceIds: string[];
    relatedProjectIds: string[];
    relatedTaskIds: string[];
    relatedArtifactIds: string[];
    actionType: ActionType;
    actionReference: string;
    blockers: string[];
    observations: string;
    versionRef: string;
  }

  const emptyForm: FormState = {
    code: 'M01',
    phase: '0.1',
    module: 'Matriz de Alcance',
    name: '',
    functionalDescription: '',
    technicalObjective: '',
    priority: 'high',
    dependencies: [],
    executor: 'human',
    implementationStatus: 'not_started',
    testStatus: 'not_tested',
    verificationStatus: 'not_verified',
    acceptanceCriteria: [],
    evidenceIds: [],
    relatedProjectIds: [],
    relatedTaskIds: [],
    relatedArtifactIds: [],
    actionType: 'local_ui',
    actionReference: '',
    blockers: [],
    observations: '',
    versionRef: '',
  };

  const [form, setForm] = useState<FormState>(emptyForm);
  const [newCriteria, setNewCriteria] = useState('');
  const [newDep, setNewDep] = useState('');

  // Metrics
  const metrics = useMemo(() => {
    const total = matrix.filter(r => !r.archived).length;
    const implemented = matrix.filter(r => !r.archived && r.implementationStatus === 'implemented').length;
    const inDev = matrix.filter(r => !r.archived && r.implementationStatus === 'in_development').length;
    const testPassed = matrix.filter(r => !r.archived && r.testStatus === 'test_passed').length;
    const verified = matrix.filter(r => !r.archived && r.verificationStatus === 'fully_verified').length;
    const blocked = matrix.filter(r => !r.archived && r.implementationStatus === 'blocked').length;
    const implPct = total > 0 ? Math.round((implemented / total) * 100) : 0;
    const verifPct = total > 0 ? Math.round((verified / total) * 100) : 0;
    return { total, implemented, inDev, testPassed, verified, blocked, implPct, verifPct };
  }, [matrix]);

  // Filtered list
  const filtered = matrix
    .filter(r => !r.archived)
    .filter(r => moduleFilter === 'all' || r.code === moduleFilter)
    .filter(r => implFilter === 'all' || r.implementationStatus === implFilter)
    .filter(r => testFilter === 'all' || r.testStatus === testFilter)
    .filter(r => priorityFilter === 'all' || r.priority === priorityFilter)
    .filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.code.toLowerCase().includes(search.toLowerCase()));

  function openCreate() {
    setEditingReq(null);
    setForm(emptyForm);
    setDepError('');
    setModalOpen(true);
  }

  function openEdit(req: ScopeRequirement) {
    setEditingReq(req);
    setForm({
      code: req.code,
      phase: req.phase,
      module: req.module,
      name: req.name,
      functionalDescription: req.functionalDescription,
      technicalObjective: req.technicalObjective,
      priority: req.priority,
      dependencies: [...req.dependencies],
      executor: req.executor,
      implementationStatus: req.implementationStatus,
      testStatus: req.testStatus,
      verificationStatus: req.verificationStatus,
      acceptanceCriteria: [...req.acceptanceCriteria],
      evidenceIds: [...req.evidenceIds],
      relatedProjectIds: [...req.relatedProjectIds],
      relatedTaskIds: [...req.relatedTaskIds],
      relatedArtifactIds: [...req.relatedArtifactIds],
      actionType: req.actionType,
      actionReference: req.actionReference,
      blockers: [...req.blockers],
      observations: req.observations,
      versionRef: req.versionRef,
    });
    setDepError('');
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;

    // Validate dependencies
    const tempReq = { ...form, id: editingReq?.id || 'temp' } as ScopeRequirement;
    const validation = validateDependencies(tempReq, matrix);
    if (!validation.valid) {
      setDepError(validation.errors.join(' '));
      return;
    }

    if (editingReq) {
      editScopeRequirement(editingReq.id, form);
      setToast({ message: 'Requisito actualizado', type: 'success' });
    } else {
      addScopeRequirement(form);
      setToast({ message: 'Requisito creado', type: 'success' });
    }
    setModalOpen(false);
  }

  function handleDelete(id: string) {
    // Don't allow deleting initial scope requirements
    const isInitial = id.startsWith('scope-m');
    if (isInitial) {
      setToast({ message: 'Los requisitos iniciales no pueden eliminarse', type: 'error' });
      return;
    }
    removeScopeRequirement(id);
    setToast({ message: 'Requisito eliminado', type: 'success' });
  }

  function addCriteriaItem() {
    if (newCriteria.trim()) {
      setForm(f => ({ ...f, acceptanceCriteria: [...f.acceptanceCriteria, newCriteria.trim()] }));
      setNewCriteria('');
    }
  }

  function addDependency() {
    if (newDep && !form.dependencies.includes(newDep)) {
      setForm(f => ({ ...f, dependencies: [...f.dependencies, newDep] }));
      setNewDep('');
    }
  }

  function getReqName(id: string) {
    const r = matrix.find(req => req.id === id);
    return r ? `${r.code}: ${r.name}` : id;
  }

  function getEvidenceTitle(id: string) {
    return store.evidence.find(e => e.id === id)?.title || id;
  }

  function getProjectName(id: string) {
    return store.projects.find(p => p.id === id)?.name || id;
  }

  return (
    <div className="space-y-6">
      {/* Progress summary */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Progreso de la Fase 0.1</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.total}</p>
            <p className="text-xs text-slate-500">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{metrics.inDev}</p>
            <p className="text-xs text-slate-500">En desarrollo</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{metrics.implemented}</p>
            <p className="text-xs text-slate-500">Implementados</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{metrics.testPassed}</p>
            <p className="text-xs text-slate-500">Probados</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{metrics.verified}</p>
            <p className="text-xs text-slate-500">Verificados</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{metrics.blocked}</p>
            <p className="text-xs text-slate-500">Bloqueados</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.implPct}%</p>
            <p className="text-xs text-slate-500">Impl.</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.verifPct}%</p>
            <p className="text-xs text-slate-500">Verif.</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4 space-y-2">
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Implementación</span>
              <span>{metrics.implPct}%</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${metrics.implPct}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Verificación</span>
              <span>{metrics.verifPct}%</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${metrics.verifPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Buscar requisitos..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none">
          <option value="all">Todos los módulos</option>
          {Object.entries(SCOPE_MODULE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={implFilter} onChange={e => setImplFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none">
          <option value="all">Implementación</option>
          {Object.entries(IMPLEMENTATION_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none">
          <option value="all">Prioridad</option>
          {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          <Plus className="w-4 h-4" /> Nuevo
        </button>
      </div>

      {/* Matrix list */}
      {filtered.length === 0 ? (
        <EmptyState icon={Target} title="Sin requisitos" description="No hay requisitos que coincidan con los filtros." />
      ) : (
        <div className="grid gap-3">
          {filtered.map(req => {
            const blockInfo = isBlockedByDependencies(req, matrix);
            return (
              <div key={req.id} className={`bg-white dark:bg-slate-800 rounded-xl border p-4 hover:shadow-sm transition-shadow cursor-pointer ${
                req.implementationStatus === 'blocked' || blockInfo.blocked ? 'border-red-300 dark:border-red-800' : 'border-slate-200 dark:border-slate-700'
              }`} onClick={() => setDetailReq(req)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${PRIORITY_COLORS[req.priority]}`}>{req.code}</span>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{req.name}</h3>
                      {(req.implementationStatus === 'blocked' || blockInfo.blocked) && (
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">{req.functionalDescription}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={req.implementationStatus} label={IMPLEMENTATION_STATUS_LABELS[req.implementationStatus]} />
                      <StatusBadge status={req.testStatus} label={TEST_STATUS_LABELS[req.testStatus]} />
                      <span className={`text-xs px-1.5 py-0.5 rounded ${PRIORITY_COLORS[req.priority]}`}>{PRIORITY_LABELS[req.priority]}</span>
                      {req.dependencies.length > 0 && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Link2 className="w-3 h-3" /> {req.dependencies.length} dep.
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <button onClick={() => openEdit(req)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-blue-600" title="Editar">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {!req.id.startsWith('scope-m') && (
                      <button onClick={() => setDeleteConfirm(req.id)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-red-600" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <Modal open={!!detailReq} onClose={() => setDetailReq(null)} title={detailReq ? `${detailReq.code} — ${detailReq.name}` : ''} maxWidth="max-w-2xl">
        {detailReq && (
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción funcional</h4>
              <p className="text-slate-600 dark:text-slate-400">{detailReq.functionalDescription}</p>
            </div>
            <div>
              <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-1">Objetivo técnico</h4>
              <p className="text-slate-600 dark:text-slate-400">{detailReq.technicalObjective}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-1">Implementación</h4>
                <StatusBadge status={detailReq.implementationStatus} label={IMPLEMENTATION_STATUS_LABELS[detailReq.implementationStatus]} />
              </div>
              <div>
                <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-1">Pruebas</h4>
                <StatusBadge status={detailReq.testStatus} label={TEST_STATUS_LABELS[detailReq.testStatus]} />
              </div>
              <div>
                <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-1">Verificación</h4>
                <StatusBadge status={detailReq.verificationStatus} label={VERIFICATION_STATUS_LABELS[detailReq.verificationStatus]} />
              </div>
              <div>
                <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-1">Ejecutor</h4>
                <span className="text-slate-600 dark:text-slate-400">{EXECUTOR_LABELS[detailReq.executor]}</span>
              </div>
            </div>
            {detailReq.acceptanceCriteria.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-1">Criterios de aceptación</h4>
                <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1">
                  {detailReq.acceptanceCriteria.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}
            {detailReq.dependencies.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-1">Dependencias</h4>
                <ul className="space-y-1">
                  {detailReq.dependencies.map(depId => (
                    <li key={depId} className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded">
                      {getReqName(depId)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {detailReq.evidenceIds.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-1">Evidencias asociadas</h4>
                <ul className="space-y-1">
                  {detailReq.evidenceIds.map(evId => (
                    <li key={evId} className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded">
                      {getEvidenceTitle(evId)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {detailReq.relatedProjectIds.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-1">Proyectos relacionados</h4>
                <div className="flex flex-wrap gap-1">
                  {detailReq.relatedProjectIds.map(pid => (
                    <span key={pid} className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">{getProjectName(pid)}</span>
                  ))}
                </div>
              </div>
            )}
            <div>
              <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-1">Acción</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Tipo: {ACTION_TYPE_LABELS[detailReq.actionType]}
                {detailReq.actionReference && <span className="ml-2">Ref: <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">{detailReq.actionReference}</code></span>}
              </p>
            </div>
            {detailReq.observations && (
              <div>
                <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-1">Observaciones</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">{detailReq.observations}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingReq ? 'Editar requisito' : 'Nuevo requisito'} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {depError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-400">
              {depError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Código</label>
              <select value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value as ScopeModule }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none">
                {Object.entries(SCOPE_MODULE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prioridad</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as 'critical' | 'high' | 'medium' | 'low' }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none">
                {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre *</label>
            <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" maxLength={150} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción funcional</label>
            <textarea value={form.functionalDescription} onChange={e => setForm(f => ({ ...f, functionalDescription: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none resize-none" maxLength={500} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Objetivo técnico</label>
            <textarea value={form.technicalObjective} onChange={e => setForm(f => ({ ...f, technicalObjective: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none resize-none" maxLength={500} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Implementación</label>
              <select value={form.implementationStatus} onChange={e => setForm(f => ({ ...f, implementationStatus: e.target.value as ImplementationStatus }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none">
                {Object.entries(IMPLEMENTATION_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pruebas</label>
              <select value={form.testStatus} onChange={e => setForm(f => ({ ...f, testStatus: e.target.value as TestStatus }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none">
                {Object.entries(TEST_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ejecutor</label>
              <select value={form.executor} onChange={e => setForm(f => ({ ...f, executor: e.target.value as 'human' | 'ai_supervised' | 'automated' | 'external_tool' }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none">
                {Object.entries(EXECUTOR_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          {/* Acceptance criteria */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Criterios de aceptación</label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={newCriteria} onChange={e => setNewCriteria(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCriteriaItem())} className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none" placeholder="Añadir criterio..." maxLength={200} />
              <button type="button" onClick={addCriteriaItem} className="px-3 py-2 rounded-lg bg-slate-700 dark:bg-slate-600 text-white text-sm"><Plus className="w-4 h-4" /></button>
            </div>
            {form.acceptanceCriteria.length > 0 && (
              <ul className="space-y-1">
                {form.acceptanceCriteria.map((c, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded">
                    <span className="flex-1">{c}</span>
                    <button type="button" onClick={() => setForm(f => ({ ...f, acceptanceCriteria: f.acceptanceCriteria.filter((_, idx) => idx !== i) }))} className="text-slate-400 hover:text-red-500">×</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Dependencies */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dependencias</label>
            <div className="flex gap-2 mb-2">
              <select value={newDep} onChange={e => setNewDep(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none">
                <option value="">Seleccionar requisito...</option>
                {matrix.filter(r => r.id !== editingReq?.id).map(r => (
                  <option key={r.id} value={r.id}>{r.code}: {r.name}</option>
                ))}
              </select>
              <button type="button" onClick={addDependency} className="px-3 py-2 rounded-lg bg-slate-700 dark:bg-slate-600 text-white text-sm"><Plus className="w-4 h-4" /></button>
            </div>
            {form.dependencies.length > 0 && (
              <ul className="space-y-1">
                {form.dependencies.map(depId => (
                  <li key={depId} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded">
                    <span className="flex-1">{getReqName(depId)}</span>
                    <button type="button" onClick={() => setForm(f => ({ ...f, dependencies: f.dependencies.filter(d => d !== depId) }))} className="text-slate-400 hover:text-red-500">×</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium">{editingReq ? 'Guardar' : 'Crear'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)} title="Eliminar requisito" message="¿Estás seguro de que deseas eliminar este requisito? Esta acción no se puede deshacer." />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
