# ui-autotools

[![Build Status](https://travis-ci.org/wix-incubator/ui-autotools.svg?branch=master)](https://travis-ci.org/wix-incubator/ui-autotools)

A set of tools designed to automate and improve the process of developing components.

These tools rely on `*.meta.tsx` files in the project.

The tools use a similiar command-line pattern:

```shell
autotools [tool name] --files [meta files matching glob]
```

For example:

```shell
autotools sanity --files ./components/**/*.meta.ts
```

Common CLI parameters:

- `files` - meta files matching glob (default: `./**/*.meta.tsx`)
- `debug` - true/false (default: false)

## Available Tools

- `sanity` - component sanity test suite:
    - renders component in <React.StrictMode /> (add link here)
    - Checks server side rendering
    - client side hydration on SSR result
    - fails for any console message
    - fails for every event listener left after component unmounts
- `a11y` - accessibility test:
    - checks component render result for accessibility using axe-core

## WIP Tools

- `eyes` - tools for generating and testing component images
    - compares already saved component image snapshots to current view
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
myComponentMetadata.addSimulation('empty',{
    items:[]
});

myComponentMetadata.addSimulation('one item',{
    items:['🐊 ']
});

myComponentMetadata.addSimulation('many items',{
    items:['🧒 ', '👶 ', '🐊 ']
});
```

### Sanity

Runs over every simulation and asserts the following:

- the component can render to string
- hydration in the client works as intended
- the component has no errors in <React.StrictMode />
- nothing was printed to the console

Sanity uses puppeteer to test client-side hydration. Results are printed in the terminal.

#### Usage

```shell
autotools sanity --files ./components/**/*.meta.ts 
```

### A11Y

Asserts that components are compatable with axe-core. Allows for varying levels of error impact.

#### Usage

TODO: TALK TO DANIEL

```shell
autotools a11y --files ./components/**/*.meta.ts --impact 4
```
