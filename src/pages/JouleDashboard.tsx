import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Toast } from '../components/UI';
import {
  jouleActivate,
  jouleDeactivate,
  jouleEngageKillSwitch,
  jouleDisengageKillSwitch,
  jouleGetMetrics,
} from '../services/joule';
import type { JouleMode } from '../types/joule';
import { JOULE_MODE_LABELS, JOULE_DECISION_STATUS_LABELS, JOULE_CATEGORY_LABELS } from '../types/joule';
import { Activity, Power, PowerOff, AlertTriangle, Shield, TrendingUp, Clock, CheckCircle, XCircle, Zap } from 'lucide-react';

export default function JouleDashboard() {
  const { store, updateJouleState } = useData();
  const jouleState = store.jouleState;
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  if (!jouleState) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500 dark:text-slate-400">Estado de JOULE no disponible.</p>
      </div>
    );
  }

  const metrics = jouleGetMetrics(jouleState);

  function handleActivate(mode: JouleMode) {
    if (!jouleState) return;
    const newState = jouleActivate(jouleState, mode);
    updateJouleState(newState);
    setToast({ message: `JOULE activado en modo ${JOULE_MODE_LABELS[mode]}`, type: 'success' });
  }

  function handleDeactivate() {
    if (!jouleState) return;
    const newState = jouleDeactivate(jouleState);
    updateJouleState(newState);
    setToast({ message: 'JOULE desactivado. Aplicación usando ruta de referencia.', type: 'info' });
  }

  function handleKillSwitch() {
    if (!jouleState) return;
    const reason = prompt('Motivo para activar el Kill Switch:');
    if (reason) {
      const newState = jouleEngageKillSwitch(jouleState, reason);
      updateJouleState(newState);
      setToast({ message: 'Kill Switch activado. JOULE bloqueado.', type: 'error' });
    }
  }

  function handleDisengageKillSwitch() {
    if (!jouleState) return;
    const newState = jouleDisengageKillSwitch(jouleState);
    updateJouleState(newState);
    setToast({ message: 'Kill Switch desactivado.', type: 'success' });
  }

  const recentDecisions = jouleState.decisions.slice(-10).reverse();
  const recentMeasurements = jouleState.measurements.slice(-10).reverse();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              jouleState.enabled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-slate-100 dark:bg-slate-700'
            }`}>
              <Zap className={`w-6 h-6 ${jouleState.enabled ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">JOULE</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Adaptive Resource Optimization Engine v{jouleState.version}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {jouleState.enabled ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                <Activity className="w-3.5 h-3.5" />
                {JOULE_MODE_LABELS[jouleState.mode]}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium">
                <PowerOff className="w-3.5 h-3.5" />
                Desactivado
              </span>
            )}
          </div>
        </div>

        {/* Kill Switch Warning */}
        {jouleState.killSwitchEngaged && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-300">Kill Switch Activado</p>
                <p className="text-xs text-red-700 dark:text-red-400 mt-1">{jouleState.killSwitchReason}</p>
                <button
                  onClick={handleDisengageKillSwitch}
                  className="mt-2 px-3 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700"
                >
                  Desactivar Kill Switch
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          {!jouleState.enabled && !jouleState.killSwitchEngaged && (
            <>
              <button onClick={() => handleActivate('shadow')} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
                Activar Shadow
              </button>
              <button onClick={() => handleActivate('canary')} className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700">
                Activar Canary
              </button>
              <button onClick={() => handleActivate('active')} className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700">
                Activar Activo
              </button>
            </>
          )}
          {jouleState.enabled && !jouleState.killSwitchEngaged && (
            <button onClick={handleDeactivate} className="px-4 py-2 rounded-lg bg-slate-600 text-white text-sm font-medium hover:bg-slate-700">
              Desactivar
            </button>
          )}
          {!jouleState.killSwitchEngaged && (
            <button onClick={handleKillSwitch} className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20">
              Kill Switch
            </button>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        <MetricCard icon={Activity} label="Operaciones" value={metrics.totalOperations} color="text-slate-900 dark:text-white" />
        <MetricCard icon={CheckCircle} label="Exitosas" value={metrics.successfulOperations} color="text-green-600 dark:text-green-400" />
        <MetricCard icon={XCircle} label="Fallidas" value={metrics.failedOperations} color="text-red-600 dark:text-red-400" />
        <MetricCard icon={Shield} label="Verificadas" value={metrics.verifiedOperations} color="text-emerald-600 dark:text-emerald-400" />
        <MetricCard icon={Clock} label="Shadow" value={metrics.shadowDecisions} color="text-blue-600 dark:text-blue-400" />
        <MetricCard icon={TrendingUp} label="Activas" value={metrics.activeDecisions} color="text-purple-600 dark:text-purple-400" />
        <MetricCard icon={Clock} label="Duración μ" value={`${metrics.averageDurationMs.toFixed(0)}ms`} color="text-slate-700 dark:text-slate-300" />
        <MetricCard icon={TrendingUp} label="Tasa éxito" value={`${(metrics.successRate * 100).toFixed(1)}%`} color="text-slate-700 dark:text-slate-300" />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Decisions */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Decisiones Recientes</h3>
          {recentDecisions.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">No hay decisiones registradas.</p>
          ) : (
            <div className="space-y-2">
              {recentDecisions.map(decision => (
                <div key={decision.id} className="flex items-center gap-3 text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <span className={`px-2 py-0.5 rounded font-medium ${
                    decision.status === 'selected' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    decision.status === 'shadow' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                    decision.status === 'blocked' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {JOULE_DECISION_STATUS_LABELS[decision.status]}
                  </span>
                  <span className="flex-1 text-slate-600 dark:text-slate-400 truncate">
                    {decision.reasons[0] || 'Sin detalles'}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500">
                    {new Date(decision.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Measurements */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Mediciones Recientes</h3>
          {recentMeasurements.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">No hay mediciones registradas.</p>
          ) : (
            <div className="space-y-2">
              {recentMeasurements.map(measurement => (
                <div key={measurement.id} className="flex items-center gap-3 text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <span className={`w-2 h-2 rounded-full ${measurement.success ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="flex-1 text-slate-600 dark:text-slate-400 truncate">
                    {JOULE_CATEGORY_LABELS[measurement.category]}
                  </span>
                  <span className="text-slate-500 dark:text-slate-500">
                    {measurement.durationMs.toFixed(0)}ms
                  </span>
                  <span className="text-slate-400 dark:text-slate-500">
                    {new Date(measurement.completedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-800 dark:text-blue-300">
          <strong>Modo Shadow:</strong> JOULE calcula qué ruta habría seleccionado pero no modifica el comportamiento de la aplicación.
          Útil para validar reglas y detectar posibles regresiones sin afectar la producción.
        </p>
        <p className="text-xs text-blue-800 dark:text-blue-300 mt-2">
          <strong>Modo Canary:</strong> JOULE actúa sobre un porcentaje controlado de operaciones elegibles ({jouleState.canaryPercentage}%).
          La promoción entre etapas requiere evidencia suficiente de seguridad y calidad.
        </p>
        <p className="text-xs text-blue-800 dark:text-blue-300 mt-2">
          <strong>Kill Switch:</strong> Desactiva JOULE inmediatamente y restaura el comportamiento de referencia.
          No destruye registros ni modifica aprobaciones existentes.
        </p>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
      <Icon className={`w-5 h-5 mx-auto mb-2 ${color}`} />
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
    </div>
  );
}
