import type { JouleState, JouleMeasurement } from '../types/joule';
import { jouleObserveEnd, type ObserveContext } from './joule/observe';

/**
 * Shadow observes the already selected local route without modifying inference.
 * Never grant model outputs independent verification or call JOULE's executor.
 */
export function shouldObserveOllamaShadow(state: JouleState | null | undefined): boolean {
  return !!state?.enabled && state.mode === 'shadow' && !state.killSwitchEngaged;
}

export function finishOllamaShadowObservation(
  ctx: ObserveContext,
  success: boolean
): JouleMeasurement {
  return jouleObserveEnd(ctx, {
    success,
    verified: false, // A generated answer is NOT an independently verified artifact.
    monetaryCost: 0, // Local Ollama API has no provider charge; electricity not measured.
    costUnits: 0, // No abstract compute-unit measurement available.
    // Do not save prompts, tokens, generated code, credentials or raw API errors.
    errorMessage: success ? undefined : 'OLLAMA_LOCAL_REQUEST_FAILED',
  });
}
