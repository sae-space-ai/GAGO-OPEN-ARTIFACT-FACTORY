CIVILIZACIÓN ALGORÍTMICA — IDENTIDAD VISUAL ORIGINAL

Objetivo
Aportar una interfaz editorial y de mando propia, inspirada en los conceptos de inteligencia, soberanía tecnológica, trazabilidad y supervisión humana. No sustituye GAGO Open Artifact Factory; ofrece un acceso visual unificado a sus funciones existentes.

Ruta
/civilizacion-algoritmica
La barra lateral incorpora una entrada explícita. Ninguna ruta anterior se elimina ni se renombra.

Identidad
Oscuro obsidiana, azul noche, acento verde lima, iluminación turquesa y líneas orbitales.
Tipografía de sistema y serif editorial de reserva, sin descarga ni dependencia de fuentes externas.
Núcleo visual JOULE creado íntegramente mediante CSS y SVG de iconos existentes.
Todos los textos son originales para esta interfaz: no se reproduce contenido del libro del autor.

Módulos
Núcleo cognitivo -> /joule-cognitive
Optimización -> /joule
Creación -> /tools
Gobernanza -> /gates
Agentes -> /training
Soberanía y proveedores -> /ai-providers
Método -> /scope, /projects, /evidence, /approval

Indicadores
Los proyectos, tareas, herramientas, evidencias y mediciones proceden del DataContext existente. Solo se cuentan como verificadas aquellas evidencias con status === verified.
El modo de JOULE se muestra conforme al estado real: desactivado, shadow, canary o active.
El indicador "portal conectado al estado local" no es una comprobación de APIs externas.

Conservación
La página es de SOLO LECTURA. No modifica el DataStore, localStorage, permisos ni políticas.
No abre APIs ni requiere credenciales.
Estilos encapsulados en el selector .ca; no altera el diseño del resto de la factoría.
Responsive y accesibilidad de navegación por teclado; animaciones desactivadas con reduced-motion.

Aceptación
Ejecutar node --test tests/civilizacion-algoritmica.test.mjs
Ejecutar npm ci, npm run typecheck y npm run build.
GitHub Actions incluye job separado Civilización Algorítmica. El job global de la rama base puede continuar fallando: eso NO se ocultará.

Bloqueo previo relevante
La Fase 12.1 declara 11/12 Gates, pero la última ejecución de CI del commit 770ad29 falló durante Vitest (undici / TypeError leyendo bind), antes de ejecutar pruebas. TypeScript y Vite sí compilaron.
La nueva interfaz no debe interpretarse como certificación de la Fase 12.1 ni corregir implícitamente sus bloqueos.

Publicación
Vista previa de Vercel sobre rama de feature. Revisión humana antes de fusionar a main.
Si la protección de Vercel impide acceso anónimo, no declarar la vista previa públicamente accesible.
Reversión: cerrar PR sin fusionar, conservando main y los datos.
