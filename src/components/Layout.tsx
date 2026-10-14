import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, ListTodo, Package, Shield, Terminal,
  Settings, Link2, Menu, X, Target, ShieldCheck, Zap, Wrench, Brain,
  Gift, Orbit, ChevronRight, Moon, Sun, Activity, CircleDot, Layers3
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import '../styles/civilizacion-ecosystem.css';

type NavigationItem = { to: string; label: string; icon: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }> };
type NavigationGroup = { heading: string; items: NavigationItem[] };

const navGroups: NavigationGroup[] = [
  {
    heading: 'VISIÓN GENERAL',
    items: [
      { to: '/civilizacion-algoritmica', icon: Orbit, label: 'Civilización Algorítmica' },
      { to: '/', icon: LayoutDashboard, label: 'Visión global' },
      { to: '/dashboard', icon: Activity, label: 'Centro de mando' },
    ]
  },
  {
    heading: 'CREACIÓN',
    items: [
      { to: '/projects', icon: FolderKanban, label: 'Proyectos' },
      { to: '/tasks', icon: ListTodo, label: 'Tareas' },
      { to: '/artifacts', icon: Package, label: 'Artefactos' },
      { to: '/tools', icon: Wrench, label: 'Tool Factory' },
      { to: '/qwen', icon: Terminal, label: 'Órdenes Qwen' },
    ]
  },
  {
    heading: 'INTELIGENCIA',
    items: [
      { to: '/joule', icon: Zap, label: 'JOULE Engine' },
      { to: '/joule-cognitive', icon: Brain, label: 'JOULE Cognitive' },
      { to: '/training', icon: Target, label: 'Training Center' },
      { to: '/models', icon: Layers3, label: 'Model Registry' },
      { to: '/ai-providers', icon: Brain, label: 'AI Providers' },
      { to: '/free-training', icon: Gift, label: 'Free Training' },
    ]
  },
  {
    heading: 'GOBERNANZA',
    items: [
      { to: '/evidence', icon: Shield, label: 'Evidencias' },
      { to: '/gates', icon: ShieldCheck, label: 'Puertas de calidad' },
      { to: '/approval', icon: ShieldCheck, label: 'Approval Engine' },
      { to: '/scope', icon: Target, label: 'Matriz de alcance' },
    ]
  },
  {
    heading: 'INFRAESTRUCTURA',
    items: [
      { to: '/api-fabric', icon: Link2, label: 'API Fabric' },
      { to: '/connections', icon: Link2, label: 'Conexiones' },
      { to: '/integrations', icon: Link2, label: 'Integraciones' },
      { to: '/settings', icon: Settings, label: 'Configuración' },
    ]
  }
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { store } = useData();
  const allItems = navGroups.flatMap(group => group.items);
  const page = allItems.find(item => item.to === location.pathname);
  const group = navGroups.find(group => group.items.some(item => item.to === location.pathname));
  const isBrandLanding = location.pathname === '/civilizacion-algoritmica';
  const mode = store.jouleState?.enabled ? store.jouleState.mode : 'disabled';
  const modeName = mode === 'shadow' ? 'SHADOW' : mode === 'canary' ? 'CANARY' :
    mode === 'active' ? 'ACTIVO' : 'DESACTIVADO';

  return (
    <div className="ca-platform" data-ca-experience="ecosystem">
      {sidebarOpen && <button type="button" aria-label="Cerrar menú" className="ca-mobile-scrim" onClick={() => setSidebarOpen(false)} />}
      <aside className={'ca-sidebar '+(sidebarOpen ? 'ca-sidebar-open' : '')} aria-label="Navegación principal">
        <div className="ca-sidebar-brand">
          <Link to="/civilizacion-algoritmica" onClick={() => setSidebarOpen(false)} className="ca-sidebar-signature" aria-label="Civilización Algorítmica — portada">
            <span className="ca-sidebar-emblem"><CircleDot size={22} strokeWidth={1.45} /></span>
            <span className="ca-brand-lockup"><strong>CIVILIZACIÓN</strong><strong>ALGORÍTMICA<span className="ca-brand-period">.</span></strong><small>GAGO OPEN ARTIFACT FACTORY</small></span>
          </Link>
          <button type="button" className="ca-sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Cerrar navegación"><X size={20}/></button>
        </div>
        <div className="ca-sidebar-tagline"><span className="ca-sidebar-star">✳</span> INTELIGENCIA · SOBERANÍA · EVIDENCIA</div>
        <nav className="ca-nav">
          {navGroups.map(section => (
            <div key={section.heading} className="ca-nav-group">
              <p className="ca-nav-heading">{section.heading}</p>
              {section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => 'ca-nav-link'+(isActive ? ' ca-nav-active' : '')}
                >
                  <item.icon className="ca-nav-icon" size={17} strokeWidth={1.7}/>
                  <span>{item.label}</span>
                  <ChevronRight size={14} className="ca-nav-chevron"/>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="ca-sidebar-footer">
          <div className="ca-sidebar-foot-head"><span className="ca-sidebar-foot-led"/><span>CONTROL RESPONSABLE</span></div>
          <span>Humanos al mando. Evidencia antes que afirmaciones.</span>
          <Link to="/gates" onClick={() => setSidebarOpen(false)}>Ver garantías <ChevronRight size={13}/></Link>
        </div>
      </aside>

      <div className="ca-workspace">
        <header className="ca-topbar">
          <div className="ca-topbar-left">
            <button type="button" className="ca-menu-trigger" onClick={() => setSidebarOpen(true)} aria-label="Abrir navegación"><Menu size={21}/></button>
            <div className="ca-topbar-titles">
              <p className="ca-topbar-breadcrumb">{group?.heading ?? 'CIVILIZACIÓN ALGORÍTMICA'} <span>/</span> GAGO FACTORY</p>
              <h1>{page?.label ?? 'Factoría de artefactos'}</h1>
            </div>
          </div>
          <div className="ca-topbar-actions">
            <Link to="/joule" className="ca-topbar-joule" title="Ver el estado de JOULE"><span className={'ca-joule-signal '+(mode==='disabled'?'ca-joule-inactive':'')}/><span>JOULE <b>{modeName}</b></span></Link>
            <button type="button" className="ca-theme-switch" onClick={toggleTheme} aria-label={theme==='dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'} title={theme==='dark' ? 'Modo claro' : 'Modo oscuro'}>{theme==='dark' ? <Sun size={17}/> : <Moon size={17}/>}</button>
            <Link to="/civilizacion-algoritmica" className="ca-topbar-mark" title="Ir al portal Civilización Algorítmica"><Orbit size={20} strokeWidth={1.45}/></Link>
          </div>
        </header>
        <main className={'ca-main '+(isBrandLanding?'ca-main-landing':'')} id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
