// Companion process on the user's OWN Windows PC. No cloud service, no public listener.
// Usage (PowerShell): $env:GAGO_ALLOWED_ORIGIN="https://YOUR-FACTORY.vercel.app"; npm run ollama:bridge
import http from 'node:http';
import { pathToFileURL } from 'node:url';
import { randomBytes, timingSafeEqual } from 'node:crypto';

export const HOST = '127.0.0.1';
export const PORT = 11435;
export const OLLAMA = 'http://127.0.0.1:11434';

export function validOrigin(origin, allowedOrigins) {
  return !!origin && allowedOrigins.includes(origin);
}
export function validModelName(name) {
  return typeof name === 'string' && name.length > 0 && name.length <= 128
    && /^[a-zA-Z0-9._:/-]+$/.test(name);
}
export function safePrompt(prompt) {
  return typeof prompt === 'string' && prompt.trim().length > 0 && prompt.length <= 4000;
}
export function validToken(candidate, secret) {
  if (typeof candidate !== 'string' || candidate.length !== secret.length) return false;
  return timingSafeEqual(Buffer.from(candidate), Buffer.from(secret));
}
function respond(res, status, value) {
  const data = Buffer.from(JSON.stringify(value));
  res.writeHead(status, {'Content-Type':'application/json; charset=utf-8', 'Content-Length':data.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  res.end(data);
}
function readJson(req, maxBytes = 9000) {
  return new Promise((resolve, reject) => {
    let size=0, data='';
    req.on('data', chunk => {size += chunk.length; if(size>maxBytes){reject(new Error('BODY_TOO_LARGE'));req.destroy();return;}data+=chunk.toString('utf8');});
    req.on('end', () => { try{resolve(JSON.parse(data));}catch{reject(new Error('INVALID_JSON'));} });
    req.on('error', reject);
  });
}
async function ollamaRequest(path, {method='GET', body, signal}={}) {
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),90000);
  if(signal) signal.addEventListener('abort',()=>controller.abort(),{once:true});
  try{
    const response=await fetch(OLLAMA+path,{method,headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:controller.signal});
    if(!response.ok)throw new Error('OLLAMA_HTTP_'+response.status);
    return await response.json();
  }finally{clearTimeout(timeout);}
}
export function createBridge({token, origins, ollama=ollamaRequest}){
  let running=0;
  let lastCall=0;
  const server=http.createServer(async(req,res)=>{
    const origin=req.headers.origin;
    // Reject origins other than the explicitly allowlisted frontend. CLI requests with no
    // Origin still require the one-time token. No wildcards and no exposed network interface.
    if(origin && !validOrigin(origin,origins)){respond(res,403,{error:'ORIGIN_FORBIDDEN'});return;}
    const host=req.headers.host;
    if(!['127.0.0.1:'+PORT,'localhost:'+PORT].includes(host)){respond(res,403,{error:'HOST_FORBIDDEN'});return;}
    if(origin){
      res.setHeader('Access-Control-Allow-Origin',origin);
      res.setHeader('Vary','Origin');
      res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers','Authorization, Content-Type');
    }
    if(req.method==='OPTIONS'){res.writeHead(204);res.end();return;}
    const auth=req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : '';
    if(!validToken(auth,token)){respond(res,401,{error:'PAIRING_REQUIRED'});return;}
    try{
      if(req.method==='GET' && req.url==='/health'){
        const data=await ollama('/api/tags');
        respond(res,200,{connected:true,models:(data.models||[]).map(m=>m.name).filter(validModelName),costOfApiEUR:0,local:true});
        return;
      }
      if(req.method==='GET' && req.url==='/models'){
        const data=await ollama('/api/tags');
        respond(res,200,{models:(data.models||[]).map(m=>({name:m.name,size:m.size})).filter(m=>validModelName(m.name))});
        return;
      }
      if(req.method==='POST' && req.url==='/chat'){
        if(running){respond(res,429,{error:'BUSY_ONE_INFERENCE_AT_A_TIME'});return;}
        if(Date.now()-lastCall<1500){respond(res,429,{error:'SLOW_DOWN'});return;}
        const data=await readJson(req);
        if(!validModelName(data.model)||!safePrompt(data.prompt)){respond(res,400,{error:'INVALID_REQUEST'});return;}
        const catalog=await ollama('/api/tags');
        if(!(catalog.models||[]).some(m=>m.name===data.model)){respond(res,400,{error:'MODEL_NOT_INSTALLED'});return;}
        running++;lastCall=Date.now();
        try{
          const result=await ollama('/api/chat',{
            method:'POST',
            body:{model:data.model,messages:[{role:'user',content:data.prompt}],stream:false,
              options:{num_ctx:4096,num_predict:512,temperature:0.2},keep_alive:'0'}
          });
          const answer=result.message?.content;
          if(typeof answer!=='string'){respond(res,502,{error:'INVALID_MODEL_REPLY'});return;}
          respond(res,200,{answer,model:data.model,metrics:{
            totalDurationNs:typeof result.total_duration==='number'?result.total_duration:null,
            evalCount:typeof result.eval_count==='number'?result.eval_count:null
          }});
        }finally{running--;}
        return;
      }
      respond(res,404,{error:'NOT_FOUND'});
    }catch(error){respond(res,error.message==='BODY_TOO_LARGE'?413:502,{error:error.message||'LOCAL_SERVICE_ERROR'});}
  });
  return server;
}
export function startBridge(){
  const allowed=(process.env.GAGO_ALLOWED_ORIGINS||process.env.GAGO_ALLOWED_ORIGIN||'http://localhost:5173')
    .split(',').map(s=>s.trim()).filter(Boolean);
  for(const origin of allowed){
    const parsed=new URL(origin);
    if(!['https:','http:'].includes(parsed.protocol)||parsed.pathname!=='/'||parsed.search||parsed.hash||origin.includes('*')
       ||(parsed.protocol==='http:' && !['localhost','127.0.0.1'].includes(parsed.hostname))){
      throw new Error('Origen no autorizado o no seguro: '+origin);
    }
  }
  const token=randomBytes(32).toString('hex');
  const server=createBridge({token,origins:allowed});
  server.listen(PORT,HOST,()=>{
    console.log('\nGAGO Local Bridge escuchando SOLAMENTE en http://'+HOST+':'+PORT);
    console.log('Origen permitido: '+allowed.join(', '));
    console.log('CLAVE DE EMPAREJAMIENTO TEMPORAL (no compartir):\n'+token);
    console.log('Abre Integraciones → Ollama Local en ese mismo ordenador; pega la clave.');
    console.log('Cierra esta ventana para desconectar. No abras el puerto en el router.\n');
  });
  return server;
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href){startBridge();}
