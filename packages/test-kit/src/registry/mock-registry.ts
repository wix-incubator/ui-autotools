import {MockRegistry} from '@ui-autotools/registry';
import {MockComp} from './fixtures/mock-comp';
import style from './fixtures/variant.st.css';

const mockMetadata = MockRegistry.getComponentMetadata(MockComp);

mockMetadata.exportedFrom({
  baseStylePath: 'src/test-kit/fixtures/base-style.st.css',
  exportName: 'MockComp',
  path: 'src/test-kit/fixtures/mock-comp'
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
  path: 'src/test-kit/fixtures/variant.st.css'
});

export {MockRegistry};
