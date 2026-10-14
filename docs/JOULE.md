# JOULE — Adaptive Resource Optimization Engine

## Arquitectura

JOULE es un motor de optimización transversal que gobierna el consumo de recursos de GAGO Open Artifact Factory. NO sustituye la factoría, sino que optimiza cómo se ejecutan las operaciones.

### Componentes

1. **JOULE OBSERVE** (`src/services/joule/observe.ts`)
   - Mide operaciones reales usando `performance.now()`
   - Registra duración, bytes transferidos, coste y energía (si hay telemetría válida)
   - Distingue entre valores observados, estimados y desconocidos

2. **JOULE PROFILE** (`src/services/joule/profile.ts`)
   - Clasifica operaciones por categoría, prioridad, riesgo y sensibilidad
   - Asigna recursos estimados conservadores
   - Determina si requiere verificación

3. **JOULE PREDICT** (`src/services/joule/predict.ts`)
   - Estima recursos basándose en el mapa de experiencia
   - Calcula coste esperado incluyendo reintentos
   - Determina nivel de confianza según tamaño de muestra

4. **JOULE OPTIMIZE** (`src/services/joule/optimize.ts`)
   - Algoritmo central de selección de rutas
   - Aplica restricciones duras (seguridad, privacidad, presupuesto)
   - Selecciona ruta con menor coste efectivo entre las válidas
   - Usa ruta de referencia como fallback si no hay opciones válidas

5. **JOULE EXECUTE** (`src/services/joule/execute.ts`)
   - Ejecuta operaciones dentro de los permisos autorizados
   - Respeta límites de reintentos
   - No ejecuta operaciones no idempotentes sin control

6. **JOULE VERIFY** (`src/services/joule/verify.ts`)
   - Verifica resultados mediante mecanismos independientes
   - No acepta declaraciones del modelo como verificación
   - Registra método y resultado

7. **JOULE LEARN** (`src/services/joule/learn.ts`)
   - Actualiza mapa de experiencia SOLO con observaciones verificadas
   - No aprende de respuestas no verificadas
   - No extrapola entre categorías diferentes

### Motor Central

**JOULE ENGINE** (`src/services/joule/engine.ts`)
- Coordina todos los componentes
- Implementa Kill Switch, Shadow Mode y Canary
- Gestiona el estado global del motor

### Modos Operativos

- **disabled**: Motor apagado, aplicación usa ruta de referencia
- **shadow**: JOULE calcula qué habría hecho pero no modifica el comportamiento
- **canary**: JOULE actúa sobre un porcentaje controlado de operaciones
- **active**: JOULE actúa sobre todas las operaciones elegibles

### Políticas

**JOULE POLICIES** (`src/services/joule/policies.ts`)

Catálogo de políticas disponibles:

1. **REFERENCE_POLICY**: Sin optimización, todas las operaciones locales
2. **CONSERVATIVE_POLICY**: Solo rutas locales y caché, límites estrictos
3. **SHADOW_POLICY**: Observación sin modificación
4. **CANARY_POLICY**: Activación gradual (5% inicial)

Cada política define:
- Límites de concurrencia, reintentos, coste, duración
- Pesos para coste, latencia, energía, riesgo
- Restricciones duras (seguridad, privacidad, Quality Gates)

## Contratos TypeScript

Ver `src/types/joule.ts` para la especificación completa de:

- `JouleTaskProfile`: Perfil de tarea clasificada
- `JouleRoute`: Ruta candidata con coste y restricciones
- `JouleResourcePolicy`: Política de recursos
- `JouleMeasurement`: Medición de operación ejecutada
- `JouleDecision`: Decisión tomada por el optimizador
- `JouleVerification`: Resultado de verificación independiente
- `JouleExperienceMap`: Mapa de experiencia agregado
- `JouleEnergyProfile`: Perfil energético (solo con medición directa)
- `JouleOptimizationReport`: Informe completo de optimización

## Algoritmo de Optimización

### Secuencia Obligatoria

