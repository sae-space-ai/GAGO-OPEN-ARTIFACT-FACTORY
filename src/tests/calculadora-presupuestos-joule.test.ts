import { describe, it, expect } from 'vitest';
import { calculate, parseCents, formatEUR, SAMPLE, loadDocument, exportDocument, InvalidBudget, KEY } from '../modules/presupuesto-joule/budget';
import type { Input } from '../modules/presupuesto-joule/budget';

const sample = (): Input => structuredClone(SAMPLE);
const line = (id: string, price: string, period: 'once' | 'hour' | 'day' | 'month' = 'month') =>
  ({ id, name: id, category: 'compute' as const, quantity: 1, unitPrice: price, period });

describe('CalculadoraPresupuestosJOULE integrated — exact arithmetic and isolation', () => {
  it('preserves example 55 EUR', () => expect(calculate(sample()).totalCents).toBe(5500n));
  it('formats currency as expected', () => expect(formatEUR(5500n)).toBe('55,00 €'));
  it('0.10 + 0.20 is exactly 0.30', () => expect(parseCents('0.10') + parseCents('0.20')).toBe(30n));
  it('accepts comma decimals', () => expect(parseCents('1,25')).toBe(125n));
  it('multiplies 0.50 EUR by 160 hours', () => {
    const s = sample(); s.resources = [line('gpu', '0.50', 'hour')];
    expect(calculate(s).totalCents).toBe(8000n);
  });
  it('multiplies day rates by configured days', () => {
    const s = sample(); s.resources = [line('red', '0.13', 'day')];
    s.resources[0].quantity = 2;
    expect(calculate(s).totalCents).toBe(780n);
  });
  it('uses multiplier 1 for monthly rates', () => {
    const s = sample(); s.resources = [line('cpu', '15', 'month')];
    expect(calculate(s).totalCents).toBe(1500n);
  });
  it('uses multiplier 1 for once-only rates', () => {
    const s = sample(); s.resources = [line('cpu', '15', 'once')];
    expect(calculate(s).totalCents).toBe(1500n);
  });
  it('accepts zero-cost resources', () => {
    const s = sample(); s.resources = [line('gratis', '0')];
    expect(calculate(s).totalCents).toBe(0n);
  });
  it('calculates 10 percent contingency on 55 EUR', () => {
    const s = sample(); s.contingencyPercent = 10;
    expect(calculate(s).totalCents).toBe(6050n);
  });
  it('rejects fractional and negative quantities', () => {
    for (const amount of [0, -1, 0.3, 1.5, 1000001]) {
      const s = sample(); s.resources[0].quantity = amount;
      expect(() => calculate(s)).toThrow(InvalidBudget);
    }
  });
  it('rejects negative, malformed and overprecision prices', () => {
    for (const price of ['-1', '1.234', 'NaN', '01', '1e3', '999999999']) {
      expect(() => parseCents(price)).toThrow(InvalidBudget);
    }
  });
  it('rejects duplicate resource IDs', () => {
    const s = sample(); s.resources[0].id = s.resources[1].id;
    expect(() => calculate(s)).toThrow(InvalidBudget);
  });
  it('rejects 101 resources', () => {
    const s = sample(); s.resources = Array.from({ length: 101 }, (_, i) => ({ ...SAMPLE.resources[0], id: String(i) }));
    expect(() => calculate(s)).toThrow(InvalidBudget);
  });
  it('rejects invalid time limits', () => {
    for (const hours of [0, 745, 0.5]) {
      const s = sample(); s.monthlyHours = hours;
      expect(() => calculate(s)).toThrow(InvalidBudget);
    }
  });
  it('rejects contingency above fifty percent', () => {
    const s = sample(); s.contingencyPercent = 51;
    expect(() => calculate(s)).toThrow(InvalidBudget);
  });
  it('rejects invalid budget titles', () => {
    const s = sample(); s.title = ' ';
    expect(() => calculate(s)).toThrow(InvalidBudget);
  });
  it('roundtrips exported documents using v1 schema', () => {
    const s = sample(); expect(loadDocument(exportDocument(s, calculate(s)))).toEqual(s);
  });
  it('rejects unsupported import versions', () => {
    expect(() => loadDocument({ version: 2, input: sample() })).toThrow(InvalidBudget);
  });
  it('uses separate persistence key, never altering the factory DataStore', () => {
    expect(KEY).not.toBe('gago-factory-data');
    expect(KEY).toContain('calculadora');
  });
});
