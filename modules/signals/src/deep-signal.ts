import { computed, isSignal, Signal, untracked } from '@angular/core';
import { NonRecord } from './ts-helpers';

const DEEP_SIGNAL = Symbol('DEEP_SIGNAL');

type DeepSignal<T> = Signal<T> &
  Readonly<{ [K in keyof T]: ResolveDeepSignal<T[K]> }>;

export type ResolveDeepSignal<T> = T extends object
  ? T extends NonRecord
    ? Signal<T>
    : string extends keyof T
    ? Signal<T>
    : DeepSignal<T>
  : Signal<T>;

export function toDeepSignal<T>(signal: Signal<T>): ResolveDeepSignal<T> {
  return new Proxy(signal, {
    has(target: any, prop) {
      return !!this.get!(target, prop, undefined);
    },
    get(target: any, prop) {
      const value = untracked(target);
      if (!isRecord(value) || !(prop in value)) {
        if (isSignal(target[prop]) && (target[prop] as any)[DEEP_SIGNAL]) {
          delete target[prop];
        }

        return target[prop];
      }

      if (!isSignal(target[prop])) {
        Object.defineProperty(target, prop, {
          value: computed(() => target()[prop]),
          configurable: true,
        });
        target[prop][DEEP_SIGNAL] = true;
      }

      return toDeepSignal(target[prop]);
    },
  });
}

const nonRecords = [
  WeakSet,
  WeakMap,
  Promise,
  Date,
  Error,
  RegExp,
  ArrayBuffer,
  DataView,
  Function,
];

function isRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || isIterable(value)) {
    return false;
  }

  let proto = Object.getPrototypeOf(value);
  if (proto === Object.prototype) {
    return true;
  }

  while (proto && proto !== Object.prototype) {
    if (nonRecords.includes(proto.constructor)) {
      return false;
    }
    proto = Object.getPrototypeOf(proto);
  }

  return proto === Object.prototype;
}

function isIterable(value: any): value is Iterable<any> {
  return typeof value?.[Symbol.iterator] === 'function';
}
