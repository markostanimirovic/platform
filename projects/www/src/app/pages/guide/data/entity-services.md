<ngrx-docs-alert type="error">

The `@ngrx/data` package is in <a href="https://github.com/ngrx/platform/issues/4011" target="_blank">maintenance mode</a>.
Changes to this package are limited to critical bug fixes.

</ngrx-docs-alert>

# EntityServices

`EntityServices` is a facade over the NgRx Data services and the NgRx Data `EntityCache`.

## Registry of _EntityCollectionServices_

It is primarily a registry of [EntityCollectionServices](guide/data/entity-collection-service).

Call its `EntityServices.getEntityCollectionService(entityName)` method to get the singleton
`EntityCollectionService` for that entity type.

Here's a component doing that.

<ngrx-code-example header="heroes-component.ts">

```ts
import { EntityCollectionService, EntityServices } from '@ngrx/data';
import { Hero } from '../../model';

@Component({...})
export class HeroesComponent implements OnInit {
  heroesService: EntityCollectionService<Hero>;

  constructor(entityServices: EntityServices) {
    this.heroesService = entityServices.getEntityCollectionService('Hero');
  }
}
```

</ngrx-code-example>

If the `EntityCollectionService` service does not yet exist,
`EntityServices` creates a default instance of that service and registers
that instance for future reference.

## Create a custom _EntityCollectionService_

You'll often create custom `EntityCollectionService` classes with additional capabilities and convenience members,
as explained in the [EntityCollectionService](guide/data/entity-collection-service) doc.

Here's an example.

<ngrx-code-example header="heroes.service.ts">

```ts
import { Injectable } from '@angular/core';
import {
  EntityCollectionServiceBase,
  EntityCollectionServiceElementsFactory,
} from '@ngrx/data';

import { Hero } from '../model';

@Injectable()
export class HeroesService extends EntityCollectionServiceBase<Hero> {
  constructor(
    elementsFactory: EntityCollectionServiceElementsFactory
  ) {
    super('Hero', elementsFactory);
  }

  // ... your special sauce here
}
```

</ngrx-code-example>

Of course you must provide the custom service before you use it, typically in an Angular `NgModule`.

<ngrx-code-example header="heroes.module.ts">

```ts
...
import { HeroesService } from './heroes.service';

@NgModule({
  imports: [...],
  declarations: [...],
  providers: [HeroesService]
})
export class HeroesModule {}
```

</ngrx-code-example>

The following alternative example uses the **preferred "tree-shakable" `Injectable()`**
to provide the service in the root module.

```javascript
@Injectable({ providedIn: 'root' })
export class HeroesService extends EntityCollectionServiceBase<Hero> {
  ...
}
```

You can inject that custom service directly into the component.

<ngrx-code-example header="heroes.component.ts (v2)">

```ts
@Component({...})
export class HeroesComponent {
  heroes$: Observable<Hero[]>;
  loading$: Observable<boolean>;

  constructor(public heroesService: HeroesService) {
    this.heroes$ = this.heroesService.entities$;
    this.loading$ = this.heroesService.loading$;
  }
  ...
}
```

</ngrx-code-example>

Nothing new so far.
But we want to be able to get the `HeroesService` from `EntityServices.getEntityCollectionService()`
just as we get the default collection services.

This consistency will pay off when the app has a lot of collection services

## Register the custom _EntityCollectionService_

When you register an instance of a custom `EntityCollectionService` with `EntityServices`, other callers of
`EntityServices.getEntityCollectionService()` get that custom service instance.

You'll want to do that before anything tries to acquire it via the `EntityServices`.

One solution is to inject custom collection services in the constructor of the module that provides them,
and register them there.

The following example demonstrates.

<ngrx-code-example header="app.module.ts">

```ts
@NgModule({ ... })
export class AppModule {
  // Inject the service to ensure it registers with EntityServices
  constructor(
    entityServices: EntityServices,
    // custom collection services
    hs: HeroesService,
    vs: VillainsService
    ){
    entityServices.registerEntityCollectionServices([hs, vs]);
  }
}
```

