import { STATE_SOURCE, StateSource } from './state-source';
import { EVENTS_SOURCE, StoreMeta } from './store-meta';
import { Prettify } from './ts-helpers';

export type PartialStateUpdater<State extends object> = (
  state: State
) => Partial<State>;

export function patchState<State extends object>(
  source: StateSource<State> | StoreMeta<State>,
  ...updaters: Array<
    Partial<Prettify<State>> | PartialStateUpdater<Prettify<State>>
  >
): void {
  if (EVENTS_SOURCE in source) {
    source[EVENTS_SOURCE].next({ type: '@@patch-state' });
  }

  source[STATE_SOURCE].update(mergeUpdaters(updaters));
}

function mergeUpdaters<State extends object>(
  updaters: Array<Partial<State> | PartialStateUpdater<State>>
): (state: State) => State {
  return (currentState) =>
    updaters.reduce(
      (nextState: State, updater) => ({
        ...nextState,
        ...(typeof updater === 'function' ? updater(nextState) : updater),
      }),
      currentState
    );
}
