import { signalStoreFeature, type } from './signal-store-feature';
import { withHooks } from './with-hooks';
import { EVENTS_SOURCE } from './store-meta';
import { STATE_SOURCE } from './state-source';

export function withReducer<
  State extends object,
  Event extends {
    type: string;
  }
>(reducer: (state: State, event: Event) => State) {
  return signalStoreFeature(
    { state: type<State>() },
    withHooks({
      onInit(store) {
        store[EVENTS_SOURCE].subscribe((event) => {
          store[STATE_SOURCE].update((state) => reducer(state, event as any));
        });
      },
    })
  );
}
