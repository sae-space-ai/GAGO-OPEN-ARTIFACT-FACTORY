import React from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { 
  FolderKanban, 
  ListTodo, 
  Package, 
  Shield, 
  Wrench, 
  Target, 
  Zap, 
  Brain,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { PageHeader, Card, MetricCard, StatusIndicator } from '../components/ca';

export default function GlobalOverview() {
  const { store } = useData();

  // Calcular métricas reales
  const metrics = {
    projects: store.projects?.length || 0,
    tasks: store.tasks?.length || 0,
    artifacts: store.artifacts?.length || 0,
    evidence: store.evidence?.length || 0,
    tools: store.tools?.length || 0,
    scopeRequirements: store.scopeMatrix?.length || 0,
    qualityGates: store.qualityGates?.length || 0,
    jouleEnabled: store.jouleState?.enabled || false,
    agents: store.jouleMATS ? Object.keys(store.jouleMATS.agents).length : 0,
    activeConnections: store.apiFabricState?.connectors?.filter((c: any) => 
      c.status === 'connected' || c.status === 'verified'
    ).length || 0
  };

  // Tareas pendientes
  const pendingTasks = store.tasks?.filter(t => t.status === 'pending' || t.status === 'in_progress') || [];
  
  // Errores recientes
  const recentErrors = store.qualityGates?.filter(g => g.status === 'failed') || [];

  return (
    <div>
      <PageHeader 
        title="Global Overview" 
        subtitle="Centro de mando general de GAGO Open Artifact Factory"
      />

      {/* Métricas principales */}
      <div className="ca-grid ca-grid-cols-2 md:ca-grid-cols-4 lg:ca-grid-cols-5 mb-8">
        <MetricCard 
          label="Proyectos" 
          value={metrics.projects} 
          icon={<FolderKanban className="w-6 h-6" />}
        />
        <MetricCard 
          label="Tareas" 
          value={metrics.tasks} 
          icon={<ListTodo className="w-6 h-6" />}
        />
        <MetricCard 
          label="Artefactos" 
          value={metrics.artifacts} 
          icon={<Package className="w-6 h-6" />}
        />
        <MetricCard 
          label="Evidencias" 
          value={metrics.evidence} 
          icon={<Shield className="w-6 h-6" />}
        />
        <MetricCard 
          label="Herramientas" 
          value={metrics.tools} 
          icon={<Wrench className="w-6 h-6" />}
        />
        <MetricCard 
          label="Requisitos" 
          value={metrics.scopeRequirements} 
          icon={<Target className="w-6 h-6" />}
        />
        <MetricCard 
          label="Quality Gates" 
          value={metrics.qualityGates} 
          icon={<Shield className="w-6 h-6" />}
        />
        <MetricCard 
          label="Agentes" 
          value={metrics.agents} 
          icon={<Brain className="w-6 h-6" />}
        />
        <MetricCard 
          label="Conexiones" 
          value={metrics.activeConnections} 
          icon={<Zap className="w-6 h-6" />}
        />
        <MetricCard 
          label="JOULE" 
          value={metrics.jouleEnabled ? 'ON' : 'OFF'} 
          icon={<Brain className="w-6 h-6" />}
        />
      </div>

      {/* Acciones rápidas */}
      <div className="mb-8">
        <h2 className="text-[var(--ca-text-2xl)] font-bold text-[var(--ca-color-text-primary)] mb-4" style={{ fontFamily: 'var(--ca-font-serif)' }}>
          Acciones Rápidas
        </h2>
        <div className="ca-grid ca-grid-cols-1 md:ca-grid-cols-3">
          <Link to="/projects/new" className="ca-card hover:border-[var(--ca-color-accent-primary)] transition-all cursor-pointer block">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--ca-color-accent-primary)]/10 rounded-lg">
                <FolderKanban className="h-6 w-6 text-[var(--ca-color-accent-primary)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--ca-color-text-primary)]">Nuevo Proyecto</h3>
                <p className="text-sm text-[var(--ca-color-text-secondary)]">Crear un proyecto</p>
              </div>
            </div>
          </Link>

          <Link to="/training" className="ca-card hover:border-[var(--ca-color-accent-primary)] transition-all cursor-pointer block">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--ca-color-accent-secondary)]/10 rounded-lg">
                <Brain className="h-6 w-6 text-[var(--ca-color-accent-secondary)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--ca-color-text-primary)]">Entrenar Agentes</h3>
                <p className="text-sm text-[var(--ca-color-text-secondary)]">Iniciar ciclo de entrenamiento</p>
              </div>
            </div>
          </Link>

          <Link to="/joule" className="ca-card hover:border-[var(--ca-color-accent-primary)] transition-all cursor-pointer block">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--ca-color-success)]/10 rounded-lg">
                <Zap className="h-6 w-6 text-[var(--ca-color-success)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--ca-color-text-primary)]">Configurar JOULE</h3>
                <p className="text-sm text-[var(--ca-color-text-secondary)]">Administrar motor</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Tareas pendientes */}
      {pendingTasks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-[var(--ca-text-2xl)] font-bold text-[var(--ca-color-text-primary)] mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--ca-font-serif)' }}>
            <ListTodo className="h-5 w-5 text-[var(--ca-color-accent-primary)]" />
            Tareas Pendientes ({pendingTasks.length})
          </h2>
          <Card>
            <div className="divide-y divide-[var(--ca-color-border)]">
              {pendingTasks.slice(0, 5).map((task: any) => (
                <div key={task.id} className="p-4 hover:bg-[var(--ca-color-bg-tertiary)] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[var(--ca-color-text-primary)]">{task.title}</p>
                      <p className="text-sm text-[var(--ca-color-text-secondary)]">{task.description}</p>
                    </div>
                    <StatusIndicator 
                      status={task.status === 'pending' ? 'warning' : 'info'}
                      label={task.status === 'pending' ? 'Pendiente' : 'En Progreso'}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
          {pendingTasks.length > 5 && (
            <div className="mt-3 text-center">
              <Link to="/tasks" className="text-sm text-[var(--ca-color-accent-primary)] hover:underline">
                Ver todas las tareas →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Errores recientes */}
      {recentErrors.length > 0 && (
        <div className="mb-8">
          <h2 className="text-[var(--ca-text-2xl)] font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--ca-font-serif)', color: 'var(--ca-color-error)' }}>
            <AlertCircle className="h-5 w-5" />
            Errores Recientes ({recentErrors.length})
          </h2>
          <div className="ca-card" style={{ borderColor: 'var(--ca-color-error)' }}>
            <div className="divide-y divide-[var(--ca-color-error)]/20">
              {recentErrors.slice(0, 3).map((gate: any) => (
                <div key={gate.id} className="p-4 bg-[var(--ca-color-error)]/5">
                  <p className="font-medium text-[var(--ca-color-text-primary)]">{gate.name}</p>
                  <p className="text-sm text-[var(--ca-color-text-secondary)]">{gate.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 text-center">
            <Link to="/gates" className="text-sm hover:underline" style={{ color: 'var(--ca-color-error)' }}>
              Ver todos los Quality Gates →
            </Link>
          </div>
        </div>
      )}

      {/* Estado del sistema */}
      <div>
        <h2 className="text-[var(--ca-text-2xl)] font-bold text-[var(--ca-color-text-primary)] mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--ca-font-serif)' }}>
          <TrendingUp className="h-5 w-5 text-[var(--ca-color-accent-primary)]" />
          Estado del Sistema
        </h2>
        <div className="ca-grid ca-grid-cols-1 md:ca-grid-cols-2">
          <Card title="Módulos Activos">
            <ul className="space-y-2 text-sm text-[var(--ca-color-text-secondary)]">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[var(--ca-color-success)]" />
                Gestión de Proyectos
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[var(--ca-color-success)]" />
                Gestión de Tareas
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[var(--ca-color-success)]" />
                Registro de Artefactos
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[var(--ca-color-success)]" />
                Registro de Evidencias
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[var(--ca-color-success)]" />
                Matriz de Alcance
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[var(--ca-color-success)]" />
                Quality Gates
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[var(--ca-color-success)]" />
                JOULE Engine
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[var(--ca-color-success)]" />
                JOULE MATS ({metrics.agents} Agentes)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[var(--ca-color-success)]" />
                API Fabric
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[var(--ca-color-success)]" />
                Connection Recovery
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[var(--ca-color-success)]" />
                Tool Factory
              </li>
            </ul>
          </Card>

          <Card title="Versión y Estado">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--ca-color-text-secondary)]">Versión:</span>
                <span className="font-medium text-[var(--ca-color-text-primary)]">12.2.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ca-color-text-secondary)]">Fase:</span>
                <span className="font-medium text-[var(--ca-color-text-primary)]">12.2 - CIVILIZACIÓN ALGORÍTMICA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ca-color-text-secondary)]">Esquema:</span>
                <span className="font-medium text-[var(--ca-color-text-primary)]">12.2.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ca-color-text-secondary)]">Presupuesto:</span>
                <StatusIndicator status="success" label="0 EUR" />
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ca-color-text-secondary)]">Seguridad:</span>
                <StatusIndicator status="success" label="Activa" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
