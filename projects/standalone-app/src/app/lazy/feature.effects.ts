import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { createEffect } from '@ngrx/effects';
import { map, tap } from 'rxjs';
import { FeatureService } from './feature.service';
import { feature } from './feature.state';

export const testServiceProvidedAtRoute$ = createEffect(() => {
  return inject(FeatureService).obs$.pipe(
    map(() => ({ type: '[Feature Effects] Obs Emitted' }))
  );
});

export const testStore$ = createEffect(
  () => {
    return inject(Store)
      .select(feature.selectLoaded)
      .pipe(
        tap((loaded) => console.log('=== Store.feature.loaded ===', loaded))
      );
  },
  { dispatch: false }
);
