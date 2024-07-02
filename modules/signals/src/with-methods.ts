import { excludeKeys } from './helpers';
import { STATE_SOURCE, StateSource } from './state-source';
import {
  EmptyFeatureResult,
  InnerSignalStore,
  MethodsDictionary,
  SignalsDictionary,
  SignalStoreFeature,
  SignalStoreFeatureResult,
  StateSignals,
} from './signal-store-models';
import { Prettify } from './ts-helpers';

export function withMethods<
  Input extends SignalStoreFeatureResult,
  Methods extends MethodsDictionary
>(
  methodsFactory: (
    store: Prettify<
      StateSignals<Input['state']> &
        Input['computed'] &
        Input['methods'] &
        StateSource<Prettify<Input['state']>>
    >
  ) => Methods
): SignalStoreFeature<Input, EmptyFeatureResult & { methods: Methods }> {
  return (store) => {
    const methods = methodsFactory({
      [STATE_SOURCE]: store[STATE_SOURCE],
      ...store.stateSignals,
      ...store.computedSignals,
      ...store.methods,
    });
    const methodsKeys = Object.keys(methods);
    const stateSignals = excludeKeys(store.stateSignals, methodsKeys);
    const computedSignals = excludeKeys(store.computedSignals, methodsKeys);

    return {
      ...store,
      stateSignals,
      computedSignals,
      methods: { ...store.methods, ...methods },
    } as InnerSignalStore<Record<string, unknown>, SignalsDictionary, Methods>;
  };
}
