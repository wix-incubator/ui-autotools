import {attachHook} from '@stylable/node';
import Registry from '../src/registry/registry';
attachHook({});
import {MockComp} from './fixtures/mock-comp';
import style from './fixtures/variant.st.css';

const mockMetadata = Registry.getComponentMetadata(MockComp);

mockMetadata.exportedFrom({
  baseStylePath: 'test-kit/fixtures/base-style.st.css',
  exportName: 'MockComp',
  path: 'test-kit/fixtures/mock-comp'
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
  path: 'test-kit/fixtures/variant.st.css'
});

export {Registry as MockRegistry};
