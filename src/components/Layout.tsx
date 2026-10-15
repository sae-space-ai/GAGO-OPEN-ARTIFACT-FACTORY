import React, { useState } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, ListTodo, Package, Shield, Terminal, Settings, Link2, Menu, X, Target, ShieldCheck, Zap, Wrench, Brain, Gift } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Centro de Mando', section: 'Principal' },
  { to: '/projects', icon: FolderKanban, label: 'Proyectos', section: 'Gestión' },
  { to: '/tasks', icon: ListTodo, label: 'Tareas', section: 'Gestión' },
  { to: '/artifacts', icon: Package, label: 'Artefactos', section: 'Gestión' },
  { to: '/evidence', icon: Shield, label: 'Evidencias', section: 'Gestión' },
  { to: '/scope', icon: Target, label: 'Matriz de Alcance', section: 'Calidad' },
  { to: '/gates', icon: ShieldCheck, label: 'Quality Gates', section: 'Calidad' },
  { to: '/approval', icon: ShieldCheck, label: 'Approval Engine', section: 'Calidad' },
  { to: '/joule', icon: Zap, label: 'JOULE Engine', section: 'JOULE' },
  { to: '/joule-cognitive', icon: Brain, label: 'JOULE Cognitive', section: 'JOULE' },
  { to: '/training', icon: Target, label: 'Training Center', section: 'JOULE' },
  { to: '/tools', icon: Wrench, label: 'Tool Factory', section: 'Herramientas' },
  { to: '/models', icon: Brain, label: 'Model Registry', section: 'Herramientas' },
  { to: '/qwen', icon: Terminal, label: 'Qwen Generator', section: 'Herramientas' },
  { to: '/api-fabric', icon: Link2, label: 'API Fabric', section: 'Integraciones' },
  { to: '/connections', icon: Link2, label: 'Conexiones', section: 'Integraciones' },
  { to: '/ai-providers', icon: Brain, label: 'AI Providers', section: 'Integraciones' },
  { to: '/integrations', icon: Link2, label: 'Integraciones', section: 'Integraciones' },
  { to: '/free-training', icon: Gift, label: 'Free Training', section: 'Entrenamiento' },
  { to: '/settings', icon: Settings, label: 'Configuración', section: 'Sistema' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const currentPage = navItems.find(item => item.to === location.pathname)?.label || 'GAGO Factory';

  // Agrupar items por sección
  const sections = navItems.reduce((acc, item) => {
    const section = item.section || 'Otros';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  return (
    <div className="ca-app-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`ca-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="ca-sidebar-header">
          <Link to="/civilizacion" className="ca-sidebar-brand hover:opacity-80 transition-opacity">
            <div className="ca-sidebar-logo">CA</div>
            <div>
              <div className="ca-sidebar-title">Civilización</div>
              <div className="ca-sidebar-subtitle">Algorítmica</div>
            </div>
          </Link>
          <button 
            className="ml-auto lg:hidden p-1 rounded hover:bg-[var(--ca-color-bg-tertiary)] transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5 text-[var(--ca-color-text-secondary)]" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="ca-sidebar-nav ca-scrollbar">
          {Object.entries(sections).map(([section, items]) => (
            <div key={section} className="ca-nav-section">
              <div className="ca-nav-section-title">{section}</div>
              {items.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={`ca-nav-item ${isActive ? 'active' : ''}`}
                  >
                    <item.icon className="ca-nav-item-icon" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--ca-color-border)]">
          <div className="text-xs text-[var(--ca-color-text-tertiary)]">
            GAGO Open Artifact Factory
          </div>
          <div className="text-xs text-[var(--ca-color-text-tertiary)]">
            v12.1.0
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="ca-main-content">
        {/* Top Navigation */}
        <header className="ca-top-nav">
          <div className="ca-top-nav-left">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-[var(--ca-color-bg-tertiary)] transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6 text-[var(--ca-color-text-secondary)]" />
            </button>

            {/* Breadcrumb */}
            <nav className="ca-breadcrumb">
              <NavLink to="/" className="ca-breadcrumb-item hover:text-[var(--ca-color-text-primary)] transition-colors">
                Inicio
              </NavLink>
              <span className="ca-breadcrumb-separator">/</span>
              <span className="ca-breadcrumb-current">{currentPage}</span>
            </nav>
          </div>

          <div className="ca-top-nav-right">
            {/* Status indicator */}
            <div className="ca-status-indicator ca-status-info">
              <span className="w-2 h-2 rounded-full bg-current"></span>
              <span className="hidden sm:inline">Sistema Operativo</span>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="ca-page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
