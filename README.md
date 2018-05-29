# ui-autotools
A set of tools designed to automate and improve the process of developing components.

These tools rely on `*.meta.tsx` files next to each component. 

The tools use a similiar command-line pattern:
```
$ auto-tools [tool name] --files [meta files matching glob]
```
For example:
```
$ auto-tools sanity --files ./components/**/*.meta.ts
```
Common CLI parameters:
- `files` - meta files matching glob (default: './**/*.meta.ts')
- `debug` - true/false (default: false)

## Available Tools

- `sanity` - component sanity test suite:
    - renders component in <React.StrictMode />
    - SSR rendering in Node
    - client side hydration on SSR result
    - fails for any console message
    - fails for every event listener left after component unmounts
- `eyes` - eyes/snapshot test:
    - compares already saved component image snapshots to current view
- `a11y` - accessibility test:
    - checks component render result for accessibility using axe-core
- `website`
    - auto generated documentation and playgrounds.
    - dev mode - fast reloading of changed resources

we encourge anyone to add more tools that utilize this meta-data repo.

please pull request with tools and issues with half baked dreams :)

## MetaData registry

the metadata registry allows you to write your component metadata data once and use it many times.
 ? the metadata registry allows you to write component metadata data that may be reused in several tools.

registering metadata is done by requiring the Registry and creating a component description.

```ts
import MetaData from 'ui-autotools';
import MyComp from './my-comp.tsx';

const desc = MetaData.describe(MyComp);
desc.addSimulation('empty',{
    items:[]
});

desc.addDocumentation('accesability','./accesability.md');
```

many of the fields can be auto added using tools in this repo:

- **AssetsExtrct** - scans assets provided by library according to configuration
- **DocsExtrct** - adds documentation extracted from code to the registry
- **SchemaExtrct** - adds JSON schema extracted from code to the registry


## Metadata fields:

| Field | Type | auto extraction | description |
|-------|------|-----------------|-------------|
| entity |  useally a react component | no |  the component class or function |
| title | string | using docsExtrct and comments |  |
| description | string | using docsExtrct and comments | |
| documentation | structured list of entries with title and md format |  using docsExtrct and comment with ability to add more | 
| simulations | component props type + metadata |  no | example props of the component | 
| simulation assets | list of "code" assets  |  no | as example icon list, component style variants, date-formatter |
| EntitySchema | JSON Schema | Using schema extract with optional comments | JSON schema of the components public api and props
| visualStates | list of partial state simulations |  no | used exclusivly for eyes tests | 
| browser tests | list of file paths | using docsExtrct and comments | used for running unit tests in book | 

? different metadata fields for React? component / class / function

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
$ auto-tools sanity --files ./components/**/*.meta.ts

```


### Eyes tester
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

renders components with different simulations, runs them through x-core


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
    - reset state
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