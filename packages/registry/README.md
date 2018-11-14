# Metadata registry

allows creating/retriving code metdata descriptions.

## API

#### describe
creates/retrieves a metadata description object

arguments:

| name | Type | description |
|-------|------|-----------------|
| entity | any | described entity |
| type | "react" / "class" / "function" / "general" | type of described entity |

returns:

ReactDescription, ClassDescription, FunctionDescription or GeneralDescription



# GeneralDescription

allows reading/writing the different meta-data fields.

## API


#### setTitle

sets title of entity

arguments:

| name | Type | description |
|-------|------|-----------------|
| title | string | ...


#### setDescription

sets description of entity

arguments:

| name | Type | description |
|-------|------|-----------------|
| description | string | ...



#### addDocumentation

adds documentation in markdown format to entity

arguments:

| name | Type | description |
|-------|------|-----------------|
| title | string |  |
| content | markdown string | documentation content |



#### setJSONSchema

sets JSONSchema of entity

arguments:

| name | Type | description |
|-------|------|-----------------|
| schema | JSON schema |  |

#### addBrowserTests

adds browser tests to entity

arguments:

| name | Type | description |
|-------|------|-----------------|
| title | string |  |
| testFile | method | dynamically imports test file |

```ts

myDesc.addBrowserTests('accesability' ()=>import('./accesability.spec.ts')

```


# ReactDescription

react description adds some extra field to the general description

#### setReactType

sets type of react entity

arguments:

| name | Type | description |
|-------|------|-----------------|
| type | "Component" / "FunctionComponent" / "JSX" |  |


#### addSimulation

adds prop simulation to component

arguments:

| name | Type | description |
|-------|------|-----------------|
| title | string |  |
| props | component props |   |

#### addSimulationPropValue

adds cross cutting prop to all component simulations

arguments:

| name | Type | description |
|-------|------|-----------------|
| title | string |  |
| propName | string |  |
| value | component prop value |  |



#### addStateSimulation

adds state simulation to component, usefull for getting the component into different visual states without user interaction. i.e. open in a drop down


arguments:

| name | Type | description |
|-------|------|-----------------|
| title | string |  |
| state | partial component state |  |



# ClassDescription


#### addConstructorArgumentsSimulation

adds constructor arguments simulation to class

arguments:

| name | Type | description |
|-------|------|-----------------|
| title | string |  |
| args | array | constructor arguments |



# FunctionDescription


#### addArgumentsSimulation

adds arguments simulation to function

arguments:

| name | Type | description |
|-------|------|-----------------|
| title | string |  |
| args | array | constructor arguments |