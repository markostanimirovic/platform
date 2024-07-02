import { STATE_SOURCE, StateSource } from './state-source';

export function getState<State extends object>(
  source: StateSource<State>
): State {
  return source[STATE_SOURCE]();
}
