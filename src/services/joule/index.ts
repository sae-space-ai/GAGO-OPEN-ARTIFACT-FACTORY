// GAGO OPEN ARTIFACT FACTORY — JOULE API Pública
// Punto de entrada para usar el motor JOULE desde la aplicación.

// Motor central
export {
  jouleCreateInitialState,
  jouleActivate,
  jouleDeactivate,
  jouleEngageKillSwitch,
  jouleDisengageKillSwitch,
  jouleShouldOptimize,
  jouleProcessTask,
  jouleRecordMeasurement,
  jouleGetMetrics,
} from './engine';

// Componentes individuales
export { jouleObserveStart, jouleObserveEnd, jouleObserveSync, jouleObserveAsync, jouleObserveBrowserPerformance } from './observe';
export { jouleProfileTask } from './profile';
export { joulePredictRoute, joulePredictAllRoutes, joulePredictExpectedCost, joulePredictExpectedLatency } from './predict';
export { jouleOptimizeTask } from './optimize';
export { jouleExecute, jouleExecuteSync } from './execute';
export { jouleVerify, jouleVerifyStructural, jouleVerifyType } from './verify';
export { jouleLearn, jouleGetSuccessRate, jouleGetAverageCost, jouleGetAverageLatency, jouleGetCostPerCorrectResult, jouleCreateEmptyExperienceMap } from './learn';

// Políticas
export { REFERENCE_POLICY, CONSERVATIVE_POLICY, SHADOW_POLICY, CANARY_POLICY, DEFAULT_POLICIES } from './policies';

// Tipos
export type { ProfileInput } from './profile';
export type { OptimizationResult } from './optimize';
export type { JouleExecutor } from './execute';
export type { RouteEstimate } from './predict';
export type { ObserveContext } from './observe';
