import * as path from 'path';
import {IRegistry} from '@ui-autotools/registry';

export function generateMapping(Registry: IRegistry) {
  const mapping: any = {};

  Registry.metadata.components.forEach((componentMetadata) => {
    if (componentMetadata.compInfo.exportName) {
      // We map styles to their components here (i.e. blah/blah/style1.st.css -> blah/blah/myComp.tsx)
      mapping[path.join(process.cwd(), componentMetadata.compInfo.baseStylePath)] = path.join(process.cwd(), componentMetadata.compInfo.path);
    }
  });

  return mapping;
}
