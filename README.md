# GAGO Open Artifact Factory

**Factoría abierta de artefactos digitales y aplicaciones de inteligencia artificial**

Versión: 12.0.0 | Fase 12 | Licencia: MIT

## Descripción

GAGO Open Artifact Factory es una plataforma abierta de desarrollo de software y artefactos digitales. Permite gestionar proyectos, tareas, artefactos y evidencias técnicas, además de generar instrucciones estructuradas para modelos de inteligencia artificial como Qwen Coder.

La Fase 12 implementa JOULE COGNITIVE OPTIMIZATION AND VERIFIED AI ENGINE, un motor de optimización cognitiva y verificación de IA que permite evaluar de forma independiente la calidad del código generado, aprender de evidencias verificadas y optimizar rutas de ejecución basándose en métricas reales.

## Características

### Fase 0 — Fundamentos
- **Centro de Mando**: Panel principal con estadísticas y actividad reciente
- **Gestión de Proyectos**: Crear, editar, archivar y eliminar proyectos
- **Gestión de Tareas**: Tareas asociadas a proyectos con estados y prioridades
- **Registro de Artefactos**: Catálogo de resultados digitales producidos
- **Registro de Evidencias**: Sistema de evidencias técnicas con clasificación
- **Generador de Órdenes Qwen**: Herramienta para preparar instrucciones de desarrollo
- **Estado de Integraciones**: Visualización del estado real de cada conexión
- **Configuración**: Tema claro/oscuro, importación/exportación de datos

### Fase 0.1 — Matriz de Alcance
- **Matriz de Alcance**: 16 requisitos iniciales con estados de implementación, pruebas y verificación
- **Puertas de Calidad**: 8 puertas de validación (GATE 01-GATE 08) con trazabilidad
- **Gestión de Dependencias**: Detección de ciclos y validación de grafos
- **Panel de Progreso**: Indicadores calculados a partir de datos reales
- **Integración Qwen**: Selección de requisitos para generar órdenes de desarrollo
- **Migración Compatible**: Preserva datos de la Fase 0 mediante migración de esquema

### Fase 1 — JOULE Adaptive Resource Optimization Engine
- **Motor JOULE**: 7 componentes coordinados (Observe, Profile, Predict, Optimize, Execute, Verify, Learn)
- **Modo Shadow**: Observación sin modificación del comportamiento funcional
- **Modo Canary**: Activación gradual con evidencia requerida
- **Kill Switch**: Interruptor de reversión inmediata
- **Políticas de Recursos**: Catálogo con políticas Reference, Conservative, Shadow y Canary
- **Centro de Mando JOULE**: Panel con métricas, decisiones y controles
- **Algoritmo de Optimización**: Selección adaptativa de rutas con restricciones de seguridad
- **Mapa de Experiencia**: Registro histórico que solo aprende de observaciones verificadas
- **Métrica Central**: Coste por resultado correcto (incluye todos los intentos)

### Fase 2 — Universal API Integration and Zero Cost Orchestration
- **Universal API Fabric**: Infraestructura común de conectividad para todos los módulos
- **Connector Registry**: Registro central con catálogo de APIs (GitHub, Vercel, Qwen, Ollama, JOULE, Supabase, Google Drive, n8n)
- **Capability Discovery Engine**: Descubrimiento automático de capacidades necesarias
- **Free Tier Policy Engine**: Política de coste cero por defecto (presupuesto = 0 EUR)
- **Quota and Budget Manager**: Gestión de cuotas y límites de uso
- **Integration Orchestrator**: Coordinador de operaciones de integración
- **API Control Center**: Centro de control visual de todas las integraciones
- **Modo Offline-First**: La aplicación funciona sin conexiones externas
- **Seguridad**: Las credenciales nunca se almacenan en el frontend

### Fase 3 — Automatic Configuration and Connection Recovery
- **Motor de Autoconfiguración**: Verificación real de conectividad para todas las integraciones
- **Motor de Recuperación**: Diagnóstico automático de errores y planes de recuperación
- **Centro de Control de Conexiones**: Interfaz unificada para gestionar todas las conexiones
- **Verificación de GitHub**: Comprobación de acceso público a la API
- **Verificación de Vercel**: Comprobación de configuración local
- **Verificación de Ollama**: Comprobación de disponibilidad del servicio local
- **Verificación de JOULE**: Comprobación del estado del motor de optimización
- **Sistema de Diagnóstico**: Clasificación de errores por severidad
- **Botón "Conectar Todo"**: Verificación masiva de todas las conexiones
- **Pruebas Automatizadas**: Tests completos para autoconfiguración y recuperación

