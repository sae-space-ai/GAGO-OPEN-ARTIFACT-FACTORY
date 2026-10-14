import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

// Modal component
export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; maxWidth?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

// Confirm dialog
export function ConfirmDialog({ open, onClose, onConfirm, title, message }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-700">
        <div className="p-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{message}</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium">
              Cancelar
            </button>
            <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium">
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Empty state
export function EmptyState({ icon: Icon, title, description, action }: {
  icon: React.ElementType; title: string; description: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-sm">{description}</p>
      {action}
    </div>
  );
}

// Status badge
export function StatusBadge({ status, label }: { status: string; label: string }) {
  const colors: Record<string, string> = {
    planning: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    development: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    review: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    archived: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
    pending: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    blocked: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    draft: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    approved: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    published: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    declared: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    provided: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    verified: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
      {label}
    </span>
  );
}

// Priority badge
export function PriorityBadge({ priority, label }: { priority: string; label: string }) {
  const colors: Record<string, string> = {
    low: 'text-slate-500 dark:text-slate-400',
    medium: 'text-blue-600 dark:text-blue-400',
    high: 'text-amber-600 dark:text-amber-400',
    critical: 'text-red-600 dark:text-red-400',
  };
  const dots: Record<string, string> = {
    low: 'bg-slate-400',
    medium: 'bg-blue-500',
    high: 'bg-amber-500',
    critical: 'bg-red-500',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${colors[priority] || 'text-slate-500'}`}>
      <span className={`w-2 h-2 rounded-full ${dots[priority] || 'bg-slate-400'}`} />
      {label}
    </span>
  );
}

// Toast notification
export function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) {
  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  };

  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 z-[80] ${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-2`}>
      {message}
    </div>
  );
}
