import { signal } from '@angular/core';
import { STATE_SOURCE, StateSource } from './state-source';
import { DeepSignal, toDeepSignal } from './deep-signal';

type SignalState<State extends object> = DeepSignal<State> & StateSource<State>;

export function signalState<State extends object>(
  initialState: State
): SignalState<State> {
  const stateSource = signal(initialState as State);
  const deepSignal = toDeepSignal(stateSource.asReadonly());
  Object.defineProperty(deepSignal, STATE_SOURCE, {
    value: stateSource,
  });

  return deepSignal as SignalState<State>;
}
