# ui-autotools

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

// If you want to use the "snap" tool, this method must be called. Currently, the snap
// tool relies on Stylable
myComponentMetadata.exportedFrom({
  path: 'src/my-comp/my-comp',                          // the path to your component, relative to the root, and without file extension
  exportName: 'MyComp',                                 // the name under which you export your component
  baseStylePath: 'src/my-comp/my-comp.st.css',          // the path to the base stylesheet for the component (as opposed to themes)
});

// Themes can be registered like so:
myComponentMetadata.addStyle(theme1, {
    name: 'theme1',
    path: 'src/composite/theme1.st.css'                 // path is relative to the root of the project
});

```

Components are assumed by default to be React Strict Mode compliant (meaning that they follow the guidelines described [here](https://reactjs.org/docs/strict-mode.html)). However, if your component is *not* React Strict Mode compliant, you can set a flag in metadata to disable rendering in strict mode, e.g.:

```ts
const meta = Registry.getComponentMetadata(compWithUnsafeLifecycle);
meta.reactStrictModeCompliant = false;
```

Components are assumed by default to be [axe-core](https://github.com/dequelabs/axe-core) compliant. If your component is not axe-core compliant, set the `nonA11yCompliant` flag in the metadata to true, e.g:

```ts
const meta = Registry.getComponentMetadata(nonAccessibleComp);
meta.nonA11yCompliant = true;
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

```shell
autotools sanity --files ./components/**/*.meta.ts
```

### A11Y

Asserts that components are compatable with axe-core. Allows for varying levels of error impact (one of `minor`, `moderate`, `serious`, or `critical`). Specifying a level of impact specifies *that* level and *above* (so specifying `moderate` would target `moderate`, `serious`, and `critical`).

#### Usage

```shell
autotools a11y --files ./components/**/*.meta.ts --impact minor
```

### Snap

Renders components, takes screenshots, and then sends screenshots to Applitools Eyes to run comparisons. This tool requires that the `process.env.EYES_API_KEY` value is set to your private API key.

#### Usage

```shell
autotools snap --files ./components/**/*.meta.ts
```

#### Options

- `skip-if-missing-key`: set this flag if you want to skip testing when `process.env.EYES_API_KEY` or `process.env.APPLITOOLS_API_KEY` variables are not set. By default, snap will fail if either of these keys are not set. Example usage: `snap --skip-if-missing-key`, or, `snap -s`.

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