### Fase 4 — JOULE MATS (Multi Agent Training System)
- **15 Agentes Especializados**: Data Curator, Telemetry Analyst, Task Classifier, Synthetic Lab, Labeling and Evidence, Feature Engineer, Baseline Scientist, Policy Trainer, Cost Optimizer, Latency Optimizer, Energy Optimizer, Quality and Reliability, Adversarial Trainer, Independent Evaluator, Training Governor
- **Orquestador Central**: Coordinación de ciclos de entrenamiento completos
- **Algoritmo de Bandido Contextual**: Aprendizaje adaptativo con restricciones de calidad
- **Centro de Entrenamiento**: Visualización en tiempo real de los 15 agentes
- **Objetivo J25**: Reducir 25% el coste por resultado correcto manteniendo calidad
- **Modos Shadow/Canary/Activo**: Despliegue progresivo de políticas entrenadas
- **Evaluación Independiente**: Validación rigurosa antes de aprobar políticas
- **Pruebas Unitarias**: Cobertura completa de agentes y orquestador

### Fase 9 — JOULE FREE TRAINING AND DONATION SYSTEM
- **JOULE FREE TRAINING CENTER**: Sistema completo de entrenamiento gratuito y limitado
- **10 Algoritmos de Entrenamiento**: Optimización de políticas, bandido contextual, clasificación, regresión, estimación de coste, predicción de latencia, selección de rutas, aprendizaje incremental, evaluación de políticas, referencia determinista
- **3 Modalidades de Entrenamiento**: Local (navegador), Local (Node.js), Compartido
- **Sistema de Cuotas**: Control estricto por usuario y modalidad
- **Control de Presupuesto Global**: Reserva atómica de recursos compartidos
- **Planificador de Trabajos**: Cola con prioridades y gestión de estados
- **Ejecutor en Navegador**: Implementaciones de algoritmos sin dependencia de servidor
- **Motor de Evaluación**: Evaluación específica por algoritmo con métricas
- **Algoritmo de Admisión**: Validación completa de solicitudes
- **Sistema de Donaciones Voluntarias**: Preparado pero deshabilitado por defecto
- **Panel de Transparencia**: Información sobre donaciones y sostenibilidad
- **Interfaz Profesional**: Centro de entrenamiento con 3 pestañas funcionales
- **Pruebas Unitarias**: Cobertura completa de todos los componentes

### Fase 10 — Final Integration Repair and Production Readiness
- **System Connection Manager**: Gestión centralizada de conexiones con comprobación en tiempo real
- **GitHub Adapter**: Adaptador completo con verificación de API pública, repositorio y rate limits
- **Vercel Adapter**: Adaptador completo con verificación de configuración y compatibilidad Vite
- **Qwen Adapter**: Adaptador completo con distinción entre herramienta de desarrollo e inferencia
- **Dashboard Mejorado**: Estados visuales en tiempo real con botón de comprobación manual
- **10 Estados de Conexión**: VERIFIED, CONNECTED, CONFIGURED, AUTH_REQUIRED, etc.
- **Pruebas Unitarias**: Cobertura completa de todos los adaptadores
- **Corrección de Problemas**: GitHub, Vercel y Qwen ahora muestran estados reales

### Fase 11 — JOULE HYBRID AI PROVIDER ENGINE
- **AI Provider Manager**: Motor central de gestión de proveedores de IA
- **OpenRouter Adapter**: Adaptador completo con modelos gratuitos verificados (Llama 3.2, Llama 3.1, Gemma 2, Mistral 7B, Qwen 2)
- **Ollama Adapter Mejorado**: Adaptador para Ollama local (ahora opcional, no obligatorio)
- **AI Provider Selector**: Algoritmo inteligente de selección con fallback automático
- **Control de Presupuesto**: Sistema de presupuesto cero por defecto
- **Control de Cuotas**: Gestión de límites de uso por proveedor
- **Sistema de Fallback**: Recuperación automática ante fallos de proveedores
- **AI Provider Control Center**: Interfaz profesional para gestión de proveedores
- **Integración con JOULE**: Selección optimizada de proveedores
- **Integración con Tool Factory**: Inferencia de IA para generación de código
- **Seguridad**: API keys nunca se exponen en el frontend
- **Pruebas Unitarias**: Cobertura completa del motor de proveedores

