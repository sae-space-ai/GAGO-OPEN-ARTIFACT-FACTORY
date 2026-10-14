import { describe, it, expect } from 'vitest';
import { generateQwenOrder } from '../services/qwen-generator';
import type { QwenOrder, Project } from '../types';

describe('Qwen Order Generator', () => {
  const mockProject: Project = {
    id: 'test-id',
    name: 'Test Project',
    description: 'A test project',
    status: 'development',
    priority: 'high',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    archived: false,
  };

  it('generates a document with the objective', () => {
    const order: QwenOrder = {
      projectId: 'test-id',
      objective: 'Build a login page',
      requirements: ['Must use React', 'Must be responsive'],
      constraints: ['No external CSS frameworks'],
      acceptanceCriteria: ['User can log in', 'Form validates inputs'],
      generatedAt: '2025-01-15T10:00:00.000Z',
    };

    const doc = generateQwenOrder(order, mockProject);
    expect(doc).toContain('Build a login page');
    expect(doc).toContain('Test Project');
    expect(doc).toContain('Must use React');
    expect(doc).toContain('Must be responsive');
    expect(doc).toContain('No external CSS frameworks');
    expect(doc).toContain('User can log in');
    expect(doc).toContain('Form validates inputs');
  });

  it('indicates the order has not been executed', () => {
    const order: QwenOrder = {
      projectId: '',
      objective: 'Test',
      requirements: [],
      constraints: [],
      acceptanceCriteria: [],
      generatedAt: new Date().toISOString(),
    };

    const doc = generateQwenOrder(order);
    expect(doc).toContain('No ejecutada');
    expect(doc).toContain('generada localmente');
  });

  it('handles empty requirements gracefully', () => {
    const order: QwenOrder = {
      projectId: '',
      objective: 'Simple task',
      requirements: [],
      constraints: [],
      acceptanceCriteria: [],
      generatedAt: new Date().toISOString(),
    };

    const doc = generateQwenOrder(order);
    expect(doc).toContain('Sin requisitos específicos');
    expect(doc).toContain('Simple task');
  });
});
