import { Injectable } from '@angular/core';
import { Actions, createEffect } from '@ngrx/effects';
import { tap } from 'rxjs';

@Injectable()
export class AppEffects {
  readonly logger$ = createEffect(
    () => {
      return this.actions$.pipe(
        tap((action) => console.log('=== AppClassEffects ===', action))
      );
    },
    { dispatch: false }
  );

  constructor(private actions$: Actions) {}
}
