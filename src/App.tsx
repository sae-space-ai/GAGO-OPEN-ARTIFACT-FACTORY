import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Projects = lazy(() => import('./pages/Projects'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Artifacts = lazy(() => import('./pages/Artifacts'));
const Evidence = lazy(() => import('./pages/Evidence'));
const ScopeMatrix = lazy(() => import('./pages/ScopeMatrix'));
const QualityGates = lazy(() => import('./pages/QualityGates'));
const QwenGenerator = lazy(() => import('./pages/QwenGenerator'));
const Settings = lazy(() => import('./pages/Settings'));
const Integrations = lazy(() => import('./pages/Integrations'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Cargando...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <BrowserRouter>
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/artifacts" element={<Artifacts />} />
                <Route path="/evidence" element={<Evidence />} />
                <Route path="/scope" element={<ScopeMatrix />} />
                <Route path="/gates" element={<QualityGates />} />
                <Route path="/qwen" element={<QwenGenerator />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/integrations" element={<Integrations />} />
              </Routes>
            </Suspense>
          </Layout>
        </BrowserRouter>
      </DataProvider>
    </ThemeProvider>
  );
}
