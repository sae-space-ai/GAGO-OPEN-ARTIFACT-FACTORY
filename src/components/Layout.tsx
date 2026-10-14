import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, ListTodo, Package, Shield, Terminal, Settings, Link2, Menu, X, Factory, Target, ShieldCheck, Zap } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Centro de Mando' },
  { to: '/projects', icon: FolderKanban, label: 'Proyectos' },
  { to: '/tasks', icon: ListTodo, label: 'Tareas' },
  { to: '/artifacts', icon: Package, label: 'Artefactos' },
  { to: '/evidence', icon: Shield, label: 'Evidencias' },
  { to: '/scope', icon: Target, label: 'Matriz de Alcance' },
  { to: '/gates', icon: ShieldCheck, label: 'Puertas de Calidad' },
  { to: '/joule', icon: Zap, label: 'JOULE' },
  { to: '/api-fabric', icon: Link2, label: 'API Fabric' },
  { to: '/connections', icon: Link2, label: 'Conexiones' },
  { to: '/training', icon: Target, label: 'Training Center' },
  { to: '/qwen', icon: Terminal, label: 'Órdenes Qwen' },
  { to: '/integrations', icon: Link2, label: 'Integraciones' },
  { to: '/settings', icon: Settings, label: 'Configuración' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const currentPage = navItems.find(item => item.to === location.pathname)?.label || 'GAGO Factory';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-200 dark:border-slate-700">
          <Factory className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">GAGO FACTORY</h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">v0.1.0</p>
          </div>
          <button className="ml-auto lg:hidden p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center gap-4 px-4 lg:px-6 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{currentPage}</h2>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden sm:inline text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">
              Sistema local activo
            </span>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
