import { inject } from '@angular/core';
import { Actions, createEffect } from '@ngrx/effects';
import { tap } from 'rxjs';

export const logger$ = createEffect(
  () => {
    return inject(Actions).pipe(
      tap((action) => console.log('=== appEffects ===', action))
    );
  },
  { dispatch: false }
);
