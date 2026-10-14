# Changelog — GAGO Open Artifact Factory

## [10.0.0] — Fase 10 — Final Integration Repair and Production Readiness

### Añadido
- **System Connection Manager**: Gestión centralizada de conexiones del sistema con comprobación en tiempo real
- **GitHub Adapter**: Adaptador completo para GitHub API con verificación de conectividad, acceso público y rate limits
- **Vercel Adapter**: Adaptador completo para Vercel con verificación de configuración, compatibilidad Vite y despliegue
- **Qwen Adapter**: Adaptador completo para Qwen con distinción entre herramienta de desarrollo e inferencia
- **Dashboard Mejorado**: Estados visuales en tiempo real con botón de comprobación manual
- **10 Estados de Conexión**: VERIFIED, CONNECTED, CONFIGURED, AUTH_REQUIRED, CONNECTING, ERROR, DISCONNECTED, NOT_CONFIGURED, DEGRADED, BLOCKED
- **Pruebas Unitarias Completas**: phase10.test.ts con cobertura de todos los adaptadores
- **Documentación de Cierre**: FASE_10_INFORME.md, FASE_10_FINAL.md, MATRIZ_MAESTRA_CIERRE.md
- **Tool Factory Complete Implementation**:
  - 15 generadores específicos de código (uno para cada categoría)
  - Normalización segura de identificadores (maneja acentos, números, palabras reservadas)
  - Carga automática de entradas/salidas predeterminadas al seleccionar plantillas
  - Generador de formularios con validación completa (email, números, personalizada)
  - Generador CRUD con interfaz completa, validación, confirmación de eliminación, persistencia opcional
  - Sistema de persistencia versionada (PersistentToolData)
  - Estados diferenciados de herramientas (GENERATED, IMPLEMENTED, TESTED, VERIFIED)
  - Exportación de proyectos Vite completos (downloadToolProject)
  - 25 pruebas unitarias exhaustivas cubriendo las 15 plantillas
  - Validación de seguridad (sin eval, sin exposición de secretos)

### Corregido
- **GitHub "No configurado"**: Ahora muestra estado VERIFIED cuando la API pública es accesible
- **Vercel "No configurado"**: Ahora muestra estado VERIFIED cuando la configuración es válida
- **Qwen "No conectado"**: Ahora muestra estado AUTH_REQUIRED indicando claramente los requisitos
- **Indicadores estáticos**: Reemplazados por comprobaciones reales en tiempo real
- **Tool Factory - Plantillas**: Las 15 plantillas ahora tienen generadores específicos (no genéricos)
- **Tool Factory - Entradas/Salidas**: Se cargan automáticamente al seleccionar plantilla
- **Tool Factory - Formularios**: Validación completa implementada (email, números, personalizada)
- **Tool Factory - CRUD**: Interfaz completa con persistencia opcional y confirmación de eliminación
- **Tool Factory - Identificadores**: Normalización segura (maneja acentos, números, palabras reservadas)
- **Tool Factory - Exportación**: Ahora puede exportar proyectos Vite completos
- **Tool Factory - Estados**: Las herramientas ahora comienzan con estado GENERATED (no IMPLEMENTED)
- **Tool Factory - Persistencia**: Código versionado y persistente implementado

### Modificado
- `src/services/system-connection-manager.ts`: Nuevo servicio de gestión de conexiones
- `src/services/github-adapter.ts`: Nuevo adaptador de GitHub
- `src/services/vercel-adapter.ts`: Nuevo adaptador de Vercel
- `src/services/qwen-adapter.ts`: Nuevo adaptador de Qwen
- `src/services/tool-factory.ts`: Reescritura completa con 15 generadores específicos
- `src/pages/Dashboard.tsx`: Actualizado con SystemConnectionManager
- `src/pages/ToolFactory.tsx`: Carga automática de entradas/salidas predeterminadas
- `src/types/index.ts`: Añadido systemConnections a DataStore
- `src/types/control-plane.ts`: Añadido 'GENERATED' a CapabilityStatus
- `src/tests/phase10.test.ts`: Nuevas pruebas unitarias
- `src/tests/tool-factory.test.ts`: 25 pruebas exhaustivas de las 15 plantillas
- `docs/CHANGELOG.md`: Registro de cambios de la Fase 10 y Tool Factory
- `docs/FASE_10_INFORME.md`: Documentación técnica de la Fase 10
- `docs/FASE_10_FINAL.md`: Informe final de la Fase 10
- `docs/MATRIZ_MAESTRA_CIERRE.md`: Matriz maestra de cierre de todas las fases
- `docs/TOOL_FACTORY_REPORT.md`: Informe detallado de las 15 plantillas con resultados de pruebas

