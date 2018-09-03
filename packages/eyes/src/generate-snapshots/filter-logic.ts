/**
 * This function exports a function, which is done to give the inner function (filterLogicModule) access
 * to the mapping of component styles to their logic files. This is done because the HTMLSnapshotPlugin,
 * which filterLogicModule is passed to, expects a method
 */
export function generateFilteringLogic(mapping: {[stylePath: string]: string}): (stylableModule: any) => any {
    const filterLogicModule = (stylableModule: any) => {
        const baseCompFile = mapping[stylableModule.resource] + '.tsx';

        const views = stylableModule.reasons
          .filter(({ module: _module }: {module: any}) => {
              const isProperModule = _module &&
              _module.type !== 'stylable' &&
              _module.resource &&
              _module.resource !== baseCompFile;
              // We don't want to return the base component logic, we want to return the generated file which
              // imports the original comp and its style variant

              return isProperModule;
          })
          .map(({module}: {module: any}) => {
              return module;
          });

        const set = new Set(views);
        if (set.size > 1) {
            throw new Error(
                `Stylable Component Conflict:\n ${
                    stylableModule.resource
                } has multiple components entries [${Array.from(set)}] `
            );
        }
        return views[0];
    };

    return filterLogicModule;
}
