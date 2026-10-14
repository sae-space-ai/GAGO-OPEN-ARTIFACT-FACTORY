// GAGO Open Artifact Factory - System Connection Manager
// Phase 10: Final Integration Repair

import { generateId } from './storage';

export type ConnectionStatus = 
  | 'NOT_CONFIGURED'
  | 'CONFIGURED'
  | 'AUTH_REQUIRED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'VERIFIED'
  | 'DEGRADED'
  | 'DISCONNECTED'
  | 'BLOCKED'
  | 'ERROR';

export interface SystemConnection {
  id: string;
  name: string;
  status: ConnectionStatus;
  lastChecked: string | null;
  capabilities: string[];
  errors: string[];
  pendingAuthorization: boolean;
  details: string;
}

export interface SystemConnectionState {
  connections: Record<string, SystemConnection>;
  lastGlobalCheck: string | null;
}

/**
 * Estado inicial de las conexiones del sistema
 */
export function getInitialConnectionState(): SystemConnectionState {
  return {
    connections: {
      github: {
        id: 'github',
        name: 'GitHub',
        status: 'NOT_CONFIGURED',
        lastChecked: null,
        capabilities: [],
        errors: [],
        pendingAuthorization: false,
        details: 'Pendiente de comprobación'
      },
      vercel: {
        id: 'vercel',
        name: 'Vercel',
        status: 'NOT_CONFIGURED',
        lastChecked: null,
        capabilities: [],
        errors: [],
        pendingAuthorization: false,
        details: 'Pendiente de comprobación'
      },
      qwen: {
        id: 'qwen',
        name: 'Qwen Coder',
        status: 'NOT_CONFIGURED',
        lastChecked: null,
        capabilities: [],
        errors: [],
        pendingAuthorization: false,
        details: 'Pendiente de comprobación'
      }
    },
    lastGlobalCheck: null
  };
}

/**
 * Comprueba la conectividad con GitHub (API pública)
 */
