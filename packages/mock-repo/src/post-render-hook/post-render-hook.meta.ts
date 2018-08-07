import Registry from '@ui-autotools/registry';
import {PostRenderHook} from './post-render-hook';

Registry.getComponentMetadata(PostRenderHook)
  .addSim({
    title: 'postRenderHookSim',
    props: {}
  });
