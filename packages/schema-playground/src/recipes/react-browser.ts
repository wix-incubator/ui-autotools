import {IDirectoryContents} from '@file-services/types';

export const reactRecipe: IDirectoryContents = {
  node_modules: {
    '@types': {
      'react': {
        'index.d.ts': require('@types/react/index.d.ts'),
        'global.d.ts': require('@types/react/global.d.ts'),
      },
      'react-dom': {
        'index.d.ts': require('@types/react-dom/index.d.ts')
      },
      'prop-types': {
        'index.d.ts': require('@types/prop-types/index.d.ts')
      }
    },
    'csstype': {
      'index.d.ts': require('csstype/index.d.ts')
    }
  }
};