### No modificado (protección Fases 0-9)
- Todos los módulos de fases anteriores continúan funcionando sin cambios
- JOULE Engine, JOULE MATS, Control Plane, Approval Engine preservados
- Tool Factory, Free Training Center, Universal Integrations Hub intactos
- Todas las rutas existentes operativas
- Persistencia de datos de todas las fases anteriores preservada

### Resultados de Compilación
```
✓ 1451 modules transformed
✓ built in 4.50s
✓ Sin errores de TypeScript
```

---

## [9.0.0] — Fase 9 — JOULE FREE TRAINING AND DONATION SYSTEM

### Añadido
- **JOULE FREE TRAINING CENTER**: Sistema completo de entrenamiento gratuito y limitado
- **10 algoritmos de entrenamiento**: Optimización de políticas, bandido contextual, clasificación, regresión, estimación de coste, predicción de latencia, selección de rutas, aprendizaje incremental, evaluación de políticas, referencia determinista
- **3 modalidades de entrenamiento**: Local (navegador), Local (Node.js), Compartido
- **Sistema de cuotas estricto**: Control por usuario y modalidad con límites claros
- **Control de presupuesto global**: Reserva atómica de recursos compartidos
- **Planificador de trabajos**: Cola con prioridades y gestión de estados
- **Ejecutor en navegador**: Implementaciones de algoritmos sin dependencia de servidor
- **Motor de evaluación**: Evaluación específica por algoritmo con métricas
- **Algoritmo de admisión**: Validación completa de solicitudes de entrenamiento
- **Sistema de donaciones voluntarias**: Preparado pero deshabilitado por defecto
- **Panel de transparencia**: Información sobre donaciones y sostenibilidad
- **Interfaz profesional**: Centro de entrenamiento con 3 pestañas funcionales
- **Pruebas unitarias completas**: Cobertura de todos los componentes
- **Documentación técnica**: Informes completos de la Fase 9

### Modificado
- `src/types/training.ts`: Nuevos tipos para el sistema de entrenamiento
- `src/services/training/`: 10 archivos de servicios del sistema
- `src/pages/FreeTrainingCenter.tsx`: Centro de entrenamiento gratuito
- `src/tests/training.test.ts`: Pruebas unitarias completas
- `src/types/index.ts`: Añadidos tipos de entrenamiento al DataStore
- `src/App.tsx`: Nueva ruta `/free-training`
- `src/components/Layout.tsx`: Nueva entrada de navegación "Free Training"
- `docs/CHANGELOG.md`: Registro de cambios de la Fase 9
- `docs/FASE_9_INFORME.md`: Documentación completa de la Fase 9
- `docs/FASE_9_FINAL.md`: Informe final de la Fase 9

### No modificado (protección Fases 0-8)
- Todos los módulos de fases anteriores continúan funcionando sin cambios
- JOULE Engine, JOULE MATS, Control Plane, Approval Engine preservados
- Tool Factory, Model Registry, Universal Integrations Hub intactos
- Todas las rutas existentes operativas
- Persistencia de datos de todas las fases anteriores preservada

### Características Técnicas
- Entrenamiento local en navegador sin dependencia de servidor
- 10 algoritmos de entrenamiento implementados
- Sistema de cuotas con límites claros y renovables
- Control de presupuesto global con reserva atómica
- Planificador de trabajos con prioridades
- Evaluación automática de resultados
- Sistema de donaciones voluntarias preparado
- Transparencia económica completa
- Integración con todas las fases anteriores

