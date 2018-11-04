# Schema Playground
**Schema Playground** is a developer tool that simplifies creating new auto-generated views from source files

The "schema extraction" process, which transforms source typescript files to JSON schema, is handled by the [schema-extract](https://github.com/wix-incubator/ui-autotools/tree/master/packages/schema-extract) project

## How to run
Currently **Schema Playground** is run locally by following these steps:

1. Clone, install and build [ui-autotools](https://github.com/wix-incubator/ui-autotools) mono-repo project:<br>
   ```node 
    git clone git@github.com:wix-incubator/ui-autotools.git
    
    cd ui-autotools

    yarn 

    yarn build
   ```
2. Start **Schema Playground**:
   ```node
   cd packages/schema-playground

   yarn start
   ```

A browser should open and load the playground. 

Enjoy!