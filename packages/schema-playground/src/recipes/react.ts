import {IDirectoryContents} from '@file-services/types';
import read from '../read-file-as-string';

export const reactRecipe: IDirectoryContents = {
  node_modules: {
    '@types': {
      'react': {
        'index.d.ts': read('@types/react/index.d.ts'),
        'global.d.ts': read('@types/react/global.d.ts'),
      },
      'react-dom': {
        'index.d.ts': read('@types/react-dom/index.d.ts')
      },
      'prop-types': {
        'index.d.ts': read('@types/prop-types/index.d.ts')
      }
    },
    'csstype': {
      'index.d.ts': read('csstype/index.d.ts')
    }
  }
};
