import { computed } from '@angular/core';
import { ResolveDeepSignal, toDeepSignal } from './deep-signal';

export function deepComputed<T extends object>(
  computation: () => T
): ResolveDeepSignal<T> {
  return toDeepSignal(computed(computation));
}
