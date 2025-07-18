import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { Schema as RootStoreOptions } from './schema';
import {
  getTestProjectPath,
  createWorkspace,
} from '@ngrx/schematics-core/testing';

describe('Store ng-add Schematic', () => {
  const schematicRunner = new SchematicTestRunner(
    '@ngrx/store',
    path.join(__dirname, '../collection.json')
  );
  const defaultOptions: RootStoreOptions = {
    skipPackageJson: false,
    skipESLintPlugin: false,
    project: 'bar',
    module: 'app-module',
    minimal: false,
  };

  const projectPath = getTestProjectPath();
  let appTree: UnitTestTree;

  beforeEach(async () => {
    appTree = await createWorkspace(schematicRunner, appTree);
  });

  it('should update package.json', async () => {
    const options = { ...defaultOptions };

    const tree = await schematicRunner.runSchematic('ng-add', options, appTree);

    const packageJson = JSON.parse(tree.readContent('/package.json'));

    expect(packageJson.dependencies['@ngrx/store']).toBeDefined();
  });

  it('should skip package.json update', async () => {
    const options = { ...defaultOptions, skipPackageJson: true };

    const tree = await schematicRunner.runSchematic('ng-add', options, appTree);
    const packageJson = JSON.parse(tree.readContent('/package.json'));

    expect(packageJson.dependencies['@ngrx/store']).toBeUndefined();
  });

  it('should create the initial store setup', async () => {
    const options = { ...defaultOptions };

    const tree = await schematicRunner.runSchematic('ng-add', options, appTree);
    const files = tree.files;
    expect(
      files.indexOf(`${projectPath}/src/app/reducers/index.ts`)
    ).toBeGreaterThanOrEqual(0);
  });

  it('should skip the initial store setup files if the minimal flag is provided', async () => {
    const options = { ...defaultOptions, minimal: true };

    const tree = await schematicRunner.runSchematic('ng-add', options, appTree);
    const content = tree.readContent(`${projectPath}/src/app/app-module.ts`);
    const files = tree.files;

    expect(content).not.toMatch(
      /import { reducers, metaReducers } from '\.\/reducers';/
    );
    expect(content).toMatch(/StoreModule.forRoot\({}/);

    expect(files.indexOf(`${projectPath}/src/app/reducers/index.ts`)).toBe(-1);
  });

  it('should import into a specified module', async () => {
    const options = { ...defaultOptions };

    const tree = await schematicRunner.runSchematic('ng-add', options, appTree);
    const content = tree.readContent(`${projectPath}/src/app/app-module.ts`);
    expect(content).toMatch(
      /import { reducers, metaReducers } from '\.\/reducers';/
    );
  });

  it('should import isDevMode correctly', async () => {
    const options = { ...defaultOptions, module: 'app-module.ts' };

    const tree = await schematicRunner.runSchematic('ng-add', options, appTree);
    const content = tree.readContent(
      `${projectPath}/src/app/reducers/index.ts`
    );
    expect(content).toMatch(/import { isDevMode } from '@angular\/core';/);
  });

  it('should fail if specified module does not exist', async () => {
    const options = { ...defaultOptions, module: '/src/app/app-moduleXXX.ts' };
    let thrownError: Error | null = null;
    try {
      await schematicRunner.runSchematic('ng-add', options, appTree);
    } catch (err: any) {
      thrownError = err;
    }
    expect(thrownError).toBeDefined();
  });

  it('should support a default root state interface name', async () => {
    const options = { ...defaultOptions, name: 'State' };
    const tree = await schematicRunner.runSchematic('ng-add', options, appTree);
    const content = tree.readContent(
      `${projectPath}/src/app/reducers/index.ts`
    );

    expect(content).toMatch(/export interface State {/);
  });

  it('should support a custom root state interface name', async () => {
    const options = {
      ...defaultOptions,
      name: 'State',
      stateInterface: 'AppState',
    };

    const tree = await schematicRunner.runSchematic('ng-add', options, appTree);

    const content = tree.readContent(
      `${projectPath}/src/app/reducers/index.ts`
    );

    expect(content).toMatch(/export interface AppState {/);
  });

  it('adds the @ngrx/eslint-plugin schematic', async () => {
    const options = { ...defaultOptions, skipESLintPlugin: false };

    appTree.create('.eslintrc.json', '{}');

    await schematicRunner.runSchematic('ng-add', options, appTree);

    expect(schematicRunner.tasks).toContainEqual({
      name: 'run-schematic',
      options: {
        collection: '@ngrx/eslint-plugin',
        name: 'ng-add',
        options: {},
      },
    });
  });

  it('ignores the @ngrx/eslint-plugin schematic when skipped', async () => {
    const options = { ...defaultOptions, skipESLintPlugin: true };

    await schematicRunner.runSchematic('ng-add', options, appTree);

    expect(schematicRunner.tasks).not.toContainEqual({
      name: 'run-schematic',
      options: {
        collection: '@ngrx/eslint-plugin',
        name: 'ng-add',
        options: {},
      },
    });
  });

  describe('Store ng-add Schematic for standalone application', () => {
    const projectPath = getTestProjectPath(undefined, {
      name: 'bar-standalone',
    });
    const standaloneDefaultOptions = {
      ...defaultOptions,
      project: 'bar-standalone',
    };

    it('provides minimal store setup', async () => {
      const options = { ...standaloneDefaultOptions, minimal: true };
      const tree = await schematicRunner.runSchematic(
        'ng-add',
        options,
        appTree
      );

      const content = tree.readContent(`${projectPath}/src/app/app.config.ts`);
      const files = tree.files;

      expect(content).toMatch(/provideStore\(\)/);
      expect(content).not.toMatch(
        /import { reducers, metaReducers } from '\.\/reducers';/
      );
      expect(files.indexOf(`${projectPath}/src/app/reducers/index.ts`)).toBe(
        -1
      );
    });
    it('provides full store setup', async () => {
      const options = { ...standaloneDefaultOptions };
      const tree = await schematicRunner.runSchematic(
        'ng-add',
        options,
        appTree
      );

      const content = tree.readContent(`${projectPath}/src/app/app.config.ts`);
      const files = tree.files;

      expect(content).toMatch(/provideStore\(reducers, \{ metaReducers \}\)/);
      expect(content).toMatch(
        /import { reducers, metaReducers } from '\.\/reducers';/
      );
      expect(
        files.indexOf(`${projectPath}/src/app/reducers/index.ts`)
      ).toBeGreaterThanOrEqual(0);
    });
  });
});