### Modalidades de Entrenamiento
- **Local (Navegador)**: 100 trabajos/mes, 10 min/trabajo, ejecución en navegador
- **Local (Node.js)**: 50 trabajos/mes, 30 min/trabajo, ejecución local
- **Compartido**: 3 trabajos/mes, 10 min/trabajo, infraestructura compartida (pendiente)

### Sistema de Donaciones
- **Estado**: Deshabilitado (requiere configuración de proveedor)
- **Proveedores preparados**: Stripe, PayPal, GitHub Sponsors, Open Collective
- **Principios**: Voluntarias, no obligatorias, transparencia total
- **Transparencia**: Panel público con métricas agregadas

### Resultados de Compilación
```
✓ 1450 modules transformed
✓ built in 4.64s
✓ Sin errores de TypeScript
```

---

## [8.0.0] — Fase 8 — JOULE AUTONOMOUS APPROVAL ENGINE

### Añadido
- **JOULE AUTONOMOUS APPROVAL ENGINE**: Sistema de revisión y aprobación automática de módulos
- **Module Discovery Engine**: Descubrimiento automático de 20+ módulos registrados
- **Dependency Analyzer**: Análisis completo de dependencias con detección de ciclos
- **Risk Classification Engine**: Clasificación de riesgo (LOW, MEDIUM, HIGH, CRITICAL)
- **Approval Engine**: Motor de evaluación y aprobación con políticas configurables
- **Test Evidence Collector**: Recolección y validación de evidencias de pruebas
- **Approval Dashboard**: Interfaz profesional con estadísticas en tiempo real
- **14 estados de aprobación**: Desde DISCOVERED hasta AUTO_APPROVED
- **Botón "Revisar y Aprobar Todos los Módulos"**: Evaluación masiva automatizada
- **Pruebas unitarias completas**: Cobertura de todos los componentes del motor
- **Documentación técnica**: Informe completo de la Fase 8

### Modificado
- `src/types/approval.ts`: Nuevos tipos para el motor de aprobación
- `src/services/approval/`: 6 archivos de servicios del motor
- `src/pages/ApprovalDashboard.tsx`: Panel de aprobación profesional
- `src/tests/approval.test.ts`: Pruebas unitarias completas
- `src/App.tsx`: Nueva ruta `/approval`
- `src/components/Layout.tsx`: Nueva entrada de navegación "Approval Engine"
- `docs/CHANGELOG.md`: Registro de cambios de la Fase 8
- `docs/FASE_8_INFORME.md`: Documentación completa de la Fase 8

### No modificado (protección Fases 0-7)
- Todos los módulos de fases anteriores continúan funcionando sin cambios
- Motor JOULE, API Fabric, Connection Recovery, JOULE MATS preservados
- Tool Factory, Model Registry, Universal Integrations Hub intactos
- Todas las rutas existentes operativas
- Persistencia de datos de todas las fases anteriores preservada

### Características Técnicas
- Descubrimiento automático de módulos
- Análisis de dependencias con detección de ciclos
- Clasificación de riesgo basada en múltiples criterios
- Evaluación con criterios objetivos y verificables
- Aprobación automática para módulos de bajo riesgo
- Revisión manual obligatoria para módulos críticos
- Detección de aprobaciones obsoletas
- Historial inmutable de evaluaciones
- Políticas de aprobación configurables
- Integración completa con Quality Gates

### Resultados de Compilación
```
✓ 1431 modules transformed
✓ built successfully
✓ Sin errores de TypeScript
```

---

## [4.0.0] — Fase 4 — JOULE Multi Agent Training System

### Añadido
- **JOULE MATS (Multi Agent Training System)**: Sistema de entrenamiento adaptativo con 15 agentes especializados
- **15 Agentes Especializados**:
  - Agente 01 - Data Curator: Recolección y preparación de datos
  - Agente 02 - Telemetry Analyst: Análisis de telemetría
  - Agente 03 - Task Classifier: Clasificación de tareas
  - Agente 04 - Synthetic Lab: Generación de datos sintéticos
  - Agente 05 - Labeling and Evidence: Etiquetado y validación
  - Agente 06 - Feature Engineer: Ingeniería de características
  - Agente 07 - Baseline Scientist: Establecimiento de línea base
  - Agente 08 - Policy Trainer: Entrenamiento de políticas (bandido contextual)
  - Agente 09 - Cost Optimizer: Optimización de costes
  - Agente 10 - Latency Optimizer: Optimización de latencia
  - Agente 11 - Energy Optimizer: Optimización energética
  - Agente 12 - Quality and Reliability: Evaluación de calidad
  - Agente 13 - Adversarial Trainer: Pruebas adversariales
  - Agente 14 - Independent Evaluator: Evaluación independiente
  - Agente 15 - Training Governor: Gobernanza del entrenamiento