### Fase 12 — JOULE COGNITIVE OPTIMIZATION AND VERIFIED AI ENGINE
- **JOULE TASK INTELLIGENCE**: Clasificador inteligente de solicitudes (10 tipos de tareas, 13 lenguajes)
- **JOULE INDEPENDENT CODE VERIFIER**: Verificación independiente de código en 11 etapas
- **Caso Obligatorio**: Detección del error Math.round(0.1) + Math.round(0.2) = 0
- **JOULE QUALITY EVIDENCE ENGINE**: Sistema de evidencias trazables y verificadas
- **JOULE MODEL BENCHMARK LAB**: Laboratorio con 6 benchmarks reproducibles
- **JOULE RESOURCE OBSERVER**: Observador ampliado de recursos con métricas detalladas
- **JOULE ADAPTIVE ROUTING ENGINE**: Motor de enrutamiento adaptativo basado en evidencia
- **JOULE COGNITIVE CONTROL CENTER**: Interfaz profesional con 4 pestañas
- **Políticas de Enrutamiento**: Configurables con énfasis en calidad y seguridad
- **Puntuación Multi-Factor**: Calidad, fiabilidad, latencia, coste, privacidad, seguridad, energía
- **Pruebas Unitarias**: 100+ pruebas implementadas
- **Seguridad**: No se ejecuta código no confiable sin aislamiento

## Requisitos

- Node.js 20.x o superior (LTS recomendado)
- npm 10.x o superior
- Navegador moderno (Chrome, Firefox, Safari, Edge)

## Instalación

```bash
git clone <repository-url>
cd gago-open-artifact-factory
npm install
```

## Desarrollo

```bash
npm run dev
```

El servidor de desarrollo se iniciará en `http://localhost:3000`.

## Compilación

```bash
npm run build
```

El resultado se genera en el directorio `dist/`.

## Vista previa de producción

```bash
npm run preview
```

## Verificación de tipos

```bash
npm run typecheck
```

## Pruebas

```bash
npm run test
```

## Estructura del proyecto

```
├── .github/workflows/    # CI con GitHub Actions
├── docs/                 # Documentación técnica
├── public/               # Recursos estáticos
├── src/
│   ├── components/       # Componentes reutilizables
│   ├── context/          # Contextos de React (datos, tema)
│   ├── pages/            # Páginas/módulos
│   ├── services/         # Lógica de negocio y persistencia
│   ├── types/            # Modelos de datos TypeScript
│   ├── App.tsx           # Componente raíz con rutas
│   ├── main.tsx          # Punto de entrada
│   └── index.css         # Estilos globales
├── index.html
├── vercel.json           # Configuración de Vercel
├── vite.config.js        # Configuración de Vite
├── tsconfig.json         # Configuración de TypeScript
├── package.json
├── LICENSE               # MIT
└── README.md
```

## Despliegue en Vercel

La aplicación está configurada para desplegarse en Vercel como sitio estático:

1. Conecta el repositorio de GitHub a Vercel
2. Vercel detectará automáticamente Vite como framework
3. El comando de build es `npm run build`
4. El directorio de salida es `dist/`
5. Las rutas de React Router funcionan mediante rewrites en `vercel.json`

## Limitaciones conocidas

- Los datos se almacenan en `localStorage` del navegador. No están sincronizados entre dispositivos.
- No existe autenticación ni autorización en esta fase.
- No hay conexión real con APIs externas (GitHub, Vercel, Qwen).
- El generador de órdenes produce documentos locales; no ejecuta modelos de IA.
- JOULE no tiene interfaz técnica implementada.

## Preparación para fases futuras

- **Fase Uno**: Integración real de modelos de IA mediante backend seguro
- **Fase Dos**: Agentes autónomos supervisados
- **Fase Tres**: JOULE como motor de optimización

## Tecnologías

- Vite 6.x
- React 18.x
- TypeScript 5.x
- Tailwind CSS 4.x
- React Router 6.x
- Lucide React (iconos)
- Vitest (pruebas)

## Contribución

Este proyecto está en desarrollo activo. La arquitectura está diseñada para ser modular y extensible.

## Licencia

MIT — Ver archivo [LICENSE](./LICENSE) para detalles completos.
