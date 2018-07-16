# ui-autotools
[![Build Status](https://travis-ci.org/wix-incubator/ui-autotools.svg?branch=master)](https://travis-ci.org/wix-incubator/ui-autotools)

A set of tools designed to automate and improve the process of developing components.

These tools rely on `*.meta.tsx` files in the project. 

The tools use a similiar command-line pattern:
```
$ autotools [tool name] --files [meta files matching glob]
```
For example:
```
$ autotools sanity --files ./components/**/*.meta.ts
```
Common CLI parameters:
- `files` - meta files matching glob (default: './**/*.meta.tsx')
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

We encourge anyone to add more tools that utilize this meta-data repo. Please open pull requests for any tools and issues with half baked dreams :)

## Metadata Registry

Offers a [common API](./docs/registry.md) for code metadata. This allows many different tools to use this metadata as their configuration.

Registering metadata is done by requiring the Registry and creating a component description:

```ts
import Registry from 'ui-autotools';
import MyComp from './my-comp.tsx';
import mdFile from './my-comp-usage.md';


const myComponentMetadata = Registry.describe(MyComp);
myComponentMetadata.addSimulation('empty',{
    items:[]
});

myComponentMetadata.addDocumentation('Accesability','some inline documenttion here');
myComponentMetadata.addDocumentation('Usage',mdFile);
```

(missing context)
many of the fields can be auto added using tools in this repo:

- **AssetsExtract** - scans global assets provided by library according to configuration
- **DocsExtract** - adds documentation extracted from code to the registry
- **SchemaExtract** - adds JSON schema extracted from code to the registry

### Sanity tester

Tests component using the different simulations from metadata.

renders component in node and rehydrates them in the browser.

- builds components in production mode
- renders component in <React.StrictMode />
- SSR rendering in Node
- client side hydration on SSR result
- fails for any console message
- fails for every event listener left after component unmounts

#### debug mode
allows connecting node debugger. 
does not open browser automaticly but allows a developer to open it.

#### usage

```
$ auto-tools sanity --debug --files ./components/**/*.meta.ts

```


### photoshoot tester
checks component visual snapshots simulating its:
- props
- styles
- visual states including those of nested components

renders components in the browser. takes snapshots using pupateer.
compares to a previusly approved snapshot that are saved as part of the repo. fails if images are different


#### debug mode
allows connecting node debugger. 
does not open browser automaticly but allows a developer to open it.
clicking the OK button next to a failing test will save the image locally in the approved images folder


#### usage

```
$ auto-tools eyes --files ./components/**/*.meta.ts --images ./.test-images

```


### Ally

renders components with different simulations, runs them through x-core (add link)


#### debug mode
allows connecting node debugger. 

#### usage

```
$ auto-tools ally --files ./components/**/*.meta.ts

```

### Website

builds and displays component info page, including:

- title
- description
- preview
- api documentation 
- simulation panel allowing:
    - choose between different simulations 
    - modify simulation ( no save )
        - Automatic property panel 
        - asset chooser
- test panel showing the component tests, allowing filtering tests of interest




#### usage prod

generate static documentation site

```
$ auto-tools website --files ./components/**/*.meta.ts

```

#### usage dev

run documentation site with hot reloading. 

```
$ auto-tools devsite --files ./components/**/*.meta.ts

```


## other tools
* StateOveride mutator - makes component state overridable (usefull for tests)