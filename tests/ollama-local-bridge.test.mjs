import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createBridge, validOrigin, validModelName, safePrompt, validToken } from '../scripts/ollama-local-bridge.mjs';

const ORIGIN='https://factory.example.test';
const TOKEN='a'.repeat(64);
const BASE='http://127.0.0.1:11435';
const calls=[];
const fakeOllama=async(path,{method,body}={})=>{
  calls.push({path,method,body});
  if(path==='/api/tags') return {models:[{name:'qwen2.5-coder:1.5b',size:986000000}]};
  if(path==='/api/chat') return {message:{content:'Respuesta local válida'},total_duration:1000000,eval_count:4};
  throw Error('INVALID_OLLAMA_CALL');
};
let server;
before(async()=>{
  server=createBridge({token:TOKEN,origins:[ORIGIN],ollama:fakeOllama});
  await new Promise(resolve=>server.listen(11435,'127.0.0.1',resolve));
});
after(()=>new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve())));
const headers=(origin=ORIGIN, token=TOKEN)=>({Origin:origin,Authorization:'Bearer '+token});
const call=(path, init={})=>fetch(BASE+path,{...init, headers:{...headers(),...init.headers}});

test('rejects origin wildcards and unauthorized origins',()=>{
  assert.equal(validOrigin(ORIGIN,[ORIGIN]),true);
  assert.equal(validOrigin('https://evil.example',[ORIGIN]),false);
  assert.equal(validOrigin(undefined,[ORIGIN]),false);
});
test('requires properly formatted models and bounded prompts',()=>{
  assert.equal(validModelName('qwen2.5-coder:1.5b'),true);
  assert.equal(validModelName('../etc/passwd?x'),false);
  assert.equal(safePrompt('A'.repeat(4000)),true);
  assert.equal(safePrompt('A'.repeat(4001)),false);
});
test('constant-time token comparison denies arbitrary values',()=>{
  assert.equal(validToken(TOKEN,TOKEN),true);
  assert.equal(validToken('b'.repeat(64),TOKEN),false);
  assert.equal(validToken('bad',TOKEN),false);
});
test('unauthorized website is rejected before authentication',async()=>{
  const r=await call('/health',{headers:{Origin:'https://evil.example'}});
  assert.equal(r.status,403);
  assert.equal((await r.json()).error,'ORIGIN_FORBIDDEN');
});
test('missing or invalid pairing token is rejected',async()=>{
  for(const token of ['', 'bad']){
    const r=await call('/models',{headers:{Authorization:'Bearer '+token}});
    assert.equal(r.status,401);
  }
});
test('GET /health confirms models only after token verification',async()=>{
  const r=await call('/health');
  assert.equal(r.status,200);
  const data=await r.json();
  assert.equal(data.connected,true);
  assert.deepEqual(data.models,['qwen2.5-coder:1.5b']);
  assert.equal(r.headers.get('Access-Control-Allow-Origin'),ORIGIN);
});
test('CORS preflight uses exact allowed origin, not wildcard',async()=>{
  const r=await call('/chat',{method:'OPTIONS',headers:{Authorization:'', 'Access-Control-Request-Headers':'authorization, content-type'}});
  assert.equal(r.status,204);
  assert.equal(r.headers.get('Access-Control-Allow-Origin'),ORIGIN);
  assert.equal(r.headers.get('Access-Control-Allow-Headers'),'Authorization, Content-Type');
});
test('chat rejects non-installed models before inferencing',async()=>{
  const r=await call('/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'unknown:1b',prompt:'hola'})});
  assert.equal(r.status,400);
  assert.equal((await r.json()).error,'MODEL_NOT_INSTALLED');
});
test('chat only permits a named installed model and bounded inference',async()=>{
  const r=await call('/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'qwen2.5-coder:1.5b',prompt:'Código TypeScript de prueba'})});
  assert.equal(r.status,200);
  const data=await r.json();
  assert.equal(data.answer,'Respuesta local válida');
  const post=calls.find(x=>x.path==='/api/chat');
  assert.equal(post.body.options.num_ctx,4096);
  assert.equal(post.body.options.num_predict,512);
  assert.equal(post.body.model,'qwen2.5-coder:1.5b');
});
test('denies unsupported HTTP actions',async()=>{
  const r=await call('/configure',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
  assert.equal(r.status,404);
});
test('host header must point to loopback hostname',async()=>{
  const r=await call('/health',{headers:{Host:'example.com:11435'}});
  assert.equal(r.status,403);
});
