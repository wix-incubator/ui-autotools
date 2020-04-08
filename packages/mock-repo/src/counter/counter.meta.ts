import Registry from '@ui-autotools/registry';
import { Counter } from './counter';

const counterMeta = Registry.getComponentMetadata(Counter);
counterMeta.addSim({
  title: 'counterMetaSim',
  props: {},
  state: {
    count: 4,
  },
});
