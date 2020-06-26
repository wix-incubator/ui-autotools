import Registry from '@ui-autotools/registry';
import { FailingComp } from './failing-comp';

const meta = Registry.getComponentMetadata(FailingComp);

meta.addSim({
  title: 'FailingComp Simulation',
  props: {},
});
