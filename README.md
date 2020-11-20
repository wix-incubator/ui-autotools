# ui-autotools

[![Build Status](https://github.com/wix-incubator/ui-autotools/workflows/tests/badge.svg)](https://github.com/wix-incubator/ui-autotools/actions)

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
