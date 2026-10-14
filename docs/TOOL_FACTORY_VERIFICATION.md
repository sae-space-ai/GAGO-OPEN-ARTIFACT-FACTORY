TOOL FACTORY — CORRECTIONS AND VERIFICATION

Scope
This change is isolated to Tool Factory, its generated artifacts and the CI configuration.

Delivered
1. Fifteen concrete generated React/TypeScript tools. Each generator has a distinct local functional operation:
   dashboard (metrics), form (fields and validation), CRUD (records persisted locally),
   calculator (arithmetic), table (filter/sort), report (editor/print),
   API client (explicit public HTTPS GET), validator (JSON required fields),
   comparator (two values), evidence manager (local records, never auto-verified),
   Qwen order (text editor), workflow builder (local step design only),
   model spec (JSON manifest), budget calculator (resource totals),
   log analyzer (log-level summary).
2. Every template preloads editable inputs and outputs. Changing to a different template
   with populated fields asks for confirmation before replacing them.
3. Every new tool's code and documentation are stored with its manifest in the existing
   local application state. Existing manifests continue to load; if they lack source code,
   the UI reports that limitation rather than reconstructing fictitious original code.
4. Two export formats: the original single .tsx, and a full Vite React TypeScript ZIP
   containing package.json, tsconfig.json, vite.config.ts, HTML, source, styles,
   smoke test, manifest, .gitignore and README.
5. Component naming is normalized to a valid TypeScript identifier.
6. CI now uses Node 24 and npm test runs Vitest instead of silently skipping testing.
   A dedicated Tool Factory CI job tests this module separately without hiding failures
   in the global suite.

Tests
- 9 existing Tool Factory tests.
- 21 generated-project tests: all 15 templates, syntax, actual React typechecking,
  ZIP structure, category validation, name safety and manifest recovery.
- 18 runtime tests: mount all 15 generated UIs, verify CRUD operations and local
  persistence, calculator behavior and table filtering.
- TypeScript checks and Vite build pass in the complete CI job.

Known limits
- Generated code is a working initial local tool, not a production-grade solution
  for all conceivable inputs, integrations or security requirements.
- CRUD and evidence storage are browser-local; they are not multiuser databases.
- The workflow template builds local workflow drafts; it does not execute remote services.
- The Qwen template produces development orders, not a live model connection.
- Model specification does not train models.
- The API template is for browser-side public HTTPS GET only and sends no API secrets.
- The existing browser localStorage can fill up with many large generated code bundles;
  tool manifests should remain small and users should export source projects regularly.
- The exported ZIP is generated directly in the browser; users must still run
  npm install, npm run test and npm run build on the generated project.

Global gate
The previously configured CI used npm run test --if-present with no npm test script.
Activating full Vitest uncovered 26 failing tests elsewhere in the existing project,
including Scope Matrix, JOULE, Phase 3 connections and the Approval Engine. Those
modules were not changed by this Tool Factory correction. The global CI must remain
red until those failures have been diagnosed and fixed or genuinely superseded under
a documented change in requirements. Do not merge this draft PR into production
merely because the dedicated Tool Factory job is green.

Deployment
Vercel automatically creates a preview for this branch. Inspect the exact SHA
for the current preview; do not confuse preview readiness with full release acceptance.

Rollback
Close the draft PR without merging or delete only the new feature branch.
The production main branch and its stored user data remain unchanged.
