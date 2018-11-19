import Registry from '@ui-autotools/registry';
import {UnsafeLifecycle} from './unsafe-lifecycle';

const meta = Registry.getComponentMetadata(UnsafeLifecycle);

meta.addSim({
  title: 'unsafeLifecycle',
  props: {}
});

meta.nonReactStrictModeCompliant = true;
