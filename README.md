# GAGO Open Artifact Factory

**Factoría abierta de artefactos digitales y aplicaciones de inteligencia artificial**

Versión: 0.1.0 | Fase Cero | Licencia: MIT

## Descripción

GAGO Open Artifact Factory es una plataforma abierta de desarrollo de software y artefactos digitales. Permite gestionar proyectos, tareas, artefactos y evidencias técnicas, además de generar instrucciones estructuradas para modelos de inteligencia artificial como Qwen Coder.

La Fase Cero establece los fundamentos técnicos: una aplicación web funcional con persistencia local, arquitectura modular y preparación para integraciones futuras.

## Características

- **Centro de Mando**: Panel principal con estadísticas y actividad reciente
- **Gestión de Proyectos**: Crear, editar, archivar y eliminar proyectos
- **Gestión de Tareas**: Tareas asociadas a proyectos con estados y prioridades
- **Registro de Artefactos**: Catálogo de resultados digitales producidos
- **Registro de Evidencias**: Sistema de evidencias técnicas con clasificación
- **Generador de Órdenes Qwen**: Herramienta para preparar instrucciones de desarrollo
- **Estado de Integraciones**: Visualización del estado real de cada conexión
- **Configuración**: Tema claro/oscuro, importación/exportación de datos

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
