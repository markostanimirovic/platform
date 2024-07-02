import { Observable } from 'rxjs';
import { StoreMeta, EVENTS_SOURCE } from './store-meta';

export function getEvents(store: StoreMeta<any>): Observable<{ type: string }> {
  return store[EVENTS_SOURCE].asObservable();
}
