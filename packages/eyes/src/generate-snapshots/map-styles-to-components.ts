import path from 'path';
import {IRegistry} from '@ui-autotools/registry';

export function mapSylesToComponents(Registry: IRegistry, currentDirectory: string): {[stylePath: string]: string} {
  const mapping: {[stylePath: string]: string} = {};

  Registry.metadata.components.forEach((componentMetadata) => {
    if (componentMetadata.exportName) {
      // We map styles to their components here (i.e. blah/blah/style1.st.css -> blah/blah/myComp.tsx)
      mapping[path.join(currentDirectory, componentMetadata.baseStylePath)] = path.join(currentDirectory, componentMetadata.path);
    }
  });

  return mapping;
}
