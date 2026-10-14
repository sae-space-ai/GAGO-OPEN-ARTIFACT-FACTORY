import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Modal, ConfirmDialog, EmptyState, StatusBadge, PriorityBadge, Toast } from '../components/UI';
import { Plus, Search, Edit2, Trash2, Archive, FolderKanban } from 'lucide-react';
import type { Project, ProjectStatus, ProjectPriority } from '../types';
import { PROJECT_STATUS_LABELS, PRIORITY_LABELS } from '../types';

export default function Projects() {
  const { store, addProject, editProject, removeProject } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState({ name: '', description: '', status: 'planning' as ProjectStatus, priority: 'medium' as ProjectPriority });

  const filtered = store.projects
    .filter(p => statusFilter === 'all' || (statusFilter === 'active' ? !p.archived : p.status === statusFilter))
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()));

  function openCreate() {
    setEditingProject(null);
    setForm({ name: '', description: '', status: 'planning', priority: 'medium' });
    setModalOpen(true);
  }

  function openEdit(project: Project) {
    setEditingProject(project);
    setForm({ name: project.name, description: project.description, status: project.status, priority: project.priority });
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (editingProject) {
      editProject(editingProject.id, form);
      setToast({ message: 'Proyecto actualizado', type: 'success' });
    } else {
      addProject(form);
      setToast({ message: 'Proyecto creado', type: 'success' });
    }
    setModalOpen(false);
  }

  function handleArchive(project: Project) {
    editProject(project.id, { archived: !project.archived, status: project.archived ? 'planning' : 'archived' });
    setToast({ message: project.archived ? 'Proyecto restaurado' : 'Proyecto archivado', type: 'success' });
  }

  function handleDelete(id: string) {
    removeProject(id);
    setToast({ message: 'Proyecto eliminado', type: 'success' });
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar proyectos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          {Object.entries(PROJECT_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Nuevo
        </button>
      </div>

      {/* Project list */}
      {filtered.length === 0 ? (
        <EmptyState icon={FolderKanban} title="Sin proyectos" description="Crea tu primer proyecto para comenzar a organizar tu trabajo." action={<button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"><Plus className="w-4 h-4" /> Crear proyecto</button>} />
      ) : (
        <div className="grid gap-3">
          {filtered.map(project => (
            <div key={project.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{project.name}</h3>
                    {project.archived && <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500">Archivado</span>}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">{project.description || 'Sin descripción'}</p>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={project.status} label={PROJECT_STATUS_LABELS[project.status]} />
                    <PriorityBadge priority={project.priority} label={PRIORITY_LABELS[project.priority]} />
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(project.updatedAt).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(project)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400" title="Editar">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleArchive(project)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400" title={project.archived ? 'Restaurar' : 'Archivar'}>
                    <Archive className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteConfirm(project.id)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-red-600 dark:hover:text-red-400" title="Eliminar">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingProject ? 'Editar proyecto' : 'Nuevo proyecto'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre *</label>
            <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" maxLength={100} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none" maxLength={500} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estado</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ProjectStatus }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
                {Object.entries(PROJECT_STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prioridad</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as ProjectPriority }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
                {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium">{editingProject ? 'Guardar' : 'Crear'}</button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)} title="Eliminar proyecto" message="¿Estás seguro de que deseas eliminar este proyecto? Se eliminarán también sus tareas y artefactos asociados. Esta acción no se puede deshacer." />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
