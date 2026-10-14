# CalculadoraPresupuestosJOULE — Integración en Tool Factory

## Objetivo
Añadir una calculadora de presupuestos reales de recursos dentro de la factoría, manteniendo intacto el registro original de Tool Factory y la aplicación independiente.

## Acceso
- Menú: Calculadora JOULE
- Tool Factory: botón Abrir calculadora
- Ruta: /tools/calculadora-presupuestos-joule
- Los manifiestos de categoría budget_calculator existentes muestran un acceso adicional a la calculadora integrada. No se añaden automáticamente herramientas al almacén.

## Persistencia
- Datos de la factoría: localStorage['gago-factory-data'] — SIN CAMBIOS.
- Datos de la calculadora: localStorage['gago-factory-calculadora-presupuestos-joule-v1'] — clave separada.
- No se modifican datos de proyectos, tareas, artefactos ni evidencias.
- No es posible leer automáticamente el localStorage de otro origen por restricciones del navegador.
- Para importar un presupuesto de la aplicación independiente, exportar su JSON y usar Importar JSON.

## Funciones implementadas
- Cálculo financiero exacto con bigint en céntimos, sin error de coma flotante.
- Recursos CPU/GPU, memoria, almacenamiento, red, APIs y otros.
- Precios únicos, por hora, por día y por mes.
- Horas y días mensuales configurables, contingencia del 0 al 50 %.
- Crear, editar y eliminar recursos con confirmación.
- Máximo 100 recursos, cantidades enteras 1–1.000.000, precios de hasta 1.000.000,00 € y máximo dos decimales.
- Guardado local, exportación JSON/CSV e importación JSON validada de hasta 64 KB.
- Visualización de objeto presupuestario sin servicios externos.
- Ejemplo inicial verificable: 2 CPU x 10 € + 4 memorias x 5 € + almacenamiento 15 € = 55 €.

## Integridad y limitaciones
- Precios aportados por el usuario; no consulta tarifas externas, no contrata infraestructura.
- No modifica una herramienta generada que solo exista en localStorage de otro dominio.
- No activa JOULE ni presume comunicación con su motor; es una calculadora independiente integrada en el menú y Tool Factory.
- El indicador de la herramienta original no se cambia a VERIFICADO sin pruebas de ese artefacto específico.
- La calculadora integrada cuenta con su propia batería de 20 pruebas en GitHub Actions.

## Pruebas
En la raíz: npm ci; npm run typecheck; npx vitest run src/tests/calculadora-presupuestos-joule.test.ts; npm run build.
También se ejecutan en el job calculadora-joule del workflow CI.

## Reversión
No fusionar el PR o cerrar la rama conserva main sin cambios. Tras fusionar, revertir los commits de la integración mediante Git y mantener los datos existentes sin borrar las claves de localStorage.
