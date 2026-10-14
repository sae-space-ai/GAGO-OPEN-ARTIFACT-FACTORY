import React from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { 
  FolderKanban, 
  ListTodo, 
  Package, 
  Shield, 
  Wrench, 
  Cpu, 
  Brain,
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Target,
  ShieldCheck,
  Link2
} from 'lucide-react';

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
  
  // Errores recientes (simulado - en producción vendría de observabilidad)
  const recentErrors = store.qualityGates?.filter(g => g.status === 'failed') || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Global Overview
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Centro de mando general de GAGO Open Artifact Factory
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
        <MetricCard
          icon={FolderKanban}
          label="Proyectos"
          value={metrics.projects}
          color="blue"
          link="/projects"
        />
        <MetricCard
          icon={ListTodo}
          label="Tareas"
          value={metrics.tasks}
          color="green"
          link="/tasks"
        />
        <MetricCard
          icon={Package}
          label="Artefactos"
          value={metrics.artifacts}
          color="purple"
          link="/artifacts"
        />
        <MetricCard
          icon={Shield}
          label="Evidencias"
          value={metrics.evidence}
          color="teal"
          link="/evidence"
        />
        <MetricCard
          icon={Wrench}
          label="Herramientas"
          value={metrics.tools}
          color="orange"
          link="/tools"
        />
        <MetricCard
          icon={Target}
          label="Requisitos"
          value={metrics.scopeRequirements}
          color="indigo"
          link="/scope"
        />
        <MetricCard
          icon={ShieldCheck}
          label="Quality Gates"
          value={metrics.qualityGates}
          color="cyan"
          link="/gates"
        />
        <MetricCard
          icon={Brain}
          label="Agentes"
          value={metrics.agents}
          color="pink"
          link="/training"
        />
        <MetricCard
          icon={Link2}
          label="Conexiones"
          value={metrics.activeConnections}
          color="emerald"
          link="/connections"
        />
        <MetricCard
          icon={Cpu}
          label="JOULE"
          value={metrics.jouleEnabled ? 'ON' : 'OFF'}
          color={metrics.jouleEnabled ? 'green' : 'slate'}
          link="/joule"
        />
      </div>

      {/* Acciones rápidas */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickAction
            icon={Wrench}
            title="Crear Herramienta"
            description="Genera una nueva herramienta digital"
            link="/tools"
            color="blue"
          />
          <QuickAction
            icon={Brain}
            title="Entrenar Agentes"
            description="Inicia un ciclo de entrenamiento"
            link="/training"
            color="purple"
          />
          <QuickAction
            icon={Cpu}
            title="Configurar JOULE"
            description="Administra el motor de optimización"
            link="/joule"
            color="green"
          />
        </div>
      </div>

      {/* Tareas pendientes */}
      {pendingTasks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <ListTodo className="w-5 h-5" />
            Tareas Pendientes ({pendingTasks.length})
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-200 dark:divide-slate-700">
            {pendingTasks.slice(0, 5).map((task: any) => (
              <div key={task.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{task.title}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{task.description}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    task.status === 'pending' 
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  }`}>
                    {task.status === 'pending' ? 'Pendiente' : 'En Progreso'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {pendingTasks.length > 5 && (
            <Link to="/tasks" className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Ver todas las tareas →
            </Link>
          )}
        </div>
      )}

      {/* Errores recientes */}
      {recentErrors.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            Errores Recientes ({recentErrors.length})
          </h2>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 divide-y divide-red-200 dark:divide-red-800">
            {recentErrors.slice(0, 3).map((gate: any) => (
              <div key={gate.id} className="p-4">
                <p className="font-medium text-red-900 dark:text-red-100">{gate.name}</p>
                <p className="text-sm text-red-700 dark:text-red-300">{gate.description}</p>
              </div>
            ))}
          </div>
          <Link to="/gates" className="mt-3 text-sm text-red-600 dark:text-red-400 hover:underline">
            Ver todos los Quality Gates →
          </Link>
        </div>
      )}

      {/* Estado del sistema */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Estado del Sistema
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Módulos Activos
            </h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>✓ Gestión de Proyectos</li>
              <li>✓ Gestión de Tareas</li>
              <li>✓ Registro de Artefactos</li>
              <li>✓ Registro de Evidencias</li>
              <li>✓ Matriz de Alcance</li>
              <li>✓ Quality Gates</li>
              <li>✓ JOULE Engine</li>
              <li>✓ JOULE MATS (15 Agentes)</li>
              <li>✓ API Fabric</li>
              <li>✓ Connection Recovery</li>
              <li>✓ Tool Factory</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Versión y Estado
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Versión:</span>
                <span className="font-medium text-slate-900 dark:text-white">5.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Fase:</span>
                <span className="font-medium text-slate-900 dark:text-white">5 - Control Plane</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Esquema:</span>
                <span className="font-medium text-slate-900 dark:text-white">5.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Presupuesto:</span>
                <span className="font-medium text-green-600 dark:text-green-400">0 EUR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Seguridad:</span>
                <span className="font-medium text-green-600 dark:text-green-400">Activa</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar para tarjetas de métricas
function MetricCard({ icon: Icon, label, value, color, link }: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
  link: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    teal: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    cyan: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
    pink: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    slate: 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
  };

  return (
    <Link
      to={link}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition-shadow"
    >
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </Link>
  );
}

// Componente auxiliar para acciones rápidas
function QuickAction({ icon: Icon, title, description, link, color }: {
  icon: React.ElementType;
  title: string;
  description: string;
  link: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    green: 'bg-green-600 hover:bg-green-700'
  };

  return (
    <Link
      to={link}
      className={`${colorClasses[color]} text-white rounded-xl p-5 hover:shadow-lg transition-all`}
    >
      <Icon className="w-8 h-8 mb-3" />
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className="text-sm opacity-90">{description}</p>
    </Link>
  );
}
