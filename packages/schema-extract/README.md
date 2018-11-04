# Schema Extract


Schema extract transforms code files into [JSON-Schema](https://json-schema.org/) schemas. Schema extraction is a necessary step to create automated documentation for your code.

It is composed of two parts, the **schema-extract** and **linker**.


## Playground
The `schema-extract` package has a playground that transforms your code to a schema as you type it.  
To use the playground simply install `ui-autotools` and go to `/packages/schema-playground` and run `yarn start`.

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
* checker (`typescript.TypeChecker`) - a typescript checker connected to the desired files
* sourceFile (`typescript.SourceFile`) - the typescript source of that we want to transform
* modulePath (`string`) - The path to the module base directory
* projectPath (`string`) - The name of the project the files are in (Will be removed in the future)
* pathUtil (`IFileSystemPath`) - A path utility to be used to access directories and file. (You can use `path.posix`)

## Linker

The linker receives a file name and the name of an export in that file and returns the linked schema of that export.

How is it any different than the `schema-extract`? When we transform a schema using the `schema-extract`, the result we get will only reference other types (Import or from the same file) using the $ref property.

The linker flattens some of these types by linking them together.

#### Linking rules
In order to avoid running into infinite loops, the linker does not link every member of every schema. It does link:
* `extends` - Classes and interfaces that use the extends keyword. (However the linker will not link members of interfaces)
* Generic types
* Intersection types - We may need the linked schemas to intersect two or more different types.

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
