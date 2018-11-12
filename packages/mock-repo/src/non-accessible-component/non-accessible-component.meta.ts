import Registry from '@ui-autotools/registry';
import {NonAccessibleComponent} from './non-accessible-component';

const nonAccessibleComponent = Registry.getComponentMetadata(NonAccessibleComponent);
nonAccessibleComponent
  .addSim({
    title: 'A component that violates a11y tests',
    props: {},
  });

nonAccessibleComponent.a11yCompliant = false;
