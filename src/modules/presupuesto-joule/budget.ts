export type Kind='compute'|'memory'|'storage'|'network'|'api'|'other';
export type Period='once'|'hour'|'day'|'month';
export type Resource={id:string;name:string;category:Kind;quantity:number;unitPrice:string;period:Period};
export type Input={title:string;monthlyHours:number;monthlyDays:number;contingencyPercent:number;resources:Resource[]};
export type Line=Resource&{totalCents:bigint;multiplier:number};
export type Result={lines:Line[];subtotalCents:bigint;contingencyCents:bigint;totalCents:bigint};
export const KEY='gago-factory-calculadora-presupuestos-joule-v1';
export const SAMPLE:Input={title:'Presupuesto JOULE',monthlyHours:160,monthlyDays:30,contingencyPercent:0,resources:[
{id:'cpu',name:'CPU',category:'compute',quantity:2,unitPrice:'10',period:'month'},
{id:'ram',name:'Memoria',category:'memory',quantity:4,unitPrice:'5',period:'month'},
{id:'disk',name:'Almacenamiento',category:'storage',quantity:1,unitPrice:'15',period:'month'}]};
export class InvalidBudget extends Error{constructor(msg:string){super(msg);this.name='InvalidBudget';}}
const check=(ok:boolean,msg:string)=>{if(!ok)throw new InvalidBudget(msg);};
export function parseCents(input:string):bigint{
 check(typeof input==='string' && /^(0|[1-9][0-9]*)([.,][0-9]{1,2})?$/.test(input.trim()),'Precio inválido: máximo dos decimales y sin importes negativos');
 const [integer,decimal='']=input.trim().replace(',','.').split('.');
 const cents=BigInt(integer)*100n+BigInt(decimal.padEnd(2,'0'));
 check(cents<=100000000n,'El precio unitario supera 1.000.000 €');
 return cents;
}
export function formatEUR(cents:bigint):string{
 const whole=(cents/100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.');
 return whole+','+String(cents%100n).padStart(2,'0')+' €';
}
export function calculate(input:Input):Result{
 check(!!input&&typeof input.title==='string'&&!!input.title.trim()&&input.title.length<=120,'Título inválido');
 check(Number.isInteger(input.monthlyHours)&&input.monthlyHours>=1&&input.monthlyHours<=744,'Horas al mes: 1 a 744');
 check(Number.isInteger(input.monthlyDays)&&input.monthlyDays>=1&&input.monthlyDays<=31,'Días al mes: 1 a 31');
 check(Number.isInteger(input.contingencyPercent)&&input.contingencyPercent>=0&&input.contingencyPercent<=50,'Contingencia: 0 a 50%');
 check(Array.isArray(input.resources)&&input.resources.length<=100,'Máximo 100 recursos');
 const ids=new Set<string>(), lines:Line[]=[];
 for(let i=0;i<input.resources.length;i++){
  const r=input.resources[i];
  check(typeof r.id==='string'&&!!r.id&&!ids.has(r.id),'Identificador duplicado o inválido');ids.add(r.id);
  check(typeof r.name==='string'&&!!r.name.trim()&&r.name.length<=100,'Nombre de recurso inválido');
  check(['compute','memory','storage','network','api','other'].includes(r.category),'Categoría inválida');
  check(['once','hour','day','month'].includes(r.period),'Periodo inválido');
  check(Number.isSafeInteger(r.quantity)&&r.quantity>=1&&r.quantity<=1000000,'Cantidad entera entre 1 y 1.000.000');
  const mult=r.period==='hour'?input.monthlyHours:r.period==='day'?input.monthlyDays:1;
  const total=parseCents(r.unitPrice)*BigInt(r.quantity)*BigInt(mult);
  check(total<=100000000000000n,'Importe de fila fuera de límites');
  lines.push({...r,multiplier:mult,totalCents:total});
 }
 const subtotalCents=lines.reduce((s,r)=>s+r.totalCents,0n);
 check(subtotalCents<=100000000000000n,'Subtotal fuera de límites');
 const contingencyCents=(subtotalCents*BigInt(input.contingencyPercent)+50n)/100n;
 const totalCents=subtotalCents+contingencyCents;
 check(totalCents<=100000000000000n,'Total fuera de límites');
 return {lines,subtotalCents,contingencyCents,totalCents};
}
export function loadDocument(raw:unknown):Input{
 check(!!raw&&typeof raw==='object'&&!Array.isArray(raw),'Documento no válido');
 const v=raw as {version?:number;input?:Input};
 check(v.version===1&&!!v.input,'Versión no admitida');
 calculate(v.input!);
 const d=v.input!;
 return {title:d.title,monthlyDays:d.monthlyDays,monthlyHours:d.monthlyHours,contingencyPercent:d.contingencyPercent,resources:d.resources.map(r=>({...r}))};
}
export function exportDocument(input:Input,result:Result){return {version:1,kind:'joule-budget',timestamp:new Date().toISOString(),input,totalEUR:(result.totalCents/100n).toString()+'.'+String(result.totalCents%100n).padStart(2,'0')};}
