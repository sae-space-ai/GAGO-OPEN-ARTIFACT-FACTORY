// GAGO Open Artifact Factory - Approval Dashboard
// Phase 8: JOULE AUTONOMOUS APPROVAL ENGINE

import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { 
  discoverModules, 
  evaluateAllModules, 
  createMockTestEvidences,
  TestEvidenceCollector 
} from '../services/approval';
import type { ModuleManifest, ModuleEvaluation, ModuleStatus, RiskLevel } from '../types/approval';
import { MODULE_STATUS_LABELS, RISK_LEVEL_LABELS, APPROVAL_DECISION_LABELS } from '../types/approval';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Shield, 
  Zap, 
  RefreshCw,
  TrendingUp,
  FileCheck,
  Lock
} from 'lucide-react';

export default function ApprovalDashboard() {
  const { store } = useData();
  const [modules, setModules] = useState<ModuleManifest[]>([]);
  const [evaluations, setEvaluations] = useState<ModuleEvaluation[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ModuleStatus | 'all'>('all');
  const [filterRisk, setFilterRisk] = useState<RiskLevel | 'all'>('all');

  const evidenceCollector = new TestEvidenceCollector();

  // Cargar módulos al iniciar
  useEffect(() => {
    const discoveredModules = discoverModules();
    setModules(discoveredModules);

    // Generar evidencias de prueba simuladas para cada módulo
    for (const module of discoveredModules) {
      const mockEvidences = createMockTestEvidences(module.id, {
        unitTests: 5,
        integrationTests: 2,
        typecheck: true,
        build: true,
        allPassed: true
      });
      mockEvidences.forEach(e => evidenceCollector.registerEvidence(e));
    }
  }, []);

  // Ejecutar evaluación completa
  const handleEvaluateAll = () => {
    setIsEvaluating(true);
    
    setTimeout(() => {
      const allEvidences = evidenceCollector.getAllEvidences();
      const result = evaluateAllModules(modules, allEvidences);
      setEvaluations(result.evaluations);
      setIsEvaluating(false);
    }, 1000);
  };

  // Estadísticas
  const stats = {
    total: modules.length,
    approved: evaluations.filter(e => e.decision === 'APPROVED').length,
    rejected: evaluations.filter(e => e.decision === 'REJECTED').length,
    pending: evaluations.filter(e => e.decision === 'PENDING').length,
    autoApproved: evaluations.filter(e => e.autoApproved).length,
    manualReview: evaluations.filter(e => e.requiresManualReview).length
  };

  // Filtrar módulos
  const filteredModules = modules.filter(module => {
    const evaluation = evaluations.find(e => e.moduleId === module.id);
    
    if (filterStatus !== 'all' && evaluation?.status !== filterStatus) {
      return false;
    }
    
    if (filterRisk !== 'all' && evaluation?.riskLevel !== filterRisk) {
      return false;
    }
    
    return true;
  });

  // Obtener evaluación de un módulo
  const getModuleEvaluation = (moduleId: string): ModuleEvaluation | undefined => {
    return evaluations.find(e => e.moduleId === moduleId);
  };

  // Obtener color del estado
  const getStatusColor = (status: ModuleStatus): string => {
    switch (status) {
      case 'AUTO_APPROVED':
      case 'VERIFIED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'REJECTED':
      case 'TEST_FAILED':
      case 'SECURITY_BLOCKED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'MANUAL_REVIEW_REQUIRED':
      case 'EVIDENCE_PENDING':
      case 'DEPENDENCY_BLOCKED':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'STALE_APPROVAL':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  // Obtener color del riesgo
  const getRiskColor = (risk: RiskLevel): string => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'LOW':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
  };

  // Obtener icono del estado
  const getStatusIcon = (status: ModuleStatus) => {
    switch (status) {
      case 'AUTO_APPROVED':
      case 'VERIFIED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'REJECTED':
      case 'TEST_FAILED':
      case 'SECURITY_BLOCKED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'MANUAL_REVIEW_REQUIRED':
      case 'EVIDENCE_PENDING':
      case 'DEPENDENCY_BLOCKED':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'STALE_APPROVAL':
        return <Clock className="w-5 h-5 text-orange-500" />;
      default:
        return <Clock className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
          <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          JOULE Autonomous Approval Engine
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Sistema de revisión y aprobación automática de módulos
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Módulos</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Aprobados</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Rechazados</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Pendientes</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Auto-Aprobados</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.autoApproved}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Revisión Manual</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.manualReview}</p>
        </div>
      </div>

      {/* Botón de evaluación masiva */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={handleEvaluateAll}
          disabled={isEvaluating}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold rounded-lg transition-colors"
        >
          {isEvaluating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Evaluando...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Revisar y Aprobar Todos los Módulos
            </>
          )}
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex gap-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as ModuleStatus | 'all')}
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        >
          <option value="all">Todos los estados</option>
          {Object.entries(MODULE_STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <select
          value={filterRisk}
          onChange={(e) => setFilterRisk(e.target.value as RiskLevel | 'all')}
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        >
          <option value="all">Todos los riesgos</option>
          {Object.entries(RISK_LEVEL_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Lista de módulos */}
      <div className="space-y-4">
        {filteredModules.map(module => {
          const evaluation = getModuleEvaluation(module.id);
          
          return (
            <div
              key={module.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedModule(selectedModule === module.id ? null : module.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  {evaluation && getStatusIcon(evaluation.status)}
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                      {module.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {module.description}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {evaluation && (
                    <>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(evaluation.status)}`}>
                        {MODULE_STATUS_LABELS[evaluation.status]}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getRiskColor(evaluation.riskLevel)}`}>
                        Riesgo: {RISK_LEVEL_LABELS[evaluation.riskLevel]}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Fase</p>
                  <p className="font-medium text-slate-900 dark:text-white">{module.phase}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Versión</p>
                  <p className="font-medium text-slate-900 dark:text-white">{module.version}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Dependencias</p>
                  <p className="font-medium text-slate-900 dark:text-white">{module.dependencies.length}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Componentes</p>
                  <p className="font-medium text-slate-900 dark:text-white">{module.components.length}</p>
                </div>
              </div>

              {/* Detalles expandibles */}
              {selectedModule === module.id && evaluation && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white mb-2">Pruebas</p>
                      <p className="text-slate-600 dark:text-slate-400">
                        Ejecutadas: {evaluation.testsExecuted}
                      </p>
                      <p className="text-green-600 dark:text-green-400">
                        Pasadas: {evaluation.testsPassed}
                      </p>
                      <p className="text-red-600 dark:text-red-400">
                        Fallidas: {evaluation.testsFailed}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white mb-2">Evidencias</p>
                      <p className="text-green-600 dark:text-green-400">
                        Verificadas: {evaluation.evidencesVerified}
                      </p>
                      <p className="text-amber-600 dark:text-amber-400">
                        Pendientes: {evaluation.evidencesPending}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white mb-2">Dependencias</p>
                      <p className="text-green-600 dark:text-green-400">
                        Satisfechas: {evaluation.dependenciesSatisfied}/{evaluation.dependenciesChecked}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white mb-2">Decisión</p>
                      <p className={`font-medium ${
                        evaluation.decision === 'APPROVED' ? 'text-green-600 dark:text-green-400' :
                        evaluation.decision === 'REJECTED' ? 'text-red-600 dark:text-red-400' :
                        'text-amber-600 dark:text-amber-400'
                      }`}>
                        {APPROVAL_DECISION_LABELS[evaluation.decision]}
                      </p>
                      {evaluation.autoApproved && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          Aprobación automática
                        </p>
                      )}
                    </div>
                  </div>

                  {evaluation.reasons.length > 0 && (
                    <div className="mt-4">
                      <p className="font-medium text-slate-900 dark:text-white mb-2">Razones</p>
                      <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400">
                        {evaluation.reasons.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {evaluation.blockers.length > 0 && (
                    <div className="mt-4">
                      <p className="font-medium text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Bloqueos
                      </p>
                      <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400">
                        {evaluation.blockers.map((blocker, idx) => (
                          <li key={idx}>{blocker}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {evaluation.recommendations.length > 0 && (
                    <div className="mt-4">
                      <p className="font-medium text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Recomendaciones
                      </p>
                      <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400">
                        {evaluation.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredModules.length === 0 && (
        <div className="text-center py-12">
          <FileCheck className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 mb-2">No hay módulos que coincidan con los filtros</p>
        </div>
      )}
    </div>
  );
}
