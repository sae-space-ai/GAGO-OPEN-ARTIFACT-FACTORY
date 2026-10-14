# Changelog — GAGO Open Artifact Factory

## [1.0.0] — Fase 1 — Integración Transversal de JOULE

### Añadido
- **Motor JOULE**: Adaptive Resource Optimization Engine con 7 componentes coordinados (Observe, Profile, Predict, Optimize, Execute, Verify, Learn).
- **Modo Shadow**: Observación sin modificación del comportamiento funcional.
- **Modo Canary**: Activación gradual (1%, 5%, 20%, 100%) con evidencia requerida.
- **Kill Switch**: Interruptor de reversión inmediata que restaura el comportamiento de referencia.
- **Políticas de recursos**: Catálogo con políticas Reference, Conservative, Shadow y Canary.
- **Centro de Mando JOULE**: Nueva página (`/joule`) con métricas, decisiones y controles.
- **14 requisitos adicionales** (J01-J14) en la matriz de alcance para JOULE.
- **Contratos TypeScript**: Especificación completa de perfiles, rutas, decisiones, mediciones y verificaciones.
- **Algoritmo de optimización**: Selección adaptativa de rutas con restricciones de seguridad, privacidad y presupuesto.
- **Mapa de experiencia**: Registro histórico que solo aprende de observaciones verificadas.
- **Métrica central**: Coste por resultado correcto (incluye todos los intentos).
- **Pruebas automatizadas**: Tests para el motor, clasificador, optimizador, restricciones y aprendizaje.

### Modificado
- `src/types/index.ts`: DataStore ampliado con campo opcional `jouleState`.
- `src/services/storage.ts`: Migración no destructiva de Fase 0/0.1 a Fase 1, operaciones CRUD para JOULE.
- `src/context/DataContext.tsx`: Nueva operación `updateJouleState` expuesta.
- `src/services/initial-scope.ts`: 14 requisitos de JOULE añadidos a la matriz.
- `src/components/Layout.tsx`: Nueva entrada de navegación "JOULE".
- `src/App.tsx`: Nueva ruta `/joule`.

### No modificado (protección Fases 0 y 0.1)
- Proyectos, tareas, artefactos, evidencias, matriz de alcance y puertas de calidad continúan funcionando sin cambios.
- Configuración, integraciones y generador Qwen mantienen su comportamiento original.
- Persistencia de datos de Fases 0 y 0.1 preservada mediante migración compatible.
- Rutas existentes continúan operativas.

### Principios Arquitectónicos
- JOULE NO sustituye la factoría. JOULE gobierna el consumo de recursos.
- La plataforma sigue siendo funcional si JOULE está desactivado.
- La calidad, seguridad y controles de aprobación tienen prioridad sobre cualquier ahorro.
- No se inventan métricas de CPU, RAM, GPU o energía sin telemetría válida.
- No se presentan estimaciones como mediciones.
- No se atribuyen ahorros sin mediciones verificables.

---

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
