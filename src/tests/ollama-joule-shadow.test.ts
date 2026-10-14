import { describe, expect, it } from 'vitest';
import { jouleActivate, jouleCreateInitialState, jouleEngageKillSwitch, jouleRecordMeasurement, jouleGetMetrics } from '../services/joule';
import { jouleObserveStart } from '../services/joule/observe';
import { finishOllamaShadowObservation, shouldObserveOllamaShadow } from '../services/ollama-joule-observability';

describe('Ollama + JOULE: non-invasive Shadow telemetry', () => {
  it('does not record while JOULE is disabled', () => {
    expect(shouldObserveOllamaShadow(jouleCreateInitialState())).toBe(false);
  });
  it('observes only when JOULE is in Shadow mode', () => {
    const shadow = jouleActivate(jouleCreateInitialState(),'shadow','policy-shadow');
    expect(shouldObserveOllamaShadow(shadow)).toBe(true);
    expect(shadow.activePolicyId).toBe('policy-shadow');
    expect(shouldObserveOllamaShadow(jouleActivate(jouleCreateInitialState(),'canary'))).toBe(false);
    expect(shouldObserveOllamaShadow(jouleActivate(jouleCreateInitialState(),'active'))).toBe(false);
  });
  it('never records while emergency kill switch is engaged', () => {
    const shadow = jouleActivate(jouleCreateInitialState(),'shadow','policy-shadow');
    expect(shouldObserveOllamaShadow(jouleEngageKillSwitch(shadow,'Test'))).toBe(false);
  });
  it('records real duration and local route but not secrets or code', () => {
    const start = jouleObserveStart('ollama-inference:qwen2.5-coder:0.5b',
      'ollama-local:qwen2.5-coder:0.5b','ai_request');
    const result = finishOllamaShadowObservation(start,true);
    expect(result.routeId).toBe('ollama-local:qwen2.5-coder:0.5b');
    expect(result.category).toBe('ai_request');
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
    expect(result.source).toBe('observed');
    expect(result.success).toBe(true);
    expect(result.verified).toBe(false);
    expect(result.energyMj).toBeUndefined();
    expect(result.errorMessage).toBeUndefined();
    expect(result.monetaryCost).toBe(0);
    expect(JSON.stringify(result)).not.toContain('prompt');
    expect(JSON.stringify(result)).not.toContain('token');
  });
  it('records failures without including raw error details', () => {
    const start=jouleObserveStart('ollama-inference:Qwen','ollama-local:Qwen','ai_request');
    const m=finishOllamaShadowObservation(start,false);
    expect(m.success).toBe(false);
    expect(m.verified).toBe(false);
    expect(m.errorMessage).toBe('OLLAMA_LOCAL_REQUEST_FAILED');
  });
  it('updates operation counters but never claims independent code verification', () => {
    const start=jouleObserveStart('ollama-inference:Qwen','ollama-local:Qwen','ai_request');
    const measurement=finishOllamaShadowObservation(start,true);
    const initial=jouleActivate(jouleCreateInitialState(),'shadow','policy-shadow');
    const next=jouleRecordMeasurement(initial,measurement,'ai_request');
    const metrics=jouleGetMetrics(next);
    expect(metrics.totalOperations).toBe(1);
    expect(metrics.successfulOperations).toBe(1);
    expect(metrics.failedOperations).toBe(0);
    expect(metrics.verifiedOperations).toBe(0);
    expect(metrics.shadowDecisions).toBe(0);
    expect(Object.keys(next.experienceMap.entries)).toHaveLength(0);
  });
  it('does not invent a Shadow route decision from an observed inference', () => {
    const state=jouleActivate(jouleCreateInitialState(),'shadow','policy-shadow');
    const ctx=jouleObserveStart('ollama-inference:Qwen','ollama-local:Qwen','ai_request');
    const measured=jouleRecordMeasurement(state,finishOllamaShadowObservation(ctx,true),'ai_request');
    expect(measured.decisions).toHaveLength(0);
    expect(measured.reports).toHaveLength(0);
  });
});
