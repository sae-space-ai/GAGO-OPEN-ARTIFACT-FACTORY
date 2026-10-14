import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load = path => readFileSync(new URL('../'+path, import.meta.url),'utf8');
const page=load('src/pages/CivilizacionAlgoritmica.tsx');
const app=load('src/App.tsx');
const layout=load('src/components/Layout.tsx');
const styles=load('src/styles/civilizacion-algoritmica.css');
test('Civilización Algorítmica is lazy loaded at a new independent route',()=>{
  assert.match(app,/CivilizacionAlgoritmica = lazy/);
  assert.match(app,/path="\/civilizacion-algoritmica"/);
  assert.match(layout,/to: '\/civilizacion-algoritmica'/);
  assert.match(layout,/label: 'Civilización Algorítmica'/);
});
test('every portal destination maps to an existing application route',()=>{
  const destinations=[...page.matchAll(/(?:href: |to: |to=)"?['"]?(\/[a-z-]+)['"]?/g)].map(x=>x[1]);
  const known=new Set([...app.matchAll(/<Route path="([^"]+)"/g)].map(x=>x[1]));
  for(const d of destinations){assert.ok(known.has(d),'Broken portal route: '+d);}
  assert.ok(destinations.length>=10,'Portal must link to existing functional modules');
});
test('all displayed operational counters originate from actual store',()=>{
  assert.match(page,/const \{ store \} = useData\(\)/);
  assert.match(page,/store\.projects/);
  assert.match(page,/store\.tasks/);
  assert.match(page,/store\.artifacts|store\.tools/);
  assert.match(page,/store\.evidence/);
  assert.match(page,/store\.jouleState/);
});
test('branded UI is read-only with scoped CSS, no new persistence',()=>{
  assert.ok(styles.includes('.ca{')||styles.includes('.ca {'));
  assert.ok(!styles.includes('body{')&&!styles.includes('body {'));
  assert.ok(!page.includes('localStorage.')&&!page.includes('saveStore('));
  assert.ok(!page.includes('updateJouleState('));
  assert.ok(!page.includes('fetch('));
  assert.ok(!page.includes('setInterval('));
});
test('responsiveness, keyboard focus and reduced motion are supported',()=>{
  assert.match(styles,/@media\(max-width:540px\)/);
  assert.match(styles,/@media\(prefers-reduced-motion: reduce\)/);
  assert.match(styles,/:focus-visible/);
});
