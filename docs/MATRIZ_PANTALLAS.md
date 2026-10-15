# Matriz de Migración de Pantallas - CIVILIZACIÓN ALGORÍTMICA

## Estado de Migración

| Página | Ruta | Estado | Lote | Prioridad | Notas |
|--------|------|--------|------|-----------|-------|
| **Portada CIVILIZACIÓN ALGORÍTMICA** | `/civilizacion` | ✅ IMPLEMENTADO | 1 | Alta | Página de inicio con identidad visual |
| **Layout Principal** | - | ✅ IMPLEMENTADO | 1 | Alta | Shell, Sidebar, TopNav actualizados |
| Global Overview | `/` | ⏳ PENDIENTE | 2 | Alta | Centro de mando principal |
| Dashboard | `/dashboard` | ⏳ PENDIENTE | 2 | Alta | Dashboard tradicional |
| Projects | `/projects` | ⏳ PENDIENTE | 2 | Alta | Gestión de proyectos |
| Tasks | `/tasks` | ⏳ PENDIENTE | 2 | Alta | Gestión de tareas |
| Artifacts | `/artifacts` | ⏳ PENDIENTE | 2 | Alta | Registro de artefactos |
| Evidence | `/evidence` | ⏳ PENDIENTE | 3 | Media | Registro de evidencias |
| Scope Matrix | `/scope` | ⏳ PENDIENTE | 3 | Media | Matriz de alcance |
| Quality Gates | `/gates` | ⏳ PENDIENTE | 3 | Media | Puertas de calidad |
| Approval Engine | `/approval` | ⏳ PENDIENTE | 3 | Media | Motor de aprobación |
| JOULE Dashboard | `/joule` | ⏳ PENDIENTE | 4 | Media | Panel de JOULE |
| JOULE Cognitive | `/joule-cognitive` | ⏳ PENDIENTE | 4 | Media | Centro cognitivo |
| Training Center | `/training` | ⏳ PENDIENTE | 4 | Media | Centro de entrenamiento |
| Model Registry | `/models` | ⏳ PENDIENTE | 4 | Media | Registro de modelos |
| Tool Factory | `/tools` | ⏳ PENDIENTE | 5 | Media | Factoría de herramientas |
| Qwen Generator | `/qwen` | ⏳ PENDIENTE | 5 | Media | Generador Qwen |
| AI Provider Control | `/ai-providers` | ⏳ PENDIENTE | 5 | Media | Control de proveedores IA |
| API Control Center | `/api-fabric` | ⏳ PENDIENTE | 5 | Media | Centro de APIs |
| Connection Control | `/connections` | ⏳ PENDIENTE | 5 | Media | Control de conexiones |
| Integrations | `/integrations` | ⏳ PENDIENTE | 6 | Baja | Integraciones generales |
| Free Training | `/free-training` | ⏳ PENDIENTE | 6 | Baja | Entrenamiento gratuito |
| Settings | `/settings` | ⏳ PENDIENTE | 6 | Baja | Configuración |
| Universal Hub | `/universal-hub` | ⏳ PENDIENTE | 6 | Baja | Hub universal |

## Leyenda de Estados

- ✅ **IMPLEMENTADO**: Página migrada completamente al Design System
- 🔄 **EN PROGRESO**: Migración en curso
- ⏳ **PENDIENTE**: Pendiente de migración
- ❌ **BLOQUEADO**: Bloqueado por dependencias o problemas técnicos
- 🚫 **NO APLICA**: No requiere migración

## Lotes de Migración

### Lote 1 - Foundation (✅ COMPLETADO)
- [x] Design System CSS
- [x] Componentes reutilizables
- [x] Layout principal
- [x] Portada CIVILIZACIÓN ALGORÍTMICA
- [x] Navegación

### Lote 2 - Core Pages (⏳ PENDIENTE)
- [ ] Global Overview
- [ ] Dashboard
- [ ] Projects
- [ ] Tasks
- [ ] Artifacts

**Objetivo**: Migrar las páginas principales de uso diario

**Componentes necesarios**:
- DataGrid mejorado
- FilterBar
- SearchInput
- DataTable
- EmptyState
- LoadingState

### Lote 3 - Quality & Evidence (⏳ PENDIENTE)
- [ ] Evidence
- [ ] Scope Matrix
- [ ] Quality Gates
- [ ] Approval Engine

**Objetivo**: Migrar páginas de calidad y auditoría

**Componentes necesarios**:
- EvidenceCard
- QualityGateIndicator
- ApprovalPanel
- ActivityTimeline

### Lote 4 - JOULE Ecosystem (⏳ PENDIENTE)
- [ ] JOULE Dashboard
- [ ] JOULE Cognitive
- [ ] Training Center
- [ ] Model Registry

**Objetivo**: Migrar páginas del ecosistema JOULE

