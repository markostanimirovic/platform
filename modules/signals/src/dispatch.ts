import { StoreMeta, EVENTS_SOURCE } from './store-meta';

export function dispatch<Event extends { type: string }>(
  source: StoreMeta<any>,
  event: Event
): void {
  source[EVENTS_SOURCE].next(event);
}
