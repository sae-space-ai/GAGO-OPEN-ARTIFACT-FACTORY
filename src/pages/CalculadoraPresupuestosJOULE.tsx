import React, { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calculator, Download, FileJson, FileSpreadsheet, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { calculate, exportDocument, formatEUR, KEY, loadDocument, SAMPLE, type Input, type Kind, type Period, type Resource } from '../modules/presupuesto-joule/budget';

const categories: Record<Kind, string> = { compute: 'CPU / GPU', memory: 'Memoria', storage: 'Almacenamiento', network: 'Red', api: 'API', other: 'Otros' };
const periods: Record<Period, string> = { once: 'Única', hour: 'Por hora', day: 'Por día', month: 'Por mes' };

function initialBudget(): Input {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored) return loadDocument(JSON.parse(stored));
  } catch { /* Un documento no válido nunca debe sobrescribir datos del resto de la factoría. */ }
  return structuredClone(SAMPLE);
}

function download(filename: string, content: string, mime: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function CalculadoraPresupuestosJOULE() {
  const [input, setInput] = useState<Input>(initialBudget);
  const [notice, setNotice] = useState('');
  const [saveError, setSaveError] = useState('');
  const [showJson, setShowJson] = useState(false);
  const state = useMemo(() => {
    try { return { result: calculate(input), error: '' }; }
    catch (error) { return { result: null, error: error instanceof Error ? error.message : 'Datos inválidos' }; }
  }, [input]);

  useEffect(() => {
    if (!state.result) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(exportDocument(input, state.result)));
      setSaveError('');
    } catch {
      setSaveError('No se ha podido guardar el presupuesto. Exporta el archivo JSON.');
    }
  }, [input, state.result]);

  const edit = <K extends keyof Input>(key: K, value: Input[K]) => setInput(current => ({ ...current, [key]: value }));
  const patch = (id: string, change: Partial<Resource>) => setInput(current => ({
    ...current, resources: current.resources.map(item => item.id === id ? { ...item, ...change } : item)
  }));
  const add = () => setInput(current => current.resources.length >= 100 ? current : ({
    ...current,
    resources: [...current.resources, {
      id: crypto.randomUUID(), name: 'Nuevo recurso', category: 'other', quantity: 1,
      unitPrice: '0', period: 'month'
    }]
  }));
  const remove = (id: string) => {
    if (window.confirm('¿Eliminar este recurso del presupuesto?')) {
      setInput(current => ({ ...current, resources: current.resources.filter(item => item.id !== id) }));
    }
  };

  const importJSON = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      if (file.size > 65536) throw new Error('El archivo supera el límite de 64 KB.');
      const imported = loadDocument(JSON.parse(await file.text()));
      if (window.confirm('¿Reemplazar únicamente el presupuesto de esta calculadora? Los demás datos de Tool Factory permanecerán intactos.')) {
        setInput(imported);
        setNotice('Presupuesto importado y validado correctamente.');
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'El documento no se ha podido importar.');
    }
  };

  const exportJSON = () => {
    if (!state.result) return;
    download('calculadora-presupuestos-joule.json',
      JSON.stringify(exportDocument(input, state.result), null, 2), 'application/json');
  };
  const exportCSV = () => {
    if (!state.result) return;
    const quote = (value: string) => '"' + value.replace(/"/g, '""') + '"';
    const records = [
      ['Recurso', 'Categoría', 'Cantidad', 'Tarifa EUR', 'Periodo', 'Subtotal EUR'],
      ...state.result.lines.map(line => [
        line.name, categories[line.category], String(line.quantity),
        line.unitPrice, periods[line.period],
        (line.totalCents / 100n).toString() + '.' + String(line.totalCents % 100n).padStart(2, '0')
      ])
    ];
    download('calculadora-presupuestos-joule.csv',
      '\uFEFF' + records.map(row => row.map(quote).join(';')).join('\r\n'),
      'text/csv;charset=utf-8');
  };

  const fieldClass = 'w-full min-w-0 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';
  const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors';
  const total = state.result ? formatEUR(state.result.totalCents) : '—';

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12 text-slate-900 dark:text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/tools" className="inline-flex items-center gap-2 text-sm text-blue-700 hover:underline dark:text-blue-300">
          <ArrowLeft className="h-4 w-4" /> Volver a Tool Factory
        </Link>
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">Motor local · Sin APIs de pago</span>
      </div>
      <header>
        <h1 className="flex items-center gap-3 text-2xl font-bold"><Calculator className="h-7 w-7 text-blue-600" /> CalculadoraPresupuestosJOULE</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Estimaciones de recursos computacionales. No consulta tarifas oficiales, no factura y no activa infraestructura.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs uppercase tracking-wider text-slate-500">Subtotal</p>
          <p className="mt-2 text-2xl font-semibold">{state.result ? formatEUR(state.result.subtotalCents) : '—'}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs uppercase tracking-wider text-slate-500">Contingencia</p>
          <p className="mt-2 text-2xl font-semibold">{state.result ? formatEUR(state.result.contingencyCents) : '—'}</p>
        </div>
        <div className="rounded-xl bg-slate-900 p-5 text-white dark:bg-blue-950">
          <p className="text-xs uppercase tracking-wider text-slate-300">Presupuesto total estimado</p>
          <output aria-label="Presupuesto total" className="mt-2 block text-3xl font-bold">{total}</output>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Configuración</h2>
          <button className={buttonClass + ' border border-slate-300 dark:border-slate-600'} onClick={() => {
            if (window.confirm('¿Restaurar el ejemplo de 55 €? Esto sustituye únicamente los datos de esta calculadora.')) {
              setInput(structuredClone(SAMPLE));
              setNotice('Ejemplo restaurado.');
            }
          }}><RotateCcw className="h-4 w-4" /> Restaurar ejemplo</button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm">Nombre del presupuesto
            <input aria-label="Nombre del presupuesto" className={fieldClass + ' mt-1'} maxLength={120} value={input.title} onChange={e => edit('title', e.target.value)} />
          </label>
          <label className="text-sm">Horas al mes
            <input aria-label="Horas al mes" className={fieldClass + ' mt-1'} type="number" min={1} max={744} value={input.monthlyHours} onChange={e => edit('monthlyHours', Number(e.target.value))} />
          </label>
          <label className="text-sm">Días al mes
            <input aria-label="Días al mes" className={fieldClass + ' mt-1'} type="number" min={1} max={31} value={input.monthlyDays} onChange={e => edit('monthlyDays', Number(e.target.value))} />
          </label>
          <label className="text-sm">Contingencia (%)
            <input aria-label="Contingencia (%)" className={fieldClass + ' mt-1'} type="number" min={0} max={50} value={input.contingencyPercent} onChange={e => edit('contingencyPercent', Number(e.target.value))} />
          </label>
        </div>
        <p className="mt-3 text-xs text-slate-500">Tarifa por hora y día: se multiplica por las horas o días configurados. Tarifa única o mensual: multiplicador 1. Sin IVA.</p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div><h2 className="text-lg font-semibold">Recursos presupuestados</h2><p className="text-xs text-slate-500">{input.resources.length} de 100 recursos</p></div>
          <button className={buttonClass + ' bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'} onClick={add} disabled={input.resources.length >= 100}>
            <Plus className="h-4 w-4" /> Añadir recurso
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="border-b text-xs uppercase text-slate-500 dark:border-slate-700">
              <tr><th className="px-2 py-3">Recurso</th><th className="px-2 py-3">Categoría</th><th className="px-2 py-3">Cantidad</th><th className="px-2 py-3">Precio unitario (€)</th><th className="px-2 py-3">Periodo</th><th className="px-2 py-3">Subtotal</th><th className="px-2 py-3">Acción</th></tr>
            </thead>
            <tbody>
              {input.resources.map((item, index) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700">
                  <td className="p-2"><input aria-label={'Nombre recurso ' + (index + 1)} className={fieldClass} maxLength={100} value={item.name} onChange={e => patch(item.id, { name: e.target.value })} /></td>
                  <td className="p-2"><select aria-label={'Categoría recurso ' + (index + 1)} className={fieldClass} value={item.category} onChange={e => patch(item.id, { category: e.target.value as Kind })}>{Object.entries(categories).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td>
                  <td className="p-2"><input aria-label={'Cantidad recurso ' + (index + 1)} className={fieldClass} type="number" min={1} max={1000000} value={item.quantity} onChange={e => patch(item.id, { quantity: Number(e.target.value) })} /></td>
                  <td className="p-2"><input aria-label={'Precio recurso ' + (index + 1)} className={fieldClass} inputMode="decimal" value={item.unitPrice} onChange={e => patch(item.id, { unitPrice: e.target.value })} /></td>
                  <td className="p-2"><select aria-label={'Periodo recurso ' + (index + 1)} className={fieldClass} value={item.period} onChange={e => patch(item.id, { period: e.target.value as Period })}>{Object.entries(periods).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td>
                  <td className="p-2 whitespace-nowrap font-semibold">{state.result ? formatEUR(state.result.lines[index].totalCents) : '—'}</td>
                  <td className="p-2"><button aria-label={'Eliminar recurso ' + (index + 1)} className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => remove(item.id)}><Trash2 className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {input.resources.length === 0 && <p className="p-6 text-center text-sm text-slate-500">Añade un recurso para comenzar.</p>}
        </div>
      </section>

      {state.error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">{state.error}. Corrige los valores antes de exportar.</p>}
      {saveError && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">{saveError}</p>}
      {notice && <p role="status" className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">{notice}</p>}

      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-lg font-semibold">Guardar, importar y exportar</h2>
        <p className="mt-2 text-sm text-slate-500">Guardado automático en una clave local independiente. El registro original de Tool Factory y los demás módulos no se modifican.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <label className={buttonClass + ' cursor-pointer border border-slate-300 dark:border-slate-600'}>
            <FileJson className="h-4 w-4" /> Importar JSON
            <input type="file" accept=".json,application/json" className="sr-only" onChange={importJSON} />
          </label>
          <button className={buttonClass + ' border border-slate-300 dark:border-slate-600 disabled:opacity-50'} disabled={!state.result} onClick={exportCSV}><FileSpreadsheet className="h-4 w-4" /> Exportar CSV</button>
          <button className={buttonClass + ' bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'} disabled={!state.result} onClick={exportJSON}><Download className="h-4 w-4" /> Exportar JSON</button>
          <button className={buttonClass + ' border border-slate-300 dark:border-slate-600 disabled:opacity-50'} disabled={!state.result} onClick={() => setShowJson(current => !current)}> {showJson ? 'Ocultar datos' : 'Ver objeto budget'}</button>
        </div>
        {showJson && state.result && <pre className="mt-4 max-h-80 overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-green-100">{JSON.stringify({
          budget: exportDocument(input, state.result),
          subtotalEUR: formatEUR(state.result.subtotalCents),
          contingencyEUR: formatEUR(state.result.contingencyCents),
          totalEUR: formatEUR(state.result.totalCents)
        }, null, 2)}</pre>}
      </section>
      <p className="text-xs text-slate-500">Esta calculadora es una herramienta de estimación local. No accede a la API de JOULE ni presenta importes como facturación real.</p>
    </div>
  );
}
