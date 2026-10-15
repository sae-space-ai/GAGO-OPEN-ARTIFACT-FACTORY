# CIVILIZACIÓN ALGORÍTMICA - Design System

## Identidad Visual

**Nombre**: CIVILIZACIÓN ALGORÍTMICA  
**Plataforma**: GAGO OPEN ARTIFACT FACTORY  
**Motor Cognitivo**: JOULE  
**Concepto**: El futuro no se predice. Se construye.

## Paleta de Colores

### Tema Oscuro (Por Defecto)

| Token | Color | Uso |
|-------|-------|-----|
| `--ca-color-bg-primary` | `#070C17` | Fondo principal (Obsidiana profunda) |
| `--ca-color-bg-secondary` | `#111B2B` | Superficies (Azul noche) |
| `--ca-color-bg-tertiary` | `#1A2332` | Superficies terciarias |
| `--ca-color-bg-elevated` | `#243044` | Superficies elevadas |
| `--ca-color-accent-primary` | `#C6F86E` | Acento principal (Verde lima tecnológico) |
| `--ca-color-accent-secondary` | `#4ECDC4` | Acento secundario (Turquesa) |
| `--ca-color-accent-tertiary` | `#45B7D1` | Acento terciario (Cian) |
| `--ca-color-text-primary` | `#F3F6FA` | Texto principal |
| `--ca-color-text-secondary` | `#A7B4C7` | Texto secundario |
| `--ca-color-text-tertiary` | `#6B7A8F` | Texto terciario |

### Colores Semánticos

| Token | Color | Uso |
|-------|-------|-----|
| `--ca-color-success` | `#4ADE80` | Operaciones exitosas |
| `--ca-color-warning` | `#FBBF24` | Advertencias |
| `--ca-color-error` | `#F87171` | Errores |
| `--ca-color-info` | `#60A5FA` | Información |
| `--ca-color-blocked` | `#A78BFA` | Bloqueos |

### Tema Claro

El tema claro mantiene la misma paleta de acentos pero invierte los fondos y textos para garantizar legibilidad y coherencia visual.

## Tipografía

### Familias

- **Sans-serif**: Inter (aplicación, controles, tablas, textos técnicos)
- **Serif**: Playfair Display (titulares destacados, frases conceptuales)
- **Monospace**: JetBrains Mono (código, datos técnicos)

### Escala Tipográfica

| Token | Tamaño | Uso |
|-------|--------|-----|
| `--ca-text-xs` | 0.75rem | Etiquetas, metadatos |
| `--ca-text-sm` | 0.875rem | Texto de cuerpo, controles |
| `--ca-text-base` | 1rem | Texto base |
| `--ca-text-lg` | 1.125rem | Subtítulos |
| `--ca-text-xl` | 1.25rem | Títulos de sección |
| `--ca-text-2xl` | 1.5rem | Títulos de página |
| `--ca-text-3xl` | 1.875rem | Títulos destacados |
| `--ca-text-4xl` | 2.25rem | Títulos hero |
| `--ca-text-5xl` | 3rem | Títulos principales |

## Componentes del Design System

### Estructura

```
src/components/ca/
├── index.ts                 # Exportación centralizada
├── Sidebar.tsx              # Barra lateral de navegación
├── TopNavigation.tsx        # Navegación superior
├── MetricCard.tsx           # Tarjetas de métricas
├── StatusIndicator.tsx      # Indicadores de estado
├── Card.tsx                 # Tarjetas genéricas
├── Button.tsx               # Botones con variantes
└── PageHeader.tsx           # Encabezados de página
```

### Componentes Disponibles

#### Sidebar
Barra lateral con navegación agrupada por secciones lógicas.

**Props**:
- `isOpen: boolean` - Estado de apertura (móvil)
- `onToggle: () => void` - Función de toggle

#### TopNavigation
Barra superior con breadcrumb y controles de usuario.

**Props**:
- `onMenuToggle: () => void` - Función para toggle del menú móvil

#### MetricCard
Tarjeta para mostrar métricas con tendencias.

**Props**:
- `label: string` - Etiqueta de la métrica
- `value: string | number` - Valor de la métrica
- `trend?: { value: number; isPositive: boolean }` - Tendencia opcional
- `icon?: React.ReactNode` - Icono opcional
- `className?: string` - Clases CSS adicionales

#### StatusIndicator
Indicador de estado con colores semánticos.

**Props**:
- `status: 'success' | 'warning' | 'error' | 'info' | 'blocked'`
- `label: string` - Texto del estado
- `className?: string` - Clases CSS adicionales

#### Card
Tarjeta genérica con header opcional.

**Props**:
- `title?: string` - Título de la tarjeta
- `children: React.ReactNode` - Contenido
- `className?: string` - Clases CSS adicionales
- `headerAction?: React.ReactNode` - Acción en el header

#### Button
Botón con variantes y tamaños.

**Props**:
- `variant?: 'primary' | 'secondary' | 'ghost'`
- `size?: 'sm' | 'md' | 'lg'`
- `icon?: React.ReactNode` - Icono opcional
- `children: React.ReactNode` - Texto del botón
- Hereda todas las props de `HTMLButtonElement`

#### PageHeader
Encabezado de página con título y acciones.

