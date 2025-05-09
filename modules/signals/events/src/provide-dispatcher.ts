import { Provider } from '@angular/core';
import { Dispatcher } from './dispatcher';
import { Events, ReducerEvents } from './events-service';

export function provideDispatcher(): Provider[] {
  return [Events, ReducerEvents, Dispatcher];
}
