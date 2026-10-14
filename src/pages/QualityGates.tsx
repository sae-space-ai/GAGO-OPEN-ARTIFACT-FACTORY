import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Toast } from '../components/UI';
import type { QualityGate, GateStatus } from '../types/scope';
import { GATE_STATUS_LABELS } from '../types/scope';
import { ShieldCheck, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';

const statusColors: Record<GateStatus, string> = {
  pending: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600',
  passed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-800',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-300 dark:border-red-800',
  blocked: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300 dark:border-amber-800',
};

const statusIcons: Record<GateStatus, React.ElementType> = {
  pending: Clock,
  passed: CheckCircle2,
  failed: XCircle,
  blocked: AlertTriangle,
};

export default function QualityGates() {
  const { store, editQualityGate } = useData();
  const gates = store.qualityGates || [];
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  function updateGateStatus(id: string, status: GateStatus) {
    editQualityGate(id, {
      status,
      lastCheck: new Date().toISOString(),
      source: status === 'passed' ? 'Confirmación manual' : 'Actualización manual',
    });
    setToast({ message: `Puerta actualizada: ${GATE_STATUS_LABELS[status]}`, type: 'success' });
  }

  const passedCount = gates.filter(g => g.status === 'passed').length;
  const failedCount = gates.filter(g => g.status === 'failed').length;
  const pendingCount = gates.filter(g => g.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Puertas de Validación — Fase 0.1</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{gates.length}</p>
            <p className="text-xs text-slate-500">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{passedCount}</p>
            <p className="text-xs text-slate-500">Superadas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{failedCount}</p>
            <p className="text-xs text-slate-500">Fallidas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-500">{pendingCount}</p>
            <p className="text-xs text-slate-500">Pendientes</p>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
        <strong>Nota:</strong> Las puertas de validación reflejan el estado real de las comprobaciones. Un estado «Superada» debe corresponder a una ejecución verificable. No existe un mecanismo para marcar todas las puertas como superadas simultáneamente.
      </div>

      {/* Gates list */}
      <div className="grid gap-4">
        {gates.map(gate => {
          const StatusIcon = statusIcons[gate.status];
          return (
            <div key={gate.id} className={`bg-white dark:bg-slate-800 rounded-xl border p-5 ${statusColors[gate.status].split(' ').find(c => c.startsWith('border-'))}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">{gate.code}</span>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{gate.name}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[gate.status]}`}>
                      <StatusIcon className="w-3 h-3" />
                      {GATE_STATUS_LABELS[gate.status]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{gate.description}</p>
                  <div className="text-xs text-slate-500 dark:text-slate-500 space-y-1">
                    <p><strong>Procedimiento:</strong> {gate.procedure}</p>
                    {gate.lastCheck && <p><strong>Última comprobación:</strong> {new Date(gate.lastCheck).toLocaleString('es-ES')}</p>}
                    {gate.reference && <p><strong>Referencia:</strong> <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">{gate.reference}</code></p>}
                    <p className="flex items-center gap-3">
                      {gate.automated && <span className="text-blue-600 dark:text-blue-400">✓ Automatizada</span>}
                      {gate.requiresHumanAuth && <span className="text-amber-600 dark:text-amber-400">⚠ Requiere autorización humana</span>}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button onClick={() => updateGateStatus(gate.id, 'passed')} className="px-2 py-1 text-xs rounded border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20">
                    Superada
                  </button>
                  <button onClick={() => updateGateStatus(gate.id, 'failed')} className="px-2 py-1 text-xs rounded border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                    Fallida
                  </button>
                  <button onClick={() => updateGateStatus(gate.id, 'blocked')} className="px-2 py-1 text-xs rounded border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20">
                    Bloqueada
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
