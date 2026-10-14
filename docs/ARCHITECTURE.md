# Arquitectura — GAGO Open Artifact Factory

## Visión general

GAGO Open Artifact Factory es una aplicación web de una sola página (SPA) construida con Vite, React y TypeScript. Su arquitectura está diseñada para ser modular, portable y preparada para evolucionar progresivamente hacia una factoría de software asistida por inteligencia artificial.

## Principios arquitectónicos

1. **Local-first**: La Fase Cero opera completamente en el navegador sin dependencias de servidor.
2. **Modular**: Cada módulo es independiente y puede sustituirse sin afectar al conjunto.
3. **Tipado estricto**: TypeScript con configuración estricta para prevenir errores.
4. **Separación de capas**: Presentación, estado, persistencia y servicios están separados.
5. **Sin secretos en el frontend**: No se almacenan credenciales ni claves API en el código.
6. **Portable**: La aplicación compilada puede alojarse en cualquier servidor de archivos estáticos.

## Capas

### Presentación (src/pages, src/components)
- Componentes de React con TypeScript
- Páginas correspondientes a cada módulo
- Componentes reutilizables (Modal, Toast, StatusBadge, etc.)
- Layout con barra lateral y cabecera

### Estado (src/context)
- `ThemeProvider`: Gestiona el tema visual (claro/oscuro)
- `DataProvider`: Gestiona todos los datos de la aplicación (proyectos, tareas, artefactos, evidencias)
- Los contextos proporcionan funciones de mutación que actualizan el estado y persisten automáticamente

### Servicios (src/services)
- `storage.ts`: Capa de persistencia con localStorage, validación de esquema y operaciones CRUD
- `qwen-generator.ts`: Generador de documentos de instrucciones para Qwen Coder

### Modelos de datos (src/types)
- Tipos TypeScript estrictos para todas las entidades
- Constantes de etiquetas para presentación
- Versión de esquema para control de migraciones

## Modelo de datos

```
DataStore {
  version: string
  projects: Project[]
  tasks: Task[]
  artifacts: Artifact[]
  evidence: Evidence[]
  settings: AppSettings
}
```

Cada entidad tiene un identificador único (UUID v4), fechas de creación/actualización y campos específicos de su dominio.

## Persistencia

- **Almacenamiento**: localStorage del navegador
- **Clave**: `gago-factory-data`
- **Formato**: JSON serializado
- **Validación**: Los datos se validan al cargarse; si son inválidos, se inicia con almacén vacío
- **Exportación**: Todos los datos pueden exportarse a JSON
- **Importación**: Los datos importados se validan antes de sustituir los existentes

## Preparación para IA

La arquitectura incluye puntos de extensión para futuras integraciones:

1. **Interfaz de adaptadores**: Preparada para conectar proveedores de modelos (Qwen, otros)
2. **Registro de solicitudes**: Estructura de datos para registrar interacciones con modelos
3. **Generador de órdenes**: Produce documentos estructurados que pueden enviarse a modelos
4. **Evidencias verificables**: Preparadas para incorporar hashes y resultados automáticos

## Seguridad

- No se almacenan secretos en el frontend
- Las entradas se validan y tienen límites de longitud
- No se usa `dangerouslySetInnerHTML`
- Los archivos importados se validan estructuralmente
- No se evalúa código arbitrario

## Compatibilidad

- **Vite**: Compilación y servidor de desarrollo
- **React Router**: Navegación interna con rewrites para Vercel
- **Vercel**: Despliegue estático con `vercel.json`
- **GitHub Actions**: CI con typecheck y build

## Evolución prevista

- **Fase Uno**: Backend seguro para APIs de IA, primer agente programador supervisado
- **Fase Dos**: Agentes especializados (análisis, pruebas, seguridad, documentación)
- **Fase Tres**: JOULE como motor de optimización y coordinación
- **Fase Cuatro**: Sincronización multi-dispositivo con autenticación real