**Componentes necesarios**:
- AgentCard
- ModelCard
- GraphPanel
- CommandConsole

### Lote 5 - Tools & Integrations (⏳ PENDIENTE)
- [ ] Tool Factory
- [ ] Qwen Generator
- [ ] AI Provider Control
- [ ] API Control Center
- [ ] Connection Control

**Objetivo**: Migrar páginas de herramientas e integraciones

**Componentes necesarios**:
- CommandCard
- CodeViewer
- IntegrationCard
- StatusTimeline

### Lote 6 - System & Settings (⏳ PENDIENTE)
- [ ] Integrations
- [ ] Free Training
- [ ] Settings
- [ ] Universal Hub

**Objetivo**: Migrar páginas de sistema y configuración

**Componentes necesarios**:
- FormField
- SettingsPanel
- ConfigCard

## Componentes Faltantes por Lote

### Componentes Base (Prioridad Alta)
- [ ] `DataGrid.tsx` - Tabla de datos con ordenación y filtrado
- [ ] `FilterBar.tsx` - Barra de filtros
- [ ] `SearchInput.tsx` - Input de búsqueda
- [ ] `DataTable.tsx` - Tabla de datos avanzada
- [ ] `EmptyState.tsx` - Estado vacío
- [ ] `LoadingState.tsx` - Estado de carga
- [ ] `ErrorState.tsx` - Estado de error

### Componentes de Calidad (Prioridad Media)
- [ ] `EvidenceCard.tsx` - Tarjeta de evidencia
- [ ] `QualityGateIndicator.tsx` - Indicador de Quality Gate
- [ ] `ApprovalPanel.tsx` - Panel de aprobación
- [ ] `ActivityTimeline.tsx` - Línea de tiempo de actividad

### Componentes JOULE (Prioridad Media)
- [ ] `AgentCard.tsx` - Tarjeta de agente
- [ ] `ModelCard.tsx` - Tarjeta de modelo
- [ ] `GraphPanel.tsx` - Panel de gráficos
- [ ] `CommandConsole.tsx` - Consola de comandos

### Componentes de Herramientas (Prioridad Media)
- [ ] `CommandCard.tsx` - Tarjeta de comando
- [ ] `CodeViewer.tsx` - Visor de código
- [ ] `IntegrationCard.tsx` - Tarjeta de integración
- [ ] `StatusTimeline.tsx` - Línea de tiempo de estado

### Componentes de Sistema (Prioridad Baja)
- [ ] `FormField.tsx` - Campo de formulario
- [ ] `SettingsPanel.tsx` - Panel de configuración
- [ ] `ConfigCard.tsx` - Tarjeta de configuración

## Progreso General

```
Total de páginas: 24
✅ Implementadas: 2 (8.3%)
⏳ Pendientes: 22 (91.7%)

Lotes completados: 1/6 (16.7%)
Componentes creados: 7/~25 (28%)
```

## Criterios de Aceptación por Página

Cada página debe cumplir:

1. ✅ Usar tokens CSS del Design System
2. ✅ Usar componentes reutilizables de `src/components/ca/`
3. ✅ Mantener toda la funcionalidad existente
4. ✅ Ser responsive (mobile-first)
5. ✅ Cumplir accesibilidad WCAG 2.2 AA
6. ✅ Compilar sin errores de TypeScript
7. ✅ No introducir regresiones

## Notas de Migración

### Consideraciones Generales
- Mantener la lógica de negocio intacta
- Solo cambiar la presentación visual
- Usar componentes existentes cuando sea posible
- Crear nuevos componentes solo si es necesario
- Probar en múltiples tamaños de pantalla
- Verificar accesibilidad con teclado
- Respetar prefers-reduced-motion

### Consideraciones por Página
- **Global Overview**: Requiere DataGrid y MetricCard mejorados
- **Dashboard**: Requiere gráficos y visualizaciones
- **Projects/Tasks**: Requieren DataTable con filtrado avanzado
- **Evidence**: Requiere EvidenceCard con estados visuales
- **JOULE**: Requiere visualizaciones de flujo y métricas
- **Tool Factory**: Requiere CodeViewer y CommandCard

## Próximas Acciones

1. **Inmediato**: Completar Lote 2 (Core Pages)
   - Crear DataGrid, FilterBar, SearchInput
   - Migrar Global Overview
   - Migrar Dashboard
   - Migrar Projects, Tasks, Artifacts

2. **Corto plazo**: Completar Lote 3 (Quality & Evidence)
   - Crear EvidenceCard, QualityGateIndicator
   - Migrar páginas de calidad

3. **Mediano plazo**: Completar Lotes 4-6
   - Migrar ecosistema JOULE
   - Migrar herramientas e integraciones
   - Migrar sistema y configuración

---

**Última actualización**: 2024  
**Estado**: Lote 1 completado, iniciando Lote 2  
**Progreso**: 8.3% de páginas migradas
