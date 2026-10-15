import React from 'react';
import { useLocation, Link } from 'react-router-dom';

interface TopNavigationProps {
  onMenuToggle: () => void;
}

// Mapeo de rutas a nombres de página
const pageNames: Record<string, string> = {
  '/': 'Centro de Mando',
  '/dashboard': 'Dashboard',
  '/projects': 'Proyectos',
  '/tasks': 'Tareas',
  '/artifacts': 'Artefactos',
  '/evidence': 'Evidencias',
  '/scope': 'Matriz de Alcance',
  '/gates': 'Quality Gates',
  '/approval': 'Approval Engine',
  '/joule': 'JOULE Engine',
  '/joule-cognitive': 'JOULE Cognitive',
  '/training': 'Training Center',
  '/tools': 'Tool Factory',
  '/models': 'Model Registry',
  '/qwen': 'Qwen Generator',
  '/api-fabric': 'API Fabric',
  '/connections': 'Conexiones',
  '/ai-providers': 'AI Providers',
  '/integrations': 'Integraciones',
  '/free-training': 'Free Training',
  '/settings': 'Configuración',
};

export const TopNavigation: React.FC<TopNavigationProps> = ({ onMenuToggle }) => {
  const location = useLocation();
  const currentPage = pageNames[location.pathname] || 'Página';

  return (
    <header className="ca-top-nav">
      {/* Left side */}
      <div className="ca-top-nav-left">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-[var(--ca-color-bg-tertiary)] transition-colors"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Breadcrumb */}
        <nav className="ca-breadcrumb">
          <Link to="/" className="ca-breadcrumb-item hover:text-[var(--ca-color-text-primary)] transition-colors">
            Inicio
          </Link>
          <span className="ca-breadcrumb-separator">/</span>
          <span className="ca-breadcrumb-current">{currentPage}</span>
        </nav>
      </div>

      {/* Right side */}
      <div className="ca-top-nav-right">
        {/* Theme toggle placeholder */}
        <button
          className="ca-button ca-button-ghost"
          aria-label="Toggle theme"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </button>

        {/* Status indicator placeholder */}
        <div className="ca-status-indicator ca-status-info">
          <span className="w-2 h-2 rounded-full bg-current"></span>
          <span>Sistema Operativo</span>
        </div>
      </div>
    </header>
  );
};
