import { describe, it, expect } from 'vitest';
import { 
  validateToolSpecification, 
  createToolFromSpecification, 
  getAvailableTemplates 
} from '../services/tool-factory';
import type { ToolSpecification } from '../types/control-plane';

describe('Tool Factory', () => {
  describe('validateToolSpecification', () => {
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

    it('debería rechazar permisos no válidos', () => {
      const spec: ToolSpecification = {
        name: 'Mi Herramienta',
        category: 'dashboard',
        description: 'Una herramienta de prueba',
        inputs: [{ name: 'title', type: 'string', required: true, description: 'Título' }],
        outputs: [{ name: 'html', type: 'string', description: 'HTML generado' }],
        permissions: ['invalid_permission'],
        acceptanceCriteria: []
      };

      const result = validateToolSpecification(spec);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Permiso no válido'))).toBe(true);
    });
  });

  describe('createToolFromSpecification', () => {
    it('debería crear una herramienta válida', () => {
      const spec: ToolSpecification = {
        name: 'Panel de Métricas',
        category: 'dashboard',
        description: 'Genera un panel con métricas',
        inputs: [
          { name: 'title', type: 'string', required: true, description: 'Título' },
          { name: 'metrics', type: 'array', required: true, description: 'Métricas' }
        ],
        outputs: [
          { name: 'html', type: 'string', description: 'HTML del panel' }
        ],
        permissions: [],
        acceptanceCriteria: ['Debe generar HTML válido']
      };

      const result = createToolFromSpecification(spec);
      
      expect(result.manifest).toBeDefined();
      expect(result.manifest.name).toBe('Panel de Métricas');
      expect(result.manifest.category).toBe('dashboard');
      expect(result.manifest.status).toBe('IMPLEMENTED');
      expect(result.generatedCode).toContain('Panel de Métricas');
      expect(result.documentation).toContain('Panel de Métricas');
    });

    it('debería generar código para diferentes categorías', () => {
      const categories = ['dashboard', 'form', 'crud', 'table'] as const;
      
      categories.forEach(category => {
        const spec: ToolSpecification = {
          name: `Test ${category}`,
          category,
          description: 'Test',
          inputs: [{ name: 'input', type: 'string', required: true, description: 'Input' }],
          outputs: [{ name: 'output', type: 'string', description: 'Output' }],
          permissions: [],
          acceptanceCriteria: []
        };

        const result = createToolFromSpecification(spec);
        expect(result.generatedCode).toBeTruthy();
        expect(result.manifest.category).toBe(category);
      });
    });

    it('debería lanzar error con especificación inválida', () => {
      const spec: ToolSpecification = {
        name: '',
        category: 'dashboard',
        description: '',
        inputs: [],
        outputs: [],
        permissions: [],
        acceptanceCriteria: []
      };

      expect(() => createToolFromSpecification(spec)).toThrow();
    });
  });

  describe('getAvailableTemplates', () => {
    it('debería devolver todas las plantillas disponibles', () => {
      const templates = getAvailableTemplates();
      
      expect(templates.length).toBeGreaterThan(0);
      expect(templates.some(t => t.category === 'dashboard')).toBe(true);
      expect(templates.some(t => t.category === 'form')).toBe(true);
      expect(templates.some(t => t.category === 'crud')).toBe(true);
    });

    it('cada plantilla debe tener nombre y descripción', () => {
      const templates = getAvailableTemplates();
      
      templates.forEach(template => {
        expect(template.name).toBeTruthy();
        expect(template.description).toBeTruthy();
        expect(template.category).toBeTruthy();
      });
    });
  });
});
