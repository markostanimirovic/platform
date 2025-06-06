# Lifecycle

### ROOT_EFFECTS_INIT

After all the root effects have been added, the root effect dispatches a `ROOT_EFFECTS_INIT` action.
You can see this action as a lifecycle hook, which you can use in order to execute some code after all your root effects have been added.

<ngrx-code-example header="init.effects.ts">

```ts
init$ = createEffect(() => {
  return this.actions$.pipe(
    ofType(ROOT_EFFECTS_INIT),
    map(action => ...)
  );
});
```

</ngrx-code-example>

## Effect Metadata

### Non-dispatching Effects

Sometimes you don't want effects to dispatch an action, for example when you only want to log or navigate based on an incoming action. But when an effect does not dispatch another action, the browser will crash because the effect is both 'subscribing' to and 'dispatching' the exact same action, causing an infinite loop. To prevent this, add `{ dispatch: false }` to the `createEffect` function as the second argument.

Usage:

<ngrx-code-example header="log.effects.ts">

```ts
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect } from '@ngrx/effects';
import { tap } from 'rxjs/operators';

@Injectable()
export class LogEffects {
  private actions$ = inject(Actions);

  logActions$ = createEffect(
    () => {
      return this.actions$.pipe(tap((action) => console.log(action)));
    },
    { dispatch: false }
  );
}
```

</ngrx-code-example>

### Resubscribe on Error

Starting with version 8, when an error happens in the effect's main stream it is
reported using Angular's `ErrorHandler`, and the source effect is
**automatically** resubscribed to (instead of completing), so it continues to
listen to all dispatched Actions. By default, effects are resubscribed up to 10
errors.

Generally, errors should be handled by users. However, for the cases where errors were missed,
this new behavior adds an additional safety net.

In some cases where particular RxJS operators are used, the new behavior might
produce unexpected results. For example, if the `startWith` operator is within the
effect's pipe then it will be triggered again.

To disable resubscriptions add `{useEffectsErrorHandler: false}` to the `createEffect`
metadata (second argument).

<ngrx-code-example header="disable-resubscribe.effects.ts">

```ts
import { Injectable, inject } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { LoginPageActions, AuthApiActions } from '../actions';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);

  logins$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(LoginPageActions.login),
        exhaustMap((action) =>
          this.authService.login(action.credentials).pipe(
            map((user) => AuthApiActions.loginSuccess({ user })),
            catchError((error) =>
              of(AuthApiActions.loginFailure({ error }))
            )
          )
        )
        // Errors are handled and it is safe to disable resubscription
      );
    },
    { useEffectsErrorHandler: false }
  );
}
```

</ngrx-code-example>

### Customizing the Effects Error Handler

The behavior of the default resubscription handler can be customized
by providing a custom handler using the `EFFECTS_ERROR_HANDLER` injection token.

This allows you to provide a custom behavior, such as only retrying on
certain "retryable" errors, or change the maximum number of retries (it's set to
10 by default).

<ngrx-code-example header="customise-error-handler.effects.ts">

```ts
import { ErrorHandler, NgModule } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { retryWhen, mergeMap } from 'rxjs/operators';
import { Action } from '@ngrx/store';
import { EffectsModule, EFFECTS_ERROR_HANDLER } from '@ngrx/effects';
import { MoviesEffects } from './effects/movies.effects';
import {
  CustomErrorHandler,
  isRetryable,
} from '../custom-error-handler';

export function effectResubscriptionHandler<T extends Action>(
  observable$: Observable<T>,
  errorHandler?: CustomErrorHandler
): Observable<T> {
  return observable$.pipe(
    retryWhen((errors) =>
      errors.pipe(
        mergeMap((e) => {
          if (isRetryable(e)) {
            return errorHandler.handleRetryableError(e);
          }

          errorHandler.handleError(e);
          return throwError(() => e);
        })
      )
    )
  );
}

bootstrapApplication(AppComponent, {
  providers: [
    {
      provide: EFFECTS_ERROR_HANDLER,
      useValue: effectResubscriptionHandler,
    },
    {
      provide: ErrorHandler,
      useClass: CustomErrorHandler,
    },
  ],
});
```

</ngrx-code-example>

## Controlling Effects

### OnInitEffects

Implement this interface to dispatch a custom action after the effect has been added.
You can listen to this action in the rest of the application to execute something after the effect is registered.

Usage:

<ngrx-code-example header="user.effects.ts">

```ts
class UserEffects implements OnInitEffects {
  ngrxOnInitEffects(): Action {
    return { type: '[UserEffects]: Init' };
  }
}
```

</ngrx-code-example>

### OnRunEffects

By default, effects are merged and subscribed to the store. Implement the `OnRunEffects` interface to control the lifecycle of the resolved effects.

Usage:

<ngrx-code-example header="user.effects.ts">

```ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { exhaustMap, takeUntil, tap } from 'rxjs/operators';
import {
  Actions,
  OnRunEffects,
  EffectNotification,
  ofType,
  createEffect,
} from '@ngrx/effects';

@Injectable()
export class UserEffects implements OnRunEffects {
  private actions$ = inject(Actions);

  updateUser$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType('UPDATE_USER'),
        tap((action) => {
          console.log(action);
        })
      );
    },
    { dispatch: false }
  );

  ngrxOnRunEffects(resolvedEffects$: Observable<EffectNotification>) {
    return this.actions$.pipe(
      ofType('LOGGED_IN'),
      exhaustMap(() =>
        resolvedEffects$.pipe(
          takeUntil(this.actions$.pipe(ofType('LOGGED_OUT')))
        )
      )
    );
  }
}
```

</ngrx-code-example>

### Identify Effects Uniquely

By default, each Effects class is registered once regardless of how many times the Effect class is loaded.
By implementing this interface, you define a unique identifier to register an Effects class instance multiple times.

Usage:

<ngrx-code-example header="user.effects.ts">

```ts
class EffectWithIdentifier implements OnIdentifyEffects {
  constructor(private effectIdentifier: string) {}

  ngrxOnIdentifyEffects() {
    return this.effectIdentifier;
  }
}
```

</ngrx-code-example>
