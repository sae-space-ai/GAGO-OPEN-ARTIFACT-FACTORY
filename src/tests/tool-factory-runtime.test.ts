import React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ts from 'typescript';
import { createToolFromSpecification, getAvailableTemplates, getTemplateDefaults } from '../services/tool-factory';
import type { ToolSpecification } from '../types/control-plane';

function trustedGeneratedComponent(category: ToolSpecification['category']) {
  const spec: ToolSpecification = {
    name: 'E2E ' + category, category, description: 'Prueba local controlada',
    ...getTemplateDefaults(category), permissions: [], acceptanceCriteria: []
  };
  const source = createToolFromSpecification(spec).generatedCode;
  const compiled = ts.transpileModule(source, {
    fileName: 'Generated.tsx',
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  const exports: {default?: React.ComponentType} = {};
  // Only evaluate trusted code produced by the repository templates. Never pass arbitrary user code here.
  const allowed = (name: string) => {
    if (name === 'react') return React;
    if (name === 'react/jsx-runtime') return jsxRuntime;
    throw new Error('Unexpected dependency: ' + name);
  };
  new Function('require', 'exports', compiled)(allowed, exports);
  if (!exports.default) throw new Error('Generated component has no default export');
  return exports.default;
}

afterEach(() => { cleanup(); vi.restoreAllMocks(); localStorage.clear(); });

describe('Generated tool runtime smoke tests', () => {
  for (const template of getAvailableTemplates()) {
    it('mounts ' + template.category + ' without crashing', () => {
      const Component = trustedGeneratedComponent(template.category);
      render(React.createElement(Component));
      expect(screen.getByRole('heading', { name: 'E2E ' + template.category })).toBeDefined();
    });
  }

  it('CRUD creates, edits and removes records and persists them', () => {
    const Component = trustedGeneratedComponent('crud');
    const ui = render(React.createElement(Component));
    fireEvent.change(screen.getByRole('textbox', { name: 'Nombre' }), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Correo' }), { target: { value: 'ana@example.org' } });
    fireEvent.click(screen.getByRole('button', { name: 'Añadir' }));
    expect(screen.getByText('Ana')).toBeDefined();
    expect(JSON.parse(localStorage.getItem('toolfactory-crud:E2E crud') || '[]')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Nombre' }), { target: { value: 'Ana María' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(screen.getByText('Ana María')).toBeDefined();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(JSON.parse(localStorage.getItem('toolfactory-crud:E2E crud') || '[]')).toHaveLength(0);
    ui.unmount();
  });

  it('calculates numerical expressions', () => {
    const Component = trustedGeneratedComponent('calculator');
    render(React.createElement(Component));
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Primer número' }), { target: { value: '12' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Segundo número' }), { target: { value: '3' } });
    expect(screen.getByText('Resultado: 15')).toBeDefined();
  });

  it('loads rows into a filterable table', () => {
    const Component = trustedGeneratedComponent('table');
    render(React.createElement(Component));
    fireEvent.click(screen.getByRole('button', { name: 'Cargar datos' }));
    expect(screen.getByText('Ana')).toBeDefined();
    fireEvent.change(screen.getByRole('textbox', { name: 'Filtro' }), { target: { value: 'Luis' } });
    expect(screen.queryByText('Ana')).toBeNull();
    expect(screen.getByText('Luis')).toBeDefined();
  });
});
