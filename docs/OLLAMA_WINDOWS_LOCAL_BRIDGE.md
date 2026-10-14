# Ollama local + Qwen Coder — GAGO OPEN ARTIFACT FACTORY

## Propósito y modelo de confianza

La factoría es una SPA Vite/React alojada por HTTPS. No tiene acceso directo al disco ni
a los procesos de Windows. Esta integración utiliza un **compañero local Node.js**:
el navegador llama a 127.0.0.1:11435 y el proceso de Node realiza peticiones
a 127.0.0.1:11434 (Ollama). Nada de esto requiere credenciales de inferencia externa
ni abrir puertos al router.

El puente escucha exclusivamente en 127.0.0.1, utiliza un token aleatorio temporal
que cambia en cada inicio y verifica un conjunto explícito de orígenes CORS.
No hay comodines, túnel, API pública de Vercel ni servicio persistente en la nube.
La clave se pega solamente en la pantalla y se guarda en memoria React mientras
la página permanece abierta; no se guarda en el almacenamiento del navegador.

Esto reduce el riesgo, pero no sustituye la seguridad del propio PC ni de la página
autorizada. No se debe configurar un origen que no se controle. En Chrome/Brave
puede aparecer un diálogo de permiso de acceso a la red local: autoriza solo
el origen concreto de la factoría. Según navegador y políticas, la función
targetAddressSpace del estándar de acceso a red local puede no estar disponible;
en ese caso se requiere navegador compatible o ejecución local de la aplicación.

## 1. Identificar hardware Windows

Abra PowerShell y ejecute:

Get-CimInstance Win32_ComputerSystem | Select-Object @{N='RAM_GB';E={[math]::Round($_.TotalPhysicalMemory / 1GB,1)}},Model

Get-CimInstance Win32_VideoController | Select-Object Name,AdapterRAM

El valor AdapterRAM puede ser inexacto en GPUs modernas: comprobar también
Administrador de tareas -> Rendimiento -> GPU. Si no se conocen los recursos,
comenzar por qwen2.5-coder:1.5b, contexto de 4k.

## 2. Configurar Ollama

En Settings: Cloud OFF para mantener todas las inferencias locales.
Expose Ollama to the network OFF. Auto-download updates opcional ON.
Context length 4k, model location predeterminada.

Abrir PowerShell:

ollama pull qwen2.5-coder:1.5b
ollama list
Invoke-RestMethod http://127.0.0.1:11434/api/tags

Si la RAM es 16 GB o más, probar qwen2.5-coder:3b; para 7b,
revisar RAM/VRAM antes de descargar. El tamaño en disco no equivale a RAM exacta.
No es preciso modificar OLLAMA_HOST ni OLLAMA_ORIGINS porque el bridge
conversa con Ollama desde el mismo PC.

## 3. Iniciar el puente Windows

Se necesita Node.js reciente (comprobar mediante node --version) y Git.

git clone --single-branch --branch feature/ollama-secure-local-bridge-20261014 https://github.com/sae-space-ai/GAGO-OPEN-ARTIFACT-FACTORY.git
cd GAGO-OPEN-ARTIFACT-FACTORY

En otra ventana abra el dominio EXACTO de su factoría (para probar, la URL
de vista previa enlazada en el PR). Copie SOLO el origen HTTPS hasta el .app,
sin barras ni rutas adicionales.

En PowerShell defina, por ejemplo:

$env:GAGO_ALLOWED_ORIGIN = "https://REEMPLAZAR-URL-EXACTA.vercel.app"
node scripts/ollama-local-bridge.mjs

IMPORTANTE: sustituir el dominio por la URL exacta de vista previa.
Nunca utilizar https://*.vercel.app. Para otra URL hay que reiniciar el proceso
con el origen correspondiente. Para desarrollo local permitir http://localhost:5173.

El script imprimirá un secreto aleatorio de 64 caracteres. No se debe publicar
ni adjuntar a un chat. Se genera otro secreto al reiniciar el puente.

## 4. Probar desde la aplicación

En la MISMA máquina:
Integraciones -> Ollama Local -> introducir la clave temporal.
Pulsar "Verificar conexión".
Cuando se haya comprobado el catálogo de modelos, seleccionar el Qwen instalado.
Pulsar "Probar inferencia local".
Comprobar la respuesta, modelo y métricas.
Si falla, comprobar consola, URL de origen exacta, estado de Ollama, permiso
de red local del navegador y firewall. Nunca desactivar protecciones globales.

## 5. JOULE

El adaptador exporta una ruta JouleRoute cuando se ha verificado la conexión
local. La ruta declara coste monetario de API igual a cero; esta cifra NO
representa consumo eléctrico ni ahorro. estimatedSuccessRate=0 significa
SIN ESTIMACIÓN válida; confidence=unknown. JOULE no se activa automáticamente.
La pantalla permite utilizar la inferencia de forma manual. La promoción de
una ruta a selección automática requiere telemetría real y controles adicionales.

## 6. Límites de seguridad

El bridge admite solo /health, /models y /chat.
Solo un proceso de inferencia simultáneo.
Máximo 4000 caracteres en prompt.
Máximo 512 tokens de salida y 4k de contexto por petición.
No implementa ejecución de comandos, acceso a archivos ni proxy genérico.
No permite a cualquier web acceder al bridge mediante CORS: solo al origen
expresamente configurado y con una clave temporal que no se persiste.
Nunca elegir "Expose Ollama to the network" en Settings.
No abrir ni redirigir los puertos 11434 o 11435 en el router.

## 7. Test y reversión

node --test tests/ollama-local-bridge.test.mjs
npm ci
npm run typecheck
npm run build

Solo el primer comando requiere Node.js y no instala dependencias.
CI ejecutará los controles completos en rama de prueba.
Para revertir: cerrar el bridge y cerrar el PR sin integrarlo. No se alteran
proyectos, herramientas, estados de JOULE ni datos locales.
