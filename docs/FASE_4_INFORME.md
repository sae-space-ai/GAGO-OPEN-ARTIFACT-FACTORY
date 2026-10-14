# Fase 4: JOULE Multi Agent Training System (JOULE MATS)

## Resumen

La Fase 4 implementa un sistema de entrenamiento multiagente para JOULE, compuesto por 15 agentes especializados que trabajan coordinadamente para optimizar las políticas de selección de rutas.

## Estado: ✅ Completada

## Componentes Implementados

### 1. Tipos y Contratos (`src/types/joule-mats.ts`)
- Definición de los 15 agentes especializados
- Tipos para datasets, observaciones, políticas y ciclos de entrenamiento
- Estados de agentes y capacidades
- Estructura de datos para el sistema multiagente

### 2. Agentes Especializados (`src/services/joule-mats/agents/`)

#### Agente 01: Data Curator
- **Función**: Recopila y prepara datos válidos de entrenamiento
- **Capacidades**: Eliminación de duplicados, validación de consistencia, separación de datos reales/sintéticos
- **Archivo**: `agent-01-data-curator.ts`

#### Agentes 02-15 (`agents-02-15.ts`)
- **Agente 02 - Telemetry Analyst**: Analiza tiempos de ejecución, costes y recursos
- **Agente 03 - Task Classifier**: Clasifica tareas por complejidad, prioridad y riesgo
- **Agente 04 - Synthetic Lab**: Genera escenarios sintéticos para entrenamiento
- **Agente 05 - Labeling and Evidence**: Valida etiquetas y separa resultados verificados
- **Agente 06 - Feature Engineer**: Transforma observaciones en vectores de características
- **Agente 07 - Baseline Scientist**: Establece línea base de rendimiento
- **Agente 08 - Policy Trainer**: Entrena políticas usando bandido contextual
- **Agente 09 - Cost Optimizer**: Optimiza costes de ejecución
- **Agente 10 - Latency Optimizer**: Optimiza latencia de respuestas
- **Agente 11 - Energy Optimizer**: Optimiza consumo energético
- **Agente 12 - Quality and Reliability**: Evalúa calidad y fiabilidad
- **Agente 13 - Adversarial Trainer**: Prueba políticas en escenarios adversos
- **Agente 14 - Independent Evaluator**: Evalúa políticas independientemente
- **Agente 15 - Training Governor**: Coordina y gobierna el entrenamiento

### 3. Orquestador Central (`src/services/joule-mats/orchestrator.ts`)
- Inicialización del sistema con los 15 agentes
- Ejecución coordinada de ciclos de entrenamiento
- Gestión de dependencias entre agentes
- Control de concurrencia y presupuestos
- Integración con el sistema de almacenamiento

### 4. Centro de Entrenamiento (`src/pages/JouleTrainingCenter.tsx`)
- Visualización de los 15 agentes con sus estados
- Controles para iniciar/detener ciclos de entrenamiento
- Estadísticas en tiempo real
- Log de entrenamiento
- Visualización de políticas entrenadas
- Métricas de rendimiento

### 5. Pruebas Unitarias (`src/tests/joule-mats.test.ts`)
- Pruebas para cada agente especializado
- Pruebas del orquestador
- Pruebas de integración con Quality Gates
- Validación de que no se aprueban políticas con calidad degradada

## Características Clave

### Aprendizaje Adaptativo
- **Algoritmo**: Bandido contextual con restricciones
- **Función objetivo**: Minimizar coste por resultado correcto
- **Restricciones**: Calidad mínima, privacidad, presupuesto, seguridad
- **Actualización**: Incremental, sin reentrenamientos completos innecesarios

### Modos de Operación
- **Shadow**: Observa sin modificar decisiones reales
- **Canary**: Activa políticas validadas progresivamente (0-100%)
- **Activo**: Usa políticas aprobadas en producción

### Seguridad y Control
- Ningún agente puede anular los Quality Gates
- Evaluación independiente obligatoria antes de aprobar políticas
- Separación estricta entre entrenamiento y evaluación
- No se entrenan modelos de lenguaje desde cero
- Sin GPU obligatoria (TypeScript/Node.js)
- Presupuesto monetario cero por defecto

