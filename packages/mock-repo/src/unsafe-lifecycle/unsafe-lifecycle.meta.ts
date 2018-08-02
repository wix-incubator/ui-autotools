import Registry from '@ui-autotools/registry';
import {UnsafeLifecycle} from './unsafe-lifecycle';

Registry.getComponentMetadata(UnsafeLifecycle, false)
  .addSim({
    title: 'unsafeLifecycle',
    props: {}
  });
