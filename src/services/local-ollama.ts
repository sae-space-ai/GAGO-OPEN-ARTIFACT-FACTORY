import type { JouleRoute } from '../types/joule';

export const GAGO_OLLAMA_BRIDGE_URL = 'http://127.0.0.1:11435';
export type LocalOllamaHealth = {connected:boolean;models:string[];costOfApiEUR:0;local:true};
export type LocalOllamaModel = {name:string;size:number};
export type LocalOllamaChat = {answer:string;model:string;metrics:{totalDurationNs:number|null;evalCount:number|null}};

function localRequestInit(init: RequestInit): RequestInit {
  // Chromium's modern Local Network Access standard treats loopback as a special
  // address space and may request the user's permission the first time.
  return {...init, targetAddressSpace: 'loopback'} as RequestInit;
}
async function request<T>(endpoint:'/health'|'/models'|'/chat', token:string, input?:Record<string, unknown>):Promise<T>{
  if(!/^[a-f0-9]{64}$/.test(token)) throw new Error('Introduzca la clave temporal de 64 caracteres que muestra el puente local.');
  const signal=AbortSignal.timeout(endpoint==='/chat'?100000:8000);
  let response:Response;
  try{
    response=await fetch(GAGO_OLLAMA_BRIDGE_URL+endpoint,localRequestInit({
      method:input?'POST':'GET',
      headers:{Authorization:'Bearer '+token, ...(input?{'Content-Type':'application/json'}:{})},
      body:input?JSON.stringify(input):undefined,
      credentials:'omit',
      cache:'no-store',
      signal
    }));
  }catch{
    throw new Error('No se puede contactar con el puente local. Compruebe que está abierto, que permite este origen y que el navegador ha autorizado el acceso a la red local.');
  }
  let data: any;
  try{data=await response.json();}catch{throw new Error('El puente respondió sin un JSON válido.');}
  if(!response.ok)throw new Error(typeof data.error==='string'?data.error:'HTTP '+response.status);
  return data as T;
}
export const verifyLocalOllamaBridge=(token:string):Promise<LocalOllamaHealth>=>request('/health',token);
export const listLocalOllamaModels=(token:string):Promise<{models:LocalOllamaModel[]}>=>request('/models',token);
export const chatWithLocalOllama=(token:string,model:string,prompt:string):Promise<LocalOllamaChat>=>
  request('/chat',token,{model,prompt});

/**
 * Exposes the local verified provider to JOULE's existing route contract.
 * This is only an eligible route descriptor, NOT measured quality or cost savings.
 * JOULE must not automatically execute or promote this without user consent.
 */
export function localOllamaJouleRoute(model:string, verified:boolean):JouleRoute {
  return {
    id:'ollama-local:'+model,
    kind:'ai_provider',
    provider:'ollama-local',
    capabilities:['text-generation','code-generation'],
    constraints:{requiresAuth:true,requiresNetwork:false,privacyLevel:'internal',idempotent:false,reversible:true},
    cost:{monetary:0,units:1,latencyMs:0},
    estimatedSuccessRate:0,
    confidence:'unknown',
    available:verified,
    version:'1.0.0'
  };
}