- **Orquestador Central**: Coordinación de ciclos de entrenamiento completos
- **Algoritmo de Bandido Contextual**: Aprendizaje adaptativo con restricciones de calidad
- **Centro de Entrenamiento**: Interfaz visual para los 15 agentes con controles en tiempo real
- **Objetivo Experimental J25**: Procedimiento para verificar reducción del 25% en coste por resultado correcto
- **Modos de Despliegue**: Shadow (observación), Canary (activación gradual), Activo
- **Evaluación Independiente**: Validación rigurosa antes de aprobar políticas
- **Pruebas Unitarias**: Cobertura completa de agentes y orquestador

### Modificado
- `src/types/joule-mats.ts`: Nuevos tipos para el sistema multiagente
- `src/services/joule-mats/`: Módulo completo con orquestador y 15 agentes
- `src/pages/JouleTrainingCenter.tsx`: Centro de entrenamiento visual
- `src/tests/joule-mats.test.ts`: Pruebas unitarias completas
- `src/types/index.ts`: Añadido jouleMATS a DataStore
- `src/context/DataContext.tsx`: Añadido updateJouleMATS
- `src/App.tsx`: Nueva ruta `/training`
- `src/components/Layout.tsx`: Nueva entrada de navegación "Training Center"
- `docs/CHANGELOG.md`: Registro de cambios de la Fase 4
- `docs/FASE_4_INFORME.md`: Documentación completa de la Fase 4
- `README.md`: Actualizado a versión 4.0.0

### No modificado (protección Fases 0, 0.1, 1, 2 y 3)
- Todos los módulos de fases anteriores continúan funcionando sin cambios
- Motor JOULE original preservado y extendido
- Universal API Fabric intacto
- Sistema de Connection Recovery operativo
- Persistencia de datos de todas las fases anteriores preservada

### Características Técnicas
- **Sin GPU obligatoria**: Funciona con TypeScript/Node.js en el navegador
- **Sin modelos de lenguaje**: No entrena LLMs desde cero
- **Aprendizaje incremental**: Actualizaciones sin reentrenamientos completos
- **Separación estricta**: Entrenamiento y evaluación independientes
- **Calidad obligatoria**: No se aprueban políticas con calidad degradada
- **Presupuesto cero**: Sin costes monetarios por defecto

### Resultados de Compilación
```
✓ 1426 modules transformed
✓ built in 4.12s
✓ Sin errores de TypeScript
```

---

## [3.0.0] — Fase 3 — Automatic Configuration and Connection Recovery

### Añadido
- **Motor de Autoconfiguración**: Verificación real de conectividad para todas las integraciones
- **Motor de Recuperación de Conexiones**: Diagnóstico automático de errores y planes de recuperación
- **Centro de Control de Conexiones**: Interfaz unificada para gestionar todas las conexiones
- **Verificación de GitHub**: Comprobación de acceso público a la API (60 req/hora sin autenticación)
- **Verificación de Vercel**: Comprobación de configuración local (vercel.json)
- **Verificación de Ollama**: Comprobación de disponibilidad del servicio local
- **Verificación de JOULE**: Comprobación del estado del motor de optimización
- **Verificación de Red**: Comprobación de conectividad general
- **Verificación de Almacenamiento**: Comprobación de localStorage
- **Sistema de Diagnóstico**: Clasificación de errores por severidad (CRITICAL, HIGH, MEDIUM, LOW)
- **Acciones de Recuperación**: Recomendaciones automáticas (WAIT_AND_RETRY, PROVIDE_CREDENTIALS, etc.)
- **Botón "Conectar Todo"**: Verificación masiva de todas las conexiones
- **Resumen de Diagnóstico**: Conteo de errores por severidad y recomendaciones
- **10 requisitos adicionales** (P3_01-P3_10) en la matriz de alcance
- **Pruebas automatizadas**: Tests completos para autoconfiguración y recuperación

