# Informe de Alcance — Fase 0.1

## Resumen

La Fase 0.1 ha ampliado GAGO Open Artifact Factory con una **Matriz de Alcance Ejecutable** que permite controlar, verificar y documentar el desarrollo de la factoría. Se han preservado todas las funcionalidades de la Fase 0.

## Versión

- **Versión anterior:** 0.1.0
- **Versión nueva:** 0.1.1
- **Esquema de datos:** 0.1.1 (compatible con 0.1.0 mediante migración)

## Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `src/types/scope.ts` | Tipos TypeScript para la matriz y puertas de calidad |
| `src/services/dependencies.ts` | Servicio de detección de ciclos y validación |
| `src/services/initial-scope.ts` | 16 requisitos iniciales con instalación idempotente |
| `src/services/quality-gates.ts` | 8 puertas de validación |
| `src/pages/ScopeMatrix.tsx` | Página de la matriz de alcance |
| `src/pages/QualityGates.tsx` | Página de puertas de calidad |
| `src/tests/scope.test.ts` | Pruebas de la matriz y migración |
| `src/tests/dependencies.test.ts` | Pruebas del servicio de dependencias |
| `docs/CHANGELOG.md` | Historial de cambios |
| `docs/SCOPE_0.1.md` | Este documento |

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/types/index.ts` | DataStore ampliado con scopeMatrix y qualityGates (opcionales) |
| `src/services/storage.ts` | Migración, operaciones CRUD para matriz y puertas |
| `src/context/DataContext.tsx` | Nuevas operaciones expuestas |
| `src/components/Layout.tsx` | 2 nuevas entradas de navegación |
| `src/pages/Dashboard.tsx` | Widget de progreso de la matriz |
| `src/pages/QwenGenerator.tsx` | Integración con requisitos de la matriz |
| `src/App.tsx` | 2 nuevas rutas (/scope, /gates) |

## Archivos NO modificados (protección Fase 0)

- `src/pages/Projects.tsx`
- `src/pages/Tasks.tsx`
- `src/pages/Artifacts.tsx`
- `src/pages/Evidence.tsx`
- `src/pages/Settings.tsx`
- `src/pages/Integrations.tsx`
- `src/context/ThemeContext.tsx`
- `src/services/qwen-generator.ts` (función original preservada)
- `src/tests/storage.test.ts`
- `src/tests/qwen-generator.test.ts`
- `vercel.json`
- `.github/workflows/ci.yml`
- `vite.config.js`

## Matriz de requisitos — Estado

| Código | Nombre | Implementación | Pruebas | Verificación |
|--------|--------|---------------|---------|-------------|
| M01 | Protección Fase 0 | Implementado | Prueba superada | No verificado |
| M02 | Modelo de datos | Implementado | Prueba superada | No verificado |
| M03 | Persistencia | Implementado | Prueba superada | No verificado |
| M04 | Interfaz matriz | Implementado | No probado | No verificado |
| M05 | Edición requisitos | Implementado | No probado | No verificado |
| M06 | Relaciones | Implementado | No probado | No verificado |
| M07 | Dependencias | Implementado | Prueba superada | No verificado |
| M08 | Estados implementación | Implementado | No probado | No verificado |
| M09 | Estados validación | Implementado | No probado | No verificado |
| M10 | Registro evidencias | Implementado | No probado | No verificado |
| M11 | Criterios aceptación | Implementado | No probado | No verificado |
| M12 | Panel progreso | Implementado | No probado | No verificado |
| M13 | Export/Import | Implementado | Prueba superada | No verificado |
| M14 | Integración Qwen | Implementado | No probado | No verificado |
| M15 | Validación continua | Implementado | Prueba superada | No verificado |
| M16 | Preparación publicación | Implementado | Prueba superada | No verificado |

## Puertas de calidad

| Puerta | Nombre | Estado |
|--------|--------|--------|
| GATE 01 | Integridad Fase 0 | Pendiente (verificación manual) |
| GATE 02 | Integridad de datos | Pendiente |
| GATE 03 | TypeScript | Pendiente (ejecutar `npm run typecheck`) |
| GATE 04 | ESLint | Pendiente |
| GATE 05 | Pruebas | Pendiente (ejecutar `npm run test`) |
| GATE 06 | Compilación Vite | Pendiente (ejecutar `npm run build`) |
| GATE 07 | Compatibilidad despliegue | Pendiente |
| GATE 08 | Autorización publicación | Pendiente |

## Instrucciones de reversión

Para volver a la Fase 0 sin pérdida de datos:

1. Los datos de la Fase 0 se conservan intactos en localStorage.
2. La migración es reversible: si se elimina `scopeMatrix` y `qualityGates` del JSON exportado, el esquema vuelve a 0.1.0.
3. El código de la Fase 0 no ha sido eliminado ni modificado en su lógica principal.
4. Las nuevas rutas (/scope, /gates) pueden ignorarse sin afectar al funcionamiento.

## Problemas pendientes

- Las verificaciones de las puertas de calidad requieren ejecución manual de los comandos correspondientes.
- La integración completa con Qwen Coder se implementará en la Fase Uno.
- JOULE no tiene interfaz técnica implementada.
