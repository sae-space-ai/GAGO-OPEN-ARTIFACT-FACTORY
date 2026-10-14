import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Modal, ConfirmDialog, EmptyState, StatusBadge, Toast } from '../components/UI';
import { Plus, Search, Edit2, Trash2, Package, Download } from 'lucide-react';
import type { Artifact, ArtifactType, ArtifactStatus } from '../types';
import { ARTIFACT_TYPE_LABELS } from '../types';

const ARTIFACT_STATUS_LABELS: Record<ArtifactStatus, string> = {
  draft: 'Borrador', in_progress: 'En progreso', review: 'En revisión', approved: 'Aprobado', published: 'Publicado',
};

export default function Artifacts() {
  const { store, addArtifact, editArtifact, removeArtifact } = useData();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArtifact, setEditingArtifact] = useState<Artifact | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState({ name: '', description: '', type: 'web_app' as ArtifactType, projectId: '', version: '0.1.0', status: 'draft' as ArtifactStatus });

  const filtered = store.artifacts
    .filter(a => typeFilter === 'all' || a.type === typeFilter)
    .filter(a => projectFilter === 'all' || a.projectId === projectFilter)
    .filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

  function openCreate() {
    setEditingArtifact(null);
    setForm({ name: '', description: '', type: 'web_app', projectId: store.projects[0]?.id || '', version: '0.1.0', status: 'draft' });
    setModalOpen(true);
  }

  function openEdit(artifact: Artifact) {
    setEditingArtifact(artifact);
    setForm({ name: artifact.name, description: artifact.description, type: artifact.type, projectId: artifact.projectId, version: artifact.version, status: artifact.status });
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editingArtifact) {
      editArtifact(editingArtifact.id, form);
      setToast({ message: 'Artefacto actualizado', type: 'success' });
    } else {
      addArtifact(form);
      setToast({ message: 'Artefacto registrado', type: 'success' });
    }
    setModalOpen(false);
  }

  function handleDelete(id: string) {
    removeArtifact(id);
    setToast({ message: 'Artefacto eliminado', type: 'success' });
  }

  function exportArtifacts() {
    const data = JSON.stringify(filtered, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'artifacts-export.json';
    a.click();
    URL.revokeObjectURL(url);
    setToast({ message: 'Artefactos exportados', type: 'success' });
  }

  function getProjectName(id: string) {
    return store.projects.find(p => p.id === id)?.name || 'Sin proyecto';
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Buscar artefactos..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">Todos los tipos</option>
          {Object.entries(ARTIFACT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">Todos los proyectos</option>
          {store.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button onClick={exportArtifacts} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm" title="Exportar JSON">
          <Download className="w-4 h-4" />
        </button>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Nuevo
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Package} title="Sin artefactos" description="Registra tu primer artefacto digital." action={<button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"><Plus className="w-4 h-4" /> Registrar artefacto</button>} />
      ) : (
        <div className="grid gap-3">
          {filtered.map(artifact => (
            <div key={artifact.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{artifact.name}</h3>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">v{artifact.version}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">{artifact.description || 'Sin descripción'}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={artifact.status} label={ARTIFACT_STATUS_LABELS[artifact.status]} />
                    <span className="text-xs text-slate-500 dark:text-slate-400">{ARTIFACT_TYPE_LABELS[artifact.type]}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{getProjectName(artifact.projectId)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(artifact)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteConfirm(artifact.id)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingArtifact ? 'Editar artefacto' : 'Nuevo artefacto'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre *</label>
            <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" maxLength={100} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none" maxLength={500} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as ArtifactType }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
                {Object.entries(ARTIFACT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estado</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ArtifactStatus }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
                {Object.entries(ARTIFACT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Proyecto</label>
              <select value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Sin proyecto</option>
                {store.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Versión</label>
              <input type="text" value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" maxLength={20} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium">{editingArtifact ? 'Guardar' : 'Registrar'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)} title="Eliminar artefacto" message="¿Estás seguro de que deseas eliminar este artefacto? Esta acción no se puede deshacer." />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
