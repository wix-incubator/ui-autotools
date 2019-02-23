import Registry, { ISimulation } from '@ui-autotools/registry';
import {MockComp} from './fixtures/mock-comp';
import style from './fixtures/variant.st.css';

interface IStyle {
  style: any;
  name: string;
  path: string;
}

interface IMockData {
  baseStylePath: string;
  exportName: string;
  path: string;
  simulations: Array<ISimulation<any, any>>;
  styles: IStyle[];
}

const mockMetadata = Registry.getComponentMetadata(MockComp);
const mockData: IMockData = {
  baseStylePath: 'src/registry/fixtures/base-style.st.css',
  exportName: 'MockComp',
  path: 'src/registry/fixtures/mock-comp',
  simulations: [
    {
      title: 'mock simulation',
      props: {
        propsLabel: 'props sim'
      },
      state: {
        stateLabel: 'state sim'
      }
    }
  ],
  styles: [
    {
      style,
      name: 'variant',
      path: 'src/registry/fixtures/variant.st.css'
    }
  ]
};

mockMetadata.exportInfo = {
  baseStylePath: 'src/registry/fixtures/base-style.st.css',
  exportName: 'MockComp',
  path: 'src/registry/fixtures/mock-comp'
};

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

export {Registry as MockRegistry, mockData, mockMetadata, IMockData};
