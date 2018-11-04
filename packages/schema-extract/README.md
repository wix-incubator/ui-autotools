# Schema Extract


Schema extract transforms code files into [JSON-Schema](https://json-schema.org/) schemas. It is composed of two parts, the **schema-extract** and **linker**.


## Schema-extract

Transforms a typescript source file into JSON-Schema. 

#### Usage

Import the `transform` function from `@ui-autotools/schema-extract`. This function recives YYYYY arguments:
* checker (`typescript.TypeChecker`) - a typescript checker connected to the desired files
* sourceFile (`typescript.SourceFile`) - the typescript source of that we want to transform
* modulePath (`string`) - The path to the module base directory
* projectPath (`string`) - --------WHY????
* path (`IFileSystemPath`) - --------

## Linker

The linker receives a file name and the name of an export in that file and returns the linked schema of that export.

How is it any different than the `schema-extract`? When we transform a schema using the `schema-extract`, the result we get will only reference other types (Import or from the same file) using the $ref property.

The linker flattens some of these types by linking them together.

#### Usage

Import the `createLinker` function from `@ui-autotools/schema-extract`. This function receives a string array of file paths and returns an initalized linker class.
To get the linked schema of a specific file invoke `linker.flatten(fileName)`:

```
    import {createLinker} from '@ui-autotools/schema-extract';
    const files = [
        'myProject/src/file-a.ts',
        'myProject/src/file-b.ts'
    ];
    const linker = createLinker(files);
    const linkedSchema = linker.flatten(files[0], 'myType');

```
#### Linking rules
In order to avoid running into infinite loops, the linker does not link every member of every schema. It does link:
* `extends` - Classes and interfaces that use the extends keyword. (However the linker will not link members of interfaces)
* Generic types
* Intersection types - We may need the linked schemas to intersect two or more different types.

#### Creating a custom linker

Using `createLinker` creates a typescript based linker, but the linker is not limited only to typescript. When creating a new linker class, the linker receives an extractor object:
```
    export interface IExtractor {
        getSchema: (path: string) => ModuleSchema;
        getSchemaFromImport?: (importPath: string, ref: string, filePath: string) => ModuleSchema | null;
    }
```

`getSchema` receives a path to a file and returns the JSON-Schema created from that file.

`getSchemaFromImport` is used if we want to retrieve a type that is imported by the file we want to link.

To use a different extractor with the liker, you just need to create a new linker class with the extractor and invoke flatten.
```
    flatten(filePath: string, typeName: string): Schema
```
The flatten function receives the path to file and the type inside of it we want to link.

**TODO**: We need to decide how to export linker class

```
    import {SchemaLinker} from '@ui-autotools/?????';
    import {myExtractor} from './secretStuff';

    function linkSchema(filePath, typeName) {
        const customLinker = new SchemaLinker(myExtractor);
        return linker.flatten(filePath, typeName);
    }
```