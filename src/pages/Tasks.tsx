import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Modal, ConfirmDialog, EmptyState, StatusBadge, PriorityBadge, Toast } from '../components/UI';
import { Plus, Search, Edit2, Trash2, ListTodo } from 'lucide-react';
import type { Task, TaskStatus, TaskPriority } from '../types';
import { TASK_STATUS_LABELS, PRIORITY_LABELS } from '../types';

export default function Tasks() {
  const { store, addTask, editTask, removeTask } = useData();
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState({ projectId: '', title: '', description: '', priority: 'medium' as TaskPriority, status: 'pending' as TaskStatus, isAutomated: false, dueDate: '' });

  const filtered = store.tasks
    .filter(t => projectFilter === 'all' || t.projectId === projectFilter)
    .filter(t => statusFilter === 'all' || t.status === statusFilter)
    .filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()));

  function openCreate() {
    setEditingTask(null);
    setForm({ projectId: store.projects[0]?.id || '', title: '', description: '', priority: 'medium', status: 'pending', isAutomated: false, dueDate: '' });
    setModalOpen(true);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setForm({ projectId: task.projectId, title: task.title, description: task.description, priority: task.priority, status: task.status, isAutomated: task.isAutomated, dueDate: task.dueDate || '' });
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const data = { ...form, dueDate: form.dueDate || undefined };

    if (editingTask) {
      editTask(editingTask.id, data);
      setToast({ message: 'Tarea actualizada', type: 'success' });
    } else {
      addTask(data);
      setToast({ message: 'Tarea creada', type: 'success' });
    }
    setModalOpen(false);
  }

  function handleDelete(id: string) {
    removeTask(id);
    setToast({ message: 'Tarea eliminada', type: 'success' });
  }

  function getProjectName(id: string) {
    return store.projects.find(p => p.id === id)?.name || 'Sin proyecto';
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Buscar tareas..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
        </div>
        <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">Todos los proyectos</option>
          {store.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">Todos los estados</option>
          {Object.entries(TASK_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Nueva
        </button>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <EmptyState icon={ListTodo} title="Sin tareas" description="Crea tu primera tarea para comenzar a gestionar el trabajo." action={<button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"><Plus className="w-4 h-4" /> Crear tarea</button>} />
      ) : (
        <div className="grid gap-3">
          {filtered.map(task => (
            <div key={task.id} className={`bg-white dark:bg-slate-800 rounded-xl border p-4 hover:shadow-sm transition-shadow ${task.status === 'blocked' ? 'border-red-300 dark:border-red-800' : 'border-slate-200 dark:border-slate-700'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{task.title}</h3>
                    {task.isAutomated && <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-medium">IA</span>}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">{task.description || 'Sin descripción'}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={task.status} label={TASK_STATUS_LABELS[task.status]} />
                    <PriorityBadge priority={task.priority} label={PRIORITY_LABELS[task.priority]} />
                    <span className="text-xs text-slate-400 dark:text-slate-500">{getProjectName(task.projectId)}</span>
                    {task.dueDate && <span className="text-xs text-slate-400 dark:text-slate-500">Vence: {new Date(task.dueDate).toLocaleDateString('es-ES')}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(task)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-blue-600" title="Editar"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteConfirm(task.id)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-red-600" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingTask ? 'Editar tarea' : 'Nueva tarea'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Proyecto *</label>
            <select required value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Seleccionar proyecto</option>
              {store.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
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
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estado</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as TaskStatus }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
                {Object.entries(TASK_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prioridad</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as TaskPriority }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
                {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha límite</label>
            <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" checked={form.isAutomated} onChange={e => setForm(f => ({ ...f, isAutomated: e.target.checked }))} className="rounded border-slate-300 dark:border-slate-600" />
            Tarea prevista para ejecución automatizada (IA)
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium">{editingTask ? 'Guardar' : 'Crear'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)} title="Eliminar tarea" message="¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer." />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
