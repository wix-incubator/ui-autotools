import { IDirectoryContents } from '@file-services/types';

export const typescriptRecipe: IDirectoryContents = {
    node_modules: {
        typescript: {
            lib: {
                'lib.dom.d.ts': require('typescript/lib/lib.dom.d.ts'),
                'lib.es2015.collection.d.ts': require('typescript/lib/lib.es2015.collection.d.ts'),
                'lib.es2015.core.d.ts': require('typescript/lib/lib.es2015.core.d.ts'),
                'lib.es2015.d.ts': require('typescript/lib/lib.es2015.d.ts'),
                'lib.es2015.generator.d.ts': require('typescript/lib/lib.es2015.generator.d.ts'),
                'lib.es2015.iterable.d.ts': require('typescript/lib/lib.es2015.iterable.d.ts'),
                'lib.es2015.promise.d.ts': require('typescript/lib/lib.es2015.promise.d.ts'),
                'lib.es2015.proxy.d.ts': require('typescript/lib/lib.es2015.proxy.d.ts'),
                'lib.es2015.reflect.d.ts': require('typescript/lib/lib.es2015.reflect.d.ts'),
                'lib.es2015.symbol.d.ts': require('typescript/lib/lib.es2015.symbol.d.ts'),
                'lib.es2015.symbol.wellknown.d.ts': require('typescript/lib/lib.es2015.symbol.wellknown.d.ts'),
                'lib.es2016.array.include.d.ts': require('typescript/lib/lib.es2016.array.include.d.ts'),
                'lib.es2016.d.ts': require('typescript/lib/lib.es2016.d.ts'),
                'lib.es2016.full.d.ts': require('typescript/lib/lib.es2016.full.d.ts'),
                'lib.es2017.d.ts': require('typescript/lib/lib.es2017.d.ts'),
                'lib.es2017.full.d.ts': require('typescript/lib/lib.es2017.full.d.ts'),
                'lib.es2017.intl.d.ts': require('typescript/lib/lib.es2017.intl.d.ts'),
                'lib.es2017.object.d.ts': require('typescript/lib/lib.es2017.object.d.ts'),
                'lib.es2017.sharedmemory.d.ts': require('typescript/lib/lib.es2017.sharedmemory.d.ts'),
                'lib.es2017.string.d.ts': require('typescript/lib/lib.es2017.string.d.ts'),
                'lib.es2017.typedarrays.d.ts': require('typescript/lib/lib.es2017.typedarrays.d.ts'),
                'lib.es5.d.ts': require('typescript/lib/lib.es5.d.ts')
            }
        }
    }
};
