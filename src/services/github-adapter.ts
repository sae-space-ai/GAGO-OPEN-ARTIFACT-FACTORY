// GAGO Open Artifact Factory - GitHub Adapter
// Phase 10: Final Integration Repair

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  default_branch: string;
  permissions?: {
    admin: boolean;
    push: boolean;
    pull: boolean;
  };
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  html_url: string;
}

export interface GitHubConnectionResult {
  success: boolean;
  repository?: GitHubRepository;
  latestCommit?: GitHubCommit;
  capabilities: string[];
  errors: string[];
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
  };
}

/**
 * Repositorio GitHub de referencia
 */
export const GITHUB_REPO_OWNER = 'sae-space-ai';
export const GITHUB_REPO_NAME = 'montemolin-open-factory';

/**
 * Comprueba la disponibilidad de la API pública de GitHub
 */
export async function checkGitHubAPIAvailability(): Promise<{
  available: boolean;
  rateLimit?: { limit: number; remaining: number; reset: number };
  error?: string;
}> {
  try {
    const response = await fetch('https://api.github.com/rate_limit', {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return {
        available: true,
        rateLimit: {
          limit: data.rate?.limit || 60,
          remaining: data.rate?.remaining || 0,
          reset: data.rate?.reset || 0
        }
      };
    } else if (response.status === 403) {
      return {
        available: false,
        error: 'Rate limit excedido'
      };
    } else {
      return {
        available: false,
        error: `HTTP ${response.status}`
      };
    }
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : 'Error de red'
    };
  }
}

/**
 * Obtiene información pública del repositorio
 */
export async function getPublicRepositoryInfo(
  owner: string = GITHUB_REPO_OWNER,
  repo: string = GITHUB_REPO_NAME
): Promise<GitHubConnectionResult> {
  const result: GitHubConnectionResult = {
    success: false,
    capabilities: [],
    errors: []
  };

  try {
    // Obtener información del repositorio
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!repoResponse.ok) {
      result.errors.push(`Error al obtener repositorio: HTTP ${repoResponse.status}`);
      return result;
    }

    const repoData = await repoResponse.json();
    result.repository = repoData;
    result.success = true;
    result.capabilities.push('Lectura pública de repositorio');

    // Obtener último commit de la rama principal
    const defaultBranch = repoData.default_branch || 'main';
    const commitResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits/${defaultBranch}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (commitResponse.ok) {
      const commitData = await commitResponse.json();
      result.latestCommit = commitData;
      result.capabilities.push('Lectura de commits');
    }

    // Obtener rate limit
    const rateLimitResponse = await fetch('https://api.github.com/rate_limit', {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (rateLimitResponse.ok) {
      const rateLimitData = await rateLimitResponse.json();
      result.rateLimit = {
        limit: rateLimitData.rate?.limit || 60,
        remaining: rateLimitData.rate?.remaining || 0,
        reset: rateLimitData.rate?.reset || 0
      };
      result.capabilities.push('Consulta de rate limit');
    }

  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Error de red');
  }

  return result;
}

/**
 * Verifica si el repositorio es accesible públicamente
 */
export async function verifyPublicAccess(
  owner: string = GITHUB_REPO_OWNER,
  repo: string = GITHUB_REPO_NAME
): Promise<{
  accessible: boolean;
  isPublic: boolean;
  defaultBranch: string | null;
  error?: string;
}> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return {
        accessible: true,
        isPublic: !data.private,
        defaultBranch: data.default_branch || null
      };
    } else if (response.status === 404) {
      return {
        accessible: false,
        isPublic: false,
        defaultBranch: null,
        error: 'Repositorio no encontrado o privado'
      };
    } else {
      return {
        accessible: false,
        isPublic: false,
        defaultBranch: null,
        error: `HTTP ${response.status}`
      };
    }
  } catch (error) {
    return {
      accessible: false,
      isPublic: false,
      defaultBranch: null,
      error: error instanceof Error ? error.message : 'Error de red'
    };
  }
}

/**
 * Obtiene la lista de ramas públicas
 */
export async function getPublicBranches(
  owner: string = GITHUB_REPO_OWNER,
  repo: string = GITHUB_REPO_NAME
): Promise<{
  branches: string[];
  error?: string;
}> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return {
        branches: data.map((b: any) => b.name)
      };
    } else {
      return {
        branches: [],
        error: `HTTP ${response.status}`
      };
    }
  } catch (error) {
    return {
      branches: [],
      error: error instanceof Error ? error.message : 'Error de red'
    };
  }
}

/**
 * Obtiene información de un archivo público
 */
export async function getPublicFileContent(
  owner: string = GITHUB_REPO_OWNER,
  repo: string = GITHUB_REPO_NAME,
  path: string = 'README.md',
  branch: string = 'main'
): Promise<{
  content: string | null;
  sha: string | null;
  error?: string;
}> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      // El contenido viene en base64
      const content = atob(data.content);
      return {
        content,
        sha: data.sha
      };
    } else if (response.status === 404) {
      return {
        content: null,
        sha: null,
        error: 'Archivo no encontrado'
      };
    } else {
      return {
        content: null,
        sha: null,
        error: `HTTP ${response.status}`
      };
    }
  } catch (error) {
    return {
      content: null,
      sha: null,
      error: error instanceof Error ? error.message : 'Error de red'
    };
  }
}