</ngrx-code-example>

## Sub-class _EntityServices_ for application class convenience

Another useful solution is to create a sub-class of `EntityServices`
that both injects the custom collection services
and adds convenience members for your application.

The following `AppEntityServices` demonstrates.

<ngrx-code-example header="app-entity-services.ts">

```ts
import { Injectable } from '@angular/core';
import {
  EntityServicesBase,
  EntityServicesElements,
} from '@ngrx/data';

import { SideKick } from '../../model';
import { HeroService, VillainService } from '../../services';

@Injectable()
export class AppEntityServices extends EntityServicesBase {
  constructor(
    elements: EntityServicesElements,

    // Inject custom services, register them with the EntityServices, and expose in API.
    readonly heroesService: HeroesService,
    readonly villainsService: VillainsService
  ) {
    super(elements);
    this.registerEntityCollectionServices([
      heroesService,
      villainsService,
    ]);
  }

  /** get the (default) SideKicks service */
  get sideKicksService() {
    return this.getEntityCollectionService<SideKick>('SideKick');
  }
}
```

</ngrx-code-example>

`AppEntityService` first injects the `EntityServicesElements` helper which it passes straight through to the base class constructor.
The "elements" enclose the ingredients that the base class needs to make and manage the entities you described in metadata.

Then it injects your two custom collection services, `HeroesService` and `VillainsService`,
and exposes them directly to consumers as convenience properties for accessing those services.

In this example, we don't need a custom collection service for the `SideKick` entity.
The default service will do.

Nonetheless, we add a `sideKicksService` property that gets or creates a default service for `SideKick`.
Consumers will find this more discoverable and easier to call than `getEntityCollectionService()`.

Of course the base class `EntityServices` members, such as `getEntityCollectionService()`, `entityCache$`,
and `registerEntityCollectionService()` are all available.

Next, provide `AppEntityServices` in an Angular `NgModule` both as itself (`AppEntityServices`)
and as an alias for `EntityServices`.

In this manner, an application class references this same `AppEntityServices` service instance,
whether it injects `AppEntityServices` or `EntityServices`.

See it here in the sample app.

<ngrx-code-example header="store/entity/entity-module">

```ts
@NgModule({
  imports: [ ... ],
  providers: [
    AppEntityServices,
    { provide: EntityServices, useExisting: AppEntityServices },
    ...
  ]
})
export class EntityStoreModule { ... }
```

</ngrx-code-example>

## Access multiple _EntityCollectionServices_

A complex component may need access to multiple entity collections.
The `EntityServices` registry makes this easy,
even when the `EntityCollectionServices` are customized for each entity type.

You'll only need **a single injected constructor parameter**, the `EntityServices`.

<ngrx-code-example header="character-container.component.ts">

```ts
import { EntityCollectionService, EntityServices } from '@ngrx/data';
import { SideKick } from '../../model';
import { HeroService, VillainService } from '../../services';

@Component({...})
export class CharacterContainerComponent implements OnInit {
  heroesService: HeroService;
  sideKicksService: EntityCollectionService<SideKick>;
  villainService: VillainService;

  heroes$: Observable<Hero>;
  ...
  constructor(entityServices: EntityServices) {
    this.heroesService = entityServices.getEntityCollectionService('Hero');
    this.sidekicksService = entityServices.getEntityCollectionService('SideKick');
    this.villainService = entityServices.getEntityCollectionService('Villain');

    this.heroes$ = this.heroesService.entities$;
    ...
  }
  ...
}
```

</ngrx-code-example>

An application-specific sub-class of `EntityServices`, such as the `AppEntityServices` above,
makes this a little nicer.

<ngrx-code-example header="character-container.component.ts (with AppEntityServices)">

```ts
import { AppEntityServices } from '../../services';

@Component({...})
export class CharacterContainerComponent implements OnInit {

  heroes$: Observable<Hero>;
  ...
  constructor(private appEntityServices: AppEntityServices) {
    this.heroes$ = appEntityServices.heroesService.entities$;
    ...
  }
  ...
}
```

</ngrx-code-example>
