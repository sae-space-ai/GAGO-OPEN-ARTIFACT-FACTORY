import type { ToolManifest } from '../types/control-plane';

// Dependency-free ZIP (stored entries) for exporting standalone Vite projects.
const encoder = new TextEncoder();
function u16(value: number): number[] { return [value & 255, (value >>> 8) & 255]; }
function u32(value: number): number[] { return [value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255]; }
function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
export function buildProjectZip(files: Record<string, string>): Blob {
  const locals: number[] = [];
  const central: number[] = [];
  let offset = 0;
  for (const [path, content] of Object.entries(files)) {
    if (path.includes('..') || path.startsWith('/') || path.includes('\\')) throw new Error('Ruta inválida');
    const name = encoder.encode(path);
    const data = encoder.encode(content);
    const checksum = crc32(data);
    const localHeader = [
      ...u32(0x04034b50), ...u16(20), ...u16(0x0800), ...u16(0),
      ...u16(0), ...u16(0), ...u32(checksum), ...u32(data.length),
      ...u32(data.length), ...u16(name.length), ...u16(0)
    ];
    locals.push(...localHeader, ...name, ...data);
    central.push(
      ...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0x0800),
      ...u16(0), ...u16(0), ...u16(0), ...u32(checksum),
      ...u32(data.length), ...u32(data.length), ...u16(name.length),
      ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0),
      ...u32(offset), ...name
    );
    offset += localHeader.length + name.length + data.length;
  }
  const end = [
    ...u32(0x06054b50), ...u16(0), ...u16(0),
    ...u16(Object.keys(files).length), ...u16(Object.keys(files).length),
    ...u32(central.length), ...u32(locals.length), ...u16(0)
  ];
  return new Blob([new Uint8Array([...locals, ...central, ...end])], { type: 'application/zip' });
}

export function buildViteProjectFiles(manifest: ToolManifest, generatedCode: string): Record<string, string> {
  const safeName = manifest.name.toLowerCase().normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')
    .replace(/^-|-$/g, '').slice(0, 60) || 'generated-tool';
  const packageJson = {
    name: safeName,
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts: { dev: 'vite', build: 'tsc --noEmit && vite build', preview: 'vite preview', test: 'node --test' },
    dependencies: { react: '^18.2.0', 'react-dom': '^18.2.0' },
    devDependencies: { '@types/react': '^18.2.0', '@types/react-dom': '^18.2.0', '@vitejs/plugin-react': '^4.3.4', typescript: '^5.7.0', vite: '^6.3.5' }
  };
  const viteConfig = "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({ plugins: [react()] });\n";
  const tsconfig = {
    compilerOptions: { target: 'ES2022', useDefineForClassFields: true, lib: ['ES2022', 'DOM', 'DOM.Iterable'], module: 'ESNext', skipLibCheck: true, moduleResolution: 'Bundler', allowImportingTsExtensions: true, resolveJsonModule: true, isolatedModules: true, noEmit: true, jsx: 'react-jsx', strict: true },
    include: ['src']
  };
  const main = "import React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './App';\nimport './style.css';\ncreateRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);\n";
  const test = "import test from 'node:test';\nimport assert from 'node:assert/strict';\nimport { readFileSync } from 'node:fs';\ntest('generated project includes the component', () => {\n  assert.match(readFileSync('src/App.tsx','utf8'),/export default function/);\n});\n";
  return {
    'package.json': JSON.stringify(packageJson, null, 2) + '\n',
    'tsconfig.json': JSON.stringify(tsconfig, null, 2) + '\n',
    'vite.config.ts': viteConfig,
    'index.html': '<!doctype html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Herramienta generada</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n',
    'src/main.tsx': main,
    'src/App.tsx': generatedCode,
    'src/style.css': 'body{font-family:system-ui,sans-serif;margin:0;background:#f8fafc;color:#0f172a}main{max-width:1100px;margin:auto}button{cursor:pointer;background:#1d4ed8;color:#fff;border:0;border-radius:6px;padding:8px 14px}input,select,textarea{margin:6px;padding:8px;border:1px solid #94a3b8;border-radius:5px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left}pre{overflow:auto;white-space:pre-wrap}\n',
    'tests/smoke.test.mjs': test,
    'manifest.json': JSON.stringify(manifest, null, 2) + '\n',
    'README.md': '# ' + manifest.name + '\n\n' + manifest.description + '\n\nProyecto independiente Vite + React + TypeScript.\n\nInstalar: npm install\n\nDesarrollar: npm run dev\n\nComprobar: npm run test y npm run build\n\nOrigen: GAGO OPEN ARTIFACT FACTORY. La generación NO certifica todas las funciones. Verifica antes de publicar.\n',
    '.gitignore': 'node_modules\ndist\n.env\n.env.local\n'
  };
}

export function downloadViteToolProject(manifest: ToolManifest, code: string): void {
  const files = buildViteProjectFiles(manifest, code);
  const blob = buildProjectZip(files);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = manifest.name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9-]/g, '-') + '-vite.zip';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
