import { inject, Injectable } from '@angular/core';
import { EventInstance } from './event-instance';
import { Events, EVENTS, ReducerEvents } from './events-service';

/**
 * @experimental
 * @description
 *
 * Globally provided service for dispatching events.
 *
 * @usageNotes
 *
 * ```ts
 * import { Dispatcher, event } from '@ngrx/signals/events';
 *
 * const increment = event('[Counter Page] Increment');
 *
 * \@Component({ \/* ... *\/ })
 * class Counter {
 *   readonly #dispatcher = inject(Dispatcher);
 *
 *   increment(): void {
 *     this.#dispatcher.dispatch(increment());
 *   }
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class Dispatcher {
  protected readonly reducerEvents = inject(ReducerEvents);
  protected readonly events = inject(Events);
  protected readonly parentDispatcher = inject(Dispatcher, {
    skipSelf: true,
    optional: true,
  });

  dispatch(
    event: EventInstance<string, unknown>,
    config?: { skipSelf?: boolean } | { root?: boolean }
  ): void;
  dispatch(
    event: EventInstance<string, unknown>,
    config?: { skipSelf?: boolean; root?: boolean }
  ): void {
    if (this.parentDispatcher && (config?.root || config?.skipSelf)) {
      this.parentDispatcher.dispatch(event, {
        root: config?.root,
      });
    } else {
      this.reducerEvents[EVENTS].next(event);
      this.events[EVENTS].next(event);
    }
  }
}
