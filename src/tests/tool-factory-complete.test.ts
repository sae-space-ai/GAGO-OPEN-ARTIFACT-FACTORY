import { describe, it, expect } from 'vitest';
import ts from 'typescript';
import { createToolFromSpecification, getAvailableTemplates, getTemplateDefaults, validateToolSpecification } from '../services/tool-factory';
import { buildProjectZip, buildViteProjectFiles } from '../services/tool-export';
import { safeComponentName, templateHasFunctionalGenerator } from '../services/tool-code-generators';
import type { ToolSpecification } from '../types/control-plane';

const all = getAvailableTemplates();
function specification(category: ToolSpecification['category']): ToolSpecification {
  return {
    name: 'Prueba ' + category,
    category,
    description: 'Prueba independiente de ' + category,
    ...getTemplateDefaults(category),
    permissions: [],
    acceptanceCriteria: ['Generar código sintácticamente válido']
  };
}
describe('Tool Factory: fifteen generators', () => {
  it('includes exactly fifteen distinct categories with defaults', () => {
    expect(all).toHaveLength(15);
    expect(new Set(all.map(t => t.category)).size).toBe(15);
    for (const template of all) {
      const defaults = getTemplateDefaults(template.category);
      expect(defaults.inputs.length).toBeGreaterThan(0);
      expect(defaults.outputs.length).toBeGreaterThan(0);
      expect(templateHasFunctionalGenerator(template.category)).toBe(true);
    }
  });

  for (const template of all) {
    it('creates a TSX module without syntax errors for ' + template.category, () => {
      const spec = specification(template.category);
      expect(validateToolSpecification(spec).valid).toBe(true);
      const {manifest, generatedCode, documentation} = createToolFromSpecification(spec);
      expect(manifest.category).toBe(template.category);
      expect(manifest.sourceCode).toBe(generatedCode);
      expect(manifest.documentation).toBe(documentation);
      expect(manifest.tests).toEqual([]);
      expect(manifest.evidenceIds).toEqual([]);
      expect(generatedCode).toContain('export default function');
      expect(generatedCode).not.toContain('Implementación de ');
      expect(generatedCode).not.toContain('Definir props según entradas');
      const result = ts.transpileModule(generatedCode, {
        fileName: 'App.tsx',
        reportDiagnostics: true,
        compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext }
      });
      expect(result.diagnostics || []).toEqual([]);
      expect(result.outputText).toContain('react/jsx-runtime');
      expect(buildViteProjectFiles(manifest, generatedCode)['src/App.tsx']).toBe(generatedCode);
    });
  }

  it('typechecks generated React components against the actual TypeScript and React types', () => {
    const sources = new Map<string, string>();
    for (const template of all) {
      const source = createToolFromSpecification(specification(template.category)).generatedCode;
      sources.set(ts.sys.resolvePath('src/Generated' + template.category + '.tsx'), source);
    }
    const options: ts.CompilerOptions = {
      target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler, jsx: ts.JsxEmit.ReactJSX,
      strict: true, skipLibCheck: true, noEmit: true, esModuleInterop: true
    };
    const host = ts.createCompilerHost(options);
    const originalRead = host.readFile.bind(host);
    const originalExists = host.fileExists.bind(host);
    host.readFile = file => sources.get(file) ?? originalRead(file);
    host.fileExists = file => sources.has(file) || originalExists(file);
    const program = ts.createProgram([...sources.keys()], options, host);
    const diagnostics = ts.getPreEmitDiagnostics(program);
    expect(diagnostics.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\\n'))).toEqual([]);
  });

  it('exports a structurally valid ZIP with project files', async () => {
    const {manifest, generatedCode} = createToolFromSpecification(specification('crud'));
    const files = buildViteProjectFiles(manifest, generatedCode);
    expect(Object.keys(files)).toContain('package.json');
    expect(Object.keys(files)).toContain('vite.config.ts');
    expect(Object.keys(files)).toContain('src/main.tsx');
    expect(Object.keys(files)).toContain('tests/smoke.test.mjs');
    expect(JSON.parse(files['package.json']).scripts.build).toContain('vite build');
    const zip = buildProjectZip(files);
    const bytes = new Uint8Array(await zip.arrayBuffer());
    expect(Array.from(bytes.subarray(0, 4))).toEqual([0x50,0x4b,0x03,0x04]);
    expect(Array.from(bytes.subarray(bytes.length - 22, bytes.length - 18))).toEqual([0x50,0x4b,0x05,0x06]);
  });

  it('normalizes unsafe or invalid TypeScript component names', () => {
    expect(safeComponentName('123 gestor')).toMatch(/^[A-Za-z_$][A-Za-z0-9_$]*$/);
    expect(safeComponentName('Órdenes & Qwen')).toMatch(/^[A-Za-z_$][A-Za-z0-9_$]*$/);
    expect(safeComponentName('class')).not.toBe('class');
  });

  it('rejects duplicated fields and unsupported categories', () => {
    const spec = specification('crud');
    spec.inputs.push({...spec.inputs[0]});
    expect(validateToolSpecification(spec).valid).toBe(false);
    spec.inputs.pop();
    const invalid = {...spec, category: 'unsupported' as ToolSpecification['category']};
    expect(validateToolSpecification(invalid).valid).toBe(false);
  });

  it('keeps the source recoverable and never claims independent test evidence', () => {
    const {manifest,generatedCode} = createToolFromSpecification(specification('crud'));
    expect(manifest.sourceCode).toBe(generatedCode);
    expect(manifest.tests).toHaveLength(0);
    expect(manifest.evidenceIds).toHaveLength(0);
    expect(manifest.status).not.toBe('VERIFIED');
  });
});
