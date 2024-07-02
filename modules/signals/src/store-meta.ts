import { Subject } from 'rxjs';
import { StateSource } from './state-source';

export const EVENTS_SOURCE = Symbol('EVENTS_SOURCE');

export interface StoreMeta<State extends object> extends StateSource<State> {
  [EVENTS_SOURCE]: Subject<{ type: string }>;
}
