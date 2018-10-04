# Showcase

Creates a static website with documentation, API and demos for all components described in the meta files.

## Routing and categorization

the website route is created from categorization of assets.

for instance a Date input component can be categorized as components/inputs/date/date-input.


### categorization using the meta-data-store:

you can categorize components using the meta-data-repo:

```ts
import Registry from '@ui-autotools/registry';
import {Composite} from './composite';
import style1 from './variant1.st.css';

const metadata = Registry.getComponentMetadata(Composite);

metadata.categorize('components/inputs/date/date-input');

metadata.addStyle(style1, {name: 'style1', path: 'src/composite/variant1.st.css'});

```

you can also categorize style-variants for native html elements using the meta-data-repo:

```ts
import * as React from 'react';
import Registry from '@ui-autotools/registry';
import {Composite} from './composite';
import style1 from './variant1.st.css';

const metadata = Registry.getNativeElement('span','badge');

metadata.categorize('components/view/generic/badge');

metadata.addStyle(style1, {name: 'style1', path: 'src/view/variant1.st.css'});


```

### categorization using a comment:

categorizing non component code assets is done useing a js-doc comment:

```ts
/**
* @category components/inputs/date/date-formater
**/
export interface DateFormater
```


## adding content to a generated page

content is added using the meta-data-store

### adding md files:

```ts
import Registry from '@ui-autotools/registry';
import {Composite} from './composite';
import style1 from './variant1.st.css';

const metadata = Registry.getComponentMetadata(Composite);

metadata.addDoc('./docs/date-input.md');
```


### adding code examples:

```tsx
import Registry from '@ui-autotools/registry';
import {Composite} from './composite';
import style1 from './variant1.st.css';

const metadata = Registry.getComponentMetadata(Composite);

metadata.addExample('my cool composite in a carousel',()=>{
    return <div></div>
});
```


#### getting page meta-data using categorization:

you can also get a page meta-data according to its categorization:

notice that if that page does not exist, a new one is added.



```ts
import * as React from 'react';
import Registry from '@ui-autotools/registry';

const metadata = Registry.getPage('components/inputs/date/date-input');

metadata.addExample('title','description', ()=>{

}));

```




#### Usage
To start the development server:
```shell
autotools showcase --files src/**/*.meta.ts
```
To build a static website:
```shell
autotools showcase --files src/**/*.meta.ts --output build/website
```
