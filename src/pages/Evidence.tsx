import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Modal, ConfirmDialog, EmptyState, StatusBadge, Toast } from '../components/UI';
import { Plus, Search, Edit2, Trash2, Shield, Download } from 'lucide-react';
import type { Evidence, EvidenceType, EvidenceStatus } from '../types';
import { EVIDENCE_STATUS_LABELS } from '../types';

const EVIDENCE_TYPE_LABELS: Record<EvidenceType, string> = {
  test: 'Prueba', report: 'Informe', commit: 'Commit', issue: 'Incidencia', verification: 'Verificación', other: 'Otro',
};

export default function Evidence() {
  const { store, addEvidence, editEvidence, removeEvidence } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvidence, setEditingEvidence] = useState<Evidence | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState({ title: '', description: '', type: 'test' as EvidenceType, status: 'declared' as EvidenceStatus, projectId: '', taskId: '', artifactId: '', source: '', reference: '', hash: '' });

  const filtered = store.evidence
    .filter(e => statusFilter === 'all' || e.status === statusFilter)
    .filter(e => typeFilter === 'all' || e.type === typeFilter)
    .filter(e => e.title.toLowerCase().includes(search.toLowerCase()));

  function openCreate() {
    setEditingEvidence(null);
    setForm({ title: '', description: '', type: 'test', status: 'declared', projectId: '', taskId: '', artifactId: '', source: '', reference: '', hash: '' });
    setModalOpen(true);
  }

  function openEdit(ev: Evidence) {
    setEditingEvidence(ev);
    setForm({ title: ev.title, description: ev.description, type: ev.type, status: ev.status, projectId: ev.projectId || '', taskId: ev.taskId || '', artifactId: ev.artifactId || '', source: ev.source, reference: ev.reference, hash: ev.hash || '' });
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const data = { ...form, projectId: form.projectId || undefined, taskId: form.taskId || undefined, artifactId: form.artifactId || undefined, hash: form.hash || undefined };
    if (editingEvidence) {
      editEvidence(editingEvidence.id, data);
      setToast({ message: 'Evidencia actualizada', type: 'success' });
    } else {
      addEvidence(data);
      setToast({ message: 'Evidencia registrada', type: 'success' });
    }
    setModalOpen(false);
  }

  function handleDelete(id: string) {
    removeEvidence(id);
    setToast({ message: 'Evidencia eliminada', type: 'success' });
  }

  function exportEvidence() {
    const data = JSON.stringify(filtered, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'evidence-export.json';
    a.click();
    URL.revokeObjectURL(url);
    setToast({ message: 'Evidencias exportadas', type: 'success' });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Buscar evidencias..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">Todos los estados</option>
          {Object.entries(EVIDENCE_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">Todos los tipos</option>
          {Object.entries(EVIDENCE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button onClick={exportEvidence} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm" title="Exportar JSON">
          <Download className="w-4 h-4" />
        </button>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Nueva
        </button>
      </div>

      {/* Info banner */}
      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
        <strong>Nota sobre evidencias:</strong> Una referencia escrita por el usuario no constituye por sí misma una prueba técnica superada. Las categorías «Declarada», «Aportada» y «Verificada» no deben confundirse durante la Fase Cero.
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Shield} title="Sin evidencias" description="Registra evidencias técnicas para documentar resultados verificables." action={<button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"><Plus className="w-4 h-4" /> Registrar evidencia</button>} />
      ) : (
        <div className="grid gap-3">
          {filtered.map(ev => (
            <div key={ev.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{ev.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">{ev.description || 'Sin descripción'}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={ev.status} label={EVIDENCE_STATUS_LABELS[ev.status]} />
                    <span className="text-xs text-slate-500 dark:text-slate-400">{EVIDENCE_TYPE_LABELS[ev.type]}</span>
                    {ev.source && <span className="text-xs text-slate-400 dark:text-slate-500">Fuente: {ev.source}</span>}
                    {ev.reference && <span className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[200px]">Ref: {ev.reference}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(ev)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteConfirm(ev.id)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingEvidence ? 'Editar evidencia' : 'Nueva evidencia'} maxWidth="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título *</label>
            <input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" maxLength={150} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none" maxLength={500} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as EvidenceType }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
                {Object.entries(EVIDENCE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estado</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as EvidenceStatus }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
                {Object.entries(EVIDENCE_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Proyecto asociado</label>
              <select value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Ninguno</option>
                {store.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fuente</label>
              <input type="text" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" maxLength={100} placeholder="Ej: GitHub, local, manual" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Referencia</label>
            <input type="text" value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" maxLength={200} placeholder="URL, commit hash, ID de incidencia..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hash (opcional, preparado para futuras verificaciones)</label>
            <input type="text" value={form.hash} onChange={e => setForm(f => ({ ...f, hash: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs" maxLength={128} placeholder="SHA-256..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium">{editingEvidence ? 'Guardar' : 'Registrar'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)} title="Eliminar evidencia" message="¿Estás seguro de que deseas eliminar esta evidencia? Esta acción no se puede deshacer." />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
