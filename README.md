# ui-autotools

[![Build Status](https://travis-ci.org/wix-incubator/ui-autotools.svg?branch=master)](https://travis-ci.org/wix-incubator/ui-autotools)

UI-autotools comprises a set of tools designed to automate and improve the process of developing components. These tools consume `*.meta.tsx` files in the project, which are described below. All tools share a similar command pattern:

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
- `a11y` - accessibility test:
    - checks component render result for accessibility using axe-core

## WIP Tools

- `eyes` - tool for generating and testing component snapshots
- `website`
    - auto generated static documentation and playgrounds site.
    - dev mode - fast reloading of changed resources

We encourge anyone to add tools to this repo that utilize metadata. Please open pull requests for any tools and issues with half baked dreams :) .

## Metadata Registry

Offers a [common API](./docs/registry.md) for metadata. This allows many different tools to use this metadata as their configuration.

Registering metadata is done by requiring the Registry and creating a component description:

```ts
import Registry from 'ui-autotools';
import MyComp from './my-comp.tsx';

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
    }
});

myComponentMetadata.addSim({
    title: 'many items',
    props: {
        items:['🧒 ', '👶 ', '🐊 ']
    }
});
```

Components are assumed by default to be React Strict Mode compliant (meaning that they follow the guidelines described [here](https://reactjs.org/docs/strict-mode.html)). However, if your component is *not* React Strict Mode compliant, you can add a flag to disable testing in Strict Mode when adding a component to the registry, e.g.:

```ts
// Second parameter is reactStrictModeCompliant
Registry.getComponentMetadata(compWithUnsafeLifecycle, false);
```

### Sanity

Runs over every simulation and asserts the following:

- the component can render to string (i.e. renderToString doesn't throw)
- hydration in the client works as intended (no errors in the console)
- the component has no errors while rendering with <React.StrictMode />
- nothing was printed to the console

Sanity uses puppeteer to test client-side hydration. Results are printed in the terminal.

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
