import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import { Cpu, ShieldCheck, RefreshCw, Send, LockKeyhole, ArrowLeft } from 'lucide-react';
import {
  verifyLocalOllamaBridge, listLocalOllamaModels, chatWithLocalOllama,
  localOllamaJouleRoute, GAGO_OLLAMA_BRIDGE_URL, type LocalOllamaModel
} from '../services/local-ollama';

export default function OllamaLocal() {
  // Ephemeral pairing secret: never stored in localStorage, app state or URLs.
  const [token,setToken]=useState('');
  const [status,setStatus]=useState<'PENDING'|'TESTING'|'VERIFIED'|'FAILED'>('PENDING');
  const [models,setModels]=useState<LocalOllamaModel[]>([]);
  const [selected,setSelected]=useState('');
  const [prompt,setPrompt]=useState('Escribe una función TypeScript para sumar 0.1 y 0.2 sin errores de precisión.');
  const [answer,setAnswer]=useState('');
  const [error,setError]=useState('');
  const [working,setWorking]=useState(false);
  const [lastMetrics,setLastMetrics]=useState<{totalDurationNs:number|null;evalCount:number|null}|null>(null);
  const inputClass='w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white';
  const btn='rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 hover:bg-blue-700';

  async function verify(){
    setStatus('TESTING');setError('');setAnswer('');setModels([]);setSelected('');
    try{
      const h=await verifyLocalOllamaBridge(token);
      if(!h.connected||!h.local)throw new Error('La respuesta no acredita el puente local.');
      const m=await listLocalOllamaModels(token);
      setModels(m.models);
      setSelected(m.models.find(x=>x.name==='qwen2.5-coder:1.5b')?.name || m.models[0]?.name || '');
      setStatus('VERIFIED');
    }catch(e){
      setStatus('FAILED');setError(e instanceof Error?e.message:'Error de verificación');
    }
  }

  async function run(){
    if(status!=='VERIFIED'||!selected||!prompt.trim())return;
    setError('');setWorking(true);setAnswer('');setLastMetrics(null);
    try{
      const result=await chatWithLocalOllama(token,selected,prompt);
      setAnswer(result.answer);
      setLastMetrics(result.metrics);
    }catch(e){setError(e instanceof Error?e.message:'Error al solicitar inferencia');}
    finally{setWorking(false);}
  }

  function disconnect(){setToken('');setStatus('PENDING');setModels([]);setSelected('');setAnswer('');setError('');setLastMetrics(null);}

  const route=selected ? localOllamaJouleRoute(selected,status==='VERIFIED') : null;

  return <div className="mx-auto max-w-4xl space-y-5 text-slate-900 dark:text-white">
    <Link className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400" to="/integrations"><ArrowLeft className="h-4 w-4"/>Volver a Integraciones</Link>
    <div>
      <h1 className="flex items-center gap-3 text-2xl font-bold"><Cpu className="h-7 w-7"/>Ollama Local · Qwen Coder</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Inferencia privada en el ordenador donde está abierto este navegador. Ollama no necesita exponerse a Internet.
        El alojamiento web no recibe la clave de emparejamiento ni hace la inferencia.
      </p>
    </div>
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <h2 className="flex items-center gap-2 text-lg font-semibold"><LockKeyhole className="h-5 w-5"/>1. Emparejar con el puente local</h2>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Inicia <code>npm run ollama:bridge</code> en PowerShell usando el origen web autorizado.
        El puente escucha solo en <code>{GAGO_OLLAMA_BRIDGE_URL}</code>.
        Copia aquí la clave temporal de 64 caracteres que se imprime en PowerShell.
      </p>
      <label className="block text-sm font-medium" htmlFor="ollama-token">Clave temporal de emparejamiento</label>
      <input id="ollama-token" type="password" autoComplete="off" spellCheck={false}
        className={inputClass} value={token} onChange={e=>{setToken(e.target.value.trim());setStatus('PENDING');setModels([]);setAnswer('');}}
        placeholder="Pega aquí la clave del puente local" />
      <div className="flex flex-wrap gap-3">
        <button className={btn+' inline-flex items-center gap-2'} onClick={verify} disabled={status==='TESTING'||token.length!==64}>
          <RefreshCw className="h-4 w-4"/> {status==='TESTING'?'Comprobando...':'Verificar conexión'}
        </button>
        <button className="rounded-lg border px-4 py-2.5 text-sm dark:border-slate-600" onClick={disconnect}>Desconectar</button>
      </div>
      <p role="status" className={'text-sm '+(status==='VERIFIED'?'text-green-700 dark:text-green-300':status==='FAILED'?'text-red-700 dark:text-red-300':'text-slate-600 dark:text-slate-300')}>
        {status==='VERIFIED'?'VERIFICADO: comunicación local autenticada y catálogo consultado.':
        status==='TESTING'?'Comprobando puente local...':
        status==='FAILED'?'No se ha verificado la conexión.':'PENDIENTE: emparejamiento sin completar.'}
      </p>
      {error&&<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300">{error}</p>}
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Si el navegador solicita permiso para acceder a dispositivos o servicios de tu red local, permite el acceso solo para tu propio sitio de la factoría.
        La clave no se guarda y tendrás que pegarla después de recargar la página.
      </p>
    </section>
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <h2 className="flex items-center gap-2 text-lg font-semibold"><ShieldCheck className="h-5 w-5"/>2. Seleccionar y probar Qwen</h2>
      <label className="block text-sm font-medium" htmlFor="ollama-model">Modelo instalado</label>
      <select id="ollama-model" className={inputClass} value={selected} onChange={e=>{setSelected(e.target.value);setAnswer('');}} disabled={status!=='VERIFIED'}>
        {models.length===0?<option value="">Sin modelos verificados</option>:models.map(m=><option key={m.name} value={m.name}>{m.name} · {(m.size/1e9).toFixed(2)} GB</option>)}
      </select>
      {status==='VERIFIED'&&models.length===0&&<p className="text-sm text-amber-700">No hay modelos instalados. Ejecuta en Windows: ollama pull qwen2.5-coder:1.5b</p>}
      <label className="block text-sm font-medium" htmlFor="ollama-prompt">Instrucción para el modelo</label>
      <textarea id="ollama-prompt" rows={5} maxLength={4000} className={inputClass} value={prompt} onChange={e=>setPrompt(e.target.value)}/>
      <button className={btn+' inline-flex items-center gap-2'} onClick={run} disabled={status!=='VERIFIED'||!selected||working||!prompt.trim()}>
        <Send className="h-4 w-4"/>{working?'Procesando en tu equipo...':'Probar inferencia local'}
      </button>
      {answer&&<section aria-label="Respuesta de Qwen" className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-900">
        <h3 className="mb-2 text-sm font-semibold">Respuesta real del modelo</h3>
        <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words text-sm">{answer}</pre>
      </section>}
      {lastMetrics&&<p className="text-xs text-slate-500 dark:text-slate-400">Tokens generados informados por Ollama: {lastMetrics.evalCount??'no disponible'}. Duración informada: {lastMetrics.totalDurationNs!==null?(lastMetrics.totalDurationNs/1e9).toFixed(2)+' s':'no disponible'}.</p>}
    </section>
    <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <h2 className="text-lg font-semibold">3. Preparación de JOULE</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        El conector expone una ruta de proveedor local compatible con los contratos de JOULE.
        No se activa JOULE, no se sustituye la política de referencia ni se promete ahorro de recursos.
      </p>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Ruta: {route?.id||'pendiente'} · Disponibilidad: {route?.available?'verificada para el catálogo':'pendiente'} · Confianza de calidad: desconocida · API facturable: no.
      </p>
    </section>
  </div>;
}
