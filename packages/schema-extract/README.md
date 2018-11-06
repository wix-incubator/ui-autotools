# Schema Extract


Schema extract transforms code files into [JSON-Schema](https://json-schema.org/) schemas. Schema extraction is a necessary step to create automated documentation for your code.

It is composed of two parts, the **ts transformer** and **linker**.


## Playground
The `schema-extract` package has a playground that allows live editing of your code and transforms it to a schema and displays the results as you type it.

## Usage

Import the `createLinker` function from `@ui-autotools/schema-extract`. This function receives a string array of file paths and returns an initalized linker class.
To get the linked schema of a specific file invoke `linker.flatten(fileName)`:

```
    import {createLinker} from '@ui-autotools/schema-extract';
    const files = [
        'myProject/src/file-a.ts',
        'myProject/src/file-b.ts'
    ];
    const linker = createLinker(files);
    const linkedSchema = linker.flatten(files[0], 'IAnimal');

```

## Example

Take a look at the following interface:
```
// file-a.ts
    export interface IAnimal {
        name: string;
        hasTail: boolean;
        makeNoise: (sound: ISound) => void;
        isTamed?: 'YES' | 'NO';
    }
```
If we run the command from the usage section it will be transformed to:
```
{
  "$schema": "http://json-schema.org/draft-06/schema#",
  "$id": "/index.tsx",
  "$ref": "common/module",
  "properties": {},
  "definitions": {
    "IAnimal": {
      "properties": {
        "name": {
          "type": "string"
        },
        "hasTail": {
          "type": "boolean"
        },
        "makeNoise": {
          "$ref": "common/function",
          "arguments": [
            {
              "$ref": "#ISound",
              "name": "sound"
            }
          ],
          "returns": {
            "$ref": "common/undefined"
          },
          "requiredArguments": [
            "sound"
          ]
        },
        "isTamed": {
          "type": "string",
          "enum": [
            "YES",
            "NO"
          ]
        }
      },
      "required": [
        "name",
        "hasTail",
        "makeNoise"
      ],
      "$ref": "common/interface"
    }
  }
}
```

## TS Transformer

Transforms a typescript source file into JSON-Schema. 

#### Usage

Import the `transform` function from `@ui-autotools/schema-extract`. This function recives the following five arguments:

|Name|Type|Description|
|-------------|----|-----------|
|checker|`typescript.TypeChecker`|A typescript checker connected to the desired files|
|sourceFile|`typescript.SourceFile`|The typescript source of that we want to transform|
|modulePath|`string`|The path to the module base directory|
|projectPath|`string`|The name of the project the files are in (Will be removed in the future)|
|pathUtil|`IFileSystemPath`|A path utility to be used to access directories and file. (You can use `path.posix`)|

For example if we want to transform our own code:

```
    import path from 'path';
    import compilerOptions from './utils';

    const projectPath = '/Projects/MySecretProject/;
    const fileName = projectPath + 'secret-stuff.ts'
    // TS setup
    const program = typescript.createProgram([fileName], compilerOptions);
    const sourceFile = program.getSourceFile(fileName);

    const schema = transform(program.getTypeChecker(), sourceFile, fileName, 'MySecretProject', path.posix);
```

## Linker

The linker receives a file name and the name of an export in that file and returns the linked schema of that export.

How is it any different than the `ts transformer`? When we transform a schema using the `ts transformer`, the result we get will only reference other types (Import or from the same file) using the $ref property.

The linker flattens some of these types by linking them together.

#### Example
Let's look at InterfaceB in the following code:
```
    export interface InterfaceA<T> {
        something:T;
    };
    export interface InterfaceB extends InterfaceA<string> {
        somethingElse: number
    };
```

The schema created for this interface before linking will look like this:
```
    "InterfaceB": {
        "$ref": "common/interface",
        "properties": {
            "somethingElse": {
                "type": "number"
            }
        },
        "required": ["somethingElse"],
        "genericArguments": [{
                "type": "string"
            }],
        "extends": {
            "$ref": "#InterfaceA"
        }
    }
```

But we are missing some crucial information about InterfaceB. After linking this is how the schema looks:
```
    "InterfaceB": {
        $ref: "common/interface",
        properties: {
            something: {
                inheritedFrom: '#InterfaceA',
                type: 'string'
            },
            somethingElse: {
                type: 'number'
            }
        },
        required: ['somethingElse', 'something']
    };
```


#### Linking rules
In order to avoid running into infinite loops, the linker does not link every member of every schema. It does link:
* `extends` - Classes and interfaces that use the extends keyword. (However the linker will not link members of interfaces)
* Generic types
* Intersection types - We may need the linked schemas to intersect two or more different types.

What won't be linked?
* Imports - If you import a type from a different file, it will be represented as a reference: `$ref: "myProject/src/util#myFunction"`
* References to other types - Any form of referencing a different type or interface like `type A = B` or `interface InterfaceA { type: InterfaceB }`. This also includes function using other types as arguments or return values.

#### Creating a custom linker

(Note: **At the moment we don't export the SchemaLinker class**. We will either export it or add a function that receives an extractor and returns a linker)

Using `createLinker` creates a typescript based linker, but the linker is not limited only to typescript. When creating a new linker class, the linker receives an extractor object:
```
    export interface IExtractor {
        getSchema: (path: string) => ModuleSchema;
        getSchemaFromImport?: (importPath: string, ref: string, filePath: string) => ModuleSchema | null;
    }
```

`getSchema` receives a path to a file and returns the JSON-Schema created from that file.

`getSchemaFromImport` is used if we want to retrieve a type that is imported by the file we want to link.

To use a different extractor with the linker, you just need to create a new linker class with the extractor and invoke flatten.
```
    flatten(filePath: string, typeName: string): Schema
```
The flatten function receives the path to file and the type inside of it we want to link.

```
    import {SchemaLinker} from '@ui-autotools/schema-extract/?????';
    import {myExtractor} from './secretStuff';

    function linkSchema(filePath, typeName) {
        const customLinker = new SchemaLinker(myExtractor);
        return linker.flatten(filePath, typeName);
    }
```
