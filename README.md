[# ui-autotools

[![Build Status](https://travis-ci.org/wix-incubator/ui-autotools.svg?branch=master)](https://travis-ci.org/wix-incubator/ui-autotools)

ui-autotools comprises a set of tools designed to automate and improve the process of developing components. These tools consume `*.meta.tsx` files in the project, which are described below. All tools share a similar command pattern:

```shell
autotools [tool name] --files [meta files matching glob]
```

For example:

```shell
autotools sanity --files ./components/**/*.meta.ts
```

Common CLI parameters:

- `files` - meta files matching glob (default: `src/**/*.meta.tsx`)
- `debug` - true/false (default: false)

## Available Tools

- `sanity` - component sanity test suite, asserts that:
    - the component can render to string (for SSR compatibility)
    - hydration in the client works as intended
    - the component has no errors in <React.StrictMode />
    - nothing was printed to the console
    - events were removed after component unmounts
- `a11y` - accessibility test:
    - checks component render result for accessibility using axe-core
- `snap` - tool for generating and testing component snapshots, that:
    - renders components, takes screenshots, and sends them to Applitools Eyes to run comparisons
- `showcase` - generates a static website with component documentation, APIs and demos

We encourge anyone to add tools to this repo that utilize metadata. Please open pull requests for any tools and issues with half baked dreams :) .

## Metadata Registry

Offers a [common API](./docs/registry.md) for metadata. This allows many different tools to use this metadata as their configuration.

Registering metadata is done by requiring the Registry and creating a component description:

```ts
import Registry from 'ui-autotools';
import MyComp from './my-comp.tsx';
import theme1 from './theme1.st.css';

// If the component hasn't been described before, this method adds a metadata entry for the component,
// and returns the newly created metadata
const myComponentMetadata = Registry.getComponentMetadata(MyComp);

// You can add static resources (currently only used by Snap)
myComponentMetadata.staticResources = [
    {
        path: path.join(basePath, 'my-comp-style.css'),
        relativePath: 'my-comp-style.css',
        mimeType: 'text/css'
    }
];

// Simulations are configurations of component props and state
myComponentMetadata.addSim({
    title: 'empty',
    props: {
        items:[]
    }
});

myComponentMetadata.addSim({
    title: 'one item',
    props: {
        items:['🐊 ']
    },
    state: {
        selectedItem: 0
    }
});

myComponentMetadata.addSim({
    title: 'many items',
    props: {
        items:['🧒 ', '👶 ', '🐊 ']
    },
    state: {
        selectedItem: 1
    }
});

// You can also add static resources to simulations (currently only used by Snap)
myComponentMetadata.addSim({
    title: 'image_sim',
    props: {
        src: './test-image.jpg'
    },
    staticResources: [
        {
            mimeType: 'image/jpeg',
            relativePath: './test-image.jpg',
            path: path.join(basePath, 'test-image.jpg')
        }
    ]
});

// If you want to use the "snap" tool, this method must be called. Currently, the snap
// tool relies on Stylable
myComponentMetadata.exportInfo = {
  path: 'src/my-comp/my-comp',                          // the path to your component, relative to the root, and without file extension
  exportName: 'MyComp',                                 // the name under which you export your component
  baseStylePath: 'src/my-comp/my-comp.st.css',          // the path to the base stylesheet for the component (as opposed to themes)
};

// Themes can be registered like so:
myComponentMetadata.addStyle(theme1, {
    name: 'theme1',
    path: 'src/composite/theme1.st.css'                 // path is relative to the root of the project
});

```

Components are assumed by default to be React Strict Mode compliant (meaning that they follow the guidelines described [here](https://reactjs.org/docs/strict-mode.html)). However, if your component is *not* React Strict Mode compliant, you can set a flag in metadata to disable rendering in strict mode, e.g.:

```ts
// MyComponent.meta.ts file
const meta = Registry.getComponentMetadata(MyComponent);
meta.nonReactStrictModeCompliant = true;
```

Components are assumed by default to be [axe-core](https://github.com/dequelabs/axe-core) compliant. If your component is not axe-core compliant, set the `nonA11yCompliant` flag in the metadata to true, e.g:

```ts
// MyComponent.meta.ts file
const meta = Registry.getComponentMetadata(MyComponent);
meta.nonA11yCompliant = true;
```


One of the tests that sanity runs checks that all events were removed after a component unmounts. If you wish to skip this test, set the `nonEventListenerTestCompliant` flag in the metadata to true.

```ts
// MyComponent.meta.ts file
const meta = Registry.getComponentMetadata(MyComponent);
meta.nonEventListenerTestCompliant = true;
```

In some cases you may want to cancel our hydration tests (React is escaping style attributes and that may cause the test to fail). If you wish to skip this test, set the `nonHydrationTestCompliant` flag in the metadata to true.

```ts
// MyComponent.meta.ts file
const meta = Registry.getComponentMetadata(MyComponent);
meta.nonHydrationTestCompliant = true;
```

## CLI Tools
### Universal Options

- `files`: glob pattern used to match metadata files. Defaults to `src/**/*.meta.ts?(x)`

### Sanity

Runs over every simulation and asserts the following:

- the component can render to string (i.e. renderToString doesn't throw)
- hydration in the client works as intended (no errors in the console)
- the component has no errors while rendering with <React.StrictMode />
- nothing was printed to the console
- that any events which were added during render are removed after the component is unmounted

Sanity uses puppeteer to test client-side hydration. Results are printed in the terminal.

#### Event Checking

Sanity ensures that any events added to window, document, or body during a component's lifecycle are removed once the component has unmounted. This helps prevent easy-to-miss memory leaks.

#### Usage
First install the package 
```shell
npm i --save-dev @ui-autotools/sanity
```
then run the following command:
```shell
autotools-sanity --files ./components/**/*.meta.ts
```

### A11Y

Asserts that components are compatable with axe-core. Allows for varying levels of error impact (one of `minor`, `moderate`, `serious`, or `critical`). Specifying a level of impact specifies *that* level and *above* (so specifying `moderate` would target `moderate`, `serious`, and `critical`).

#### Usage
First install the package 
```shell
npm i --save-dev @ui-autotools/a11y
```
then run the following command:
```shell
autotools-a11y --files ./components/**/*.meta.ts --impact minor
```

### Snap

Renders components, takes screenshots, and then sends screenshots to Applitools Eyes to run comparisons. This tool requires that the `process.env.EYES_API_KEY` value is set to your private API key.

#### Usage
First install the package 
```shell
npm i --save-dev @ui-autotools/snap
```
then run the following command:
```shell
autotools-snap --files ./components/**/*.meta.ts
```

#### Options

- `skip-on-missing-key`: set this flag if you want to skip testing when `process.env.EYES_API_KEY` or `process.env.APPLITOOLS_API_KEY` variables are not set. By default, snap will fail if either of these keys are not set. Example usage: `snap --skip-on-missing-key`, or, `snap -s`.

### Showcase

Creates a static website with documentation, API and demos for all components described in the meta files.

#### Usage
To start the development server:
```shell
autotools showcase --files src/**/*.meta.ts
```
To build a static website:
```shell
autotools showcase --files src/**/*.meta.ts --output build/website
```

## User config
`@ui-autotools` assumes that your code is using [Typescript](http://typescriptlang.org) and [Stylable](https://stylable.io/), and therefor automatically requires hooks to handle such files (`.ts`, `.st.css` etc.). If however you are not using these or you are using different hooks, we support requiring your own hooks.  
In the root of your project, inside the `.autotools` folder, create a new file named `node-require-hooks.js`, require your hooks and invoke them and `@ui-autotools` will use your config file.  

**Note:** If you are using your own config file, keep in mind that `@ui-autotools` will **not use its default set of hooks**.
](# ui-autotools

[![Build Status](https://travis-ci.org/wix-incubator/ui-autotools.svg?branch=master)](https://travis-ci.org/wix-incubator/ui-autotools)

ui-autotools comprises a set of tools designed to automate and improve the process of developing components. These tools consume `*.meta.tsx` files in the project, which are described below. All tools share a similar command pattern:

```shell
autotools [tool name] --files [meta files matching glob]
```

For example:

```shell
autotools sanity --files ./components/**/*.meta.ts
```

Common CLI parameters:

- `files` - meta files matching glob (default: `src/**/*.meta.tsx`)
- `debug` - true/false (default: false)

## Available Tools

- `sanity` - component sanity test suite, asserts that:
    - the component can render to string (for SSR compatibility)
    - hydration in the client works as intended
    - the component has no errors in <React.StrictMode />
    - nothing was printed to the console
    - events were removed after component unmounts
- `a11y` - accessibility test:
    - checks component render result for accessibility using axe-core
- `snap` - tool for generating and testing component snapshots, that:
    - renders components, takes screenshots, and sends them to Applitools Eyes to run comparisons
- `showcase` - generates a static website with component documentation, APIs and demos

We encourge anyone to add tools to this repo that utilize metadata. Please open pull requests for any tools and issues with half baked dreams :) .

## Metadata Registry

Offers a [common API](./docs/registry.md) for metadata. This allows many different tools to use this metadata as their configuration.

Registering metadata is done by requiring the Registry and creating a component description:

```ts
import Registry from 'ui-autotools';
import MyComp from './my-comp.tsx';
import theme1 from './theme1.st.css';

// If the component hasn't been described before, this method adds a metadata entry for the component,
// and returns the newly created metadata
const myComponentMetadata = Registry.getComponentMetadata(MyComp);

// You can add resources (currently only used by Snap)
myComponentMetadata.staticResources = [
    {
        path: 'src/my-comp/my-comp.css',
        url: 'my-comp.css',
        mimeType: 'text/css'
    }
];

// Simulations are configurations of component props and state
myComponentMetadata.addSim({
    title: 'empty',
    props: {
        items:[]
    }
});

myComponentMetadata.addSim({
    title: 'one item',
    props: {
        items:['🐊 ']
    },
    state: {
        selectedItem: 0
    }
});

myComponentMetadata.addSim({
    title: 'many items',
    props: {
        items:['🧒 ', '👶 ', '🐊 ']
    },
    state: {
        selectedItem: 1
    }
});

// You can also add resources to simulations (currently only used by Snap)
myComponentMetadata.addSim({
    title: 'image_sim',
    props: {
        src: './test-image.jpg'
    },
    staticResources: [
        {
            mimeType: 'image/jpeg',
            url: 'test-image.jpg',
            path: 'src/my-comp/test-image.jpg'
        }
    ]
});

// If you want to use the "snap" tool, this method must be called. Currently, the snap
// tool relies on Stylable
myComponentMetadata.exportInfo = {
  path: 'src/my-comp/my-comp',                          // the path to your component, relative to the root, and without file extension
  exportName: 'MyComp',                                 // the name under which you export your component
  baseStylePath: 'src/my-comp/my-comp.st.css',          // optional, the path to the base stylesheet for the component (as opposed to themes)
};

// Themes can be registered like so:
myComponentMetadata.addStyle(theme1, {
    name: 'theme1',
    path: 'src/composite/theme1.st.css'                 // path is relative to the root of the project
});

```

Components are assumed by default to be React Strict Mode compliant (meaning that they follow the guidelines described [here](https://reactjs.org/docs/strict-mode.html)). However, if your component is *not* React Strict Mode compliant, you can set a flag in metadata to disable rendering in strict mode, e.g.:

```ts
// MyComponent.meta.ts file
const meta = Registry.getComponentMetadata(MyComponent);
meta.nonReactStrictModeCompliant = true;
```

Components are assumed by default to be [axe-core](https://github.com/dequelabs/axe-core) compliant. If your component is not axe-core compliant, set the `nonA11yCompliant` flag in the metadata to true, e.g:

```ts
// MyComponent.meta.ts file
const meta = Registry.getComponentMetadata(MyComponent);
meta.nonA11yCompliant = true;
```


One of the tests that sanity runs checks that all events were removed after a component unmounts. If you wish to skip this test, set the `nonEventListenerTestCompliant` flag in the metadata to true.

```ts
// MyComponent.meta.ts file
const meta = Registry.getComponentMetadata(MyComponent);
meta.nonEventListenerTestCompliant = true;
```

In some cases you may want to cancel our hydration tests (React is escaping style attributes and that may cause the test to fail). If you wish to skip this test, set the `nonHydrationTestCompliant` flag in the metadata to true.

```ts
// MyComponent.meta.ts file
const meta = Registry.getComponentMetadata(MyComponent);
meta.nonHydrationTestCompliant = true;
```

## CLI Tools
### Universal Options

- `files`: glob pattern used to match metadata files. Defaults to `src/**/*.meta.ts?(x)`

### Sanity

Runs over every simulation and asserts the following:

- the component can render to string (i.e. renderToString doesn't throw)
- hydration in the client works as intended (no errors in the console)
- the component has no errors while rendering with <React.StrictMode />
- nothing was printed to the console
- that any events which were added during render are removed after the component is unmounted

Sanity uses puppeteer to test client-side hydration. Results are printed in the terminal.

#### Event Checking

Sanity ensures that any events added to window, document, or body during a component's lifecycle are removed once the component has unmounted. This helps prevent easy-to-miss memory leaks.

#### Usage
First install the package 
```shell
npm i --save-dev @ui-autotools/sanity
```
then run the following command:
```shell
autotools-sanity --files ./components/**/*.meta.ts
```

### A11Y

Asserts that components are compatable with axe-core. Allows for varying levels of error impact (one of `minor`, `moderate`, `serious`, or `critical`). Specifying a level of impact specifies *that* level and *above* (so specifying `moderate` would target `moderate`, `serious`, and `critical`).

#### Usage
First install the package 
```shell
npm i --save-dev @ui-autotools/a11y
```
then run the following command:
```shell
autotools-a11y --files ./components/**/*.meta.ts --impact minor
```

### Snap

Snap makes screenshot testing components easy. Snap has two main steps:

1. Generate snapshots from metadata (snapshots are static renders of your component - just HTML, CSS, and resources such as images and fonts).
2. Send those snapshots to [Applitools Visual Grid](https://applitools.com/visualgrid), and print the results to the console.

**Why not just use something like Puppeteer to take screenshots? Why go through the hassle of generating "snapshots"?**

Testing with snapshots has two main benefits:

- **They're faster.** Since Applitools' Visual Grid runs tests in parallel, it doesn't matter if you're running 40 or 400 tests, they'll take about the same time to complete
- **You can test locally.** With screenshot testing, screenshots can only be taken on CI because of the variables associated with inconsistent platforms (things render differently on different operating systems). With snapshots, it doesn't matter where you generate them, so it's possible to get instant feedback rather than waiting for CI to finish running. 

*Note: Snap requires that the `process.env.EYES_API_KEY` value is set to your private API key.*

#### Usage and Configuration
Install:

```shell
npm i --save-dev @ui-autotools/snap
```
Snap needs to be configured before it will do anything. Configuration is as easy as:

1. Adding a `snap.config.js` file under your `.autotools/` folder, which should be in the root of your project.
2. Adding default configuration. In the case of a Stylable project, your `snap.config.js` file should look like this:

```js
const {StylableSnapPlugin} = require('@ui-autotools/snap');

const config = {
  plugins: [
    new StylableSnapPlugin(),
  ]
};

module.exports = config;
```
Snap will automatically look for a `snap.config.js` file under `.autotools`, but if you want to use a config file stored somewhere else or named something different, simply use the `--config` flag.

`autotools-snap --config my-config.js`

#### Snapshots

Snapshots are what Applitools renders on their server before taking screenshots. Snapshots have two components:

1. HTML
2. Static resources (css, images, fonts, etc.)

This is the `ISnapshot` interface:

```typescript
interface ISnapshot {
  html: string;
  testName: string;
  staticResources?: ISnapResource[];
}

interface ISnapResource {
  data: Buffer;
  url: string;
  mimeType: string;
}
```

#### Plugins

The basic flow of Snap is as follows: metadata -> snapshots -> test results. Snap handles the last step (snapshots -> test results), but the first step of transforming metadata into snapshots is handled by *plugins*.

A plugin (just a class) can have the following *hooks*:

| Hook       | Provided by Snap                                                | Returned by Hook            |
|------------|-----------------------------------------------------------------|-----------------------------|
| Project    | `snapInfo: ISnapInfo`                                           | `Promise<void>`              |
| Component  | `compSnapInfo: ICompSnapInfo`                                   | `Promise<void>` |
| Simulation | `simSnapInfo: ISimSnapInfo`                                     | `Promise<void>` |
| After      | `snapInfo: ISnapInfo, files: ISnapshot[]` | `Promise<void>`             |


- Project hooks are run at the beginning, before anything else. This is where a plugin should do any necessary setup (building the project, creating temporary directories, etc.)
- Component hooks are called once for each component. This is useful if you'd like to render a component with a specific set of props for screenshot testing, instead of rendering each simulation.
- Simulation hooks are called once for each simulation. This is usually where a plugin would generate snapshots.
- After hooks are run after Snap has returned with test results. This is where a plugin would usually do any necessary cleanup.

Every hook is asynchronous, and should return a Promise of type `void`. In addition, there is no guaranteed order to hook execution - hooks are responsible for ensuring their own boundaries, i.e. a simulation hook that is written to run on Stylable components must ensure internally that it *only* runs on Stylable components, since conflicts can occur. The metadata `addCustomField` method is recommended for this purpose. Simply export a key from your plugin to use in the metadata, and then verify that such a key exists before generating a snapshot.

Further detail on each hook is provided below, but an example may be more useful to demonstrate Snap plugins. There is an example plugin under `packages/mock-repo/.autotools`, used to test a few components in `mock-repo`.

##### Project Hooks

Project hooks are provided an object of type `ISnapInfo`.

```ts
interface ISnapInfo {
  Registry: IRegistry;
  projectPath: string; // process.cwd()
  collectFiles: (files: ISnapshot[]) => void;
}

interface IRegistry<AssetMap = any> {
  metadata: IMetadata;
  getComponentMetadata: <Props, State = {}> (comp: ComponentType<Props> | ComponentClass<Props, State>) => IComponentMetadata<Props, State>;
  clear: () => void;
}
```

`collectFiles` is the method a plugin will call in order to "return" a snapshot it has generated to Snap. Since snapshots will be run in parallel, order cannot matter.  

##### Component Hooks

Component hooks are provided an object of type `ICompSnapInfo`.

```ts
interface ICompSnapInfo extends ISnapInfo {
  componentMetadata: IComponentMetadata<any, any>;
}
```

##### Simulation Hooks

Simulation hooks are provided an object of type `ISimSnapInfo`.

```ts
interface ISimSnapInfo extends ICompSnapInfo {
  simulation: ISimulation<any, any>;
}
```

##### After Hooks

After hooks are provided `ISnapInfo`, along with the list of files sent to Applitools. 

#### Options

- `skip-on-missing-key`: set this flag if you want to skip testing when `process.env.EYES_API_KEY` or `process.env.APPLITOOLS_API_KEY` variables are not set. By default, snap will fail if either of these keys are not set. Example usage: `snap --skip-on-missing-key`, or, `snap -s`.
  
### Showcase

Creates a static website with documentation, API and demos for all components described in the meta files.

#### Usage

To start the development server:
```shell
autotools showcase --files src/**/*.meta.ts
```
To build a static website:
```shell
autotools showcase --files src/**/*.meta.ts --output build/website
```

## User config
`@ui-autotools` assumes that your code is using [Typescript](http://typescriptlang.org) and [Stylable](https://stylable.io/), and therefor automatically requires hooks to handle such files (`.ts`, `.st.css` etc.). If however you are not using these or you are using different hooks, we support requiring your own hooks.  
In the root of your project, inside the `.autotools` folder, create a new file named `node-require-hooks.js`, require your hooks and invoke them and `@ui-autotools` will use your config file.  

**Note:** If you are using your own config file, keep in mind that `@ui-autotools` will **not use its default set of hooks**.
)