**Props**:
- `title: string` - Título de la página
- `subtitle?: string` - Subtítulo opcional
- `action?: React.ReactNode` - Acción opcional
- `className?: string` - Clases CSS adicionales

## Tokens de Espaciado

| Token | Valor | Uso |
|-------|-------|-----|
| `--ca-spacing-xs` | 0.25rem | Espaciado mínimo |
| `--ca-spacing-sm` | 0.5rem | Espaciado pequeño |
| `--ca-spacing-md` | 1rem | Espaciado medio |
| `--ca-spacing-lg` | 1.5rem | Espaciado grande |
| `--ca-spacing-xl` | 2rem | Espaciado extra grande |
| `--ca-spacing-2xl` | 3rem | Espaciado doble extra grande |

## Tokens de Bordes

| Token | Valor | Uso |
|-------|-------|-----|
| `--ca-radius-sm` | 0.25rem | Bordes pequeños |
| `--ca-radius-md` | 0.5rem | Bordes medios |
| `--ca-radius-lg` | 0.75rem | Bordes grandes |
| `--ca-radius-xl` | 1rem | Bordes extra grandes |
| `--ca-radius-full` | 9999px | Bordes circulares |

## Tokens de Sombras

| Token | Valor | Uso |
|-------|-------|-----|
| `--ca-shadow-sm` | Sombra pequeña | Elementos elevados mínimos |
| `--ca-shadow-md` | Sombra media | Tarjetas, dropdowns |
| `--ca-shadow-lg` | Sombra grande | Modales, popovers |
| `--ca-shadow-xl` | Sombra extra grande | Elementos muy elevados |

## Tokens de Transición

| Token | Valor | Uso |
|-------|-------|-----|
| `--ca-transition-fast` | 150ms | Hover, focus rápidos |
| `--ca-transition-base` | 250ms | Transiciones estándar |
| `--ca-transition-slow` | 350ms | Animaciones complejas |

## Accesibilidad

### Contraste
- Todos los textos cumplen WCAG 2.2 nivel AA
- Contraste mínimo 4.5:1 para texto normal
- Contraste mínimo 3:1 para texto grande

### Navegación
- Navegación completa por teclado
- Focus visible en todos los elementos interactivos
- Orden de tabulación lógico

### Movimiento Reducido
- Respeto de `prefers-reduced-motion`
- Animaciones deshabilitadas cuando el usuario lo solicita

## Responsive Design

### Breakpoints

| Nombre | Ancho | Uso |
|--------|-------|-----|
| `sm` | 640px | Móviles grandes |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Desktop grande |

### Sidebar
- Desktop (≥1024px): Sidebar fija visible
- Móvil (<1024px): Sidebar colapsable con overlay

## Uso

### Importar Componentes

```typescript
import { Button, Card, MetricCard } from '../components/ca';
```

### Usar Tokens CSS

```css
.mi-componente {
  background: var(--ca-color-bg-secondary);
  color: var(--ca-color-text-primary);
  padding: var(--ca-spacing-lg);
  border-radius: var(--ca-radius-lg);
}
```

### Ejemplo de Componente

```tsx
import { Card, Button, StatusIndicator } from '../components/ca';

function MiComponente() {
  return (
    <Card title="Estado del Sistema">
      <StatusIndicator status="success" label="Operativo" />
      <Button variant="primary">Acción Principal</Button>
    </Card>
  );
}
```

## Portada CIVILIZACIÓN ALGORÍTMICA

La portada está disponible en la ruta `/civilizacion` y presenta:

- **Hero Section**: Identidad visual con gradiente y elementos decorativos
- **Valores Fundamentales**: 6 tarjetas con los principios de la plataforma
- **Arquitectura del Ecosistema**: Visualización del motor JOULE con órbitas animadas
- **Estadísticas**: Métricas clave del proyecto
- **Call-to-Action**: Enlaces a las principales secciones
- **Footer**: Información y enlaces rápidos

## Migración de Páginas Existentes

### Estado Actual

- ✅ Design System implementado
- ✅ Componentes reutilizables creados
- ✅ Layout principal actualizado
- ✅ Portada CIVILIZACIÓN ALGORÍTMICA creada
- ⏳ Migración de páginas individuales (pendiente)

### Próximos Pasos

1. Migrar GlobalOverview al nuevo Design System
2. Migrar Dashboard al nuevo Design System
3. Migrar páginas de gestión (Projects, Tasks, Artifacts, Evidence)
4. Migrar páginas de calidad (Scope Matrix, Quality Gates, Approval Engine)
5. Migrar páginas de JOULE (Engine, Cognitive, Training Center)
6. Migrar páginas de herramientas (Tool Factory, Model Registry, Qwen Generator)
7. Migrar páginas de integraciones (API Fabric, Connections, AI Providers)
8. Migrar páginas de sistema (Settings, Integrations)

## Documentación Adicional

- [FASE_12_2_INFORME.md](./FASE_12_2_INFORME.md) - Informe técnico completo
- [MATRIZ_PANTALLAS.md](./MATRIZ_PANTALLAS.md) - Estado de migración de pantallas
- [GUIA_IDENTIDAD_VISUAL.md](./GUIA_IDENTIDAD_VISUAL.md) - Guía de identidad visual

---

**Versión**: 1.0.0  
**Fecha**: 2024  
**Estado**: ✅ Design System Implementado
