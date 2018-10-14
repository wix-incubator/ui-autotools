import Registry from '@ui-autotools/registry';
import {PostRenderHook} from './post-render-hook';

const postRenderMeta = Registry.getComponentMetadata(PostRenderHook);
postRenderMeta
  .addSim({
    title: 'postRenderHookSim',
    props: {},
    state: {
      label: 'the label was changed via state override'
    }
  });
