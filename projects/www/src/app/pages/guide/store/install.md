# Installation

## Installing with `ng add`

You can install the Store to your project with the following `ng add` command <a href="https://angular.dev/cli/add" target="_blank">(details here)</a>:

```sh
ng add @ngrx/store@latest
```

### Optional `ng add` flags

| flag               | description                                                                                                                                                                         | value type | default value |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------- |
| `--path`           | Path to the module that you wish to add the import for the StoreModule to.                                                                                                          | `string`   |
| `--project`        | Name of the project defined in your `angular.json` to help locating the module to add the `StoreModule` to.                                                                         | `string`   |
| `--module`         | Name of file containing the module that you wish to add the import for the `StoreModule` to. Can also include the relative path to the file. For example, `src/app/app.module.ts`.  | `string`   | `app`         |
| `--minimal`        | Flag to only provide minimal setup for the root state management. Only registers `StoreModule.forRoot()` in the provided `module` with an empty object, and default runtime checks. | `boolean`  | `true`        |
| `--statePath`      | The file path to create the state in.                                                                                                                                               | `string`   | `reducers`    |
| `--stateInterface` | The type literal of the defined interface for the state.                                                                                                                            | `string`   | `State`       |

This command will automate the following steps:

1. Update `package.json` > `dependencies` with `@ngrx/store`.
2. Run `npm install` to install those dependencies.
3. Update your `src/app/app.module.ts` > `imports` array with `StoreModule.forRoot({})`
4. If the project is using a `standalone bootstrap`, it adds `provideStore()` into the application config.

```sh
ng add @ngrx/store@latest --no-minimal
```

This command will automate the following steps:

1. Update `package.json` > `dependencies` with `@ngrx/store`.
2. Run `npm install` to install those dependencies.
3. Create a `src/app/reducers` folder, unless the `statePath` flag is provided, in which case this would be created based on the flag.
4. Create a `src/app/reducers/index.ts` file with an empty `State` interface, an empty `reducers` map, and an empty `metaReducers` array. This may be created under a different directory if the `statePath` flag is provided.
5. Update your `src/app/app.module.ts` > `imports` array with `StoreModule.forRoot(reducers, { metaReducers })`. If you provided flags then the command will attempt to locate and update module found by the flags.

## Installing with `npm`

For more information on using `npm` check out the docs <a href="https://docs.npmjs.com/cli/install" target="_blank">here</a>.

```sh
npm install @ngrx/store --save
```

## Installing with `yarn`

For more information on using `yarn` check out the docs <a href="https://yarnpkg.com/getting-started/usage#installing-all-the-dependencies" target="_blank">here</a>.

```sh
yarn add @ngrx/store
```
