// GAGO Open Artifact Factory - Tool Factory Tests
// Fase 5: Pruebas exhaustivas de las 15 plantillas

import { describe, it, expect } from 'vitest';
import { 
  createToolFromSpecification, 
  getAvailableTemplates, 
  validateToolSpecification,
  normalizeIdentifier,
  downloadToolCode,
  downloadToolProject
} from '../services/tool-factory';
import type { ToolSpecification, ToolCategory } from '../types/control-plane';

describe('Tool Factory - Validación', () => {
  it('debería validar una especificación correcta', () => {
    const spec: ToolSpecification = {
      name: 'Mi Herramienta',
      category: 'dashboard',
      description: 'Una herramienta de prueba',
      inputs: [{ name: 'title', type: 'string', required: true, description: 'Título' }],
      outputs: [{ name: 'html', type: 'string', description: 'HTML generado' }],
      permissions: [],
      acceptanceCriteria: ['Debe generar HTML válido']
    };

    const result = validateToolSpecification(spec);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('debería rechazar una especificación sin nombre', () => {
    const spec: ToolSpecification = {
      name: '',
      category: 'dashboard',
      description: 'Una herramienta de prueba',
      inputs: [{ name: 'title', type: 'string', required: true, description: 'Título' }],
      outputs: [{ name: 'html', type: 'string', description: 'HTML generado' }],
      permissions: [],
      acceptanceCriteria: []
    };

    const result = validateToolSpecification(spec);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('El nombre es obligatorio');
  });

  it('debería rechazar una especificación sin entradas', () => {
    const spec: ToolSpecification = {
      name: 'Mi Herramienta',
      category: 'dashboard',
      description: 'Una herramienta de prueba',
      inputs: [],
      outputs: [{ name: 'html', type: 'string', description: 'HTML generado' }],
      permissions: [],
      acceptanceCriteria: []
    };

    const result = validateToolSpecification(spec);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Debe definir al menos una entrada');
  });

  it('debería rechazar permisos inválidos', () => {
    const spec: ToolSpecification = {
      name: 'Mi Herramienta',
      category: 'dashboard',
      description: 'Una herramienta de prueba',
      inputs: [{ name: 'title', type: 'string', required: true, description: 'Título' }],
      outputs: [{ name: 'html', type: 'string', description: 'HTML generado' }],
      permissions: ['permiso_invalido'],
      acceptanceCriteria: []
    };

    const result = validateToolSpecification(spec);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Permiso no válido'))).toBe(true);
  });
});

describe('Tool Factory - Normalización de Identificadores', () => {
  it('debería normalizar nombres con espacios', () => {
    expect(normalizeIdentifier('mi herramienta')).toBe('MiHerramienta');
  });

  it('debería normalizar nombres con acentos', () => {
    expect(normalizeIdentifier('Gestión de Tareas')).toBe('GestionDeTareas');
  });

  it('debería normalizar nombres que empiezan con números', () => {
    expect(normalizeIdentifier('123 Herramienta')).toBe('Tool123Herramienta');
  });

  it('debería manejar palabras reservadas', () => {
    expect(normalizeIdentifier('class')).toBe('ClassComponent');
    expect(normalizeIdentifier('function')).toBe('FunctionComponent');
  });

  it('debería manejar nombres vacíos', () => {
    expect(normalizeIdentifier('')).toBe('GeneratedTool');
  });

  it('debería eliminar caracteres especiales', () => {
    expect(normalizeIdentifier('Mi@Herramienta#1')).toBe('MiHerramienta1');
  });
});

describe('Tool Factory - Plantillas Disponibles', () => {
  it('debería tener 15 plantillas disponibles', () => {
    const templates = getAvailableTemplates();
    expect(templates).toHaveLength(15);
  });

  it('debería incluir todas las categorías requeridas', () => {
    const templates = getAvailableTemplates();
    const categories = templates.map(t => t.category);
    
    expect(categories).toContain('dashboard');
    expect(categories).toContain('form');
    expect(categories).toContain('crud');
    expect(categories).toContain('calculator');
    expect(categories).toContain('table');
    expect(categories).toContain('report');
    expect(categories).toContain('api_client');
    expect(categories).toContain('validator');
    expect(categories).toContain('comparator');
    expect(categories).toContain('evidence_manager');
    expect(categories).toContain('qwen_order');
    expect(categories).toContain('workflow_builder');
    expect(categories).toContain('model_spec');
    expect(categories).toContain('budget_calculator');
    expect(categories).toContain('log_analyzer');
  });

  it('cada plantilla debería tener entradas y salidas predeterminadas', () => {
    const templates = getAvailableTemplates();
    
    templates.forEach(template => {
      expect(template.defaultInputs).toBeDefined();
      expect(template.defaultOutputs).toBeDefined();
      expect(template.defaultInputs.length).toBeGreaterThan(0);
      expect(template.defaultOutputs.length).toBeGreaterThan(0);
    });
  });
});

describe('Tool Factory - Generación de Código por Categoría', () => {
  const categories: ToolCategory[] = [
    'dashboard', 'form', 'crud', 'calculator', 'table',
    'report', 'api_client', 'validator', 'comparator',
    'evidence_manager', 'qwen_order', 'workflow_builder',
    'model_spec', 'budget_calculator', 'log_analyzer'
  ];

  categories.forEach(category => {
    it(`debería generar código válido para ${category}`, () => {
      const templates = getAvailableTemplates();
      const template = templates.find(t => t.category === category)!;
      
      const spec: ToolSpecification = {
        name: `Test ${category}`,
        category,
        description: `Herramienta de prueba para ${category}`,
        inputs: template.defaultInputs,
        outputs: template.defaultOutputs,
        permissions: [],
        acceptanceCriteria: ['Debe funcionar correctamente']
      };

      const result = createToolFromSpecification(spec);
      
      expect(result.manifest).toBeDefined();
      expect(result.manifest.category).toBe(category);
      expect(result.manifest.status).toBe('GENERATED');
      expect(result.generatedCode).toBeDefined();
      expect(result.generatedCode.length).toBeGreaterThan(0);
      expect(result.documentation).toBeDefined();
      expect(result.persistentData).toBeDefined();
      expect(result.persistentData.versions).toHaveLength(1);
      
      // Verificar que el código contiene el nombre del componente normalizado
      const componentName = normalizeIdentifier(spec.name);
      expect(result.generatedCode).toContain(componentName);
      
      // Verificar que el código es TypeScript válido (contiene imports y exports)
      expect(result.generatedCode).toContain('import');
      expect(result.generatedCode).toContain('export');
    });
  });
});

describe('Tool Factory - Dashboard', () => {
  it('debería generar un dashboard con métricas', () => {
    const spec: ToolSpecification = {
      name: 'Panel de Métricas',
      category: 'dashboard',
      description: 'Panel de control con métricas',
      inputs: [
        { name: 'title', type: 'string', required: true, description: 'Título' },
        { name: 'metrics', type: 'array', required: true, description: 'Métricas' }
      ],
      outputs: [
        { name: 'html', type: 'string', description: 'HTML del panel' }
      ],
      permissions: [],
      acceptanceCriteria: ['Debe mostrar métricas']
    };

    const result = createToolFromSpecification(spec);
    expect(result.generatedCode).toContain('Metric');
    expect(result.generatedCode).toContain('metrics.map');
  });
});

describe('Tool Factory - Form con Validación', () => {
  it('debería generar un formulario con validación completa', () => {
    const spec: ToolSpecification = {
      name: 'Formulario de Contacto',
      category: 'form',
      description: 'Formulario con validación',
      inputs: [
        { name: 'title', type: 'string', required: true, description: 'Título' },
        { name: 'fields', type: 'array', required: true, description: 'Campos' }
      ],
      outputs: [
        { name: 'html', type: 'string', description: 'HTML del formulario' }
      ],
      permissions: [],
      acceptanceCriteria: ['Debe validar campos']
    };

    const result = createToolFromSpecification(spec);
    expect(result.generatedCode).toContain('validateField');
    expect(result.generatedCode).toContain('handleSubmit');
    expect(result.generatedCode).toContain('errors');
  });
});

describe('Tool Factory - CRUD Completo', () => {
  it('debería generar un CRUD con todas las operaciones', () => {
    const spec: ToolSpecification = {
      name: 'Gestor de Clientes',
      category: 'crud',
      description: 'CRUD completo de clientes',
      inputs: [
        { name: 'entityName', type: 'string', required: true, description: 'Nombre de la entidad' },
        { name: 'fields', type: 'array', required: true, description: 'Campos' }
      ],
      outputs: [
        { name: 'component', type: 'string', description: 'Componente React' }
      ],
      permissions: [],
      acceptanceCriteria: ['Debe permitir crear, leer, actualizar y eliminar']
    };

    const result = createToolFromSpecification(spec);
    expect(result.generatedCode).toContain('handleCreate');
    expect(result.generatedCode).toContain('handleUpdate');
    expect(result.generatedCode).toContain('handleDelete');
    expect(result.generatedCode).toContain('deleteConfirm');
    expect(result.generatedCode).toContain('enablePersistence');
  });
});

describe('Tool Factory - Calculadora', () => {
  it('debería generar una calculadora funcional', () => {
    const spec: ToolSpecification = {
      name: 'Calculadora Científica',
      category: 'calculator',
      description: 'Calculadora con operaciones',
      inputs: [
        { name: 'name', type: 'string', required: true, description: 'Nombre' },
        { name: 'operations', type: 'array', required: true, description: 'Operaciones' }
      ],
      outputs: [
        { name: 'component', type: 'string', description: 'Componente' }
      ],
      permissions: [],
      acceptanceCriteria: ['Debe realizar cálculos']
    };

    const result = createToolFromSpecification(spec);
    expect(result.generatedCode).toContain('handleNumber');
    expect(result.generatedCode).toContain('handleOperation');
    expect(result.generatedCode).toContain('handleEquals');
  });
});

describe('Tool Factory - Tabla', () => {
  it('debería generar una tabla con filtros y ordenación', () => {
    const spec: ToolSpecification = {
      name: 'Tabla de Datos',
      category: 'table',
      description: 'Tabla con funcionalidades',
      inputs: [
        { name: 'title', type: 'string', required: true, description: 'Título' },
        { name: 'columns', type: 'array', required: true, description: 'Columnas' }
      ],
      outputs: [
        { name: 'component', type: 'string', description: 'Componente' }
      ],
      permissions: [],
      acceptanceCriteria: ['Debe permitir filtrar y ordenar']
    };

    const result = createToolFromSpecification(spec);
    expect(result.generatedCode).toContain('handleSort');
    expect(result.generatedCode).toContain('filter');
    expect(result.generatedCode).toContain('currentPage');
  });
});

describe('Tool Factory - Persistencia Versionada', () => {
  it('debería crear datos persistentes versionados', () => {
    const spec: ToolSpecification = {
      name: 'Herramienta de Prueba',
      category: 'dashboard',
      description: 'Herramienta para probar persistencia',
      inputs: [{ name: 'title', type: 'string', required: true, description: 'Título' }],
      outputs: [{ name: 'html', type: 'string', description: 'HTML' }],
      permissions: [],
      acceptanceCriteria: []
    };

    const result = createToolFromSpecification(spec);
    
    expect(result.persistentData).toBeDefined();
    expect(result.persistentData.manifest).toBeDefined();
    expect(result.persistentData.versions).toHaveLength(1);
    expect(result.persistentData.currentVersion).toBe('1.0.0');
    expect(result.persistentData.versions[0].status).toBe('GENERATED');
    expect(result.persistentData.versions[0].code).toBe(result.generatedCode);
  });
});

describe('Tool Factory - Estados Diferenciados', () => {
  it('debería crear herramientas con estado GENERATED inicialmente', () => {
    const spec: ToolSpecification = {
      name: 'Herramienta Nueva',
      category: 'form',
      description: 'Herramienta recién generada',
      inputs: [{ name: 'title', type: 'string', required: true, description: 'Título' }],
      outputs: [{ name: 'html', type: 'string', description: 'HTML' }],
      permissions: [],
      acceptanceCriteria: []
    };

    const result = createToolFromSpecification(spec);
    expect(result.manifest.status).toBe('GENERATED');
  });
});

describe('Tool Factory - Seguridad', () => {
  it('no debería generar código con eval o Function constructor', () => {
    const templates = getAvailableTemplates();
    
    templates.forEach(template => {
      const spec: ToolSpecification = {
        name: `Test ${template.category}`,
        category: template.category,
        description: 'Prueba de seguridad',
        inputs: template.defaultInputs,
        outputs: template.defaultOutputs,
        permissions: [],
        acceptanceCriteria: []
      };

      const result = createToolFromSpecification(spec);
      
      // Verificar que no hay código inseguro
      expect(result.generatedCode).not.toContain('eval(');
      expect(result.generatedCode).not.toContain('new Function(');
      expect(result.generatedCode).not.toContain('innerHTML =');
    });
  });

  it('no debería exponer secretos en el código generado', () => {
    const spec: ToolSpecification = {
      name: 'Herramienta Segura',
      category: 'api_client',
      description: 'Cliente API seguro',
      inputs: [
        { name: 'apiName', type: 'string', required: true, description: 'API' },
        { name: 'endpoints', type: 'array', required: true, description: 'Endpoints' }
      ],
      outputs: [{ name: 'client', type: 'string', description: 'Cliente' }],
      permissions: [],
      acceptanceCriteria: []
    };

    const result = createToolFromSpecification(spec);
    
    // Verificar que no hay claves API hardcodeadas
    expect(result.generatedCode).not.toMatch(/api[_-]?key\s*=\s*['"][^'"]+['"]/i);
    expect(result.generatedCode).not.toMatch(/secret\s*=\s*['"][^'"]+['"]/i);
    expect(result.generatedCode).not.toMatch(/password\s*=\s*['"][^'"]+['"]/i);
  });
});

describe('Tool Factory - Integración Completa', () => {
  it('debería generar una herramienta GestorClientes completa y funcional', () => {
    const spec: ToolSpecification = {
      name: 'Gestor Clientes',
      category: 'crud',
      description: 'Gestor completo de clientes con persistencia',
      inputs: [
        { name: 'entityName', type: 'string', required: true, description: 'Nombre de la entidad' },
        { name: 'fields', type: 'array', required: true, description: 'Campos de la entidad' }
      ],
      outputs: [
        { name: 'component', type: 'string', description: 'Componente React completo' },
        { name: 'types', type: 'string', description: 'Tipos TypeScript' }
      ],
      permissions: ['read_data', 'write_data'],
      acceptanceCriteria: [
        'Debe permitir crear clientes',
        'Debe permitir leer clientes',
        'Debe permitir actualizar clientes',
        'Debe permitir eliminar clientes',
        'Debe persistir datos localmente',
        'Debe validar campos obligatorios'
      ]
    };

    const result = createToolFromSpecification(spec);
    
    // Verificar manifiesto
    expect(result.manifest.name).toBe('Gestor Clientes');
    expect(result.manifest.category).toBe('crud');
    expect(result.manifest.status).toBe('GENERATED');
    expect(result.manifest.permissions).toContain('read_data');
    expect(result.manifest.permissions).toContain('write_data');
    expect(result.manifest.acceptanceCriteria).toHaveLength(6);
    
    // Verificar código generado
    expect(result.generatedCode).toContain('handleCreate');
    expect(result.generatedCode).toContain('handleUpdate');
    expect(result.generatedCode).toContain('handleDelete');
    expect(result.generatedCode).toContain('enablePersistence');
    expect(result.generatedCode).toContain('localStorage');
    expect(result.generatedCode).toContain('validateForm');
    
    // Verificar documentación
    expect(result.documentation).toContain('Gestor Clientes');
    expect(result.documentation).toContain('crud');
    
    // Verificar persistencia versionada
    expect(result.persistentData.versions).toHaveLength(1);
    expect(result.persistentData.versions[0].status).toBe('GENERATED');
  });
});
