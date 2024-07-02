import { STATE_SOURCE } from './state-source';
import { EVENTS_SOURCE, StoreMeta } from './store-meta';
import {
  EmptyFeatureResult,
  SignalStoreFeature,
  SignalStoreFeatureResult,
  StateSignals,
} from './signal-store-models';
import { Prettify } from './ts-helpers';

type HookFn<Input extends SignalStoreFeatureResult> = (
  store: Prettify<
    StateSignals<Input['state']> &
      Input['computed'] &
      Input['methods'] &
      StoreMeta<Prettify<Input['state']>>
  >
) => void;

type HooksFactory<Input extends SignalStoreFeatureResult> = (
  store: Prettify<
    StateSignals<Input['state']> &
      Input['computed'] &
      Input['methods'] &
      StoreMeta<Prettify<Input['state']>>
  >
) => {
  onInit?: () => void;
  onDestroy?: () => void;
};

export function withHooks<Input extends SignalStoreFeatureResult>(hooks: {
  onInit?: HookFn<Input>;
  onDestroy?: HookFn<Input>;
}): SignalStoreFeature<Input, EmptyFeatureResult>;
export function withHooks<Input extends SignalStoreFeatureResult>(
  hooks: HooksFactory<Input>
): SignalStoreFeature<Input, EmptyFeatureResult>;

export function withHooks<Input extends SignalStoreFeatureResult>(
  hooksOrFactory:
    | {
        onInit?: HookFn<Input>;
        onDestroy?: HookFn<Input>;
      }
    | HooksFactory<Input>
): SignalStoreFeature<Input, EmptyFeatureResult> {
  return (store) => {
    const storeProps = {
      [STATE_SOURCE]: store[STATE_SOURCE],
      [EVENTS_SOURCE]: store[EVENTS_SOURCE],
      ...store.stateSignals,
      ...store.computedSignals,
      ...store.methods,
    };
    const hooks =
      typeof hooksOrFactory === 'function'
        ? hooksOrFactory(storeProps)
        : hooksOrFactory;
    const createHook = (name: keyof typeof hooks) => {
      const hook = hooks[name];
      const currentHook = store.hooks[name];

      return hook
        ? () => {
            if (currentHook) {
              currentHook();
            }

            hook(storeProps);
          }
        : currentHook;
    };

    return {
      ...store,
      hooks: {
        onInit: createHook('onInit'),
        onDestroy: createHook('onDestroy'),
      },
    };
  };
}