### Objetivo Experimental J25
- Reducir al menos 25% el coste por resultado correcto
- Mantener calidad equivalente o superior
- Verificación mediante experimentos reproducibles
- Comparación con línea base documentada

## Integración con Fases Anteriores

### Fase 0 y 0.1
- ✅ Conserva todos los datos de proyectos, tareas, artefactos y evidencias
- ✅ Matriz de alcance y Quality Gates intactos
- ✅ Persistencia local sin cambios

### Fase 1 - JOULE
- ✅ Extiende el motor JOULE con capacidades de aprendizaje
- ✅ Respeta la arquitectura existente (Observe, Profile, Predict, Optimize, Execute, Verify, Learn)
- ✅ Mantiene el Kill Switch y los modos Shadow/Canary

### Fase 2 - API Fabric
- ✅ Utiliza el Connector Registry para obtener información de rutas
- ✅ Respeta las políticas de coste cero
- ✅ Integra con el Quota Manager

### Fase 3 - Connection Recovery
- ✅ Utiliza el estado de conexiones para evaluar disponibilidad de rutas
- ✅ No interfiere con el sistema de recuperación automática

## Archivos Creados

```
src/
├── types/
│   └── joule-mats.ts                    # Tipos del sistema multiagente
├── services/
│   └── joule-mats/
│       ├── index.ts                     # Exportaciones del módulo
│       ├── orchestrator.ts              # Orquestador central
│       └── agents/
│           ├── agent-01-data-curator.ts # Agente 01
│           └── agents-02-15.ts          # Agentes 02-15
├── pages/
│   └── JouleTrainingCenter.tsx          # Centro de entrenamiento
└── tests/
    └── joule-mats.test.ts               # Pruebas unitarias
```

## Archivos Modificados

```
src/
├── types/
│   └── index.ts                         # Añadido jouleMATS a DataStore
├── context/
│   └── DataContext.tsx                  # Añadido updateJouleMATS
├── App.tsx                              # Añadida ruta /training
└── components/
    └── Layout.tsx                       # Añadida entrada de navegación
```

## Resultados de Compilación

```
✓ 1426 modules transformed
✓ built in 4.12s

Tamaño del bundle:
- CSS: 44.73 kB (gzip: 8.38 kB)
- JS principal: 225.42 kB (gzip: 70.46 kB)
- JouleTrainingCenter: 30.13 kB (gzip: 7.87 kB)
```

## Uso

### Iniciar un Ciclo de Entrenamiento

1. Navegar a "Training Center" en el menú lateral
2. Hacer clic en "Iniciar Entrenamiento"
3. El sistema ejecutará los 15 agentes en secuencia
4. Ver el log de entrenamiento en tiempo real
5. Revisar las políticas generadas y sus métricas

### Modos de Operación

- **Shadow**: Las políticas se evalúan pero no se aplican
- **Canary**: Las políticas aprobadas se aplican a un porcentaje de operaciones
- **Activo**: Las políticas aprobadas se aplican a todas las operaciones

### Evaluación de Políticas

1. El Agente 14 evalúa independientemente cada política candidata
2. Se compara con la línea base
3. Se verifica que la calidad se mantiene
4. Solo se aprueban políticas con mejora ≥25% y calidad mantenida

## Limitaciones Conocidas

- El entrenamiento se ejecuta en el navegador (sin GPU)
- No se entrenan modelos de lenguaje desde cero
- Las políticas son específicas para el contexto de JOULE
- Requiere datos de entrenamiento reales o sintéticos
- El objetivo J25 es experimental y requiere validación

## Próximos Pasos

1. Implementar persistencia de políticas entrenadas
2. Añadir visualización de métricas de entrenamiento
3. Implementar detección de deriva (drift detection)
4. Añadir soporte para múltiples objetivos de optimización
5. Implementar validación cruzada para políticas
6. Añadir exportación de políticas para despliegue

## Documentación Relacionada

- [JOULE.md](./JOULE.md) - Documentación del motor JOULE original
- [FASE_1_INFORME.md](./FASE_1_INFORME.md) - Fase 1: JOULE Engine
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura general del sistema

## Licencia

MIT - Ver archivo LICENSE para detalles completos.
