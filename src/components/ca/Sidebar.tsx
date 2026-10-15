import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  path: string;
  label: string;
  icon?: React.ReactNode;
  section?: string;
}

const navigationItems: NavItem[] = [
  // Centro de Mando
  { path: '/', label: 'Centro de Mando', section: 'Principal' },
  { path: '/dashboard', label: 'Dashboard', section: 'Principal' },
  
  // Gestión
  { path: '/projects', label: 'Proyectos', section: 'Gestión' },
  { path: '/tasks', label: 'Tareas', section: 'Gestión' },
  { path: '/artifacts', label: 'Artefactos', section: 'Gestión' },
  { path: '/evidence', label: 'Evidencias', section: 'Gestión' },
  
  // Alcance y Calidad
  { path: '/scope', label: 'Matriz de Alcance', section: 'Calidad' },
  { path: '/gates', label: 'Quality Gates', section: 'Calidad' },
  { path: '/approval', label: 'Approval Engine', section: 'Calidad' },
  
  // JOULE
  { path: '/joule', label: 'JOULE Engine', section: 'JOULE' },
  { path: '/joule-cognitive', label: 'JOULE Cognitive', section: 'JOULE' },
  { path: '/training', label: 'Training Center', section: 'JOULE' },
  
  // Herramientas
  { path: '/tools', label: 'Tool Factory', section: 'Herramientas' },
  { path: '/models', label: 'Model Registry', section: 'Herramientas' },
  { path: '/qwen', label: 'Qwen Generator', section: 'Herramientas' },
  
  // Integraciones
  { path: '/api-fabric', label: 'API Fabric', section: 'Integraciones' },
  { path: '/connections', label: 'Conexiones', section: 'Integraciones' },
  { path: '/ai-providers', label: 'AI Providers', section: 'Integraciones' },
  { path: '/integrations', label: 'Integraciones', section: 'Integraciones' },
  
  // Entrenamiento
  { path: '/free-training', label: 'Free Training', section: 'Entrenamiento' },
  
  // Sistema
  { path: '/settings', label: 'Configuración', section: 'Sistema' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  
  // Agrupar items por sección
  const sections = navigationItems.reduce((acc, item) => {
    const section = item.section || 'Otros';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`ca-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="ca-sidebar-header">
          <div className="ca-sidebar-brand">
            <div className="ca-sidebar-logo">CA</div>
            <div>
              <div className="ca-sidebar-title">Civilización</div>
              <div className="ca-sidebar-subtitle">Algorítmica</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="ca-sidebar-nav ca-scrollbar">
          {Object.entries(sections).map(([section, items]) => (
            <div key={section} className="ca-nav-section">
              <div className="ca-nav-section-title">{section}</div>
              {items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`ca-nav-item ${isActive ? 'active' : ''}`}
                    onClick={onToggle}
                  >
                    {item.icon && <span className="ca-nav-item-icon">{item.icon}</span>}
                    <span>{item.label}</span>
                  </Link>
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
    </>
  );
};
