import Registry from '@ui-autotools/registry';
import {NonA11yComponent} from './non-a11y-component';

const nonA11yComponent = Registry.getComponentMetadata(NonA11yComponent);
nonA11yComponent
  .addSim({
    title: 'A component that violates a11y tests',
    props: {},
  });

nonA11yComponent.a11yCompliant = false;