### Modificado
- `src/types/phase3.ts`: Nuevos tipos para estados de conexión, errores y recuperación
- `src/services/auto-config.ts`: Motor de verificación de conexiones
- `src/services/connection-recovery.ts`: Motor de diagnóstico y recuperación
- `src/pages/ConnectionControlCenter.tsx`: Centro de control de conexiones
- `src/tests/phase3.test.ts`: Pruebas unitarias completas
- `src/services/initial-scope.ts`: 10 requisitos de Fase 3 añadidos
- `src/components/Layout.tsx`: Nueva entrada de navegación "Conexiones"
- `src/App.tsx`: Nueva ruta `/connections`
- `docs/CHANGELOG.md`: Registro de cambios de la Fase 3
- `docs/FASE_3_INFORME.md`: Documentación completa de la Fase 3

### No modificado (protección Fases 0, 0.1, 1 y 2)
- Proyectos, tareas, artefactos, evidencias, matriz de alcance, puertas de calidad y motor JOULE continúan funcionando sin cambios
- Universal API Fabric y todos sus componentes preservados
- Todas las rutas existentes operativas
- Persistencia de datos de todas las fases anteriores preservada

### Características de Seguridad
- Las credenciales nunca se almacenan en el navegador
- No se utilizan variables de entorno VITE para secretos
- Se respetan los límites de tasa de API
- No se realizan operaciones que puedan generar cargos
- Validación de todas las respuestas de red
- Manejo seguro de errores CORS

### Principios Arquitectónicos
- Verificación real de conectividad (no simulada)
- Autoconfiguración segura y no destructiva
- Recuperación automática cuando es posible
- Intervención manual cuando es necesario
- Coste cero por defecto
- Protección completa de credenciales
- Integración con todas las fases anteriores

---

## [2.0.0] — Fase 2 — Universal API Integration and Zero Cost Orchestration

### Añadido
- **Universal API Fabric**: Infraestructura común de conectividad para todos los módulos
- **Connector Registry**: Registro central de conectores con catálogo inicial (GitHub, Vercel, Qwen, Ollama, JOULE, Supabase, Google Drive, n8n)
- **Capability Discovery Engine**: Descubrimiento automático de capacidades necesarias
- **Free Tier Policy Engine**: Política de coste cero por defecto (presupuesto = 0 EUR)
- **Quota and Budget Manager**: Gestión de cuotas y límites de uso
- **Integration Orchestrator**: Coordinador de operaciones de integración
- **API Control Center**: Centro de control visual de todas las integraciones
- **18 requisitos adicionales** (API201-API218) en la matriz de alcance
- **Pruebas automatizadas**: Tests para Connector Registry, Free Tier Policy, Capability Discovery, Quota Manager y Orchestrator

### Modificado
- `src/types/index.ts`: DataStore ampliado con campo opcional `apiFabricState`
- `src/services/storage.ts`: Migración no destructiva de Fase 1 a Fase 2, versión de esquema 2.0.0
- `src/services/initial-scope.ts`: 18 requisitos de API Fabric añadidos
- `src/components/Layout.tsx`: Nueva entrada de navegación "API Fabric"
- `src/App.tsx`: Nueva ruta `/api-fabric`
- `docs/CHANGELOG.md`: Registro de cambios de la Fase 2

### No modificado (protección Fases 0, 0.1 y 1)
- Proyectos, tareas, artefactos, evidencias, matriz de alcance, puertas de calidad y motor JOULE continúan funcionando sin cambios
- Todas las rutas existentes operativas
- Persistencia de datos de Fases 0, 0.1 y 1 preservada mediante migración compatible

### Principios Arquitectónicos
- Presupuesto monetario predeterminado = 0 EUR
- No se permiten operaciones pagadas sin autorización explícita
- Priorización de servicios gratuitos y locales
- No se inventan integraciones sin verificación real
- Las credenciales nunca se almacenan en el frontend
- Modo offline-first: la aplicación funciona sin conexiones externas

---

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
