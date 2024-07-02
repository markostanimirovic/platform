import { Component, inject } from '@angular/core';
import {
  dispatch,
  getEvents,
  signalStore,
  withHooks,
  withReducer,
  withState,
} from '@ngrx/signals';

const CounterStore = signalStore(
  withState({ count: 0 }),
  withReducer((state, event: { type: 'increment' | 'decrement' }) => {
    switch (event.type) {
      case 'increment':
        return { count: state.count + 1 };
      case 'decrement':
        return { count: state.count - 1 };
      default:
        return state;
    }
  }),
  withHooks({
    onInit(store) {
      getEvents(store).subscribe((event) => {
        console.log('event', event.type);
        console.log('count', store.count());
      });
    },
  })
);

@Component({
  selector: 'ngrx-root',
  standalone: true,
  template: `
    <h1>Counter</h1>

    <button (click)="increment()">Increment</button>
    {{ store.count() }}
    <button (click)="decrement()">Decrement</button>
  `,
  providers: [CounterStore],
})
export class AppComponent {
  readonly store = inject(CounterStore);

  increment(): void {
    dispatch(this.store, { type: 'increment' });
  }

  decrement(): void {
    dispatch(this.store, { type: 'decrement' });
  }
}
