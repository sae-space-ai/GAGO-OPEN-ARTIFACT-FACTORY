import React from 'react';
import { useData } from '../context/DataContext';
import { FolderKanban, ListTodo, Package, Shield, Plus, Wifi, WifiOff, Database, Globe } from 'lucide-react';
import { getSystemStatus } from '../services/storage';
import { Link } from 'react-router-dom';
import { PROJECT_STATUS_LABELS, TASK_STATUS_LABELS } from '../types';

export default function Dashboard() {
  const { store } = useData();
  const system = getSystemStatus();

  const activeProjects = store.projects.filter(p => !p.archived);
  const pendingTasks = store.tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
  const completedTasks = store.tasks.filter(t => t.status === 'completed');
  const blockedTasks = store.tasks.filter(t => t.status === 'blocked');

  const stats = [
    { label: 'Proyectos activos', value: activeProjects.length, icon: FolderKanban, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', link: '/projects' },
    { label: 'Tareas pendientes', value: pendingTasks.length, icon: ListTodo, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', link: '/tasks' },
    { label: 'Tareas completadas', value: completedTasks.length, icon: ListTodo, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', link: '/tasks' },
    { label: 'Artefactos', value: store.artifacts.length, icon: Package, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', link: '/artifacts' },
    { label: 'Evidencias', value: store.evidence.length, icon: Shield, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20', link: '/evidence' },
  ];

  const recentActivity = [
    ...store.projects.map(p => ({ type: 'project' as const, name: p.name, date: p.updatedAt, status: PROJECT_STATUS_LABELS[p.status] })),
    ...store.tasks.slice(-5).map(t => ({ type: 'task' as const, name: t.title, date: t.updatedAt, status: TASK_STATUS_LABELS[t.status] })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link to="/projects?action=new" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Nuevo proyecto
        </Link>
        <Link to="/tasks?action=new" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 dark:bg-slate-600 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-500 text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Nueva tarea
        </Link>
        <Link to="/artifacts?action=new" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 dark:bg-slate-600 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-500 text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Nuevo artefacto
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map(stat => (
          <Link key={stat.label} to={stat.link} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Scope Matrix Quick View */}
      {store.scopeMatrix && store.scopeMatrix.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Matriz de Alcance — Fase 0.1</h3>
            <Link to="/scope" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Ver todo →</Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-center">
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{store.scopeMatrix.filter(r => !r.archived).length}</p>
              <p className="text-[10px] text-slate-500">Total</p>
            </div>
            <div>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">{store.scopeMatrix.filter(r => !r.archived && r.implementationStatus === 'implemented').length}</p>
              <p className="text-[10px] text-slate-500">Impl.</p>
            </div>
            <div>
              <p className="text-lg font-bold text-teal-600 dark:text-teal-400">{store.scopeMatrix.filter(r => !r.archived && r.testStatus === 'test_passed').length}</p>
              <p className="text-[10px] text-slate-500">Probados</p>
            </div>
            <div>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{store.scopeMatrix.filter(r => !r.archived && r.verificationStatus === 'fully_verified').length}</p>
              <p className="text-[10px] text-slate-500">Verif.</p>
            </div>
            <div>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">{store.scopeMatrix.filter(r => !r.archived && r.implementationStatus === 'blocked').length}</p>
              <p className="text-[10px] text-slate-500">Bloq.</p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {store.scopeMatrix.filter(r => !r.archived).length > 0
                  ? Math.round((store.scopeMatrix.filter(r => !r.archived && r.implementationStatus === 'implemented').length / store.scopeMatrix.filter(r => !r.archived).length) * 100)
                  : 0}%
              </p>
              <p className="text-[10px] text-slate-500">Avance</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent activity */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Actividad reciente</h3>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">No hay actividad registrada aún.</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full ${item.type === 'project' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                  <span className="text-slate-700 dark:text-slate-300 truncate flex-1">{item.name}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">{item.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System status */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Estado del sistema</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Database className="w-4 h-4" /> Almacenamiento local
              </span>
              <span className={`flex items-center gap-1.5 ${system.localStorage ? 'text-green-600 dark:text-green-400' : 'text-red-600'}`}>
                {system.localStorage ? <><Wifi className="w-3.5 h-3.5" /> Disponible</> : <><WifiOff className="w-3.5 h-3.5" /> No disponible</>}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Globe className="w-4 h-4" /> Conexión de red
              </span>
              <span className={`flex items-center gap-1.5 ${system.online ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {system.online ? <><Wifi className="w-3.5 h-3.5" /> En línea</> : <><WifiOff className="w-3.5 h-3.5" /> Sin conexión</>}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Shield className="w-4 h-4" /> GitHub
              </span>
              <span className="text-slate-500 dark:text-slate-500 text-xs">No configurado</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Globe className="w-4 h-4" /> Vercel
              </span>
              <span className="text-slate-500 dark:text-slate-500 text-xs">No configurado</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Package className="w-4 h-4" /> Qwen Coder
              </span>
              <span className="text-slate-500 dark:text-slate-500 text-xs">No conectado</span>
            </div>
          </div>
          {blockedTasks.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-xs font-medium text-red-700 dark:text-red-400">
                ⚠️ {blockedTasks.length} tarea{blockedTasks.length > 1 ? 's' : ''} bloqueada{blockedTasks.length > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
