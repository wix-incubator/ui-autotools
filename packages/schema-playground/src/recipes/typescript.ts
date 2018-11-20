import {IDirectoryContents} from '@file-services/types';
import read from '../read-file-as-string';

export const typescriptRecipe: IDirectoryContents = {
  node_modules: {
    typescript: {
      lib: {
        'lib.dom.d.ts': read('typescript/lib/lib.dom.d.ts'),
        'lib.es2015.collection.d.ts': read('typescript/lib/lib.es2015.collection.d.ts'),
        'lib.es2015.core.d.ts': read('typescript/lib/lib.es2015.core.d.ts'),
        'lib.es2015.d.ts': read('typescript/lib/lib.es2015.d.ts'),
        'lib.es2015.generator.d.ts': read('typescript/lib/lib.es2015.generator.d.ts'),
        'lib.es2015.iterable.d.ts': read('typescript/lib/lib.es2015.iterable.d.ts'),
        'lib.es2015.promise.d.ts': read('typescript/lib/lib.es2015.promise.d.ts'),
        'lib.es2015.proxy.d.ts': read('typescript/lib/lib.es2015.proxy.d.ts'),
        'lib.es2015.reflect.d.ts': read('typescript/lib/lib.es2015.reflect.d.ts'),
        'lib.es2015.symbol.d.ts': read('typescript/lib/lib.es2015.symbol.d.ts'),
        'lib.es2015.symbol.wellknown.d.ts': read('typescript/lib/lib.es2015.symbol.wellknown.d.ts'),
        'lib.es2016.array.include.d.ts': read('typescript/lib/lib.es2016.array.include.d.ts'),
        'lib.es2016.d.ts': read('typescript/lib/lib.es2016.d.ts'),
        'lib.es2016.full.d.ts': read('typescript/lib/lib.es2016.full.d.ts'),
        'lib.es2017.d.ts': read('typescript/lib/lib.es2017.d.ts'),
        'lib.es2017.full.d.ts': read('typescript/lib/lib.es2017.full.d.ts'),
        'lib.es2017.intl.d.ts': read('typescript/lib/lib.es2017.intl.d.ts'),
        'lib.es2017.object.d.ts': read('typescript/lib/lib.es2017.object.d.ts'),
        'lib.es2017.sharedmemory.d.ts': read('typescript/lib/lib.es2017.sharedmemory.d.ts'),
        'lib.es2017.string.d.ts': read('typescript/lib/lib.es2017.string.d.ts'),
        'lib.es2017.typedarrays.d.ts': read('typescript/lib/lib.es2017.typedarrays.d.ts'),
        'lib.es5.d.ts': read('typescript/lib/lib.es5.d.ts')
      }
    }
  }
};
