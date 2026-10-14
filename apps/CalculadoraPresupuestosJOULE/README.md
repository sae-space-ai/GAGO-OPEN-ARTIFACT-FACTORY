# CalculadoraPresupuestosJOULE
Proyecto independiente Vite + React + TypeScript. Creado sin tocar la aplicación original de Tool Factory ni su almacenamiento local.
## Ejecución
`npm install`
`npm test`
`npm run build`
`npm run dev`
En Vercel: raíz del proyecto = `apps/CalculadoraPresupuestosJOULE`, framework Vite, salida `dist`.
## Datos de prueba
CPU 2x10 EUR, memoria 4x5 EUR, almacenamiento 1x15 EUR, por mes => **55 EUR**. Tarifa GPU 0,50 EUR/h con 160 h => **80 EUR**.
## Controles
Dinero en BigInt céntimos enteros. Unidades enteras positivas, precios de cero a 1.000.000 EUR, máximo 100 recursos, periodo una vez/hora/día/mes, límites de 1-744 horas y 1-31 días, contingencia de 0 a 50%, importación JSON validada, exportación JSON y CSV, persistencia aislada.
No se consultan precios reales, ni se contratan servicios, ni se facturan importes. La herramienta generada previamente en el navegador del usuario sigue intacta y no se ha podido recuperar su código original completo a partir de una imagen. Esta implementación es una versión independiente comprobable.