export async function checkGitHubConnection(): Promise<SystemConnection> {
  const connection: SystemConnection = {
    id: 'github',
    name: 'GitHub',
    status: 'CONNECTING',
    lastChecked: new Date().toISOString(),
    capabilities: [],
    errors: [],
    pendingAuthorization: false,
    details: 'Comprobando conectividad...'
  };

  try {
    // Comprobar API pública de GitHub
    const response = await fetch('https://api.github.com/rate_limit', {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      connection.status = 'VERIFIED';
      connection.capabilities = ['Lectura pública', 'Rate limit check'];
      connection.details = `API pública accesible. Límite: ${data.rate?.limit || 'N/A'} req/hora`;
    } else if (response.status === 403) {
      connection.status = 'DEGRADED';
      connection.capabilities = ['Lectura pública limitada'];
      connection.errors = ['Rate limit excedido'];
      connection.details = 'API pública accesible pero con límites excedidos';
    } else if (response.status === 404) {
      connection.status = 'ERROR';
      connection.errors = ['Endpoint no encontrado'];
      connection.details = 'Error al contactar con GitHub API';
    } else {
      connection.status = 'ERROR';
      connection.errors = [`HTTP ${response.status}`];
      connection.details = `Error inesperado: ${response.status}`;
    }
  } catch (error) {
    connection.status = 'DISCONNECTED';
    connection.errors = [error instanceof Error ? error.message : 'Error de red desconocido'];
    connection.details = 'No se pudo establecer conexión con GitHub';
  }

  return connection;
}

/**
 * Comprueba la configuración de Vercel
 */
export async function checkVercelConnection(): Promise<SystemConnection> {
  const connection: SystemConnection = {
    id: 'vercel',
    name: 'Vercel',
    status: 'CONNECTING',
    lastChecked: new Date().toISOString(),
    capabilities: [],
    errors: [],
    pendingAuthorization: false,
    details: 'Comprobando configuración...'
  };

  try {
    // Comprobar si vercel.json existe y es accesible
    const response = await fetch('/vercel.json', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const config = await response.json();
      
      // Verificar estructura básica
      if (config.buildCommand && config.outputDirectory && config.framework) {
        connection.status = 'VERIFIED';
        connection.capabilities = ['Configuración Vite', 'Build command', 'Output directory'];
        connection.details = `Configuración válida. Framework: ${config.framework}, Build: ${config.buildCommand}`;
      } else {
        connection.status = 'CONFIGURED';
        connection.capabilities = ['Configuración parcial'];
        connection.errors = ['Faltan campos requeridos en vercel.json'];
        connection.details = 'Configuración incompleta';
      }
    } else if (response.status === 404) {
      connection.status = 'NOT_CONFIGURED';
      connection.errors = ['vercel.json no encontrado'];
      connection.details = 'No existe configuración de Vercel';
    } else {
      connection.status = 'ERROR';
      connection.errors = [`HTTP ${response.status}`];
      connection.details = `Error al acceder a vercel.json: ${response.status}`;
    }
  } catch (error) {
    connection.status = 'ERROR';
    connection.errors = [error instanceof Error ? error.message : 'Error desconocido'];
    connection.details = 'No se pudo verificar la configuración de Vercel';
  }

  return connection;
}

/**
 * Comprueba la disponibilidad de Qwen Coder
 */
export async function checkQwenConnection(): Promise<SystemConnection> {
  const connection: SystemConnection = {
    id: 'qwen',
    name: 'Qwen Coder',
    status: 'CONNECTING',
    lastChecked: new Date().toISOString(),
    capabilities: [],
    errors: [],
    pendingAuthorization: true,
    details: 'Comprobando disponibilidad...'
  };

  // Qwen Coder requiere configuración de API key y backend seguro
  // En esta fase, solo verificamos que el sistema está preparado
  connection.status = 'AUTH_REQUIRED';
  connection.capabilities = ['Generación de código', 'Análisis de código'];
  connection.pendingAuthorization = true;
  connection.details = 'Requiere configuración de API key y backend seguro';

  return connection;
}

/**
 * Realiza una comprobación global de todas las conexiones
 */
export async function checkAllConnections(): Promise<SystemConnectionState> {
  const state = getInitialConnectionState();

  // Comprobar todas las conexiones en paralelo
  const [github, vercel, qwen] = await Promise.all([
    checkGitHubConnection(),
    checkVercelConnection(),
    checkQwenConnection()
  ]);

  state.connections.github = github;
  state.connections.vercel = vercel;
  state.connections.qwen = qwen;
  state.lastGlobalCheck = new Date().toISOString();

  return state;
}

/**
 * Obtiene el estado de una conexión específica
 */
export function getConnectionStatus(
  state: SystemConnectionState,
  connectionId: string
): SystemConnection | null {
  return state.connections[connectionId] || null;
}

/**
 * Actualiza el estado de una conexión
 */
export function updateConnectionStatus(
  state: SystemConnectionState,
  connectionId: string,
  connection: SystemConnection
): SystemConnectionState {
  return {
    ...state,
    connections: {
      ...state.connections,
      [connectionId]: connection
    }
  };
}

/**
 * Obtiene un resumen del estado de todas las conexiones
 */
export function getConnectionSummary(state: SystemConnectionState): {
  total: number;
  verified: number;
  connected: number;
  configured: number;
  errors: number;
  pending: number;
} {
  const connections = Object.values(state.connections);
  
  return {
    total: connections.length,
    verified: connections.filter(c => c.status === 'VERIFIED').length,
    connected: connections.filter(c => c.status === 'CONNECTED' || c.status === 'VERIFIED').length,
    configured: connections.filter(c => c.status === 'CONFIGURED').length,
    errors: connections.filter(c => c.status === 'ERROR' || c.status === 'DISCONNECTED').length,
    pending: connections.filter(c => c.pendingAuthorization).length
  };
}
