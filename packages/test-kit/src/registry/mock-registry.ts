import {registerRequireHooks} from '@ui-autotools/utils';
registerRequireHooks();
import Registry from '@ui-autotools/registry';
import {MockComp} from './fixtures/mock-comp';
import style from './fixtures/variant.st.css';

const mockMetadata = Registry.getComponentMetadata(MockComp);

mockMetadata.exportedFrom({
  baseStylePath: 'src/registry/fixtures/base-style.st.css',
  exportName: 'MockComp',
  path: 'src/registry/fixtures/mock-comp'
});

mockMetadata.addSim({
  title: 'mock simulation',
  props: {
    propsLabel: 'props sim'
  },
  state: {
    stateLabel: 'state sim'
  }
});

mockMetadata.addStyle(style, {
  name: 'variant',
  path: 'src/registry/fixtures/variant.st.css'
});

export {Registry as MockRegistry};
