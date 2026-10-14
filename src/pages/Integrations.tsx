import React from 'react';
import { Github, Globe, Terminal, Cpu, AlertTriangle, CheckCircle2, Clock, Wrench } from 'lucide-react';

interface Integration {
  name: string;
  icon: React.ElementType;
  description: string;
  status: 'prepared' | 'pending' | 'configured' | 'verified';
  statusLabel: string;
  details: string;
}

const integrations: Integration[] = [
  {
    name: 'GitHub',
    icon: Github,
    description: 'Control de versiones y colaboración',
    status: 'prepared',
    statusLabel: 'Infraestructura preparada',
    details: 'El repositorio está preparado para GitHub. El workflow de CI está configurado. No existe integración activa con la API de GitHub desde la aplicación.',
  },
  {
    name: 'Vercel',
    icon: Globe,
    description: 'Despliegue web estático',
    status: 'prepared',
    statusLabel: 'Infraestructura preparada',
    details: 'La aplicación está configurada para desplegarse en Vercel como sitio estático. vercel.json está presente. No existe integración con la API de Vercel desde la aplicación.',
  },
  {
    name: 'Qwen Coder',
    icon: Terminal,
    description: 'Modelo de inteligencia artificial para desarrollo',
    status: 'pending',
    statusLabel: 'Integración pendiente',
    details: 'Qwen Coder es la herramienta principal de desarrollo prevista. En la Fase Cero no se consume su API. El generador de órdenes produce instrucciones locales que deben copiarse manualmente. La integración real se implementará en la Fase Uno mediante un backend seguro.',
  },
  {
    name: 'JOULE',
    icon: Cpu,
    description: 'Motor propio de optimización y coordinación',
    status: 'pending',
    statusLabel: 'Integración futura',
    details: 'JOULE está previsto como componente propio para optimización y coordinación de recursos computacionales. No existe interfaz técnica verificable en esta fase. No se le atribuyen funcionalidades de ejecución que no estén implementadas.',
  },
];

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  prepared: { color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800', icon: Wrench },
  pending: { color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', icon: Clock },
  configured: { color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800', icon: CheckCircle2 },
  verified: { color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', icon: CheckCircle2 },
};

export default function Integrations() {
  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-slate-500 dark:text-slate-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Estado real de integraciones</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Esta página muestra el estado real de cada integración. Ninguna conexión se declara como operativa si no ha sido comprobada técnicamente.
            Disponer de archivos de configuración no equivale a tener una integración funcional con las APIs correspondientes.
          </p>
        </div>
      </div>

      {/* Integration cards */}
      <div className="grid gap-4">
        {integrations.map(integration => {
          const config = statusConfig[integration.status];
          const StatusIcon = config.icon;
          return (
            <div key={integration.name} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <integration.icon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">{integration.name}</h3>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {integration.statusLabel}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{integration.description}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed">{integration.details}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Leyenda de estados</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-slate-600 dark:text-slate-400"><strong>Infraestructura preparada:</strong> Archivos de configuración presentes, sin conexión activa</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-slate-600 dark:text-slate-400"><strong>Integración pendiente:</strong> Preparada para implementarse en fases futuras</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-slate-600 dark:text-slate-400"><strong>Integración configurada:</strong> Credenciales y parámetros establecidos</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-600 dark:text-slate-400"><strong>Integración verificada:</strong> Conexión comprobada y funcional</span>
          </div>
        </div>
      </div>
    </div>
  );
}
