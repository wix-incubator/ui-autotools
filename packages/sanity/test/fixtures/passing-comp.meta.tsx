import Registry from '@ui-autotools/registry';
import { PassingComp } from './passing-comp';

const meta = Registry.getComponentMetadata(PassingComp);

meta.addSim({
  title: 'PassingComp Simulation',
  props: {
    text: 'wow',
  },
});
