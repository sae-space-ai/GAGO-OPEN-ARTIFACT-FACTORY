# Changelog — GAGO Open Artifact Factory

## [0.1.1] — Fase 0.1 — Matriz de Alcance Ejecutable

### Añadido
- **Matriz de Alcance**: Nueva sección para gestionar requisitos de desarrollo con estados de implementación, pruebas y verificación.
- **16 requisitos iniciales** (M01-M16) instalados de forma idempotente.
- **Puertas de Calidad (Quality Gates)**: 8 puertas de validación (GATE 01-GATE 08) con estados pendientes, superadas, fallidas y bloqueadas.
- **Servicio de dependencias**: Detección de ciclos, validación de grafos y cálculo de dependencias transitivas.
- **Panel de progreso**: Indicadores calculados a partir de datos reales (total, implementados, probados, verificados, bloqueados, porcentajes).
- **Integración con generador Qwen**: Selección de requisitos de la matriz para generar órdenes de desarrollo.
- **Indicador de progreso en el Centro de Mando**: Resumen de la matriz accesible desde el dashboard.
- **Migración de esquema**: Compatibilidad con datos de la Fase 0 (esquema 0.1.0 → 0.1.1).
- **Pruebas automatizadas**: Tests para la matriz, dependencias, migración y puertas de calidad.

### Modificado
- `src/types/index.ts`: DataStore ampliado con campos opcionales `scopeMatrix` y `qualityGates`.
- `src/services/storage.ts`: Migración automática, operaciones CRUD para matriz y puertas.
- `src/context/DataContext.tsx`: Nuevas operaciones expuestas para matriz y puertas.
- `src/components/Layout.tsx`: Nuevas entradas de navegación (Matriz de Alcance, Puertas de Calidad).
- `src/pages/Dashboard.tsx`: Widget de progreso de la matriz.
- `src/pages/QwenGenerator.tsx`: Integración con selección de requisitos.

### No modificado (protección Fase 0)
- Proyectos, tareas, artefactos y evidencias continúan funcionando sin cambios.
- Configuración, integraciones y generador Qwen mantienen su comportamiento original.
- Persistencia de datos de la Fase 0 preservada mediante migración compatible.
- Rutas existentes continúan operativas.

---

## [0.1.0] — Fase 0 — Fundamentos

### Añadido
- Aplicación web con Vite, React, TypeScript y Tailwind CSS.
- Centro de Mando con estadísticas y actividad reciente.
- Gestión de proyectos (CRUD completo).
- Gestión de tareas asociadas a proyectos.
- Registro de artefactos digitales.
- Registro de evidencias técnicas.
- Generador local de órdenes para Qwen Coder.
- Estado de integraciones (GitHub, Vercel, Qwen, JOULE).
- Configuración con tema claro/oscuro.
- Importación y exportación de datos.
- Pruebas automatizadas con Vitest.
- Configuración de Vercel y GitHub Actions.
- Documentación de arquitectura y fases.