1. Recibir la operación (perfil de tarea)
2. Clasificarla por tipo, prioridad, sensibilidad y riesgo
3. Consultar las políticas activas
4. Identificar las rutas técnicamente disponibles
5. Consultar resultados históricos comparables
6. Obtener las estimaciones y su nivel de confianza
7. Eliminar las rutas incompatibles con los requisitos obligatorios
8. Calcular el coste efectivo esperado de las rutas válidas
9. Seleccionar la alternativa más eficiente dentro de las restricciones
10. Comprobar que el presupuesto y los Quality Gates permiten su ejecución
11. Ejecutar mediante un adaptador autorizado
12. Medir los recursos realmente observables
13. Verificar el resultado con pruebas independientes
14. Si falla la verificación, aplicar política de escalado o recuperación
15. Registrar el resultado, recursos utilizados y evidencias
16. Actualizar estimaciones históricas solo con observaciones válidas
17. Comunicar al usuario el resultado y estado real de la optimización

### Coste por Resultado Correcto

Métrica central de optimización:

```
costePorResultadoCorrecto = costeTotal / resultadosCorrectosVerificados
```

Incluye todos los intentos (exitosos y fallidos). No excluye operaciones fallidas del cálculo.

### Objetivo J25

Objetivo experimental: alcanzar al menos 25% de reducción del coste por resultado correcto manteniendo calidad equivalente.

**IMPORTANTE**: Este es un objetivo, no un resultado demostrado. El sistema mide si se alcanza, pero no presenta el objetivo como ahorro real sin mediciones correspondientes.

## Kill Switch

Mecanismo de reversión inmediata:

- Desactiva JOULE completamente
- Restaura comportamiento de referencia
- No destruye registros
- No modifica aprobaciones existentes
- Requiere motivo para activación
- Puede desactivarse manualmente

## Shadow Mode

Modo de observación sin modificación:

- JOULE calcula qué ruta habría seleccionado
- Compara con ejecución de referencia
- No aplica automáticamente la decisión alternativa
- No ejecuta llamadas adicionales de pago
- Útil para validar reglas y detectar regresiones

## Canary Mode

Activación gradual controlada:

- Etapas propuestas: 1%, 5%, 20%, 100%
- Promoción requiere evidencia de seguridad y calidad
- No activa 100% automáticamente
- Puede regresar inmediatamente a ruta de referencia
- Conserva datos y evidencias

## Integración con la Aplicación

### Estado Global

JOULE se integra con el `DataStore` existente:

```typescript
interface DataStore {
  // ... campos de Fase 0 y 0.1
  jouleState?: JouleState;
}
```

### Migración

La migración de Fase 0/0.1 a Fase 1 es no destructiva:

- Preserva todos los datos existentes
- Añade `jouleState` con estado inicial (desactivado)
- No modifica proyectos, tareas, artefactos, evidencias, matriz ni puertas

### Centro de Mando JOULE

Nueva página accesible desde `/joule`:

- Estado del motor (activado/desactivado, modo)
- Métricas en tiempo real (operaciones, éxitos, fallos, verificaciones)
- Decisiones recientes
- Mediciones recientes
- Controles de activación (Shadow, Canary, Activo)
- Kill Switch con motivo

## Restricciones de Seguridad

1. **No enviar datos confidenciales a proveedores externos**
2. **No ejecutar operaciones no idempotentes sin control**
3. **No aprender de observaciones no verificadas**
4. **No inventar métricas de CPU, RAM, GPU o energía**
5. **No presentar estimaciones como mediciones**
6. **No atribuir ahorros energéticos sin datos válidos**
7. **No almacenar claves API en el navegador**
8. **No enviar información de proyectos sin política explícita**

## Pruebas

Ver `src/tests/joule.test.ts` para pruebas de:

- Gestión de estado (activación, desactivación, kill switch)
- Clasificación de tareas
- Optimización y selección de rutas
- Restricciones de seguridad y privacidad
- Aprendizaje solo con observaciones verificadas
- Verificación estructural
- Cálculo de coste por resultado correcto
- Métricas agregadas

## Documentación Adicional

- `docs/JOULE_ALGORITHM.md`: Especificación detallada del algoritmo
- `docs/JOULE_TELEMETRY.md`: Documentación de telemetría
- `docs/JOULE_COMPARISON.md`: Informe de comparación con línea base

## Reversión

Para desactivar JOULE completamente:

1. Activar Kill Switch desde el Centro de Mando JOULE
2. O eliminar `jouleState` del `DataStore` (la aplicación vuelve a comportamiento de referencia)

Los datos de las Fases 0 y 0.1 permanecen intactos en ambos casos.
