import Registry from '@ui-autotools/registry';
import { UnmountedEvent } from './unmounted-event';

const meta = Registry.getComponentMetadata(UnmountedEvent);

meta.addSim({
  title: 'Component with an unmounted event',
  props: {},
});

meta.nonEventListenerTestCompliant = true;
