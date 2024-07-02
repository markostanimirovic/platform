import { WritableSignal } from '@angular/core';

export const STATE_SOURCE = Symbol('STATE_SOURCE');

export type StateSource<State extends object> = {
  [STATE_SOURCE]: WritableSignal<State>;
};
